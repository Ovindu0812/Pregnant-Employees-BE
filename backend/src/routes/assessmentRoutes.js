const express = require('express');
const controller = require('../controllers/assessmentController');
const validation = require('../middleware/validationMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(requireAuth);
router.post('/', validation.assessment, controller.createAssessment);
router.get('/', controller.listAssessments);
router.get('/:id', validation.validateUuidParam(), controller.getAssessment);

module.exports = router;
