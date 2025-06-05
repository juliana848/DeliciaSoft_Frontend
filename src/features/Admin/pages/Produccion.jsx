import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';

export default function Produccion() {
    const [procesos, setProcesos] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTipo, setModalTipo] = useState(null);
    const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);
    const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
    const [mostrarAgregarProceso, setMostrarAgregarProceso] = useState(false);
    const [mostrarModalProductos, setMostrarModalProductos] = useState(false);
    const [mostrarDetalleInsumos, setMostrarDetalleInsumos] = useState(false);
    const [productoDetalleInsumos, setProductoDetalleInsumos] = useState(null);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);

    // Estados para el formulario de producción
    const [procesoData, setProcesoData] = useState({
        nombreProduccion: '',
        fechaCreacion: '',
        fechaEntrega: '',
        estadoProduccion: 'Pendiente 🟡',
        estadoPedido: 'Pendiente 🟡',
        numeroPedido: ''
    });

    // Mock de productos disponibles
    const productosDisponibles = [
        {
            id: 1,
            nombre: 'Mini Donas',
            imagen: 'https://via.placeholder.com/50',
            insumos: [
                { cantidad: 2, unidad: 'kg', nombre: 'Harina' },
                { cantidad: 1, unidad: 'kg', nombre: 'Azúcar' },
                { cantidad: 6, unidad: 'unidades', nombre: 'Huevos' }
            ]
        },
        {
            id: 2,
            nombre: 'Fresas con Crema',
            imagen: 'https://via.placeholder.com/50',
            insumos: [
                { cantidad: 500, unidad: 'g', nombre: 'Fresas' },
                { cantidad: 250, unidad: 'ml', nombre: 'Crema para batir' },
                { cantidad: 50, unidad: 'g', nombre: 'Azúcar glass' }
            ]
        },
        {
            id: 3,
            nombre: 'Pastel de Chocolate',
            imagen: 'https://via.placeholder.com/50',
            insumos: [
                { cantidad: 3, unidad: 'kg', nombre: 'Harina' },
                { cantidad: 1.5, unidad: 'kg', nombre: 'Chocolate' },
                { cantidad: 1, unidad: 'kg', nombre: 'Mantequilla' },
                { cantidad: 12, unidad: 'unidades', nombre: 'Huevos' }
            ]
        }
    ];

    useEffect(() => {
        const mockProcesos = [
            {
                id: 1,
                nombreProduccion: 'Torta de Chocolate',
                fechaCreacion: '01/06/2025',
                fechaEntrega: '05/06/2025',
                estadoProduccion: 'En producción 🔵',
                estadoPedido: 'Abonado 🟣',
                numeroPedido: 'P-001',
                productos: [
                    { id: 3, nombre: 'Pastel de Chocolate', cantidad: 1 }
                ]
            },
            {
                id: 2,
                nombreProduccion: 'Postres Variados',
                fechaCreacion: '02/06/2025',
                fechaEntrega: '06/06/2025',
                estadoProduccion: 'Decorado 🟤',
                estadoPedido: 'En producción 🔵',
                numeroPedido: 'P-002',
                productos: [
                    { id: 1, nombre: 'Mini Donas', cantidad: 12 },
                    { id: 2, nombre: 'Fresas con Crema', cantidad: 6 }
                ]
            }
        ];
        setProcesos(mockProcesos);
    }, []);

    const showNotification = (mensaje, tipo = 'success') => {
        setNotification({ visible: true, mensaje, tipo });
    };

    const hideNotification = () => {
        setNotification({ visible: false, mensaje: '', tipo: 'success' });
    };

    const abrirModal = (tipo, proceso) => {
        setModalTipo(tipo);
        setProcesoSeleccionado(proceso);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setProcesoSeleccionado(null);
        setModalTipo(null);
    };

    const eliminarProceso = () => {
        const updated = procesos.filter(p => p.id !== procesoSeleccionado.id);
        setProcesos(updated);
        cerrarModal();
        showNotification('Proceso eliminado exitosamente');
    };

    const procesosFiltrados = procesos.filter(p =>
        (p.nombreProduccion || '').toLowerCase().includes(filtro.toLowerCase())
    );

    const handleChange = (e) => {
        setProcesoData({...procesoData, [e.target.name]: e.target.value});
    };

    const agregarProducto = (producto) => {
        setProductosSeleccionados(prev => {
            const existe = prev.find(p => p.id === producto.id);
            if (existe) {
                return prev.map(p => 
                    p.id === producto.id 
                        ? { ...p, cantidad: p.cantidad + 1 } 
                        : p
                );
            } else {
                return [...prev, { ...producto, cantidad: 1 }];
            }
        });
    };

    const removeProducto = (id) => {
        setProductosSeleccionados(prev => prev.filter(item => item.id !== id));
        showNotification('Producto eliminado de la lista');
    };

    const cambiarCantidad = (id, nuevaCantidad) => {
        setProductosSeleccionados(prev =>
            prev.map(item =>
                item.id === id 
                    ? { ...item, cantidad: Math.max(1, nuevaCantidad) } 
                    : item
            )
        );
    };

    const verInsumosProducto = (producto) => {
        setProductoDetalleInsumos(producto);
        setMostrarDetalleInsumos(true);
    };

    const guardarProceso = () => {
        if (productosSeleccionados.length === 0) {
            showNotification('Debe agregar al menos un producto al proceso.', 'error');
            return;
        }

        const nuevoProceso = {
            id: procesos.length + 1,
            ...procesoData,
            productos: productosSeleccionados,
            numeroPedido: `P-${String(procesos.length + 1).padStart(3, '0')}`
        };

        setProcesos(prev => [...prev, nuevoProceso]);

        showNotification('Proceso guardado correctamente', 'success');

        // Resetear el formulario
        setProcesoData({
            nombreProduccion: '',
            fechaCreacion: '',
            fechaEntrega: '',
            estadoProduccion: 'Pendiente 🟡',
            estadoPedido: 'Pendiente 🟡',
            numeroPedido: ''
        });
        setProductosSeleccionados([]);
        setMostrarAgregarProceso(false);
    };

    return (
        <div className="admin-wrapper">
            <Notification
                visible={notification.visible}
                mensaje={notification.mensaje}
                tipo={notification.tipo}
                onClose={hideNotification}
            />

            {!mostrarAgregarProceso ? (
                <>
                    <div className="admin-toolbar">
                        <button 
                            className="admin-button pink" 
                            onClick={() => setMostrarAgregarProceso(true)}
                            type="button"
                        >
                            + Agregar Proceso
                        </button>
                        <SearchBar 
                            placeholder="Buscar producción..." 
                            value={filtro} 
                            onChange={setFiltro} 
                        />
                    </div>

                    <h2 className="admin-section-title">Producción</h2>
                    <DataTable
                        value={procesosFiltrados}
                        className="admin-table"
                        paginator rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                    >
                        <Column 
                            header="N°" 
                            body={(rowData, { rowIndex }) => rowIndex + 1} 
                            style={{ width: '3rem', textAlign: 'center' }}
                        />
                        <Column field="nombreProduccion" header="Producción" />
                        <Column field="fechaCreacion" header="Fecha Creación" />
                        <Column field="fechaEntrega" header="Fecha Entrega" />
                        <Column field="estadoProduccion" header="Estado Producción" />
                        <Column field="estadoPedido" header="Estado Pedido" />
                        <Column field="numeroPedido" header="N° Pedido" />
                        <Column
                            header="Acción"
                            body={(rowData) => (
                                <>
                                    <button className="admin-button gray" title="Visualizar" onClick={() => abrirModal('visualizar', rowData)}>
                                        &#128065;
                                    </button>
                                    <button
                                        className="admin-button red"
                                        title="Eliminar"
                                        onClick={() => abrirModal('eliminar', rowData)}
                                    >🗑️</button>
                                </>
                            )}
                        />
                    </DataTable>

                    <Modal visible={modalVisible} onClose={cerrarModal}>
                        {modalTipo === 'visualizar' && procesoSeleccionado && (
                            <div>
                                <h3>Detalle Proceso #{procesoSeleccionado.id}</h3>
                                <p><strong>Producción:</strong> {procesoSeleccionado.nombreProduccion}</p>
                                <p><strong>Fecha Creación:</strong> {procesoSeleccionado.fechaCreacion}</p>
                                <p><strong>Fecha Entrega:</strong> {procesoSeleccionado.fechaEntrega}</p>
                                <p><strong>Estado Producción:</strong> {procesoSeleccionado.estadoProduccion}</p>
                                <p><strong>Estado Pedido:</strong> {procesoSeleccionado.estadoPedido}</p>
                                <p><strong>N° Pedido:</strong> {procesoSeleccionado.numeroPedido}</p>
                                <h4>Productos:</h4>
                                <ul>
                                    {procesoSeleccionado.productos.map((producto, index) => (
                                        <li key={index}>
                                            {producto.nombre} (Cantidad: {producto.cantidad})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {modalTipo === 'eliminar' && (
                            <div>
                                <h3>¿Desea eliminar el proceso #{procesoSeleccionado?.id}?</h3>
                                <button className="admin-button red" onClick={eliminarProceso}>Confirmar</button>
                                <button className="admin-button gray" onClick={cerrarModal}>Cancelar</button>
                            </div>
                        )}
                    </Modal>
                </>
            ) : (
                <div className="compra-form-container">
                    <h1>Producto a hacer</h1>

                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            guardarProceso();
                        }}
                    >
                        {/* Campo 1: Nombre de la producción (ocupa todo el ancho) */}
                        <div className="field-group full-width">
                            <label>Nombre de la producción</label>
                            <input
                                type="text"
                                name="nombreProduccion"
                                value={procesoData.nombreProduccion}
                                onChange={handleChange}
                                required
                                className="full-width-input"
                            />
                        </div>

                        <div className="form-row">
                            {/* Campo 2: Fecha de creación */}
                            <div className="field-group">
                                <label>Fecha de creación del pedido</label>
                                <input
                                    type="date"
                                    name="fechaCreacion"
                                    value={procesoData.fechaCreacion}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Campo 3: Fecha de entrega */}
                            <div className="field-group">
                                <label>Fecha de entrega</label>
                                <input
                                    type="date"
                                    name="fechaEntrega"
                                    value={procesoData.fechaEntrega}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            {/* Campo 4: Estado de producción */}
                            <div className="field-group">
                                <label>Estado de producción</label>
                                <select
                                    name="estadoProduccion"
                                    value={procesoData.estadoProduccion}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Pendiente 🟡">Pendiente 🟡</option>
                                    <option value="En producción 🔵">En producción 🔵</option>
                                    <option value="Decorado 🟤">Decorado 🟤</option>
                                    <option value="Empaquetado 🔵">Empaquetado 🔵</option>
                                    <option value="Entregado 🟢">Entregado 🟢</option>
                                    <option value="N/A 🔴">N/A 🔴</option>
                                </select>
                            </div>

                            {/* Campo 5: Estado de pedido */}
                            <div className="field-group">
                                <label>Estado de pedido</label>
                                <select
                                    name="estadoPedido"
                                    value={procesoData.estadoPedido}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Pendiente 🟡">Pendiente 🟡</option>
                                    <option value="Abonado 🟣">Abonado 🟣</option>
                                    <option value="En producción 🔵">En producción 🔵</option>
                                    <option value="Entregado a ventas 🔵">Entregado a ventas 🔵</option>
                                    <option value="Entregado al cliente 🟢">Entregado al cliente 🟢</option>
                                    <option value="N/A 🔴">N/A 🔴</option>
                                </select>
                            </div>
                        </div>

                        {/* Campo 6: Número de pedido */}
                        <div className="field-group">
                            <label>Número del pedido</label>
                            <input
                                type="text"
                                name="numeroPedido"
                                value={procesoData.numeroPedido || `P-${String(procesos.length + 1).padStart(3, '0')}`}
                                onChange={handleChange}
                                disabled
                            />
                        </div>

                        {/* Botón para agregar productos */}
                        <div className="field-group">
                            <button
                                type="button"
                                className="btn-agregar-productos"
                                onClick={() => setMostrarModalProductos(true)}
                            >
                                ✚ Agregar productos
                            </button>
                        </div>

                        {/* Lista de productos seleccionados */}
                        {productosSeleccionados.length > 0 && (
                            <div className="productos-seleccionados">
                                <h3>Productos agregados:</h3>
                                <table className="productos-table">
                                    <thead>
                                        <tr>
                                            <th>Imagen</th>
                                            <th>Nombre</th>
                                            <th>Cantidad</th>
                                            <th>Insumos</th>
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productosSeleccionados.map(item => {
                                            const productoCompleto = productosDisponibles.find(p => p.id === item.id);
                                            return (
                                                <tr key={item.id}>
                                                    <td>
                                                        <img 
                                                            src={productoCompleto?.imagen || 'https://via.placeholder.com/50'} 
                                                            alt={item.nombre} 
                                                            width="50" 
                                                        />
                                                    </td>
                                                    <td>{item.nombre}</td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.cantidad}
                                                            onChange={(e) => cambiarCantidad(item.id, parseInt(e.target.value))}
                                                        />
                                                    </td>
                                                    <td>
                                                        <button 
                                                            className="btn-insumos"
                                                            onClick={() => verInsumosProducto(productoCompleto)}
                                                        >
                                                            🔍 Insumos
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn-eliminar"
                                                            onClick={() => removeProducto(item.id)}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Botones de acción */}
                        <div className="form-actions">
                            <button className="btn-guardar" type="submit">Guardar Proceso</button>
                            <button
                                type="button"
                                className="btn-regresar"
                                onClick={() => setMostrarAgregarProceso(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>

                    {/* Modal para agregar productos */}
                    {mostrarModalProductos && (
                        <Modal onClose={() => setMostrarModalProductos(false)}>
                            <div className="productos-modal-container">
                                <div className="productos-modal-header">
                                    <h2>Seleccionar Productos</h2>
                                    <SearchBar 
                                        placeholder="Buscar productos..." 
                                        value={filtro} 
                                        onChange={setFiltro} 
                                    />
                                </div>
                                
                                <div className="productos-list">
                                    {productosDisponibles.map(producto => (
                                        <div key={producto.id} className="producto-item">
                                            <img 
                                                src={producto.imagen} 
                                                alt={producto.nombre} 
                                                width="50" 
                                            />
                                            <span>{producto.nombre}</span>
                                            <button
                                                className="btn-agregar"
                                                onClick={() => agregarProducto(producto)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="productos-modal-footer">
                                    <button
                                        className="btn-regresar"
                                        onClick={() => setMostrarModalProductos(false)}
                                    >
                                        Regresar
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    )}

                    {/* Modal para ver detalle de insumos */}
                    {mostrarDetalleInsumos && (
                        <Modal onClose={() => setMostrarDetalleInsumos(false)}>
                            <div className="insumos-modal-container">
                                <h2>Insumos para: {productoDetalleInsumos?.nombre}</h2>
                                <h3>Detalle de los insumos</h3>
                                
                                <table className="insumos-table">
                                    <thead>
                                        <tr>
                                            <th>Cantidad</th>
                                            <th>Unidad de medida</th>
                                            <th>Nombre del insumo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productoDetalleInsumos?.insumos.map((insumo, index) => (
                                            <tr key={index}>
                                                <td>{insumo.cantidad}</td>
                                                <td>{insumo.unidad}</td>
                                                <td>{insumo.nombre}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                <div className="insumos-modal-footer">
                                    <button
                                        className="btn-regresar"
                                        onClick={() => setMostrarDetalleInsumos(false)}
                                    >
                                        Regresar
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    )}
                </div>
            )}
        </div>
    );
}