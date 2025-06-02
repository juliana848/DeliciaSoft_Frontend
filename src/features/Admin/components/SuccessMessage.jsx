import React from 'react';
import '../adminStyles.css'; // Puedes cambiar el nombre según tu convención

const SuccessMessage = ({ mensaje }) => {
    if (!mensaje) return null;

return (
    <div className="mensaje-exito">
        {mensaje}
    </div>
);
};

export default SuccessMessage;
