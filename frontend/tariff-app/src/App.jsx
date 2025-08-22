// frontend/src/App.jsx
import React, { useState } from 'react';
import AirtableGrid from './components/AirtableGrid/AirtableGrid';
import RAGPanel from './components/RagPanel/RagPanel';
import FormsSelector from './components/FormsSelector/FormsSelector';
import './App.css';

function App() {
  const [selectedCell, setSelectedCell] = useState(null);
  const [showRAGPanel, setShowRAGPanel] = useState(false);
  const [showFormsSelector, setShowFormsSelector] = useState(false);

  return (
    <div className="app">
      <div>
        <h1>Tariff App</h1>
      </div>
      <div className="main-content">
        <AirtableGrid 
          onCellSelect={setSelectedCell}
          onQuestionClick={() => setShowRAGPanel(true)}
          onAutofillClick={() => {/* handle autofill */}}
          onFormSelect={() => setShowFormsSelector(true)}
        />
      </div>
      
      {showRAGPanel && (
        <RAGPanel 
          selectedCell={selectedCell}
          onClose={() => setShowRAGPanel(false)}
        />
      )}
      
      {showFormsSelector && (
        <FormsSelector
          selectedData={selectedCell}
          onClose={() => setShowFormsSelector(false)}
        />
      )}
    </div>
  );
}

export default App;