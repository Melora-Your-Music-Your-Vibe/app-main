const router = require('express').Router();
const { search, suggestions } = require('../controllers/searchController');

router.get('/', search);
router.get('/suggestions', suggestions);

module.exports = router;
