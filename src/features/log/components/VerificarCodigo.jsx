import React, { useState } from 'react';

const ModalIngresarCodigo = ({ codigoCorrecto, onClose, onCodigoValido }) => {
  const [codigoIngresado, setCodigoIngresado] = useState('');

  const manejarVerificacion = (e) => {
    e.preventDefault();
    if (codigoIngresado === codigoCorrecto) {
      alert("Código correcto. Puedes cambiar tu contraseña.");
      onCodigoValido();
    } else {
      alert("Código incorrecto.");
    }
  };

  return (
    <div className="modalrecuperar">
      <div className="modal-contenidorecupera">
        <h2>Verificar Código</h2>
        <form onSubmit={manejarVerificacion}>
          <input
            type="text"
            placeholder="Ingresa el código"
            value={codigoIngresado}
            onChange={(e) => setCodigoIngresado(e.target.value)}
            required
          />
          <div className="botones">
            <button type="button" onClick={onClose} className="btn-enviar">Cancelar</button>
            <button type="submit" className="btn-enviar">Verificar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalIngresarCodigo;
