import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import Modal from "../components/modal";
import SearchBar from "../components/SearchBar";
import Notification from "../components/Notification";
import RecetaForm from "./Recetas/components/Agregarproduc";
import "../adminStyles.css";

// Mock data for insumos - Moved to top for better access
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
    nombre: "Azucar Blanca",
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
    categoria: "Lacteos",
    IdUnidadMedida: 2,
    precio: 22.4,
    imagen:
      "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: 6,
    nombre: "Leche Entera",
    categoria: "Lacteos",
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

// Mock data for unidades de medida
const unidadesDeMedida = [
  { id: 1, nombre: "gramos" },
  { id: 2, nombre: "ml" },
  { id: 3, nombre: "litros" },
  { id: 4, nombre: "gotas" },
  { id: 5, nombre: "unidades" },
  { id: 6, nombre: "kilogramos" },
];

// Mock data for categorías de productos
const categorias = [
  { id: 301, nombre: "Fresas con crema" },
  { id: 302, nombre: "Obleas" },
  { id: 303, nombre: "Cupcakes" },
  { id: 304, nombre: "Postres" },
  { id: 305, nombre: "Pasteles" },
  { id: 306, nombre: "Arroz con leche" },
];

// Componente modal de visualización mejorado con recetas detalladas
const VisualizarProductoModal = ({
  visible,
  onClose,
  producto,
  onToggleDetalle,
  detalleVisible,
  unidadesDeMedida,
}) => {
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

  if (!visible || !producto) return null;

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
                  {producto.estado ? "✅ Activo" : "❌ Inactivo"}
                </div>
              </div>
            </div>

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
                  🏢 Cantidad en San Pablo
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
                  {producto.cantidadSanPablo || 0} unidades
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
            </div>

            {/* Sección de Recetas Mejorada */}
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
                      {/* Header de la receta mejorado */}
                      <div
                        onClick={() => onToggleDetalle(receta.id)}
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

                      {/* Detalles de la receta (colapsable) mejorado */}
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
                            {/* Insumos mejorado */}
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

                            {/* Recetas anidadas mejorado */}
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
};

export default function ProductosTabla() {
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [notification, setNotification] = useState({
    visible: false,
    mensaje: "",
    tipo: "success",
  });
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [currentView, setCurrentView] = useState("list");
  const [recetaDetalleVisible, setRecetaDetalleVisible] = useState(null);

  // Función corregida para obtener nombre de categoría por ID
  const getNombreCategoriaById = (idCategoria) => {
    if (!idCategoria && idCategoria !== 0) {
      return "Sin categoría";
    }
    
    const id = Number(idCategoria);
    const categoria = categorias.find(cat => cat.id === id);
    return categoria ? categoria.nombre : "Sin categoría";
  };

  const toggleDetalleReceta = (id) => {
    setRecetaDetalleVisible(recetaDetalleVisible === id ? null : id);
  };

  const formatearPrecio = (precio) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);

  useEffect(() => {
    // Mock productos actualizados con más recetas detalladas
    const mockProductos = [
      {
        id: 1,
        nombre: "Pan de Leche",
        precio: 5000,
        categoria: "Pasteles",
        cantidadSanPablo: 20,
        cantidadSanBenito: 15,
        estado: true,
        tieneRelaciones: true,
        recetas: [
          {
            id: 1,
            nombre: "Pan Integral Casero",
            imagen: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop&crop=center",
            insumos: [
              { id: 1, nombre: "Harina de Trigo", cantidad: 500, IdUnidadMedida: 1 },
              { id: 2, nombre: "Azucar Blanca", cantidad: 50, IdUnidadMedida: 1 },
              { id: 3, nombre: "Levadura Seca", cantidad: 10, IdUnidadMedida: 1 },
              { id: 6, nombre: "Leche Entera", cantidad: 200, IdUnidadMedida: 2 },
            ],
            recetasAnidadas: [],
          },
        ],
      },
      {
        id: 2,
        nombre: "Pastel de Chocolate",
        precio: 35000,
        categoria: "Pasteles",
        cantidadSanPablo: 5,
        cantidadSanBenito: 8,
        estado: true,
        tieneRelaciones: true,
        recetas: [
          {
            id: 2,
            nombre: "Torta de Chocolate Fudge",
            imagen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop&crop=center",
            insumos: [
              { id: 1, nombre: "Harina de Trigo", cantidad: 300, IdUnidadMedida: 1 },
              { id: 7, nombre: "Chocolate Semiamargo", cantidad: 200, IdUnidadMedida: 1 },
              { id: 8, nombre: "Esencia de Vainilla", cantidad: 5, IdUnidadMedida: 4 },
              { id: 4, nombre: "Huevos A", cantidad: 4, IdUnidadMedida: 5 },
              { id: 5, nombre: "Mantequilla sin sal", cantidad: 150, IdUnidadMedida: 1 },
            ],
            recetasAnidadas: [
              { id: 21, nombre: "Crema de Chocolate", cantidad: 1 }
            ],
          },
        ],
      },
      {
        id: 3,
        nombre: "Galletas de Avena",
        precio: 1500,
        categoria: "Postres",
        cantidadSanPablo: 50,
        cantidadSanBenito: 45,
        estado: false,
        tieneRelaciones: false,
        recetas: [],
      },
      {
        id: 4,
        nombre: "Cupcake de Vainilla",
        precio: 3000,
        categoria: "Cupcakes",
        cantidadSanPablo: 30,
        cantidadSanBenito: 25,
        estado: true,
        tieneRelaciones: true,
        recetas: [
          {
            id: 3,
            nombre: "Base de Cupcake de Vainilla",
            imagen: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=200&h=200&fit=crop&crop=center",
            insumos: [
              { id: 1, nombre: "Harina de Trigo", cantidad: 200, IdUnidadMedida: 1 },
              { id: 2, nombre: "Azucar Blanca", cantidad: 150, IdUnidadMedida: 1 },
              { id: 4, nombre: "Huevos A", cantidad: 2, IdUnidadMedida: 5 },
              { id: 5, nombre: "Mantequilla sin sal", cantidad: 100, IdUnidadMedida: 1 },
              { id: 6, nombre: "Leche Entera", cantidad: 100, IdUnidadMedida: 2 },
              { id: 8, nombre: "Esencia de Vainilla", cantidad: 2, IdUnidadMedida: 4 },
            ],
            recetasAnidadas: [
              { id: 31, nombre: "Crema de Vainilla", cantidad: 1 },
              { id: 32, nombre: "Decoración de Fondant", cantidad: 1 }
            ],
          },
        ],
      },
      {
        id: 5,
        nombre: "Cheesecake de Fresas",
        precio: 28000,
        categoria: "Fresas con crema",
        cantidadSanPablo: 8,
        cantidadSanBenito: 12,
        estado: true,
        tieneRelaciones: true,
        recetas: [
          {
            id: 4,
            nombre: "Cheesecake de Fresas Premium",
            imagen: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&h=200&fit=crop&crop=center",
            insumos: [
              { id: 1, nombre: "Harina de Trigo", cantidad: 100, IdUnidadMedida: 1 },
              { id: 2, nombre: "Azucar Blanca", cantidad: 200, IdUnidadMedida: 1 },
              { id: 4, nombre: "Huevos A", cantidad: 3, IdUnidadMedida: 5 },
              { id: 5, nombre: "Mantequilla sin sal", cantidad: 80, IdUnidadMedida: 1 },
              { id: 8, nombre: "Esencia de Vainilla", cantidad: 3, IdUnidadMedida: 4 },
            ],
            recetasAnidadas: [
              { id: 41, nombre: "Base de Galleta", cantidad: 1 },
              { id: 42, nombre: "Relleno de Queso", cantidad: 1 },
              { id: 43, nombre: "Salsa de Fresas", cantidad: 1 }
            ],
          },
        ],
      },
    ];
    setProductos(mockProductos);
  }, []);

  const toggleEstado = (producto) => {
    const updated = productos.map((p) =>
      p.id === producto.id ? { ...p, estado: !p.estado } : p
    );
    setProductos(updated);
    showNotification(
      `Producto ${producto.estado ? "inactivado" : "activado"} exitosamente`
    );
  };

  const showNotification = (mensaje, tipo = "success") => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: "", tipo: "success" });
  };

  const handleSearch = (query) => {
    setFiltro(query);
  };

  const filteredProductos = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleAgregarProducto = () => {
    setCurrentView("add");
  };

  const editarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setCurrentView("edit");
  };

  const visualizarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setCurrentView("visualize");
  };

  const confirmarEliminarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setCurrentView("delete");
  };

  const handleCancel = () => {
    setCurrentView("list");
    setProductoSeleccionado(null);
  };

  const handleSaveProducto = (productoData) => {
    console.log("Datos recibidos del formulario:", productoData);

    if (productoData.id || productoData.Idreceta) {
      // Lógica para editar un producto existente
      const productId = productoData.id || productoData.Idreceta;
      const updatedProductos = productos.map((p) =>
        p.id === productId
          ? {
              ...p,
              nombre: productoData.NombreReceta || 
                     productoData.NombreProducto || 
                     productoData.nombre || 
                     p.nombre,
              precio: productoData.Costo ? Number(productoData.Costo) : p.precio,
              categoria: getNombreCategoriaById(productoData.IdCategoria),
              cantidadSanPablo: productoData.CantidadSanPablo ? 
                               Number(productoData.CantidadSanPablo) : 
                               p.cantidadSanPablo,
              cantidadSanBenito: productoData.CantidadSanBenito ? 
                                Number(productoData.CantidadSanBenito) : 
                                p.cantidadSanBenito,
              recetas: p.recetas || []
            }
          : p
      );
      setProductos(updatedProductos);
      showNotification("Producto actualizado exitosamente");
    } else {
      // Lógica para agregar un nuevo producto
      const newId = Math.max(...productos.map(p => p.id), 0) + 1;
      
      const nombreCategoria = getNombreCategoriaById(productoData.IdCategoria);
      
      const newProducto = {
        id: newId,
        nombre: productoData.NombreReceta || "Producto sin nombre",
        precio: productoData.Costo ? Number(productoData.Costo) : 0,
        categoria: nombreCategoria,
        cantidadSanPablo: productoData.CantidadSanPablo ? Number(productoData.CantidadSanPablo) : 0,
        cantidadSanBenito: productoData.CantidadSanBenito ? Number(productoData.CantidadSanBenito) : 0,
        estado: true,
        tieneRelaciones: (productoData.insumos && productoData.insumos.length > 0) || 
                        (productoData.recetasAnidadas && productoData.recetasAnidadas.length > 0),
        recetas: (productoData.insumos?.length > 0 || productoData.recetasAnidadas?.length > 0) ? [{
          id: newId,
          nombre: productoData.NombreReceta || "Producto sin nombre",
          insumos: productoData.insumos || [],
          recetasAnidadas: productoData.recetasAnidadas || []
        }] : []
      };
      
      setProductos(prevProductos => {
        const nuevosProductos = [...prevProductos, newProducto];
        return nuevosProductos;
      });
      
      showNotification(`Producto "${newProducto.nombre}" agregado exitosamente`);
    }
    
    handleCancel();
  };

  const eliminarProducto = () => {
    const updatedProductos = productos.filter(
      (p) => p.id !== productoSeleccionado.id
    );
    setProductos(updatedProductos);
    showNotification("Producto eliminado exitosamente");
    handleCancel();
  };

  const crearInitialDataParaRecetaForm = (producto) => {
    if (!producto) return {};

    const insumosDeRecetas = producto.recetas.flatMap(receta =>
      receta.insumos.map(insumo => ({
        ...insumo,
        IdUnidadMedida: unidadesDeMedida.find(u => u.nombre === insumo.unidad)?.id || insumo.IdUnidadMedida
      }))
    );

    const recetasAnidadas = producto.recetas.flatMap(receta =>
      receta.recetasAnidadas.map(recetaAnidada => ({
        ...recetaAnidada,
        Idreceta: recetaAnidada.id 
      }))
    );

    const categoriaId = categorias.find(cat => cat.nombre === producto.categoria)?.id || 301;

    return {
      Idreceta: producto.id,
      NombreReceta: producto.nombre,
      Especificaciones: "", 
      Costo: producto.precio,
      IdCategoria: categoriaId,
      CantidadSanPablo: producto.cantidadSanPablo,
      CantidadSanBenito: producto.cantidadSanBenito,
      insumos: insumosDeRecetas,
      recetasAnidadas: recetasAnidadas,
    };
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "list":
        return (
          <>
            <div className="admin-wrapper">
              <div className="admin-toolbar">
                <button
                  className="admin-button pink"
                  onClick={handleAgregarProducto}
                >
                  + Agregar
                </button>
                <SearchBar
                  placeholder="Buscar productos..."
                  value={filtro}
                  onChange={handleSearch}
                />
              </div>

              <h2 className="admin-section-title">Gestión de productos</h2>

              <DataTable
                value={filteredProductos}
                paginator
                rows={5}
                className="admin-table"
              >
                <Column
                  header="N°"
                  body={(_, { rowIndex }) => rowIndex + 1}
                  headerStyle={{ textAlign: "right", paddingLeft: "15px" }}
                  bodyStyle={{ textAlign: "center", paddingLeft: "10px" }}
                  style={{ width: "0.5rem" }}
                />
                <Column
                  field="nombre"
                  header="Nombre"
                  headerStyle={{ textAlign: "right", paddingLeft: "105px" }}
                  bodyStyle={{ textAlign: "center", paddingLeft: "20px" }}
                  style={{ width: "250px" }}
                />
                <Column
                  field="precio"
                  header="Precio"
                  body={(row) => formatearPrecio(row.precio)}
                  headerStyle={{ textAlign: "right", paddingLeft: "105px" }}
                  bodyStyle={{ textAlign: "center", paddingLeft: "20px" }}
                  style={{ width: "250px" }}
                />
                <Column
                  field="categoria"
                  header="Categoría"
                  headerStyle={{ textAlign: "right", paddingLeft: "105px" }}
                  bodyStyle={{ textAlign: "center", paddingLeft: "40px" }}
                  style={{ width: "250px" }}
                />
                <Column
                  header="Estado"
                  body={(row) => (
                    <InputSwitch
                      checked={row.estado}
                      onChange={() => toggleEstado(row)}
                    />
                  )}
                  headerStyle={{ textAlign: "right", paddingLeft: "25px" }}
                  bodyStyle={{ textAlign: "center", paddingLeft: "20px" }}
                  style={{ width: "50px" }}
                />
                <Column
                  header="Acción"
                  body={(row) => (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className="admin-button gray"
                        onClick={() => visualizarProducto(row)}
                        aria-label="Ver producto"
                        title="Ver producto"
                      >
                        🔍
                      </button>
                      <button
                        className="admin-button yellow"
                        onClick={() => editarProducto(row)}
                        aria-label="Editar producto"
                        title="Editar producto"
                      >
                        ✏️
                      </button>
                      <button
                        className="admin-button red"
                        onClick={() => confirmarEliminarProducto(row)}
                        aria-label="Eliminar producto"
                        title="Eliminar producto"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                  headerStyle={{ textAlign: "right", paddingLeft: "65px" }}
                  bodyStyle={{ textAlign: "center", paddingLeft: "20px" }}
                  style={{ width: "250px" }}
                />
              </DataTable>
            </div>
          </>
        );

      case "add":
        return (
          <div className="modal-overlay-fixed">
            <div className="modal-content-fixed">
              <RecetaForm
                onSave={handleSaveProducto}
                onCancel={handleCancel}
                initialData={null}
                isEditing={false}
                mockInsumosDisponibles={mockInsumosDisponibles}
                unidadesDeMedida={unidadesDeMedida}
                categoriasProductos={categorias}
              />
            </div>
          </div>
        );

      case "edit":
        return (
          <div className="modal-overlay-fixed">
            <div className="modal-content-fixed">
              <RecetaForm
                onSave={handleSaveProducto}
                onCancel={handleCancel}
                initialData={crearInitialDataParaRecetaForm(productoSeleccionado)}
                isEditing={true}
                mockInsumosDisponibles={mockInsumosDisponibles}
                unidadesDeMedida={unidadesDeMedida}
                categoriasProductos={categorias}
              />
            </div>
          </div>
        );

      case "visualize":
        return (
          <VisualizarProductoModal
            visible={true}
            onClose={handleCancel}
            producto={productoSeleccionado}
            onToggleDetalle={toggleDetalleReceta}
            detalleVisible={recetaDetalleVisible}
            unidadesDeMedida={unidadesDeMedida}
          />
        );

      case "delete":
        return (
          <Modal visible={true} onClose={handleCancel}>
            <h2>Confirmar Eliminación</h2>
            <p>
              ¿Estás seguro de eliminar el producto{" "}
              <strong>{productoSeleccionado?.nombre}</strong>?
            </p>
            <div className="modal-footer">
              <button className="modal-btn cancel-btn" onClick={handleCancel}>
                Cancelar
              </button>
              <button className="modal-btn save-btn" onClick={eliminarProducto}>
                Eliminar
              </button>
            </div>
          </Modal>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-wrapper">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />
      {renderCurrentView()}
    </div>
  );
}