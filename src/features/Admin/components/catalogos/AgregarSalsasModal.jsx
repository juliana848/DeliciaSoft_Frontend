// AgregarSalsasModal.jsx
import React, { useState } from 'react';

const SalsaCard = ({ salsa, selected, onToggle }) => {
  return (
    <div
      className={`salsa-modal-card ${selected ? 'salsa-modal-card-selected' : ''}`}
      onClick={onToggle}
    >
      <img src={salsa.imagen} alt={salsa.nombre} />
      <h4>{salsa.nombre}</h4>
      <p>{`${salsa.unidad} - $${salsa.precio.toFixed(2)}`}</p>
    </div>
  );
};

const AgregarSalsasModal = ({ onClose, onAgregar }) => {
  const [selectedSalsas, setSelectedSalsas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false); // New state for dropdown visibility

  const salsasData = [
 {
    id: 601,
    nombre: 'Salsa de chocolate',
    unidad: 'ml',
    precio: 0,
    imagen: 'https://i.ytimg.com/vi/GeEQmg3S0hE/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLC91Ih-VqEsWH2Pi5R1qAjAaSytaA',
    category: 'Chocolate'
  },
  {
    id: 602,
    nombre: 'Salsa de fresa',
    unidad: 'ml',
    precio: 0,
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVT8vaCx4lA7Qf9XFLhQQZSxBmGnyZXs3shQ&s',
    category: 'Fresa'
  },
  {
    id: 603,
    nombre: 'Caramelo líquido',
    unidad: 'ml',
    precio: 0,
    imagen: 'https://www.infobae.com/new-resizer/YONmsTYkM3W9btYcQ0Nym1YilLk=/arc-anglerfish-arc2-prod-infobae/public/VMZ5SC5UCJDZVHXFQBV3RIXCEU.jpg',
    category: 'Caramelo'
  },
];

  const categoriasData = [
    'Todos', 'Chocolate', 'Fresa', 'Caramelo'
  ];

  const filteredSalsas = salsasData.filter(salsa =>
    salsa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'Todos' || salsa.category === selectedCategory)
  );

  const toggleSalsa = (salsa) => {
    setSelectedSalsas(prev =>
      prev.some(i => i.id === salsa.id)
        ? prev.filter(i => i.id !== salsa.id)
        : [...prev, { ...salsa, cantidad: 1 }]
    );
  };

  const handleAgregar = () => {
    onAgregar(selectedSalsas);
    onClose();
  };

  return (
    <div className="salsa-modal-overlay">
      <div className="salsa-modal-container">
        <style>{`
          .salsa-modal-overlay {
            background-color: rgba(0, 0, 0, 0.4);
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999;
          }

          .salsa-modal-container {
            background: #fff0f5; /* Adiciones background */
            border-radius: 20px;
            padding: 25px;
            width: 90%;
            max-width: 800px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            animation: fadeIn 0.3s ease-in-out;
          }

          .salsa-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }

          .salsa-modal-close-btn {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #d63384; /* Adiciones close button color */
          }

          .salsa-modal-search-container { /* New class for search and filter */
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            position: relative;
          }

          .salsa-modal-search-container input {
            flex-grow: 1; /* Allows input to take available space */
            padding: 10px;
            border-radius: 10px;
            border: 2px solid #ffb6c1; /* Adiciones border color */
            font-size: 16px;
          }

          .salsa-modal-filter-btn { /* New button style */
            padding: 10px 15px;
            border: none;
            border-radius: 10px;
            background-color: #ff69b4;
            color: white;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .salsa-modal-filter-btn:hover {
            background-color: #d63384;
          }

          .salsa-modal-categories-dropdown { /* New dropdown style */
            position: absolute;
            top: 100%;
            right: 0;
            background-color: #ffe4ec;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 1000;
            min-width: 150px;
          }

          .salsa-modal-category-btn {
            padding: 8px 15px;
            border: 1px solid #ff69b4;
            border-radius: 8px;
            background-color: #ffe4ec;
            color: #d63384;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s, color 0.2s;
            text-align: left;
          }

          .salsa-modal-category-btn.selected {
            background-color: #ff69b4;
            color: white;
          }

          .salsa-modal-category-btn:hover:not(.selected) {
            background-color: #ffb6c1;
          }

          .salsa-modal-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }

          .salsa-modal-card {
            background: #fff;
            border-radius: 16px;
            padding: 10px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: transform 0.2s;
            cursor: pointer;
            border: 3px solid transparent;
          }

          .salsa-modal-card:hover {
            transform: translateY(-4px);
            border-color: #ff69b4; /* Adiciones hover border */
          }

          .salsa-modal-card-selected {
            border-color: #d63384; /* Adiciones selected border */
            background: #ffe4ec; /* Adiciones selected background */
          }

          .salsa-modal-card img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 8px;
          }

          .salsa-modal-card h4 {
            font-size: 16px;
            color: #d63384; /* Adiciones h4 color */
            margin: 0;
          }

          .salsa-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }

          .salsa-modal-btn {
            padding: 10px 18px;
            border: none;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
          }

          .salsa-modal-btn-cancel {
            background-color: #f8d7da; /* Adiciones cancel button background */
            color: #721c24; /* Adiciones cancel button color */
          }

          .salsa-modal-btn-add {
            background-color: #ff69b4; /* Adiciones add button background */
            color: white;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="salsa-modal-header">
          <h2>Seleccionar Salsas</h2>
          <button onClick={onClose} className="salsa-modal-close-btn">&times;</button>
        </div>

        <div className="salsa-modal-search-container"> {/* Updated class */}
          <input
            type="text"
            placeholder="Buscar salsa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="salsa-modal-filter-btn"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            Categorías
            {showCategoryDropdown ? ' ▲' : ' ▼'}
          </button>
          {showCategoryDropdown && (
            <div className="salsa-modal-categories-dropdown">
              {categoriasData.map(category => (
                <button
                  key={category}
                  className={`salsa-modal-category-btn ${selectedCategory === category ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowCategoryDropdown(false); // Close dropdown after selection
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="salsa-modal-grid">
          {filteredSalsas.map(salsa => (
            <SalsaCard
              key={salsa.id}
              salsa={salsa}
              selected={selectedSalsas.some(i => i.id === salsa.id)}
              onToggle={() => toggleSalsa(salsa)}
            />
          ))}
        </div>

        <div className="salsa-modal-footer">
          <button className="salsa-modal-btn salsa-modal-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="salsa-modal-btn salsa-modal-btn-add" onClick={handleAgregar}>
            Agregar ({selectedSalsas.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarSalsasModal;