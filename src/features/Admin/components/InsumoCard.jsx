import React from 'react';

const InsumoCard = ({ insumo, selected, onToggle }) => {
  return (
    <div 
      className={`insumo-card ${selected ? 'selected' : ''}`}
      onClick={onToggle}
    >
      <div className="insumo-image">
        <img 
          src={insumo.imagen || 'https://via.placeholder.com/100'} 
          alt={insumo.nombre} 
        />
      </div>
      <div className="insumo-info">
        <h4>{insumo.nombre}</h4>
        <p>Unidad: {insumo.unidad}</p>
        <p>Precio: ${insumo.precio.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default InsumoCard;