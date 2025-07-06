// VentasDetalle.jsx
import React, { useState } from 'react';
import ProductOptionsMiniModal from './ProductOptionsMiniModal'; // Asegúrate de que esta ruta sea correcta

export default function VentasDetalle({ ventaSeleccionada, onClose }) {
    const [isMiniModalVisible, setIsMiniModalVisible] = useState(false);
    const [selectedProductForMiniModal, setSelectedProductForMiniModal] = useState(null);

    if (!ventaSeleccionada) return null;

    const handleShowProductOptions = (product) => {
        setSelectedProductForMiniModal(product);
        setIsMiniModalVisible(true);
    };

    const handleCloseMiniModal = () => {
        setIsMiniModalVisible(false);
        setSelectedProductForMiniModal(null);
    };

    return (
        <div className="compra-form-container"> {/* Contenedor principal con estilo de VentasCrear */}
            <h1>Detalle de la Venta #{ventaSeleccionada.id}</h1>

            <div className="compra-fields-grid"> {/* Contenedor de la cuadrícula de campos */}
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
                    <label>Estado:</label>
                    <p>{ventaSeleccionada.estado}</p>
                </div>
                <div className="field-group">
                    <label>Fecha de Venta:</label>
                    <p>{ventaSeleccionada.fecha_venta}</p>
                </div>
                {ventaSeleccionada.tipo_venta === 'pedido' && (
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
                <div className="field-group full-width"> {/* Usa full-width si necesitas que ocupe todo el ancho */}
                    <label>Observaciones:</label>
                    <p>{ventaSeleccionada.observaciones || 'N/A'}</p>
                </div>
            </div>

            <div className="section-divider"></div> {/* Divisor de sección */}

            <div className="detalle-section"> {/* Sección para los productos */}
                <h2>Productos Incluidos:</h2>
                {ventaSeleccionada.productos && ventaSeleccionada.productos.length > 0 ? (
                    <table className="compra-detalle-table"> {/* Tabla con estilo de VentasCrear */}
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Adiciones</th>
                                <th>Salsas</th>
                                <th>Rellenos/Sabores</th>
                                <th>Subtotal Ítem</th>
                                <th>Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ventaSeleccionada.productos.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.nombre}</td>
                                    <td>{item.cantidad}</td>
                                    <td>${item.precio.toLocaleString()}</td>
                                    <td>
                                        {item.adiciones && item.adiciones.length > 0
                                            ? item.adiciones.map((add) => add.nombre).join(', ')
                                            : 'N/A'}
                                    </td>
                                    <td>
                                        {item.salsas && item.salsas.length > 0
                                            ? item.salsas.map((salsa) => salsa.nombre).join(', ')
                                            : 'N/A'}
                                    </td>
                                    <td>
                                        {item.sabores && item.sabores.length > 0
                                            ? item.sabores.map((sabor) => sabor.nombre).join(', ')
                                            : 'N/A'}
                                    </td>
                                    <td>
                                        ${(
                                            item.cantidad * item.precio +
                                            (item.adiciones ? item.adiciones.reduce((sum, add) => sum + add.precio, 0) : 0)
                                        ).toLocaleString()}
                                    </td>
                                    <td>
                                        <button
                                            className="admin-button blue" // Puedes usar una clase de botón existente
                                            onClick={() => handleShowProductOptions(item)}
                                        >
                                            Ver Opciones
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No hay productos en esta venta.</p>
                )}
            </div>

            <div className="resumen-venta" style={{ marginTop: '20px', textAlign: 'right' }}>
                <p><strong>Subtotal:</strong> ${ventaSeleccionada.subtotal.toLocaleString()}</p>
                <p><strong>IVA:</strong> ${ventaSeleccionada.iva.toLocaleString()}</p>
                <p><strong>Total:</strong> ${ventaSeleccionada.total.toLocaleString()}</p>
            </div>

            <div className="form-buttons" style={{ marginTop: '20px' }}> {/* Usa una clase similar a la de los botones de form */}
                <button className="admin-button" onClick={onClose}>Cerrar</button>
            </div>

            <ProductOptionsMiniModal
                visible={isMiniModalVisible}
                onClose={handleCloseMiniModal}
                product={selectedProductForMiniModal}
            />
        </div>
    );
}