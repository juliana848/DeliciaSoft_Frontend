import React, { useState, useEffect, useContext } from 'react';
import { CartContext } from "../../Cartas/pages/CartContext";
import './ConfirmacionView.css';

const ConfirmacionView = ({ pedido, total, onSiguiente, onAnterior, onEliminarProducto, onActualizarCantidad }) => {
  const [comentarios, setComentarios] = useState('');
  const [alerta, setAlerta] = useState({ mostrar: false, tipo: '', mensaje: '' });
  const [mostrarDetalles, setMostrarDetalles] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [personalizacionesProductos, setPersonalizacionesProductos] = useState({});

  // 🎯 OBTENER PRODUCTOS DEL CONTEXTO
  const { carrito } = useContext(CartContext);

  useEffect(() => {
    console.log('🔍 ConfirmacionView - Verificando productos...');
    console.log('Productos del pedido prop:', pedido?.productos);
    console.log('Productos del carrito context:', carrito);

    // Cargar personalizaciones
    const personalizacionesStorage = localStorage.getItem('personalizacionesPedido');
    if (personalizacionesStorage) {
      try {
        const personalizaciones = JSON.parse(personalizacionesStorage);
        setPersonalizacionesProductos(personalizaciones);
        console.log('✅ Personalizaciones cargadas:', personalizaciones);
      } catch (error) {
        console.error('Error al cargar personalizaciones:', error);
      }
    }
  }, [pedido, carrito]);

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ mostrar: true, tipo, mensaje });
    setTimeout(() => {
      setAlerta({ mostrar: false, tipo: '', mensaje: '' });
    }, 3000);
  };

  // 🎯 FUNCIÓN CLAVE: Obtener productos de múltiples fuentes
  const obtenerTodosLosProductos = () => {
    console.log('📦 Obteniendo productos...');
    
    // Prioridad 1: Productos del pedido
    if (pedido?.productos && Array.isArray(pedido.productos) && pedido.productos.length > 0) {
      console.log('✅ Usando productos del pedido prop');
      return pedido.productos;
    }
    
    // Prioridad 2: Productos del carrito context
    if (carrito && Array.isArray(carrito) && carrito.length > 0) {
      console.log('✅ Usando productos del carrito context');
      return carrito;
    }
    
    // Prioridad 3: Recuperar de localStorage como último recurso
    try {
      const carritoStorage = localStorage.getItem('carritoParaPersonalizar');
      if (carritoStorage) {
        const productosStorage = JSON.parse(carritoStorage);
        if (productosStorage && productosStorage.length > 0) {
          console.log('✅ Usando productos de localStorage');
          return productosStorage;
        }
      }
    } catch (error) {
      console.error('Error al recuperar carrito de localStorage:', error);
    }
    
    console.warn('⚠️ No se encontraron productos en ninguna fuente');
    return [];
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
      mostrarAlerta('error', '❌ No hay productos en el pedido. Por favor regresa y agrega productos.');
      return false;
    }

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
    
    // Sumar productos base
    totalCalculado += productos.reduce((sum, producto) => 
      sum + (producto.precio * (producto.cantidad || 1)), 0
    );
    
    // Sumar personalizaciones
    productos.forEach(producto => {
      const personalizacionProducto = personalizacionesProductos[producto.id];
      if (personalizacionProducto) {
        for (let unidad = 1; unidad <= (producto.cantidad || 1); unidad++) {
          const personalizacionUnidad = personalizacionProducto[unidad];
          if (personalizacionUnidad) {
            if (personalizacionUnidad.rellenos) {
              totalCalculado += personalizacionUnidad.rellenos.reduce((sum, item) => sum + (item.precio || 0), 0);
            }
            if (personalizacionUnidad.adiciones) {
              totalCalculado += personalizacionUnidad.adiciones.reduce((sum, item) => sum + (item.precio || 0), 0);
            }
            if (personalizacionUnidad.sabores) {
              totalCalculado += personalizacionUnidad.sabores.reduce((sum, item) => sum + (item.precio || 0), 0);
            }
          }
        }
      }
    });
    
    return totalCalculado;
  };

  const productos = obtenerTodosLosProductos();
  const totalPedido = calcularTotalPedido();

  console.log('📊 Estado actual en render:');
  console.log('- Productos encontrados:', productos.length);
  console.log('- Total calculado:', totalPedido);

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
              {productos.map((producto) => {
                const personalizacionProducto = personalizacionesProductos[producto.id];
                
                return (
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
                          {mostrarDetalles[producto.id] ? 'Ocultar' : 'Ver personalizaciones'}
                        </button>
                      </div>
                    </div>

                    {mostrarDetalles[producto.id] && (
                      <div style={{ 
                        padding: '20px', 
                        background: 'white', 
                        borderTop: '1px solid #e0e0e0'
                      }}>
                        {personalizacionProducto ? (
                          <>
                            <div style={{
                              fontSize: '13px',
                              fontWeight: '600',
                              color: '#666',
                              marginBottom: '15px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              🎨 Personalizaciones:
                            </div>
                            
                            {Object.keys(personalizacionProducto).map((unidad) => {
                              const personalizacionUnidad = personalizacionProducto[unidad];
                              const tienePersonalizacion = 
                                (personalizacionUnidad.toppings?.length > 0) ||
                                (personalizacionUnidad.salsas?.length > 0) ||
                                (personalizacionUnidad.adiciones?.length > 0) ||
                                (personalizacionUnidad.rellenos?.length > 0) ||
                                (personalizacionUnidad.sabores?.length > 0);

                              if (!tienePersonalizacion) return null;

                              return (
                                <div key={unidad} style={{
                                  borderLeft: '3px solid #e91e63',
                                  paddingLeft: '15px',
                                  marginBottom: '15px'
                                }}>
                                  <div style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '8px'
                                  }}>
                                    {producto.nombre} {producto.cantidad > 1 ? `- Unidad ${unidad}:` : ':'}
                                  </div>

                                  {personalizacionUnidad.toppings?.length > 0 && (
                                    <div style={{ marginBottom: '8px' }}>
                                      {personalizacionUnidad.toppings.map((item, idx) => (
                                        <div key={idx} style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          padding: '4px 0',
                                          fontSize: '13px',
                                          color: '#555'
                                        }}>
                                          <span>Topping: {item.nombre}</span>
                                          <span style={{ color: '#999', fontStyle: 'italic' }}>Gratis</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {personalizacionUnidad.salsas?.length > 0 && (
                                    <div style={{ marginBottom: '8px' }}>
                                      {personalizacionUnidad.salsas.map((item, idx) => (
                                        <div key={idx} style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          padding: '4px 0',
                                          fontSize: '13px',
                                          color: '#555'
                                        }}>
                                          <span>Salsa: {item.nombre}</span>
                                          <span style={{ color: '#999', fontStyle: 'italic' }}>Gratis</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {personalizacionUnidad.adiciones?.length > 0 && (
                                    <div style={{ marginBottom: '8px' }}>
                                      {personalizacionUnidad.adiciones.map((item, idx) => (
                                        <div key={idx} style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          padding: '4px 0',
                                          fontSize: '13px',
                                          color: '#555'
                                        }}>
                                          <span>Adición: {item.nombre}</span>
                                          <span style={{ color: '#e91e63', fontWeight: '600' }}>
                                            +${item.precio.toLocaleString()}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {personalizacionUnidad.rellenos?.length > 0 && (
                                    <div style={{ marginBottom: '8px' }}>
                                      {personalizacionUnidad.rellenos.map((item, idx) => (
                                        <div key={idx} style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          padding: '4px 0',
                                          fontSize: '13px',
                                          color: '#555'
                                        }}>
                                          <span>Relleno: {item.nombre}</span>
                                          <span style={{ 
                                            color: item.precio > 0 ? '#e91e63' : '#999',
                                            fontWeight: item.precio > 0 ? '600' : '400',
                                            fontStyle: item.precio > 0 ? 'normal' : 'italic'
                                          }}>
                                            {item.precio > 0 ? `+${item.precio.toLocaleString()}` : 'Gratis'}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {personalizacionUnidad.sabores?.length > 0 && (
                                    <div style={{ marginBottom: '8px' }}>
                                      {personalizacionUnidad.sabores.map((item, idx) => (
                                        <div key={idx} style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          padding: '4px 0',
                                          fontSize: '13px',
                                          color: '#555'
                                        }}>
                                          <span>Sabor: {item.nombre}</span>
                                          <span style={{ 
                                            color: item.precio > 0 ? '#e91e63' : '#999',
                                            fontWeight: item.precio > 0 ? '600' : '400',
                                            fontStyle: item.precio > 0 ? 'normal' : 'italic'
                                          }}>
                                            {item.precio > 0 ? `+${item.precio.toLocaleString()}` : 'Gratis'}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </>
                        ) : (
                          <div style={{
                            background: '#f5f5f5',
                            color: '#666',
                            padding: '12px',
                            borderRadius: '4px',
                            fontSize: '13px',
                            textAlign: 'center',
                            fontStyle: 'italic'
                          }}>
                            Sin personalizaciones adicionales
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#495057',
            marginBottom: '15px'
          }}>
            💰 Resumen de Costos
          </h3>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '15px',
            borderTop: '2px solid #dee2e6',
            fontSize: '20px',
            fontWeight: '700',
            color: '#e91e63'
          }}>
            <span>Total del Pedido:</span>
            <span>${totalPedido.toLocaleString()}</span>
          </div>
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
              background: productos.length > 0 ? 'linear-gradient(45deg, #e91e63, #f06292)' : '#6c757d',
              color: 'white',
              cursor: productos.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: productos.length > 0 ? '0 4px 10px rgba(233, 30, 99, 0.3)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: productos.length === 0 ? 0.7 : 1
            }}
          >
            Continuar al Pago
            <span style={{ fontSize: '20px' }}>→</span>
          </button>
        </div>
      </div>

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
        `}
      </style>
    </div>
  );
};

export default ConfirmacionView;