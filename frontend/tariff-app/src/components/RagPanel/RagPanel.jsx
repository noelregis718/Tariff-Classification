// frontend/src/components/RagPanel/RagPanel.jsx
import React, { useState } from 'react';
import { useRAG } from '../../hooks/useRAG';

const RAGPanel = ({ selectedCell, onClose }) => {
  const [query, setQuery] = useState('');
  const { answer, loading, askQuestion } = useRAG();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    await askQuestion(query, selectedCell);
    setQuery('');
  };

  const getSuggestedQuestions = () => {
    if (selectedCell?.fieldName === 'final_hts_code') {
      return [
        'Why is this classified in this chapter?',
        'What are the key characteristics for this classification?',
        'Are there any similar items in different chapters?',
        'What documentation is required for this HTS code?'
      ];
    }
    return [];
  };

  return (
    <div className="rag-panel">
      <div className="panel-header">
        <h3>Ask about: {selectedCell?.fieldName}</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      
      <div className="panel-content">
        <div className="selected-cell-info">
          <strong>Value:</strong> {selectedCell?.value}
        </div>
        
        <div className="suggested-questions">
          <h4>Common Questions:</h4>
          {getSuggestedQuestions().map((question, idx) => (
            <button
              key={idx}
              className="suggested-question"
              onClick={() => askQuestion(question, selectedCell)}
            >
              {question}
            </button>
          ))}
        </div>
        
        <div className="chat-interface">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !query.trim()}>
              {loading ? 'Asking...' : 'Ask'}
            </button>
          </form>
          
          {loading && <div className="loading">Getting answer...</div>}
          {answer && (
            <div className="answer">
              <strong>Answer:</strong> {answer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RAGPanel;