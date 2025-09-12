import React, { useState } from "react";

export default function CrearReceta({ visible, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nombrereceta: "",
    especificaciones: "",
    insumos: [],
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.nombrereceta.trim()) {
      alert("El nombre de la receta es obligatorio.");
      return;
    }
    onSave(formData);
    setFormData({ nombrereceta: "", especificaciones: "", insumos: [] });
  };

  return (
    <ModalComponent visible={visible} onClose={onClose}>
      <div style={{ padding: "20px" }}>
        <h2>Crear Receta</h2>
        <div style={{ marginBottom: "12px" }}>
          <label>Nombre de receta*</label>
          <input
            type="text"
            value={formData.nombrereceta}
            onChange={(e) => handleChange("nombrereceta", e.target.value)}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Especificaciones</label>
          <textarea
            value={formData.especificaciones}
            onChange={(e) => handleChange("especificaciones", e.target.value)}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
            rows={3}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <button
            style={{ backgroundColor: "#28a745", color: "white", padding: "10px 16px", border: "none", borderRadius: "6px", cursor: "pointer" }}
            onClick={() => alert("Abrir modal para agregar insumos")}
          >
            + Agregar Insumos
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #ccc" }}>Cancelar</button>
          <button onClick={handleSave} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", backgroundColor: "#007bff", color: "white" }}>Guardar</button>
        </div>
      </div>
    </ModalComponent>
  );
}
