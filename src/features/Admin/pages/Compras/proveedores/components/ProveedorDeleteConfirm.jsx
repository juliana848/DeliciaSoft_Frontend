import React from 'react';

const ProveedorDeleteConfirm = ({ proveedor, onConfirm, onCancel, loading }) => {
  if (!proveedor) return null;

  const getNombreProveedor = () => {
    if (proveedor.tipo === 'Natural') {
      return proveedor.nombreProveedor || proveedor.nombre || 'Sin nombre';
    } else {
      return proveedor.nombreEmpresa || 'Sin nombre de empresa';
    }
  };

  return (
    <>
      <h2 className="modal-title">Confirmar Eliminación</h2>
      
      <p>
        ¿Estás seguro de que quieres eliminar al proveedor{' '}
        <strong>{getNombreProveedor()}</strong>?
      </p>
      
      <div className="modal-footer">
        <button 
          className="modal-btn cancel-btn" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </button>
        <button 
          className="modal-btn red" 
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </>
  );
};

export default ProveedorDeleteConfirm;