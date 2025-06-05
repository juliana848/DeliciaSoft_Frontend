import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // <-- Importa useNavigate

const RegisterForm = () => {
  const navigate = useNavigate();  // <-- Inicializa el hook

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    tipoDocumento: '',
    documento: '',
    contacto: '',
    password: '',
  });

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
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      alert('Correo electrónico no válido.');
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
  };

  return (
    <div className="form-container sign-up">
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
