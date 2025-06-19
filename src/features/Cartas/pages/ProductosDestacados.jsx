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

  const handleSeleccionar = (item, event) => {
    event.stopPropagation(); // Evita que se dispare el click del contenedor
    onProductoClick(item);
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
          <h3>{item.nombre}</h3>
          <p className="precio">{formatearPrecio(item.precio)}</p>
          <button 
            className="btn-seleccionar"
            onClick={(e) => handleSeleccionar(item, e)}
          >
            Seleccionar
          </button>
        </div>
      ))}
    </div>
  );
}

export default ProductosDestacados;