// VentasVerDetalle.jsx - SIN estilos propios, usando clases existentes
import React from 'react';

export default function VentasVerDetalle({
    ventaSeleccionada,
    onBackToList,
}) {
    if (!ventaSeleccionada) {
        return (
            <div className="admin-container">
                <div className="loading-container">
                    <p>Cargando detalle de venta...</p>
                </div>
            </div>
        );
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
        detalleVenta = [],
        abonos = [],
        observaciones,
        descuento,
        fechaEntrega,
        subtotal = 0,
        iva = 0
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
            <div className="nested-item-list">
                {rowData.adiciones.map((adic, index) => (
                    <div key={index}>
                        {adic.nombre} (x{adic.cantidad}) - ${adic.precio?.toLocaleString('es-CO')}
                    </div>
                ))}
            </div>
        );
    };

    const salsasTemplate = (rowData) => {
        if (!rowData.salsas || rowData.salsas.length === 0) {
            return 'Ninguna';
        }
        return (
            <div className="nested-item-list">
                {rowData.salsas.map((salsa, index) => (
                    <div key={index}>
                        {salsa.nombre} (x{salsa.cantidad}) - ${salsa.precio?.toLocaleString('es-CO')}
                    </div>
                ))}
            </div>
        );
    };

    const saboresTemplate = (rowData) => {
        if (!rowData.sabores || rowData.sabores.length === 0) {
            return 'Ninguno';
        }
        return (
            <div className="nested-item-list">
                {rowData.sabores.map((sabor, index) => (
                    <div key={index}>
                        {sabor.nombre} (x{sabor.cantidad}) - ${sabor.precio?.toLocaleString('es-CO')}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="compra-form-container">


            {/* Información de la Venta */}
            <div className="section-divider"></div>
            <h2>Información de la Venta</h2>
            <div className="compra-fields-grid">
                <div className="field-group">
                    <label>Cliente:</label>
                    <input type="text" value={nombreCliente || 'N/A'} disabled className="field-disabled" />
                </div>
                <div className="field-group">
                    <label>Sede:</label>
                    <input type="text" value={nombreSede || 'N/A'} disabled className="field-disabled" />
                </div>
                <div className="field-group">
                    <label>Fecha:</label>
                    <input type="text" value={formatearFecha(fechaVenta)} disabled className="field-disabled" />
                </div>
                <div className="field-group">
                    <label>Estado:</label>
                    <span className={`estado-tag ${getSeverityClass(nombreEstado)}`}>
                        {nombreEstado || 'N/A'}
                    </span>
                </div>
                <div className="field-group">
                    <label>Tipo de venta:</label>
                    <input type="text" value={tipoVenta || 'N/A'} disabled className="field-disabled" />
                </div>
                <div className="field-group">
                    <label>Método de Pago:</label>
                    <input type="text" value={metodoPago || 'N/A'} disabled className="field-disabled" />
                </div>
                {fechaEntrega && (
                    <div className="field-group">
                        <label>Fecha de Entrega:</label>
                        <input type="text" value={formatearFecha(fechaEntrega)} disabled className="field-disabled" />
                    </div>
                )}
            </div>

            {/* Productos */}
            <div className="section-divider"></div>
            <div className="detalle-section">
                <h2>Productos</h2>
                {detalleVenta && detalleVenta.length > 0 ? (
                    <table className="compra-detalle-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Adiciones</th>
                                <th>Salsas</th>
                                <th>Sabores</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detalleVenta.map((producto, index) => (
                                <tr key={index}>
                                    <td>{producto.nombreProducto}</td>
                                    <td>{producto.cantidad}</td>
                                    <td>${producto.precioUnitario?.toLocaleString('es-CO')}</td>
                                    <td>{adicionesTemplate(producto)}</td>
                                    <td>{salsasTemplate(producto)}</td>
                                    <td>{saboresTemplate(producto)}</td>
                                    <td>${producto.subtotal?.toLocaleString('es-CO')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No hay productos en esta venta.</p>
                )}
                
                {/* Totales */}
                <div className="compra-totales-grid">
                    <div className="total-item">
                        <span>Subtotal:</span>
                        <span>${subtotal.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="total-item">
                        <span>IVA (16%):</span>
                        <span>${iva.toLocaleString('es-CO')}</span>
                    </div>
                    {descuento > 0 && (
                        <div className="total-item">
                            <span>Descuento:</span>
                            <span>-${descuento.toLocaleString('es-CO')}</span>
                        </div>
                    )}
                    <div className="total-item">
                        <span>Total:</span>
                        <span>${total.toLocaleString('es-CO')}</span>
                    </div>
                </div>
            </div>

            {/* Abonos si existen */}
            {abonos && abonos.length > 0 && (
                <>
                    <div className="section-divider"></div>
                    <div className="detalle-section">
                        <h2>Abonos Realizados</h2>
                        <table className="compra-detalle-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Monto</th>
                                    <th>Método de Pago</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {abonos.map((abono, index) => (
                                    <tr key={index}>
                                        <td>{formatearFecha(abono.fecha)}</td>
                                        <td>${(abono.monto || abono.totalPagado || 0).toLocaleString('es-CO')}</td>
                                        <td>{abono.metodoPago}</td>
                                        <td>
                                            {abono.anulado ? (
                                                <span className="estado-tag estado-anulada">Anulado</span>
                                            ) : (
                                                <span className="estado-tag estado-activa">Activo</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Resumen de abonos */}
                        <div className="compra-totales-grid">
                            <div className="total-item">
                                <span>Total Abonado:</span>
                                <span>
                                    ${abonos
                                        .filter(abono => !abono.anulado)
                                        .reduce((sum, abono) => sum + parseFloat(abono.monto || abono.totalPagado || 0), 0)
                                        .toLocaleString('es-CO')}
                                </span>
                            </div>
                            <div className="total-item">
                                <span>Saldo Pendiente:</span>
                                <span>
                                    ${(total - abonos
                                        .filter(abono => !abono.anulado)
                                        .reduce((sum, abono) => sum + parseFloat(abono.monto || abono.totalPagado || 0), 0))
                                        .toLocaleString('es-CO')}
                                </span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Observaciones si existen */}
            {observaciones && (
                <>
                    <div className="section-divider"></div>
                    <div className="field-group">
                        <label>Observaciones:</label>
                        <textarea value={observaciones} disabled rows="3" className="field-disabled" />
                    </div>
                </>
            )}

            {/* Botón de cierre */}
            <div className="compra-header-actions">
                <button className="modal-btn save-btn" onClick={onBackToList}>
                    Cerrar Detalle
                </button>
            </div>
        </div>
    );
}