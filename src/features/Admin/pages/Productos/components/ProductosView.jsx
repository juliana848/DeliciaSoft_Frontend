import React, { useState, useEffect } from "react";
import "../../../adminStyles.css";
import "./css/productos.css";
import Notification from "../../../components/Notification";

export default function ProductosView({ producto, onClose }) {
  const [imagenPreview, setImagenPreview] = useState(null);
  const [receta, setReceta] = useState(null);
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

    // Imagen
    setImagenPreview(producto.urlimagen || producto.imagenes?.urlimg || null);

    // Cargar receta si existe
    if (producto.idreceta) {
      fetch("https://deliciasoft-backend.onrender.com/api/receta/recetas")
        .then((res) => {
          if (!res.ok) throw new Error("Error al cargar las recetas");
          return res.json();
        })
        .then((data) => {
          const recetaProducto = data.find(r => r.idreceta === producto.idreceta);
          if (recetaProducto) setReceta(recetaProducto);
          else showNotification("No se encontró la receta del producto", "error");
        })
        .catch((err) => {
          console.error(err);
          showNotification("No se pudo cargar la receta", "error");
        });
    }
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
          <div className="field-group">
            <label>Nombre del Producto</label>
            <input
              type="text"
              value={producto.nombre || producto.nombreproducto}
              disabled
              className="field-disabled"
            />
          </div>

          <div className="field-group">
            <label>Precio</label>
            <input
              type="text"
              value={formatearPrecio(producto.precio || producto.precioproducto || 0)}
              disabled
              className="field-disabled"
            />
          </div>

          <div className="field-group">
            <label>Cantidad Disponible</label>
            <input
              type="text"
              value={`${producto.cantidad || producto.cantidadproducto || 0} unidades`}
              disabled
              className="field-disabled"
            />
          </div>

          <div className="field-group">
            <label>Categoría</label>
            <input
              type="text"
              value={producto.categoria || producto.categoriaNombre || "Sin categoría"}
              disabled
              className="field-disabled"
            />
          </div>

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
          {receta ? (
            <div className="receta-tarjeta">
              <h3 className="receta-titulo">{receta.nombrereceta}</h3>
              <p className="receta-especificaciones">{receta.especificaciones}</p>
              <h4>Insumos:</h4>
              <ul className="receta-insumos">
                {receta.insumos.map((insumo) => (
                  <li key={insumo.iddetallereceta}>
                    {insumo.nombreinsumo} - {insumo.cantidad} {insumo.unidadmedida} ({insumo.categoria})
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No hay receta asignada a este producto</p>
          )}
        </div>

        <div className="compra-header-actions">
          <button type="button" className="modal-btn cancel-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </form>

      {/* CSS interno para mejorar diseño */}
      <style jsx>{`
        .receta-tarjeta {
          background: #fff8f0;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin-top: 1rem;
        }
        .receta-titulo {
          margin-bottom: 0.5rem;
          color: #d2691e;
        }
        .receta-especificaciones {
          margin-bottom: 1rem;
          font-style: italic;
          color: #555;
        }
        .receta-insumos {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        .receta-insumos li {
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  );
}
