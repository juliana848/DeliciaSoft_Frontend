import React, { useState } from "react";
import ModalComponent from '../../../components/modal'; // tu modal centrado

export default function ModalRecetas({ visible, onClose, todasRecetas = [], onSelect, onCrearReceta }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecetas = todasRecetas.filter((r) =>
    r.nombrereceta.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ModalComponent visible={visible} onClose={onClose}>
      <div style={{ padding: "20px" }}>
        <h2>Selecciona una receta</h2>

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar receta..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            width: "100%",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        />

        {/* Lista de recetas */}
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {filteredRecetas.length === 0 ? (
            <p>No se encontraron recetas</p>
          ) : (
            filteredRecetas.map((receta) => (
              <div
                key={receta.idreceta}
                onClick={() => onSelect(receta)}
                style={{
                  padding: "10px 15px",
                  marginBottom: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: "#f9f9f9",
                }}
              >
                {receta.nombrereceta}
              </div>
            ))
          )}
        </div>

        {/* Botón crear receta */}
        <button
          onClick={onCrearReceta}
          style={{
            marginTop: "20px",
            padding: "10px 15px",
            borderRadius: "8px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          + Crear Receta
        </button>
      </div>
    </ModalComponent>
  );
}
