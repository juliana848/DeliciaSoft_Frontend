import React, { useState } from "react";
import "../css/cartas.css";

function Cartas() {
  const [code, setCode] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el buscador

  const productosDestacados = [
    { nombre: "FRESAS CON CREMA", precio: "$7,000", imagen: "/imagenes/fresacrema.jpeg" },
    { nombre: "OBLEA", precio: "$3,000", imagen: "/imagenes/obleass.jpeg" },
    { nombre: "Mini Donas", precio: "$6,000", imagen: "/imagenes/miniDona.jpeg" },
    { nombre: "Arroz con Leche", precio: "$10,000", imagen: "/imagenes/arrozConLeche.jpg" },
    { nombre: "Cupcakes", precio: "$3,000", imagen: "/imagenes/cup.jpeg" },
    { nombre: "Sandwiches", precio: "$16,500", imagen: "/imagenes/sandwches.jpeg" },
    { nombre: "Postres", precio: "$8,000", imagen: "/imagenes/postres.jpeg" },
    { nombre: "chocolates", precio: "$1,500", imagen: "/imagenes/chocolates.jpeg" },
  ];

  const generateRandomCode = () => {
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    setCode(newCode);
  };

  const handleImageClick = () => {
    generateRandomCode();
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // Filtrar productos según el término de búsqueda (ignorando mayúsculas/minúsculas)
  const productosFiltrados = productosDestacados.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="carta-container">
      {/* Encabezado */}
      <div className="header">
        <img src="/imagenes/donas.png" alt="Donas" className="donas-img" />
        <div className="texto-header">
          <h1>EN DELICIAS DARSY</h1>
          <p>descubre sabores únicos que endulzan cada momento.</p>
          <p>"Hechos con mucho amor"</p>
          <p className="contacto-header">321 309 85 04</p>
        </div>
      </div>

      {/* Buscador y título */}
      <div className="buscador-carta">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <h2>CARTA</h2>
      </div>

      {/* Categorías */}
      <h2 className="categorias-titulo">CATEGORIAS</h2>
      <div className="categorias">
        <div className="categoria">
          <img src="/imagenes/fresas.jpeg" alt="Fresas" />
          <span>FRESAS CON CREMA</span>
        </div>
        <div className="categoria">
          <img src="/imagenes/obleas.jpeg" alt="Obleas" />
          <span>OBLEAS</span>
        </div>
        <div className="categoria">
          <img src="/imagenes/cupcakes.jpg" alt="Cupcakes" />
          <span>CUPCAKES</span>
        </div>
      </div>

      {/* Productos destacados filtrados */}
      <h2 className="destacados-titulo">DESTACADOS</h2>
      <div className="productos">
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map((item, index) => (
            <div className="producto" key={index}>
              <div className="etiqueta">DESTACADOS</div>
              <img src={item.imagen} alt={item.nombre} className="producto-img" />
              <p>{item.nombre}</p>
              <p className="precio">{item.precio}</p>
            </div>
          ))
        ) : (
          <p>No se encontraron productos.</p>
        )}
      </div>

      {/* Imagen del cupón (Responsive y más grande) */}
      <div className="codigo-promocional" style={{ textAlign: "center", marginTop: "2rem" }}>
        <img
          src="/imagenes/cupon.jpg"
          alt="Promoción"
          onClick={handleImageClick}
          style={{
            width: "100%",
            maxWidth: "800px",
            height: "500px",
            cursor: "pointer",
            transition: "transform 0.3s",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
      </div>

      {/* Modal simple */}
      {modalVisible && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "10px",
              padding: "2rem",
              width: "300px",
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>¡Tu código especial!</h2>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#0070f3" }}>{code}</p>
            <button
              onClick={closeModal}
              style={{
                marginTop: "1.5rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#e91e63",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cartas;
