// src/pages/categorias/SearchableInput.jsx

import React from 'react';
// import './SearchableInput.css';

const SearchableInput = ({ 
  value, 
  onChange, 
  sugerencias = [], 
  placeholder = '', 
  error = false, 
  disabled = false 
}) => {
  return (
    <>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`modal-input searchable-input-custom ${error ? 'error' : ''}`}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
    </>
  );
};

export default SearchableInput;