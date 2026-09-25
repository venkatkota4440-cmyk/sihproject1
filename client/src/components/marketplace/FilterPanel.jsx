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
    <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Search Bar & Sort Row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by crop (e.g. Basmati, Moong, Tomato, Spinach, Drumstick), variety, or farmer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="form-input"
              style={{ paddingLeft: '40px', paddingRight: search ? '40px' : '14px' }}
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
                  color: 'var(--text-muted)',
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

          <div style={{ width: '200px' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
            >
              <option value="latest">Latest Harvests</option>
              <option value="nearest">📍 Nearest Live Farm First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Top Farmer Rating</option>
              <option value="quantity">Largest Bulk Quantity</option>
            </select>
          </div>
        </div>

        {/* Category Pills & Quick Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {/* Categories */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat);
                  if (setSubCategory) setSubCategory('All');
                }}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  border: category === cat ? 'none' : '1px solid var(--border-color)',
                  background: category === cat ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'var(--bg-muted)',
                  color: category === cat ? '#ffffff' : 'var(--text-main)',
                  fontWeight: category === cat ? 700 : 500,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: category === cat ? '0 2px 8px rgba(16, 185, 129, 0.35)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Organic certified filter */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={organicOnly}
              onChange={(e) => setOrganicOnly(e.target.checked)}
              style={{ accentColor: '#10b981', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-main)' }}>
              <Sparkles size={14} color="#059669" /> Certified Organic Only
            </span>
          </label>
        </div>

        {/* Subcategory Chips Row (Shown when a category with subcategories is selected) */}
        {activeSubCategories.length > 0 && setSubCategory && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            paddingTop: '8px',
            borderTop: '1px dashed var(--border-color)'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Layers size={13} /> Subcategories:
            </span>
            {activeSubCategories.map((sub) => {
              const isSelected = sub === 'All Subcategories' ? subCategory === 'All' : subCategory === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubCategory(sub === 'All Subcategories' ? 'All' : sub)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    border: isSelected ? '1px solid #10b981' : '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    color: isSelected ? '#10b981' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
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

