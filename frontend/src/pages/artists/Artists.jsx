import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Artists.css';

const Artists = () => {
  const { user } = useAuth();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [aiLoading, setAiLoading] = useState(false);
  const [aiArtist, setAiArtist] = useState(null);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const { data } = await axios.get(`${apiUrl}/api/artists`);
        setArtists(data);
      } catch (error) {
        console.error('Failed to fetch artists:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const getRatingUserId = (ratingItem) => {
    if (!ratingItem?.user) return null;
    return typeof ratingItem.user === 'string' ? ratingItem.user : ratingItem.user._id;
  };

  const handleRate = async (artistId, ratingValue) => {
    if (!user) {
        alert('Please login to rate artists.');
        return;
    }
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = JSON.parse(localStorage.getItem('user'))?.token || user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${apiUrl}/api/artists/${artistId}/rate`, { rating: ratingValue }, config);
      
      // Update local state for better UX
      setArtists(prev => prev.map(a => {
        if (a._id === artistId) {
            const existingRatingIndex = (a.ratings || []).findIndex(
              (r) => getRatingUserId(r) === user?._id
            );
            let updatedRatings = [...(a.ratings || [])];
            if (existingRatingIndex >= 0) {
                updatedRatings[existingRatingIndex].val = ratingValue;
            } else {
                updatedRatings.push({ user: user._id, val: ratingValue });
            }
            const avg = updatedRatings.reduce((acc, curr) => acc + curr.val, 0) / updatedRatings.length;
            return { ...a, ratings: updatedRatings, averageRating: avg };
        }
        return a;
      }));
    } catch (error) {
      console.error('Error rating artist:', error);
      alert('Failed to submit rating.');
    }
  };

  const handleAiSearch = async () => {
    if (!searchQuery) return;
    setAiLoading(true);
    setAiError('');
    setAiArtist(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = JSON.parse(localStorage.getItem('user'))?.token || user?.token;
      const { data } = await axios.get(
        `${apiUrl}/api/artists/ai-search?name=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setAiArtist(data);
    } catch (error) {
      console.error('AI search failed:', error);
      setAiError(error.response?.data?.details || error.response?.data?.message || 'AI search failed.');
    } finally {
      setAiLoading(false);
    }
  };

  const filteredArtists = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return artists;
    return artists.filter((artist) => {
      const name = String(artist?.name ?? artist?.artistName ?? '').toLowerCase();
      const songs = (artist?.songs || []).join(' ').toLowerCase();
      return name.includes(q) || songs.includes(q);
    });
  }, [artists, searchQuery]);

  const canViewContact = user?.role === 'admin' || user?.role === 'organizer';

  if (loading) return <div className="loading-spinner">Loading Artists...</div>;

  return (
    <div className="public-artists-container">
      <header className="hero-section">
        <h1 className="hero-title text-gradient">Artists</h1>
        <p className="hero-subtitle">Discover the incredible talent performing at our events.</p>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
          <div className="search-container-page">
            <svg className="search-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by artist name or songs..."
              className="search-input-field"
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>×</button>
            )}
          </div>
        </div>
      </header>

      <div className="artists-grid">
        {filteredArtists.length === 0 ? (
          <p className="no-events">{searchQuery ? 'No artists match your search.' : 'No artists currently available.'}</p>
        ) : (
          filteredArtists.map(artist => (
            <div key={artist._id} className="artist-card glass-panel">
              <div className="artist-image-container">
                <img src={`${import.meta.env.VITE_API_URL}/pages/images/${artist.image}`} alt={artist.name} className="artist-photo" loading="lazy" />
              </div>
              <div className="artist-info">
                 <h3 className="artist-name">{artist.name ?? artist.artistName}</h3>
                 
                 {/* Role based detail: contact number */}
                 {canViewContact && (
                   <div className="contact-info">
                     <p className="contact-label">Contact Details:</p>
                     <p className="contact-value">📞 {artist.contactNumber || 'N/A'}</p>
                   </div>
                 )}

                 {/* Ratings Overview for everyone */}
                 <div className="rating-summary">
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span className="rating-label">Avg Rating: <b>⭐ {(artist.averageRating || 0).toFixed(1)} / 5</b></span>
                     {user && user.role === 'user' && (
                        <div className="stars-mini-row" style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map((star) => {
                             const userRatingObj = artist.ratings?.find(
                              (r) => getRatingUserId(r) === user?._id
                             );
                             const userRatingVal = userRatingObj ? userRatingObj.val : 0;
                             const isRated = star <= userRatingVal;
                             return (
                               <span 
                                 key={star} 
                                 className={`star-mini ${isRated ? 'gold' : 'gray'}`}
                                 onClick={() => handleRate(artist._id, star)}
                                 style={{ cursor: 'pointer', fontSize: '1.2rem', color: isRated ? '#FFD700' : '#4b5563' }}
                               >
                                 ★
                               </span>
                             );
                          })}
                        </div>
                     )}
                   </div>
                 </div>

                 <div className="artist-songs">
                    <h4>Popular Tracks</h4>
                    <div className="artist-songs-preview">
                      {(artist.songs || []).length ? artist.songs.join(', ') : 'No tracks listed.'}
                    </div>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Internal AI Search Results */}
      {searchQuery && filteredArtists.length === 0 && user?.role === 'organizer' && (
        <div className="ai-search-view" style={{ textAlign: 'center', marginTop: '60px', padding: '0 20px 40px' }}>
          <div className="ai-search-panel" style={{ 
            display: 'inline-block', 
            padding: '40px', 
            maxWidth: '800px', 
            width: '100%', 
            background: 'linear-gradient(145deg, #1e1e2f 0%, #2a2a40 100%)', 
            borderRadius: '24px',
            border: '1px solid rgba(99, 102, 241, 0.5)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            color: '#ffffff'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px', textShadow: '0 0 20px rgba(99, 102, 241, 0.5)' }}>🤖</div>
            <h3 style={{ color: '#a855f7', marginBottom: '15px', fontSize: '2.2rem', fontWeight: '800' }}>Artist Not Found Locally</h3>
            <p style={{ color: '#cbd5e1', marginBottom: '35px', fontSize: '1.15rem', lineHeight: '1.6' }}>
               As an organizer, you can use our <b style={{color: '#fff'}}>AI Assistant</b> to retrieve details for "{searchQuery}" automatically.
            </p>
            
            <button 
              onClick={handleAiSearch} 
              disabled={aiLoading}
              className="view-btn"
              style={{ 
                background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
                color: '#fff',
                border: 'none', 
                cursor: 'pointer',
                padding: '16px 45px',
                fontSize: '1.15rem',
                fontWeight: 'bold',
                borderRadius: '50px',
                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
                transition: 'all 0.3s ease',
                letterSpacing: '0.5px'
              }}
            >
              {aiLoading ? '✨ AI is searching...' : '✨ Find with AI Assistant'}
            </button>

            {aiError && (
              <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <p style={{ color: '#fca5a5', margin: 0, fontWeight: 'bold' }}>{aiError}</p>
                <p style={{ color: '#f87171', fontSize: '0.9rem', marginTop: '5px' }}>Please ensure the API key is valid and backend is running.</p>
              </div>
            )}

            {aiArtist && (
              <div className="ai-detail-section" style={{ marginTop: '40px', textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                   <h2 style={{ color: '#ffffff', fontSize: '2.5rem', margin: 0, fontWeight: '800', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{aiArtist.name}</h2>
                   <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>✓ AI VERIFIED</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                  <div className="detail-box" style={{ background: 'rgba(255,255,255,0.08)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                    <h4 style={{ color: '#a855f7', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', marginBottom: '15px', fontWeight: 'bold' }}>📞 Contact Details</h4>
                    <p style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: '700', margin: 0, letterSpacing: '1px' }}>{aiArtist.contactNumber}</p>
                  </div>

                  <div className="detail-box" style={{ background: 'rgba(255,255,255,0.08)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                    <h4 style={{ color: '#a855f7', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', marginBottom: '15px', fontWeight: 'bold' }}>🎵 Top Tracks</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {aiArtist.songs?.map((song, idx) => (
                        <li key={idx} style={{ color: '#e2e8f0', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.05rem' }}>
                           <span style={{ color: '#6366f1', fontSize: '0.8rem' }}>▶</span> {song}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {aiArtist.description && (
                   <div style={{ marginTop: '25px', padding: '25px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '20px', border: '1px dashed rgba(99, 102, 241, 0.4)' }}>
                      <p style={{ color: '#cbd5e1', lineHeight: '1.8', margin: 0, fontStyle: 'italic', fontSize: '1.05rem' }}>
                        "{aiArtist.description}"
                      </p>
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Artists;
