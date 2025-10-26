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
  const [paginaActual, setPaginaActual] = useState(1);
  const insumosPorPagina = 4;

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
        
        const response = await fetch('https://deliciasoft-backend-i6g9.onrender.com/api/insumos', {
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

  const totalPaginas = Math.ceil(filteredInsumos.length / insumosPorPagina);
  const indiceInicio = (paginaActual - 1) * insumosPorPagina;
  const indiceFin = indiceInicio + insumosPorPagina;
  const insumosPaginados = filteredInsumos.slice(indiceInicio, indiceFin);

  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm, selectedCategory]);

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
      <div className="modal-agregar-overlay">
        <div className="modal-agregar-container">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #e91e63',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>Cargando insumos activos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-agregar-overlay">
        <div className="modal-agregar-container">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3 style={{ color: '#e74c3c', marginBottom: '20px' }}>Error al cargar insumos</h3>
            <p style={{ marginBottom: '20px' }}>{error}</p>
            <button className="cancel-btn" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-agregar-overlay">
      <div className="modal-agregar-container">
        <button onClick={onClose} className="modal-agregar-close">×</button>

        <h2 className="modal-agregar-title">Seleccionar Insumos</h2>

        <div className="modal-agregar-controles">
          <input
            type="text"
            className="modal-agregar-input"
            placeholder="Buscar insumos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {/* Select personalizado con dropdown */}
          <div className="custom-select-container">
            <button
              className="custom-select-button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              type="button"
            >
              {selectedCategory === 'Todos' ? 'Todas las categorías' : selectedCategory}
              <span className="custom-select-arrow">{showCategoryDropdown ? '▲' : '▼'}</span>
            </button>
            
            {showCategoryDropdown && (
              <div className="custom-select-dropdown">
                {categorias.map(category => (
                  <div
                    key={category}
                    className={`custom-select-option ${selectedCategory === category ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowCategoryDropdown(false);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e91e63';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory !== category) {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = '#333';
                      } else {
                        e.currentTarget.style.background = '#e91e63';
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                  >
                    {category === 'Todos' ? 'Todas las categorías' : category}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-agregar-info">
          Mostrando {insumosPaginados.length} de {filteredInsumos.length} insumos
        </div>

        {filteredInsumos.length === 0 ? (
          <div className="modal-agregar-grid">
            <div className="modal-agregar-empty">
              🔍 No se encontraron insumos<br/>
              Intenta con otros términos de búsqueda
            </div>
          </div>
        ) : (
          <>
            <div className="modal-agregar-grid">
              {insumosPaginados.map(insumo => {
                const isSelected = selectedInsumos.some(i => i.id === insumo.id);
                const sinPrecio = insumo.precio <= 0;
                
                return (
                  <div
                    key={insumo.id}
                    className={`modal-agregar-card ${isSelected ? 'seleccionado' : ''}`}
                    onClick={() => toggleInsumo(insumo)}
                  >
                    {isSelected && (
                      <div className="check-icon">✓</div>
                    )}
                    
                    <div style={{ 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '8px',
                      justifyContent: 'center',
                      width: '100%',
                      paddingTop: '8px'
                    }}>
                      <span style={{ fontWeight: '600', fontSize: '13px', color: '#333' }}>
                        {insumo.nombre}
                      </span>
                      
                      <span style={{ fontSize: '10px', color: '#666' }}>
                        Stock: {insumo.cantidad} {insumo.unidad}
                      </span>
                      
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '700',
                        color: insumo.precio > 0 ? '#27ae60' : '#ff9800'
                      }}>
                        {insumo.precio > 0 ? (
                          new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0
                          }).format(insumo.precio)
                        ) : (
                          'Sin precio'
                        )}
                      </span>
                    </div>

                    <button 
                      className="btn-ver-verabajo"
                      onClick={(e) => abrirModalPrecio(insumo, e)}
                      title={sinPrecio ? "⚠️ Configurar precio" : "Editar precio"}
                    >
                      ✏️ {sinPrecio ? 'Configurar' : 'Editar'}
                    </button>
                  </div>
                );
              })}
            </div>

            {totalPaginas > 1 && (
              <div className="modal-agregar-paginacion">
                <button
                  className="paginacion-btn"
                  onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                  disabled={paginaActual === 1}
                >
                  ←
                </button>
                <span className="paginacion-info">
                  Página {paginaActual} de {totalPaginas}
                </span>
                <button
                  className="paginacion-btn"
                  onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                  disabled={paginaActual === totalPaginas}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}

        <div className="modal-agregar-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          
          <button 
            className="save-btn"
            onClick={handleAgregar}
            disabled={selectedInsumos.length === 0}
          >
            Guardar ({selectedInsumos.length})
          </button>
        </div>

        {mostrarModalPrecio && (
          <div className="modal-precio" onClick={() => {
            setMostrarModalPrecio(false);
            setInsumoParaPrecio(null);
            setPrecioTemporal('');
          }}>
            <div className="modal-precio-contenido" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ color: '#e91e63', marginBottom: '12px', fontSize: '20px' }}>
                {insumoParaPrecio?.precio > 0 ? '💰 Actualizar precio' : '⚠️ Configurar precio'}
              </h3>
              <p style={{ fontWeight: '600', fontSize: '16px', color: '#2c3e50' }}>
                {insumoParaPrecio?.nombre}
              </p>
              <p style={{ color: '#7f8c8d', marginBottom: '8px' }}>
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
                style={{
                  width: '100%',
                  padding: '12px',
                  margin: '16px 0',
                  border: '2px solid #e91e63',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setMostrarModalPrecio(false);
                    setInsumoParaPrecio(null);
                    setPrecioTemporal('');
                  }}
                >
                  Cancelar
                </button>
                <button 
                  className="save-btn"
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