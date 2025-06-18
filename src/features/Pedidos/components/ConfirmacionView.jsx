import React, { useState, useEffect } from 'react';

const ConfirmacionView = ({ pedido, onSiguiente, onAnterior }) => {
  const [comentarios, setComentarios] = useState('');
  const [alerta, setAlerta] = useState({ mostrar: false, tipo: '', mensaje: '' });
  const [productos, setProductos] = useState([
    {
      id: 1,
      nombre: 'Torta de chocolate',
      cantidad: 1,
      precio: 25000,
      toppings: ['Fresas', 'Chocolate derretido', 'Crema batida'],
      salsas: ['Salsa de chocolate', 'Caramelo'],
      adicciones: ['Vela personalizada', 'Decoración especial'],
      personalizado: true
    },
    {
      id: 2,
      nombre: 'Mini donas',
      cantidad: 15,
      precio: 40000,
      toppings: ['Glaseado', 'Chispas de colores'],
      salsas: ['Glaseado de vainilla'],
      adicciones: ['Caja decorativa'],
      personalizado: true
    }
  ]);

  const [mostrarDetalles, setMostrarDetalles] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Función para mostrar alertas
  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ mostrar: true, tipo, mensaje });
    setTimeout(() => {
      setAlerta({ mostrar: false, tipo: '', mensaje: '' });
    }, 3000);
  };

  const toggleDetalles = (productId) => {
    setMostrarDetalles(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const eliminarProducto = (productId) => {
    if (productos.length === 1) {
      mostrarAlerta('error', '⚠️ No puedes eliminar el último producto. Debe haber al menos un producto en el pedido.');
      return;
    }

    const producto = productos.find(p => p.id === productId);
    setProductToDelete(producto);
    setShowConfirmModal(true);
  };

  const confirmDeletion = () => {
    setProductos(prev => prev.filter(p => p.id !== productToDelete.id));
    setShowConfirmModal(false);
    setProductToDelete(null);
    mostrarAlerta('success', `✅ Producto "${productToDelete.nombre}" eliminado correctamente del pedido.`);
  };

  const cancelDeletion = () => {
    setShowConfirmModal(false);
    setProductToDelete(null);
    mostrarAlerta('info', 'Eliminación de producto cancelada.');
  };

  const eliminarTopping = (productId, topping) => {
    const producto = productos.find(p => p.id === productId);

    if (producto.toppings.length === 1 && producto.salsas.length === 0) { // Added check for salsas as well
      mostrarAlerta('warning', `⚠️ Este es el último topping "${topping}" del producto y no hay salsas. Considera que el producto puede quedar sin extras.`);
      setTimeout(() => {
        setProductos(prev => prev.map(p =>
          p.id === productId
            ? { ...p, toppings: p.toppings.filter(t => t !== topping) }
            : p
        ));
        mostrarAlerta('success', `✅ Topping "${topping}" eliminado correctamente.`);
      }, 1500);
    } else {
      setProductos(prev => prev.map(p =>
        p.id === productId
          ? { ...p, toppings: p.toppings.filter(t => t !== topping) }
          : p
      ));
      mostrarAlerta('success', `✅ Topping "${topping}" eliminado correctamente.`);
    }
  };

  const eliminarSalsa = (productId, salsa) => {
    const producto = productos.find(p => p.id === productId);

    if (producto.salsas.length === 1 && producto.toppings.length === 0) { // Added check for toppings as well
      mostrarAlerta('warning', `⚠️ Esta es la última salsa "${salsa}" del producto y no hay toppings. Considera que el producto puede quedar sin extras.`);
      setTimeout(() => {
        setProductos(prev => prev.map(p =>
          p.id === productId
            ? { ...p, salsas: p.salsas.filter(s => s !== salsa) }
            : p
        ));
        mostrarAlerta('success', `✅ Salsa "${salsa}" eliminada correctamente.`);
      }, 1500);
    } else {
      setProductos(prev => prev.map(p =>
        p.id === productId
          ? { ...p, salsas: p.salsas.filter(s => s !== salsa) }
          : p
      ));
      mostrarAlerta('success', `✅ Salsa "${salsa}" eliminada correctamente.`);
    }
  };

  const eliminarAdiccion = (productId, adiccion) => {
    setProductos(prev => prev.map(p =>
      p.id === productId
        ? { ...p, adicciones: p.adicciones.filter(a => a !== adiccion) }
        : p
    ));
    mostrarAlerta('success', `✅ Adicional "${adiccion}" eliminado correctamente.`);
  };

  const validarPedido = () => {
    if (productos.length === 0) {
      mostrarAlerta('error', '❌ No hay productos en el pedido. Agrega al menos un producto.');
      return false;
    }

    const productosIncompletos = productos.filter(p =>
      (!p.toppings || p.toppings.length === 0) &&
      (!p.salsas || p.salsas.length === 0)
    );

    if (productosIncompletos.length > 0) {
      mostrarAlerta('warning', '⚠️ Algunos productos no tienen toppings ni salsas. ¿Deseas continuar?');
      setTimeout(() => {
        mostrarAlerta('success', '✅ Pedido validado correctamente. Continuando al pago...');
        onSiguiente({ productos, comentarios });
      }, 2000);
      return false;
    }

    mostrarAlerta('success', '✅ Pedido validado correctamente. Continuando al pago...');
    setTimeout(() => {
      onSiguiente({ productos, comentarios });
    }, 1000);
    return true;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      padding: '20px',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start' // Changed to flex-start to align content at the top
    }}>
      {/* Alerta dinámica */}
      {alerta.mostrar && (
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
              alerta.tipo === 'success'
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : alerta.tipo === 'error'
                ? 'linear-gradient(135deg, #ec4899, #be185d)'
                : 'linear-gradient(135deg, #0ea5e9, #0284c7)', // Color for 'info' and 'warning' types
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            animation: 'slideInRight 0.5s ease-out',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>{alerta.mensaje}</span>
          <button
            onClick={() => setAlerta({ mostrar: false, tipo: '', mensaje: '' })}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.2rem',
              cursor: 'pointer',
              marginLeft: '15px'
            }}
          >
            &times;
          </button>
        </div>
      )}

      <div style={{ maxWidth: '900px', width: '100%', margin: '20px auto', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '30px' }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          borderBottom: '1px solid #eee',
          paddingBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            background: 'linear-gradient(45deg, #e91e63, #f06292)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px'
          }}>
            Confirmación del Pedido
          </h2>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '20px',
            background: '#ffc10715', // light yellow
            border: '2px solid #ffc10730', // yellow border
            color: '#ffc107',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <span>Revisa tu pedido antes de continuar</span>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{
            fontSize: '22px',
            fontWeight: '600',
            color: '#495057',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🛒 Resumen de Productos ({productos.length})
          </h3>

          {productos.length === 0 ? (
            <div style={{
              background: '#f8f9fa',
              borderRadius: '15px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
              border: '1px dashed #ced4da'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
              <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>No hay productos en tu pedido</h3>
              <p style={{ color: '#adb5bd', marginBottom: '20px' }}>
                Por favor, regresa para agregar al menos un producto.
              </p>
              <button
                onClick={onAnterior}
                style={{
                  padding: '12px 25px',
                  border: 'none',
                  borderRadius: '10px',
                  background: 'linear-gradient(45deg, #007bff, #0056b3)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 10px rgba(0, 123, 255, 0.3)'
                }}
              >
                ← Agregar Productos
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {productos.map((producto) => (
                <div key={producto.id} style={{
                  background: '#ffffff',
                  borderRadius: '15px',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                  border: '1px solid #f0f2f5',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '15px 20px',
                    borderBottom: '1px solid #f0f2f5',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ flexGrow: 1 }}>
                      <h4 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#343a40',
                        margin: '0 0 5px 0'
                      }}>
                        {producto.nombre}
                      </h4>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>
                        Cantidad: <span style={{ fontWeight: '600' }}>{producto.cantidad}</span>
                        <span style={{ margin: '0 8px' }}>•</span>
                        Precio: <span style={{ fontWeight: '600' }}>${producto.precio.toLocaleString()}</span>
                        {producto.personalizado && <span style={{
                          marginLeft: '10px',
                          padding: '4px 10px',
                          borderRadius: '15px',
                          background: '#6f42c115',
                          color: '#6f42c1',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>Personalizado</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => toggleDetalles(producto.id)}
                        style={{
                          padding: '8px 15px',
                          border: '1px solid #ced4da',
                          borderRadius: '10px',
                          background: '#f8f9fa',
                          color: '#6c757d',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>👁️</span>
                        {mostrarDetalles[producto.id] ? 'Ocultar' : 'Ver detalles'}
                      </button>
                      <button
                        onClick={() => eliminarProducto(producto.id)}
                        title="Eliminar producto"
                        style={{
                          padding: '8px 15px',
                          border: 'none',
                          borderRadius: '10px',
                          background: 'linear-gradient(45deg, #dc3545, #e85a67)',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>🗑️</span>
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {mostrarDetalles[producto.id] && (
                    <div style={{ padding: '20px', background: '#f8f9fa', borderTop: '1px solid #eee' }}>
                      {(producto.toppings && producto.toppings.length > 0) && (
                        <div style={{ marginBottom: '15px' }}>
                          <h5 style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#495057',
                            marginBottom: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            🍓 Toppings ({producto.toppings.length}):
                          </h5>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {producto.toppings.map((topping, index) => (
                              <span key={index} style={{
                                padding: '6px 12px',
                                background: '#e91e63',
                                color: 'white',
                                borderRadius: '15px',
                                fontSize: '13px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}>
                                {topping}
                                <button
                                  onClick={() => eliminarTopping(producto.id, topping)}
                                  title={`Eliminar ${topping}`}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    padding: '0',
                                    marginLeft: '5px'
                                  }}
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {(producto.salsas && producto.salsas.length > 0) && (
                        <div style={{ marginBottom: '15px' }}>
                          <h5 style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#495057',
                            marginBottom: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            🍯 Salsas ({producto.salsas.length}):
                          </h5>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {producto.salsas.map((salsa, index) => (
                              <span key={index} style={{
                                padding: '6px 12px',
                                background: '#007bff',
                                color: 'white',
                                borderRadius: '15px',
                                fontSize: '13px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}>
                                {salsa}
                                <button
                                  onClick={() => eliminarSalsa(producto.id, salsa)}
                                  title={`Eliminar ${salsa}`}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    padding: '0',
                                    marginLeft: '5px'
                                  }}
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {(producto.adicciones && producto.adicciones.length > 0) && (
                        <div>
                          <h5 style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#495057',
                            marginBottom: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            ✨ Adicionales ({producto.adicciones.length}):
                          </h5>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {producto.adicciones.map((adiccion, index) => (
                              <span key={index} style={{
                                padding: '6px 12px',
                                background: '#17a2b8',
                                color: 'white',
                                borderRadius: '15px',
                                fontSize: '13px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}>
                                {adiccion}
                                <button
                                  onClick={() => eliminarAdiccion(producto.id, adiccion)}
                                  title={`Eliminar ${adiccion}`}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    padding: '0',
                                    marginLeft: '5px'
                                  }}
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {(!producto.toppings || producto.toppings.length === 0) &&
                       (!producto.salsas || producto.salsas.length === 0) &&
                       (!producto.adicciones || producto.adicciones.length === 0) && (
                        <div style={{
                          background: '#fff3cd', // light yellow background
                          color: '#856404', // dark yellow text
                          padding: '10px 15px',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ fontSize: '20px', lineHeight: 1 }}>ℹ️</span>
                          Este producto no tiene extras seleccionados.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          background: '#f8f9fa',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '30px',
          border: '1px solid #e9ecef'
        }}>
          <label htmlFor="comentarios" style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#495057',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            💬 Comentarios adicionales
          </label>
          <textarea
            id="comentarios"
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            placeholder="Escribe aquí cualquier comentario especial para tu pedido..."
            rows="4"
            maxLength="500"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ced4da',
              borderRadius: '10px',
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              resize: 'vertical',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#e91e63'}
            onBlur={(e) => e.target.style.borderColor = '#ced4da'}
          />
          <small style={{
            fontSize: '13px',
            color: '#6c757d',
            marginTop: '8px',
            display: 'block',
            textAlign: 'right'
          }}>
            {comentarios.length}/500 caracteres
          </small>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '15px',
          paddingTop: '20px',
          borderTop: '1px solid #eee'
        }}>
          <button
            onClick={onAnterior}
            style={{
              padding: '12px 25px',
              border: '2px solid #6c757d',
              borderRadius: '10px',
              background: 'white',
              color: '#6c757d',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '20px' }}>←</span>
            Anterior
          </button>
          <button
            onClick={validarPedido}
            disabled={productos.length === 0}
            style={{
              padding: '12px 25px',
              border: 'none',
              borderRadius: '10px',
              background: 'linear-gradient(45deg, #e91e63, #f06292)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 10px rgba(233, 30, 99, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: productos.length === 0 ? 0.7 : 1,
              pointerEvents: productos.length === 0 ? 'none' : 'auto'
            }}
          >
            Continuar al Pago
            <span style={{ fontSize: '20px' }}>→</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && productToDelete && (
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
            borderRadius: '15px',
            padding: '30px',
            width: '90%',
            maxWidth: '450px',
            boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
            textAlign: 'center',
            animation: 'fadeInUp 0.3s ease-out',
            position: 'relative'
          }}>
            <button
              onClick={cancelDeletion}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#adb5bd'
              }}
            >
              &times;
            </button>
            <div style={{ fontSize: '60px', marginBottom: '20px', lineHeight: '1' }}>
              🗑️
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#495057',
              marginBottom: '15px'
            }}>
              ¿Eliminar Producto?
            </h3>
            <p style={{
              color: '#6c757d',
              fontSize: '16px',
              marginBottom: '30px'
            }}>
              Estás a punto de eliminar el producto <strong style={{color: '#e91e63'}}>"{productToDelete.nombre}"</strong> del pedido.
              Esta acción no se puede deshacer.
              ¿Estás seguro de que quieres continuar?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button
                onClick={cancelDeletion}
                style={{
                  padding: '12px 25px',
                  border: '2px solid #6c757d',
                  borderRadius: '10px',
                  background: 'white',
                  color: '#6c757d',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeletion}
                style={{
                  padding: '12px 25px',
                  border: 'none',
                  borderRadius: '10px',
                  background: 'linear-gradient(45deg, #dc3545, #e85a67)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 10px rgba(220, 53, 69, 0.3)'
                }}
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmacionView;