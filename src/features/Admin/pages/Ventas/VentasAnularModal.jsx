import React from 'react';
import Modal from '../../components/modal';

export default function VentasAnularModal({ visible, onClose, ventaSeleccionada, anularVenta }) {
    if (!visible || !ventaSeleccionada) return null;

    return (
        <Modal visible={visible} onClose={onClose}>
            <h2 className="modal-title">Confirmar anulación</h2>
            <div className="modal-body">
                <p>¿Está seguro que desea anular la venta de {ventaSeleccionada.cliente}?</p>
                <p style={{ color: '#e53935', fontSize: '14px' }}>
                    Esta acción no se puede deshacer.
                </p>
            </div>
            <div className="modal-footer">
                <button className="modal-btn cancel-btn" onClick={onClose}>Cancelar</button>
                <button className="modal-btn save-btn" onClick={anularVenta}>Anular</button>
            </div>
        </Modal>
    );
}