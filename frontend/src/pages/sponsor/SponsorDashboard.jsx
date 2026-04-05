import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './SponsorDashboard.css';

const SponsorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cards = [
    {
      icon: '🗓️',
      title: 'My Events',
      desc: 'View and manage all your created events',
      action: () => {},
      label: 'View Events',
      color: '#6366f1'
    },
    {
      icon: '✨',
      title: 'Create Event',
      desc: 'Launch a new event and start planning',
      action: () => {},
      label: 'Create New',
      color: '#8b5cf6'
    },
    {
      icon: '💎',
      title: 'Sponsorship Portal',
      desc: 'Explore packages and become a sponsor',
      action: () => navigate('/sponsor/packages'),
      label: 'Explore Packages',
      color: '#a78bfa',
      highlight: true
    },
    {
      icon: '🔍',
      title: 'Browse Events',
      desc: 'Discover and join upcoming events',
      action: () => {},
      label: 'Browse',
      color: '#60a5fa'
    }
  ];

  return (
    <div className="dash-page">
      <div className="dash-bg">
        <div className="dash-orb dash-orb-1"></div>
        <div className="dash-orb dash-orb-2"></div>
        <div className="dash-orb dash-orb-3"></div>
      </div>

      <nav className="dash-nav">
        <div className="dash-nav-brand">
          <span className="dash-brand-icon">✦</span>
          <span className="dash-brand-name">EventHub</span>
        </div>
        <div className="dash-nav-right">
          <div className="dash-user-pill">
            <div className="dash-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <span className="dash-user-name">{user?.name}</span>
          </div>
          <button className="dash-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dash-container">
        <div className="dash-welcome">
          <div className="dash-welcome-text">
            <div className="dash-greeting">Good day,</div>
            <h1 className="dash-welcome-name">{user?.name} <span className="dash-wave">👋</span></h1>
            <p className="dash-welcome-sub">Welcome to your event management dashboard. What would you like to do today?</p>
          </div>
          <div className="dash-stats-row">
            <div className="dash-stat-chip">
              <span className="dash-stat-icon">🎫</span>
              <span className="dash-stat-label">Events</span>
              <span className="dash-stat-val">0</span>
            </div>
            <div className="dash-stat-chip">
              <span className="dash-stat-icon">💼</span>
              <span className="dash-stat-label">Sponsors</span>
              <span className="dash-stat-val">0</span>
            </div>
            <div className="dash-stat-chip">
              <span className="dash-stat-icon">🏅</span>
              <span className="dash-stat-label">Role</span>
              <span className="dash-stat-val dash-role-badge">{user?.role}</span>
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
            <span className="dash-info-text">Account verified and secured</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorDashboard;
