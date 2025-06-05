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

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

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
    alert("Contraseña actualizada. Por favor inicia sesión.");
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

    // Validaciones
    if (!email.trim() || !password.trim()) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Correo electrónico no válido.');
      return;
    }

    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const userRole = determinarRolUsuario(email, password);

    localStorage.setItem('authToken', 'fake-jwt-token');
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userEmail', email);

    alert('Inicio de sesión exitoso');

    if (userRole === 'admin') {
      navigate('/admin/pages/CategoriaInsumo');
    } else {
      navigate('/');
    }

    window.location.reload();
  };

  return (
    <div className="form-container sign-in">
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

        <button type="submit" className="hiddenn1">Iniciar</button>
      </form>

      {mostrarModalCorreo && (
        <ModalVerificarCorreo
          onCodigoGenerado={manejarCodigoGenerado}
          onClose={cerrarModales}
        />
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
