import React, { useState, useEffect, useContext } from 'react';
import { CartContext } from "../../Cartas/pages/CartContext";

const ConfirmacionView = ({ pedido, total, onSiguiente, onAnterior, onEliminarProducto, onActualizarCantidad }) => {
  const [comentarios, setComentarios] = useState('');
  const [alerta, setAlerta] = useState({ mostrar: false, tipo: '', mensaje: '' });
  const [mostrarDetalles, setMostrarDetalles] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Obtener productos del contexto como fallback
  const { productosSeleccionados: productosDelContexto } = useContext(CartContext);

  // Función para obtener todos los productos (prioritizando los del pedido principal)
  const obtenerTodosLosProductos = () => {
    if (pedido && pedido.productos && pedido.productos.length > 0) {
      return pedido.productos;
    }
    // Fallback al contexto si no hay productos en el pedido principal
    return productosDelContexto || [];
  };

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
    const productos = obtenerTodosLosProductos();
    if (productos.length === 1) {
      mostrarAlerta('error', '⚠️ No puedes eliminar el último producto. Debe haber al menos un producto en el pedido.');
      return;
    }

    const producto = productos.find(p => p.id === productId);
    setProductToDelete(producto);
    setShowConfirmModal(true);
  };

  const confirmDeletion = () => {
    if (onEliminarProducto) {
      onEliminarProducto(productToDelete.id);
    }
    setShowConfirmModal(false);
    setProductToDelete(null);
    mostrarAlerta('success', `✅ Producto "${productToDelete.nombre}" eliminado correctamente del pedido.`);
  };

  const cancelDeletion = () => {
    setShowConfirmModal(false);
    setProductToDelete(null);
    mostrarAlerta('info', 'Eliminación de producto cancelada.');
  };

  const actualizarCantidadProducto = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarProducto(productoId);
      return;
    }
    
    if (onActualizarCantidad) {
      onActualizarCantidad(productoId, nuevaCantidad);
      mostrarAlerta('success', '✅ Cantidad actualizada correctamente.');
    }
  };

  const validarPedido = () => {
    const productos = obtenerTodosLosProductos();
    
    if (productos.length === 0) {
      mostrarAlerta('error', '❌ No hay productos en el pedido. Agrega al menos un producto.');
      return false;
    }

    // Calcular cantidad total
    const cantidadTotal = productos.reduce((total, producto) => total + (producto.cantidad || 1), 0);
    
    if (cantidadTotal < 10) {
      mostrarAlerta('error', `❌ Necesitas al menos 10 productos en total. Tienes ${cantidadTotal} productos.`);
      return false;
    }

    if (cantidadTotal > 100) {
      mostrarAlerta('error', `❌ Máximo 100 productos permitidos. Tienes ${cantidadTotal} productos.`);
      return false;
    }

    mostrarAlerta('success', '✅ Pedido validado correctamente. Continuando al pago...');
    setTimeout(() => {
      onSiguiente({ ...pedido, comentarios });
    }, 1000);
    return true;
  };

  const calcularTotalPedido = () => {
    if (total && typeof total === 'number') {
      return total;
    }
    
    const productos = obtenerTodosLosProductos();
    let totalCalculado = 0;
    
    // Sumar productos
    totalCalculado += productos.reduce((sum, producto) => 
      sum + (producto.precio * (producto.cantidad || 1)), 0
    );
    
    // Sumar toppings (si existen)
    if (pedido && pedido.toppings) {
      totalCalculado += pedido.toppings.reduce((sum, topping) => sum + (topping.precio || 0), 0);
    }
    
    // Sumar adiciones (si existen)
    if (pedido && pedido.adiciones) {
      totalCalculado += pedido.adiciones.reduce((sum, adicion) => sum + (adicion.precio || 0), 0);
    }
    
    // Sumar salsas (si existen)
    if (pedido && pedido.salsas) {
      totalCalculado += pedido.salsas.reduce((sum, salsa) => sum + (salsa.precio || 0), 0);
    }
    
    return totalCalculado;
  };

  const productos = obtenerTodosLosProductos();
  const totalPedido = calcularTotalPedido();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      padding: '20px',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
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
                : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
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

      <div style={{ 
        maxWidth: '900px', 
        width: '100%', 
        margin: '20px auto', 
        background: 'white', 
        borderRadius: '20px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
        padding: '30px' 
      }}>
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
            background: '#ffc10715',
            border: '2px solid #ffc10730',
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
                        Cantidad: <span style={{ fontWeight: '600' }}>{producto.cantidad || 1}</span>
                        <span style={{ margin: '0 8px' }}>•</span>
                        Precio unitario: <span style={{ fontWeight: '600' }}>${producto.precio.toLocaleString()}</span>
                        <span style={{ margin: '0 8px' }}>•</span>
                        Subtotal: <span style={{ fontWeight: '600', color: '#e91e63' }}>
                          ${(producto.precio * (producto.cantidad || 1)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {/* Controles de cantidad */}
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <button
                          onClick={() => actualizarCantidadProducto(producto.id, (producto.cantidad || 1) - 1)}
                          style={{
                            padding: '5px 10px',
                            border: 'none',
                            borderRadius: '5px',
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                        >
                          -
                        </button>
                        <span style={{ 
                          padding: '5px 10px', 
                          fontSize: '14px', 
                          fontWeight: 'bold',
                          minWidth: '30px',
                          textAlign: 'center'
                        }}>
                          {producto.cantidad || 1}
                        </span>
                        <button
                          onClick={() => actualizarCantidadProducto(producto.id, (producto.cantidad || 1) + 1)}
                          style={{
                            padding: '5px 10px',
                            border: 'none',
                            borderRadius: '5px',
                            backgroundColor: '#2ecc71',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                        >
                          +
                        </button>
                      </div>
                      
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
                      {/* Mostrar toppings del pedido */}
                      {pedido && pedido.toppings && pedido.toppings.length > 0 && (
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
                            🧁 Toppings Seleccionados ({pedido.toppings.length}):
                          </h5>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {pedido.toppings.map((topping, index) => (
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
                                {topping.nombre}
                                {topping.precio > 0 && (
                                  <span style={{ fontSize: '11px', opacity: 0.9 }}>
                                    (+${topping.precio.toLocaleString()})
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mostrar adiciones del pedido */}
                      {pedido && pedido.adiciones && pedido.adiciones.length > 0 && (
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
                            ✨ Adiciones Seleccionadas ({pedido.adiciones.length}):
                          </h5>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {pedido.adiciones.map((adicion, index) => (
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
                                {adicion.nombre}
                                <span style={{ fontSize: '11px', opacity: 0.9 }}>
                                  (+${adicion.precio.toLocaleString()})
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mostrar salsas del pedido */}
                      {pedido && pedido.salsas && pedido.salsas.length > 0 && (
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
                            🍯 Salsas Seleccionadas ({pedido.salsas.length}):
                          </h5>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {pedido.salsas.map((salsa, index) => (
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
                                {salsa.nombre}
                                <span style={{ fontSize: '11px', opacity: 0.9 }}>
                                  (+${salsa.precio.toLocaleString()})
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mensaje cuando no hay extras */}
                      {(!pedido || 
                        (!pedido.toppings || pedido.toppings.length === 0) &&
                        (!pedido.adiciones || pedido.adiciones.length === 0) &&
                        (!pedido.salsas || pedido.salsas.length === 0)
                      ) && (
                        <div style={{
                          background: '#fff3cd',
                          color: '#856404',
                          padding: '15px',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textAlign: 'center'
                        }}>
                          <span style={{ fontSize: '20px', lineHeight: 1 }}>ℹ️</span>
                          <div>
                            <strong>Sin extras seleccionados</strong>
                            <br />
                            <small>Este producto se servirá en su presentación estándar.</small>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

     {/* Resumen de totales */}
<div style={{
  background: '#f8f9fa',
  borderRadius: '15px',
  padding: '20px',
  marginBottom: '30px',
  border: '1px solid #e9ecef'
}}>
  <h3 style={{
    fontSize: '18px',
    fontWeight: '600',
    color: '#495057',
    marginBottom: '15px'
  }}>
    💰 Resumen de Costos
  </h3>
  
  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
    <tbody>
      <tr style={{ borderBottom: '1px solid #dee2e6' }}>
        <td style={{ padding: '8px 0', fontSize: '14px', color: '#495057' }}>
          Productos ({productos.reduce((sum, p) => sum + (p.cantidad || 1), 0)} unidades):
        </td>
        <td style={{ padding: '8px 0', fontSize: '14px', color: '#495057', textAlign: 'right' }}>
          ${productos.reduce((sum, p) => sum + (p.precio * (p.cantidad || 1)), 0).toLocaleString()}
        </td>
      </tr>
      
      {pedido && pedido.toppings && pedido.toppings.length > 0 && (
        <tr style={{ borderBottom: '1px solid #dee2e6' }}>
          <td style={{ padding: '8px 0', fontSize: '14px', color: '#495057' }}>
            Toppings ({pedido.toppings.length}):
          </td>
          <td style={{ padding: '8px 0', fontSize: '14px', color: '#495057', textAlign: 'right' }}>
            ${pedido.toppings.reduce((sum, t) => sum + (t.precio || 0), 0).toLocaleString()}
          </td>
        </tr>
      )}
      
      {pedido && pedido.adiciones && pedido.adiciones.length > 0 && (
        <tr style={{ borderBottom: '1px solid #dee2e6' }}>
          <td style={{ padding: '8px 0', fontSize: '14px', color: '#495057' }}>
            Adiciones ({pedido.adiciones.length}):
          </td>
          <td style={{ padding: '8px 0', fontSize: '14px', color: '#495057', textAlign: 'right' }}>
            ${pedido.adiciones.reduce((sum, a) => sum + a.precio, 0).toLocaleString()}
          </td>
        </tr>
      )}
      
      {pedido && pedido.salsas && pedido.salsas.length > 0 && (
        <tr style={{ borderBottom: '1px solid #dee2e6' }}>
          <td style={{ padding: '8px 0', fontSize: '14px', color: '#495057' }}>
            Salsas ({pedido.salsas.length}):
          </td>
          <td style={{ padding: '8px 0', fontSize: '14px', color: '#495057', textAlign: 'right' }}>
            ${pedido.salsas.reduce((sum, s) => sum + s.precio, 0).toLocaleString()}
          </td>
        </tr>
      )}
    </tbody>
  </table>
  
  <div style={{
    paddingTop: '15px',
    borderTop: '2px solid #dee2e6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <strong style={{ fontSize: '18px', color: '#e91e63' }}>Total del Pedido:</strong>
    <strong style={{ fontSize: '18px', color: '#e91e63' }}>${totalPedido.toLocaleString()}</strong>
  </div>
</div>

        {/* Comentarios */}
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

        {/* Botones de navegación */}
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

      {/* CSS Animations */}
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
          
          @keyframes fadeInUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ConfirmacionView;