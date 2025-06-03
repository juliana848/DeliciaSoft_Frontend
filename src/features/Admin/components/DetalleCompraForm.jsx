// components/DetalleCompraForm.jsx
import React, { useState } from 'react';

const DetalleCompraForm = ({ insumosSeleccionados, setInsumosSeleccionados }) => {
  const [compraData, setCompraData] = useState({
    cod_compra: '00000',
    proveedor: '',
    fecha_compra: '',
    fecha_registro: '',
    observaciones: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompraData(prev => ({ ...prev, [name]: value }));
  };

  const handleCantidadChange = (id, cantidad) => {
    setInsumosSeleccionados(prev =>
      prev.map(insumo =>
        insumo.id === id ? { ...insumo, cantidad: Math.max(1, cantidad) } : insumo
      )
    );
  };

  const removeInsumo = (id) => {
    setInsumosSeleccionados(prev => prev.filter(insumo => insumo.id !== id));
  };

  const calcularTotales = () => {
    const subtotal = insumosSeleccionados.reduce(
      (sum, item) => sum + (item.precio * item.cantidad), 0
    );
    const iva = subtotal * 0.16; // 16% de IVA
    const total = subtotal + iva;
    
    return { subtotal, iva, total };
  };

  const { subtotal, iva, total } = calcularTotales();

  return (
    <div className="compra-form">
      <div className="form-section">
        <div className="form-group">
          <label>Cod_Compra:</label>
          <input
            type="text"
            name="cod_compra"
            value={compraData.cod_compra}
            onChange={handleChange}
            disabled
          />
        </div>

        <div className="form-group">
          <label>Proveedor:</label>
          <select
            name="proveedor"
            value={compraData.proveedor}
            onChange={handleChange}
          >
            <option value="">---</option>
            <option value="Proveedor 1">Proveedor 1</option>
            <option value="Proveedor 2">Proveedor 2</option>
          </select>
        </div>
      </div>

      <div className="form-section">
        <div className="form-group">
          <label>Fecha de compra</label>
          <input
            type="date"
            name="fecha_compra"
            value={compraData.fecha_compra}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Fecha de registro</label>
          <input
            type="date"
            name="fecha_registro"
            value={compraData.fecha_registro}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="detalle-section">
        <h3>Detalle:</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Id_Producto</th>
              <th>Cantidad</th>
              <th>Unidad_Medida</th>
              <th>Nombre Producto</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {insumosSeleccionados.map((insumo) => (
              <tr key={insumo.id}>
                <td>{insumo.id}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={insumo.cantidad}
                    onChange={(e) => handleCantidadChange(insumo.id, parseInt(e.target.value) || 1)}
                  />
                </td>
                <td>{insumo.unidad}</td>
                <td>{insumo.nombre}</td>
                <td>
                  <button 
                    className="admin-button red small"
                    onClick={() => removeInsumo(insumo.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="observaciones-section">
        <h3>Observaciones</h3>
        <textarea
          name="observaciones"
          value={compraData.observaciones}
          onChange={handleChange}
        />
      </div>

      <div className="totales-section">
        <div className="total-item">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="total-item">
          <span>IVA:</span>
          <span>${iva.toFixed(2)}</span>
        </div>
        <div className="total-item">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default DetalleCompraForm;