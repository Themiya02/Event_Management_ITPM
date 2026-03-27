import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../artists/Artists.css';

const AdminArtistsView = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

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
      const contact = String(artist?.contactNumber ?? '').toLowerCase();
      const songs = (artist?.songs || []).join(' ').toLowerCase();
      return name.includes(q) || contact.includes(q) || songs.includes(q);
    });
  }, [artists, searchQuery]);

  if (loading) return <div className="loading-spinner">Loading Artists...</div>;

  return (
    <div className="public-artists-container">
      <header className="hero-section" style={{ marginBottom: '30px' }}>
        <h1 className="hero-title text-gradient">Artists</h1>
        <p className="hero-subtitle">Full artist details and rating summary.</p>

      </header>

      <div className="artists-grid" style={{ marginTop: '20px' }}>
        {filteredArtists.length === 0 ? (
          <p className="no-events">{searchQuery ? 'No artists match your search.' : 'No artists currently available.'}</p>
        ) : (
          filteredArtists.map((artist) => {
            const avg = Number(artist?.averageRating || 0);
            const votes = artist?.ratings?.length || 0;
            return (
              <div key={artist._id} className="artist-card glass-panel">
                <div className="artist-image-container">
                  <img
                    src={`${import.meta.env.VITE_API_URL}/pages/images/${artist.image}`}
                    alt={artist.name}
                    className="artist-photo"
                  />
                </div>
                <div className="artist-info">
                  <h3 className="artist-name">{artist.name}</h3>
                  <p className="artist-contact">Contact: {artist.contactNumber}</p>

                  <div style={{ marginTop: '10px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Avg Rating</span>
                      <b style={{ color: 'var(--text-main)' }}>{avg.toFixed(2)} / 5</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Votes</span>
                      <b style={{ color: 'var(--text-main)' }}>{votes}</b>
                    </div>
                  </div>

                  <div className="artist-songs" style={{ marginTop: '15px' }}>
                    <h4>Tracks</h4>
                    <div className="artist-songs-preview">
                      {(artist.songs || []).length ? artist.songs.join(', ') : 'No songs listed.'}
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

export default AdminArtistsView;
