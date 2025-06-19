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

  const salsasData = [
 {
    id: 601,
    nombre: 'Salsa de chocolate',
    unidad: 'ml',
    precio: 0.00,
    imagen: 'https://i.ytimg.com/vi/GeEQmg3S0hE/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLC91Ih-VqEsWH2Pi5R1qAjAaSytaA'
  },
  {
    id: 602,
    nombre: 'Salsa de fresa',
    unidad: 'ml',
    precio: 0.00,
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVT8vaCx4lA7Qf9XFLhQQZSxBmGnyZXs3shQ&s'
  },
  {
    id: 603,
    nombre: 'Caramelo líquido',
    unidad: 'ml',
    precio: 0.00,
    imagen: 'https://www.infobae.com/new-resizer/YONmsTYkM3W9btYcQ0Nym1YilLk=/arc-anglerfish-arc2-prod-infobae/public/VMZ5SC5UCJDZVHXFQBV3RIXCEU.jpg'
  },
];

  const filteredSalsas = salsasData.filter(salsa =>
    salsa.nombre.toLowerCase().includes(searchTerm.toLowerCase())
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
            background: #fffef5;
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
            color: #d35400;
          }

          .salsa-modal-search input {
            width: 100%;
            padding: 10px;
            border-radius: 10px;
            border: 2px solid #ffe0b2;
            font-size: 16px;
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
            border-color: #f39c12;
          }

          .salsa-modal-card-selected {
            border-color: #e67e22;
            background: #fff6e0;
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
            color: #d35400;
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
            background-color: #f8d7da;
            color: #721c24;
          }

          .salsa-modal-btn-add {
            background-color: #f39c12;
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

        <div className="salsa-modal-search">
          <input
            type="text"
            placeholder="Buscar salsa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
