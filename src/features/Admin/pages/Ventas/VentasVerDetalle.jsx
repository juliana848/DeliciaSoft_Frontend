// VentasVerDetalle.jsx
import React, { useState } from 'react'; // Import useState
import '../../adminStyles.css'; // Ensure this CSS file exists

export default function VentasVerDetalle({ ventaSeleccionada, onBackToList }) {
    // State to manage the visibility of nested details for each product
    const [nestedDetailsVisible, setNestedDetailsVisible] = useState({});

    // Function to toggle the visibility of nested details for a specific product
    const toggleNestedDetails = (productId) => {
        setNestedDetailsVisible(prevState => ({
            ...prevState,
            [productId]: !prevState[productId]
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

    // Helper function to render product details (now incorporating the toggle)
    const renderProductDetails = (products) => {
        return (
            <table className="compra-detalle-table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Subtotal Item</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => (
                        <React.Fragment key={product.id || index}> {/* Use product.id if available, otherwise index */}
                            {/* Main Product Row */}
                            <tr>
                                <td>
                                    {product.nombre}
                                    {/* Button to toggle nested details visibility */}
                                    {(product.adiciones && product.adiciones.length > 0) ||
                                     (product.salsas && product.salsas.length > 0) ||
                                     (product.sabores && product.sabores.length > 0) ? (
                                        <button
                                            type="button"
                                            className="btn-small toggle-details-btn"
                                            onClick={() => toggleNestedDetails(product.id || `product-${index}`)} // Use a unique ID for the product
                                            title={nestedDetailsVisible[product.id || `product-${index}`] ? 'Ocultar detalles' : 'Mostrar detalles'}
                                            style={{ marginLeft: '10px', padding: '2px 6px', fontSize: '10px' }}
                                        >
                                            {nestedDetailsVisible[product.id || `product-${index}`] ? '▲' : '▼'}
                                        </button>
                                    ) : null}
                                </td>
                                <td>{product.cantidad}</td>
                                <td>${product.precio?.toLocaleString('es-CO')}</td>
                                <td>
                                    ${((product.precio * product.cantidad) +
                                        (product.adiciones || []).reduce((acc, ad) => acc + (ad.precio || 0), 0) +
                                        (product.salsas || []).reduce((acc, sa) => acc + (sa.precio || 0), 0) +
                                        (product.sabores || []).reduce((acc, re) => acc + (re.precio || 0), 0)
                                    ).toLocaleString('es-CO')}
                                </td>
                            </tr>

                            {/* Nested Details Row (conditionally rendered) */}
                            {nestedDetailsVisible[product.id || `product-${index}`] && (
                                <tr>
                                    <td colSpan="2"></td> {/* Empty cells for alignment */}
                                    <td colSpan="2">
                                        {/* Display Adiciones */}
                                        {product.adiciones && product.adiciones.length > 0 && (
                                            <div className="nested-item-list">
                                                <strong>Adiciones:</strong>
                                                {product.adiciones.map((adic, idx) => (
                                                    <div key={idx}>{adic.nombre} (${adic.precio?.toLocaleString('es-CO')})</div>
                                                ))}
                                            </div>
                                        )}
                                        {/* Display Salsas */}
                                        {product.salsas && product.salsas.length > 0 && (
                                            <div className="nested-item-list">
                                                <strong>Salsas:</strong>
                                                {product.salsas.map((salsa, idx) => (
                                                    <div key={idx}>{salsa.nombre} (${salsa.precio?.toLocaleString('es-CO')})</div>
                                                ))}
                                            </div>
                                        )}
                                        {/* Display Rellenos/Sabores */}
                                        {product.sabores && product.sabores.length > 0 && (
                                            <div className="nested-item-list">
                                                <strong>Rellenos/Sabores:</strong>
                                                {product.sabores.map((sabor, idx) => (
                                                    <div key={idx}>{sabor.nombre} (${sabor.precio?.toLocaleString('es-CO')})</div>
                                                ))}
                                            </div>
                                        )}
                                        {(product.adiciones && product.adiciones.length === 0) &&
                                         (product.salsas && product.salsas.length === 0) &&
                                         (product.sabores && product.sabores.length === 0) && (
                                            <p>No hay adiciones, salsas o rellenos añadidos.</p>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="compra-form-container">
            <h1>Detalle de Venta</h1>

            {/* Main details section */}
            <div className="compra-fields-grid">
                <div className="field-group">
                    <label>Código de Venta:</label>
                    <p>{ventaSeleccionada.cod_venta || ventaSeleccionada.id}</p>
                </div>

                <div className="field-group">
                    <label>Tipo de Venta:</label>
                    <p>{ventaSeleccionada.tipo_venta}</p>
                </div>

                <div className="field-group">
                    <label>Cliente:</label>
                    <p>{ventaSeleccionada.cliente}</p>
                </div>

                <div className="field-group">
                    <label>Sede:</label>
                    <p>{ventaSeleccionada.sede}</p>
                </div>

                <div className="field-group">
                    <label>Método de Pago:</label>
                    <p>{ventaSeleccionada.metodo_pago}</p>
                </div>

                <div className="field-group">
                    <label>Fecha de Venta:</label>
                    <p>{ventaSeleccionada.fecha_venta}</p>
                </div>

                {ventaSeleccionada.fecha_entrega && (
                    <div className="field-group">
                        <label>Fecha de Entrega:</label>
                        <p>{ventaSeleccionada.fecha_entrega}</p>
                    </div>
                )}

                {ventaSeleccionada.fecha_finalizacion && (
                    <div className="field-group">
                        <label>Fecha de Finalización:</label>
                        <p>{ventaSeleccionada.fecha_finalizacion}</p>
                    </div>
                )}

                <div className="field-group">
                    <label>Estado:</label>
                    <p>{ventaSeleccionada.estado}</p>
                </div>

                <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Observaciones:</label>
                    <p>{ventaSeleccionada.observaciones || 'N/A'}</p>
                </div>
            </div>

            <div className="section-divider"></div>

            <div className="detalle-section">
                <h2>Productos Vendidos</h2>
                {ventaSeleccionada.productos && ventaSeleccionada.productos.length > 0 ? (
                    renderProductDetails(ventaSeleccionada.productos)
                ) : (
                    <p>No hay productos registrados para esta venta.</p>
                )}
            </div>

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

            {/* Back button at the bottom right */}
            <div className="compra-header-actions" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                    type="button"
                    className="modal-btn cancel-btn"
                    onClick={onBackToList}
                >
                    vancelar
                </button>
            </div>
        </div>
    );
}