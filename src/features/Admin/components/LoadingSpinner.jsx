import React from 'react';
import './loading.css';

const LoadingSpinner = ({ mensaje = "Cargando...", fullScreen = true }) => {
    const containerClass = fullScreen ? "loading-overlay" : "loading-inline";
    
    return (
        <div className={containerClass}>
            <div className="loading-content">
                <div className="loading-logo-container">
                    <img 
                        src="https://res.cloudinary.com/dagnilue0/image/upload/v1758509815/deliciasoft/productos/xkqs3t5g25ejf3lylzuh.png" 
                        alt="Delicias Darsy"
                        className="loading-logo"
                    />
                    <div className="loading-spinner"></div>
                </div>
                <p className="loading-text">{mensaje}</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;