import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from "../../Cartas/pages/CartContext";
import categoriaProductoApiService from '../../Admin/services/categoriaProductosService';
import productoApiService from '../../Admin/services/productos_services';
import { FiEye } from "react-icons/fi"; 


const ProductosView = () => {
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(null);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  
  // Estados para datos de la API
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ESTADOS PARA FILTROS
  const [busqueda, setBusqueda] = useState('');
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(1000000);
  const [precioMaximo, setPrecioMaximo] = useState(1000000); // Para el rango máximo absoluto
  const [rangoActivo, setRangoActivo] = useState(false);
  const [sliderActivo, setSliderActivo] = useState(null); // 'min' | 'max' | null

  const navigate = useNavigate();
  const { 
    carrito, 
    agregarProducto,
    actualizarCantidadCarrito, 
    eliminarDelCarrito
  } = useContext(CartContext);

  // Cargar datos de la API al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  // Recuperar productos temporales
  useEffect(() => {
    const productosTemporales = localStorage.getItem('productosTemporales');
    if (productosTemporales) {
        try {
            const productos = JSON.parse(productosTemporales);
            console.log('Productos recuperados:', productos);
            
            productos.forEach(producto => {
                agregarProducto(producto);
            });
            
            localStorage.removeItem('productosTemporales');
            showCustomAlert('success', 'Productos recuperados correctamente');
        } catch (error) {
            console.error('Error al recuperar productos:', error);
            localStorage.removeItem('productosTemporales');
        }
    }
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar categorías y productos en paralelo
      const [categoriasResponse, productosResponse] = await Promise.all([
        categoriaProductoApiService.obtenerCategoriasActivas(),
        productoApiService.obtenerProductos()
      ]);

      console.log('Categorías obtenidas:', categoriasResponse);
      console.log('Productos obtenidos:', productosResponse);

      // Transformar categorías para que coincidan con el formato esperado
      const categoriasTransformadas = categoriasResponse.map(cat => ({
        id: cat.idcategoriaproducto || cat.id,
        nombre: cat.nombrecategoria || cat.nombre,
        icon: obtenerIconoCategoria(cat.nombrecategoria || cat.nombre),
        descripcion: cat.descripcion,
        imagen: cat.imagen
      }));

      // Agrupar productos por categoría
      const productosAgrupados = agruparProductosPorCategoria(productosResponse, categoriasTransformadas);

      setCategorias(categoriasTransformadas);
      setProductos(productosAgrupados);
      
      // Establecer la primera categoría como activa
      if (categoriasTransformadas.length > 0) {
        setCategoriaActiva(categoriasTransformadas[0].id);
      }

      // Calcular precio máximo automáticamente
      let maxPrecio = 0;
      productosResponse.forEach(p => {
        if (p.precio > maxPrecio) maxPrecio = p.precio;
      });
      
      const precioMaxRedondeado = Math.ceil(maxPrecio / 1000) * 1000;
      
      setPrecioMaximo(precioMaxRedondeado);
      setPrecioMin(0);
      setPrecioMax(precioMaxRedondeado);

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError(`Error al cargar datos: ${error.message}`);
      showCustomAlert('error', 'Error al cargar categorías y productos');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener icono según el nombre de la categoría
  const obtenerIconoCategoria = (nombreCategoria) => {
    const nombre = nombreCategoria.toLowerCase();
    
    if (nombre.includes('fresa')) return '🍓';
    if (nombre.includes('dona')) return '🍩';
    if (nombre.includes('postre')) return '🍮';
    if (nombre.includes('cupcake')) return '🧁';
    if (nombre.includes('arroz')) return '🍚';
    if (nombre.includes('sandwich') || nombre.includes('sanduche')) return '🥪';
    if (nombre.includes('torta') || nombre.includes('cake')) return '🎂';
    if (nombre.includes('bebida')) return '🥤';
    if (nombre.includes('helado')) return '🍦';
    
    return '🍰'; // Icono por defecto
  };

  // Función para agrupar productos por categoría
  const agruparProductosPorCategoria = (productos, categorias) => {
    const productosAgrupados = {};
    
    // Inicializar cada categoría con array vacío
    categorias.forEach(categoria => {
      productosAgrupados[categoria.id] = [];
    });

    // Agrupar productos por su categoría
    productos.forEach(producto => {
      const categoriaId = producto.idcategoria || producto.idcategoriaproducto;
      
      if (categoriaId && productosAgrupados[categoriaId]) {
        // Transformar producto para que coincida con el formato esperado
        const productoTransformado = {
          id: producto.id,
          nombre: producto.nombre,
          imagen: producto.urlimagen || 'https://via.placeholder.com/300x200?text=Producto',
          precio: producto.precio,
          descripcion: producto.descripcion || 'Descripción no disponible',
          categoria: categoriaId,
          estado: producto.estado,
          cantidad: 1
        };

        productosAgrupados[categoriaId].push(productoTransformado);
      }
    });

    return productosAgrupados;
  };

  // FUNCIÓN PARA FILTRAR PRODUCTOS
  const filtrarProductos = (productosCategoria) => {
    return productosCategoria.filter(producto => {
      const cumpleBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const cumplePrecio = rangoActivo 
        ? producto.precio >= precioMin && producto.precio <= precioMax
        : true;
      return cumpleBusqueda && cumplePrecio;
    });
  };

  // FUNCIÓN PARA RESETEAR FILTROS
  const resetearFiltros = () => {
    setBusqueda('');
    setRangoActivo(false);
    setPrecioMin(0);
    setPrecioMax(precioMaximo);
  };

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  // Función para verificar si el usuario está autenticado
  const isUserAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    console.log('Token encontrado:', token);
    return !!token;
  };

  const seleccionarProducto = (producto) => {
    const productoConCantidad = { ...producto, cantidad: 1 };
    agregarProducto(productoConCantidad);
    showCustomAlert('success', `${producto.nombre} agregado al carrito!`);
  };

  const abrirModal = (producto) => {
    setModalDetalle(producto);
  };

  const cerrarModal = () => {
    setModalDetalle(null);
  };

  const handleGoToLogin = () => {
    setShowAuthAlert(false);
    localStorage.setItem('productosTemporales', JSON.stringify(carrito));
    navigate('/iniciar-sesion');
  };

  const handleCancelLogin = () => {
    setShowAuthAlert(false);
  };

  // Mostrar loading
  if (loading) {
    return (
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        minHeight: '100vh', 
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #e91e63',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <h3 style={{ color: '#2c3e50' }}>Cargando productos...</h3>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        minHeight: '100vh', 
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ 
          textAlign: 'center',
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h3 style={{ color: '#e74c3c', marginBottom: '15px' }}>Error al cargar datos</h3>
          <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>{error}</p>
          <button
            onClick={cargarDatos}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '10px',
              backgroundColor: '#e91e63',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Obtener productos de la categoría activa Y APLICAR FILTROS
  const productosCategoria = productos[categoriaActiva] || [];
  const productosFiltrados = filtrarProductos(productosCategoria);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
      {/* Custom Alert */}
      {showAlert.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 2000,
            padding: '1rem 1.5rem',
            borderRadius: '15px',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.9rem',
            minWidth: '300px',
            background:
              showAlert.type === 'success'
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #ec4899, #be185d)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            animation: 'slideInRight 0.5s ease-out'
          }}
        >
          {showAlert.message}
        </div>
      )}

      {/* Header con título */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#2c3e50',
          marginBottom: '10px',
          background: 'linear-gradient(45deg, #e91e63, #ff6b9d)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Nuestros Productos
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '16px' }}>
          Explora y agrega tus favoritos al carrito
        </p>
      </div>

      {/* SECCIÓN DE FILTROS CON SLIDER */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '25px',
        marginBottom: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '25px',
          alignItems: 'end'
        }}>
          {/* Buscador */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '8px'
            }}>
              🔍 Buscar producto
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre..."
              style={{
                width: '100%',
                padding: '12px 15px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#e91e63'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          {/* Slider de rango de precio */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '8px'
            }}>
              💰 Rango de precio
            </label>
            
            {/* Etiquetas de precio */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              fontSize: '13px',
              color: '#7f8c8d',
              fontWeight: '600'
            }}>
              <span style={{ 
                color: '#e91e63',
                backgroundColor: '#ffe4ec',
                padding: '4px 10px',
                borderRadius: '8px'
              }}>
                ${precioMin.toLocaleString()}
              </span>
              <span style={{ 
                color: '#e91e63',
                backgroundColor: '#ffe4ec',
                padding: '4px 10px',
                borderRadius: '8px'
              }}>
                ${precioMax.toLocaleString()}
              </span>
            </div>

{/* Contenedor de sliders */}
            <div style={{ position: 'relative', height: '50px', paddingTop: '10px' }}>
              {/* Barra de fondo */}
              <div style={{
                position: 'absolute',
                top: '25px',
                left: '0',
                right: '0',
                height: '6px',
                backgroundColor: '#e0e0e0',
                borderRadius: '3px'
              }} />
              
              {/* Barra activa (rosita) */}
              <div
                style={{
                  position: 'absolute',
                  top: '25px',
                  left: `${(precioMin / precioMaximo) * 100}%`,
                  right: `${100 - (precioMax / precioMaximo) * 100}%`,
                  height: '6px',
                  background: 'linear-gradient(90deg, #e91e63, #ff6b9d)',
                  borderRadius: '3px',
                  boxShadow: '0 2px 5px rgba(233, 30, 99, 0.3)',
                  pointerEvents: 'none'
                }}
              />

              {/* Slider mínimo - arriba */}
              <input
                type="range"
                min={0}
                max={precioMaximo}
                step={1000}
                value={precioMin}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value < precioMax - 1000) {
                    setPrecioMin(value);
                  }
                }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '6px',
                  top: '10px',
                  appearance: 'none',
                  background: 'transparent',
                  zIndex: 4,
                  cursor: 'pointer',
                  pointerEvents: 'auto'
                }}
                className="range-slider range-slider-min"
              />

              {/* Slider máximo - abajo */}
              <input
                type="range"
                min={0}
                max={precioMaximo}
                step={1000}
                value={precioMax}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value > precioMin + 1000) {
                    setPrecioMax(value);
                  }
                }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '6px',
                  top: '40px',
                  appearance: 'none',
                  background: 'transparent',
                  zIndex: 4,
                  cursor: 'pointer',
                  pointerEvents: 'auto'
                }}
                className="range-slider range-slider-max"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setRangoActivo(!rangoActivo)}
              style={{
                flex: 1,
                padding: '12px 20px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: rangoActivo 
                  ? 'linear-gradient(135deg, #e91e63, #ff6b9d)' 
                  : 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: 'white',
                boxShadow: rangoActivo 
                  ? '0 4px 15px rgba(233, 30, 99, 0.3)' 
                  : '0 4px 15px rgba(255, 215, 0, 0.3)',
                transform: rangoActivo ? 'translateY(-2px)' : 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = rangoActivo 
                  ? '0 6px 20px rgba(233, 30, 99, 0.4)' 
                  : '0 6px 20px rgba(255, 215, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = rangoActivo ? 'translateY(-2px)' : 'none';
                e.currentTarget.style.boxShadow = rangoActivo 
                  ? '0 4px 15px rgba(233, 30, 99, 0.3)' 
                  : '0 4px 15px rgba(255, 215, 0, 0.3)';
              }}
            >
              {rangoActivo ? '✓ Filtro activo' : 'Aplicar filtro'}
            </button>
            <button
              onClick={resetearFiltros}
              style={{
                padding: '12px 20px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: 'white',
                color: '#7f8c8d',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#e91e63';
                e.target.style.color = '#e91e63';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.color = '#7f8c8d';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🗑️ Limpiar
            </button>
          </div>
        </div>

        {/* Indicador de resultados */}
        {(busqueda || rangoActivo) && (
          <div style={{
            marginTop: '15px',
            padding: '12px 18px',
            background: 'linear-gradient(135deg, #ffe4ec, #fff0f6)',
            borderRadius: '12px',
            fontSize: '14px',
            color: '#2c3e50',
            borderLeft: '4px solid #e91e63',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '18px' }}>📊</span>
            <span>
              Mostrando <strong style={{ color: '#e91e63' }}>{productosFiltrados.length}</strong> de <strong>{productosCategoria.length}</strong> productos
            </span>
          </div>
        )}
      </div>

      {/* Categorías */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px', 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        {categorias.map(categoria => (
          <button
            key={categoria.id}
            onClick={() => setCategoriaActiva(categoria.id)}
            style={{
              padding: '12px 20px',
              border: 'none',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: categoriaActiva === categoria.id ? '#e91e63' : '#f8f9fa',
              color: categoriaActiva === categoria.id ? 'white' : '#2c3e50',
              boxShadow: categoriaActiva === categoria.id ? '0 4px 15px rgba(233,30,99,0.3)' : 'none',
              transform: categoriaActiva === categoria.id ? 'translateY(-2px)' : 'none'
            }}
          >
            <span style={{ marginRight: '8px' }}>{categoria.icon}</span>
            {categoria.nombre}
          </button>
        ))}
      </div>

      {/* Productos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {productosFiltrados.length === 0 ? (
          <div style={{ 
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>
              {busqueda || rangoActivo ? '🔍' : '📦'}
            </div>
            <h3 style={{ color: '#7f8c8d' }}>
              {busqueda || rangoActivo 
                ? 'No se encontraron productos con estos filtros'
                : 'No hay productos disponibles en esta categoría'
              }
            </h3>
          </div>
        ) : (
          productosFiltrados.map(producto => {
            const yaEnCarrito = carrito.find(p => p.id === producto.id);

            return (
              <div
                key={producto.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: yaEnCarrito ? '0 8px 25px rgba(233,30,99,0.2)' : '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: yaEnCarrito ? '2px solid #e91e63' : '2px solid transparent',
                  transform: yaEnCarrito ? 'translateY(-5px)' : 'none'
                }}
              >
                <div 
                  style={{ 
                    height: '200px', 
                    backgroundImage: `url(${producto.imagen})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                  onClick={() => abrirModal(producto)}
                >
                  {/* Icono de ver detalles (ojito) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      color: '#ec4899',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <FiEye />
                  </div>

                  {yaEnCarrito && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      borderRadius: '50%',
                      width: '35px',
                      height: '35px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}>
                      ✓
                    </div>
                  )}
                </div>
                
                <div style={{ padding: '20px' }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#2c3e50',
                    marginBottom: '8px',
                    margin: '0 0 8px 0'
                  }}>
                    {producto.nombre}
                  </h3>
                  
                  <p style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold',
                    color: '#e91e63',
                    margin: '0 0 15px 0'
                  }}>
                    ${producto.precio.toLocaleString()}
                  </p>
                  
                  <button
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      backgroundColor: yaEnCarrito ? '#4caf50' : '#e91e63',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      seleccionarProducto(producto);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>🛒</span>
                    {yaEnCarrito ? `En carrito (${yaEnCarrito.cantidad})` : 'Agregar al carrito'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      {modalDetalle && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={cerrarModal}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            animation: 'scaleIn 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={cerrarModal}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                width: '40px',
                height: '40px',
                border: 'none',
                borderRadius: '50%',
                fontSize: '20px',
                cursor: 'pointer',
                backgroundColor: '#e74c3c',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
            >
              ✕
            </button>
            
            <div style={{
              height: '250px',
              backgroundImage: `url(${modalDetalle.imagen})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '15px',
              marginBottom: '20px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }} />
            
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#2c3e50',
              marginBottom: '10px',
              margin: '0 0 10px 0'
            }}>
              {modalDetalle.nombre}
            </h2>
            
            <p style={{ 
              fontSize: '28px', 
              fontWeight: 'bold',
              color: '#e91e63',
              marginBottom: '15px',
              margin: '0 0 15px 0'
            }}>
              ${modalDetalle.precio.toLocaleString()}
            </p>
            
            <p style={{ 
              fontSize: '16px', 
              color: '#7f8c8d',
              lineHeight: '1.6',
              marginBottom: '20px',
              margin: '0 0 20px 0'
            }}>
              {modalDetalle.descripcion}
            </p>
            
            <button
              onClick={() => {
                seleccionarProducto(modalDetalle);
                cerrarModal();
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                background: 'linear-gradient(45deg, #e91e63, #ff6b9d)',
                color: 'white',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(233,30,99,0.3)'
              }}
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      )}

      {/* Alert de Autenticación */}
      {showAuthAlert && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1002
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '450px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>
              🔒
            </div>
            <h3 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              color: '#2c3e50',
              marginBottom: '15px'
            }}>
              ¡Inicia sesión para continuar!
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#7f8c8d',
              marginBottom: '25px',
              lineHeight: '1.5'
            }}>
              Para personalizar tu pedido y continuar con el proceso de compra, necesitas iniciar sesión en tu cuenta.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button
                onClick={handleCancelLogin}
                style={{
                  padding: '12px 25px',
                  border: '2px solid #e74c3c',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  color: '#e74c3c',
                  transition: 'all 0.3s ease'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleGoToLogin}
                style={{
                  padding: '12px 25px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  background: 'linear-gradient(45deg, #e91e63, #ff6b9d)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(233,30,99,0.3)'
                }}
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes scaleIn {
            from {
              transform: scale(0.9);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }

          /* Estilos para los sliders de rango */
          .range-slider::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: linear-gradient(135deg, #e91e63, #ff6b9d);
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(233, 30, 99, 0.4);
            transition: all 0.2s ease;
            position: relative;
            z-index: 5;
          }

          .range-slider::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 3px 12px rgba(233, 30, 99, 0.6);
          }

          .range-slider::-webkit-slider-thumb:active {
            transform: scale(1.1);
          }

          .range-slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: linear-gradient(135deg, #e91e63, #ff6b9d);
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(233, 30, 99, 0.4);
            transition: all 0.2s ease;
          }

          .range-slider::-moz-range-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 3px 12px rgba(233, 30, 99, 0.6);
          }

          .range-slider::-moz-range-thumb:active {
            transform: scale(1.1);
          }

          /* Para Edge */
          .range-slider::-ms-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: linear-gradient(135deg, #e91e63, #ff6b9d);
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(233, 30, 99, 0.4);
            transition: all 0.2s ease;
          }

          .range-slider::-ms-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 3px 12px rgba(233, 30, 99, 0.6);
          }
        `}
      </style>
    </div>
  );
};

export default ProductosView;