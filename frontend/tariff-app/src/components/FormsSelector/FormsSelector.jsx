// frontend/src/components/FormsSelector/FormsSelector.jsx
import React from 'react';

const FormsSelector = ({ selectedData, onClose }) => {
  const forms = [
    'Customs Declaration Form',
    'Import Permit',
    'Certificate of Origin',
    'Commercial Invoice',
    'Packing List'
  ];

  const handleFormSelect = (formName) => {
    // Handle form generation logic here
    console.log(`Generating ${formName} for:`, selectedData);
    alert(`Form "${formName}" will be generated for the selected data.`);
  };

  return (
    <div className="forms-selector">
      <div className="panel-header">
        <h3>Select Forms to Generate</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      
      <div className="panel-content">
        {selectedData && (
          <div className="selected-data-info">
            <strong>Selected:</strong> {selectedData.fieldName} = {selectedData.value}
          </div>
        )}
        
        <div className="forms-list">
          <h4>Available Forms:</h4>
          {forms.map((form, index) => (
            <button
              key={index}
              className="form-option"
              onClick={() => handleFormSelect(form)}
            >
              {form}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormsSelector;