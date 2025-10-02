// src/features/Admin/pages/Produccion/components/ModalEliminarProduccion.jsx
import React from 'react';

export default function ModalEliminarProduccion({ proceso, onEliminar, onCancelar }) {
  if (!proceso) return null;

  return (
    <div>
      <h2>Eliminar producción</h2>
      <h3>
        ¿Seguro que desea eliminar <strong>{proceso.nombreProduccion}</strong>?
      </h3>
      <div className="modal-footer">
        <button className="modal-btn cancel-btn" onClick={onCancelar}>
          Cancelar
        </button>
        <button className="modal-btn save-btn" onClick={() => onEliminar(proceso)}>
          Eliminar
        </button>
      </div>
    </div>
  );
}