import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SponsorDashboard.css';

const SponsorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });

  useEffect(() => {
    const fetchSponsorStats = async () => {
      try {
        const localUser = JSON.parse(localStorage.getItem('user'));
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const config = { headers: { Authorization: `Bearer ${localUser?.token}` } };
        const res = await axios.get(`${apiUrl}/api/sponsorship/my`, config);
        
        if (res.data.success) {
          const apps = res.data.sponsorships;
          setStats({
            total: apps.length,
            pending: apps.filter(a => a.status === 'pending_review' || a.status === 'pending_otp').length,
            approved: apps.filter(a => a.status === 'approved').length
          });
        }
      } catch (error) {
        console.error('Error fetching sponsor stats:', error);
      }
    };
    fetchSponsorStats();
  }, []);

  const cards = [
    {
      icon: '💎',
      title: 'Sponsorship Portal',
      desc: 'Explore packages and manage your applications',
      action: () => navigate('/sponsor/packages'),
      label: 'Explore Portal',
      color: '#a78bfa',
      highlight: true
    },
    {
      icon: '✨',
      title: 'Apply Sponsorship',
      desc: 'Partner with us for upcoming major events',
      action: () => navigate('/sponsor/apply'),
      label: 'Apply Now',
      color: '#8b5cf6'
    },
    {
      icon: '🔍',
      title: 'Browse Events',
      desc: 'Discover and join upcoming events',
      action: () => navigate('/home'),
      label: 'Browse',
      color: '#60a5fa'
    },
    {
      icon: '👤',
      title: 'My Profile',
      desc: 'Update your contact and company details',
      action: () => navigate('/sponsor/profile'),
      label: 'View Profile',
      color: '#6366f1'
    }
  ];

  return (
    <div className="dash-container">
      <div className="dash-welcome">
        <div className="dash-welcome-text">
          <div className="dash-greeting">Good day,</div>
          <h1 className="dash-welcome-name">{user?.name} <span className="dash-wave">👋</span></h1>
          <p className="dash-welcome-sub">Welcome to your sponsor dashboard. Partner with us to grow your brand visibility.</p>
        </div>
        <div className="dash-stats-row">
          <div className="dash-stat-chip">
            <span className="dash-stat-icon">📊</span>
            <span className="dash-stat-label">Applications</span>
            <span className="dash-stat-val">{stats.total}</span>
          </div>
          <div className="dash-stat-chip">
            <span className="dash-stat-icon">⏳</span>
            <span className="dash-stat-label">Pending</span>
            <span className="dash-stat-val">{stats.pending}</span>
          </div>
          <div className="dash-stat-chip">
            <span className="dash-stat-icon">✅</span>
            <span className="dash-stat-label">Approved</span>
            <span className="dash-stat-val">{stats.approved}</span>
          </div>
        </div>
      </div>

      <div className="dash-section-title">Quick Actions</div>

      <div className="dash-cards-grid">
        {cards.map((card, i) => (
          <div
            key={i}
            className={"dash-card" + (card.highlight ? " dash-card-highlight" : "")}
            style={{ '--card-color': card.color, animationDelay: (i * 0.08) + 's' }}
          >
            <div className="dash-card-glow"></div>
            <div className="dash-card-icon">{card.icon}</div>
            <h3 className="dash-card-title">{card.title}</h3>
            <p className="dash-card-desc">{card.desc}</p>
            <button
              className="dash-card-btn"
              onClick={card.action}
              style={{ background: 'linear-gradient(135deg, ' + card.color + 'cc, ' + card.color + '88)' }}
            >
              {card.label} →
            </button>
            {card.highlight && <div className="dash-card-badge">Featured</div>}
          </div>
        ))}
      </div>

      <div className="dash-info-bar">
        <div className="dash-info-item">
          <span className="dash-info-icon">📧</span>
          <span className="dash-info-text">{user?.email}</span>
        </div>
        <div className="dash-info-divider"></div>
        <div className="dash-info-item">
          <span className="dash-info-icon">🔐</span>
          <span className="dash-info-text">Sponsor Account Verified</span>
        </div>
      </div>
    </div>
  );
};

export default SponsorDashboard;
