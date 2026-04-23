import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Sponsorship.css';

const PACKAGE_ICONS = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
  diamond: '💠'
};

const SponsorshipPackages = () => {
  const [packages, setPackages] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/sponsorship/packages`);
      setPackages(res.data.packages);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (key) => {
    setSelectedPackage(key);
  };

  const handleProceed = () => {
    if (selectedPackage) {
      navigate('/sponsor/apply', {
        state: { packageKey: selectedPackage, packageData: packages[selectedPackage] }
      });
    }
  };

  const packageOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

  if (loading) {
    return (
      <div className="sp-loading">
        <div className="sp-spinner"></div>
        <p>Loading packages...</p>
      </div>
    );
  }

  return (
    <div className="sp-page">
      {/* Animated background */}
      <div className="sp-bg">
        <div className="sp-orb sp-orb-1"></div>
        <div className="sp-orb sp-orb-2"></div>
        <div className="sp-orb sp-orb-3"></div>
      </div>

      <div className="sp-container">
        {/* Header */}
        <div className="sp-header">
          <button className="sp-back-btn" onClick={() => navigate('/sponsor/dashboard')}>
            ← Back to Dashboard
          </button>
          <div className="sp-badge">Become a Sponsor</div>
          <h1 className="sp-title">
            Choose Your <span className="sp-gradient-text">Sponsorship</span> Package
          </h1>
          <p className="sp-subtitle">
            Partner with us and amplify your brand at the most prestigious event of the year.
            Select a package that aligns with your goals and budget.
          </p>
        </div>

        {/* Package Cards */}
        <div className="sp-packages-grid">
          {packageOrder.map((key, index) => {
            const pkg = packages[key];
            if (!pkg) return null;
            const isSelected = selectedPackage === key;
            const isHighlight = pkg.highlight;

            return (
              <div
                key={key}
                className={`sp-package-card ${isSelected ? 'sp-card-selected' : ''} ${isHighlight ? 'sp-card-highlight' : ''}`}
                style={{ '--pkg-color': pkg.color, animationDelay: `${index * 0.1}s` }}
                onClick={() => handleSelectPackage(key)}
              >
                {isHighlight && (
                  <div className="sp-popular-badge">⭐ Most Popular</div>
                )}
                <div className="sp-card-icon">{PACKAGE_ICONS[key]}</div>
                <div className="sp-card-name" style={{ color: pkg.color }}>{pkg.name}</div>
                <div className="sp-card-price">
                  <span className="sp-currency">LKR</span>
                  <span className="sp-amount">{pkg.price.toLocaleString()}</span>
                </div>
                <p className="sp-card-desc">{pkg.description}</p>
                <div className="sp-divider"></div>
                <ul className="sp-benefits-list">
                  {pkg.benefits.map((b, i) => (
                    <li key={i} className="sp-benefit-item">
                      <span className="sp-check">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <div className={`sp-select-indicator ${isSelected ? 'sp-selected' : ''}`}>
                  {isSelected ? '✓ Selected' : 'Click to Select'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Proceed Button */}
        {selectedPackage && (
          <div className="sp-proceed-section">
            <div className="sp-selected-info">
              <span>{PACKAGE_ICONS[selectedPackage]}</span>
              <span>
                <strong>{packages[selectedPackage]?.name} Package</strong> selected —
                LKR {packages[selectedPackage]?.price.toLocaleString()}
              </span>
            </div>
            <button className="sp-proceed-btn" onClick={handleProceed}>
              Proceed to Application →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorshipPackages;
