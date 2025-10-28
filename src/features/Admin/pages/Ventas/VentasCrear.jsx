// VentasCrear.jsx - CORREGIDO: Funciones de toppings agregadas
import React, { useEffect, useState } from 'react';
import AgregarProductosModal from '../../components/catalogos/AgregarProductosModal';
import AgregarAdicionesModal from '../../components/catalogos/AgregarAdicionesModal';
import AgregarSalsasModal from '../../components/catalogos/AgregarSalsasModal';
import AgregarRellenosModal from '../../components/catalogos/AgregarRellenosModal';
import AgregarToppingsModal from '../../components/catalogos/AgregarToppingsModal';
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
    showNotification,
    // ✅ PROPS ADICIONALES PARA TOPPINGS
    abrirModalToppings,
    removeTopping,
    mostrarModalToppings,
    setMostrarModalToppings,
    agregarToppings,
    configuraciones,
    setConfiguraciones,
    setInsumosSeleccionados
}) {
    const [clientes, setClientes] = useState([]);
    const [loadingClientes, setLoadingClientes] = useState(true);
    const [errorClientes, setErrorClientes] = useState('');
    const [sedes, setSedes] = useState([]);
    const [loadingSedes, setLoadingSedes] = useState(true);
    const [errorSedes, setErrorSedes] = useState('');
    const [inputCliente, setInputCliente] = useState('');
    const [clientesFiltrados, setClientesFiltrados] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        fetchClientes();
        fetchSedes();
    }, []);

    // Cargar configuraciones cuando cambian los productos
    useEffect(() => {
        cargarConfiguraciones();
    }, [insumosSeleccionados]);

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

    // FUNCIÓN PARA CARGAR CONFIGURACIONES DE PRODUCTOS
    const cargarConfiguraciones = async () => {
        const configs = {};
        for (const producto of insumosSeleccionados) {
            if (!configuraciones[producto.id]) {
                try {
                    const response = await fetch(
                        `https://deliciasoft-backend-i6g9.onrender.com/api/configuracion-producto/producto/${producto.id}`
                    );
                    if (response.ok) {
                        const config = await response.json();
                        configs[producto.id] = config;
                    } else {
                        configs[producto.id] = {
                            permiteToppings: false,
                            permiteSalsas: false,
                            permiteRellenos: false,
                            permiteAdiciones: false,
                            limiteTopping: 0,
                            limiteSalsa: 0,
                            limiteRelleno: 0
                        };
                    }
                } catch (error) {
                    console.error(`Error al cargar config para producto ${producto.id}:`, error);
                    configs[producto.id] = {
                        permiteToppings: false,
                        permiteSalsas: false,
                        permiteRellenos: false,
                        permiteAdiciones: false,
                        limiteTopping: 0,
                        limiteSalsa: 0,
                        limiteRelleno: 0
                    };
                }
            }
        }
        setConfiguraciones(prev => ({ ...prev, ...configs }));
    };

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

    const fetchSedes = async () => {
        try {
            setLoadingSedes(true);
            setErrorSedes('');
            const response = await fetch('https://deliciasoft-backend-i6g9.onrender.com/api/sede', {
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

    const handleInputFocus = () => {
        setMostrarSugerencias(true);
        if (clientesFiltrados.length === clientes.length && inputCliente === '') {
            filtrarClientes('');
        }
    };

    const handleInputBlur = () => {
        setTimeout(() => {
            setMostrarSugerencias(false);
        }, 200);
    };

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
                    toppings: producto.toppings || [],
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

    const obtenerBotonesCatalogo = (productoId) => {
        const config = configuraciones[productoId];
        if (!config) return null;

        const botones = [];

        if (config.permiteToppings) {
            botones.push({
                key: 'toppings',
                label: 'Toppings',
                limite: config.limiteTopping,
                onClick: () => abrirModalToppings(productoId)
            });
        }

        if (config.permiteSalsas) {
            botones.push({
                key: 'salsas',
                label: 'Salsas',
                limite: config.limiteSalsa,
                onClick: () => abrirModalSalsas(productoId)
            });
        }

        if (config.permiteRellenos) {
            botones.push({
                key: 'rellenos',
                label: 'Rellenos',
                limite: config.limiteRelleno,
                onClick: () => abrirModalRellenos(productoId)
            });
        }

        if (config.permiteAdiciones) {
            botones.push({
                key: 'adiciones',
                label: 'Adiciones',
                onClick: () => abrirModalAdiciones(productoId)
            });
        }

        return botones;
    };

    return (
        <div className="compra-form-container">
            <div className="header-info">
                <div className="info-badge">
                    <span className="badge-icon">🛒</span>
                    <span>Clientes cargados: {clientes?.length || 0}</span>
                </div>
            </div>

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
                            <>
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
                                
                                <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="field-label">Observaciones</label>
                                    <textarea
                                        name="observaciones"
                                        value={ventaData.observaciones || ''}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Ingrese observaciones del pedido (opcional)..."
                                        rows="3"
                                        style={{ resize: 'vertical', minHeight: '80px' }}
                                    />
                                </div>
                            </>
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
                                <th style={{ width: '250px' }}>Catálogos</th>
                                <th>Subtotal Item</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {insumosSeleccionados.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>
                                        No hay productos en esta venta
                                    </td>
                                </tr>
                            ) : (
                                insumosSeleccionados.map(item => (
                                    <React.Fragment key={item.id}>
                                        <tr className="product-row">
                                            <td className="product-name">
                                                {item.nombre}
                                                {nestedDetailsVisible[item.id] !== undefined && (
                                                    <button
                                                        type="button"
                                                        className="btn-small toggle-details-btn"
                                                        onClick={() => toggleNestedDetails(item.id)}
                                                        title={nestedDetailsVisible[item.id] ? 'Ocultar detalles' : 'Mostrar detalles'}
                                                        style={{ marginLeft: '10px' }}
                                                    >
                                                        {nestedDetailsVisible[item.id] ? '▲' : '▼'}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="quantity-cell">
                                                <input
                                                    type="number"
                                                    min={1}
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
                                                {(ventaData.tipo_venta === 'directa' || ventaData.tipo_venta === 'venta directa') && (
                                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                                                        Máx: {item.disponible}
                                                    </div>
                                                )}
                                                {ventaData.tipo_venta === 'pedido' && (
                                                    <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '2px' }}>
                                                        Sin límite (se producirá)
                                                    </div>
                                                )}
                                            </td>
                                            <td className="price-cell">${item.precio.toLocaleString('es-CO')}</td>
                                            
                                            <td className="catalog-buttons-cell">
                                                {(() => {
                                                    const botones = obtenerBotonesCatalogo(item.id);
                                                    if (!botones || botones.length === 0) {
                                                        return <span style={{ color: '#9ca3af', fontSize: '12px' }}>Sin catálogos</span>;
                                                    }
                                                    return (
                                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                            {botones.map(btn => {
                                                                const itemsCatalogo = item[btn.key] || [];
                                                                const count = itemsCatalogo.length;
                                                                const limiteAlcanzado = btn.limite && count >= btn.limite;
                                                                
                                                                return (
                                                                    <button
                                                                        key={btn.key}
                                                                        type="button"
                                                                        className="btn-small"
                                                                        onClick={btn.onClick}
                                                                        disabled={limiteAlcanzado}
                                                                        style={{
                                                                            opacity: limiteAlcanzado ? 0.5 : 1,
                                                                            cursor: limiteAlcanzado ? 'not-allowed' : 'pointer',
                                                                            background: limiteAlcanzado ? '#e5e7eb' : undefined,
                                                                            fontSize: '12px',
                                                                            padding: '5px 10px'
                                                                        }}
                                                                        title={`${btn.label}${btn.limite ? ` (${count}/${btn.limite})` : count > 0 ? ` (${count})` : ''}`}
                                                                    >
                                                                        + {btn.label}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            
                                            <td className="subtotal-cell">
                                                ${((item.precio * (item.cantidad || 1)) +
                                                    (item.adiciones?.reduce((acc, ad) => acc + (ad.precio * (ad.cantidad || 1)), 0) || 0)
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
                                                <td colSpan="6" style={{background: '#f9fafb', padding: '16px'}}>
                                                    {item.toppings && item.toppings.length > 0 && (
                                                        <div className="nested-item-list">
                                                            <strong>Toppings:</strong>
                                                            {item.toppings.map(t => (
                                                                <div key={t.id}>
                                                                    {t.nombre}
                                                                    <button type="button" className="btn-small btn-eliminar-nested" onClick={() => removeTopping(item.id, t.id)}>x</button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
                                                    {item.salsas && item.salsas.length > 0 && (
                                                        <div className="nested-item-list">
                                                            <strong>Salsas:</strong>
                                                            {item.salsas.map(sa => (
                                                                <div key={sa.id}>
                                                                    {sa.nombre}
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
                                                                    {re.nombre}
                                                                    <button type="button" className="btn-small btn-eliminar-nested" onClick={() => removeRelleno(item.id, re.id)}>x</button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
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
                                                    
                                                    {(!item.toppings || item.toppings.length === 0) && 
                                                     (!item.adiciones || item.adiciones.length === 0) && 
                                                     (!item.salsas || item.salsas.length === 0) && 
                                                     (!item.sabores || item.sabores.length === 0) && (
                                                        <p style={{margin: 0, color: '#6b7280'}}>No hay catálogos añadidos.</p>
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

            {/* MODALES */}
            {mostrarModalInsumos && (
                <AgregarProductosModal
                    onClose={() => setMostrarModalInsumos(false)}
                    onAgregar={agregarInsumos}
                    sedeSeleccionada={ventaData.sede}
                    tipoVenta={ventaData.tipo_venta}
                    insumosSeleccionados={insumosSeleccionados}
                />
            )}

            {mostrarModalToppings && (
                <AgregarToppingsModal
                    onClose={() => { 
                        setMostrarModalToppings(false); 
                        setProductoEditandoId(null); 
                    }}
                    onAgregar={agregarToppings}
                    limiteMaximo={configuraciones[productoEditandoId]?.limiteTopping || null}
                />
            )}

            {mostrarModalAdiciones && (
                <AgregarAdicionesModal
                    onClose={() => { 
                        setMostrarModalAdiciones(false); 
                        setProductoEditandoId(null); 
                    }}
                    onAgregar={agregarAdiciones}
                    adicionesSeleccionadas={insumosSeleccionados.find(item => item.id === productoEditandoId)?.adiciones || []}
                />
            )}
            
            {mostrarModalSalsas && (
                <AgregarSalsasModal
                    onClose={() => { 
                        setMostrarModalSalsas(false); 
                        setProductoEditandoId(null); 
                    }}
                    onAgregar={agregarSalsas}
                    limiteMaximo={configuraciones[productoEditandoId]?.limiteSalsa || null}
                    salsasSeleccionadas={insumosSeleccionados.find(item => item.id === productoEditandoId)?.salsas || []}
                />
            )}
            
            {mostrarModalRellenos && (
                <AgregarRellenosModal
                    onClose={() => { 
                        setMostrarModalRellenos(false); 
                        setProductoEditandoId(null); 
                    }}
                    onAgregar={agregarRellenos}
                    limiteMaximo={configuraciones[productoEditandoId]?.limiteRelleno || null}
                    rellenosSeleccionados={insumosSeleccionados.find(item => item.id === productoEditandoId)?.sabores || []}
                />
            )}
        </div>
    );
}