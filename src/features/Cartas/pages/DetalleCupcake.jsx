import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext"; // Asegúrate de que este path esté bien

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
    imagen: "https://i.pinimg.com/736x/d4/02/a9/d402a9724b58804b55f03f4c929267df.jpg",
    descripcion: "Cupcake de chocolate con cobertura de fudge y chispas.",
  },
  {
    id: 3,
    nombre: "Cupcake de Vainilla",
    precio: 3000,
    imagen: "https://i.pinimg.com/736x/57/1d/22/571d22720418a400baafe28dd52c3ec4.jpg",
    descripcion: "Cupcake esponjoso de vainilla con crema batida y cereza.",
  },
  {
    id: 4,
    nombre: "Cupcake de Chocolate",
    precio: 3500,
    imagen: "https://i.pinimg.com/736x/fb/04/00/fb04008fe246588b43a3f335b0fb0e29.jpg",
    descripcion: "Cupcake de chocolate con cobertura de fudge y chispas.",
  },
  {
    id: 5,
    nombre: "Cupcake de Vainilla",
    precio: 3000,
    imagen: "https://i.pinimg.com/736x/ca/d4/3f/cad43f0a0a7fc197200dc32a6a75140f.jpg",
    descripcion: "Cupcake esponjoso de vainilla con crema batida y cereza.",
  },
  {
    id: 6,
    nombre: "Cupcake de Chocolate",
    precio: 3500,
    imagen: "https://i.pinimg.com/736x/f9/c5/3b/f9c53b208d1b2957f7be3c0588351e9e.jpg",
    descripcion: "Cupcake de chocolate con cobertura de fudge y chispas.",
  },
];

const DetalleCupcake = () => {
  const navigate = useNavigate();
  const { agregarProducto } = useContext(CartContext); // ✅ usamos el contexto

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
              <button
                onClick={() => {
                  agregarProducto({ ...producto, cantidad: 1 });
                  navigate("/pedidos");
                }}
                style={{
                  marginTop: "10px",
                  backgroundColor: "#ff0080",
                  color: "#fff",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
                  transition: "background-color 0.3s",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#e60073")
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = "#ff0080")
                }
              >
                Agregar a mi pedido 🧁
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="nota-clientes">
        <p>🎉 ¡Gracias por preferirnos! Todos nuestros productos son preparados con ingredientes frescos y mucho amor. 💖</p>
        <p>También puedes consultar otras categorías desde la carta principal. 💖</p>
        <p>"Y recuerda, no dejes para mañana lo que te puedes comer hoy" 💖</p>
      </div>

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <button
          onClick={() => navigate("/Cartas")}
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

export default DetalleCupcake;
