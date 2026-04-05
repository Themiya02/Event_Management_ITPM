import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Artists.css';

const AddArtists = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  // Shared Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtistId, setEditingArtistId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    songs: ['']
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/artists`);
      setArtists(data);
    } catch (error) {
      console.error('Failed to fetch artists:', error);
    }
  };

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

  const openAddModal = () => {
    setEditingArtistId(null);
    setFormData({ name: '', contactNumber: '', songs: [''] });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (artist) => {
    setEditingArtistId(artist._id);
    setFormData({
      name: artist.name,
      contactNumber: artist.contactNumber,
      songs: artist.songs.length ? artist.songs : ['']
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this artist?")) return;
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token || user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/artists/${id}`, config);
      fetchArtists();
    } catch (error) {
      console.error('Error deleting artist:', error);
      alert(error.response?.data?.message || 'Error deleting artist');
    }
  };

  const handleNameChange = (e) => {
    // Only allow letters and spaces
    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setFormData({ ...formData, name: val });
  };

  const handlePhoneChange = (e) => {
    // Only allow digits, max 10
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, contactNumber: val });
  };

  const handleSongChange = (index, value) => {
    const newSongs = [...formData.songs];
    newSongs[index] = value;
    setFormData({ ...formData, songs: newSongs });
  };

  const addSongField = () => {
    setFormData({ ...formData, songs: [...formData.songs, ''] });
  };

  const removeSongField = (index) => {
    const newSongs = formData.songs.filter((_, i) => i !== index);
    setFormData({ ...formData, songs: newSongs.length ? newSongs : [''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token || user?.token;
      if (!token) throw new Error("Authentication error");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      let filename = undefined;
      // Upload image if a new one is selected
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/artists/upload`, uploadData, config);
        filename = uploadRes.data.filename;
      }

      if (!filename && !editingArtistId) {
        alert("Please select an image");
        setLoading(false);
        return;
      }

      if (formData.contactNumber.length !== 10) {
        alert("Contact number must be exactly 10 digits.");
        setLoading(false);
        return;
      }

      const filteredSongs = formData.songs.filter(s => s.trim() !== '');
      const payload = {
        name: formData.name,
        contactNumber: formData.contactNumber,
        songs: filteredSongs
      };
      if (filename) payload.image = filename;

      if (editingArtistId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/artists/${editingArtistId}`, payload, config);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/artists`, payload, config);
      }

      setIsModalOpen(false);
      setEditingArtistId(null);
      setFormData({ name: '', contactNumber: '', songs: [''] });
      setImageFile(null);
      fetchArtists(); // refresh
    } catch (error) {
      console.error('Error saving artist:', error);
      alert(error.response?.data?.message || 'Error saving artist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-artists-container">
      <div className="admin-header">
        <h2>Artists Handling</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="add-btn"
            onClick={() => navigate('/artists/analyze')}
            style={{ background: 'var(--accent-teal)' }}
          >
            View Rating Analyze
          </button>
          <button className="add-btn" onClick={openAddModal}>+ Add Artist</button>
        </div>
      </div>

      <div className="artists-grid">
        {filteredArtists.length === 0 ? (
          <p style={{textAlign: 'center', width: '100%'}}>{searchQuery ? 'No artists match your search.' : 'No artists found.'}</p>
        ) : (
          filteredArtists.map(artist => (
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
                 <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => openEditModal(artist)} 
                      style={{ flex: 1, padding: '8px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(artist._id)} 
                      style={{ flex: 1, padding: '8px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                      Delete
                    </button>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            <h3>{editingArtistId ? 'Edit Artist' : 'Add New Artist'}</h3>
            <form onSubmit={handleSubmit} className="artist-form">
              <div className="form-group">
                <label>Artist Name <span style={{color: 'red'}}>*</span></label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={handleNameChange} 
                  placeholder=" "
                  required 
                />
              </div>

              <div className="form-group">
                <label>Contact Number (10 Digits) <span style={{color: 'red'}}>*</span></label>
                <input 
                  type="text" 
                  value={formData.contactNumber} 
                  onChange={handlePhoneChange} 
                  pattern="\d{10}" 
                  title="Mobile number must exactly be 10 digits" 
                  placeholder=" " 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Image <span style={{color: 'red'}}>*</span></label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setImageFile(e.target.files[0])} 
                  required={!editingArtistId} 
                />
                {editingArtistId && <small style={{color: 'var(--text-muted)'}}>Leave empty to keep current image.</small>}
              </div>

              <div className="form-group">
                <label>Songs</label>
                {formData.songs.map((song, idx) => (
                  <div key={idx} className="song-input-row">
                    <input type="text" value={song} onChange={e => handleSongChange(idx, e.target.value)} placeholder="Song name" />
                    <button type="button" className="remove-song-btn" onClick={() => removeSongField(idx)}>Remove</button>
                  </div>
                ))}
                <button type="button" className="add-song-btn" onClick={addSongField}>+ Add Another Song</button>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Artist'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddArtists;
