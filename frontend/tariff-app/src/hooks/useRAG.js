// frontend/src/hooks/useRAG.js
import { useState } from 'react';
import { ragService } from '../services/ragService';

export const useRAG = () => {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sources, setSources] = useState([]);
  const [confidence, setConfidence] = useState(null);

  const askQuestion = async (query, selectedCell) => {
    setLoading(true);
    setError(null);
    setAnswer('');
    setSources([]);
    setConfidence(null);
    
    try {
      // Prepare the context from selected cell
      const context = selectedCell ? `${selectedCell.fieldName}: ${selectedCell.value}` : "";

      // Use the RAG service to make the API call
      const data = await ragService.askQuestion(query, context);
      
      // Set the response data
      setAnswer(data.answer || 'No answer received');
      setSources(data.sources || []);
      setConfidence(data.confidence || null);
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to get answer from RAG service';
      setError({ message: errorMessage });
      console.error('RAG API error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { 
    answer, 
    loading, 
    error, 
    sources, 
    confidence, 
    askQuestion 
  };
};
