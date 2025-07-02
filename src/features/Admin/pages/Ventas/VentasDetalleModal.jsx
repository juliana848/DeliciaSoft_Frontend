import React from 'react';
import Modal from '../../components/modal';


export default function VentasDetalleModal({ visible, onClose, ventaSeleccionada, showProductOptions, setShowProductOptions }) {
    if (!visible || !ventaSeleccionada) return null;

    return (
        <Modal visible={visible} onClose={onClose}>
            <div className="detalle-venta-modal">
                <h3>Detalle de la Venta #{ventaSeleccionada.id}</h3>
                <div className="modal-content-columns">
                    <div className="column">
                        <h4>Información de la Venta:</h4>
                        <p><strong>Cliente:</strong> {ventaSeleccionada.cliente}</p>
                        <p><strong>Sede:</strong> {ventaSeleccionada.sede}</p>
                        <p><strong>Método de Pago:</strong> {ventaSeleccionada.metodo_pago}</p>
                        <p><strong>Estado:</strong> {ventaSeleccionada.estado}</p>
                        {ventaSeleccionada.fecha_venta && <p><strong>Fecha de Venta:</strong> {ventaSeleccionada.fecha_venta}</p>}
                        {/* Updated conditional for Fecha de Entrega */}
                        {ventaSeleccionada.tipo_venta !== 'directa' && ventaSeleccionada.fecha_entrega && (
                            <p><strong>Fecha de Entrega:</strong> {ventaSeleccionada.fecha_entrega}</p>
                        )}
                    </div>
                    <div className="column">
                        <h4>Productos Incluidos:</h4>
                        <div className="productos-lista">
                            {ventaSeleccionada.productos.length > 0 ? (
                                ventaSeleccionada.productos.map((item) => (
                                    <div key={item.id} className="producto-item-container">
                                        <div className="producto-item-header">
                                            <div className="producto-info">
                                                <strong>Producto:</strong> {item.nombre} (Cantidad: {item.cantidad}) - ${item.precio.toLocaleString()} c/u
                                            </div>
                                            {(item.adiciones?.length > 0 || item.salsas?.length > 0 || item.sabores?.length > 0) && (
                                                <button
                                                    className="admin-button small-button dropdown-toggle"
                                                    onClick={() => {
                                                        const newShowState = {};
                                                        Object.keys(showProductOptions).forEach(key => {
                                                            newShowState[key] = false;
                                                        });
                                                        newShowState[item.id] = !showProductOptions[item.id];
                                                        setShowProductOptions(newShowState);
                                                    }}
                                                >
                                                    {showProductOptions[item.id] ? '▲ Ocultar' : '▼ Opciones'}
                                                </button>
                                            )}
                                        </div>

                                        {showProductOptions[item.id] && (
                                            <div className="product-options-dropdown">
                                                {item.adiciones && item.adiciones.length > 0 && (
                                                    <div className="options-section">
                                                        <strong>Adiciones:</strong>
                                                        <ul>
                                                            {item.adiciones.map((ad, adIndex) => (
                                                                <li key={adIndex}>{ad.nombre} (${ad.precio.toLocaleString()})</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {item.salsas && item.salsas.length > 0 && (
                                                    <div className="options-section">
                                                        <strong>Salsas:</strong>
                                                        <ul>
                                                            {item.salsas.map((sa, saIndex) => (
                                                                <li key={saIndex}>{sa.nombre} (${sa.precio.toLocaleString()})</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {item.sabores && item.sabores.length > 0 && (
                                                    <div className="options-section">
                                                        <strong>Rellenos:</strong>
                                                        <ul>
                                                            {item.sabores.map((re, reIndex) => (
                                                                <li key={reIndex}>{re.nombre} (${re.precio.toLocaleString()})</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No hay productos en esta venta.</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="resumen-venta">
                    <p><strong>Subtotal:</strong> ${ventaSeleccionada.subtotal.toLocaleString()}</p>
                    <p><strong>IVA:</strong> ${ventaSeleccionada.iva.toLocaleString()}</p>
                    <p><strong>Total:</strong> ${ventaSeleccionada.total.toLocaleString()}</p>
                </div>
                <div className="modal-footer">
                    <button className="modal-btn cancel-btn" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </Modal>
    );
}