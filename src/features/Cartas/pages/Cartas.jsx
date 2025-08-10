import React, { useState } from "react";
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
  const navigate = useNavigate();

  const productosDestacados = [
    { nombre: "FRESAS CON CREMA", precio: "$7,000", imagen: "/imagenes/Cartas/fresacrema.jpeg" },
    { nombre: "OBLEA", precio: "$3,000", imagen: "/imagenes/Cartas/obleass.jpeg" },
    { nombre: "Mini Donas", precio: "$6,000", imagen: "/imagenes/Cartas/miniDona.jpeg" },
    { nombre: "Cupcakes", precio: "$3,000", imagen: "/imagenes/Cartas/cup.jpeg" },
    { nombre: "Arroz con Leche", precio: "$10,000", imagen: "/imagenes/Cartas/arrozConLeche.jpg" },
    { nombre: "Sandwiches", precio: "$16,500", imagen: "/imagenes/Cartas/sandwches.jpeg" },
    { nombre: "Postres", precio: "$8,000", imagen: "/imagenes/Cartas/postres.jpeg" },
    { nombre: "chocolates", precio: "$1,500", imagen: "/imagenes/Cartas/chocolates.jpeg" },
  ];

  const handleImageClick = () => {
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    setCode(newCode);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const productosFiltrados = productosDestacados.filter((producto) =>
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
    }
  };

  return (
    <div className="carta-container">
      <Header />
      <Buscador value={searchTerm} onChange={setSearchTerm} />
      <h2 className="destacados-titulo">Productos Destacados</h2>
      <ProductosDestacados productos={productosFiltrados} onProductoClick={handleProductoClick} />
      <Cupon onClick={handleImageClick} />
      {modalVisible && <Modal code={code} onClose={closeModal} />}
    </div>
  );
}

export default Cartas;
