const express = require('express');
const controller = require('../controllers/userController');
const validation = require('../middleware/validationMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(requireAuth);
router.get('/me', controller.getMe);
router.put('/me', validation.profile, controller.updateMe);

module.exports = router;
