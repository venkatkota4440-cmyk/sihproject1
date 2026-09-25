import React, { useState } from 'react';
import { Search, Sparkles, Layers, SlidersHorizontal, X } from 'lucide-react';
import SearchSuggestions from './SearchSuggestions';

export default function FilterPanel({
  search,
  setSearch,
  category,
  setCategory,
  subCategory = 'All',
  setSubCategory,
  organicOnly,
  setOrganicOnly,
  sortBy,
  setSortBy
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const categories = ['All', 'Cereals & Grains', 'Pulses', 'Vegetables', 'Fruits'];

  const subCategoryMap = {
    'Cereals & Grains': ['All Subcategories', 'Major Cereals', 'Millets'],
    'Pulses': ['All Subcategories', 'Major Pulses', 'Oilseed Pulses'],
    'Vegetables': [
      'All Subcategories',
      'Solanaceous Vegetables',
      'Leafy Vegetables',
      'Root Vegetables',
      'Cucurbit Vegetables',
      'Cole Crops',
      'Beans & Other Vegetables'
    ],
    'Fruits': ['All Subcategories', 'Tropical Fruits', 'Sub-Tropical Fruits']
  };

  const activeSubCategories = subCategoryMap[category] || [];

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      padding: '18px 20px',
      marginBottom: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Search Bar & Sort Row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search crops (e.g. Wheat, Basmati Rice, Potato, Onion), variety, or producer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.875rem'
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setShowSuggestions(false);
                }}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}

            <SearchSuggestions
              query={search}
              isOpen={showSuggestions}
              onClose={() => setShowSuggestions(false)}
              onSelectSuggestion={(selected) => {
                setSearch(selected);
                setShowSuggestions(false);
              }}
            />
          </div>

          <div style={{ width: '220px' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <option value="latest">Sort: Latest Harvest Listings</option>
              <option value="nearest">Sort: Nearest Farm Gate First</option>
              <option value="price_low">Sort: Price (Low to High)</option>
              <option value="price_high">Sort: Price (High to Low)</option>
              <option value="quantity">Sort: Largest Bulk Quantity</option>
              <option value="rating">Sort: Top Farmer Rating</option>
            </select>
          </div>
        </div>

        {/* Category Tabs & Quick Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          {/* Categories */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat);
                  if (setSubCategory) setSubCategory('All');
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: category === cat ? '1px solid #166534' : '1px solid #cbd5e1',
                  background: category === cat ? '#166534' : '#ffffff',
                  color: category === cat ? '#ffffff' : '#334155',
                  fontWeight: category === cat ? 700 : 500,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background-color 0.15s ease, color 0.15s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Organic certified filter */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>
            <input
              type="checkbox"
              checked={organicOnly}
              onChange={(e) => setOrganicOnly(e.target.checked)}
              style={{ accentColor: '#166534', width: '15px', height: '15px', cursor: 'pointer' }}
            />
            <span>Certified Organic Lots Only</span>
          </label>
        </div>

        {/* Subcategory Chips Row */}
        {activeSubCategories.length > 0 && setSubCategory && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
            paddingTop: '8px',
            borderTop: '1px solid #e2e8f0'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
              Subcategories:
            </span>
            {activeSubCategories.map((sub) => {
              const isSelected = sub === 'All Subcategories' ? subCategory === 'All' : subCategory === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubCategory(sub === 'All Subcategories' ? 'All' : sub)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '3px',
                    border: isSelected ? '1px solid #166534' : '1px solid #e2e8f0',
                    background: isSelected ? '#ecfdf5' : '#f8fafc',
                    color: isSelected ? '#166534' : '#64748b',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

