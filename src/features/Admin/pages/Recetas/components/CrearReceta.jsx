import React, { useState } from "react";
import ModalComponent from '../../../components/modal';

export default function CrearReceta({ visible, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nombrereceta: "",
    especificaciones: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

const handleSubmit = async () => {
  if (!formData.nombrereceta.trim()) {
    alert("El nombre de la receta es obligatorio");
    return;
  }

  try {
    setLoading(true);
    const res = await fetch("https://deliciasoft-backend.onrender.com/api/receta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    onSave(data); // Devuelve la receta creada
    setFormData({ nombrereceta: "", especificaciones: "" });
  } catch (error) {
    console.error("Error al crear receta:", error);
    alert("No se pudo crear la receta");
  } finally {
    setLoading(false);
  }
};


  return (
    <ModalComponent visible={visible} onClose={onClose}>
      <div style={{ padding: "20px", maxWidth: "500px" }}>
        <h2>Crear Receta</h2>

        <div style={{ marginBottom: "15px" }}>
          <label>Nombre de la receta*</label>
          <input
            type="text"
            value={formData.nombrereceta}
            onChange={(e) => handleChange("nombrereceta", e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Especificaciones</label>
          <textarea
            value={formData.especificaciones}
            onChange={(e) => handleChange("especificaciones", e.target.value)}
            rows={4}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{ padding: "10px 15px", borderRadius: "6px", backgroundColor: "#ccc", border: "none" }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            style={{ padding: "10px 15px", borderRadius: "6px", backgroundColor: "#28a745", color: "white", border: "none" }}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </ModalComponent>
  );
}
