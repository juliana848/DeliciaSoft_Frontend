// src/features/Admin/pages/Produccion/components/ModalDetalleReceta.jsx
import React, { useEffect } from "react";

export default function ModalDetalleReceta({ receta, onClose }) {
  if (!receta) return null;

  // debug: mostrar el objeto receta y sus insumos en consola
  useEffect(() => {
    console.log("🔍 ModalDetalleReceta → receta:", receta);
  }, [receta]);

  const renderInsumos = () => {
    if (!receta.insumos || receta.insumos.length === 0) {
      return <p>No hay insumos</p>;
    }

    return (
      <ul style={{ listStyle: "none", padding: 0 }}>
        {receta.insumos.map((insumo, index) => {
          // nombre posible de insumo
          const nombre =
            insumo.nombreinsumo ??
            insumo.nombre ??
            insumo.insumo?.nombreinsumo ??
            insumo.insumoNombre ??
            "Sin nombre";

          const cantidad = insumo.cantidad ?? "";
          const unidad = insumo.unidadmedida ?? "";

          return (
            <li
              key={insumo.iddetallereceta ?? index}
              style={{
                padding: "8px",
                marginBottom: "4px",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px"
              }}
            >
              • {nombre} {cantidad !== "" ? `- ${cantidad} ${unidad}` : ""}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="receta-detalle-container">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          marginBottom: "20px"
        }}
      >
        {receta.imagen && (
          <img
            src={receta.imagen}
            alt={receta.nombrereceta || receta.nombre}
            width="80"
            height="80"
            style={{ objectFit: "cover", borderRadius: "8px" }}
          />
        )}
        <div>
          <h2 style={{ margin: "0 0 8px 0" }}>
            {receta.nombrereceta ?? receta.nombre ?? "Receta"}
          </h2>
          <p style={{ margin: 0, color: "#666" }}>
            {receta.insumos?.length ?? 0} insumos
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px"
        }}
      >
        {/* Insumos */}
        <div>
          <h3>📋 Insumos necesarios:</h3>
          {renderInsumos()}
        </div>

        {/* Especificaciones */}
        <div>
          <h3>📝 Especificaciones:</h3>
          <textarea
            className="form-input"
            style={{ width: "100%", minHeight: "150px", resize: "none" }}
            value={receta.especificaciones ?? ""}
            disabled
          />
        </div>
      </div>

      {/* Footer */}
      <div
        className="modal-footer"
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          justifyContent: "flex-end"
        }}
      >
        <button className="modal-btn cancel-btn" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
