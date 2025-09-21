import React, { useState } from "react";
import Notification from "../../../components/Notification";
import productosApiService from "../../../services/productos_services";
import "../../../adminStyles.css";

export default function ProductosDelete({ show, producto, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);
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

  const handleDelete = async () => {
    setLoading(true);
    
    try {
      // Usar el ID correcto del producto
      await productosApiService.eliminarProducto(producto.id);
      
      showNotification("Producto eliminado exitosamente");
      
      setTimeout(() => {
        onConfirm();
      }, 1500);
      
    } catch (error) {
      console.error("Error eliminando producto:", error);

      let mensajeError = "Error al eliminar producto";

      // Detectar uso específico según mensaje de error del backend/BD
      if (error.message.includes("foreign key")) {
        if (error.message.includes("detalleventas") || error.message.includes("ventas")) {
          mensajeError = "No se puede eliminar: el producto está siendo utilizado en Ventas.";
        } else if (error.message.includes("produccion")) {
          mensajeError = "No se puede eliminar: el producto está siendo utilizado en Producción.";
        } else if (error.message.includes("recetas") || error.message.includes("receta")) {
          mensajeError = "No se puede eliminar: el producto está siendo utilizado en Recetas.";
        } else {
          mensajeError = "No se puede eliminar: el producto está siendo utilizado en otras partes del sistema.";
        }
      } else if (error.message.includes("not found")) {
        mensajeError = "El producto no existe o ya fue eliminado";
      } else {
        mensajeError = error.message || mensajeError;
      }

      showNotification(mensajeError, "error");
    } finally {
      setLoading(false);
    }
  };

  // No renderizar nada si show es false o no hay producto
  if (!show || !producto) return null;

  return (
    <>
      {/* Notificación del modal */}
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      {/* Overlay */}
      <div 
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}
        onClick={onCancel}
      >
        {/* Modal */}
        <div 
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            width: "400px",
            maxWidth: "90vw",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            overflow: "hidden"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid #e9ecef",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <h3 
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "600",
                color: "#333"
              }}
            >
              Confirmar Eliminación
            </h3>
            <button
              onClick={onCancel}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "#999",
                padding: "0",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "24px" }}>
            <p 
              style={{
                margin: "0 0 8px 0",
                fontSize: "16px",
                color: "#333",
                lineHeight: "1.5"
              }}
            >
              ¿Está seguro de que desea eliminar el producto <strong>{producto.nombre || producto.nombreproducto}</strong>?
            </p>
            
            <p 
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#666",
                lineHeight: "1.4"
              }}
            >
              Esta acción no se puede deshacer.
            </p>
          </div>

          {/* Footer */}
          <div 
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #e9ecef",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              backgroundColor: "#fafafa"
            }}
          >
            <button
              onClick={onCancel}
              disabled={loading}
              style={{
                padding: "8px 16px",
                border: "1px solid #ddd",
                backgroundColor: "white",
                color: "#666",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                minWidth: "80px"
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "#f8f9fa";
                  e.target.style.borderColor = "#adb5bd";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "white";
                  e.target.style.borderColor = "#ddd";
                }
              }}
            >
              Cancelar
            </button>
            
            <button
              onClick={handleDelete}
              disabled={loading}
              style={{
                padding: "8px 16px",
                border: "none",
                backgroundColor: loading ? "#6c757d" : "#dc3545",
                color: "white",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.2s ease",
                minWidth: "80px"
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = "#c82333";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.backgroundColor = "#dc3545";
              }}
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
