import React, { useState, useEffect } from 'react';
import './AgregarInsumosModal.css';

const AgregarInsumosModal = ({ onClose, onAgregar }) => {
  const [selectedInsumos, setSelectedInsumos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState(['Todos']);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModalPrecio, setMostrarModalPrecio] = useState(false);
  const [insumoParaPrecio, setInsumoParaPrecio] = useState(null);
  const [precioTemporal, setPrecioTemporal] = useState('');

  const actualizarPrecioInsumo = async (insumoId, nuevoPrecio) => {
    try {
      const response = await fetch(`https://deliciasoft-backend-i6g9.onrender.com/api/insumos/${insumoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ precio: nuevoPrecio })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error actualizando precio:', error);
      throw error;
    }
  };

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
        
        const insumosActivos = data.filter(insumo => {
          const estado = insumo.estado || insumo.activo || insumo.active || insumo.isActive;
          
          if (typeof estado === 'boolean') {
            return estado === true;
          } else if (typeof estado === 'string') {
            return estado.toLowerCase() === 'true' || estado.toLowerCase() === 'activo';
          } else if (typeof estado === 'number') {
            return estado === 1;
          }
          
          return true;
        });

        const insumosTransformados = insumosActivos.map(insumo => {
          let precio = 0;
          
          const precioRaw = insumo.precio || insumo.preciounitario || insumo.precioUnitario || insumo.precio_unitario;
          
          if (precioRaw !== undefined && precioRaw !== null) {
            const precioNumerico = parseFloat(precioRaw);
            if (!isNaN(precioNumerico) && precioNumerico > 0) {
              precio = precioNumerico;
            }
          }
          
          return {
            id: insumo.idinsumo || insumo.id,
            nombre: insumo.nombreinsumo || insumo.nombre || 'Sin nombre',
            unidad: insumo.unidadmedida?.unidadmedida || 'Unidad',
            precio: precio,
            precioUnitario: precio,
            cantidad: parseInt(insumo.cantidad) || 0,
            category: insumo.categoriainsumos?.nombrecategoria || 'Sin categoría',
            estado: insumo.estado || true,
            datosOriginales: insumo
          };
        });

        setInsumos(insumosTransformados);
        
        const categoriasUnicas = ['Todos', ...new Set(insumosTransformados.map(i => i.category))];
        setCategorias(categoriasUnicas);
        
      } catch (error) {
        console.error('Error al cargar insumos:', error);
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
    if (insumo.precio <= 0) {
      alert(`⚠️ El insumo "${insumo.nombre}" no tiene precio configurado. Por favor, edita el precio primero haciendo clic en el botón ✏️`);
      return;
    }
    
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

  const abrirModalPrecio = (insumo, e) => {
    e.stopPropagation();
    setInsumoParaPrecio(insumo);
    setPrecioTemporal(insumo.precio > 0 ? insumo.precio.toString() : '');
    setMostrarModalPrecio(true);
  };

  const guardarPrecio = async () => {
    try {
      const nuevoPrecio = parseFloat(precioTemporal);
      if (isNaN(nuevoPrecio) || nuevoPrecio <= 0) {
        alert('Por favor ingresa un precio válido mayor a 0');
        return;
      }

      await actualizarPrecioInsumo(insumoParaPrecio.id, nuevoPrecio);
      
      setInsumos(prev => prev.map(insumo => 
        insumo.id === insumoParaPrecio.id 
          ? { ...insumo, precio: nuevoPrecio, precioUnitario: nuevoPrecio }
          : insumo
      ));

      setSelectedInsumos(prev => prev.map(insumo =>
        insumo.id === insumoParaPrecio.id
          ? { ...insumo, precio: nuevoPrecio, precioUnitario: nuevoPrecio }
          : insumo
      ));

      setMostrarModalPrecio(false);
      setInsumoParaPrecio(null);
      setPrecioTemporal('');
    } catch (error) {
      alert('Error al actualizar el precio: ' + error.message);
    }
  };

  const handleAgregar = () => {
    const insumosSinPrecio = selectedInsumos.filter(insumo => insumo.precio <= 0);
    
    if (insumosSinPrecio.length > 0) {
      alert(`⚠️ Los siguientes insumos no tienen precio configurado: ${insumosSinPrecio.map(i => i.nombre).join(', ')}. Por favor, configura los precios antes de continuar.`);
      return;
    }
    
    onAgregar(selectedInsumos);
    onClose();
  };

  if (cargando) {
    return (
      <div className="adicion-modal-overlay">
        <div className="adicion-modal-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando insumos activos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adicion-modal-overlay">
        <div className="adicion-modal-container">
          <div className="loading-container">
            <h3 style={{ color: '#e74c3c', marginBottom: '20px' }}>Error al cargar insumos</h3>
            <p style={{ marginBottom: '20px' }}>{error}</p>
            <button className="adicion-modal-btn adicion-modal-btn-cancel" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const insumosConPrecio = insumos.filter(i => i.precio > 0).length;
  const insumosSinPrecio = insumos.filter(i => i.precio <= 0).length;

  return (
    <div className="adicion-modal-overlay">
      <div className="adicion-modal-container">
        {/* Header */}
        <div className="adicion-modal-header">
          <h2>Seleccionar Insumos</h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              className="adicion-modal-btn adicion-modal-btn-add"
              onClick={handleAgregar}
              disabled={selectedInsumos.length === 0}
            >
              Agregar {selectedInsumos.length > 0 && `(${selectedInsumos.length})`}
            </button>
            <button onClick={onClose} className="adicion-modal-close-btn">×</button>
          </div>
        </div>

        {/* Búsqueda y filtros */}
        <div className="adicion-modal-search-container">
          <input
            type="text"
            placeholder="🔍 Buscar insumo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div style={{ position: 'relative' }}>
            <button
              className="adicion-modal-filter-btn"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <span>📂</span>
              <span>Categorías</span>
              <span>{showCategoryDropdown ? '▲' : '▼'}</span>
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
        </div>

        {/* Grid de insumos */}
        {filteredInsumos.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <p className="no-results-title">No se encontraron insumos</p>
            <p className="no-results-text">Intenta con otros términos de búsqueda</p>
          </div>
        ) : (
          <div className="adicion-modal-grid">
            {filteredInsumos.map(insumo => {
              const isSelected = selectedInsumos.some(i => i.id === insumo.id);
              const sinPrecio = insumo.precio <= 0;
              
              return (
                <div
                  key={insumo.id}
                  className={`adicion-modal-card ${isSelected ? 'adicion-modal-card-selected' : ''} ${sinPrecio ? 'adicion-modal-card-sin-precio' : ''}`}
                  onClick={() => toggleInsumo(insumo)}
                >
                  <button 
                    className={`btn-editar-precio ${sinPrecio ? 'sin-precio' : ''}`}
                    onClick={(e) => abrirModalPrecio(insumo, e)}
                    title={sinPrecio ? "⚠️ Configurar precio" : "Editar precio"}
                  >
                    ✏️
                  </button>

                  {isSelected && (
                    <div className="card-check-icon">✓</div>
                  )}
                  
                  <h4>{insumo.nombre}</h4>
                  
                  <div className="adicion-modal-card-info">
                    <div className="adicion-modal-card-info-item">
                      <span className="info-label">Stock:</span>
                      <span className="info-value">{insumo.cantidad} {insumo.unidad}</span>
                    </div>
                    
                    <div className="adicion-modal-card-info-item">
                      <span className="info-label">Precio:</span>
                      {insumo.precio > 0 ? (
                        <span className="info-value precio-real">
                          {new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0
                          }).format(insumo.precio)}
                        </span>
                      ) : (
                        <span className="precio-sin-configurar">Sin precio</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="adicion-modal-footer">
          <div className="adicion-modal-info">
            📦 {filteredInsumos.length} insumos disponibles
            <div className="adicion-modal-info-stats">
              {insumosConPrecio > 0 && `✅ ${insumosConPrecio} con precio`}
              {insumosConPrecio > 0 && insumosSinPrecio > 0 && ' | '}
              {insumosSinPrecio > 0 && `⚠️ ${insumosSinPrecio} sin precio`}
            </div>
          </div>
          
          <button className="adicion-modal-btn adicion-modal-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
        </div>

        {/* Modal para editar precio */}
        {mostrarModalPrecio && (
          <div className="modal-precio" onClick={() => {
            setMostrarModalPrecio(false);
            setInsumoParaPrecio(null);
            setPrecioTemporal('');
          }}>
            <div className="modal-precio-contenido" onClick={(e) => e.stopPropagation()}>
              <h3>
                {insumoParaPrecio?.precio > 0 ? '💰 Actualizar precio' : '⚠️ Configurar precio'}
              </h3>
              <p style={{ fontWeight: '600', fontSize: '16px', color: '#2c3e50' }}>
                {insumoParaPrecio?.nombre}
              </p>
              <p>
                {insumoParaPrecio?.precio > 0 
                  ? `Precio actual: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(insumoParaPrecio.precio)}`
                  : 'Este insumo no tiene precio configurado'
                }
              </p>
              <input
                type="number"
                value={precioTemporal}
                onChange={(e) => setPrecioTemporal(e.target.value)}
                placeholder="Ingrese el precio en COP"
                min="0"
                step="100"
                autoFocus
              />
              <div className="modal-precio-botones">
                <button 
                  className="adicion-modal-btn adicion-modal-btn-cancel"
                  onClick={() => {
                    setMostrarModalPrecio(false);
                    setInsumoParaPrecio(null);
                    setPrecioTemporal('');
                  }}
                >
                  Cancelar
                </button>
                <button 
                  className="adicion-modal-btn adicion-modal-btn-add"
                  onClick={guardarPrecio}
                  disabled={!precioTemporal || parseFloat(precioTemporal) <= 0}
                >
                  {insumoParaPrecio?.precio > 0 ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgregarInsumosModal;