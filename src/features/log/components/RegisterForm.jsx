import React from 'react';

const RegisterForm = () => (
  <div className="form-container sign-up">
    <form className="login-form">
    <input type="text" placeholder="Nombre" />
    <input type="text" placeholder="Apellido" />
    <input type="email" placeholder="Correo electrónico" />
    <select className="select-documento">
        <option value="">Tipo de documento</option>
        <option value="cc">Cédula de Ciudadanía</option>
        <option value="ce">Cédula de Extranjería</option>
        <option value="ti">Tarjeta de Identidad</option>
    </select>
      <input type="Number" placeholder="Número de documento" />
      <input type="Number" placeholder="Numero de Contacto" />
      <input type="password" placeholder="Password" />
      <button type="submit" className="hiddenn1">Registrar</button>
    </form>
  </div>
);

export default RegisterForm;