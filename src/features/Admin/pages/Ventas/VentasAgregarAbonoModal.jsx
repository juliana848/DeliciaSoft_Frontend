import React from 'react';
import Modal from '../../components/modal';

export default function VentasAgregarAbonoModal({
    visible,
    onClose,
    abonoData,
    handleAbonoChange,
    erroresValidacion,
    handleImageUpload,
    agregarAbono,
    ventaSeleccionada
}) {
    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            onClose={() => {
                onClose();
            }}
        >
            <div className="agregar-abono-modal">
                <h3>Agregar Abono</h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    agregarAbono();
                }}>
                    <div className={`form-group ${erroresValidacion.metodo_pago ? 'has-error' : ''}`}>
                        <label>Método de Pago:</label>
                        <select
                            name="metodo_pago"
                            value={abonoData.metodo_pago}
                            onChange={handleAbonoChange}
                            className={erroresValidacion.metodo_pago ? 'field-error' : ''}
                            required
                        >
                            <option value="">Seleccione</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                        {erroresValidacion.metodo_pago && (
                            <span className="error-message">{erroresValidacion.metodo_pago}</span>
                        )}
                    </div>
                    <div className={`form-group ${erroresValidacion.total_pagado ? 'has-error' : ''}`}>
                        <label>Total Pagado:</label>
                        <input
                            type="number"
                            name="total_pagado"
                            min="0"
                            step="0.01"
                            value={abonoData.total_pagado}
                            onChange={handleAbonoChange}
                            className={erroresValidacion.total_pagado ? 'field-error' : ''}
                            required
                        />
                        {erroresValidacion.total_pagado && (
                            <span className="error-message">{erroresValidacion.total_pagado}</span>
                        )}
                    </div>
                    <div className={`form-group ${erroresValidacion.fecha ? 'has-error' : ''}`}>
                        <label>Fecha:</label>
                        <input
                            type="date"
                            name="fecha"
                            value={abonoData.fecha}
                            onChange={handleAbonoChange}
                            className={erroresValidacion.fecha ? 'field-error' : ''}
                            required
                        />
                        {erroresValidacion.fecha && (
                            <span className="error-message">{erroresValidacion.fecha}</span>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Comprobante (Imagen):</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        {abonoData.comprobante_imagen && (
                            <img src={abonoData.comprobante_imagen} alt="Previsualización" style={{ maxWidth: '100px', maxHeight: '100px', marginTop: '10px' }} />
                        )}
                    </div>
                    <div className="form-group">
                        <label>Falta por Pagar:</label>
                        <input
                            type="number"
                            readOnly
                            value={ventaSeleccionada.total - (parseFloat(abonoData.total_pagado) || 0)}
                        />
                    </div>
                    <div className="modal-buttons">
                        <button type="button" className="modal-btn cancel-btn" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="modal-btn save-btn">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}