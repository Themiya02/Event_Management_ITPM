import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../artists/Artists.css'; // Reuse existing glassmorphism logic
import './UserView.css';

const UserView = () => {
  const { user } = useAuth();
  const [artists, setArtists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtists();
  }, []);

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

  const handleRate = async (artistId, ratingValue) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token || user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL}/api/artists/${artistId}/rate`, { rating: ratingValue }, config);
      
      // Update local state without full refetch for better UX
      setArtists(prev => prev.map(a => {
        if (a._id === artistId) {
            const existingRatingIndex = a.ratings.findIndex(r => r.user === user._id);
            let updatedRatings = [...a.ratings];
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

  const filteredArtists = artists.filter(artist => 
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    artist.songs.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <div className="loading-spinner" style={{textAlign: 'center', marginTop: '50px'}}>Loading Artists...</div>;

  return (
    <div className="user-view-container">
      <div className="user-view-header">
        <h1 className="text-gradient">Explore Artists</h1>
        <p className="subtitle">Discover artists and rate your favorites!</p>
        
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search by artist name or songs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="artist-search-bar"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="artists-grid">
        {filteredArtists.length === 0 ? (
          <p style={{textAlign: 'center', width: '100%', color: 'var(--text-muted)'}}>No artists match your search.</p>
        ) : (
          filteredArtists.map(artist => (
            <div key={artist._id} className="artist-card glass-panel" style={{position: 'relative'}}>
              <div className="artist-image-container">
                <img src={`${import.meta.env.VITE_API_URL}/pages/images/${artist.image}`} alt={artist.name} className="artist-photo" />
              </div>
              
              <div className="artist-info">
                 <h3 className="artist-name">{artist.name}</h3>
                 
                 {/* NO CONTACT NUMBER SHOWN HERE AS PER USER REQUEST */}
                 
                 <div className="artist-rating-section">
                   <p className="rating-text">Avg Rating: {artist.averageRating ? artist.averageRating.toFixed(1) : '0.0'} / 5.0</p>
                   <div className="stars-container">
                     {[1, 2, 3, 4, 5].map((star) => {
                       // Find if the current user already rated this to highlight their rating? 
                       // For simplicity, just show average as gold stars, or let them click to set.
                       const isRated = star <= Math.round(artist.averageRating || 0);
                       return (
                         <span 
                           key={star} 
                           className={`star ${isRated ? 'gold' : 'gray'}`}
                           onClick={() => handleRate(artist._id, star)}
                           title={`Rate ${star} stars`}
                         >
                           ★
                         </span>
                       );
                     })}
                   </div>
                 </div>

                 <div className="artist-songs" style={{marginTop: '15px'}}>
                    <h4>Popular Tracks</h4>
                    <div className="artist-songs-preview">
                       {artist.songs.join(', ')}
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

export default UserView;
