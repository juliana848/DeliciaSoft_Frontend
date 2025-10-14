import React from 'react';
import Modal from '../../components/modal';

export default function VentasAbonosModal({
    visible,
    onClose,
    ventaSeleccionada,
    abonos,
    setMostrarModalAgregarAbono,
    verDetalleAbono,
    anularAbono
}) {
    if (!visible || !ventaSeleccionada) return null;

    const totalVenta = ventaSeleccionada.total || 0;
    
    const totalPagado = (abonos || []).reduce((sum, abono) => {
        const montoAbono = parseFloat(abono.monto || abono.cantidadPagar || abono.totalPagado || 0);
        return abono.anulado ? sum : sum + montoAbono;
    }, 0);
    
    const faltaPorPagar = totalVenta - totalPagado;

    return (
        <Modal visible={visible} onClose={onClose}>
            <div className="abonos-modal-container">
                {/* Header con información */}
                <div className="header-info">
                    <div className="info-badge">
                        <span className="badge-icon">💰</span>
                        <span>Venta #{ventaSeleccionada.idVenta}</span>
                    </div>
                    <div className="info-badge">
                        <span className="badge-icon">👤</span>
                        <span>{ventaSeleccionada.nombreCliente}</span>
                    </div>
                </div>

                {/* Card de información de la venta */}
                <div className="form-card">
                    <h2 className="section-title">
                        <span className="title-icon">📊</span>
                        Resumen de la Venta
                    </h2>

                    <div className="venta-info-grid">
                        <div className="info-item">
                            <label className="info-label">Total de la Venta</label>
                            <span className="info-value total-venta">${totalVenta.toLocaleString()}</span>
                        </div>
                        <div className="info-item">
                            <label className="info-label">Total Pagado</label>
                            <span className="info-value pagado">${totalPagado.toLocaleString()}</span>
                        </div>
                        <div className="info-item destacado">
                            <label className="info-label">Falta por Pagar</label>
                            <span className={`info-value ${faltaPorPagar <= 0 ? 'completo' : 'pendiente'}`}>
                                ${faltaPorPagar.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Botón Agregar Abono - ARRIBA */}
                <div className="agregar-abono-section">
                    <button
                        className="btn-agregar-abono-top"
                        onClick={() => setMostrarModalAgregarAbono(true)}
                        disabled={faltaPorPagar <= 0}
                        title={faltaPorPagar <= 0 ? 'Esta venta ya está completamente pagada' : 'Agregar nuevo abono'}
                    >
                        <span className="btn-icon">{faltaPorPagar <= 0 ? '✅' : '+'}</span>
                        {faltaPorPagar <= 0 ? 'Venta Pagada Completa' : 'Agregar Abono'}
                    </button>
                </div>

                {/* Card de lista de abonos */}
                <div className="form-card">
                    <h2 className="section-title">
                        <span className="title-icon">📦</span>
                        Detalle de Abonos
                    </h2>

                    {abonos && abonos.length > 0 ? (
                        <div className="table-container">
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Método de Pago</th>
                                        <th>Monto</th>
                                        <th>Falta por Pagar</th>
                                        <th>Comprobante</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {abonos.map((abono, index) => {
                                        const montoAbono = parseFloat(abono.monto || abono.cantidadPagar || abono.totalPagado || 0);
                                        
                                        const totalPagadoHastaAqui = abonos
                                            .slice(0, index + 1)
                                            .reduce((sum, a) => {
                                                const montoA = parseFloat(a.monto || a.cantidadPagar || a.totalPagado || 0);
                                                return a.anulado ? sum : sum + montoA;
                                            }, 0);
                                        const faltaPorPagarEnEsteAbono = Math.max(0, totalVenta - totalPagadoHastaAqui);

                                        return (
                                            <tr key={abono.id || abono.idAbono || index} 
                                                className={`product-row ${abono.anulado ? 'abono-anulado' : ''}`}>
                                                <td>{abono.fecha || new Date().toISOString().split('T')[0]}</td>
                                                <td>
                                                    <span className="metodo-badge">
                                                        {(abono.metodoPago || abono.metodo_pago || 'N/A').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="price-cell">
                                                    ${montoAbono.toLocaleString()}
                                                </td>
                                                <td className="subtotal-cell">
                                                    ${faltaPorPagarEnEsteAbono.toLocaleString()}
                                                </td>
                                                <td className="action-cell">
                                                    {(abono.comprobante_imagen || abono.imagenes?.urlimg) ? (
                                                        <div className="comprobante-thumbnail-container">
                                                            <img 
                                                                src={abono.comprobante_imagen || abono.imagenes.urlimg} 
                                                                alt="Comprobante" 
                                                                className="comprobante-thumbnail"
                                                                onClick={() => window.open(abono.comprobante_imagen || abono.imagenes.urlimg, '_blank')}
                                                                title="Click para ver imagen completa"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className="no-comprobante">Sin comprobante</span>
                                                    )}
                                                </td>
                                                <td className="action-cell">
                                                    {abono.anulado ? 
                                                        <span className="estado-tag estado-anulada">ANULADO</span> : 
                                                        <span className="estado-tag estado-activa">ACTIVO</span>
                                                    }
                                                </td>
                                                <td className="action-cell">
                                                    <div className="action-buttons-inline">
                                                        <button
                                                            className="btn-action-table view-btn"
                                                            title="Ver Detalle"
                                                            onClick={() => verDetalleAbono(abono)}
                                                        >
                                                            <span className="btn-icon-small">👁️</span>
                                                          
                                                        </button>
                                                        {!abono.anulado && (
                                                            <button
                                                                className="btn-action-table delete-btn"
                                                                title="Anular Abono"
                                                                onClick={() => {
                                                                    if (window.confirm('¿Está seguro de que desea anular este abono?')) {
                                                                        anularAbono(abono.id || abono.idAbono);
                                                                    }
                                                                }}
                                                            >
                                                                <span className="btn-icon-small">🚫</span>
                                                                
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-products-message">
                            <p>No hay abonos registrados para esta venta</p>
                            <p className="help-text">Agregue el primer abono usando el botón de arriba</p>
                        </div>
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
                </div>
            </div>

            <style jsx>{`
                .abonos-modal-container {
                    max-width: 1200px;
                    width: 100%;
                    max-height: 85vh;
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

                .title-icon {
                    font-size: 24px;
                }

                /* Venta Info Grid */
                .venta-info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }

                .info-item {
                    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
                    padding: 16px;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                    transition: all 0.2s ease;
                }

                .info-item.destacado {
                    background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
                    border: 2px solid #ec4899;
                    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.15);
                }

                .info-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
                }

                .info-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 500;
                    color: #6b7280;
                    margin-bottom: 8px;
                }

                .info-value {
                    display: block;
                    font-size: 20px;
                    font-weight: 700;
                    color: #374151;
                }

                .info-value.total-venta {
                    color: #374151;
                }

                .info-value.pagado {
                    color: #10b981;
                }

                .info-value.pendiente {
                    color: #ec4899;
                }

                .info-value.completo {
                    color: #10b981;
                }

                /* Agregar Abono Section - ARRIBA */
                .agregar-abono-section {
                    margin-bottom: 24px;
                }

                .btn-agregar-abono-top {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    width: 100%;
                    background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
                    color: white;
                    border: none;
                    padding: 16px 32px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
                }

                .btn-agregar-abono-top:hover:not(:disabled) {
                    background: linear-gradient(135deg, #be185d 0%, #9d174d 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(236, 72, 153, 0.4);
                }

                .btn-agregar-abono-top:disabled {
                    background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
                    cursor: not-allowed;
                    opacity: 0.6;
                    transform: none;
                }

                /* Table Container */
                .table-container {
                    overflow: hidden;
                    border-radius: 12px;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
                    border: 1px solid #e5e7eb;
                    max-height: 400px;
                    overflow-y: auto;
                }

                .products-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                }

                .products-table th {
                    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
                    color: #374151;
                    font-weight: 600;
                    padding: 16px 12px;
                    text-align: left;
                    border-bottom: 2px solid #e5e7eb;
                    font-size: 14px;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }

                .products-table td {
                    padding: 16px 12px;
                    border-bottom: 1px solid #f1f5f9;
                    vertical-align: middle;
                    color: #374151;
                    font-size: 14px;
                }

                .product-row {
                    transition: background 0.2s ease;
                }

                .product-row:hover {
                    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
                }

                .product-row.abono-anulado {
                    background-color: #fee2e2;
                    opacity: 0.7;
                }

                .price-cell {
                    text-align: right;
                    font-weight: 600;
                    color: #10b981;
                }

                .subtotal-cell {
                    text-align: right;
                    font-weight: 600;
                    color: #ec4899;
                }

                .action-cell {
                    text-align: center;
                }

                /* Método Badge */
                .metodo-badge {
                    display: inline-block;
                    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                    color: #1e40af;
                    padding: 6px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }

                /* Comprobante */
                .comprobante-thumbnail-container {
                    display: flex;
                    justify-content: center;
                }

                .comprobante-thumbnail {
                    width: 50px;
                    height: 50px;
                    object-fit: cover;
                    border-radius: 8px;
                    border: 2px solid #e5e7eb;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .comprobante-thumbnail:hover {
                    transform: scale(1.1);
                    border-color: #ec4899;
                    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
                }

                .no-comprobante {
                    color: #9ca3af;
                    font-style: italic;
                    font-size: 12px;
                }

                /* Estado Tags */
                .estado-tag {
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .estado-activa {
                    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
                    color: #065f46;
                }

                .estado-anulada {
                    background: linear-gradient(135deg, #fee2e2, #fecaca);
                    color: #991b1b;
                }

                /* Action Buttons Inline */
                .action-buttons-inline {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .btn-action-table {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    font-size: 13px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-weight: 600;
                }

                .btn-icon-small {
                    font-size: 14px;
                }

                .view-btn {
                    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                    color: #1e40af;
                }

                .view-btn:hover {
                    background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 3px 8px rgba(59, 130, 246, 0.3);
                }

                .delete-btn {
                    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                    color: #dc2626;
                }

                .delete-btn:hover {
                    background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 3px 8px rgba(239, 68, 68, 0.3);
                }

                /* No Products Message */
                .no-products-message {
                    text-align: center;
                    padding: 40px 20px;
                    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
                    border-radius: 12px;
                    color: #6b7280;
                }

                .no-products-message p {
                    margin: 10px 0;
                }

                .help-text {
                    font-size: 14px;
                    color: #9ca3af;
                }

                /* Action Buttons */
                .action-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                }

                .btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 14px 32px;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 15px;
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

                .btn-icon {
                    font-size: 18px;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .abonos-modal-container {
                        padding: 16px;
                    }

                    .venta-info-grid {
                        grid-template-columns: 1fr;
                    }

                    .products-table {
                        font-size: 12px;
                    }

                    .products-table th,
                    .products-table td {
                        padding: 8px 6px;
                    }

                    .action-buttons {
                        flex-direction: column;
                    }

                    .btn {
                        width: 100%;
                        justify-content: center;
                    }

                    .btn-agregar-abono-top {
                        padding: 14px 24px;
                        font-size: 15px;
                    }
                }
            `}</style>
        </Modal>
    );
}