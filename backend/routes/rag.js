const express = require('express');
const ragController = require('../controllers/ragController');

const router = express.Router();

router.post('/ask', ragController.askQuestion);
router.get('/hts/:htsCode', ragController.getRelatedInfo);
router.post('/add-documents', ragController.addDocuments);
router.get('/health', ragController.healthCheck);
router.post('/update-url', ragController.updateColabUrl);

module.exports = router;