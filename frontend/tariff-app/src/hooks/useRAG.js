// frontend/src/hooks/useRAG.js
import { useState } from 'react';

export const useRAG = () => {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const askQuestion = async (query, selectedCell) => {
    setLoading(true);
    try {
      // Mock response for now - replace with actual RAG API call
      const mockAnswer = `This is a mock response to: "${query}" for the selected cell: ${selectedCell?.fieldName} = ${selectedCell?.value}`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnswer(mockAnswer);
    } catch (error) {
      setAnswer('Error: Failed to get answer');
      console.error('RAG API error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { answer, loading, askQuestion };
};
