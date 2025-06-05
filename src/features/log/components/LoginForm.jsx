import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalVerificarCorreo from './VerificaCorreo';
import ModalIngresarCodigo from './VerificarCodigo';
import ModalCambiarContrasena from './CambiarContrasena';

const LoginForm = () => {
  const [mostrarModalCorreo, setMostrarModalCorreo] = useState(false);
  const [mostrarModalCodigo, setMostrarModalCodigo] = useState(false);
  const [mostrarModalCambio, setMostrarModalCambio] = useState(false);
  const [codigoGenerado, setCodigoGenerado] = useState(null);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  const adminCredentials = [
    { email: 'admin@delicias.com', password: 'admin123' },
    { email: 'administrador@empresa.com', password: 'admin' },
    { email: 'root@sistema.com', password: '123456' }
  ];

  const clienteCredentials = [
    { email: 'cliente@correo.com', password: 'cliente123' },
    { email: 'usuario@gmail.com', password: '123456' }
  ];

  const manejarCodigoGenerado = (codigo) => {
    setCodigoGenerado(codigo);
    setMostrarModalCorreo(false);
    setMostrarModalCodigo(true);
  };

  const cerrarModales = () => {
    setMostrarModalCorreo(false);
    setMostrarModalCodigo(false);
    setMostrarModalCambio(false);
  };

  const manejarCodigoValido = () => {
    setMostrarModalCodigo(false);
    setMostrarModalCambio(true);
  };

  const manejarContrasenaCambiada = () => {
    showCustomAlert('success', 'Contraseña actualizada. Por favor inicia sesión.');
    cerrarModales();
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const determinarRolUsuario = (email, password) => {
    const esAdmin = adminCredentials.some(
      cred => cred.email === email && cred.password === password
    );

    if (esAdmin) return 'admin';

    const esCliente = clienteCredentials.some(
      cred => cred.email === email && cred.password === password
    );

    if (esCliente) return 'cliente';

    if (email.includes('admin') || email.includes('administrador') || email.includes('root')) {
      return 'admin';
    }

    return 'cliente';
  };

  const manejarSubmit = (e) => {
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

    // Verificar si el email existe en cualquiera de las listas
    const existeEmailEnAdmins = adminCredentials.some(cred => cred.email === email);
    const existeEmailEnClientes = clienteCredentials.some(cred => cred.email === email);

    if (!existeEmailEnAdmins && !existeEmailEnClientes) {
      showCustomAlert('error', 'Usuario no encontrado. Por favor, regístrate.');
      return;
    }

    // Verificar si la combinación email+password es correcta
    const usuarioExiste =
      adminCredentials.some(cred => cred.email === email && cred.password === password) ||
      clienteCredentials.some(cred => cred.email === email && cred.password === password);

    if (!usuarioExiste) {
      showCustomAlert('error', 'Contraseña incorrecta.');
      return;
    }

    const userRole = determinarRolUsuario(email, password);

    localStorage.setItem('authToken', 'fake-jwt-token');
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userEmail', email);

    showCustomAlert('success', 'Inicio de sesión exitoso ✅');

    setTimeout(() => {
      if (userRole === 'admin') {
        navigate('/admin/pages/Dashboard');
      } else {
        navigate('/');
      }
      window.location.reload();
    }, 1500);
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
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleInputChange}
          required
        />

        <a
          type="button"
          className="forgot-password"
          onClick={() => setMostrarModalCorreo(true)}
        >
          ¿Olvidaste tu contraseña?
        </a>

        <button type="submit" className="hiddenn1">
          Iniciar
        </button>
      </form>

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
    </div>
  );
};

export default LoginForm;