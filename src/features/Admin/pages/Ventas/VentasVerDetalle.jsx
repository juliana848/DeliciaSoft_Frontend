// VentasVerDetalle.jsx
import React from 'react';
import Modal from '../../components/modal';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export default function VentasVerDetalle({
    visible,
    onClose,
    ventaSeleccionada,
}) {
    // Si la venta no está cargada o el modal no está visible, no renderiza nada
    if (!visible || !ventaSeleccionada) {
        return null;
    }

    const {
        idVenta,
        nombreCliente,
        nombreSede,
        metodoPago,
        tipoVenta,
        nombreEstado,
        fechaVenta,
        total,
        productos,
        abonos,
        observaciones,
        descuento,
        fechaEntrega
    } = ventaSeleccionada;

    const getSeverityClass = (nombreEstado) => {
        switch (nombreEstado) {
            case 'Activa':
                return 'estado-activa';
            case 'Anulada':
                return 'estado-anulada';
            case 'En espera':
            case 'Pendiente':
                return 'estado-espera';
            case 'En producción':
            case 'En Proceso':
                return 'estado-produccion';
            case 'Por entregar':
                return 'estado-entregar';
            case 'Finalizado':
            case 'Completada':
                return 'estado-finalizado';
            default:
                return '';
        }
    };

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

    const adicionesTemplate = (rowData) => {
        if (!rowData.adiciones || rowData.adiciones.length === 0) {
            return 'Ninguna';
        }
        return (
            <ul>
                {rowData.adiciones.map((adic, index) => (
                    <li key={index}>{adic.nombre} ({adic.cantidad})</li>
                ))}
            </ul>
        );
    };

    const salsasTemplate = (rowData) => {
        if (!rowData.salsas || rowData.salsas.length === 0) {
            return 'Ninguna';
        }
        return (
            <ul>
                {rowData.salsas.map((salsa, index) => (
                    <li key={index}>{salsa.nombre} ({salsa.cantidad})</li>
                ))}
            </ul>
        );
    };

    const saboresTemplate = (rowData) => {
        if (!rowData.sabores || rowData.sabores.length === 0) {
            return 'Ninguno';
        }
        return (
            <ul>
                {rowData.sabores.map((sabor, index) => (
                    <li key={index}>{sabor.nombre} ({sabor.cantidad})</li>
                ))}
            </ul>
        );
    };

    return (
        <Modal visible={visible} onClose={onClose}>
            <div className="detalle-venta-modal">
                <div className="modal-header">
                    <h3>Detalle de la Venta N° {idVenta}</h3>
                </div>

                <div className="modal-body">
                    <div className="info-section">
                        <h4>Información de la Venta</h4>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Cliente:</span>
                                <span className="value">{nombreCliente || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Sede:</span>
                                <span className="value">{nombreSede || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Fecha:</span>
                                <span className="value">{formatearFecha(fechaVenta)}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Estado:</span>
                                <span className={`estado-tag ${getSeverityClass(nombreEstado)}`}>
                                    {nombreEstado || 'N/A'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="label">Tipo de venta:</span>
                                <span className="value">{tipoVenta || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Método de Pago:</span>
                                <span className="value">{metodoPago || 'N/A'}</span>
                            </div>
                            {fechaEntrega && (
                                <div className="info-item">
                                    <span className="label">Fecha de Entrega:</span>
                                    <span className="value">{formatearFecha(fechaEntrega)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="info-section">
                        <h4>Productos y Resumen</h4>
                        <DataTable
                            value={productos}
                            emptyMessage="No hay productos en esta venta."
                            className="productos-table"
                        >
                            <Column field="nombre" header="Producto" />
                            <Column field="cantidad" header="Cantidad" />
                            <Column field="precioUnitario" header="Precio" body={rowData => formatearMoneda(rowData.precioUnitario)} />
                            <Column field="subtotal" header="Subtotal" body={rowData => formatearMoneda(rowData.subtotal)} />
                            <Column header="Adiciones" body={adicionesTemplate} />
                            <Column header="Sabores" body={saboresTemplate} />
                            <Column header="Salsas" body={salsasTemplate} />
                        </DataTable>
                        <div className="resumen-container">
                            <div className="resumen-item">
                                <span className="label">Subtotal:</span>
                                <span className="value">{formatearMoneda(ventaSeleccionada.subtotal || 0)}</span>
                            </div>
                            <div className="resumen-item">
                                <span className="label">IVA:</span>
                                <span className="value">{formatearMoneda(ventaSeleccionada.iva || 0)}</span>
                            </div>
                            <div className="resumen-item">
                                <span className="label">Descuento:</span>
                                <span className="value">{formatearMoneda(descuento || 0)}</span>
                            </div>
                            <div className="resumen-item total-item">
                                <span className="label">Total:</span>
                                <span className="value">{formatearMoneda(total)}</span>
                            </div>
                        </div>
                    </div>

                    {abonos && abonos.length > 0 && (
                        <div className="info-section">
                            <h4>Abonos Realizados</h4>
                             <DataTable
                                value={abonos}
                                emptyMessage="No hay abonos para esta venta."
                                className="abonos-table"
                            >
                                <Column field="fechaAbono" header="Fecha" body={rowData => formatearFecha(rowData.fechaAbono)} />
                                <Column field="cantidadAbono" header="Monto" body={rowData => formatearMoneda(rowData.cantidadAbono)} />
                                <Column field="metodoPago" header="Método de Pago" />
                            </DataTable>
                        </div>
                    )}

                    {observaciones && (
                        <div className="info-section">
                            <h4>Observaciones</h4>
                            <p>{observaciones}</p>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-cerrar" onClick={onClose}>Cerrar</button>
                </div>
            </div>

            <style jsx>{`
                .detalle-venta-modal {
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #e0e0e0;
                    padding-bottom: 1rem;
                }
                .modal-header h3 {
                    margin: 0;
                    font-size: 1.5rem;
                    color: #333;
                }
                .modal-body {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                .info-section {
                    background: #f9f9f9;
                    border-radius: 8px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .info-section h4 {
                    margin-top: 0;
                    margin-bottom: 1rem;
                    color: #555;
                    border-bottom: 2px solid #ddd;
                    padding-bottom: 0.5rem;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1rem;
                }
                .info-item {
                    display: flex;
                    flex-direction: column;
                }
                .info-item .label {
                    font-weight: 600;
                    color: #777;
                    font-size: 0.9rem;
                }
                .info-item .value {
                    font-weight: 400;
                    font-size: 1rem;
                    color: #333;
                }
                .productos-table, .abonos-table {
                    width: 100%;
                    border: none !important;
                }
                .resumen-container {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 0.5rem;
                    margin-top: 1rem;
                    border-top: 1px dashed #ccc;
                    padding-top: 1rem;
                }
                .resumen-item {
                    display: flex;
                    justify-content: space-between;
                    width: 300px;
                }
                .total-item {
                    font-weight: bold;
                    font-size: 1.1rem;
                    border-top: 2px solid #555;
                    padding-top: 0.5rem;
                }
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    border-top: 1px solid #e0e0e0;
                    padding-top: 1rem;
                }
                .btn-cerrar {
                    padding: 0.75rem 1.5rem;
                    background-color: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: background-color 0.2s;
                }
                .btn-cerrar:hover {
                    background-color: #5a6268;
                }
                .estado-tag {
                    font-size: 0.75rem !important;
                    font-weight: 600 !important;
                    padding: 0.35rem 0.8rem !important;
                    border-radius: 10px !important;
                    min-width: 90px !r\n                    text-align: center !important;\r\n                    display: inline-block !important;\r\n                    white-space: nowrap !important;\r\n                    overflow: hidden !important;\r\n                    text-overflow: ellipsis !important;\r\n                }\r\n                .estado-activa { background-color: #10b981 !important; color: white !important; }\r\n                .estado-anulada { background-color: #ef4444 !important; color: white !important; }\r\n                .estado-espera { background-color: #f59e0b !important; color: white !important; }\r\n                .estado-produccion { background-color: #3b82f6 !important; color: white !important; }\r\n                .estado-entregar { background-color: #ec4899 !important; color: white !important; }\r\n                .estado-finalizado, .estado-completada { background-color: #8b5cf6 !important; color: white !important; }\r\n            `}</style>
        </Modal>
    );
}