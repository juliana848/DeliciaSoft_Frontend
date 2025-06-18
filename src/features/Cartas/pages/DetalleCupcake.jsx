import React from "react";

const mockData = [
  {
    id: 1,
    nombre: "Cupcake de Vainilla",
    precio: 3000,
    imagen: "/imagenes/Cartas/cup.jpeg",
    descripcion: "Cupcake esponjoso de vainilla con crema batida y cereza.",
  },
  {
    id: 2,
    nombre: "Cupcake de Chocolate",
    precio: 3500,
    imagen: "/imagenes/Cartas/cup.jpeg",
    descripcion: "Cupcake de chocolate con cobertura de fudge y chispas.",
  },
];

const DetalleCupcake = () => {
  return (
    <div className="producto-detalle-container">
      <h2 className="detalle-titulo">CUPCAKES</h2>

      <div className="productos-detalle">
        {mockData.map((producto) => (
          <div className="producto-card" key={producto.id}>
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="producto-img"
            />
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
        <p>
          🎉 ¡Gracias por preferirnos! Todos nuestros productos son preparados
          con ingredientes frescos y mucho amor. 💖
        </p>
        <p>
          También puedes consultar otras categorías desde la carta principal. 💖
        </p>
        <p>
          "Y recuerda, no dejes para mañana lo que te puedes comer hoy" 💖
        </p>
      </div>
    </div>
  );
};

export default DetalleCupcake;
