// src/features/Admin/pages/Productos/ProductosView.jsx
import React, { useState, useEffect } from "react";
import Notification from "../../../components/Notification";
import "./css/productoscss.css"; 

export default function ProductosView({ producto, onClose }) {
  const [imagenPreview, setImagenPreview] = useState(null);
  const [receta, setReceta] = useState(null);
  const [notification, setNotification] = useState({ visible: false, mensaje: "", tipo: "success" });

  useEffect(() => {
    if (producto) {
      setImagenPreview(producto.urlimagen || producto.imagenes?.urlimg || null);
      if (producto.idreceta) {
        fetch("https://deliciasoft-backend.onrender.com/api/receta/recetas")
          .then(res => res.json())
          .then(data => setReceta(data.find(r => r.idreceta === producto.idreceta)))
          .catch(() => setNotification({ visible: true, mensaje: "Error al cargar receta", tipo: "error" }));
      }
    }
  }, [producto]);

  const formatearPrecio = (precio) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(precio);

  if (!producto) return <div className="compra-form-container">No se pudo cargar el producto</div>;

  return (
    <div className="compra-form-container">
      <Notification {...notification} onClose={() => setNotification({ visible: false })} />

      <div className="form-card">
        <h2 className="section-title"><span className="title-icon">👁️</span> Ver Producto</h2>
        <div className="form-grid">
          <div className="field-group"><label className="field-label">Nombre</label><input className="form-input" value={producto.nombreproducto} disabled /></div>
          <div className="field-group"><label className="field-label">Precio</label><input className="form-input" value={formatearPrecio(producto.precioproducto)} disabled /></div>
          <div className="field-group"><label className="field-label">Cantidad</label><input className="form-input" value={`${producto.cantidadproducto} unidades`} disabled /></div>
          <div className="field-group"><label className="field-label">Categoría</label><input className="form-input" value={producto.categoria || "Sin categoría"} disabled /></div>
          <div className="field-group"><label className="field-label">Estado</label><input className="form-input" value={producto.estado ? "Activo ✅" : "Inactivo ⛔"} disabled /></div>
        </div>
      </div>

      {/* Imagen */}
      <div className="form-card">
        <h2 className="section-title"><span className="title-icon">🖼️</span> Imagen</h2>
        {imagenPreview ? <img src={imagenPreview} alt="Producto" style={{ width: "150px", borderRadius: "10px" }} /> : <p>No hay imagen</p>}
      </div>

      {/* Receta */}
      <div className="form-card">
        <h2 className="section-title"><span className="title-icon">📋</span> Receta</h2>
        {receta ? (
          <div className="nested-item-list">
            <strong>{receta.nombrereceta}</strong>
            <p>{receta.especificaciones}</p>
            <ul>{receta.insumos.map(i => <li key={i.iddetallereceta}>{i.nombreinsumo} - {i.cantidad} {i.unidadmedida}</li>)}</ul>
          </div>
        ) : <p>No hay receta asignada</p>}
      </div>

      <div className="action-buttons">
        <button type="button" className="btn btn-cancel" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
