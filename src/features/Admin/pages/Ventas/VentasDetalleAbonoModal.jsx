import React from 'react';
import Modal from '../../components/modal';
import '../../adminStyles.css';

export default function VentasDetalleAbonoModal({ 
    visible, 
    onClose, 
    abonoSeleccionado, 
    anularAbono 
}) {
    if (!visible || !abonoSeleccionado) return null;

    // CORRECCIÓN: Usar los campos correctos del backend
    const montoAbono = parseFloat(abonoSeleccionado.monto || abonoSeleccionado.cantidadPagar || abonoSeleccionado.totalPagado || 0);
    const fechaAbono = abonoSeleccionado.fecha || new Date().toISOString().split('T')[0];
    const metodoPago = abonoSeleccionado.metodoPago || abonoSeleccionado.metodo_pago || 'N/A';
    const comprobante = abonoSeleccionado.comprobante_imagen || abonoSeleccionado.imagenes?.urlimg;
    const idAbono = abonoSeleccionado.id || abonoSeleccionado.idAbono;

    const handleAnular = () => {
        if (window.confirm('¿Está seguro de que desea anular este abono? Esta acción no se puede deshacer.')) {
            anularAbono(idAbono);
        }
    };

    return (
        <Modal visible={visible} onClose={onClose}>
            <div className="detalle-abono-modal">
                <h3>Detalle del Abono #{idAbono}</h3>
                
                <div className="abono-details">
                    <div className="detail-row">
                        <label>ID del Abono:</label>
                        <span className="value">{idAbono || 'N/A'}</span>
                    </div>

                    <div className="detail-row">
                        <label>ID de la Venta:</label>
                        <span className="value">{abonoSeleccionado.idPedido || 'N/A'}</span>
                    </div>

                    <div className="detail-row">
                        <label>Fecha:</label>
                        <span className="value">{fechaAbono}</span>
                    </div>

                    <div className="detail-row">
                        <label>Método de Pago:</label>
                        <span className="value method-badge">{metodoPago.toUpperCase()}</span>
                    </div>

                    <div className="detail-row">
                        <label>Monto Pagado:</label>
                        <span className="value amount">${montoAbono.toLocaleString()}</span>
                    </div>

                    <div className="detail-row">
                        <label>Estado:</label>
                        <span className={`value status ${abonoSeleccionado.anulado ? 'anulado' : 'activo'}`}>
                            {abonoSeleccionado.anulado ? 'ANULADO' : 'ACTIVO'}
                        </span>
                    </div>

                    <div className="detail-row">
                        <label>Cliente:</label>
                        <span className="value">{abonoSeleccionado.cliente || 'N/A'}</span>
                    </div>

                    {abonoSeleccionado.totalVenta && (
                        <div className="detail-row">
                            <label>Total de la Venta:</label>
                            <span className="value">${parseFloat(abonoSeleccionado.totalVenta).toLocaleString()}</span>
                        </div>
                    )}

                    {comprobante && (
                        <div className="detail-row comprobante-row">
                            <label>Comprobante:</label>
                            <div className="comprobante-container">
                                <img 
                                    src={comprobante} 
                                    alt="Comprobante de pago" 
                                    className="comprobante-image"
                                    onClick={() => window.open(comprobante, '_blank')}
                                    title="Click para ver imagen completa"
                                />
                                <button 
                                    className="btn-ver-completa"
                                    onClick={() => window.open(comprobante, '_blank')}
                                >
                                    Ver imagen completa
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button 
                        className="modal-btn cancel-btn" 
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                    
                    {!abonoSeleccionado.anulado && (
                        <button 
                            className="modal-btn delete-btn" 
                            onClick={handleAnular}
                        >
                            Anular Abono
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
                .detalle-abono-modal {
                    max-width: 600px;
                    width: 100%;
                    max-height: 80vh;
                    overflow-y: auto;
                }

                .detalle-abono-modal h3 {
                    margin-bottom: 20px;
                    color: #333;
                    text-align: center;
                    border-bottom: 2px solid #e9ecef;
                    padding-bottom: 10px;
                }

                .abono-details {
                    margin-bottom: 20px;
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid #e9ecef;
                }

                .detail-row:last-child {
                    border-bottom: none;
                }

                .detail-row label {
                    font-weight: bold;
                    color: #495057;
                    flex: 1;
                }

                .detail-row .value {
                    flex: 2;
                    text-align: right;
                    font-weight: 500;
                    color: #212529;
                }

                .method-badge {
                    background: #007bff;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 15px;
                    font-size: 12px;
                    font-weight: bold;
                }

                .amount {
                    color: #28a745;
                    font-size: 18px;
                    font-weight: bold;
                }

                .status {
                    padding: 4px 12px;
                    border-radius: 15px;
                    font-size: 12px;
                    font-weight: bold;
                }

                .status.activo {
                    background: #d4edda;
                    color: #155724;
                }

                .status.anulado {
                    background: #f8d7da;
                    color: #721c24;
                }

                .comprobante-row {
                    flex-direction: column;
                    align-items: flex-start;
                }

                .comprobante-row label {
                    margin-bottom: 10px;
                }

                .comprobante-container {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }

                .comprobante-image {
                    max-width: 100%;
                    max-height: 300px;
                    object-fit: contain;
                    border-radius: 8px;
                    border: 2px solid #e9ecef;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .comprobante-image:hover {
                    transform: scale(1.02);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }

                .btn-ver-completa {
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: background-color 0.2s;
                }

                .btn-ver-completa:hover {
                    background: #5a6268;
                }

                .modal-footer {
                    display: flex;
                    justify-content: space-between;
                    gap: 10px;
                    padding-top: 15px;
                    border-top: 1px solid #e9ecef;
                }

                .modal-btn {
                    flex: 1;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                    transition: background-color 0.3s;
                }

                .cancel-btn {
                    background: #6c757d;
                    color: white;
                }

                .cancel-btn:hover {
                    background: #5a6268;
                }

                .delete-btn {
                    background: #dc3545;
                    color: white;
                }

                .delete-btn:hover {
                    background: #c82333;
                }

                @media (max-width: 768px) {
                    .detalle-abono-modal {
                        max-width: 95vw;
                        margin: 10px;
                    }

                    .detail-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 5px;
                    }

                    .detail-row .value {
                        text-align: left;
                    }

                    .modal-footer {
                        flex-direction: column;
                    }

                    .comprobante-image {
                        max-height: 200px;
                    }
                }
            `}</style>
        </Modal>
    );
}