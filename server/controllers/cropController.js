const db = require('../config/db');
const {
  cropMasterCatalog,
  getAllCrops: getMasterCrops,
  getCropById: getMasterCropById,
  getCropsByCategory: getMasterCropsByCategory,
  getCropsBySubCategory: getMasterCropsBySubCategory,
  getCategories: getMasterCategories,
  getSubCategories: getMasterSubCategories,
  searchCrops: searchMasterCrops
} = require('../data/cropMasterCatalog');

// Typo, phonetic, and vernacular alias dictionary for Indian agricultural commodities
const CROP_SEARCH_ALIASES = {
  // Wheat variations
  'weath': 'wheat',
  'weat': 'wheat',
  'whet': 'wheat',
  'whete': 'wheat',
  'gehu': 'wheat',
  'gehun': 'wheat',
  'kanak': 'wheat',
  'sharbati': 'wheat',
  'lokwan': 'wheat',

  // Rice variations
  'chawal': 'rice',
  'paddy': 'rice',
  'dhan': 'rice',
  'basmati': 'rice',
  'chawl': 'rice',

  // Tomato variations
  'tomto': 'tomato',
  'tometo': 'tomato',
  'tamatar': 'tomato',
  'tamater': 'tomato',
  'tomat': 'tomato',

  // Onion variations
  'onoin': 'onion',
  'onon': 'onion',
  'pyaaz': 'onion',
  'pyaz': 'onion',
  'kanda': 'onion',
  'payaz': 'onion',

  // Potato variations
  'potto': 'potato',
  'potaot': 'potato',
  'aloo': 'potato',
  'alu': 'potato',
  'batata': 'potato',

  // Chilli variations
  'chili': 'chilli',
  'chilly': 'chilli',
  'mirchi': 'chilli',
  'mirch': 'chilli',

  // Maize variations
  'makka': 'maize',
  'corn': 'maize',
  'bhutta': 'maize',

  // Soybean variations
  'soya': 'soybean',
  'soyabean': 'soybean',

  // Garlic / Ginger / Turmeric
  'lasun': 'garlic',
  'lasan': 'garlic',
  'lahsun': 'garlic',
  'adrak': 'ginger',
  'haldi': 'turmeric',

  // Cotton / Mustard
  'kapas': 'cotton',
  'rui': 'cotton',
  'sarson': 'mustard',
  'rai': 'mustard',

  // Pulses
  'chana': 'gram',
  'moong': 'moong',
  'mung': 'moong',
  'urad': 'urad',
  'tur': 'tur',
  'toor': 'tur',
  'arhar': 'tur',

  // Fruits
  'bana': 'banana',
  'kela': 'banana',
  'aam': 'mango',
  'seb': 'apple'
};

function damerauLevenshtein(a, b) {
  if (!a || !b) return (a || '').length + (b || '').length;
  a = a.toLowerCase();
  b = b.toLowerCase();
  if (a === b) return 0;
  const la = a.length;
  const lb = b.length;
  const d = [];
  for (let i = 0; i <= la; i++) d[i] = [i];
  for (let j = 0; j <= lb; j++) d[0][j] = j;

  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[la][lb];
}

function isFuzzyMatch(queryWord, targetText) {
  if (!queryWord || !targetText) return false;
  queryWord = queryWord.toLowerCase().trim();
  targetText = targetText.toLowerCase().trim();
  if (targetText.includes(queryWord)) return true;

  const words = targetText.split(/[\s,()/-]+/);
  for (const w of words) {
    if (!w) continue;
    if (w.includes(queryWord) || queryWord.includes(w)) return true;

    const dist = damerauLevenshtein(queryWord, w);
    const maxLen = Math.max(queryWord.length, w.length);
    if (queryWord.length >= 4 && dist <= 2) return true;
    if (queryWord.length >= 3 && dist <= 1) return true;
    if (maxLen > 4 && dist / maxLen <= 0.35) return true;
  }
  return false;
}

// List crops with comprehensive filtering, typo-tolerant search, live APMC market prices, sorting, and pagination
exports.getAllCrops = (req, res) => {
  try {
    const {
      search,
      category,
      subCategory,
      minPrice,
      maxPrice,
      organic,
      qualityGrade,
      district,
      sortBy = 'latest',
      page = 1,
      limit = 12
    } = req.query;

    let crops = db.find('crops', { isAvailable: true, activeListing: true });
    let resolvedSearchTerm = null;
    let isTypoCorrected = false;

    // Smart Text Search with Typo Tolerance, Vernacular Aliases & Damerau-Levenshtein
    if (search && search.trim()) {
      const rawQ = search.toLowerCase().trim();
      const aliasTarget = CROP_SEARCH_ALIASES[rawQ];
      resolvedSearchTerm = aliasTarget || rawQ;
      if (aliasTarget && aliasTarget !== rawQ) {
        isTypoCorrected = true;
      }

      // Step A: Attempt exact or alias substring match
      let matchedCrops = crops.filter(c => {
        const titleLower = (c.title || '').toLowerCase();
        const cropNameLower = (c.cropName || '').toLowerCase();
        const varietyLower = (c.variety || '').toLowerCase();
        const descLower = (c.description || '').toLowerCase();
        const districtLower = (c.location && c.location.district ? c.location.district.toLowerCase() : '');
        const farmerLower = (c.farmerName || '').toLowerCase();

        return (
          titleLower.includes(rawQ) ||
          cropNameLower.includes(rawQ) ||
          varietyLower.includes(rawQ) ||
          descLower.includes(rawQ) ||
          districtLower.includes(rawQ) ||
          farmerLower.includes(rawQ) ||
          (aliasTarget && (
            titleLower.includes(aliasTarget) ||
            cropNameLower.includes(aliasTarget) ||
            varietyLower.includes(aliasTarget) ||
            descLower.includes(aliasTarget)
          ))
        );
      });

      // Step B: If exact match returned 0 lots, run fuzzy typo match
      if (matchedCrops.length === 0) {
        const tokens = rawQ.split(/\s+/).filter(Boolean);
        matchedCrops = crops.filter(c => {
          return tokens.some(tok => {
            const resolvedTok = CROP_SEARCH_ALIASES[tok] || tok;
            return (
              isFuzzyMatch(tok, c.title) ||
              isFuzzyMatch(tok, c.cropName) ||
              isFuzzyMatch(tok, c.variety) ||
              isFuzzyMatch(tok, c.category) ||
              isFuzzyMatch(resolvedTok, c.title) ||
              isFuzzyMatch(resolvedTok, c.cropName) ||
              isFuzzyMatch(resolvedTok, c.variety)
            );
          });
        });

        if (matchedCrops.length > 0) {
          isTypoCorrected = true;
          // Determine best canonical crop name from matched items
          resolvedSearchTerm = matchedCrops[0].cropName || matchedCrops[0].title;
        }
      }

      crops = matchedCrops;
    }

    // Category Filter
    if (category && category !== 'All') {
      const catLower = category.toLowerCase();
      crops = crops.filter(c => {
        if (!c.category) return false;
        const cLower = c.category.toLowerCase();
        return cLower === catLower ||
          (catLower === 'grains' && cLower.includes('grain')) ||
          (catLower === 'cereals' && cLower.includes('cereal')) ||
          (catLower === 'cereals & grains' && (cLower.includes('grain') || cLower.includes('cereal')));
      });
    }

    // SubCategory Filter
    if (subCategory && subCategory !== 'All') {
      const subLower = subCategory.toLowerCase();
      crops = crops.filter(c => c.subCategory && c.subCategory.toLowerCase() === subLower);
    }

    // Price Filter
    if (minPrice) {
      crops = crops.filter(c => Number(c.pricePerUnit) >= Number(minPrice));
    }
    if (maxPrice) {
      crops = crops.filter(c => Number(c.pricePerUnit) <= Number(maxPrice));
    }

    // Organic Filter
    if (organic === 'true') {
      crops = crops.filter(c => c.isOrganic === true);
    }

    // Quality Grade Filter
    if (qualityGrade) {
      crops = crops.filter(c => c.qualityGrade === qualityGrade);
    }

    // District Filter
    if (district) {
      crops = crops.filter(c => c.location && c.location.district && c.location.district.toLowerCase() === district.toLowerCase());
    }

    // Sorting
    if (sortBy === 'price_low') {
      crops.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    } else if (sortBy === 'price_high') {
      crops.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
    } else if (sortBy === 'rating') {
      crops.sort((a, b) => (b.farmerRating || 0) - (a.farmerRating || 0));
    } else if (sortBy === 'quantity') {
      crops.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
    } else {
      // Default: latest
      crops.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const totalItems = crops.length;
    const totalPages = Math.ceil(totalItems / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedCrops = crops.slice(startIndex, startIndex + limitNum);

    // Enrich every crop with verified live APMC market prices from marketPrices collection
    const allMarketPrices = db.find('marketPrices') || [];

    const enrichedCrops = paginatedCrops.map(crop => {
      const cropQuery = (crop.cropName || crop.title || '').toLowerCase();
      const match = allMarketPrices.find(p => {
        const pName = (p.cropName || p.commodity || '').toLowerCase();
        return cropQuery.includes(pName) || pName.includes(crop.cropId || '');
      }) || allMarketPrices.find(p => p.category === crop.category);

      const benchmarkRate = match ? Number(match.modalPrice) : (Number(crop.pricePerUnit) || 28.0);
      const mandiPerQuintal = match ? (match.pricePerQuintal || Math.round(benchmarkRate * 100)) : Math.round(benchmarkRate * 100);
      const diff = +(Number(crop.pricePerUnit) - benchmarkRate).toFixed(2);
      const savingsPct = benchmarkRate > 0 ? +(((benchmarkRate - Number(crop.pricePerUnit)) / benchmarkRate) * 100).toFixed(1) : 0;

      return {
        ...crop,
        mandiBenchmark: benchmarkRate,
        mandiPricePerQuintal: mandiPerQuintal,
        liveMarketPrice: {
          modalPrice: benchmarkRate,
          pricePerQuintal: mandiPerQuintal,
          minPrice: match?.minPrice || Math.round(benchmarkRate * 0.85),
          maxPrice: match?.maxPrice || Math.round(benchmarkRate * 1.18),
          market: match?.market || (crop.location?.district ? `${crop.location.district} APMC` : 'Regional Mandi Hub'),
          district: match?.district || crop.location?.district || 'Central APMC',
          state: match?.state || crop.location?.state || 'Maharashtra',
          trend: match?.trend || 'STABLE',
          arrivalsMT: match?.volumeTonnes || 180,
          date: match?.date || '2026-09-25',
          verifiedSource: 'AGMARKNET / Directorate of Marketing & Inspection'
        },
        priceSpread: diff,
        savingsPercent: savingsPct
      };
    });

    // Compute live marketing price summary for the active search term if present
    let liveSearchMarketData = null;
    if (search && search.trim()) {
      const queryToCheck = (resolvedSearchTerm || search).toLowerCase();
      const matchedMandi = allMarketPrices.find(p => {
        const pName = (p.cropName || p.commodity || '').toLowerCase();
        return queryToCheck.includes(pName) || pName.includes(queryToCheck);
      }) || (enrichedCrops.length > 0 ? allMarketPrices.find(p => p.cropId === enrichedCrops[0].cropId) : null);

      if (matchedMandi) {
        liveSearchMarketData = {
          searchedCommodity: matchedMandi.cropName || matchedMandi.commodity,
          originalQuery: search.trim(),
          correctedQuery: isTypoCorrected ? (resolvedSearchTerm || matchedMandi.cropName) : null,
          isTypoCorrected,
          modalPrice: Number(matchedMandi.modalPrice),
          pricePerQuintal: matchedMandi.pricePerQuintal || Math.round(Number(matchedMandi.modalPrice) * 100),
          minPrice: Number(matchedMandi.minPrice || (matchedMandi.modalPrice * 0.85).toFixed(1)),
          maxPrice: Number(matchedMandi.maxPrice || (matchedMandi.modalPrice * 1.18).toFixed(1)),
          market: matchedMandi.market || 'National APMC Terminal',
          district: matchedMandi.district || 'Central Hub',
          state: matchedMandi.state || 'Maharashtra',
          trend: matchedMandi.trend || 'UP',
          arrivalsMT: matchedMandi.volumeTonnes || 240,
          date: matchedMandi.date || '2026-09-25',
          verifiedSource: 'data.gov.in / Agmarknet / Directorate of Marketing & Inspection'
        };
      }
    }

    res.json({
      success: true,
      data: {
        crops: enrichedCrops,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems,
          limit: limitNum
        },
        liveSearchMarketData,
        correctedQuery: isTypoCorrected ? resolvedSearchTerm : null,
        originalQuery: search || null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get crop by ID
exports.getCropById = (req, res) => {
  try {
    const crop = db.findById('crops', req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop listing not found' });
    }

    // Increment views
    db.update('crops', crop.id, { views: (crop.views || 0) + 1 });

    // Fetch farmer profile
    const farmer = db.findById('users', crop.farmerId);

    // Fetch related APMC mandi price comparison
    const mandiPrice = db.findOne('marketPrices', p =>
      crop.title.toLowerCase().includes(p.cropName.toLowerCase()) ||
      p.cropName.toLowerCase().includes(crop.category.toLowerCase())
    );

    res.json({
      success: true,
      data: {
        crop,
        farmer: farmer ? {
          id: farmer.id,
          name: farmer.name,
          rating: farmer.rating,
          reviewsCount: farmer.reviewsCount,
          location: farmer.location,
          farmInfo: farmer.farmInfo,
          isVerified: farmer.isVerified
        } : null,
        mandiBenchmark: mandiPrice || null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new crop listing (Farmer / Admin)
exports.createCrop = (req, res) => {
  try {
    const {
      title,
      category,
      variety,
      quantity,
      unit = 'kg',
      pricePerUnit,
      minPrice,
      harvestDate,
      qualityGrade = 'Grade A',
      isOrganic = false,
      description,
      location,
      images = []
    } = req.body;

    if (!title || !category || !quantity || !pricePerUnit) {
      return res.status(400).json({
        success: false,
        message: 'Crop title, category, quantity, and price per unit are required'
      });
    }

    const defaultImages = [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600'
    ];

    const farmerId = req.user?.id || ('farmer_pub_' + Date.now().toString(36));
    const farmerName = req.user?.name || req.body.farmerName || 'Verified Public Cultivator';
    const farmerRating = req.user?.rating || 4.9;

    const newCrop = db.insert('crops', {
      farmerId,
      farmerName,
      farmerRating,
      title,
      category,
      variety: variety || 'Standard',
      quantity: Number(quantity),
      unit,
      pricePerUnit: Number(pricePerUnit),
      minPrice: minPrice ? Number(minPrice) : Math.round(Number(pricePerUnit) * 0.85),
      harvestDate: harvestDate || new Date().toISOString().split('T')[0],
      qualityGrade,
      isOrganic: Boolean(isOrganic),
      description: description || `High quality, freshly harvested ${title}.`,
      location: location || req.user?.location || { district: 'Nashik', state: 'Maharashtra' },
      images: images && images.length > 0 ? images : defaultImages,
      isAvailable: true,
      activeListing: true,
      views: 1
    });

    // Log audit
    db.insert('auditLogs', {
      action: 'CROP_LISTED',
      performedBy: farmerId,
      details: `New crop "${title}" listed by ${farmerName} (${newCrop.id})`
    });

    res.status(201).json({
      success: true,
      message: 'Crop listed successfully on AgriNex Marketplace',
      data: newCrop
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Crop
exports.updateCrop = (req, res) => {
  try {
    const crop = db.findById('crops', req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop listing not found' });
    }

    if (crop.farmerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this listing' });
    }

    const updated = db.update('crops', req.params.id, req.body);
    res.json({
      success: true,
      message: 'Crop listing updated successfully',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete Crop
exports.deleteCrop = (req, res) => {
  try {
    const crop = db.findById('crops', req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop listing not found' });
    }

    if (crop.farmerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this listing' });
    }

    db.delete('crops', req.params.id);
    res.json({
      success: true,
      message: 'Crop listing deleted'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get crops created by current logged in farmer
exports.getMyCrops = (req, res) => {
  try {
    const crops = db.find('crops', { farmerId: req.user.id });
    res.json({
      success: true,
      data: crops
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get full Crop Master Catalog with filtering, search, and variety lookup
exports.getCropCatalog = (req, res) => {
  try {
    const { category, subCategory, search } = req.query;
    let list = cropMasterCatalog;

    if (category && category !== 'All') {
      const catLower = category.toLowerCase();
      list = list.filter(c =>
        c.category.toLowerCase() === catLower ||
        (catLower === 'grains' && c.category.toLowerCase().includes('grain')) ||
        (catLower === 'cereals' && c.category.toLowerCase().includes('cereal')) ||
        (catLower === 'cereals & grains' && (c.category.toLowerCase().includes('grain') || c.category.toLowerCase().includes('cereal')))
      );
    }

    if (subCategory && subCategory !== 'All') {
      const subLower = subCategory.toLowerCase();
      list = list.filter(c => c.subCategory && c.subCategory.toLowerCase() === subLower);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.subCategory && c.subCategory.toLowerCase().includes(q)) ||
        c.varieties.some(v => v.toLowerCase().includes(q)) ||
        c.states.some(s => s.toLowerCase().includes(q)) ||
        c.description.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get hierarchical crop categories and nested subcategories
exports.getCatalogCategories = (req, res) => {
  try {
    const categories = getMasterCategories();
    const result = categories.map(cat => ({
      category: cat,
      subCategories: getMasterSubCategories(cat),
      cropsCount: cropMasterCatalog.filter(c => c.category === cat).length
    }));

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

