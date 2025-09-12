import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from "../../Cartas/pages/CartContext";
import categoriaProductoApiService from '../../Admin/services/categoriaProductosService';
import productoApiService from '../../Admin/services/productos_services';

const ProductosView = ({ onProductoSeleccionado, onSiguiente, productosSeleccionados = [], onActualizarCantidad, onEliminarProducto }) => {
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(null);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  
  // Nuevos estados para datos de la API
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { 
    carrito, 
    actualizarCantidadCarrito, 
    eliminarDelCarrito,
    productosSeleccionados: productosDelContexto,
    agregarProductoSeleccionado,
    actualizarCantidadSeleccionado,
    eliminarProductoSeleccionado
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
                agregarProductoSeleccionado(producto);
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
          imagen: producto.imagen || 'https://via.placeholder.com/300x200?text=Producto',
          precio: producto.precio,
          descripcion: producto.descripcion || 'Descripción no disponible',
          categoria: categoriaId,
          estado: producto.estado,
          cantidad: producto.cantidad
        };

        productosAgrupados[categoriaId].push(productoTransformado);
      }
    });

    return productosAgrupados;
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
    agregarProductoSeleccionado(productoConCantidad);
    showCustomAlert('success', `${producto.nombre} ha sido agregado al pedido!`);
    setTimeout(() => {
        const resumenElement = document.getElementById('resumen-pedido');
        if (resumenElement) {
            resumenElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
  };

  const actualizarCantidadUnificada = (productoId, nuevaCantidad) => {
      const enProductosSeleccionados = productosSeleccionados.find(p => p.id === productoId);
      const enProductosContexto = productosDelContexto.find(p => p.id === productoId);
      
      if (enProductosSeleccionados) {
          if (nuevaCantidad <= 0) {
              onEliminarProducto(productoId);
              eliminarProductoSeleccionado(productoId);
              showCustomAlert('error', `Producto eliminado del pedido.`);
          } else {
              onActualizarCantidad(productoId, nuevaCantidad);
              actualizarCantidadSeleccionado(productoId, nuevaCantidad);
              showCustomAlert('success', `Cantidad actualizada.`);
          }
      } else if (enProductosContexto) {
          if (nuevaCantidad <= 0) {
              eliminarProductoSeleccionado(productoId);
              showCustomAlert('error', `Producto eliminado del pedido.`);
          } else {
              actualizarCantidadSeleccionado(productoId, nuevaCantidad);
              showCustomAlert('success', `Cantidad actualizada.`);
          }
      } else {
          if (nuevaCantidad <= 0) {
              eliminarDelCarrito(productoId);
              showCustomAlert('error', `Producto eliminado del pedido.`);
          } else {
              actualizarCantidadCarrito(productoId, nuevaCantidad);
              showCustomAlert('success', `Cantidad actualizada.`);
          }
      }
  };

  const eliminarProductoUnificado = (productoId) => {
      const enProductosSeleccionados = productosSeleccionados.find(p => p.id === productoId);
      const enProductosContexto = productosDelContexto.find(p => p.id === productoId);
      
      if (enProductosSeleccionados) {
          onEliminarProducto(productoId);
          eliminarProductoSeleccionado(productoId);
      } else if (enProductosContexto) {
          eliminarProductoSeleccionado(productoId);
      } else {
          eliminarDelCarrito(productoId);
      }
      showCustomAlert('error', `Producto eliminado del pedido.`);
  };

  const abrirModal = (producto) => {
    setModalDetalle(producto);
  };

  const cerrarModal = () => {
    setModalDetalle(null);
  };

  const continuar = () => {
    console.log('=== INICIANDO FUNCIÓN CONTINUAR ===');
    const todosLosProductos = obtenerTodosLosProductos();
    console.log('Todos los productos obtenidos:', todosLosProductos);
    
    const cantidadTotal = todosLosProductos.reduce((total, producto) => total + (producto.cantidad || 1), 0);
    console.log('Cantidad total calculada:', cantidadTotal);
    
    if (cantidadTotal < 10) {
        showCustomAlert('error', `Necesitas al menos 10 productos en total. Tienes ${cantidadTotal} productos.`);
        return;
    }

    if (cantidadTotal > 100) {
        showCustomAlert('error', `Máximo 100 productos permitidos. Tienes ${cantidadTotal} productos.`);
        return;
    }

    if (!isUserAuthenticated()) {
        console.log('Usuario no autenticado');
        setShowAuthAlert(true);
        return;
    }

    console.log('Todo correcto, mostrando confirmación');
    setShowConfirmation(true);
  };

  const handleConfirmContinue = () => {
    setShowConfirmation(false);
    onSiguiente();
  };

  const handleCancelContinue = () => {
    setShowConfirmation(false);
  };

  const handleGoToLogin = () => {
    setShowAuthAlert(false);
    const todosLosProductos = obtenerTodosLosProductos();
    localStorage.setItem('productosTemporales', JSON.stringify(todosLosProductos));
    navigate('/iniciar-sesion');
  };

  const handleCancelLogin = () => {
    setShowAuthAlert(false);
  };

  const calcularTotal = () => {
      const totalProductosSeleccionados = productosSeleccionados.reduce((total, producto) => 
          total + (producto.precio * producto.cantidad), 0
      );
      
      const totalCarrito = carrito.reduce((total, producto) => 
          total + (producto.precio * producto.cantidad), 0
      );
      
      const totalProductosContexto = productosDelContexto.reduce((total, producto) => 
          total + (producto.precio * producto.cantidad), 0
      );
      
      return totalProductosSeleccionados + totalCarrito + totalProductosContexto;
  };

  const obtenerTodosLosProductos = () => {
    const todosLosProductos = [...productosDelContexto, ...carrito];
    
    const productosAgrupados = todosLosProductos.reduce((acc, producto) => {
        const productoExistente = acc.find(p => p.id === producto.id);
        
        if (productoExistente) {
            productoExistente.cantidad += producto.cantidad;
        } else {
            acc.push({ ...producto });
        }
        
        return acc;
    }, []);
    
    return productosAgrupados;
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

  // Obtener productos de la categoría activa
  const productosCategoria = productos[categoriaActiva] || [];

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
          Selección de Productos
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '16px' }}>
          Elige tus productos favoritos
        </p>
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
        {productosCategoria.length === 0 ? (
          <div style={{ 
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
            <h3 style={{ color: '#7f8c8d' }}>No hay productos disponibles en esta categoría</h3>
          </div>
        ) : (
          productosCategoria.map(producto => {
            const yaSeleccionado = obtenerTodosLosProductos().find(p => p.id === producto.id);

            return (
              <div
                key={producto.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: yaSeleccionado ? '0 8px 25px rgba(233,30,99,0.2)' : '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: yaSeleccionado ? '2px solid #e91e63' : '2px solid transparent',
                  transform: yaSeleccionado ? 'translateY(-5px)' : 'none'
                }}
                onClick={() => seleccionarProducto(producto)}
              >
                <div style={{ 
                  height: '200px', 
                  backgroundImage: `url(${producto.imagen})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  {yaSeleccionado && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: '#e91e63',
                      color: 'white',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px'
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
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      backgroundColor: yaSeleccionado ? '#4caf50' : '#e91e63',
                      color: 'white'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      seleccionarProducto(producto);
                    }}
                  >
                    {yaSeleccionado ? 'Seleccionado' : 'Seleccionar'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resumen */}
      {(productosSeleccionados.length > 0 || carrito.length > 0 || productosDelContexto.length > 0) && (
        <div id="resumen-pedido" style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '25px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#2c3e50',
            marginBottom: '20px',
            margin: '0 0 20px 0'
          }}>
            Resumen de Pedido ({obtenerTodosLosProductos().length + carrito.length} productos)
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            {obtenerTodosLosProductos().map(producto => (
              <div
                key={`producto-${producto.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px 0',
                  borderBottom: '1px solid #ecf0f1'
                }}
              >
                <div>
                  <span style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '500' }}>
                    {producto.nombre}
                  </span>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '4px' }}>
                    ${producto.precio.toLocaleString()}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => actualizarCantidadUnificada(producto.id, producto.cantidad - 1)}
                    style={{
                      padding: '5px 10px',
                      border: 'none',
                      borderRadius: '5px',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{producto.cantidad}</span>
                  <button
                    onClick={() => actualizarCantidadUnificada(producto.id, producto.cantidad + 1)}
                    style={{
                      padding: '5px 10px',
                      border: 'none',
                      borderRadius: '5px',
                      backgroundColor: '#2ecc71',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    +
                  </button>
                  <button
                    onClick={() => eliminarProductoUnificado(producto.id)}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => abrirModal(producto)}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      backgroundColor: '#3498db',
                      color: 'white',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '20px',
            borderTop: '2px solid #ecf0f1'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
              Total: ${calcularTotal().toLocaleString()}
            </div>
            
            <button
              onClick={continuar}
              style={{
                padding: '15px 30px',
                border: 'none',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                background: 'linear-gradient(45deg, #e91e63, #ff6b9d)',
                color: 'white',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(233,30,99,0.3)'
              }}
            >
              Continuar con Personalización →
            </button>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
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
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
            
            <div style={{
              height: '200px',
              backgroundImage: `url(${modalDetalle.imagen})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '15px',
              marginBottom: '20px'
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
              fontSize: '18px', 
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
              lineHeight: '1.5',
              margin: 0
            }}>
              {modalDetalle.descripcion}
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
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
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#2c3e50',
              marginBottom: '20px'
            }}>
              ¿Estás seguro que seleccionaste todo lo que deseas?
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <button
                onClick={handleCancelContinue}
                style={{
                  padding: '12px 25px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  transition: 'background-color 0.3s ease'
                }}
              >
                No, volver
              </button>
              <button
                onClick={handleConfirmContinue}
                style={{
                  padding: '12px 25px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  transition: 'background-color 0.3s ease'
                }}
              >
                Sí, continuar
              </button>
            </div>
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
        `}
      </style>
    </div>
  );
};

export default ProductosView;