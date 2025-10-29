// AgregarProductosModal.jsx - ESTILO SIMPLE CON FILTRO DE CATEGORÍAS
import React, { useState, useEffect, useMemo } from 'react';
import productoApiService from '../../services/productos_services';
import inventarioApiService from '../../services/inventario_services';
import categoriaProductoApiService from '../../services/categoriaProductosService';
import './AgregarProductosModal.css';

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
      console.log('Categorías cargadas:', categoriasData);
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

  // Filtrar productos por búsqueda y categoría
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
      
      // Filtrar productos sin stock en venta directa
      const tieneStock = esPedido || obtenerDisponible(p) > 0;
      
      return coincideBusqueda && coincideCategoria && tieneStock;
    });
  }, [productos, searchTerm, categoriaSeleccionada, esPedido, inventario]);

  // Calcular paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const indiceInicio = (paginaActual - 1) * productosPorPagina;
  const indiceFin = indiceInicio + productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceFin);

  // Resetear página cuando cambie el filtro o categoría
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

  return (
    <div className="agregar-prod-modal-overlay">
      <div className="agregar-prod-modal-container">
        <button className="agregar-prod-modal-close" onClick={onClose}>
          ✕
        </button>
        
        <h2 className="agregar-prod-modal-title">Seleccionar productos</h2>

        {!esPedido && sedeSeleccionada && (
          <div className="agregar-prod-inventario-banner">
            📦 Inventario de **{sedeSeleccionada}** - {productosFiltrados.length} productos disponibles
          </div>
        )}
        <div className="agregar-prod-modal-controles">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="agregar-prod-modal-input"
            disabled={loading}
          />
          
          <select
            value={categoriaSeleccionada}
            onChange={(e) => {
              const nuevaCategoria = e.target.value === 'todas' ? 'todas' : parseInt(e.target.value);
              setCategoriaSeleccionada(nuevaCategoria);
            }}
            className="agregar-prod-modal-select"
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

        <div className="agregar-prod-modal-info">
          Mostrando {productosPaginados.length} de {productosFiltrados.length} productos
        </div>

        {loading ? (
          <div className="agregar-prod-modal-loading">
            <div className="agregar-prod-loading-spinner"></div>
            <p>Cargando productos...</p>
          </div>
        ) : (
          <div className="agregar-prod-modal-grid-wrapper">
            <div className="agregar-prod-modal-grid">
              {productosPaginados.length === 0 ? (
                <div className="agregar-prod-modal-empty">
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
                      className={`agregar-prod-modal-card ${estaSeleccionado ? 'agregar-prod-modal-card-seleccionado' : ''} ${!esPedido && disponible === 0 ? 'agregar-prod-card-agotado' : ''}`}
                      onClick={() => toggleProducto(producto)}
                    >
                      {estaSeleccionado && (
                        <div className="agregar-prod-check-icon">✓</div>
                      )}
                      <img
                        src={producto.urlimagen || 'https://via.placeholder.com/160?text=Sin+Imagen'}
                        alt={producto.nombre || producto.nombreproducto}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/160?text=Sin+Imagen';
                        }}
                      />
                      <span className="agregar-prod-nombre">{producto.nombre || producto.nombreproducto}</span>
                      <span className="agregar-prod-precio">${producto.precio.toLocaleString('es-CO')}</span>
                      {!esPedido && (
                        <div className={`agregar-prod-stock-mini ${disponible < 5 ? 'agregar-prod-stock-mini-poco' : ''}`}>
                          {disponible} disponibles
                        </div>
                      )}
                      {!esPedido && disponible === 0 && (
                          <div className='agregar-prod-agotado-overlay'>AGOTADO</div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        <div className="agregar-prod-modal-footer">

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="agregar-prod-modal-paginacion">
              <button
                className="agregar-prod-paginacion-btn"
                onClick={() => cambiarPagina('anterior')}
                disabled={paginaActual === 1}
                title="Página anterior"
              >
                ← Anterior
              </button>
              
              <span className="agregar-prod-paginacion-info">
                Página {paginaActual} de {totalPaginas}
              </span>
              
              <button
                className="agregar-prod-paginacion-btn"
                onClick={() => cambiarPagina('siguiente')}
                disabled={paginaActual === totalPaginas}
                title="Página siguiente"
              >
                Siguiente →
              </button>
            </div>
          )}

          {/* Botones de acción */}
          <div className="agregar-prod-modal-footer-acciones">
            <button className="agregar-prod-cancel-btn" onClick={onClose}>Cancelar</button>
            <button 
              className="agregar-prod-save-btn" 
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