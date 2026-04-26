import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './UserDashboard.css'; // Borrow existing CSS utilities

const UserProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        // Fetch the active synchronized context
        if (user) {
            setProfile(user);
        }
    }, [user]);

    if (!profile) return <p style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Profile Details...</p>;

    return (
        <div className="user-dashboard animation-fade-in" style={{ padding: '2rem', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
            <div className="page-header-block" style={{ marginBottom: '2.5rem' }}>
                <h1 className="page-main-title">Profile Settings</h1>
                <p className="page-main-subtitle">Manage your personal credentials, contact endpoints, and account access level.</p>
            </div>

            <div className="glass-panel" style={{ padding: '3.5rem 2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                
                {/* Immersive Avatar Badge */}
                <div style={{ width: '130px', height: '130px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'grid', placeItems: 'center', boxShadow: '0 15px 35px rgba(167, 139, 250, 0.3)', border: '4px solid var(--bg-color)', zIndex: 2 }}>
                    <span style={{ fontSize: '4rem', color: 'white', fontWeight: '800', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                        {profile.name?.charAt(0).toUpperCase()}
                    </span>
                </div>

                <div style={{ width: '100%', maxWidth: '550px', display: 'flex', flexDirection: 'column', gap: '1.8rem', marginTop: '1rem' }}>
                    
                    <div className="input-field-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Full Name Registered
                        </label>
                        <input 
                            type="text" 
                            value={profile.name} 
                            readOnly 
                            style={{ width: '100%', padding: '1.1rem 1.2rem', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 500, outline: 'none', cursor: 'default' }} 
                        />
                    </div>

                    <div className="input-field-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            Validated Email Address
                        </label>
                        <input 
                            type="email" 
                            value={profile.email} 
                            readOnly 
                            style={{ width: '100%', padding: '1.1rem 1.2rem', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 500, outline: 'none', cursor: 'default' }} 
                        />
                    </div>

                    <div className="input-field-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            Security / Role Status
                        </label>
                        <div style={{ padding: '1.1rem 1.2rem', borderRadius: '14px', border: '1px solid var(--primary-color)', background: 'rgba(147, 51, 234, 0.08)', color: 'var(--primary-color)', fontSize: '1.05rem', fontWeight: 600, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)', boxShadow: '0 0 10px var(--primary-color)' }}></span>
                            {profile.role} Portal Fully Verified
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UserProfile;
