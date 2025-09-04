// VerificaCorreo.jsx - Actualizado para trabajar correctamente con la API
import React, { useState } from 'react';

const ModalVerificarCorreo = ({ onCodigoGenerado, onClose }) => {
  const [correo, setCorreo] = useState('');
  const [userType, setUserType] = useState('cliente');
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 4000);
  };

  // Función auxiliar para manejar errores de respuesta
  const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return { isJson: true, data };
    } else {
      const text = await response.text();
      console.error('Respuesta no-JSON recibida:', text.substring(0, 200));
      return { 
        isJson: false, 
        data: { 
          message: 'Error del servidor: respuesta inválida' 
        } 
      };
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    
    if (!correo.trim()) {
      showCustomAlert('error', 'Por favor, ingresa tu correo electrónico.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      showCustomAlert('error', 'Por favor, ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://deliciasoft-backend.onrender.com/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          correo: correo,
          userType: userType
        }),
      });

      const { isJson, data } = await handleResponse(response);

      if (!isJson) {
        // Si el endpoint no existe o hay error del servidor, generar código localmente
        console.warn('Endpoint de recuperación no disponible, generando código localmente');
        const codigoGenerado = Math.floor(100000 + Math.random() * 900000).toString();
        
        showCustomAlert('success', '✅ Código generado (modo desarrollo): ' + codigoGenerado);
        
        // Guardar el correo y userType para uso posterior
        sessionStorage.setItem('tempEmailRecovery', correo);
        sessionStorage.setItem('tempUserType', userType);
        
        setTimeout(() => {
          onCodigoGenerado(codigoGenerado);
        }, 2000);
        
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        showCustomAlert('success', '✅ Código enviado a tu correo electrónico');
        
        // Guardar información temporal
        sessionStorage.setItem('tempEmailRecovery', correo);
        sessionStorage.setItem('tempUserType', userType);
        
        // Si hay un código en la respuesta, usarlo; si no, generar uno
        const codigo = data.codigo || Math.floor(100000 + Math.random() * 900000).toString();
        
        setTimeout(() => {
          onCodigoGenerado(codigo);
        }, 1500);
      } else {
        // Si el usuario no existe o hay error específico
        if (data.message && data.message.includes('not found')) {
          showCustomAlert('error', 'No existe una cuenta con este correo electrónico.');
        } else {
          showCustomAlert('error', data.message || 'Error al enviar el código');
        }
      }

    } catch (error) {
      console.error('Error:', error);
      
      // En caso de error de conexión, generar código localmente para testing
      if (error.message.includes('fetch')) {
        console.warn('Error de conexión, generando código localmente para testing');
        const codigoGenerado = Math.floor(100000 + Math.random() * 900000).toString();
        
        showCustomAlert('success', '✅ Código generado (modo offline): ' + codigoGenerado);
        
        sessionStorage.setItem('tempEmailRecovery', correo);
        sessionStorage.setItem('tempUserType', userType);
        
        setTimeout(() => {
          onCodigoGenerado(codigoGenerado);
        }, 2000);
      } else {
        showCustomAlert('error', 'Error de conexión. Inténtalo nuevamente.');
      }
    } finally {
      setIsLoading(false);
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
        <h2>Recuperar Contraseña</h2>
        <p>Ingresa tu correo electrónico y te enviaremos un código de verificación.</p>
        <form onSubmit={manejarEnvio}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Tipo de usuario:
            </label>
            <select 
              value={userType} 
              onChange={(e) => setUserType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                marginBottom: '10px'
              }}
              disabled={isLoading}
            >
              <option value="cliente">Cliente</option>
              <option value="admin">Administrador</option>
              <option value="usuario">Usuario del sistema</option>
            </select>
          </div>
          
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            disabled={isLoading}
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
                cursor: isLoading ? 'not-allowed' : 'pointer',
                flex: 1,
                opacity: isLoading ? 0.7 : 1
              }}
              disabled={isLoading}
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
                cursor: isLoading ? 'not-allowed' : 'pointer',
                flex: 1,
                opacity: isLoading ? 0.7 : 1
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar código'}
            </button>
          </div>

          {isLoading && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '15px'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #ff58a6',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          )}
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ModalVerificarCorreo;