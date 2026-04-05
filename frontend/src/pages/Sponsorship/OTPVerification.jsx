import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Sponsorship.css';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { applicationId, email, packageKey, packageData } = location.state || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!applicationId) {
      navigate('/sponsor/packages');
      return;
    }
    inputRefs.current[0]?.focus();
    startCooldown();
  }, []);

  const startCooldown = () => {
    setCanResend(false);
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 filled
    if (value && index === 5 && newOtp.every(d => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (otpString) => {
    const code = otpString || otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/sponsorship/verify-otp`, {
        applicationId,
        otp: code
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    setError('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/sponsorship/resend-otp`, { applicationId });
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      startCooldown();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="sp-page">
        <div className="sp-bg">
          <div className="sp-orb sp-orb-1"></div>
          <div className="sp-orb sp-orb-2"></div>
          <div className="sp-orb sp-orb-3"></div>
        </div>
        <div className="sp-container sp-container-narrow">
          <div className="sp-success-card">
            <div className="sp-success-animation">
              <div className="sp-success-circle">✓</div>
            </div>
            <h2 className="sp-success-title">Application Submitted!</h2>
            <p className="sp-success-msg">
              Your sponsorship application has been verified and submitted successfully.
              A confirmation email has been sent to <strong>{email}</strong>.
              Our team will review your payment slip and contact you within 2-3 business days.
            </p>
            <div className="sp-success-details">
              <div className="sp-success-detail">
                <span>Package</span>
                <span>{packageData?.name}</span>
              </div>
              <div className="sp-success-detail">
                <span>Amount</span>
                <span>LKR {packageData?.price?.toLocaleString()}</span>
              </div>
              <div className="sp-success-detail">
                <span>Status</span>
                <span className="sp-status-badge">Pending Review</span>
              </div>
            </div>
            <button className="sp-proceed-btn" onClick={() => navigate('/sponsor/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sp-page">
      <div className="sp-bg">
        <div className="sp-orb sp-orb-1"></div>
        <div className="sp-orb sp-orb-2"></div>
        <div className="sp-orb sp-orb-3"></div>
      </div>

      <div className="sp-container sp-container-narrow">
        <div className="sp-otp-card">
          <div className="sp-otp-icon">📧</div>
          <h2 className="sp-otp-title">Verify Your Email</h2>
          <p className="sp-otp-desc">
            We've sent a 6-digit OTP to<br />
            <strong className="sp-otp-email">{email}</strong>
          </p>

          {error && <div className="sp-error-banner">⚠️ {error}</div>}

          {/* OTP Input */}
          <div className="sp-otp-inputs" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`sp-otp-input ${digit ? 'sp-otp-filled' : ''} ${error ? 'sp-otp-error' : ''}`}
                disabled={loading}
              />
            ))}
          </div>

          <button
            className="sp-submit-btn"
            onClick={() => handleVerify()}
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? (
              <><span className="sp-btn-spinner"></span> Verifying...</>
            ) : (
              'Verify OTP'
            )}
          </button>

          <div className="sp-resend-section">
            {canResend ? (
              <button
                className="sp-resend-btn"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? 'Sending...' : '🔄 Resend OTP'}
              </button>
            ) : (
              <p className="sp-resend-timer">
                Resend OTP in <strong>{resendCooldown}s</strong>
              </p>
            )}
          </div>

          <div className="sp-otp-tips">
            <p>💡 Check your spam folder if you don't see the email</p>
            <p>⏱️ OTP expires in 10 minutes</p>
          </div>

          <button className="sp-back-link" onClick={() => navigate('/sponsor/apply', {
            state: { packageKey, packageData }
          })}>
            ← Change details
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
