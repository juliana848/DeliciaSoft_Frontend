// src/pages/categorias/SearchableInput.jsx

import React from 'react';

const SearchableInput = ({ 
  value, 
  onChange, 
  sugerencias = [], 
  placeholder = '', 
  error = false, 
  disabled = false 
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`modal-input ${error ? 'error' : ''}`}
      placeholder={placeholder}
      disabled={disabled}
      list="sugerencias-categorias"
    />
  );
};

export default SearchableInput;