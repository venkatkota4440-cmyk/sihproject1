import React, { useState, useEffect, useRef } from 'react';
import { cropMasterCatalog } from '../../data/cropMasterCatalog';
import { Search, Sparkles, TrendingUp, Tag, ArrowRight, X } from 'lucide-react';

const TRENDING_SEARCHES = [
  { label: 'Basmati Rice (1121)', query: 'Basmati', category: 'Cereals & Grains' },
  { label: 'Sharbati Wheat', query: 'Wheat', category: 'Cereals & Grains' },
  { label: 'Alphonso Mango', query: 'Alphonso', category: 'Fruits' },
  { label: 'Nashik Red Onion', query: 'Onion', category: 'Vegetables' },
  { label: 'Hybrid Tomato', query: 'Tomato', category: 'Vegetables' },
  { label: 'Guntur Red Chilli', query: 'Chilli', category: 'Vegetables' },
  { label: 'Shimla Royal Apple', query: 'Apple', category: 'Fruits' },
  { label: 'Foxtail Millet', query: 'Foxtail', category: 'Cereals & Grains' }
];

const CROP_SEARCH_ALIASES = {
  weath: 'wheat',
  weat: 'wheat',
  wheet: 'wheat',
  gehu: 'wheat',
  gehun: 'wheat',
  tomto: 'tomato',
  tamatar: 'tomato',
  onoin: 'onion',
  pyaaz: 'onion',
  pyaz: 'onion',
  potaot: 'potato',
  aloo: 'potato',
  alu: 'potato',
  chili: 'chilli',
  mirch: 'chilli',
  mirchi: 'chilli',
  chilly: 'chilli',
  bannana: 'banana',
  kela: 'banana',
  aple: 'apple',
  seb: 'apple',
  soya: 'soybean',
  soyabean: 'soybean',
  mung: 'moong',
  chana: 'chickpeas',
  gram: 'chickpeas',
  sarson: 'mustard',
  sarso: 'mustard',
  kapas: 'cotton',
  makka: 'maize',
  makkai: 'maize',
  corn: 'maize',
  dhan: 'rice',
  chawal: 'rice',
  paddy: 'rice',
  bajara: 'bajra',
  jowar: 'sorghum',
  bhindi: 'okra',
  ladyfinger: 'okra'
};

function damerauLevenshtein(a, b) {
  if (!a || !b) return (a || b) ? Math.max(a?.length || 0, b?.length || 0) : 0;
  const la = a.length;
  const lb = b.length;
  const d = [];
  for (let i = 0; i <= la; i++) {
    d[i] = [i];
  }
  for (let j = 0; j <= lb; j++) {
    d[0][j] = j;
  }
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

export default function SearchSuggestions({
  query = '',
  onSelectSuggestion,
  onClose,
  isOpen
}) {
  const containerRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Compute matched crops from cropMasterCatalog with typo resilience
  const cleanQ = query.trim().toLowerCase();
  const aliasResolved = CROP_SEARCH_ALIASES[cleanQ] || cleanQ;

  let matchingCrops = [];
  let isTypoMatched = false;

  if (cleanQ) {
    // 1. Direct or alias match
    matchingCrops = cropMasterCatalog.filter((crop) => {
      const nameL = crop.name.toLowerCase();
      const catL = (crop.category || '').toLowerCase();
      const subL = (crop.subCategory || '').toLowerCase();
      const varL = crop.varieties ? crop.varieties.map(v => v.toLowerCase()) : [];

      const matchesClean = nameL.includes(cleanQ) || catL.includes(cleanQ) || subL.includes(cleanQ) || varL.some(v => v.includes(cleanQ));
      const matchesAlias = aliasResolved !== cleanQ && (nameL.includes(aliasResolved) || catL.includes(aliasResolved) || varL.some(v => v.includes(aliasResolved)));

      return matchesClean || matchesAlias;
    });

    if (matchingCrops.length > 0 && aliasResolved !== cleanQ) {
      isTypoMatched = true;
    }

    // 2. Fuzzy Damerau-Levenshtein fallback
    if (matchingCrops.length === 0 && cleanQ.length >= 3) {
      const fuzzyMatches = cropMasterCatalog.filter((crop) => {
        const words = [crop.name.toLowerCase(), ...(crop.varieties || []).map(v => v.toLowerCase())];
        return words.some(w => {
          const mainWord = w.split(' ')[0].replace(/[^a-z]/g, '');
          const maxDist = cleanQ.length <= 4 ? 1 : 2;
          return damerauLevenshtein(cleanQ, mainWord) <= maxDist;
        });
      });
      if (fuzzyMatches.length > 0) {
        matchingCrops = fuzzyMatches;
        isTypoMatched = true;
      }
    }

    matchingCrops = matchingCrops.slice(0, 6);
  }

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        if (onClose) onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        if (onClose) onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < matchingCrops.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : matchingCrops.length - 1));
      } else if (e.key === 'Enter' && selectedIndex >= 0 && matchingCrops[selectedIndex]) {
        e.preventDefault();
        onSelectSuggestion(matchingCrops[selectedIndex].name);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, matchingCrops, onSelectSuggestion, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.4), 0 0 20px rgba(16, 185, 129, 0.15)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        overflow: 'hidden',
        animation: 'fadeInDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* If User has typed a query */}
      {cleanQ ? (
        <div style={{ padding: '12px 14px' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '4px 8px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Suggested Commodities ({matchingCrops.length})</span>
              {isTypoMatched && (
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#d97706',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  ✨ Typo auto-corrected
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.6875rem' }}>Press ↑ ↓ to navigate • Enter to select</span>
          </div>

          {matchingCrops.length === 0 ? (
            <div style={{ padding: '16px 8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No catalog matches for "{query}". Press Enter to search live farmer listings.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {matchingCrops.map((crop, idx) => {
                const isSelected = idx === selectedIndex;
                const modalKg = crop.benchmarkPricePerKg || 28;
                const modalQtl = modalKg * 100;

                return (
                  <div
                    key={crop.id}
                    onClick={() => onSelectSuggestion(crop.name)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      border: isSelected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={crop.image}
                        alt={crop.name}
                        style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {crop.name}
                          {isTypoMatched && (
                            <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                              (matches "{query}")
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {crop.category} • {crop.varieties ? crop.varieties.slice(0, 2).join(', ') : 'Standard'}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#10b981' }}>
                        ₹{modalKg.toFixed(2)}/kg
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        ₹{modalQtl.toLocaleString('en-IN')}/Qtl • APMC Live
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* If query is empty: Show Trending & Quick Pills */
        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '14px' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <TrendingUp size={14} color="#10b981" /> Popular Wholesale Searches
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {TRENDING_SEARCHES.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectSuggestion(item.query)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-muted)',
                    color: 'var(--text-main)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.18s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.color = '#10b981';
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-main)';
                    e.currentTarget.style.background = 'var(--bg-muted)';
                  }}
                >
                  <Search size={12} color="#10b981" /> {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Category Hints */}
          <div
            style={{
              paddingTop: '12px',
              borderTop: '1px dashed var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}
          >
            <span>Tip: Type crop name, variety (e.g. Basmati, Alphonso), or farmer location.</span>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
