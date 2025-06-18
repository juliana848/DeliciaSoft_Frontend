import React from "react";
import { useParams } from "react-router-dom";

const mockData = {
  "chocolates": [
    {
      id: 1,
      nombre: "Chocolate Caliente Clásico",
      precio: 5000,
      imagen: "/imagenes/Cartas/chocolatecaliente.jpeg",
      descripcion: "Delicioso chocolate espeso y cremoso, perfecto para días fríos.",
    },
    {
      id: 2,
      nombre: "Chocolate con Malvaviscos",
      precio: 6000,
      imagen: "/imagenes/Cartas/chocolatemalvavisco.jpeg",
      descripcion: "Chocolate caliente con topping de marshmallows derretidos.",
    },
    {
      id: 3,
      nombre: "Chocolate Blanco con Fresa",
      precio: 7000,
      imagen: "/imagenes/Cartas/chocolateblanco.jpeg",
      descripcion: "Una combinación suave de chocolate blanco y trozos de fresa natural.",
    },
  ],
  
};

const detallesChocolates = () => {
  const { nombre } = useParams();
  const productos = mockData[nombre] || [];

  return (
    <div className="producto-detalle-container">
      <h2 className="detalle-titulo">{nombre.replace(/-/g, " ").toUpperCase()}</h2>

      <div className="productos-detalle">
        {productos.length > 0 ? (
          productos.map((producto) => (
            <div className="producto-card" key={producto.id}>
              <img src={producto.imagen} alt={producto.nombre} className="producto-img" />
              <div className="producto-info">
                <h3>{producto.nombre}</h3>
                <p className="precio-extra">${producto.precio}</p>
                {producto.descripcion && <p className="descripcion">{producto.descripcion}</p>}
              </div>
            </div>
          ))
        ) : (
          <p>No hay productos disponibles para esta categoría.</p>
        )}
      </div>

      <div className="nota-clientes">
        <p>🎉 ¡Gracias por preferirnos! Todos nuestros productos son preparados con ingredientes frescos y mucho amor. 💖</p>
        <p>También puedes acompañarlos con galletas, crema batida o frutas. 🍪🍓</p>
        <p>"Y recuerda, no dejes para mañana lo que te puedes comer hoy" 💖</p>
      </div>
    </div>
  );
};

export default detallesChocolates;
``
