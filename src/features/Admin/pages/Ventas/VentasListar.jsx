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
    filtroTipoVenta, // New prop
    setFiltroTipoVenta // New prop
}) {
    return (
        <>
            <AppNotification // Renamed component usage
                visible={notification.visible}
                mensaje={notification.mensaje}
                tipo={notification.tipo}
                onClose={hideNotification}
            />

            <div className="ventas-header-container"> {/* New container for title and buttons */}
                <h2 className="admin-section-title">Ventas</h2>
                <div className="filter-buttons-container"> {/* Container for filter buttons */}
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
                <Column field="total" header="Total" headerStyle={{ paddingLeft: '1.5rem' }} />
                <Column header="Estado" headerStyle={{ paddingLeft: '2.5rem' }} body={(rowData) => (
                    <select
                        value={rowData.estado}
                        onChange={(e) => manejarCambioEstado(rowData, e.target.value)}
                        className="admin-select"
                        disabled={rowData.estado === 'Anulado' || rowData.estado === 'Terminado'}
                    >
                        {rowData.tipo_venta === 'directa' && (
                            <>
                                <option value="Venta directa">Venta directa</option>
                                <option value="Anulado">Anulado</option>
                            </>
                        )}
                        {rowData.tipo_venta === 'pedido' && (
                            <>
                                <option value="Pendiente">Pendiente</option>
                                <option value="En proceso">En proceso</option>
                                <option value="Por entregar">Por entregar</option>
                                <option value="Entregado">Entregado</option>
                                <option value="Por pagar">Por pagar</option>
                                <option value="Terminado">Terminado</option>
                                <option value="Anulado">Anulado</option>
                            </>
                        )}
                    </select>
                )} />
                <Column
                    header="Acciones"
                    body={(rowData) => (
                        <>
                            <button
                                className="admin-button primary"
                                title="Visualizar"
                                onClick={() => abrirModal('visualizar', rowData)}
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
                            {/* Conditionally render the Abonos button */}
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
                />
            </DataTable>
        </>
    );
}