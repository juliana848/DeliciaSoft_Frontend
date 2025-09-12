import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import ModalRecetas from "./ModalRecetas"; 
import CrearReceta from "./CrearReceta";

const NotificationComponent = ({ visible, mensaje, tipo, onClose }) => {
  if (!visible) return null;
  const bgColor = tipo === "success" ? "#d4edda" : "#f8d7da";
  const textColor = tipo === "success" ? "#155724" : "#721c24";
  const borderColor = tipo === "success" ? "#c3e6cb" : "#f5c6cb";

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "10px 20px",
        borderRadius: "5px",
        backgroundColor: bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        zIndex: 1000,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <span>{mensaje}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          fontSize: "1.2em",
          cursor: "pointer",
          color: textColor,
        }}
      >
        &times;
      </button>
    </div>
  );
};

const SearchBarComponent = ({ placeholder, value, onChange }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #e0e0e0",
      width: "100%",
      fontSize: "14px",
      backgroundColor: "#f8f9fa",
      marginBottom: "20px",
      outline: "none",
      transition: "border-color 0.2s ease",
    }}
    onFocus={(e) => {
      e.target.style.borderColor = "#007bff";
      e.target.style.backgroundColor = "#ffffff";
    }}
    onBlur={(e) => {
      e.target.style.borderColor = "#e0e0e0";
      e.target.style.backgroundColor = "#f8f9fa";
    }}
  />
);

// Componente Modal COMPLETAMENTE CENTRADO
const ModalComponent = ({ visible, onClose, children }) => {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: "20px",
        boxSizing: "border-box",
      }}
      onClick={(e) => {
        // Cerrar modal si se hace click en el overlay
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          maxWidth: "1000px",
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          position: "relative",
          transform: "translate(0, 0)", // Asegura centrado perfecto
          margin: "0", // Elimina cualquier margen
        }}
        onClick={(e) => {
          // Prevenir que el click en el contenido cierre el modal
          e.stopPropagation();
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default function RecetaForm({
  initialData,
  onSave,
  onCancel,
  isEditing,
  categoriasProductos = [],
}) {
  const [formData, setFormData] = useState(
    initialData || {
      nombreproducto: "",
      precioproducto: "",
      cantidadproducto: "",
      idcategoriaproducto: "",
      especificaciones: "",
      idimagen: "",
      idreceta: "",
    }
  );
  const [notification, setNotification] = useState({
    visible: false,
    mensaje: "",
    tipo: "success",
  });
  const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);
  const [mostrarModalRecetas, setMostrarModalRecetas] = useState(false);
  const [mostrarCrearReceta, setMostrarCrearReceta] = useState(false);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [previewImagen, setPreviewImagen] = useState(null);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification("La imagen no puede superar los 5MB", "error");
        return;
      }
      setArchivoImagen(file);

      const reader = new FileReader();
      reader.onload = (e) => setPreviewImagen(e.target.result);
      reader.readAsDataURL(file);

      setFormData((prev) => ({ ...prev, idimagen: file.name }));
    }
  };

  const limpiarImagen = () => {
    setArchivoImagen(null);
    setPreviewImagen(null);
    setFormData((prev) => ({ ...prev, idimagen: "" }));
  };

  const showNotification = (mensaje, tipo = "success") => {
    setNotification({ visible: true, mensaje, tipo });
  };
  const hideNotification = () =>
    setNotification({ visible: false, mensaje: "", tipo: "success" });

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validarFormularioPrincipal = () => {
    const { nombreproducto, precioproducto, idcategoriaproducto } = formData;

    if (!nombreproducto?.trim()) {
      showNotification("El nombre es obligatorio.", "error");
      return false;
    }
    if (!precioproducto || parseFloat(precioproducto) <= 0) {
      showNotification("El precio debe ser mayor a 0", "error");
      return false;
    }
    if (!idcategoriaproducto) {
      showNotification("Debe seleccionar una categoría", "error");
      return false;
    }
    if (!recetaSeleccionada) {
      showNotification("Debe seleccionar una receta", "error");
      return false;
    }
    return true;
  };

    const handleSave = () => {
    if (!validarFormularioPrincipal()) return;

    const dataToSave = {
      idproductogeneral: formData.idproductogeneral || 0,
      nombreproducto: formData.nombreproducto,
      precioproducto: String(formData.precioproducto),
      cantidadproducto: String(formData.cantidadproducto || 0),
      estado: true,
      idcategoriaproducto: formData.idcategoriaproducto,
      idimagen: formData.idimagen ?? null,
      idreceta: recetaSeleccionada?.idreceta ?? null,
    };

    onSave(dataToSave);
  };

  return (
    <div className="compra-form-container">
      <NotificationComponent
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      <h1>{isEditing ? "Editar Producto" : "Agregar Producto"}</h1>

      {/* Nombre */}
      <div className="field-group">
        <label>Nombre del producto<span style={{ color: 'red' }}>*</span>:</label>
        <input
          type="text"
          value={formData.nombreproducto || ""}
          onChange={(e) => handleFormChange("nombreproducto", e.target.value)}
          className="modal-input"
          maxLength={50}
        />
      </div>

      {/* Precio */}
      <div className="field-group">
        <label>Precio del producto<span style={{ color: 'red' }}>*</span>:</label>
        <input
          type="number"
          value={formData.precioproducto || ""}
          onChange={(e) => handleFormChange("precioproducto", e.target.value)}
          className="modal-input"
        />
      </div>

      {/* Categoría */}
      <div className="field-group">
        <label>Categoría del producto<span style={{ color: 'red' }}>*</span>:</label>
        <select
          value={formData.idcategoriaproducto || ""}
          onChange={(e) =>
            handleFormChange("idcategoriaproducto", e.target.value)
          }
          className="modal-input"
        >
          <option value="">Seleccionar Categoría</option>
          {categoriasProductos.map((cat) => (
            <option key={cat.idcategoriaproducto} value={cat.idcategoriaproducto}>
              {cat.nombrecategoria}
            </option>
          ))}
        </select>
      </div>

      {/* Imagen */}
      <div className="field-group">
        <label>Imagen del producto<span style={{ color: 'red' }}>*</span>:</label>
        <input type="file" accept="image/*" onChange={handleImagenChange} />
        {previewImagen && (
          <div style={{ marginTop: "10px" }}>
            <img
              src={previewImagen}
              alt="Preview"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
            <button
              type="button"
              onClick={limpiarImagen}
              style={{
                display: "block",
                marginTop: "8px",
                background: "#ff4d4f",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "4px 8px",
                cursor: "pointer",
              }}
            >
              Quitar Imagen
            </button>
          </div>
        )}
      </div>
    <div className="field-group">
      <label>Especificaciones:</label>
      <textarea value={formData.especificaciones || ""} onChange={(e) => handleFormChange("especificaciones", e.target.value)} className="modal-input" rows="3" placeholder="Ingrese las especificaciones del producto..." maxLength={500}/>
    </div>
    <div className="section-divider"></div>
    <button className="btn-agregar-insumos" onClick={() => setMostrarModalRecetas(true)}>
      + Agregar Receta
    </button>
      <div className="detalle-section">
        <h2>Receta Asociada*</h2>
        {recetaSeleccionada ? (
          <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
            <h4>{recetaSeleccionada.nombrereceta}</h4>
            <p>{recetaSeleccionada.especificaciones || "Sin especificaciones"}</p>
            <button
              className="btn-eliminar"
              onClick={() => setRecetaSeleccionada(null)}
            >
              Quitar Receta
            </button>
          </div>
        ) : (
          <p>No hay receta seleccionada</p>
        )}
      </div>
      <div
        className="compra-header-actions"
        style={{
          marginTop: "1rem",
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.5rem",
        }}
      >
        <button className="modal-btn cancel-btn" onClick={onCancel}>
          Cancelar
        </button>
        <button className="modal-btn save-btn" onClick={handleSave}>
          Guardar
        </button>
      </div>
      {mostrarModalRecetas && (
        <ModalRecetas
          visible={mostrarModalRecetas}
          onClose={() => setMostrarModalRecetas(false)}
          onSelect={(receta) => {
            setRecetaSeleccionada(receta);
            setMostrarModalRecetas(false);
          }}
          onCrearReceta={() => {
            setMostrarModalRecetas(false);
            setMostrarCrearReceta(true);
          }}
        />
      )}
      {mostrarCrearReceta && (
        <CrearReceta
          visible={mostrarCrearReceta}
          onClose={() => setMostrarCrearReceta(false)}
          onSave={(receta) => {
            setRecetaSeleccionada(receta);
            setMostrarCrearReceta(false);
          }}
        />
      )}
    </div>
  );
}