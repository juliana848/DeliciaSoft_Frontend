import React, { useState, useEffect } from 'react';
import AgregarInsumosModal from '../../../components/AgregarInsumosModal';
import ProveedorAutocomplete from './ProveedorAutocomplete';
import { obtenerFechaColombia, esFechaValidaColombia } from '../comprasCrud/Utils/fechaUtils';
import './styles/CompraForm.css';

export default function CompraForm({
    compraData,
    setCompraData,
    insumosSeleccionados,
    setInsumosSeleccionados,
    proveedores,
    errores,
    setErrores,
    modalTipo,
    cargando,
    onGuardar,
    onCancelar,
    onAbrirModalProveedor,
    buscarProveedor,
    setBuscarProveedor,
    mostrarModalInsumos,
    setMostrarModalInsumos
}) {
    const [datosLocales, setDatosLocales] = useState({
        idProveedor: '',
        proveedor: '',
        documentoProveedor: '',
        fechaCompra: '',
        fechaRegistro: obtenerFechaColombia() 
    });
    
    const [insumosLocales, setInsumosLocales] = useState([]);

useEffect(() => {
        console.log('=== CARGANDO DATOS EN COMPRAFORM ===');
        console.log('modalTipo:', modalTipo);
        console.log('compraData COMPLETO:', JSON.stringify(compraData, null, 2));
        
        if (compraData && modalTipo === 'ver') {
            const proveedor = compraData.proveedor?.nombreproveedor || 
                            compraData.proveedor?.nombreempresa || 
                            compraData.proveedor?.nombre ||
                            compraData.nombreProveedor || '';
            
            // Buscar documento en todas las posibles ubicaciones
            const documento = compraData.proveedor?.documento || 
                            compraData.proveedor?.nit ||
                            compraData.proveedor?.documentoProveedor ||
                            compraData.documentoProveedor ||
                            compraData.documento_proveedor || // Agregado: formato snake_case
                            '';
            
            const fechaCompra = compraData.fechacompra || compraData.fechaCompra;
            const fechaRegistro = compraData.fecharegistro || compraData.fechaRegistro;
            
            console.log('Proveedor encontrado:', proveedor);
            console.log('Documento encontrado:', documento);
            console.log('Estructura proveedor completa:', compraData.proveedor);
            
            setDatosLocales({
                idProveedor: compraData.idproveedor || compraData.idProveedor,
                proveedor: proveedor,
                documentoProveedor: documento,
                fechaCompra: fechaCompra ? new Date(fechaCompra).toISOString().split('T')[0] : '',
                fechaRegistro: fechaRegistro ? new Date(fechaRegistro).toISOString().split('T')[0] : ''
            });

            let detalles = [];
            
            if (compraData.detallecompra && Array.isArray(compraData.detallecompra)) {
                detalles = compraData.detallecompra;
            } else if (compraData.detalles && Array.isArray(compraData.detalles)) {
                detalles = compraData.detalles;
            }

            if (detalles.length > 0) {
                const insumosFormateados = detalles.map(detalle => {
                    return {
                        id: detalle.idinsumos || detalle.idInsumo || detalle.id,
                        nombre: detalle.nombreInsumo || 
                        detalle.insumos?.nombreinsumo || 
                        detalle.insumo?.nombre ||
                        `Insumo ${detalle.idinsumos || detalle.idInsumo}`,
                        cantidad: parseInt(detalle.cantidad) || 0,
                        precio: parseFloat(detalle.preciounitario || detalle.precioUnitario) || 0,
                        precioUnitario: parseFloat(detalle.preciounitario || detalle.precioUnitario) || 0,
                        unidad: detalle.unidadMedida || 
                               detalle.insumos?.unidadmedida?.unidadmedida ||
                               detalle.insumo?.unidad || 
                               'Unidad'
                    };
                });
                
                setInsumosLocales(insumosFormateados);
            }
        }
    }, [compraData, modalTipo]);

    const datosAUsar = (modalTipo === 'ver' && compraData) ? datosLocales : (compraData || {
        idProveedor: '',
        proveedor: '',
        documentoProveedor: '',
        fechaCompra: '',
        fechaRegistro: new Date().toISOString().split('T')[0]
    });
    
    const insumosAUsar = (modalTipo === 'ver' && compraData) ? insumosLocales : (insumosSeleccionados || []);

    const formatoCOP = (valor) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    };

    const obtenerFechaActual = () => obtenerFechaColombia();

    const validarFecha = (fecha) => {
        if (!fecha) return 'La fecha de compra es obligatoria';
        
        if (!esFechaValidaColombia(fecha)) {
            return 'La fecha de compra no puede ser mayor al día presente';
        }

        return '';
    };

    const validarProveedor = (idProveedor) => {
        if (!idProveedor) return 'Debe seleccionar un proveedor';
        return '';
    };

    const validarInsumos = (insumos) => {
        if (insumos.length === 0) return 'Debe agregar al menos un insumo';
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'idProveedor') {
            const provSel = proveedores.find(p => p.idProveedor === Number(value));
            setCompraData(prev => ({
                ...prev,
                idProveedor: value ? Number(value) : null,
                proveedor: provSel?.nombre || provSel?.nombreProveedor || provSel?.nombreempresa || '',
                documentoProveedor: provSel?.documento || provSel?.nit || ''
            }));
            setErrores(prev => ({ ...prev, proveedor: provSel ? '' : 'Debe seleccionar un proveedor' }));
        } else {
            setCompraData(prev => ({ ...prev, [name]: value }));
            if (name === 'fechaCompra') {
                setErrores(prev => ({ ...prev, fecha_compra: validarFecha(value) }));
            }
        }
    };

    const agregarInsumos = (nuevos) => {
        const nuevosInsumosNormalizados = nuevos.map(insumo => ({
            ...insumo,
            cantidad: parseInt(insumo.cantidad) || 1,
            precio: parseFloat(insumo.precio || insumo.precioUnitario) || 0,
            precioUnitario: parseFloat(insumo.precio || insumo.precioUnitario) || 0
        }));

        const nuevosInsumos = [
            ...insumosSeleccionados,
            ...nuevosInsumosNormalizados.filter(n => !insumosSeleccionados.some(i => i.id === n.id))
        ];
        
        setInsumosSeleccionados(nuevosInsumos);
        setErrores(prev => ({ ...prev, insumos: validarInsumos(nuevosInsumos) }));
    };

    const handleCantidadChange = (id, value) => {
        const val = Math.max(1, parseInt(value) || 1);
        setInsumosSeleccionados(prev =>
            prev.map(item => (item.id === id ? { ...item, cantidad: val } : item))
        );
    };

    const removeInsumo = (id) => {
        const nuevosInsumos = insumosSeleccionados.filter(item => item.id !== id);
        setInsumosSeleccionados(nuevosInsumos);
        setErrores(prev => ({ ...prev, insumos: validarInsumos(nuevosInsumos) }));
    };

    const validarFormulario = () => {
        const errorProveedor = validarProveedor(datosAUsar.idProveedor);
        const errorFecha = validarFecha(datosAUsar.fechaCompra);
        const errorInsumos = validarInsumos(insumosAUsar);
        
        setErrores({
            proveedor: errorProveedor,
            fecha_compra: errorFecha,
            insumos: errorInsumos
        });
        
        return !errorProveedor && !errorFecha && !errorInsumos;
    };

    const handleGuardar = () => {
        if (validarFormulario()) {
            onGuardar(datosAUsar, insumosAUsar);
        }
    };

    const subtotal = insumosAUsar.reduce((s, i) => s + (i.precio || i.precioUnitario || 0) * (i.cantidad || 0), 0);
    const iva = subtotal * 0.19; 
    const total = subtotal + iva;

    const obtenerTitulo = () => {
        if (modalTipo === 'ver') {
            const estado = compraData?.estado !== false ? 'Activa' : 'Anulada';
            return `Compra ${estado} - #${compraData?.idcompra || compraData?.id || ''}`;
        }
        return modalTipo === 'crear' ? 'Nueva Compra' : 'Editar Compra';
    };

    return (
        <div className="compra-form-container">
            {modalTipo === 'ver' && compraData && (
                <div className={`compra-status-header ${compraData.estado === false ? 'anulada' : 'activa'}`}>
                    <h1 className="compra-title">{obtenerTitulo()}</h1>
                    <div className="status-indicator">
                        <span className={`status-badge ${compraData.estado === false ? 'anulada' : 'activa'}`}>
                            {compraData.estado === false ? '❌ ANULADA' : '✅ ACTIVA'}
                        </span>
                    </div>
                </div>
            )}

            <div className="header-info">
                <div className="info-badge">
                    <span className="badge-icon">📊</span>
                    <span>Proveedores cargados: {proveedores?.length || 0}</span>
                </div>
            </div>
            
            <div className="form-card">
                <h2 className="section-title">
                    <span className="title-icon">🏢</span>
                    Información de la Compra
                </h2>
                
                <div className="form-grid">
                    <div className="field-group">
                        <label className="field-label">Proveedor *</label>
                        <div className="provider-input-group">
                            <ProveedorAutocomplete
                                proveedores={proveedores}
                                value={modalTipo === 'ver' ? datosAUsar.proveedor : (buscarProveedor || '')}
                                onChange={(valor) => {
                                    if (modalTipo !== 'ver' && setBuscarProveedor) {
                                        setBuscarProveedor(valor);
                                    }
                                }}
                                onSelect={(proveedor) => {
                                    if (modalTipo !== 'ver') {
                                        setCompraData(prev => ({
                                            ...prev,
                                            idProveedor: proveedor.idProveedor,
                                            proveedor: proveedor.nombre || proveedor.nombreProveedor || proveedor.nombreempresa,
                                            documentoProveedor: proveedor.documento || proveedor.nit || ''
                                        }));
                                        setErrores(prev => ({ ...prev, proveedor: '' }));
                                        if (setBuscarProveedor) {
                                            setBuscarProveedor(proveedor.nombre || proveedor.nombreProveedor || proveedor.nombreempresa);
                                        }
                                    }
                                }}
                                disabled={modalTipo === 'ver' || cargando}
                                error={!!errores?.proveedor}
                                placeholder="Buscar por nombre o documento..."
                            />
                            
                            {modalTipo !== 'ver' && (
                                <button
                                    type="button"
                                    onClick={onAbrirModalProveedor}
                                    className="add-provider-btn"
                                    title="Agregar nuevo proveedor"
                                    disabled={cargando}
                                >
                                    +
                                </button>
                            )}
                        </div>

                        {errores?.proveedor && (
                            <span className="error-message">{errores.proveedor}</span>
                        )}
                        
                        {modalTipo !== 'ver' && proveedores?.length === 0 && (
                            <small style={{ color: '#f59e0b', fontSize: '12px' }}>
                                No hay proveedores disponibles
                            </small>
                        )}
                        
                        {datosAUsar?.idProveedor && (
                            <small style={{ color: '#ec4899', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                ✓ Seleccionado: {datosAUsar.proveedor}
                            </small>
                        )}
                    </div>

                    <div className="field-group">
                        <label className="field-label">Documento del Proveedor</label>
                        <input
                            type="text"
                            name="documentoProveedor"
                            value={datosAUsar?.documentoProveedor || ''}
                            onChange={handleChange}
                            disabled={true}
                            className="form-input"
                            placeholder="Se llena automáticamente"
                        />
                    </div>
                    
                    <div className="field-group">
                        <label className="field-label">Fecha de compra *</label>
                        <input
                            type="date"
                            name="fechaCompra"
                            value={datosAUsar?.fechaCompra || ''}
                            onChange={handleChange}
                            disabled={modalTipo === 'ver' || cargando}
                            max={obtenerFechaActual()}
                            className={`form-input ${errores?.fecha_compra ? 'error' : ''}`}
                        />
                        {errores?.fecha_compra && (
                            <span className="error-message">{errores.fecha_compra}</span>
                        )}
                    </div>
                    
                    <div className="field-group">
                        <label className="field-label">Fecha de registro</label>
                        <input
                            type="date"
                            name="fechaRegistro"
                            value={datosAUsar?.fechaRegistro || ''}
                            onChange={handleChange}
                            className="form-input"
                            disabled
                        />
                    </div>
                </div>
            </div>
            
            <div className="form-card">
                <h2 className="section-title">
                    <span className="title-icon">📦</span>
                    Detalle de Productos
                </h2>
                
                {errores?.insumos && (
                    <div className="error-banner">
                        <span className="error-icon">⚠️</span>
                        {errores.insumos}
                    </div>
                )}
                                                
                <div className="table-container">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Nombre Producto</th>
                                <th>Cantidad</th>
                                <th>Unidad Medida</th>
                                <th>Precio unitario</th>
                                <th>Subtotal</th> 
                                {modalTipo !== 'ver' && <th>Acción</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {insumosAUsar.length === 0 ? (
                                <tr>
                                    <td colSpan={modalTipo === 'ver' ? 5 : 6} style={{textAlign: 'center', padding: '20px'}}>
                                        No hay productos en esta compra
                                    </td>
                                </tr>
                            ) : (
                                insumosAUsar.map((item) => (
                                    <tr key={item.id} className="product-row">
                                        <td className="product-name">{item.nombre}</td>
                                        <td className="quantity-cell">
                                            {modalTipo === 'ver' ? 
                                                <span className="quantity-display">{item.cantidad}</span> : (
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.cantidad}
                                                        onChange={(e) =>
                                                            handleCantidadChange(item.id, parseInt(e.target.value))
                                                        }
                                                        disabled={cargando}
                                                        className="quantity-input"
                                                    />
                                                )}
                                        </td>
                                        <td className="unit-cell">{item.unidad}</td>
                                        <td className="price-cell">{formatoCOP(item.precio || item.precioUnitario || 0)}</td>
                                        <td className="subtotal-cell">
                                            {formatoCOP((item.cantidad || 0) * (item.precio || item.precioUnitario || 0))}
                                        </td>
                                        {modalTipo !== 'ver' && (
                                            <td className="action-cell">
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => removeInsumo(item.id)}
                                                    disabled={cargando}
                                                    title="Eliminar producto"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {modalTipo !== 'ver' && setMostrarModalInsumos && (
                    <button 
                        className="add-products-btn"
                        onClick={() => setMostrarModalInsumos(true)}
                        disabled={cargando}
                    >
                        <span className="btn-icon">+</span>
                        Agregar Insumos
                    </button>
                )}
            </div>
            
            <div className="totals-section">
                <div className="totals-grid">
                    <div className="total-card subtotal-card">
                        <div className="card-icon" style={{color: '#f10079ff', fontSize: '2rem'}}>💰</div>
                        <div className="card-content">
                            <div className="card-label">Subtotal</div>
                            <div className="card-value">{formatoCOP(subtotal)}</div>
                        </div>
                    </div>
                    
                    <div className="total-card iva-card">
                        <div className="card-icon" style={{color: '#ff0080ff', fontSize: '2rem'}}>📊</div>
                        <div className="card-content">
                            <div className="card-label">IVA (19%)</div>
                            <div className="card-value">{formatoCOP(iva)}</div>
                        </div>
                    </div>
                    
                    <div className="total-card total-card-main">
                        <div className="card-icon" style={{color: '#f7007cff', fontSize: '2rem'}}>💎</div>
                        <div className="card-content">
                            <div className="card-label">Total</div>
                            <div className="card-value total-value">{formatoCOP(total)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="action-buttons">
                <button 
                    className="btn btn-cancel"
                    onClick={onCancelar}
                    disabled={cargando}
                >
                    {modalTipo === 'ver' ? 'Cerrar' : 'Cancelar'}
                </button>
                {modalTipo !== 'ver' && onGuardar && (
                    <button 
                        className="btn btn-save"
                        onClick={handleGuardar}
                        disabled={cargando}
                    >
                        <span className="btn-icon">✓</span>
                        Guardar 
                    </button>
                )}
            </div>
            
            {mostrarModalInsumos && modalTipo !== 'ver' && setMostrarModalInsumos && (
                <AgregarInsumosModal
                    onClose={() => setMostrarModalInsumos(false)}
                    onAgregar={agregarInsumos}
                />
            )}
        </div>
    );
}