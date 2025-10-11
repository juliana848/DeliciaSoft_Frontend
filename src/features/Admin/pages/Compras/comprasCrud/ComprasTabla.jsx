import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import '../../../adminStyles.css';
import Modal from '../../../components/modal.jsx';
import SearchBar from '../../../components/SearchBar.jsx';
import Notification from '../../../components/Notification.jsx';
import AgregarInsumosModal from '../../../components/AgregarInsumosModal.jsx';
import PDFPreview from '../../PDFPreview.jsx';
import CompraForm from './CompraForm.jsx';
import ProveedorModal from './ProveedorModal.jsx';
import CompraActions from './CompraActions.jsx';
import LoadingSpinner from '../../../components/LoadingSpinner.jsx';
import { useCompras } from './Hooks/useCompras.jsx';
import { useProveedores } from './Hooks/useProveedor.jsx';
import { useNotification } from './Hooks/useNotification.jsx';
import compraApiService from '../../../services/compras_services.js';
import './styles/CompraStyles.css';
import compraValidationService from '../../../services/compras_validation_services';
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

    // Estados para PDFPreview
    const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
    const [compraPdf, setCompraPdf] = useState(null);
    const [insumos, setInsumos] = useState([]);

    // Estados para el modal de proveedores
    const [modalProveedorVisible, setModalProveedorVisible] = useState(false);
    const [modalProveedorTipo, setModalProveedorTipo] = useState(null);

    // Estado buscador proveedores
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

    // Custom hooks
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

    // Cargar datos iniciales
    useEffect(() => {
        let isMounted = true;

        const cargarDatos = async () => {
            if (!isMounted) return;
            setMensajeCarga('Cargando datos...');
            setCargando(true);
            try {
                await Promise.all([
                    cargarCompras(),
                    cargarProveedores()
                ]);
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

        return () => {
            isMounted = false;
        };
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
            documento_proveedor: compraCompleta.proveedor?.documento || compraCompleta.proveedor?.nit || 'N/A', // ✅ AGREGADO
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

    const descargarPDFDesdePreview = async () => {
        try {
            if (compraPdf) {
                showNotification('PDF descargado exitosamente', 'success');
            }
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            showNotification('Error al descargar el PDF: ' + error.message, 'error');
        }
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
            fechaRegistro: obtenerFechaColombia(), // ✅ Cambio aquí
            observaciones: "",
        });
        setInsumosSeleccionados([]);
        setCompraSeleccionada(null);
        setModalTipo(null);
        setErrores({
            proveedor: "",
            fecha_compra: "",
            insumos: "",
        });
    };

    const anularCompra = async () => {
        try {
            if (!compraSeleccionada || !compraSeleccionada.id) {
                showNotification("No se ha seleccionado una compra válida", "error");
                return;
            }

            setMensajeCarga('Validando compra...');
            setCargando(true);
            
            // Validar antes de anular
            const validacion = await compraValidationService.validarAnulacionCompra(compraSeleccionada.id);
            
            // Si no puede anular, mostrar error y detener
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

            // Si puede anular, proceder
            setMensajeCarga('Anulando compra...');
            await anularCompraHook(compraSeleccionada.id);
            
            // Cambiar a vista anuladas
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
        console.log("abrirModal llamado con:", tipo, compra);
        setModalTipo(tipo);

        if (tipo === "ver" && compra) {
            try {
                setMensajeCarga('Cargando detalles de compra...');
                setCargando(true);

                const compraId = compra.id || compra.idcompra || compra.idCompra;

                if (!compraId) {
                    console.error("No se pudo determinar el ID de la compra:", compra);
                    showNotification("Error: No se encontró un ID válido", "error");
                    return;
                }

                console.log("Cargando compra con ID:", compraId);

                // Obtener la compra completa desde el API
                const datosCompra = await compraApiService.obtenerCompraPorId(compraId);
                console.log("Compra completa obtenida:", datosCompra);

                // Guardar la compra completa
                setCompraSeleccionada(datosCompra);

                // Formatear los insumos para el formulario
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
                console.error("No se pudo determinar el ID de la compra:", compra);
                showNotification("Error: No se encontró un ID válido", "error");
                return;
            }

            setCompraSeleccionada({ ...compra, id: compraId });
            setModalVisible(true);
        }
    };

    const filtrarCompras = (compras, filtro) => {
        if (!filtro || filtro.trim() === '') {
            return compras;
        }

        const filtroLower = filtro.toLowerCase().trim();
        
        return compras.filter(compra => {
            const proveedorMatch = compra.proveedor?.nombre && compra.proveedor.nombre.toLowerCase().includes(filtroLower);
            const fechaMatch = compra.fechaCompra && compra.fechaCompra.toLowerCase().includes(filtroLower);
            const observacionesMatch = compra.observaciones && compra.observaciones.toLowerCase().includes(filtroLower);
            
            const idMatch = compra.id && compra.id.toString().includes(filtroLower);
            const totalMatch = compra.total && compra.total.toString().includes(filtroLower);
            const subtotalMatch = compra.subtotal && compra.subtotal.toString().includes(filtroLower);
            const ivaMatch = compra.iva && compra.iva.toString().includes(filtroLower);
            
            const totalFormateado = compra.total ? formatoCOP(compra.total) : '';
            const subtotalFormateado = compra.subtotal ? formatoCOP(compra.subtotal) : '';
            const ivaFormateado = compra.iva ? formatoCOP(compra.iva) : '';
            
            const totalFormateadoMatch = totalFormateado.toLowerCase().includes(filtroLower);
            const subtotalFormateadoMatch = subtotalFormateado.toLowerCase().includes(filtroLower);
            const ivaFormateadoMatch = ivaFormateado.toLowerCase().includes(filtroLower);
            
            return proveedorMatch || 
                    fechaMatch || 
                    observacionesMatch ||
                    idMatch || 
                    totalMatch || 
                    subtotalMatch || 
                    ivaMatch ||
                    totalFormateadoMatch ||
                    subtotalFormateadoMatch ||
                    ivaFormateadoMatch;
        });
    };

    const comprasFiltradas = filtrarCompras(compras, filtro)
        .sort((a, b) => {
            const fechaA = new Date(a.fechaCompra || a.fechacompra).getTime();
            const fechaB = new Date(b.fechaCompra || b.fechacompra).getTime();
            return fechaB - fechaA;
        })
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
                    <div className="admin-toolbar" >
                        <button 
                            className="admin-button pink" 
                            onClick={() => abrirModal('agregar')} 
                            type="button"
                            disabled={cargando}
                        >
                            + Agregar
                        </button>

                        <SearchBar 
                            placeholder="Buscar Compras" 
                            value={filtro} 
                            onChange={setFiltro} 
                        />
                    </div>

                    <div className="admin-section-header">
                        <h2 className="admin-tab">Gestión de Compras</h2>

                        <button
                            className="admin-tab"
                            onClick={() => setMostrarAnuladas(prev => !prev)}
                            type="button"
                        >
                            {mostrarAnuladas ? 'Ver Activas' : 'Ver Anuladas'}
                        </button>
                    </div>

                    <DataTable
                        value={comprasFiltradas}
                        className="admin-table"
                        paginator rows={10} rowsPerPageOptions={[5,10,25,50]}
                        rowClassName={rowData => !rowData.estado ? 'fila-anulada' : ''}
                        tableStyle={{ 
                            tableLayout: 'fixed',
                            width: '100%'
                        }}
                    >
                        <Column 
                            header="Nº" 
                            body={(r, { rowIndex }) => rowIndex + 1} 
                            style={{ 
                                width: '60px', 
                                textAlign: 'center',
                                padding: '8px 4px'
                            }} 
                            headerStyle={{
                                width: '60px',
                                textAlign: 'center',
                                padding: '8px 4px'
                            }}
                        />
                        <Column 
                            field="proveedor" 
                            header="Proveedor" 
                            body={rowData => rowData.proveedor?.nombre || 'N/A'}
                            style={{ 
                                width: '25%',
                                textAlign: 'left',
                                padding: '8px'
                            }}
                            headerStyle={{
                                width: '25%',
                                textAlign: 'left',
                                padding: '8px'
                            }}
                        />
                        <Column 
                            field="fechaCompra" 
                            header="Fecha Compra" 
                            body={rowData => {
                                try {
                                    return new Date(rowData.fechaCompra).toLocaleDateString('es-ES');
                                } catch {
                                    return rowData.fechaCompra || 'N/A';
                                }
                            }}
                            style={{ 
                                width: '20%',
                                textAlign: 'center',
                                padding: '8px'
                            }}
                            headerStyle={{
                                width: '20%',
                                textAlign: 'center',
                                padding: '8px'
                            }}
                        />
                        <Column
                            field="total"
                            header="Total"
                            body={(rowData) => formatoCOP(rowData.total)}
                            style={{ 
                                width: '20%',
                                textAlign: 'right',
                                padding: '8px'
                            }}
                            headerStyle={{
                                width: '20%',
                                textAlign: 'right',
                                padding: '8px'
                            }}
                        />
                        <Column
                            header="Acción"
                            body={rowData => (
                                <CompraActions 
                                    compra={rowData}
                                    onVer={() => abrirModal('ver', rowData)}
                                    onAnular={() => abrirModal('anular', rowData)}
                                    onReactivar={() => reactivarCompra(rowData)}
                                    onGenerarPDF={() => generarPDF(rowData)}
                                    cargando={cargando}
                                />
                            )}
                            style={{ 
                                width: '15%',
                                textAlign: 'center',
                                padding: '8px'
                            }}
                            headerStyle={{
                                width: '15%',
                                textAlign: 'center',
                                padding: '8px'
                            }}
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
            
            <style jsx>{`
                .fila-anulada {
                    background-color: #ffebee !important;
                    opacity: 0.7;
                }
                
                .admin-table .p-datatable-header-cell {
                    text-align: center;
                    vertical-align: middle;
                    padding: 12px 8px;
                    font-weight: 600;
                    background-color: #f8f9fa;
                    border-bottom: 2px solid #dee2e6;
                }
                
                .admin-table .p-datatable-tbody > tr > td {
                    vertical-align: middle;
                    padding: 8px;
                    border-bottom: 1px solid #dee2e6;
                }
            `}</style>
        </div>
    );
}