import React from 'react';

const ProveedorActions = ({ proveedor, onAction, loading }) => {
  return (
    <div style={{ display: 'flex', gap: '5px' }}>
      <button 
        className="admin-button gray" 
        title="Visualizar" 
        onClick={() => onAction('visualizar', proveedor)}
        disabled={loading}
      >
        👁
      </button>
      <button
        className={`admin-button yellow ${!proveedor.estado ? 'disabled' : ''}`}
        title="Editar"
        onClick={() => proveedor.estado && onAction('editar', proveedor)}
        disabled={!proveedor.estado || loading}
        style={{
          opacity: !proveedor.estado ? 0.5 : 1,
          cursor: !proveedor.estado || loading ? 'not-allowed' : 'pointer'
        }}
      >
        ✏️
      </button>
      <button
        className={`admin-button red ${!proveedor.estado ? 'disabled' : ''}`}
        title="Eliminar"
        onClick={() => proveedor.estado && onAction('eliminar', proveedor)}
        disabled={!proveedor.estado || loading}
        style={{
          opacity: !proveedor.estado ? 0.5 : 1,
          cursor: !proveedor.estado || loading ? 'not-allowed' : 'pointer'
        }}
      >
        🗑️
      </button>
    </div>
  );
};

export default ProveedorActions;