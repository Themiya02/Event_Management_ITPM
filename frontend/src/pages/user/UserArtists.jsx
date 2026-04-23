import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import '../artists/Artists.css';
import './UserView.css';
import { useAuth } from '../../context/AuthContext';

const UserArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const { user } = useAuth();
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiArtist, setAiArtist] = useState(null);
  const [aiError, setAiError] = useState('');

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

  const handleAiSearch = async () => {
    if (!searchQuery) return;
    setAiLoading(true);
    setAiError('');
    setAiArtist(null);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/artists/ai-search?name=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      setAiArtist(data);
    } catch (error) {
      console.error('AI search failed:', error);
      setAiError(error.response?.data?.message || 'AI search failed. Please check your API key.');
    } finally {
      setAiLoading(false);
    }
  };

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

      {searchQuery && filteredArtists.length === 0 && user?.role === 'organizer' && (
        <div className="ai-search-section" style={{ textAlign: 'center', marginTop: '40px', padding: '20px' }}>
          <div className="glass-panel" style={{ display: 'inline-block', padding: '30px', maxWidth: '600px' }}>
            <h3 style={{ color: 'var(--accent-color)', marginBottom: '15px' }}>Can't find "{searchQuery}"?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              As an organizer, you can use our AI Assistant to find contact details and song information for this artist.
            </p>
            
            <button 
              onClick={handleAiSearch} 
              disabled={aiLoading}
              className="view-btn"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', cursor: 'pointer' }}
            >
              {aiLoading ? 'AI is searching...' : 'Search with AI Assistant'}
            </button>

            {aiError && (
              <p style={{ color: '#ff4d4d', marginTop: '15px', fontSize: '0.9rem' }}>{aiError}</p>
            )}

            {aiArtist && (
              <div className="ai-result-card" style={{ marginTop: '30px', textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                <h2 style={{ color: '#fff', marginBottom: '10px' }}>{aiArtist.name} <span style={{ fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.2)', padding: '2px 8px', borderRadius: '10px', color: '#818cf8' }}>AI Found</span></h2>
                <div style={{ marginBottom: '15px' }}>
                  <strong style={{ color: 'var(--accent-color)' }}>Contact Number: </strong>
                  <span style={{ color: '#fff' }}>{aiArtist.contactNumber}</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--accent-color)' }}>Top Songs:</strong>
                  <ul style={{ marginTop: '10px', color: '#ccc' }}>
                    {aiArtist.songs?.map((song, index) => (
                      <li key={index}>{song}</li>
                    ))}
                  </ul>
                </div>
                {aiArtist.description && (
                  <p style={{ marginTop: '15px', fontSize: '0.9rem', color: '#aaa', fontStyle: 'italic' }}>
                    {aiArtist.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserArtists;
