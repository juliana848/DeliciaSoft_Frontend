// AgregarProductosModal.jsx - CON VALIDACIÓN DE INVENTARIO POR SEDE Y TIPO DE VENTA
import React, { useState, useEffect } from 'react';
import productoApiService from '../../services/productos_services';
import inventarioApiService from '../../services/inventario_services';

const ProductoCard = ({ producto, selected, onToggle, disponible, esPedido }) => {
  const sinStock = !esPedido && disponible === 0;
  
  return (
    <div
      className={`producto-modal-card ${selected ? 'producto-modal-card-selected' : ''} ${sinStock ? 'producto-modal-card-disabled' : ''}`}
      onClick={() => !sinStock && onToggle()}
      style={{ opacity: sinStock ? 0.5 : 1, cursor: sinStock ? 'not-allowed' : 'pointer' }}
    >
      <img 
        src={producto.urlimagen || 'https://via.placeholder.com/100x100?text=Sin+Imagen'} 
        alt={producto.nombre}
        onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=Sin+Imagen'; }}
      />
      <h4>{producto.nombre}</h4>
      <p>${producto.precio.toLocaleString('es-CO')} / Unidad</p>
      {!esPedido && (
        <div style={{ 
          marginTop: '8px', 
          padding: '4px 8px', 
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 'bold',
          backgroundColor: disponible === 0 ? '#ffebee' : disponible < 5 ? '#fff3e0' : '#e8f5e9',
          color: disponible === 0 ? '#c62828' : disponible < 5 ? '#ef6c00' : '#2e7d32'
        }}>
          {disponible === 0 ? 'Sin stock' : `${disponible} disponibles`}
        </div>
      )}
      {esPedido && (
        <div style={{ 
          marginTop: '8px', 
          padding: '4px 8px', 
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 'bold',
          backgroundColor: '#e3f2fd',
          color: '#1976d2'
        }}>
          Para producción
        </div>
      )}
    </div>
  );
};

const AgregarProductosModal = ({ 
  onClose, 
  onAgregar, 
  sedeSeleccionada, 
  tipoVenta,
  insumosSeleccionados = []
}) => {
  const [selectedProductos, setSelectedProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState(['Todos']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inventario, setInventario] = useState([]);

  const esPedido = tipoVenta === 'pedido';

  useEffect(() => {
    fetchProductosConInventario();
  }, [sedeSeleccionada, tipoVenta]);

  const fetchProductosConInventario = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Cargando productos para:', { sede: sedeSeleccionada, tipo: tipoVenta });
      
      // Cargar productos
      const productosData = await productoApiService.obtenerProductos();
      const productosActivos = productosData.filter(producto => producto.estado === true);
      
      // Si es venta directa, cargar inventario de la sede
      if (!esPedido && sedeSeleccionada) {
        const sedeId = sedeSeleccionada === 'San Pablo' ? 1 : 2;
        console.log('Obteniendo inventario de sede ID:', sedeId);
        
        const inventarioData = await inventarioApiService.obtenerInventarioPorSede(sedeId);
        console.log('Inventario obtenido:', inventarioData);
        
        // Formatear inventario
        const inventarioMap = {};
        if (inventarioData.inventarios && Array.isArray(inventarioData.inventarios)) {
          inventarioData.inventarios.forEach(inv => {
            inventarioMap[inv.producto.id] = parseFloat(inv.cantidad);
          });
        }
        
        setInventario(inventarioMap);
        
        // Enriquecer productos con inventario
        const productosConInventario = productosActivos.map(prod => ({
          ...prod,
          disponible: inventarioMap[prod.idproductogeneral || prod.id] || 0
        }));
        
        setProductos(productosConInventario);
      } else {
        // Si es pedido, mostrar todos los productos sin restricción
        const productosParaPedido = productosActivos.map(prod => ({
          ...prod,
          disponible: 999 // Valor alto para pedidos (sin límite)
        }));
        
        setProductos(productosParaPedido);
      }
      
      // Extraer categorías únicas
      const categoriasUnicas = [...new Set(productosActivos.map(p => p.categoria).filter(cat => cat && cat !== 'Sin categoría'))];
      setCategorias(['Todos', ...categoriasUnicas]);
      
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError('Error al cargar productos desde la API');
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const obtenerDisponible = (producto) => {
    if (esPedido) return 999;
    return inventario[producto.idproductogeneral || producto.id] || 0;
  };

  const filteredProductos = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'Todos' || p.categoria === selectedCategory)
  );

  // Separar productos con y sin stock (solo para venta directa)
  const productosConStock = esPedido 
    ? filteredProductos 
    : filteredProductos.filter(p => obtenerDisponible(p) > 0);
  const productosSinStock = esPedido 
    ? [] 
    : filteredProductos.filter(p => obtenerDisponible(p) === 0);
  const productosOrdenados = [...productosConStock, ...productosSinStock];

  const toggleProducto = (producto) => {
    const disponible = obtenerDisponible(producto);
    if (!esPedido && disponible === 0) return;
    
    setSelectedProductos(prev =>
      prev.some(p => p.id === producto.id)
        ? prev.filter(p => p.id !== producto.id)
        : [...prev, { ...producto, cantidad: 1, disponible }]
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
            background-color: rgba(0, 0, 0, 0.5);
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
            max-width: 900px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
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
            max-height: 300px;
            overflow-y: auto;
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

          .inventario-info {
            background: #e3f2fd;
            padding: 10px 15px;
            border-radius: 10px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
          }

          .inventario-info-title {
            font-weight: bold;
            color: #1976d2;
          }

          .producto-modal-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 15px;
            margin: 20px 0;
            min-height: 200px;
          }

          .producto-modal-card {
            background: #fff;
            border-radius: 16px;
            padding: 12px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: all 0.2s;
            cursor: pointer;
            border: 3px solid transparent;
          }

          .producto-modal-card:hover:not(.producto-modal-card-disabled) {
            transform: translateY(-4px);
            border-color: #ff69b4;
            box-shadow: 0 6px 16px rgba(0,0,0,0.15);
          }

          .producto-modal-card-selected {
            border-color: #d63384;
            background: #ffe4ec;
          }

          .producto-modal-card-disabled {
            background: #f5f5f5;
            cursor: not-allowed;
          }

          .producto-modal-card img {
            width: 100%;
            height: 100px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 10px;
          }

          .producto-modal-card h4 {
            font-size: 15px;
            color: #d63384;
            margin: 0 0 8px 0;
            min-height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .producto-modal-card p {
            font-size: 14px;
            font-weight: bold;
            color: #333;
            margin: 4px 0;
          }

          .producto-modal-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
          }

          .selected-count {
            font-size: 14px;
            color: #666;
            font-weight: bold;
          }

          .producto-modal-actions {
            display: flex;
            gap: 10px;
          }

          .producto-modal-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s;
          }

          .producto-modal-btn-cancel {
            background-color: #f8d7da;
            color: #721c24;
          }

          .producto-modal-btn-cancel:hover {
            background-color: #f1b0b7;
          }

          .producto-modal-btn-add {
            background-color: #ff69b4;
            color: white;
          }

          .producto-modal-btn-add:hover:not(:disabled) {
            background-color: #d63384;
          }

          .producto-modal-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .loading-container, .error-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 250px;
            flex-direction: column;
            gap: 15px;
          }

          .loading-spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #ff69b4;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
          }

          .error-container {
            color: #d63384;
          }

          .error-container button {
            background-color: #ff69b4;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: bold;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
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

        {!esPedido && sedeSeleccionada && (
          <div className="inventario-info">
            <span className="inventario-info-title">📦 Inventario de {sedeSeleccionada}</span>
            <span>{productosConStock.length} productos disponibles</span>
          </div>
        )}

        {esPedido && (
          <div className="inventario-info" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}>
            <span className="inventario-info-title">🎂 Modo Pedido - Todos los productos disponibles</span>
            <span>Los productos irán a producción</span>
          </div>
        )}

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
            Categorías {showCategoryDropdown ? '▲' : '▼'}
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
            <div className="loading-container" style={{ gridColumn: '1 / -1' }}>
              <div className="loading-spinner"></div>
              <p>Cargando productos...</p>
            </div>
          ) : error && productos.length === 0 ? (
            <div className="error-container" style={{ gridColumn: '1 / -1' }}>
              <p>{error}</p>
              <button onClick={fetchProductosConInventario}>Reintentar</button>
            </div>
          ) : productosOrdenados.length === 0 ? (
            <div className="error-container" style={{ gridColumn: '1 / -1' }}>
              <p>No se encontraron productos</p>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')}>Limpiar búsqueda</button>
              )}
            </div>
          ) : (
            productosOrdenados.map(producto => (
              <ProductoCard
                key={producto.id || producto.idproductogeneral}
                producto={producto}
                selected={selectedProductos.some(p => p.id === producto.id)}
                onToggle={() => toggleProducto(producto)}
                disponible={obtenerDisponible(producto)}
                esPedido={esPedido}
              />
            ))
          )}
        </div>

        <div className="producto-modal-footer">
          <div className="selected-count">
            {selectedProductos.length > 0 ? `${selectedProductos.length} producto${selectedProductos.length > 1 ? 's' : ''} seleccionado${selectedProductos.length > 1 ? 's' : ''}` : 'Ningún producto seleccionado'}
          </div>
          <div className="producto-modal-actions">
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
    </div>
  );
};

export default AgregarProductosModal;