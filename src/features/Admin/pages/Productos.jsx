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
    nombre: "Azúcar Blanca",
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
    categoria: "Lácteos",
    IdUnidadMedida: 2,
    precio: 22.4,
    imagen:
      "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: 6,
    nombre: "Leche Entera",
    categoria: "Lácteos",
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

// Componente modal de visualización con el mismo diseño
const VisualizarProductoModal = ({
  visible,
  onClose,
  producto,
  onToggleDetalle,
  detalleVisible,
  unidadesDeMedida, // Pass units of measure
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
              ×
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
                  Categoría
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
          </div>

          {/* Sección de Recetas */}
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
                        ▼
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
                                padding: "0.75rem",
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
                                        index < receta.insumos.length - 1
                                          ? "1px solid #e9ecef"
                                          : "none",
                                    }}
                                  >
                                    • {insumo.cantidad}{" "}
                                    {getUnidadMedidaNombre(
                                      insumo.IdUnidadMedida
                                    )}{" "}
                                    de {insumo.nombre}
                                  </li>
                                ))
                              ) : (
                                <li
                                  style={{
                                    padding: "0.25rem 0",
                                    color: "#7f8c8d",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  No hay insumos especificados.
                                </li>
                              )}
                            </ul>
                          </div>

                          {/* Pasos */}
                          <div>
                            <h5
                              style={{
                                color: "#34495e",
                                marginBottom: "0.5rem",
                                fontSize: "1rem",
                                fontWeight: "600",
                              }}
                            >
                              Pasos de preparación:
                            </h5>
                            <ol
                              style={{
                                padding: 0,
                                margin: 0,
                                backgroundColor: "#f8f9fa",
                                borderRadius: "6px",
                                padding: "0.75rem",
                                paddingLeft: "1.5rem",
                              }}
                            >
                              {receta.pasos?.length > 0 ? (
                                receta.pasos.map((paso, index) => (
                                  <li
                                    key={index}
                                    style={{
                                      padding: "0.25rem 0",
                                      color: "#2c3e50",
                                      fontSize: "0.9rem",
                                      marginBottom: "0.5rem",
                                    }}
                                  >
                                    {paso}
                                  </li>
                                ))
                              ) : (
                                <li
                                  style={{
                                    padding: "0.25rem 0",
                                    color: "#7f8c8d",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  No hay pasos de preparación especificados.
                                </li>
                              )}
                            </ol>
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
                  padding: "2rem",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  color: "#7f8c8d",
                }}
              >
                No hay recetas asociadas a este producto.
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: "1rem",
              borderTop: "1px solid #e9ecef",
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "500",
                transition: "background-color 0.2s ease",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#5a6268")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#6c757d")}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Productos() {
  // Estados generales
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [notification, setNotification] = useState({
    visible: false,
    mensaje: "",
    tipo: "success",
  });

  // Modal principal producto (agregar, editar, visualizar, eliminar)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Toggle mostrar detalle de pasos e insumos de una receta (in visualization modal)
  const [recetaDetalleVisible, setRecetaDetalleVisible] = useState(null);

  // Mock initial for categorías y productos
  useEffect(() => {
    const mockCategorias = [
      { id: 301, nombre: "Fresas con crema" },
      { id: 302, nombre: "Obleas" },
      { id: 303, nombre: "Cupcakes" },
      { id: 304, nombre: "Postres" },
      { id: 305, nombre: "Pasteles" },
      { id: 306, nombre: "Arroz con leche" },
    ];
    setCategorias(mockCategorias);

    // Initial mock data for products with detailed insumos
    const mockProductos = [
      {
        id: 1,
        nombre: "Torta de Chocolate",
        precio: 25000,
        idCategoriaProducto: 305,
        categoria: "Pasteles",
        estado: true,
        recetas: [
          {
            id: 1,
            nombre: "Receta Base Chocolate",
            pasos: [
              "Derretir chocolate",
              "Mezclar con harina",
              "Hornear 40 min",
            ],
            insumos: [
              { id: 7, nombre: "Chocolate Semiamargo", cantidad: 200, IdUnidadMedida: 1 }, // gramos
              { id: 1, nombre: "Harina de Trigo", cantidad: 300, IdUnidadMedida: 1 }, // gramos
              { id: 4, nombre: "Huevos A", cantidad: 3, IdUnidadMedida: 5 }, // unidades
              { id: 2, nombre: "Azúcar Blanca", cantidad: 150, IdUnidadMedida: 1 }, // gramos
            ],
            imagen:
              "https://images.unsplash.com/photo-1604152135912-04a470154c4b?fit=crop&w=600&q=80",
          },
        ],
        cantidadSanPablo: 10,
        cantidadSanBenito: 5,
      },
      {
        id: 2,
        nombre: "Cupcake de Vainilla",
        precio: 7000,
        idCategoriaProducto: 303,
        categoria: "Cupcakes",
        estado: true,
        recetas: [
          {
            id: 2,
            nombre: "Receta Base Vainilla",
            pasos: ["Batir huevos", "Agregar esencia de vainilla", "Hornear"],
            insumos: [
              { id: 4, nombre: "Huevos A", cantidad: 2, IdUnidadMedida: 5 },
              { id: 2, nombre: "Azúcar Blanca", cantidad: 100, IdUnidadMedida: 1 },
              { id: 1, nombre: "Harina de Trigo", cantidad: 120, IdUnidadMedida: 1 },
              { id: 8, nombre: "Esencia de Vainilla", cantidad: 5, IdUnidadMedida: 4 },
            ],
            imagen:
              "https://images.unsplash.com/photo-1599785209707-28c5f3e43c53?fit=crop&w=600&q=80",
          },
          {
            id: 6,
            nombre: "Receta Cupcake Base",
            pasos: [
              "Mezclar ingredientes secos",
              "Agregar líquidos",
              "Hornear",
            ],
            insumos: [
              { id: 1, nombre: "Harina de Trigo", cantidad: 200, IdUnidadMedida: 1 },
              { id: 2, nombre: "Azúcar Blanca", cantidad: 180, IdUnidadMedida: 1 },
              { id: 4, nombre: "Huevos A", cantidad: 3, IdUnidadMedida: 5 },
              { id: 6, nombre: "Leche Entera", cantidad: 150, IdUnidadMedida: 2 },
              { id: 8, nombre: "Esencia de Vainilla", cantidad: 10, IdUnidadMedida: 4 },
            ],
            imagen:
              "https://images.unsplash.com/photo-1519428870410-42e44efb96b9?fit=crop&w=600&q=80",
          },
        ],
        cantidadSanPablo: 20,
        cantidadSanBenito: 15,
      },
      {
        id: 3,
        nombre: "Fresas con Leche Condensada",
        precio: 9000,
        idCategoriaProducto: 301,
        categoria: "Fresas con crema",
        estado: true,
        recetas: [
          {
            id: 3,
            nombre: "Receta Fresas con Crema",
            pasos: ["Lavar fresas", "Batir crema", "Servir en copa"],
            insumos: [
              { id: 11, nombre: "Fresas", cantidad: 250, IdUnidadMedida: 1 }, // Assuming 'gramos' for berries
              { id: 12, nombre: "Crema de leche", cantidad: 100, IdUnidadMedida: 2 }, // Assuming 'ml' for cream
              { id: 2, nombre: "Azúcar Blanca", cantidad: 50, IdUnidadMedida: 1 },
            ],
            imagen:
              "https://images.unsplash.com/photo-1605478522030-1c56a4d3896d?fit=crop&w=600&q=80",
          },
        ],
        cantidadSanPablo: 8,
        cantidadSanBenito: 12,
      },
      {
        id: 4,
        nombre: "Arroz con Leche Tradicional",
        precio: 8500,
        idCategoriaProducto: 306,
        categoria: "Arroz con leche",
        estado: false,
        recetas: [
          {
            id: 4,
            nombre: "Receta Arroz con Leche",
            pasos: [
              "Hervir arroz",
              "Agregar leche y azúcar",
              "Cocinar a fuego lento",
            ],
            insumos: [
              { id: 13, nombre: "Arroz", cantidad: 200, IdUnidadMedida: 1 },
              { id: 6, nombre: "Leche Entera", cantidad: 500, IdUnidadMedida: 2 },
              { id: 14, nombre: "Canela", cantidad: 5, IdUnidadMedida: 1 },
              { id: 2, nombre: "Azúcar Blanca", cantidad: 150, IdUnidadMedida: 1 },
            ],
            imagen:
              "https://images.unsplash.com/photo-1612361362044-d45e5de58c00?fit=crop&w=600&q=80",
          },
        ],
        cantidadSanPablo: 5,
        cantidadSanBenito: 3,
      },
      {
        id: 5,
        nombre: "Oblea con Arequipe y Queso",
        precio: 6000,
        idCategoriaProducto: 302,
        categoria: "Obleas",
        estado: true,
        recetas: [
          {
            id: 5,
            nombre: "Receta Obleas Clásicas",
            pasos: [
              "Colocar oblea",
              "Agregar arequipe y queso",
              "Tapar con otra oblea",
            ],
            insumos: [
              { id: 15, nombre: "Obleas", cantidad: 2, IdUnidadMedida: 5 },
              { id: 16, nombre: "Arequipe", cantidad: 50, IdUnidadMedida: 1 },
              { id: 17, nombre: "Queso rallado", cantidad: 30, IdUnidadMedida: 1 },
            ],
            imagen:
              "https://images.unsplash.com/photo-1653160056143-b232b93450e1?fit=crop&w=600&q=80",
          },
        ],
        cantidadSanPablo: 15,
        cantidadSanBenito: 10,
      },
    ];
    setProductos(mockProductos);
  }, []);

  // Función para convertir insumos de string (old mock) a objetos con estructura esperada por RecetaForm y Visualization
  // This function now handles both string-based and object-based insumos in the initial mock data
  const convertirInsumosParaRecetaForm = (recetas) => {
    if (!recetas || recetas.length === 0) return [];

    const insumosConvertidos = [];

    recetas.forEach((receta) => {
      if (receta.insumos && Array.isArray(receta.insumos)) {
        receta.insumos.forEach((insumoItem) => {
          // If insumoItem is already an object with id, name, quantity, IdUnidadMedida
          if (typeof insumoItem === "object" && insumoItem.nombre) {
            // Check if already added to avoid duplicates if multiple recipes use same insumo
            if (!insumosConvertidos.some(i => i.nombre === insumoItem.nombre)) {
              insumosConvertidos.push(insumoItem);
            }
          } else if (typeof insumoItem === "string") {
            // Handle old string format if it still exists in some data
            const insumoEncontrado = mockInsumosDisponibles.find(
              (mock) =>
                mock.nombre
                  .toLowerCase()
                  .includes(insumoItem.toLowerCase()) ||
                insumoItem.toLowerCase().includes(mock.nombre.toLowerCase())
            );

            // Only add if not already present by name
            if (!insumosConvertidos.some(i => i.nombre === insumoItem)) {
              insumosConvertidos.push({
                id: insumoEncontrado?.id || Date.now() + Math.random(),
                nombre: insumoItem,
                cantidad: 1, // Default quantity for conversion from string
                IdUnidadMedida: insumoEncontrado?.IdUnidadMedida || 1, // Default unit
                precio: insumoEncontrado?.precio || 0,
                imagen: insumoEncontrado?.imagen || "",
              });
            }
          }
        });
      }
    });

    return insumosConvertidos;
  };


  // Función para crear initialData correcto para RecetaForm
  const crearInitialDataParaRecetaForm = (producto) => {
    if (!producto) return null;

    // Ensure recipes are always an array
    const productRecetas = producto.recetas || [];

    // Transform insumos for RecetaForm to have quantity and unit details
    const insumosForForm = productRecetas.flatMap(receta =>
        receta.insumos.map(insumo => ({
            id: insumo.id, // Keep existing ID if available
            nombre: insumo.nombre,
            cantidad: insumo.cantidad || 1, // Default to 1 if not specified
            IdUnidadMedida: insumo.IdUnidadMedida || 1, // Default unit if not specified
            // Include other properties like precio, imagen if needed by RecetaForm
        }))
    ).filter((value, index, self) => // Remove duplicates by name
        index === self.findIndex((t) => (
            t.nombre === value.nombre
        ))
    );


    return {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      categoria: producto.idCategoriaProducto,
      insumos: insumosForForm, // Now contains quantity and unit for form
      cantidadSanPablo: producto.cantidadSanPablo || 0,
      cantidadSanBenito: producto.cantidadSanBenito || 0,
      recetas: productRecetas, // Pass original recipes to RecetaForm if it needs to display/edit them
    };
  };

  // Notificaciones
  const showNotification = (mensaje, tipo = "success") => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: "", tipo: "success" });
  };

  // Abrir modal
  const abrirModal = (tipo, producto = null) => {
    setModalTipo(tipo);
    setProductoSeleccionado(producto);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setProductoSeleccionado(null);
    setModalTipo(null);
    setRecetaDetalleVisible(null); // Reset detalle visible
  };

  const toggleDetalleReceta = (id) => {
    setRecetaDetalleVisible(recetaDetalleVisible === id ? null : id);
  };

  // Cambiar estado producto
  const toggleEstado = (producto) => {
    const nuevosProductos = productos.map((p) =>
      p.id === producto.id ? { ...p, estado: !p.estado } : p
    );
    setProductos(nuevosProductos);
    showNotification(
      `Producto ${producto.estado ? "desactivado" : "activado"} correctamente.`
    );
  };

  // Handle Save from RecetaForm - CORREGIDO
  const handleRecetaFormSave = (data) => {
    const catObj = categorias.find(
      (c) => c.id.toString() === data.categoria.toString()
    );

    if (!catObj) {
      showNotification("Categoría seleccionada no válida.", "error");
      return;
    }

    // Ensure insumos from the form have the correct structure (id, nombre, cantidad, IdUnidadMedida)
    const insumosForReceta = data.insumos
      ? data.insumos.map((insumo) => ({
          id: insumo.id,
          nombre: insumo.nombre,
          cantidad: insumo.cantidad || 1, // Default quantity if not set by form
          IdUnidadMedida: insumo.IdUnidadMedida || 1, // Default unit if not set by form
        }))
      : [];

    // Reconstruct recipes, ensuring insumos are structured as objects
    const recetasGeneradas =
      data.recetas && data.recetas.length > 0
        ? data.recetas.map(receta => ({
            ...receta,
            insumos: receta.insumos ? receta.insumos.map(insumo => ({
                id: insumo.id || Date.now() + Math.random(), // Ensure ID for new insumos
                nombre: insumo.nombre,
                cantidad: insumo.cantidad || 1,
                IdUnidadMedida: insumo.IdUnidadMedida || 1,
            })) : [],
          }))
        : [
            {
              id: Date.now(),
              nombre: `Receta de ${data.nombre}`, // Provide a default recipe name
              pasos: ["Preparar ingredientes", "Mezclar", "Cocinar"], // Default steps
              insumos: insumosForReceta, // Use the structured insumos
              imagen: data.imagen || "",
            },
          ];

    if (modalTipo === "agregar") {
      const nuevoId = productos.length
        ? Math.max(...productos.map((p) => p.id)) + 1
        : 1;

      const nuevoProd = {
        id: nuevoId,
        nombre: data.nombre,
        precio: parseInt(data.precio) || 0,
        idCategoriaProducto: parseInt(data.categoria),
        categoria: catObj.nombre,
        estado: true,
        recetas: recetasGeneradas,
        cantidadSanPablo: parseInt(data.cantidadSanPablo) || 0,
        cantidadSanBenito: parseInt(data.cantidadSanBenito) || 0,
      };

      setProductos([...productos, nuevoProd]);
      showNotification("Producto agregado con éxito");
    } else if (modalTipo === "editar") {
      const prodEditados = productos.map((p) =>
        p.id === productoSeleccionado.id
          ? {
              ...p,
              nombre: data.nombre,
              precio: parseInt(data.precio) || 0,
              idCategoriaProducto: parseInt(data.categoria),
              categoria: catObj.nombre,
              recetas: recetasGeneradas,
              cantidadSanPablo: parseInt(data.cantidadSanPablo) || 0,
              cantidadSanBenito: parseInt(data.cantidadSanBenito) || 0,
            }
          : p
      );
      setProductos(prodEditados);
      showNotification("Producto editado con éxito");
    }

    cerrarModal();
  };

  // Eliminar producto
  const eliminarProducto = () => {
    const prodFiltrados = productos.filter(
      (p) => p.id !== productoSeleccionado.id
    );
    setProductos(prodFiltrados);
    cerrarModal();
    showNotification("Producto eliminado");
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      p.categoria.toLowerCase().includes(filtro.toLowerCase())
  );

  // Formato precio
  const formatearPrecio = (precio) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);

  return (
    <>
      <div className="admin-wrapper">
        <Notification
          visible={notification.visible}
          mensaje={notification.mensaje}
          tipo={notification.tipo}
          onClose={hideNotification}
        />

        <div className="admin-toolbar">
          <button
            className="admin-button pink"
            onClick={() => abrirModal("agregar")}
          >
            + Agregar
          </button>
          <SearchBar
            placeholder="Buscar productos..."
            value={filtro}
            onChange={setFiltro}
          />
        </div>

        <h2 className="admin-section-title">Gestión de productos</h2>

        <DataTable
          value={productosFiltrados}
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
                  onClick={() => abrirModal("visualizar", row)}
                  aria-label="Ver producto"
                  title="Ver producto"
                >
                  🔍
                </button>
                <button
                  className="admin-button yellow"
                  onClick={() => abrirModal("editar", row)}
                  aria-label="Editar producto"
                  title="Editar producto"
                >
                  ✏️
                </button>
                <button
                  className="admin-button red"
                  onClick={() => abrirModal("eliminar", row)}
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

        {/* Modal eliminar */}
        {modalTipo === "eliminar" && modalVisible && (
          <Modal visible={modalVisible} onClose={cerrarModal}>
            <h2>Confirmar Eliminación</h2>
            <p>
              ¿Estás seguro de eliminar el producto{" "}
              <strong>{productoSeleccionado?.nombre}</strong>?
            </p>
            <div className="modal-footer">
              <button className="modal-btn cancel-btn" onClick={cerrarModal}>
                Cancelar
              </button>
              <button className="modal-btn save-btn" onClick={eliminarProducto}>
                Eliminar
              </button>
            </div>
          </Modal>
        )}

        {/* Modal visualizar - NUEVO COMPONENTE */}
        <VisualizarProductoModal
          visible={modalTipo === "visualizar" && modalVisible}
          onClose={cerrarModal}
          producto={productoSeleccionado}
          onToggleDetalle={toggleDetalleReceta}
          detalleVisible={recetaDetalleVisible}
          unidadesDeMedida={unidadesDeMedida}
        />
      </div>

      {/* RecetaForm Modal - RENDERIZADO POR SEPARADO COMO PORTAL */}
      {(modalTipo === "agregar" || modalTipo === "editar") && modalVisible && (
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
              borderRadius: "8px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
            }}
          >
            <RecetaForm
              visible={modalVisible}
              onClose={cerrarModal}
              initialData={crearInitialDataParaRecetaForm(productoSeleccionado)}
              onSave={handleRecetaFormSave}
              onCancel={cerrarModal}
              isEditing={modalTipo === "editar"}
              mockInsumosDisponibles={mockInsumosDisponibles} // Pass if RecetaForm needs it for dropdowns
              unidadesDeMedida={unidadesDeMedida} // Pass to RecetaForm for dropdowns
            />
          </div>
        </div>
      )}
    </>
  );
}