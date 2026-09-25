/**
 * AgriNex — Government & Open Market Data Service
 * Integrates with data.gov.in / AGMARKNET Daily Mandi Commodity Price API.
 * Source: Government Open Data License — India (GODL)
 * Dataset: Current Daily Price of Various Commodities from Various Markets (Mandi)
 * Resource ID: 9ef84268-d588-465a-a308-a864a43d0070
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/db');

// Configurable Environment Settings
const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY || '';
const MARKET_DATA_MODE = process.env.MARKET_DATA_MODE || (DATA_GOV_API_KEY ? 'live' : 'demo');
const MARKET_DATA_REFRESH_MINUTES = parseInt(process.env.MARKET_DATA_REFRESH_MINUTES, 10) || 30;
const MARKET_DATA_CACHE_SECONDS = parseInt(process.env.MARKET_DATA_CACHE_SECONDS, 10) || 1800;

const OGD_API_BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const SOURCE_PORTAL_URL = 'https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi';
const SOURCE_ATTRIBUTION = 'Government of India — Ministry of Agriculture & Farmers Welfare / AGMARKNET (data.gov.in)';

// In-Memory cache state
let priceCache = {
  lastFetchedAt: null,
  lastSuccessfulSync: null,
  cachedData: [],
  sourceStatus: 'INITIALIZED',
  mode: MARKET_DATA_MODE,
  totalRecords: 0,
  duplicateCount: 0,
  rejectedCount: 0
};

/**
 * Validate market record:
 * - minPrice <= modalPrice <= maxPrice (where available)
 * - Positive numerical prices
 * - Non-empty commodity, state, market
 */
function validateRecord(record) {
  if (!record.commodity || !record.market || !record.state) {
    return { valid: false, reason: 'Missing commodity, market, or state' };
  }

  const modal = Number(record.modalPrice);
  const min = Number(record.minPrice);
  const max = Number(record.maxPrice);

  if (isNaN(modal) || modal <= 0) {
    return { valid: false, reason: 'Invalid or non-positive modal price' };
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
 * Normalize record fields and units
 * Government AGMARKNET prices are in ₹/quintal (1 quintal = 100 kg).
 * We store both normalized ₹/kg and original ₹/quintal.
 */
function normalizeRecord(raw, isLiveSource = false) {
  const modalQuintal = Number(raw.modal_price || raw.modalPrice || 0);
  const minQuintal = Number(raw.min_price || raw.minPrice || modalQuintal * 0.9);
  const maxQuintal = Number(raw.max_price || raw.maxPrice || modalQuintal * 1.1);

  // Normalize to per kg (1 Quintal = 100 kg)
  // If raw data was already stored per kg in local demo, respect unit:
  const isOriginalQuintal = (raw.originalPriceUnit || raw.priceUnit || '').toLowerCase().includes('quintal') || isLiveSource;
  
  const modalPerKg = isOriginalQuintal ? +(modalQuintal / 100).toFixed(2) : modalQuintal;
  const minPerKg = isOriginalQuintal ? +(minQuintal / 100).toFixed(2) : minQuintal;
  const maxPerKg = isOriginalQuintal ? +(maxQuintal / 100).toFixed(2) : maxQuintal;
  const pricePerQuintal = isOriginalQuintal ? modalQuintal : +(modalQuintal * 100).toFixed(2);

  // Date format normalization
  let normalizedDate = new Date().toISOString().split('T')[0];
  if (raw.arrival_date) {
    // Convert DD/MM/YYYY to YYYY-MM-DD
    const parts = raw.arrival_date.split('/');
    if (parts.length === 3) {
      normalizedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  } else if (raw.date) {
    normalizedDate = raw.date;
  }

  const commodity = (raw.commodity || raw.cropName || '').trim();
  const market = (raw.market || '').trim();
  const state = (raw.state || '').trim();
  const district = (raw.district || '').trim();
  const variety = (raw.variety || 'FAQ').trim();
  const grade = (raw.grade || 'Grade A').trim();

  // Unique deterministic ID to prevent duplicates
  const compositeKey = `${commodity}_${state}_${market}_${normalizedDate}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');

  return {
    id: raw.id || `agmark_${compositeKey}`,
    sourceRecordId: raw.sourceRecordId || compositeKey,
    commodity,
    cropName: commodity,
    variety,
    grade,
    state,
    district,
    market,
    date: normalizedDate,
    modalPrice: modalPerKg, // Normalized standard: ₹/kg
    minPrice: minPerKg,
    maxPrice: maxPerKg,
    pricePerQuintal,
    priceUnit: '₹/kg',
    originalPriceUnit: isOriginalQuintal ? '₹/quintal' : '₹/kg',
    arrivalQuantity: Number(raw.arrival_quantity || raw.arrivalQuantity || raw.volumeTonnes || 0),
    arrivalUnit: raw.arrivalUnit || 'tonnes',
    source: isLiveSource ? 'AGMARKNET (data.gov.in)' : 'AgriNex Mandi Demonstration Grid',
    sourceAttribution: SOURCE_ATTRIBUTION,
    sourceUrl: SOURCE_PORTAL_URL,
    dataType: isLiveSource ? 'REAL MARKET DATA' : 'DEMO DATA',
    isRealData: Boolean(isLiveSource),
    isDemoData: !isLiveSource,
    fetchedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Fetch latest agricultural market prices from data.gov.in API
 */
async function fetchFromGovApi(commodityFilter = '', stateFilter = '', limit = 100) {
  if (!DATA_GOV_API_KEY) {
    return {
      success: false,
      error: 'DATA_GOV_API_KEY is not configured on the server. Running in transparent DEMO mode.',
      mode: 'demo'
    };
  }

  try {
    const url = new URL(OGD_API_BASE_URL);
    url.searchParams.append('api-key', DATA_GOV_API_KEY);
    url.searchParams.append('format', 'json');
    url.searchParams.append('limit', String(limit));
    url.searchParams.append('offset', '0');

    if (commodityFilter) {
      url.searchParams.append('filters[commodity]', commodityFilter);
    }
    if (stateFilter) {
      url.searchParams.append('filters[state]', stateFilter);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AgriNex-Platform/2.0 (Agricultural Market Intelligence)'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Data.gov.in API responded with status ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    const records = json.records || [];

    const validatedRecords = [];
    let duplicates = 0;
    let rejected = 0;
    const seenKeys = new Set();

    for (const raw of records) {
      const normalized = normalizeRecord(raw, true);
      const validation = validateRecord(normalized);

      if (!validation.valid) {
        rejected++;
        continue;
      }

      if (seenKeys.has(normalized.id)) {
        duplicates++;
        continue;
      }

      seenKeys.add(normalized.id);
      validatedRecords.push(normalized);
    }

    priceCache.lastFetchedAt = new Date().toISOString();
    priceCache.lastSuccessfulSync = new Date().toISOString();
    priceCache.sourceStatus = 'ONLINE (data.gov.in AGMARKNET)';
    priceCache.mode = 'live';
    priceCache.totalRecords = validatedRecords.length;
    priceCache.duplicateCount = duplicates;
    priceCache.rejectedCount = rejected;

    // Persist to MongoDB / storage
    for (const item of validatedRecords) {
      const existing = db.findById('marketPrices', item.id);
      if (existing) {
        db.update('marketPrices', item.id, item);
      } else {
        db.insert('marketPrices', item);
      }
    }

    return {
      success: true,
      count: validatedRecords.length,
      mode: 'live',
      source: SOURCE_ATTRIBUTION,
      sourceUrl: SOURCE_PORTAL_URL,
      lastUpdated: priceCache.lastSuccessfulSync,
      data: validatedRecords
    };
  } catch (err) {
    priceCache.sourceStatus = `OFFLINE / ERROR: ${err.message}`;
    return {
      success: false,
      error: `Live market data temporarily unavailable: ${err.message}`,
      fallback: 'Showing latest cached market data.'
    };
  }
}

/**
 * Get Market Prices with comprehensive filters
 */
function getMarketPrices(filters = {}) {
  const {
    crop,
    commodity,
    variety,
    state,
    district,
    market,
    fromDate,
    toDate,
    limit = 50,
    page = 1,
    sort = 'latest'
  } = filters;

  let records = db.find('marketPrices') || [];

  // Filter by Commodity / Crop
  const cropQuery = (crop || commodity || '').trim().toLowerCase();
  if (cropQuery) {
    records = records.filter(r =>
      (r.commodity && r.commodity.toLowerCase().includes(cropQuery)) ||
      (r.cropName && r.cropName.toLowerCase().includes(cropQuery))
    );
  }

  // Filter by Variety
  if (variety && variety !== 'All') {
    records = records.filter(r => r.variety && r.variety.toLowerCase().includes(variety.toLowerCase()));
  }

  // Filter by State
  if (state && state !== 'All') {
    records = records.filter(r => r.state && r.state.toLowerCase() === state.toLowerCase());
  }

  // Filter by District
  if (district && district !== 'All') {
    records = records.filter(r => r.district && r.district.toLowerCase() === district.toLowerCase());
  }

  // Filter by Market
  if (market && market !== 'All') {
    records = records.filter(r => r.market && r.market.toLowerCase().includes(market.toLowerCase()));
  }

  // Date Range Filters
  if (fromDate) {
    records = records.filter(r => r.date >= fromDate);
  }
  if (toDate) {
    records = records.filter(r => r.date <= toDate);
  }

  // Sorting
  if (sort === 'price_asc') {
    records.sort((a, b) => a.modalPrice - b.modalPrice);
  } else if (sort === 'price_desc') {
    records.sort((a, b) => b.modalPrice - a.modalPrice);
  } else {
    // Default: latest date
    records.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  }

  // Pagination
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const totalItems = records.length;
  const totalPages = Math.ceil(totalItems / limitNum) || 1;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = records.slice(startIndex, startIndex + limitNum);

  return {
    records: paginated,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalItems,
      limit: limitNum
    },
    metadata: {
      source: DATA_GOV_API_KEY ? SOURCE_ATTRIBUTION : 'AgriNex APMC National Grid Feed',
      sourceUrl: SOURCE_PORTAL_URL,
      dataType: DATA_GOV_API_KEY ? 'REAL MARKET DATA' : 'DEMO DATA',
      lastUpdated: priceCache.lastSuccessfulSync || new Date().toISOString(),
      cacheStatus: 'ACTIVE',
      currency: 'INR (₹)'
    }
  };
}

/**
 * Get Latest Single Price for a crop + state + market
 */
function getLatestPrice(cropName, state = '', market = '') {
  let list = db.find('marketPrices');

  if (cropName) {
    const q = cropName.toLowerCase();
    list = list.filter(r =>
      (r.commodity && r.commodity.toLowerCase().includes(q)) ||
      (r.cropName && r.cropName.toLowerCase().includes(q))
    );
  }

  if (state && state !== 'All') {
    list = list.filter(r => r.state && r.state.toLowerCase() === state.toLowerCase());
  }

  if (market && market !== 'All') {
    list = list.filter(r => r.market && r.market.toLowerCase().includes(market.toLowerCase()));
  }

  list.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  if (list.length === 0) {
    return null;
  }

  const latest = list[0];
  const previous = list.length > 1 ? list[1] : null;
  const prevPrice = previous ? previous.modalPrice : latest.modalPrice * 0.98;
  const priceChange = +(latest.modalPrice - prevPrice).toFixed(2);
  const changePercent = prevPrice > 0 ? +((priceChange / prevPrice) * 100).toFixed(2) : 0;

  return {
    ...latest,
    previousPrice: prevPrice,
    priceChange,
    changePercent,
    trend: priceChange >= 0 ? 'UP' : 'DOWN',
    priceNotice: DATA_GOV_API_KEY ? 'Latest available market price' : 'Demonstration Mandi rate'
  };
}

/**
 * Compare commodity price across multiple markets (Market A vs B vs C)
 */
function compareMarkets(cropName, markets = []) {
  if (!cropName) return [];

  let query = db.find('marketPrices');
  const q = cropName.toLowerCase();
  query = query.filter(r =>
    (r.commodity && r.commodity.toLowerCase().includes(q)) ||
    (r.cropName && r.cropName.toLowerCase().includes(q))
  );

  const marketMap = {};

  for (const item of query) {
    const mName = item.market;
    if (markets.length > 0 && !markets.some(m => mName.toLowerCase().includes(m.toLowerCase()))) {
      continue;
    }

    if (!marketMap[mName] || new Date(item.date) > new Date(marketMap[mName].date)) {
      marketMap[mName] = item;
    }
  }

  const results = Object.values(marketMap);
  results.sort((a, b) => b.modalPrice - a.modalPrice); // High to low arbitrage
  return results;
}

/**
 * Get distinct states from market data
 */
function getStates() {
  const all = db.find('marketPrices') || [];
  const set = new Set();
  all.forEach(r => {
    if (r.state) set.add(r.state);
  });
  return Array.from(set).sort();
}

/**
 * Get distinct districts for a state
 */
function getDistricts(state = '') {
  const all = db.find('marketPrices') || [];
  const set = new Set();
  all.forEach(r => {
    if (!state || (r.state && r.state.toLowerCase() === state.toLowerCase())) {
      if (r.district) set.add(r.district);
    }
  });
  return Array.from(set).sort();
}

/**
 * Get distinct markets for district / state
 */
function getMarkets(district = '', state = '') {
  const all = db.find('marketPrices') || [];
  const set = new Set();
  all.forEach(r => {
    const matchState = !state || (r.state && r.state.toLowerCase() === state.toLowerCase());
    const matchDistrict = !district || (r.district && r.district.toLowerCase() === district.toLowerCase());
    if (matchState && matchDistrict && r.market) {
      set.add(r.market);
    }
  });
  return Array.from(set).sort();
}

/**
 * System Pipeline Status for Admin & Dashboard
 */
function getPipelineStatus() {
  return {
    mode: DATA_GOV_API_KEY ? 'LIVE (data.gov.in)' : 'DEMO MODE',
    apiKeyConfigured: Boolean(DATA_GOV_API_KEY),
    sourceName: 'AGMARKNET / Open Government Data Platform India',
    sourceUrl: SOURCE_PORTAL_URL,
    lastChecked: priceCache.lastFetchedAt || new Date().toISOString(),
    lastSuccessfulSync: priceCache.lastSuccessfulSync || new Date().toISOString(),
    status: priceCache.sourceStatus,
    refreshIntervalMinutes: MARKET_DATA_REFRESH_MINUTES,
    cacheTtlSeconds: MARKET_DATA_CACHE_SECONDS,
    totalRecordsLoaded: (db.find('marketPrices') || []).length,
    license: 'Government Open Data License — India (GODL)'
  };
}

module.exports = {
  fetchFromGovApi,
  getMarketPrices,
  getLatestPrice,
  compareMarkets,
  getStates,
  getDistricts,
  getMarkets,
  getPipelineStatus,
  normalizeRecord,
  validateRecord
};
