import React, { useState } from 'react';
import InsumoCard from '../InsumoCard';
// Asegúrate de que adminStyles.css esté importado en este archivo o en un nivel superior
// import '../adminStyles.css';


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
    <div className="modal-overlay"> {/* Clase existente, coincide */}
      <div className="insumos-modal"> {/* Reemplazado de modal-content compras-modal */}
        <div className="insumos-modal-header"> {/* Reemplazado de modal-header */}
          <h2>Seleccionar Salsas</h2>
          <button onClick={onClose} className="insumos-close-btn">&times;</button> {/* Reemplazado de close-btn */}
        </div>

        <div className="insumos-search-bar"> {/* Reemplazado de search-bar */}
          <input
            type="text"
            placeholder="Buscar salsa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="insumos-grid"> {/* Clase existente, coincide */}
          {filteredSalsas.map(salsa => (
            <InsumoCard
              key={salsa.id}
              insumo={salsa}
              selected={selectedSalsas.some(i => i.id === salsa.id)}
              onToggle={() => toggleSalsa(salsa)}
            />
          ))}
        </div>

        <div className="insumos-footer"> {/* Reemplazado de modal-footer */}
          <button className="insumos-btn cancel" onClick={onClose}>Cancelar</button> {/* Reemplazado de admin-button gray */}
          <button className="insumos-btn pink" onClick={handleAgregar}> {/* Reemplazado de admin-button pink */}
            Agregar ({selectedSalsas.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarSalsasModal;
