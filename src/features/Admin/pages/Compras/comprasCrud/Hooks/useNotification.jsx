import { useState } from 'react';

export const useNotification = () => {
    const [notification, setNotification] = useState({ 
        visible: false, 
        mensaje: '', 
        tipo: 'success' 
    });

    const showNotification = (mensaje, tipo = 'success') => {
        setNotification({
            visible: true,
            mensaje,
            tipo
        });
    };

    const hideNotification = () => {
        setNotification({
            visible: false,
            mensaje: '',
            tipo: 'success'
        });
    };

    return {
        notification,
        showNotification,
        hideNotification
    };
};