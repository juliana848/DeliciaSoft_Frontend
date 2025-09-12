import React, { useState } from 'react';
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

    // Función para manejar el envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Evitar propagación
        agregarAbono();
    };

    // Función para manejar el cierre
    const handleClose = () => {
        setPreviewImage(null);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            onClose={handleClose}
        >
            <div className="agregar-abono-modal">
                <h3>Agregar Abono - Venta #{ventaSeleccionada?.idVenta}</h3>
                
                <form onSubmit={handleSubmit}>
                    {/* Fila superior: Método de pago y Total pagado */}
                    <div className="form-row-double">
                        <div className={`form-group ${erroresValidacion.metodo_pago ? 'has-error' : ''}`}>
                            <label htmlFor="metodo_pago">Método de Pago: <span className="required">*</span></label>
                            <select
                                id="metodo_pago"
                                name="metodo_pago"
                                value={abonoData.metodo_pago}
                                onChange={handleAbonoChange}
                                className={erroresValidacion.metodo_pago ? 'field-error' : ''}
                                required
                            >
                                <option value="">Seleccione un método</option>
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">Transferencia</option>
                                <option value="tarjeta">Tarjeta</option>
                                <option value="otro">Otro</option>
                            </select>
                            {erroresValidacion.metodo_pago && (
                                <span className="error-message">{erroresValidacion.metodo_pago}</span>
                            )}
                        </div>

                        <div className={`form-group ${erroresValidacion.total_pagado ? 'has-error' : ''}`}>
                            <label htmlFor="total_pagado">Total Pagado: <span className="required">*</span></label>
                            <input
                                id="total_pagado"
                                type="number"
                                name="total_pagado"
                                min="0"
                                step="0.01"
                                value={abonoData.total_pagado}
                                onChange={handleAbonoChange}
                                className={erroresValidacion.total_pagado ? 'field-error' : ''}
                                placeholder="Ingrese el monto pagado"
                                required
                            />
                            {erroresValidacion.total_pagado && (
                                <span className="error-message">{erroresValidacion.total_pagado}</span>
                            )}
                        </div>
                    </div>

                    {/* Fila media: Fecha */}
                    <div className={`form-group ${erroresValidacion.fecha ? 'has-error' : ''}`}>
                        <label htmlFor="fecha">Fecha:</label>
                        <input
                            id="fecha"
                            type="date"
                            name="fecha"
                            value={abonoData.fecha}
                            onChange={handleAbonoChange}
                            className={erroresValidacion.fecha ? 'field-error' : ''}
                            max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
                        />
                        {erroresValidacion.fecha && (
                            <span className="error-message">{erroresValidacion.fecha}</span>
                        )}
                    </div>

                    {/* Comprobante de Imagen */}
                    <div className="form-group">
                        <label htmlFor="comprobante">Comprobante (Imagen):</label>
                        <div className="file-input-container">
                            <input
                                id="comprobante"
                                type="file"
                                accept="image/*"
                                onChange={handleLocalImageUpload}
                                className="file-input"
                            />
                            <small className="help-text">
                                Formatos: JPG, PNG, GIF. Máximo: 5MB
                            </small>
                        </div>

                        {/* Preview de la imagen */}
                        {previewImage && (
                            <div className="image-preview-container">
                                <div className="preview-header">
                                    <span>Vista previa:</span>
                                    <button 
                                        type="button"
                                        onClick={limpiarImagen}
                                        className="btn-remove-image"
                                    >
                                        × Quitar
                                    </button>
                                </div>
                                <img 
                                    src={previewImage} 
                                    alt="Previsualización del comprobante" 
                                    className="image-preview"
                                />
                            </div>
                        )}
                    </div>

                    {/* Información de la venta */}
                    <div className="form-group info-section">
                        <h4>Información de la Venta:</h4>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Total de la Venta:</span>
                                <span className="info-value">
                                    ${ventaSeleccionada?.total?.toLocaleString() || '0'}
                                </span>
                            </div>
                            
                            <div className="info-item">
                                <span className="info-label">Total ya pagado:</span>
                                <span className="info-value">
                                    ${((ventaSeleccionada?.abonos || [])
                                        .reduce((sum, abono) => sum + parseFloat(abono.monto || 0), 0))
                                        .toLocaleString()}
                                </span>
                            </div>
                            
                            <div className="info-item">
                                <span className="info-label">Falta por Pagar:</span>
                                <span className="info-value highlight">
                                    ${(((ventaSeleccionada?.total || 0) - 
                                        ((ventaSeleccionada?.abonos || [])
                                            .reduce((sum, abono) => sum + parseFloat(abono.monto || 0), 0)) - 
                                        (parseFloat(abonoData.total_pagado) || 0))
                                    ).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="modal-buttons">
                        <button 
                            type="button" 
                            className="modal-btn cancel-btn" 
                            onClick={handleClose}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="modal-btn save-btn"
                            disabled={!abonoData.metodo_pago || !abonoData.total_pagado}
                        >
                            Guardar Abono
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .agregar-abono-modal {
                    max-width: 650px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .agregar-abono-modal h3 {
                    margin-bottom: 20px;
                    color: #333;
                    text-align: center;
                }

                /* Fila doble para campos superiores */
                .form-row-double {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .form-group {
                    margin-bottom: 15px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: bold;
                    color: #333;
                    font-size: 14px;
                }

                .required {
                    color: #dc3545;
                }

                .form-group input,
                .form-group select {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                    transition: border-color 0.3s;
                }

                .form-group input:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: #007bff;
                    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
                }

                .field-error {
                    border-color: #dc3545 !important;
                }

                .error-message {
                    color: #dc3545;
                    font-size: 11px;
                    margin-top: 3px;
                    display: block;
                }

                .help-text {
                    color: #6c757d;
                    font-size: 11px;
                    margin-top: 3px;
                    display: block;
                }

                .file-input-container {
                    position: relative;
                }

                .file-input {
                    padding: 6px !important;
                    font-size: 13px !important;
                }

                .image-preview-container {
                    margin-top: 10px;
                    padding: 10px;
                    border: 1px solid #e9ecef;
                    border-radius: 4px;
                    background: #f8f9fa;
                }

                .preview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .preview-header span {
                    font-size: 12px;
                    color: #666;
                    font-weight: bold;
                }

                .btn-remove-image {
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 3px 8px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 11px;
                    transition: background-color 0.2s;
                }

                .btn-remove-image:hover {
                    background: #c82333;
                }

                .image-preview {
                    max-width: 100%;
                    max-height: 150px;
                    object-fit: cover;
                    border-radius: 4px;
                    border: 1px solid #ddd;
                }

                .info-section {
                    background: #f8f9fa;
                    padding: 12px;
                    border-radius: 5px;
                    border: 1px solid #e9ecef;
                    margin-top: 15px;
                }

                .info-section h4 {
                    margin: 0 0 10px 0;
                    color: #495057;
                    font-size: 14px;
                }

                .info-grid {
                    display: grid;
                    gap: 8px;
                }

                .info-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .info-label {
                    font-size: 13px;
                    color: #6c757d;
                }

                .info-value {
                    font-weight: bold;
                    color: #28a745;
                    font-size: 13px;
                }

                .info-value.highlight {
                    color: #007bff;
                    font-size: 14px;
                }

                .modal-buttons {
                    display: flex;
                    justify-content: space-between;
                    gap: 10px;
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid #e9ecef;
                }

                .modal-btn {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                    transition: background-color 0.3s;
                }

                .cancel-btn {
                    background: #6c757d;
                    color: white;
                }

                .cancel-btn:hover {
                    background: #5a6268;
                }

                .save-btn {
                    background: #28a745;
                    color: white;
                }

                .save-btn:hover:not(:disabled) {
                    background: #218838;
                }

                .save-btn:disabled {
                    background: #6c757d;
                    cursor: not-allowed;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .form-row-double {
                        grid-template-columns: 1fr;
                        gap: 10px;
                    }
                    
                    .agregar-abono-modal {
                        max-width: 95vw;
                    }
                }
            `}</style>
        </Modal>
    );
}