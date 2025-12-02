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
      </div>

      <div className="form-card">
        <h2 className="section-title">
          <span className="title-icon">🖼️</span> Imagen
        </h2>
        {imagenPreview ? (
          <img
            src={imagenPreview}
            alt="Producto"
            style={{ width: "150px", borderRadius: "10px" }}
          />
        ) : (
          <p>No hay imagen</p>
        )}
      </div>

      <div className="form-card">
        <h2 className="section-title">
          <span className="title-icon">📋</span> Receta
        </h2>
        {receta ? (
          <div className="nested-item-list">
            <strong>{receta.nombre || receta.nombrereceta}</strong>
            <p>{receta.especificaciones}</p>
            <ul>
              {(receta.insumos || []).map((i) => (
                <li key={i.id || i.iddetallereceta}>
                  {i.nombre || i.nombreinsumo} - {i.cantidad} {i.unidad || i.unidadmedida}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No hay receta asignada</p>
        )}
      </div>

      <div className="form-card">
        <h2 className="section-title">
          <span className="title-icon">📦</span> Cantidad de productos: {cantidadTotal}
        </h2>

{Object.keys(cantidadesPorSede).length > 0 ? (
  <div
    style={{
      display: "flex",
      gap: "1rem",
      flexWrap: "wrap",
      marginTop: "1rem"
    }}
  >
    {Object.entries(cantidadesPorSede).map(([sede, cantidad]) => (
      <div
        key={sede}
        style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "10px 15px",
          minWidth: "150px",
          textAlign: "center",
          background: "#fafafa",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
        }}
      >
        <strong>{sede}</strong>
        <div style={{ marginTop: "5px", fontSize: "14px" }}>
          {cantidad} unidades
        </div>
      </div>
    ))}
  </div>
) : (
  <p>No hay cantidades registradas</p>
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
