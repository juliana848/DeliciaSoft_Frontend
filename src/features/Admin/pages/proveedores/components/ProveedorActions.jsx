import React from 'react';
import Tooltip from '../../../components/Tooltip';

const ProveedorActions = ({ proveedor, onAction, loading }) => {
  return (
    <div style={{ display: 'flex', gap: '5px' }}>
      <Tooltip text="Visualizar">
        <button 
          className="admin-button gray" 
          onClick={() => onAction('visualizar', proveedor)}
          disabled={loading}
        >
          👁
        </button>
      </Tooltip>

      <Tooltip text={!proveedor.estado ? "Editar (Deshabilitado)" : "Editar"}>
        <button
          className={`admin-button yellow ${!proveedor.estado ? 'disabled' : ''}`}
          onClick={() => proveedor.estado && onAction('editar', proveedor)}
          disabled={!proveedor.estado || loading}
          style={{
            opacity: !proveedor.estado ? 0.5 : 1,
            cursor: !proveedor.estado || loading ? 'not-allowed' : 'pointer'
          }}
        >
          ✏️
        </button>
      </Tooltip>

      <Tooltip text={!proveedor.estado ? "Eliminar (Deshabilitado)" : "Eliminar"}>
        <button
          className={`admin-button red ${!proveedor.estado ? 'disabled' : ''}`}
          onClick={() => proveedor.estado && onAction('eliminar', proveedor)}
          disabled={!proveedor.estado || loading}
          style={{
            opacity: !proveedor.estado ? 0.5 : 1,
            cursor: !proveedor.estado || loading ? 'not-allowed' : 'pointer'
          }}
        >
          🗑️
        </button>
      </Tooltip>
    </div>
  );
};

export default ProveedorActions;