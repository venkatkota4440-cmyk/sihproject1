const db = require('../config/db');

// Calculate Match Score between a buyer requirement and a farmer crop
function calculateMatchScore(reqItem, crop) {
  let score = 50; // Base baseline

  // 1. Title/Name match (up to 30 pts)
  const reqTitle = (reqItem.cropName || '').toLowerCase();
  const cropTitle = (crop.title || crop.cropName || '').toLowerCase();
  if (cropTitle.includes(reqTitle) || reqTitle.includes(cropTitle)) {
    score += 30;
  } else if (crop.category && reqItem.category && crop.category.toLowerCase() === reqItem.category.toLowerCase()) {
    score += 15;
  }

  // 2. Price compatibility (up to 15 pts)
  const cropPrice = Number(crop.pricePerUnit) || 0;
  const maxPrice = Number(reqItem.maxPrice) || 0;
  if (maxPrice > 0) {
    if (cropPrice <= maxPrice) {
      score += 15;
    } else if (cropPrice <= maxPrice * 1.15) {
      score += 8;
    }
  }

  // 3. Quality Grade match (up to 5 pts)
  if (crop.qualityGrade && reqItem.qualityGrade && crop.qualityGrade === reqItem.qualityGrade) {
    score += 5;
  }

  // 4. Organic preference (up to 5 pts)
  if (Boolean(crop.isOrganic) === Boolean(reqItem.isOrganic)) {
    score += 5;
  }

  return Math.min(99, Math.max(68, score));
}

// Calculate Net Value using the project documentation formula:
// net value = price * quantity - transport cost
function calculateNetValue(pricePerUnit, quantity, distanceKm = 120) {
  const price = Number(pricePerUnit) || 0;
  const qty = Number(quantity) || 0;
  const grossValue = price * qty;
  // Transport estimation: approx ₹2.50 per kg or min ₹1,200
  const transportCost = Math.max(1200, Math.round(qty * 2.5));
  const netValue = Math.max(0, grossValue - transportCost);
  return { grossValue, transportCost, netValue };
}

// List Requirements
exports.getRequirements = (req, res) => {
  try {
    const { buyerId } = req.query;
    let reqs = db.find('requirements');
    if (buyerId) {
      reqs = reqs.filter(r => r.buyerId === buyerId);
    }
    reqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: reqs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create Buyer Requirement with immediate farmer matching
exports.createRequirement = (req, res) => {
  try {
    const { cropName, category, quantity, unit = 'kg', maxPrice, qualityGrade, isOrganic, location, deliveryDate } = req.body;

    if (!cropName || !quantity || !maxPrice) {
      return res.status(400).json({ success: false, message: 'Crop name, quantity, and max acceptable price are required' });
    }

    // Auto-match farmers
    const matchingCrops = db.find('crops', c => {
      const matchName = c.title.toLowerCase().includes(cropName.toLowerCase()) ||
        (c.category && category && c.category.toLowerCase() === category.toLowerCase());
      const matchPrice = c.pricePerUnit <= Number(maxPrice) * 1.15; // Within 15% negotiable range
      return matchName && matchPrice && c.isAvailable;
    }).map(c => {
      const matchScore = calculateMatchScore({ cropName, category, maxPrice, qualityGrade, isOrganic }, c);
      const { netValue, transportCost } = calculateNetValue(c.pricePerUnit, quantity);
      return {
        ...c,
        matchScore,
        estimatedTransportCost: transportCost,
        netValue
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    const newReq = db.insert('requirements', {
      buyerId: req.user.id,
      buyerName: req.user.name,
      cropName,
      category: category || 'Vegetables',
      quantity: Number(quantity),
      unit,
      maxPrice: Number(maxPrice),
      qualityGrade: qualityGrade || 'Grade A',
      isOrganic: Boolean(isOrganic),
      location: location || req.user.location || { district: 'Mumbai', state: 'Maharashtra' },
      deliveryDate: deliveryDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'ACTIVE',
      matchedFarmerCount: matchingCrops.length,
      topMatchScore: matchingCrops.length > 0 ? matchingCrops[0].matchScore : null
    });

    res.status(201).json({
      success: true,
      message: `Requirement posted. Found ${matchingCrops.length} matching farm harvests.`,
      data: {
        requirement: newReq,
        matches: matchingCrops
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Matched Farmers for Requirement with Match Score & Net Value
exports.getMatchedFarmers = (req, res) => {
  try {
    const reqItem = db.findById('requirements', req.params.id);
    if (!reqItem) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }

    const matches = db.find('crops', c => {
      return (
        c.title.toLowerCase().includes(reqItem.cropName.toLowerCase()) ||
        (c.category && reqItem.category && c.category.toLowerCase() === reqItem.category.toLowerCase())
      );
    }).map(c => {
      const matchScore = calculateMatchScore(reqItem, c);
      const { netValue, transportCost } = calculateNetValue(c.pricePerUnit, reqItem.quantity);
      return {
        ...c,
        matchScore,
        estimatedTransportCost: transportCost,
        netValue
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: matches
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Matching Buyer Requirements for a Farmer
exports.getFarmerMatches = (req, res) => {
  try {
    const farmerId = req.user.id;
    const farmerCrops = db.find('crops', { farmerId, isAvailable: true });

    if (farmerCrops.length === 0) {
      // If demo farmer has no crops yet, match against all active requirements
      const allReqs = db.find('requirements').slice(0, 5);
      return res.json({ success: true, data: allReqs });
    }

    const cropNames = farmerCrops.map(c => (c.title || c.cropName || '').toLowerCase());
    const allRequirements = db.find('requirements', { status: 'ACTIVE' });

    const matchedTenders = allRequirements.filter(reqItem => {
      const rName = (reqItem.cropName || '').toLowerCase();
      return cropNames.some(cn => cn.includes(rName) || rName.includes(cn));
    }).map(r => {
      // Find corresponding crop
      const matchedCrop = farmerCrops.find(c => {
        const cn = (c.title || '').toLowerCase();
        return cn.includes(r.cropName.toLowerCase()) || r.cropName.toLowerCase().includes(cn);
      }) || farmerCrops[0];

      const { netValue, transportCost } = calculateNetValue(matchedCrop.pricePerUnit, r.quantity);

      return {
        ...r,
        matchedCropId: matchedCrop.id,
        matchedCropTitle: matchedCrop.title,
        farmerPrice: matchedCrop.pricePerUnit,
        netRealization: netValue,
        transportCost
      };
    });

    res.json({
      success: true,
      data: matchedTenders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
