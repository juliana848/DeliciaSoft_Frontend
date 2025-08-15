import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';
import AgregarInsumosModal from '../components/AgregarInsumosModal';
import { generarPDFCompra, configurarEmpresa } from './pdf';
import { XCircle } from 'lucide-react';

export default function ComprasTable() {
    const [compras, setCompras] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTipo, setModalTipo] = useState(null);
    const [compraSeleccionada, setCompraSeleccionada] = useState(null);
    const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
    const [mostrarAgregarCompra, setMostrarAgregarCompra] = useState(false);
    const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);
    const [mostrarModalInsumos, setMostrarModalInsumos] = useState(false);
    const [mostrarAnuladas, setMostrarAnuladas] = useState(false);
    
    const [errores, setErrores] = useState({
        proveedor: '',
        fecha_compra: '',
        insumos: ''
    });

    const formatoCOP = (valor) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    };

    const generarPDF = async (compra) => {
        try {
            if (!compra.insumos || compra.insumos.length === 0) {
                setNotification({
                    visible: true,
                    mensaje: 'No se puede generar PDF: La compra no tiene insumos registrados',
                    tipo: 'error'
                });
                return;
            }
            const datosCompra = {
                id: compra.id,
                proveedor: compra.proveedor,
                fecha_compra: compra.fecha_compra || compra.fecha,
                fecha_registro: compra.fecha_registro || new Date().toISOString().split('T')[0],
                observaciones: compra.observaciones || '',
                insumos: compra.insumos
            };

            await generarPDFCompra(datosCompra);

            setNotification({
                visible: true,
                mensaje: 'PDF generado exitosamente',
                tipo: 'success'
            });

        } catch (error) {
            console.error('Error al generar PDF:', error);
            setNotification({
                visible: true,
                mensaje: 'Error al generar el PDF: ' + error.message,
                tipo: 'error'
            });
        }
    };

    const obtenerFechaActual = () => new Date().toISOString().split('T')[0];

    const [compraData, setCompraData] = useState({
        proveedor: '',
        fecha_compra: '',
        fecha_registro: obtenerFechaActual(),
        observaciones: ''
    });

    useEffect(() => {
        const mockCompras = [
            {  
                id: 1, 
                proveedor: 'Dis.Martinez', 
                fecha: '10/02/2024', 
                total: 126000,
                fecha_compra: '2024-02-10',
                fecha_registro: '2024-02-11',
                observaciones: 'Pago contado',
                subtotal: 108621,
                iva: 17379,
                estado: 'activa',
                insumos: [
                    { id: 1, nombre: 'Harina', unidad: 'kg', cantidad: 5, precio: 10000 },
                    { id: 2, nombre: 'Azúcar', unidad: 'kg', cantidad: 2, precio: 8000 }
                ]
            },
            {  
                id: 2, 
                proveedor: 'Dis.Tolu', 
                fecha: '10/02/2024', 
                total: 144000,
                fecha_compra: '2024-02-10',
                fecha_registro: '2024-02-11',
                observaciones: 'Transferencia',
                subtotal: 124137,
                iva: 19863,
                estado: 'activa',
                insumos: [
                    { id: 3, nombre: 'Leche', unidad: 'litros', cantidad: 10, precio: 5000 },
                    { id: 4, nombre: 'Huevos', unidad: 'docena', cantidad: 3, precio: 12000 }
                ]
            },
            {  
                id: 3, 
                proveedor: 'Sumi.Express', 
                fecha: '10/02/2024', 
                total: 458900,
                fecha_compra: '2024-02-10',
                fecha_registro: '2024-02-11',
                observaciones: '',
                subtotal: 395603,
                iva: 63297,
                estado: 'activa',
                insumos: [
                    { id: 5, nombre: 'Mantequilla', unidad: 'kg', cantidad: 4, precio: 15000 },
                    { id: 6, nombre: 'Chocolate', unidad: 'kg', cantidad: 3, precio: 20000 }
                ]
            },
            {  
                id: 4, 
                proveedor: 'Mate.industriales', 
                fecha: '10/02/2024', 
                total: 321700,
                fecha_compra: '2024-02-10',
                fecha_registro: '2024-02-11',
                observaciones: 'Pago parcial',
                subtotal: 277327,
                iva: 44373,
                estado: 'activa',
                insumos: [
                    { id: 7, nombre: 'Molde aluminio', unidad: 'unidad', cantidad: 10, precio: 2500 },
                    { id: 8, nombre: 'Espátula', unidad: 'unidad', cantidad: 5, precio: 4000 }
                ]
            }
        ];
        setCompras(mockCompras);
    }, []);

    const showNotification = (mensaje, tipo = 'success') => {
        setNotification({ visible: true, mensaje, tipo });
    };
    
    const hideNotification = () => setNotification({ visible: false, mensaje: '', tipo: 'success' });

    const validarFecha = (fecha) => {
        if (!fecha) return 'La fecha de compra es obligatoria';
        const fechaCompra = new Date(fecha);
        const fechaActual = new Date();
        fechaActual.setHours(23, 59, 59, 999); 
        
        if (fechaCompra > fechaActual) {
            return 'La fecha de compra no puede ser mayor al día presente';
        }
        return '';
    };

    const validarProveedor = (proveedor) => {
        if (!proveedor.trim()) return 'Debe seleccionar un proveedor';
        return '';
    };

    const validarInsumos = (insumos) => {
        if (insumos.length === 0) return 'Debe agregar al menos un insumo';
        return '';
    };

    const abrirModal = (tipo, compra = null) => {
        setModalTipo(tipo);
        setCompraSeleccionada(compra);
        
        if (tipo === 'ver') {
            setCompraData({
                proveedor: compra.proveedor,
                fecha_compra: compra.fecha_compra,
                fecha_registro: compra.fecha_registro,
                observaciones: compra.observaciones || ''
            });
            setInsumosSeleccionados(compra.insumos || []);
            setMostrarAgregarCompra(true);
        } else if (tipo === 'agregar') {
            setCompraData({
                proveedor: '',
                fecha_compra: '',
                fecha_registro: obtenerFechaActual(),
                observaciones: ''
            });
            setInsumosSeleccionados([]);
            setErrores({
                proveedor: '',
                fecha_compra: '',
                insumos: ''
            });
            setMostrarAgregarCompra(true);
        } else if (tipo === 'anular') {
            setModalVisible(true);
        }
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setModalTipo(null);
        setCompraSeleccionada(null);
    };

    const cancelarFormulario = () => {
        setMostrarAgregarCompra(false);
        setCompraSeleccionada(null);
        setModalTipo(null);
        setInsumosSeleccionados([]);
        setCompraData({
            proveedor: '',
            fecha_compra: '',
            fecha_registro: obtenerFechaActual(),
            observaciones: ''
        });
        setErrores({
            proveedor: '',
            fecha_compra: '',
            insumos: ''
        });
    };

    const anularCompra = () => {
        setCompras(prev =>
            prev.map(c => (c.id === compraSeleccionada.id ? { ...c, estado: 'anulada' } : c))
        );
        cerrarModal();
        showNotification('Compra anulada exitosamente');
    };

    const exportarPDF = compra => {
        showNotification(`Compra ${compra.cod_compra} exportada como PDF exitosamente`);
    };

    // FUNCIÓN DE FILTRADO MEJORADA - BUSCA EN TODOS LOS CAMPOS VISIBLES
    const filtrarCompras = (compras, filtro) => {
        if (!filtro || filtro.trim() === '') {
            return compras;
        }

        const filtroLower = filtro.toLowerCase().trim();
        
        return compras.filter(compra => {
            const proveedorMatch = compra.proveedor && compra.proveedor.toLowerCase().includes(filtroLower);
            const fechaMatch = compra.fecha && compra.fecha.toLowerCase().includes(filtroLower);
            const observacionesMatch = compra.observaciones && compra.observaciones.toLowerCase().includes(filtroLower);
            const estadoMatch = compra.estado && compra.estado.toLowerCase().includes(filtroLower);
            
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
            
            let insumosMatch = false;
            if (compra.insumos && compra.insumos.length > 0) {
                insumosMatch = compra.insumos.some(insumo => {
                    const nombreInsumo = insumo.nombre && insumo.nombre.toLowerCase().includes(filtroLower);
                    const unidadInsumo = insumo.unidad && insumo.unidad.toLowerCase().includes(filtroLower);
                    const cantidadInsumo = insumo.cantidad && insumo.cantidad.toString().includes(filtroLower);
                    const precioInsumo = insumo.precio && insumo.precio.toString().includes(filtroLower);
                    const precioFormateadoInsumo = insumo.precio ? formatoCOP(insumo.precio) : '';
                    const precioFormateadoMatch = precioFormateadoInsumo.toLowerCase().includes(filtroLower);
                    
                    return nombreInsumo || unidadInsumo || cantidadInsumo || precioInsumo || precioFormateadoMatch;
                });
            }
            
            let fechaFormateadaMatch = false;
            if (compra.fecha_compra) {
                try {
                    const fecha = new Date(compra.fecha_compra);
                    const fechaTexto = fecha.toLocaleDateString('es-ES');
                    fechaFormateadaMatch = fechaTexto.toLowerCase().includes(filtroLower);
                } catch (error) {
                    console.error('Error al formatear fecha:', error);
                }
            }
            
            return proveedorMatch || 
                    fechaMatch || 
                    observacionesMatch || 
                    estadoMatch ||
                    idMatch || 
                    totalMatch || 
                    subtotalMatch || 
                    ivaMatch ||
                    totalFormateadoMatch ||
                    subtotalFormateadoMatch ||
                    ivaFormateadoMatch ||
                    insumosMatch ||
                    fechaFormateadaMatch;
        });
    };

    // APLICAR FILTROS
    const comprasFiltradas = filtrarCompras(compras, filtro).filter(c =>
        mostrarAnuladas ? c.estado === 'anulada' : c.estado !== 'anulada'
    );

    const handleChange = e => {
        const { name, value } = e.target;
        setCompraData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'proveedor') {
            setErrores(prev => ({ ...prev, proveedor: validarProveedor(value) }));
        } else if (name === 'fecha_compra') {
            setErrores(prev => ({ ...prev, fecha_compra: validarFecha(value) }));
        }
    };

    const agregarInsumos = nuevos => {
        const nuevosInsumos = [
            ...insumosSeleccionados,
            ...nuevos.filter(n => !insumosSeleccionados.some(i => i.id === n.id))
        ];
        setInsumosSeleccionados(nuevosInsumos);
        setErrores(prev => ({ ...prev, insumos: validarInsumos(nuevosInsumos) }));
        showNotification('Insumos agregados exitosamente');
    };

    const handleCantidadChange = (id, value) => {
        setInsumosSeleccionados(prev =>
            prev.map(item => (item.id === id ? { ...item, cantidad: Math.max(1, value) } : item))
        );
    };

    const removeInsumo = id => {
        const nuevosInsumos = insumosSeleccionados.filter(item => item.id !== id);
        setInsumosSeleccionados(nuevosInsumos);
        setErrores(prev => ({ ...prev, insumos: validarInsumos(nuevosInsumos) }));
        showNotification('Insumo eliminado de la lista');
    };

    const validarFormulario = () => {
        const errorProveedor = validarProveedor(compraData.proveedor);
        const errorFecha = validarFecha(compraData.fecha_compra);
        const errorInsumos = validarInsumos(insumosSeleccionados);
        
        setErrores({
            proveedor: errorProveedor,
            fecha_compra: errorFecha,
            insumos: errorInsumos
        });
        
        if (errorProveedor) {
            showNotification(errorProveedor, 'error');
            return false;
        }
        if (errorFecha) {
            showNotification(errorFecha, 'error');
            return false;
        }
        if (errorInsumos) {
            showNotification(errorInsumos, 'error');
            return false;
        }
        return true;
    };

    const guardarCompra = () => {
        if (!validarFormulario()) return;
        const subtotal = insumosSeleccionados.reduce((s, i) => s + i.precio * i.cantidad, 0);
        const iva = subtotal * 0.16;
        const total = subtotal + iva;
        const nuevaCompra = {
            id: compras.length + 1,
            proveedor: compraData.proveedor,
            fecha: compraData.fecha_compra,
            fecha_compra: compraData.fecha_compra,
            fecha_registro: obtenerFechaActual(),
            observaciones: compraData.observaciones,
            insumos: insumosSeleccionados,
            subtotal,
            iva,
            total,
            estado: 'activa'
        };
        setCompras(prev => [...prev, nuevaCompra]);
        showNotification('Compra guardada exitosamente');
        cancelarFormulario();
    };

    const subtotal = insumosSeleccionados.reduce((s, i) => s + i.precio * i.cantidad, 0);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    return (
        <div className="admin-wrapper">
        <Notification visible={notification.visible} mensaje={notification.mensaje} tipo={notification.tipo} onClose={hideNotification} />

        {!mostrarAgregarCompra ? (
            <>
            <div className="admin-toolbar" >
                <button 
                    className="admin-button pink" 
                    onClick={() => abrirModal('agregar')} 
                    type="button"
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
            <h2 className="admin-tab">Compras</h2>

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
                rowClassName={rowData => rowData.estado === 'anulada' ? 'fila-anulada' : ''}
            >
                <Column header="N°" body={(r, { rowIndex }) => rowIndex + 1} style={{ width: '3rem', textAlign: 'center' }} />
                <Column field="proveedor" header="Proveedor" />
                <Column field="fecha" header="Fecha Compra" />
                <Column
                    field="total"
                    header="Total"
                    body={(rowData) => formatoCOP(rowData.total)}
                />
                <Column
                header="Acción"
                body={rowData => {
                    if (rowData.estado === 'anulada') return <span style={{ color: 'gray' }}>Anulada</span>;
                    return (
                    <>
                        <button className="admin-button gray" title="Visualizar" onClick={() => abrirModal('ver', rowData)}>🔍</button>
                        <button
                            className="admin-button red"
                            title="Anular"
                            onClick={() => abrirModal('anular', rowData)}
                            >
                            🛑
                            </button>
                        <button 
                            className="admin-button blue" 
                            title="Descargar PDF" 
                            onClick={() => generarPDF(rowData)}  
                        >
                            <i className="fas fa-download" style={{ marginRight: '5px' }}></i>
                        </button>
                    </>
                    );
                }}
                />
            </DataTable>

            {modalTipo === 'anular' && compraSeleccionada && (
                <Modal visible={modalVisible} onClose={cerrarModal}>
                <h2 className="modal-title">Confirmar Anulación</h2>
                <div className="modal-body">
                    <p>¿Seguro que deseas anular la compra <strong>{compraSeleccionada.cod_compra}</strong> del proveedor <strong>{compraSeleccionada.proveedor}</strong>?</p>
                </div>
                <div className="modal-footer">
                    <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
                    <button className="modal-btn save-btn" onClick={anularCompra}>Anular</button>
                </div>
                </Modal>
            )}
            </>
        ) : (
                <div className="compra-form-container">
                    <div className="compra-header-actions" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '1rem'
                    }}>
                    </div>
                    
                    <div className="compra-fields-grid">
                        <div className="field-group">
                            <label>Proveedor*</label>
                            <select
                                name="proveedor"
                                value={compraData.proveedor}
                                onChange={handleChange}
                                disabled={modalTipo === 'ver'}
                                style={{ borderColor: errores.proveedor ? 'red' : '' }}
                            >
                                <option value="">---</option>
                                <option value="Dis.Martinez">Dis.Martinez</option>
                                <option value="Dis.Tolu">Dis.Tolu</option>
                                <option value="Sumi.Express">Sumi.Express</option>
                                <option value="Mate.industriales">Mate.industriales</option>
                                <option value="Dis.MatFruit">Dis.MatFruit</option>
                                <option value="Desechables J&J">Desechables J&J</option>
                                <option value="Harina la Moderna">Harina la Moderna</option>
                                <option value="Moldes & utensilios">Moldes & utensilios</option>
                                <option value="Dulces Delicias">Dulces Delicias</option>
                            </select>
                            {errores.proveedor && (
                                <small style={{ color: 'red', fontSize: '12px' }}>
                                    {errores.proveedor}
                                </small>
                            )}
                        </div>
                        
                        <div className="field-group">
                            <label>Fecha de compra*</label>
                            <input
                                type="date"
                                name="fecha_compra"
                                value={compraData.fecha_compra}
                                onChange={handleChange}
                                disabled={modalTipo === 'ver'}
                                max={obtenerFechaActual()}
                                style={{ borderColor: errores.fecha_compra ? 'red' : '' }}
                            />
                            {errores.fecha_compra && (
                                <small style={{ color: 'red', fontSize: '12px' }}>
                                    {errores.fecha_compra}
                                </small>
                            )}
                        </div>
                        
                        <div className="field-group">
                            <label>Fecha de registro</label>
                            <input
                                type="date"
                                name="fecha_registro"
                                value={compraData.fecha_registro}
                                onChange={handleChange}
                                disabled
                            />
                        </div>
                    </div>
                    
                    <div className="section-divider"></div>
                    
                    <div className="detalle-section">
                        <h2>Detalle*</h2>
                        {errores.insumos && (
                            <small style={{ color: 'red', fontSize: '12px', display: 'block', marginBottom: '10px' }}>
                                {errores.insumos}
                            </small>
                        )}
                                                
                        <table className="compra-detalle-table">
                            <thead className="p-datatable-thead">
                                <tr>
                                    <th>Nombre Producto</th>
                                    <th>Cantidad</th>
                                    <th>Unidad_Medida</th>
                                    <th>Precio unitario</th>
                                    <th>Subtotal</th> 
                                    {modalTipo !== 'ver' && <th>Acción</th>}
                                </tr>
                            </thead>
                            <tbody className="p-datatable">
                                {insumosSeleccionados.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.nombre}</td>
                                    <td>
                                        {modalTipo === 'ver' ? 
                                        (
                                            item.cantidad
                                        ) : (
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.cantidad}
                                                onChange={(e) =>
                                                handleCantidadChange(item.id, parseInt(e.target.value))
                                                }
                                            />
                                        )}
                                    </td>
                                    <td>{item.unidad}</td>
                                    <td>{formatoCOP(item.precio)}</td>
                                    <td>
                                        {formatoCOP((item.cantidad || 0) * (item.precio || 0))}
                                    </td>
                                    {modalTipo !== 'ver' && (
                                        <td>
                                            <button
                                                className="btn-eliminar"
                                                onClick={() => removeInsumo(item.id)}
                                            >

                                                🗑️
                                            </button>
                                        </td>
                                    )}
                                </tr>
                                ))}
                            </tbody>
                        </table>

                        {modalTipo !== 'ver' && (
                            <button 
                                className="btn-agregar-insumos"
                                onClick={() => setMostrarModalInsumos(true)}
                            >
                                + Agregar Insumos
                            </button>
                        )}
                    </div>
                    
                    <div className="section-divider"></div>
                    
                    <div className="compra-totales-grid">
                        <div className="total-item">
                            <span>Subtotal:</span>
                            <span>{formatoCOP(subtotal)}</span>
                        </div>
                        <div className="total-item">
                            <span>IVA (16%):</span>
                            <span>{formatoCOP(iva)}</span>
                        </div>
                        <div className="total-item">
                            <span>Total:</span>
                            <span>{formatoCOP(total)}</span>
                        </div>
                    </div>

                    <div className="compra-header-actions"
                        style={{
                            marginTop: '1rem',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '0.5rem'
                        }}>
                        <button 
                            className="modal-btn cancel-btn"
                            onClick={cancelarFormulario}
                        >
                            {modalTipo === 'ver' ? 'Cerrar' : 'Cancelar'}
                        </button>
                        {modalTipo !== 'ver' && (
                            <button 
                                className="modal-btn save-btn"
                                onClick={guardarCompra}
                            >
                                Guardar
                            </button>
                        )}
                    </div>
                    
                    {mostrarModalInsumos && modalTipo !== 'ver' && (
                        <AgregarInsumosModal
                            onClose={() => setMostrarModalInsumos(false)}
                            onAgregar={agregarInsumos}
                        />
                    )}

                    {modalTipo === 'anular' && compraSeleccionada && modalVisible && (
                        <Modal visible={modalVisible} onClose={() => {
                            cerrarModal();
                            setModalTipo('ver');
                        }}>
                        <h2 className="modal-title">Confirmar Anulación</h2>
                        <div className="modal-body">
                            <p>¿Seguro que deseas anular la compra del proveedor <strong>{compraSeleccionada.proveedor}</strong>?</p>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn cancel-btn" onClick={() => {
                                cerrarModal();
                                setModalTipo('ver'); 
                            }}>Cancelar</button>
                            <button className="modal-btn save-btn" onClick={() => {
                                anularCompra();
                                cancelarFormulario(); 
                            }}>Anular</button>
                        </div>
                        </Modal>
                    )}
                </div>
            )}
        </div>
    );
}