// VentasCrear.jsx - Actualizado con carga dinámica de sedes
import React, { useEffect, useState } from 'react';
import AgregarProductosModal from '../../components/catalogos/AgregarProductosModal';
import AgregarAdicionesModal from '../../components/catalogos/AgregarAdicionesModal';
import AgregarSalsasModal from '../../components/catalogos/AgregarSalsasModal';
import AgregarRellenosModal from '../../components/catalogos/AgregarRellenosModal';
import clienteApiService from '../../services/cliente_services';
import ventaApiService from '../../services/venta_services';
import '../../adminStyles.css';

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
    productoEditandoId
}) {
    // Estados para clientes
    const [clientes, setClientes] = useState([]);
    const [loadingClientes, setLoadingClientes] = useState(true);
    const [errorClientes, setErrorClientes] = useState('');
    
    // Estados para sedes - NUEVOS
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
        fetchSedes(); // NUEVA FUNCIÓN
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
            
            console.log('Cargando clientes desde API...');
            const clientesData = await clienteApiService.obtenerClientesParaVenta();
            console.log('Clientes cargados:', clientesData);
            
            setClientes(clientesData);
            setClientesFiltrados(clientesData);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            setErrorClientes('Error al cargar clientes');
            
            // Clientes de fallback
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

    // NUEVA FUNCIÓN: Cargar sedes desde la API
    const fetchSedes = async () => {
        try {
            setLoadingSedes(true);
            setErrorSedes('');
            
            console.log('Cargando sedes desde API...');
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
            console.log('Sedes cargadas:', sedesData);
            
            // Filtrar solo las sedes activas
            const sedesActivas = sedesData.filter(sede => sede.estado === true);
            setSedes(sedesActivas);
            
        } catch (error) {
            console.error('Error al cargar sedes:', error);
            setErrorSedes('Error al cargar sedes');
            
            // Sedes de fallback
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

        // Verificar si el valor ingresado coincide exactamente con un documento
        const clienteEncontrado = clientes.find(cliente => 
            cliente.numeroDocumento && 
            cliente.numeroDocumento.toString() === valor.trim()
        );

        if (clienteEncontrado) {
            // Auto-completar con el nombre del cliente
            setInputCliente(clienteEncontrado.nombreCompleto);
            seleccionarCliente(clienteEncontrado);
            setMostrarSugerencias(false);
        } else {
            // Resetear la selección si no hay coincidencia exacta
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

        // Actualizar los datos del formulario
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

        console.log('Cliente seleccionado:', cliente);
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
        // Usar setTimeout para permitir que se ejecute el onClick de las sugerencias
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
            console.log('Preparando datos de venta para enviar...');
            console.log('Datos actuales de venta:', ventaData);
            console.log('Productos seleccionados:', insumosSeleccionados);
            
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
                    adiciones: producto.adiciones || [],
                    salsas: producto.salsas || [],
                    sabores: producto.sabores || []
                }))
            };
            
            console.log('Datos preparados para enviar:', datosVenta);
            await guardarVenta(datosVenta);
            
        } catch (error) {
            console.error('Error al procesar la venta:', error);
        }
    };

    return (
        <div className="compra-form-container">
            <h1>Agregar Venta</h1>

            <form onSubmit={handleSubmit}>
                <div className="compra-fields-grid">
                    <div className={`field-group ${erroresValidacion.tipo_venta ? 'has-error' : ''}`}>
                        <label>Tipo de Venta <span style={{ color: 'red' }}>*</span></label>
                        <select
                            name="tipo_venta"
                            value={ventaData.tipo_venta}
                            onChange={handleChange}
                            className={erroresValidacion.tipo_venta ? 'field-error' : ''}
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
                    
                    <div className={`field-group ${erroresValidacion.fecha_venta ? 'has-error' : ''}`}>
                        <label>Fecha de Venta</label>
                        <input
                            type="date"
                            name="fecha_venta"
                            value={ventaData.fecha_venta}
                            onChange={handleChange}
                            className={erroresValidacion.fecha_venta ? 'field-error' : ''}
                            required
                            disabled
                        />
                        {erroresValidacion.fecha_venta && (
                            <span className="error-message">{erroresValidacion.fecha_venta}</span>
                        )}
                    </div>
                    
                    {ventaData.tipo_venta === 'pedido' && (
                        <div className={`field-group ${erroresValidacion.fecha_entrega ? 'has-error' : ''}`}>
                            <label>Fecha de Entrega <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="date"
                                name="fecha_entrega"
                                value={ventaData.fecha_entrega || ''}
                                onChange={handleChange}
                                className={erroresValidacion.fecha_entrega ? 'field-error' : ''}
                                required={ventaData.tipo_venta === 'pedido'}
                                min={minDateFormatted}
                                max={maxDateFormatted}
                            />
                            {erroresValidacion.fecha_entrega && (
                                <span className="error-message">{erroresValidacion.fecha_entrega}</span>
                            )}
                        </div>
                    )}
                    
                    {/* CAMPO DE SEDE ACTUALIZADO CON CARGA DINÁMICA */}
                    <div className={`field-group ${erroresValidacion.sede ? 'has-error' : ''}`}>
                        <label>Sede <span style={{ color: 'red' }}>*</span></label>
                        {loadingSedes ? (
                            <select disabled className="field-disabled">
                                <option>Cargando sedes...</option>
                            </select>
                        ) : (
                            <select
                                name="sede"
                                value={ventaData.sede}
                                onChange={handleChange}
                                className={erroresValidacion.sede ? 'field-error' : ''}
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
                    
                    {/* CAMPO DE CLIENTE CON DATALIST */}
                    <div className={`field-group ${erroresValidacion.cliente ? 'has-error' : ''}`} style={{ position: 'relative' }}>
                        <label>Cliente <span style={{ color: 'red' }}>*</span></label>
                        {loadingClientes ? (
                            <input
                                type="text"
                                placeholder="Cargando clientes..."
                                disabled
                                className="field-disabled"
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
                                    className={erroresValidacion.cliente ? 'field-error' : ''}
                                    required
                                    autoComplete="off"
                                />
                                
                                {/* Lista de sugerencias */}
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
                    
                    <div className={`field-group ${erroresValidacion.metodo_pago ? 'has-error' : ''}`}>
                        <label>Metodo de Pago <span style={{ color: 'red' }}>*</span></label>
                        <select
                            name="metodo_pago"
                            value={ventaData.metodo_pago}
                            onChange={handleChange}
                            className={erroresValidacion.metodo_pago ? 'field-error' : ''}
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
                
                <div className="section-divider"></div>
                
                <div className="detalle-section">
                    <h2>Detalle:</h2>
                    {insumosSeleccionados.length > 0 && (
                        <table className="compra-detalle-table">
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
                                {insumosSeleccionados.map(item => (
                                    <React.Fragment key={item.id}>
                                        <tr>
                                            <td>
                                                {item.nombre}
                                                <button
                                                    type="button"
                                                    className="btn-small toggle-details-btn"
                                                    onClick={() => toggleNestedDetails(item.id)}
                                                    title={nestedDetailsVisible[item.id] ? 'Ocultar detalles' : 'Mostrar detalles'}
                                                    style={{ marginLeft: '10px', padding: '2px 6px', fontSize: '10px' }}
                                                >
                                                    {nestedDetailsVisible[item.id] ? '▲' : '▼'}
                                                </button>
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={item.cantidad || 1}
                                                    onChange={e =>
                                                        handleCantidadChange(item.id, parseInt(e.target.value) || 1)
                                                    }
                                                />
                                            </td>
                                            <td>${item.precio.toLocaleString('es-CO')}</td>
                                            <td>
                                                <button type="button" className="btn-small" onClick={() => abrirModalAdiciones(item.id)}>+ Adición</button>
                                            </td>
                                            <td>
                                                <button type="button" className="btn-small" onClick={() => abrirModalSalsas(item.id)}>+ Salsa</button>
                                            </td>
                                            <td>
                                                <button type="button" className="btn-small" onClick={() => abrirModalRellenos(item.id)}>+ Relleno</button>
                                            </td>
                                            <td>
                                                ${((item.precio * (item.cantidad || 1)) +
                                                    (item.adiciones?.slice(2)?.reduce((acc, ad) => acc + (ad.precio * (ad.cantidad || 1)), 0) || 0) +
                                                    (item.sabores?.reduce((acc, re) => acc + (re.precio * (re.cantidad || 1)), 0) || 0)
                                                ).toLocaleString('es-CO')}
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn-eliminar"
                                                    onClick={() => removeInsumo(item.id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                        {nestedDetailsVisible[item.id] && (
                                            <tr>
                                                <td colSpan="3"></td>
                                                <td colSpan="5">
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
                                                        <p>No hay adiciones, salsas o rellenos añadidos.</p>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <button
                        type="button"
                        className="btn-agregar-insumos"
                        onClick={() => setMostrarModalInsumos(true)}
                    >
                        + Agregar
                    </button>
                    {erroresValidacion.productos && (
                        <div className="error-message" style={{ marginTop: '8px', textAlign: 'center' }}>
                            {erroresValidacion.productos}
                        </div>
                    )}
                </div>

                <div className="compra-totales-grid">
                    <div className="total-item">
                        <span>Subtotal:</span>
                        <span>${subtotal.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="total-item">
                        <span>Total:</span>
                        <span>${total.toLocaleString('es-CO')}</span>
                    </div>
                </div>

                <div className="compra-header-actions">
                    <button
                        type="button"
                        className="modal-btn cancel-btn"
                        onClick={() => setMostrarAgregarVenta(false)}
                    >
                        Cancelar
                    </button>
                    <button className="modal-btn save-btn" type="submit">
                        Guardar
                    </button>
                </div>
            </form>

            {mostrarModalInsumos && (
                <AgregarProductosModal
                    onClose={() => setMostrarModalInsumos(false)}
                    onAgregar={agregarInsumos}
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

            <style jsx>{`
                .clientes-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    max-height: 200px;
                    overflow-y: auto;
                    z-index: 1000;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                
                .cliente-option {
                    padding: 8px 12px;
                    cursor: pointer;
                    border-bottom: 1px solid #f0f0f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .cliente-option:hover {
                    background-color: #f5f5f5;
                }
                
                .cliente-option:last-child {
                    border-bottom: none;
                }
                
                .cliente-nombre {
                    font-weight: 500;
                    color: #333;
                }
                
                .cliente-documento {
                    font-size: 0.9em;
                    color: #666;
                    font-style: italic;
                }
                
                .field-disabled {
                    background-color: #f5f5f5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}