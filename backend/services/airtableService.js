// backend/src/services/airtableService.js
const Airtable = require('airtable');
const dotenv = require('dotenv');

dotenv.config('.env');

class AirtableService {
  constructor() {
    this.base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY
    }).base(process.env.AIRTABLE_BASE_ID);
    
    this.table = this.base(process.env.AIRTABLE_TABLE_NAME);
  }

  async getAllRecords() {
    try {
      const records = await this.table.select().all();
      const fields = await this.getTableSchema();
      
      return {
        records: records.map(record => ({
          id: record.id,
          fields: record.fields
        })),
        fields
      };
    } catch (error) {
      throw new Error(`Failed to fetch records: ${error.message}`);
    }
  }

  async getRecord(recordId) {
    try {
      const record = await this.table.find(recordId);
      return {
        id: record.id,
        fields: record.fields
      };
    } catch (error) {
      throw new Error(`Failed to fetch record: ${error.message}`);
    }
  }

  async updateRecord(recordId, fields) {
    try {
      const updatedRecord = await this.table.update(recordId, fields);
      return {
        id: updatedRecord.id,
        fields: updatedRecord.fields
      };
    } catch (error) {
      throw new Error(`Failed to update record: ${error.message}`);
    }
  }

  async autofillRecord(recordId, targetFields) {
    try {
      const record = await this.getRecord(recordId);
      const ragService = require('./ragService');
      
      const autofilledData = await ragService.generateAutofill(record, targetFields);
      const updatedRecord = await this.updateRecord(recordId, autofilledData);
      
      return updatedRecord;
    } catch (error) {
      throw new Error(`Failed to autofill record: ${error.message}`);
    }
  }

  async getTableSchema() {
    // This would need to be implemented based on your specific Airtable setup
    // For now, return common fields
    return [
      { id: 'description', name: 'description', type: 'singleLineText' },
      { id: 'final_hts_code', name: 'final_hts_code', type: 'singleLineText' },
      { id: 'chapter', name: 'chapter', type: 'number' },
      { id: 'value', name: 'value', type: 'currency' },
      { id: 'country_of_origin', name: 'country_of_origin', type: 'singleLineText' }
    ];
  }
}

module.exports = new AirtableService();