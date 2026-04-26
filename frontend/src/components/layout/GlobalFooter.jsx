import React from 'react';
import { useLocation } from 'react-router-dom';
import './GlobalFooter.css';

const GlobalFooter = () => {
  const location = useLocation();
  
  // Explicitly hide footer on My Tickets page as requested
  if (location.pathname === '/user/tickets' || location.pathname.startsWith('/user/tickets/')) {
    return null;
  }

  return (
    <footer className="global-footer glass-panel">
      <div className="footer-content">
        <div className="footer-left">
          <h2 className="footer-brand text-gradient">Eventio</h2>
          <p className="footer-tagline">Making your campus events unforgettable.</p>
          
          <div className="social-links">
            <a href="#" className="social-icon" aria-label="Facebook">📘</a>
            <a href="#" className="social-icon" aria-label="Twitter">🐦</a>
            <a href="#" className="social-icon" aria-label="Instagram">📸</a>
            <a href="#" className="social-icon" aria-label="LinkedIn">💼</a>
          </div>
        </div>

        <div className="footer-right">
          <h3 className="footer-heading">SLIIT Faculties</h3>
          <ul className="faculty-list">
            <li>Faculty of Computing</li>
            <li>Faculty of Business</li>
            <li>Faculty of Engineering</li>
            <li>Faculty of Humanities & Sciences</li>
            <li>School of Architecture</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Eventio - SLIIT. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default GlobalFooter;
