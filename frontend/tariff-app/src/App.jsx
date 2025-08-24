// frontend/src/App.jsx
import React, { useState } from 'react';
import AirtableGrid from './components/AirtableGrid/AirtableGrid';
import RagPanel from './components/RagPanel/RagPanel';
import FormsSelector from './components/FormsSelector/FormsSelector';
import ToastContainer from './components/Toast/ToastContainer';
import './App.css';

function App() {
  const [selectedCell, setSelectedCell] = useState(null);
  const [showRAGPanel, setShowRAGPanel] = useState(false);
  const [showFormsSelector, setShowFormsSelector] = useState(false);

  const handleQuestionClick = (cellData) => {
    setSelectedCell(cellData);
    setShowRAGPanel(true);
  };

  const handleAutofillClick = (cellData) => {
    console.log('Autofill requested for:', cellData);
    
  };

  const handleRAGPanelClose = () => {
    setShowRAGPanel(false);
    setSelectedCell(null);
  };

  const handleQuestionSubmit = (question, answer) => {
    console.log('Question submitted:', question);
    console.log('Answer received:', answer);
    // You can implement additional logic here, like saving to a log
  };

  return (
    <>
      <ToastContainer />
      <div className="app">
        <div className="app-header">
          <h1>Tariff Classification Assistant</h1>
          <p>Interactive Airtable with AI-powered insights</p>
        </div>
        
        <div className="main-content">
          <AirtableGrid 
            onCellSelect={setSelectedCell}
            onQuestionClick={handleQuestionClick}
            onAutofillClick={handleAutofillClick}
            onFormSelect={() => setShowFormsSelector(true)}
          />
        </div>
        
        {showRAGPanel && (
          <RagPanel 
            isOpen={showRAGPanel}
            selectedCell={selectedCell}
            onClose={handleRAGPanelClose}
            onQuestionSubmit={handleQuestionSubmit}
          />
        )}
        
        {showFormsSelector && (
          <FormsSelector
            selectedData={selectedCell}
            onClose={() => setShowFormsSelector(false)}
          />
        )}
      </div>
    </>
  );
}

export default App;