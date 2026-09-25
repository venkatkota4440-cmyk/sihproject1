import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Package,
  PlusCircle,
  Eye,
  Trash2,
  Edit3,
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export default function MyCrops() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCrops = async () => {
    try {
      const res = await api.get('/crops/farmer/my-crops');
      if (res.success) setCrops(res.data);
    } catch (err) {
      console.warn('Error fetching farmer crops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this harvest listing?')) return;
    try {
      await api.delete(`/crops/${id}`);
      fetchCrops();
    } catch (err) {
      alert(err.message || 'Failed to delete listing.');
    }
  };

  return (
    <div className="container" style={{ padding: '36px 20px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-success">MY ACTIVE INVENTORY</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
            My Crop Listings ({crops.length})
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage your harvest listings, adjust pricing, and track views from wholesale buyers.
          </p>
        </div>

        <Link to="/farmer/add-crop" className="btn btn-primary">
          <PlusCircle size={18} /> Add New Crop Listing
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading your harvests...</div>
      ) : crops.length === 0 ? (
        <div className="glass-card" style={{ padding: '50px', textAlign: 'center' }}>
          <Package size={44} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3>No Crops Listed Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            List your harvest with live camera photos to start receiving wholesale bids.
          </p>
          <Link to="/farmer/add-crop" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
            <PlusCircle size={16} /> List First Crop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {crops.map((crop) => (
            <div key={crop.id} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '180px', position: 'relative' }}>
                <img
                  src={crop.images && crop.images[0] ? crop.images[0] : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600'}
                  alt={crop.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                  {crop.isOrganic && (
                    <span className="badge badge-success">
                      <Sparkles size={11} /> Organic
                    </span>
                  )}
                  <span className="badge badge-neutral">{crop.qualityGrade}</span>
                </div>
              </div>

              <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-600)', textTransform: 'uppercase' }}>
                  {crop.category} • {crop.variety}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{crop.title}</h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{crop.pricePerUnit} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ {crop.unit}</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Available</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#059669' }}>{Number(crop.quantity).toLocaleString()} {crop.unit}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <Link to={`/crops/${crop.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                    <Eye size={14} /> Preview
                  </Link>
                  <button
                    onClick={() => handleDelete(crop.id)}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '6px 10px' }}
                    title="Delete Listing"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
