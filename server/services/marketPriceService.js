/**
 * AgriNex — Government of India Mandi Market Price Service
 * Primary Resource: data.gov.in
 * Resource: Current Daily Price of Various Commodities from Various Markets (Mandi)
 * Resource URL: https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
 * Maintained by: Ministry of Agriculture and Farmers Welfare -> Directorate of Marketing and Inspection (DMI)
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const redisService = require('./redisService');

// Configuration from environment
const DATA_GOV_IN_API_KEY = process.env.DATA_GOV_IN_API_KEY || process.env.DATA_GOV_API_KEY || '';
const OGD_API_BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const SOURCE_PORTAL_URL = 'https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi';
const SOURCE_ATTRIBUTION = 'Government of India – data.gov.in / Directorate of Marketing & Inspection (DMI)';

const MARKET_PRICE_CACHE_TTL = parseInt(process.env.MARKET_PRICE_CACHE_TTL, 10) || 3600;
const MARKET_API_TIMEOUT = parseInt(process.env.MARKET_API_TIMEOUT, 10) || 10000;
const MARKET_API_MAX_RETRIES = parseInt(process.env.MARKET_API_MAX_RETRIES, 10) || 3;
const MARKET_DATA_REFRESH_MINUTES = parseInt(process.env.MARKET_DATA_REFRESH_MINUTES, 10) || 60;

// Service State Tracking
let serviceStatus = {
  lastAttemptAt: null,
  lastSuccessfulSync: null,
  recordsFetched: 0,
  recordsStored: 0,
  recordsUpdated: 0,
  recordsRejected: 0,
  status: DATA_GOV_IN_API_KEY ? 'CONFIGURED' : 'AWAITING_API_KEY',
  source: SOURCE_ATTRIBUTION,
  sourceUrl: SOURCE_PORTAL_URL,
  lastError: null
};

/**
 * Validate incoming record from Government API
 */
function validateRecord(record) {
  if (!record || typeof record !== 'object') {
    return { valid: false, reason: 'Empty or invalid record object' };
  }

  const commodity = (record.commodity || record.commodityNormalized || record.cropName || '').trim();
  const market = (record.market || '').trim();
  const state = (record.state || '').trim();

  if (!commodity || !market || !state) {
    return { valid: false, reason: 'Missing required field: commodity, market, or state' };
  }

  const modal = Number(record.modalPrice || record.modal_price);
  const min = Number(record.minPrice || record.min_price);
  const max = Number(record.maxPrice || record.max_price);

  if (isNaN(modal) || modal <= 0) {
    return { valid: false, reason: 'Invalid or non-positive modal price' };
  }

  if (!isNaN(min) && min < 0) {
    return { valid: false, reason: 'Negative minimum price not permitted' };
  }

  if (!isNaN(max) && max < 0) {
    return { valid: false, reason: 'Negative maximum price not permitted' };
  }

  if (!isNaN(min) && !isNaN(max) && min > max) {
    return { valid: false, reason: 'Minimum price cannot exceed maximum price' };
  }

  if (!isNaN(min) && min > modal) {
    return { valid: false, reason: 'Minimum price cannot exceed modal price' };
  }

  if (!isNaN(max) && max < modal) {
    return { valid: false, reason: 'Maximum price cannot be less than modal price' };
  }

  return { valid: true };
}

/**
 * Normalize record fields and maintain both ₹/quintal and ₹/kg
 */
function normalizeRecord(raw, isLiveGovApi = false) {
  const modalQuintal = Number(raw.modal_price || raw.modalPrice || 0);
  const minQuintal = Number(raw.min_price || raw.minPrice || modalQuintal * 0.9);
  const maxQuintal = Number(raw.max_price || raw.maxPrice || modalQuintal * 1.1);

  // Government Mandi API rates are official in ₹/quintal (1 quintal = 100 kg)
  const isOriginalQuintal = (raw.priceUnit || raw.originalPriceUnit || '').toLowerCase().includes('quintal') || isLiveGovApi || modalQuintal > 200;

  const pricePerQuintal = isOriginalQuintal ? modalQuintal : +(modalQuintal * 100).toFixed(2);
  const minPricePerQuintal = isOriginalQuintal ? minQuintal : +(minQuintal * 100).toFixed(2);
  const maxPricePerQuintal = isOriginalQuintal ? maxQuintal : +(maxQuintal * 100).toFixed(2);

  const modalPricePerKg = isOriginalQuintal ? +(modalQuintal / 100).toFixed(2) : modalQuintal;
  const minPricePerKg = isOriginalQuintal ? +(minQuintal / 100).toFixed(2) : minQuintal;
  const maxPricePerKg = isOriginalQuintal ? +(maxQuintal / 100).toFixed(2) : maxQuintal;

  // Normalized arrival date
  let normalizedDate = new Date().toISOString().split('T')[0];
  if (raw.arrival_date) {
    const parts = raw.arrival_date.split('/');
    if (parts.length === 3) {
      normalizedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  } else if (raw.arrivalDate) {
    normalizedDate = raw.arrivalDate.split('T')[0];
  } else if (raw.date) {
    normalizedDate = raw.date;
  }

  const commodity = (raw.commodity || raw.cropName || '').trim();
  const state = (raw.state || '').trim();
  const district = (raw.district || '').trim();
  const market = (raw.market || '').trim();
  const variety = (raw.variety || 'FAQ').trim();
  const grade = (raw.grade || 'Grade A').trim();

  // Deterministic composite unique key: commodity + market + variety + grade + arrivalDate
  const compositeKey = `${commodity}_${market}_${variety}_${grade}_${normalizedDate}`
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_');

  return {
    id: raw.id || `gov_mandi_${compositeKey}`,
    sourceRecordId: raw.sourceRecordId || compositeKey,
    commodity,
    commodityNormalized: commodity.toLowerCase(),
    cropName: commodity,
    state,
    district,
    market,
    variety,
    grade,
    arrivalDate: normalizedDate,
    date: normalizedDate,
    minPrice: minPricePerQuintal,
    maxPrice: maxPricePerQuintal,
    modalPrice: pricePerQuintal,
    unit: '₹/quintal',
    priceUnit: '₹/quintal',
    pricePerQuintal,
    modalPricePerKg,
    minPricePerKg,
    maxPricePerKg,
    arrivalQuantity: Number(raw.arrival_quantity || raw.arrivalQuantity || raw.volumeTonnes || 0),
    arrivalUnit: raw.arrivalUnit || 'tonnes',
    source: SOURCE_ATTRIBUTION,
    sourceUrl: SOURCE_PORTAL_URL,
    retrievedAt: raw.retrievedAt || new Date().toISOString(),
    lastUpdated: normalizedDate,
    dataFreshness: isLiveGovApi ? 'OFFICIAL_DAILY_SYNC' : 'VERIFIED_STORED'
  };
}

/**
 * Fetch data from data.gov.in API with retry logic and exponential backoff
 */
async function fetchFromGovApi(filters = {}) {
  const apiKey = process.env.DATA_GOV_IN_API_KEY || process.env.DATA_GOV_API_KEY || '';
  if (!apiKey) {
    return {
      success: false,
      message: 'DATA_GOV_IN_API_KEY not configured. To enable live sync with data.gov.in, add your API key to .env',
      configured: false
    };
  }

  serviceStatus.lastAttemptAt = new Date().toISOString();

  let attempt = 0;
  let delay = 1000;

  while (attempt < MARKET_API_MAX_RETRIES) {
    attempt++;
    try {
      const url = new URL(OGD_API_BASE_URL);
      url.searchParams.append('api-key', apiKey);
      url.searchParams.append('format', 'json');
      url.searchParams.append('limit', String(filters.limit || 100));
      url.searchParams.append('offset', String(filters.offset || 0));

      if (filters.commodity) {
        url.searchParams.append('filters[commodity]', filters.commodity);
      }
      if (filters.state) {
        url.searchParams.append('filters[state]', filters.state);
      }
      if (filters.district) {
        url.searchParams.append('filters[district]', filters.district);
      }
      if (filters.market) {
        url.searchParams.append('filters[market]', filters.market);
      }
      if (filters.date) {
        url.searchParams.append('filters[arrival_date]', filters.date);
      }

      console.log(`[MarketPriceService] data.gov.in attempt ${attempt}/${MARKET_API_MAX_RETRIES}: fetching Mandi records...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), MARKET_API_TIMEOUT);

      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AgriNex-Mandi-Service/2.0'
        }
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`data.gov.in API error HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const rawRecords = json.records || [];

      serviceStatus.recordsFetched += rawRecords.length;

      let storedCount = 0;
      let updatedCount = 0;
      let rejectedCount = 0;
      const validRecords = [];

      for (const raw of rawRecords) {
        const normalized = normalizeRecord(raw, true);
        const validation = validateRecord(normalized);

        if (!validation.valid) {
          rejectedCount++;
          continue;
        }

        validRecords.push(normalized);

        // Upsert into persistent database preventing duplicates
        const existing = db.findById('marketPrices', normalized.id);
        if (existing) {
          db.update('marketPrices', normalized.id, normalized);
          updatedCount++;
        } else {
          db.insert('marketPrices', normalized);
          storedCount++;
        }
      }

      serviceStatus.recordsStored += storedCount;
      serviceStatus.recordsUpdated += updatedCount;
      serviceStatus.recordsRejected += rejectedCount;
      serviceStatus.lastSuccessfulSync = new Date().toISOString();
      serviceStatus.status = 'ONLINE (data.gov.in)';
      serviceStatus.lastError = null;

      // Invalidate relevant Redis caches
      await redisService.flushPattern('agrinex:market:*');

      return {
        success: true,
        source: SOURCE_ATTRIBUTION,
        sourceUrl: SOURCE_PORTAL_URL,
        lastUpdated: serviceStatus.lastSuccessfulSync,
        recordsCount: validRecords.length,
        storedCount,
        updatedCount,
        rejectedCount,
        data: validRecords
      };
    } catch (err) {
      console.warn(`[MarketPriceService] data.gov.in attempt ${attempt} failed: ${err.message}`);
      serviceStatus.lastError = err.message;
      if (attempt >= MARKET_API_MAX_RETRIES) {
        return {
          success: false,
          error: `data.gov.in API temporarily unavailable: ${err.message}`,
          fallback: 'Using latest verified stored mandi records.'
        };
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

/**
 * CACHE-FIRST READ FLOW:
 * 1. Check Redis Cache
 * 2. If Miss: Query MongoDB / persistent database
 * 3. If empty or requested fresh & API key exists: Query Government API
 * 4. Cache in Redis
 * 5. Return clean normalized response
 */
async function getMarketPrices(query = {}) {
  const {
    commodity,
    state,
    district,
    market,
    date,
    limit = 50,
    offset = 0,
    search,
    sortBy = 'date'
  } = query;

  // Build Redis cache key
  const cacheKey = redisService.buildKey('search', {
    commodity,
    state,
    district,
    market,
    date,
    limit,
    offset,
    search,
    sortBy
  });

  const cached = await redisService.get(cacheKey);
  if (cached) {
    return {
      ...cached,
      fromCache: true
    };
  }

  // Query MongoDB / local DB collection
  let records = db.find('marketPrices') || [];

  // Filter pipeline
  if (commodity) {
    const qComm = commodity.toLowerCase().trim();
    records = records.filter(r =>
      (r.commodity && r.commodity.toLowerCase().includes(qComm)) ||
      (r.commodityNormalized && r.commodityNormalized.includes(qComm)) ||
      (r.cropName && r.cropName.toLowerCase().includes(qComm))
    );
  }

  if (search) {
    const qSearch = search.toLowerCase().trim();
    records = records.filter(r =>
      (r.commodity && r.commodity.toLowerCase().includes(qSearch)) ||
      (r.market && r.market.toLowerCase().includes(qSearch)) ||
      (r.state && r.state.toLowerCase().includes(qSearch)) ||
      (r.district && r.district.toLowerCase().includes(qSearch))
    );
  }

  if (state && state !== 'All') {
    records = records.filter(r => r.state && r.state.toLowerCase() === state.toLowerCase().trim());
  }

  if (district && district !== 'All') {
    records = records.filter(r => r.district && r.district.toLowerCase() === district.toLowerCase().trim());
  }

  if (market && market !== 'All') {
    records = records.filter(r => r.market && r.market.toLowerCase().includes(market.toLowerCase().trim()));
  }

  if (date) {
    records = records.filter(r => (r.arrivalDate === date || r.date === date));
  }

  // Sort
  records.sort((a, b) => {
    if (sortBy === 'price_high') return (b.modalPrice || 0) - (a.modalPrice || 0);
    if (sortBy === 'price_low') return (a.modalPrice || 0) - (b.modalPrice || 0);
    return new Date(b.arrivalDate || b.date || 0) - new Date(a.arrivalDate || a.date || 0);
  });

  const total = records.length;
  const start = parseInt(offset, 10) || 0;
  const numLimit = parseInt(limit, 10) || 50;
  const paginated = records.slice(start, start + numLimit);

  // If no records and API key is configured, trigger on-demand fetch
  if (total === 0 && (process.env.DATA_GOV_IN_API_KEY || process.env.DATA_GOV_API_KEY)) {
    try {
      const syncResult = await fetchFromGovApi({ commodity, state, district, market, limit: numLimit });
      if (syncResult.success && syncResult.data && syncResult.data.length > 0) {
        return {
          success: true,
          source: SOURCE_ATTRIBUTION,
          sourceUrl: SOURCE_PORTAL_URL,
          lastUpdated: serviceStatus.lastSuccessfulSync || new Date().toISOString(),
          dataFreshness: 'OFFICIAL_DAILY_SYNC',
          total: syncResult.data.length,
          data: syncResult.data
        };
      }
    } catch (e) {
      // Continue to empty response
    }
  }

  const fallbackDate = records[0]
    ? (records[0].lastUpdated || records[0].arrivalDate || records[0].date || new Date().toISOString().split('T')[0])
    : new Date().toISOString().split('T')[0];

  const response = {
    success: true,
    source: SOURCE_ATTRIBUTION,
    sourceUrl: SOURCE_PORTAL_URL,
    lastUpdated: serviceStatus.lastSuccessfulSync || fallbackDate,
    dataFreshness: total > 0 ? 'VERIFIED_STORED' : 'NO_DATA',
    total,
    count: paginated.length,
    offset: start,
    limit: numLimit,
    data: paginated.map(r => {
      const modalVal = Number(r.modalPrice || 0);
      const minVal = Number(r.minPrice || (modalVal * 0.9));
      const maxVal = Number(r.maxPrice || (modalVal * 1.1));
      const isStoredPerKg = modalVal < 200 && !(r.priceUnit || '').toLowerCase().includes('quintal');
      const qtlModal = isStoredPerKg ? +(modalVal * 100).toFixed(2) : modalVal;
      const qtlMin = isStoredPerKg ? +(minVal * 100).toFixed(2) : minVal;
      const qtlMax = isStoredPerKg ? +(maxVal * 100).toFixed(2) : maxVal;
      const kgModal = isStoredPerKg ? modalVal : +(modalVal / 100).toFixed(2);
      const kgMin = isStoredPerKg ? minVal : +(minVal / 100).toFixed(2);
      const kgMax = isStoredPerKg ? maxVal : +(maxVal / 100).toFixed(2);

      return {
        commodity: r.commodity || r.cropName,
        state: r.state,
        district: r.district,
        market: r.market,
        variety: r.variety || 'FAQ',
        grade: r.grade || 'Grade A',
        minPrice: qtlMin,
        maxPrice: qtlMax,
        modalPrice: qtlModal,
        unit: '₹/quintal',
        modalPricePerKg: kgModal,
        minPricePerKg: kgMin,
        maxPricePerKg: kgMax,
        arrivalDate: r.arrivalDate || r.date,
        lastUpdated: r.lastUpdated || r.date,
        source: r.source || SOURCE_ATTRIBUTION
      };
    })
  };

  // Cache in Redis for TTL
  await redisService.set(cacheKey, response, MARKET_PRICE_CACHE_TTL);

  return response;
}

/**
 * Get latest verified price for a commodity (e.g. Potato, Wheat, Onion)
 */
async function getLatestPrice(commodityName = 'Potato', state = '', market = '') {
  const cacheKey = redisService.buildKey('latest', { commodity: commodityName, state, market });
  const cached = await redisService.get(cacheKey);
  if (cached) return cached;

  const all = db.find('marketPrices') || [];
  const qComm = commodityName.toLowerCase().trim();

  let matches = all.filter(r =>
    (r.commodity && r.commodity.toLowerCase().includes(qComm)) ||
    (r.commodityNormalized && r.commodityNormalized.includes(qComm)) ||
    (r.cropName && r.cropName.toLowerCase().includes(qComm))
  );

  if (state && state !== 'All') {
    matches = matches.filter(r => r.state && r.state.toLowerCase() === state.toLowerCase().trim());
  }

  if (market && market !== 'All') {
    matches = matches.filter(r => r.market && r.market.toLowerCase().includes(market.toLowerCase().trim()));
  }

  matches.sort((a, b) => new Date(b.arrivalDate || b.date || 0) - new Date(a.arrivalDate || a.date || 0));

  if (matches.length === 0) {
    return null;
  }

  const best = matches[0];
  const modalVal = Number(best.modalPrice || 0);
  const minVal = Number(best.minPrice || (modalVal * 0.9));
  const maxVal = Number(best.maxPrice || (modalVal * 1.1));

  const isStoredPerKg = modalVal < 200 && !(best.priceUnit || '').toLowerCase().includes('quintal');
  const qtlModal = isStoredPerKg ? +(modalVal * 100).toFixed(2) : modalVal;
  const qtlMin = isStoredPerKg ? +(minVal * 100).toFixed(2) : minVal;
  const qtlMax = isStoredPerKg ? +(maxVal * 100).toFixed(2) : maxVal;

  const kgModal = isStoredPerKg ? modalVal : +(modalVal / 100).toFixed(2);
  const kgMin = isStoredPerKg ? minVal : +(minVal / 100).toFixed(2);
  const kgMax = isStoredPerKg ? maxVal : +(maxVal / 100).toFixed(2);

  const result = {
    commodity: best.commodity || best.cropName,
    state: best.state,
    district: best.district,
    market: best.market,
    variety: best.variety || 'FAQ',
    grade: best.grade || 'Grade A',
    minPrice: qtlMin,
    maxPrice: qtlMax,
    modalPrice: qtlModal,
    unit: '₹/quintal',
    modalPricePerKg: kgModal,
    minPricePerKg: kgMin,
    maxPricePerKg: kgMax,
    arrivalDate: best.arrivalDate || best.date,
    lastUpdated: best.lastUpdated || best.date,
    source: SOURCE_ATTRIBUTION,
    sourceUrl: SOURCE_PORTAL_URL
  };

  await redisService.set(cacheKey, result, MARKET_PRICE_CACHE_TTL);
  return result;
}

/**
 * Compare commodity price across multiple markets
 */
function compareMarkets(commodityName = 'Tomato', marketList = []) {
  const all = db.find('marketPrices') || [];
  const qComm = commodityName.toLowerCase().trim();

  let matches = all.filter(r =>
    (r.commodity && r.commodity.toLowerCase().includes(qComm)) ||
    (r.cropName && r.cropName.toLowerCase().includes(qComm))
  );

  const marketMap = new Map();
  for (const item of matches) {
    if (marketList.length > 0 && !marketList.some(m => item.market.toLowerCase().includes(m.toLowerCase()))) {
      continue;
    }
    const mName = item.market;
    if (!marketMap.has(mName) || new Date(item.arrivalDate || item.date) > new Date(marketMap.get(mName).arrivalDate || marketMap.get(mName).date)) {
      marketMap.set(mName, item);
    }
  }

  const comparison = Array.from(marketMap.values()).map(r => ({
    market: r.market,
    state: r.state,
    district: r.district,
    minPrice: r.minPrice,
    maxPrice: r.maxPrice,
    modalPrice: r.modalPrice,
    unit: r.unit || '₹/quintal',
    modalPricePerKg: r.modalPricePerKg || +(r.modalPrice / 100).toFixed(2),
    arrivalDate: r.arrivalDate || r.date,
    source: SOURCE_ATTRIBUTION
  }));

  comparison.sort((a, b) => b.modalPrice - a.modalPrice);
  return comparison;
}

/**
 * Filter lookups directly from verified stored database records
 */
function getStates() {
  const all = db.find('marketPrices') || [];
  const states = [...new Set(all.map(r => r.state).filter(Boolean))].sort();
  return states;
}

function getDistricts(stateFilter = '') {
  const all = db.find('marketPrices') || [];
  let filtered = all;
  if (stateFilter && stateFilter !== 'All') {
    filtered = all.filter(r => r.state && r.state.toLowerCase() === stateFilter.toLowerCase());
  }
  const districts = [...new Set(filtered.map(r => r.district).filter(Boolean))].sort();
  return districts;
}

function getMarkets(districtFilter = '', stateFilter = '') {
  const all = db.find('marketPrices') || [];
  let filtered = all;
  if (stateFilter && stateFilter !== 'All') {
    filtered = filtered.filter(r => r.state && r.state.toLowerCase() === stateFilter.toLowerCase());
  }
  if (districtFilter && districtFilter !== 'All') {
    filtered = filtered.filter(r => r.district && r.district.toLowerCase() === districtFilter.toLowerCase());
  }
  const markets = [...new Set(filtered.map(r => r.market).filter(Boolean))].sort();
  return markets;
}

function getDistinctCommodities() {
  const all = db.find('marketPrices') || [];
  const commodities = [...new Set(all.map(r => r.commodity).filter(Boolean))].sort();
  return commodities;
}

/**
 * Status reporter for transparency
 */
function getPipelineStatus() {
  const redisStatus = redisService.getStatus();
  const allRecords = db.find('marketPrices') || [];

  return {
    governmentApi: {
      resource: 'Current Daily Price of Various Commodities from Various Markets (Mandi)',
      source: SOURCE_ATTRIBUTION,
      sourceUrl: SOURCE_PORTAL_URL,
      baseUrl: OGD_API_BASE_URL,
      apiKeyConfigured: Boolean(process.env.DATA_GOV_IN_API_KEY || process.env.DATA_GOV_API_KEY),
      status: serviceStatus.status,
      lastAttemptAt: serviceStatus.lastAttemptAt,
      lastSuccessfulSync: serviceStatus.lastSuccessfulSync,
      recordsFetched: serviceStatus.recordsFetched,
      recordsStored: serviceStatus.recordsStored,
      recordsUpdated: serviceStatus.recordsUpdated,
      recordsRejected: serviceStatus.recordsRejected,
      lastError: serviceStatus.lastError
    },
    redis: redisStatus,
    database: {
      provider: 'MongoDB Compatible Persistent Datastore',
      collection: 'marketPrices',
      totalVerifiedRecords: allRecords.length
    },
    refreshIntervalMinutes: MARKET_DATA_REFRESH_MINUTES
  };
}

/**
 * Background Scheduler
 */
let scheduledTimer = null;
function startScheduledRefresh() {
  if (scheduledTimer) return;
  const intervalMs = MARKET_DATA_REFRESH_MINUTES * 60 * 1000;
  scheduledTimer = setInterval(async () => {
    if (process.env.DATA_GOV_IN_API_KEY || process.env.DATA_GOV_API_KEY) {
      console.log('[MarketPriceService] Running scheduled daily Mandi sync from data.gov.in...');
      try {
        await fetchFromGovApi({ limit: 150 });
      } catch (err) {
        console.warn('[MarketPriceService] Scheduled sync error:', err.message);
      }
    }
  }, intervalMs);
}

module.exports = {
  getMarketPrices,
  getLatestPrice,
  compareMarkets,
  getStates,
  getDistricts,
  getMarkets,
  getDistinctCommodities,
  fetchFromGovApi,
  getPipelineStatus,
  startScheduledRefresh,
  validateRecord,
  normalizeRecord,
  SOURCE_ATTRIBUTION,
  SOURCE_PORTAL_URL
};
