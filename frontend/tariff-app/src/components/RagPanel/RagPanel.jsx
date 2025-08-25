import React, { useState } from 'react';
import { useRAG } from '../../hooks/useRAG';

const RagPanel = ({ 
  isOpen, 
  onClose, 
  selectedCell, 
  onQuestionSubmit 
}) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { askQuestion, answer, loading, error, sources, confidence } = useRAG();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const contextualQuestion = `Regarding the ${selectedCell?.fieldName} field with value "${selectedCell?.value}": ${question}`;
      
      await askQuestion(contextualQuestion, selectedCell);
      onQuestionSubmit && onQuestionSubmit(question, answer);
    } catch (error) {
      console.error('Failed to get answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setQuestion('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="rag-panel-overlay">
      <div className="rag-panel">
        <div className="rag-panel-header">
          <h3>Tariff Assistant</h3>
          <button onClick={handleClose} className="close-btn">×</button>
        </div>
        
        {selectedCell && (
          <div className="selected-cell-info">
            <strong>Field:</strong> {selectedCell.fieldName}
            <br />
            <strong>Value:</strong> {selectedCell.value}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="question-form">
          <div className="input-group">
            <label htmlFor="question">Ask a question:</label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Why is this not Chapter 90? What's the rationale for this classification?"
              rows={3}
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading || !question.trim()}
          >
            {isLoading ? 'Thinking...' : 'Ask Question'}
          </button>
        </form>
        
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Analyzing your question...</p>
          </div>
        )}
        
        {error && (
          <div className="error">
            <p>❌ Error: {error.message}</p>
          </div>
        )}
        
        {answer && !loading && (
          <div className="answer-section">
            <h4>Answer:</h4>
            <div className="answer-content">
              {answer}
            </div>
            
            {confidence !== null && (
              <div className="confidence-info">
                <strong>Confidence:</strong> {Math.round((confidence + 1) * 50)}%
              </div>
            )}
            
            {sources && sources.length > 0 && (
              <div className="sources-section">
                <h5>Sources:</h5>
                <div className="sources-list">
                  {sources.map((source, index) => (
                    <div key={index} className="source-item">
                      <div className="source-header">
                        <strong>Part Number:</strong> {source.metadata?.part_number || 'N/A'}
                        <span className="similarity-score">
                          Similarity: {Math.round((source.similarity + 1) * 50)}%
                        </span>
                      </div>
                      <div className="source-content">
                        {source.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="suggested-questions">
          <h4>Suggested Questions:</h4>
          <ul>
            <li>
              <button 
                onClick={() => setQuestion("Why is this not Chapter 90?")}
                className="suggestion-btn"
              >
                Why is this not Chapter 90?
              </button>
            </li>
            <li>
              <button 
                onClick={() => setQuestion("What's the rationale for this HTS code?")}
                className="suggestion-btn"
              >
                What's the rationale for this HTS code?
              </button>
            </li>
            <li>
              <button 
                onClick={() => setQuestion("Are there alternative classifications?")}
                className="suggestion-btn"
              >
                Are there alternative classifications?
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RagPanel;