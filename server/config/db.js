const fs = require('fs');
const path = require('path');

// Storage directory for persistent JSON database
const dataDir = path.join(__dirname, '..', 'storage');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// In-Memory Database with Automatic File Persistence
class DataStore {
  constructor() {
    this.collections = {
      users: [],
      crops: [],
      cropScans: [],
      requirements: [],
      offers: [],
      orders: [],
      contracts: [],
      payments: [],
      deliveries: [],
      messages: [],
      marketPrices: [],
      priceAlerts: [],
      notifications: [],
      auditLogs: []
    };
    this.loadFromDisk();
  }

  loadFromDisk() {
    try {
      for (const col of Object.keys(this.collections)) {
        const filePath = path.join(dataDir, `${col}.json`);
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, 'utf-8');
          this.collections[col] = JSON.parse(raw);
        }
      }
    } catch (err) {
      console.warn('Notice: initialized memory store without disk reload:', err.message);
    }
  }

  saveToDisk(col) {
    try {
      const filePath = path.join(dataDir, `${col}.json`);
      fs.writeFileSync(filePath, JSON.stringify(this.collections[col] || [], null, 2), 'utf-8');
    } catch (err) {
      console.error(`Error saving ${col} to disk:`, err.message);
    }
  }

  find(col, query = {}) {
    const items = this.collections[col] || [];
    return items.filter(item => {
      for (const [key, val] of Object.entries(query)) {
        if (typeof val === 'function') {
          if (!val(item[key])) return false;
        } else if (item[key] !== val) {
          return false;
        }
      }
      return true;
    });
  }

  findOne(col, query = {}) {
    const items = this.find(col, query);
    return items.length > 0 ? { ...items[0] } : null;
  }

  findById(col, id) {
    return this.findOne(col, { id });
  }

  insert(col, item) {
    if (!this.collections[col]) {
      this.collections[col] = [];
    }
    const newItem = {
      id: item.id || `agx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item
    };
    this.collections[col].push(newItem);
    this.saveToDisk(col);
    return { ...newItem };
  }

  update(col, id, updates) {
    const items = this.collections[col] || [];
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    items[idx] = {
      ...items[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveToDisk(col);
    return { ...items[idx] };
  }

  delete(col, id) {
    const items = this.collections[col] || [];
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return false;
    items.splice(idx, 1);
    this.saveToDisk(col);
    return true;
  }

  count(col, query = {}) {
    return this.find(col, query).length;
  }
}

const db = new DataStore();

module.exports = db;
