const Sponsorship = require('../models/Sponsorship');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Package definitions
const PACKAGES = {
  bronze: {
    name: 'Bronze',
    price: 5000,
    color: '#CD7F32',
    benefits: [
      'Logo on event website',
      'Social media mention (2 posts)',
      'Name in event program',
      '2 complimentary tickets',
      'Certificate of sponsorship'
    ],
    description: 'Perfect for small businesses looking to gain exposure',
    highlight: false
  },
  silver: {
    name: 'Silver',
    price: 15000,
    color: '#C0C0C0',
    benefits: [
      'Everything in Bronze',
      'Logo on event banners',
      'Social media mention (5 posts)',
      'Booth space (3x3m)',
      '5 complimentary tickets',
      'Brand feature in email blast'
    ],
    description: 'Great for mid-sized companies wanting strong visibility',
    highlight: false
  },
  gold: {
    name: 'Gold',
    price: 35000,
    color: '#FFD700',
    benefits: [
      'Everything in Silver',
      'Premium booth space (5x5m)',
      'Speaking opportunity (10 min)',
      'Logo on event stage',
      '10 complimentary tickets',
      'Featured in press releases',
      'Social media campaign (10 posts)'
    ],
    description: 'Maximize your brand presence with premium placement',
    highlight: true
  },
  platinum: {
    name: 'Platinum',
    price: 75000,
    color: '#E5E4E2',
    benefits: [
      'Everything in Gold',
      'Title sponsor recognition',
      'Keynote speaking slot (30 min)',
      'Premium booth (8x8m)',
      'VIP table at gala dinner',
      '20 complimentary tickets',
      'Dedicated social media day',
      'Logo on all event materials'
    ],
    description: 'Top-tier recognition with unparalleled brand exposure',
    highlight: false
  },
  diamond: {
    name: 'Diamond',
    price: 150000,
    color: '#B9F2FF',
    benefits: [
      'Everything in Platinum',
      'Exclusive naming rights',
      'Custom activation zone',
      'Full event branding rights',
      'VIP lounge access for team',
      '50 complimentary tickets',
      'Full media partnership',
      'Priority media interviews',
      'Exclusive after-party sponsor',
      'Year-round digital partnership'
    ],
    description: 'The ultimate partnership — your brand, our event',
    highlight: false
  }
};

// Configure nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP email
const sendOTPEmail = async (email, sponsorName, otp, packageName) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"EventHub Sponsorship" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Your OTP Verification Code - EventHub Sponsorship',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
      </head>
      <body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:20px;overflow:hidden;border:1px solid rgba(139,92,246,0.3);">
          <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">✨ EventHub</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Sponsorship Portal</p>
          </div>
          <div style="padding:40px;">
            <h2 style="color:#e2e8f0;margin:0 0 12px;font-size:22px;">Hello, ${sponsorName}!</h2>
            <p style="color:#94a3b8;margin:0 0 24px;line-height:1.6;font-size:15px;">
              Thank you for choosing the <strong style="color:#a78bfa;">${packageName} Package</strong>. 
              Please use the OTP below to verify your sponsorship application. This code is valid for <strong style="color:#f59e0b;">10 minutes</strong>.
            </p>
            <div style="background:rgba(139,92,246,0.1);border:2px dashed rgba(139,92,246,0.4);border-radius:16px;padding:32px;text-align:center;margin:24px 0;">
              <p style="color:#94a3b8;margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:2px;">Your OTP Code</p>
              <div style="font-size:48px;font-weight:800;letter-spacing:16px;color:#a78bfa;font-family:'Courier New',monospace;">${otp}</div>
            </div>
            <div style="background:rgba(245,158,11,0.1);border-left:4px solid #f59e0b;border-radius:4px;padding:16px;margin:24px 0;">
              <p style="color:#fbbf24;margin:0;font-size:13px;">⚠️ Never share this OTP with anyone. This code expires in 10 minutes.</p>
            </div>
            <p style="color:#64748b;font-size:13px;margin:24px 0 0;line-height:1.6;">
              If you didn't submit a sponsorship application, please ignore this email or contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color:#a78bfa;">${process.env.EMAIL_USER}</a>
            </p>
          </div>
          <div style="background:rgba(0,0,0,0.3);padding:20px 40px;text-align:center;">
            <p style="color:#475569;margin:0;font-size:12px;">© 2025 EventHub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send confirmation email after OTP verified
const sendConfirmationEmail = async (email, sponsorName, packageName, amount) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"EventHub Sponsorship" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✅ Sponsorship Application Received - EventHub',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:20px;overflow:hidden;border:1px solid rgba(139,92,246,0.3);">
          <div style="background:linear-gradient(135deg,#059669,#0d9488);padding:40px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🎉</div>
            <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">Application Received!</h1>
          </div>
          <div style="padding:40px;">
            <h2 style="color:#e2e8f0;margin:0 0 12px;font-size:20px;">Dear ${sponsorName},</h2>
            <p style="color:#94a3b8;margin:0 0 24px;line-height:1.6;">
              Your sponsorship application has been successfully submitted and verified. Our team will review your payment slip and get back to you within <strong style="color:#a78bfa;">2-3 business days</strong>.
            </p>
            <div style="background:rgba(5,150,105,0.1);border:1px solid rgba(5,150,105,0.3);border-radius:12px;padding:24px;margin:24px 0;">
              <h3 style="color:#34d399;margin:0 0 16px;font-size:16px;">📋 Application Summary</h3>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="color:#64748b;padding:6px 0;font-size:14px;">Package</td><td style="color:#e2e8f0;font-weight:600;font-size:14px;text-align:right;">${packageName}</td></tr>
                <tr><td style="color:#64748b;padding:6px 0;font-size:14px;">Amount</td><td style="color:#34d399;font-weight:700;font-size:16px;text-align:right;">LKR ${amount.toLocaleString()}</td></tr>
              </table>
            </div>
          </div>
          <div style="background:rgba(0,0,0,0.3);padding:20px 40px;text-align:center;">
            <p style="color:#475569;margin:0;font-size:12px;">© 2025 EventHub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

// @desc  Get all packages
// @route GET /api/sponsorship/packages
exports.getPackages = (req, res) => {
  res.json({ success: true, packages: PACKAGES });
};

// @desc  Submit sponsorship application + upload slip + send OTP
// @route POST /api/sponsorship/apply
exports.applySponsorship = async (req, res) => {
  try {
    const { sponsorName, sponsorEmail, contactPerson, phone, packageType, message } = req.body;

    // Validation
    if (!sponsorName || !sponsorEmail || !contactPerson || !phone || !packageType) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled' });
    }

    if (!PACKAGES[packageType]) {
      return res.status(400).json({ success: false, message: 'Invalid package selected' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Payment slip is required' });
    }

    // Phone validation
    const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format' });
    }

    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(sponsorEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    const selectedPackage = PACKAGES[packageType];
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const sponsorship = await Sponsorship.create({
      sponsorName,
      sponsorEmail,
      contactPerson,
      phone,
      packageType,
      packageAmount: selectedPackage.price,
      paymentSlip: req.file.filename,
      otpCode: otp,
      otpExpiry,
      message: message || ''
    });

    // Send OTP email
    await sendOTPEmail(sponsorEmail, sponsorName, otp, selectedPackage.name);

    res.status(201).json({
      success: true,
      message: 'Application submitted! OTP sent to your email.',
      applicationId: sponsorship._id,
      email: sponsorEmail
    });

  } catch (error) {
    console.error('Apply sponsorship error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc  Verify OTP
// @route POST /api/sponsorship/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { applicationId, otp } = req.body;

    if (!applicationId || !otp) {
      return res.status(400).json({ success: false, message: 'Application ID and OTP are required' });
    }

    const sponsorship = await Sponsorship.findById(applicationId).select('+otpCode +otpExpiry');

    if (!sponsorship) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (sponsorship.otpVerified) {
      return res.status(400).json({ success: false, message: 'OTP already verified' });
    }

    if (new Date() > sponsorship.otpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please resend.' });
    }

    if (sponsorship.otpCode !== otp.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    sponsorship.otpVerified = true;
    sponsorship.status = 'pending_review';
    sponsorship.otpCode = undefined;
    sponsorship.otpExpiry = undefined;
    await sponsorship.save();

    // Send confirmation email
    const pkg = PACKAGES[sponsorship.packageType];
    await sendConfirmationEmail(sponsorship.sponsorEmail, sponsorship.sponsorName, pkg.name, sponsorship.packageAmount);

    res.json({
      success: true,
      message: 'OTP verified successfully! Your application is under review.',
      sponsorship: {
        id: sponsorship._id,
        sponsorName: sponsorship.sponsorName,
        packageType: sponsorship.packageType,
        packageAmount: sponsorship.packageAmount,
        status: sponsorship.status
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Resend OTP
// @route POST /api/sponsorship/resend-otp
exports.resendOTP = async (req, res) => {
  try {
    const { applicationId } = req.body;

    const sponsorship = await Sponsorship.findById(applicationId);
    if (!sponsorship) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (sponsorship.otpVerified) {
      return res.status(400).json({ success: false, message: 'OTP already verified' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update without select restriction using updateOne
    await Sponsorship.updateOne(
      { _id: applicationId },
      { $set: { otpCode: otp, otpExpiry } }
    );

    const pkg = PACKAGES[sponsorship.packageType];
    await sendOTPEmail(sponsorship.sponsorEmail, sponsorship.sponsorName, otp, pkg.name);

    res.json({ success: true, message: 'New OTP sent to your email' });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get all sponsorships (admin)
// @route GET /api/sponsorship/all
exports.getAllSponsorships = async (req, res) => {
  try {
    const sponsorships = await Sponsorship.find().sort({ createdAt: -1 });
    res.json({ success: true, sponsorships });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Update sponsorship status (admin)
// @route PATCH /api/sponsorship/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending_review'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const sponsorship = await Sponsorship.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!sponsorship) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, sponsorship });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
