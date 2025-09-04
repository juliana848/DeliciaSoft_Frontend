// VentasListar.jsx
import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import AppNotification from '../../components/Notification';
import { Tag } from 'primereact/tag';
import '../../adminStyles.css';

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
    estadosVenta,
    setFiltro,
    setMostrarAgregarVenta
}) {

    const actionBodyTemplate = (rowData) => {
        const estadoAnuladoId = estadosVenta.find(e => e.nombre_estado === 'Anulada')?.idestadoventa;
        const isUpdatable = rowData.idEstadoVenta !== estadoAnuladoId;

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
                    disabled={rowData.idEstadoVenta === estadoAnuladoId}
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
                {rowData.tipoVenta === 'pedido' && rowData.idEstadoVenta !== estadoAnuladoId && (
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
                {isUpdatable && (
                    <Dropdown
                        value={rowData.idEstadoVenta}
                        options={estadosVenta}
                        onChange={(e) => manejarCambioEstado(rowData.idVenta, e.value)}
                        optionLabel="nombre_estado"
                        optionValue="idestadoventa"
                        placeholder="Cambiar Estado"
                        className="status-dropdown"
                    />
                )}
            </div>
        );
    };

    const getSeverity = (nombreEstado) => {
        switch (nombreEstado) {
            case 'Activa':
                return 'success';
            case 'Anulada':
                return 'danger';
            case 'Pendiente':
                return 'warning';
            case 'En Proceso':
                return 'info';
            case 'Completada':
                return 'success';
            default:
                return null;
        }
    };

    return (
        <>
            <AppNotification
                visible={notification.visible}
                mensaje={notification.mensaje}
                tipo={notification.tipo}
                onClose={hideNotification}
            />

            {/* Toolbar con botón + búsqueda */}
            <div className="ventas-toolbar">
                <button
                    className="admin-button green"
                    onClick={() => setMostrarAgregarVenta(true)}
                >
                    + Agregar Venta
                </button>

                <input
                    type="text"
                    placeholder="Buscar por cliente o ID..."
                    className="search-bar"
                    onChange={(e) => setFiltro(e.target.value)}
                />
            </div>

            <div className="ventas-header-container">
                <h2 className="admin-section-title">Gestión de Ventas</h2>
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
                    field="nombreEstado"
                    header="Estado"
                    body={(rowData) => (
                        <Tag
                            value={rowData.nombreEstado}
                            severity={getSeverity(rowData.nombreEstado)}
                        ></Tag>
                    )}
                ></Column>
                <Column field="total" header="Total"></Column>
                <Column header="Acciones" body={actionBodyTemplate}></Column>
            </DataTable>
        </>
    );
}
