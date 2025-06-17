import React from 'react';
import PropTypes from 'prop-types';
import '../styles/OrderProgressTracker.css';

const OrderProgressTracker = ({ currentStatus, onStatusChange, editable = false }) => {
  const statusSteps = [
    "Nevertinta",
    "Vertinama",
    "Projektuojama",
    "Komercinis pasiūlymas",
    "Laukiama patvirtinimo",
    "Gaminama",
    "Paruošta pristatymui",
    "Pristatoma / Montuojama",
    "Užbaigta",
  ];
  
  const currentIndex = statusSteps.indexOf(currentStatus);
  
  return (
    <div className="progress-tracker">
      <div className="steps-container">
        {statusSteps.map((step, index) => (
          <div 
            key={step} 
            className={`step ${index <= currentIndex ? 'completed' : ''} ${index === currentIndex ? 'current' : ''}`}
          >
            <div className="step-circle">
              {index < currentIndex ? '✓' : index + 1}
            </div>
            <div className="step-label">
              {editable ? (
                <button
                  className={`step-button ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => onStatusChange(step)}
                >
                  {step}
                </button>
              ) : (
                <span>{step}</span>
              )}
            </div>
            {index < statusSteps.length - 1 && (
              <div className={`step-connector ${index < currentIndex ? 'completed' : ''}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

OrderProgressTracker.propTypes = {
  currentStatus: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func,
  editable: PropTypes.bool,
};

export default OrderProgressTracker;