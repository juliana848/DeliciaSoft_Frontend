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

    // CORRECCIÓN: Calcular totales usando los campos correctos del backend
    const totalVenta = ventaSeleccionada.total || 0;
    
    // CORRECCIÓN: Usar los campos correctos según la respuesta del backend
    const totalPagado = (abonos || []).reduce((sum, abono) => {
        // El backend devuelve 'monto' no 'cantidadpagar'
        const montoAbono = parseFloat(abono.monto || abono.cantidadPagar || abono.totalPagado || 0);
        // Solo sumar abonos que NO estén anulados
        return abono.anulado ? sum : sum + montoAbono;
    }, 0);
    
    const faltaPorPagar = totalVenta - totalPagado;

    return (
        <Modal visible={visible} onClose={onClose}>
            <div className="abonos-modal">
                <div className="modal-header">
                    <h3>Abonos de la Venta #{ventaSeleccionada.idVenta}</h3>
                    <div className="venta-info">
                        <p><strong>Cliente:</strong> {ventaSeleccionada.nombreCliente}</p>
                        <p><strong>Total de la Venta:</strong> ${totalVenta.toLocaleString()}</p>
                        <p><strong>Total Pagado:</strong> ${totalPagado.toLocaleString()}</p>
                        <p className={`falta-pagar ${faltaPorPagar <= 0 ? 'pagado-completo' : ''}`}>
                            <strong>Falta por Pagar:</strong> ${faltaPorPagar.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="abonos-lista">
                    {abonos && abonos.length > 0 ? (
                        <div className="table-container">
                            <table className="abonos-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
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
                                        // CORRECCIÓN: Usar 'monto' del backend
                                        const montoAbono = parseFloat(abono.monto || abono.cantidadPagar || abono.totalPagado || 0);
                                        
                                        // Calcular falta por pagar acumulativa hasta este abono (solo abonos activos)
                                        const totalPagadoHastaAqui = abonos
                                            .slice(0, index + 1)
                                            .reduce((sum, a) => {
                                                const montoA = parseFloat(a.monto || a.cantidadPagar || a.totalPagado || 0);
                                                return a.anulado ? sum : sum + montoA;
                                            }, 0);
                                        const faltaPorPagarEnEsteAbono = Math.max(0, totalVenta - totalPagadoHastaAqui);

                                        return (
                                            <tr key={abono.id || abono.idAbono || index} 
                                                className={abono.anulado ? 'abono-anulado' : ''}>
                                                <td>{abono.id || abono.idAbono || '-'}</td>
                                                <td>{abono.fecha || new Date().toISOString().split('T')[0]}</td>
                                                <td className="metodo-pago">
                                                    {(abono.metodoPago || abono.metodo_pago || 'N/A').toUpperCase()}
                                                </td>
                                                <td className="monto">
                                                    ${montoAbono.toLocaleString()}
                                                </td>
                                                <td className="falta-pagar">
                                                    ${faltaPorPagarEnEsteAbono.toLocaleString()}
                                                </td>
                                                <td className="comprobante">
                                                    {(abono.comprobante_imagen || abono.imagenes?.urlimg) ? (
                                                        <div className="imagen-container">
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
                                                <td className="estado">
                                                    {abono.anulado ? 
                                                        <span className="estado-anulado">ANULADO</span> : 
                                                        <span className="estado-activo">ACTIVO</span>
                                                    }
                                                </td>
                                                <td className="acciones">
                                                    <div className="botones-acciones">
                                                        <button
                                                            className="admin-button view-btn"
                                                            title="Ver Detalle"
                                                            onClick={() => verDetalleAbono(abono)}
                                                        >
                                                            👁️
                                                        </button>
                                                        {!abono.anulado && (
                                                            <button
                                                                className="admin-button delete-btn"
                                                                title="Anular Abono"
                                                                onClick={() => {
                                                                    if (window.confirm('¿Está seguro de que desea anular este abono?')) {
                                                                        anularAbono(abono.id || abono.idAbono);
                                                                    }
                                                                }}
                                                            >
                                                                🚫
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
                        <div className="no-abonos">
                            <p>No hay abonos registrados para esta venta</p>
                            <p className="help-text">Agregue el primer abono usando el botón de abajo</p>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button
                        className="btn-agregar-abono"
                        onClick={() => setMostrarModalAgregarAbono(true)}
                        disabled={faltaPorPagar <= 0}
                        title={faltaPorPagar <= 0 ? 'Esta venta ya está completamente pagada' : 'Agregar nuevo abono'}
                    >
                        {faltaPorPagar <= 0 ? '✅ Venta Pagada Completa' : '+ Agregar Abono'}
                    </button>
                    
                    <button
                        className="btn-cerrar"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </div>
            </div>

            <style jsx>{`
                .abonos-modal {
                    max-width: 1000px;
                    width: 100%;
                    max-height: 80vh;
                    overflow-y: auto;
                }

                .modal-header {
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #e9ecef;
                }

                .modal-header h3 {
                    margin: 0 0 15px 0;
                    color: #333;
                    font-size: 1.5em;
                }

                .venta-info {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 10px;
                }

                .venta-info p {
                    margin: 5px 0;
                    color: #495057;
                }

                .falta-pagar {
                    color: #dc3545;
                    font-size: 1.1em;
                }

                .falta-pagar.pagado-completo {
                    color: #28a745;
                }

                .table-container {
                    max-height: 400px;
                    overflow-y: auto;
                    border: 1px solid #dee2e6;
                    border-radius: 5px;
                }

                .abonos-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                }

                .abonos-table th,
                .abonos-table td {
                    padding: 10px 8px;
                    text-align: left;
                    border-bottom: 1px solid #dee2e6;
                }

                .abonos-table th {
                    background-color: #f8f9fa;
                    font-weight: bold;
                    color: #495057;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }

                .abonos-table tbody tr:hover {
                    background-color: #f5f5f5;
                }

                .abono-anulado {
                    background-color: #f8d7da;
                    opacity: 0.7;
                }

                .metodo-pago {
                    font-weight: 500;
                    color: #495057;
                }

                .monto {
                    font-weight: bold;
                    color: #28a745;
                }

                .falta-pagar {
                    font-weight: bold;
                    color: #dc3545;
                }

                .comprobante {
                    text-align: center;
                }

                .comprobante-thumbnail {
                    width: 50px;
                    height: 50px;
                    object-fit: cover;
                    border-radius: 4px;
                    border: 1px solid #ddd;
                    cursor: pointer;
                    transition: transform 0.2s;
                }

                .comprobante-thumbnail:hover {
                    transform: scale(1.1);
                }

                .no-comprobante {
                    color: #6c757d;
                    font-style: italic;
                    font-size: 12px;
                }

                .estado {
                    text-align: center;
                }

                .estado-activo {
                    background: #d4edda;
                    color: #155724;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: bold;
                }

                .estado-anulado {
                    background: #f8d7da;
                    color: #721c24;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: bold;
                }

                .acciones {
                    text-align: center;
                }

                .botones-acciones {
                    display: flex;
                    gap: 5px;
                    justify-content: center;
                }

                .admin-button {
                    padding: 6px 10px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.3s;
                }

                .view-btn {
                    background: #17a2b8;
                    color: white;
                }

                .view-btn:hover {
                    background: #138496;
                }

                .delete-btn {
                    background: #dc3545;
                    color: white;
                }

                .delete-btn:hover {
                    background: #c82333;
                }

                .no-abonos {
                    text-align: center;
                    padding: 40px 20px;
                    background: #f8f9fa;
                    border-radius: 5px;
                    color: #6c757d;
                }

                .no-abonos p {
                    margin: 10px 0;
                }

                .help-text {
                    font-size: 14px;
                    color: #6c757d;
                }

                .modal-footer {
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 10px;
                }

                .btn-agregar-abono {
                    background: #28a745;
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                    transition: background-color 0.3s;
                }

                .btn-agregar-abono:hover:not(:disabled) {
                    background: #218838;
                }

                .btn-agregar-abono:disabled {
                    background: #6c757d;
                    cursor: not-allowed;
                }

                .btn-cerrar {
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                }

                .btn-cerrar:hover {
                    background: #5a6268;
                }

                @media (max-width: 768px) {
                    .venta-info {
                        grid-template-columns: 1fr;
                    }
                    
                    .abonos-table {
                        font-size: 12px;
                    }
                    
                    .abonos-table th,
                    .abonos-table td {
                        padding: 6px 4px;
                    }
                    
                    .modal-footer {
                        flex-direction: column;
                        gap: 10px;
                    }
                    
                    .btn-agregar-abono,
                    .btn-cerrar {
                        width: 100%;
                    }
                }
            `}</style>
        </Modal>
    );
}