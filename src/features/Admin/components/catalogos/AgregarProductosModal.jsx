// AgregarProductosModal.jsx - Actualizado para consumir API de productos
import React, { useState, useEffect } from 'react';
import productoApiService from '../../services/productos_services';

const ProductoCard = ({ producto, selected, onToggle }) => {
  return (
    <div
      className={`producto-modal-card ${selected ? 'producto-modal-card-selected' : ''}`}
      onClick={onToggle}
    >
      <img 
        src={producto.imagen || 'https://via.placeholder.com/100x100?text=Sin+Imagen'} 
        alt={producto.nombre}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/100x100?text=Sin+Imagen';
        }}
      />
      <h4>{producto.nombre}</h4>
      <p>${producto.precio.toLocaleString('es-CO')} / Unidad</p>
      {producto.cantidad !== undefined && (
        <small>Stock: {producto.cantidad}</small>
      )}
    </div>
  );
};

const AgregarProductosModal = ({ onClose, onAgregar }) => {
  const [selectedProductos, setSelectedProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // Estados para la API
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState(['Todos']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Cargando productos desde API...');
      const productosData = await productoApiService.obtenerProductos();
      console.log('Productos cargados:', productosData);
      
      // Filtrar solo productos activos
      const productosActivos = productosData.filter(producto => producto.estado === true);
      
      setProductos(productosActivos);
      
      // Extraer categorías únicas
      const categoriasUnicas = [...new Set(productosActivos.map(p => p.categoria).filter(cat => cat && cat !== 'Sin categoría'))];
      setCategorias(['Todos', ...categoriasUnicas]);
      
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError('Error al cargar productos. Usando datos de ejemplo.');
      
      // Productos de fallback en caso de error
      const productosFallback = [
        {
          id: 401,
          nombre: 'Cupcake de vainilla',
          precio: 4000,
          imagen: 'https://tartademanzanacasera.com/wp-content/uploads/2016/08/dsc09806.jpg?w=640',
          categoria: 'Cupcakes',
          cantidad: 10,
          estado: true
        },
        {
          id: 402,
          nombre: 'Brownie de chocolate',
          precio: 5500,
          imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEYDXeu4DuVeL_YVd83AojeR2MsHX2HUHvKA&s',
          categoria: 'Brownies',
          cantidad: 8,
          estado: true
        },
        {
          id: 404,
          nombre: 'Donut glaseada',
          precio: 3750,
          imagen: 'https://www.gourmet.cl/wp-content/uploads/2014/06/donuts.jpg',
          categoria: 'Donuts',
          cantidad: 15,
          estado: true
        },
        {
          id: 405,
          nombre: 'Galleta con chispas',
          precio: 2500,
          imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG1noJhDelkKB0X8LtMPJs5WMZIm6RtcJ-Eg&s',
          categoria: 'Galletas',
          cantidad: 20,
          estado: true
        },
        {
          id: 406,
          nombre: 'Pastel de limón',
          precio: 6250,
          imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvhOdEL5AmZteVbscGI-tJa7FH6akomOSIKw&s',
          categoria: 'Pasteles',
          cantidad: 5,
          estado: true
        },
        {
          id: 407,
          nombre: 'Muffin de arándanos',
          precio: 4250,
          imagen: 'https://osojimix.com/wp-content/uploads/2021/04/MUFFINS-DE-ARANDANOS.jpg',
          categoria: 'Muffins',
          cantidad: 12,
          estado: true
        }
      ];
      
      setProductos(productosFallback);
      setCategorias(['Todos', 'Cupcakes', 'Brownies', 'Donuts', 'Galletas', 'Pasteles', 'Muffins']);
    } finally {
      setLoading(false);
    }
  };

  const filteredProductos = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'Todos' || p.categoria === selectedCategory)
  );

  const toggleProducto = (producto) => {
    setSelectedProductos(prev =>
      prev.some(p => p.id === producto.id)
        ? prev.filter(p => p.id !== producto.id)
        : [...prev, { ...producto, cantidad: 1 }]
    );
  };

  const handleAgregar = () => {
    if (selectedProductos.length === 0) {
      alert('Por favor selecciona al menos un producto');
      return;
    }
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
            background: #fff0f5;
            border-radius: 20px;
            padding: 25px;
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
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
            color: #d63384;
          }

          .producto-modal-search-container {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            position: relative;
          }

          .producto-modal-search-container input {
            flex-grow: 1;
            padding: 10px;
            border-radius: 10px;
            border: 2px solid #ffb6c1;
            font-size: 16px;
          }

          .producto-modal-filter-btn {
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

          .producto-modal-filter-btn:hover {
            background-color: #d63384;
          }

          .producto-modal-categories-dropdown {
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

          .producto-modal-category-btn {
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

          .producto-modal-category-btn.selected {
            background-color: #ff69b4;
            color: white;
          }

          .producto-modal-category-btn:hover:not(.selected) {
            background-color: #ffb6c1;
          }

          .producto-modal-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 20px;
            margin: 20px 0;
            min-height: 200px;
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
            border-color: #ff69b4;
          }

          .producto-modal-card-selected {
            border-color: #d63384;
            background: #ffe4ec;
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
            color: #d63384;
            margin: 0;
          }

          .producto-modal-card small {
            color: #666;
            font-size: 12px;
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
            background-color: #ff69b4;
            color: white;
          }

          .producto-modal-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 200px;
            flex-direction: column;
            gap: 10px;
          }

          .loading-spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #ff69b4;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 2s linear infinite;
          }

          .error-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 200px;
            flex-direction: column;
            gap: 10px;
            color: #d63384;
          }

          .error-container button {
            background-color: #ff69b4;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

        <div className="producto-modal-header">
          <h2>Seleccionar Productos</h2>
          <button onClick={onClose} className="producto-modal-close-btn">&times;</button>
        </div>

        <div className="producto-modal-search-container">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
          <button
            className="producto-modal-filter-btn"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            disabled={loading}
          >
            Categorías
            {showCategoryDropdown ? ' ▲' : ' ▼'}
          </button>
          {showCategoryDropdown && (
            <div className="producto-modal-categories-dropdown">
              {categorias.map(category => (
                <button
                  key={category}
                  className={`producto-modal-category-btn ${selectedCategory === category ? 'selected' : ''}`}
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

        <div className="producto-modal-grid">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando productos...</p>
            </div>
          ) : error && productos.length === 0 ? (
            <div className="error-container">
              <p>{error}</p>
              <button onClick={fetchProductos}>Reintentar</button>
            </div>
          ) : filteredProductos.length === 0 ? (
            <div className="error-container">
              <p>No se encontraron productos</p>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')}>Limpiar búsqueda</button>
              )}
            </div>
          ) : (
            filteredProductos.map(producto => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                selected={selectedProductos.some(p => p.id === producto.id)}
                onToggle={() => toggleProducto(producto)}
              />
            ))
          )}
        </div>

        <div className="producto-modal-footer">
          <button className="producto-modal-btn producto-modal-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="producto-modal-btn producto-modal-btn-add" 
            onClick={handleAgregar}
            disabled={selectedProductos.length === 0 || loading}
          >
            Agregar ({selectedProductos.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarProductosModal;