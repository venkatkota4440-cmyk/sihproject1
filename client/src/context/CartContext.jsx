import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('agrinex_buyer_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to parse cart from localStorage:', e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('agrinex_buyer_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to persist cart to localStorage:', e);
    }
  }, [cartItems]);

  const showToast = (msg) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2000); // Automatically closes after 2 seconds
  };

  const addToCart = (crop, quantity) => {
    const qtyToAdd = Number(quantity) || (crop.minOrderQuantity || 500);

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === crop.id);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qtyToAdd
        };
        showToast(`Updated ${crop.title} quantity to ${updated[existingIndex].quantity.toLocaleString()} ${crop.unit || 'kg'} in procurement cart!`);
        return updated;
      } else {
        const newItem = {
          id: crop.id,
          title: crop.title,
          variety: crop.variety || 'Standard',
          category: crop.category || 'Commodity',
          qualityGrade: crop.qualityGrade || 'Grade A',
          isOrganic: Boolean(crop.isOrganic),
          farmerName: crop.farmerName || 'Verified Producer',
          farmerId: crop.farmerId,
          farmerRating: crop.farmerRating || 4.8,
          location: crop.location || { district: 'Nashik', state: 'Maharashtra' },
          pricePerUnit: Number(crop.pricePerUnit) || 25,
          unit: crop.unit || 'kg',
          availableQuantity: Number(crop.quantity) || 10000,
          quantity: Math.min(qtyToAdd, Number(crop.quantity) || qtyToAdd),
          image: crop.images && crop.images.length > 0
            ? crop.images[0]
            : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
          addedAt: new Date().toISOString()
        };
        showToast(`Added ${crop.title} (${qtyToAdd.toLocaleString()} ${crop.unit || 'kg'}) to procurement cart!`);
        return [newItem, ...prevItems];
      }
    });
  };

  const updateQuantity = (cropId, newQuantity) => {
    const qty = Number(newQuantity);
    if (qty <= 0) {
      removeFromCart(cropId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === cropId) {
          const clamped = item.availableQuantity ? Math.min(qty, item.availableQuantity) : qty;
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cropId) => {
    setCartItems((prevItems) => {
      const removed = prevItems.find((i) => i.id === cropId);
      if (removed) {
        showToast(`Removed ${removed.title} from procurement cart.`);
      }
      return prevItems.filter((item) => item.id !== cropId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    showToast('Procurement cart cleared.');
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  // Cart financial summary and AgriNex Net Value calculation
  // Document Formula: net value = price × quantity - transport cost
  const getCartTotals = () => {
    const totalItems = cartItems.length;
    const totalQuantity = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
    const produceSubtotal = cartItems.reduce(
      (acc, item) => acc + (Number(item.pricePerUnit) || 0) * (Number(item.quantity) || 0),
      0
    );

    // Estimated refrigerated cold-chain transport freight (e.g. ₹2.80 per kg, min ₹1,200)
    const estimatedTransportCost = totalQuantity > 0 ? Math.max(1200, Math.round(totalQuantity * 2.8)) : 0;

    // Platform Escrow Security fee (0% promotional hackathon tier)
    const escrowPlatformFee = 0;

    // Farmer Net Value formula (from section 6 of AgriNex documentation):
    // net value = price * quantity - transport cost
    const farmerNetValue = Math.max(0, produceSubtotal - estimatedTransportCost);

    // Total Landed Buyer Procurement Cost:
    const totalLandedCost = produceSubtotal + estimatedTransportCost + escrowPlatformFee;

    return {
      totalItems,
      totalQuantity,
      produceSubtotal,
      estimatedTransportCost,
      escrowPlatformFee,
      farmerNetValue,
      totalLandedCost
    };
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
        getCartTotals,
        toastMessage,
        showToast
      }}
    >
      {children}

      {/* Floating Notification Bar (Auto-closes in 2s, Closes immediately on touch/click) */}
      {toastMessage && (
        <div
          role="alert"
          aria-live="polite"
          onClick={() => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            setToastMessage(null);
          }}
          onTouchStart={() => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            setToastMessage(null);
          }}
          title="Tap to dismiss immediately"
          style={{
            position: 'fixed',
            bottom: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(16px)',
            color: '#ffffff',
            padding: '12px 22px',
            borderRadius: '9999px',
            border: '1.5px solid rgba(16, 185, 129, 0.6)',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.55), 0 0 25px rgba(16, 185, 129, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
            animation: 'fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            maxWidth: '92vw',
            transition: 'transform 0.15s ease, opacity 0.15s ease'
          }}
        >
          <span style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981',
            flexShrink: 0
          }} />
          <span style={{ lineHeight: 1.4 }}>{toastMessage}</span>
          <span
            style={{
              marginLeft: '6px',
              fontSize: '0.75rem',
              opacity: 0.6,
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            ✕ Tap to close
          </span>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
