import React, { useState } from 'react';
import ModalVerificarCorreo from './VerificaCorreo';
import ModalIngresarCodigo from './VerificarCodigo';

const LoginForm = () => {
  const [mostrarModalCorreo, setMostrarModalCorreo] = useState(false);
  const [mostrarModalCodigo, setMostrarModalCodigo] = useState(false);
  const [codigoGenerado, setCodigoGenerado] = useState(null);

  const manejarCodigoGenerado = (codigo) => {
    setCodigoGenerado(codigo);
    setMostrarModalCorreo(false);
    setMostrarModalCodigo(true);
  };

  const cerrarModales = () => {
    setMostrarModalCorreo(false);
    setMostrarModalCodigo(false);
  };

  return (
    <div className="form-container sign-in">
      <form className="login-form">
        <input type="email" placeholder="Correo electrónico" required />
        <input type="password" placeholder="Contraseña" required />

        <a
          type="button"
          className="forgot-password"
          onClick={() => setMostrarModalCorreo(true)}
        >
          ¿Olvidaste tu contraseña?
        </a>

        <button type="submit" className="btn-form">Iniciar</button>
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
        />
      )}
    </div>
  );
};

export default LoginForm;
