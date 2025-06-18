import React from "react";
import { useNavigate } from "react-router-dom";

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
    imagen: "https://i.pinimg.com/736x/f6/3d/4f/f63d4f58a292442b7c5f2793f5fba429.jpg",
    descripcion: "Oblea gourmet con nutella, fresas, banano y topping de chocolate.",
  },
  {
    id: 3,
    nombre: "Oblea Tradicional",
    precio: 3500,
    imagen: "https://i.pinimg.com/736x/55/76/14/557614bc712a435c66a92af9b16ae300.jpg",
    descripcion: "Rellena solo con arequipe o leche condensada. ¡Sencilla y deliciosa!",
  },
  {
    id: 4,
    nombre: "Oblea Tradicional",
    precio: 3500,
    imagen: "https://i.pinimg.com/736x/7a/03/8e/7a038e7660eb3aeb4be9e7c32178faf2.jpg",
    descripcion: "Rellena solo con arequipe o leche condensada. ¡Sencilla y deliciosa!",
  },
  {
    id: 5,
    nombre: "Oblea Tradicional",
    precio: 3500,
    imagen: "https://i.pinimg.com/736x/52/7e/91/527e91784cc426e048ecef53a7a9e616.jpg",
    descripcion: "Rellena solo con arequipe o leche condensada. ¡Sencilla y deliciosa!",
  },
  {
    id: 6,
    nombre: "Oblea Tradicional",
    precio: 3500,
    imagen: "https://i.pinimg.com/736x/b8/2c/9b/b82c9b76204c4369bfc9db3690758a25.jpg",
    descripcion: "Rellena solo con arequipe o leche condensada. ¡Sencilla y deliciosa!",
  },
  {
    id: 7,
    nombre: "Oblea Tradicional",
    precio: 3500,
    imagen: "https://i.pinimg.com/736x/4d/71/e7/4d71e70dd4d87da3d95700193950da56.jpg",
    descripcion: "Rellena solo con arequipe o leche condensada. ¡Sencilla y deliciosa!",
  },
  {
    id: 8,
    nombre: "Oblea Tradicional",
    precio: 3500,
    imagen: "https://i.pinimg.com/736x/04/d4/ba/04d4babf1381ce02336a0e315cf31e8d.jpg",
    descripcion: "Rellena solo con arequipe o leche condensada. ¡Sencilla y deliciosa!",
  },
  {
    id: 9,
    nombre: "Oblea Tradicional",
    precio: 3500,
    imagen: "https://i.pinimg.com/736x/26/49/55/264955bd2776f62c39cc136908e705d7.jpg",
    descripcion: "Rellena solo con arequipe o leche condensada. ¡Sencilla y deliciosa!",
  },
  {
    id: 10,
    nombre: "Oblea Tradicional",
    precio: 3500,
    imagen: "https://i.pinimg.com/736x/9c/58/3e/9c583ef38048ba081f00d154d4a038d6.jpg",
    descripcion: "Rellena solo con arequipe o leche condensada. ¡Sencilla y deliciosa!",
  },
];

const DetalleObleas = () => {
  const navigate = useNavigate();

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

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <button
          onClick={() => navigate("/Cartas")} // ✅ Redirecciona a la ruta "/Cartas"
          style={{
            backgroundColor: "#ff0080",
            color: "#fff",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ⬅ Volver a la carta
        </button>
      </div>
    </div>
  );
};

export default DetalleObleas;
