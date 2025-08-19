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
    categoria: "LÃƒÂ¡cteos",
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

// Mock data for categorÃ­as de productos - ACTUALIZADO con las categorÃ­as del primer cÃ³digo
const categorias = [
  { id: 301, nombre: "Fresas con crema" },
  { id: 302, nombre: "Obleas" },
  { id: 303, nombre: "Cupcakes" },
  { id: 304, nombre: "Postres" },
  { id: 305, nombre: "Pasteles" },
  { id: 306, nombre: "Arroz con leche" },
];

// Componente modal de visualizaciÃ³n con el mismo diseÃ±o
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
                fontSize: "1.5rem",
                fontWeight: "600",
              }}
            >
              Detalles del Producto
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "#7f8c8d",
                padding: "0.5rem",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              x
            </button>
          </div>

          {/* InformaciÃ³n bÃ¡sica del producto */}
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
                  Nombre del Producto
                </label>
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    color: "#2c3e50",
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
                  Precio
                </label>
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    color: "#000",
                    fontWeight: "600",
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
                  Categoria
                </label>
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    color: "#2c3e50",
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
                  Estado
                </label>
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    color: producto.estado ? "#27ae60" : "#e74c3c",
                    fontWeight: "600",
                  }}
                >
                  {producto.estado ? "Activo" : "Inactivo"}
                </div>
              </div>
            </div>

            {/* Inventario */}
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
                  Cantidad en San Pablo
                </label>
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    color: "#2c3e50",
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
                  Cantidad en San Benito
                </label>
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    color: "#2c3e50",
                  }}
                >
                  {producto.cantidadSanBenito || 0} unidades
                </div>
              </div>
            </div>

            {/* SecciÃ³n de Recetas */}
            <div style={{ marginBottom: "2rem" }}>
              <h3
                style={{
                  color: "#000",
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  textAlign: "center",
                  borderBottom: "2px solid #000",
                  paddingBottom: "0.5rem",
                }}
              >
                Recetas Asociadas
              </h3>
              {producto.recetas?.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {producto.recetas.map((receta) => (
                    <div
                      key={receta.id}
                      style={{
                        border: "1px solid #e9ecef",
                        borderRadius: "8px",
                        overflow: "hidden",
                        backgroundColor: "#ffffff",
                      }}
                    >
                      {/* Header de la receta */}
                      <div
                        onClick={() => onToggleDetalle(receta.id)}
                        style={{
                          padding: "1rem",
                          backgroundColor: "#f8f9fa",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderBottom: "1px solid #e9ecef",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                          }}
                        >
                          {receta.imagen && (
                            <img
                              src={receta.imagen}
                              alt={receta.nombre}
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                            />
                          )}
                          <h4
                            style={{
                              margin: 0,
                              color: "#2c3e50",
                              fontSize: "1.1rem",
                              fontWeight: "600",
                            }}
                          >
                            {receta.nombre}
                          </h4>
                        </div>
                        <span
                          style={{
                            color: "#7f8c8d",
                            fontSize: "1.2rem",
                            transform:
                              detalleVisible === receta.id
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                          }}
                        >
                          ↓
                        </span>
                      </div>
                      {/* Detalles de la receta (colapsable) */}
                      {detalleVisible === receta.id && (
                        <div style={{ padding: "1.5rem" }}>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "1.5rem",
                            }}
                          >
                            {/* Insumos */}
                            <div>
                              <h5
                                style={{
                                  color: "#34495e",
                                  marginBottom: "0.5rem",
                                  fontSize: "1rem",
                                  fontWeight: "600",
                                }}
                              >
                                Insumos necesarios:
                              </h5>
                              <ul
                                style={{
                                  listStyle: "none",
                                  padding: 0,
                                  margin: 0,
                                  backgroundColor: "#f8f9fa",
                                  borderRadius: "6px",
                                }}
                              >
                                {receta.insumos?.length > 0 ? (
                                  receta.insumos.map((insumo, index) => (
                                    <li
                                      key={index}
                                      style={{
                                        padding: "0.25rem 0",
                                        color: "#2c3e50",
                                        fontSize: "0.9rem",
                                        borderBottom:
                                          index === receta.insumos.length - 1
                                            ? "none"
                                            : "1px solid #e9ecef",
                                      }}
                                    >
                                      {insumo.nombre} (
                                      {insumo.cantidad}{" "}
                                      {getUnidadMedidaNombre(
                                        insumo.IdUnidadMedida
                                      )}
                                      )
                                    </li>
                                  ))
                                ) : (
                                  <li style={{ color: "#7f8c8d" }}>
                                    No hay insumos asociados.
                                  </li>
                                )}
                              </ul>
                            </div>
                            {/* Recetas */}
                            <div>
                              <h5
                                style={{
                                  color: "#34495e",
                                  marginBottom: "0.5rem",
                                  fontSize: "1rem",
                                  fontWeight: "600",
                                }}
                              >
                                Recetas necesarias:
                              </h5>
                              <ul
                                style={{
                                  listStyle: "none",
                                  padding: 0,
                                  margin: 0,
                                  backgroundColor: "#f8f9fa",
                                  borderRadius: "6px",
                                }}
                              >
                                {receta.recetasAnidadas?.length > 0 ? (
                                  receta.recetasAnidadas.map((receta, index) => (
                                    <li
                                      key={index}
                                      style={{
                                        padding: "0.25rem 0",
                                        color: "#2c3e50",
                                        fontSize: "0.9rem",
                                        borderBottom:
                                          index ===
                                            receta.recetasAnidadas.length - 1
                                            ? "none"
                                            : "1px solid #e9ecef",
                                      }}
                                    >
                                      {receta.nombre} (
                                      {receta.cantidad}
                                      )
                                    </li>
                                  ))
                                ) : (
                                  <li style={{ color: "#7f8c8d" }}>
                                    No hay recetas asociadas.
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", color: "#7f8c8d" }}>
                  Este producto no tiene recetas asociadas.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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
    // Si no hay idCategoria, retornar valor por defecto
    if (!idCategoria && idCategoria !== 0) {
      return "Sin categoría";
    }
    
    // Convertir a número para asegurar comparación correcta
    const id = Number(idCategoria);
    
    // Buscar la categoría por ID
    const categoria = categorias.find(cat => cat.id === id);
    
    // Retornar el nombre si se encuentra, sino el valor por defecto
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
    // Mock productos actualizados con las nuevas categorÃ­as
    const mockProductos = [
      {
        id: 1,
        nombre: "Pan de Leche",
        precio: 5000,
        categoria: "Pasteles", // Cambiado para usar las nuevas categorÃ­as
        cantidadSanPablo: 20,
        cantidadSanBenito: 15,
        estado: true,
        tieneRelaciones: true,
        recetas: [
          {
            id: 1,
            nombre: "Pan Integral Casero",
            insumos: [
              { id: 1, nombre: "Harina de Trigo", cantidad: 500, IdUnidadMedida: 1 },
              { id: 2, nombre: "Azucar Blanca", cantidad: 50, IdUnidadMedida: 1 },
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
            insumos: [
              { id: 7, nombre: "Chocolate Semiamargo", cantidad: 200, IdUnidadMedida: 2 },
              { id: 8, nombre: "Esencia de Vainilla", cantidad: 5, IdUnidadMedida: 4 },
            ],
            recetasAnidadas: [],
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
            nombre: "Crema de Vainilla",
            insumos: [
              { id: 6, nombre: "Leche Entera", cantidad: 100, IdUnidadMedida: 3 },
              { id: 8, nombre: "Esencia de Vainilla", cantidad: 2, IdUnidadMedida: 4 },
            ],
            recetasAnidadas: [],
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
    console.log("Datos recibidos del formulario:", productoData); // Debug

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
      
      // Obtener nombre de categoría usando la función corregida
      const nombreCategoria = getNombreCategoriaById(productoData.IdCategoria);
      
      console.log("ID Categoría recibido:", productoData.IdCategoria); // Debug
      console.log("Nombre categoría convertido:", nombreCategoria); // Debug
      
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
        // Crear estructura de recetas si hay insumos o recetas anidadas
        recetas: (productoData.insumos?.length > 0 || productoData.recetasAnidadas?.length > 0) ? [{
          id: newId,
          nombre: productoData.NombreReceta || "Producto sin nombre",
          insumos: productoData.insumos || [],
          recetasAnidadas: productoData.recetasAnidadas || []
        }] : []
      };
      
      console.log("Nuevo producto creado:", newProducto); // Debug
      
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

    // Buscar ID de categoría por nombre
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
            {/* Nuevo diseño de header y tabla */}
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