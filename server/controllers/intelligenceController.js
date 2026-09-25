const db = require('../config/db');

// Multi-Mandi Price Arbitrage Scanner
// Compares crop rates across key regional APMC Mandis and deducts estimated logistics freight
exports.getArbitrageOpportunities = (req, res) => {
  try {
    const { crop = 'Red Onions', origin = 'Nashik', quantity = 2000 } = req.query;
    const qtyTonnes = Math.max(1, Number(quantity) / 1000);

    // Mandi Network Matrix
    const mandiDatabase = {
      'Red Onions': [
        { mandi: 'Lasalgaon APMC (Farm-Gate)', district: 'Nashik', state: 'Maharashtra', pricePerKg: 26.5, distanceKm: 25, freightPerTonneKm: 3.5, transitHours: 1 },
        { mandi: 'Vashi Wholesale APMC', district: 'Navi Mumbai', state: 'Maharashtra', pricePerKg: 34.0, distanceKm: 185, freightPerTonneKm: 3.2, transitHours: 5 },
        { mandi: 'Gultekdi APMC', district: 'Pune', state: 'Maharashtra', pricePerKg: 31.5, distanceKm: 210, freightPerTonneKm: 3.2, transitHours: 6 },
        { mandi: 'Azadpur Mandi', district: 'New Delhi', state: 'Delhi', pricePerKg: 42.0, distanceKm: 1280, freightPerTonneKm: 2.8, transitHours: 32 },
        { mandi: 'Yeshwanthpur APMC', district: 'Bengaluru', state: 'Karnataka', pricePerKg: 38.5, distanceKm: 1040, freightPerTonneKm: 2.9, transitHours: 26 }
      ],
      'Alphonso Mangoes': [
        { mandi: 'Ratnagiri Yard (Origin)', district: 'Ratnagiri', state: 'Maharashtra', pricePerKg: 310, distanceKm: 30, freightPerTonneKm: 4.5, transitHours: 1 },
        { mandi: 'Vashi Fruit Market', district: 'Navi Mumbai', state: 'Maharashtra', pricePerKg: 420, distanceKm: 340, freightPerTonneKm: 4.0, transitHours: 8 },
        { mandi: 'Pune Market Yard', district: 'Pune', state: 'Maharashtra', pricePerKg: 380, distanceKm: 310, freightPerTonneKm: 4.0, transitHours: 7 },
        { mandi: 'Ahmedabad APMC', district: 'Ahmedabad', state: 'Gujarat', pricePerKg: 460, distanceKm: 850, freightPerTonneKm: 3.5, transitHours: 18 }
      ],
      'Basmati Paddy': [
        { mandi: 'Karnal Grain Market (Origin)', district: 'Karnal', state: 'Haryana', pricePerKg: 46.0, distanceKm: 20, freightPerTonneKm: 3.0, transitHours: 1 },
        { mandi: 'Narela Mandi', district: 'Delhi', state: 'Delhi', pricePerKg: 52.5, distanceKm: 110, freightPerTonneKm: 3.2, transitHours: 3 },
        { mandi: 'Amritsar Dana Mandi', district: 'Amritsar', state: 'Punjab', pricePerKg: 49.0, distanceKm: 320, freightPerTonneKm: 3.0, transitHours: 7 },
        { mandi: 'Vashi Wholesale', district: 'Navi Mumbai', state: 'Maharashtra', pricePerKg: 64.0, distanceKm: 1460, freightPerTonneKm: 2.6, transitHours: 36 }
      ],
      'Hybrid Tomatoes': [
        { mandi: 'Pimpalgaon APMC', district: 'Nashik', state: 'Maharashtra', pricePerKg: 28.0, distanceKm: 25, freightPerTonneKm: 3.8, transitHours: 1 },
        { mandi: 'Kolar Tomato Market', district: 'Kolar', state: 'Karnataka', pricePerKg: 34.0, distanceKm: 980, freightPerTonneKm: 3.0, transitHours: 24 },
        { mandi: 'Vashi APMC', district: 'Navi Mumbai', state: 'Maharashtra', pricePerKg: 38.0, distanceKm: 195, freightPerTonneKm: 3.6, transitHours: 5 },
        { mandi: 'Surat APMC', district: 'Surat', state: 'Gujarat', pricePerKg: 35.5, distanceKm: 240, freightPerTonneKm: 3.5, transitHours: 6 }
      ],
      'Golden Turmeric': [
        { mandi: 'Sangli APMC (Origin Hub)', district: 'Sangli', state: 'Maharashtra', pricePerKg: 138, distanceKm: 40, freightPerTonneKm: 3.2, transitHours: 1 },
        { mandi: 'Nizamabad APMC', district: 'Nizamabad', state: 'Telangana', pricePerKg: 154, distanceKm: 560, freightPerTonneKm: 2.9, transitHours: 14 },
        { mandi: 'Erode Turmeric Market', district: 'Erode', state: 'Tamil Nadu', pricePerKg: 162, distanceKm: 780, freightPerTonneKm: 2.8, transitHours: 19 },
        { mandi: 'Vashi Spice Yard', district: 'Navi Mumbai', state: 'Maharashtra', pricePerKg: 168, distanceKm: 380, freightPerTonneKm: 3.0, transitHours: 9 }
      ]
    };

    const targetList = mandiDatabase[crop] || mandiDatabase['Red Onions'];
    const originMandi = targetList[0];
    const basePrice = originMandi.pricePerKg;

    // Calculate arbitrage profit for each mandi
    const comparisons = targetList.map((m) => {
      const grossRevenue = m.pricePerKg * Number(quantity);
      const estTransportCost = Math.round(m.distanceKm * m.freightPerTonneKm * qtyTonnes);
      const handlingLossCost = Math.round(grossRevenue * 0.015); // 1.5% in-transit transit loss estimate
      const netRevenue = grossRevenue - estTransportCost - handlingLossCost;
      const originRevenue = basePrice * Number(quantity);
      const netGain = netRevenue - originRevenue;
      const netGainPercent = +((netGain / originRevenue) * 100).toFixed(1);

      return {
        mandiName: m.mandi,
        district: m.district,
        state: m.state,
        spotPricePerKg: m.pricePerKg,
        distanceKm: m.distanceKm,
        transitHours: m.transitHours,
        estTransportCost,
        netRevenue,
        netGainVsOrigin: netGain,
        netGainPercent,
        isBestOpportunity: false,
        recommendedVehicle: m.distanceKm > 400 ? '16-Ton Multi-Axle Reefer' : '3.5-Ton Eicher Pro'
      };
    });

    // Mark the top opportunity
    let bestIdx = 0;
    let maxGain = -Infinity;
    comparisons.forEach((item, idx) => {
      if (item.netGainVsOrigin > maxGain) {
        maxGain = item.netGainVsOrigin;
        bestIdx = idx;
      }
    });
    if (comparisons[bestIdx]) {
      comparisons[bestIdx].isBestOpportunity = true;
    }

    res.json({
      success: true,
      data: {
        crop,
        origin,
        quantityKg: Number(quantity),
        originBenchmarkPrice: basePrice,
        bestOpportunityMandi: comparisons[bestIdx]?.mandiName || originMandi.mandi,
        bestNetProfitSurplus: comparisons[bestIdx]?.netGainVsOrigin || 0,
        comparisons,
        insights: `Selling in ${comparisons[bestIdx]?.mandiName} yields +₹${Number(comparisons[bestIdx]?.netGainVsOrigin || 0).toLocaleString('en-IN')} higher net profit after deducting ₹${Number(comparisons[bestIdx]?.estTransportCost || 0).toLocaleString('en-IN')} freight logistics.`
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// AI "Sell Now vs. Hold in Storage" Decision Advisor
// Compares immediate spot revenue against holding in cold storage factoring storage rental and spoilage
exports.getSellOrHoldAdvisory = (req, res) => {
  try {
    const { crop = 'Red Onions', currentPrice = 28, quantity = 5000, storageDays = 30 } = req.query;

    const cropConfigs = {
      'Red Onions': { monthlyStorageCostPerKg: 0.85, monthlyWeightLossPercent: 2.5, projectedTrendMonthlyPercent: 18.0, shelfLifeDays: 120 },
      'Alphonso Mangoes': { monthlyStorageCostPerKg: 2.50, monthlyWeightLossPercent: 4.0, projectedTrendMonthlyPercent: 8.0, shelfLifeDays: 21 },
      'Basmati Paddy': { monthlyStorageCostPerKg: 0.45, monthlyWeightLossPercent: 0.5, projectedTrendMonthlyPercent: 6.5, shelfLifeDays: 365 },
      'Hybrid Tomatoes': { monthlyStorageCostPerKg: 1.80, monthlyWeightLossPercent: 5.0, projectedTrendMonthlyPercent: -4.0, shelfLifeDays: 15 },
      'Golden Turmeric': { monthlyStorageCostPerKg: 0.50, monthlyWeightLossPercent: 0.8, projectedTrendMonthlyPercent: 12.0, shelfLifeDays: 300 }
    };

    const cropLower = (crop || '').toLowerCase();
    let cfg = cropConfigs['Red Onions'];
    if (cropLower.includes('tomato')) cfg = cropConfigs['Hybrid Tomatoes'];
    else if (cropLower.includes('mango')) cfg = cropConfigs['Alphonso Mangoes'];
    else if (cropLower.includes('rice') || cropLower.includes('paddy') || cropLower.includes('wheat') || cropLower.includes('grain')) cfg = cropConfigs['Basmati Paddy'];
    else if (cropLower.includes('turmeric') || cropLower.includes('chilli') || cropLower.includes('spice')) cfg = cropConfigs['Golden Turmeric'];
    else if (cropLower.includes('onion')) cfg = cropConfigs['Red Onions'];

    const curPriceNum = Number(currentPrice) || 28;
    const qtyNum = Number(quantity) || 5000;
    const daysNum = Math.min(cfg.shelfLifeDays, Math.max(7, Number(storageDays) || 30));

    // Immediate Sell
    const immediateRevenue = curPriceNum * qtyNum;

    // Projected Sell after storageDays
    const daysFactor = daysNum / 30;
    const projectedPriceGain = curPriceNum * (cfg.projectedTrendMonthlyPercent / 100) * daysFactor;
    const expectedFuturePrice = +(curPriceNum + projectedPriceGain).toFixed(2);

    const totalStorageRent = Math.round(cfg.monthlyStorageCostPerKg * daysFactor * qtyNum);
    const weightLossKg = Math.round(qtyNum * ((cfg.monthlyWeightLossPercent / 100) * daysFactor));
    const effectiveStockPostStorage = qtyNum - weightLossKg;
    const grossFutureRevenue = Math.round(expectedFuturePrice * effectiveStockPostStorage);
    const netFutureRevenue = grossFutureRevenue - totalStorageRent;

    const netAdvantage = netFutureRevenue - immediateRevenue;
    const shouldHold = netAdvantage > (immediateRevenue * 0.04) && daysNum <= cfg.shelfLifeDays;

    const advice = shouldHold
      ? {
          recommendation: `HOLD IN STORAGE FOR ${daysNum} DAYS`,
          action: 'HOLD',
          color: '#10b981',
          summary: `Holding ${qtyNum.toLocaleString('en-IN')} kg of ${crop} in ventilated cold storage is expected to generate an additional net profit of ₹${netAdvantage.toLocaleString('en-IN')} (+${((netAdvantage / immediateRevenue) * 100).toFixed(1)}%).`,
          reasoning: [
            `Expected Mandi rate increases from ₹${curPriceNum}/kg to ₹${expectedFuturePrice}/kg due to upcoming post-harvest supply dip.`,
            `Storage cost (₹${totalStorageRent.toLocaleString('en-IN')}) is substantially outweighed by the projected ₹${(grossFutureRevenue - immediateRevenue).toLocaleString('en-IN')} price appreciation.`,
            `Estimated moisture loss is controlled at ~${((weightLossKg / qtyNum) * 100).toFixed(1)}% (${weightLossKg} kg).`
          ],
          confidenceScore: 88.5
        }
      : {
          recommendation: 'SELL IMMEDIATELY AT CURRENT SPOT RATE',
          action: 'SELL_NOW',
          color: '#f59e0b',
          summary: `Immediate sale is optimal. Holding in storage yields only ₹${netAdvantage.toLocaleString('en-IN')} net advantage, which does not justify storage carrying risk and shrinkage.`,
          reasoning: [
            `Current spot price of ₹${curPriceNum}/kg is currently near historical local peak.`,
            `Storage rental and dehydration shrinkage eat into projected marginal price gains.`,
            `Lock in direct buyers on AgriNex to avoid market arrival glut risks.`
          ],
          confidenceScore: 92.0
        };

    res.json({
      success: true,
      data: {
        crop,
        currentSpotPrice: curPriceNum,
        holdingPeriodDays: daysNum,
        immediateRevenue,
        projectedFuturePrice: expectedFuturePrice,
        grossFutureRevenue,
        totalStorageRent,
        shrinkageLossKg: weightLossKg,
        netFutureRevenue,
        netFinancialAdvantage: netAdvantage,
        netAdvantageAfterCosts: netAdvantage,
        decision: advice.action,
        rationale: advice.summary,
        advice
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Smart AI Matchmaker & Recommendations
// Tailored for logged-in user role or role parameter
exports.getSmartRecommendations = (req, res) => {
  try {
    const role = (req.user && req.user.role) || req.query.role || 'FARMER';
    const crops = db.find('crops') || [];
    let requirements = db.find('requirements') || [];

    // Ensure baseline requirement tenders exist for realistic counterparty matchmaking
    if (requirements.length < 4) {
      const defaultReqs = [
        {
          id: 'req_tender_1',
          buyerName: 'FreshDirect Wholesale Networks',
          cropName: 'Tomato',
          variety: 'Hybrid Grade A',
          quantity: 4500,
          targetPrice: 34.0,
          deliveryLocation: { district: 'Navi Mumbai', state: 'Maharashtra' },
          urgency: 'URGENT',
          buyerRating: 4.9,
          escrowGuaranteed: true
        },
        {
          id: 'req_tender_2',
          buyerName: 'Metro Cash & Carry Hub',
          cropName: 'Red Onions',
          variety: 'Nashik Export Red',
          quantity: 12000,
          targetPrice: 31.5,
          deliveryLocation: { district: 'Pune APMC', state: 'Maharashtra' },
          urgency: 'HIGH',
          buyerRating: 4.8,
          escrowGuaranteed: true
        },
        {
          id: 'req_tender_3',
          buyerName: 'BigBasket Regional Sourcing Hub',
          cropName: 'Basmati Rice',
          variety: 'Pusa 1121 Extra Long',
          quantity: 8000,
          targetPrice: 72.0,
          deliveryLocation: { district: 'Thane West', state: 'Maharashtra' },
          urgency: 'MEDIUM',
          buyerRating: 4.9,
          escrowGuaranteed: true
        },
        {
          id: 'req_tender_4',
          buyerName: 'Reliance Retail Agri Desk',
          cropName: 'Wheat',
          variety: 'Sharbati Premium Gold',
          quantity: 15000,
          targetPrice: 35.5,
          deliveryLocation: { district: 'Vashi Terminal', state: 'Maharashtra' },
          urgency: 'HIGH',
          buyerRating: 5.0,
          escrowGuaranteed: true
        }
      ];
      requirements = [...requirements, ...defaultReqs];
    }

    if (role === 'FARMER') {
      // Recommendations for farmers: Highest paying buyers, trending demands
      const matchedBuyers = requirements.slice(0, 6).map((reqItem, idx) => ({
        id: reqItem.id || `match_req_${idx}`,
        buyerName: reqItem.buyerName || 'FreshDirect Wholesale',
        cropName: reqItem.cropName || 'Commodity Produce',
        variety: reqItem.variety || 'Standard Wholesale',
        requiredQuantity: reqItem.quantity || reqItem.requiredQuantity || 5000,
        offeredRate: reqItem.targetPrice || reqItem.offeredRate || 32,
        destinationCity: reqItem.deliveryLocation?.district || 'Navi Mumbai APMC',
        urgency: reqItem.urgency || 'HIGH',
        buyerRating: reqItem.buyerRating || 4.8,
        matchScore: Math.floor(92 + (idx % 3) * 3),
        escrowGuaranteed: true
      }));

      const topTargetMandis = [
        { mandi: 'Vashi APMC (Navi Mumbai)', crop: 'Red Onions', rate: '₹34/kg', premium: '+28% over local' },
        { mandi: 'Azadpur (Delhi)', crop: 'Basmati Paddy', rate: '₹52.5/kg', premium: '+14% over origin' },
        { mandi: 'Kolar APMC (Karnataka)', crop: 'Tomatoes', rate: '₹34/kg', premium: '+21% over Pimpalgaon' }
      ];

      return res.json({
        success: true,
        data: {
          role: 'FARMER',
          personalizedGreeting: 'Smart Crop Placement & Profit Optimizer',
          matchedBuyers,
          topMatches: matchedBuyers,
          topTargetMandis,
          actionTips: [
            'Post Grade A certification to receive ~15% higher bids from institutional supermarket buyers.',
            'Batch your harvest transport with neighbouring producers in Niphad to reduce freight costs by 22%.'
          ]
        }
      });
    } else {
      // Recommendations for buyers: High-quality direct farm listings with best proximity & price
      const recommendedCrops = crops.slice(0, 6).map((c, idx) => ({
        id: c.id,
        title: c.title,
        cropName: c.title,
        farmerName: c.farmerName || 'Verified Producer',
        farmerId: c.farmerId,
        farmerUpi: c.farmerUpi || (c.farmerName ? `${c.farmerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@okhdfcbank` : 'rameshpatel@okhdfcbank'),
        location: `${c.location?.district || 'Nashik'}, ${c.location?.state || 'Maharashtra'}`,
        pricePerUnit: c.pricePerUnit,
        pricePerKg: c.pricePerUnit,
        minPrice: c.minPrice,
        quantity: c.quantity || 5000,
        unit: c.unit || 'kg',
        qualityGrade: c.qualityGrade || 'Grade A',
        isOrganic: Boolean(c.isOrganic),
        image: c.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
        matchReason: c.isOrganic ? 'Certified Organic Producer' : 'Priced 8% Below Regional APMC Benchmark',
        aiMatchScore: Math.floor(91 + (idx % 3) * 3),
        matchScore: `${Math.floor(91 + (idx % 3) * 3)}%`
      }));

      return res.json({
        success: true,
        data: {
          role: 'BUYER',
          personalizedGreeting: 'AI Farm-Direct Procurement Matches',
          recommendedCrops,
          topMatches: recommendedCrops,
          actionTips: [
            'Make direct counter-offers on bulk quantities over 2,000 kg to unlock farm-gate volume savings.',
            'All transactions are 100% protected under AgriNex Escrow until delivery OTP verification.'
          ]
        }
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Market Sentiment & Demand/Supply Indices
exports.getMarketOverviewIndices = (req, res) => {
  try {
    const indices = [
      {
        crop: 'Red Onions',
        sentiment: 'HIGH DEMAND',
        sentimentScore: 84,
        supplyStatus: 'Moderate Arrivals',
        priceTrend: 'Bullish (+5.4%)',
        volatilityIndex: 'Low (Stable)',
        bestAction: 'Favorable for Wholesale Liquidation'
      },
      {
        crop: 'Basmati Paddy 1121',
        sentiment: 'VERY STRONG',
        sentimentScore: 91,
        supplyStatus: 'Tight Inventory',
        priceTrend: 'Rising (+3.8%)',
        volatilityIndex: 'Low',
        bestAction: 'Holding in Silos Advised'
      },
      {
        crop: 'Hybrid Tomatoes',
        sentiment: 'OVERSUPPLIED',
        sentimentScore: 48,
        supplyStatus: 'Peak Flush Arrivals',
        priceTrend: 'Softening (-4.2%)',
        volatilityIndex: 'High',
        bestAction: 'Immediate Farm-Gate Dispatch'
      },
      {
        crop: 'Golden Turmeric',
        sentiment: 'STEADY ACCUMULATION',
        sentimentScore: 78,
        supplyStatus: 'Steady Demand',
        priceTrend: 'Stable (+1.8%)',
        volatilityIndex: 'Low',
        bestAction: 'Good Window for Procurement'
      }
    ];

    res.json({
      success: true,
      data: {
        indices,
        nationalMandiAverageInflation: '+3.1% MoM',
        escrowVolumeCurrentWeek: '₹84.6 Lakhs',
        topPerformingRegion: 'Western Maharashtra (Nashik - Pune Belt)'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 8-Week Forward AI Price Prediction with Confidence Bounds & Seasonal Drivers
exports.getPriceForecast = (req, res) => {
  try {
    const { crop = 'Red Onions' } = req.query;

    const baseModels = {
      'Red Onions': {
        currentRate: 28.0,
        historicalAvg: 24.5,
        forecastTrend: 'BULLISH',
        volatility: 12.4,
        seasonalDrivers: [
          'Arrivals from Late Kharif nearing completion in Lasalgaon',
          'Navratri & Diwali bulk procurement starting across Tier-1 metros',
          'Export quota relaxation anticipated in DGFT policy update'
        ],
        weeks: [
          { week: 'W1', label: 'Week 1', mean: 28.0, lowerBound: 27.2, upperBound: 28.8, arrivalVolume: 'Normal', event: 'Current Spot' },
          { week: 'W2', label: 'Week 2', mean: 29.2, lowerBound: 28.0, upperBound: 30.5, arrivalVolume: 'Declining (-4%)', event: 'Local Mandi Consolidation' },
          { week: 'W3', label: 'Week 3', mean: 31.0, lowerBound: 29.5, upperBound: 32.8, arrivalVolume: 'Tighter (-8%)', event: 'South India Wholesale Demand' },
          { week: 'W4', label: 'Week 4', mean: 33.5, lowerBound: 31.2, upperBound: 35.6, arrivalVolume: 'Tight (-12%)', event: 'Pre-Festive Stocking Peak' },
          { week: 'W5', label: 'Week 5', mean: 34.2, lowerBound: 31.8, upperBound: 36.8, arrivalVolume: 'Moderate Arrivals', event: 'Northern Wholesale Demand' },
          { week: 'W6', label: 'Week 6', mean: 33.0, lowerBound: 30.5, upperBound: 35.5, arrivalVolume: 'Stable', event: 'Post-Festive Settling' },
          { week: 'W7', label: 'Week 7', mean: 31.5, lowerBound: 29.0, upperBound: 34.0, arrivalVolume: 'Early Rabi Inflow', event: 'Early Harvest Arrivals' },
          { week: 'W8', label: 'Week 8', mean: 29.8, lowerBound: 27.0, upperBound: 32.5, arrivalVolume: 'Increasing (+15%)', event: 'Rabi Harvest Ramp-up' }
        ]
      },
      'Hybrid Tomatoes': {
        currentRate: 28.0,
        historicalAvg: 22.0,
        forecastTrend: 'BEARISH_CORRECTION',
        volatility: 22.1,
        seasonalDrivers: [
          'Heavy incoming flush from Kolar and Madanapalle belt',
          'High perishability during warm weather dampening extended holding',
          'Processing sauce plants operating at 85% capacity'
        ],
        weeks: [
          { week: 'W1', label: 'Week 1', mean: 28.0, lowerBound: 26.5, upperBound: 29.5, arrivalVolume: 'High', event: 'Current Spot' },
          { week: 'W2', label: 'Week 2', mean: 25.5, lowerBound: 23.5, upperBound: 27.5, arrivalVolume: 'Surging (+10%)', event: 'Peak Kolar Influx' },
          { week: 'W3', label: 'Week 3', mean: 23.0, lowerBound: 20.8, upperBound: 25.2, arrivalVolume: 'High Flush', event: 'Regional Oversupply' },
          { week: 'W4', label: 'Week 4', mean: 21.5, lowerBound: 19.0, upperBound: 24.0, arrivalVolume: 'Heavy Flush', event: 'Local Glut Risk' },
          { week: 'W5', label: 'Week 5', mean: 22.8, lowerBound: 20.0, upperBound: 25.5, arrivalVolume: 'Declining (-5%)', event: 'Procurement by Puree Units' },
          { week: 'W6', label: 'Week 6', mean: 24.5, lowerBound: 21.5, upperBound: 27.5, arrivalVolume: 'Normalizing', event: 'Second Picking Transition' },
          { week: 'W7', label: 'Week 7', mean: 27.0, lowerBound: 24.0, upperBound: 30.0, arrivalVolume: 'Lower Arrivals', event: 'Supply Dip' },
          { week: 'W8', label: 'Week 8', mean: 29.5, lowerBound: 26.0, upperBound: 33.0, arrivalVolume: 'Tight', event: 'Pre-Winter Demand' }
        ]
      },
      'Basmati Paddy': {
        currentRate: 48.0,
        historicalAvg: 44.0,
        forecastTrend: 'VERY_BULLISH',
        volatility: 7.2,
        seasonalDrivers: [
          'Export contracts locked with Gulf Cooperation Council (GCC) markets',
          'Controlled mill moisture standards increasing demand for dry lots',
          'Stable government minimum support benchmark'
        ],
        weeks: [
          { week: 'W1', label: 'Week 1', mean: 48.0, lowerBound: 47.0, upperBound: 49.0, arrivalVolume: 'Standard', event: 'Current Spot' },
          { week: 'W2', label: 'Week 2', mean: 49.5, lowerBound: 48.2, upperBound: 50.8, arrivalVolume: 'Stable', event: 'Millers Aggressive Buying' },
          { week: 'W3', label: 'Week 3', mean: 51.0, lowerBound: 49.5, upperBound: 52.5, arrivalVolume: 'Tightening', event: 'Export Consignment Lock' },
          { week: 'W4', label: 'Week 4', mean: 52.8, lowerBound: 51.0, upperBound: 54.5, arrivalVolume: 'Low Arrivals', event: 'Premium Grade Shortage' },
          { week: 'Week 5', mean: 54.0, lowerBound: 52.0, upperBound: 56.0, arrivalVolume: 'Low Arrivals', event: 'Peak Export Shipping Window' },
          { week: 'W6', label: 'Week 6', mean: 55.2, lowerBound: 53.0, upperBound: 57.5, arrivalVolume: 'Limited', event: 'Silo Accumulation' },
          { week: 'W7', label: 'Week 7', mean: 56.0, lowerBound: 53.5, upperBound: 58.5, arrivalVolume: 'Very Limited', event: 'End-of-Season Tightness' },
          { week: 'W8', label: 'Week 8', mean: 56.5, lowerBound: 54.0, upperBound: 59.0, arrivalVolume: 'Dormant', event: 'Off-Season Premium' }
        ]
      }
    };

    const model = baseModels[crop] || baseModels['Red Onions'];

    // Optimal Exit Window Identification
    let maxMean = -Infinity;
    let optimalWeek = 'Week 4';
    model.weeks.forEach((w) => {
      if (w.mean > maxMean) {
        maxMean = w.mean;
        optimalWeek = w.label;
      }
    });

    res.json({
      success: true,
      data: {
        crop,
        model,
        optimalExitWindow: optimalWeek,
        projectedMaxAppreciation: `+${(((maxMean - model.currentRate) / model.currentRate) * 100).toFixed(1)}%`,
        aiSummary: `AI Forecast projects a peak price of ₹${maxMean}/kg during ${optimalWeek}. Recommended harvest liquidation or warehouse exit window is centered around ${optimalWeek}.`
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cold Storage & Post-Harvest Facility ROI Economics Calculator
exports.getStorageEconomics = (req, res) => {
  try {
    const {
      crop = 'Red Onions',
      quantity = 5000,
      currentPrice = 28.0,
      durationDays = 30
    } = req.query;

    const qty = Number(quantity);
    const price = Number(currentPrice);
    const days = Number(durationDays);
    const months = +(days / 30).toFixed(2);
    const immediateRevenue = qty * price;

    const facilities = [
      {
        id: 'ca_cold_storage',
        name: 'Controlled Atmosphere (CA) High-Tech Cold Storage',
        technology: 'Precision N2/CO2/O2 gas control + 0°C to 2°C chilled cooling',
        monthlyRatePerKg: 1.20,
        shrinkagePercentPerMonth: 1.2,
        shelfLifeRetention: '99% (Export Grade Maintained)',
        insuranceCovered: true,
        bestFor: 'High-value long-duration storage (>45 days)',
        recommendedFor: days >= 45
      },
      {
        id: 'ventilated_godown',
        name: 'Standard APMC Ventilated Cold Godown',
        technology: 'Motorized air circulation + 12°C to 15°C humidity moderation',
        monthlyRatePerKg: 0.85,
        shrinkagePercentPerMonth: 2.5,
        shelfLifeRetention: '95% (Commercial Grade Maintained)',
        insuranceCovered: true,
        bestFor: 'Medium storage (15 - 45 days)',
        recommendedFor: days >= 15 && days < 45
      },
      {
        id: 'solar_micro_cold',
        name: 'Decentralized Solar Micro-Cold Room (Farm-Gate)',
        technology: 'Solar PV thermal battery buffer at farm gate',
        monthlyRatePerKg: 0.45,
        shrinkagePercentPerMonth: 3.2,
        shelfLifeRetention: '92% (Standard Grade)',
        insuranceCovered: false,
        bestFor: 'Short buffering (7 - 20 days) near farm gate',
        recommendedFor: days < 15
      }
    ];

    // Calculate economics for each facility
    const projectedRateAppreciationPerMonth = 0.18; // 18% price appreciation expected
    const futurePricePerKg = +(price * (1 + projectedRateAppreciationPerMonth * months)).toFixed(2);

    const comparisons = facilities.map((f) => {
      const storageRent = Math.round(f.monthlyRatePerKg * qty * months);
      const totalShrinkageLossKg = Math.round(qty * (f.shrinkagePercentPerMonth / 100) * months);
      const marketableQuantityKg = qty - totalShrinkageLossKg;
      const grossFutureRevenue = Math.round(marketableQuantityKg * futurePricePerKg);
      const netFutureRevenue = grossFutureRevenue - storageRent;
      const netProfitAdvantage = netFutureRevenue - immediateRevenue;
      const roiPercent = +((netProfitAdvantage / (immediateRevenue + storageRent)) * 100).toFixed(1);
      const breakEvenPrice = +((immediateRevenue + storageRent) / marketableQuantityKg).toFixed(2);

      return {
        id: f.id,
        name: f.name,
        technology: f.technology,
        monthlyRatePerKg: f.monthlyRatePerKg,
        storageRent,
        shrinkageLossKg: totalShrinkageLossKg,
        marketableQuantityKg,
        futurePricePerKg,
        grossFutureRevenue,
        netFutureRevenue,
        netProfitAdvantage,
        roiPercent,
        breakEvenPrice,
        shelfLifeRetention: f.shelfLifeRetention,
        insuranceCovered: f.insuranceCovered,
        isRecommended: f.recommendedFor
      };
    });

    res.json({
      success: true,
      data: {
        crop,
        quantityKg: qty,
        currentSpotPrice: price,
        holdingDays: days,
        immediateRevenue,
        comparisons,
        insights: `Storing ${qty.toLocaleString()} kg for ${days} days yields up to ₹${Math.max(...comparisons.map(c => c.netProfitAdvantage)).toLocaleString('en-IN')} net gain after all cold-chain rental and shrinkage deductions.`
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Corridor Transporters for Arbitrage Freight Execution
exports.getCorridorTransporters = (req, res) => {
  try {
    const { destination = 'Azadpur Mandi, New Delhi', origin = 'Nashik Farm Gate' } = req.query;

    const fleetCorridor = [
      {
        id: 'fleet_1',
        transporterName: 'Sahyadri Reefer Express Logistics',
        vehicleType: '16-Ton Multi-Axle Insulated Reefer',
        regNumber: 'MH-15-EG-8921',
        driverName: 'Ramesh Patil',
        driverRating: 4.92,
        completedTrips: 184,
        telematics: {
          realtimeGps: true,
          coldChainSensor: 'Active (Configured for 18°C)',
          speedMonitoring: true
        },
        transitHours: 32,
        corridorFreightQuote: 7168,
        availability: 'READY_FOR_DISPATCH'
      },
      {
        id: 'fleet_2',
        transporterName: 'Kisan Speedways Cargo',
        vehicleType: '9-Ton Tata LPT Tarpaulin Truck',
        regNumber: 'MH-04-AZ-4502',
        driverName: 'Sukhdev Singh',
        driverRating: 4.85,
        completedTrips: 240,
        telematics: {
          realtimeGps: true,
          coldChainSensor: 'Ambient Ventilated',
          speedMonitoring: true
        },
        transitHours: 34,
        corridorFreightQuote: 5850,
        availability: 'AVAILABLE_TOMORROW'
      },
      {
        id: 'fleet_3',
        transporterName: 'GreenRoute Agro Haulers',
        vehicleType: '3.5-Ton Eicher Pro Refrigerated',
        regNumber: 'MH-12-KT-3310',
        driverName: 'Dnyaneshwar Shinde',
        driverRating: 4.96,
        completedTrips: 112,
        telematics: {
          realtimeGps: true,
          coldChainSensor: 'Active (Configured for 14°C)',
          speedMonitoring: true
        },
        transitHours: 30,
        corridorFreightQuote: 4400,
        availability: 'READY_FOR_DISPATCH'
      }
    ];

    res.json({
      success: true,
      data: {
        origin,
        destination,
        activeCorridorTrucks: fleetCorridor.length,
        fleet: fleetCorridor
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
