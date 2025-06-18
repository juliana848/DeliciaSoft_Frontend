import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';
import AgregarInsumosModal from '../components/AgregarInsumosModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import logo from '../../../../public/imagenes/logo-delicias-darsy.png'; 


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




const generarPDF = (compra) => {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(16);
  doc.text('Detalle de Compra de Insumos', 20, 20);

  // Proveedor y fecha
  doc.setFontSize(12);
  doc.text(`Proveedor: ${compra.proveedor}`, 20, 30);
  doc.text(`Fecha: ${compra.fecha}`, 20, 36);

  // Tabla de insumos con colores rosados
  autoTable(doc, {
    head: [['Nombre del insumo', 'Cantidad', 'Precio unitario', 'Subtotal']],
    body: compra.insumos.map(insumo => [
      insumo.nombre,
      insumo.cantidad,
      `$${insumo.precio.toFixed(2)}`,
      `$${(insumo.cantidad * insumo.precio).toFixed(2)}`
    ]),
    startY: 45,
    styles: {
      fillColor: [255, 228, 225], // Rosado claro (para filas)
      textColor: 0,
    },
    headStyles: {
      fillColor: [255, 105, 180], // Rosa fuerte (para encabezado)
      textColor: 255,
      halign: 'center',
    },
  });

  // Total al final
  const total = compra.insumos.reduce(
    (sum, insumo) => sum + insumo.cantidad * insumo.precio,
    0
  );
  doc.text(`Total: $${total.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 10);

  // Guardar PDF
  doc.save(`compra-${compra.id}.pdf`);
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
                id:1, 
                proveedor: 'Dis.Martinez', 
                fecha: '10/02/2024', 
                total: 126000,
                fecha_compra: '10/02/2024',
                fecha_registro: '11/02/2024',
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
                id:2, 
                proveedor: 'Dis.Tolu', 
                fecha: '10/02/2024', 
                total: 144000,
                fecha_compra: '10/02/2024',
                fecha_registro: '11/02/2024',
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
                id:3, 
                proveedor: 'Sumi.Express', 
                fecha: '10/02/2024', 
                total: 458900,
                fecha_compra: '10/02/2024',
                fecha_registro: '11/02/2024',
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
                id:4, 
                proveedor: 'Mate.industriales', 
                fecha: '10/02/2024', 
                total: 321700,
                fecha_compra: '10/02/2024',
                fecha_registro: '11/02/2024',
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

    const abrirModal = (tipo, compra) => {
        setModalTipo(tipo);
        setCompraSeleccionada(compra);
        setModalVisible(true);
    };
    const cerrarModal = () => {
        setModalVisible(false);
        setModalTipo(null);
        setCompraSeleccionada(null);
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

    const comprasFiltradas = compras.filter(c =>
    c.proveedor.toLowerCase().includes(filtro.toLowerCase()) &&
    (mostrarAnuladas ? c.estado === 'anulada' : c.estado !== 'anulada')
    );


    const handleChange = e =>
        setCompraData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const agregarInsumos = nuevos => {
        setInsumosSeleccionados(prev => [
        ...prev,
        ...nuevos.filter(n => !prev.some(i => i.id === n.id))
        ]);
        showNotification('Insumos agregados exitosamente');
    };
    const handleCantidadChange = (id, value) => {
        setInsumosSeleccionados(prev =>
        prev.map(item => (item.id === id ? { ...item, cantidad: Math.max(1, value) } : item))
        );
    };
    const removeInsumo = id => {
        setInsumosSeleccionados(prev => prev.filter(item => item.id !== id));
        showNotification('Insumo eliminado de la lista');
    };

    const validarFormulario = () => {
        const { proveedor, fecha_compra } = compraData;
        if (!proveedor.trim()) {
        showNotification('Debe seleccionar un proveedor', 'error');
        return false;
        }
        if (!fecha_compra) {
        showNotification('La fecha de compra es obligatoria', 'error');
        return false;
        }
        if (insumosSeleccionados.length === 0) {
        showNotification('Debe agregar al menos un insumo', 'error');
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
    setMostrarAgregarCompra(false);
    setInsumosSeleccionados([]);
    setCompraData({
        proveedor: '',
        fecha_compra: '',
        fecha_registro: obtenerFechaActual(),
        observaciones: ''
        });
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
                {/* BOTÓN DE AGREGAR COMPRA */}
                <button 
                    className="admin-button pink" 
                    onClick={() => { 
                        setMostrarAgregarCompra(true); 
                        setCompraData(prev => ({ ...prev, fecha_registro: obtenerFechaActual() })); 
                    }} 
                    type="button"
                >
                    + Agregar
                </button>


                <SearchBar 
                    placeholder="Buscar Compra..." 
                    value={filtro} 
                    onChange={setFiltro} 
                />
            </div>


            <h2 className="admin-section-title">Compras</h2>
            <DataTable
                value={comprasFiltradas}
                className="admin-table"
                paginator rows={10} rowsPerPageOptions={[5,10,25,50]}
                rowClassName={rowData => rowData.estado === 'anulada' ? 'fila-anulada' : ''}
            >
                <Column header="N°" headerStyle={{ paddingLeft: '1rem' }} body={(r, { rowIndex }) => rowIndex + 1} style={{ width: '3rem', textAlign: 'center' }} />
                <Column field="proveedor" header="Proveedor" headerStyle={{ paddingLeft: '7rem' }}/>
                <Column field="fecha" header="Fecha Compra" headerStyle={{ paddingLeft: '5rem' }}/>
                <Column field="total" header="Total" headerStyle={{ paddingLeft: '2rem' }} />
                <Column
                header="Acción"
                headerStyle={{ paddingLeft: '5rem' }}
                body={rowData => {
                    if (rowData.estado === 'anulada') return <span style={{ color: 'gray' }}>Anulada</span>;
                    return (
                    <>
                        <button className="admin-button gray" title="Visualizar" onClick={() => abrirModal('ver', rowData)}>🔍</button>
                        <button className="admin-button red" title="Anular" onClick={() => abrirModal('anular', rowData)}>🛑</button>
                        {/* <button className="admin-button blue" title="Exportar PDF" onClick={() => exportarPDF(rowData)}>⬇️</button> */}
                        <button 
                        className="admin-button blue" 
                        title="Descargar PDF" 
                        onClick={() => generarPDF(rowData)}  // ✅ rowData contiene la compra actual
                    >
                        <i className="fas fa-download" style={{ marginRight: '5px' }}></i>
                    </button>


                    </>
                    );
                }}
                />
                
            </DataTable>
            
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button 
                className="modal-btn cancel-btn" 
                onClick={() => setMostrarAnuladas(prev => !prev)} 
                type="button"
            >
                {mostrarAnuladas ? 'Ver Activas' : 'Ver Anuladas'}
            </button>
            </div>


            {modalTipo === 'ver' && compraSeleccionada && (
                <Modal visible={modalVisible} onClose={cerrarModal}>
                <h2 className="modal-title">Detalles de Compra</h2>
                <div className="modal-body">
                    <p><strong>Proveedor:</strong> {compraSeleccionada.proveedor}</p>
                    <p><strong>Fecha Compra:</strong> {compraSeleccionada.fecha}</p>
                    <p><strong>Insumos:</strong> {compraSeleccionada.insumos.map(i => i.nombre).join(', ')}</p>
                    <p><strong>Total:</strong> {compraSeleccionada.total}</p>
                    <p><strong>Estado:</strong> {compraSeleccionada.estado === 'anulada' ? 'Desactivada' : 'Activa'}</p>
                </div>
                <div className="modal-footer">
                    <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cerrar</button>
                </div>
                </Modal>
            )}

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
                    <h1>Agregar</h1>
                    
                    <div className="compra-fields-grid">
                        {/* <div className="field-group">
                            <label>Cod_Compra:</label>
                            <input 
                                type="text" 
                                name="cod_compra"
                                value={compraData.cod_compra || ''} 
                                onChange={handleChange}
                                disabled
                            />
                        </div> */}
                        
                        <div className="field-group">
                            <label>Proveedor*</label>
                            <select
                                name="proveedor"
                                value={compraData.proveedor}
                                onChange={handleChange}
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
                        </div>
                        
                        <div className="field-group">
                            <label>Fecha de compra*</label>
                            <input
                                type="date"
                                name="fecha_compra"
                                value={compraData.fecha_compra}
                                onChange={handleChange}
                            />
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
                        
                        <table className="compra-detalle-table">
                            <thead class="p-datatable-thead">
                                <tr>
                                    <th>Cantidad</th>
                                    <th>Unidad_Medida</th>
                                    <th>Nombre Producto</th>
                                    <th>Precio unitario</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody  class="p-datatable">
                                {insumosSeleccionados.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.cantidad}
                                                onChange={(e) => handleCantidadChange(item.id, parseInt(e.target.value))}
                                            />
                                        </td>
                                        <td>{item.unidad}</td>
                                        <td>{item.nombre}</td>
                                        <td>${item.precio?.toFixed(2)}</td>
                                        <td>
                                            <button 
                                                className="btn-eliminar"
                                                onClick={() => removeInsumo(item.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <button 
                            className="btn-agregar-insumos"
                            onClick={() => setMostrarModalInsumos(true)}
                        >
                            + Agregar Insumos
                        </button>


                    </div>
                    
                    <div className="section-divider"></div>
                    
                    {/* <div className="observaciones-section">
                        <h2>Observaciones</h2>
                        <textarea
                            name="observaciones"
                            value={compraData.observaciones}
                            onChange={handleChange}
                            className="observaciones-field"
                        ></textarea>
                    </div> */}
                    
                    <div className="compra-totales-grid">
                        <div className="total-item">
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="total-item">
                            <span>IVA:</span>
                            <span>${iva.toFixed(2)}</span>
                        </div>
                        <div className="total-item">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Botones abajo */}
                    <div className="compra-header-actions"
                        style={{
                            marginTop: '1rem',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '0.5rem' // Espacio entre botones
                        }}>
                        <button 
                            className="modal-btn cancel-btn"
                            onClick={() => {
                                setMostrarAgregarCompra(false);
                                setInsumosSeleccionados([]);
                                setCompraData({
                                    proveedor: '',
                                    fecha_compra: '',
                                    fecha_registro: obtenerFechaActual(),
                                    
                                });
                            }}
                        >
                            Cancelar
                        </button>
                        <button 
                            className="modal-btn save-btn"
                            onClick={guardarCompra}
                        >
                            Guardar
                        </button>
                    </div>
                    
                    {mostrarModalInsumos && (
                        <AgregarInsumosModal
                            onClose={() => setMostrarModalInsumos(false)}
                            onAgregar={agregarInsumos}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

    