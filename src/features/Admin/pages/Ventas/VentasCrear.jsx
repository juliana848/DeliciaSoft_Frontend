// VentasCrear.jsx - Actualizado para consumir APIs
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

    // Función para obtener la fecha de hoy en formato YYYY-MM-DD
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Cargar clientes al montar el componente
    useEffect(() => {
        fetchClientes();
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
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            setErrorClientes('Error al cargar clientes');
            
            // Clientes de fallback
            setClientes([
                {
                    idcliente: null,
                    nombreCompleto: 'Cliente Genérico'
                }
            ]);
        } finally {
            setLoadingClientes(false);
        }
    };

    // Manejar cambio de cliente
    const handleClienteChange = (e) => {
        const selectedValue = e.target.value;
        const selectedCliente = clientes.find(c => c.nombreCompleto === selectedValue);
        
        // Llamar al handleChange original para actualizar ventaData.cliente
        handleChange(e);
        
        // Si se necesita también almacenar el ID del cliente
        if (selectedCliente && selectedCliente.idcliente) {
            handleChange({
                target: {
                    name: 'clienteId',
                    value: selectedCliente.idcliente
                }
            });
        }
    };

    // Calcular las fechas min y max para la fecha de entrega
    const today = new Date();
    const minDeliveryDate = new Date();
    minDeliveryDate.setDate(today.getDate() + 15); // 15 días después de hoy

    const maxDeliveryDate = new Date();
    maxDeliveryDate.setMonth(today.getMonth() + 2); // 2 meses después de hoy

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
            
            // Preparar los datos para el servicio de venta
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
                    // Incluir adiciones, salsas y sabores si están implementados
                    adiciones: producto.adiciones || [],
                    salsas: producto.salsas || [],
                    sabores: producto.sabores || []
                }))
            };
            
            console.log('Datos preparados para enviar:', datosVenta);
            
            // Llamar a la función original de guardar
            await guardarVenta(datosVenta);
            
        } catch (error) {
            console.error('Error al procesar la venta:', error);
            // El manejo de errores se puede hacer en el componente padre
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
                    
                    <div className={`field-group ${erroresValidacion.sede ? 'has-error' : ''}`}>
                        <label>Sede <span style={{ color: 'red' }}>*</span></label>
                        <select
                            name="sede"
                            value={ventaData.sede}
                            onChange={handleChange}
                            className={erroresValidacion.sede ? 'field-error' : ''}
                            required
                        >
                            <option value="">Seleccione</option>
                            <option value="San Pablo">San Pablo</option>
                            <option value="San Benito">San Benito</option>
                        </select>
                        {erroresValidacion.sede && (
                            <span className="error-message">{erroresValidacion.sede}</span>
                        )}
                    </div>
                    
                    <div className={`field-group ${erroresValidacion.cliente ? 'has-error' : ''}`}>
                        <label>Cliente <span style={{ color: 'red' }}>*</span></label>
                        {loadingClientes ? (
                            <select disabled>
                                <option>Cargando clientes...</option>
                            </select>
                        ) : (
                            <select
                                name="cliente"
                                value={ventaData.cliente}
                                onChange={handleClienteChange}
                                className={erroresValidacion.cliente ? 'field-error' : ''}
                                required
                            >
                                <option value="">Seleccione</option>
                                {clientes.map((cliente, index) => (
                                    <option key={cliente.idcliente || index} value={cliente.nombreCompleto}>
                                        {cliente.nombreCompleto}
                                    </option>
                                ))}
                            </select>
                        )}
                        {errorClientes && (
                            <span className="error-message">{errorClientes}</span>
                        )}
                        {erroresValidacion.cliente && (
                            <span className="error-message">{erroresValidacion.cliente}</span>
                        )}
                    </div>
                    
                    <div className={`field-group ${erroresValidacion.metodo_pago ? 'has-error' : ''}`}>
                        <label>Método de Pago <span style={{ color: 'red' }}>*</span></label>
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
                                        {/* Fila Principal del Producto */}
                                        <tr>
                                            <td>
                                                {item.nombre}
                                                {/* Botón para alternar visibilidad de detalles anidados */}
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
                        <span>IVA (16%):</span>
                        <span>${iva.toLocaleString('es-CO')}</span>
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
        </div>
    );
}