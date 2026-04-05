import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Sponsorship.css';

const PACKAGE_ICONS = {
  bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎', diamond: '💠'
};

const SponsorshipApply = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { packageKey, packageData } = location.state || {};

  const [formData, setFormData] = useState({
    sponsorName: '',
    sponsorEmail: '',
    contactPerson: '',
    phone: '',
    message: ''
  });
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Redirect if no package selected
  if (!packageKey || !packageData) {
    navigate('/sponsor/packages');
    return null;
  }

  const validate = () => {
    const newErrors = {};
    if (!formData.sponsorName.trim()) newErrors.sponsorName = 'Company name is required';
    else if (formData.sponsorName.trim().length < 2) newErrors.sponsorName = 'Company name must be at least 2 characters';

    if (!formData.sponsorEmail.trim()) newErrors.sponsorEmail = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.sponsorEmail)) newErrors.sponsorEmail = 'Enter a valid email address';

    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person name is required';
    else if (formData.contactPerson.trim().length < 2) newErrors.contactPerson = 'Name must be at least 2 characters';

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[0-9+\-\s()]{7,15}$/.test(formData.phone)) newErrors.phone = 'Enter a valid phone number (7-15 digits)';

    if (!paymentSlip) newErrors.paymentSlip = 'Payment slip is required';

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setErrors(prev => ({ ...prev, paymentSlip: 'Only JPG, PNG, or PDF files allowed' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, paymentSlip: 'File size must be under 5MB' }));
      return;
    }
    setPaymentSlip(file);
    setErrors(prev => ({ ...prev, paymentSlip: '' }));
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setSlipPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setSlipPreview('pdf');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('sponsorName', formData.sponsorName);
      data.append('sponsorEmail', formData.sponsorEmail);
      data.append('contactPerson', formData.contactPerson);
      data.append('phone', formData.phone);
      data.append('packageType', packageKey);
      data.append('message', formData.message);
      data.append('paymentSlip', paymentSlip);

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/sponsorship/apply`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/sponsor/verify-otp', {
        state: {
          applicationId: res.data.applicationId,
          email: res.data.email,
          packageKey,
          packageData
        }
      });
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Submission failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sp-page">
      <div className="sp-bg">
        <div className="sp-orb sp-orb-1"></div>
        <div className="sp-orb sp-orb-2"></div>
        <div className="sp-orb sp-orb-3"></div>
      </div>

      <div className="sp-container sp-container-narrow">
        <button className="sp-back-btn" onClick={() => navigate('/sponsor/packages')}>
          ← Back to Packages
        </button>

        {/* Selected Package Summary */}
        <div className="sp-summary-card" style={{ '--pkg-color': packageData.color }}>
          <div className="sp-summary-left">
            <span className="sp-summary-icon">{PACKAGE_ICONS[packageKey]}</span>
            <div>
              <div className="sp-summary-label">Selected Package</div>
              <div className="sp-summary-name" style={{ color: packageData.color }}>{packageData.name} Package</div>
            </div>
          </div>
          <div className="sp-summary-price">
            <span className="sp-summary-currency">LKR</span>
            <span className="sp-summary-amount">{packageData.price.toLocaleString()}</span>
          </div>
        </div>

        {/* Application Form */}
        <div className="sp-form-card">
          <h2 className="sp-form-title">Sponsorship Application</h2>
          <p className="sp-form-subtitle">Fill in your details. An OTP will be sent to your email for verification.</p>

          {errors.submit && (
            <div className="sp-error-banner">⚠️ {errors.submit}</div>
          )}

          <form onSubmit={handleSubmit} className="sp-form" noValidate>
            <div className="sp-form-row">
              <div className="sp-field">
                <label className="sp-label">Company / Organization Name *</label>
                <input
                  type="text"
                  name="sponsorName"
                  value={formData.sponsorName}
                  onChange={handleChange}
                  className={`sp-input ${errors.sponsorName ? 'sp-input-error' : ''}`}
                  placeholder="e.g. Acme Corporation"
                  maxLength={100}
                />
                {errors.sponsorName && <span className="sp-field-error">{errors.sponsorName}</span>}
              </div>
              <div className="sp-field">
                <label className="sp-label">Contact Person Name *</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className={`sp-input ${errors.contactPerson ? 'sp-input-error' : ''}`}
                  placeholder="e.g. John Doe"
                />
                {errors.contactPerson && <span className="sp-field-error">{errors.contactPerson}</span>}
              </div>
            </div>

            <div className="sp-form-row">
              <div className="sp-field">
                <label className="sp-label">Email Address *</label>
                <input
                  type="email"
                  name="sponsorEmail"
                  value={formData.sponsorEmail}
                  onChange={handleChange}
                  className={`sp-input ${errors.sponsorEmail ? 'sp-input-error' : ''}`}
                  placeholder="e.g. contact@company.com"
                />
                {errors.sponsorEmail && <span className="sp-field-error">{errors.sponsorEmail}</span>}
                <span className="sp-field-hint">OTP will be sent to this email</span>
              </div>
              <div className="sp-field">
                <label className="sp-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`sp-input ${errors.phone ? 'sp-input-error' : ''}`}
                  placeholder="e.g. +94 77 123 4567"
                  maxLength={15}
                />
                {errors.phone && <span className="sp-field-error">{errors.phone}</span>}
              </div>
            </div>

            {/* Payment Slip Upload */}
            <div className="sp-field">
              <label className="sp-label">Upload Payment Slip *</label>
              <div
                className={`sp-dropzone ${dragOver ? 'sp-dropzone-active' : ''} ${errors.paymentSlip ? 'sp-dropzone-error' : ''} ${paymentSlip ? 'sp-dropzone-filled' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('slip-input').click()}
              >
                <input
                  id="slip-input"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileChange(e.target.files[0])}
                />
                {paymentSlip ? (
                  <div className="sp-file-preview">
                    {slipPreview === 'pdf' ? (
                      <div className="sp-pdf-icon">📄</div>
                    ) : (
                      <img src={slipPreview} alt="Payment slip preview" className="sp-slip-preview-img" />
                    )}
                    <div className="sp-file-info">
                      <span className="sp-file-name">{paymentSlip.name}</span>
                      <span className="sp-file-size">({(paymentSlip.size / 1024).toFixed(1)} KB)</span>
                      <button
                        type="button"
                        className="sp-remove-file"
                        onClick={(e) => { e.stopPropagation(); setPaymentSlip(null); setSlipPreview(null); }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="sp-dropzone-content">
                    <div className="sp-upload-icon">📤</div>
                    <div className="sp-upload-text">Drag & drop or click to upload</div>
                    <div className="sp-upload-hint">JPG, PNG, PDF — Max 5MB</div>
                  </div>
                )}
              </div>
              {errors.paymentSlip && <span className="sp-field-error">{errors.paymentSlip}</span>}
            </div>

            {/* Message */}
            <div className="sp-field">
              <label className="sp-label">Additional Message (Optional)</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="sp-textarea"
                placeholder="Any specific requirements or notes..."
                rows={3}
                maxLength={500}
              />
              <span className="sp-field-hint">{formData.message.length}/500 characters</span>
            </div>

            <button
              type="submit"
              className="sp-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <><span className="sp-btn-spinner"></span> Submitting...</>
              ) : (
                'Submit Application & Get OTP →'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SponsorshipApply;
