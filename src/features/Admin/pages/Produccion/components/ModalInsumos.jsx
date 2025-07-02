import React from 'react';

export default function ModalInsumos({ producto, onClose }) {
  if (!producto) return null;

  return (
    <div className="insumos-modal-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <img
          src={producto.imagen}
          alt={producto.nombre}
          width="80"
          height="80"
          style={{ objectFit: 'cover', borderRadius: '8px' }}
        />
        <div>
          <h2 style={{ margin: '0 0 8px 0' }}>Insumos para: {producto.nombre}</h2>
          <p style={{ margin: 0, color: '#666' }}>
            {producto.insumos?.length || 0} insumos necesarios
          </p>
        </div>
      </div>

      <table className="insumos-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>Cantidad</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>Unidad</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>Insumo</th>
          </tr>
        </thead>
        <tbody>
          {producto.insumos?.map((insumo, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
              <td style={{ padding: '12px', fontWeight: 'bold', color: '#495057' }}>{insumo.cantidad || 'N/A'}</td>
              <td style={{ padding: '12px', color: '#6c757d' }}>{insumo.unidad || 'N/A'}</td>
              <td style={{ padding: '12px', color: '#212529' }}>{insumo.nombre || insumo}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button className="modal-btn cancel-btn" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
