import React from 'react';
import './modalstyle.css'
const ProveedorViewer = ({ proveedor, onClose }) => {
  if (!proveedor) return null;

  return (
    <>
      <h2 className="modal-title">Detalles del Proveedor</h2>
      
      <div className="modal-body">
        <div className="modal-form-grid-wide">
          
          <label>Tipo de Proveedor*
            <div className="modal-input" style={{ 
              backgroundColor: '#f8f9fa', 
              cursor: 'default', 
              border: '2px solid #e91e63',
              pointerEvents: 'none'
            }}>
              {proveedor.tipo}
            </div>
          </label>

          <label>Tipo de Documento*
            <div className="modal-input" style={{ 
              backgroundColor: '#f8f9fa', 
              cursor: 'default', 
              border: '2px solid #e91e63',
              pointerEvents: 'none'
            }}>
              {proveedor.tipoDocumento}
            </div>
          </label>

          <label>
            {proveedor.tipo === 'Natural' 
              ? 'Número de Documento*' 
              : (proveedor.tipoDocumento === 'RUT' ? 'RUT*' : 'NIT*')
            }
            <div className="modal-input" style={{ 
              backgroundColor: '#f8f9fa', 
              cursor: 'default', 
              border: '2px solid #e91e63',
              pointerEvents: 'none'
            }}>
              {proveedor.documento || proveedor.extra}
            </div>
          </label>

          {proveedor.tipo === 'Natural' ? (
            <label>Nombre Completo*
              <div className="modal-input" style={{ 
                backgroundColor: '#f8f9fa', 
                cursor: 'default', 
                border: '2px solid #e91e63',
                pointerEvents: 'none'
              }}>
                {proveedor.nombreProveedor || proveedor.nombre}
              </div>
            </label>
          ) : (
            <>
              <label>Razón Social*
                <div className="modal-input" style={{ 
                  backgroundColor: '#f8f9fa', 
                  cursor: 'default', 
                  border: '2px solid #e91e63',
                  pointerEvents: 'none'
                }}>
                  {proveedor.nombreEmpresa}
                </div>
              </label>

              <label>Nombre del Contacto*
                <div className="modal-input" style={{ 
                  backgroundColor: '#f8f9fa', 
                  cursor: 'default', 
                  border: '2px solid #e91e63',
                  pointerEvents: 'none'
                }}>
                  {proveedor.nombreProveedor || proveedor.nombreContacto}
                </div>
              </label>
            </>
          )}

          <label>Teléfono*
            <div className="modal-input" style={{ 
              backgroundColor: '#f8f9fa', 
              cursor: 'default', 
              border: '2px solid #e91e63',
              pointerEvents: 'none'
            }}>
              {proveedor.contacto}
            </div>
          </label>

          <label>Correo Electrónico*
            <div className="modal-input" style={{ 
              backgroundColor: '#f8f9fa', 
              cursor: 'default', 
              border: '2px solid #e91e63',
              pointerEvents: 'none'
            }}>
              {proveedor.correo}
            </div>
          </label>

          <label>Dirección*
            <div className="modal-input" style={{ 
              backgroundColor: '#f8f9fa', 
              cursor: 'default', 
              border: '2px solid #e91e63',
              pointerEvents: 'none'
            }}>
              {proveedor.direccion}
            </div>
          </label>

          <label>Estado
            <div className="modal-input" style={{ 
              backgroundColor: '#f8f9fa', 
              cursor: 'default', 
              border: '2px solid #e91e63',
              pointerEvents: 'none'
            }}>
              <span style={{ color: proveedor.estado ? '#4CAF50' : '#f44336', fontWeight: 'bold' }}>
                {proveedor.estado ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </label>

        </div>
      </div>
      
      <div className="modal-footer">
        <button className="modal-btn cancel-btn" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </>
  );
};

export default ProveedorViewer;