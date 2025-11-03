// VentasListar.jsx - Con estados mejorados en rosa
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
    // Estado para controlar la previsualización del PDF
    const [mostrarPreviewPDF, setMostrarPreviewPDF] = useState(false);
    const [ventaParaPDF, setVentaParaPDF] = useState(null);
    const [loadingPDF, setLoadingPDF] = useState(false);

    // Función para formatear valores a moneda
    const formatearMoneda = (valor) => {
        const numero = parseFloat(valor || 0);
        return numero.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    // Función para renderizar el estado como un select mejorado
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

        const colorEstadoEstatico = isStaticState ? '#B0B0B0' : '#E91E63';

        if (isStaticState) {
            // Mostrar como un select deshabilitado
            return (
                <div style={{ 
                    position: 'relative', 
                    width: '180px',
                    maxWidth: '100%',
                    display: 'inline-block'
                }}>
                    <div
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '13px',
                            fontWeight: '600',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: colorEstadoEstatico,
                            color: '#fff',
                            textAlign: 'left',
                            opacity: 0.7,
                            cursor: 'not-allowed',
                        }}
                    >
                        {nombreEstadoActual}
                    </div>
                </div>
            );
        } else {
            // Select interactivo para estados que pueden cambiar
            const opcionesDropdown = estadosVenta.filter(estado => {
                const nombreEstado = estado.nombre_estado;
                return nombreEstado !== 'Activa' && nombreEstado !== 'Anulada';
            });

            return (
                <div style={{ 
                    position: 'relative', 
                    width: '180px',
                    maxWidth: '100%',
                    display: 'inline-block'
                }}>
                    <select
                        value={rowData.idEstadoVenta}
                        onChange={(e) => manejarCambioEstado(rowData.idVenta, parseInt(e.target.value))}
                        className="estado-select-ventas"
                        style={{
                            width: '100%',
                            padding: '8px 35px 8px 12px',
                            fontSize: '13px',
                            fontWeight: '600',
                            border: 'none',
                            borderRadius: '6px',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            backgroundColor: '#E91E63',
                            color: '#fff',
                            cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(233, 30, 99, 0.4)',
                            transition: 'all 0.3s ease',
                            textAlign: 'left',
                            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 10px center',
                            backgroundSize: '16px',
                        }}
                    >
                        {opcionesDropdown.map((estado) => (
                            <option 
                                key={estado.idestadoventa} 
                                value={estado.idestadoventa}
                            >
                                {estado.nombre_estado}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }
    };

    // Función para abrir el preview del PDF
    const abrirPreviewPDF = async (venta) => {
        console.log('📄 Abriendo preview para venta:', venta);
        setLoadingPDF(true);
        
        try {
            // Obtener datos completos de la venta incluyendo detalleVenta
            console.log('📡 Solicitando datos completos de venta ID:', venta.idVenta);
            const ventaCompleta = await ventaApiService.obtenerVentaPorId(venta.idVenta);
            console.log('✅ Venta completa obtenida:', ventaCompleta);
            
            // Verificar que tenga productos
            if (!ventaCompleta.detalleVenta || ventaCompleta.detalleVenta.length === 0) {
                console.error('❌ La venta no tiene productos:', ventaCompleta);
                alert('Esta venta no tiene productos registrados para generar el PDF');
                return;
            }
            
            console.log('📄 Productos encontrados:', ventaCompleta.detalleVenta.length);
            setVentaParaPDF(ventaCompleta);
            setMostrarPreviewPDF(true);
        } catch (error) {
            console.error('❌ Error al obtener datos completos de la venta:', error);
            alert('No se pudo cargar la información completa de la venta: ' + error.message);
        } finally {
            setLoadingPDF(false);
        }
    };

    // Función para cerrar el preview
    const cerrarPreviewPDF = () => {
        setMostrarPreviewPDF(false);
        setVentaParaPDF(null);
    };

    // Template para los botones de acción
    const actionBodyTemplate = (rowData) => {
        const estadoAnuladoId = estadosVenta.find(e => e.nombre_estado === 'Anulada')?.idestadoventa;
        const estadoActivoId = estadosVenta.find(e => e.nombre_estado === 'Activa')?.idestadoventa;
        const isAnulable = rowData.idEstadoVenta !== estadoAnuladoId && rowData.idEstadoVenta !== estadoActivoId;

        return (
            <div className="action-buttons-container">
                <Tooltip text="Visualizar">
                    <button
                        className="admin-button gray"
                        onClick={() => verDetalleVenta(rowData)}
                    >
                        📋
                    </button>
                </Tooltip>
                
                <Tooltip text={rowData.idEstadoVenta === estadoAnuladoId ? "Venta anulada" : "Anular"}>
                    <button
                        className="admin-button red"
                        onClick={() => abrirModal('anular', rowData)}
                        disabled={rowData.idEstadoVenta === estadoAnuladoId}
                        style={{
                            opacity: rowData.idEstadoVenta === estadoAnuladoId ? 0.5 : 1,
                            cursor: rowData.idEstadoVenta === estadoAnuladoId ? 'not-allowed' : 'pointer'
                        }}
                    >
                        🛑
                    </button>
                </Tooltip>
                
                <Tooltip text={loadingPDF ? "Cargando..." : "Descargar PDF"}>
                    <button
                        className="admin-button blue"
                        onClick={() => abrirPreviewPDF(rowData)}
                        disabled={loadingPDF}
                        style={{ 
                            opacity: loadingPDF ? 0.6 : 1,
                            cursor: loadingPDF ? 'wait' : 'pointer'
                        }}
                    >
                        {loadingPDF ? '⏳' : '⬇️'}
                    </button>
                </Tooltip>
                
               {rowData.tipoVenta === 'pedido' && isAnulable && (
                    <Tooltip text="Gestionar Abonos">
                        <button
                            className="admin-button green"
                            onClick={() => setMostrarModalAbonos(rowData)}  
                        >
                            💰
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
                className="admin-table compact-paginator"
                dataKey="idVenta"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                rowClassName={getRowClassName}
            >
                <Column field="idVenta" header="N°"></Column>
                <Column field="nombreCliente" header="Cliente"></Column>
                <Column field="nombreSede" header="Sede"></Column>
                <Column field="metodoPago" header="Método de Pago"></Column>
                <Column field="tipoVenta" header="Tipo de Venta"></Column>
                <Column
                    field="nombreEstado"
                    header="Estado"
                    body={estadoBodyTemplate}
                    style={{ minWidth: '180px', maxWidth: '200px' }}
                ></Column>
                <Column 
                    field="total" 
                    header="Total"
                    body={(rowData) => formatearMoneda(rowData.total)}
                ></Column>
                <Column header="Acciones" body={actionBodyTemplate}></Column>
            </DataTable>

            {/* Modal de previsualización del PDF */}
            {mostrarPreviewPDF && ventaParaPDF && (
                <PDFPreviewVentas
                    visible={mostrarPreviewPDF}
                    onClose={cerrarPreviewPDF}
                    ventaData={ventaParaPDF}
                    onDownload={() => {
                        console.log('PDF descargado exitosamente');
                    }}
                />
            )}
        </>
    );
}