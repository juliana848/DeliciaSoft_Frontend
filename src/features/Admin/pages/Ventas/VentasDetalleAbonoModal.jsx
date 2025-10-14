import React from 'react';
import Modal from '../../components/modal';

export default function VentasDetalleAbonoModal({ 
    visible, 
    onClose, 
    abonoSeleccionado, 
    anularAbono 
}) {
    if (!visible || !abonoSeleccionado) return null;

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
            <div className="detalle-abono-container">
                {/* Header con información */}
                <div className="header-info">
                    <div className="info-badge">
                        <span className="badge-icon">💰</span>
                        <span>Abono #{idAbono}</span>
                    </div>
                    {abonoSeleccionado.anulado ? (
                        <div className="info-badge estado-badge anulado">
                            <span className="badge-icon">🚫</span>
                            <span>ANULADO</span>
                        </div>
                    ) : (
                        <div className="info-badge estado-badge activo">
                            <span className="badge-icon">✓</span>
                            <span>ACTIVO</span>
                        </div>
                    )}
                </div>

                {/* Card principal */}
                <div className="form-card">
                    <h2 className="section-title">
                        <span className="title-icon">📄</span>
                        Detalle del Abono
                    </h2>

                    <div className="detalle-grid">
                        <div className="detalle-item">
                            <label className="detalle-label">Fecha</label>
                            <span className="detalle-value">{fechaAbono}</span>
                        </div>

                        <div className="detalle-item">
                            <label className="detalle-label">Método de Pago</label>
                            <span className="detalle-value">
                                <span className="metodo-badge">{metodoPago.toUpperCase()}</span>
                            </span>
                        </div>

                        <div className="detalle-item destacado">
                            <label className="detalle-label">Monto Pagado</label>
                            <span className="detalle-value monto">${montoAbono.toLocaleString()}</span>
                        </div>

                        {abonoSeleccionado.cliente && (
                            <div className="detalle-item">
                                <label className="detalle-label">Cliente</label>
                                <span className="detalle-value">{abonoSeleccionado.cliente}</span>
                            </div>
                        )}

                        {abonoSeleccionado.totalVenta && (
                            <div className="detalle-item">
                                <label className="detalle-label">Total de la Venta</label>
                                <span className="detalle-value">${parseFloat(abonoSeleccionado.totalVenta).toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {comprobante && (
                        <>
                            <div className="section-divider"></div>
                            
                            <div className="comprobante-section">
                                <h3 className="subsection-title">
                                    <span className="title-icon">📎</span>
                                    Comprobante de Pago
                                </h3>
                                <div className="comprobante-viewer">
                                    <img 
                                        src={comprobante} 
                                        alt="Comprobante de pago" 
                                        className="comprobante-image"
                                        onClick={() => window.open(comprobante, '_blank')}
                                        title="Click para ver imagen completa"
                                    />
                                    <button 
                                        type="button"
                                        className="btn-ver-completa"
                                        onClick={() => window.open(comprobante, '_blank')}
                                    >
                                        <span className="btn-icon">🔍</span>
                                        Ver imagen completa
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Botones de acción */}
                <div className="action-buttons">
                    <button 
                        className="btn btn-cancel" 
                        onClick={onClose}
                    >
                        <span className="btn-icon">✕</span>
                        Cerrar
                    </button>
                    
                    {!abonoSeleccionado.anulado && (
                        <button 
                            className="btn btn-delete" 
                            onClick={handleAnular}
                        >
                            <span className="btn-icon">🚫</span>
                            Anular Abono
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
                .detalle-abono-container {
                    max-width: 900px;
                    width: 90vw;
                    max-height: 90vh;
                    overflow-y: auto;
                    padding: 20px;
                    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                /* Header Info */
                .header-info {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .info-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                    color: #374151;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                    box-shadow: 0 2px 8px rgba(107, 114, 128, 0.1);
                    border: 1px solid #d1d5db;
                }

                .estado-badge.activo {
                    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
                    color: #065f46;
                    border: 1px solid #10b981;
                }

                .estado-badge.anulado {
                    background: linear-gradient(135deg, #fee2e2, #fecaca);
                    color: #991b1b;
                    border: 1px solid #ef4444;
                }

                .badge-icon {
                    font-size: 16px;
                }

                /* Form Card */
                .form-card {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    border: 1px solid #e5e7eb;
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 20px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 24px;
                    padding-bottom: 12px;
                    border-bottom: 2px solid #e5e7eb;
                }

                .subsection-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 16px;
                }

                .title-icon {
                    font-size: 24px;
                }

                /* Detalle Grid */
                .detalle-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                }

                .detalle-item {
                    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
                    padding: 16px;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    transition: all 0.2s ease;
                }

                .detalle-item.destacado {
                    background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
                    border: 2px solid #ec4899;
                    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.15);
                }

                .detalle-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
                }

                .detalle-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .detalle-value {
                    font-size: 16px;
                    font-weight: 600;
                    color: #374151;
                }

                .detalle-value.monto {
                    font-size: 24px;
                    color: #ec4899;
                }

                /* Método Badge */
                .metodo-badge {
                    display: inline-block;
                    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                    color: #1e40af;
                    padding: 6px 14px;
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }

                /* Section Divider */
                .section-divider {
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
                    margin: 24px 0;
                }

                /* Comprobante Section */
                .comprobante-section {
                    margin-top: 20px;
                }

                .comprobante-viewer {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
                    padding: 20px;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                }

                .comprobante-image {
                    max-width: 100%;
                    max-height: 400px;
                    border-radius: 12px;
                    border: 2px solid #e5e7eb;
                    object-fit: contain;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .comprobante-image:hover {
                    transform: scale(1.02);
                    border-color: #ec4899;
                    box-shadow: 0 8px 24px rgba(236, 72, 153, 0.2);
                }

                .btn-ver-completa {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                    color: #374151;
                    border: 2px solid #d1d5db;
                    padding: 10px 20px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }

                .btn-ver-completa:hover {
                    background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                /* Action Buttons */
                .action-buttons {
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                }

                .btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 14px 32px;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 15px;
                    flex: 1;
                }

                .btn-cancel {
                    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                    color: #6b7280;
                    border: 2px solid #d1d5db;
                }

                .btn-cancel:hover {
                    background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
                    color: #374151;
                    transform: translateY(-1px);
                }

                .btn-delete {
                    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                    color: #dc2626;
                    border: 2px solid #ef4444;
                }

                .btn-delete:hover {
                    background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }

                .btn-icon {
                    font-size: 18px;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .detalle-abono-container {
                        padding: 16px;
                    }

                    .detalle-grid {
                        grid-template-columns: 1fr;
                    }

                    .action-buttons {
                        flex-direction: column;
                    }

                    .btn {
                        width: 100%;
                    }

                    .comprobante-image {
                        max-height: 200px;
                    }
                }
            `}</style>
        </Modal>
    );
}