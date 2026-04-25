const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // STRICT CHECK: Disallow open admin registrations securely
    if (role === 'admin') {
      return res.status(403).json({ message: 'Illegal operation. Administrators cannot be openly registered.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'user'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Strict Admin Native Seeder Bypass
    if (email === 'admin@gmail.com' && password === '123456') {
      let adminUser = await User.findOne({ email: 'admin@gmail.com' });
      if (!adminUser) {
        adminUser = await User.create({
          name: 'Super Admin',
          email: 'admin@gmail.com',
          password: '123456',
          phone: '0000000000',
          role: 'admin'
        });
      }
      return res.json({
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        token: generateToken(adminUser._id)
      });
    }

    // Organizer Seeder Bypass - ensures chaminda@gmail.com always exists
    if (email === 'chaminda@gmail.com' && password === '123456') {
      let organizerUser = await User.findOne({ email: 'chaminda@gmail.com' });
      if (!organizerUser) {
        organizerUser = await User.create({
          name: 'Chaminda Organizer',
          email: 'chaminda@gmail.com',
          password: '123456',
          phone: '0711234567',
          role: 'organizer'
        });
      }
      return res.json({
        _id: organizerUser._id,
        name: organizerUser.name,
        email: organizerUser.email,
        role: organizerUser.role,
        token: generateToken(organizerUser._id)
      });
    }

    // User Seeder Bypass - ensures user@gmail.com always exists
    if (email === 'user@gmail.com' && password === '123456') {
      let seedUser = await User.findOne({ email: 'user@gmail.com' });
      if (!seedUser) {
        seedUser = await User.create({
          name: 'Test User',
          email: 'user@gmail.com',
          password: '123456',
          phone: '0711234568',
          role: 'user'
        });
      }
      return res.json({
        _id: seedUser._id,
        name: seedUser.name,
        email: seedUser.email,
        role: seedUser.role,
        token: generateToken(seedUser._id)
      });
    }

    const user = await User.findOne({ email }).select('+password');
    
    // STRICT SECURE OVERRIDE: Reject any orphan or non-seed Admin logins
    if (user && user.role === 'admin') {
      return res.status(403).json({ message: 'Invalid admin credentials. Admins may only strictly log in using the fixed root account.' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Register
exports.adminRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Force role to admin
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You are not an Admin.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Organizer Register
exports.organizerRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Force role to organizer
    const user = await User.create({
      name,
      email,
      password,
      role: 'organizer'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Organizer Login
exports.organizerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid organizer credentials' });
    }

    if (user.role !== 'organizer') {
      return res.status(403).json({ message: 'Access denied. Organizer role required.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid organizer credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      organization: user.organization,
      bio: user.bio,
      avatar: user.avatar
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.phone !== undefined) user.phone = req.body.phone;
      if (req.body.organization !== undefined) user.organization = req.body.organization;
      if (req.body.bio !== undefined) user.bio = req.body.bio;
      if (req.body.avatar !== undefined) user.avatar = req.body.avatar;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        organization: updatedUser.organization,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete Profile
exports.deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    try {
      const Event = require('../models/Event');
      await Event.deleteMany({ organizer: req.user._id });
    } catch (e) {}
    try {
      const Registration = require('../models/Registration');
      await Registration.deleteMany({ user: req.user._id });
    } catch (e) {}

    await user.deleteOne();
    res.json({ message: 'User removed completely' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
