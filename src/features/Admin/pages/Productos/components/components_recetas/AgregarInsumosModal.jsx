import React, { useState, useEffect } from "react";
import recetaApiService from "../../../../services/Receta_Services";

const InsumoCard = ({ insumo, selected, onToggle, cantidad, onCantidadChange }) => {
  return (
    <div
      className={`producto-modal-card ${selected ? 'producto-modal-card-selected' : ''}`}
      onClick={onToggle}
    >
      <div className="insumo-placeholder">
        <span className="insumo-icon">📦</span>
      </div>
      <h4>{insumo.nombreinsumo}</h4>
      <p>${(insumo.precio || 0).toLocaleString('es-CO')} / Unidad</p>
      <small>Stock: {insumo.cantidad || 0}</small>
      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
        {insumo.categoria || 'Sin categoría'}
      </div>
      
      {selected && (
        <div className="cantidad-input-container" onClick={e => e.stopPropagation()}>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={cantidad || 1}
            onChange={(e) => onCantidadChange(insumo.idinsumo, e.target.value)}
            className="cantidad-input"
          />
          <span className="cantidad-label">Cant.</span>
        </div>
      )}
    </div>
  );
};

export default function AgregarInsumosModal({ onClose, onAgregar, insumosSeleccionados = [] }) {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [insumosParaAgregar, setInsumosParaAgregar] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorias, setCategorias] = useState(['Todos']);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInsumos = async () => {
      setLoading(true);
      try {
        const insumosData = await recetaApiService.obtenerInsumos();
        console.log('Insumos obtenidos:', insumosData);
        
        // Filtrar insumos activos y disponibles
        const insumosActivos = insumosData.filter(insumo => 
          insumo.estado !== false && 
          !insumosSeleccionados.some(seleccionado => 
            seleccionado.id === insumo.idinsumo || seleccionado.idinsumo === insumo.idinsumo
          )
        );
        
        setInsumos(insumosActivos);
        
        // Extraer categorías únicas
        const categoriasUnicas = [...new Set(insumosActivos.map(i => i.categoria).filter(cat => cat && cat !== 'Sin categoría'))];
        setCategorias(['Todos', ...categoriasUnicas]);
        
      } catch (error) {
        console.error('Error al cargar insumos:', error);
        setError('Error al cargar insumos. Usando datos de ejemplo.');
        
        // Datos de fallback
        const insumosFallback = [
          {
            idinsumo: 1,
            nombreinsumo: 'Harina de trigo',
            precio: 3500,
            categoria: 'Harinas',
            cantidad: 50
          },
          {
            idinsumo: 2,
            nombreinsumo: 'Azúcar blanca',
            precio: 2800,
            categoria: 'Endulzantes',
            cantidad: 30
          },
          {
            idinsumo: 3,
            nombreinsumo: 'Huevos frescos',
            precio: 500,
            categoria: 'Lácteos',
            cantidad: 100
          },
          {
            idinsumo: 4,
            nombreinsumo: 'Mantequilla',
            precio: 8500,
            categoria: 'Lácteos',
            cantidad: 15
          },
          {
            idinsumo: 5,
            nombreinsumo: 'Chocolate en polvo',
            precio: 12000,
            categoria: 'Chocolates',
            cantidad: 8
          },
          {
            idinsumo: 6,
            nombreinsumo: 'Leche entera',
            precio: 4200,
            categoria: 'Lácteos',
            cantidad: 25
          }
        ];
        
        setInsumos(insumosFallback);
        setCategorias(['Todos', 'Harinas', 'Endulzantes', 'Lácteos', 'Chocolates']);
      } finally {
        setLoading(false);
      }
    };

    fetchInsumos();
  }, [insumosSeleccionados]);

  const filteredInsumos = insumos.filter(insumo =>
    insumo.nombreinsumo.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'Todos' || insumo.categoria === selectedCategory)
  );

  const toggleInsumoSeleccion = (insumo) => {
    setInsumosParaAgregar(prev => {
      const yaEsta = prev.find(item => item.id === insumo.idinsumo);
      
      if (yaEsta) {
        return prev.filter(item => item.id !== insumo.idinsumo);
      } else {
        return [...prev, {
          id: insumo.idinsumo,
          idinsumo: insumo.idinsumo,
          nombre: insumo.nombreinsumo,
          nombreinsumo: insumo.nombreinsumo,
          precio: insumo.precio || 0,
          categoria: insumo.categoria || 'Sin categoría',
          cantidad: 1,
          idunidadmedida: 1,
          unidadmedida: 'Unidad'
        }];
      }
    });
  };

  const handleCantidadChange = (insumoId, nuevaCantidad) => {
    const cantidad = parseFloat(nuevaCantidad) || 1;
    setInsumosParaAgregar(prev =>
      prev.map(insumo =>
        insumo.id === insumoId
          ? { ...insumo, cantidad: cantidad }
          : insumo
      )
    );
  };

  const handleAgregar = () => {
    if (insumosParaAgregar.length === 0) {
      alert('Por favor selecciona al menos un insumo');
      return;
    }

    const insumosInvalidos = insumosParaAgregar.filter(insumo => 
      !insumo.cantidad || isNaN(parseFloat(insumo.cantidad)) || parseFloat(insumo.cantidad) <= 0
    );

    if (insumosInvalidos.length > 0) {
      alert('Todos los insumos deben tener una cantidad válida mayor a 0');
      return;
    }

    console.log('Agregando insumos:', insumosParaAgregar);
    onAgregar(insumosParaAgregar);
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
            z-index: 1003;
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
            position: relative;
          }

          .producto-modal-card:hover {
            transform: translateY(-4px);
            border-color: #ff69b4;
          }

          .producto-modal-card-selected {
            border-color: #d63384;
            background: #ffe4ec;
          }

          .insumo-placeholder {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #ff69b4, #ffb6c1);
            border-radius: 12px;
            margin: 0 auto 8px auto;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .insumo-icon {
            font-size: 40px;
          }

          .producto-modal-card h4 {
            font-size: 16px;
            color: #d63384;
            margin: 0 0 4px 0;
          }

          .producto-modal-card p {
            margin: 4px 0;
            color: #333;
            font-weight: 600;
          }

          .producto-modal-card small {
            color: #666;
            font-size: 12px;
          }

          .cantidad-input-container {
            margin-top: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
          }

          .cantidad-input {
            width: 60px;
            padding: 4px 6px;
            border: 1px solid #ff69b4;
            border-radius: 6px;
            text-align: center;
            font-size: 12px;
          }

          .cantidad-label {
            font-size: 10px;
            color: #d63384;
            font-weight: 600;
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
          <h2>Seleccionar Insumos</h2>
          <button onClick={onClose} className="producto-modal-close-btn">&times;</button>
        </div>

        <div className="producto-modal-search-container">
          <input
            type="text"
            placeholder="Buscar insumo..."
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
              <p>Cargando insumos...</p>
            </div>
          ) : error && insumos.length === 0 ? (
            <div className="error-container">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Reintentar</button>
            </div>
          ) : filteredInsumos.length === 0 ? (
            <div className="error-container">
              <p>No se encontraron insumos</p>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')}>Limpiar búsqueda</button>
              )}
            </div>
          ) : (
            filteredInsumos.map(insumo => {
              const insumoSeleccionado = insumosParaAgregar.find(item => item.id === insumo.idinsumo);
              return (
                <InsumoCard
                  key={insumo.idinsumo}
                  insumo={insumo}
                  selected={!!insumoSeleccionado}
                  onToggle={() => toggleInsumoSeleccion(insumo)}
                  cantidad={insumoSeleccionado?.cantidad}
                  onCantidadChange={handleCantidadChange}
                />
              );
            })
          )}
        </div>

        <div className="producto-modal-footer">
          <button className="producto-modal-btn producto-modal-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="producto-modal-btn producto-modal-btn-add" 
            onClick={handleAgregar}
            disabled={insumosParaAgregar.length === 0 || loading}
          >
            Agregar ({insumosParaAgregar.length})
          </button>
        </div>
      </div>
    </div>
  );
}