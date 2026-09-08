const express = require('express');
const controller = require('../controllers/recommendationController');
const validation = require('../middleware/validationMiddleware');

const router = express.Router();
router.get('/', controller.listRecommendations);
router.get('/:id', validation.validateUuidParam(), controller.getRecommendation);

module.exports = router;
