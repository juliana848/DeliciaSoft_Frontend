// components/AgregarProductosModal.jsx
import React, { useState } from 'react';
import InsumoCard from '../InsumoCard';

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
    <div className="modal-overlay">
      <div className="modal-content compras-modal">
        <div className="modal-header">
          <h2>Seleccionar Productos</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="insumos-grid">
          {filteredProductos.map(producto => (
            <InsumoCard
              key={producto.id}
              insumo={producto}
              selected={selectedProductos.some(p => p.id === producto.id)}
              onToggle={() => toggleProducto(producto)}
            />
          ))}
        </div>

        <div className="modal-footer">
          <button className="admin-button gray" onClick={onClose}>Cancelar</button>
          <button className="admin-button pink" onClick={handleAgregar}>
            Agregar ({selectedProductos.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarProductosModal;
