// src/features/Admin/pages/Produccion/components/ModalVisualizarProduccion.jsx
import React, { useState } from 'react';
import Modal from '../../../components/modal';
import ModalDetalleReceta from './ModalDetalleReceta';
import ModalInsumos from './ModalInsumos';
import { estadoProduccionMap, estadoPedidoMap } from '../utils/estadosMaps';
import './ProduccionForm.css';

export default function ModalVisualizarProduccion({ proceso, pestanaActiva, onClose }) {
  const [mostrarModalRecetaDetalle, setMostrarModalRecetaDetalle] = useState(false);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);
  const [mostrarDetalleInsumos, setMostrarDetalleInsumos] = useState(false);
  const [productoDetalleInsumos, setProductoDetalleInsumos] = useState(null);

  if (!proceso) return null;

  const esFabrica = proceso.tipoProduccion === 'fabrica';

  const abrirModalRecetaDetalle = (receta) => {
    setRecetaSeleccionada(receta);
    setMostrarModalRecetaDetalle(true);
  };

  const cerrarModalRecetaDetalle = () => {
    setMostrarModalRecetaDetalle(false);
    setRecetaSeleccionada(null);
  };

  return (
    <>
      <div className="compra-form-container">
        {/* Header con estado */}
        <div className="compra-status-header activa">
          <h1 className="compra-title">Detalle de Producción #{proceso.id}</h1>
          <div className="status-indicator">
            <span className="status-badge activa">
              ✅ {pestanaActiva === 'fabrica' 
                ? (estadoProduccionMap[proceso.estadoProduccion] || 'N/A')
                : (estadoPedidoMap[proceso.estadoPedido] || 'N/A')
              }
            </span>
          </div>
        </div>

        {/* Información de la Producción */}
        <div className="form-card">
          <h2 className="section-title">
            <span className="title-icon">📋</span>
            Información de la Producción
          </h2>
          
          <div className="form-grid">
            <div className="field-group">
              <label className="field-label">Nombre de la Producción</label>
              <input 
                type="text" 
                className="form-input" 
                value={proceso.nombreProduccion} 
                disabled 
              />
            </div>

            <div className="field-group">
              <label className="field-label">Fecha Creación</label>
              <input 
                type="text" 
                className="form-input" 
                value={proceso.fechaCreacion} 
                disabled 
              />
            </div>

            {proceso.tipoProduccion === 'pedido' && (
              <>
                <div className="field-group">
                  <label className="field-label">Fecha Entrega</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={proceso.fechaEntrega || 'N/A'} 
                    disabled 
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">N° Pedido</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={proceso.numeroPedido || 'N/A'} 
                    disabled 
                  />
                </div>
              </>
            )}

            <div className="field-group">
              <label className="field-label">Estado</label>
              <div style={{paddingTop: '4px'}}>
                <span className="estado-tag estado-activa">
                  {pestanaActiva === 'fabrica' 
                    ? (estadoProduccionMap[proceso.estadoProduccion] || 'N/A')
                    : (estadoPedidoMap[proceso.estadoPedido] || 'N/A')
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="form-card">
          <h2 className="section-title">
            <span className="title-icon">📦</span>
            Productos ({proceso.productos?.length || 0})
          </h2>
          
          <div className="table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  {esFabrica ? (
                    <>
                      <th>Distribución por Sede</th>
                      <th>Total</th>
                    </>
                  ) : (
                    <>
                      <th>Sede</th>
                      <th>Cantidad</th>
                    </>
                  )}
                  <th>Receta</th>
                  <th>Insumos</th>
                </tr>
              </thead>
              <tbody>
                {!proceso.productos || proceso.productos.length === 0 ? (
                  <tr>
                    <td colSpan={esFabrica ? 6 : 6} style={{textAlign: 'center', padding: '20px', color: '#6b7280'}}>
                      No hay productos asociados a esta producción
                    </td>
                  </tr>
                ) : (
                  proceso.productos.map((item, index) => {
                    const cantidadTotal = esFabrica && item.cantidadesPorSede
                      ? Object.values(item.cantidadesPorSede).reduce((sum, cant) => sum + cant, 0)
                      : item.cantidad || 0;

                    return (
                      <tr key={item.id || index} className="product-row">
                        <td style={{textAlign: 'center'}}>
                          <img 
                            src={item.imagen || 'https://via.placeholder.com/50'} 
                            alt={item.nombre || 'Producto'} 
                            width="50" 
                            height="50" 
                            style={{ objectFit: 'cover', borderRadius: '8px' }} 
                          />
                        </td>
                        <td className="product-name">
                          <div>{item.nombre || 'Sin nombre'}</div>
                          {item.receta && (
                            <small style={{ fontSize: '11px', color: '#6b7280' }}>
                              Receta: {item.receta.nombre}
                            </small>
                          )}
                        </td>
                        
                        {esFabrica ? (
                          <>
                            <td style={{ padding: '10px' }}>
                              {item.cantidadesPorSede && Object.keys(item.cantidadesPorSede).length > 0 ? (
                                <div className="nested-item-list">
                                  {Object.entries(item.cantidadesPorSede)
                                    .filter(([_, cantidad]) => cantidad > 0)
                                    .map(([sede, cantidad]) => (
                                      <div key={sede}>
                                        <strong>{sede}:</strong> {cantidad} unidades
                                      </div>
                                    ))}
                                  {Object.values(item.cantidadesPorSede).every(c => c === 0) && (
                                    <span style={{ color: '#6b7280' }}>Sin distribución</span>
                                  )}
                                </div>
                              ) : (
                                <span style={{ color: '#6b7280', fontSize: '12px' }}>No especificado</span>
                              )}
                            </td>
                            <td className="quantity-cell">
                              <span className="quantity-display">{cantidadTotal}</span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td style={{textAlign: 'center'}}>
                              {item.sede || 'No asignada'}
                            </td>
                            <td className="quantity-cell">
                              <span className="quantity-display">{item.cantidad || 0}</span>
                            </td>
                          </>
                        )}
                        
                        <td className="action-cell">
                          {item.receta ? (
                            <button 
                              className="btn-small" 
                              onClick={() => abrirModalRecetaDetalle(item.receta)}
                              style={{background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'}}
                            >
                              Ver receta
                            </button>
                          ) : (
                            <span style={{ color: '#6b7280', fontSize: '12px' }}>Sin receta</span>
                          )}
                        </td>
                        <td className="action-cell">
                          {item.insumos && item.insumos.length > 0 ? (
                            <button 
                              className="btn-small" 
                              onClick={() => {
                                const insumosMultiplicados = item.insumos.map(insumo => ({
                                  ...insumo,
                                  cantidad: (parseFloat(insumo.cantidad) || 0) * cantidadTotal
                                }));
                                
                                setProductoDetalleInsumos({
                                  ...item,
                                  insumos: insumosMultiplicados
                                });
                                setMostrarDetalleInsumos(true);
                              }}
                              style={{background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'}}
                            >
                              Ver insumos ({item.insumos.length})
                            </button>
                          ) : (
                            <span style={{ color: '#6b7280', fontSize: '12px' }}>Sin insumos</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botón de cierre */}
        <div className="action-buttons">
          <button className="btn btn-cancel" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      {mostrarModalRecetaDetalle && recetaSeleccionada && (
        <Modal visible={mostrarModalRecetaDetalle} onClose={cerrarModalRecetaDetalle}>
          <ModalDetalleReceta 
            receta={recetaSeleccionada} 
            onClose={cerrarModalRecetaDetalle} 
          />
        </Modal>
      )}

      {mostrarDetalleInsumos && productoDetalleInsumos && (
        <Modal visible={mostrarDetalleInsumos} onClose={() => setMostrarDetalleInsumos(false)}>
          <ModalInsumos 
            producto={productoDetalleInsumos} 
            onClose={() => setMostrarDetalleInsumos(false)} 
          />
        </Modal>
      )}
    </>
  );
}