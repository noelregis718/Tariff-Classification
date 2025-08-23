const AIRTABLE_API_BASE = import.meta.env.VITE_API_URL;

class AirtableService {
  async getRecords() {
    console.log('🌐 AirtableService: Making fetch request to:', `${AIRTABLE_API_BASE}/api/airtable/records`);
    console.log('🌐 AirtableService: API Base URL:', AIRTABLE_API_BASE);
    
    try {
      const response = await fetch(`${AIRTABLE_API_BASE}/api/airtable/records`);
      console.log('📡 AirtableService: Response status:', response.status);
      console.log('📡 AirtableService: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ AirtableService: Response not ok. Status:', response.status, 'Error:', errorText);
        throw new Error(`Failed to fetch records: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ AirtableService: Successfully parsed response:', data);
      return data;
    } catch (error) {
      console.error('❌ AirtableService: Fetch error:', error);
      throw error;
    }
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