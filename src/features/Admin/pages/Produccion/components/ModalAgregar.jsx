import React from 'react';

export default function ModalAgregar({
  procesoData,
  setProcesoData,
  productosSeleccionados,
  setMostrarAgregarProceso,
  setMostrarModalProductos,
  productosDisponibles,
  cambiarCantidad,
  abrirModalRecetas,
  removeProducto,
  guardarProceso
}) {
  const handleChange = (e) => {
    setProcesoData({ ...procesoData, [e.target.name]: e.target.value });
  };

  return (
    <div className="compra-form-container">
      <h1>Agregar Producción</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          guardarProceso();
        }}
      >
        <div className="compra-fields-grid">
          {/* Tipo de Producción */}
          <div className="field-group">
            <label>Tipo de producción</label>
            <select
              name="tipoProduccion"
              value={procesoData.tipoProduccion || 'pedido'}
              onChange={handleChange}
              className="modal-input"
            >
              <option value="pedido">Pedido</option>
              <option value="stock">Inventario</option>
            </select>
          </div>

          {/* Nombre de la producción con datalist */}
          <div className="field-group">
            <label>Nombre de la producción</label>
            <input
              type="text"
              list="opcionesProduccion"
              name="nombreProduccion"
              value={procesoData.nombreProduccion}
              onChange={handleChange}
              className="modal-input"
              required
            />
            <datalist id="opcionesProduccion">
              {productosDisponibles.map((p) => (
                <option key={p.id} value={p.nombre} />
              ))}
            </datalist>
          </div>

          {/* Fecha de creación */}
          <div className="field-group">
            <label>Fecha de creación</label>
            <input
              type="date"
              className="modal-input"
              value={new Date().toISOString().split('T')[0]}
              disabled
            />
          </div>

          {/* Estado de producción */}
          <div className="field-group">
            <label>Estado de producción</label>
            <input
              type="text"
              className="modal-input"
              value="Empaquetando 🟠"
              disabled
            />
          </div>

          {/* Solo si es tipo pedido se muestra el estadoPedido */}
          {procesoData.tipoProduccion !== 'stock' && (
            <div className="field-group">
              <label>Estado de pedido</label>
              <input
                type="text"
                className="modal-input"
                value="Abonado 🟣"
                disabled
              />
            </div>
          )}

          {/* Número de pedido */}
          <div className="field-group">
            <label>Número del pedido</label>
            <input
              type="text"
              className="modal-input"
              value={procesoData.numeroPedido}
              disabled
            />
          </div>
        </div>

        {/* Botón para agregar productos */}
        <button
          type="button"
          className="modal-input"
          onClick={() => setMostrarModalProductos(true)}
        >
          ✚ Agregar productos
        </button>

        {/* Lista de productos seleccionados */}
        {productosSeleccionados.length > 0 && (
          <div className="productos-seleccionados">
            <h3>Productos agregados:</h3>
            <table className="productos-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Cantidad</th>
                  <th>Receta</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {productosSeleccionados.map((item) => {
                  const producto = productosDisponibles.find((p) => p.id === item.id);
                  return (
                    <tr key={item.id}>
                      <td>
                        <img
                          src={producto?.imagen || 'https://via.placeholder.com/50'}
                          alt={item.nombre}
                          width="50"
                          height="50"
                          style={{ objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </td>
                      <td>
                        <div>{item.nombre}</div>
                        {item.receta && (
                          <small style={{ fontSize: '12px', color: '#666' }}>
                            📘 {item.receta.nombre}
                          </small>
                        )}
                      </td>
                      <td>
                        <input
                          required
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) =>
                            cambiarCantidad(item.id, parseInt(e.target.value))
                          }
                          style={{ width: '60px' }}
                        />
                      </td>
                      <td style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn-insumos"
                          onClick={() => abrirModalRecetas(item)}
                          style={{
                            background: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          📘 Ver recetas
                        </button>

                        <button
                          type="button"
                          className="btn-insumos"
                          onClick={() => {
                            const fuente = item.receta || producto;
                            if (fuente) {
                              setProductoDetalleInsumos(fuente);
                              setMostrarDetalleInsumos(true);
                            }
                          }}
                          style={{
                            background: '#2196F3',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          📋 Ver insumos
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-eliminar"
                          onClick={() => removeProducto(item.id)}
                          style={{
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>
        )}
        {/* Botones finales */}
        <div className="modal-footer">
          <button
            type="button"
            className="modal-btn cancel-btn"
            onClick={() => setMostrarAgregarProceso(false)}
          >
            Cancelar
          </button>
          <button className="modal-btn save-btn" type="submit">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

