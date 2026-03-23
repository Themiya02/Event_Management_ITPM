import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Artists.css';

const Artists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="loading-spinner">Loading Artists...</div>;

  return (
    <div className="public-artists-container">
      <header className="hero-section">
        <h1 className="hero-title text-gradient">Featured Artists</h1>
        <p className="hero-subtitle">Discover the incredible talent performing at our events.</p>
      </header>

      <div className="artists-grid">
        {artists.length === 0 ? (
          <p className="no-events">No artists currently available.</p>
        ) : (
          artists.map(artist => (
            <div key={artist._id} className="artist-card glass-panel">
              <div className="artist-image-container">
                <img src={`${import.meta.env.VITE_API_URL}/pages/images/${artist.image}`} alt={artist.name} className="artist-photo" />
              </div>
              <div className="artist-info">
                 <h3 className="artist-name">{artist.name}</h3>
                 <p className="artist-contact">Contact: {artist.contactNumber}</p>
                 <div className="artist-songs">
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

export default Artists;
