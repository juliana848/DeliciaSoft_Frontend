import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext"; // Asegúrate de que este path sea correcto

const mockData = [
  {
    id: 1,
    nombre: "Arroz con Leche Clásico",
    precio: 5000,
    imagen: "/imagenes/Cartas/arrozconleche1.jpeg",
    descripcion: "Suave, cremoso, con canela espolvoreada por encima.",
  },
  {
    id: 2,
    nombre: "Arroz con Leche con Coco",
    precio: 6000,
    imagen: "/imagenes/Cartas/arrozcoco.jpeg",
    descripcion: "Mezcla tropical con coco rallado, sabor inolvidable.",
  },
  {
    id: 3,
    nombre: "Arroz con Leche Frutal",
    precio: 6500,
    imagen: "/imagenes/Cartas/arrozfrutas.jpeg",
    descripcion: "Incluye trozos de durazno, fresa y mango para un sabor refrescante.",
  },
];

const DetallesArroz  = () => {
  const navigate = useNavigate();
  const { agregarProducto } = useContext(CartContext);

  return (
    <div className="producto-detalle-container">
      <h2 className="detalle-titulo">ARROZ CON LECHE</h2>

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
                onMouseOver={(e) => (e.target.style.backgroundColor = "#e60073")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#ff0080")}
              >
                Agregar a mi pedido 🍚
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="nota-clientes">
        <p>🎉 ¡Gracias por preferirnos! Todos nuestros productos son preparados con ingredientes frescos y mucho amor. 💖</p>
        <p>Además, puedes pedirlo caliente o frío, con toppings de frutas. 🍓🥭</p>
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

export default DetallesArroz;
