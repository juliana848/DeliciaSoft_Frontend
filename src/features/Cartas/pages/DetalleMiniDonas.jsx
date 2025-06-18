import React from "react";
import { useNavigate } from "react-router-dom"; 

const mockData = [
  {
    id: 1,
    nombre: "Mini Donas de Chocolate",
    precio: 6000,
    imagen: "/imagenes/Cartas/miniDona.jpeg",
    descripcion: "Deliciosas mini donas cubiertas de chocolate y chispas dulces.",
  },
  {
    id: 2,
    nombre: "Mini Donas Surtidas",
    precio: 6500,
    imagen: "/imagenes/Cartas/miniDona.jpeg",
    descripcion: "Paquete de mini donas de sabores variados: fresa, vainilla y chocolate.",
  },
];

const DetalleMiniDonas = () => {
  const navigate = useNavigate();

  return (
    <div className="producto-detalle-container">
      <h2 className="detalle-titulo">MINI DONAS</h2>

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
        <p>🎉 ¡Gracias por preferirnos! Todos nuestros productos son preparados con ingredientes frescos y mucho amor. 💖</p>
        <p>También puedes pedir mini donas personalizadas para tus eventos. 🎈</p>
        <p>"Y recuerda, no dejes para mañana lo que te puedes comer hoy" 💖</p>
      </div>

      {/* ✅ Botón para regresar */}
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

export default DetalleMiniDonas;
