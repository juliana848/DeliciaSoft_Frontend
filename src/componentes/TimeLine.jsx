import React from 'react';

const Timeline = ({ items }) => {
  return (
    <div className="timeline">
      <div className="timeline-line">
        {items.map((item, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-marker">
              <div className="timeline-number">{index + 1}</div>
            </div>
            <div className="timeline-content">
              <h3 className="timeline-title">{item.title}</h3>
              <div className="timeline-image-container">
                <img 
                  src={item.image} 
                  alt={item.imageAlt} 
                  className="timeline-image" 
                />
              </div>
              <button 
                className="timeline-button"
                onClick={item.onButtonClick}
              >
                {item.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;