import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./cartas.css";

import Header from "./Header";
import Buscador from "./Buscador";
import Cupon from "./Cupon";
import Modal from "./Modal";

// Componente de productos destacados con botón “Ver Categoría”
function ProductosDestacados({ productos, onProductoClick }) {
  return (
    <div className="productos-destacados-container-exacto">
      <div className="productos-grid-exacto">
        {productos.map((producto) => (
          <div key={producto.id} className="product-card-exacto">
            <div className="card-image-section-exacto">
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="card-image-exacto"
              />
            </div>
            <div className="card-content-section-exacto">
              <h3 className="card-title-exacto">{producto.nombre}</h3>
              <button
                className="view-products-btn-exacto"
                onClick={() => onProductoClick(producto)}
              >
                <span className="btn-icon-exacto">📂</span> Ver Categoría
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Cartas() {
  const [code, setCode] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const imagenPorDefecto = "/imagenes/Cartas/default.jpeg";

  const datosDeEjemplo = [
    {
      id: 1,
      nombre: "Postres Variados",
      descripcion: "Deliciosos postres caseros para toda ocasión",
      imagen: "/imagenes/Cartas/postres.jpg",
    },
    {
      id: 2,
      nombre: "Pasteles Artesanales",
      descripcion: "Pasteles frescos hechos con amor",
      imagen: "/imagenes/Cartas/pasteles.jpg",
    },
    {
      id: 3,
      nombre: "Fresas con Crema",
      descripcion: "Fresas frescas con crema deliciosa",
      imagen: "/imagenes/Cartas/fresas.jpg",
    },
    {
      id: 4,
      nombre: "Obleas Tradicionales",
      descripcion: "Obleas caseras con los mejores ingredientes",
      imagen: "/imagenes/Cartas/obleas.jpg",
    },
  ];

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      setError(null);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error("Timeout: La petición tardó más de 10 segundos")
            ),
          10000
        );
      });

      const fetchPromise = fetch(
        "https://deliciasoft-backend.onrender.com/api/categorias-productos"
      );
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      const categoriasActivas = data
        .filter((categoria) => categoria.estado)
        .map((categoria) => {
          const imagenUrl =
            categoria.imagenes && categoria.imagenes.urlimg
              ? categoria.imagenes.urlimg
              : imagenPorDefecto;

          return {
            id: categoria.idcategoriaproducto,
            nombre: categoria.nombrecategoria,
            descripcion: categoria.descripcion,
            imagen: imagenUrl,
          };
        });

      setCategorias(categoriasActivas);
      setError(null);
    } catch (err) {
      setCategorias(datosDeEjemplo);
      setError(`Error de conexión: ${err.message}. Mostrando datos de ejemplo.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleImageClick = () => {
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    setCode(newCode);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const productosFiltrados = categorias.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductoClick = (producto) => {
    const nombre = producto.nombre.toLowerCase();

    if (nombre.includes("fresa")) {
      navigate("/detalle-fresas");
    } else if (nombre.includes("oblea")) {
      navigate("/detalle-obleas");
    } else if (nombre.includes("mini dona")) {
      navigate("/detalle-mini-donas");
    } else if (nombre.includes("cupcake")) {
      navigate("/detalle-cupcake");
    } else if (nombre.includes("arroz")) {
      navigate("/detalle-arroz");
    } else if (nombre.includes("postres")) {
      navigate("/detalle-postres");
    } else if (nombre.includes("sandwich") || nombre.includes("sanduches")) { // Corregido
      navigate("/detalle-sandwiches");
    } else if (nombre.includes("chocolates")) {
      navigate("/detalle-chocolates");
     } else if (nombre.includes("torta") || nombre.includes("tortas")) { // Corregido
      navigate("/detalle-tortas");
    } else if (nombre.includes("bebida") || nombre.includes("bebidas")) { // Corregido
      navigate("/detalle-bebidas");
    } else {
      console.log("⚠️ No se encontró ruta específica para:", nombre);
    }
  };

  if (loading) {
    return (
      <div className="carta-container">
        <Header />
        <div
          className="loading-container"
          style={{
            textAlign: "center",
            padding: "50px",
            backgroundColor: "#fff",
            margin: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "20px" }}>🍰</div>
          <p style={{ fontSize: "1.2rem", marginBottom: "10px" }}>
            Cargando productos deliciosos...
          </p>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "5px solid #ff0080",
              borderTop: "5px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          ></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="carta-container">
      <Header />
      <Buscador value={searchTerm} onChange={setSearchTerm} />

      {error && (
        <div
          className="error-message"
          style={{
            color: "#ff6b6b",
            textAlign: "center",
            padding: "15px",
            backgroundColor: "#fff3cd",
            margin: "10px 0",
            borderRadius: "10px",
            border: "1px solid #ffeaa7",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <h1 className="destacados-titulo">Categoría de Productos</h1>

      <ProductosDestacados
        productos={productosFiltrados}
        onProductoClick={handleProductoClick}
      />
      <Cupon onClick={handleImageClick} />
      {modalVisible && <Modal code={code} onClose={closeModal} />}
    </div>
  );
}

export default Cartas;
