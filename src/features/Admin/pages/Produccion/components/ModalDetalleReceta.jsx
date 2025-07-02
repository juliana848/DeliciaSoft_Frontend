import React from 'react';

export default function ModalDetalleReceta({ receta, onClose }) {
  if (!receta) return null;

  return (
    <div className="receta-detalle-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <img
          src={receta.imagen}
          alt={receta.nombre}
          width="80"
          height="80"
          style={{ objectFit: 'cover', borderRadius: '8px' }}
        />
        <div>
          <h2 style={{ margin: '0 0 8px 0' }}>{receta.nombre}</h2>
          <p style={{ margin: 0, color: '#666' }}>
            {receta.insumos.length} insumos • {receta.pasos.length} pasos
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h3>📋 Insumos necesarios:</h3>
          <ul style={{ listStyle: 'none', padding: '0' }}>
            {receta.insumos.map((insumo, index) => (
              <li
                key={index}
                style={{
                  padding: '8px',
                  marginBottom: '4px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px'
                }}
              >
                • {insumo}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>👩‍🍳 Pasos de preparación:</h3>
          <ol style={{ paddingLeft: '20px' }}>
            {receta.pasos.map((paso, index) => (
              <li
                key={index}
                style={{
                  padding: '8px 0',
                  marginBottom: '8px',
                  borderBottom: '1px solid #eee'
                }}
              >
                {paso}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button className="modal-btn cancel-btn" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
