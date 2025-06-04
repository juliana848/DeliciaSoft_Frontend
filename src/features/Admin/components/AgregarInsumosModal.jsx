import React, { useState } from 'react';
import InsumoCard from './InsumoCard';
import '../adminStyles.css'; 

const AgregarInsumosModal = ({ onClose, onAgregar }) => {
  const [selectedInsumos, setSelectedInsumos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const insumosData = [
    {
      id: 2323232,
      nombre: 'Crema de leche',
      unidad: 'L',
      precio: 25.50,
      imagen: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Heavy_cream.jpg'
    },
    {
      id: 2323231,
      nombre: 'Arroz',
      unidad: 'Kg',
      precio: 12.00,
      imagen: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Uncooked_rice_grains.jpg'
    },
    {
      id: 2323233,
      nombre: 'Harina de trigo',
      unidad: 'Kg',
      precio: 15.75,
      imagen: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Wheat_flour_in_a_bowl.jpg'
    }
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
      <div className="insumos-modal">
        <div className="insumos-modal-header">
          <h2>Seleccionar Insumos</h2>
          <button onClick={onClose} className="insumos-close-btn">&times;</button>
        </div>

        <div className="insumos-search-bar">
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

        <div className="insumos-footer">
          <button className="insumos-btn cancel" onClick={onClose}>Cancelar</button>
          <button className="insumos-btn pink" onClick={handleAgregar}>
            Agregar ({selectedInsumos.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarInsumosModal;
