import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./cartas.css";

import Header from "./Header";
import Buscador from "./Buscador";
import ProductosDestacados from "./ProductosDestacados";
import Cupon from "./Cupon";
import Modal from "./Modal";

function Cartas() {
  const [code, setCode] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Mapeo de categorías a imágenes (mantén tus imágenes actuales)
  const imagenesCategoria = {
    "fresas con crema": "/imagenes/Cartas/fresacrema.jpeg",
    "obleas": "/imagenes/Cartas/obleass.jpeg",
    "mini donas": "/imagenes/Cartas/miniDona.jpeg",
    "cupcakes": "/imagenes/Cartas/cup.jpeg",
    "arroz con leche": "/imagenes/Cartas/arrozConLeche.jpg",
    "sandwches": "/imagenes/Cartas/sandwches.jpeg",
    "postres": "/imagenes/Cartas/postres.jpeg",
    "chocolates": "/imagenes/Cartas/chocolates.jpeg",
    "bebida": "/imagenes/Cartas/bebida.jpeg" // Agrega imagen para bebidas si tienes
  };

  // Mapeo de precios por categoría (mantén tus precios actuales)
  const preciosCategoria = {
    "fresas con crema": "$7,000",
    "obleas": "$3,000",
    "mini donas": "$6,000",
    "cupcakes": "$3,000",
    "arroz con leche": "$10,000",
    "sandwches": "$16,500",
    "postres": "$8,000",
    "chocolates": "$1,500",
    "bebida": "$2,500" // Precio para bebidas
  };

  // Función para obtener las categorías desde la API
  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://deliciasoft-backend.onrender.com/api/categoria-productos");
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Filtrar solo categorías activas y transformar para el componente
      const categoriasActivas = data
        .filter(categoria => categoria.estado)
        .map(categoria => ({
          id: categoria.idcategoriaproducto,
          nombre: categoria.nombrecategoria,
          descripcion: categoria.descripcion,
          precio: preciosCategoria[categoria.nombrecategoria.toLowerCase()] || "$0",
          imagen: imagenesCategoria[categoria.nombrecategoria.toLowerCase()] || "/imagenes/Cartas/default.jpeg"
        }));

      setCategorias(categoriasActivas);
      setError(null);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      setError("Error al cargar los productos. Mostrando productos por defecto.");
      
      // Fallback a datos estáticos en caso de error
      setCategorias([
        { id: 2, nombre: "FRESAS CON CREMA", precio: "$7,000", imagen: "/imagenes/Cartas/fresacrema.jpeg" },
        { id: 3, nombre: "OBLEA", precio: "$3,000", imagen: "/imagenes/Cartas/obleass.jpeg" },
        { id: 4, nombre: "Mini Donas", precio: "$6,000", imagen: "/imagenes/Cartas/miniDona.jpeg" },
        { id: 5, nombre: "Cupcakes", precio: "$3,000", imagen: "/imagenes/Cartas/cup.jpeg" },
        { id: 6, nombre: "Arroz con Leche", precio: "$10,000", imagen: "/imagenes/Cartas/arrozConLeche.jpg" },
        { id: 7, nombre: "Sandwiches", precio: "$16,500", imagen: "/imagenes/Cartas/sandwches.jpeg" },
        { id: 8, nombre: "Postres", precio: "$8,000", imagen: "/imagenes/Cartas/postres.jpeg" },
        { id: 9, nombre: "chocolates", precio: "$1,500", imagen: "/imagenes/Cartas/chocolates.jpeg" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías al montar el componente
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
    } else if (nombre.includes("sandwich")) {
      navigate("/detalle-sandwiches");
    } else if (nombre.includes("chocolate")) {
      navigate("/detalle-chocolates");
    } else if (nombre.includes("bebida")) {
      navigate("/detalle-bebidas");
    }
  };

  // Mostrar loading mientras carga
  if (loading) {
    return (
      <div className="carta-container">
        <Header />
        <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="carta-container">
      <Header />
      <Buscador value={searchTerm} onChange={setSearchTerm} />
      
      {error && (
        <div className="error-message" style={{ 
          color: '#ff6b6b', 
          textAlign: 'center', 
          padding: '10px',
          backgroundColor: '#ffe0e0',
          margin: '10px 0',
          borderRadius: '5px'
        }}>
          {error}
        </div>
      )}
      
      <h2 className="destacados-titulo">Productos Destacados</h2>
      <ProductosDestacados productos={productosFiltrados} onProductoClick={handleProductoClick} />
      <Cupon onClick={handleImageClick} />
      {modalVisible && <Modal code={code} onClose={closeModal} />}
    </div>
  );
}

export default Cartas;