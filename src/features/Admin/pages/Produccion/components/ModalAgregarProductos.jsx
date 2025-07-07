import React from 'react';
import './Css/ModalAgregarProductos.css';

export default function ModalAgregarProductos({
  productosDisponibles = [],
  productosSeleccionados = [],
  setProductosSeleccionados,
  filtro = '',
  setFiltro,
  onClose
}) {
  const toggleSeleccion = (producto) => {
    const yaSeleccionado = productosSeleccionados.some(p => p.id === producto.id);
    if (yaSeleccionado) {
      setProductosSeleccionados(prev => prev.filter(p => p.id !== producto.id));
    } else {
    setProductosSeleccionados(prev => [...prev, { ...producto, cantidad: 1, receta: producto.receta || null }]);
    }
  };

  return (
    <div className="modal-agregar-container">
      <h2 className="modal-agregar-title">Seleccionar productos</h2>

      <div className="modal-agregar-buscador">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <div className="modal-agregar-grid">
        {productosDisponibles
          .filter((p) => p.nombre.toLowerCase().includes(filtro.toLowerCase()))
          .map((producto) => {
            const estaSeleccionado = productosSeleccionados.some(p => p.id === producto.id);
            return (
              <div
                key={producto.id}
                className={`modal-agregar-card ${estaSeleccionado ? 'seleccionado' : ''}`}
                onClick={() => toggleSeleccion(producto)}
              >
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/160?text=Postre';
                  }}
                />
                <span>{producto.nombre}</span>
              </div>
            );
          })}
      </div>

      <div className="modal-agregar-footer">
        <button className="cancel-btn" onClick={onClose}>Cancelar</button>
        <button
          className="save-btn"
          onClick={onClose}
        >
          Guardar ({productosSeleccionados.length})
        </button>
      </div>
    </div>
  );
}
