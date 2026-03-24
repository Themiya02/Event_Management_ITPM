import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './Artists.css';

const RatingAnalyze = () => {
  const { user } = useAuth();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/artists`);
      // Sort artists descending by averageRating
      const sorted = data.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      setArtists(sorted);
    } catch (error) {
      console.error('Failed to fetch artists:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'organizer')) {
    return <Navigate to="/" replace />;
  }

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px', color: 'var(--text-main)'}}>Loading Analysis...</div>;

  return (
    <div className="admin-artists-container">
      <div className="admin-header" style={{ marginBottom: '30px' }}>
        <h2>Artists Rating Analysis</h2>
        <p style={{ color: 'var(--text-muted)' }}>Ranked from highest to lowest community ratings</p>
      </div>

      <div className="artists-grid">
        {artists.length === 0 ? (
          <p style={{textAlign: 'center', width: '100%'}}>No artists found for analysis.</p>
        ) : (
          artists.map((artist, index) => (
            <div key={artist._id} className="artist-card glass-panel" style={{ position: 'relative', border: index === 0 ? '2px solid gold' : index === 1 ? '2px solid silver' : index === 2 ? '2px solid #cd7f32' : '1px solid var(--border-color)' }}>
              
              {/* Ranking Badge */}
              <div style={{
                  position: 'absolute', top: '-15px', left: '-15px', width: '40px', height: '40px',
                  background: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'var(--primary-color)',
                  color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', zIndex: '10'
              }}>
                #{index + 1}
              </div>

              <div className="artist-image-container">
                <img src={`${import.meta.env.VITE_API_URL}/pages/images/${artist.image}`} alt={artist.name} className="artist-photo" />
              </div>
              <div className="artist-info">
                 <h3 className="artist-name">{artist.name}</h3>
                 
                 <div style={{ marginTop: '10px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Score:</span>
                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: index === 0 ? 'gold' : 'var(--text-main)' }}>
                           {(artist.averageRating || 0).toFixed(2)} <span style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>/ 5.0</span>
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Total Votes:</span>
                        <span style={{ fontWeight: '600' }}>{artist.ratings?.length || 0}</span>
                    </div>
                 </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RatingAnalyze;
