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
  const [mostrarModalValidacionLogin, setMostrarModalValidacionLogin] = useState(false);
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
    setDatosLoginPendiente(null);
  };

  const manejarCodigoValido = () => {
    setMostrarModalCodigo(false);
    setMostrarModalCambio(true);
  };

  const manejarContrasenaCambiada = () => {
    showCustomAlert('success', 'Contraseña actualizada. Por favor inicia sesión.');
    cerrarModales();
  };

  const handleLoginSuccess = (userData, userType) => {
    console.log('Iniciando proceso de login exitoso...');
    console.log('Datos del usuario:', userData);
    console.log('Tipo de usuario:', userType);

    const redirectPath = localStorage.getItem('redirectAfterLogin');
    
    // Guardar tokens y datos de usuario
    localStorage.setItem('authToken', 'jwt-token-' + Date.now());
    localStorage.setItem('userRole', userType);
    localStorage.setItem('userEmail', datosLoginPendiente.email);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    const userForContact = {
      idcliente: userData.idcliente || userData.id,
      nombre: userData.nombre || '',
      apellidos: userData.apellidos || userData.apellido || '',
      correo: userData.correo || userData.email || datosLoginPendiente.email,
      telefono: userData.telefono || userData.celular || userData.phone || ''
    };
    
    localStorage.setItem('user', JSON.stringify(userForContact));
    
    if (redirectPath === '/contactenos') {
      localStorage.removeItem('redirectAfterLogin');
      sessionStorage.setItem('fromLogin', 'true');
      showCustomAlert('success', `Bienvenido ${userData.nombre}! Te redirigimos al formulario de contacto`);
      
      setTimeout(() => {
        navigate('/contactenos');
      }, 1000);
      return;
    }
    
    if (redirectPath) {
      localStorage.removeItem('redirectAfterLogin');
      sessionStorage.setItem('fromLogin', 'true');
      showCustomAlert('success', 'Inicio de sesión exitoso');
      
      setTimeout(() => {
        navigate(redirectPath);
      }, 1500);
      return;
    }
    
    showCustomAlert('success', 'Inicio de sesión exitoso');
    
    setTimeout(() => {
      if (userType === 'admin') {
        console.log('Redirigiendo al dashboard de admin...');
        navigate('/admin/pages/Dashboard');
      } else {
        console.log('Redirigiendo según productos temporales...');
        const productosTemporales = localStorage.getItem('productosTemporales');
        if (productosTemporales) {
          navigate('/pedidos');
        } else {
          navigate('/');
        }
      }
    }, 1500);
  };

  const completarLogin = async (codigoIngresado) => {
    if (!datosLoginPendiente) {
      console.error('No hay datos de login pendientes');
      showCustomAlert('error', 'Error: No hay datos de login');
      return;
    }

    console.log('Enviando código al servidor para validación:', codigoIngresado);
    console.log('Email:', datosLoginPendiente.email);

    setIsLoading(true);
    try {
      const result = await authService.loginConValidacion(
        datosLoginPendiente.email, 
        datosLoginPendiente.password, 
        codigoIngresado
      );

      console.log('Respuesta del servidor:', result);

      if (result.success) {
        setMostrarModalValidacionLogin(false);
        console.log('Login exitoso, procesando redirección...');
        handleLoginSuccess(result.user, result.userType);
      } else {
        console.error('Error en login:', result.message);
        showCustomAlert('error', result.message || 'Código incorrecto. Verifica tu email.');
      }
    } catch (error) {
      console.error('Error en completarLogin:', error);
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
      console.log('Iniciando proceso de login para:', email);
      
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath === '/contactenos') {
        showCustomAlert('success', 'Código de validación enviado. Una vez verificado, te redirigiremos al formulario de contacto');
      }

      const validacionResult = await authService.enviarCodigoValidacionLoginConDeteccion(email);
      
      console.log('Resultado envío código:', validacionResult);

      if (validacionResult.success) {
        setDatosLoginPendiente({ email, password });
        
        if (!redirectPath || redirectPath !== '/contactenos') {
          showCustomAlert('success', 'Código de validación enviado a tu correo');
        }
        
        console.log('Mostrando modal de validación...');
        setMostrarModalValidacionLogin(true);
        
      } else {
        showCustomAlert('error', validacionResult.message || 'Error al enviar código de validación');
      }

    } catch (error) {
      console.error('Error en manejarSubmit:', error);
      showCustomAlert('error', 'Error de conexión. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container sign-in">
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

      {localStorage.getItem('redirectAfterLogin') === '/contactenos' && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7, #fcd34d)',
          color: '#92400e',
          padding: '15px',
          borderRadius: '12px',
          marginBottom: '20px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '600',
          border: '2px solid #f59e0b'
        }}>
          <i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>
          Inicia sesión para autocompletar tus datos en el formulario de contacto
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

      {/* Modal validación de login - Solo envía el código al servidor */}
      {mostrarModalValidacionLogin && datosLoginPendiente && (
        <ModalIngresarCodigo
          codigoCorrecto="000000" // No importa, el servidor valida
          onClose={cerrarModales}
          onCodigoValido={completarLogin}
          correoEmail={datosLoginPendiente.email}
          esParaLogin={true}
        />
      )}

      {/* Modales para recuperación de contraseña */}
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
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LoginForm;