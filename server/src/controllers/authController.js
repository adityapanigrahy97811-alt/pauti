const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { logAudit } = require('../middleware/audit');

const JWT_SECRET = process.env.JWT_SECRET || 'ashtavinayak_ganeshotsav_secret_key_2026_jwt_token_auth';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * User Login
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required. कृपया वापरकर्तानाव आणि पासवर्ड प्रविष्ट करा.'
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.trim() },
          { email: username.trim().toLowerCase() }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. वापरकर्तानाव किंवा पासवर्ड चुकीचा आहे.'
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact Administrator.'
      });
    }

    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Try first-letter capitalized variant or lowercase variant for flexibility
      const capitalized = password.charAt(0).toUpperCase() + password.slice(1);
      const lower = password.toLowerCase();
      isMatch = (await bcrypt.compare(capitalized, user.password)) || (await bcrypt.compare(lower, user.password));
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. वापरकर्तानाव किंवा पासवर्ड चुकीचा आहे. (टीप: Default Password: Collector@123 / Admin@123)'
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Audit log
    await logAudit({
      req: { ...req, user },
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      description: `User ${user.name} (${user.role}) logged in successfully.`
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful. स्वागत आहे!',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed due to server error.'
    });
  }
}

/**
 * Get Current User Profile & Mandal Settings
 */
async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const settings = await prisma.settings.findUnique({
      where: { id: 'default' }
    });

    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword,
      settings
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

/**
 * Change Password
 */
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false
      }
    });

    await logAudit({
      req,
      action: 'UPDATE_USER',
      entity: 'User',
      entityId: user.id,
      description: `User ${user.name} changed their password.`
    });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
}

module.exports = {
  login,
  getMe,
  changePassword
};
