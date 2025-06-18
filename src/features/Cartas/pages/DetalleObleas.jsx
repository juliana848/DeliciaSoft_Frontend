import React from "react";

const mockData = [
  {
    id: 1,
    nombre: "Oblea con Arequipe y Queso",
    precio: 4000,
    imagen: "/imagenes/Cartas/obleas.jpeg",
    descripcion: "Clásica oblea rellena de arequipe y queso rallado fresco.",
  },
  {
    id: 2,
    nombre: "Oblea con Nutella y Frutas",
    precio: 6000,
    imagen: "/imagenes/Cartas/obleas.jpeg",
    descripcion: "Oblea gourmet con nutella, fresas, banano y topping de chocolate.",
  },
  {
    id: 3,
    nombre: "Oblea Tradicional",
    precio: 3500,
    imagen: "/imagenes/Cartas/obleas.jpeg",
    descripcion: "Rellena solo con arequipe o leche condensada. ¡Sencilla y deliciosa!",
  },
];

const DetalleObleas = () => {
  return (
    <div className="producto-detalle-container">
      <h2 className="detalle-titulo">OBLEAS</h2>

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
        <p>🎉 ¡Gracias por preferirnos! Todos nuestros productos son preparados con ingredientes frescos y mucho amor. 💖</p>
        <p>También puedes personalizar tu oblea con hasta 5 toppings diferentes. ✨</p>
        <p>"Y recuerda, no dejes para mañana lo que te puedes comer hoy" 💖</p>
      </div>
    </div>
  );
};

export default DetalleObleas
