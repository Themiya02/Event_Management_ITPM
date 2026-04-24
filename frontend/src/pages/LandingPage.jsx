import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, Music, MapPin, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import concertBg from './images/concert_bg.png';
import './LandingPage.css';

const LandingPage = () => {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="landing-page-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="overlay"></div>
          <img 
            src={concertBg} 
            alt="Concert Background" 
            className="bg-image"
          />
        </div>

        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span 
            className="hero-badge"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            🚀 Empowering SLIIT Campus Events
          </motion.span>
          <h1 className="hero-title">
            Your Ultimate <span className="text-gradient">Eventio</span> <br/> 
            Experience Starts Here
          </h1>
          <p className="hero-description">
            Discover, organize, and experience the best campus festivals, tech meets, and artistic performances. All in one premium platform.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-primary-glow">
              Get Started Now <ArrowRight size={20} />
            </Link>
            <a href="#features" className="btn-secondary-outline">
              Explore Features
            </a>
          </div>
        </motion.div>

        <motion.div 
          className="hero-stats"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="stat-item" variants={itemVariants}>
            <span className="stat-number">50+</span>
            <span className="stat-label">Monthly Events</span>
          </motion.div>
          <motion.div className="stat-item" variants={itemVariants}>
            <span className="stat-number">5K+</span>
            <span className="stat-label">Active Students</span>
          </motion.div>
          <motion.div className="stat-item" variants={itemVariants}>
            <span className="stat-number">20+</span>
            <span className="stat-label">Partner Brands</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-tag">What We Offer</span>
          <h2 className="section-title">Designed for the Next Generation</h2>
        </div>

        <div className="features-grid">
          <motion.div 
            className="feature-card glass-card"
            whileHover={{ y: -10 }}
          >
            <div className="feature-icon-box purple">
              <Calendar size={32} />
            </div>
            <h3>Event Management</h3>
            <p>End-to-end management for organizers, from creation to ticket tracking and analytics.</p>
          </motion.div>

          <motion.div 
            className="feature-card glass-card"
            whileHover={{ y: -10 }}
          >
            <div className="feature-icon-box blue">
              <ShieldCheck size={32} />
            </div>
            <h3>Secure Ticketing</h3>
            <p>Fraud-proof QR ticketing system with instant validation and secure payment integration.</p>
          </motion.div>

          <motion.div 
            className="feature-card glass-card"
            whileHover={{ y: -10 }}
          >
            <div className="feature-icon-box green">
              <Music size={32} />
            </div>
            <h3>Artist Directory</h3>
            <p>Connect with campus talent. Rate, review, and book artists for your next big event.</p>
          </motion.div>

          <motion.div 
            className="feature-card glass-card"
            whileHover={{ y: -10 }}
          >
            <div className="feature-icon-box orange">
              <Users size={32} />
            </div>
            <h3>Sponsor Portal</h3>
            <p>Dedicated space for sponsors to find events that align with their brand and audience.</p>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="cta-section">
        <div className="cta-glass glass-panel">
          <div className="cta-content">
            <h2>Ready to transform your campus life?</h2>
            <p>Join the thousands of SLIIT students already using Eventio to make memories.</p>
            <Link to="/register" className="btn-primary-large">
              Join the Community
            </Link>
          </div>
          <div className="cta-image">
            <img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop" alt="Campus Life" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
