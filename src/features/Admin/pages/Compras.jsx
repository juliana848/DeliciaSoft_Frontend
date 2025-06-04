import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';
import AgregarInsumosModal from '../components/AgregarInsumosModal';

export default function ComprasTable() {
    const [compras, setCompras] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTipo, setModalTipo] = useState(null);
    const [compraSeleccionada, setCompraSeleccionada] = useState(null);
    
    // Estado para notificaciones (reemplaza mensajeExito)
    const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
    
    const [mostrarAgregarCompra, setMostrarAgregarCompra] = useState(false);
    const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);
    const [mostrarModalInsumos, setMostrarModalInsumos] = useState(false);
    const [compraData, setCompraData] = useState({
        cod_compra: '00000000',
        proveedor: '',
        fecha_compra: '',
        fecha_registro: '',
        observaciones: ''
    });

    useEffect(() => {
        const mockCompras = [
            {  cod_compra: 301, proveedor: 'Dis.Martinez', fecha: '10/02/2024', total: '126.000' },
            {  cod_compra: 302, proveedor: 'Dis.Tolu', fecha: '10/02/2024', total: '144.000' },
            {  cod_compra: 303, proveedor: 'Sumi.Express', fecha: '10/02/2024', total: '458.900' },
            {  cod_compra: 304, proveedor: 'Mate.industriales', fecha: '10/02/2024', total: '321.700' },
            {  cod_compra: 305, proveedor: 'Dis.MatFruit', fecha: '10/02/2024', total: '900.100' },
            {  cod_compra: 306, proveedor: 'Desechables J&J', fecha: '10/02/2024', total: '159.000' },
            {  cod_compra: 307, proveedor: 'Dis.Martinez', fecha: '10/02/2024', total: '888.888' },
            {  cod_compra: 308, proveedor: 'Harina la Moderna', fecha: '10/02/2024', total: '20.900' },
            {  cod_compra: 309, proveedor: 'Moldes & utensilios', fecha: '10/02/2024', total: '750.200' },
            {  cod_compra: 310, proveedor: 'Dulces Delicias', fecha: '10/02/2024', total: '631.000' }
        ];
        setCompras(mockCompras);
    }, []);

    // Función para mostrar notificaciones (reemplaza mostrarMensaje)
    const showNotification = (mensaje, tipo = 'success') => {
        setNotification({ visible: true, mensaje, tipo });
    };

    const hideNotification = () => {
        setNotification({ visible: false, mensaje: '', tipo: 'success' });
    };

    const abrirModal = (tipo, compra) => {
        setModalTipo(tipo);
        setCompraSeleccionada(compra);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setCompraSeleccionada(null);
        setModalTipo(null);
    };

    const anularCompra = () => {
        const updated = compras.filter(c => c.id !== compraSeleccionada.id);
        setCompras(updated);
        cerrarModal();
        showNotification('Compra anulada exitosamente');
    };

    const exportarPDF = (compra) => {
        showNotification(`Compra ${compra.cod_compra} exportada como PDF exitosamente`);
    };

    const comprasFiltradas = compras.filter(c =>
        c.proveedor.toLowerCase().includes(filtro.toLowerCase())
    );

    // Funciones para Agregar Compra
    const handleChange = (e) => {
        setCompraData({...compraData, [e.target.name]: e.target.value});
    };

    const agregarInsumos = (nuevosInsumos) => {
        setInsumosSeleccionados(prev => [
            ...prev,
            ...nuevosInsumos.filter(nuevo => !prev.some(i => i.id === nuevo.id))
        ]);
        showNotification('Insumos agregados exitosamente');
    };

    const handleCantidadChange = (id, value) => {
        setInsumosSeleccionados(prev => 
            prev.map(item => 
                item.id === id ? {...item, cantidad: Math.max(1, value)} : item
            )
        );
    };

    const removeInsumo = (id) => {
        setInsumosSeleccionados(prev => prev.filter(item => item.id !== id));
        showNotification('Insumo eliminado de la lista');
    };

    // Validación del formulario
    const validarFormulario = () => {
        const { proveedor, fecha_compra, fecha_registro } = compraData;
        
        if (!proveedor.trim()) {
            showNotification('Debe seleccionar un proveedor', 'error');
            return false;
        }
        if (!fecha_compra) {
            showNotification('La fecha de compra es obligatoria', 'error');
            return false;
        }
        if (!fecha_registro) {
            showNotification('La fecha de registro es obligatoria', 'error');
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
        
        showNotification('Compra guardada exitosamente');
        setMostrarAgregarCompra(false);
        setInsumosSeleccionados([]);
        // Resetear formulario
        setCompraData({
            cod_compra: '00000000',
            proveedor: '',
            fecha_compra: '',
            fecha_registro: '',
            observaciones: ''
        });
    };

    // Calcula los totales
    const subtotal = insumosSeleccionados.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    return (
        <div className="admin-wrapper">
            {/* Componente de notificación */}
            <Notification
                visible={notification.visible}
                mensaje={notification.mensaje}
                tipo={notification.tipo}
                onClose={hideNotification}
            />

            {!mostrarAgregarCompra ? (
                <>
                    <div className="admin-toolbar">
                        <button 
                            className="admin-button pink" 
                            onClick={() => setMostrarAgregarCompra(true)}
                            type="button"
                        >
                            + Agregar Compra
                        </button>
                        <SearchBar 
                            placeholder="Buscar proveedor..." 
                            value={filtro} 
                            onChange={setFiltro} 
                        />
                    </div>

                    <DataTable
                        value={comprasFiltradas}
                        className="admin-table"
                        paginator rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                    >
                        <Column field="id" header="ID" />
                        <Column field="cod_compra" header="Cod_compra" />
                        <Column field="proveedor" header="Proveedor" />
                        <Column field="fecha" header="Fecha" />
                        <Column field="total" header="Total" />
                        <Column
                            header="Acción"
                            body={(rowData) => (
                                <>
                                    <button
                                        className="admin-button gray"
                                        title="Ver Detalle"
                                        onClick={() => abrirModal('ver', rowData)}
                                    >👁️</button>
                                    <button
                                        className="admin-button red"
                                        title="Anular"
                                        onClick={() => abrirModal('anular', rowData)}
                                    >🛑</button>
                                    <button
                                        className="admin-button blue"
                                        title="Exportar PDF"
                                        onClick={() => exportarPDF(rowData)}
                                    >⬇️</button>
                                </>
                            )}
                        />
                    </DataTable>

        
                    {modalTipo === 'ver' && compraSeleccionada && (
                        <Modal visible={modalVisible} onClose={cerrarModal}>
                            <h2 className="modal-title">Detalles de Compra</h2>
                            <div className="modal-body">
                                <p><strong>ID:</strong> {compraSeleccionada.id}</p>
                                <p><strong>Código:</strong> {compraSeleccionada.cod_compra}</p>
                                <p><strong>Proveedor:</strong> {compraSeleccionada.proveedor}</p>
                                <p><strong>Fecha:</strong> {compraSeleccionada.fecha}</p>
                                <p><strong>Total:</strong> {compraSeleccionada.total}</p>
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
                    <h1>Agregar Compra</h1>
                    
                    <div className="compra-header-actions">
                        <button 
                            className="btn-regresar"
                            onClick={() => {
                                setMostrarAgregarCompra(false);
                                setInsumosSeleccionados([]);
                                setCompraData({
                                    cod_compra: '00000000',
                                    proveedor: '',
                                    fecha_compra: '',
                                    fecha_registro: '',
                                    observaciones: ''
                                });
                            }}
                        >
                            Regresar
                        </button>
                        <button 
                            className="btn-guardar"
                            onClick={guardarCompra}
                        >
                            Guardar
                        </button>
                    </div>
                    
                    <div className="compra-fields-grid">
                        <div className="field-group">
                            <label>Cod_Compra:</label>
                            <input 
                                type="text" 
                                name="cod_compra"
                                value={compraData.cod_compra} 
                                onChange={handleChange}
                                disabled
                            />
                        </div>
                        
                        <div className="field-group">
                            <label>Proveedor:</label>
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
                            <label>Fecha de compra</label>
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
                            />
                        </div>
                    </div>
                    
                    <div className="section-divider"></div>
                    
                    <div className="detalle-section">
                        <h2>Detalle:</h2>
                        
                        <table className="compra-detalle-table">
                            <thead>
                                <tr>
                                    <th>Id_Producto</th>
                                    <th>Cantidad</th>
                                    <th>Unidad_Medida</th>
                                    <th>Nombre Producto</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {insumosSeleccionados.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
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
                    
                    <div className="observaciones-section">
                        <h2>Observaciones</h2>
                        <textarea
                            name="observaciones"
                            value={compraData.observaciones}
                            onChange={handleChange}
                            className="observaciones-field"
                        ></textarea>
                    </div>
                    
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