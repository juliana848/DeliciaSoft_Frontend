import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';

const CarritoView = () => {
  const navigate = useNavigate();
  const { carrito, actualizarCantidadCarrito, eliminarDelCarrito, vaciarCarrito } = useContext(CartContext);
  
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState(null);

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  const calcularSubtotal = () => {
    return carrito.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);
  };

  const calcularIVA = () => {
    return Math.round(calcularSubtotal() * 0.19);
  };

  const calcularTotal = () => {
    return calcularSubtotal() + calcularIVA();
  };

  const handleActualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      const producto = carrito.find(p => p.id === id);
      setProductoToDelete(producto);
      setShowConfirmDelete(true);
      return;
    }
    
    if (nuevaCantidad > 100) {
      showCustomAlert('error', 'Cantidad máxima: 100 unidades por producto');
      return;
    }
    
    actualizarCantidadCarrito(id, nuevaCantidad);
    showCustomAlert('success', 'Cantidad actualizada');
  };

  const handleEliminarProducto = (producto) => {
    setProductoToDelete(producto);
    setShowConfirmDelete(true);
  };

  const confirmarEliminar = () => {
    eliminarDelCarrito(productoToDelete.id);
    setShowConfirmDelete(false);
    setProductoToDelete(null);
    showCustomAlert('success', `${productoToDelete.nombre} eliminado del carrito`);
  };

  const handleVaciarCarrito = () => {
    setShowConfirmClear(true);
  };

  const confirmarVaciar = () => {
    vaciarCarrito();
    setShowConfirmClear(false);
    showCustomAlert('success', 'Carrito vaciado correctamente');
  };

  // ✅✅✅ FUNCIÓN CLAVE - AQUÍ SE REDIRIGE A PERSONALIZACIÓN ✅✅✅
  const handleProcederCheckout = () => {
    const cantidadTotal = carrito.reduce((total, producto) => total + producto.cantidad, 0);
    
    // Validar cantidad mínima
    if (cantidadTotal < 10) {
      showCustomAlert('error', `Necesitas al menos 10 productos para continuar. Tienes ${cantidadTotal} productos.`);
      return;
    }

    // Validar cantidad máxima
    if (cantidadTotal > 100) {
      showCustomAlert('error', `Máximo 100 productos permitidos. Tienes ${cantidadTotal} productos.`);
      return;
    }

    // Verificar autenticación
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      showCustomAlert('error', 'Debes iniciar sesión para continuar con tu pedido');
      setTimeout(() => {
        navigate('/iniciar-sesion');
      }, 2000);
      return;
    }

    // ✅ REDIRECCIÓN A PERSONALIZACIÓN INDIVIDUAL
    showCustomAlert('success', '✅ Iniciando personalización de productos...');
    
    // Guardar productos en localStorage como respaldo
    localStorage.setItem('carritoParaPersonalizar', JSON.stringify(carrito));
    
    setTimeout(() => {
      // 🎯 ESTA ES LA RUTA CORRECTA HACIA PERSONALIZACIÓN INDIVIDUAL
      navigate('/pedidos/PersonalizacionProductos');
    }, 1000);
  };

  const cantidadTotal = carrito.reduce((total, producto) => total + producto.cantidad, 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      padding: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Alertas */}
      {showAlert.show && (
        <div style={{
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
          background: showAlert.type === 'success'
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : showAlert.type === 'error'
            ? 'linear-gradient(135deg, #ec4899, #be185d)'
            : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          animation: 'slideInRight 0.5s ease-out'
        }}>
          {showAlert.message}
        </div>
      )}

      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 30px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          background: 'linear-gradient(45deg, #e91e63, #f06292)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px'
        }}>
          🛒 Mi Carrito de Compras
        </h1>
        <p style={{ color: '#6c757d', fontSize: '16px' }}>
          {carrito.length === 0 
            ? 'Tu carrito está vacío' 
            : `${carrito.length} producto${carrito.length > 1 ? 's' : ''} en tu carrito (${cantidadTotal} unidad${cantidadTotal > 1 ? 'es' : ''})`
          }
        </p>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: carrito.length > 0 ? '1fr 400px' : '1fr',
        gap: '30px'
      }}>
        {/* Lista de productos */}
        <div>
          {carrito.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '60px 40px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '80px', marginBottom: '20px' }}>🛒</div>
              <h2 style={{ color: '#495057', marginBottom: '15px' }}>
                Tu carrito está vacío
              </h2>
              <p style={{ color: '#6c757d', marginBottom: '30px' }}>
                Agrega productos desde nuestra carta para comenzar tu pedido
              </p>
              <button
                onClick={() => navigate('/cartas')}
                style={{
                  padding: '12px 30px',
                  border: 'none',
                  borderRadius: '25px',
                  background: 'linear-gradient(45deg, #e91e63, #f06292)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(233,30,99,0.3)'
                }}
              >
                Ver Productos
              </button>
            </div>
          ) : (
            <>
              {/* Botón vaciar carrito */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '20px', color: '#495057', fontWeight: '600' }}>
                  Productos en tu carrito
                </h3>
                <button
                  onClick={handleVaciarCarrito}
                  style={{
                    padding: '8px 16px',
                    border: '2px solid #dc3545',
                    borderRadius: '10px',
                    background: 'white',
                    color: '#dc3545',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#dc3545';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#dc3545';
                  }}
                >
                  🗑️ Vaciar carrito
                </button>
              </div>

              {/* Productos */}
              {carrito.map((producto) => (
                <div key={producto.id} style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '20px',
                  marginBottom: '15px',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                  border: '1px solid #f0f2f5',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'center'
                }}>
                  {/* Imagen */}
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    backgroundImage: `url(${producto.imagen})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }} />

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#343a40',
                      marginBottom: '8px'
                    }}>
                      {producto.nombre}
                    </h4>
                    <p style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#e91e63',
                      marginBottom: '15px'
                    }}>
                      ${producto.precio.toLocaleString()} c/u
                    </p>

                    {/* Controles de cantidad */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: '#f8f9fa',
                        borderRadius: '10px',
                        padding: '5px'
                      }}>
                        <button
                          onClick={() => handleActualizarCantidad(producto.id, producto.cantidad - 1)}
                          style={{
                            width: '35px',
                            height: '35px',
                            border: 'none',
                            borderRadius: '8px',
                            background: '#dc3545',
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          -
                        </button>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          minWidth: '40px',
                          textAlign: 'center',
                          color: '#495057'
                        }}>
                          {producto.cantidad}
                        </span>
                        <button
                          onClick={() => handleActualizarCantidad(producto.id, producto.cantidad + 1)}
                          style={{
                            width: '35px',
                            height: '35px',
                            border: 'none',
                            borderRadius: '8px',
                            background: '#28a745',
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          +
                        </button>
                      </div>

                      <div style={{
                        fontSize: '16px',
                        color: '#6c757d'
                      }}>
                        Subtotal: <strong style={{ color: '#e91e63' }}>
                          ${(producto.precio * producto.cantidad).toLocaleString()}
                        </strong>
                      </div>

                      <button
                        onClick={() => handleEliminarProducto(producto)}
                        style={{
                          padding: '8px 16px',
                          border: 'none',
                          borderRadius: '10px',
                          background: '#fff5f5',
                          color: '#dc3545',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          marginLeft: 'auto'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#dc3545';
                          e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#fff5f5';
                          e.target.style.color = '#dc3545';
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Botón continuar comprando */}
              <button
                onClick={() => navigate('/cartas')}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e91e63',
                  borderRadius: '15px',
                  background: 'white',
                  color: '#e91e63',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginTop: '10px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#fce4ec';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                }}
              >
                ← Continuar comprando
              </button>
            </>
          )}
        </div>

        {/* Resumen del pedido */}
        {carrito.length > 0 && (
          <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '25px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              border: '2px solid #f0f2f5'
            }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#495057',
                marginBottom: '20px',
                borderBottom: '2px solid #f0f2f5',
                paddingBottom: '15px'
              }}>
                📋 Resumen del Pedido
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  fontSize: '16px',
                  color: '#6c757d'
                }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: '600' }}>
                    ${calcularSubtotal().toLocaleString()}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  fontSize: '16px',
                  color: '#6c757d'
                }}>
                  <span>IVA (19%):</span>
                  <span style={{ fontWeight: '600' }}>
                    ${calcularIVA().toLocaleString()}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '15px',
                  borderTop: '2px solid #f0f2f5',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#e91e63'
                }}>
                  <span>Total:</span>
                  <span>${calcularTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Advertencia de cantidad mínima */}
              {cantidadTotal < 10 && (
                <div style={{
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '10px',
                  padding: '12px',
                  marginBottom: '15px',
                  fontSize: '14px',
                  color: '#856404'
                }}>
                  ⚠️ Necesitas al menos <strong>10 productos</strong> para continuar.
                  <br />
                  Tienes: <strong>{cantidadTotal}</strong>
                </div>
              )}

              {cantidadTotal > 100 && (
                <div style={{
                  background: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '10px',
                  padding: '12px',
                  marginBottom: '15px',
                  fontSize: '14px',
                  color: '#721c24'
                }}>
                  ⚠️ Máximo <strong>100 productos</strong> permitidos.
                  <br />
                  Tienes: <strong>{cantidadTotal}</strong>
                </div>
              )}

              {/* ✅ BOTÓN PRINCIPAL - COMPRAR Y PERSONALIZAR */}
              <button
                onClick={handleProcederCheckout}
                disabled={cantidadTotal < 10 || cantidadTotal > 100}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: 'none',
                  borderRadius: '15px',
                  background: (cantidadTotal >= 10 && cantidadTotal <= 100)
                    ? 'linear-gradient(45deg, #e91e63, #f06292)'
                    : '#6c757d',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: (cantidadTotal >= 10 && cantidadTotal <= 100) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  boxShadow: (cantidadTotal >= 10 && cantidadTotal <= 100)
                    ? '0 4px 15px rgba(233,30,99,0.3)'
                    : 'none',
                  opacity: (cantidadTotal >= 10 && cantidadTotal <= 100) ? 1 : 0.6
                }}
              >
                {cantidadTotal < 10 
                  ? `Faltan ${10 - cantidadTotal} productos` 
                  : cantidadTotal > 100
                  ? `Elimina ${cantidadTotal - 100} productos`
                  : '🛍️ Comprar y Personalizar →'
                }
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal confirmar vaciar */}
      {showConfirmClear && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '400px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🗑️</div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#495057',
              marginBottom: '15px'
            }}>
              ¿Vaciar carrito?
            </h3>
            <p style={{ color: '#6c757d', marginBottom: '25px' }}>
              Se eliminarán todos los productos de tu carrito. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowConfirmClear(false)}
                style={{
                  padding: '12px 24px',
                  border: '2px solid #6c757d',
                  borderRadius: '10px',
                  background: 'white',
                  color: '#6c757d',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarVaciar}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '10px',
                  background: '#dc3545',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Sí, vaciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {showConfirmDelete && productoToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '400px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>❓</div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#495057',
              marginBottom: '15px'
            }}>
              ¿Eliminar producto?
            </h3>
            <p style={{ color: '#6c757d', marginBottom: '25px' }}>
              ¿Estás seguro que deseas eliminar <strong>{productoToDelete.nombre}</strong> del carrito?
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  setProductoToDelete(null);
                }}
                style={{
                  padding: '12px 24px',
                  border: '2px solid #6c757d',
                  borderRadius: '10px',
                  background: 'white',
                  color: '#6c757d',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '10px',
                  background: '#dc3545',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
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

          @media (max-width: 1024px) {
            div[style*="grid-template-columns"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default CarritoView;