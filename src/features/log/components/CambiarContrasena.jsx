import React, { useState } from 'react';

const ModalCambiarContrasena = ({ onClose, onContrasenaCambiada }) => {
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  const validarContrasena = (contrasena) => {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    return regex.test(contrasena);
  };

  const manejarCambio = (e) => {
    e.preventDefault();

    if (!nuevaContrasena.trim() || !confirmarContrasena.trim()) {
      showCustomAlert('error', 'Por favor, completa todos los campos.');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      showCustomAlert('error', '❌ Las contraseñas no coinciden.');
      return;
    }

    if (!validarContrasena(nuevaContrasena)) {
      showCustomAlert('error', '❌ La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial.');
      return;
    }

    // Simular actualización exitosa
    showCustomAlert('success', '✅ Contraseña actualizada correctamente');
    
    // Esperar un momento antes de continuar para que el usuario vea la alerta
    setTimeout(() => {
      onContrasenaCambiada();
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
        <h2>Cambiar Contraseña</h2>
        <p>Crea una nueva contraseña segura para tu cuenta.</p>
        <form onSubmit={manejarCambio}>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmarContrasena}
            onChange={(e) => setConfirmarContrasena(e.target.value)}
            required
          />
          
          {/* Información sobre requisitos de contraseña */}
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            marginTop: '10px',
            backgroundColor: '#f8f9fa',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #dee2e6'
          }}>
            <strong>Requisitos de contraseña:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
              <li>Al menos 8 caracteres</li>
              <li>Una letra mayúscula</li>
              <li>Un carácter especial (!@#$%^&*)</li>
            </ul>
          </div>

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
              Cambiar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCambiarContrasena;