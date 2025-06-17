// src/features/Cartas/pages/Buscador.jsx
import React from 'react';

function Buscador({ value, onChange }) {
  return (
    <div className="buscador-carta">
      <input
        type="text"
        placeholder="Buscar..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <h2>CARTA</h2>
    </div>
  );
}

export default Buscador;
