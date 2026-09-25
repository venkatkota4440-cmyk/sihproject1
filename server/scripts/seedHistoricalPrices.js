const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'storage', 'marketPrices.json');
let existing = [];
try {
  existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
} catch (e) {
  existing = [];
}

const keyCommodities = [
  {
    cropName: 'Tomato',
    variety: 'Hybrid Tomato (Abhinav / Saaho)',
    basePrice: 32,
    markets: [
      { name: 'Vashi APMC, Navi Mumbai', district: 'Thane', state: 'Maharashtra', diff: 0 },
      { name: 'Kolar Mandi', district: 'Kolar', state: 'Karnataka', diff: -4 },
      { name: 'Azadpur Mandi, Delhi', district: 'North Delhi', state: 'Delhi', diff: 5 }
    ]
  },
  {
    cropName: 'Red Onions',
    variety: 'Nashik Red / Garwa',
    basePrice: 28,
    markets: [
      { name: 'Lasalgaon APMC, Nashik', district: 'Nashik', state: 'Maharashtra', diff: -2 },
      { name: 'Vashi APMC, Navi Mumbai', district: 'Thane', state: 'Maharashtra', diff: 2 },
      { name: 'Azadpur Mandi, Delhi', district: 'North Delhi', state: 'Delhi', diff: 4 }
    ]
  },
  {
    cropName: 'Potato',
    variety: 'Jyoti / Kufri Badshah',
    basePrice: 22,
    markets: [
      { name: 'Agra Mandi', district: 'Agra', state: 'Uttar Pradesh', diff: -2 },
      { name: 'Azadpur Mandi, Delhi', district: 'North Delhi', state: 'Delhi', diff: 2 },
      { name: 'Vashi APMC, Navi Mumbai', district: 'Thane', state: 'Maharashtra', diff: 3 }
    ]
  },
  {
    cropName: 'Rice / Paddy',
    variety: 'Basmati (1121)',
    basePrice: 46.5,
    markets: [
      { name: 'Amritsar Dana Mandi', district: 'Amritsar', state: 'Punjab', diff: 0 },
      { name: 'Karnal Grain Market', district: 'Karnal', state: 'Haryana', diff: 1.5 },
      { name: 'Najafgarh Grain Mandi, Delhi', district: 'South West Delhi', state: 'Delhi', diff: 3 }
    ]
  },
  {
    cropName: 'Wheat',
    variety: 'Sharbati / Lokwan',
    basePrice: 28.5,
    markets: [
      { name: 'Khanna Grain Market', district: 'Ludhiana', state: 'Punjab', diff: 0 },
      { name: 'Indore Mandi', district: 'Indore', state: 'Madhya Pradesh', diff: -1.2 },
      { name: 'Ujjain APMC', district: 'Ujjain', state: 'Madhya Pradesh', diff: -0.8 }
    ]
  },
  {
    cropName: 'Green Gram / Moong',
    variety: 'Shiny Green / Desi',
    basePrice: 82,
    markets: [
      { name: 'Latur APMC', district: 'Latur', state: 'Maharashtra', diff: 0 },
      { name: 'Indore APMC', district: 'Indore', state: 'Madhya Pradesh', diff: 2 },
      { name: 'Gulbarga APMC', district: 'Kalaburagi', state: 'Karnataka', diff: -1.5 }
    ]
  },
  {
    cropName: 'Red Chilli',
    variety: 'Teja / Guntur Sannam',
    basePrice: 195,
    markets: [
      { name: 'Guntur Mirchi Yard', district: 'Guntur', state: 'Andhra Pradesh', diff: 0 },
      { name: 'Khammam Mirchi Yard', district: 'Khammam', state: 'Telangana', diff: -5 },
      { name: 'Byadgi APMC', district: 'Haveri', state: 'Karnataka', diff: 10 }
    ]
  },
  {
    cropName: 'Turmeric (Haldi)',
    variety: 'Salem / Nizamabad Special',
    basePrice: 145,
    markets: [
      { name: 'Nizamabad Mandi', district: 'Nizamabad', state: 'Telangana', diff: -3 },
      { name: 'Erode Turmeric Market', district: 'Erode', state: 'Tamil Nadu', diff: 5 },
      { name: 'Sangli APMC', district: 'Sangli', state: 'Maharashtra', diff: 2 }
    ]
  },
  {
    cropName: 'Cotton',
    variety: 'Medium / Long Staple (Bt)',
    basePrice: 72,
    markets: [
      { name: 'Rajkot APMC', district: 'Rajkot', state: 'Gujarat', diff: 1 },
      { name: 'Adilabad Cotton Yard', district: 'Adilabad', state: 'Telangana', diff: -2 },
      { name: 'Yavatmal APMC', district: 'Yavatmal', state: 'Maharashtra', diff: 0 }
    ]
  },
  {
    cropName: 'Soybean',
    variety: 'Yellow Soybean (JS 335)',
    basePrice: 48,
    markets: [
      { name: 'Indore Mandi', district: 'Indore', state: 'Madhya Pradesh', diff: 0 },
      { name: 'Nagpur APMC', district: 'Nagpur', state: 'Maharashtra', diff: 1.5 },
      { name: 'Kota Mandi', district: 'Kota', state: 'Rajasthan', diff: -1 }
    ]
  }
];

const newRecords = [];
const today = new Date();

// Generate 30 days of records for each market
for (const comm of keyCommodities) {
  for (const mkt of comm.markets) {
    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const d = new Date(today);
      d.setDate(d.getDate() - dayOffset);
      const dateStr = d.toISOString().split('T')[0];

      // Realistic historical fluctuation
      const wave = Math.sin((30 - dayOffset) * 0.35) * (comm.basePrice * 0.06);
      const noise = ((Math.sin((30 - dayOffset) * 1.9) * 0.5) * (comm.basePrice * 0.03));
      const modal = +(comm.basePrice + mkt.diff + wave + noise).toFixed(2);
      const min = +(modal * 0.85).toFixed(2);
      const max = +(modal * 1.15).toFixed(2);
      const arrival = Math.round(200 + Math.abs(Math.sin(dayOffset * 0.8)) * 600);

      const id = `hist_${comm.cropName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${mkt.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${dateStr.replace(/-/g, '')}`;

      newRecords.push({
        id,
        sourceRecordId: `ogd_${id}`,
        commodity: comm.cropName,
        cropName: comm.cropName,
        variety: comm.variety,
        grade: 'FAQ',
        state: mkt.state,
        district: mkt.district,
        market: mkt.name,
        date: dateStr,
        minPrice: min,
        maxPrice: max,
        modalPrice: modal,
        pricePerQuintal: +(modal * 100).toFixed(0),
        priceUnit: '₹/kg',
        originalPriceUnit: '₹/quintal',
        arrivalQuantity: arrival,
        arrivalUnit: 'tonnes',
        source: 'Government of India — AGMARKNET (data.gov.in)',
        sourceAttribution: 'Ministry of Agriculture and Farmers Welfare, Govt. of India',
        sourceUrl: 'https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi',
        dataType: 'DEMO DATA',
        isRealData: false,
        isDemoData: true,
        fetchedAt: d.toISOString(),
        updatedAt: d.toISOString()
      });
    }
  }
}

// Merge with existing avoiding duplicate IDs
const existingMap = new Map();
existing.forEach(r => existingMap.set(r.id, r));
newRecords.forEach(r => existingMap.set(r.id, r));

const combined = Array.from(existingMap.values());
fs.writeFileSync(filePath, JSON.stringify(combined, null, 2), 'utf8');
console.log(`Seeded historical records. Total market records now: ${combined.length}`);
