const express = require('express');
const controller = require('../controllers/authController');
const validation = require('../middleware/validationMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.post('/register', validation.register, controller.register);
router.post('/login', validation.login, controller.login);
router.post('/refresh', validation.refresh, controller.refresh);
router.post('/logout', requireAuth, controller.logout);
router.get('/me', requireAuth, controller.me);

module.exports = router;
