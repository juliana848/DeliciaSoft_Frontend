import React, { useState } from 'react';

const ProductoCard = ({ producto, selected, onToggle }) => {
  return (
    <div
      className={`producto-modal-card ${selected ? 'producto-modal-card-selected' : ''}`}
      onClick={onToggle}
    >
      <img src={producto.imagen} alt={producto.nombre} />
      <h4>{producto.nombre}</h4>
      <p>{`$${producto.precio.toFixed(2)} / ${producto.unidad}`}</p>
    </div>
  );
};

const AgregarProductosModal = ({ onClose, onAgregar }) => {
  const [selectedProductos, setSelectedProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const productosData = [
  {
    id: 401,
    nombre: 'Cupcake de vainilla',
    unidad: 'Unidad',
    precio: 4.00,
    imagen: 'https://tartademanzanacasera.com/wp-content/uploads/2016/08/dsc09806.jpg?w=640'
  },
  {
    id: 402,
    nombre: 'Brownie de chocolate',
    unidad: 'Unidad',
    precio: 5.50,
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEYDXeu4DuVeL_YVd83AojeR2MsHX2HUHvKA&s'
  },
  {
    id: 404,
    nombre: 'Donut glaseada',
    unidad: 'Unidad',
    precio: 3.75,
    imagen: 'https://www.gourmet.cl/wp-content/uploads/2014/06/donuts.jpg'
  },
  {
    id: 405,
    nombre: 'Galleta con chispas',
    unidad: 'Unidad',
    precio: 2.50,
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG1noJhDelkKB0X8LtMPJs5WMZIm6RtcJ-Eg&s'
  },
  {
    id: 406,
    nombre: 'pastel de limón',
    unidad: 'Porción',
    precio: 6.25,
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvhOdEL5AmZteVbscGI-tJa7FH6akomOSIKw&s'
  },
  {
    id: 407,
    nombre: 'Muffin de arándanos',
    unidad: 'Unidad',
    precio: 4.25,
    imagen: 'https://osojimix.com/wp-content/uploads/2021/04/MUFFINS-DE-ARANDANOS.jpg'
  },
  ];

  const filteredProductos = productosData.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleProducto = (producto) => {
    setSelectedProductos(prev =>
      prev.some(p => p.id === producto.id)
        ? prev.filter(p => p.id !== producto.id)
        : [...prev, { ...producto, cantidad: 1 }]
    );
  };

  const handleAgregar = () => {
    onAgregar(selectedProductos);
    onClose();
  };

  return (
    <div className="producto-modal-overlay">
      <div className="producto-modal-container">
        <style>{`
          .producto-modal-overlay {
            background-color: rgba(0, 0, 0, 0.4);
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999;
          }

          .producto-modal-container {
            background: #fffaf0;
            border-radius: 20px;
            padding: 25px;
            width: 90%;
            max-width: 800px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            animation: fadeIn 0.3s ease-in-out;
          }

          .producto-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }

          .producto-modal-close-btn {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #c0392b;
          }

          .producto-modal-search input {
            width: 100%;
            padding: 10px;
            border-radius: 10px;
            border: 2px solid #f5c6cb;
            font-size: 16px;
          }

          .producto-modal-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }

          .producto-modal-card {
            background: #fff;
            border-radius: 16px;
            padding: 10px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: transform 0.2s;
            cursor: pointer;
            border: 3px solid transparent;
          }

          .producto-modal-card:hover {
            transform: translateY(-4px);
            border-color: #ffb347;
          }

          .producto-modal-card-selected {
            border-color: #ffa07a;
            background: #fff0e6;
          }

          .producto-modal-card img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 8px;
          }

          .producto-modal-card h4 {
            font-size: 16px;
            color: #d35400;
            margin: 0;
          }

          .producto-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }

          .producto-modal-btn {
            padding: 10px 18px;
            border: none;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
          }

          .producto-modal-btn-cancel {
            background-color: #f8d7da;
            color: #721c24;
          }

          .producto-modal-btn-add {
            background-color: #ffa07a;
            color: white;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="producto-modal-header">
          <h2>Seleccionar Productos</h2>
          <button onClick={onClose} className="producto-modal-close-btn">&times;</button>
        </div>

        <div className="producto-modal-search">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="producto-modal-grid">
          {filteredProductos.map(producto => (
            <ProductoCard
              key={producto.id}
              producto={producto}
              selected={selectedProductos.some(p => p.id === producto.id)}
              onToggle={() => toggleProducto(producto)}
            />
          ))}
        </div>

        <div className="producto-modal-footer">
          <button className="producto-modal-btn producto-modal-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="producto-modal-btn producto-modal-btn-add" onClick={handleAgregar}>
            Agregar ({selectedProductos.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarProductosModal;
