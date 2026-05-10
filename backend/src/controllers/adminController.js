const { User } = require('../models');
const jwt = require('jsonwebtoken');

// Fetch admin credentials from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// @desc    Admin login
// @route   POST /api/v1/admin/login
const adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const adminToken = jwt.sign(
      { role: 'superadmin', username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: { token: adminToken }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all creators (pending and approved)
// @route   GET /api/v1/admin/creators
const getCreators = async (req, res, next) => {
  try {
    const creators = await User.findAll({
      where: { role: 'creator' },
      attributes: ['id', 'name', 'email', 'isApproved', 'createdAt', 'isActive']
    });

    res.json({
      success: true,
      data: { creators }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a creator
// @route   PUT /api/v1/admin/creators/:id/approve
const approveCreator = async (req, res, next) => {
  try {
    const creator = await User.findOne({ where: { id: req.params.id, role: 'creator' } });
    if (!creator) return res.status(404).json({ success: false, message: 'Creator not found' });

    creator.isApproved = true;
    creator.isVerified = true; // Auto-verify on approval
    await creator.save();

    res.json({ success: true, message: 'Creator approved successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit a creator's credentials
// @route   PUT /api/v1/admin/creators/:id
const updateCreator = async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const creator = await User.findOne({ where: { id: req.params.id, role: 'creator' } });
    if (!creator) return res.status(404).json({ success: false, message: 'Creator not found' });

    if (name) creator.name = name;
    if (password) creator.password = password; // Will be hashed by Sequelize hook

    await creator.save();
    res.json({ success: true, message: 'Creator updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  getCreators,
  approveCreator,
  updateCreator
};
