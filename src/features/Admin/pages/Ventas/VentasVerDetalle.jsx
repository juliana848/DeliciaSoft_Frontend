import React from 'react';
import Modal from '../../components/modal';

export default function VentasDetalleAbonoModal({
    visible,
    onClose,
    abonoSeleccionado,
    anularAbono
}) {
    if (!visible || !abonoSeleccionado) return null;

    const formatearFecha = (fecha) => {
        if (!fecha) return 'No especificada';
        try {
            return new Date(fecha).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return fecha;
        }
    };

    const formatearMoneda = (valor) => {
        const numero = parseFloat(valor || 0);
        return numero.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    return (
        <Modal visible={visible} onClose={onClose}>
            <div className="detalle-abono-modal">
                <div className="modal-header">
                    <h3>Detalle del Abono</h3>
                    <div className="abono-id">
                        ID: {abonoSeleccionado.id || abonoSeleccionado.idAbono || 'N/A'}
                    </div>
                </div>

                <div className="modal-content">
                    <div className="info-section">
                        <h4>Información del Abono</h4>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>ID del Pedido/Venta:</label>
                                <span className="value">
                                    {abonoSeleccionado.idPedido || abonoSeleccionado.idpedido || 'N/A'}
                                </span>
                            </div>

                            <div className="info-item">
                                <label>Método de Pago:</label>
                                <span className="value metodo-pago">
                                    {(abonoSeleccionado.metodoPago || abonoSeleccionado.metodo_pago || 'N/A').toUpperCase()}
                                </span>
                            </div>

                            <div className="info-item">
                                <label>Monto Pagado:</label>
                                <span className="value monto">
                                    {formatearMoneda(abonoSeleccionado.monto || abonoSeleccionado.cantidadpagar)}
                                </span>
                            </div>

                            <div className="info-item">
                                <label>Total Pagado Acumulado:</label>
                                <span className="value">
                                    {formatearMoneda(abonoSeleccionado.totalPagado || abonoSeleccionado.TotalPagado)}
                                </span>
                            </div>

                            <div className="info-item">
                                <label>Fecha:</label>
                                <span className="value">
                                    {formatearFecha(abonoSeleccionado.fecha)}
                                </span>
                            </div>

                            {abonoSeleccionado.falta_por_pagar !== undefined && (
                                <div className="info-item">
                                    <label>Falta por Pagar:</label>
                                    <span className="value falta-pagar">
                                        {formatearMoneda(abonoSeleccionado.falta_por_pagar)}
                                    </span>
                                </div>
                            )}

                            <div className="info-item">
                                <label>Estado:</label>
                                <span className={`value estado ${abonoSeleccionado.anulado ? 'anulado' : 'activo'}`}>
                                    {abonoSeleccionado.anulado ? 'ANULADO' : 'ACTIVO'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Comprobante de Imagen */}
                    {(abonoSeleccionado.comprobante_imagen || abonoSeleccionado.imagenes?.urlimg) && (
                        <div className="comprobante-section">
                            <h4>Comprobante de Pago</h4>
                            <div className="imagen-container">
                                <img 
                                    src={abonoSeleccionado.comprobante_imagen || abonoSeleccionado.imagenes.urlimg} 
                                    alt="Comprobante de pago" 
                                    className="comprobante-imagen"
                                    onClick={() => {
                                        const url = abonoSeleccionado.comprobante_imagen || abonoSeleccionado.imagenes.urlimg;
                                        window.open(url, '_blank');
                                    }}
                                />
                                <p className="imagen-info">
                                    Click en la imagen para ver en tamaño completo
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Información adicional del cliente si existe */}
                    {abonoSeleccionado.cliente && (
                        <div className="cliente-section">
                            <h4>Información del Cliente</h4>
                            <p><strong>Cliente:</strong> {abonoSeleccionado.cliente}</p>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {!abonoSeleccionado.anulado && (
                        <button
                            className="btn-anular"
                            onClick={() => {
                                if (window.confirm('¿Está seguro de que desea anular este abono? Esta acción no se puede deshacer.')) {
                                    anularAbono();
                                }
                            }}
                        >
                            Anular Abono
                        </button>
                    )}
                    <button
                        className="btn-cerrar"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </div>
            </div>

            <style jsx>{`
                .detalle-abono-modal {
                    max-width: 600px;
                    width: 100%;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #e9ecef;
                }

                .modal-header h3 {
                    margin: 0;
                    color: #333;
                    font-size: 1.5em;
                }

                .abono-id {
                    background: #f8f9fa;
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-weight: bold;
                    color: #495057;
                    font-size: 0.9em;
                }

                .info-section {
                    margin-bottom: 25px;
                }

                .info-section h4 {
                    margin: 0 0 15px 0;
                    color: #495057;
                    font-size: 1.2em;
                    border-bottom: 1px solid #dee2e6;
                    padding-bottom: 8px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 15px;
                }

                .info-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px solid #f8f9fa;
                }

                .info-item label {
                    font-weight: 500;
                    color: #6c757d;
                    margin: 0;
                }

                .info-item .value {
                    font-weight: bold;
                    color: #333;
                    text-align: right;
                }

                .value.metodo-pago {
                    background: #e3f2fd;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 0.85em;
                    color: #1976d2;
                }

                .value.monto {
                    color: #28a745;
                    font-size: 1.1em;
                }

                .value.falta-pagar {
                    color: #dc3545;
                    font-size: 1.05em;
                }

                .value.estado.activo {
                    background: #d4edda;
                    color: #155724;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 0.85em;
                }

                .value.estado.anulado {
                    background: #f8d7da;
                    color: #721c24;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 0.85em;
                }

                .comprobante-section {
                    margin-bottom: 25px;
                }

                .comprobante-section h4 {
                    margin: 0 0 15px 0;
                    color: #495057;
                    font-size: 1.2em;
                    border-bottom: 1px solid #dee2e6;
                    padding-bottom: 8px;
                }

                .imagen-container {
                    text-align: center;
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    border: 2px dashed #dee2e6;
                }

                .comprobante-imagen {
                    max-width: 100%;
                    max-height: 300px;
                    object-fit: contain;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    cursor: pointer;
                    transition: transform 0.3s ease;
                }

                .comprobante-imagen:hover {
                    transform: scale(1.05);
                }

                .imagen-info {
                    margin: 10px 0 0 0;
                    color: #6c757d;
                    font-size: 0.9em;
                    font-style: italic;
                }

                .cliente-section {
                    margin-bottom: 25px;
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                }

                .cliente-section h4 {
                    margin: 0 0 10px 0;
                    color: #495057;
                    font-size: 1.1em;
                }

                .cliente-section p {
                    margin: 5px 0;
                    color: #333;
                }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e9ecef;
                }

                .btn-anular {
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                    transition: background-color 0.3s;
                }

                .btn-anular:hover {
                    background: #c82333;
                }

                .btn-cerrar {
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                }

                .btn-cerrar:hover {
                    background: #5a6268;
                }

                @media (max-width: 768px) {
                    .modal-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    }

                    .info-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 5px;
                    }

                    .info-item .value {
                        text-align: left;
                    }

                    .modal-footer {
                        flex-direction: column;
                    }

                    .btn-anular,
                    .btn-cerrar {
                        width: 100%;
                    }
                }
            `}</style>
        </Modal>
    );
}