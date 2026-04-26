import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      return setError('Email must contain @');
    }
    
    if (/[A-Z]/.test(email)) {
      return setError('Email cannot contain capital letters');
    }

    if (phone.length !== 10) {
      return setError('Phone number must be exactly 10 digits');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      const userData = await register(name, phone, email, password, role);
      if (userData.role) {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container page-transition-enter">
      <div className="auth-card">
        {/* Left Side: Image Pane */}
        <div className="auth-image-pane">
          <div className="auth-image-content">
            {/* Globe Icon */}
            <svg className="auth-image-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="auth-image-title">Discover<br/>Great Events</h1>
          </div>
          <div className="auth-image-footer">
            Join thousands of university students making unforgettable memories. Be part of the largest campus event community today.
          </div>
        </div>

        {/* Right Side: Form Pane */}
        <div className="auth-form-pane">
          <div className="auth-header">
            <h2>Register Here</h2>
          </div>
          
          {error && <div className="auth-error-box">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Full Name"
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmail(val.toLowerCase());
                }}
                placeholder="Enter Email"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => {
                  const numbers = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                  setPhone(numbers);
                }}
                placeholder="Enter Phone Number"
                maxLength="10"
                required
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  required
                />
              </div>
              
              <div className="input-group" style={{ flex: 1 }}>
                <label htmlFor="confirmPassword">Confirm</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  required
                />
              </div>
            </div>
            
            <div className="input-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="user">User</option>
                <option value="organizer">Organizer</option>
                <option value="sponsor">Sponsor</option>
                <option value="food_stall">Food Stall Member</option>
              </select>
            </div>
            
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Sign Up'}
            </button>
          </form>
          
          <p className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
