const express = require('express');
const controller = require('../controllers/adminController');
const validation = require('../middleware/validationMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();
router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', controller.dashboard);
router.get('/users', controller.listUsers);
router.patch('/users/:id/role', validation.validateUuidParam(), validation.userRole, controller.updateUserRole);
router.get('/assessments', controller.listAssessments);
router.get('/feedback', controller.listFeedback);
router.get('/legal', controller.listLegal);

router.get('/recommendations', controller.listRecommendations);
router.post('/recommendations', validation.recommendation, controller.createRecommendation);
router.put('/recommendations/:id', validation.validateUuidParam(), validation.recommendation, controller.updateRecommendation);
router.delete('/recommendations/:id', validation.validateUuidParam(), controller.deleteRecommendation);

router.post('/legal', validation.legal, controller.createLegal);
router.put('/legal/:id', validation.validateUuidParam(), validation.legal, controller.updateLegal);
router.delete('/legal/:id', validation.validateUuidParam(), controller.deleteLegal);

module.exports = router;
