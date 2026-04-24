import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './AdminProfile.css';

const AdminProfile = () => {
    const { updateUser } = useAuth();
    const [user, setUser] = useState({ name: '', email: '', phone: '', role: '', avatar: '' });
    const [stats, setStats] = useState({ totalEvents: 0, totalAttendees: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', phone: '', password: '', avatar: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const localUser = JSON.parse(localStorage.getItem('user'));
            const header = { headers: { Authorization: `Bearer ${localUser?.token}` } };
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';

            // Fetch generic profile info
            const profileRes = await axios.get(`${apiUrl}/api/auth/profile`, header);
            setUser(profileRes.data);
            setEditForm({ name: profileRes.data.name, phone: profileRes.data.phone || '', password: '', avatar: profileRes.data.avatar || '' });

            // Fetch events to calculate stats
            const eventsRes = await axios.get(`${apiUrl}/api/events/admin/all`, header);
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
            setIsEditing(true);
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
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';

            const payload = { name: editForm.name, phone: editForm.phone, avatar: editForm.avatar };
            if (editForm.password) payload.password = editForm.password;

            const res = await axios.put(`${apiUrl}/api/auth/profile`, payload, header);
            
            // Instantly sync overarching React state!
            updateUser({
                ...res.data,
                token: localUser.token
            });
            
            setUser(res.data);
            setIsEditing(false);
            setEditForm({ ...editForm, password: '' }); // clear password
            setMessage({ type: 'success', text: 'Profile updated successfully!' });

        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        }
    };

    if (loading) return <div className="loading-state">Loading Profile...</div>;

    const displayRole = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Admin';

    const currentAvatar = isEditing ? editForm.avatar : user.avatar;

    return (
        <div className="profile-page animation-fade-in">
            <h1 className="page-main-title">Profile Settings</h1>
            <p className="page-main-subtitle">Manage your account details and view your admin footprint.</p>

            {message.text && (
                <div className={`message-banner ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="profile-grid">
                {/* Left Column: Avatar & Stats */}
                <div className="profile-left">
                    <div className="glass-panel profile-card text-center" style={{ marginTop: 0 }}>
                        <div className="profile-avatar-large" style={{ overflow: 'hidden', padding: currentAvatar ? 0 : '', background: currentAvatar ? 'none' : 'var(--primary-gradient)' }}>
                            {currentAvatar ? (
                                <img src={currentAvatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                user.name.charAt(0)
                            )}
                        </div>
                        <h2>{user.name}</h2>
                        <span className="badge-role">{displayRole}</span>
                        <p className="profile-email">{user.email}</p>
                    </div>

                    <div className="glass-panel stats-card">
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

                {/* Right Column: Edit Settings */}
                <div className="profile-right glass-panel">
                    <div className="card-header-flex">
                        <h2>Account Details</h2>
                        <button className="btn-sm-outline" onClick={() => setIsEditing(!isEditing)}>
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>
                    
                    <form onSubmit={handleUpdate} className={`profile-form ${!isEditing ? 'readonly' : ''}`}>
                        <div className="avatar-section" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div className="avatar-actions" style={{ display: 'flex', gap: '1rem' }}>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    style={{ display: 'none' }} 
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                />
                                <button 
                                    type="button" 
                                    className="btn-sm-primary"
                                    onClick={() => fileInputRef.current.click()}
                                    style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, background: 'var(--primary-gradient)', color: '#fff', border: 'none' }}
                                >
                                    Upload Photo
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleRemovePhoto}
                                    style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, background: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                value={isEditing ? editForm.name : user.name} 
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                readOnly={!isEditing}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input 
                                type="tel" 
                                value={isEditing ? editForm.phone : (user.phone || '')} 
                                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                readOnly={!isEditing}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                value={user.email} 
                                readOnly={true} 
                                className="disabled-input"
                                title="Email cannot be changed"
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
                            <div className="form-actions">
                                <button type="submit" className="save-btn">Save Changes</button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
