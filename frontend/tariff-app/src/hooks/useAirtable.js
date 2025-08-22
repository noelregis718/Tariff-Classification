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
        setLoading(true);
        const result = await airtableService.getRecords();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
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