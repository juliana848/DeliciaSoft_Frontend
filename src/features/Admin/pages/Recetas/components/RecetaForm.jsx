import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";

// Componente de Notificación en línea para RecetaForm
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

// Componente SearchBar en línea para RecetaForm
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

// Mock data for insumos - Defined locally in this component with images and prices
const mockInsumosDisponibles = [
  {
    id: 1,
    nombre: "Harina de Trigo",
    categoria: "Harinas",
    IdUnidadMedida: 1,
    precio: 15.75,
    imagen:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: 2,
    nombre: "Azúcar Blanca",
    categoria: "Endulzantes",
    IdUnidadMedida: 1,
    precio: 12.5,
    imagen:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuGrIouJPuNNVZvvsEjT5hjhfeA-6IasCyVw&sr",
  },
  {
    id: 3,
    nombre: "Levadura Seca",
    categoria: "Fermentos",
    IdUnidadMedida: 2,
    precio: 8.25,
    imagen:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: 4,
    nombre: "Huevos A",
    categoria: "Lácteos",
    IdUnidadMedida: 5,
    precio: 18.9,
    imagen:
      "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: 5,
    nombre: "Mantequilla sin sal",
    categoria: "Lácteos",
    IdUnidadMedida: 2,
    precio: 22.4,
    imagen:
      "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: 6,
    nombre: "Leche Entera",
    categoria: "Lácteos",
    IdUnidadMedida: 3,
    precio: 25.5,
    imagen:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: 7,
    nombre: "Chocolate Semiamargo",
    categoria: "Saborizantes",
    IdUnidadMedida: 2,
    precio: 35.75,
    imagen:
      "https://images.unsplash.com/photo-1511381939415-e44015466834?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: 8,
    nombre: "Esencia de Vainilla",
    categoria: "Saborizantes",
    IdUnidadMedida: 4,
    precio: 12.8,
    imagen:
      "https://sip.pochteca.net/media/blog/f/r/fragancia-de-vainilla-aroma-de-mexico-para-el-mundo.jpg",
  },
  {
    id: 9,
    nombre: "Sal Refinada",
    categoria: "Condimentos",
    IdUnidadMedida: 2,
    precio: 4.5,
    imagen:
      "https://pinero.storage.googleapis.com/wp-content/uploads/2024/02/01165014/4-17.jpg",
  },
  {
    id: 10,
    nombre: "Aceite Vegetal",
    categoria: "Grasas",
    IdUnidadMedida: 3,
    precio: 18.25,
    imagen:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop&crop=center",
  },
];

// Opciones de unidades de medida - Definidas localmente en este componente
const unidadesMedida = [
  { label: "Seleccionar unidad...", value: "", disabled: true },
  { label: "Kilogramos", value: 1, text: "Kg" },
  { label: "Gramos", value: 2, text: "gr" },
  { label: "Litros", value: 3, text: "L" },
  { label: "Mililitros", value: 4, text: "ml" },
  { label: "Unidades", value: 5, text: "unidad" },
  { label: "Libras", value: 6, text: "lb" },
  { label: "Onzas", value: 7, text: "oz" },
  { label: "Tazas", value: 8, text: "taza" },
  { label: "Cucharadas", value: 9, text: "cda" },
  { label: "Cucharaditas", value: 10, text: "cdta" },
];

const obtenerNombreUnidad = (idUnidad) => {
  const unidad = unidadesMedida.find((u) => u.value === idUnidad);
  return unidad ? unidad.label : "";
};
const obtenerTextoUnidad = (idUnidad) => {
  const unidad = unidadesMedida.find((u) => u.value === idUnidad);
  return unidad ? unidad.text : "";
};

export default function RecetaForm({
  initialData,
  onSave,
  onCancel,
  isEditing,
}) {
  const [formData, setFormData] = useState(
    initialData || {
      NombreReceta: "", // Changed from IdProductoGeneral
      Especificaciones: "",
    }
  );
  // insumosReceta ahora representa el DetalleReceta
  const [insumosReceta, setInsumosReceta] = useState(
    initialData?.insumos ? JSON.parse(JSON.stringify(initialData.insumos)) : []
  );
  const [notification, setNotification] = useState({
    visible: false,
    mensaje: "",
    tipo: "success",
  });

  const [mostrarModalInsumos, setMostrarModalInsumos] = useState(false);
  const [filtroInsumosDisponibles, setFiltroInsumosDisponibles] = useState("");
  const [insumosSeleccionados, setInsumosSeleccionados] = useState(new Set());

  useEffect(() => {
    // Ensures form data and insumos are reset/updated when initialData changes (e.g., when switching from add to edit)
    setFormData(
      initialData || {
        NombreReceta: "",
        Especificaciones: "",
      }
    );
    setInsumosReceta(
      initialData?.insumos
        ? JSON.parse(JSON.stringify(initialData.insumos))
        : []
    );
  }, [initialData]);

  useEffect(() => {
    // Sincronizar selecciones con insumos ya agregados
    const seleccionados = new Set(insumosReceta.map((insumo) => insumo.id));
    setInsumosSeleccionados(seleccionados);
  }, [insumosReceta]);

  const showNotification = (mensaje, tipo = "success") => {
    setNotification({ visible: true, mensaje, tipo });
  };
  const hideNotification = () =>
    setNotification({ visible: false, mensaje: "", tipo: "success" });

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validarFormularioPrincipal = () => {
    const { NombreReceta } = formData;

    if (!NombreReceta.trim()) {
      showNotification("El nombre de la receta es obligatorio.", "error");
      return false;
    }
    if (insumosReceta.length === 0) {
      showNotification("Debe agregar al menos un insumo a la receta", "error");
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validarFormularioPrincipal()) return;

    const dataToSave = {
      NombreReceta: formData.NombreReceta,
      Especificaciones: formData.Especificaciones,
      // Los insumos ahora son el DetalleReceta
      insumos: insumosReceta.map((ins) => ({
        IdInsumo: ins.id, // Maps to IdInsumo in DetalleReceta
        IdUnidadMedida: ins.IdUnidadMedida, // Maps to IdUnidadMedida in DetalleReceta
        Cantidad: parseFloat(ins.cantidad), // Maps to Cantidad in DetalleReceta
        // Optionally keep display info for UI purposes, but not for DB
        nombre: ins.nombre,
        unidad: obtenerTextoUnidad(ins.IdUnidadMedida),
      })),
    };
    onSave(dataToSave);
    // Do NOT clear insumosReceta here, as it might be needed if user cancels and re-edits immediately.
    // Clearing is handled by RecetasTabla when returning to list view or starting a new add.
  };

  // Insumo Modal Logic
  const insumosFiltradosDisponibles = mockInsumosDisponibles.filter(
    (insumo) =>
      insumo.nombre
        .toLowerCase()
        .includes(filtroInsumosDisponibles.toLowerCase()) ||
      insumo.categoria
        .toLowerCase()
        .includes(filtroInsumosDisponibles.toLowerCase())
  );

  const handleInsumoSelection = (insumoId) => {
    const newSelection = new Set(insumosSeleccionados);
    if (newSelection.has(insumoId)) {
      newSelection.delete(insumoId);
    } else {
      newSelection.add(insumoId);
    }
    setInsumosSeleccionados(newSelection);
  };

  const handleAgregarInsumosSeleccionados = () => {
    const insumosAAgregar = mockInsumosDisponibles.filter(
      (insumo) =>
        insumosSeleccionados.has(insumo.id) &&
        !insumosReceta.some((item) => item.id === insumo.id)
    );

    if (insumosAAgregar.length === 0) {
      showNotification(
        "No hay nuevos insumos seleccionados para agregar.",
        "error"
      );
      return;
    }

    const nuevosInsumos = insumosAAgregar.map((insumo) => ({
      ...insumo,
      cantidad: 1, // Default quantity
    }));

    setInsumosReceta((prev) => [...prev, ...nuevosInsumos]);
    setMostrarModalInsumos(false);
    setInsumosSeleccionados(new Set());
    showNotification(
      `${insumosAAgregar.length} insumo(s) agregado(s) exitosamente.`
    );
  };

  const handleCantidadInsumoChange = (id, value) => {
    setInsumosReceta((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, cantidad: Math.max(1, parseFloat(value) || 0) }
          : item
      )
    );
  };

  const handleRemoveInsumoFromRecipe = (id) => {
    setInsumosReceta((prev) => prev.filter((item) => item.id !== id));
    showNotification("Insumo eliminado de la lista de receta.");
  };

  return (
    <div className="compra-form-container">
      <NotificationComponent
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      <h1>{isEditing ? "Editar Receta" : "Agregar Receta"}</h1>

      <div className="compra-fields-grid">
        <div className="field-group" style={{ gridColumn: "span 2" }}>
          <label>Nombre de la Receta:*</label>
          <input
            type="text"
            value={formData.NombreReceta}
            onChange={(e) => handleFormChange("NombreReceta", e.target.value)}
            className="modal-input"
            maxLength={50}
          />
        </div>

        <div className="field-group" style={{ gridColumn: "span 2" }}>
          <label>Especificaciones:</label>
          <textarea
            value={formData.Especificaciones}
            onChange={(e) =>
              handleFormChange("Especificaciones", e.target.value)
            }
            className="modal-input observaciones-field"
            maxLength={80}
            placeholder="Descripción de la receta..."
          ></textarea>
        </div>
      </div>

      <div className="section-divider"></div>

      <div className="detalle-section">
        <h2>Insumos para la Receta*</h2>
        <table className="compra-detalle-table">
          <thead className="p-datatable-thead">
            <tr>
              <th>Nombre Insumo</th>
              <th>Cantidad</th>
              <th>Unidad de Medida</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody className="p-datatable">
            {insumosReceta.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={{ textAlign: "center", padding: "1rem" }}
                >
                  No hay insumos agregados, utiliza "agregar insumos " para
                  añadirlos
                </td>
              </tr>
            ) : (
              insumosReceta.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) =>
                        handleCantidadInsumoChange(item.id, e.target.value)
                      }
                      style={{ width: "80px" }}
                    />
                  </td>
                  <td>{obtenerTextoUnidad(item.IdUnidadMedida)}</td>
                  <td>
                    <button
                      className="btn-eliminar"
                      onClick={() => handleRemoveInsumoFromRecipe(item.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <button
          className="btn-agregar-insumos"
          onClick={() => setMostrarModalInsumos(true)}
        >
          + Agregar Insumos
        </button>
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

      {/* Modal para seleccionar insumos con diseño tipo tarjetas - COMPLETAMENTE CENTRADO */}
      {mostrarModalInsumos && (
        <ModalComponent
          visible={mostrarModalInsumos}
          onClose={() => setMostrarModalInsumos(false)}
        >
          {/* Header del modal */}
          <div
            style={{
              padding: "24px 24px 0 24px",
              borderBottom: "1px solid #e9ecef",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: "600",
                color: "#2c3e50",
              }}
            >
              Seleccionar Insumos
            </h2>
            <button
              onClick={() => setMostrarModalInsumos(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#6c757d",
                padding: "0",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>

          {/* Body del modal */}
          <div style={{ padding: "24px" }}>
            <SearchBarComponent
              placeholder="Buscar insumo..."
              value={filtroInsumosDisponibles}
              onChange={setFiltroInsumosDisponibles}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "20px",
                maxHeight: "400px",
                overflowY: "auto",
                padding: "10px",
                justifyItems: "center", // Centra las tarjetas en el grid
              }}
            >
              {insumosFiltradosDisponibles.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "#6c757d",
                    padding: "40px",
                  }}
                >
                  No se encontraron insumos.
                </div>
              ) : (
                insumosFiltradosDisponibles.map((insumo) => (
                  <div
                    key={insumo.id}
                    style={{
                      border: "1px solid #e9ecef",
                      borderRadius: "12px",
                      padding: "16px",
                      backgroundColor: "white",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                      position: "relative",
                      width: "280px", // Ancho fijo para mantener consistencia
                    }}
                    onClick={() => handleInsumoSelection(insumo.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 16px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.08)";
                    }}
                  >
                    {/* Checkbox en la esquina superior derecha */}
                    <input
                      type="checkbox"
                      checked={insumosSeleccionados.has(insumo.id)}
                      onChange={() => handleInsumoSelection(insumo.id)}
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                      }}
                    />

                    {/* Imagen del producto */}
                    <div style={{ textAlign: "center", marginBottom: "12px" }}>
                      <img
                        src={insumo.imagen}
                        alt={insumo.nombre}
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #e9ecef",
                        }}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/120x120/f8f9fa/6c757d?text=Sin+Imagen";
                        }}
                      />
                    </div>

                    {/* Información del producto */}
                    <div style={{ textAlign: "center" }}>
                      <h4
                        style={{
                          margin: "0 0 8px 0",
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#2c3e50",
                          lineHeight: "1.3",
                        }}
                      >
                        {insumo.nombre}
                      </h4>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6c757d",
                          marginBottom: "8px",
                        }}
                      >
                        Unidad: {obtenerTextoUnidad(insumo.IdUnidadMedida)}
                      </div>

                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: "#000",
                        }}
                      >
                        Precio: ${insumo.precio.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer del modal */}
          <div
            style={{
              padding: "16px 24px 24px 24px",
              borderTop: "1px solid #e9ecef",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f8f9fa",
              borderBottomLeftRadius: "12px",
              borderBottomRightRadius: "12px",
            }}
          >
            <button
              onClick={() => setMostrarModalInsumos(false)}
              style={{
                padding: "10px 20px",
                borderRadius: "6px",
                border: "1px solid #6c757d",
                backgroundColor: "white",
                color: "#6c757d",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Cancelar
            </button>

            <button
              onClick={handleAgregarInsumosSeleccionados}
              disabled={insumosSeleccionados.size === 0}
              style={{
                padding: "10px 20px",
                borderRadius: "6px",
                border: "none",
                backgroundColor:
                  insumosSeleccionados.size > 0 ? "#ff69b4" : "#ccc",
                color: "white",
                cursor:
                  insumosSeleccionados.size > 0 ? "pointer" : "not-allowed",
                fontSize: "14px",
                fontWeight: "500",
                opacity: insumosSeleccionados.size > 0 ? 1 : 0.6,
              }}
            >
              Agregar ({insumosSeleccionados.size})
            </button>
          </div>
        </ModalComponent>
      )}
    </div>
  );
}
