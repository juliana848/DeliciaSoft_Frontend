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
            imagen: '/imagenes/cartas/donas.png',
            insumos: [
                { cantidad: 2, unidad: 'kg', nombre: 'Harina' },
                { cantidad: 1, unidad: 'kg', nombre: 'Azúcar' },
                { cantidad: 6, unidad: 'unidades', nombre: 'Huevos' }
            ]
        },
        {
            id: 2,
            nombre: 'Fresas con Crema',
            imagen: '/imagenes/cartas/FresasConCrema.png',
            insumos: [
                { cantidad: 500, unidad: 'g', nombre: 'Fresas' },
                { cantidad: 250, unidad: 'ml', nombre: 'Crema para batir' },
                { cantidad: 50, unidad: 'g', nombre: 'Azúcar glass' }
            ]
        },
        {
            id: 3,
            nombre: 'Pastel de Chocolate',
            imagen: 'src/features/Admin/ImagenesProduccion/TortasChocolate.png',
            insumos: [
                { cantidad: 3, unidad: 'kg', nombre: 'Harina' },
                { cantidad: 1.5, unidad: 'kg', nombre: 'Chocolate' },
                { cantidad: 1, unidad: 'kg', nombre: 'Mantequilla' },
                { cantidad: 12, unidad: 'unidades', nombre: 'Huevos' }
            ]
        }
    ];

    const recetasDisponibles = [
        {
            id: 1,
            nombre: 'Receta Base Chocolate',
            pasos: ['Derretir chocolate', 'Mezclar con harina', 'Hornear 40 min'],
            insumos: ['Chocolate', 'Harina', 'Huevos', 'Azúcar'],
            imagen: '/imagenes/recetas/chocolate.png'
        },
        {
            id: 2,
            nombre: 'Receta Base Vainilla',
            pasos: ['Batir huevos', 'Agregar esencia de vainilla', 'Hornear'],
            insumos: ['Huevos', 'Azúcar', 'Harina', 'Vainilla'],
            imagen: '/imagenes/recetas/vainilla.png'
        },
        {
            id: 3,
            nombre: 'Receta Fresas con Crema',
            pasos: ['Lavar fresas', 'Batir crema', 'Servir en copa'],
            insumos: ['Fresas', 'Crema de leche', 'Azúcar'],
            imagen: '/imagenes/recetas/fresas.png'
        }
    ];

    const [productoEditandoReceta, setProductoEditandoReceta] = useState(null);
    const [mostrarModalRecetas, setMostrarModalRecetas] = useState(false);
    const [mostrarModalRecetaDetalle, setMostrarModalRecetaDetalle] = useState(false);
    const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);

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
                    { id: 3, nombre: 'Pastel de Chocolate', cantidad: 1, receta: recetasDisponibles[0] }
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
                    { id: 1, nombre: 'Mini Donas', cantidad: 12, receta: recetasDisponibles[1] },
                    { id: 2, nombre: 'Fresas con Crema', cantidad: 6, receta: recetasDisponibles[2] }
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

    const abrirModalReceta = (producto) => {
        setProductoEditandoReceta(producto);
        setMostrarModalRecetas(true);
    };

    const cerrarModalRecetas = () => {
        setMostrarModalRecetas(false);
        setProductoEditandoReceta(null);
    };

    const abrirModalRecetaDetalle = (receta) => {
        setRecetaSeleccionada(receta);
        setMostrarModalRecetaDetalle(true);
    };

    const cerrarModalRecetaDetalle = () => {
        setMostrarModalRecetaDetalle(false);
        setRecetaSeleccionada(null);
    };

    const eliminarProceso = () => {
        const updated = procesos.filter(p => p.id !== procesoSeleccionado.id);
        setProcesos(updated);
        cerrarModal();
        showNotification('Proceso eliminado exitosamente');
    };

    // Función para actualizar el estado de un proceso
    const actualizarEstadoProceso = (procesoId, campo, valor) => {
        setProcesos(prev => 
            prev.map(proceso => 
                proceso.id === procesoId 
                    ? { ...proceso, [campo]: valor }
                    : proceso
            )
        );
        showNotification('Estado actualizado correctamente');
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
                const actualizados = prev.map(p =>
                    p.id === producto.id
                        ? { ...p, cantidad: p.cantidad + 1 }
                        : p
                );
                return actualizados;
            } else {
                const nuevos = [...prev, { ...producto, cantidad: 1, receta: null }];
                return nuevos;
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
        const productoCompleto = productosDisponibles.find(p => p.id === producto.id);
        setProductoDetalleInsumos(productoCompleto);
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

    // Componente para renderizar selects editables en la tabla
    const renderEstadoSelect = (rowData, campo) => (
        <select
            value={rowData[campo]}
            onChange={(e) => actualizarEstadoProceso(rowData.id, campo, e.target.value)}
            style={{ 
                border: 'none', 
                background: 'transparent', 
                cursor: 'pointer',
                padding: '2px'
            }}
        >
            {campo === 'estadoProduccion' ? (
                <>
                    <option value="Pendiente 🟡">Pendiente 🟡</option>
                    <option value="En producción 🔵">En producción 🔵</option>
                    <option value="Decorado 🟤">Decorado 🟤</option>
                    <option value="Empaquetado 🔵">Empaquetado 🔵</option>
                    <option value="Entregado 🟢">Entregado 🟢</option>
                    <option value="N/A 🔴">N/A 🔴</option>
                </>
            ) : (
                <>
                    <option value="Pendiente 🟡">Pendiente 🟡</option>
                    <option value="Abonado 🟣">Abonado 🟣</option>
                    <option value="En producción 🔵">En producción 🔵</option>
                    <option value="Entregado a ventas 🔵">Entregado a ventas 🔵</option>
                    <option value="Entregado al cliente 🟢">Entregado al cliente 🟢</option>
                    <option value="N/A 🔴">N/A 🔴</option>
                </>
            )}
        </select>
    );

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
                            + Agregar
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
                        <Column 
                            header="Estado Producción" 
                            body={(rowData) => renderEstadoSelect(rowData, 'estadoProduccion')}
                        />
                        <Column 
                            header="Estado Pedido" 
                            body={(rowData) => renderEstadoSelect(rowData, 'estadoPedido')}
                        />
                        <Column field="numeroPedido" header="N° Pedido" />
                        <Column
                            header="Acción"
                            body={(rowData) => (
                                <>
                                    <button className="admin-button gray" title="Visualizar" onClick={() => abrirModal('visualizar', rowData)}>
                                        🔍
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
                                <table className="productos-table" style={{ width: '100%', marginTop: '10px' }}>
                                    <thead>
                                        <tr>
                                            <th>Imagen</th>
                                            <th>Nombre</th>
                                            <th>Cantidad</th>
                                            <th>Receta</th>
                                            <th>Insumos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {procesoSeleccionado.productos.map((producto) => {
                                            const productoCompleto = productosDisponibles.find(p => p.id === producto.id);
                                            return (
                                                <tr key={producto.id}>
                                                    <td>
                                                        <img 
                                                            src={productoCompleto?.imagen || 'https://via.placeholder.com/50'} 
                                                            alt={producto.nombre} 
                                                            width="50" 
                                                            height="50"
                                                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                                                        />
                                                    </td>
                                                    <td>{producto.nombre}</td>
                                                    <td>{producto.cantidad}</td>
                                                    <td>
                                                        {producto.receta ? (
                                                            <button 
                                                                className="btn-receta"
                                                                onClick={() => abrirModalRecetaDetalle(producto.receta)}
                                                                style={{ 
                                                                    background: '#4CAF50', 
                                                                    color: 'white', 
                                                                    border: 'none', 
                                                                    padding: '5px 10px', 
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                📖 {producto.receta.nombre}
                                                            </button>
                                                        ) : (
                                                            <span style={{ color: '#999' }}>Sin receta</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button 
                                                            className="btn-insumos"
                                                            onClick={() => {
                                                                const productoCompleto = productosDisponibles.find(p => p.id === producto.id);
                                                                if (productoCompleto) {
                                                                    setProductoDetalleInsumos(productoCompleto);
                                                                    setMostrarDetalleInsumos(true);
                                                                }
                                                            }}
                                                            style={{ 
                                                                background: '#2196F3', 
                                                                color: 'white', 
                                                                border: 'none', 
                                                                padding: '5px 10px', 
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            📋 Ver insumos
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {modalTipo === 'eliminar' && (
                            <div>
                                <h3>¿Desea eliminar el proceso #{procesoSeleccionado?.id}?</h3>
                                <div className="modal-footer">
                                    <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
                                    <button className="modal-btn save-btn" onClick={eliminarProceso}>Guardar</button>
                                </div>
                            </div>
                        )}
                    </Modal>
                     {mostrarModalRecetaDetalle && recetaSeleccionada && (
                        <Modal visible={mostrarModalRecetaDetalle} onClose={cerrarModalRecetaDetalle}>
                            <div className="receta-detalle-container">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                    <img 
                                        src={recetaSeleccionada.imagen} 
                                        alt={recetaSeleccionada.nombre}
                                        width="80" 
                                        height="80"
                                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                    <div>
                                        <h2 style={{ margin: '0 0 8px 0' }}>{recetaSeleccionada.nombre}</h2>
                                        <p style={{ margin: '0', color: '#666' }}>
                                            {recetaSeleccionada.insumos.length} insumos • {recetaSeleccionada.pasos.length} pasos
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <h3>📋 Insumos necesarios:</h3>
                                        <ul style={{ listStyle: 'none', padding: '0' }}>
                                            {recetaSeleccionada.insumos.map((insumo, index) => (
                                                <li key={index} style={{ 
                                                    padding: '8px', 
                                                    marginBottom: '4px', 
                                                    backgroundColor: '#f5f5f5', 
                                                    borderRadius: '4px' 
                                                }}>
                                                    • {insumo}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3>👩‍🍳 Pasos de preparación:</h3>
                                        <ol style={{ paddingLeft: '20px' }}>
                                            {recetaSeleccionada.pasos.map((paso, index) => (
                                                <li key={index} style={{ 
                                                    padding: '8px 0', 
                                                    marginBottom: '8px',
                                                    borderBottom: '1px solid #eee'
                                                }}>
                                                    {paso}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>

                                <div className="modal-footer" style={{ marginTop: '20px' }}>
                                    <button
                                        className="modal-btn cancel-btn"
                                        onClick={cerrarModalRecetaDetalle}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    )}

                    {/* Modal para ver detalle de insumos desde visualización */}
                    {mostrarDetalleInsumos && productoDetalleInsumos && (
                        <Modal visible={mostrarDetalleInsumos} onClose={() => setMostrarDetalleInsumos(false)}>
                            <div className="insumos-modal-container">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                    <img 
                                        src={productoDetalleInsumos.imagen} 
                                        alt={productoDetalleInsumos.nombre}
                                        width="80" 
                                        height="80"
                                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                    <div>
                                        <h2 style={{ margin: '0 0 8px 0' }}>Insumos para: {productoDetalleInsumos.nombre}</h2>
                                        <p style={{ margin: '0', color: '#666' }}>
                                            {productoDetalleInsumos.insumos?.length || 0} insumos necesarios
                                        </p>
                                    </div>
                                </div>
                                
                                <table className="insumos-table" style={{ 
                                    width: '100%', 
                                    borderCollapse: 'collapse',
                                    marginTop: '20px'
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th style={{ 
                                                padding: '12px', 
                                                textAlign: 'left', 
                                                borderBottom: '2px solid #dee2e6',
                                                fontWeight: 'bold'
                                            }}>Cantidad</th>
                                            <th style={{ 
                                                padding: '12px', 
                                                textAlign: 'left', 
                                                borderBottom: '2px solid #dee2e6',
                                                fontWeight: 'bold'
                                            }}>Unidad</th>
                                            <th style={{ 
                                                padding: '12px', 
                                                textAlign: 'left', 
                                                borderBottom: '2px solid #dee2e6',
                                                fontWeight: 'bold'
                                            }}>Insumo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productoDetalleInsumos.insumos?.map((insumo, index) => (
                                            <tr key={index} style={{ 
                                                borderBottom: '1px solid #dee2e6'
                                            }}>
                                                <td style={{ padding: '12px', fontWeight: 'bold', color: '#495057' }}>
                                                    {insumo.cantidad || 'N/A'}
                                                </td>
                                                <td style={{ padding: '12px', color: '#6c757d' }}>
                                                    {insumo.unidad || 'N/A'}
                                                </td>
                                                <td style={{ padding: '12px', color: '#212529' }}>
                                                    {insumo.nombre || insumo}
                                                </td>
                                            </tr>
                                        )) || (
                                            <tr>
                                                <td colSpan="3" style={{ padding: '12px', textAlign: 'center', color: '#6c757d' }}>
                                                    No hay insumos disponibles
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                
                                <div className="modal-footer" style={{ marginTop: '20px' }}>
                                    <button
                                        className="modal-btn cancel-btn"
                                        onClick={() => setMostrarDetalleInsumos(false)}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    )}
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
                        <label>Nombre de la producción</label>
                        <input
                            type="text"
                            name="nombreProduccion"
                            value={procesoData.nombreProduccion}
                            onChange={handleChange}
                            required
                            className="modal-input"
                        />

                        <div className="form-row">
                            <label>Fecha de creación del pedido</label>
                            <input
                                className='modal-input'
                                type="date"
                                name="fechaCreacion"
                                value={procesoData.fechaCreacion}
                                onChange={handleChange}
                                required
                            />
                                
                            <label>Fecha de entrega</label>
                            <input
                                className='modal-input'
                                type="date"
                                name="fechaEntrega"
                                value={procesoData.fechaEntrega}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <label>Estado de producción</label>
                        <select
                            className='modal-input'
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

                        <label>Estado de pedido</label>
                        <select
                            className='modal-input'
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

                        <label>Número del pedido</label>
                        <input
                            className='modal-input'
                            type="text"
                            name="numeroPedido"
                            value={procesoData.numeroPedido || `P-${String(procesos.length + 1).padStart(3, '0')}`}
                            onChange={handleChange}
                            disabled
                        />

                        <button
                            type="button"
                            className="modal-input"
                            onClick={() => setMostrarModalProductos(true)}
                        >
                            ✚ Agregar productos
                        </button>

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
                                            <th>Receta</th>
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
                                                            height="50"
                                                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div>{item.nombre}</div>
                                                        {item.receta && <small style={{ fontSize: '12px', color: '#666' }}>📘 {item.receta.nombre}</small>}
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.cantidad}
                                                            onChange={(e) => cambiarCantidad(item.id, parseInt(e.target.value))}
                                                            style={{ width: '60px' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <button 
                                                            type="button"
                                                            className="btn-insumos"
                                                            onClick={() => abrirModalReceta(item)}
                                                            style={{ 
                                                                background: '#4CAF50', 
                                                                color: 'white', 
                                                                border: 'none', 
                                                                padding: '5px 10px', 
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            📘 Ver recetas
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="btn-eliminar"
                                                            onClick={() => removeProducto(item.id)}
                                                            style={{ 
                                                                background: '#f44336', 
                                                                color: 'white', 
                                                                border: 'none', 
                                                                padding: '5px 10px', 
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
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

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="modal-btn cancel-btn"
                                onClick={() => setMostrarAgregarProceso(false)}
                            >Cancelar</button>
                            <button className="modal-btn save-btn" type="submit">Guardar</button>
                        </div>
                    </form>

                    {/* Modal para agregar productos */}
                    {mostrarModalProductos && (
                        <Modal visible={mostrarModalProductos} onClose={() => setMostrarModalProductos(false)}>
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
                                    {productosDisponibles
                                        .filter(p => p.nombre.toLowerCase().includes(filtro.toLowerCase()))
                                        .map(producto => (
                                            <div key={producto.id} className="producto-item" style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                padding: '10px', 
                                                border: '1px solid #ddd', 
                                                borderRadius: '8px', 
                                                marginBottom: '10px' 
                                            }}>
                                                <img 
                                                    src={producto.imagen} 
                                                    alt={producto.nombre} 
                                                    width="60" 
                                                    height="60"
                                                    style={{ objectFit: 'cover', borderRadius: '4px', marginRight: '15px' }}
                                                />
                                                <span style={{ flex: 1, fontSize: '16px' }}>{producto.nombre}</span>
                                                <button
                                                    className="AgregarProducc"
                                                    onClick={() => agregarProducto(producto)}
                                                    style={{ 
                                                        background: '#4CAF50', 
                                                        color: 'white', 
                                                        border: 'none', 
                                                        padding: '8px 16px', 
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Agregar
                                                </button>
                                            </div>
                                        ))}
                                </div>
                                
                                <div className="productos-modal-footer">
                                    <button
                                        className="btn-regresar"
                                        onClick={() => setMostrarModalProductos(false)}
                                        style={{ 
                                            background: '#757575', 
                                            color: 'white', 
                                            border: 'none', 
                                            padding: '10px 20px', 
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Regresar
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    )}
                    
                    {mostrarModalRecetas && (
                    <Modal visible={mostrarModalRecetas} onClose={cerrarModalRecetas}>
                        <div className="recetas-modal-container">
                        <h2>Seleccionar receta para: {productoEditandoReceta?.nombre}</h2>
                        <ul className="lista-recetas-modal">
                            {recetasDisponibles.map((receta) => (
                            <li key={receta.id} style={{ marginBottom: '8px' }}>
                                <button
                                    onClick={() => {
                                    setProductosSeleccionados(prev =>
                                        prev.map(p =>
                                        p.id === productoEditandoReceta.id
                                            ? { ...p, receta }
                                            : p
                                        )
                                    );
                                    cerrarModalRecetas();
                                    }}
                                    style={{ marginRight: '8px' }}
                                >
                                    📖 {receta.nombre}
                                </button>
                                <span style={{ fontSize: '12px' }}>
                                    ({receta.insumos.length} insumos, {receta.pasos.length} pasos)
                                </span>
                                </li>
                            ))}
                        </ul>
                        </div>
                    </Modal>
                    )}

{mostrarModalRecetas && (
                        <Modal visible={mostrarModalRecetas} onClose={cerrarModalRecetas}>
                            <div className="recetas-modal-container">
                                <h2>Seleccionar receta para: {productoEditandoReceta?.nombre}</h2>
                                <div className="recetas-grid" style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
                                    {recetasDisponibles.map((receta) => (
                                        <div key={receta.id} className="receta-card" style={{ 
                                            border: '1px solid #ddd', 
                                            borderRadius: '8px', 
                                            padding: '15px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '15px'
                                        }}>
                                            <img 
                                                src={receta.imagen} 
                                                alt={receta.nombre}
                                                width="60" 
                                                height="60"
                                                style={{ objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: '0 0 8px 0' }}>{receta.nombre}</h4>
                                                <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                                                    {receta.insumos.length} insumos • {receta.pasos.length} pasos
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => abrirModalRecetaDetalle(receta)}
                                                    style={{ 
                                                        background: '#2196F3', 
                                                        color: 'white', 
                                                        border: 'none', 
                                                        padding: '8px 12px', 
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    👁️ Ver
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setProductosSeleccionados(prev =>
                                                            prev.map(p =>
                                                                p.id === productoEditandoReceta.id
                                                                    ? { ...p, receta }
                                                                    : p
                                                            )
                                                        );
                                                        cerrarModalRecetas();
                                                        showNotification('Receta asignada correctamente');
                                                    }}
                                                    style={{ 
                                                        background: '#4CAF50', 
                                                        color: 'white', 
                                                        border: 'none', 
                                                        padding: '8px 12px', 
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    ✓ Seleccionar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="modal-footer" style={{ marginTop: '20px' }}>
                                    <button
                                        className="modal-btn cancel-btn"
                                        onClick={cerrarModalRecetas}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    )}

        {/* Modal para ver detalle de receta */}
        {mostrarModalRecetaDetalle && recetaSeleccionada && (
            <Modal visible={mostrarModalRecetaDetalle} onClose={cerrarModalRecetaDetalle}>
                <div className="receta-detalle-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <img 
                            src={recetaSeleccionada.imagen} 
                            alt={recetaSeleccionada.nombre}
                            width="80" 
                            height="80"
                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <div>
                            <h2 style={{ margin: '0 0 8px 0' }}>{recetaSeleccionada.nombre}</h2>
                            <p style={{ margin: '0', color: '#666' }}>
                                {recetaSeleccionada.insumos.length} insumos • {recetaSeleccionada.pasos.length} pasos
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <h3>📋 Insumos necesarios:</h3>
                            <ul style={{ listStyle: 'none', padding: '0' }}>
                                {recetaSeleccionada.insumos.map((insumo, index) => (
                                    <li key={index} style={{ 
                                        padding: '8px', 
                                        marginBottom: '4px', 
                                        backgroundColor: '#f5f5f5', 
                                        borderRadius: '4px' 
                                    }}>
                                        • {insumo}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3>👩‍🍳 Pasos de preparación:</h3>
                            <ol style={{ paddingLeft: '20px' }}>
                                {recetaSeleccionada.pasos.map((paso, index) => (
                                    <li key={index} style={{ 
                                        padding: '8px 0', 
                                        marginBottom: '8px',
                                        borderBottom: '1px solid #eee'
                                    }}>
                                        {paso}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            className="modal-btn primary-btn"
                            onClick={() => {
                                // Abrir modal de insumos con los datos de la receta seleccionada
                                setProductoDetalleInsumos(recetaSeleccionada);
                                setMostrarDetalleInsumos(true);
                            }}
                        >
                            Ver Insumos
                        </button>
                        <button
                            className="modal-btn cancel-btn"
                            onClick={cerrarModalRecetaDetalle}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </Modal>
        )}

        {/* Modal para ver detalle de insumos */}
        {mostrarDetalleInsumos && productoDetalleInsumos && (
            <Modal visible={mostrarDetalleInsumos} onClose={() => setMostrarDetalleInsumos(false)}>
                <div className="insumos-modal-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <img 
                            src={productoDetalleInsumos.imagen} 
                            alt={productoDetalleInsumos.nombre}
                            width="80" 
                            height="80"
                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <div>
                            <h2 style={{ margin: '0 0 8px 0' }}>Insumos para: {productoDetalleInsumos.nombre}</h2>
                            <p style={{ margin: '0', color: '#666' }}>
                                {productoDetalleInsumos.insumos?.length || 0} insumos necesarios
                            </p>
                        </div>
                    </div>
                    
                    <table className="insumos-table" style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        marginTop: '20px'
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={{ 
                                    padding: '12px', 
                                    textAlign: 'left', 
                                    borderBottom: '2px solid #dee2e6',
                                    fontWeight: 'bold'
                                }}>Cantidad</th>
                                <th style={{ 
                                    padding: '12px', 
                                    textAlign: 'left', 
                                    borderBottom: '2px solid #dee2e6',
                                    fontWeight: 'bold'
                                }}>Unidad</th>
                                <th style={{ 
                                    padding: '12px', 
                                    textAlign: 'left', 
                                    borderBottom: '2px solid #dee2e6',
                                    fontWeight: 'bold'
                                }}>Insumo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productoDetalleInsumos.insumos?.map((insumo, index) => (
                                <tr key={index} style={{ 
                                    borderBottom: '1px solid #dee2e6'
                                }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#495057' }}>
                                        {insumo.cantidad || 'N/A'}
                                    </td>
                                    <td style={{ padding: '12px', color: '#6c757d' }}>
                                        {insumo.unidad || 'N/A'}
                                    </td>
                                    <td style={{ padding: '12px', color: '#212529' }}>
                                        {insumo.nombre || insumo}
                                    </td>
                                </tr>
                            )) || (
                                <tr>
                                    <td colSpan="3" style={{ padding: '12px', textAlign: 'center', color: '#6c757d' }}>
                                        No hay insumos disponibles
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    
                    <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            className="modal-btn cancel-btn"
                            onClick={() => setMostrarDetalleInsumos(false)}
                        >
                            Cerrar
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