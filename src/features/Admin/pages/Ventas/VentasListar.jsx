// VentasListar.jsx
import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import AppNotification from '../../components/Notification'; // Renamed import

export default function VentasListar({
    ventasFiltradas,

    abrirModal,
    generarPDFVenta,
    setVentaSeleccionada,
    setMostrarModalAbonos,
    manejarCambioEstado,
    notification,
    hideNotification,
    getRowClassName,
    filtroTipoVenta,
    setFiltroTipoVenta,
    verDetalleVenta, // Añade esta prop
}) {
    return (
        <>
            <AppNotification
                visible={notification.visible}
                mensaje={notification.mensaje}
                tipo={notification.tipo}
                onClose={hideNotification}
            />

            <div className="ventas-header-container">
                <h2 className="admin-section-title"> Gestión de Ventas</h2>
                <div className="filter-buttons-container">
                    <button
                        className={`filter-tab ${filtroTipoVenta === 'directa' ? 'filter-tab-active' : ''}`}
                        onClick={() => setFiltroTipoVenta('directa')}
                    >
                        Directas
                    </button>
                    <button
                        className={`filter-tab ${filtroTipoVenta === 'pedido' ? 'filter-tab-active' : ''}`}
                        onClick={() => setFiltroTipoVenta('pedido')}
                    >
                        Pedidos
                    </button>
                    {/* New button for Anulados */}
                    <button
                        className={`filter-tab ${filtroTipoVenta === 'anulado' ? 'filter-tab-active' : ''}`}
                        onClick={() => setFiltroTipoVenta('anulado')}
                    >
                        Anulados
                    </button>
                </div>
            </div>

            <DataTable
                value={ventasFiltradas}
                className="admin-table"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                rowClassName={getRowClassName}
            >
                <Column
                    header="N°"
                    body={(rowData, { rowIndex }) => rowIndex + 1}
                    style={{ width: '3rem', textAlign: 'center' }}
                    headerStyle={{ paddingLeft: '1rem' }}
                />

                <Column field="cliente" header="Cliente" headerStyle={{ paddingLeft: '4rem' }}/>
                <Column field="sede" header="Sede" headerStyle={{ paddingLeft: '2.5rem' }}/>
                <Column field="fecha_venta" header="Fecha" headerStyle={{ paddingLeft: '2.5rem' }}/>
                <Column field="total" header="Total" headerStyle={{ paddingLeft: '1.5rem'}} />
                <Column header="Estado" headerStyle={{ paddingLeft: '2.5rem' }} body={(rowData) => (
                    <select
                        value={rowData.estado}
                        onChange={(e) => manejarCambioEstado(rowData, e.target.value)}
                        className="admin-select"
                        // Disable dropdown if current filter is 'anulado', status is 'Anulado'/'Terminado', OR if it's a 'directa' sale
                        disabled={filtroTipoVenta === 'anulado' || rowData.estado === 'Anulado' || rowData.estado === 'Terminado' || rowData.tipo_venta === 'directa'}
                    >
                        {/* Options for 'Anulado' status - only show "Anulado" if it's the current state */}
                        {rowData.estado === 'Anulado' && (
                            <option value="Anulado">Anulado</option>
                        )}

                        {/* Options for 'directa' sales, if not already Anulado */}
                        {rowData.tipo_venta === 'directa' && rowData.estado !== 'Anulado' && (
                            <>
                                <option value="Venta directa">Venta directa</option>
                            </>
                        )}
                        {/* Options for 'pedido' sales, if not in 'Anulado' tab AND not already Anulado */}
                        {rowData.tipo_venta === 'pedido' && rowData.estado !== 'Anulado' && (
                            <>
                                <option value="Pendiente">Pendiente</option>
                                <option value="En proceso">En proceso</option>
                                <option value="Por entregar">Por entregar</option>
                                <option value="Entregado">Entregado</option>
                                <option value="Por pagar">Por pagar</option>
                                <option value="Terminado">Terminado</option>
                            </>
                        )}
                    </select>
                )} />
                <Column
                    header="Acciones"
                    body={(rowData) => (
                        <>
                            {/* Show "Ver Detalle" button if the sale is anulled OR if the current filter is 'anulado' */}
                            {(filtroTipoVenta === 'anulado' || rowData.estado === 'Anulado') ? (
                                <button
                                    className="admin-button blue"
                                    title="Ver Detalle"
                                    onClick={() => verDetalleVenta(rowData)}
                                >
                                    🔍
                                </button>
                            ) : (
                                <>
                                    {/* Existing buttons for non-anulled sales */}
                                    <button
                                        className="admin-button blue"
                                        title="Ver Detalle"
                                        onClick={() => verDetalleVenta(rowData)}
                                    >
                                        🔍
                                    </button>
                                    <button
                                        className="admin-button red"
                                        title="Anular"
                                        onClick={() => abrirModal('anular', rowData)}
                                        disabled={rowData.estado === 'Anulado'}
                                    >🛑</button>
                                    <button
                                        className="admin-button blue"
                                        title="Descargar PDF"
                                        onClick={() => generarPDFVenta(rowData)}
                                    >
                                        ⬇️
                                    </button>
                                    {rowData.estado !== 'Venta directa' && rowData.estado !== 'Anulado' && (
                                        <button
                                            className="admin-button green"
                                            title="Abonos"
                                            onClick={() => {
                                                setVentaSeleccionada(rowData);
                                                setMostrarModalAbonos(true);
                                            }}
                                        >
                                            💰
                                        </button>
                                    )}
                                </>
                            )}
                        </>
                    )}
                />
            </DataTable>
        </>
    );
}