// src/components/Notification.jsx
import React, { useEffect } from 'react';
import '../adminStyles.css';

const Notification = ({ mensaje, tipo = 'success', visible, onClose }) => {
    useEffect(() => {
        if (visible && mensaje) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [visible, mensaje, onClose]);

    if (!visible || !mensaje) return null;

    return (
        <div className={`notification notification-${tipo}`}>
            <div className="notification-content">
                <span className="notification-icon">
                    {tipo === 'success' ? '✅' : tipo === 'error' ? '❌' : 'ℹ️'}
                </span>
                <span className="notification-message">{mensaje}</span>
                <button className="notification-close" onClick={onClose}>×</button>
            </div>
        </div>
    );
};

export default Notification;