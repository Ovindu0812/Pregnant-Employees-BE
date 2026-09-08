const express = require('express');
const controller = require('../controllers/legalController');
const validation = require('../middleware/validationMiddleware');

const router = express.Router();
router.get('/', controller.listLegal);
router.get('/:id', validation.validateUuidParam(), controller.getLegal);

module.exports = router;
