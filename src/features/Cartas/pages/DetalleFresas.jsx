import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";


const mockData = {
  "fresas-con-crema": [
    {
      id: 1,
      nombre: "Fresas con Crema Familiar 24onz",
      precio: 20000,
      imagen: "/imagenes/Cartas/fresacrema.jpeg",
      descripcion: "También tenemos esta presentación con duraznos y cerezas, con la opción de topping extras y nutella"
    },
    {
      id: 2,
      nombre: "Fresas con Crema 9ONZ",
      precio: 7000,
      imagen: "https://www.infobae.com/resizer/v2/TWP6YXWPVZGMHH7TUIIOGCR5PU.jpg?auth=ac927b5faa2fbe6639269c737930268c421259a43d38b78625ed281d236535ff&smart=true&width=350&height=197&quality=85",
      descripcion: "Versión pequeña ideal para niños o antojos rápidos",
    },
    {
      id: 3,
      nombre: "Fresas con Crema 12onz",
      precio: 12000,
      imagen: "https://www.sorpresasatiempo.com/cdn/shop/files/Disenosintitulo-2024-01-06T104345.478_1_grande.webp?v=1736623191",
      descripcion: "3 toppings para endulzar el día, con opción de añadir nutella",
    },
    {
      id: 4,
      nombre: "Fresas con Crema 12onz",
      precio: 12000,
      imagen: "https://i.pinimg.com/736x/a6/d5/81/a6d5813748907d362277809df993acf3.jpg",
      descripcion: "3 toppings para endulzar el día, con opción de añadir nutella",
    },
    {
      id: 5,
      nombre: "Fresas con Crema 12onz",
      precio: 12000,
      imagen: "https://i.pinimg.com/736x/2b/ee/73/2bee735752d18e7fa3fbcdd706bf3ce3.jpg",
      descripcion: "3 toppings para endulzar el día, con opción de añadir nutella",
    },
    {
      id: 6,
      nombre: "Fresas con Crema 12onz",
      precio: 12000,
      imagen: "https://i.pinimg.com/736x/9b/0a/9f/9b0a9f7853b3742fc71f2becae3e77b2.jpg",
      descripcion: "3 toppings para endulzar el día, con opción de añadir nutella",
    },
    {
      id: 7,
      nombre: "Fresas con Crema 12onz",
      precio: 12000,
      imagen: "https://i.pinimg.com/736x/b2/2f/23/b22f231315abb506e4dc9185492f3d22.jpg",
      descripcion: "3 toppings para endulzar el día, con opción de añadir nutella",
    },
    {
      id: 8,
      nombre: "Fresas con Crema 12onz",
      precio: 12000,
      imagen: "https://i.pinimg.com/736x/ed/d0/93/edd093fdaf9c48f93cac42a7b81b64c7.jpg",
      descripcion: "3 toppings para endulzar el día, con opción de añadir nutella",
    },
    {
      id: 9,
      nombre: "Fresas con Crema 12onz",
      precio: 12000,
      imagen: "https://i.pinimg.com/736x/2f/0a/eb/2f0aebd781732335030a8d061fa252db.jpg",
      descripcion: "3 toppings para endulzar el día, con opción de añadir nutella",
    },
    {
      id: 10,
      nombre: "Fresas con Crema 12onz",
      precio: 12000,
      imagen: "https://i.pinimg.com/736x/e7/17/c5/e717c520d1bc0008ad63cd0618918d40.jpg",
      descripcion: "3 toppings para endulzar el día, con opción de añadir nutella",
    },
  ],
};

const ProductoDetalle = () => {
  const navigate = useNavigate();
  const { agregarProducto } = useContext(CartContext);
  const productos = mockData["fresas-con-crema"];

  return (
    <div className="producto-detalle-container">
      <h2 className="detalle-titulo">FRESAS CON CREMA</h2>

      <div className="productos-detalle">
        {productos.map((producto) => (
          <div className="producto-card" key={producto.id}>
            <img src={producto.imagen} alt={producto.nombre} className="producto-img" />
            <div className="producto-info">
              <h3>{producto.nombre}</h3>
              <p className="precio-extra">${producto.precio}</p>
              {producto.descripcion && <p className="descripcion">{producto.descripcion}</p>}
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
                Agregar a mi pedido 🍓
              </button>

            </div>
          </div>
        ))}
      </div>

      <div className="nota-clientes">
        <p>🎉 ¡Gracias por preferirnos! Todos nuestros productos son preparados con ingredientes frescos y mucho amor. 💖</p>
        <p>Además ofrecemos fresas con crema con durazno, cereza, y mango, con adiciones 💖</p>
        <p>"Y recuerda no dejes para mañana lo que te puedes comer hoy" 💖</p>
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

export default ProductoDetalle;
