const express = require('express');
const airtableController = require('../controllers/airtableController');

const router = express.Router();

router.get('/records', airtableController.getRecords);
router.get('/records/:recordId', airtableController.getRecord);
router.put('/records/:recordId', airtableController.updateRecord);
router.post('/records/:recordId/autofill', airtableController.autofillRecord);

module.exports = router;

