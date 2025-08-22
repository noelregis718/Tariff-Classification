const AIRTABLE_API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class AirtableService {
  async getRecords() {
    const response = await fetch(`${AIRTABLE_API_BASE}/api/airtable/records`);
    if (!response.ok) throw new Error('Failed to fetch records');
    return response.json();
  }

  async updateRecord(recordId, fields) {
    const response = await fetch(`${AIRTABLE_API_BASE}/api/airtable/records/${recordId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    if (!response.ok) throw new Error('Failed to update record');
    return response.json();
  }

  async getRecord(recordId) {
    const response = await fetch(`${AIRTABLE_API_BASE}/api/airtable/records/${recordId}`);
    if (!response.ok) throw new Error('Failed to fetch record');
    return response.json();
  }
}

export const airtableService = new AirtableService();