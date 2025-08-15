import React from 'react';

const InsumoCard = ({ insumo, selected, onToggle }) => {

    const formatoCOP = (valor) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    };

    return (
        <div 
          className={`adicion-modal-card ${selected ? 'adicion-modal-card-selected' : ''}`}
          onClick={onToggle}
        >
          <img 
            src={insumo.imagen || 'https://via.placeholder.com/100'} 
            alt={insumo.nombre} 
          />
          <h4>{insumo.nombre}</h4>
          <p>Precio: {formatoCOP(insumo.precio)}</p>
          <p>Cantidad: {insumo.cantidad} {insumo.unidad}</p>
        </div>
    );
};

export default InsumoCard;