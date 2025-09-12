import React, { useState, useEffect } from 'react';
import Modal from '../../components/modal';

export default function VentasAgregarAbonoModal({
    visible,
    onClose,
    abonoData,
    handleAbonoChange,
    erroresValidacion,
    handleImageUpload,
    agregarAbono,
    ventaSeleccionada
}) {
    const [previewImage, setPreviewImage] = useState(null);
    const [faltaPorPagar, setFaltaPorPagar] = useState(0);

    // Calcular cuánto falta por pagar
    useEffect(() => {
        if (ventaSeleccionada) {
            const totalVenta = ventaSeleccionada.total || 0;
            const totalPagado = (ventaSeleccionada.abonos || []).reduce((sum, abono) => {
                const montoAbono = parseFloat(abono.monto || abono.cantidadpagar || abono.totalPagado || 0);
                return abono.anulado ? sum : sum + montoAbono;
            }, 0);
            setFaltaPorPagar(totalVenta - totalPagado);
        }
    }, [ventaSeleccionada]);

    if (!visible) return null;

    // Función local para manejar el upload de imagen
    const handleLocalImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('Archivo seleccionado:', file.name, file.type, file.size);
            
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                alert('Por favor selecciona solo archivos de imagen');
                return;
            }

            // Validar tamaño (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('La imagen es muy grande. Máximo 5MB permitido');
                return;
            }

            // Crear preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);

            // Llamar función padre para guardar el archivo
            handleImageUpload(e);
        }
    };

    // Función para limpiar la imagen
    const limpiarImagen = () => {
        setPreviewImage(null);
        // Limpiar el input de archivo
        const fileInput = document.getElementById('comprobante');
        if (fileInput) {
            fileInput.value = '';
        }
        // Crear evento sintético para limpiar el archivo
        const fakeEvent = {
            target: {
                files: []
            }
        };
        handleImageUpload(fakeEvent);
    };

    // Función para manejar cambios en el monto con validación
    const handleMontoChange = (e) => {
        const valor = parseFloat(e.target.value) || 0;
        
        // Validar que no exceda lo que falta por pagar
        if (valor > faltaPorPagar) {
            e.target.value = faltaPorPagar;
            alert(`El monto no puede ser mayor a lo que falta por pagar: $${faltaPorPagar.toLocaleString()}`);
        }
        
        handleAbonoChange(e);
    };

    // Función para manejar el envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Validación adicional antes del envío
        const montoIngresado = parseFloat(abonoData.total_pagado) || 0;
        if (montoIngresado > faltaPorPagar) {
            alert(`El monto no puede ser mayor a lo que falta por pagar: $${faltaPorPagar.toLocaleString()}`);
            return;
        }
        
        agregarAbono();
    };

    // Función para manejar el cierre
    const handleClose = () => {
        setPreviewImage(null);
        onClose();
    };

    return (
        <Modal visible={visible} onClose={handleClose}>
            <div className="abono-modal-container">
                {/* Header del modal */}
                <div className="modal-header-section">
                    <h2 className="modal-title">Agregar Abono</h2>
                    <div className="venta-info-badge">
                        Venta #{ventaSeleccionada?.idVenta} - {ventaSeleccionada?.nombreCliente}
                    </div>
                </div>

                {/* Información de la venta */}
                <div className="venta-summary-card">
                    <div className="summary-grid">
                        <div className="summary-item">
                            <span className="summary-label">Total Venta:</span>
                            <span className="summary-value total-venta">
                                ${(ventaSeleccionada?.total || 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Total Pagado:</span>
                            <span className="summary-value pagado">
                                ${((ventaSeleccionada?.abonos || [])
                                    .reduce((sum, abono) => {
                                        const monto = parseFloat(abono.monto || abono.cantidadpagar || abono.totalPagado || 0);
                                        return abono.anulado ? sum : sum + monto;
                                    }, 0)).toLocaleString()}
                            </span>
                        </div>
                        <div className="summary-item destacado">
                            <span className="summary-label">Falta por Pagar:</span>
                            <span className="summary-value pendiente">
                                ${faltaPorPagar.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Formulario */}
                <div className="abono-form">
                    {/* Fila 1: Método de pago y Monto */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Método de Pago <span className="required">*</span>
                            </label>
                            <select
                                name="metodo_pago"
                                value={abonoData.metodo_pago}
                                onChange={handleAbonoChange}
                                className={`form-control ${erroresValidacion.metodo_pago ? 'error' : ''}`}
                                required
                            >
                                <option value="">Seleccione método</option>
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">Transferencia</option>
                                <option value="otro">Otro</option>
                            </select>
                            {erroresValidacion.metodo_pago && (
                                <span className="error-text">{erroresValidacion.metodo_pago}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Monto a Pagar <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                name="total_pagado"
                                min="0"
                                max={faltaPorPagar}
                                step="0.01"
                                value={abonoData.total_pagado}
                                onChange={handleMontoChange}
                                className={`form-control ${erroresValidacion.total_pagado ? 'error' : ''}`}
                                placeholder="0.00"
                                required
                            />
                            {erroresValidacion.total_pagado && (
                                <span className="error-text">{erroresValidacion.total_pagado}</span>
                            )}
                            <div className="input-help">
                                Máximo: ${faltaPorPagar.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Mostrar sede si es efectivo */}
                    {abonoData.metodo_pago === 'efectivo' && (
                        <div className="sede-info-card">
                            <div className="sede-icon">💵</div>
                            <div className="sede-text">
                                <strong>Pago en efectivo</strong>
                                <br />
                                Sede de pago: <span className="sede-name">{ventaSeleccionada?.nombreSede || 'N/A'}</span>
                            </div>
                        </div>
                    )}

                    {/* Fila 2: Fecha */}
                    <div className="form-group">
                        <label className="form-label">Fecha del Abono</label>
                        <input
                            type="date"
                            name="fecha"
                            value={abonoData.fecha}
                            onChange={handleAbonoChange}
                            className="form-control"
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    {/* Comprobante */}
                    <div className="form-group">
                        <label className="form-label">Comprobante de Pago</label>
                        <div className="file-upload-section">
                            <input
                                id="comprobante"
                                type="file"
                                accept="image/*"
                                onChange={handleLocalImageUpload}
                                className="file-input"
                            />
                            <label htmlFor="comprobante" className="file-input-label">
                                <div className="file-input-content">
                                    <div className="upload-icon">📎</div>
                                    <div className="upload-text">
                                        <span>Seleccionar imagen</span>
                                        <small>JPG, PNG, GIF - Máx. 5MB</small>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Preview de imagen */}
                        {previewImage && (
                            <div className="image-preview-section">
                                <div className="preview-header">
                                    <span className="preview-title">Vista previa:</span>
                                    <button 
                                        type="button"
                                        onClick={limpiarImagen}
                                        className="remove-image-btn"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="preview-container">
                                    <img 
                                        src={previewImage} 
                                        alt="Vista previa del comprobante" 
                                        className="preview-image"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Botones de acción */}
                    <div className="modal-actions">
                        <button 
                            type="button" 
                            className="btn-secondary" 
                            onClick={handleClose}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="button" 
                            className="btn-primary"
                            onClick={handleSubmit}
                            disabled={!abonoData.metodo_pago || !abonoData.total_pagado || faltaPorPagar <= 0}
                        >
                            {faltaPorPagar <= 0 ? '✓ Venta Pagada' : 'Guardar Abono'}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .abono-modal-container {
                    max-width: 700px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                /* Header */
                .modal-header-section {
                    text-align: center;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid #e9ecef;
                }

                .modal-title {
                    font-size: 24px;
                    font-weight: 600;
                    color: #2c3e50;
                    margin: 0 0 8px 0;
                }

                .venta-info-badge {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                    display: inline-block;
                }

                /* Resumen de venta */
                .venta-summary-card {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                }

                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 16px;
                }

                .summary-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .summary-item.destacado {
                    background: white;
                    padding: 12px;
                    border-radius: 8px;
                    border: 2px solid #007bff;
                }

                .summary-label {
                    font-size: 13px;
                    color: #6c757d;
                    font-weight: 500;
                }

                .summary-value {
                    font-size: 16px;
                    font-weight: 600;
                }

                .summary-value.total-venta {
                    color: #495057;
                }

                .summary-value.pagado {
                    color: #28a745;
                }

                .summary-value.pendiente {
                    color: #007bff;
                    font-size: 18px;
                }

                /* Formulario */
                .abono-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 4px;
                }

                .required {
                    color: #dc3545;
                }

                .form-control {
                    padding: 12px 16px;
                    border: 2px solid #e1e5e9;
                    border-radius: 8px;
                    font-size: 14px;
                    background: white;
                    transition: all 0.3s ease;
                }

                .form-control:focus {
                    outline: none;
                    border-color: #007bff;
                    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
                }

                .form-control.error {
                    border-color: #dc3545;
                }

                .error-text {
                    color: #dc3545;
                    font-size: 12px;
                    margin-top: 4px;
                }

                .input-help {
                    color: #6c757d;
                    font-size: 12px;
                    font-style: italic;
                }

                /* Sede info card */
                .sede-info-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #e8f4fd;
                    border: 2px solid #007bff;
                    border-radius: 10px;
                    padding: 16px;
                    margin: 8px 0;
                }

                .sede-icon {
                    font-size: 24px;
                }

                .sede-text {
                    font-size: 14px;
                    color: #374151;
                    line-height: 1.4;
                }

                .sede-name {
                    color: #007bff;
                    font-weight: 600;
                }

                /* File upload */
                .file-upload-section {
                    position: relative;
                }

                .file-input {
                    position: absolute;
                    opacity: 0;
                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                }

                .file-input-label {
                    display: block;
                    border: 2px dashed #cbd5e0;
                    border-radius: 10px;
                    padding: 20px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: #fafafa;
                }

                .file-input-label:hover {
                    border-color: #007bff;
                    background: #f0f8ff;
                }

                .file-input-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }

                .upload-icon {
                    font-size: 24px;
                    color: #6c757d;
                }

                .upload-text span {
                    display: block;
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                }

                .upload-text small {
                    color: #6c757d;
                    font-size: 12px;
                }

                /* Image preview */
                .image-preview-section {
                    margin-top: 16px;
                    border: 1px solid #e1e5e9;
                    border-radius: 10px;
                    overflow: hidden;
                    background: white;
                }

                .preview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: #f8f9fa;
                    border-bottom: 1px solid #e1e5e9;
                }

                .preview-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: #374151;
                }

                .remove-image-btn {
                    background: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 12px;
                    transition: background-color 0.2s;
                }

                .remove-image-btn:hover {
                    background: #c82333;
                }

                .preview-container {
                    padding: 16px;
                    text-align: center;
                }

                .preview-image {
                    max-width: 100%;
                    max-height: 200px;
                    border-radius: 8px;
                    border: 1px solid #e1e5e9;
                    object-fit: contain;
                }

                /* Botones de acción */
                .modal-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    margin-top: 24px;
                    padding-top: 20px;
                    border-top: 1px solid #e9ecef;
                }

                .btn-secondary,
                .btn-primary {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 120px;
                }

                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }

                .btn-secondary:hover {
                    background: #5a6268;
                }

                .btn-primary {
                    background: #28a745;
                    color: white;
                }

                .btn-primary:hover:not(:disabled) {
                    background: #218838;
                }

                .btn-primary:disabled {
                    background: #6c757d;
                    cursor: not-allowed;
                    opacity: 0.6;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .abono-modal-container {
                        max-width: 95vw;
                        margin: 10px;
                    }
                    
                    .form-row {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                    
                    .summary-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                    
                    .modal-actions {
                        flex-direction: column;
                    }
                    
                    .btn-secondary,
                    .btn-primary {
                        width: 100%;
                    }
                    
                    .sede-info-card {
                        flex-direction: column;
                        text-align: center;
                        gap: 8px;
                    }
                }
            `}</style>
        </Modal>
    );
}