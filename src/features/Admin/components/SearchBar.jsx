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
            <i 
                className="fas fa-search" 
                style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#e91e63',
                    fontSize: '12px',
                    pointerEvents: 'none'
                }}
            ></i>
        </div>
    );
};

export default SearchBar;