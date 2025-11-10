// src/pages/categorias/components/CategoriaToolbar.jsx

import React from 'react';
import SearchBar from '../../../components/SearchBar';

const CategoriaToolbar = ({ onAgregar, filtro, onFiltroChange, loading }) => {
  return (
    <div className="admin-toolbar">
      <button 
        className="admin-button pink" 
        onClick={onAgregar} 
        type="button"
        disabled={loading}
      >
        {loading ? 'Cargando...' : '+ Agregar'}
      </button>
      
      <SearchBar
        placeholder="Buscar categoría..."
        value={filtro}
        onChange={onFiltroChange}
      />
    </div>
  );
};

export default CategoriaToolbar;