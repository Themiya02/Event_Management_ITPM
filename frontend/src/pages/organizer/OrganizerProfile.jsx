import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './OrganizerProfile.css';

const OrganizerProfile = () => {
    const [user, setUser] = useState({ name: '', email: '', phone: '', role: '', organization: '', bio: '', avatar: '' });
    const [stats, setStats] = useState({ totalEvents: 0, totalAttendees: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', phone: '', password: '', organization: '', bio: '', avatar: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);
    
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const localUser = JSON.parse(localStorage.getItem('user'));
            const header = { headers: { Authorization: `Bearer ${localUser?.token}` } };
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            const profileRes = await axios.get(`${apiUrl}/api/auth/profile`, header);
            setUser(profileRes.data);
            setEditForm({ 
                name: profileRes.data.name || '', 
                phone: profileRes.data.phone || '', 
                password: '',
                organization: profileRes.data.organization || '',
                bio: profileRes.data.bio || '',
                avatar: profileRes.data.avatar || ''
            });

            const eventsRes = await axios.get(`${apiUrl}/api/events/organizer`, header);
            const events = eventsRes.data;
            setStats({
                totalEvents: events.length,
                totalAttendees: events.reduce((sum, ev) => sum + (ev.registrationsCount || 0), 0)
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile details' });
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsEditing(true); // Switch to editing mode automatically when changing photo
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditForm(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setIsEditing(true);
        setEditForm(prev => ({ ...prev, avatar: '' }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        
        try {
            const localUser = JSON.parse(localStorage.getItem('user'));
            const header = { headers: { Authorization: `Bearer ${localUser?.token}` } };
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            const payload = { 
                name: editForm.name, 
                phone: editForm.phone,
                organization: editForm.organization,
                bio: editForm.bio,
                avatar: editForm.avatar
            };
            
            if (editForm.password) payload.password = editForm.password;

            const res = await axios.put(`${apiUrl}/api/auth/profile`, payload, header);
            
            const updatedUser = { ...localUser, name: res.data.name, phone: res.data.phone };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            setUser(res.data);
            setIsEditing(false);
            setEditForm({ ...editForm, password: '' });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone and all your events will be lost.")) {
            try {
                const localUser = JSON.parse(localStorage.getItem('user'));
                const header = { headers: { Authorization: `Bearer ${localUser?.token}` } };
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                
                await axios.delete(`${apiUrl}/api/auth/profile`, header);
                
                localStorage.removeItem('user');
                navigate('/login');
            } catch (error) {
                setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete account' });
            }
        }
    };

    if (loading) return <div className="loading-state">Loading Profile...</div>;

    const currentAvatar = isEditing ? editForm.avatar : user.avatar;

    return (
        <div className="profile-page animation-fade-in">
            <h1 className="page-main-title">Profile Settings</h1>
            <p className="page-main-subtitle">Manage your account details and view your organizer footprint.</p>

            {message.text && (
                <div className={`message-banner ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="profile-grid">
                {/* Left Column: Stats overview only */}
                <div className="profile-left">
                    <div className="glass-panel stats-card" style={{ marginTop: 0 }}>
                        <h3>Your Event Footprint</h3>
                        <div className="stat-row">
                            <span>Total Events Hosted</span>
                            <strong>{stats.totalEvents}</strong>
                        </div>
                        <div className="stat-row">
                            <span>Total Attendees</span>
                            <strong>{stats.totalAttendees}</strong>
                        </div>
                    </div>
                </div>

                {/* Right Column: Profile Edit Area */}
                <div className="profile-right glass-panel">
                    <div className="card-header-flex">
                        <h2>Account Details</h2>
                        <button type="button" className="btn-sm-outline" onClick={() => setIsEditing(!isEditing)}>
                            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                        </button>
                    </div>
                    
                    <form onSubmit={handleUpdate} className={`profile-form ${!isEditing ? 'readonly' : ''}`}>
                        
                        {/* Avatar Upload UI matching screenshot */}
                        <div className="avatar-section">
                            <div className="avatar-display">
                                {currentAvatar ? (
                                    <img src={currentAvatar} alt="Profile" className="avatar-img" />
                                ) : (
                                    <div className="avatar-placeholder">{user.name.charAt(0)}</div>
                                )}
                            </div>
                            
                            <div className="avatar-actions">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    style={{ display: 'none' }} 
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                />
                                <button 
                                    type="button" 
                                    className="upload-btn"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    Upload New Photo
                                </button>
                                <button 
                                    type="button" 
                                    className="remove-btn"
                                    onClick={handleRemovePhoto}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Organization / Club Name</label>
                                <input 
                                    type="text" 
                                    value={isEditing ? editForm.organization : user.organization} 
                                    onChange={(e) => setEditForm({...editForm, organization: e.target.value})}
                                    readOnly={!isEditing}
                                    placeholder="e.g. Computing Society"
                                />
                            </div>

                            <div className="form-group">
                                <label>Administrator Name</label>
                                <input 
                                    type="text" 
                                    value={isEditing ? editForm.name : user.name} 
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    readOnly={!isEditing}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Support Email Address</label>
                                <input 
                                    type="email" 
                                    value={user.email} 
                                    readOnly={true} 
                                    className="disabled-input"
                                    title="Email cannot be changed"
                                />
                            </div>

                            <div className="form-group">
                                <label>Contact Phone</label>
                                <input 
                                    type="tel" 
                                    value={isEditing ? editForm.phone : (user.phone || '')} 
                                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                    readOnly={!isEditing}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <label>Brief Bio / Description</label>
                            <textarea 
                                value={isEditing ? editForm.bio : user.bio} 
                                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                readOnly={!isEditing}
                                rows={4}
                                placeholder="We are a university club dedicated to tech events."
                                className="bio-textarea"
                            />
                        </div>

                        {isEditing && (
                            <div className="form-group">
                                <label>New Password (leave blank to keep current)</label>
                                <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    value={editForm.password}
                                    onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                                    minLength={6}
                                />
                            </div>
                        )}

                        {isEditing && (
                            <div className="form-actions" style={{ marginTop: '2rem' }}>
                                <button type="submit" className="save-btn">Save Changes</button>
                            </div>
                        )}
                    </form>

                    {/* Danger Zone */}
                    <div className="danger-zone" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                        <h3 style={{ color: '#ef4444', margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Danger Zone</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button 
                            type="button" 
                            onClick={handleDeleteAccount} 
                            style={{ 
                                background: 'transparent',
                                border: '1px solid #ef4444', 
                                color: '#ef4444',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#ef4444';
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#ef4444';
                            }}
                        >
                            Delete Account
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OrganizerProfile;
