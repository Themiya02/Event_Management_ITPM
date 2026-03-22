import React from 'react';
import { useAuth } from '../../context/AuthContext';

const SponsorDashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }} className="animation-fade-in">
            <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Sponsor Portal</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>
                Welcome, {user?.name}! Your centralized sponsorship management node is currently being compiled.
            </p>
            
            <div className="glass-panel" style={{ padding: '3rem', borderRadius: '16px', border: '1px dashed var(--primary-color)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤝</div>
                <h2 style={{ marginBottom: '1rem' }}>Event Sponsorship Toolkit</h2>
                <p style={{ color: 'var(--text-muted)' }}>This node will soon allow you to browse upcoming campus events and instantly provision digital sponsorship tiers directly into active organizer flows.</p>
            </div>

            <button onClick={logout} className="btn-sm-outline" style={{ marginTop: '2rem' }}>Secure Logout</button>
        </div>
    );
};

export default SponsorDashboard;
