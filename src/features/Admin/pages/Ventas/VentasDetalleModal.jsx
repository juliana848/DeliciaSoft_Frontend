import React, { useState, useEffect } from 'react';
import Modal from '../../components/modal';
import ProductOptionsMiniModal from './ProductOptionsMiniModal'; // Import the mini modal


export default function VentasDetalleModal({ visible, onClose, ventaSeleccionada }) {
    // State for the mini modal visibility and selected product
    const [isMiniModalVisible, setIsMiniModalVisible] = useState(false);
    const [selectedProductForMiniModal, setSelectedProductForMiniModal] = useState(null);

    // Effect to reset mini modal state when the main modal opens or changes
    useEffect(() => {
        if (visible) {
            setIsMiniModalVisible(false);
            setSelectedProductForMiniModal(null);
        }
    }, [visible, ventaSeleccionada]);

    if (!visible || !ventaSeleccionada) return null;

    const handleShowProductOptions = (product) => {
        setSelectedProductForMiniModal(product);
        setIsMiniModalVisible(true);
    };

    const handleCloseMiniModal = () => {
        setIsMiniModalVisible(false);
        setSelectedProductForMiniModal(null);
    };

    return (
        // Main Modal
        <Modal visible={visible} onClose={onClose}>
            <div className="detalle-venta-modal"> {/* Main container for the sales detail modal */}
                <h3>Detalle de la Venta #{ventaSeleccionada.id}</h3>
                <div className="modal-content-columns"> {/* This div creates the two columns */}
                    <div className="column"> {/* Left Column for general sale info */}
                        <h4>Información de la Venta:</h4>
                        <p><strong>Cliente:</strong> {ventaSeleccionada.cliente}</p>
                        <p><strong>Sede:</strong> {ventaSeleccionada.sede}</p>
                        <p><strong>Método de Pago:</strong> {ventaSeleccionada.metodo_pago}</p>
                        <p><strong>Estado:</strong> {ventaSeleccionada.estado}</p>
                        {ventaSeleccionada.fecha_venta && <p><strong>Fecha de Venta:</strong> {ventaSeleccionada.fecha_venta}</p>}
                        {ventaSeleccionada.tipo_venta !== 'directa' && ventaSeleccionada.fecha_entrega && (
                            <p><strong>Fecha de Entrega:</strong> {ventaSeleccionada.fecha_entrega}</p>
                        )}
                    </div>
                    <div className="column"> {/* Right Column for products list */}
                        <h4>Productos Incluidos:</h4>
                        <div className="productos-lista-scrollable"> {/* Make this list scrollable if it gets too long */}
                            {ventaSeleccionada.productos.length > 0 ? (
                                ventaSeleccionada.productos.map((item) => (
                                    <div key={item.id} className="producto-item-container">
                                        <div className="producto-info">
                                            <strong>Producto:</strong> {item.nombre} (Cantidad: {item.cantidad}) - ${item.precio.toLocaleString()} c/u
                                        </div>
                                        {(item.adiciones?.length > 0 || item.salsas?.length > 0 || item.sabores?.length > 0) && (
                                            <button
                                                className="product-options-show-btn"
                                                onClick={() => handleShowProductOptions(item)}
                                            >
                                                Ver Opciones
                                            </button>
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

            {/* Product Options Mini Modal, appears on top */}
            <ProductOptionsMiniModal
                visible={isMiniModalVisible}
                onClose={handleCloseMiniModal}
                product={selectedProductForMiniModal}
            />
        </Modal>
    );
}