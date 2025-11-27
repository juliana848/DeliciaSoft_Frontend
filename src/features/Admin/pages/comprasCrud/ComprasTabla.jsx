import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import '../../adminStyles.css';
import Modal from '../../components/modal.jsx';
import SearchBar from '../../components/SearchBar.jsx';
import Notification from '../../components/Notification.jsx';
import Tooltip from '../../components/Tooltip';
import PDFPreview from '../PDFPreview.jsx';
import CompraForm from './CompraForm.jsx';
import ProveedorModal from './ProveedorModal.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { useCompras } from './Hooks/useCompras.jsx';
import { useProveedores } from './Hooks/useProveedor.jsx';
import { useNotification } from './Hooks/useNotification.jsx';
import compraApiService from '../../services/compras_services.js';
import './styles/CompraStyles.css';
import compraValidationService from '../../services/compras_validation_services';
import { obtenerFechaColombia } from '../comprasCrud/Utils/fechaUtils.js';

export default function ComprasTable() {
    const [filtro, setFiltro] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTipo, setModalTipo] = useState(null);
    const [compraSeleccionada, setCompraSeleccionada] = useState(null);
    const [mostrarAgregarCompra, setMostrarAgregarCompra] = useState(false);
    const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);
    const [mostrarModalInsumos, setMostrarModalInsumos] = useState(false);
    const [mostrarAnuladas, setMostrarAnuladas] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [mensajeCarga, setMensajeCarga] = useState('Cargando...');
    const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
    const [compraPdf, setCompraPdf] = useState(null);
    const [insumos, setInsumos] = useState([]);
    const [modalProveedorVisible, setModalProveedorVisible] = useState(false);
    const [modalProveedorTipo, setModalProveedorTipo] = useState(null);
    const [buscarProveedor, setBuscarProveedor] = useState('');
    const [errores, setErrores] = useState({
        proveedor: '',
        fecha_compra: '',
        insumos: ''
    });

    const obtenerFechaActual = () => obtenerFechaColombia();

    const [compraData, setCompraData] = useState({
        proveedor: '',
        idProveedor: null,
        fechaCompra: '',
        fechaRegistro: obtenerFechaColombia(),
        observaciones: ''
    });

    const { 
        compras, 
        cargarCompras, 
        guardarCompra: guardarCompraHook, 
        anularCompra: anularCompraHook, 
        reactivarCompra: reactivarCompraHook 
    } = useCompras();
    
    const { 
        proveedores, 
        cargarProveedores, 
        guardarProveedor: guardarProveedorHook 
    } = useProveedores();
    
    const { 
        notification, 
        showNotification, 
        hideNotification 
    } = useNotification();

    const formatoCOP = (valor) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    };

    // 🆕 Función mejorada para formatear fechas correctamente
    const formatearFecha = (fecha) => {
        if (!fecha) return 'N/A';
        
        try {
            // Crear objeto Date sin conversión de zona horaria
            const fechaStr = String(fecha);
            let fechaObj;
            
            // Si la fecha viene en formato ISO con hora (2024-01-15T00:00:00.000Z)
            if (fechaStr.includes('T')) {
                // Extraer solo la parte de la fecha (YYYY-MM-DD)
                const soloFecha = fechaStr.split('T')[0];
                const [year, month, day] = soloFecha.split('-');
                fechaObj = new Date(Number(year), Number(month) - 1, Number(day));
            } else if (fechaStr.includes('-')) {
                // Formato YYYY-MM-DD
                const [year, month, day] = fechaStr.split('-');
                fechaObj = new Date(Number(year), Number(month) - 1, Number(day));
            } else {
                // Intentar parsear normalmente
                fechaObj = new Date(fecha);
            }
            
            // Verificar si la fecha es válida
            if (isNaN(fechaObj.getTime())) {
                return 'Fecha inválida';
            }
            
            // Formatear manualmente para evitar problemas de zona horaria
            const dia = String(fechaObj.getDate()).padStart(2, '0');
            const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
            const anio = fechaObj.getFullYear();
            
            return `${dia}/${mes}/${anio}`;
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Error en fecha';
        }
    };

    useEffect(() => {
        const cargarInsumos = async () => {
            setMensajeCarga('Cargando insumos...');
            setCargando(true);
            try {
                const resp = await fetch("https://deliciasoft-backend-i6g9.onrender.com/api/insumos");
                const raw = await resp.json();
                const insumos = transformarInsumosDesdeAPI(raw);
                setInsumos(insumos);
            } finally {
                setCargando(false);
            }
        };
        cargarInsumos();
    }, []);

    useEffect(() => {
        let isMounted = true;
        const cargarDatos = async () => {
            if (!isMounted) return;
            setMensajeCarga('Cargando datos...');
            setCargando(true);
            try {
                await Promise.all([cargarCompras(), cargarProveedores()]);
            } catch (error) {
                console.error('Error al cargar datos:', error);
                if (isMounted) {
                    showNotification('Error al cargar los datos', 'error');
                }
            } finally {
                if (isMounted) {
                    setCargando(false);
                }
            }
        };
        cargarDatos();
        return () => { isMounted = false; };
    }, []);

    function transformarInsumosDesdeAPI(apiInsumos) {
        return apiInsumos.map(apiInsumo => ({
            idinsumo: apiInsumo.idinsumo,
            nombreinsumo: apiInsumo.nombreinsumo,
            idcategoriainsumos: apiInsumo.idcategoriainsumos,
            idunidadmedida: apiInsumo.idunidadmedida,
            idimagen: apiInsumo.idimagen,
            estado: apiInsumo.estado,
            cantidad: (apiInsumo.cantidad !== null && apiInsumo.cantidad !== undefined && apiInsumo.cantidad !== "")
                ? parseFloat(apiInsumo.cantidad)
                : 0,
            precio: apiInsumo.precio,
        }));
    }

    const abrirPDFPreview = async (compra) => {
        try {
            setMensajeCarga('Preparando PDF...');
            setCargando(true);
            const compraCompleta = await compraApiService.obtenerCompraPorId(compra.id);

            if (!compraCompleta.detalles || compraCompleta.detalles.length === 0) {
                showNotification('No se puede generar PDF: La compra no tiene insumos registrados', 'error');
                return;
            }

            const datosCompra = {
                id: compraCompleta.id,
                proveedor: compraCompleta.proveedor?.nombre || 'N/A',
                documento_proveedor: compraCompleta.proveedor?.documento || compraCompleta.proveedor?.nit || 'N/A',
                fecha_compra: compraCompleta.fechaCompra,
                fecha_registro: compraCompleta.fechaRegistro,
                observaciones: compraCompleta.observaciones || '',
                insumos: compraCompleta.detalles.map(detalle => ({
                    nombre: detalle.insumo?.nombre || 'N/A',
                    cantidad: detalle.cantidad,
                    precio: detalle.precioUnitario,
                    precioUnitario: detalle.precioUnitario,
                    unidad_medida: detalle.insumo?.unidad || 'N/A'
                }))
            };

            setCompraPdf(datosCompra);
            setPdfPreviewVisible(true);
        } catch (error) {
            console.error('Error al preparar PDF:', error);
            showNotification('Error al preparar la visualización: ' + error.message, 'error');
        } finally {
            setCargando(false);
        }
    };

    const cerrarPDFPreview = () => {
        setPdfPreviewVisible(false);
        setCompraPdf(null);
    };

    const generarPDF = async (compra) => {
        await abrirPDFPreview(compra);
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setCompraSeleccionada(null);
        setModalTipo(null);
    };

    const cancelarFormulario = () => {
        setMostrarAgregarCompra(false);
        setCompraData({
            proveedor: "",
            idProveedor: null,
            fechaCompra: "",
            fechaRegistro: obtenerFechaColombia(),
            observaciones: "",
        });
        setInsumosSeleccionados([]);
        setCompraSeleccionada(null);
        setModalTipo(null);
        setErrores({ proveedor: "", fecha_compra: "", insumos: "" });
    };

    const anularCompra = async () => {
        try {
            if (!compraSeleccionada || !compraSeleccionada.id) {
                showNotification("No se ha seleccionado una compra válida", "error");
                return;
            }

            setMensajeCarga('Validando compra...');
            setCargando(true);
            
            const validacion = await compraValidationService.validarAnulacionCompra(compraSeleccionada.id);
            
            if (!validacion.puedeAnular) {
                setCargando(false);
                setModalVisible(false);
                
                let mensajeDetallado = validacion.mensaje + '\n\n';
                validacion.detalles
                    .filter(d => !d.puedeAnular)
                    .forEach(d => {
                        mensajeDetallado += `${d.nombreInsumo}:\n`;
                        mensajeDetallado += `  Stock actual: ${d.stockActual}\n`;
                        mensajeDetallado += `  Cantidad en compra: ${d.cantidadCompra}\n`;
                        mensajeDetallado += `  Quedaría: ${d.stockDespuesAnulacion}\n`;
                        mensajeDetallado += `  Necesario en producción: ${d.usoEnProduccion}\n\n`;
                    });
                
                showNotification(mensajeDetallado, 'error');
                return;
            }

            setMensajeCarga('Anulando compra...');
            await anularCompraHook(compraSeleccionada.id);
            setMostrarAnuladas(true);
            await cargarCompras();
            showNotification("Compra anulada correctamente", "success");
            setModalVisible(false);
        } catch (error) {
            console.error("Error al anular compra:", error);
            showNotification("Error al anular la compra: " + error.message, "error");
        } finally {
            setCargando(false);
        }
    };

    const reactivarCompra = async (compra) => {
        try {
            setMensajeCarga('Reactivando compra...');
            setCargando(true);
            await reactivarCompraHook(compra);
            await cargarCompras();
            showNotification("Compra reactivada exitosamente.", "success");
        } catch (error) {
            console.error("Error al reactivar compra:", error);
            showNotification("Error al reactivar la compra: " + error.message, "error");
        } finally {
            setCargando(false);
        }
    };

    const abrirModal = async (tipo, compra = null) => {
        setModalTipo(tipo);

        if (tipo === "ver" && compra) {
            try {
                setMensajeCarga('Cargando detalles de compra...');
                setCargando(true);
                const compraId = compra.id || compra.idcompra || compra.idCompra;

                if (!compraId) {
                    showNotification("Error: No se encontró un ID válido", "error");
                    return;
                }

                const datosCompra = await compraApiService.obtenerCompraPorId(compraId);
                setCompraSeleccionada(datosCompra);

                const detalles = datosCompra.detalles || [];
                const insumosFormateados = detalles.map((detalle) => ({
                    id: detalle.idInsumo || detalle.id,
                    nombre: detalle.insumo?.nombre || "N/A",
                    cantidad: Number(detalle.cantidad) || 0,
                    precioUnitario: Number(detalle.precioUnitario) || 0,
                    precio: Number(detalle.precioUnitario) || 0,
                    unidad: detalle.insumo?.unidad || "N/A",
                }));

                setInsumosSeleccionados(insumosFormateados);
                setMostrarAgregarCompra(true);
            } catch (error) {
                console.error("Error al cargar compra:", error);
                showNotification("Error al cargar la compra: " + error.message, "error");
            } finally {
                setCargando(false);
            }
        } else if (tipo === "agregar") {
            setCompraData({
                proveedor: "",
                idProveedor: null,
                fechaCompra: "",
                fechaRegistro: obtenerFechaColombia(),
                observaciones: "",
            });
            setCompraSeleccionada(null);
            setInsumosSeleccionados([]);
            setErrores({ proveedor: "", fecha_compra: "", insumos: "" });
            setMostrarAgregarCompra(true);
        } else if (tipo === "anular" && compra) {
            const compraId = compra.id || compra.idcompra || compra.idCompra;
            if (!compraId) {
                showNotification("Error: No se encontró un ID válido", "error");
                return;
            }
            setCompraSeleccionada({ ...compra, id: compraId });
            setModalVisible(true);
        }
    };

    const filtrarCompras = (compras, filtro) => {
        if (!filtro || filtro.trim() === '') return compras;
        const filtroLower = filtro.toLowerCase().trim();
        
        return compras.filter(compra => {
            const proveedorMatch = compra.proveedor?.nombre && compra.proveedor.nombre.toLowerCase().includes(filtroLower);
            const fechaMatch = compra.fechaCompra && compra.fechaCompra.toLowerCase().includes(filtroLower);
            const totalFormateado = compra.total ? formatoCOP(compra.total) : '';
            const totalFormateadoMatch = totalFormateado.toLowerCase().includes(filtroLower);
            
            return proveedorMatch || fechaMatch || totalFormateadoMatch;
        });
    };

    // 🆕 El filtrado ya no ordena porque las compras ya vienen ordenadas de useCompras
    const comprasFiltradas = filtrarCompras(compras, filtro)
        .filter(c => {
            if (mostrarAnuladas) {
                return c.estado === false;
            } else {
                return c.estado === true || c.estado === undefined;
            }
        });

    const guardarCompra = async (compraData, insumosSeleccionados) => {
        try {
            setMensajeCarga('Guardando compra...');
            setCargando(true);
            await guardarCompraHook(compraData, insumosSeleccionados);
            showNotification("Compra guardada correctamente y stock actualizado");
            cancelarFormulario();
            await cargarCompras();
        } catch (error) {
            console.error("Error al guardar la compra:", error);
            showNotification("Error al guardar la compra: " + error.message, "error");
        } finally {
            setCargando(false);
        }
    };

    const guardarProveedor = async (proveedorData) => {
        try {
            setMensajeCarga('Guardando proveedor...');
            setCargando(true);
            const nuevoProveedor = await guardarProveedorHook(proveedorData);
            await cargarProveedores();
            
            setCompraData(prev => ({
                ...prev,
                idProveedor: nuevoProveedor.idProveedor || nuevoProveedor.id,
                proveedor: nuevoProveedor.nombre || nuevoProveedor.nombreProveedor
            }));

            setErrores(prev => ({ ...prev, proveedor: '' }));
            showNotification('Proveedor agregado exitosamente');
            setModalProveedorVisible(false);
            setModalProveedorTipo(null);
        } catch (error) {
            console.error('Error al guardar proveedor:', error);
            showNotification(error.message || 'Error al guardar el proveedor', 'error');
        } finally {
            setCargando(false);
        }
    };

    const abrirModalProveedor = () => {
        setModalProveedorTipo('agregar');
        setModalProveedorVisible(true);
    };

    const cerrarModalProveedor = () => {
        setModalProveedorVisible(false);
        setModalProveedorTipo(null);
    };
    
    return (
        <div className="admin-wrapper">
            <Notification 
                visible={notification.visible} 
                mensaje={notification.mensaje} 
                tipo={notification.tipo} 
                onClose={hideNotification} 
            />

            <PDFPreview 
                visible={pdfPreviewVisible}
                onClose={cerrarPDFPreview}
                compraData={compraPdf}
                onDownload={() => {}}
                modalSize="large"
            />

            {cargando && (
                <LoadingSpinner mensaje={mensajeCarga} fullScreen={true} />
            )}

            {!mostrarAgregarCompra ? (
                <>
                    {/* Toolbar: Buscador + Agregar a la derecha */}
                    <div className="admin-toolbar">
                        <SearchBar 
                            placeholder="Buscar Compras" 
                            value={filtro} 
                            onChange={setFiltro} 
                        />
                        <button 
                            className="admin-button pink" 
                            onClick={() => abrirModal('agregar')} 
                            type="button"
                            disabled={cargando}
                        >
                            <i className="fas fa-plus"></i> Agregar
                        </button>
                    </div>

                    <div className="ventas-header-container">
                        <h2 className="admin-section-title">Gestión de Compras</h2>
                        <div className="filter-buttons-container">
                            <button
                                className={`filter-tab ${!mostrarAnuladas ? 'filter-tab-active' : ''}`}
                                onClick={() => setMostrarAnuladas(false)}
                                type="button"
                            >
                                Activas
                            </button>
                            <button
                                className={`filter-tab ${mostrarAnuladas ? 'filter-tab-active' : ''}`}
                                onClick={() => setMostrarAnuladas(true)}
                                type="button"
                            >
                                Anuladas
                            </button>
                        </div>
                    </div>

                    <DataTable
                        value={comprasFiltradas}
                        className="admin-table compact-paginator"
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        rowClassName={rowData => !rowData.estado ? 'fila-anulada' : ''}
                        tableStyle={{ minWidth: '50rem' }}
                    >
                        <Column 
                            header="N°" 
                            body={(r, { rowIndex }) => rowIndex + 1} 
                            style={{ width: '50px' }} 
                        />
                        <Column 
                            field="proveedor" 
                            header="Proveedor" 
                            body={rowData => rowData.proveedor?.nombre || 'N/A'}
                        />
                        <Column 
                            field="fechaCompra" 
                            header="Fecha Compra" 
                            body={rowData => formatearFecha(rowData.fechaCompra || rowData.fechacompra)}
                        />
                        <Column
                            field="total"
                            header="Total"
                            body={(rowData) => formatoCOP(rowData.total)}
                        />
                        <Column
                            header="Acciones"
                            body={rowData => (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
                                    <Tooltip text="Visualizar">
                                        <button 
                                            className="admin-button"
                                            onClick={() => abrirModal('ver', rowData)}
                                            disabled={cargando}
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

                                    {/* COMENTADO: Solo mostrar cuando NO estamos en vista de anuladas */}
                                    {!mostrarAnuladas && (
                                        rowData.estado ? (
                                            <Tooltip text="Anular">
                                                <button 
                                                    className="admin-button"
                                                    onClick={() => abrirModal('anular', rowData)}
                                                    disabled={cargando}
                                                    style={{
                                                        background: '#ffebee',
                                                        color: '#d32f2f',
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
                                                    <i className="fas fa-ban" style={{ fontSize: '11px' }}></i>
                                                </button>
                                            </Tooltip>
                                        ) : (
                                            /* COMENTADO: Botón Reactivar - Solo visible en vista activas
                                            <Tooltip text="Reactivar">
                                                <button 
                                                    className="admin-button"
                                                    onClick={() => reactivarCompra(rowData)}
                                                    disabled={cargando}
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
                                                    <i className="fas fa-check-circle" style={{ fontSize: '11px' }}></i>
                                                </button>
                                            </Tooltip>
                                            */
                                            null
                                        )
                                    )}

                                    {/* Botón PDF - Solo visible en vista activas */}
                                    {!mostrarAnuladas && (
                                        <Tooltip text="Generar PDF">
                                            <button 
                                                className="admin-button"
                                                onClick={() => generarPDF(rowData)}
                                                disabled={cargando}
                                                style={{
                                                    background: '#fff8e1',
                                                    color: '#f57c00',
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
                                                <i className="fas fa-file-pdf" style={{ fontSize: '11px' }}></i>
                                            </button>
                                        </Tooltip>
                                    )}
                                </div>
                            )}
                            style={{ width: '100px' }}
                        />
                    </DataTable>

                    {modalTipo === 'anular' && compraSeleccionada && (
                        <Modal visible={modalVisible} onClose={cerrarModal}>
                            <h2 className="modal-title">Confirmar Anulación</h2>
                            <div className="modal-body">
                                <p>¿Seguro que deseas anular la compra del proveedor <strong>{compraSeleccionada.proveedor?.nombre}</strong>?</p>
                            </div>
                            <div className="modal-footer">
                                <button className="modal-btn cancel-btn" onClick={cerrarModal} disabled={cargando}>Cancelar</button>
                                <button className="modal-btn save-btn" onClick={anularCompra} disabled={cargando}>Anular</button>
                            </div>
                        </Modal>
                    )}
                </>
            ) : (
                <CompraForm
                    compraData={modalTipo === 'ver' ? compraSeleccionada : compraData}
                    setCompraData={setCompraData}
                    insumosSeleccionados={insumosSeleccionados}
                    setInsumosSeleccionados={setInsumosSeleccionados}
                    proveedores={proveedores}
                    errores={errores}
                    setErrores={setErrores}
                    modalTipo={modalTipo}
                    cargando={cargando}
                    onGuardar={guardarCompra}
                    onCancelar={cancelarFormulario}
                    onAbrirModalProveedor={abrirModalProveedor}
                    buscarProveedor={buscarProveedor}
                    setBuscarProveedor={setBuscarProveedor}
                    mostrarModalInsumos={mostrarModalInsumos}
                    setMostrarModalInsumos={setMostrarModalInsumos}
                />
            )}

            {modalProveedorVisible && modalProveedorTipo === 'agregar' && (
                <ProveedorModal
                    visible={modalProveedorVisible}
                    onClose={cerrarModalProveedor}
                    onGuardar={guardarProveedor}
                    proveedores={proveedores}
                    loading={cargando}
                />
            )}
        </div>
    );
}