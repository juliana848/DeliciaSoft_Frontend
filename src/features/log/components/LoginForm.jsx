import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../Admin/services/authService'; 
import ModalVerificarCorreo from './VerificaCorreo';
import ModalIngresarCodigo from './VerificarCodigo';
import ModalCambiarContrasena from './CambiarContrasena';

const LoginForm = () => {
  const [mostrarModalCorreo, setMostrarModalCorreo] = useState(false);
  const [mostrarModalCodigo, setMostrarModalCodigo] = useState(false);
  const [mostrarModalCambio, setMostrarModalCambio] = useState(false);
  
  // Nuevo estado para la validación de login
  const [mostrarModalValidacionLogin, setMostrarModalValidacionLogin] = useState(false);
  const [codigoValidacionLogin, setCodigoValidacionLogin] = useState(null);
  const [datosLoginPendiente, setDatosLoginPendiente] = useState(null);
  
  const [codigoGenerado, setCodigoGenerado] = useState(null);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 4000);
  };

  const manejarCodigoGenerado = (codigo) => {
    setCodigoGenerado(codigo);
    setMostrarModalCorreo(false);
    setMostrarModalCodigo(true);
  };

  const cerrarModales = () => {
    setMostrarModalCorreo(false);
    setMostrarModalCodigo(false);
    setMostrarModalCambio(false);
    setMostrarModalValidacionLogin(false);
  };

  const manejarCodigoValido = () => {
    setMostrarModalCodigo(false);
    setMostrarModalCambio(true);
  };

  const manejarContrasenaCambiada = () => {
    showCustomAlert('success', 'Contraseña actualizada. Por favor inicia sesión.');
    cerrarModales();
  };

  // Nuevo manejador para validación de login
  const manejarCodigoValidacionLogin = (codigo) => {
    setCodigoValidacionLogin(codigo);
    setMostrarModalValidacionLogin(true);
  };

  const completarLogin = async () => {
    if (!datosLoginPendiente) return;

    setIsLoading(true);
    try {
      const result = await authService.loginConValidacion(datosLoginPendiente.email, datosLoginPendiente.password);

      if (result.success) {
        localStorage.setItem('authToken', 'jwt-token-' + Date.now());
        localStorage.setItem('userRole', result.userType);
        localStorage.setItem('userEmail', datosLoginPendiente.email);
        localStorage.setItem('userData', JSON.stringify(result.user));

        showCustomAlert('success', 'Inicio de sesión exitoso ✅');
        setMostrarModalValidacionLogin(false);

        setTimeout(() => {
          if (result.userType === 'admin') {
            navigate('/admin/pages/Dashboard');
          } else {
            const productosTemporales = localStorage.getItem('productosTemporales');
            if (productosTemporales) {
              navigate('/pedidos');
            } else {
              navigate('/');
              window.location.reload();
            }
          }
        }, 1500);
      } else {
        showCustomAlert('error', result.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error en login:', error);
      showCustomAlert('error', 'Error de conexión. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    // Validaciones básicas
    if (!email.trim() || !password.trim()) {
      showCustomAlert('error', 'Por favor, completa todos los campos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showCustomAlert('error', 'Correo electrónico no válido.');
      return;
    }

    if (password.length < 6) {
      showCustomAlert('error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      // Primero verificar si el usuario existe y enviar código
      const validacionResult = await authService.enviarCodigoValidacionLogin(email);

      if (validacionResult.success) {
        // Guardar datos para usar después de la validación
        setDatosLoginPendiente({ email, password });
        showCustomAlert('success', 'Código de validación enviado a tu correo ✅');
        
        // Mostrar modal de validación
        manejarCodigoValidacionLogin(validacionResult.codigo);
      } else {
        showCustomAlert('error', validacionResult.message || 'Error al enviar código de validación');
      }

    } catch (error) {
      console.error('Error en login:', error);
      showCustomAlert('error', 'Error de conexión. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container sign-in">
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

      <form className="login-form" onSubmit={manejarSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isLoading}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleInputChange}
          disabled={isLoading}
          required
        />

        <a
          type="button"
          className="forgot-password"
          onClick={() => setMostrarModalCorreo(true)}
          style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
        >
          ¿Olvidaste tu contraseña?
        </a>

        <button 
          type="submit" 
          className="hiddenn1"
          disabled={isLoading}
          style={{
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Enviando código...' : 'Iniciar'}
        </button>

        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '10px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #ffffff',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        )}
      </form>

      {/* Modal validación de login */}
      {mostrarModalValidacionLogin && (
        <ModalIngresarCodigoLogin
          codigoCorrecto={codigoValidacionLogin}
          onClose={cerrarModales}
          onCodigoValido={completarLogin}
        />
      )}

      {mostrarModalCorreo && (
        <ModalVerificarCorreo onCodigoGenerado={manejarCodigoGenerado} onClose={cerrarModales} />
      )}

      {mostrarModalCodigo && (
        <ModalIngresarCodigo
          codigoCorrecto={codigoGenerado}
          onClose={cerrarModales}
          onCodigoValido={manejarCodigoValido}
        />
      )}

      {mostrarModalCambio && (
        <ModalCambiarContrasena
          onClose={cerrarModales}
          onContrasenaCambiada={manejarContrasenaCambiada}
        />
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Componente para validación de código de login
const ModalIngresarCodigoLogin = ({ codigoCorrecto, onClose, onCodigoValido }) => {
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
      
      setTimeout(() => {
        onCodigoValido();
      }, 1500);
    } else {
      showCustomAlert('error', '❌ Código incorrecto. Inténtalo nuevamente.');
      setCodigoIngresado('');
    }
  };

  return (
    <div className="modalrecuperar">
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
        <h2>Verificar Acceso</h2>
        <p>Ingresa el código de 6 dígitos que enviamos a tu correo para iniciar sesión.</p>
        <form onSubmit={manejarVerificacion}>
          <input
            type="text"
            placeholder="Ingresa el código (ej: 123456)"
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
              Verificar e Iniciar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;