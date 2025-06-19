import React from "react";

function ProductosDestacados({ productos, onProductoClick }) {
  if (productos.length === 0) {
    return <p>No se encontraron productos.</p>;
  }

  // Función auxiliar para limpiar y formatear precio
  const formatearPrecio = (precio) => {
    // Si es string y tiene símbolo $, lo quitamos
    const valorNumerico = typeof precio === "string"
      ? parseInt(precio.replace(/[^\d]/g, ""), 10)
      : precio;

    // Retornamos con símbolo $ y formateado
    return `$${valorNumerico.toLocaleString("es-CO")}`;
  };

  return (
    <div className="productos">
      {productos.map((item, index) => (
        <div
          className="producto"
          key={index}
          onClick={() => onProductoClick(item)}
          style={{ cursor: "pointer" }}
        >
          <div className="etiqueta">DESTACADOS</div>
          <img src={item.imagen} alt={item.nombre} className="producto-img" />
          <p>{item.nombre}</p>
          <p className="precio">{formatearPrecio(item.precio)}</p>
        </div>
      ))}
    </div>
  );
}

export default ProductosDestacados;
