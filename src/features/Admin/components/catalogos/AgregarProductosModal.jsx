// components/AgregarProductosModal.jsx
import React, { useState } from 'react';
import InsumoCard from '../InsumoCard';
// Asegúrate de que adminStyles.css esté importado en este archivo o en un nivel superior
// import '../adminStyles.css';


const AgregarProductosModal = ({ onClose, onAgregar }) => {
  const [selectedProductos, setSelectedProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const productosData = [
    { id: 101, nombre: 'Fresas con crema', unidad: 'Unidad', precio: 18.00, imagen: 'fresas.jpg' },
    { id: 102, nombre: 'Torta', unidad: 'Unidad', precio: 35.00, imagen: 'torta.jpg' },

  ];

  const filteredProductos = productosData.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleProducto = (producto) => {
    setSelectedProductos(prev =>
      prev.some(p => p.id === producto.id)
        ? prev.filter(p => p.id !== producto.id)
        : [...prev, { ...producto, cantidad: 1 }]
    );
  };

  const handleAgregar = () => {
    onAgregar(selectedProductos);
    onClose();
  };

  return (
    <div className="modal-overlay"> {/* Clase existente, coincide */}
      <div className="insumos-modal"> {/* Reemplazado de modal-content compras-modal */}
        <div className="insumos-modal-header"> {/* Reemplazado de modal-header */}
          <h2>Seleccionar Productos</h2>
          <button onClick={onClose} className="insumos-close-btn">&times;</button> {/* Reemplazado de close-btn */}
        </div>

        <div className="insumos-search-bar"> {/* Reemplazado de search-bar */}
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="insumos-grid"> {/* Clase existente, coincide */}
          {filteredProductos.map(producto => (
            <InsumoCard
              key={producto.id}
              insumo={producto}
              selected={selectedProductos.some(p => p.id === producto.id)}
              onToggle={() => toggleProducto(producto)}
            />
          ))}
        </div>

        <div className="insumos-footer"> {/* Reemplazado de modal-footer */}
          <button className="insumos-btn cancel" onClick={onClose}>Cancelar</button> {/* Reemplazado de admin-button gray */}
          <button className="insumos-btn pink" onClick={handleAgregar}> {/* Reemplazado de admin-button pink */}
            Agregar ({selectedProductos.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarProductosModal;
