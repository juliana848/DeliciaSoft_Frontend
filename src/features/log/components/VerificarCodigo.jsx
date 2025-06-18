import React, { useState } from 'react';

const ModalIngresarCodigo = ({ codigoCorrecto, onClose, onCodigoValido }) => {
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  const manejarVerificacion = (e) => {
    e.preventDefault();
    
    if (!codigoIngresado.trim()) {
      showCustomAlert('error', 'Por favor, ingresa el código de verificación.');
      return;
    }

    if (codigoIngresado === codigoCorrecto) {
      showCustomAlert('success', '✅ Código verificado correctamente');
      
      // Esperar un momento antes de continuar para que el usuario vea la alerta
      setTimeout(() => {
        onCodigoValido();
      }, 1500);
    } else {
      showCustomAlert('error', '❌ Código incorrecto. Inténtalo nuevamente.');
      setCodigoIngresado(''); // Limpiar el campo
    }
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
        <h2>Verificar Código</h2>
        <p>Ingresa el código de 6 dígitos que enviamos a tu correo electrónico.</p>
        <form onSubmit={manejarVerificacion}>
          <input
            type="text"
            placeholder="Ingresa el código (ej: 665544)"
            value={codigoIngresado}
            onChange={(e) => setCodigoIngresado(e.target.value)}
            maxLength="6"
            style={{
              textAlign: 'center',
              fontSize: '18px',
              letterSpacing: '2px'
            }}
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
              Verificar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalIngresarCodigo;