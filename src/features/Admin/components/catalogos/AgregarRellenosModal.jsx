import React, { useState } from 'react';
import InsumoCard from '../InsumoCard';
// Asegúrate de que adminStyles.css esté importado en este archivo o en un nivel superior
// import '../adminStyles.css';


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
    <div className="modal-overlay"> {/* Clase existente, coincide */}
      <div className="insumos-modal"> {/* Reemplazado de modal-content compras-modal */}
        <div className="insumos-modal-header"> {/* Reemplazado de modal-header */}
          <h2>Seleccionar Rellenos</h2>
          <button onClick={onClose} className="insumos-close-btn">&times;</button> {/* Reemplazado de close-btn */}
        </div>

        <div className="insumos-search-bar"> {/* Reemplazado de search-bar */}
          <input
            type="text"
            placeholder="Buscar relleno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="insumos-grid"> {/* Clase existente, coincide */}
          {filteredRellenos.map(relleno => (
            <InsumoCard
              key={relleno.id}
              insumo={relleno}
              selected={selectedRellenos.some(i => i.id === relleno.id)}
              onToggle={() => toggleRelleno(relleno)}
            />
          ))}
        </div>

        <div className="insumos-footer"> {/* Reemplazado de modal-footer */}
          <button className="insumos-btn cancel" onClick={onClose}>Cancelar</button> {/* Reemplazado de admin-button gray */}
          <button className="insumos-btn pink" onClick={handleAgregar}> {/* Reemplazado de admin-button pink */}
            Agregar ({selectedRellenos.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarRellenosModal;
