import React, { useState } from 'react';

const ModalIngresarCodigo = ({ codigoCorrecto, onClose, onCodigoValido }) => {
  const [codigoIngresado, setCodigoIngresado] = useState('');

  const manejarVerificacion = (e) => {
    e.preventDefault();
    if (codigoIngresado === codigoCorrecto) {
      alert("Código correcto. Acceso concedido.");
      onCodigoValido();
    } else {
      alert("Código incorrecto.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-contenido tarjeta">
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
            <button type="submit" className="btn-enviar">Verificar</button>
            <button type="button" onClick={onClose} className="btn-cancelar">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalIngresarCodigo;
