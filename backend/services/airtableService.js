// backend/src/services/airtableService.js
const Airtable = require('airtable');
const path = require('path');

// Load environment variables from the correct path
require('dotenv').config('.env');

class AirtableService {
  constructor() {
    // Log configuration for debugging
    console.log('Airtable Configuration:');
    console.log('API Key:', process.env.AIRTABLE_API_KEY ? '✓ Set' : '✗ Missing');
    console.log('Base ID:', process.env.AIRTABLE_BASE_ID ? '✓ Set' : '✗ Missing');
    console.log('Table Name:', process.env.AIRTABLE_TABLE_NAME ? '✓ Set' : '✗ Missing');
    
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_TABLE_NAME) {
      throw new Error('Missing required Airtable environment variables');
    }

    try {
      this.base = new Airtable({
        apiKey: process.env.AIRTABLE_API_KEY
      }).base(process.env.AIRTABLE_BASE_ID);
      
      // Clean up table name - remove .csv extension if present
      const tableName = process.env.AIRTABLE_TABLE_NAME.replace('.csv', '');
      this.table = this.base(tableName);
      
      console.log('✓ Airtable service initialized successfully');
    } catch (error) {
      console.error('✗ Failed to initialize Airtable service:', error.message);
      throw error;
    }
  }

  async getAllRecords() {
    try {
      console.log('Fetching records from Airtable...');
      const records = await this.table.select().all();
      const fields = await this.getTableSchema();
      
      console.log(`✓ Successfully fetched ${records.length} records`);
      
      return {
        records: records.map(record => ({
          id: record.id,
          fields: record.fields
        })),
        fields
      };
    } catch (error) {
      console.error('✗ Failed to fetch records:', error.message);
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
      console.error('✗ Failed to fetch record:', error.message);
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
      console.error('✗ Failed to update record:', error.message);
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
      console.error('✗ Failed to autofill record:', error.message);
      throw new Error(`Failed to autofill record: ${error.message}`);
    }
  }

  async getTableSchema() {
    try {
      // Get the actual table schema from Airtable
      const records = await this.table.select({ maxRecords: 1 }).all();
      if (records.length > 0) {
        const sampleRecord = records[0];
        return Object.keys(sampleRecord.fields).map(fieldName => ({
          id: fieldName,
          name: fieldName,
          type: 'singleLineText' // Default type for most fields
        }));
      }
      
      // If no records exist, return an empty array
      return [];
    } catch (error) {
      console.error('✗ Failed to get table schema:', error.message);
      // Return empty array instead of hardcoded fields
      return [];
    }
  }
}

module.exports = new AirtableService();