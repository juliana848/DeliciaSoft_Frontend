// VentasListar.jsx
import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import AppNotification from '../../components/Notification';
import { Button } from 'primereact/button';
import '../../adminStyles.css';
import { Tag } from 'primereact/tag';

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
    verDetalleVenta,
}) {

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="action-buttons-container">
                <button
                    className="admin-button gray"
                    title="Ver Detalle"
                    onClick={() => verDetalleVenta(rowData)}
                >
                    🔍
                </button>
                <button
                    className="admin-button red"
                    title="Anular"
                    onClick={() => abrirModal('anular', rowData)}
                    disabled={rowData.estadoVenta === false} // Se cambió a `estadoVenta`
                >
                    🛑
                </button>
                <button
                    className="admin-button blue"
                    title="Descargar PDF"
                    onClick={() => generarPDFVenta(rowData)}
                >
                    ⬇️
                </button>
                {rowData.tipoVenta === 'pedido' && rowData.estadoVenta !== false && (
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
            </div>
        );
    };

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
                    <button
                        className={`filter-tab ${filtroTipoVenta === 'anulado' ? 'filter-tab-active' : ''}`}
                        onClick={() => setFiltroTipoVenta('anulado')}
                    >
                        Anuladas
                    </button>
                </div>
            </div>

            <DataTable
                value={ventasFiltradas}
                className="admin-table"
                dataKey="idVenta"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ventas"
                emptyMessage="No se encontraron ventas."
                rowClassName={getRowClassName}
            >
                <Column field="idVenta" header="ID"></Column>
                <Column field="nombreCliente" header="Cliente"></Column>
                <Column field="nombreSede" header="Sede"></Column>
                <Column field="metodoPago" header="Método de Pago"></Column>
                <Column field="tipoVenta" header="Tipo de Venta"></Column>
                <Column
                    field="estadoVenta"
                    header="Estado"
                    body={(rowData) => (
                        <Tag
                            value={rowData.estadoVenta ? 'Activa' : 'Anulada'}
                            severity={rowData.estadoVenta ? 'success' : 'danger'}
                        ></Tag>
                    )}
                ></Column>
                <Column field="total" header="Total"></Column>
                <Column header="Acciones" body={actionBodyTemplate}></Column>
            </DataTable>
        </>
    );
}