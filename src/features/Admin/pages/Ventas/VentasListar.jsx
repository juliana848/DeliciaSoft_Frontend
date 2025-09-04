// VentasListar.jsx
import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import AppNotification from '../../components/Notification';
import { Tag } from 'primereact/tag';
import SearchBar from '../../components/SearchBar';
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

    // Función para obtener la clase CSS según el estado
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

    // Template para la columna de estados con dropdown
    const estadoBodyTemplate = (rowData) => {
        const estadoAnuladoId = estadosVenta.find(e => e.nombre_estado === 'Anulada')?.idestadoventa;
        const isUpdatable = rowData.idEstadoVenta !== estadoAnuladoId;

        // Encontrar el estado actual
        const estadoActual = estadosVenta.find(e => e.idestadoventa === rowData.idEstadoVenta);
        const nombreEstadoActual = estadoActual?.nombre_estado || rowData.nombreEstado;

        const selectedTemplate = (option) => {
            if (option) {
                return (
                    <Tag 
                        value={option.nombre_estado} 
                        className={`estado-tag-small ${getSeverityClass(option.nombre_estado)}`}
                    />
                );
            }
            return null;
        };

        const itemTemplate = (option) => {
            return (
                <Tag 
                    value={option.nombre_estado} 
                    className={`estado-tag-small ${getSeverityClass(option.nombre_estado)}`}
                />
            );
        };

        if (isUpdatable) {
            return (
                <Dropdown
                    value={estadoActual}
                    options={estadosVenta}
                    onChange={(e) => manejarCambioEstado(rowData.idVenta, e.value.idestadoventa)}
                    optionLabel="nombre_estado"
                    valueTemplate={selectedTemplate}
                    itemTemplate={itemTemplate}
                    className="estado-dropdown-compact"
                    panelClassName="estado-dropdown-panel"
                />
            );
        } else {
            // Solo mostrar el tag sin posibilidad de cambio
            return (
                <Tag
                    value={nombreEstadoActual}
                    className={`estado-tag-small ${getSeverityClass(nombreEstadoActual)}`}
                />
            );
        }
    };

    const actionBodyTemplate = (rowData) => {
        const estadoAnuladoId = estadosVenta.find(e => e.nombre_estado === 'Anulada')?.idestadoventa;

        return (
            <div className="action-buttons-container">
                <button
                    className="admin-button gray"
                    title="Ver Detalle"
                    onClick={() => verDetalleVenta(rowData)}
                >
                    👁
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

            {/* Toolbar con diseño igual a Usuarios.jsx */}
            <div className="admin-toolbar">
                <button
                    className="admin-button pink"
                    onClick={() => setMostrarAgregarVenta(true)}
                    type="button"
                >
                    + Agregar
                </button>
                <SearchBar
                    placeholder="Buscar venta..."
                    onChange={setFiltro}
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
                    body={estadoBodyTemplate}
                    style={{ minWidth: '110px', maxWidth: '130px' }}
                ></Column>
                <Column field="total" header="Total"></Column>
                <Column header="Acciones" body={actionBodyTemplate}></Column>
            </DataTable>

            <style jsx>{`
                /* Estilos para el dropdown de estados - compacto */
                .estado-dropdown-compact {
                    border: none !important;
                    box-shadow: none !important;
                    background: transparent !important;
                    width: 100% !important;
                    max-width: 120px !important;
                }
                
                .estado-dropdown-compact .p-dropdown-trigger {
                    width: 14px !important;
                    border: none !important;
                    background: transparent !important;
                    opacity: 0.6;
                }
                
                .estado-dropdown-compact .p-dropdown-trigger .p-dropdown-trigger-icon {
                    font-size: 8px !important;
                }
                
                .estado-dropdown-compact .p-dropdown-label {
                    border: none !important;
                    padding: 0 !important;
                    background: transparent !important;
                }
                
                .estado-dropdown-compact:hover {
                    cursor: pointer;
                }
                
                .estado-dropdown-compact:hover .p-dropdown-trigger {
                    opacity: 1;
                }
                
                /* Panel del dropdown */
                .estado-dropdown-panel {
                    border: 1px solid #dee2e6 !important;
                    border-radius: 6px !important;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
                }
                
                .estado-dropdown-panel .p-dropdown-items .p-dropdown-item {
                    padding: 0.4rem !important;
                    margin: 0.05rem 0 !important;
                    border-radius: 3px !important;
                }
                
                .estado-dropdown-panel .p-dropdown-items .p-dropdown-item:hover {
                    background-color: #f8f9fa !important;
                }
                
                /* Tags de estado compactos */
                .estado-tag-small {
                    font-size: 0.65rem !important;
                    font-weight: 500 !important;
                    padding: 0.15rem 0.5rem !important;
                    border-radius: 8px !important;
                    min-width: 60px !important;
                    max-width: 100px !important;
                    text-align: center !important;
                    display: inline-block !important;
                    white-space: nowrap !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                }
                
                /* Estados específicos con colores personalizados */
                .estado-activa {
                    background-color: #10b981 !important;
                    color: white !important;
                }
                
                .estado-anulada {
                    background-color: #ef4444 !important;
                    color: white !important;
                }
                
                .estado-espera {
                    background-color: #f59e0b !important;
                    color: white !important;
                }
                
                .estado-produccion {
                    background-color: #3b82f6 !important;
                    color: white !important;
                }
                
                .estado-entregar {
                    background-color: #ec4899 !important;
                    color: white !important;
                }
                
                .estado-finalizado {
                    background-color: #8b5cf6 !important;
                    color: white !important;
                }
                
                /* Estados adicionales que podrían existir */
                .estado-pendiente {
                    background-color: #f59e0b !important;
                    color: white !important;
                }
                
                .estado-completada {
                    background-color: #10b981 !important;
                    color: white !important;
                }
                
                .estado-en-proceso {
                    background-color: #3b82f6 !important;
                    color: white !important;
                }
                
                /* Fila anulada con fondo rosado */
                .admin-table .row-anulado {
                    background-color: #fdf2f8 !important;
                }
                
                .admin-table .row-anulado:hover {
                    background-color: #fce7f3 !important;
                }
            `}</style>
        </>
    );
}