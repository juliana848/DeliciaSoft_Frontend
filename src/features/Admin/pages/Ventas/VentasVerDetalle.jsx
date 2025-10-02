// VentasVerDetalle.jsx - Con estructura igual a CompraForm (modo vista)
import React from 'react';
import '../../adminStyles.css';
import './VentasCrear.css';

export default function VentasVerDetalle({
    ventaSeleccionada,
    onBackToList,
    productosDisponibles = [] 
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
    const getProductName = (idProducto) => {
        const producto = productosDisponibles.find(p => p.idproductogeneral === idProducto);
        // Si no lo encuentra, muestra el ID, no "Producto N/A"
        return producto?.nombre || `ID: ${idProducto}`; 
    };
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
            return <span style={{color: '#6b7280', fontSize: '13px'}}>Ninguna</span>;
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
            return <span style={{color: '#6b7280', fontSize: '13px'}}>Ninguna</span>;
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
            return <span style={{color: '#6b7280', fontSize: '13px'}}>Ninguno</span>;
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

    // Determinar si está anulada
    const estaAnulada = nombreEstado === 'Anulada';

    // Función para obtener título
    const obtenerTitulo = () => {
        const estado = estaAnulada ? 'Anulada' : 'Activa';
        return `Venta ${estado} - #${idVenta || ''}`;
    };

    return (
        <div className="compra-form-container">
            {/* Header con estado de la venta */}
            <div className={`compra-status-header ${estaAnulada ? 'anulada' : 'activa'}`}>
                <h1 className="compra-title">{obtenerTitulo()}</h1>
                <div className="status-indicator">
                    <span className={`status-badge ${estaAnulada ? 'anulada' : 'activa'}`}>
                        {estaAnulada ? '❌ ANULADA' : '✅ ACTIVA'}
                    </span>
                </div>
            </div>

            {/* Información de la Venta */}
            <div className="form-card">
                <h2 className="section-title">
                    <span className="title-icon">🏢</span>
                    Información de la Venta
                </h2>
                
                <div className="form-grid">
                    <div className="field-group">
                        <label className="field-label">Cliente</label>
                        <input 
                            type="text" 
                            value={nombreCliente || 'N/A'} 
                            disabled 
                            className="form-input" 
                        />
                    </div>
                    
                    <div className="field-group">
                        <label className="field-label">Sede</label>
                        <input 
                            type="text" 
                            value={nombreSede || 'N/A'} 
                            disabled 
                            className="form-input" 
                        />
                    </div>
                    
                    <div className="field-group">
                        <label className="field-label">Fecha de Venta</label>
                        <input 
                            type="text" 
                            value={formatearFecha(fechaVenta)} 
                            disabled 
                            className="form-input" 
                        />
                    </div>
                    
                    <div className="field-group">
                        <label className="field-label">Estado</label>
                        <div style={{paddingTop: '4px'}}>
                            <span className={`estado-tag ${getSeverityClass(nombreEstado)}`}>
                                {nombreEstado || 'N/A'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="field-group">
                        <label className="field-label">Tipo de venta</label>
                        <input 
                            type="text" 
                            value={tipoVenta || 'N/A'} 
                            disabled 
                            className="form-input" 
                        />
                    </div>
                    
                    <div className="field-group">
                        <label className="field-label">Método de Pago</label>
                        <input 
                            type="text" 
                            value={metodoPago || 'N/A'} 
                            disabled 
                            className="form-input" 
                        />
                    </div>
                    
                    {fechaEntrega && (
                        <div className="field-group">
                            <label className="field-label">Fecha de Entrega</label>
                            <input 
                                type="text" 
                                value={formatearFecha(fechaEntrega)} 
                                disabled 
                                className="form-input" 
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Detalle de Productos */}
            <div className="form-card">
                <h2 className="section-title">
                    <span className="title-icon">📦</span>
                    Detalle de Productos
                </h2>
                
                <div className="table-container">
                    <table className="products-table">
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
                            {detalleVenta && detalleVenta.length > 0 ? (
                                detalleVenta.map((producto, index) => (
                                    <tr key={index} className="product-row">
                                        <td className="product-name">{getProductName(producto.idproductogeneral)}</td>
                                        <td className="quantity-cell">
                                            <span className="quantity-display">{producto.cantidad}</span>
                                        </td>
                                        <td className="price-cell">{formatearMoneda(producto.precioUnitario)}</td>
                                        <td>{adicionesTemplate(producto)}</td>
                                        <td>{salsasTemplate(producto)}</td>
                                        <td>{saboresTemplate(producto)}</td>
                                        <td className="subtotal-cell">{formatearMoneda(producto.subtotal)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{textAlign: 'center', padding: '20px', color: '#6b7280'}}>
                                        No hay productos en esta venta
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tarjetas de totales */}
            <div className="totals-section">
                <div className="totals-grid">
                    <div className="total-card subtotal-card">
                        <div className="card-icon" style={{color: '#ec4899'}}>💰</div>
                        <div className="card-content">
                            <div className="card-label">Subtotal</div>
                            <div className="card-value">{formatearMoneda(subtotal)}</div>
                        </div>
                    </div>
                    
                    {iva > 0 && (
                        <div className="total-card subtotal-card">
                            <div className="card-icon" style={{color: '#ec4899'}}>📊</div>
                            <div className="card-content">
                                <div className="card-label">IVA (16%)</div>
                                <div className="card-value">{formatearMoneda(iva)}</div>
                            </div>
                        </div>
                    )}
                    
                    {descuento > 0 && (
                        <div className="total-card subtotal-card">
                            <div className="card-icon" style={{color: '#ec4899'}}>🎟️</div>
                            <div className="card-content">
                                <div className="card-label">Descuento</div>
                                <div className="card-value">-{formatearMoneda(descuento)}</div>
                            </div>
                        </div>
                    )}
                    
                    <div className="total-card total-card-main">
                        <div className="card-icon" style={{color: '#ec4899'}}>💎</div>
                        <div className="card-content">
                            <div className="card-label">Total</div>
                            <div className="card-value total-value">{formatearMoneda(total)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Abonos si existen */}
            {abonos && abonos.length > 0 && (
                <div className="form-card">
                    <h2 className="section-title">
                        <span className="title-icon">💳</span>
                        Abonos Realizados
                    </h2>
                    
                    <div className="table-container">
                        <table className="products-table">
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
                                    <tr key={index} className="product-row">
                                        <td>{formatearFecha(abono.fecha)}</td>
                                        <td className="price-cell">
                                            {formatearMoneda(abono.monto || abono.totalPagado || 0)}
                                        </td>
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
                    </div>
                    
                    {/* Resumen de abonos */}
                    <div className="totals-section" style={{marginTop: '20px', marginBottom: '0'}}>
                        <div className="totals-grid">
                            <div className="total-card subtotal-card">
                                <div className="card-icon" style={{color: '#ec4899'}}>✅</div>
                                <div className="card-content">
                                    <div className="card-label">Total Abonado</div>
                                    <div className="card-value">
                                        {formatearMoneda(
                                            abonos
                                                .filter(abono => !abono.anulado)
                                                .reduce((sum, abono) => sum + parseFloat(abono.monto || abono.totalPagado || 0), 0)
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="total-card total-card-main">
                                <div className="card-icon" style={{color: '#ec4899'}}>⏳</div>
                                <div className="card-content">
                                    <div className="card-label">Saldo Pendiente</div>
                                    <div className="card-value total-value">
                                        {formatearMoneda(
                                            total - abonos
                                                .filter(abono => !abono.anulado)
                                                .reduce((sum, abono) => sum + parseFloat(abono.monto || abono.totalPagado || 0), 0)
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Observaciones si existen */}
            {observaciones && (
                <div className="form-card">
                    <h2 className="section-title">
                        <span className="title-icon">📝</span>
                        Observaciones
                    </h2>
                    <div className="field-group">
                        <textarea 
                            value={observaciones} 
                            disabled 
                            rows="4" 
                            className="form-input" 
                            style={{resize: 'vertical', minHeight: '100px'}}
                        />
                    </div>
                </div>
            )}

            {/* Botón de cierre */}
            <div className="action-buttons">
                <button className="btn btn-cancel" onClick={onBackToList}>
                    Cerrar
                </button>
            </div>
        </div>
    );
}