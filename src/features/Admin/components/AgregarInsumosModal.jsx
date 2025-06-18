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
      imagen: 'https://alqueria.com.co/sites/default/files/styles/200x274/public/2022-12/dummie-Crema-de-leche-Alqueria-180g.png?h=f214ce63&itok=H2mVvO_G'
    },
    {
      id: 2323231,
      nombre: 'Arroz',
      unidad: 'Kg',
      precio: 12.00,
      imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4ALtheyuV01b9_za2ouNGHTbL1XlJsQA85Q&s'
    },
    {
      id: 2323233,
      nombre: 'Harina de trigo',
      unidad: 'Kg',
      precio: 15.75,
      imagen: 'https://olimpica.vtexassets.com/arquivos/ids/617052/7701008629240.jpg?v=637626523850430000'
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
