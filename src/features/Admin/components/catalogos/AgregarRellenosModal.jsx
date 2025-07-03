// AgregarRellenosModal.jsx
import React, { useState } from 'react';

const RellenoCard = ({ relleno, selected, onToggle }) => {
  return (
    <div
      className={`relleno-modal-card ${selected ? 'relleno-modal-card-selected' : ''}`}
      onClick={onToggle}
    >
      <img src={relleno.imagen} alt={relleno.nombre} />
      <h4>{relleno.nombre}</h4>
      <p>{`${relleno.unidad} - $${relleno.precio.toFixed(2)}`}</p>
    </div>
  );
};

const AgregarRellenosModal = ({ onClose, onAgregar }) => {
  const [selectedRellenos, setSelectedRellenos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false); // New state for dropdown visibility

  const rellenosData = [
  {
    id: 501,
    nombre: 'Crema pastelera',
    unidad: 'g',
    precio: 6.00,
    imagen: 'https://cdn.pixabay.com/photo/2022/05/27/09/22/pastry-cream-7225199_1280.jpg',
    category: 'Cremas'
  },
  {
    id: 502,
    nombre: 'Dulce de leche',
    unidad: 'g',
    precio: 5.50,
    imagen: 'https://cdn.pixabay.com/photo/2021/11/10/18/10/dulce-de-leche-6783187_1280.jpg',
    category: 'Dulces'
  },
  {
    id: 503,
    nombre: 'Nutella',
    unidad: 'g',
    precio: 8.00,
    imagen: 'https://cdn.pixabay.com/photo/2017/03/19/13/30/nutella-2154376_1280.jpg',
    category: 'Dulces'
  },
  {
    id: 504,
    nombre: 'Arequipe',
    unidad: 'g',
    precio: 5.25,
    imagen: 'https://cdn.pixabay.com/photo/2021/03/22/04/44/dulce-de-leche-6112026_1280.jpg',
    category: 'Dulces'
  },
  {
    id: 505,
    nombre: 'Mermelada de fresa',
    unidad: 'g',
    precio: 4.50,
    imagen: 'https://cdn.pixabay.com/photo/2017/01/20/00/30/strawberry-jam-1990177_1280.jpg',
    category: 'Mermeladas'
  },
];

  const categoriasData = [
    'Todos', 'Cremas', 'Dulces', 'Mermeladas'
  ];

  const filteredRellenos = rellenosData.filter(relleno =>
    relleno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'Todos' || relleno.category === selectedCategory)
  );

  const toggleRelleno = (relleno) => {
    setSelectedRellenos(prev =>
      prev.some(i => i.id === relleno.id)
        ? prev.filter(i => i.id !== relleno.id)
        : [...prev, { ...relleno, cantidad: 1 }]
    );
  };

  const handleAgregar = () => {
    onAgregar(selectedRellenos);
    onClose();
  };

  return (
    <div className="relleno-modal-overlay">
      <div className="relleno-modal-container">
        <style>{`
          .relleno-modal-overlay {
            background-color: rgba(0, 0, 0, 0.4);
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999;
          }

          .relleno-modal-container {
            background: #fff0f5; /* Adiciones background */
            border-radius: 20px;
            padding: 25px;
            width: 90%;
            max-width: 800px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            animation: fadeIn 0.3s ease-in-out;
          }

          .relleno-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }

          .relleno-modal-close-btn {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #d63384; /* Adiciones close button color */
          }

          .relleno-modal-search-container { /* New class for search and filter */
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            position: relative;
          }

          .relleno-modal-search-container input {
            flex-grow: 1; /* Allows input to take available space */
            padding: 10px;
            border-radius: 10px;
            border: 2px solid #ffb6c1; /* Adiciones border color */
            font-size: 16px;
          }

          .relleno-modal-filter-btn { /* New button style */
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

          .relleno-modal-filter-btn:hover {
            background-color: #d63384;
          }

          .relleno-modal-categories-dropdown { /* New dropdown style */
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

          .relleno-modal-category-btn {
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

          .relleno-modal-category-btn.selected {
            background-color: #ff69b4;
            color: white;
          }

          .relleno-modal-category-btn:hover:not(.selected) {
            background-color: #ffb6c1;
          }

          .relleno-modal-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }

          .relleno-modal-card {
            background: #fff;
            border-radius: 16px;
            padding: 10px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: transform 0.2s;
            cursor: pointer;
            border: 3px solid transparent;
          }

          .relleno-modal-card:hover {
            transform: translateY(-4px);
            border-color: #ff69b4; /* Adiciones hover border */
          }

          .relleno-modal-card-selected {
            border-color: #d63384; /* Adiciones selected border */
            background: #ffe4ec; /* Adiciones selected background */
          }

          .relleno-modal-card img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 8px;
          }

          .relleno-modal-card h4 {
            font-size: 16px;
            color: #d63384; /* Adiciones h4 color */
            margin: 0;
          }

          .relleno-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }

          .relleno-modal-btn {
            padding: 10px 18px;
            border: none;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
          }

          .relleno-modal-btn-cancel {
            background-color: #f8d7da; /* Adiciones cancel button background */
            color: #721c24; /* Adiciones cancel button color */
          }

          .relleno-modal-btn-add {
            background-color: #ff69b4; /* Adiciones add button background */
            color: white;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="relleno-modal-header">
          <h2>Seleccionar Rellenos</h2>
          <button onClick={onClose} className="relleno-modal-close-btn">&times;</button>
        </div>

        <div className="relleno-modal-search-container"> {/* Updated class */}
          <input
            type="text"
            placeholder="Buscar relleno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="relleno-modal-filter-btn"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            Categorías
            {showCategoryDropdown ? ' ▲' : ' ▼'}
          </button>
          {showCategoryDropdown && (
            <div className="relleno-modal-categories-dropdown">
              {categoriasData.map(category => (
                <button
                  key={category}
                  className={`relleno-modal-category-btn ${selectedCategory === category ? 'selected' : ''}`}
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

        <div className="relleno-modal-grid">
          {filteredRellenos.map(relleno => (
            <RellenoCard
              key={relleno.id}
              relleno={relleno}
              selected={selectedRellenos.some(i => i.id === relleno.id)}
              onToggle={() => toggleRelleno(relleno)}
            />
          ))}
        </div>

        <div className="relleno-modal-footer">
          <button className="relleno-modal-btn relleno-modal-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="relleno-modal-btn relleno-modal-btn-add" onClick={handleAgregar}>
            Agregar ({selectedRellenos.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarRellenosModal;