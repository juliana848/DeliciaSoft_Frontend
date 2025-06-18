import React, { useState } from 'react';

const ModalVerificarCorreo = ({ onClose, onCodigoGenerado }) => {
  const [correo, setCorreo] = useState('');
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    
    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      showCustomAlert('error', 'Por favor, ingresa un correo electrónico válido.');
      return;
    }

    const codigo = '665544'; 
    showCustomAlert('success', '✅ Código de verificación enviado a tu correo');
    
    // Esperar un momento antes de continuar para que el usuario vea la alerta
    setTimeout(() => {
      onCodigoGenerado(codigo);
    }, 1500);
  };

  return (
    <div className="modalrecuperar">
      {/* Alerta personalizada */}
      {showAlert.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 2000,
            padding: '1rem 1.5rem',
            borderRadius: '15px',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.9rem',
            minWidth: '300px',
            background:
              showAlert.type === 'success'
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #ec4899, #be185d)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            animation: 'slideInRight 0.5s ease-out'
          }}
        >
          {showAlert.message}
        </div>
      )}

      <div className="modal-contenidorecupera">
        <h2>Recuperar Contraseña</h2>
        <p>Ingresa tu correo electrónico y te enviaremos un código de verificación.</p>
        <form onSubmit={manejarEnvio}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <div className="botones" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-enviar"
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                flex: 1
              }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-enviar"
              style={{
                backgroundColor: '#ff58a6',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                flex: 1
              }}
            >
              Enviar código
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalVerificarCorreo;