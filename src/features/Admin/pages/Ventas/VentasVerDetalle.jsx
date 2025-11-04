// VentasVerDetalle.jsx - Con orden de campos igual a VentasCrear
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
    } = ventaSeleccionada;

    const getProductName = (idProducto) => {
        const producto = productosDisponibles.find(p => p.idproductogeneral === idProducto);
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

    // --- TEMPLATES DE INSUMOS PERSONALIZADOS ---

    const adicionesTemplate = (rowData) => {
        if (!rowData.adiciones || rowData.adiciones.length === 0) {
            return <span style={{color: '#6b7280', fontSize: '13px'}}>Ninguna</span>;
        }
        return (
            <div className="nested-item-list">
                {rowData.adiciones.map((adic, index) => (
                    <div key={index}>
                        {adic.nombre} (x{adic.cantidad}) - {formatearMoneda(adic.precio)}
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
                        {salsa.nombre} (x{salsa.cantidad}) - {formatearMoneda(salsa.precio)}
                    </div>
                ))}
            </div>
        );
    };
    
    // Nuevo template para Toppings
    const toppingsTemplate = (rowData) => {
        if (!rowData.toppings || rowData.toppings.length === 0) {
            return <span style={{color: '#6b7280', fontSize: '13px'}}>Ninguno</span>;
        }
        return (
            <div className="nested-item-list">
                {rowData.toppings.map((topping, index) => (
                    <div key={index}>
                        {topping.nombre} (x{topping.cantidad}) - {formatearMoneda(topping.precio)}
                    </div>
                ))}
            </div>
        );
    };

    // Template para Rellenos/Sabores (usa el campo 'sabores')
    const rellenosSaboresTemplate = (rowData) => {
        if (!rowData.sabores || rowData.sabores.length === 0) {
            return <span style={{color: '#6b7280', fontSize: '13px'}}>Ninguno</span>;
        }
        return (
            <div className="nested-item-list">
                {rowData.sabores.map((sabor, index) => (
                    <div key={index}>
                        {sabor.nombre} (x{sabor.cantidad}) - {formatearMoneda(sabor.precio)}
                    </div>
                ))}
            </div>
        );
    };

    // --- FIN TEMPLATES ---

    const obtenerTitulo = () => {
        return `Detalle de Venta #${idVenta || ''}`; // Título simplificado
    };
    
    // Condición para ocultar el campo de Estado si es 'Activa' o 'Anulada'
    const mostrarCampoEstado = nombreEstado !== 'Activa' && nombreEstado !== 'Anulada';

    return (
        <div className="compra-form-container">
            {/* Título principal */}
            <div style={{marginBottom: '20px'}}>
                <h1 className="compra-title">{obtenerTitulo()}</h1>
            </div>

            {/* Información de la Venta */}
            <div className="form-card">
                <h2 className="section-title">
                    <span className="title-icon">🏢</span>
                    Información de la Venta
                </h2>
                
                <div className="form-grid">
                    {/* FILA 1: Tipo de Venta y Fecha de Venta */}
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
                        <label className="field-label">Fecha de Venta</label>
                        <input 
                            type="text" 
                            value={formatearFecha(fechaVenta)} 
                            disabled 
                            className="form-input" 
                        />
                    </div>
                    
                    {/* FILA 2: Fecha de Entrega (solo si es pedido) y Sede */}
                    {fechaEntrega && tipoVenta === 'pedido' && (
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
                    
                    <div className="field-group">
                        <label className="field-label">Sede</label>
                        <input 
                            type="text" 
                            value={nombreSede || 'N/A'} 
                            disabled 
                            className="form-input" 
                        />
                    </div>
                    
                    {/* FILA 3: Cliente y Método de Pago */}
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
                        <label className="field-label">Método de Pago</label>
                        <input 
                            type="text" 
                            value={metodoPago || 'N/A'} 
                            disabled 
                            className="form-input" 
                        />
                    </div>
                    
                    {/* Estado solo se muestra si no es 'Activa' ni 'Anulada' */}
                    {mostrarCampoEstado && (
                        <div className="field-group">
                            <label className="field-label">Estado</label>
                            <div style={{paddingTop: '4px'}}>
                                <span className={`estado-tag ${getSeverityClass(nombreEstado)}`}>
                                    {nombreEstado || 'N/A'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Detalle de Productos - SE MODIFICÓ ESTA TABLA */}
{/* Detalle de Productos - CON BOTONES DE CATÁLOGOS Y ACORDEÓN */}
            <div className="form-card">
                <h2 className="section-title">
                    <span className="title-icon">📦</span>
                    Detalle de Productos
                </h2>
                
                <div className="table-container">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th style={{ width: '250px' }}>Catálogos</th>
                                <th>Subtotal Item</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detalleVenta && detalleVenta.length > 0 ? (
                                detalleVenta.map((producto, index) => {
                                    const [detalleVisible, setDetalleVisible] = React.useState(false);
                                    const tieneCatalogos = (producto.toppings && producto.toppings.length > 0) ||
                                                          (producto.salsas && producto.salsas.length > 0) ||
                                                          (producto.sabores && producto.sabores.length > 0) ||
                                                          (producto.adiciones && producto.adiciones.length > 0);
                                    
                                    return (
                                        <React.Fragment key={index}>
                                            <tr className="product-row">
                                                <td className="product-name">{getProductName(producto.idproductogeneral)}</td>
                                                <td className="quantity-cell">
                                                    <span className="quantity-display">{producto.cantidad}</span>
                                                </td>
                                                <td className="price-cell">{formatearMoneda(producto.precioUnitario)}</td>
                                                
                                                <td className="catalog-buttons-cell">
                                                    {!tieneCatalogos ? (
                                                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>Sin catálogos</span>
                                                    ) : (
                                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                            {producto.toppings && producto.toppings.length > 0 && (
                                                                <span style={{
                                                                    fontSize: '12px',
                                                                    padding: '5px 10px',
                                                                    background: '#ec4899',
                                                                    color: 'white',
                                                                    fontWeight: 'bold',
                                                                    borderRadius: '4px'
                                                                }}>
                                                                    ✓ Toppings ({producto.toppings.length})
                                                                </span>
                                                            )}
                                                            {producto.salsas && producto.salsas.length > 0 && (
                                                                <span style={{
                                                                    fontSize: '12px',
                                                                    padding: '5px 10px',
                                                                    background: '#ec4899',
                                                                    color: 'white',
                                                                    fontWeight: 'bold',
                                                                    borderRadius: '4px'
                                                                }}>
                                                                    ✓ Salsas ({producto.salsas.length})
                                                                </span>
                                                            )}
                                                            {producto.sabores && producto.sabores.length > 0 && (
                                                                <span style={{
                                                                    fontSize: '12px',
                                                                    padding: '5px 10px',
                                                                    background: '#ec4899',
                                                                    color: 'white',
                                                                    fontWeight: 'bold',
                                                                    borderRadius: '4px'
                                                                }}>
                                                                    ✓ Rellenos ({producto.sabores.length})
                                                                </span>
                                                            )}
                                                            {producto.adiciones && producto.adiciones.length > 0 && (
                                                                <span style={{
                                                                    fontSize: '12px',
                                                                    padding: '5px 10px',
                                                                    background: '#ec4899',
                                                                    color: 'white',
                                                                    fontWeight: 'bold',
                                                                    borderRadius: '4px'
                                                                }}>
                                                                    ✓ Adiciones ({producto.adiciones.length})
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                
                                                <td className="subtotal-cell">
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                                                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                                            {formatearMoneda(
                                                                producto.subtotal + 
                                                                (producto.adiciones?.reduce((acc, ad) => acc + (ad.precio * (ad.cantidad || 1)), 0) || 0)
                                                            )}
                                                        </div>
                                                        
                                                        {tieneCatalogos && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setDetalleVisible(!detalleVisible)}
                                                                style={{
                                                                    background: '#ec4899',
                                                                    borderTop: '2px solid #ec4899',
                                                                    borderRadius: '4px',
                                                                    padding: '4px 8px',
                                                                    fontSize: '11px',
                                                                    cursor: 'pointer',
                                                                    color: '#ffffff',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    border: 'none'
                                                                }}
                                                            >
                                                                {detalleVisible ? '▲' : '▼'} Ver detalles
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            
                                            {detalleVisible && (
                                                <tr>
                                                    <td colSpan="5" style={{background: '#fef3f2', padding: '16px', borderLeft: '4px solid #ec4899'}}>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                                            
                                                            {/* Toppings */}
                                                            {producto.toppings && producto.toppings.length > 0 && (
                                                                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                                                    <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', fontSize: '14px' }}>
                                                                        🫐 Toppings ({producto.toppings.length})
                                                                    </div>
                                                                    {producto.toppings.map(t => (
                                                                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                                                                            <span style={{ color: '#6b7280', fontSize: '13px' }}>{t.nombre}</span>
                                                                            <span style={{ color: '#10b981', fontWeight: '600', fontSize: '12px' }}>Gratis</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            
                                                            {/* Salsas */}
                                                            {producto.salsas && producto.salsas.length > 0 && (
                                                                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                                                    <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', fontSize: '14px' }}>
                                                                        🍯 Salsas ({producto.salsas.length})
                                                                    </div>
                                                                    {producto.salsas.map(sa => (
                                                                        <div key={sa.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                                                                            <span style={{ color: '#6b7280', fontSize: '13px' }}>{sa.nombre}</span>
                                                                            <span style={{ color: '#10b981', fontWeight: '600', fontSize: '12px' }}>Gratis</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            
                                                            {/* Rellenos */}
                                                            {producto.sabores && producto.sabores.length > 0 && (
                                                                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                                                    <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', fontSize: '14px' }}>
                                                                        🥧 Rellenos ({producto.sabores.length})
                                                                    </div>
                                                                    {producto.sabores.map(re => (
                                                                        <div key={re.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                                                                            <span style={{ color: '#6b7280', fontSize: '13px' }}>{re.nombre}</span>
                                                                            <span style={{ color: '#10b981', fontWeight: '600', fontSize: '12px' }}>Gratis</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            
                                                            {/* Adiciones */}
                                                            {producto.adiciones && producto.adiciones.length > 0 && (
                                                                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                                                    <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', fontSize: '14px' }}>
                                                                        ✨ Adiciones ({producto.adiciones.length})
                                                                    </div>
                                                                    {producto.adiciones.map(ad => (
                                                                        <div key={ad.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                                                                            <span style={{ color: '#6b7280', fontSize: '13px' }}>{ad.nombre}</span>
                                                                            <span style={{ fontWeight: '600', color: '#ec4899', fontSize: '12px' }}>
                                                                                +{formatearMoneda(ad.precio)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '2px solid #ec4899', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                                                        <span style={{ color: '#1f2937' }}>Subtotal Adiciones:</span>
                                                                        <span style={{ color: '#ec4899' }}>
                                                                            {formatearMoneda(producto.adiciones.reduce((acc, ad) => acc + (ad.precio * (ad.cantidad || 1)), 0))}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{textAlign: 'center', padding: '20px', color: '#6b7280'}}>
                                        No hay productos en esta venta
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Observaciones si existen */}
            {observaciones && tipoVenta === 'pedido' && (
                <div className="form-card">
                    <h2 className="section-title">
                        <span className="title-icon">📝</span>
                        Observaciones
                    </h2>
                    <div className="field-group">
                        <textarea 
                            value={observaciones} 
                            disabled 
                            rows="3" 
                            className="form-input" 
                            style={{resize: 'vertical', minHeight: '80px'}}
                        />
                    </div>
                </div>
            )}

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

            {/* Botón de cierre */}
            <div className="action-buttons">
                <button className="btn btn-cancel" onClick={onBackToList}>
                    Cerrar
                </button>
            </div>
        </div>
    );
}