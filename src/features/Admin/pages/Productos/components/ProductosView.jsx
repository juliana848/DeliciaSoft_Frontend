import React, { useState, useEffect } from "react";
import "../../../adminStyles.css";
import "./css/productos.css";
import Notification from "../../../components/Notification";

export default function ProductosView({ producto, onClose }) {
  const [imagenPreview, setImagenPreview] = useState(null);
  const [notification, setNotification] = useState({
    visible: false,
    mensaje: "",
    tipo: "success",
  });

  const showNotification = (mensaje, tipo = "success") => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: "", tipo: "success" });
  };

  useEffect(() => {
    if (!producto) {
      showNotification("No se pudo cargar la información del producto", "error");
      return;
    }
    // Determinar de dónde sacar la imagen
    setImagenPreview(producto.urlimagen || producto.imagenes?.urlimg || null);
  }, [producto]);

  if (!producto) {
    return (
      <div className="compra-form-container">
        <Notification
          visible={notification.visible}
          mensaje={notification.mensaje}
          tipo={notification.tipo}
          onClose={hideNotification}
        />
        <div style={{ textAlign: "center", padding: "2rem" }}>
          No se pudo cargar la información del producto
        </div>
      </div>
    );
  }

  const formatearPrecio = (precio) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);

  return (
    <div className="compra-form-container">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      <h1>Ver Producto</h1>

      <form>
        <div className="compra-fields-grid">
          {/* Nombre */}
          <div className="field-group">
            <label>Nombre del Producto</label>
            <input
              type="text"
              value={producto.nombre || producto.nombreproducto}
              disabled
              className="field-disabled"
            />
          </div>

          {/* Precio */}
          <div className="field-group">
            <label>Precio</label>
            <input
              type="text"
              value={formatearPrecio(producto.precio || producto.precioproducto || 0)}
              disabled
              className="field-disabled"
            />
          </div>

          {/* Cantidad */}
          <div className="field-group">
            <label>Cantidad Disponible</label>
            <input
              type="text"
              value={`${producto.cantidad || producto.cantidadproducto || 0} unidades`}
              disabled
              className="field-disabled"
            />
          </div>

          {/* Categoría */}
          <div className="field-group">
            <label>Categoría</label>
            <input
              type="text"
              value={producto.categoria || producto.categoriaNombre || "Sin categoría"}
              disabled
              className="field-disabled"
            />
          </div>

          {/* Estado */}
          <div className="field-group">
            <label>Estado</label>
            <input
              type="text"
              value={producto.estado ? "Activo ✅" : "Inactivo ⛔"}
              disabled
              className="field-disabled"
            />
          </div>
        </div>

        <div className="section-divider"></div>

        {/* Imagen */}
        <div className="detalle-section">
          <h2>Imagen del Producto:</h2>
          {imagenPreview ? (
            <div className="imagen-preview-container">
              <img
                src={imagenPreview}
                alt={producto.nombre || producto.nombreproducto}
                className="imagen-preview-small"
              />
            </div>
          ) : (
            <p>No hay imagen</p>
          )}
        </div>

        <div className="section-divider"></div>

        {/* Receta */}
        <div className="detalle-section">
          <h2>Receta del Producto:</h2>
          {producto.receta ? (
            <div className="receta-seleccionada">
              <div className="receta-info">
                <h4>{producto.receta.nombrereceta}</h4>
                <p>{producto.receta.especificaciones}</p>
              </div>
            </div>
          ) : (
            <p>No hay receta asignada a este producto</p>
          )}
        </div>

        <div className="compra-header-actions">
          <button
            type="button"
            className="modal-btn cancel-btn"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </form>
    </div>
  );
}
