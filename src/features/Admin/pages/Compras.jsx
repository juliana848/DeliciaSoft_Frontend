import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import SuccessMessage from '../components/SuccessMessage';
import AgregarInsumosModal from '../components/AgregarInsumosModal';

export default function ComprasTable() {
    // Estados existentes de tu CRUD
    const [compras, setCompras] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTipo, setModalTipo] = useState(null);
    const [compraSeleccionada, setCompraSeleccionada] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');
    
    // Estados para Agregar Compra
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
            { id: 401, cod_compra: 301, proveedor: 'Dis.Martinez', fecha: '10/02/2024', total: '126.000' },
            { id: 402, cod_compra: 302, proveedor: 'Dis.Tolu', fecha: '10/02/2024', total: '144.000' },
            { id: 403, cod_compra: 303, proveedor: 'Sumi.Express', fecha: '10/02/2024', total: '458.900' },
            { id: 404, cod_compra: 304, proveedor: 'Mate.industriales', fecha: '10/02/2024', total: '321.700' },
            { id: 405, cod_compra: 305, proveedor: 'Dis.MatFruit', fecha: '10/02/2024', total: '900.100' },
            { id: 406, cod_compra: 306, proveedor: 'Desechables J&J', fecha: '10/02/2024', total: '159.000' },
            { id: 407, cod_compra: 307, proveedor: 'Dis.Martinez', fecha: '10/02/2024', total: '888.888' },
            { id: 408, cod_compra: 308, proveedor: 'Harina la Moderna', fecha: '10/02/2024', total: '20.900' },
            { id: 409, cod_compra: 309, proveedor: 'Moldes & utensilios', fecha: '10/02/2024', total: '750.200' },
            { id: 410, cod_compra: 310, proveedor: 'Dulces Delicias', fecha: '10/02/2024', total: '631.000' }
        ];
        setCompras(mockCompras);
    }, []);

    // Funciones existentes de tu CRUD
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

    const mostrarMensaje = (mensaje) => {
        setMensajeExito(mensaje);
        setTimeout(() => setMensajeExito(''), 3000);
    };

    const anularCompra = () => {
        const updated = compras.filter(c => c.id !== compraSeleccionada.id);
        setCompras(updated);
        cerrarModal();
        mostrarMensaje('Compra anulada con éxito');
    };

    const exportarPDF = (compra) => {
        mostrarMensaje(`Compra ${compra.cod_compra} exportada como PDF`);
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
    };

    const guardarCompra = () => {
        mostrarMensaje('Compra guardada con éxito');
        setMostrarAgregarCompra(false);
        setInsumosSeleccionados([]);
    };

    // Calcula los totales
    const subtotal = insumosSeleccionados.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    return (
        <div className="admin-wrapper">
            {!mostrarAgregarCompra ? (
                <>
                    <div className="admin-header">
                        <h2>Listado de Compras</h2>
                        <button 
                            className="admin-button pink" 
                            onClick={() => setMostrarAgregarCompra(true)}
                        >
                            + Agregar Compra
                        </button>
                    </div>

                    <div className="admin-toolbar">
                        <SearchBar placeholder="Buscar proveedor..." value={filtro} onChange={setFiltro} />
                    </div>

                    <SuccessMessage mensaje={mensajeExito} />

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

                    {/* Modales existentes de tu CRUD */}
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
                            }}
                        >
                            Regresar
                        </button>
                        <button 
                            className="btn-guardar"
                            onClick={guardarCompra}
                            disabled={insumosSeleccionados.length === 0}
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
                                {/* Opciones de proveedores */}
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
                    
                    <SuccessMessage mensaje={mensajeExito} />
                    
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