import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import FoodStallLayout from '../../components/layout/FoodStallLayout';
import { Icon } from '@iconify/react';
import Swal from 'sweetalert2';
import './FoodDashboard.css';

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

  if (loading) return <div className="food-loading">Loading Profile...</div>;

  return (
    <FoodStallLayout>
      <div className="food-vendor-dashboard profile-view animation-fade-in">
        <div className="page-header-block">
          <h1 className="page-main-title">Vendor Profile</h1>
          <p className="page-main-subtitle">Manage your account information and preferences.</p>
        </div>

        <div className="food-profile-hero glass-panel">
          <div className="profile-avatar-large">
            {profile.name?.charAt(0)?.toUpperCase() || 'V'}
            <div className="online-indicator"></div>
          </div>
          <div className="profile-header-info">
            <h1>{profile.name}</h1>
            <div className="badge-row">
              <span className="food-status-pill food-status-approved">Verified Vendor</span>
              <span className="profile-role-badge">Member since 2026</span>
            </div>
          </div>
        </div>

        <div className="food-stats-grid" style={{ marginTop: '2rem' }}>
          <div className="glass-panel food-stat-card profile-info-card">
            <div className="card-header">
              <Icon icon="solar:user-id-bold-duotone" />
              <h3>Personal Info</h3>
            </div>
            <div className="info-list">
              <div className="info-item">
                <label>Full Name</label>
                <p>{profile.name}</p>
              </div>
              <div className="info-item">
                <label>Email Address</label>
                <p>{profile.email}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel food-stat-card profile-info-card">
            <div className="card-header">
              <Icon icon="solar:settings-bold-duotone" />
              <h3>Account Settings</h3>
            </div>
            <div className="info-list">
              <div className="info-item">
                <label>Account Type</label>
                <p style={{ textTransform: 'capitalize' }}>{profile.role?.replace('_', ' ')}</p>
              </div>
              <div className="info-item">
                <label>Account Status</label>
                <p>Active</p>
              </div>
            </div>
            <button className="food-link-btn" style={{ marginTop: '1rem', width: '100%' }} onClick={() => Swal.fire('Info', 'Profile editing is handled by Admin.', 'info')}>
              Request Detail Update
            </button>
          </div>
        </div>
      </div>
    </FoodStallLayout>
  );
};

export default FoodProfile;
