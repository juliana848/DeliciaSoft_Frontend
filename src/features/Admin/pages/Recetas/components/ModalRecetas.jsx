import React, { useEffect, useState } from "react";
import ModalComponent from '../../../components/modal';
import CrearReceta from "./CrearReceta";

export default function ModalRecetas({ visible, onClose, onSelect }) {
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarCrear, setMostrarCrear] = useState(false);

useEffect(() => {
  if (!visible) return;

  const fetchRecetas = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://deliciasoft-backend.onrender.com/api/receta");
      const data = await res.json();
      setRecetas(data || []);
    } catch (error) {
      console.error("Error al cargar recetas:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchRecetas();
}, [visible]);


  const filteredRecetas = recetas.filter(r =>
    r.nombrereceta.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <ModalComponent visible={visible} onClose={onClose}>
        <div style={{ padding: "20px", maxWidth: "700px" }}>
          <h2>Selecciona Receta</h2>

          <input
            type="text"
            placeholder="Buscar receta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "6px", border: "1px solid #ccc" }}
          />

          <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
            {loading ? (
              <p>Cargando recetas...</p>
            ) : filteredRecetas.length === 0 ? (
              <p>No se encontraron recetas</p>
            ) : (
              filteredRecetas.map(r => (
                <div
                  key={r.idreceta}
                  onClick={() => onSelect(r)}
                  style={{
                    padding: "10px",
                    marginBottom: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    cursor: "pointer",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <strong>{r.nombrereceta}</strong>
                  <p>{r.especificaciones || "Sin especificaciones"}</p>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setMostrarCrear(true)}
            style={{
              marginTop: "15px",
              padding: "10px 15px",
              borderRadius: "6px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
            }}
          >
            + Crear Receta
          </button>
        </div>
      </ModalComponent>

      {mostrarCrear && (
        <CrearReceta
          visible={mostrarCrear}
          onClose={() => setMostrarCrear(false)}
          onSave={(nuevaReceta) => {
            setRecetas(prev => [...prev, nuevaReceta]);
            onSelect(nuevaReceta);
            setMostrarCrear(false);
          }}
        />
      )}
    </>
  );
}
