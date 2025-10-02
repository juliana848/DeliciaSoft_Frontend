// src/features/Admin/pages/Produccion/components/VisualizarProduccion.jsx
import React, { useState } from "react";
import ModalDetalleReceta from "./ModalDetalleReceta";
import ModalInsumos from "./ModalInsumos";
import Modal from "../../../components/modal";
import { estadoProduccionMap, estadoPedidoMap } from "../utils/estadosMaps";
import "./ProduccionForm.css";

export default function VisualizarProduccion({ proceso, pestanaActiva, onClose }) {
  const [mostrarModalRecetaDetalle, setMostrarModalRecetaDetalle] = useState(false);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);
  const [mostrarDetalleInsumos, setMostrarDetalleInsumos] = useState(false);
  const [productoDetalleInsumos, setProductoDetalleInsumos] = useState(null);

  if (!proceso) return null;
  const esFabrica = proceso.tipoProduccion === "fabrica";

  return (
    <div className="compra-form-container" style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* Información */}
      <div className="form-card">
        <h2 className="section-title">
          <span className="title-icon">📋</span> Información de la Producción
        </h2>

        <div className="form-grid">
          <div className="field-group">
            <label className="field-label">Nombre</label>
            <input type="text" className="form-input" value={proceso.nombreProduccion} disabled />
          </div>
          <div className="field-group">
            <label className="field-label">Fecha Creación</label>
            <input type="text" className="form-input" value={proceso.fechaCreacion} disabled />
          </div>
          {proceso.tipoProduccion === "pedido" && (
            <>
              <div className="field-group">
                <label className="field-label">Fecha Entrega</label>
                <input type="text" className="form-input" value={proceso.fechaEntrega || "N/A"} disabled />
              </div>
              <div className="field-group">
                <label className="field-label">N° Pedido</label>
                <input type="text" className="form-input" value={proceso.numeroPedido || "N/A"} disabled />
              </div>
            </>
          )}
          <div className="field-group">
            <label className="field-label">Estado</label>
            <input
              type="text"
              className="form-input"
              value={
                pestanaActiva === "fabrica"
                  ? estadoProduccionMap[proceso.estadoProduccion] || "N/A"
                  : estadoPedidoMap[proceso.estadoPedido] || "N/A"
              }
              disabled
            />
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="form-card">
        <h2 className="section-title">
          <span className="title-icon">📦</span> Productos ({proceso.productos?.length || 0})
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
                  <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                    No hay productos asociados a esta producción
                  </td>
                </tr>
              ) : (
                proceso.productos.map((item, index) => {
                  const cantidadTotal =
                    esFabrica && item.cantidadesPorSede
                      ? Object.values(item.cantidadesPorSede).reduce((sum, cant) => sum + cant, 0)
                      : item.cantidad || 0;

                  return (
                    <tr key={item.id || index}>
                      <td style={{ textAlign: "center" }}>
                        <img
                          src={item.imagen || "https://via.placeholder.com/50"}
                          alt={item.nombre || "Producto"}
                          width="50"
                          height="50"
                          style={{ objectFit: "cover", borderRadius: "8px" }}
                        />
                      </td>
                      <td>{item.nombre || "Sin nombre"}</td>
                      {esFabrica ? (
                        <>
                          <td>
                            {item.cantidadesPorSede ? (
                              Object.entries(item.cantidadesPorSede).map(([sede, cantidad]) => (
                                <div key={sede}>
                                  <strong>{sede}:</strong> {cantidad} unidades
                                </div>
                              ))
                            ) : (
                              <span style={{ color: "#6b7280" }}>No especificado</span>
                            )}
                          </td>
                          <td>{cantidadTotal}</td>
                        </>
                      ) : (
                        <>
                          <td>{item.sede || "No asignada"}</td>
                          <td>{item.cantidad || 0}</td>
                        </>
                      )}
                      <td>
                        {item.receta ? (
                          <button
                            className="btn-small"
                            onClick={() => {
                              setRecetaSeleccionada(item.receta);
                              setMostrarModalRecetaDetalle(true);
                            }}
                          >
                            Ver receta
                          </button>
                        ) : (
                          "Sin receta"
                        )}
                      </td>
                      <td>
                        {item.insumos && item.insumos.length > 0 ? (
                          <button
                            className="btn-small"
                            onClick={() => {
                              const insumosMultiplicados = item.insumos.map((insumo) => ({
                                ...insumo,
                                cantidad: (parseFloat(insumo.cantidad) || 0) * cantidadTotal,
                              }));
                              setProductoDetalleInsumos({ ...item, insumos: insumosMultiplicados });
                              setMostrarDetalleInsumos(true);
                            }}
                          >
                            Ver insumos ({item.insumos.length})
                          </button>
                        ) : (
                          "Sin insumos"
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

      {/* Cerrar */}
      <div className="action-buttons">
        <button className="btn btn-cancel" onClick={onClose}>
          Cerrar
        </button>
      </div>

      {/* Submodales */}
      {mostrarModalRecetaDetalle && recetaSeleccionada && (
        <Modal visible={mostrarModalRecetaDetalle} onClose={() => setMostrarModalRecetaDetalle(false)}>
          <ModalDetalleReceta 
            receta={recetaSeleccionada} 
            onClose={() => setMostrarModalRecetaDetalle(false)} 
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
    </div>
  );
}
