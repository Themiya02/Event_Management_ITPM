import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminAuth.css';

const AdminRegister = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
            const res = await axios.post(`${apiUrl}/api/auth/admin/register`, { name, email, password });
            
            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(res.data));
            
            // Redirect directly to admin dashboard
            window.location.href = '/admin/dashboard';
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            setLoading(false);
        }
    };

    return (
        <div className="admin-auth-container">
            <div className="admin-auth-card glass-panel animation-fade-in">
                <div className="admin-auth-header">
                    <div className="auth-logo-icon"></div>
                    <h2 className="text-gradient">Register Admin</h2>
                    <p className="auth-subtitle">Create a new administrative account.</p>
                </div>

                {error && <div className="auth-error-box">{error}</div>}

                <form onSubmit={handleSubmit} className="admin-auth-form">
                    <div className="input-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

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
                            minLength={6}
                            required
                        />
                    </div>

                    <button type="submit" className="admin-auth-btn" disabled={loading}>
                        {loading ? 'Registering...' : 'Create Admin Account'}
                    </button>
                </form>

                <div className="admin-auth-footer">
                    Already have an admin account? <Link to="/admin/login">Login</Link>
                    <br/><br/>
                    <Link to="/login" className="back-link">← Back to Organizer Portal</Link>
                </div>
            </div>
        </div>
    );
};

export default AdminRegister;
