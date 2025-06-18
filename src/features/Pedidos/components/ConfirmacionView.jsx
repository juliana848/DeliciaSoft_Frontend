import React, { useState, useEffect } from 'react';
import './ConfirmacionView.css';

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
    setProductos(prev => prev.filter(p => p.id !== productId));
    mostrarAlerta('success', `✅ Producto "${producto.nombre}" eliminado correctamente del pedido.`);
  };

  const eliminarTopping = (productId, topping) => {
    const producto = productos.find(p => p.id === productId);
    
    if (producto.toppings.length === 1) {
      mostrarAlerta('warning', '⚠️ Este es el último topping del producto. ¿Estás seguro de eliminarlo?');
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
    
    if (producto.salsas.length === 1) {
      mostrarAlerta('warning', '⚠️ Esta es la última salsa del producto. ¿Estás seguro de eliminarla?');
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

    // Validar que cada producto tenga al menos un elemento básico
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
    <div className="confirmacion-view">
      <div className="confirmacion-contenido">
        <div className="seccion-header">
          <h2 className="seccion-title">Confirmación del Pedido</h2>
          <div className="alert-personalizado">
            <span className="alert-icon">⚠️</span>
            <span>Revisa tu pedido antes de continuar</span>
          </div>
        </div>

        {/* Alerta dinámica */}
        {alerta.mostrar && (
          <div className={`alerta-dinamica ${alerta.tipo}`}>
            <span className="alerta-mensaje">{alerta.mensaje}</span>
            <button 
              className="alerta-cerrar"
              onClick={() => setAlerta({ mostrar: false, tipo: '', mensaje: '' })}
            >
              ✕
            </button>
          </div>
        )}

        <div className="resumen-completo">
          <h3 className="subseccion-title">Resumen de Productos ({productos.length})</h3>
          
          {productos.length === 0 ? (
            <div className="pedido-vacio">
              <p>No hay productos en tu pedido</p>
              <button className="btn-agregar-producto" onClick={onAnterior}>
                Agregar Productos
              </button>
            </div>
          ) : (
            productos.map((producto) => (
              <div key={producto.id} className="producto-card-completo">
                <div className="producto-header">
                  <div className="producto-info-principal">
                    <h4 className="producto-nombre">{producto.nombre}</h4>
                    <div className="producto-meta">
                      <span className="producto-cantidad">Cantidad: {producto.cantidad}</span>
                      <span className="producto-precio">${producto.precio.toLocaleString()}</span>
                      {producto.personalizado && <span className="badge-personalizado">Personalizado</span>}
                    </div>
                  </div>
                  <div className="producto-acciones">
                    <button 
                      className="btn-detalles"
                      onClick={() => toggleDetalles(producto.id)}
                    >
                      {mostrarDetalles[producto.id] ? '👁️ Ocultar' : '👁️ Ver detalles'}
                    </button>
                    <button 
                      className="btn-eliminar-producto"
                      onClick={() => eliminarProducto(producto.id)}
                      title="Eliminar producto"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {mostrarDetalles[producto.id] && (
                  <div className="producto-detalles">
                    {producto.toppings && producto.toppings.length > 0 && (
                      <div className="detalles-seccion">
                        <h5>🍓 Toppings ({producto.toppings.length}):</h5>
                        <div className="items-lista">
                          {producto.toppings.map((topping, index) => (
                            <span key={index} className="item-chip">
                              {topping}
                              <button 
                                className="btn-eliminar-item"
                                onClick={() => eliminarTopping(producto.id, topping)}
                                title={`Eliminar ${topping}`}
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {producto.salsas && producto.salsas.length > 0 && (
                      <div className="detalles-seccion">
                        <h5>🍯 Salsas ({producto.salsas.length}):</h5>
                        <div className="items-lista">
                          {producto.salsas.map((salsa, index) => (
                            <span key={index} className="item-chip">
                              {salsa}
                              <button 
                                className="btn-eliminar-item"
                                onClick={() => eliminarSalsa(producto.id, salsa)}
                                title={`Eliminar ${salsa}`}
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {producto.adicciones && producto.adicciones.length > 0 && (
                      <div className="detalles-seccion">
                        <h5>✨ Adicionales ({producto.adicciones.length}):</h5>
                        <div className="items-lista">
                          {producto.adicciones.map((adiccion, index) => (
                            <span key={index} className="item-chip">
                              {adiccion}
                              <button 
                                className="btn-eliminar-item"
                                onClick={() => eliminarAdiccion(producto.id, adiccion)}
                                title={`Eliminar ${adiccion}`}
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
                      <div className="producto-sin-extras">
                        <p>⚠️ Este producto no tiene extras seleccionados</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="comentarios-section">
          <label htmlFor="comentarios" className="form-label">
            <span className="label-icon">💬</span>
            Comentarios adicionales
          </label>
          <textarea 
            id="comentarios"
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            placeholder="Escribe aquí cualquier comentario especial para tu pedido..."
            className="form-textarea"
            rows="4"
            maxLength="500"
          />
          <small className="comentarios-contador">
            {comentarios.length}/500 caracteres
          </small>
        </div>

        <div className="acciones-footer">
          <button className="btn-anterior" onClick={onAnterior}>
            <span className="btn-icon">←</span>
            Anterior
          </button>
          <button 
            className="btn-continuar" 
            onClick={validarPedido}
            disabled={productos.length === 0}
          >
            Continuar al Pago
            <span className="btn-icon">→</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .alerta-dinamica {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px 20px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1000;
          min-width: 300px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.3s ease-out;
        }

        .alerta-dinamica.success {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }

        .alerta-dinamica.error {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }

        .alerta-dinamica.warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
        }

        .alerta-mensaje {
          flex: 1;
          font-weight: 500;
        }

        .alerta-cerrar {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
        }

        .alerta-cerrar:hover {
          opacity: 1;
        }

        .pedido-vacio {
          text-align: center;
          padding: 40px 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px dashed #dee2e6;
        }

        .btn-agregar-producto {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 15px;
        }

        .btn-agregar-producto:hover {
          background: #0056b3;
        }

        .producto-sin-extras {
          padding: 15px;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 6px;
          margin-top: 10px;
        }

        .producto-sin-extras p {
          margin: 0;
          color: #856404;
          font-style: italic;
        }

        .comentarios-contador {
          display: block;
          text-align: right;
          margin-top: 5px;
          color: #6c757d;
          font-size: 12px;
        }

        .detalles-seccion h5 {
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .btn-eliminar-item:hover {
          background-color: #dc3545;
          color: white;
        }

        .btn-eliminar-producto:hover {
          transform: scale(1.1);
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ConfirmacionView;