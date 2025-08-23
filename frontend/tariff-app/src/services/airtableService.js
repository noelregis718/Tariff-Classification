const AIRTABLE_API_BASE = import.meta.env.VITE_API_URL;

class AirtableService {
  async getRecords() {
    console.log('🌐 AirtableService: Making fetch request to:', `${AIRTABLE_API_BASE}/api/airtable/records`);
    console.log('🌐 AirtableService: API Base URL:', AIRTABLE_API_BASE);
    
    try {
      if (!AIRTABLE_API_BASE) {
        throw new Error('API base URL is not configured. Please check your environment variables.');
      }

      const response = await fetch(`${AIRTABLE_API_BASE}/api/airtable/records`);
      console.log('📡 AirtableService: Response status:', response.status);
      console.log('📡 AirtableService: Response ok:', response.ok);
      
      if (!response.ok) {
        let errorMessage = `Failed to fetch records: ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        } catch (parseError) {
          console.warn('Could not parse error response:', parseError);
        }
        
        console.error('❌ AirtableService: Response not ok. Status:', response.status, 'Error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('✅ AirtableService: Successfully parsed response:', data);
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format received from server');
      }
      
      if (!Array.isArray(data.records)) {
        console.warn('Records array is missing or invalid, defaulting to empty array');
        data.records = [];
      }
      
      if (!Array.isArray(data.fields)) {
        console.warn('Fields array is missing or invalid, defaulting to empty array');
        data.fields = [];
      }
      
      return data;
    } catch (error) {
      console.error('❌ AirtableService: Fetch error:', error);
      
      // Provide user-friendly error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
      }
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Server connection failed. Please try again later.');
      }
      
      throw error;
    }
  }

  async updateRecord(recordId, fields) {
    try {
      if (!AIRTABLE_API_BASE) {
        throw new Error('API base URL is not configured');
      }

      if (!recordId) {
        throw new Error('Record ID is required');
      }

      if (!fields || typeof fields !== 'object') {
        throw new Error('Fields object is required');
      }

      const response = await fetch(`${AIRTABLE_API_BASE}/api/airtable/records/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
      });

      if (!response.ok) {
        let errorMessage = `Failed to update record: ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        } catch (parseError) {
          console.warn('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ AirtableService: Update record error:', error);
      throw error;
    }
  }

  async getRecord(recordId) {
    try {
      if (!AIRTABLE_API_BASE) {
        throw new Error('API base URL is not configured');
      }

      if (!recordId) {
        throw new Error('Record ID is required');
      }

      const response = await fetch(`${AIRTABLE_API_BASE}/api/airtable/records/${recordId}`);
      
      if (!response.ok) {
        let errorMessage = `Failed to fetch record: ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        } catch (parseError) {
          console.warn('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ AirtableService: Get record error:', error);
      throw error;
    }
  }
}

export const airtableService = new AirtableService();