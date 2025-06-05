import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // <-- Importa useNavigate
const RegisterForm = () => {
 const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    tipoDocumento: '',
    documento: '',
    contacto: '',
    password: '',
  });

  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const {
      nombre,
      apellido,
      correo,
      tipoDocumento,
      documento,
      contacto,
      password,
    } = formData;

    if (
      !nombre.trim() ||
      !apellido.trim() ||
      !correo.trim() ||
      !tipoDocumento ||
      !documento.trim() ||
      !contacto.trim() ||
      !password.trim()
    ) {
      alert('Por favor, completa todos los campos.');
      showCustomAlert('error', 'Por favor, completa todos los campos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      alert('Correo electrónico no válido.');
      showCustomAlert('error', 'Correo electrónico no válido.');
      return;
    }

    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    alert('¡Registro exitoso!');
    console.log('Datos registrados:', formData);

    // Redirige a la ruta '/' después del registro exitoso
    navigate('/');
      showCustomAlert('error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // Simulación de registro exitoso
    showCustomAlert('success', '¡Registro exitoso!');

    console.log('Datos registrados:', formData);

    // Simular login automático después del registro
    localStorage.setItem('authToken', 'fake-jwt-token');
    localStorage.setItem('userRole', 'cliente');
    localStorage.setItem('userEmail', correo);

    showCustomAlert('success', 'Sesión iniciada correctamente');

    setTimeout(() => {
      navigate('/');
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="form-container sign-up">
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
            animation: 'slideInRight 0.5s ease-out',
          }}
        >
          {showAlert.message}
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
        />
        <input
          type="text"
          name="apellido"
          placeholder="Apellido"
          value={formData.apellido}
          onChange={handleChange}
        />
        <input
          type="email"
          name="correo"
          placeholder="Correo electrónico"
          value={formData.correo}
          onChange={handleChange}
        />
        <select
          name="tipoDocumento"
          className="select-documento"
          value={formData.tipoDocumento}
          onChange={handleChange}
        >
          <option value="">Tipo de documento</option>
          <option value="cc">Cédula de Ciudadanía</option>
          <option value="ce">Cédula de Extranjería</option>
          <option value="ti">Tarjeta de Identidad</option>
        </select>
        <input
          type="number"
          name="documento"
          placeholder="Número de documento"
          value={formData.documento}
          onChange={handleChange}
        />
        <input
          type="number"
          name="contacto"
          placeholder="Número de contacto"
          value={formData.contacto}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
        />
        <button type="submit" className="hiddenn1">
          Registrar
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
