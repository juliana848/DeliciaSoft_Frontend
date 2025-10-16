// src/features/Admin/pages/Produccion/components/ModalAgregarProductos.jsx
import React, { useState, useEffect, useMemo } from 'react';
import './Css/ModalAgregarProductos.css';
import categoriaProductoApiService from '../../../services/categoriaProductosService';

export default function ModalAgregarProductos({
  productosDisponibles = [],
  productosSeleccionados = [],
  setProductosSeleccionados,
  onClose,
  tipoProduccion = 'pedido',
  sedes = []
}) {
  const [filtro, setFiltro] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 8;

  // Cargar categorías al montar el componente
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const cats = await categoriaProductoApiService.obtenerCategoriasActivas();
        console.log('✅ Categorías cargadas:', cats);
        setCategorias(cats || []);
        
        // Seleccionar la primera categoría automáticamente si existe
        if (cats && cats.length > 0) {
          const primeraCategoria = cats[0].idcategoriaproducto;
          console.log('🎯 Seleccionando primera categoría:', primeraCategoria);
          setCategoriaSeleccionada(primeraCategoria);
        }
      } catch (error) {
        console.error('❌ Error al cargar categorías:', error);
        setCategorias([]);
      }
    };
    cargarCategorias();
  }, []);

  // Debug: Ver estructura de productos
  useEffect(() => {
    if (productosDisponibles.length > 0) {
      console.log('📦 Total productos disponibles:', productosDisponibles.length);
      console.log('📋 Ejemplo de producto:', productosDisponibles[0]);
    }
  }, [productosDisponibles]);

  const toggleSeleccion = (producto) => {
    const yaSeleccionado = productosSeleccionados.some(p => p.id === producto.id);
    
    if (yaSeleccionado) {
      setProductosSeleccionados(prev => prev.filter(p => p.id !== producto.id));
    } else {
      const nuevoProducto = { 
        ...producto, 
        cantidad: 1, 
        receta: producto.receta || null, 
        sede: tipoProduccion === 'pedido' ? "" : null
      };

      if (tipoProduccion === 'fabrica') {
        const cantidadesPorSede = {};
        sedes.forEach(sede => {
          cantidadesPorSede[sede.nombre] = 0;
        });
        nuevoProducto.cantidadesPorSede = cantidadesPorSede;
        nuevoProducto.cantidad = 0;
      }

      setProductosSeleccionados(prev => [...prev, nuevoProducto]);
    }
  };

  // Filtrar productos por búsqueda y categoría
  const productosFiltrados = useMemo(() => {
    console.log('🔍 Iniciando filtrado...');
    console.log('📦 Total productos disponibles:', productosDisponibles.length);
    console.log('🎯 Categoría seleccionada:', categoriaSeleccionada);
    
    const filtrados = productosDisponibles.filter((p) => {
      // Filtro de búsqueda
      const nombreProducto = (p.nombre || p.nombreproducto || '').toLowerCase();
      const coincideBusqueda = nombreProducto.includes(filtro.toLowerCase());
      
      // Filtro de categoría
      let coincideCategoria = false;
      
      if (categoriaSeleccionada === 'todas') {
        coincideCategoria = true;
      } else {
        // Obtener TODOS los posibles campos de ID de categoría
        const idCategoriaProducto = p.idcategoriaproducto || p.idcategoria || p.IdCategoriaProducto || p.IdCategoria;
        
        if (!idCategoriaProducto) {
          console.log('⚠️ Producto sin categoría:', nombreProducto, p);
          return false;
        }
        
        const idCategoriaNum = typeof idCategoriaProducto === 'number' 
          ? idCategoriaProducto 
          : parseInt(idCategoriaProducto);
        
        const categoriaSeleccionadaNum = typeof categoriaSeleccionada === 'number'
          ? categoriaSeleccionada
          : parseInt(categoriaSeleccionada);
        
        coincideCategoria = idCategoriaNum === categoriaSeleccionadaNum;
        
        // Debug para los primeros 3 productos
        if (filtrados.length < 3) {
          console.log('🔍 Producto:', nombreProducto, {
            idCategoriaOriginal: idCategoriaProducto,
            idCategoriaNumerica: idCategoriaNum,
            categoriaSeleccionada: categoriaSeleccionadaNum,
            coincide: coincideCategoria,
            estructuraCompleta: p
          });
        }
      }
      
      return coincideBusqueda && coincideCategoria;
    });
    
    console.log(`✅ Filtrados: ${filtrados.length} de ${productosDisponibles.length} productos`);
    
    return filtrados;
  }, [productosDisponibles, filtro, categoriaSeleccionada]);

  // Calcular paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const indiceInicio = (paginaActual - 1) * productosPorPagina;
  const indiceFin = indiceInicio + productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceFin);

  // Resetear página cuando cambie el filtro o categoría
  useEffect(() => {
    setPaginaActual(1);
  }, [filtro, categoriaSeleccionada]);

  const cambiarPagina = (direccion) => {
    if (direccion === 'anterior' && paginaActual > 1) {
      setPaginaActual(prev => prev - 1);
    } else if (direccion === 'siguiente' && paginaActual < totalPaginas) {
      setPaginaActual(prev => prev + 1);
    }
  };

  return (
    <div className="modal-agregar-overlay">
      <div className="modal-agregar-container">
        <button className="modal-agregar-close" onClick={onClose}>
          ✕
        </button>
        
        <h2 className="modal-agregar-title">Seleccionar productos</h2>

        <div className="modal-agregar-controles">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="modal-agregar-input"
          />
          
          <select
            value={categoriaSeleccionada}
            onChange={(e) => {
              const nuevaCategoria = e.target.value === 'todas' ? 'todas' : parseInt(e.target.value);
              console.log('🔄 Cambiando a categoría:', nuevaCategoria);
              setCategoriaSeleccionada(nuevaCategoria);
            }}
            className="modal-agregar-select"
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.idcategoriaproducto} value={cat.idcategoriaproducto}>
                {cat.nombrecategoria}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-agregar-info">
          Mostrando {productosPaginados.length} de {productosFiltrados.length} productos
        </div>

        <div className="modal-agregar-grid">
          {productosPaginados.length === 0 ? (
            <div className="modal-agregar-empty">
              No se encontraron productos
            </div>
          ) : (
            productosPaginados.map((producto) => {
              const estaSeleccionado = productosSeleccionados.some(p => p.id === producto.id);
              return (
                <div
                  key={producto.id}
                  className={`modal-agregar-card ${estaSeleccionado ? 'seleccionado' : ''}`}
                  onClick={() => toggleSeleccion(producto)}
                >
                  {estaSeleccionado && (
                    <div className="check-icon">✓</div>
                  )}
                  <img
                    src={producto.imagen || producto.urlimagen}
                    alt={producto.nombre || producto.nombreproducto}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/160?text=Postre';
                    }}
                  />
                  <span>{producto.nombre || producto.nombreproducto}</span>
                </div>
              );
            })
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="modal-agregar-paginacion">
            <button
              className="paginacion-btn"
              onClick={() => cambiarPagina('anterior')}
              disabled={paginaActual === 1}
              title="Página anterior"
            >
              ←
            </button>
            
            <span className="paginacion-info">
              Página {paginaActual} de {totalPaginas}
            </span>
            
            <button
              className="paginacion-btn"
              onClick={() => cambiarPagina('siguiente')}
              disabled={paginaActual === totalPaginas}
              title="Página siguiente"
            >
              →
            </button>
          </div>
        )}

        <div className="modal-agregar-footer">
          <button className="cancel-btn" onClick={onClose}>Cancelar</button>
          <button className="save-btn" onClick={onClose}>
            Guardar ({productosSeleccionados.length})
          </button>
        </div>
      </div>
    </div>
  );
}