import React, { useState } from 'react';
import InsumoCard from '../InsumoCard';


const AgregarRellenosModal = ({ onClose, onAgregar }) => {
  const [selectedRellenos, setSelectedRellenos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const rellenosData = [
    { id: 301, nombre: 'Pollo desmechado', unidad: 'g', precio: 9.00, imagen: 'pollo.jpg' },
    { id: 302, nombre: 'Carne molida', unidad: 'g', precio: 10.50, imagen: 'carne.jpg' },
    { id: 303, nombre: 'Champiñones', unidad: 'g', precio: 6.75, imagen: 'champi.jpg' },
  ];

  const filteredRellenos = rellenosData.filter(relleno =>
    relleno.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRelleno = (relleno) => {
    setSelectedRellenos(prev =>
      prev.some(i => i.id === relleno.id)
        ? prev.filter(i => i.id !== relleno.id)
        : [...prev, { ...relleno, cantidad: 1 }]
    );
  };

  const handleAgregar = () => {
    onAgregar(selectedRellenos);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content compras-modal">
        <div className="modal-header">
          <h2>Seleccionar Rellenos</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar relleno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="insumos-grid">
          {filteredRellenos.map(relleno => (
            <InsumoCard
              key={relleno.id}
              insumo={relleno}
              selected={selectedRellenos.some(i => i.id === relleno.id)}
              onToggle={() => toggleRelleno(relleno)}
            />
          ))}
        </div>

        <div className="modal-footer">
          <button className="admin-button gray" onClick={onClose}>Cancelar</button>
          <button className="admin-button pink" onClick={handleAgregar}>
            Agregar ({selectedRellenos.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarRellenosModal;
