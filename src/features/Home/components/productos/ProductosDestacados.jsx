import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../../Cartas/pages/CartContext';
import productoApiService from '../../../Admin/services/productos_services.js';
import { FiEye } from "react-icons/fi";
import 'bootstrap/dist/css/bootstrap.min.css';
import './ProductosDestacados.css';

const ProductosDestacados = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(null);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const navigate = useNavigate();
  const { carrito, agregarProducto } = useContext(CartContext);

  useEffect(() => {
    cargarProductosDestacados();
  }, []);

  const cargarProductosDestacados = async () => {
    try {
      console.log('Cargando productos destacados...');
      setLoading(true);
      setError(null);
      
      const productosDestacados = await productoApiService.obtenerProductosMasVendidos(6);
      console.log('Productos destacados obtenidos:', productosDestacados);
      
      setProductos(productosDestacados);
    } catch (error) {
      console.error('Error al cargar productos destacados:', error);
      setError('No se pudieron cargar los productos destacados');
    } finally {
      setLoading(false);
    }
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio || 0);
  };

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  const handleAgregarCarrito = (producto, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const productoConCantidad = { 
      ...producto, 
      cantidad: 1,
      id: producto.id || producto.idproductogeneral,
      nombre: producto.nombre || producto.nombreproducto,
      precio: producto.precio || producto.precioproducto,
      imagen: obtenerImagenProducto(producto)
    };
    
    agregarProducto(productoConCantidad);
    showCustomAlert('success', `${productoConCantidad.nombre} agregado al carrito!`);
  };

  const abrirModal = (producto) => {
    setModalDetalle(producto);
  };

  const cerrarModal = () => {
    setModalDetalle(null);
  };

  const handleVerTodos = () => {
    navigate('/pedidos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const obtenerImagenProducto = (producto) => {
    if (producto.urlimagen && producto.urlimagen.trim()) {
      return producto.urlimagen;
    }
    
    const nombreLower = producto.nombre?.toLowerCase() || producto.nombreproducto?.toLowerCase() || '';
    
    if (nombreLower.includes('torta') || nombreLower.includes('cake')) {
      return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=350&fit=crop&crop=center&auto=format&q=80";
    } else if (nombreLower.includes('cupcake') || nombreLower.includes('muffin')) {
      return "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=500&h=350&fit=crop&crop=center&auto=format&q=80";
    } else if (nombreLower.includes('galleta') || nombreLower.includes('cookie')) {
      return "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&h=350&fit=crop&crop=center&auto=format&q=80";
    } else if (nombreLower.includes('cheesecake')) {
      return "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&h=350&fit=crop&crop=center&auto=format&q=80";
    } else if (nombreLower.includes('macaron')) {
      return "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=500&h=350&fit=crop&crop=center&auto=format&q=80";
    } else {
      return "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=500&h=350&fit=crop&crop=center&auto=format&q=80";
    }
  };

  const obtenerDescripcionProducto = (producto) => {
    if (producto.especificaciones && producto.especificaciones.trim()) {
      return producto.especificaciones;
    }
    
    if (producto.descripcion && producto.descripcion.trim()) {
      return producto.descripcion;
    }
    
    if (producto.especificacionesreceta && producto.especificacionesreceta.trim()) {
      return producto.especificacionesreceta;
    }
    
    const nombreLower = producto.nombre?.toLowerCase() || producto.nombreproducto?.toLowerCase() || '';
    
    if (nombreLower.includes('torta') || nombreLower.includes('cake')) {
      return "Deliciosa torta hecha con los mejores ingredientes y mucho amor";
    } else if (nombreLower.includes('cupcake') || nombreLower.includes('muffin')) {
      return "Cupcakes esponjosos con decoración artesanal personalizada";
    } else if (nombreLower.includes('galleta') || nombreLower.includes('cookie')) {
      return "Galletas artesanales crujientes con glaseado real";
    } else if (nombreLower.includes('cheesecake')) {
      return "Cremoso cheesecake con base de galleta crujiente";
    } else if (nombreLower.includes('macaron')) {
      return "Macarons franceses de colores vibrantes y sabores únicos";
    } else {
      return "Producto artesanal elaborado con amor en Delicias Darsy";
    }
  };

  if (loading) {
    return (
      <section className="productos-destacados-section py-5">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="section-title display-4 fw-bold mb-3">
              Productos Destacados
              <div className="underline-gradient mx-auto"></div>
            </h2>
            <p className="lead text-muted d-flex align-items-center justify-content-center gap-2">
              <i className="fa-solid fa-arrows-rotate" style={{animation: 'spin 1s linear infinite'}}></i>
              Cargando deliciosos productos...
            </p>
          </div>
          
          <div className="row g-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="col-lg-4 col-md-6">
                <div className="card h-100 loading-card shadow-sm">
                  <div className="loading-image-placeholder"></div>
                  <div className="card-body text-center">
                    <div className="loading-line mb-3"></div>
                    <div className="loading-line-short mb-3"></div>
                    <div className="loading-price mb-3"></div>
                    <div className="loading-line-short"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="productos-destacados-section py-5">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="section-title display-4 fw-bold mb-3">
              Productos Destacados
              <div className="underline-gradient mx-auto"></div>
            </h2>
          </div>
          
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="error-container text-center">
                <i className="fas fa-exclamation-triangle text-danger mb-3" style={{fontSize: '4rem'}}></i>
                <h4 className="text-danger mb-3">¡Ups! Algo salió mal</h4>
                <p className="text-muted mb-4">{error}</p>
                <button 
                  onClick={cargarProductosDestacados}
                  className="btn btn-ver-todos-modern"
                >
                  <i className="fas fa-sync-alt"></i>
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="productos-destacados-section py-5">
      <div className="container">
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

        {/* Header mejorado */}
        <div className="section-header text-center mb-5">
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              textAlign: "center",
              color: "#2C3E50",
              position: "relative",
              display: "inline-block",
              marginBottom: "1rem",
            }}
          >
            Productos Destacados
            <span
              style={{
                display: "block",
                width: "80px",
                height: "4px",
                background: "linear-gradient(90deg, #FF1493, #FFCC00)",
                borderRadius: "2px",
                margin: "0.5rem auto 0 auto",
              }}
            ></span>
          </h2>
          <p className="lead text-muted">
            Deliciosas creaciones hechas con amor y los mejores ingredientes
          </p>
        </div>

        {/* Grid de productos con estilo de ProductosView */}
        <div className="row g-4 mb-5">
          {productos.slice(0, 6).map((producto, index) => {
            const productoId = producto.id || producto.idproductogeneral;
            const yaEnCarrito = carrito.find(p => p.id === productoId);

            return (
              <div key={productoId || index} className="col-lg-4 col-md-6">
                <div
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: yaEnCarrito ? '0 8px 25px rgba(233,30,99,0.2)' : '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: yaEnCarrito ? '2px solid #e91e63' : '2px solid transparent',
                    transform: yaEnCarrito ? 'translateY(-5px)' : 'none',
                    height: '100%'
                  }}
                >
                  <div 
                    style={{ 
                      height: '200px', 
                      backgroundImage: `url(${obtenerImagenProducto(producto)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}
                    onClick={() => abrirModal(producto)}
                  >
                    {/* Icono de ver detalles */}
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
                      {producto.nombre || producto.nombreproducto}
                    </h3>
                    
                    <p style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold',
                      color: '#e91e63',
                      margin: '0 0 15px 0'
                    }}>
                      {formatearPrecio(producto.precio || producto.precioproducto)}
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
                      onClick={(e) => handleAgregarCarrito(producto, e)}
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
              </div>
            );
          })}
        </div>

        {/* Botón Ver Todos */}
        {productos.length > 0 && (
          <div className="text-center">
            <button 
              onClick={handleVerTodos}
              className="btn btn-ver-todos-modern"
              type="button"
            >
              Ver Todos los Productos
            </button>
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
                backgroundImage: `url(${obtenerImagenProducto(modalDetalle)})`,
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
                {modalDetalle.nombre || modalDetalle.nombreproducto}
              </h2>
              
              <p style={{ 
                fontSize: '28px', 
                fontWeight: 'bold',
                color: '#e91e63',
                marginBottom: '15px',
                margin: '0 0 15px 0'
              }}>
                {formatearPrecio(modalDetalle.precio || modalDetalle.precioproducto)}
              </p>
              
              <p style={{ 
                fontSize: '16px', 
                color: '#7f8c8d',
                lineHeight: '1.6',
                marginBottom: '20px',
                margin: '0 0 20px 0'
              }}>
                {obtenerDescripcionProducto(modalDetalle)}
              </p>
              
              <button
                onClick={(e) => {
                  handleAgregarCarrito(modalDetalle, e);
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

        {/* Estado vacío */}
        {productos.length === 0 && !loading && !error && (
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="empty-state text-center">
                <i className="fas fa-box-open text-info mb-3" style={{fontSize: '4rem'}}></i>
                <h4 className="text-info mb-3">No hay productos destacados</h4>
                <p className="text-muted mb-4">
                  No hay productos destacados disponibles en este momento, pero tenemos muchas otras delicias esperándote.
                </p>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <button 
                    onClick={cargarProductosDestacados}
                    className="btn btn-outline-primary d-flex align-items-center gap-2"
                    type="button"
                  >
                    <i className="fas fa-sync-alt"></i>
                    Recargar
                  </button>
                  <button 
                    onClick={handleVerTodos}
                    className="btn btn-ver-todos-modern"
                    type="button"
                  >
                    Ver Todos los Productos
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <style>{`
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
              transform: scale(0.8);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </section>
  );
};

export default ProductosDestacados;