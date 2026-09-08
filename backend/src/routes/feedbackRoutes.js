const express = require('express');
const controller = require('../controllers/feedbackController');
const validation = require('../middleware/validationMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(requireAuth);
router.post('/', validation.feedback, controller.createFeedback);
router.get('/me', controller.listMyFeedback);

module.exports = router;
