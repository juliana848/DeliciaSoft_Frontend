import React from "react";

function ProductosDestacados({ productos, onProductoClick }) {
  if (productos.length === 0) {
    return <p>No se encontraron productos.</p>;
  }

  return (
    <div className="productos">
      {productos.map((item, index) => (
        <div
          className="producto"
          key={index}
          onClick={() => onProductoClick?.(item)}
          style={{ cursor: "pointer" }}
        >
          <div className="etiqueta">DESTACADOS</div>
          <img
            src={item.imagen}
            alt={item.nombre}
            className="producto-img"
          />
          <p style={{ fontWeight: "bold" }}>{item.nombre}</p>
          <p className="precio">${item.precio.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

export default ProductosDestacados;
