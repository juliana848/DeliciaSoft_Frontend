import React, { useState, useEffect } from "react";
import recetaApiService from "../../../../services/Receta_services";
import './AgregarInsumosModal.css';

const InsumoCard = ({ insumo, selected, onToggle }) => {
  return (
    <div
      className={`modal-agregar-card ${selected ? 'seleccionado' : ''}`}
      onClick={onToggle}
    >
      {selected && <div className="check-icon">✓</div>}
      <div className="insumo-placeholder">
        <span className="insumo-icon">📦</span>
      </div>
      <span>{insumo.nombreinsumo}</span>
      <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
        ${(insumo.precio || 0).toLocaleString('es-CO')}
      </div>
      <div style={{ fontSize: '9px', color: '#aaa' }}>
        Stock: {insumo.cantidad || 0}
      </div>
    </div>
  );
};

export default function AgregarInsumosModal({ onClose, onAgregar, insumosSeleccionados = [] }) {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [insumosParaAgregar, setInsumosParaAgregar] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [categorias, setCategorias] = useState(['Todos']);
  const [error, setError] = useState('');

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 8;

  useEffect(() => {
    const fetchInsumos = async () => {
      setLoading(true);
      try {
        const insumosData = await recetaApiService.obtenerInsumos();
        console.log('Insumos obtenidos:', insumosData);
        
        const insumosActivos = insumosData.filter(insumo => 
          insumo.estado !== false && 
          !insumosSeleccionados.some(seleccionado => 
            seleccionado.id === insumo.idinsumo || seleccionado.idinsumo === insumo.idinsumo
          )
        );
        
        setInsumos(insumosActivos);
        
        const categoriasUnicas = [...new Set(insumosActivos.map(i => i.categoria).filter(cat => cat && cat !== 'Sin categoría'))];
        setCategorias(['Todos', ...categoriasUnicas]);
        
      } catch (error) {
        console.error('Error al cargar insumos:', error);
        setError('Error al cargar insumos.');
        
        const insumosFallback = [
          { idinsumo: 1, nombreinsumo: 'Harina de trigo', precio: 3500, categoria: 'Harinas', cantidad: 50 },
          { idinsumo: 2, nombreinsumo: 'Azúcar blanca', precio: 2800, categoria: 'Endulzantes', cantidad: 30 },
          { idinsumo: 3, nombreinsumo: 'Huevos frescos', precio: 500, categoria: 'Lácteos', cantidad: 100 },
          { idinsumo: 4, nombreinsumo: 'Mantequilla', precio: 8500, categoria: 'Lácteos', cantidad: 15 },
          { idinsumo: 5, nombreinsumo: 'Chocolate en polvo', precio: 12000, categoria: 'Chocolates', cantidad: 8 },
          { idinsumo: 6, nombreinsumo: 'Leche entera', precio: 4200, categoria: 'Lácteos', cantidad: 25 }
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

  // Cálculo de paginación
  const totalPaginas = Math.ceil(filteredInsumos.length / productosPorPagina);
  const indexInicio = (paginaActual - 1) * productosPorPagina;
  const indexFin = indexInicio + productosPorPagina;
  const insumosPaginados = filteredInsumos.slice(indexInicio, indexFin);

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

  const handleAgregar = () => {
    if (insumosParaAgregar.length === 0) {
      alert('Por favor selecciona al menos un insumo');
      return;
    }

    console.log('Agregando insumos:', insumosParaAgregar);
    onAgregar(insumosParaAgregar);
    onClose();
  };

  return (
    <div className="modal-agregar-overlay">
      <div className="modal-agregar-container">
        <button onClick={onClose} className="modal-agregar-close">×</button>
        
        <h2 className="modal-agregar-title">🛒 Detalle de Insumos</h2>
        
        <div className="modal-agregar-info">
          Selecciona los insumos que necesitas • {insumosParaAgregar.length} seleccionados
        </div>

        <div className="modal-agregar-controles">
          <input
            type="text"
            placeholder="🔍 Buscar insumo..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPaginaActual(1);
            }}
            disabled={loading}
            className="modal-agregar-input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPaginaActual(1);
            }}
            disabled={loading}
            className="modal-agregar-select"
          >
            {categorias.map(category => (
              <option key={category} value={category}>
                {category === 'Todos' ? '📂 Todas las categorías' : `📁 ${category}`}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-agregar-grid">
          {loading ? (
            <div className="modal-agregar-empty">
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>⏳</div>
              <p>Cargando insumos...</p>
            </div>
          ) : error && insumos.length === 0 ? (
            <div className="modal-agregar-empty">
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} style={{ marginTop: '10px', padding: '6px 12px', borderRadius: '5px', border: 'none', background: '#e91e63', color: 'white', cursor: 'pointer' }}>
                Reintentar
              </button>
            </div>
          ) : insumosPaginados.length === 0 ? (
            <div className="modal-agregar-empty">
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔍</div>
              <p>No se encontraron insumos</p>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} style={{ marginTop: '10px', padding: '6px 12px', borderRadius: '5px', border: 'none', background: '#e91e63', color: 'white', cursor: 'pointer' }}>
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            insumosPaginados.map(insumo => {
              const insumoSeleccionado = insumosParaAgregar.find(item => item.id === insumo.idinsumo);
              return (
                <InsumoCard
                  key={insumo.idinsumo}
                  insumo={insumo}
                  selected={!!insumoSeleccionado}
                  onToggle={() => toggleInsumoSeleccion(insumo)}
                />
              );
            })
          )}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="modal-agregar-paginacion">
            <button
              onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="paginacion-btn"
            >
              ◀
            </button>
            <span className="paginacion-info">
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="paginacion-btn"
            >
              ▶
            </button>
          </div>
        )}

        <div className="modal-agregar-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="save-btn" 
            onClick={handleAgregar}
            disabled={insumosParaAgregar.length === 0 || loading}
          >
            ✓ Agregar ({insumosParaAgregar.length})
          </button>
        </div>
      </div>
    </div>
  );
}