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
  const [loading, setLoading] = useState(false);

  // Field-level errors
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Global submission error (e.g. server error)
  const [submitError, setSubmitError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  // ── Real-time handlers ─────────────────────────────────────

  const handleNameChange = (e) => {
    // Allow only letters and spaces
    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setName(val);
    setErrors(prev => ({
      ...prev,
      name: val.trim() ? '' : 'Full name is required',
    }));
  };

  const handlePhoneChange = (e) => {
    // Block non-digit characters, cap at 10
    const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    setPhone(digitsOnly);

    if (digitsOnly.length === 0) {
      setErrors(prev => ({ ...prev, phone: 'Phone number is required' }));
    } else if (digitsOnly.length < 10) {
      setErrors(prev => ({
        ...prev,
        phone: `Phone must be 10 digits (${digitsOnly.length}/10 entered)`,
      }));
    } else {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value.toLowerCase();
    setEmail(val);

    if (val.length === 0) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
    } else if (!val.includes('@')) {
      setErrors(prev => ({ ...prev, email: "Email must contain an '@' symbol" }));
    } else if (!/\S+@\S+\.\S+/.test(val)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email (e.g. name@example.com)' }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);

    if (val.length === 0) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
    } else if (val.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
    } else {
      setErrors(prev => ({ ...prev, password: '' }));
    }

    // Re-validate confirm password against new password
    if (confirmPassword.length > 0) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: val !== confirmPassword ? 'Passwords do not match' : '',
      }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    setErrors(prev => ({
      ...prev,
      confirmPassword: val !== password ? 'Passwords do not match' : '',
    }));
  };

  // ── Submit ─────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Final validation pass
    const newErrors = {
      name: name.trim() ? '' : 'Full name is required',
      phone: phone.length === 10 ? '' : phone.length === 0 ? 'Phone number is required' : `Phone must be exactly 10 digits (${phone.length}/10 entered)`,
      email: !email.includes('@') ? "Email must contain an '@' symbol" : !/\S+@\S+\.\S+/.test(email) ? 'Please enter a valid email' : '',
      password: password.length < 6 ? 'Password must be at least 6 characters' : '',
      confirmPassword: password !== confirmPassword ? 'Passwords do not match' : '',
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(msg => msg !== '');
    if (hasErrors) return;

    setLoading(true);
    try {
      const userData = await register(name, phone, email, password, role);
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (userData.role === 'organizer') {
        navigate('/organizer/dashboard');
      } else if (userData.role === 'sponsor') {
        navigate('/sponsor/dashboard');
      } else if (userData.role === 'food_stall') {
        navigate('/food/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-icon"></div>
          <h2>Register</h2>
          <p className="auth-subtitle">Create your account to get started.</p>
        </div>

        {submitError && <div className="auth-error-box">{submitError}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>

          {/* Full Name */}
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your full name"
              className={errors.name ? 'input-field-error' : ''}
              required
            />
            {errors.name && <span className="field-error-text">{errors.name}</span>}
          </div>

          {/* Phone Number */}
          <div className="input-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="Enter your 10-digit phone number"
              maxLength="10"
              inputMode="numeric"
              className={errors.phone ? 'input-field-error' : ''}
              required
            />
            {errors.phone
              ? <span className="field-error-text">{errors.phone}</span>
              : phone.length > 0 && <span className="field-hint-text">{phone.length}/10 digits</span>
            }
          </div>

          {/* Email */}
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email (e.g. name@example.com)"
              className={errors.email ? 'input-field-error' : ''}
              required
            />
            {errors.email && <span className="field-error-text">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="At least 6 characters"
              className={errors.password ? 'input-field-error' : ''}
              required
            />
            {errors.password && <span className="field-error-text">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Re-enter your password"
              className={errors.confirmPassword ? 'input-field-error' : ''}
              required
            />
            {errors.confirmPassword && <span className="field-error-text">{errors.confirmPassword}</span>}
          </div>

          {/* Role */}
          <div className="input-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-control"
              required
            >
              <option value="user">User</option>
              {/* <option value="organizer">Organizer</option> */}
              <option value="sponsor">Sponsor</option>
              <option value="food_stall">Food Stall Member</option>
            </select>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
