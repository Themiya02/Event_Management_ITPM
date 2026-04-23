import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
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

    setLoading(true);

    try {
      const userData = await login(email, password);
      
      if (userData.role !== role) {
        setError(`Please select the correct role. You are a ${userData.role}, not ${role}.`);
        setLoading(false);
        return;
      }
      
      if (userData.role) {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
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
            <h1 className="auth-image-title">Welcome<br/>Back!</h1>
          </div>
          <div className="auth-image-footer">
            Sign in to access your dashboard, manage your tickets, or organize upcoming campus events.
          </div>
        </div>

        {/* Right Side: Form Pane */}
        <div className="auth-form-pane">
          <div className="auth-header">
            <h2>Login Here</h2>
          </div>
          
          {error && <div className="auth-error-box">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                readOnly={role === 'admin'}
                style={{ backgroundColor: role === 'admin' ? '#f3f4f6' : 'transparent' }}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmail(val.toLowerCase());
                }}
                placeholder="Enter Email"
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                readOnly={role === 'admin'}
                style={{ backgroundColor: role === 'admin' ? '#f3f4f6' : 'transparent' }}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="role">Login As</label>
              <select
                id="role"
                value={role}
                onChange={(e) => {
                  const selectedRole = e.target.value;
                  setRole(selectedRole);
                  if (selectedRole === 'admin') {
                    setEmail('admin@gmail.com');
                    setPassword('123456');
                  } else {
                    setEmail('');
                    setPassword('');
                  }
                }}
                required
              >
                <option value="user">User</option>
                <option value="organizer">Organizer</option>
                <option value="admin">Admin</option>
                <option value="sponsor">Sponsor</option>
                <option value="food_stall">Food Stall Member</option>
              </select>
            </div>
            
            <div className="auth-extras">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input type="checkbox" style={{ margin: 0 }} /> Remember me
              </label>
              <Link to="#" style={{ textDecoration: 'none', color: '#2a73a9', fontWeight: '600' }}>Forgot Password?</Link>
            </div>
            
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer">
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
