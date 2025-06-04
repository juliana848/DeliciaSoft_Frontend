import React, { useState } from 'react';
import InsumoCard from '../InsumoCard';


const AgregarAdicionesModal = ({ onClose, onAgregar }) => {
  const [selectedAdiciones, setSelectedAdiciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const adicionesData = [
    { id: 201, nombre: 'Tocineta', unidad: 'g', precio: 8.00, imagen: 'tocineta.jpg' },
    { id: 202, nombre: 'Queso extra', unidad: 'g', precio: 7.50, imagen: 'queso.jpg' },
    { id: 203, nombre: 'Maíz', unidad: 'g', precio: 4.25, imagen: 'maiz.jpg' },
  ];

  const filteredAdiciones = adicionesData.filter(adicion =>
    adicion.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAdicion = (adicion) => {
    setSelectedAdiciones(prev =>
      prev.some(i => i.id === adicion.id)
        ? prev.filter(i => i.id !== adicion.id)
        : [...prev, { ...adicion, cantidad: 1 }]
    );
  };

  const handleAgregar = () => {
    onAgregar(selectedAdiciones);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content compras-modal">
        <div className="modal-header">
          <h2>Seleccionar Adiciones</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar adición..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="insumos-grid">
          {filteredAdiciones.map(adicion => (
            <InsumoCard
              key={adicion.id}
              insumo={adicion}
              selected={selectedAdiciones.some(i => i.id === adicion.id)}
              onToggle={() => toggleAdicion(adicion)}
            />
          ))}
        </div>

        <div className="modal-footer">
          <button className="admin-button gray" onClick={onClose}>Cancelar</button>
          <button className="admin-button pink" onClick={handleAgregar}>
            Agregar ({selectedAdiciones.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarAdicionesModal;
