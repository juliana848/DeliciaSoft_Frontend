import React from "react";
import { useParams } from "react-router-dom";

const mockData = {
  "fresas-con-crema": [
    {
      id: 1,
      nombre: "Fresas con Crema Clásicas",
      precio: 7000,
      imagen: "/imagenes/fresas1.jpg",
    },
    {
      id: 2,
      nombre: "Fresas con Crema y Chocolate",
      precio: 8500,
      imagen: "/imagenes/fresas2.jpg",
    },
  ],
  // Puedes agregar más productos aquí
};

const ProductoDetalle = () => {
  const { nombre } = useParams();
  const productos = mockData[nombre] || [];

  return (
    <div className="producto-detalle-container">
      <h2 className="detalle-titulo">{nombre.replace(/-/g, " ").toUpperCase()}</h2>
      <div className="productos">
        {productos.map((producto) => (
          <div className="producto" key={producto.id}>
            <img src={producto.imagen} alt={producto.nombre} className="producto-img" />
            <h3>{producto.nombre}</h3>
            <p className="precio">${producto.precio}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductoDetalle;
