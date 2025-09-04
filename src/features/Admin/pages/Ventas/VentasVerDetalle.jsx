import React, { useState } from 'react';
import '../../adminStyles.css';

export default function VentasVerDetalle({ ventaSeleccionada, onBackToList }) {
    const [nestedDetailsVisible, setNestedDetailsVisible] = useState({});

    const toggleNestedDetails = (detalleId) => {
        setNestedDetailsVisible(prev => ({
            ...prev,
            [detalleId]: !prev[detalleId]
        }));
    };

    if (!ventaSeleccionada) {
        return (
            <div className="compra-form-container">
                <p>No se ha seleccionado ninguna venta para ver el detalle.</p>
                <button className="modal-btn cancel-btn" onClick={onBackToList}>
                    Volver al Listado de Ventas
                </button>
            </div>
        );
    }

    const renderProductDetails = (products) => (
        <table className="compra-detalle-table">
            <thead>
                <tr>
                    <th>ID Producto</th>
                    <th>Nombre Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal Item</th>
                    <th>IVA</th>
                    <th>Opciones</th>
                </tr>
            </thead>
            <tbody>
                {products.map((item) => (
                    <React.Fragment key={item.iddetalleventa}>
                        <tr>
                            <td>{item.idproductogeneral}</td>
                            <td>{item.nombreProducto}</td>
                            <td>{item.cantidad}</td>
                            <td>${item.precioUnitario?.toLocaleString('es-CO')}</td>
                            <td>${item.subtotal?.toLocaleString('es-CO')}</td>
                            <td>${item.iva?.toLocaleString('es-CO')}</td>
                            <td>
                                {(item.adiciones?.length > 0 || item.salsas?.length > 0 || item.sabores?.length > 0) ? (
                                    <button
                                        type="button"
                                        className="admin-button gray"
                                        onClick={() => toggleNestedDetails(item.iddetalleventa)}
                                    >
                                        {nestedDetailsVisible[item.iddetalleventa] ? 'Ocultar' : 'Ver Opciones'}
                                    </button>
                                ) : (
                                    'N/A'
                                )}
                            </td>
                        </tr>
                        {nestedDetailsVisible[item.iddetalleventa] && (
                            <tr className="nested-details-row">
                                <td colSpan="7">
                                    <div className="nested-item-list">
                                        {item.adiciones?.length > 0 && (
                                            <div className="nested-item">
                                                <strong>Adiciones:</strong>
                                                <ul>
                                                    {item.adiciones.map((ad, i) => (
                                                        <li key={i}>{ad.nombre} (${ad.precio?.toLocaleString('es-CO')})</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {item.salsas?.length > 0 && (
                                            <div className="nested-item">
                                                <strong>Salsas:</strong>
                                                <ul>
                                                    {item.salsas.map((sa, i) => (
                                                        <li key={i}>{sa.nombre} (${sa.precio?.toLocaleString('es-CO')})</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {item.sabores?.length > 0 && (
                                            <div className="nested-item">
                                                <strong>Rellenos/Sabores:</strong>
                                                <ul>
                                                    {item.sabores.map((re, i) => (
                                                        <li key={i}>{re.nombre} (${re.precio?.toLocaleString('es-CO')})</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="compra-form-container">
            <h2 className="admin-section-title">Detalle de Venta #{ventaSeleccionada.idVenta}</h2>
            
            {/* INFO GENERAL */}
            <div className="detalle-section">
                <h2>Información General</h2>
                <div className="detalle-grid">
                    <p><strong>Cliente:</strong> {ventaSeleccionada.nombreCliente}</p>
                    <p><strong>Sede:</strong> {ventaSeleccionada.nombreSede}</p>
                    <p><strong>Método de Pago:</strong> {ventaSeleccionada.metodoPago}</p>
                    <p><strong>Estado:</strong> {ventaSeleccionada.nombreEstado}</p>
                    <p><strong>Tipo de Venta:</strong> {ventaSeleccionada.tipoVenta}</p>
                    <p><strong>Fecha de Venta:</strong> {ventaSeleccionada.fechaVenta}</p>
                </div>
            </div>

            {/* PRODUCTOS */}
            <div className="detalle-section">
                <h2>Productos Vendidos</h2>
                {ventaSeleccionada.detalleVenta?.length > 0
                    ? renderProductDetails(ventaSeleccionada.detalleVenta)
                    : <p>No hay productos registrados para esta venta.</p>}
            </div>

            {/* ABONOS */}
            <div className="detalle-section">
                <h2>Abonos Realizados</h2>
                {ventaSeleccionada.abonos?.length > 0 ? (
                    <table className="abonos-table">
                        <thead>
                            <tr>
                                <th>Monto</th>
                                <th>Método de Pago</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ventaSeleccionada.abonos.map((abono, index) => (
                                <tr key={index}>
                                    <td>${abono.cantidadPagar?.toLocaleString('es-CO')}</td>
                                    <td>{abono.metodoPago}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No hay abonos registrados para esta venta.</p>
                )}
            </div>

            {/* TOTALES */}
            <div className="compra-totales-grid">
                <div className="total-item">
                    <span>Subtotal:</span>
                    <span>${ventaSeleccionada.subtotal?.toLocaleString('es-CO')}</span>
                </div>
                <div className="total-item">
                    <span>IVA:</span>
                    <span>${ventaSeleccionada.iva?.toLocaleString('es-CO')}</span>
                </div>
                <div className="total-item">
                    <span>Total:</span>
                    <span>${ventaSeleccionada.total?.toLocaleString('es-CO')}</span>
                </div>
            </div>

            {/* BOTÓN VOLVER */}
            <div className="compra-header-actions" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                    type="button"
                    className="modal-btn cancel-btn"
                    onClick={onBackToList}
                >
                    Volver
                </button>
            </div>
        </div>
    );
}
