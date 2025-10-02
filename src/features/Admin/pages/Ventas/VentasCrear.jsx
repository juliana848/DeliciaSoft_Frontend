// VentasCrear.jsx - Con estructura igual a CompraForm
import React, { useEffect, useState } from 'react';
import AgregarProductosModal from '../../components/catalogos/AgregarProductosModal';
import AgregarAdicionesModal from '../../components/catalogos/AgregarAdicionesModal';
import AgregarSalsasModal from '../../components/catalogos/AgregarSalsasModal';
import AgregarRellenosModal from '../../components/catalogos/AgregarRellenosModal';
import clienteApiService from '../../services/cliente_services';
import ventaApiService from '../../services/venta_services';
import './VentasCrear.css';

export default function VentasCrear({
    ventaData,
    handleChange,
    erroresValidacion,
    insumosSeleccionados,
    toggleNestedDetails,
    nestedDetailsVisible,
    handleCantidadChange,
    abrirModalAdiciones,
    abrirModalSalsas,
    abrirModalRellenos,
    removeInsumo,
    removeAdicion,
    removeSalsa,
    removeRelleno,
    setMostrarModalInsumos,
    subtotal,
    iva,
    total,
    guardarVenta,
    setMostrarAgregarVenta,
    mostrarModalInsumos,
    agregarInsumos,
    mostrarModalAdiciones,
    agregarAdiciones,
    mostrarModalSalsas,
    agregarSalsas,
    mostrarModalRellenos,
    agregarRellenos,
    setProductoEditandoId,
    productoEditandoId,
    showNotification
}) {
    // Estados para clientes
    const [clientes, setClientes] = useState([]);
    const [loadingClientes, setLoadingClientes] = useState(true);
    const [errorClientes, setErrorClientes] = useState('');
    
    // Estados para sedes
    const [sedes, setSedes] = useState([]);
    const [loadingSedes, setLoadingSedes] = useState(true);
    const [errorSedes, setErrorSedes] = useState('');
    
    // Estados para el campo de cliente con búsqueda
    const [inputCliente, setInputCliente] = useState('');
    const [clientesFiltrados, setClientesFiltrados] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

    // Función para obtener la fecha de hoy en formato YYYY-MM-DD
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Cargar clientes y sedes al montar el componente
    useEffect(() => {
        fetchClientes();
        fetchSedes();
    }, []);

    // Establecer la fecha de venta al día de hoy al cargar el componente
    useEffect(() => {
        if (ventaData.fecha_venta !== getTodayDate()) {
            handleChange({
                target: {
                    name: 'fecha_venta',
                    value: getTodayDate()
                }
            });
        }
    }, [ventaData.fecha_venta, handleChange]);

    // Función para cargar clientes desde la API
    const fetchClientes = async () => {
        try {
            setLoadingClientes(true);
            setErrorClientes('');
            
            const clientesData = await clienteApiService.obtenerClientesParaVenta();
            setClientes(clientesData);
            setClientesFiltrados(clientesData);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            setErrorClientes('Error al cargar clientes');
            
            const fallbackClientes = [
                {
                    idcliente: null,
                    numeroDocumento: '',
                    nombreCompleto: 'Cliente Genérico'
                }
            ];
            setClientes(fallbackClientes);
            setClientesFiltrados(fallbackClientes);
        } finally {
            setLoadingClientes(false);
        }
    };

    // Función para cargar sedes desde la API
    const fetchSedes = async () => {
        try {
            setLoadingSedes(true);
            setErrorSedes('');
            
            const response = await fetch('https://deliciasoft-backend.onrender.com/api/sede', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const sedesData = await response.json();
            const sedesActivas = sedesData.filter(sede => sede.estado === true);
            setSedes(sedesActivas);
            
        } catch (error) {
            console.error('Error al cargar sedes:', error);
            setErrorSedes('Error al cargar sedes');
            
            const fallbackSedes = [
                { idsede: 1, nombre: 'San Pablo' },
                { idsede: 2, nombre: 'San Benito' }
            ];
            setSedes(fallbackSedes);
        } finally {
            setLoadingSedes(false);
        }
    };

    // Función para filtrar clientes basado en la entrada del usuario
    const filtrarClientes = (termino) => {
        if (!termino || termino.trim() === '') {
            setClientesFiltrados(clientes);
            return;
        }

        const terminoLimpio = termino.toLowerCase().trim();
        
        const filtrados = clientes.filter(cliente => {
            const nombre = cliente.nombreCompleto?.toLowerCase() || '';
            const documento = cliente.numeroDocumento?.toString() || '';
            
            return nombre.includes(terminoLimpio) || documento.includes(terminoLimpio);
        });

        setClientesFiltrados(filtrados);
    };

    // Función para manejar cambios en el input de cliente
    const handleInputClienteChange = (e) => {
        const valor = e.target.value;
        setInputCliente(valor);
        filtrarClientes(valor);
        setMostrarSugerencias(true);

        const clienteEncontrado = clientes.find(cliente => 
            cliente.numeroDocumento && 
            cliente.numeroDocumento.toString() === valor.trim()
        );

        if (clienteEncontrado) {
            setInputCliente(clienteEncontrado.nombreCompleto);
            seleccionarCliente(clienteEncontrado);
            setMostrarSugerencias(false);
        } else {
            handleChange({
                target: {
                    name: 'cliente',
                    value: valor
                }
            });
            handleChange({
                target: {
                    name: 'clienteId',
                    value: null
                }
            });
        }
    };

    // Función para seleccionar un cliente de la lista
    const seleccionarCliente = (cliente) => {
        const displayText = cliente.numeroDocumento 
            ? `${cliente.nombreCompleto} -- ${cliente.numeroDocumento}`
            : cliente.nombreCompleto;

        setInputCliente(displayText);
        setMostrarSugerencias(false);

        handleChange({
            target: {
                name: 'cliente',
                value: cliente.nombreCompleto
            }
        });

        handleChange({
            target: {
                name: 'clienteId',
                value: cliente.idcliente
            }
        });
    };

    // Función para manejar el foco del input
    const handleInputFocus = () => {
        setMostrarSugerencias(true);
        if (clientesFiltrados.length === clientes.length && inputCliente === '') {
            filtrarClientes('');
        }
    };

    // Función para manejar cuando se pierde el foco
    const handleInputBlur = () => {
        setTimeout(() => {
            setMostrarSugerencias(false);
        }, 200);
    };

    // Calcular las fechas min y max para la fecha de entrega
    const today = new Date();
    const minDeliveryDate = new Date();
    minDeliveryDate.setDate(today.getDate() + 15);

    const maxDeliveryDate = new Date();
    maxDeliveryDate.setMonth(today.getMonth() + 2);

    const formatForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const minDateFormatted = formatForInput(minDeliveryDate);
    const maxDateFormatted = formatForInput(maxDeliveryDate);

    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const datosVenta = {
                fecha_venta: ventaData.fecha_venta,
                tipo_venta: ventaData.tipo_venta,
                sede: ventaData.sede,
                cliente: ventaData.cliente,
                clienteId: ventaData.clienteId,
                metodo_pago: ventaData.metodo_pago,
                total: total,
                productos: insumosSeleccionados.map(producto => ({
                    id: producto.id,
                    nombre: producto.nombre,
                    cantidad: producto.cantidad || 1,
                    precio: producto.precio,
                    subtotal: (producto.precio * (producto.cantidad || 1)),
                    disponible: producto.disponible,
                    adiciones: producto.adiciones || [],
                    salsas: producto.salsas || [],
                    sabores: producto.sabores || []
                }))
            };
            
            await guardarVenta(datosVenta);
            
        } catch (error) {
            console.error('Error al procesar la venta:', error);
        }
    };

    // Validar que no se pueda abrir el modal sin sede (para venta directa)
    const handleAbrirModal = () => {
        if (!ventaData.tipo_venta) {
            if (showNotification) {
                showNotification('Por favor selecciona el tipo de venta primero', 'error');
            } else {
                alert('Por favor selecciona el tipo de venta primero');
            }
            return;
        }
        
        if ((ventaData.tipo_venta === 'directa' || ventaData.tipo_venta === 'venta directa') && !ventaData.sede) {
            if (showNotification) {
                showNotification('Por favor selecciona la sede primero', 'error');
            } else {
                alert('Por favor selecciona la sede primero');
            }
            return;
        }
        
        setMostrarModalInsumos(true);
    };

    return (
        <div className="compra-form-container">
            {/* Header con información */}
            <div className="header-info">
                <div className="info-badge">
                    <span className="badge-icon">🛒</span>
                    <span>Clientes cargados: {clientes?.length || 0}</span>
                </div>
            </div>

            {/* Formulario principal */}
            <div className="form-card">
                <h2 className="section-title">
                    <span className="title-icon">🏢</span>
                    Información de la Venta
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="field-group">
                            <label className="field-label">Tipo de Venta <span style={{ color: 'red' }}>*</span></label>
                            <select
                                name="tipo_venta"
                                value={ventaData.tipo_venta}
                                onChange={handleChange}
                                className={`form-input ${erroresValidacion.tipo_venta ? 'error' : ''}`}
                                required
                            >
                                <option value="">Seleccione</option>
                                <option value="directa">Venta Directa</option>
                                <option value="pedido">Pedido</option>
                            </select>
                            {erroresValidacion.tipo_venta && (
                                <span className="error-message">{erroresValidacion.tipo_venta}</span>
                            )}
                        </div>
                        
                        <div className="field-group">
                            <label className="field-label">Fecha de Venta</label>
                            <input
                                type="date"
                                name="fecha_venta"
                                value={ventaData.fecha_venta}
                                onChange={handleChange}
                                className={`form-input ${erroresValidacion.fecha_venta ? 'error' : ''}`}
                                required
                                disabled
                            />
                            {erroresValidacion.fecha_venta && (
                                <span className="error-message">{erroresValidacion.fecha_venta}</span>
                            )}
                        </div>
                        
                        {ventaData.tipo_venta === 'pedido' && (
                            <div className="field-group">
                                <label className="field-label">Fecha de Entrega <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="date"
                                    name="fecha_entrega"
                                    value={ventaData.fecha_entrega || ''}
                                    onChange={handleChange}
                                    className={`form-input ${erroresValidacion.fecha_entrega ? 'error' : ''}`}
                                    required={ventaData.tipo_venta === 'pedido'}
                                    min={minDateFormatted}
                                    max={maxDateFormatted}
                                />
                                {erroresValidacion.fecha_entrega && (
                                    <span className="error-message">{erroresValidacion.fecha_entrega}</span>
                                )}
                            </div>
                        )}
                        
                        <div className="field-group">
                            <label className="field-label">Sede <span style={{ color: 'red' }}>*</span></label>
                            {loadingSedes ? (
                                <select disabled className="form-input">
                                    <option>Cargando sedes...</option>
                                </select>
                            ) : (
                                <select
                                    name="sede"
                                    value={ventaData.sede}
                                    onChange={handleChange}
                                    className={`form-input ${erroresValidacion.sede ? 'error' : ''}`}
                                    required
                                >
                                    <option value="">Seleccione una sede</option>
                                    {sedes.map(sede => (
                                        <option key={sede.idsede} value={sede.nombre}>
                                            {sede.nombre}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errorSedes && (
                                <span className="error-message">{errorSedes}</span>
                            )}
                            {erroresValidacion.sede && (
                                <span className="error-message">{erroresValidacion.sede}</span>
                            )}
                        </div>
                        
                        <div className="field-group" style={{ position: 'relative' }}>
                            <label className="field-label">Cliente <span style={{ color: 'red' }}>*</span></label>
                            {loadingClientes ? (
                                <input
                                    type="text"
                                    placeholder="Cargando clientes..."
                                    disabled
                                    className="form-input"
                                />
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        name="cliente_search"
                                        value={inputCliente}
                                        onChange={handleInputClienteChange}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                        placeholder="Buscar por nombre o documento..."
                                        className={`form-input ${erroresValidacion.cliente ? 'error' : ''}`}
                                        required
                                        autoComplete="off"
                                    />
                                    
                                    {mostrarSugerencias && clientesFiltrados.length > 0 && (
                                        <div className="clientes-dropdown">
                                            {clientesFiltrados.slice(0, 10).map((cliente, index) => (
                                                <div
                                                    key={cliente.idcliente || index}
                                                    className="cliente-option"
                                                    onClick={() => seleccionarCliente(cliente)}
                                                >
                                                    <div className="cliente-nombre">
                                                        {cliente.nombreCompleto}
                                                    </div>
                                                    {cliente.numeroDocumento && (
                                                        <div className="cliente-documento">
                                                            {cliente.numeroDocumento}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                            {errorClientes && (
                                <span className="error-message">{errorClientes}</span>
                            )}
                            {erroresValidacion.cliente && (
                                <span className="error-message">{erroresValidacion.cliente}</span>
                            )}
                        </div>
                        
                        <div className="field-group">
                            <label className="field-label">Método de Pago <span style={{ color: 'red' }}>*</span></label>
                            <select
                                name="metodo_pago"
                                value={ventaData.metodo_pago}
                                onChange={handleChange}
                                className={`form-input ${erroresValidacion.metodo_pago ? 'error' : ''}`}
                                required
                            >
                                <option value="">Seleccione</option>
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">Transferencia</option>
                            </select>
                            {erroresValidacion.metodo_pago && (
                                <span className="error-message">{erroresValidacion.metodo_pago}</span>
                            )}
                        </div>
                    </div>
                </form>
            </div>
            
            {/* Sección de detalles */}
            <div className="form-card">
                <h2 className="section-title">
                    <span className="title-icon">📦</span>
                    Detalle de Productos
                </h2>
                
                {erroresValidacion.productos && (
                    <div className="error-banner">
                        <span className="error-icon">⚠️</span>
                        {erroresValidacion.productos}
                    </div>
                )}
                                                
                <div className="table-container">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Adiciones</th>
                                <th>Salsas</th>
                                <th>Rellenos</th>
                                <th>Subtotal Item</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {insumosSeleccionados.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{textAlign: 'center', padding: '20px'}}>
                                        No hay productos en esta venta
                                    </td>
                                </tr>
                            ) : (
                                insumosSeleccionados.map(item => (
                                    <React.Fragment key={item.id}>
                                        <tr className="product-row">
                                            <td className="product-name">
                                                {item.nombre}
                                                <button
                                                    type="button"
                                                    className="btn-small toggle-details-btn"
                                                    onClick={() => toggleNestedDetails(item.id)}
                                                    title={nestedDetailsVisible[item.id] ? 'Ocultar detalles' : 'Mostrar detalles'}
                                                    style={{ marginLeft: '10px' }}
                                                >
                                                    {nestedDetailsVisible[item.id] ? '▲' : '▼'}
                                                </button>
                                            </td>
                                           <td className="quantity-cell">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    // SOLO establecer max para venta directa
                                                    max={
                                                        (ventaData.tipo_venta === 'directa' || ventaData.tipo_venta === 'venta directa') 
                                                            ? item.disponible 
                                                            : undefined
                                                    }
                                                    value={item.cantidad || 1}
                                                    onChange={e =>
                                                        handleCantidadChange(item.id, parseInt(e.target.value) || 1)
                                                    }
                                                    className="quantity-input"
                                                />
                                                {/* SOLO mostrar disponibilidad para venta directa */}
                                                {(ventaData.tipo_venta === 'directa' || ventaData.tipo_venta === 'venta directa') && (
                                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                                                        Máx: {item.disponible}
                                                    </div>
                                                )}
                                                {/* Mostrar mensaje informativo para pedidos */}
                                                {ventaData.tipo_venta === 'pedido' && (
                                                    <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '2px' }}>
                                                        Sin límite (se producirá)
                                                    </div>
                                                )}
                                            </td>
                                            <td className="price-cell">${item.precio.toLocaleString('es-CO')}</td>
                                            <td className="action-cell">
                                                <button type="button" className="btn-small" onClick={() => abrirModalAdiciones(item.id)}>+ Adición</button>
                                            </td>
                                            <td className="action-cell">
                                                <button type="button" className="btn-small" onClick={() => abrirModalSalsas(item.id)}>+ Salsa</button>
                                            </td>
                                            <td className="action-cell">
                                                <button type="button" className="btn-small" onClick={() => abrirModalRellenos(item.id)}>+ Relleno</button>
                                            </td>
                                            <td className="subtotal-cell">
                                                ${((item.precio * (item.cantidad || 1)) +
                                                    (item.adiciones?.slice(2)?.reduce((acc, ad) => acc + (ad.precio * (ad.cantidad || 1)), 0) || 0) +
                                                    (item.sabores?.reduce((acc, re) => acc + (re.precio * (re.cantidad || 1)), 0) || 0)
                                                ).toLocaleString('es-CO')}
                                            </td>
                                            <td className="action-cell">
                                                <button
                                                    type="button"
                                                    className="delete-btn"
                                                    onClick={() => removeInsumo(item.id)}
                                                    title="Eliminar producto"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                        {nestedDetailsVisible[item.id] && (
                                            <tr>
                                                <td colSpan="8" style={{background: '#f9fafb', padding: '16px'}}>
                                                    {item.adiciones && item.adiciones.length > 0 && (
                                                        <div className="nested-item-list">
                                                            <strong>Adiciones:</strong>
                                                            {item.adiciones.map(ad => (
                                                                <div key={ad.id}>
                                                                    {ad.nombre} (${ad.precio.toLocaleString('es-CO')})
                                                                    <button type="button" className="btn-small btn-eliminar-nested" onClick={() => removeAdicion(item.id, ad.id)}>x</button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {item.salsas && item.salsas.length > 0 && (
                                                        <div className="nested-item-list">
                                                            <strong>Salsas:</strong>
                                                            {item.salsas.map(sa => (
                                                                <div key={sa.id}>
                                                                    {sa.nombre} (${sa.precio.toLocaleString('es-CO')})
                                                                    <button type="button" className="btn-small btn-eliminar-nested" onClick={() => removeSalsa(item.id, sa.id)}>x</button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {item.sabores && item.sabores.length > 0 && (
                                                        <div className="nested-item-list">
                                                            <strong>Rellenos:</strong>
                                                            {item.sabores.map(re => (
                                                                <div key={re.id}>
                                                                    {re.nombre} (${re.precio.toLocaleString('es-CO')})
                                                                    <button type="button" className="btn-small btn-eliminar-nested" onClick={() => removeRelleno(item.id, re.id)}>x</button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {(!item.adiciones || item.adiciones.length === 0) && 
                                                     (!item.salsas || item.salsas.length === 0) && 
                                                     (!item.sabores || item.sabores.length === 0) && (
                                                        <p style={{margin: 0, color: '#6b7280'}}>No hay adiciones, salsas o rellenos añadidos.</p>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <button
                    type="button"
                    className="add-products-btn"
                    onClick={handleAbrirModal}
                >
                    <span className="btn-icon">+</span>
                    Agregar Productos
                </button>
            </div>

            {/* Tarjetas de totales */}
            <div className="totals-section">
                <div className="totals-grid">
                    <div className="total-card subtotal-card">
                        <div className="card-icon" style={{color: '#ec4899'}}>💰</div>
                        <div className="card-content">
                            <div className="card-label">Subtotal</div>
                            <div className="card-value">${subtotal.toLocaleString('es-CO')}</div>
                        </div>
                    </div>
                    
                    <div className="total-card total-card-main">
                        <div className="card-icon" style={{color: '#ec4899'}}>💎</div>
                        <div className="card-content">
                            <div className="card-label">Total</div>
                            <div className="card-value total-value">${total.toLocaleString('es-CO')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="action-buttons">
                <button
                    type="button"
                    className="btn btn-cancel"
                    onClick={() => setMostrarAgregarVenta(false)}
                >
                    Cancelar
                </button>
                <button 
                    className="btn btn-save" 
                    onClick={handleSubmit}
                >
                    <span className="btn-icon">💾</span>
                    Guardar
                </button>
            </div>

            {mostrarModalInsumos && (
                <AgregarProductosModal
                    onClose={() => setMostrarModalInsumos(false)}
                    onAgregar={agregarInsumos}
                    sedeSeleccionada={ventaData.sede}
                    tipoVenta={ventaData.tipo_venta}
                    insumosSeleccionados={insumosSeleccionados}
                />
            )}

            {mostrarModalAdiciones && (
                <AgregarAdicionesModal
                    onClose={() => { setMostrarModalAdiciones(false); setProductoEditandoId(null); }}
                    onAgregar={agregarAdiciones}
                    adicionesSeleccionadas={insumosSeleccionados.find(item => item.id === productoEditandoId)?.adiciones || []}
                />
            )}
            
            {mostrarModalSalsas && (
                <AgregarSalsasModal
                    onClose={() => { setMostrarModalSalsas(false); setProductoEditandoId(null); }}
                    onAgregar={agregarSalsas}
                    salsasSeleccionadas={insumosSeleccionados.find(item => item.id === productoEditandoId)?.salsas || []}
                />
            )}
            
            {mostrarModalRellenos && (
                <AgregarRellenosModal
                    onClose={() => { setMostrarModalRellenos(false); setProductoEditandoId(null); }}
                    onAgregar={agregarRellenos}
                    rellenosSeleccionados={insumosSeleccionados.find(item => item.id === productoEditandoId)?.sabores || []}
                />
            )}
        </div>
    );
}