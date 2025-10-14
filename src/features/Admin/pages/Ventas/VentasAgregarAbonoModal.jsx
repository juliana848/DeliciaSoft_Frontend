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

    const handleLocalImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Por favor selecciona solo archivos de imagen');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('La imagen es muy grande. Máximo 5MB permitido');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);

            handleImageUpload(e);
        }
    };

    const limpiarImagen = () => {
        setPreviewImage(null);
        const fileInput = document.getElementById('comprobante');
        if (fileInput) {
            fileInput.value = '';
        }
        const fakeEvent = {
            target: {
                files: []
            }
        };
        handleImageUpload(fakeEvent);
    };

    const handleMontoChange = (e) => {
        const valor = parseFloat(e.target.value) || 0;
        
        if (valor > faltaPorPagar) {
            e.target.value = faltaPorPagar;
            alert(`El monto no puede ser mayor a lo que falta por pagar: $${faltaPorPagar.toLocaleString()}`);
        }
        
        handleAbonoChange(e);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const montoIngresado = parseFloat(abonoData.total_pagado) || 0;
        if (montoIngresado > faltaPorPagar) {
            alert(`El monto no puede ser mayor a lo que falta por pagar: $${faltaPorPagar.toLocaleString()}`);
            return;
        }
        
        agregarAbono();
    };

    const handleClose = () => {
        setPreviewImage(null);
        onClose();
    };

    return (
        <Modal visible={visible} onClose={handleClose}>
            <div className="agregar-abono-container">
                {/* Header con información */}
                <div className="header-info">
                    <div className="info-badge">
                        <span className="badge-icon">💰</span>
                        <span>Venta #{ventaSeleccionada?.idVenta}</span>
                    </div>
                    <div className="info-badge">
                        <span className="badge-icon">👤</span>
                        <span>{ventaSeleccionada?.nombreCliente}</span>
                    </div>
                </div>

                {/* Card principal */}
                <div className="form-card">
                    <h2 className="section-title">
                        <span className="title-icon">💵</span>
                        Agregar Abono
                    </h2>

                    {/* Resumen de la venta */}
                    <div className="venta-summary">
                        <div className="summary-item">
                            <span className="summary-label">Total Venta</span>
                            <span className="summary-value total-venta">
                                ${(ventaSeleccionada?.total || 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Total Pagado</span>
                            <span className="summary-value pagado">
                                ${((ventaSeleccionada?.abonos || [])
                                    .reduce((sum, abono) => {
                                        const monto = parseFloat(abono.monto || abono.cantidadpagar || abono.totalPagado || 0);
                                        return abono.anulado ? sum : sum + monto;
                                    }, 0)).toLocaleString()}
                            </span>
                        </div>
                        <div className="summary-item destacado">
                            <span className="summary-label">Falta por Pagar</span>
                            <span className="summary-value pendiente">
                                ${faltaPorPagar.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="section-divider"></div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="field-group">
                                <label className="field-label">
                                    Método de Pago <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <select
                                    name="metodo_pago"
                                    value={abonoData.metodo_pago}
                                    onChange={handleAbonoChange}
                                    className={`form-input ${erroresValidacion.metodo_pago ? 'error' : ''}`}
                                    required
                                >
                                    <option value="">Seleccione método</option>
                                    <option value="efectivo">Efectivo</option>
                                    <option value="transferencia">Transferencia</option>
                                    <option value="otro">Otro</option>
                                </select>
                                {erroresValidacion.metodo_pago && (
                                    <span className="error-message">{erroresValidacion.metodo_pago}</span>
                                )}
                            </div>

                            <div className="field-group">
                                <label className="field-label">
                                    Monto a Pagar <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    name="total_pagado"
                                    min="0"
                                    max={faltaPorPagar}
                                    step="0.01"
                                    value={abonoData.total_pagado}
                                    onChange={handleMontoChange}
                                    className={`form-input ${erroresValidacion.total_pagado ? 'error' : ''}`}
                                    placeholder="0.00"
                                    required
                                />
                                {erroresValidacion.total_pagado && (
                                    <span className="error-message">{erroresValidacion.total_pagado}</span>
                                )}
                                <div className="input-help">
                                    Máximo: ${faltaPorPagar.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Mostrar sede si es efectivo */}
                        {abonoData.metodo_pago === 'efectivo' && (
                            <div className="sede-info-alert">
                                <div className="alert-icon">💵</div>
                                <div className="alert-content">
                                    <strong>Pago en efectivo</strong>
                                    <br />
                                    Sede de pago: <span className="sede-name">{ventaSeleccionada?.nombreSede || 'N/A'}</span>
                                </div>
                            </div>
                        )}

                        <div className="field-group">
                            <label className="field-label">Fecha del Abono</label>
                            <input
                                type="date"
                                name="fecha"
                                value={abonoData.fecha}
                                onChange={handleAbonoChange}
                                className="form-input"
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="field-group">
                            <label className="field-label">Comprobante de Pago</label>
                            <div className="file-upload-wrapper">
                                <input
                                    id="comprobante"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLocalImageUpload}
                                    className="file-input-hidden"
                                />
                                <label htmlFor="comprobante" className="file-upload-label">
                                    <div className="upload-content">
                                        <div className="upload-icon">📎</div>
                                        <div className="upload-text">
                                            <span>Seleccionar imagen</span>
                                            <small>JPG, PNG, GIF - Máx. 5MB</small>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {previewImage && (
                                <div className="preview-section">
                                    <div className="preview-header">
                                        <span className="preview-label">Vista previa</span>
                                        <button 
                                            type="button"
                                            onClick={limpiarImagen}
                                            className="remove-preview-btn"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="preview-image-container">
                                        <img 
                                            src={previewImage} 
                                            alt="Vista previa del comprobante" 
                                            className="preview-image"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Botones de acción */}
                <div className="action-buttons">
                    <button 
                        type="button" 
                        className="btn btn-cancel" 
                        onClick={handleClose}
                    >
                        <span className="btn-icon">✕</span>
                        Cancelar
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-save"
                        onClick={handleSubmit}
                        disabled={!abonoData.metodo_pago || !abonoData.total_pagado || faltaPorPagar <= 0}
                    >
                        <span className="btn-icon">{faltaPorPagar <= 0 ? '✓' : '💾'}</span>
                        {faltaPorPagar <= 0 ? 'Venta Pagada' : 'Guardar Abono'}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .agregar-abono-container {
                    max-width: 900px;
                    width: 90vw;
                    max-height: 90vh;
                    overflow-y: auto;
                    padding: 20px;
                    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                /* Header Info */
                .header-info {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .info-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                    color: #374151;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                    box-shadow: 0 2px 8px rgba(107, 114, 128, 0.1);
                    border: 1px solid #d1d5db;
                }

                .badge-icon {
                    font-size: 16px;
                }

                /* Form Card */
                .form-card {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    border: 1px solid #e5e7eb;
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 20px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 24px;
                    padding-bottom: 12px;
                    border-bottom: 2px solid #e5e7eb;
                }

                .title-icon {
                    font-size: 24px;
                }

                /* Venta Summary */
                .venta-summary {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .summary-item {
                    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
                    padding: 14px;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    transition: all 0.2s ease;
                }

                .summary-item.destacado {
                    background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
                    border: 2px solid #ec4899;
                    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.15);
                }

                .summary-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
                }

                .summary-label {
                    font-size: 13px;
                    font-weight: 500;
                    color: #6b7280;
                }

                .summary-value {
                    font-size: 18px;
                    font-weight: 700;
                }

                .summary-value.total-venta {
                    color: #374151;
                }

                .summary-value.pagado {
                    color: #10b981;
                }

                .summary-value.pendiente {
                    color: #ec4899;
                    font-size: 20px;
                }

                /* Section Divider */
                .section-divider {
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
                    margin: 24px 0;
                }

                /* Form Grid */
                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;
                    margin-bottom: 20px;
                }

                .field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .field-label {
                    font-weight: 600;
                    color: #374151;
                    font-size: 14px;
                }

                .form-input {
                    padding: 12px 16px;
                    border: 2px solid #d1d5db;
                    border-radius: 10px;
                    font-size: 14px;
                    transition: all 0.2s ease;
                    background: white;
                    color: #374151;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #ec4899;
                    box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
                }

                .form-input.error {
                    border-color: #ef4444;
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
                }

                .error-message {
                    color: #ef4444;
                    font-size: 12px;
                    font-weight: 500;
                }

                .input-help {
                    color: #6b7280;
                    font-size: 12px;
                    font-style: italic;
                }

                /* Sede Info Alert */
                .sede-info-alert {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                    border: 2px solid #3b82f6;
                    border-radius: 12px;
                    padding: 16px;
                    margin: 20px 0;
                }

                .alert-icon {
                    font-size: 24px;
                }

                .alert-content {
                    font-size: 14px;
                    color: #1e40af;
                    line-height: 1.5;
                }

                .sede-name {
                    font-weight: 700;
                    color: #1e3a8a;
                }

                /* File Upload */
                .file-upload-wrapper {
                    position: relative;
                }

                .file-input-hidden {
                    position: absolute;
                    opacity: 0;
                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                }

                .file-upload-label {
                    display: block;
                    border: 2px dashed #d1d5db;
                    border-radius: 12px;
                    padding: 24px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
                }

                .file-upload-label:hover {
                    border-color: #ec4899;
                    background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
                    transform: translateY(-2px);
                }

                .upload-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }

                .upload-icon {
                    font-size: 32px;
                    color: #6b7280;
                }

                .upload-text span {
                    display: block;
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                }

                .upload-text small {
                    color: #9ca3af;
                    font-size: 12px;
                }

                /* Preview Section */
                .preview-section {
                    margin-top: 16px;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    overflow: hidden;
                    background: white;
                }

                .preview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
                    border-bottom: 1px solid #e5e7eb;
                }

                .preview-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #374151;
                }

                .remove-preview-btn {
                    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                    color: #dc2626;
                    border: none;
                    border-radius: 50%;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                    transition: all 0.2s;
                }

                .remove-preview-btn:hover {
                    background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
                    transform: scale(1.1);
                }

                .preview-image-container {
                    padding: 16px;
                    text-align: center;
                    background: #fafafa;
                }

                .preview-image {
                    max-width: 100%;
                    max-height: 300px;
                    border-radius: 10px;
                    border: 2px solid #e5e7eb;
                    object-fit: contain;
                }

                /* Action Buttons */
                .action-buttons {
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                }

                .btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 14px 32px;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 15px;
                    flex: 1;
                }

                .btn-cancel {
                    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                    color: #6b7280;
                    border: 2px solid #d1d5db;
                }

                .btn-cancel:hover {
                    background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
                    color: #374151;
                    transform: translateY(-1px);
                }

                .btn-save {
                    background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
                    color: white;
                    box-shadow: 0 2px 8px rgba(236, 72, 153, 0.3);
                }

                .btn-save:hover:not(:disabled) {
                    background: linear-gradient(135deg, #be185d 0%, #9d174d 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.4);
                }

                .btn-save:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                    background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
                }

                .btn-icon {
                    font-size: 18px;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .agregar-abono-container {
                        padding: 16px;
                    }

                    .form-grid {
                        grid-template-columns: 1fr;
                    }

                    .venta-summary {
                        grid-template-columns: 1fr;
                    }

                    .action-buttons {
                        flex-direction: column;
                    }

                    .btn {
                        width: 100%;
                    }

                    .sede-info-alert {
                        flex-direction: column;
                        text-align: center;
                    }

                    .preview-image {
                        max-height: 150px;
                    }
                }
            `}</style>
        </Modal>
    );
}