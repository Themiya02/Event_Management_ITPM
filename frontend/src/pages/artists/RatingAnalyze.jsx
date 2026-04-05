import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import './Artists.css';

const RatingAnalyze = () => {
  const { user } = useAuth();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

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

  const filteredArtists = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return artists;
    return artists.filter((artist) => {
      const name = String(artist?.name ?? '').toLowerCase();
      const songs = (artist?.songs || []).join(' ').toLowerCase();
      return name.includes(q) || songs.includes(q);
    });
  }, [artists, searchQuery]);

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
        {filteredArtists.length === 0 ? (
          <p style={{textAlign: 'center', width: '100%'}}>{searchQuery ? 'No artists match your search.' : 'No artists found for analysis.'}</p>
        ) : (
          filteredArtists.map((artist, index) => {
            // Find the original index for ranking if needed, or just use filtered index
            const originalIndex = artists.findIndex(a => a._id === artist._id);
            return (
              <div key={artist._id} className="artist-card glass-panel" style={{ position: 'relative', overflow: 'visible', border: originalIndex === 0 ? '2px solid gold' : originalIndex === 1 ? '2px solid silver' : originalIndex === 2 ? '2px solid #cd7f32' : '1px solid var(--border-color)' }}>
                
                {/* Ranking Badge */}
                <div style={{
                    position: 'absolute', 
                    top: '-18px', 
                    left: '-18px', 
                    width: '48px', 
                    height: '48px',
                    background: originalIndex === 0 ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : 
                               originalIndex === 1 ? 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)' : 
                               originalIndex === 2 ? 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)' : 
                               'var(--primary-gradient)',
                    color: 'white', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: '800', 
                    fontSize: '1.25rem', 
                    boxShadow: '0 6px 15px rgba(0,0,0,0.3)', 
                    zIndex: '20',
                    border: '3px solid white'
                }}>
                  #{originalIndex + 1}
                </div>

              <div className="artist-image-container">
                <img src={`${import.meta.env.VITE_API_URL}/pages/images/${artist.image}`} alt={artist.name} className="artist-photo" loading="lazy" />
              </div>
              <div className="artist-info">
                 <h3 className="artist-name">{artist.name}</h3>
                 
                 <div style={{ marginTop: '10px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Score:</span>
                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: originalIndex === 0 ? 'gold' : 'var(--text-main)' }}>
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
          );
        })
      )}
      </div>
    </div>
  );
};

export default RatingAnalyze;
