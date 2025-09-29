import React, { useState } from 'react';
import Modal from '../../../components/modal';

export default function ProveedorModal({ visible, onClose, onGuardar, proveedores, loading }) {
    const [tipoProveedor, setTipoProveedor] = useState('Natural');
    const [nombre, setNombre] = useState('');
    const [contacto, setContactoProveedor] = useState('');
    const [correo, setCorreo] = useState('');
    const [direccion, setDireccion] = useState('');
    const [documentoONit, setDocumentoONit] = useState('');
    const [tipoDocumento, setTipoDocumento] = useState('CC');
    const [nombreEmpresa, setNombreEmpresa] = useState('');
    const [nombreContacto, setNombreContacto] = useState('');
    const [estadoProveedor, setEstadoProveedor] = useState(true);
    
    const [errorsProveedor, setErrorsProveedor] = useState({});
    const [touchedProveedor, setTouchedProveedor] = useState({});

    const validateProveedorField = (field, value) => {
        let error = '';

        switch (field) {
            case 'nombre':
                if (tipoProveedor === 'Natural') {
                    if (!value.trim()) {
                        error = 'El nombre es obligatorio';
                    } else if (value.trim().length < 3) {
                        error = 'El nombre debe tener al menos 3 caracteres';
                    } else if (value.trim().length > 50) {
                        error = 'El nombre no puede tener más de 50 caracteres';
                    } else if (!/^[A-Za-zÀÁÉÍÓÚÑÜ àáéíóúñüs.]+$/.test(value)) {
                        error = 'El nombre solo puede contener letras, espacios y puntos';
                    }
                }
                break;

            case 'nombreEmpresa':
                if (tipoProveedor === 'Jurídico') {
                    if (!value.trim()) {
                        error = 'El nombre de empresa es obligatorio';
                    } else if (value.trim().length < 3) {
                        error = 'El nombre de empresa debe tener al menos 3 caracteres';
                    } else if (value.trim().length > 50) {
                        error = 'El nombre de empresa no puede tener más de 50 caracteres';
                    }
                }
                break;

            case 'nombreContacto':
                if (tipoProveedor === 'Jurídico') {
                    if (!value.trim()) {
                        error = 'El nombre del contacto es obligatorio';
                    } else if (value.trim().length < 3) {
                        error = 'El nombre del contacto debe tener al menos 3 caracteres';
                    } else if (value.trim().length > 50) {
                        error = 'El nombre del contacto no puede tener más de 50 caracteres';
                    } else if (!/^[A-Za-zÀÁÉÍÓÚÑÜ àáéíóúñüs.]+$/.test(value)) {
                        error = 'El nombre del contacto solo puede contener letras, espacios y puntos';
                    }
                }
                break;

            case 'contacto':
                if (!value.trim()) {
                    error = 'El contacto es obligatorio';
                } else if (!/^\d+$/.test(value)) {
                    error = 'El contacto debe contener solo números';
                } else if (value.length < 3) {
                    error = 'El contacto debe tener al menos 3 dígitos';
                } else if (value.length > 10) {
                    error = 'El contacto no puede tener más de 10 dígitos';
                }
                break;

            case 'correo':
                if (!value.trim()) {
                    error = 'El correo es obligatorio';
                } else if (value.length > 50) {
                    error = 'El correo no puede tener más de 50 caracteres';
                } else {
                    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!correoRegex.test(value) || !value.includes('@')) {
                        error = 'Correo no válido';
                    }
                }
                break;

            case 'direccion':
                if (!value.trim()) {
                    error = 'La dirección es obligatoria';
                } else if (value.trim().length < 5) {
                    error = 'La dirección debe tener al menos 5 caracteres';
                } else if (value.trim().length > 30) {
                    error = 'La dirección no puede tener más de 30 caracteres';
                }
                break;

            case 'documentoONit':
                const fieldLabel = tipoProveedor === 'Natural' ? 'Documento' : 'NIT';
                if (!value.trim()) {
                    error = `${fieldLabel} es obligatorio`;
                } else if (!/^\d+$/.test(value)) {
                    error = `${fieldLabel} debe contener solo números`;
                } else if (tipoProveedor === 'Natural') {
                    if (value.length < 7) {
                        error = 'El documento debe tener al menos 7 dígitos';
                    } else if (value.length > 10) {
                        error = 'El documento no puede tener más de 10 dígitos';
                    }
                } else {
                    if (value.length < 9) {
                        error = 'El NIT debe tener al menos 9 dígitos';
                    } else if (value.length > 12) {
                        error = 'El NIT no puede tener más de 12 dígitos';
                    }
                }
                break;

            default:
                break;
        }

        return error;
    };

    const handleProveedorFieldChange = (field, value) => {
        switch (field) {
            case 'tipoProveedor':
                setTipoProveedor(value);
                if (value === 'Natural') {
                    setTipoDocumento('CC');
                    setNombreEmpresa('');
                    setNombreContacto('');
                } else {
                    setTipoDocumento('NIT');
                    setNombre('');
                }
                if (documentoONit) {
                    const docError = validateProveedorField('documentoONit', documentoONit);
                    setErrorsProveedor(prev => ({ ...prev, documentoONit: docError }));
                }
                break;
            case 'tipoDocumento':
                setTipoDocumento(value);
                break;
            case 'nombre':
                setNombre(value);
                break;
            case 'nombreEmpresa':
                setNombreEmpresa(value);
                break;
            case 'nombreContacto':
                setNombreContacto(value);
                break;
            case 'contacto':
                setContactoProveedor(value);
                break;
            case 'correo':
                setCorreo(value);
                break;
            case 'direccion':
                setDireccion(value);
                break;
            case 'documentoONit':
                setDocumentoONit(value);
                break;
            case 'estadoProveedor':
                setEstadoProveedor(value);
                break;
        }

        if (touchedProveedor[field]) {
            const error = validateProveedorField(field, value);
            setErrorsProveedor(prev => ({ ...prev, [field]: error }));
        }
    };

    const handleProveedorFieldBlur = (field, value) => {
        setTouchedProveedor(prev => ({ ...prev, [field]: true }));
        const error = validateProveedorField(field, value);
        setErrorsProveedor(prev => ({ ...prev, [field]: error }));

        if (field === 'correo' && !error) {
            const emailExists = proveedores.some(p => p.correo.toLowerCase() === value.toLowerCase());
            if (emailExists) {
                setErrorsProveedor(prev => ({ ...prev, correo: 'Ya existe un proveedor con este correo' }));
            }
        }

        if (field === 'nombre' && !error && tipoProveedor === 'Natural') {
            const nameExists = proveedores.some(p => p.nombre && p.nombre.toLowerCase() === value.toLowerCase());
            if (nameExists) {
                setErrorsProveedor(prev => ({ ...prev, nombre: 'Ya existe un proveedor con este nombre' }));
            }
        }

        if (field === 'nombreEmpresa' && !error && tipoProveedor === 'Jurídico') {
            const nameExists = proveedores.some(p => p.nombreEmpresa && p.nombreEmpresa.toLowerCase() === value.toLowerCase());
            if (nameExists) {
                setErrorsProveedor(prev => ({ ...prev, nombreEmpresa: 'Ya existe un proveedor con este nombre de empresa' }));
            }
        }
    };

    const validarCamposProveedor = () => {
        let fields = ['contacto', 'correo', 'direccion', 'documentoONit'];

        if (tipoProveedor === 'Natural') {
            fields = [...fields, 'nombre'];
        } else {
            fields = [...fields, 'nombreEmpresa', 'nombreContacto'];
        }

        let hasErrors = false;
        const newErrors = {};

        fields.forEach(field => {
            let value;
            switch (field) {
                case 'nombre': value = nombre; break;
                case 'nombreEmpresa': value = nombreEmpresa; break;
                case 'nombreContacto': value = nombreContacto; break;
                case 'contacto': value = contacto; break;
                case 'correo': value = correo; break;
                case 'direccion': value = direccion; break;
                case 'documentoONit': value = documentoONit; break;
            }

            const error = validateProveedorField(field, value);
            if (error) {
                newErrors[field] = error;
                hasErrors = true;
            }
        });

        // Verificar duplicados
        const emailExists = proveedores.some(p => p.correo.toLowerCase() === correo.toLowerCase());
        if (emailExists) {
            newErrors.correo = 'Ya existe un proveedor con este correo';
            hasErrors = true;
        }

        if (tipoProveedor === 'Natural') {
            const nameExists = proveedores.some(p => p.nombre && p.nombre.toLowerCase() === nombre.toLowerCase());
            if (nameExists) {
                newErrors.nombre = 'Ya existe un proveedor con este nombre';
                hasErrors = true;
            }
        } else {
            const nameExists = proveedores.some(p => p.nombreEmpresa && p.nombreEmpresa.toLowerCase() === nombreEmpresa.toLowerCase());
            if (nameExists) {
                newErrors.nombreEmpresa = 'Ya existe un proveedor con este nombre de empresa';
                hasErrors = true;
            }
        }

        setErrorsProveedor(newErrors);
        setTouchedProveedor(fields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

        return !hasErrors;
    };

    const handleGuardar = () => {
        if (!validarCamposProveedor()) return;

        const proveedorData = {
            tipo: tipoProveedor,
            tipoDocumento,
            documento: documentoONit,
            extra: documentoONit,
            contacto: contacto,
            correo,
            direccion,
            estado: estadoProveedor,
            ...(tipoProveedor === 'Natural' ? {
                nombre: nombre,
                nombreProveedor: nombre
            } : {
                nombreEmpresa,
                nombreContacto,
                nombre: nombreEmpresa
            })
        };

        onGuardar(proveedorData);
    };

    const resetForm = () => {
        setTipoProveedor('Natural');
        setNombre('');
        setContactoProveedor('');
        setCorreo('');
        setDireccion('');
        setDocumentoONit('');
        setTipoDocumento('CC');
        setNombreEmpresa('');
        setNombreContacto('');
        setEstadoProveedor(true);
        setErrorsProveedor({});
        setTouchedProveedor({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal visible={visible} onClose={handleClose} className="modal-wide">
            <h2 className="modal-title">Agregar Proveedor</h2>
            <div className="modal-body">
                <div className="modal-form-grid-wide">
                    <label>Tipo de Proveedor*
                        <select
                            value={tipoProveedor}
                            onChange={(e) => handleProveedorFieldChange('tipoProveedor', e.target.value)}
                            className="modal-input"
                            disabled={loading}
                        >
                            <option value="Natural">Natural</option>
                            <option value="Jurídico">Jurídico</option>
                        </select>
                    </label>

                    <label>Tipo de Documento*
                        <select
                            value={tipoDocumento}
                            onChange={(e) => handleProveedorFieldChange('tipoDocumento', e.target.value)}
                            className="modal-input"
                            disabled={loading}
                        >
                            {tipoProveedor === 'Natural' ? (
                                <>
                                    <option value="CC">Cédula de Ciudadanía</option>
                                    <option value="CE">Cédula de Extranjería</option>
                                    <option value="TI">Tarjeta de Identidad</option>
                                </>
                            ) : (
                                <>
                                    <option value="NIT">NIT</option>
                                    <option value="RUT">RUT</option>
                                </>
                            )}
                        </select>
                    </label>

                    <label>{tipoProveedor === 'Natural' ? 'Número de Documento*' : (tipoDocumento === 'RUT' ? 'RUT*' : 'NIT*')}
                        <input
                            type="text"
                            value={documentoONit}
                            onChange={(e) => handleProveedorFieldChange('documentoONit', e.target.value)}
                            onBlur={(e) => handleProveedorFieldBlur('documentoONit', e.target.value)}
                            className={`modal-input ${errorsProveedor.documentoONit ? 'error' : ''}`}
                            placeholder={tipoProveedor === 'Natural' ? 'Número de documento' : (tipoDocumento === 'RUT' ? 'Número de RUT' : 'Número de NIT')}
                            maxLength={tipoProveedor === 'Natural' ? '10' : (tipoDocumento === 'RUT' ? '10' : '12')}
                            disabled={loading}
                        />
                        {errorsProveedor.documentoONit && <span className="error-message">{errorsProveedor.documentoONit}</span>}
                    </label>

                    {tipoProveedor === 'Natural' ? (
                        <label>Nombre Completo*
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => handleProveedorFieldChange('nombre', e.target.value)}
                                onBlur={(e) => handleProveedorFieldBlur('nombre', e.target.value)}
                                className={`modal-input ${errorsProveedor.nombre ? 'error' : ''}`}
                                placeholder="Ingrese el nombre completo"
                                disabled={loading}
                            />
                            {errorsProveedor.nombre && <span className="error-message">{errorsProveedor.nombre}</span>}
                        </label>
                    ) : (
                        <>
                            <label>Razón Social*
                                <input
                                    type="text"
                                    value={nombreEmpresa}
                                    onChange={(e) => handleProveedorFieldChange('nombreEmpresa', e.target.value)}
                                    onBlur={(e) => handleProveedorFieldBlur('nombreEmpresa', e.target.value)}
                                    className={`modal-input ${errorsProveedor.nombreEmpresa ? 'error' : ''}`}
                                    placeholder="Ingrese la razón social"
                                    disabled={loading}
                                />
                                {errorsProveedor.nombreEmpresa && <span className="error-message">{errorsProveedor.nombreEmpresa}</span>}
                            </label>

                            <label>Nombre del Contacto*
                                <input
                                    type="text"
                                    value={nombreContacto}
                                    onChange={(e) => handleProveedorFieldChange('nombreContacto', e.target.value)}
                                    onBlur={(e) => handleProveedorFieldBlur('nombreContacto', e.target.value)}
                                    className={`modal-input ${errorsProveedor.nombreContacto ? 'error' : ''}`}
                                    placeholder="Ingrese el nombre del contacto"
                                    disabled={loading}
                                />
                                {errorsProveedor.nombreContacto && <span className="error-message">{errorsProveedor.nombreContacto}</span>}
                            </label>
                        </>
                    )}

                    <label>Teléfono*
                        <input
                            type="text"
                            value={contacto}
                            onChange={(e) => handleProveedorFieldChange('contacto', e.target.value)}
                            onBlur={(e) => handleProveedorFieldBlur('contacto', e.target.value)}
                            className={`modal-input ${errorsProveedor.contacto ? 'error' : ''}`}
                            placeholder="Número de teléfono (10 dígitos)"
                            maxLength="10"
                            disabled={loading}
                        />
                        {errorsProveedor.contacto && <span className="error-message">{errorsProveedor.contacto}</span>}
                    </label>

                    <label>Correo Electrónico*
                        <input
                            type="email"
                            value={correo}
                            onChange={(e) => handleProveedorFieldChange('correo', e.target.value)}
                            onBlur={(e) => handleProveedorFieldBlur('correo', e.target.value)}
                            className={`modal-input ${errorsProveedor.correo ? 'error' : ''}`}
                            placeholder="ejemplo@correo.com"
                            disabled={loading}
                        />
                        {errorsProveedor.correo && <span className="error-message">{errorsProveedor.correo}</span>}
                    </label>

                    <label>Dirección*
                        <input
                            type="text"
                            value={direccion}
                            onChange={(e) => handleProveedorFieldChange('direccion', e.target.value)}
                            onBlur={(e) => handleProveedorFieldBlur('direccion', e.target.value)}
                            className={`modal-input ${errorsProveedor.direccion ? 'error' : ''}`}
                            placeholder="Dirección completa"
                            disabled={loading}
                        />
                        {errorsProveedor.direccion && <span className="error-message">{errorsProveedor.direccion}</span>}
                    </label>
                </div>
            </div>

            <div className="modal-footer">
                <button 
                    className="modal-btn cancel-btn" 
                    onClick={handleClose}
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button 
                    className="modal-btn save-btn" 
                    onClick={handleGuardar}
                    disabled={loading}
                >
                    {loading ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
        </Modal>
    )}