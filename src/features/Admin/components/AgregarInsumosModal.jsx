// components/AgregarInsumosModal.jsx
import React, { useState } from 'react';
import InsumoCard from './InsumoCard';

const AgregarInsumosModal = ({ onClose, onAgregar }) => {
  const [selectedInsumos, setSelectedInsumos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de ejemplo - en producción vendrían de una API
  const insumosData = [
    { id: 2323232, nombre: 'crema de leche', unidad: 'Auto', precio: 25.50, imagen: 'cremaleche.jpg' },
    { id: 2323231, nombre: 'arroz', unidad: 'Kg', precio: 12.00, imagen: 'arroz.jpg' },
    { id: 2323233, nombre: 'harina de trigo', unidad: 'Kg', precio: 15.75, imagen: 'harina.jpg' },

    // Más insumos...
  ];

  const filteredInsumos = insumosData.filter(insumo =>
    insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleInsumo = (insumo) => {
    setSelectedInsumos(prev => 
      prev.some(i => i.id === insumo.id)
        ? prev.filter(i => i.id !== insumo.id)
        : [...prev, { ...insumo, cantidad: 1 }]
    );
  };

  const handleAgregar = () => {
    onAgregar(selectedInsumos);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content compras-modal">
        <div className="modal-header">
          <h2>Seleccionar Insumos</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar insumo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="insumos-grid">
          {filteredInsumos.map(insumo => (
            <InsumoCard
              key={insumo.id}
              insumo={insumo}
              selected={selectedInsumos.some(i => i.id === insumo.id)}
              onToggle={() => toggleInsumo(insumo)}
            />
          ))}
        </div>
        
        <div className="modal-footer">
          <button className="admin-button gray" onClick={onClose}>Cancelar</button>
          <button className="admin-button pink" onClick={handleAgregar}>
            Agregar ({selectedInsumos.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarInsumosModal;