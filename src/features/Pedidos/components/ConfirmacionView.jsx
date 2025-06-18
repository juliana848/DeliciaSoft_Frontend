import React, { useState } from 'react';
import './ConfirmacionView.css';

const ConfirmacionView = ({ pedido, onSiguiente, onAnterior }) => {
  const [comentarios, setComentarios] = useState('');
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

  const toggleDetalles = (productId) => {
    setMostrarDetalles(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const eliminarProducto = (productId) => {
    setProductos(prev => prev.filter(p => p.id !== productId));
  };

  const eliminarTopping = (productId, topping) => {
    setProductos(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, toppings: p.toppings.filter(t => t !== topping) }
        : p
    ));
  };

  const eliminarSalsa = (productId, salsa) => {
    setProductos(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, salsas: p.salsas.filter(s => s !== salsa) }
        : p
    ));
  };

  const eliminarAdiccion = (productId, adiccion) => {
    setProductos(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, adicciones: p.adicciones.filter(a => a !== adiccion) }
        : p
    ));
  };

  const subtotal = productos.reduce((sum, prod) => sum + prod.precio, 0);
  const iva = subtotal * 0.19;
  const total = subtotal + iva;

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

        <div className="resumen-completo">
          <h3 className="subseccion-title">Resumen de Productos</h3>
          
          {productos.map((producto) => (
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
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {mostrarDetalles[producto.id] && (
                <div className="producto-detalles">
                  {producto.toppings && producto.toppings.length > 0 && (
                    <div className="detalles-seccion">
                      <h5>🍓 Toppings:</h5>
                      <div className="items-lista">
                        {producto.toppings.map((topping, index) => (
                          <span key={index} className="item-chip">
                            {topping}
                            <button 
                              className="btn-eliminar-item"
                              onClick={() => eliminarTopping(producto.id, topping)}
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
                      <h5>🍯 Salsas:</h5>
                      <div className="items-lista">
                        {producto.salsas.map((salsa, index) => (
                          <span key={index} className="item-chip">
                            {salsa}
                            <button 
                              className="btn-eliminar-item"
                              onClick={() => eliminarSalsa(producto.id, salsa)}
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
                      <h5>✨ Adicionales:</h5>
                      <div className="items-lista">
                        {producto.adicciones.map((adiccion, index) => (
                          <span key={index} className="item-chip">
                            {adiccion}
                            <button 
                              className="btn-eliminar-item"
                              onClick={() => eliminarAdiccion(producto.id, adiccion)}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="resumen-totales">
            <div className="total-linea">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="total-linea">
              <span>IVA (19%):</span>
              <span>${iva.toLocaleString()}</span>
            </div>
            <div className="total-linea total-final">
              <span>Total:</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
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
          />
        </div>

        <div className="acciones-footer">
          <button className="btn-anterior" onClick={onAnterior}>
            <span className="btn-icon">←</span>
            Anterior
          </button>
          <button 
            className="btn-continuar" 
            onClick={() => onSiguiente({ productos, comentarios, total })}
            disabled={productos.length === 0}
          >
            Continuar al Pago
            <span className="btn-icon">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionView;