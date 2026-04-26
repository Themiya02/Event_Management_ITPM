import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import FoodStallLayout from '../../components/layout/FoodStallLayout';
import Swal from 'sweetalert2';
import '../admin/AdminProfile.css';

const FoodProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: 'food_stall'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'food_stall'
      });
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <FoodStallLayout>
      <div className="admin-profile-container">
        <div className="profile-header-card glass-panel">
          <div className="profile-avatar-large">
            {profile.name?.charAt(0)?.toUpperCase() || 'V'}
          </div>
          <div className="profile-header-info">
            <h1>{profile.name}</h1>
            <span className="profile-role-badge">Food Stall Vendor</span>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="profile-card glass-panel">
            <h3>Personal Information</h3>
            <div className="info-group">
              <label>Full Name</label>
              <p>{profile.name}</p>
            </div>
            <div className="info-group">
              <label>Email Address</label>
              <p>{profile.email}</p>
            </div>
          </div>

          <div className="profile-card glass-panel">
            <h3>Account Settings</h3>
            <div className="info-group">
              <label>User Role</label>
              <p style={{ textTransform: 'capitalize' }}>{profile.role?.replace('_', ' ')}</p>
            </div>
            <button className="edit-profile-btn" onClick={() => Swal.fire('Info', 'Profile editing is handled by Admin.', 'info')}>
              Request Edit
            </button>
          </div>
        </div>
      </div>
    </FoodStallLayout>
  );
};

export default FoodProfile;
