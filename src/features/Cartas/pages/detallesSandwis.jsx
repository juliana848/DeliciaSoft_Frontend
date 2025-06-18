import React from "react";

const mockData = [
  {
    id: 1,
    nombre: "Sándwich de Jamón y Queso",
    precio: 8500,
    imagen: "/imagenes/Cartas/sandwich-jamon-queso.jpeg",
    descripcion: "Clásico sándwich con pan artesanal, jamón cocido y queso fundido.",
  },
  {
    id: 2,
    nombre: "Sándwich Vegetariano",
    precio: 9500,
    imagen: "/imagenes/Cartas/sandwich-vegetariano.jpeg",
    descripcion: "Con vegetales frescos, aguacate, tomate, lechuga y hummus.",
  },
  {
    id: 3,
    nombre: "Sándwich de Pollo BBQ",
    precio: 11000,
    imagen: "/imagenes/Cartas/sandwich-pollo-bbq.jpeg",
    descripcion: "Pollo desmechado con salsa BBQ, cebolla caramelizada y queso cheddar.",
  },
];

const DetalleSandwiches = () => {
  return (
    <div className="producto-detalle-container">
      <h2 className="detalle-titulo">SÁNDWICHES</h2>

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
        <p>🥪 ¡Gracias por preferir nuestros sándwiches artesanales! Los hacemos al momento con ingredientes frescos y pan suave. 💖</p>
        <p>También puedes pedirlos con papas, jugos naturales o un toque picante. 🌶️</p>
        <p>"¡Satisfacción garantizada o más hambre asegurada!" 😋</p>
      </div>
    </div>
  );
};

export default DetalleSandwiches;
