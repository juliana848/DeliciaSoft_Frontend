// AgregarProductosModal.jsx - VERSIÓN CON DISEÑO UNIFICADO
import React, { useState, useEffect, useMemo } from 'react';
import productoApiService from '../../services/productos_services';
import inventarioApiService from '../../services/inventario_services';
import categoriaProductoApiService from '../../services/categoriaProductosService';
import './EstilosModalesComunes.css';

const AgregarProductosModal = ({ 
  onClose, 
  onAgregar, 
  sedeSeleccionada, 
  tipoVenta,
  insumosSeleccionados = []
}) => {
  const [selectedProductos, setSelectedProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 8;
  
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inventario, setInventario] = useState([]);

  const esPedido = tipoVenta === 'pedido';

  useEffect(() => {
    fetchCategorias();
    fetchProductosConInventario();
  }, [sedeSeleccionada, tipoVenta]);

  const fetchCategorias = async () => {
    try {
      const categoriasData = await categoriaProductoApiService.obtenerCategoriasActivas();
      setCategorias(categoriasData || []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setCategorias([]);
    }
  };

  const fetchProductosConInventario = async () => {
    try {
      setLoading(true);
      setError('');
      
      const productosData = await productoApiService.obtenerProductos();
      const productosActivos = productosData.filter(producto => producto.estado === true);
      
      if (!esPedido && sedeSeleccionada) {
        const sedeId = sedeSeleccionada === 'San Pablo' ? 1 : 2;
        const inventarioData = await inventarioApiService.obtenerInventarioPorSede(sedeId);
        
        const inventarioMap = {};
        if (inventarioData.inventarios && Array.isArray(inventarioData.inventarios)) {
          inventarioData.inventarios.forEach(inv => {
            inventarioMap[inv.producto.id] = parseFloat(inv.cantidad);
          });
        }
        
        setInventario(inventarioMap);
        
        const productosConInventario = productosActivos.map(prod => ({
          ...prod,
          disponible: inventarioMap[prod.idproductogeneral || prod.id] || 0
        }));
        
        setProductos(productosConInventario);
      } else {
        const productosParaPedido = productosActivos.map(prod => ({
          ...prod,
          disponible: 999
        }));
        
        setProductos(productosParaPedido);
      }
      
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

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const nombreProducto = (p.nombre || p.nombreproducto || '').toLowerCase();
      const coincideBusqueda = nombreProducto.includes(searchTerm.toLowerCase());
      
      let coincideCategoria = false;
      
      if (categoriaSeleccionada === 'todas') {
        coincideCategoria = true;
      } else {
        const idCategoriaProducto = p.idcategoriaproducto || p.idcategoria;
        const idCategoriaNum = typeof idCategoriaProducto === 'number' 
          ? idCategoriaProducto 
          : parseInt(idCategoriaProducto);
        
        const categoriaSeleccionadaNum = typeof categoriaSeleccionada === 'number'
          ? categoriaSeleccionada
          : parseInt(categoriaSeleccionada);
        
        coincideCategoria = idCategoriaNum === categoriaSeleccionadaNum;
      }
      
      const tieneStock = esPedido || obtenerDisponible(p) > 0;
      
      return coincideBusqueda && coincideCategoria && tieneStock;
    });
  }, [productos, searchTerm, categoriaSeleccionada, esPedido, inventario]);

  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const indiceInicio = (paginaActual - 1) * productosPorPagina;
  const indiceFin = indiceInicio + productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceFin);

  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm, categoriaSeleccionada]);

  const cambiarPagina = (direccion) => {
    if (direccion === 'anterior' && paginaActual > 1) {
      setPaginaActual(prev => prev - 1);
    } else if (direccion === 'siguiente' && paginaActual < totalPaginas) {
      setPaginaActual(prev => prev + 1);
    }
  };

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

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-catalogo-overlay') {
      onClose();
    }
  };

  return (
    <div className="modal-catalogo-overlay" onClick={handleOverlayClick}>
      <div className="modal-catalogo-container">
        <button className="modal-catalogo-close" onClick={onClose}>
          ✕
        </button>
        
        <h2 className="modal-catalogo-title">🛒 Seleccionar Productos</h2>

        {!esPedido && sedeSeleccionada && (
          <div className="modal-catalogo-banner">
            <span className="modal-catalogo-banner-text">
              📦 Inventario de {sedeSeleccionada}
            </span>
            <span className="modal-catalogo-contador-banner">
              {productosFiltrados.length} productos
            </span>
          </div>
        )}

        <div className="modal-catalogo-controles">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="modal-catalogo-input"
            disabled={loading}
          />
          
          <select
            value={categoriaSeleccionada}
            onChange={(e) => {
              const nuevaCategoria = e.target.value === 'todas' ? 'todas' : parseInt(e.target.value);
              setCategoriaSeleccionada(nuevaCategoria);
            }}
            className="modal-catalogo-select"
            disabled={loading}
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.idcategoriaproducto} value={cat.idcategoriaproducto}>
                {cat.nombrecategoria}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-catalogo-info">
          Mostrando {productosPaginados.length} de {productosFiltrados.length} productos
        </div>

        {loading ? (
          <div className="modal-catalogo-loading">
            <div className="modal-catalogo-loading-spinner"></div>
            <p>Cargando productos...</p>
          </div>
        ) : (
          <div className="modal-catalogo-grid-wrapper">
            <div className="modal-catalogo-grid">
              {productosPaginados.length === 0 ? (
                <div className="modal-catalogo-empty">
                  {searchTerm || categoriaSeleccionada !== 'todas' 
                    ? 'No se encontraron productos con estos filtros' 
                    : 'No hay productos disponibles'}
                </div>
              ) : (
                productosPaginados.map((producto) => {
                  const estaSeleccionado = selectedProductos.some(p => p.id === producto.id);
                  const disponible = obtenerDisponible(producto);
                  
                  return (
                    <div
                      key={producto.id || producto.idproductogeneral}
                      className={`modal-catalogo-card ${estaSeleccionado ? 'modal-catalogo-card-seleccionado' : ''} ${!esPedido && disponible === 0 ? 'modal-catalogo-card-disabled' : ''}`}
                      onClick={() => toggleProducto(producto)}
                    >
                      {estaSeleccionado && (
                        <div className="modal-catalogo-check-icon">✓</div>
                      )}
                      <img
                        src={producto.urlimagen || 'https://via.placeholder.com/160?text=Sin+Imagen'}
                        alt={producto.nombre || producto.nombreproducto}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/160?text=Sin+Imagen';
                        }}
                      />
                      <span className="modal-catalogo-nombre">{producto.nombre || producto.nombreproducto}</span>
                      <span className="modal-catalogo-precio">${producto.precio.toLocaleString('es-CO')}</span>
                      {!esPedido && disponible === 0 && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(255, 255, 255, 0.85)',
                          color: '#e91e63',
                          fontWeight: 'bold',
                          fontSize: '0.9em',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: '8px',
                          pointerEvents: 'none'
                        }}>
                          AGOTADO
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {totalPaginas > 1 && (
          <div className="modal-catalogo-paginacion">
            <button
              className="modal-catalogo-paginacion-btn"
              onClick={() => cambiarPagina('anterior')}
              disabled={paginaActual === 1}
            >
              ←
            </button>
            
            <span className="modal-catalogo-paginacion-info">
              Página {paginaActual} de {totalPaginas}
            </span>
            
            <button
              className="modal-catalogo-paginacion-btn"
              onClick={() => cambiarPagina('siguiente')}
              disabled={paginaActual === totalPaginas}
            >
              →
            </button>
          </div>
        )}

        <div className="modal-catalogo-footer">
          <div className="modal-catalogo-contador">
            Seleccionados: {selectedProductos.length}
          </div>

          <div className="modal-catalogo-footer-acciones">
            <button className="modal-catalogo-cancel-btn" onClick={onClose}>Cancelar</button>
            <button 
              className="modal-catalogo-save-btn" 
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