const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController.js');

// Define your routes here
router.post('/fill/7501', formController.fill7501);
router.post('/fill/3461', formController.fill3461);

module.exports = router;