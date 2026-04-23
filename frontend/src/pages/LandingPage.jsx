import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="logo-icon-small"></div>
          <h2>EVENTIO</h2>
        </div>
        <div className="landing-nav-links">
          <Link to="/">HOME</Link>
          <a href="#about">ABOUT</a>
          <a href="#artists">ARTISTS</a>
          <a href="#contact">CONTACT</a>
        </div>
        <div className="landing-auth-buttons">
          {user ? (
            <Link to={`/${user.role === 'admin' ? 'admin' : user.role === 'organizer' ? 'organizer' : 'dashboard'}${user.role === 'admin' || user.role === 'organizer' ? '/dashboard' : ''}`} className="btn-register">GO TO DASHBOARD</Link>
          ) : (
            <>
              <Link to="/login" className="btn-signin">SIGN IN</Link>
              <Link to="/register" className="btn-register">REGISTER NOW</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        {/* Abstract shapes for decoration like the reference image */}
        <div className="abstract-shape shape-1"></div>
        <div className="abstract-shape shape-2"></div>
        
        <div className="hero-content">
          <h1 className="hero-title">
            DISCOVER AMAZING EVENTS<br/>
            <span className="text-gradient-purple">AT SLIIT CAMPUS</span>
          </h1>
          <p className="hero-subtitle">
            Experience University Life Like Never Before. Join the ultimate platform for all campus events, festivals, and artist performances.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn-primary-large">GET STARTED</Link>
          </div>
        </div>
        <div className="scroll-indicator">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="landing-about">
        <h2 className="section-heading">ABOUT EVENTIO</h2>
        <p className="section-subheading">E X P E R I E N C E  &nbsp; C A M P U S &nbsp; L I F E</p>
        <p className="about-text">
          Eventio is the premier event management platform dedicated to SLIIT. Whether it's a massive music festival, an academic conference, or a student meetup, we bring everything into one place. Register now to book tickets, track your favorite artists, and never miss out on campus memories.
        </p>
      </section>

      {/* Artists Section */}
      <section id="artists" className="landing-artists">
        <h2 className="section-heading">MEET OUR ARTISTS</h2>
        <p className="section-subheading">S H O W C A S I N G  &nbsp; T O P  &nbsp; T A L E N T S</p>
        
        <div className="artists-grid">
          <div className="artist-card">
            <img src="https://loremflickr.com/400/400/singer" alt="Artist 1" />
            <div className="artist-info">
              <h3>BROWN</h3>
              <p>Lead Vocalist</p>
            </div>
          </div>
          <div className="artist-card">
            <img src="https://loremflickr.com/400/400/guitarist" alt="Artist 2" />
            <div className="artist-info">
              <h3>ALLEN</h3>
              <p>Guitarist</p>
            </div>
          </div>
          <div className="artist-card">
            <img src="https://loremflickr.com/400/400/dj" alt="Artist 3" />
            <div className="artist-info">
              <h3>COLLIN</h3>
              <p>DJ & Producer</p>
            </div>
          </div>
          <div className="artist-card">
            <img src="https://loremflickr.com/400/400/pianist" alt="Artist 4" />
            <div className="artist-info">
              <h3>SARAH</h3>
              <p>Pianist</p>
            </div>
          </div>
        </div>
      </section>

      {/* Past Events Section */}
      <section className="landing-events">
        <h2 className="section-heading" style={{ color: '#fff' }}>EVENT HIGHLIGHTS</h2>
        <p className="section-subheading" style={{ color: 'rgba(255,255,255,0.7)' }}>P A S T  &nbsp; M E M O R I E S</p>
        
        <div className="events-grid">
          <div className="event-photo">
            <img src="https://loremflickr.com/800/400/concert" alt="Event 1" />
            <div className="event-overlay"><span>SLIIT Fest 2025</span></div>
          </div>
          <div className="event-photo">
            <img src="https://loremflickr.com/800/400/festival" alt="Event 2" />
            <div className="event-overlay"><span>Gaming Tournament</span></div>
          </div>
          <div className="event-photo">
            <img src="https://loremflickr.com/800/400/culture,dance" alt="Cultural Event" />
            <div className="event-overlay"><span>Cultural Night</span></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
