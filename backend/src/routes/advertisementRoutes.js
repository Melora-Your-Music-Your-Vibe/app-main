const router = require('express').Router();
const { getActiveAdvertisements } = require('../controllers/advertisementController');
const { Artist } = require('../models');

// Public route - get active ads for landing page
router.get('/active', getActiveAdvertisements);

// Public route - get all artists for landing page
router.get('/artists', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const artists = await Artist.findAll({
      order: [['songCount', 'DESC']],
      limit,
    });
    res.json({ success: true, data: artists });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
