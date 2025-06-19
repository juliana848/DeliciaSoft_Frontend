import React, { useState } from 'react';

const AdicionCard = ({ adicion, selected, onToggle }) => {
  return (
    <div
      className={`adicion-modal-card ${selected ? 'adicion-modal-card-selected' : ''}`}
      onClick={onToggle}
    >
      <img src={adicion.imagen} alt={adicion.nombre} />
      <h4>{adicion.nombre}</h4>
      <p>{`$${adicion.precio.toFixed(2)} / ${adicion.unidad}`}</p>
    </div>
  );
};

const AgregarAdicionesModal = ({ onClose, onAgregar }) => {
  const [selectedAdiciones, setSelectedAdiciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const adicionesData = [
{
  id: 307,
  nombre: 'Mini malvaviscos',
  unidad: 'g',
  precio: 5.20,
  imagen: 'https://media.istockphoto.com/id/628530120/es/foto/fondo-de-mini-malvaviscos-rosas-y-blancos.jpg?s=612x612&w=0&k=20&c=w-ZmM7gE9Jegs9uBnit5FMiU9HEhptX-8LYMhm3glJg='
},
{
  id: 308,
  nombre: 'Chocolatina rallada',
  unidad: 'g',
  precio: 6.00,
  imagen: 'https://thumbs.dreamstime.com/b/piel-de-chocolate-rallado-en-blanco-pila-bloques-sobre-fondo-151707432.jpg'
},
{
  id: 309,
  nombre: 'Frambuesas frescas',
  unidad: 'unidad',
  precio: 7.50,
  imagen: 'https://editorial.aristeguinoticias.com/wp-content/uploads/2024/03/enfermedades-frambuesa-232024.jpg'
},
{
  id: 310,
  nombre: 'Rodajas de fresa',
  unidad: 'unidad',
  precio: 6.25,
  imagen: 'https://st3.depositphotos.com/15352324/33625/i/450/depositphotos_336259748-stock-photo-strawberry-slices-fresh-berries-macro.jpg'
},
{
  id: 311,
  nombre: 'Galletas oreo',
  unidad: 'g',
  precio: 3.95,
  imagen: 'https://www.pediatriamildias.com/wp-content/uploads/2022/09/Blog53.jpg'
},


  ];

  const filteredAdiciones = adicionesData.filter(adicion =>
    adicion.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAdicion = (adicion) => {
    setSelectedAdiciones(prev =>
      prev.some(i => i.id === adicion.id)
        ? prev.filter(i => i.id !== adicion.id)
        : [...prev, { ...adicion, cantidad: 1 }]
    );
  };

  const handleAgregar = () => {
    onAgregar(selectedAdiciones);
    onClose();
  };

  return (
    <div className="adicion-modal-overlay">
      <div className="adicion-modal-container">
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

          .adicion-modal-search input {
            width: 100%;
            padding: 10px;
            border-radius: 10px;
            border: 2px solid #ffb6c1;
            font-size: 16px;
          }

          .adicion-modal-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }

          .adicion-modal-card {
            background: #fff;
            border-radius: 16px;
            padding: 10px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: transform 0.2s;
            cursor: pointer;
            border: 3px solid transparent;
          }

          .adicion-modal-card:hover {
            transform: translateY(-4px);
            border-color: #ff69b4;
          }

          .adicion-modal-card-selected {
            border-color: #d63384;
            background: #ffe4ec;
          }

          .adicion-modal-card img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 8px;
          }

          .adicion-modal-card h4 {
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
          <h2>Seleccionar Adiciones</h2>
          <button onClick={onClose} className="adicion-modal-close-btn">&times;</button>
        </div>

        <div className="adicion-modal-search">
          <input
            type="text"
            placeholder="Buscar adición..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="adicion-modal-grid">
          {filteredAdiciones.map(adicion => (
            <AdicionCard
              key={adicion.id}
              adicion={adicion}
              selected={selectedAdiciones.some(i => i.id === adicion.id)}
              onToggle={() => toggleAdicion(adicion)}
            />
          ))}
        </div>

        <div className="adicion-modal-footer">
          <button className="adicion-modal-btn adicion-modal-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="adicion-modal-btn adicion-modal-btn-add" onClick={handleAgregar}>
            Agregar ({selectedAdiciones.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarAdicionesModal;
