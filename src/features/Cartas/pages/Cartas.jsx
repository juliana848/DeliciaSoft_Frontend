import React, { useState } from "react";
import "./Cartas.css";
import CategoriasInicio from "../../Home/pages/components/Categorias/CategoriasInicio";
import Header from "./Header";
import Buscador from "./Buscador";
import ProductosDestacados from "./ProductosDestacados";
import Cupon from "./Cupon";
import Modal from "./Modal";

function Cartas() {
  const [code, setCode] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const productosDestacados = [
    { nombre: "FRESAS CON CREMA", precio: "$7,000", imagen: "/imagenes/Cartas/fresacrema.jpeg" },
    { nombre: "OBLEA", precio: "$3,000", imagen: "/imagenes/Cartas/obleass.jpeg" },
    { nombre: "Mini Donas", precio: "$6,000", imagen: "/imagenes/Cartas/miniDona.jpeg" },
    { nombre: "Arroz con Leche", precio: "$10,000", imagen: "/imagenes/Cartas/arrozConLeche.jpg" },
    { nombre: "Cupcakes", precio: "$3,000", imagen: "/imagenes/Cartas/cup.jpeg" },
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

  return (
    <div className="carta-container">
      <Header />
      <Buscador value={searchTerm} onChange={setSearchTerm} />
      <CategoriasInicio />
      <h2 className="destacados-titulo">DESTACADOS</h2>
      <ProductosDestacados productos={productosFiltrados} />
      <Cupon onClick={handleImageClick} />
      {modalVisible && <Modal code={code} onClose={closeModal} />}
    </div>
  );
}

export default Cartas;
