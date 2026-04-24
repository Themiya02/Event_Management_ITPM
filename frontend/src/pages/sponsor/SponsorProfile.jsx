import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './SponsorProfile.css';

const SponsorProfile = () => {
    const { user: authUser, updateUser } = useAuth();
    const [user, setUser] = useState({ name: '', email: '', phone: '', role: '', avatar: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', phone: '', password: '', avatar: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);

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
                name: profileRes.data.name, 
                phone: profileRes.data.phone || '', 
                password: '', 
                avatar: profileRes.data.avatar || '' 
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile details' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        
        try {
            const localUser = JSON.parse(localStorage.getItem('user'));
            const header = { headers: { Authorization: `Bearer ${localUser?.token}` } };
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            const payload = { name: editForm.name, phone: editForm.phone, avatar: editForm.avatar };
            if (editForm.password) payload.password = editForm.password;

            const res = await axios.put(`${apiUrl}/api/auth/profile`, payload, header);
            
            updateUser({
                ...res.data,
                token: localUser.token
            });
            
            setUser(res.data);
            setIsEditing(false);
            setEditForm({ ...editForm, password: '' });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });

        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        }
    };

    if (loading) return <div className="loading-state">Loading Profile...</div>;

    return (
        <div className="profile-page">
            <div className="profile-header-section">
                <h1>Sponsor Profile</h1>
                <p>Manage your sponsor account details and preferences.</p>
            </div>

            {message.text && (
                <div className={`message-banner ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="profile-container-glass">
                <div className="profile-sidebar">
                    <div className="avatar-large">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Profile" />
                        ) : (
                            user.name.charAt(0).toUpperCase()
                        )}
                    </div>
                    <h2>{user.name}</h2>
                    <span className="role-tag">Sponsor</span>
                    <p className="email-text">{user.email}</p>
                </div>

                <div className="profile-main-content">
                    <div className="content-header">
                        <h2>Account Settings</h2>
                        <button className="edit-toggle-btn" onClick={() => setIsEditing(!isEditing)}>
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    <form onSubmit={handleUpdate} className={`profile-form ${!isEditing ? 'readonly' : ''}`}>
                        <div className="form-grid">
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
                                />
                            </div>

                            {isEditing && (
                                <div className="form-group">
                                    <label>New Password (optional)</label>
                                    <input 
                                        type="password" 
                                        placeholder="••••••••"
                                        value={editForm.password}
                                        onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                                        minLength={6}
                                    />
                                </div>
                            )}
                        </div>

                        {isEditing && (
                            <div className="form-footer">
                                <button type="submit" className="save-btn">Save Changes</button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SponsorProfile;
