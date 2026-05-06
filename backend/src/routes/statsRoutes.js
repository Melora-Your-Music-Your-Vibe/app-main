const router = require('express').Router();
const { getOverview } = require('../controllers/statsController');

router.get('/overview', getOverview);

module.exports = router;
