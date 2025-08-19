import React from 'react';
import Modal from '../../components/modal'; // Assuming you use the same Modal component
import '../../adminStyles.css';


export default function ProductOptionsMiniModal({ visible, onClose, product }) {
    if (!visible || !product) return null;

    return (
        <Modal visible={visible} onClose={onClose} isMiniModal={true}> {/* Add isMiniModal prop for specific styling */}
            <div className="product-options-mini-modal-content">
                <h4>Opciones de: {product.nombre}</h4>
                {product.adiciones && product.adiciones.length > 0 && (
                    <div className="mini-options-section">
                        <strong>Adiciones:</strong>
                        <ul>
                            {product.adiciones.map((ad, adIndex) => (
                                <li key={adIndex}>{ad.nombre} (${ad.precio.toLocaleString()})</li>
                            ))}
                        </ul>
                    </div>
                )}
                {product.salsas && product.salsas.length > 0 && (
                    <div className="mini-options-section">
                        <strong>Salsas:</strong>
                        <ul>
                            {product.salsas.map((sa, saIndex) => (
                                <li key={saIndex}>{sa.nombre} (${sa.precio.toLocaleString()})</li>
                            ))}
                        </ul>
                    </div>
                )}
                {product.sabores && product.sabores.length > 0 && (
                    <div className="mini-options-section">
                        <strong>Rellenos:</strong>
                        <ul>
                            {product.sabores.map((re, reIndex) => (
                                <li key={reIndex}>{re.nombre} (${re.precio.toLocaleString()})</li>
                            ))}
                        </ul>
                    </div>
                )}
                {(!product.adiciones || product.adiciones.length === 0) &&
                 (!product.salsas || product.salsas.length === 0) &&
                 (!product.sabores || product.sabores.length === 0) && (
                    <p>No hay opciones adicionales para este producto.</p>
                )}
                <div className="mini-modal-footer">
                    <button className="modal-btn mini-modal-close-btn" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </Modal>
    );
}