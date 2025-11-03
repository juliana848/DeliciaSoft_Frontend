// src/features/Admin/pages/Produccion/components/ModalEliminarProduccion.jsx
import React from 'react';

export default function ModalEliminarProduccion({ visible, proceso, onEliminar, onCancelar }) {
  if (!visible || !proceso) return null;

  return (
    <div className="eliminar-modal-container" style={{ textAlign: 'center' }}>
      <h2 style={{ color: '#d32f2f', marginBottom: '8px' }}>Confirmar Eliminación</h2>
      <hr style={{ border: '1px solid #d32f2f', marginBottom: '15px' }} />

      <p style={{ fontSize: '16px', marginBottom: '20px' }}>
        ¿Seguro que deseas eliminar la producción <br />
        <strong style={{ color: '#b71c1c' }}>{proceso.nombreProduccion}</strong>?
      </p>

      <div className="modal-footer" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button
          className="modal-btn cancel-btn"
          style={{
            backgroundColor: '#ccc',
            color: '#000',
            padding: '8px 16px',
            borderRadius: '6px',
          }}
          onClick={onCancelar}
        >
          Cancelar
        </button>
        <button
          className="modal-btn save-btn"
          style={{
            backgroundColor: '#d32f2f',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '6px',
          }}
          onClick={() => onEliminar(proceso)}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
