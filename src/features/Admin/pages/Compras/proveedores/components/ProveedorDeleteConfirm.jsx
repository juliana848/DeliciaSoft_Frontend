import React from 'react';
import '../../../../adminStyles.css';
import CustomAlert from './CustomAlert'; // Importar el componente de alerta

const ProveedorDeleteConfirm = ({ 
  proveedor, 
  onConfirm, 
  onCancel, 
  loading, 
  alerta = { visible: false, mensaje: '', tipo: 'success' }, 
  cerrarAlerta = () => {} 
}) => {
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
      {/* Componente de alerta personalizado */}
      {alerta && (
        <CustomAlert
          mensaje={alerta.mensaje}
          tipo={alerta.tipo}
          visible={alerta.visible}
          onClose={cerrarAlerta}
        />
      )}

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
          className="modal-btn"
          onClick={onConfirm}
          disabled={loading}
          style={{
            backgroundColor: "#ff4081",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "600",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = "#fbbf24";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#ff4081";
          }}
        >
          {loading ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </>
  );
};

export default ProveedorDeleteConfirm;