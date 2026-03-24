import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../artists/Artists.css';
import './UserView.css';

const UserArtists = () => {
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

  const filteredArtists = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return artists;
    return artists.filter((artist) => {
      const name = String(artist?.name ?? '').toLowerCase();
      const songs = (artist?.songs || []).join(' ').toLowerCase();
      return name.includes(q) || songs.includes(q);
    });
  }, [artists, searchQuery]);

  if (loading) return <div className="loading-spinner" style={{ textAlign: 'center', marginTop: '50px' }}>Loading Artists...</div>;

  return (
    <div className="user-view-container">
      <div className="user-view-header">
        <h1 className="text-gradient">Artists</h1>
        <p className="subtitle">Browse artists and their tracks.</p>

        <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'center' }}>
          <Link
            to="/user/rating"
            className="view-btn"
            style={{ display: 'inline-block', padding: '10px 22px', fontSize: '1rem' }}
          >
            Rate Artists
          </Link>
        </div>

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
          <p style={{ textAlign: 'center', width: '100%', color: 'var(--text-muted)' }}>
            {searchQuery ? 'No artists match your search.' : 'No artists currently available.'}
          </p>
        ) : (
          filteredArtists.map((artist) => (
            <div key={artist._id} className="artist-card glass-panel" style={{ position: 'relative' }}>
              <div className="artist-image-container">
                <img
                  src={`${import.meta.env.VITE_API_URL}/pages/images/${artist.image}`}
                  alt={artist.name}
                  className="artist-photo"
                />
              </div>

              <div className="artist-info">
                <h3 className="artist-name">{artist.name}</h3>

                <div className="artist-songs" style={{ marginTop: '15px' }}>
                  <h4>Tracks</h4>
                  <div className="artist-songs-preview">
                    {(artist.songs || []).length ? artist.songs.join(', ') : 'No songs listed.'}
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

export default UserArtists;
