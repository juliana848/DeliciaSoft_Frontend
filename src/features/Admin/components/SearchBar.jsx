// src/components/SearchBar.jsx
import React from 'react';
import '../adminStyles.css'; 

const SearchBar = ({ placeholder, value, onChange }) => {
return (
    <div className="search-bar">
    <input
        type="text"
        placeholder={placeholder || "Buscar..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
    />
    </div>
);
};

export default SearchBar;
