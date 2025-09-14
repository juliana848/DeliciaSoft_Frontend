import React, { useState } from "react";
import "../../../adminStyles.css";

// Mock data for unidades de medida
const unidadesDeMedida = [
  { id: 1, nombre: "gramos" },
  { id: 2, nombre: "ml" },
  { id: 3, nombre: "litros" },
  { id: 4, nombre: "gotas" },
  { id: 5, nombre: "unidades" },
  { id: 6, nombre: "kilogramos" },
];

export default function ProductosView({ producto, onClose }) {
  const [detalleVisible, setDetalleVisible] = useState(null);

  const formatearPrecio = (precio) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);

  // Helper to get unit name from IdUnidadMedida
  const getUnidadMedidaNombre = (id) => {
    const unidad = unidadesDeMedida.find((u) => u.id === id);
    return unidad ? unidad.nombre : "unidad";
  };

  const toggleDetalleReceta = (id) => {
    setDetalleVisible(detalleVisible === id ? null : id);
  };

  if (!producto) return null;

  return (
    <div
      className="modal-overlay-fixed"
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
        zIndex: 9999,
      }}
    >
      <div
        className="modal-content-fixed"
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          maxWidth: "90vw",
          width: "900px",
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
        }}
      >
        <div style={{ padding: "2rem" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
              borderBottom: "2px solid #f1f1f1",
              paddingBottom: "1rem",
            }}
          >
            <h2
              style={{
                color: "#2c3e50",
                margin: 0,
                fontSize: "1.8rem",
                fontWeight: "600",
              }}
            >
              📋 Detalles del Producto
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "#ff6b6b",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                fontWeight: "600",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#e55555"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#ff6b6b"}
            >
              ✕ Cerrar
            </button>
          </div>

          {/* Información básica del producto */}
          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#34495e",
                    marginBottom: "0.5rem",
                  }}
                >
                  📝 Nombre del Producto
                </label>
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    color: "#2c3e50",
                    fontWeight: "500",
                  }}
                >
                  {producto.nombre}
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#34495e",
                    marginBottom: "0.5rem",
                  }}
                >
                  💰 Precio
                </label>
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#e8f5e8",
                    border: "2px solid #4CAF50",
                    borderRadius: "8px",
                    fontSize: "1.1rem",
                    color: "#2e7d32",
                    fontWeight: "700",
                  }}
                >
                  {formatearPrecio(producto.precio || 0)}
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#34495e",
                    marginBottom: "0.5rem",
                  }}
                >
                  🏷️ Categoría
                </label>
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#fff3e0",
                    border: "2px solid #ff9800",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    color: "#f57c00",
                    fontWeight: "600",
                  }}
                >
                  {producto.categoria}
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#34495e",
                    marginBottom: "0.5rem",
                  }}
                >
                  📊 Estado
                </label>
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: producto.estado ? "#e8f5e8" : "#ffebee",
                    border: producto.estado ? "2px solid #4CAF50" : "2px solid #f44336",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    color: producto.estado ? "#2e7d32" : "#c62828",
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  {producto.estado ? "✅ Activo" : "⛔ Inactivo"}
                </div>
              </div>
            </div>

            {/* Imagen del producto */}
            {producto.imagen && (
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#34495e",
                    marginBottom: "0.5rem",
                  }}
                >
                  🖼️ Imagen del Producto
                </label>
                <div style={{ textAlign: "center" }}>
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    style={{
                      maxWidth: "300px",
                      maxHeight: "300px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      border: "3px solid #e9ecef",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Inventario */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
                marginBottom: "2rem",
                padding: "1.5rem",
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
                border: "1px solid #dee2e6",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#34495e",
                    marginBottom: "0.5rem",
                  }}
                >
                  📦 Cantidad Disponible
                </label>
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "white",
                    border: "2px solid #6c757d",
                    borderRadius: "8px",
                    fontSize: "1.1rem",
                    color: "#495057",
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  {producto.cantidad || 0} unidades
                </div>
              </div>

              {producto.cantidadSanBenito !== undefined && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      color: "#34495e",
                      marginBottom: "0.5rem",
                    }}
                  >
                    🏪 Cantidad en San Benito
                  </label>
                  <div
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "white",
                      border: "2px solid #6c757d",
                      borderRadius: "8px",
                      fontSize: "1.1rem",
                      color: "#495057",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    {producto.cantidadSanBenito || 0} unidades
                  </div>
                </div>
              )}
            </div>

            {/* Especificaciones */}
            {producto.especificaciones && (
              <div style={{ marginBottom: "2rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#34495e",
                    marginBottom: "0.5rem",
                  }}
                >
                  📋 Especificaciones
                </label>
                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "#e8f4f8",
                    border: "2px solid #17a2b8",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    color: "#2c3e50",
                    lineHeight: "1.5",
                  }}
                >
                  {producto.especificaciones}
                </div>
              </div>
            )}

            {/* Sección de Recetas */}
            <div style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  backgroundColor: "#e3f2fd",
                  borderRadius: "12px",
                  border: "2px solid #2196f3",
                }}
              >
                <h3
                  style={{
                    color: "#1565c0",
                    fontSize: "1.4rem",
                    fontWeight: "700",
                    margin: 0,
                    textAlign: "center",
                    flex: 1,
                  }}
                >
                  👨‍🍳 Recetas Asociadas al Producto
                </h3>
              </div>

              {producto.recetas?.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                  }}
                >
                  {producto.recetas.map((receta, index) => (
                    <div
                      key={receta.id}
                      style={{
                        border: "2px solid #e9ecef",
                        borderRadius: "12px",
                        overflow: "hidden",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        transition: "box-shadow 0.3s ease",
                      }}
                    >
                      {/* Header de la receta */}
                      <div
                        onClick={() => toggleDetalleReceta(receta.id)}
                        style={{
                          padding: "1.5rem",
                          backgroundColor: index % 2 === 0 ? "#f1f8e9" : "#fff3e0",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderBottom: "1px solid #e9ecef",
                          transition: "background-color 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#e8f5e8" : "#ffe0b2";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#f1f8e9" : "#fff3e0";
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                          }}
                        >
                          {receta.imagen ? (
                            <img
                              src={receta.imagen}
                              alt={receta.nombre}
                              style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                                borderRadius: "10px",
                                border: "2px solid #dee2e6",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "60px",
                                height: "60px",
                                backgroundColor: "#6c757d",
                                borderRadius: "10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.5rem",
                                color: "white",
                              }}
                            >
                              🍰
                            </div>
                          )}
                          <div>
                            <h4
                              style={{
                                margin: 0,
                                color: "#2c3e50",
                                fontSize: "1.2rem",
                                fontWeight: "700",
                                marginBottom: "0.25rem",
                              }}
                            >
                              📋 {receta.nombre}
                            </h4>
                            <p
                              style={{
                                margin: 0,
                                color: "#6c757d",
                                fontSize: "0.9rem",
                                fontStyle: "italic",
                              }}
                            >
                              Click para ver detalles de la receta
                            </p>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: detalleVisible === receta.id ? "#4CAF50" : "#6c757d",
                              color: "white",
                              padding: "0.5rem 1rem",
                              borderRadius: "20px",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                            }}
                          >
                            {detalleVisible === receta.id ? "Expandida" : "Contraída"}
                          </div>
                          <span
                            style={{
                              color: "#7f8c8d",
                              fontSize: "1.5rem",
                              transform:
                                detalleVisible === receta.id
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                              transition: "transform 0.3s ease",
                            }}
                          >
                            ⬇️
                          </span>
                        </div>
                      </div>

                      {/* Detalles de la receta (colapsable) */}
                      {detalleVisible === receta.id && (
                        <div 
                          style={{ 
                            padding: "2rem",
                            backgroundColor: "#fafafa",
                            animation: "fadeIn 0.3s ease-in-out",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "2rem",
                            }}
                          >
                            {/* Insumos */}
                            <div>
                              <h5
                                style={{
                                  color: "#2e7d32",
                                  marginBottom: "1rem",
                                  fontSize: "1.1rem",
                                  fontWeight: "700",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                🥄 Insumos Necesarios
                              </h5>
                              <div
                                style={{
                                  backgroundColor: "#ffffff",
                                  borderRadius: "10px",
                                  border: "2px solid #e8f5e8",
                                  padding: "1rem",
                                }}
                              >
                                {receta.insumos?.length > 0 ? (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    {receta.insumos.map((insumo, idx) => (
                                      <div
                                        key={idx}
                                        style={{
                                          padding: "0.75rem",
                                          backgroundColor: "#f8f9fa",
                                          borderRadius: "8px",
                                          border: "1px solid #dee2e6",
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                        }}
                                      >
                                        <span
                                          style={{
                                            color: "#2c3e50",
                                            fontSize: "0.9rem",
                                            fontWeight: "600",
                                          }}
                                        >
                                          • {insumo.nombre}
                                        </span>
                                        <span
                                          style={{
                                            color: "#6c757d",
                                            fontSize: "0.85rem",
                                            backgroundColor: "#e9ecef",
                                            padding: "0.25rem 0.5rem",
                                            borderRadius: "4px",
                                            fontWeight: "600",
                                          }}
                                        >
                                          {insumo.cantidad} {getUnidadMedidaNombre(insumo.IdUnidadMedida)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      textAlign: "center",
                                      color: "#6c757d",
                                      fontStyle: "italic",
                                      padding: "1rem",
                                    }}
                                  >
                                    ℹ️ No hay insumos asociados a esta receta
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Recetas anidadas */}
                            <div>
                              <h5
                                style={{
                                  color: "#d32f2f",
                                  marginBottom: "1rem",
                                  fontSize: "1.1rem",
                                  fontWeight: "700",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                🔄 Sub-Recetas Necesarias
                              </h5>
                              <div
                                style={{
                                  backgroundColor: "#ffffff",
                                  borderRadius: "10px",
                                  border: "2px solid #ffebee",
                                  padding: "1rem",
                                }}
                              >
                                {receta.recetasAnidadas?.length > 0 ? (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    {receta.recetasAnidadas.map((subReceta, idx) => (
                                      <div
                                        key={idx}
                                        style={{
                                          padding: "0.75rem",
                                          backgroundColor: "#f8f9fa",
                                          borderRadius: "8px",
                                          border: "1px solid #dee2e6",
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                        }}
                                      >
                                        <span
                                          style={{
                                            color: "#2c3e50",
                                            fontSize: "0.9rem",
                                            fontWeight: "600",
                                          }}
                                        >
                                          🧩 {subReceta.nombre}
                                        </span>
                                        <span
                                          style={{
                                            color: "#6c757d",
                                            fontSize: "0.85rem",
                                            backgroundColor: "#e9ecef",
                                            padding: "0.25rem 0.5rem",
                                            borderRadius: "4px",
                                            fontWeight: "600",
                                          }}
                                        >
                                          {subReceta.cantidad || 1} unidad(es)
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      textAlign: "center",
                                      color: "#6c757d",
                                      fontStyle: "italic",
                                      padding: "1rem",
                                    }}
                                  >
                                    ℹ️ No hay sub-recetas asociadas
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "3rem 2rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "12px",
                    border: "2px dashed #6c757d",
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🍽️</div>
                  <h4
                    style={{
                      color: "#6c757d",
                      margin: 0,
                      fontSize: "1.1rem",
                      fontWeight: "600",
                    }}
                  >
                    Este producto no tiene recetas asociadas
                  </h4>
                  <p
                    style={{
                      color: "#adb5bd",
                      margin: "0.5rem 0 0 0",
                      fontSize: "0.9rem",
                    }}
                  >
                    Puedes agregar recetas editando este producto
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}