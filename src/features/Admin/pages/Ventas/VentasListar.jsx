import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import AppNotification from '../../components/Notification';
import Tooltip from '../../components/Tooltip';
import SearchBar from '../../components/SearchBar';
import ventaApiService from '../../services/venta_services';
import '../../adminStyles.css';
import PDFPreviewVentas from './PDFPreviewVentas';

export default function VentasListar({
    ventasFiltradas,
    abrirModal,
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
    const [mostrarPreviewPDF, setMostrarPreviewPDF] = useState(false);
    const [ventaParaPDF, setVentaParaPDF] = useState(null);
    const [loadingPDF, setLoadingPDF] = useState(false);

    const formatearMoneda = (valor) => {
        const numero = parseFloat(valor || 0);
        return numero.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    const estadoBodyTemplate = (rowData) => {
        const estadoAnuladoId = estadosVenta.find(e => e.nombre_estado === 'Anulada')?.idestadoventa;
        const estadoActivoId = estadosVenta.find(e => e.nombre_estado === 'Activa')?.idestadoventa;
        const estadoFinalizadoId = estadosVenta.find(e => e.nombre_estado === 'Finalizado')?.idestadoventa;
        const estadoCompletadaId = estadosVenta.find(e => e.nombre_estado === 'Completada')?.idestadoventa;

        const isStaticState = (
            rowData.idEstadoVenta === estadoAnuladoId ||
            rowData.idEstadoVenta === estadoFinalizadoId ||
            rowData.idEstadoVenta === estadoCompletadaId ||
            (rowData.tipoVenta === 'directa' && rowData.idEstadoVenta === estadoActivoId)
        );

        const estadoActual = estadosVenta.find(e => e.idestadoventa === rowData.idEstadoVenta);
        const nombreEstadoActual = estadoActual?.nombre_estado || rowData.nombreEstado;

        const getColorEstado = () => {
            if (rowData.idEstadoVenta === estadoAnuladoId) {
                return { bg: '#ffebee', color: '#c62828' };
            }
            if (rowData.idEstadoVenta === estadoActivoId) {
                return { bg: '#e8f5e9', color: '#2e7d32' };
            }
            if (rowData.idEstadoVenta === estadoCompletadaId || rowData.idEstadoVenta === estadoFinalizadoId) {
                return { bg: '#e3f2fd', color: '#1565c0' };
            }
            return { bg: '#fce4ec', color: '#c2185b' };
        };

        const colores = getColorEstado();

        if (isStaticState) {
            return (
                <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    borderRadius: '4px',
                    backgroundColor: colores.bg,
                    color: colores.color,
                    border: `1px solid ${colores.color}20`
                }}>
                    {nombreEstadoActual}
                </span>
            );
        } else {
            const opcionesDropdown = estadosVenta.filter(estado => {
                const nombreEstado = estado.nombre_estado;
                return nombreEstado !== 'Activa' && nombreEstado !== 'Anulada';
            });

            return (
                <select
                    value={rowData.idEstadoVenta}
                    onChange={(e) => manejarCambioEstado(rowData.idVenta, parseInt(e.target.value))}
                    style={{
                        padding: '4px 24px 4px 8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        border: 'none',
                        borderRadius: '4px',
                        appearance: 'none',
                        backgroundColor: '#e91e63',
                        color: '#fff',
                        cursor: 'pointer',
                        minWidth: '80px',
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 4px center',
                        backgroundSize: '12px'
                    }}
                >
                    {opcionesDropdown.map((estado) => (
                        <option key={estado.idestadoventa} value={estado.idestadoventa}>
                            {estado.nombre_estado}
                        </option>
                    ))}
                </select>
            );
        }
    };

    const abrirPreviewPDF = async (venta) => {
        setLoadingPDF(true);
        try {
            const ventaCompleta = await ventaApiService.obtenerVentaPorId(venta.idVenta);
            if (!ventaCompleta.detalleVenta || ventaCompleta.detalleVenta.length === 0) {
                alert('Esta venta no tiene productos registrados para generar el PDF');
                return;
            }
            setVentaParaPDF(ventaCompleta);
            setMostrarPreviewPDF(true);
        } catch (error) {
            alert('No se pudo cargar la información completa de la venta: ' + error.message);
        } finally {
            setLoadingPDF(false);
        }
    };

    const cerrarPreviewPDF = () => {
        setMostrarPreviewPDF(false);
        setVentaParaPDF(null);
    };

    const actionBodyTemplate = (rowData) => {
        const estadoAnuladoId = estadosVenta.find(e => e.nombre_estado === 'Anulada')?.idestadoventa;
        const estadoActivoId = estadosVenta.find(e => e.nombre_estado === 'Activa')?.idestadoventa;
        const isAnulable = rowData.idEstadoVenta !== estadoAnuladoId && rowData.idEstadoVenta !== estadoActivoId;

        return (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
                {/* Ver - Azul */}
                <Tooltip text="Ver detalle">
                    <button
                        className="admin-button"
                        onClick={() => verDetalleVenta(rowData)}
                        style={{
                            background: '#e3f2fd',
                            color: '#1976d2',
                            border: 'none',
                            borderRadius: '6px',
                            width: '26px',
                            height: '26px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <i className="fas fa-eye" style={{ fontSize: '11px' }}></i>
                    </button>
                </Tooltip>
                
                {/* Anular - Rojo */}
                <Tooltip text={rowData.idEstadoVenta === estadoAnuladoId ? "Anulada" : "Anular"}>
                    <button
                        className="admin-button"
                        onClick={() => abrirModal('anular', rowData)}
                        disabled={rowData.idEstadoVenta === estadoAnuladoId}
                        style={{
                            background: rowData.idEstadoVenta === estadoAnuladoId ? '#f5f5f5' : '#ffebee',
                            color: rowData.idEstadoVenta === estadoAnuladoId ? '#bbb' : '#d32f2f',
                            border: 'none',
                            borderRadius: '6px',
                            width: '26px',
                            height: '26px',
                            cursor: rowData.idEstadoVenta === estadoAnuladoId ? 'not-allowed' : 'pointer',
                            opacity: rowData.idEstadoVenta === estadoAnuladoId ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <i className="fas fa-ban" style={{ fontSize: '11px' }}></i>
                    </button>
                </Tooltip>
                
                {/* PDF - Amarillo (IGUAL QUE COMPRAS) */}
                <Tooltip text="Generar PDF">
                    <button
                        className="admin-button"
                        onClick={() => abrirPreviewPDF(rowData)}
                        disabled={loadingPDF}
                        style={{
                            background: '#fff8e1',
                            color: '#f57c00',
                            border: 'none',
                            borderRadius: '6px',
                            width: '26px',
                            height: '26px',
                            cursor: loadingPDF ? 'wait' : 'pointer',
                            opacity: loadingPDF ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <i className={loadingPDF ? "fas fa-spinner fa-spin" : "fas fa-file-pdf"} style={{ fontSize: '11px' }}></i>
                    </button>
                </Tooltip>
                
                {/* Abonos - Verde */}
                {rowData.tipoVenta === 'pedido' && isAnulable && (
                    <Tooltip text="Abonos">
                        <button
                            className="admin-button"
                            onClick={() => setMostrarModalAbonos(rowData)}
                            style={{
                                background: '#e8f5e9',
                                color: '#388e3c',
                                border: 'none',
                                borderRadius: '6px',
                                width: '26px',
                                height: '26px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <i className="fas fa-dollar-sign" style={{ fontSize: '11px' }}></i>
                        </button>
                    </Tooltip>
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

            {/* Toolbar: Buscador + Agregar a la derecha */}
            <div className="admin-toolbar">
                <SearchBar
                    placeholder="Buscar venta..."
                    onChange={setFiltro}
                />
                <button
                    className="admin-button pink"
                    onClick={() => setMostrarAgregarVenta(true)}
                    type="button"
                >
                    <i className="fas fa-plus"></i> Agregar
                </button>
            </div>

            {/* Header con título y filtros */}
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
            
            {/* Tabla */}
            <DataTable
                value={ventasFiltradas}
                className="admin-table compact-paginator"
                dataKey="idVenta"
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25, 50]}
                rowClassName={getRowClassName}
                emptyMessage="No hay ventas registradas"
                tableStyle={{ minWidth: '50rem' }}
            >
                <Column field="idVenta" header="N°" style={{ width: '50px' }}></Column>
                <Column field="nombreCliente" header="Cliente"></Column>
                <Column field="nombreSede" header="Sede"></Column>
                <Column field="metodoPago" header="Método de Pago"></Column>
                <Column field="tipoVenta" header="Tipo de Venta"></Column>
                <Column
                    field="nombreEstado"
                    header="Estado"
                    body={estadoBodyTemplate}
                ></Column>
                <Column 
                    field="total" 
                    header="Total"
                    body={(rowData) => formatearMoneda(rowData.total)}
                ></Column>
                <Column 
                    header="Acciones" 
                    body={actionBodyTemplate}
                    style={{ width: '120px' }}
                ></Column>
            </DataTable>

            {/* Modal PDF Preview */}
            {mostrarPreviewPDF && ventaParaPDF && (
                <PDFPreviewVentas
                    visible={mostrarPreviewPDF}
                    onClose={cerrarPreviewPDF}
                    ventaData={ventaParaPDF}
                    onDownload={() => console.log('PDF descargado')}
                />
            )}
        </>
    );
}