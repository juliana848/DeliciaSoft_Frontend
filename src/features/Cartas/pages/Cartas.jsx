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

  // Imagen por defecto para casos sin imagen
  const imagenPorDefecto = "/imagenes/Cartas/default.jpeg";

  // Función para obtener las categorías desde la API
  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://deliciasoft-backend.onrender.com/api/categorias-productos");
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Datos recibidos de la API:", data);
      
      // Filtrar solo categorías activas y transformar para el componente
      const categoriasActivas = data
        .filter(categoria => categoria.estado)
        .map(categoria => {
          // Obtener la imagen desde la API o usar imagen por defecto
          const imagenUrl = categoria.imagenes && categoria.imagenes.urlimg 
            ? categoria.imagenes.urlimg 
            : imagenPorDefecto;

          return {
            id: categoria.idcategoriaproducto,
            nombre: categoria.nombrecategoria,
            descripcion: categoria.descripcion,
            imagen: imagenUrl,
            idimagencat: categoria.idimagencat,
            precio: 0 // Temporal hasta arreglar ProductosDestacados
          };
        });

      setCategorias(categoriasActivas);
      setError(null);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      setError("Error al cargar los productos. Por favor, intenta nuevamente.");
      
      // En caso de error, mostrar array vacío
      setCategorias([]);
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