import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import Modal from "../components/modal";
import SearchBar from "../components/SearchBar";
import Notification from "../components/Notification";
import RecetaForm from "./Recetas/components/Agregarproduc";
import "../adminStyles.css";
import productosApiService from "../services/productos_services";

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
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [previewImagen, setPreviewImagen] = useState(null);

  // Función corregida para obtener nombre de categoría por ID
  const getNombreCategoriaById = (idCategoria) => {
    if (!idCategoria && idCategoria !== 0) {
      return "Sin categoría";
    }

    const id = Number(idCategoria);
    const categoria = categorias.find((cat) => cat.id === id);
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
    const cargarProductos = async () => {
      try {
        const data = await productosApiService.obtenerProductos();
        setProductos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando productos:", error);
        setProductos([]);
      }
    };
    cargarProductos();
  }, []);

  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const response = await fetch(
          "https://deliciasoft-backend.onrender.com/api/categorias-productos"
        );
        if (!response.ok) {
          throw new Error("No se pudo obtener las categorías");
        }
        const data = await response.json();
        setCategorias(data);
      } catch (error) {
        console.error("Error al cargar las categorías:", error);
      } finally {
        setLoadingCategorias(false);
      }
    };

    cargarCategorias();
  }, []);

  const handleImagenChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo no puede superar los 5MB");
      return;
    }
    setArchivoImagen(file);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImagen(e.target.result);
    reader.readAsDataURL(file);
  }
};

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

  const handleSaveProducto = async (productoData) => {
    try {
      console.log("🔍 Datos recibidos en handleSave:", productoData);

      const payload = {
        nombreproducto:
          productoData.nombreproducto || productoData.nombre || "",
        precioproducto: String(
          productoData.precioproducto || productoData.precio || "0"
        ),
        cantidadproducto: String(
          productoData.cantidadproducto || productoData.cantidad || "0"
        ),
        estado: productoData.estado ?? true,
        idcategoriaproducto:
          parseInt(productoData.idcategoriaproducto) || null,
      };

      if (productoData.idproductogeneral) {
        payload.idproductogeneral = productoData.idproductogeneral;
      }

      if (productoData.especificaciones?.trim()) {
        payload.especificaciones = productoData.especificaciones.trim();
      }

      if (payload.idproductogeneral) {
        if (productoData.idimagen && productoData.idimagen > 0) {
          payload.idimagen = parseInt(productoData.idimagen);
        }
        if (productoData.idreceta && productoData.idreceta > 0) {
          payload.idreceta = parseInt(productoData.idreceta);
        }
      }

      console.log("📤 Payload final:", payload);

      if (!payload.nombreproducto?.trim()) {
        throw new Error("El nombre del producto es requerido");
      }

      if (!payload.idcategoriaproducto || isNaN(payload.idcategoriaproducto)) {
        throw new Error("Debe seleccionar una categoría válida");
      }

      const precio = parseFloat(payload.precioproducto);
      if (isNaN(precio) || precio < 0) {
        throw new Error("El precio debe ser un número válido mayor o igual a 0");
      }

      if (payload.idproductogeneral) {
        await productosApiService.actualizarProducto(
          payload.idproductogeneral,
          payload
        );
        showNotification("Producto actualizado exitosamente");
      } else {
        await productosApiService.crearProducto(payload);
        showNotification(
          `Producto "${payload.nombreproducto}" agregado exitosamente`
        );
      }

      handleCancel();

      const data = await productosApiService.obtenerProductos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error guardando producto:", error);

      let mensajeError = "Error al guardar producto";

      if (error.message.includes("idcategoriaproducto")) {
        mensajeError = "Error: La categoría seleccionada no es válida";
      } else if (error.message.includes("nombreproducto")) {
        mensajeError = "Error: El nombre del producto es inválido o ya existe";
      } else if (error.message.includes("precioproducto")) {
        mensajeError = "Error: El precio debe ser un número válido";
      } else {
        mensajeError = error.message || mensajeError;
      }

      showNotification(mensajeError, "error");
    }
  };

  const fetchProductos = async () => {
    try {
      setLoading(true);
      setError("");

      const productosData = await productoApiService.obtenerProductos();

      const productosMapeados = productosData.map((p) => ({
        id: p.idproductogeneral,
        nombre: p.nombreproducto,
        precio: parseFloat(p.precioproducto) || 0,
        cantidad: parseInt(p.cantidadproducto) || 0,
        categoria: p.categoria || "Sin categoría",
        imagen: p.imagenes?.urlimg || null, 
        estado: p.estado,
        idcategoriaproducto: p.idcategoriaproducto,
        idimagen: p.idimagen,
        idreceta: p.idreceta,
      }));

      const productosActivos = productosMapeados.filter(
        (prod) => prod.estado === true
      );
      setProductos(productosActivos);

      const categoriasUnicas = [
        ...new Set(productosActivos.map((p) => p.categoria)),
      ];
      setCategorias(["Todos", ...categoriasUnicas]);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setError("Error al cargar productos.");
    } finally {
      setLoading(false);
    }
  };

  const eliminarProducto = async () => {
    try {
      await productosApiService.eliminarProducto(productoSeleccionado.id);
      showNotification("Producto eliminado exitosamente");
      handleCancel();
      const data = await productosApiService.obtenerProductos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error eliminando producto:", error);
      showNotification("Error al eliminar producto", "error");
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "list":
        return (
          <div className="admin-wrapper">
            <div className="admin-toolbar">
              <button className="admin-button pink" onClick={handleAgregarProducto}>
                + Agregar
              </button>
              <SearchBar placeholder="Buscar productos..." value={filtro} onChange={handleSearch}/>
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
                style={{ width: "3rem" }}
              />
              <Column
                header="Imagen"
                body={(row) =>
                  row.imagen ? (
                    <img
                      src={row.imagen}
                      alt={row.nombre}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: "12px", color: "#888" }}>
                      Sin imagen
                    </span>
                  )
                }
                style={{ width: "100px", textAlign: "center" }}
              />
              <Column
                field="nombre"
                header="Nombre"
                style={{ width: "200px" }}
              />
              <Column
                field="precio"
                header="Precio"
                body={(row) => formatearPrecio(row.precio)}
                style={{ width: "150px" }}
              />
              <Column
                field="categoria"
                header="Categoría"
                style={{ width: "150px" }}
              />
              <Column
                header="Estado"
                body={(row) => (
                  <InputSwitch
                    checked={row.estado}
                    onChange={() => toggleEstado(row)}
                  />
                )}
                style={{ width: "80px", textAlign: "center" }}
              />
              <Column
                header="Acción"
                body={(row) => (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="admin-button gray"
                      onClick={() => visualizarProducto(row)}
                    >
                      🔍
                    </button>
                    <button
                      className="admin-button yellow"
                      onClick={() => editarProducto(row)}
                    >
                      ✏️
                    </button>
                    <button
                      className="admin-button red"
                      onClick={() => confirmarEliminarProducto(row)}
                    >
                      🗑️
                    </button>
                  </div>
                )}
              />
            </DataTable>
          </div>
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
                initialData={productoSeleccionado}
                isEditing={true}
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
