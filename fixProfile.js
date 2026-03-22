const fs = require('fs');
const filepath = 'backend/controllers/authController.js';
let content = fs.readFileSync(filepath, 'utf8');

// Replace getProfile
content = content.replace(/exports\.getProfile\s*=\s*(async\s*\(req,\s*res\)\s*=>\s*\{[\s\S]*?res\.status\(500\)\.json\(\{\s*message:\s*error\.message\s*\}\);\s*\})/m, `exports.getProfile = async (req, res) => {
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
}`);

// Replace updateProfile
content = content.replace(/exports\.updateProfile\s*=\s*(async\s*\(req,\s*res\)\s*=>\s*\{[\s\S]*?res\.status\(500\)\.json\(\{\s*message:\s*error\.message\s*\}\);\s*\})/m, `exports.updateProfile = async (req, res) => {
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
}`);

fs.writeFileSync(filepath, content);
console.log('Fixed auth controller profile');
