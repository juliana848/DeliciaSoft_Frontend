import React, { useState } from 'react';

const ModalVerificarCorreo = ({ onClose, onCodigoGenerado }) => {
  const [correo, setCorreo] = useState('');

  const manejarEnvio = (e) => {
    e.preventDefault();
    const codigo = '665544'; 
    alert(`se a enviado el código de verificación a su correo`);
    onCodigoGenerado(codigo);
  };

  return (
    <div className="modalrecuperar">
      <div className="modal-contenidorecupera">
        <h2>Recuperar Contraseña</h2>
        <form onSubmit={manejarEnvio}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <div className="botones">
            <button type="button" onClick={onClose} className="btn-enviar">Cancelar</button>
            <button type="submit" className="btn-enviar">Enviar código</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalVerificarCorreo;