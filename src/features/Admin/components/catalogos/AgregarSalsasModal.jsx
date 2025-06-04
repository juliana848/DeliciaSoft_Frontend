import React, { useState } from 'react';
import InsumoCard from '../InsumoCard';


const AgregarSalsasModal = ({ onClose, onAgregar }) => {
  const [selectedSalsas, setSelectedSalsas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const salsasData = [
    { id: 101, nombre: 'Salsa de tomate', unidad: 'ml', precio: 0, imagen: 'salsatomate.jpg' },
    { id: 102, nombre: 'Mayonesa', unidad: 'ml', precio: 0, imagen: 'mayonesa.jpg' },
    { id: 103, nombre: 'Mostaza', unidad: 'ml', precio: 0, imagen: 'mostaza.jpg' },
  ];

  const filteredSalsas = salsasData.filter(salsa =>
    salsa.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSalsa = (salsa) => {
    setSelectedSalsas(prev =>
      prev.some(i => i.id === salsa.id)
        ? prev.filter(i => i.id !== salsa.id)
        : [...prev, { ...salsa, cantidad: 1 }]
    );
  };

  const handleAgregar = () => {
    onAgregar(selectedSalsas);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content compras-modal">
        <div className="modal-header">
          <h2>Seleccionar Salsas</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar salsa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="insumos-grid">
          {filteredSalsas.map(salsa => (
            <InsumoCard
              key={salsa.id}
              insumo={salsa}
              selected={selectedSalsas.some(i => i.id === salsa.id)}
              onToggle={() => toggleSalsa(salsa)}
            />
          ))}
        </div>

        <div className="modal-footer">
          <button className="admin-button gray" onClick={onClose}>Cancelar</button>
          <button className="admin-button pink" onClick={handleAgregar}>
            Agregar ({selectedSalsas.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarSalsasModal;
