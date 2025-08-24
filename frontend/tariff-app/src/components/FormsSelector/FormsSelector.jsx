// frontend/src/components/FormsSelector/FormsSelector.jsx
import React from 'react';
import { fillForm } from '../../services/formService';

const FormsSelector = ({ selectedData, onClose }) => {
  const forms = [
    'Form 3461',
    'Form 7501'
  ];

  const handleFormSelect = async (formName) => {
    const formType = formName.includes('3461') ? '3461' : '7501';
    // Show loading toast
    const toastId = window.showToast && window.showToast(`Filling ${formName}...`, 'info', 3000);
    const response = await fillForm(formType);
    // Show result toast
    window.showToast && window.showToast(response.message, response.files.length ? 'success' : 'error', 7000);
    // Optionally, handle files (e.g., display links)
    // You can add more UI for files if needed
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