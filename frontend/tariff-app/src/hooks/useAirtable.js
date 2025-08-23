// frontend/src/hooks/useAirtable.js
import { useState, useEffect } from 'react';
import { airtableService } from '../services/airtableService'

export const useAirtable = () => {
  const [data, setData] = useState({ records: [], fields: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Starting to fetch Airtable data...');
        setLoading(true);
        console.log('📡 Calling airtableService.getRecords()...');
        const result = await airtableService.getRecords();
        console.log('✅ Received data from service:', result);
        setData(result);
      } catch (err) {
        console.error('❌ Error fetching Airtable data:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        setError(err);
      } finally {
        setLoading(false);
        console.log('🏁 Fetch operation completed');
      }
    };

    fetchData();
  }, []);

  const updateRecord = async (recordId, fields) => {
    try {
      const updatedRecord = await airtableService.updateRecord(recordId, fields);
      setData(prevData => ({
        ...prevData,
        records: prevData.records.map(record => 
          record.id === recordId ? updatedRecord : record
        )
      }));
      return updatedRecord;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return { data, loading, error, updateRecord };
};