import React from "react";

const mockData = [
  {
    id: 1,
    nombre: "Brownie con Helado",
    precio: 8500,
    imagen: "/imagenes/Cartas/browniehelado.jpeg",
    descripcion: "Brownie caliente con bola de helado de vainilla y topping de chocolate.",
  },
  {
    id: 2,
    nombre: "Chessecake de Fresa",
    precio: 9000,
    imagen: "/imagenes/Cartas/cheesecakefresa.jpeg",
    descripcion: "Pastel frío con base de galleta y topping de fresa natural.",
  },
  {
    id: 3,
    nombre: "Postre Tres Leches",
    precio: 7000,
    imagen: "/imagenes/Cartas/tresleches.jpeg",
    descripcion: "Clásico postre colombiano, esponjoso y bañado en leche condensada.",
  },
];

const DetallePostres = () => {
  return (
    <div className="producto-detalle-container">
      <h2 className="detalle-titulo">POSTRES</h2>

      <div className="productos-detalle">
        {mockData.map((producto) => (
          <div className="producto-card" key={producto.id}>
            <img src={producto.imagen} alt={producto.nombre} className="producto-img" />
            <div className="producto-info">
              <h3>{producto.nombre}</h3>
              <p className="precio-extra">${producto.precio}</p>
              {producto.descripcion && (
                <p className="descripcion">{producto.descripcion}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="nota-clientes">
        <p>🎉 ¡Gracias por preferirnos! Todos nuestros postres son preparados con amor y frescura. 💖</p>
        <p>Puedes personalizar con toppings como frutas, nutella o sirope. 🍓🍫</p>
        <p>"Y recuerda, no dejes para mañana lo que te puedes comer hoy" 💖</p>
      </div>
    </div>
  );
};

export default DetallePostres;
