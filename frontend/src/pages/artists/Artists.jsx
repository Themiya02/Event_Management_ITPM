import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Artists.css';

const Artists = () => {
  const { user } = useAuth();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/artists`);
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
      const token = JSON.parse(localStorage.getItem('user'))?.token || user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL}/api/artists/${artistId}/rate`, { rating: ratingValue }, config);
      
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
    </div>
  );
};

export default Artists;
