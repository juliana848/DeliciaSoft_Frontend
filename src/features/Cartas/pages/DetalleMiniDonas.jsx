import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext"; // Asegúrate que el path esté bien

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
    imagen: "https://i.pinimg.com/736x/29/c2/12/29c2122482d9b91c90abe2ab8644e352.jpg",
    descripcion: "Paquete de mini donas de sabores variados: fresa, vainilla y chocolate.",
  },
  {
    id: 3,
    nombre: "Mini Donas Surtidas",
    precio: 6500,
    imagen: "https://i.pinimg.com/736x/6d/5a/1a/6d5a1acc1a060c965cf1e7749dd311f7.jpg",
    descripcion: "Paquete de mini donas de sabores variados: fresa, vainilla y chocolate.",
  },
  {
    id: 4,
    nombre: "Mini Donas Surtidas",
    precio: 6500,
    imagen: "https://i.pinimg.com/736x/f7/39/87/f73987f65d24e179e87044b381aa99c0.jpg",
    descripcion: "Paquete de mini donas de sabores variados: fresa, vainilla y chocolate.",
  },
  {
    id: 5,
    nombre: "Mini Donas Surtidas",
    precio: 6500,
    imagen: "https://i.pinimg.com/736x/cc/e4/fd/cce4fd02fd6466a5bf3bc0931d9b32f7.jpg",
    descripcion: "Paquete de mini donas de sabores variados: fresa, vainilla y chocolate.",
  },
  {
    id: 6,
    nombre: "Mini Donas Surtidas",
    precio: 6500,
    imagen: "https://i.pinimg.com/736x/74/11/e2/7411e2fb688b33ecc9c00ad951d3d994.jpg",
    descripcion: "Paquete de mini donas de sabores variados: fresa, vainilla y chocolate.",
  },
  {
    id: 7,
    nombre: "Mini Donas Surtidas",
    precio: 6500,
    imagen: "https://i.pinimg.com/736x/ef/ce/6b/efce6bb956e49d6cc0e1fcc3a15c57c9.jpg",
    descripcion: "Paquete de mini donas de sabores variados: fresa, vainilla y chocolate.",
  },
  {
    id: 8,
    nombre: "Mini Donas Surtidas",
    precio: 6500,
    imagen: "https://i.pinimg.com/736x/7b/95/a9/7b95a9138f59be7650595e7b554840a4.jpg",
    descripcion: "Paquete de mini donas de sabores variados: fresa, vainilla y chocolate.",
  },
  {
    id: 9,
    nombre: "Mini Donas Surtidas",
    precio: 6500,
    imagen: "https://i.pinimg.com/736x/40/79/da/4079da1e5d0ace0aeb41b1344037f427.jpg",
    descripcion: "Paquete de mini donas de sabores variados: fresa, vainilla y chocolate.",
  },
  {
    id: 10,
    nombre: "Mini Donas Surtidas",
    precio: 6500,
    imagen: "https://i.pinimg.com/736x/4f/f7/db/4ff7dbfb2da849b2af3979f47585b8ee.jpg",
    descripcion: "Paquete de mini donas de sabores variados: fresa, vainilla y chocolate.",
  },
];

const DetalleMiniDonas = () => {
  const navigate = useNavigate();
  const { agregarProducto } = useContext(CartContext); // ✅ Integración con el carrito

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
                Agregar a mi pedido 🍩
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="nota-clientes">
        <p>🎉 ¡Gracias por preferirnos! Todos nuestros productos son preparados con ingredientes frescos y mucho amor. 💖</p>
        <p>También puedes pedir mini donas personalizadas para tus eventos. 🎈</p>
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

export default DetalleMiniDonas;

