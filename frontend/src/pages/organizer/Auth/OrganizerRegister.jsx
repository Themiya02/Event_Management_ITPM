import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import '../../admin/AdminAuth.css'; // Reusing sleek styling

const OrganizerRegister = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
            const res = await axios.post(`${apiUrl}/api/auth/organizer/register`, { name, email, password });
            
            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(res.data));
            
            // Redirect directly to organizer dashboard
            window.location.href = '/organizer/dashboard';
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register as Organizer');
            setLoading(false);
        }
    };

    return (
        <div className="admin-auth-container">
            <div className="admin-auth-card glass-panel animation-fade-in" style={{ borderTop: '4px solid var(--primary-color)' }}>
                <div className="admin-auth-header">
                    <div className="auth-logo-icon" style={{ background: 'var(--primary-color)' }}></div>
                    <h2 className="text-gradient">Join Eventio</h2>
                    <p className="auth-subtitle">Create your Organizer account in seconds.</p>
                </div>

                {error && <div className="auth-error-box">{error}</div>}

                <form onSubmit={handleSubmit} className="admin-auth-form">
                    <div className="input-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            placeholder="Jane Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Organizer Email</label>
                        <input
                            type="email"
                            placeholder="organizer@eventio.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    
                    <div className="input-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="admin-auth-btn" disabled={loading}>
                        {loading ? 'Registering...' : 'Complete Registration'}
                    </button>
                </form>

                <div className="admin-auth-footer">
                    Already an organizer? <Link to="/organizer/login">Log in here</Link>
                    <br/><br/>
                    <Link to="/login" className="back-link">← Go to General Hub</Link>
                </div>
            </div>
        </div>
    );
};

export default OrganizerRegister;
