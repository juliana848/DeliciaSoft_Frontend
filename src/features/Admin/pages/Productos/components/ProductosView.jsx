// src/features/Admin/pages/Productos/ProductosView.jsx
import React, { useState, useEffect } from "react";
import Notification from "../../../components/Notification";
import "./css/productoscss.css";
import inventarioApiService from "../../../services/inventario_services";

export default function ProductosView({ producto, onClose }) {
  const [imagenPreview, setImagenPreview] = useState(null);
  const [receta, setReceta] = useState(null);
  const [cantidadTotal, setCantidadTotal] = useState(0);
  const [cantidadesPorSede, setCantidadesPorSede] = useState({});
  const [notification, setNotification] = useState({ visible: false, mensaje: "", tipo: "success" });

  useEffect(() => {
    if (producto) {
      setImagenPreview(
        producto.urlimagen ||
        producto.imagen ||
        producto.imagenes?.urlimg ||
        null
      );

      if (producto.receta) {
        setReceta(producto.receta);
      } else if (producto.idreceta) {
        fetch("https://deliciasoft-backend.onrender.com/api/receta/recetas")
          .then(res => res.json())
          .then(data => {
            const encontrada = data.find(r => r.idreceta === producto.idreceta);
            if (encontrada) setReceta(encontrada);
          })
          .catch(() =>
            setNotification({
              visible: true,
              mensaje: "Error al cargar receta",
              tipo: "error"
            })
          );
      }

      const idReal = producto.idproductogeneral;

      inventarioApiService
        .obtenerInventarioProducto(idReal)
        .then((data) => {
          if (!data || !Array.isArray(data.inventarios)) {
            setCantidadTotal(0);
            setCantidadesPorSede({});
            return;
          }

          const inventarios = data.inventarios;
          let total = 0;
          let sedes = {};

          inventarios.forEach(inv => {
            const sedeNombre = inv.sede?.nombre || "Sin sede";
            const cantidad = parseFloat(inv.cantidad || 0);
            total += cantidad;
            sedes[sedeNombre] = cantidad;
          });

          setCantidadTotal(total);
          setCantidadesPorSede(sedes);
        })
        .catch(() =>
          setNotification({
            visible: true,
            mensaje: "Error al cargar inventario por sede",
            tipo: "error"
          })
        );
    }
  }, [producto]);

  const formatearPrecio = (precio) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(precio);

  if (!producto)
    return <div className="compra-form-container">No se pudo cargar el producto</div>;

  return (
    <div className="compra-form-container">
      <Notification
        {...notification}
        onClose={() => setNotification({ visible: false })}
      />

      <div className="form-card">
        <h2 className="section-title">
          <span className="title-icon">👁️</span> Ver Producto
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: "24px", alignItems: "start" }}>
          {/* Columna izquierda: Información del producto */}
          <div className="form-grid">
            <div className="field-group">
              <label className="field-label">Nombre</label>
              <input
                className="form-input"
                value={producto.nombreproducto || producto.nombre}
                disabled
              />
            </div>
            <div className="field-group">
              <label className="field-label">Precio</label>
              <input
                className="form-input"
                value={formatearPrecio(producto.precioproducto)}
                disabled
              />
            </div>
            <div className="field-group">
              <label className="field-label">Cantidad</label>
              <input
                className="form-input"
                value={`${producto.cantidadproducto} unidades`}
                disabled
              />
            </div>
            <div className="field-group">
              <label className="field-label">Categoría</label>
              <input
                className="form-input"
                value={producto.categoria || "Sin categoría"}
                disabled
              />
            </div>
            <div className="field-group">
              <label className="field-label">Estado</label>
              <input
                className="form-input"
                value={producto.estado ? "Activo ✅" : "Inactivo ⛔"}
                disabled
              />
            </div>
          </div>

          {/* Columna derecha: Imagen */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ fontWeight: "600", color: "#374151", fontSize: "14px" }}>Imagen del Producto</label>
            {imagenPreview ? (
              <img
                src={imagenPreview}
                alt="Producto"
                style={{ 
                  width: "100%", 
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  border: "2px solid #e5e7eb"
                }}
              />
            ) : (
              <div 
                style={{ 
                  width: "100%", 
                  height: "200px",
                  border: "2px dashed #d1d5db",
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  background: "#f9fafb",
                  color: "#6b7280"
                }}
              >
                <div style={{ fontSize: "48px" }}>📷</div>
                <p style={{ margin: 0, fontSize: "13px" }}>No hay imagen</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="form-card">
        <h2 className="section-title">
          <span className="title-icon">📋</span> Resumen de Receta
        </h2>
        {receta ? (
          <div>
            <div style={{ marginBottom: "1rem" }}>
              <strong style={{ fontSize: "16px", color: "#1f2937" }}>
                {receta.nombre || receta.nombrereceta}
              </strong>
              <p style={{ marginTop: "8px", color: "#6b7280", fontSize: "14px" }}>
                {receta.especificaciones}
              </p>
            </div>
            
            {(receta.insumos || []).length > 0 && (
              <div className="table-container">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Insumo</th>
                      <th style={{ textAlign: "center" }}>Cantidad</th>
                      <th style={{ textAlign: "center" }}>Unidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receta.insumos.map((i) => (
                      <tr key={i.id || i.iddetallereceta} className="product-row">
                        <td className="product-name">
                          <strong>{i.nombre || i.nombreinsumo}</strong>
                        </td>
                        <td style={{ textAlign: "center", fontWeight: "600" }}>
                          {i.cantidad}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {i.unidad || i.unidadmedida}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <p>No hay receta asignada</p>
        )}
      </div>

      <div className="form-card">
        <h2 className="section-title">
          <span className="title-icon">📦</span> Inventario por Sede
        </h2>
        
        <div style={{ 
          background: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)", 
          padding: "16px", 
          borderRadius: "10px", 
          marginBottom: "1rem",
          border: "1px solid #f9a8d4"
        }}>
          <div style={{ fontSize: "13px", color: "#9f1239", marginBottom: "6px", fontWeight: "600" }}>
            Total en todas las sedes
          </div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "#be185d" }}>
            {cantidadTotal} unidades
          </div>
        </div>

        {Object.keys(cantidadesPorSede).length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "1rem",
              marginTop: "1rem"
            }}
          >
            {Object.entries(cantidadesPorSede).map(([sede, cantidad]) => (
              <div
                key={sede}
                style={{
                  border: "1px solid #f9a8d4",
                  borderRadius: "12px",
                  padding: "16px",
                  background: "linear-gradient(135deg, #ffffff 0%, #fdf2f8 100%)",
                  boxShadow: "0 2px 8px rgba(236, 72, 153, 0.1)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "default"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(236, 72, 153, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(236, 72, 153, 0.1)";
                }}
              >
                <div style={{ 
                  fontSize: "12px", 
                  color: "#9f1239", 
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontWeight: "600"
                }}>
                  📍 Sede
                </div>
                <div style={{ 
                  fontWeight: "700", 
                  fontSize: "16px",
                  color: "#1f2937",
                  marginBottom: "12px",
                  lineHeight: "1.2"
                }}>
                  {sede}
                </div>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "#fce7f3",
                  borderRadius: "8px"
                }}>
                  <span style={{ fontSize: "13px", color: "#9f1239", fontWeight: "600" }}>
                    Stock:
                  </span>
                  <span style={{ 
                    fontSize: "20px", 
                    fontWeight: "700",
                    color: "#be185d"
                  }}>
                    {cantidad}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            border: "2px dashed #d1d5db", 
            borderRadius: "10px", 
            padding: "2rem", 
            textAlign: "center", 
            background: "#f9fafb",
            color: "#6b7280"
          }}>
            <p style={{ margin: 0 }}>No hay cantidades registradas en ninguna sede</p>
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button type="button" className="btn btn-cancel" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}