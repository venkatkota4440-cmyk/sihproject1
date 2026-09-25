const fs = require('fs');
const path = require('path');
const { cropMasterCatalog } = require('../data/cropMasterCatalog');

const cropsStoragePath = path.join(__dirname, '../storage/crops.json');
const pricesStoragePath = path.join(__dirname, '../storage/marketPrices.json');

const farmers = [
  {
    id: 'user_farmer_1',
    name: 'Ramesh Patel',
    rating: 4.9,
    district: 'Nashik',
    state: 'Maharashtra',
    coords: [20.076, 74.108]
  },
  {
    id: 'user_farmer_2',
    name: 'Sardar Balwinder Singh',
    rating: 4.95,
    district: 'Karnal',
    state: 'Haryana',
    coords: [29.685, 76.99]
  },
  {
    id: 'user_farmer_3',
    name: 'Shivappa Gowda',
    rating: 4.85,
    district: 'Mandya',
    state: 'Karnataka',
    coords: [12.522, 76.898]
  },
  {
    id: 'user_farmer_4',
    name: 'Rajesh Sharma',
    rating: 4.8,
    district: 'Indore',
    state: 'Madhya Pradesh',
    coords: [22.719, 75.857]
  },
  {
    id: 'user_farmer_5',
    name: 'Senthil Kumar',
    rating: 4.9,
    district: 'Salem',
    state: 'Tamil Nadu',
    coords: [11.664, 78.146]
  },
  {
    id: 'user_farmer_6',
    name: 'Amit Bishnoi',
    rating: 4.75,
    district: 'Jodhpur',
    state: 'Rajasthan',
    coords: [26.238, 73.024]
  },
  {
    id: 'user_farmer_7',
    name: 'Debashis Roy',
    rating: 4.88,
    district: 'Burdwan',
    state: 'West Bengal',
    coords: [23.232, 87.861]
  },
  {
    id: 'user_farmer_8',
    name: 'Venkat Reddy',
    rating: 4.92,
    district: 'Warangal',
    state: 'Telangana',
    coords: [17.968, 79.594]
  }
];

const stateMandis = {
  'Maharashtra': 'Vashi APMC, Navi Mumbai',
  'Haryana': 'Karnal Anaj Mandi',
  'Karnataka': 'Yeshwanthpur APMC, Bengaluru',
  'Madhya Pradesh': 'Choithram Mandi, Indore',
  'Tamil Nadu': 'Koyambedu Wholesale Market, Chennai',
  'Rajasthan': 'Muhana Mandi, Jaipur',
  'West Bengal': 'Koley Market, Kolkata',
  'Telangana': 'Bowenpally Market, Hyderabad',
  'Punjab': 'Amritsar Dana Mandi',
  'Uttar Pradesh': 'Azadpur & Sahibabad APMC',
  'Andhra Pradesh': 'Guntur Mirchi Yard / Vijayawada APMC',
  'Gujarat': 'Jamnagar & Ahmedabad APMC'
};

function seedData() {
  console.log('Seeding comprehensive crop marketplace and APMC data...');

  const crops = [];
  const marketPrices = [];
  const now = new Date();

  cropMasterCatalog.forEach((crop, idx) => {
    const farmer = farmers[idx % farmers.length];
    const cropState = crop.states && crop.states[0] ? crop.states[0].split(' ')[0] : farmer.state;
    const variety = crop.varieties[0] || 'Standard Selection';
    const isOrganic = idx % 3 === 0;
    const grade = idx % 4 === 0 ? 'Export Grade' : idx % 2 === 0 ? 'Grade A+' : 'Grade A';

    // Quantity range based on unit
    let quantity = 4000 + ((idx * 650) % 12000);
    if (crop.unit === 'quintal') {
      quantity = 80 + ((idx * 15) % 350);
    } else if (crop.unit === 'ton') {
      quantity = 10 + ((idx * 3) % 40);
    }

    // Listing Object
    crops.push({
      id: `crop_${crop.id}`,
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmerRating: farmer.rating,
      title: `${isOrganic ? 'Certified Organic ' : 'Farm Fresh '}${crop.name} (${variety})`,
      cropId: crop.id,
      cropName: crop.name,
      category: crop.category,
      subCategory: crop.subCategory || 'General',
      variety: variety,
      allVarieties: crop.varieties,
      quantity,
      unit: crop.unit,
      pricePerUnit: crop.benchmarkPricePerKg,
      minPrice: crop.minPricePerKg,
      maxPrice: crop.maxPricePerKg,
      harvestDate: new Date(now.getTime() - (idx % 14) * 86400000).toISOString().split('T')[0],
      qualityGrade: grade,
      isOrganic,
      shelfLifeDays: crop.shelfLifeDays,
      coldStorageTemp: crop.coldStorageTemp,
      description: crop.description,
      location: {
        district: farmer.district,
        state: cropState,
        coordinates: farmer.coords
      },
      images: [
        crop.image,
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600'
      ],
      isAvailable: true,
      activeListing: true,
      views: 120 + ((idx * 37) % 500),
      createdAt: new Date(now.getTime() - idx * 3600000).toISOString(),
      updatedAt: now.toISOString()
    });

    // Market Mandi Price Object
    const mandiName = stateMandis[cropState] || `${cropState} APMC Central Hub`;
    const priceChange = +(((idx % 5) - 2) * 1.8).toFixed(1);
    const trend = priceChange >= 0 ? 'UP' : 'DOWN';
    const modalPrice = crop.benchmarkPricePerKg;
    const minP = crop.minPricePerKg;
    const maxP = crop.maxPricePerKg;
    const prevPrice = +(modalPrice - (modalPrice * priceChange / 100)).toFixed(1);

    marketPrices.push({
      id: `mp_${crop.id}`,
      cropId: crop.id,
      cropName: crop.name,
      category: crop.category,
      subCategory: crop.subCategory || 'General',
      variety: variety,
      district: farmer.district,
      state: cropState,
      market: mandiName,
      modalPrice,
      minPrice: minP,
      maxPrice: maxP,
      previousPrice: prevPrice,
      changePercent: priceChange,
      trend,
      volumeTonnes: 120 + ((idx * 45) % 1800),
      date: now.toISOString().split('T')[0],
      isRealData: false,
      isDemoData: true,
      dataSource: 'AgriNex APMC National Grid Feed',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  });

  // Write out to JSON storage
  fs.writeFileSync(cropsStoragePath, JSON.stringify(crops, null, 2), 'utf8');
  fs.writeFileSync(pricesStoragePath, JSON.stringify(marketPrices, null, 2), 'utf8');

  console.log(`Successfully seeded ${crops.length} live crop listings to crops.json`);
  console.log(`Successfully seeded ${marketPrices.length} APMC Mandi rates to marketPrices.json`);
}

seedData();
