import React, { useState, useEffect } from 'react';
import InsumoCard from './InsumoCard';

const AgregarInsumosModal = ({ onClose, onAgregar }) => {
  const [selectedInsumos, setSelectedInsumos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState(['Todos']);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener imagen por defecto según categoría
  const obtenerImagenPorDefecto = (categoria, nombreInsumo) => {
    const categoriaLower = (categoria || '').toLowerCase();
    const nombreLower = (nombreInsumo || '').toLowerCase();
    
    if (nombreLower.includes('leche')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJVhI6leNnj0FWig5Z4uPFhq-lZafYWFkfYQ&s';
    if (nombreLower.includes('huevo')) return 'https://static.vecteezy.com/system/resources/previews/008/848/340/original/isolated-eggs-on-white-background-free-photo.jpg';
    if (nombreLower.includes('harina')) return 'https://olimpica.vtexassets.com/arquivos/ids/617052/7701008629240.jpg?v=637626523850430000';
    if (nombreLower.includes('azucar') || nombreLower.includes('azúcar')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxvQQZ8vQYm9mNxQM0x0xGzB1L1L1L1L1L1w&s';
    if (nombreLower.includes('sal')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKKdX3LZ8vMf9YzR4QnPjkKdL2vX8QlmwA&s';
    
    return 'https://via.placeholder.com/100x100/ff69b4/ffffff?text=📦';
  };

  // Función para obtener precio estimado (mientras no esté en la API)
  const obtenerPrecioEstimado = (nombreInsumo, categoria) => {
    const nombreLower = (nombreInsumo || '').toLowerCase();
    
    // Precios estimados comunes en Colombia (en COP)
    if (nombreLower.includes('huevo')) return 6000; // docena de huevos
    if (nombreLower.includes('harina')) return 4500; // kilo de harina
    if (nombreLower.includes('leche')) return 3500; // litro de leche
    if (nombreLower.includes('azucar') || nombreLower.includes('azúcar')) return 3000; // kilo de azúcar
    if (nombreLower.includes('sal')) return 1500; // kilo de sal
    if (nombreLower.includes('arroz')) return 4000; // kilo de arroz
    
    // Precios por categoría
    if (categoria === 'frutas') return 5000;
    if (categoria === 'secos') return 3500;
    
    return 2500; // precio genérico
  };

  // Cargar insumos desde la API
  useEffect(() => {
    const cargarInsumos = async () => {
      try {
        setCargando(true);
        setError(null);
        
        const response = await fetch('https://deliciasoft-backend.onrender.com/api/insumos', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('🚀 Datos RAW de insumos desde API:', data);
        console.log('📋 Campos disponibles en primer insumo:', Object.keys(data[0] || {}));
        
        // Verificar si hay campos de precio en los datos
        const camposPrecio = ['precio', 'preciounitario', 'precioUnitario', 'valor', 'costo'];
        const tienePrecio = data.some(insumo => 
          camposPrecio.some(campo => insumo[campo] !== undefined && insumo[campo] !== null)
        );
        
        console.log('💰 ¿Los datos incluyen precios?', tienePrecio);
        
        // Transformar datos de la API al formato esperado
        const insumosTransformados = data.map(insumo => {
          // Intentar buscar precio en los datos
          let precio = 0;
          let campoUsado = '';
          
          // Buscar en campos posibles
          const camposPrecio = ['precio', 'preciounitario', 'precioUnitario', 'valor', 'costo'];
          for (const campo of camposPrecio) {
            if (insumo[campo] !== undefined && insumo[campo] !== null && insumo[campo] !== '') {
              const precioNumerico = parseFloat(insumo[campo]);
              if (!isNaN(precioNumerico) && precioNumerico > 0) {
                precio = precioNumerico;
                campoUsado = campo;
                break;
              }
            }
          }
          
          // Si no encontramos precio en la API, usar precio estimado
          if (precio === 0) {
            precio = obtenerPrecioEstimado(insumo.nombreinsumo, insumo.categoriainsumos?.nombrecategoria);
            campoUsado = 'estimado';
          }
          
          const insumoTransformado = {
            id: insumo.idinsumo || insumo.id,
            nombre: insumo.nombreinsumo || insumo.nombre || 'Sin nombre',
            unidad: insumo.unidadmedida?.unidadmedida || 'Unidad',
            precio: precio,
            precioUnitario: precio,
            cantidad: parseInt(insumo.cantidad) || 1,
            category: insumo.categoriainsumos?.nombrecategoria || 'Sin categoría',
            imagen: insumo.imagen || obtenerImagenPorDefecto(
              insumo.categoriainsumos?.nombrecategoria, 
              insumo.nombreinsumo
            ),
            esPrecioEstimado: campoUsado === 'estimado',
            campoUsadoParaPrecio: campoUsado,
            datosOriginales: insumo
          };
          
          console.log(`✅ ${insumoTransformado.nombre}: $${precio} (${campoUsado})`);
          
          return insumoTransformado;
        });

        console.log('📦 Total insumos transformados:', insumosTransformados.length);
        console.log('💵 Insumos con precio > 0:', insumosTransformados.filter(i => i.precio > 0).length);

        setInsumos(insumosTransformados);
        
        // Extraer categorías únicas
        const categoriasUnicas = ['Todos', ...new Set(insumosTransformados.map(i => i.category))];
        setCategorias(categoriasUnicas);
        
      } catch (error) {
        console.error('❌ Error al cargar insumos:', error);
        setError(error.message);
      } finally {
        setCargando(false);
      }
    };

    cargarInsumos();
  }, []);

  const filteredInsumos = insumos.filter(insumo =>
    insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'Todos' || insumo.category === selectedCategory)
  );

  const toggleInsumo = (insumo) => {
    console.log('🎯 Seleccionando insumo:', {
      nombre: insumo.nombre,
      precio: insumo.precio,
      esPrecioEstimado: insumo.esPrecioEstimado
    });
    
    setSelectedInsumos(prev =>
      prev.some(i => i.id === insumo.id)
        ? prev.filter(i => i.id !== insumo.id)
        : [...prev, { 
            ...insumo, 
            cantidad: 1,
            precio: insumo.precio,
            precioUnitario: insumo.precio
          }]
    );
  };

  const handleAgregar = () => {
    console.log('📤 Enviando insumos seleccionados:', selectedInsumos);
    onAgregar(selectedInsumos);
    onClose();
  };

  if (cargando) {
    return (
      <div className="adicion-modal-overlay">
        <div className="adicion-modal-container" style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #ff69b4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Cargando insumos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adicion-modal-overlay">
        <div className="adicion-modal-container" style={{ textAlign: 'center', padding: '50px' }}>
          <h3 style={{ color: '#d63384', marginBottom: '20px' }}>Error al cargar insumos</h3>
          <p style={{ marginBottom: '20px' }}>{error}</p>
          <button className="adicion-modal-btn adicion-modal-btn-cancel" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

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
            max-height: 80vh;
            overflow-y: auto;
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
            max-height: 200px;
            overflow-y: auto;
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
            margin: 0 0 5px 0;
          }

          .adicion-modal-card p {
            font-size: 12px;
            color: #666;
            margin: 2px 0;
          }

          .adicion-modal-card .precio {
            font-weight: bold;
            color: #ff69b4;
            font-size: 14px;
          }

          .adicion-modal-card .precio-estimado {
            font-weight: bold;
            color: #ffa500;
            font-size: 14px;
          }

          .adicion-modal-card .debug-info {
            font-size: 10px;
            color: #999;
            font-style: italic;
            margin-top: 4px;
          }

          .adicion-modal-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            margin-top: 20px;
          }

          .adicion-modal-info {
            font-size: 14px;
            color: #666;
          }

          .adicion-modal-buttons {
            display: flex;
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

          .adicion-modal-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .no-results {
            text-align: center;
            padding: 40px;
            color: #666;
          }

          .imagen-placeholder {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #ff69b4, #ffb6c1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            margin: 0 auto 8px;
          }

          .warning-message {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
            color: #856404;
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

        <div className="adicion-modal-header">
          <h2>Seleccionar Insumos</h2>
          <button onClick={onClose} className="adicion-modal-close-btn">&times;</button>
        </div>

        <div className="warning-message">
          ⚠️ <strong>Nota:</strong> Los precios mostrados son estimados ya que la API no incluye información de precios. 
          Considera agregar precios a tu base de datos para mayor precisión.
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
              {categorias.map(category => (
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

        {filteredInsumos.length === 0 && !cargando ? (
          <div className="no-results">
            <p>No se encontraron insumos con los criterios de búsqueda</p>
          </div>
        ) : (
          <div className="adicion-modal-grid">
            {filteredInsumos.map(insumo => {
              const isSelected = selectedInsumos.some(i => i.id === insumo.id);
              return (
                <div
                  key={insumo.id}
                  className={`adicion-modal-card ${isSelected ? 'adicion-modal-card-selected' : ''}`}
                  onClick={() => toggleInsumo(insumo)}
                >
                  {insumo.imagen && insumo.imagen !== 'https://via.placeholder.com/100x100/ff69b4/ffffff?text=📦' ? (
                    <img 
                      src={insumo.imagen} 
                      alt={insumo.nombre}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="imagen-placeholder" 
                    style={{ display: insumo.imagen && insumo.imagen !== 'https://via.placeholder.com/100x100/ff69b4/ffffff?text=📦' ? 'none' : 'flex' }}
                  >
                    📦
                  </div>
                  <h4>{insumo.nombre}</h4>
                  <p>{insumo.unidad}</p>
                  <p className={insumo.esPrecioEstimado ? "precio-estimado" : "precio"}>
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0
                    }).format(insumo.precio)}
                    {insumo.esPrecioEstimado && ' *'}
                  </p>
                  {insumo.category !== 'Sin categoría' && (
                    <p style={{ fontSize: '10px', fontStyle: 'italic' }}>{insumo.category}</p>
                  )}
                  <p style={{ fontSize: '10px', color: '#999' }}>Stock: {insumo.cantidad}</p>
                </div>
              );
            })}
          </div>
        )}

        <div className="adicion-modal-footer">
          <div className="adicion-modal-info">
            {filteredInsumos.length} insumos disponibles
            <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
              * Precios estimados (no disponibles en API)
            </div>
          </div>
          <div className="adicion-modal-buttons">
            <button className="adicion-modal-btn adicion-modal-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button 
              className="adicion-modal-btn adicion-modal-btn-add" 
              onClick={handleAgregar}
              disabled={selectedInsumos.length === 0}
            >
              Agregar ({selectedInsumos.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgregarInsumosModal;