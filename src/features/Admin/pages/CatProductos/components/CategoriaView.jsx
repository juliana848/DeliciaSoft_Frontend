import React from "react";

export default function CategoriaView({ visible, categoria, onClose }) {
  if (!visible || !categoria) return null;

  const fieldStyle = {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "0.95rem",
    boxSizing: "border-box",
    backgroundColor: "#f9f9f9",
    color: "#333",
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "1.5rem", width: "400px", maxWidth: "90vw", maxHeight: "90vh", overflow: "auto", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "2px solid #e91e63" }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>Ver Categoría</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#666" }}>×</button>
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Nombre</label>
          <input type="text" value={categoria.nombre || ""} disabled style={fieldStyle} />
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Descripción</label>
          <textarea value={categoria.descripcion || ""} rows={3} disabled style={{ ...fieldStyle, resize: "none", fontFamily: "inherit" }} />
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Imagen</label>
          {categoria.imagen ? (
            <img src={categoria.imagen} alt={categoria.nombre} style={{ width: "100px", height: "100px", borderRadius: "8px", objectFit: "cover", border: "1px solid #ddd" }} />
          ) : (
            <div style={{ padding: "1rem", backgroundColor: "#f9f9f9", border: "1px solid #ddd", borderRadius: "4px", color: "#666", textAlign: "center", fontSize: "0.9rem" }}>Sin imagen</div>
          )}
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Estado</label>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem",
            backgroundColor: categoria.activo ? "#e8f5e9" : "#ffebee",
            color: categoria.activo ? "#2e7d32" : "#c62828",
            borderRadius: "20px", fontSize: "0.9rem", fontWeight: 500
          }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: categoria.activo ? "#4caf50" : "#f44336" }}></span>
            {categoria.activo ? "Activo" : "Inactivo"}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #eee" }}>
          <button onClick={onClose} style={{ padding: "0.5rem 1.5rem", border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer", backgroundColor: "#fff", fontSize: "0.95rem" }}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
