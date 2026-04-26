import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './AdminAuth.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // We can reuse the setLoginData from context if it's exported, or just manually set localStorage and window.location
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${apiUrl}/api/auth/admin/login`, { email, password });
            
            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(res.data));
            
            // Redirect directly to admin dashboard
            // A hard refresh might be needed to trigger context update or we can just window.location
            window.location.href = '/admin/dashboard';
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login as admin');
            setLoading(false);
        }
    };

    return (
        <div className="admin-auth-container">
            <div className="admin-auth-card glass-panel animation-fade-in">
                <div className="admin-auth-header">
                    <div className="auth-logo-icon"></div>
                    <h2 className="text-gradient">Eventio Admin</h2>
                    <p className="auth-subtitle">Secure Access Portal</p>
                </div>

                {error && <div className="auth-error-box">{error}</div>}

                <form onSubmit={handleSubmit} className="admin-auth-form">
                    <div className="input-group">
                        <label>Admin Email</label>
                        <input
                            type="email"
                            placeholder="admin@eventio.com"
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
                        />
                    </div>

                    <button type="submit" className="admin-auth-btn" disabled={loading}>
                        {loading ? 'Verifying...' : 'Login as Admin'}
                    </button>
                </form>

                <div className="admin-auth-footer">
                    New admin? <Link to="/admin/register">Register here</Link>
                    <br/><br/>
                    <Link to="/login" className="back-link">← Back to Organizer Portal</Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
