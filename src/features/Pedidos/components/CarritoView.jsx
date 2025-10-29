import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';

const CarritoView = () => {
  const navigate = useNavigate();
  const { carrito, actualizarCantidadCarrito, eliminarDelCarrito, vaciarCarrito } = useContext(CartContext);
  
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '', icon: '' });
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState(null);

  // 🔥 PERSISTIR CARRITO EN LOCALSTORAGE AUTOMÁTICAMENTE
  useEffect(() => {
    if (carrito && carrito.length > 0) {
      localStorage.setItem('carritoProductos', JSON.stringify(carrito));
      console.log('✅ Carrito guardado automáticamente:', carrito.length, 'productos');
    }
  }, [carrito]);

  const showCustomAlert = (type, message, icon = '') => {
    setShowAlert({ show: true, type, message, icon });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '', icon: '' });
    }, 4000);
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
      showCustomAlert('warning', 'Cantidad máxima: 100 unidades por producto', '⚠️');
      return;
    }
    
    actualizarCantidadCarrito(id, nuevaCantidad);
    showCustomAlert('success', 'Cantidad actualizada correctamente', '✅');
  };

  const handleEliminarProducto = (producto) => {
    setProductoToDelete(producto);
    setShowConfirmDelete(true);
  };

  const confirmarEliminar = () => {
    eliminarDelCarrito(productoToDelete.id);
    setShowConfirmDelete(false);
    setProductoToDelete(null);
    showCustomAlert('success', `${productoToDelete.nombre} eliminado del carrito`, '🗑️');
  };

  const handleVaciarCarrito = () => {
    setShowConfirmClear(true);
  };

  const confirmarVaciar = () => {
    vaciarCarrito();
    // 🔥 Limpiar localStorage al vaciar carrito explícitamente
    localStorage.removeItem('carritoProductos');
    localStorage.removeItem('carritoParaPersonalizar');
    setShowConfirmClear(false);
    showCustomAlert('success', 'Carrito vaciado correctamente', '✨');
  };

  const handleProcederCheckout = () => {
    const cantidadTotal = carrito.reduce((total, producto) => total + producto.cantidad, 0);
    
    // Validar cantidad mínima
    if (cantidadTotal < 10) {
      showCustomAlert(
        'warning', 
        `Necesitas al menos 10 productos para continuar. Actualmente tienes ${cantidadTotal} producto${cantidadTotal !== 1 ? 's' : ''}.`, 
        '📦'
      );
      return;
    }

    // Validar cantidad máxima
    if (cantidadTotal > 100) {
      showCustomAlert(
        'warning', 
        `Máximo 100 productos permitidos. Tienes ${cantidadTotal} productos. Por favor elimina ${cantidadTotal - 100}.`, 
        '⚠️'
      );
      return;
    }

    // Verificar autenticación
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      showCustomAlert(
        'info', 
        'Debes iniciar sesión para continuar con tu pedido. Redirigiendo...', 
        '🔐'
      );
      setTimeout(() => {
        navigate('/iniciar-sesion');
      }, 2000);
      return;
    }

    // ✅ REDIRECCIÓN A PERSONALIZACIÓN
    showCustomAlert('success', 'Iniciando personalización de productos...', '✨');
    
    // Guardar productos en localStorage como respaldo
    localStorage.setItem('carritoParaPersonalizar', JSON.stringify(carrito));
    
    setTimeout(() => {
      navigate('/pedidos/PersonalizacionProductos');
    }, 1000);
  };

  const cantidadTotal = carrito.reduce((total, producto) => total + producto.cantidad, 0);

  // 🎨 COMPONENTE DE ALERTA MEJORADA
  const AlertaMejorada = () => {
    if (!showAlert.show) return null;

    const alertStyles = {
      success: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        border: '2px solid #047857',
        iconColor: '#d1fae5'
      },
      warning: {
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        border: '2px solid #d97706',
        iconColor: '#fef3c7'
      },
      info: {
        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        border: '2px solid #be185d',
        iconColor: '#fce7f3'
      },
      error: {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        border: '2px solid #b91c1c',
        iconColor: '#fee2e2'
      }
    };

    const currentStyle = alertStyles[showAlert.type] || alertStyles.info;

    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 2000,
        minWidth: '350px',
        maxWidth: '450px',
        background: currentStyle.background,
        border: currentStyle.border,
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1) inset',
        animation: 'slideInBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '15px',
          padding: '20px'
        }}>
          <div style={{
            fontSize: '32px',
            flexShrink: 0,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            background: currentStyle.iconColor,
            borderRadius: '12px',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {showAlert.icon}
          </div>
          <div style={{ flex: 1, paddingTop: '2px' }}>
            <p style={{
              margin: 0,
              color: 'white',
              fontSize: '15px',
              fontWeight: '600',
              lineHeight: '1.5',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}>
              {showAlert.message}
            </p>
          </div>
        </div>
        <div style={{
          height: '4px',
          background: 'rgba(255,255,255,0.3)',
          animation: 'progressBar 4s linear'
        }} />
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fff7ed 100%)',
      padding: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Alerta Mejorada */}
      <AlertaMejorada />

      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 30px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '800',
          background: 'linear-gradient(45deg, #ec4899, #f472b6, #fbbf24)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px',
          textShadow: '0 2px 10px rgba(236, 72, 153, 0.2)'
        }}>
          🛒 Mi Carrito de Compras
        </h1>
        <p style={{ color: '#78716c', fontSize: '16px', fontWeight: '500' }}>
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
              borderRadius: '24px',
              padding: '60px 40px',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(236, 72, 153, 0.15)',
              border: '2px solid #fce7f3'
            }}>
              <div style={{ fontSize: '80px', marginBottom: '20px' }}>🛒</div>
              <h2 style={{ color: '#57534e', marginBottom: '15px', fontWeight: '700' }}>
                Tu carrito está vacío
              </h2>
              <p style={{ color: '#78716c', marginBottom: '30px' }}>
                Agrega productos desde nuestro catálogo para comenzar tu pedido
              </p>
              <button
                onClick={() => navigate('/pedidos')}
                style={{
                  padding: '14px 32px',
                  border: 'none',
                  borderRadius: '25px',
                  background: 'linear-gradient(45deg, #ec4899, #f472b6)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 6px 20px rgba(236, 72, 153, 0.4)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Ver Productos 🎂
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
                <h3 style={{ fontSize: '20px', color: '#57534e', fontWeight: '700' }}>
                  Productos en tu carrito
                </h3>
                <button
                  onClick={handleVaciarCarrito}
                  style={{
                    padding: '10px 18px',
                    border: '2px solid #ef4444',
                    borderRadius: '12px',
                    background: 'white',
                    color: '#ef4444',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#ef4444';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#ef4444';
                    e.target.style.transform = 'scale(1)';
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
                  boxShadow: '0 5px 20px rgba(236, 72, 153, 0.1)',
                  border: '2px solid #fce7f3',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {/* Imagen */}
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    backgroundImage: `url(${producto.imagen})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '3px solid #fce7f3'
                  }} />

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#292524',
                      marginBottom: '8px'
                    }}>
                      {producto.nombre}
                    </h4>
                    <p style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#ec4899',
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
                        background: '#fef3c7',
                        borderRadius: '12px',
                        padding: '5px',
                        border: '2px solid #fbbf24'
                      }}>
                        <button
                          onClick={() => handleActualizarCantidad(producto.id, producto.cantidad - 1)}
                          style={{
                            width: '36px',
                            height: '36px',
                            border: 'none',
                            borderRadius: '10px',
                            background: '#ef4444',
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                          -
                        </button>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          minWidth: '40px',
                          textAlign: 'center',
                          color: '#78350f'
                        }}>
                          {producto.cantidad}
                        </span>
                        <button
                          onClick={() => handleActualizarCantidad(producto.id, producto.cantidad + 1)}
                          style={{
                            width: '36px',
                            height: '36px',
                            border: 'none',
                            borderRadius: '10px',
                            background: '#10b981',
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                          +
                        </button>
                      </div>

                      <div style={{
                        fontSize: '16px',
                        color: '#78716c',
                        fontWeight: '500'
                      }}>
                        Subtotal: <strong style={{ color: '#ec4899', fontSize: '18px' }}>
                          ${(producto.precio * producto.cantidad).toLocaleString()}
                        </strong>
                      </div>

                      <button
                        onClick={() => handleEliminarProducto(producto)}
                        style={{
                          padding: '10px 18px',
                          border: 'none',
                          borderRadius: '12px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          marginLeft: 'auto'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#dc2626';
                          e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#fee2e2';
                          e.target.style.color = '#dc2626';
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
                onClick={() => navigate('/pedidos')}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '2px solid #ec4899',
                  borderRadius: '16px',
                  background: 'white',
                  color: '#ec4899',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginTop: '10px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#fce7f3';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.transform = 'translateY(0)';
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
              borderRadius: '24px',
              padding: '25px',
              boxShadow: '0 10px 40px rgba(236, 72, 153, 0.15)',
              border: '2px solid #fce7f3'
            }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#57534e',
                marginBottom: '20px',
                borderBottom: '2px solid #fce7f3',
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
                  color: '#78716c',
                  fontWeight: '500'
                }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: '700' }}>
                    ${calcularSubtotal().toLocaleString()}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  fontSize: '16px',
                  color: '#78716c',
                  fontWeight: '500'
                }}>
                  <span>IVA (19%):</span>
                  <span style={{ fontWeight: '700' }}>
                    ${calcularIVA().toLocaleString()}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '15px',
                  borderTop: '2px solid #fce7f3',
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#ec4899'
                }}>
                  <span>Total:</span>
                  <span>${calcularTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Advertencia de cantidad mínima */}
              {cantidadTotal < 10 && (
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: '2px solid #fbbf24',
                  borderRadius: '12px',
                  padding: '15px',
                  marginBottom: '15px',
                  fontSize: '14px',
                  color: '#78350f',
                  fontWeight: '600'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📦</div>
                  Necesitas al menos <strong>10 productos</strong> para continuar.
                  <br />
                  <span style={{ fontSize: '16px' }}>
                    Tienes: <strong>{cantidadTotal}</strong>
                  </span>
                </div>
              )}

              {cantidadTotal > 100 && (
                <div style={{
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  border: '2px solid #ef4444',
                  borderRadius: '12px',
                  padding: '15px',
                  marginBottom: '15px',
                  fontSize: '14px',
                  color: '#7f1d1d',
                  fontWeight: '600'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
                  Máximo <strong>100 productos</strong> permitidos.
                  <br />
                  <span style={{ fontSize: '16px' }}>
                    Tienes: <strong>{cantidadTotal}</strong>
                  </span>
                </div>
              )}

              {/* ✅ BOTÓN PRINCIPAL - COMPRAR Y PERSONALIZAR */}
              <button
                onClick={handleProcederCheckout}
                disabled={cantidadTotal < 10 || cantidadTotal > 100}
                style={{
                  width: '100%',
                  padding: '16px',
                  border: 'none',
                  borderRadius: '16px',
                  background: (cantidadTotal >= 10 && cantidadTotal <= 100)
                    ? 'linear-gradient(45deg, #ec4899, #f472b6, #fbbf24)'
                    : '#a8a29e',
                  color: 'white',
                  fontSize: '17px',
                  fontWeight: '700',
                  cursor: (cantidadTotal >= 10 && cantidadTotal <= 100) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  boxShadow: (cantidadTotal >= 10 && cantidadTotal <= 100)
                    ? '0 6px 20px rgba(236, 72, 153, 0.4)'
                    : 'none',
                  opacity: (cantidadTotal >= 10 && cantidadTotal <= 100) ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (cantidadTotal >= 10 && cantidadTotal <= 100) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(236, 72, 153, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (cantidadTotal >= 10 && cantidadTotal <= 100) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.4)';
                  }
                }}
              >
                {cantidadTotal < 10 
                  ? `Faltan ${10 - cantidadTotal} productos 📦` 
                  : cantidadTotal > 100
                  ? `Elimina ${cantidadTotal - 100} productos ⚠️`
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
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '35px',
            maxWidth: '420px',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            border: '2px solid #fce7f3',
            animation: 'scaleIn 0.3s ease'
          }}>
            <div style={{ fontSize: '70px', marginBottom: '20px' }}>🗑️</div>
            <h3 style={{
              fontSize: '26px',
              fontWeight: '800',
              color: '#57534e',
              marginBottom: '15px'
            }}>
              ¿Vaciar carrito?
            </h3>
            <p style={{ color: '#78716c', marginBottom: '30px', fontSize: '15px', lineHeight: '1.6' }}>
              Se eliminarán <strong>todos los productos</strong> de tu carrito. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowConfirmClear(false)}
                style={{
                  padding: '12px 28px',
                  border: '2px solid #78716c',
                  borderRadius: '12px',
                  background: 'white',
                  color: '#78716c',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f5f5f4';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarVaciar}
                style={{
                  padding: '12px 28px',
                  border: 'none',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
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
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '35px',
            maxWidth: '420px',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            border: '2px solid #fce7f3',
            animation: 'scaleIn 0.3s ease'
          }}>
            <div style={{ fontSize: '70px', marginBottom: '20px' }}>❓</div>
            <h3 style={{
              fontSize: '26px',
              fontWeight: '800',
              color: '#57534e',
              marginBottom: '15px'
            }}>
              ¿Eliminar producto?
            </h3>
            <p style={{ color: '#78716c', marginBottom: '30px', fontSize: '15px', lineHeight: '1.6' }}>
              ¿Estás seguro que deseas eliminar <strong>{productoToDelete.nombre}</strong> del carrito?
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  setProductoToDelete(null);
                }}
                style={{
                  padding: '12px 28px',
                  border: '2px solid #78716c',
                  borderRadius: '12px',
                  background: 'white',
                  color: '#78716c',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f5f5f4';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                style={{
                  padding: '12px 28px',
                  border: 'none',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
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
          @keyframes slideInBounce {
            0% {
              transform: translateX(100%) scale(0.8);
              opacity: 0;
            }
            60% {
              transform: translateX(-10px) scale(1.05);
              opacity: 1;
            }
            100% {
              transform: translateX(0) scale(1);
              opacity: 1;
            }
          }

          @keyframes progressBar {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
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

          @media (max-width: 1024px) {
            div[style*="grid-template-columns"] {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 768px) {
            div[style*="min-width: 350px"] {
              min-width: 90vw !important;
              right: 5vw !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default CarritoView;