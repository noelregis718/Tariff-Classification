const airtableService = require('../services/airtableService');

class AirtableController {
  async getRecords(req, res, next) {
    try {
      const records = await airtableService.getAllRecords();
      res.json(records);
    } catch (error) {
      next(error);
    }
  }

  async getRecord(req, res, next) {
    try {
      const { recordId } = req.params;
      const record = await airtableService.getRecord(recordId);
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async updateRecord(req, res, next) {
    try {
      const { recordId } = req.params;
      const { fields } = req.body;
      const updatedRecord = await airtableService.updateRecord(recordId, fields);
      res.json(updatedRecord);
    } catch (error) {
      next(error);
    }
  }

  async autofillRecord(req, res, next) {
    try {
      const { recordId } = req.params;
      const { targetFields } = req.body;
      const result = await airtableService.autofillRecord(recordId, targetFields);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AirtableController();