import React, { useState } from 'react';
import { fillForm } from '../../services/formService';

const FormsSelector = ({ selectedData, onClose }) => {
  const forms = [
    'Form 3461',
    'Form 7501'
  ];

  const [formLinks, setFormLinks] = useState([]);
  const [formMessage, setFormMessage] = useState('');

  const handleFormSelect = async (formName) => {
    const formType = formName.includes('3461') ? '3461' : '7501';
    window.showToast && window.showToast(`Filling ${formName}...`, 'info', 3000);
    const response = await fillForm(formType);
    window.showToast && window.showToast(response.message, response.files.length ? 'success' : 'error', 7000);
    setFormMessage(response.message);
    setFormLinks(response.files || []);
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

        {formMessage && (
          <div className="form-message">
            <strong>{formMessage}</strong>
          </div>
        )}
        {formLinks.length > 0 && (
          <div className="form-links">
            <h4>Filled Forms:</h4>
            <ul>
              {formLinks.map((file, idx) => {
                // Convert local path to backend URL for download
                const backendPrefix = '/Users/siddharth/VSCODE/tariff_classification/backend/filled_forms/';
                let url = file;
                if (file.startsWith(backendPrefix)) {
                  url = 'http://localhost:3001/filled_forms/' + file.substring(backendPrefix.length);
                }
                return (
                  <li key={idx}>
                    <a href={url} download target="_blank" rel="noopener noreferrer">
                      Download {file.split('/').pop()}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsSelector;