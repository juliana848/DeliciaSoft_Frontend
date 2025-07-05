import React, { useState } from 'react';
// Assuming InsumoCard is a similar component to AdicionCard, adjust if needed
import InsumoCard from './InsumoCard'; 

const AgregarInsumosModal = ({ onClose, onAgregar }) => {
  const [selectedInsumos, setSelectedInsumos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const insumosData = [
    {
      id: 2323232,
      nombre: 'Crema de leche',
      unidad: 'L',
      precio: 25.50,
      category: 'Lácteos', // Changed to 'category' for consistency
      imagen: 'https://alqueria.com.co/sites/default/files/styles/200x274/public/2022-12/dummie-Crema-de-leche-Alqueria-180g.png?h=f214ce63&itok=H2mVvO_G'
    },
    {
      id: 2323231,
      nombre: 'Arroz',
      unidad: 'Kg',
      precio: 12.00,
      category: 'Cereales',
      imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4ALtheyuV01b9_za2ouNGHTbL1XlJsQA85Q&s'
    },
    {
      id: 2323233,
      nombre: 'Harina de trigo',
      unidad: 'Kg',
      precio: 15.75,
      category: 'Harinas',
      imagen: 'https://olimpica.vtexassets.com/arquivos/ids/617052/7701008629240.jpg?v=637626523850430000'
    },
    {
      id: 2323234,
      nombre: 'Fresas',
      unidad: 'Kg',
      precio: 18.00,
      category: 'Frutas',
      imagen: 'https://upload.wikimedia.org/wikipedia/commons/2/29/PerfectStrawberry.jpg'
    },
    // {
    //   id: 2323235,
    //   nombre: 'Leche entera',
    //   unidad: 'L',
    //   precio: 22.00,
    //   category: 'Lácteos',
    //   imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJVhI6leNnj0FWig5Z4uPFhq-lZafYWFkfYQ&s'
    // }
  ];

  const categoriasData = ['Todos', ...new Set(insumosData.map(i => i.category))]; // Changed to 'category' for consistency

  const filteredInsumos = insumosData.filter(insumo =>
    insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'Todos' || insumo.category === selectedCategory) // Changed to 'category' for consistency
  );

  const toggleInsumo = (insumo) => {
    setSelectedInsumos(prev =>
      prev.some(i => i.id === insumo.id)
        ? prev.filter(i => i.id !== insumo.id)
        : [...prev, { ...insumo, cantidad: 1 }]
    );
  };

  const handleAgregar = () => {
    onAgregar(selectedInsumos);
    onClose();
  };

  return (
    <div className="adicion-modal-overlay"> {/* Reused class */}
      <div className="adicion-modal-container"> {/* Reused class */}
        <style>{`
          .adicion-modal-overlay {
            background-color: rgba(0, 0, 0, 0.4);
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999;
          }

          .adicion-modal-container {
            background: #fff0f5;
            border-radius: 20px;
            padding: 25px;
            width: 90%;
            max-width: 800px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            animation: fadeIn 0.3s ease-in-out;
          }

          .adicion-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }

          .adicion-modal-close-btn {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #d63384;
          }

          .adicion-modal-search-container {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            position: relative;
          }

          .adicion-modal-search-container input {
            flex-grow: 1;
            padding: 10px;
            border-radius: 10px;
            border: 2px solid #ffb6c1;
            font-size: 16px;
          }

          .adicion-modal-filter-btn {
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

          .adicion-modal-filter-btn:hover {
            background-color: #d63384;
          }

          .adicion-modal-categories-dropdown {
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

          .adicion-modal-category-btn {
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

          .adicion-modal-category-btn.selected {
            background-color: #ff69b4;
            color: white;
          }

          .adicion-modal-category-btn:hover:not(.selected) {
            background-color: #ffb6c1;
          }

          .adicion-modal-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }

          .adicion-modal-card { /* Reused class */
            background: #fff;
            border-radius: 16px;
            padding: 10px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: transform 0.2s;
            cursor: pointer;
            border: 3px solid transparent;
          }

          .adicion-modal-card:hover { /* Reused class */
            transform: translateY(-4px);
            border-color: #ff69b4;
          }

          .adicion-modal-card-selected { /* Reused class */
            border-color: #d63384;
            background: #ffe4ec;
          }

          .adicion-modal-card img { /* Reused class */
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 8px;
          }

          .adicion-modal-card h4 { /* Reused class */
            font-size: 16px;
            color: #d63384;
            margin: 0;
          }

          .adicion-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }

          .adicion-modal-btn {
            padding: 10px 18px;
            border: none;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
          }

          .adicion-modal-btn-cancel {
            background-color: #f8d7da;
            color: #721c24;
          }

          .adicion-modal-btn-add {
            background-color: #ff69b4;
            color: white;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="adicion-modal-header">
          <h2>Seleccionar Insumos</h2>
          <button onClick={onClose} className="adicion-modal-close-btn">&times;</button>
        </div>

        <div className="adicion-modal-search-container">
          <input
            type="text"
            placeholder="Buscar insumo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="adicion-modal-filter-btn"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            Categorías
            {showCategoryDropdown ? ' ▲' : ' ▼'}
          </button>
          {showCategoryDropdown && (
            <div className="adicion-modal-categories-dropdown">
              {categoriasData.map(category => (
                <button
                  key={category}
                  className={`adicion-modal-category-btn ${selectedCategory === category ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowCategoryDropdown(false);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="adicion-modal-grid">
          {filteredInsumos.map(insumo => (
            <InsumoCard
              key={insumo.id}
              insumo={insumo}
              selected={selectedInsumos.some(i => i.id === insumo.id)}
              onToggle={() => toggleInsumo(insumo)}
            />
          ))}
        </div>

        <div className="adicion-modal-footer">
          <button className="adicion-modal-btn adicion-modal-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="adicion-modal-btn adicion-modal-btn-add" onClick={handleAgregar}>
            Agregar ({selectedInsumos.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarInsumosModal;