import React, { useState, useEffect } from 'react';
import { InputSwitch } from 'primereact/inputswitch';

// Utilidad para validaciones
const validationUtils = {
  // Validaciones de texto
  isRequired: (value) => {
    return value && value.toString().trim().length > 0;
  },

  minLength: (value, min) => {
    return value && value.toString().trim().length >= min;
  },

  maxLength: (value, max) => {
    return !value || value.toString().trim().length <= max;
  },

  // Validaciones de nombres y apellidos
  isValidName: (value) => {
    // Solo letras, espacios, acentos y caracteres especiales del español
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;
    return nameRegex.test(value);
  },

  hasValidNameLength: (value) => {
    const trimmed = value.trim();
    return trimmed.length >= 2 && trimmed.length <= 15;
  },

  noMultipleSpaces: (value) => {
    // No espacios múltiples consecutivos
    return !/\s{2,}/.test(value);
  },

  noLeadingTrailingSpaces: (value) => {
    return value === value.trim();
  },

  // Validaciones de correo electrónico
  isValidEmail: (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  },

  isValidEmailDomain: (email) => {
    const domain = email.split('@')[1]?.toLowerCase();
    return domain && domain.includes('.') && domain.length > 3;
  },

  hasValidEmailLength: (email) => {
    return email.length >= 5 && email.length <= 100;
  },

  // Validaciones de contraseña
  hasMinLength: (password, min = 6) => {
    return password.length >= min;
  },

  hasMaxLength: (password, max = 50) => {
    return password.length <= max;
  },

  hasLetter: (password) => {
    return /[a-zA-Z]/.test(password);
  },

  hasNumber: (password) => {
    return /[0-9]/.test(password);
  },

  hasUpperCase: (password) => {
    return /[A-Z]/.test(password);
  },

  hasLowerCase: (password) => {
    return /[a-z]/.test(password);
  },

  hasSpecialChar: (password) => {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  },

  // FUNCIONES FALTANTES AGREGADAS
  noCommonPatterns: (password) => {
    const commonPatterns = [
      '123456', '654321', 'password', 'contraseña', 'qwerty', 
      'abc123', '123abc', 'admin', 'usuario', 'user'
    ];
    const lowerPassword = password.toLowerCase();
    return !commonPatterns.some(pattern => lowerPassword.includes(pattern));
  },

  // Validaciones de documento
  isValidDocumentFormat: (documento, tipoDocumento) => {
    const documentoTrimmed = documento.trim();
    
    switch(tipoDocumento) {
      case 'CC': // Cédula de Ciudadanía
        return /^\d{7,10}$/.test(documentoTrimmed);
      case 'CE': // Cédula de Extranjería  
        return /^\d{6,10}$/.test(documentoTrimmed);
      case 'PA': // Pasaporte
        return /^[A-Z0-9]{6,12}$/i.test(documentoTrimmed);
      case 'NIT': // NIT
        return /^\d{9,11}$/.test(documentoTrimmed);
      default:
        return documentoTrimmed.length >= 6 && documentoTrimmed.length <= 12;
    }
  },

  isValidDocumentLength: (documento, tipoDocumento) => {
    const length = documento.trim().length;
    switch(tipoDocumento) {
      case 'CC': // Cédula de Ciudadanía
        return length >= 7 && length <= 10;
      case 'CE': // Cédula de Extranjería
        return length >= 6 && length <= 10;
      case 'PA': // Pasaporte
        return length >= 6 && length <= 12;
      case 'NIT': // NIT
        return length >= 9 && length <= 11;
      default:
        return length >= 6 && length <= 12;
    }
  },
  
  // Validación para documento que solo permita números (excepto pasaporte)
  isNumeric: (value) => {
    return /^\d*$/.test(value);
  },

  isAlphanumeric: (value) => {
    return /^[A-Z0-9]*$/i.test(value);
  },

  // Validaciones de duplicados
  isUniqueEmail: (email, usuarios, currentUserId = null) => {
    return !usuarios.some(user => 
      user.correo.toLowerCase() === email.toLowerCase() && 
      user.id !== currentUserId
    );
  },

  isUniqueDocument: (documento, usuarios, currentUserId = null) => {
    return !usuarios.some(user => 
      user.documento === documento.trim() && 
      user.id !== currentUserId
    );
  },

  // Validaciones de selección
  isValidSelection: (value) => {
    return value && value !== '' && value !== '0';
  }
};

// Función principal de validación mejorada
const validarFormularioCompleto = (formData, modalTipo, usuarios, usuarioSeleccionado) => {
  const errors = [];
  const { 
    nombres, apellidos, correo, contraseña, confirmarContraseña, 
    rol_id, tipo_documento_id, documento 
  } = formData;

  // ========== VALIDACIONES DE NOMBRES ==========
  if (!validationUtils.isRequired(nombres)) {
    errors.push('Los nombres son obligatorios');
  } else {
    if (!validationUtils.hasValidNameLength(nombres)) {
      errors.push('Los nombres deben tener entre 2 y 15 caracteres');
    }
    if (!validationUtils.isValidName(nombres)) {
      errors.push('Los nombres solo pueden contener letras y espacios');
    }
    if (!validationUtils.noMultipleSpaces(nombres)) {
      errors.push('Los nombres no pueden tener espacios múltiples consecutivos');
    }
    if (!validationUtils.noLeadingTrailingSpaces(nombres)) {
      errors.push('Los nombres no pueden comenzar o terminar con espacios');
    }
  }

  // ========== VALIDACIONES DE APELLIDOS ==========
  if (!validationUtils.isRequired(apellidos)) {
    errors.push('Los apellidos son obligatorios');
  } else {
    if (!validationUtils.hasValidNameLength(apellidos)) {
      errors.push('Los apellidos deben tener entre 2 y 15 caracteres');
    }
    if (!validationUtils.isValidName(apellidos)) {
      errors.push('Los apellidos solo pueden contener letras y espacios');
    }
    if (!validationUtils.noMultipleSpaces(apellidos)) {
      errors.push('Los apellidos no pueden tener espacios múltiples consecutivos');
    }
    if (!validationUtils.noLeadingTrailingSpaces(apellidos)) {
      errors.push('Los apellidos no pueden comenzar o terminar con espacios');
    }
  }

  // ========== VALIDACIONES DE CORREO ==========
  if (!validationUtils.isRequired(correo)) {
    errors.push('El correo electrónico es obligatorio');
  } else {
    if (!validationUtils.hasValidEmailLength(correo)) {
      errors.push('El correo debe tener entre 5 y 100 caracteres');
    }
    if (!validationUtils.isValidEmail(correo)) {
      errors.push('El formato del correo electrónico no es válido');
    } else {
      if (!validationUtils.isValidEmailDomain(correo)) {
        errors.push('El dominio del correo electrónico no es válido');
      }
    }
    if (!validationUtils.isUniqueEmail(correo, usuarios, usuarioSeleccionado?.id)) {
      errors.push('Ya existe un usuario registrado con este correo electrónico');
    }
  }

  // ========== VALIDACIONES DE CONTRASEÑA ==========
  if (modalTipo === 'agregar' || (modalTipo === 'editar' && contraseña !== '********')) {
    if (!validationUtils.isRequired(contraseña)) {
      errors.push('La contraseña es obligatoria');
    } else {
      if (!validationUtils.hasMinLength(contraseña, 8)) {
        errors.push('La contraseña debe tener al menos 8 caracteres');
      }
      if (!validationUtils.hasMaxLength(contraseña, 50)) {
        errors.push('La contraseña no puede tener más de 50 caracteres');
      }
      if (!validationUtils.hasLetter(contraseña)) {
        errors.push('La contraseña debe contener al menos una letra');
      }
      if (!validationUtils.hasNumber(contraseña)) {
        errors.push('La contraseña debe contener al menos un número');
      }
      if (!validationUtils.hasUpperCase(contraseña)) {
        errors.push('La contraseña debe contener al menos una letra mayúscula');
      }
      if (!validationUtils.hasLowerCase(contraseña)) {
        errors.push('La contraseña debe contener al menos una letra minúscula');
      }
      if (!validationUtils.hasSpecialChar(contraseña)) {
        errors.push('La contraseña debe contener al menos un carácter especial (!@#$%^&*()_+-=[]{}|;:,.<>?)');
      }
      if (!validationUtils.noCommonPatterns(contraseña)) {
        errors.push('La contraseña no puede contener patrones comunes (123456, password, qwerty, etc.)');
      }
    }

    // ========== VALIDACIÓN DE CONFIRMACIÓN DE CONTRASEÑA ==========
    if (modalTipo === 'agregar') {
      if (!validationUtils.isRequired(confirmarContraseña)) {
        errors.push('Debe confirmar la contraseña');
      } else if (contraseña !== confirmarContraseña) {
        errors.push('La confirmación de contraseña no coincide');
      }
    }
  }

  // ========== VALIDACIONES DE TIPO DE DOCUMENTO ==========
  if (!validationUtils.isValidSelection(tipo_documento_id)) {
    errors.push('Debe seleccionar un tipo de documento');
  }

  // ========== VALIDACIONES DE DOCUMENTO ==========
  if (!validationUtils.isRequired(documento)) {
    errors.push('El número de documento es obligatorio');
  } else {
    // Validación según el tipo de documento
    if (tipo_documento_id === 'PA') {
      // Para pasaporte permitir alfanumérico
      if (!validationUtils.isAlphanumeric(documento)) {
        errors.push('El pasaporte solo puede contener letras y números');
      }
    } else {
      // Para otros tipos solo números
      if (!validationUtils.isNumeric(documento)) {
        errors.push('El documento solo puede contener números');
      }
    }
    
    if (!validationUtils.isValidDocumentLength(documento, tipo_documento_id)) {
      errors.push('La longitud del documento no es válida para el tipo seleccionado');
    }
    if (!validationUtils.isValidDocumentFormat(documento, tipo_documento_id)) {
      errors.push('El formato del documento no es válido para el tipo seleccionado');
    }
    if (!validationUtils.isUniqueDocument(documento, usuarios, usuarioSeleccionado?.id)) {
      errors.push('Ya existe un usuario registrado con este número de documento');
    }
  }

  // ========== VALIDACIONES DE ROL ==========
  if (!validationUtils.isValidSelection(rol_id)) {
    errors.push('Debe seleccionar un rol para el usuario');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Función para validar en tiempo real (campo por campo)
const validarCampoEnTiempoReal = (campo, valor, formData, usuarios, usuarioSeleccionado) => {
  const errors = [];

  switch(campo) {
    case 'nombres':
      if (valor && !validationUtils.isValidName(valor)) {
        errors.push('Solo se permiten letras y espacios');
      }
      if (valor && !validationUtils.hasValidNameLength(valor)) {
        errors.push('Debe tener entre 2 y 15 caracteres');
      }
      break;

    case 'apellidos':
      if (valor && !validationUtils.isValidName(valor)) {
        errors.push('Solo se permiten letras y espacios');
      }
      if (valor && !validationUtils.hasValidNameLength(valor)) {
        errors.push('Debe tener entre 2 y 15 caracteres');
      }
      break;

    case 'correo':
      if (valor && !validationUtils.isValidEmail(valor)) {
        errors.push('Formato de correo inválido');
      }
      if (valor && !validationUtils.isUniqueEmail(valor, usuarios, usuarioSeleccionado?.id)) {
        errors.push('Este correo ya está registrado');
      }
      break;

    case 'contraseña':
      if (valor) {
        if (!validationUtils.hasMinLength(valor, 8)) {
          errors.push('Mínimo 8 caracteres');
        }
        if (!validationUtils.hasUpperCase(valor)) {
          errors.push('Falta mayúscula');
        }
        if (!validationUtils.hasLowerCase(valor)) {
          errors.push('Falta minúscula');
        }
        if (!validationUtils.hasNumber(valor)) {
          errors.push('Falta número');
        }
        if (!validationUtils.hasSpecialChar(valor)) {
          errors.push('Falta carácter especial');
        }
      }
      break;

    case 'documento':
      // Validación según tipo de documento
      if (valor && formData.tipo_documento_id) {
        if (formData.tipo_documento_id === 'PA') {
          if (!validationUtils.isAlphanumeric(valor)) {
            errors.push('Solo letras y números para pasaporte');
          }
        } else {
          if (!validationUtils.isNumeric(valor)) {
            errors.push('Solo se permiten números');
          }
        }
        
        if (!validationUtils.isValidDocumentFormat(valor, formData.tipo_documento_id)) {
          errors.push('Formato inválido para este tipo de documento');
        }
        if (!validationUtils.isUniqueDocument(valor, usuarios, usuarioSeleccionado?.id)) {
          errors.push('Este documento ya está registrado');
        }
      }
      break;
  }

  return errors;
};

// Función para mostrar múltiples errores
const mostrarErrores = (errores, setNotification) => {
  if (errores.length === 1) {
    setNotification({ 
      visible: true, 
      mensaje: errores[0], 
      tipo: 'error' 
    });
  } else if (errores.length > 1) {
    const mensajeErrores = `Se encontraron ${errores.length} errores:\n${errores.slice(0, 3).map((error, index) => `${index + 1}. ${error}`).join('\n')}${errores.length > 3 ? '\n...' : ''}`;
    setNotification({ 
      visible: true, 
      mensaje: mensajeErrores, 
      tipo: 'error' 
    });
  }
};

export default function UsuariosForm({
  modalTipo,
  usuarioSeleccionado,
  roles,
  tiposDocumento,
  usuarios,
  onSave,
  onCancel,
  setNotification,
}) {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    contraseña: '',
    confirmarContraseña: '',
    rol_id: '',
    tipo_documento_id: '',
    documento: '',
    activo: true
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isReadOnly = modalTipo === 'visualizar';

  useEffect(() => {
    if ((modalTipo === 'editar' || modalTipo === 'visualizar') && usuarioSeleccionado) {
      setFormData({
        nombres: usuarioSeleccionado.nombres || '',
        apellidos: usuarioSeleccionado.apellidos || '',
        correo: usuarioSeleccionado.correo || '',
        contraseña: usuarioSeleccionado.contraseña || '********',
        confirmarContraseña: '',
        rol_id: usuarioSeleccionado.rol_id || '',
        tipo_documento_id: usuarioSeleccionado.tipo_documento_id || '',
        documento: usuarioSeleccionado.documento || '',
        activo: usuarioSeleccionado.activo !== false
      });
    } else {
      // Reset form for 'agregar'
      setFormData({
        nombres: '',
        apellidos: '',
        correo: '',
        contraseña: '',
        confirmarContraseña: '',
        rol_id: '',
        tipo_documento_id: '',
        documento: '',
        activo: true
      });
    }
    setFieldErrors({});
  }, [modalTipo, usuarioSeleccionado]);

  const handleInputChange = (field, value) => {
    if (isReadOnly) return;

    let cleanedValue = value;
    
    // Limpiar valores según el campo
    if (field === 'documento') {
      if (formData.tipo_documento_id === 'PA') {
        // Para pasaporte permitir alfanumérico y convertir a mayúsculas
        cleanedValue = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      } else {
        // Para otros tipos solo números
        cleanedValue = value.replace(/[^0-9]/g, '');
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: cleanedValue }));
    
    // Validación en tiempo real
    const errors = validarCampoEnTiempoReal(field, cleanedValue, formData, usuarios, usuarioSeleccionado);
    setFieldErrors(prev => ({
      ...prev,
      [field]: errors
    }));

    // Limpiar errores relacionados cuando se corrigen
    if (field === 'contraseña' && fieldErrors.confirmarContraseña) {
      setTimeout(() => {
        if (formData.confirmarContraseña && cleanedValue === formData.confirmarContraseña) {
          setFieldErrors(prev => ({
            ...prev,
            confirmarContraseña: []
          }));
        }
      }, 100);
    }
    
    if (field === 'confirmarContraseña' && cleanedValue === formData.contraseña) {
      setFieldErrors(prev => ({
        ...prev,
        confirmarContraseña: []
      }));
    }
  };

  const handleSave = () => {
    if (isReadOnly) return;

    const validation = validarFormularioCompleto(
      formData, 
      modalTipo, 
      usuarios, 
      usuarioSeleccionado
    );
    
    if (!validation.isValid) {
      mostrarErrores(validation.errors, setNotification);
      return;
    }
    
    onSave(formData);
  };

  return (
    <div className="usuarios-modal-body usuarios-modal-body-compact">
      <div className="usuarios-modal-grid-two-columns">
        {/* COLUMNA 1 */}
        <div className="usuarios-modal-column">
          {/* Tipo de Documento */}
          <div className="modal-field">
            <label className="modal-label">
              Tipo de Documento<span className="required">*</span>:
            </label>
            <select
              value={formData.tipo_documento_id}
              onChange={(e) => {
                handleInputChange('tipo_documento_id', e.target.value);
                // Limpiar documento cuando cambia el tipo
                if (formData.documento) {
                  setFormData(prev => ({ ...prev, documento: '' }));
                  setFieldErrors(prev => ({ ...prev, documento: [] }));
                }
              }}
              className={`modal-input ${fieldErrors.tipo_documento_id?.length ? 'error' : ''}`}
              disabled={isReadOnly}
            >
              <option value="">Seleccionar</option>
              {tiposDocumento.map(tipo => (
                <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
              ))}
            </select>
            {fieldErrors.tipo_documento_id?.length > 0 && (
              <div className="error-message">
                {fieldErrors.tipo_documento_id[0]}
              </div>
            )}
          </div>

          {/* Nombres */}
          <div className="modal-field">
            <label className="modal-label">
              Nombre<span className="required">*</span>:
            </label>
            <input
              type="text"
              value={formData.nombres}
              onChange={(e) => handleInputChange('nombres', e.target.value)}
              className={`modal-input ${fieldErrors.nombres?.length ? 'error' : ''}`}
              placeholder="Nombres"
              maxLength="15"
              readOnly={isReadOnly}
            />
            {fieldErrors.nombres?.length > 0 && (
              <div className="error-message">
                {fieldErrors.nombres[0]}
              </div>
            )}
          </div>

          {/* Correo */}
          <div className="modal-field">
            <label className="modal-label">
              Correo<span className="required">*</span>:
            </label>
            <input
              type="email"
              value={formData.correo}
              onChange={(e) => handleInputChange('correo', e.target.value)}
              className={`modal-input ${fieldErrors.correo?.length ? 'error' : ''}`}
              placeholder="ejemplo@correo.com"
              maxLength="100"
              readOnly={isReadOnly}
            />
            {fieldErrors.correo?.length > 0 && (
              <div className="error-message">
                {fieldErrors.correo[0]}
              </div>
            )}
          </div>

          {/* Contraseña */}
          <div className="modal-field">
            <label className="modal-label">
              Contraseña<span className="required">*</span>:
            </label>
            <div className="password-container" style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.contraseña}
                onChange={(e) => handleInputChange('contraseña', e.target.value)}
                className={`modal-input ${fieldErrors.contraseña?.length ? 'error' : ''}`}
                placeholder="8+ chars, 1 mayúscula, 1 special"
                maxLength="50"
                readOnly={isReadOnly}
              />
              {!isReadOnly && (
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    zIndex: 1
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              )}
            </div>
            {fieldErrors.contraseña?.length > 0 && (
              <div className="error-message">
                {fieldErrors.contraseña.slice(0, 2).map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA 2 */}
        <div className="modal-column">
          {/* N° Documento */}
          <div className="modal-field">
            <label className="modal-label">
              N° Documento<span className="required">*</span>:
            </label>
            <input
              type="text"
              value={formData.documento}
              onChange={(e) => handleInputChange('documento', e.target.value)}
              className={`modal-input ${fieldErrors.documento?.length ? 'error' : ''}`}
              placeholder={formData.tipo_documento_id === 'PA' ? 'Alfanumérico' : 'Número'}
              maxLength="12"
              inputMode={formData.tipo_documento_id === 'PA' ? 'text' : 'numeric'}
              readOnly={isReadOnly}
            />
            {fieldErrors.documento?.length > 0 && (
              <div className="error-message">
                {fieldErrors.documento[0]}
              </div>
            )}
          </div>

          {/* Apellidos */}
          <div className="modal-field">
            <label className="modal-label">
              Apellido<span className="required">*</span>:
            </label>
            <input
              type="text"
              value={formData.apellidos}
              onChange={(e) => handleInputChange('apellidos', e.target.value)}
              className={`modal-input ${fieldErrors.apellidos?.length ? 'error' : ''}`}
              placeholder="Apellidos"
              maxLength="15"
              readOnly={isReadOnly}
            />
            {fieldErrors.apellidos?.length > 0 && (
              <div className="error-message">
                {fieldErrors.apellidos[0]}
              </div>
            )}
          </div>

          {/* Rol */}
          <div className="modal-field">
            <label className="modal-label">
              Rol<span className="required">*</span>:
            </label>
            <select
              value={formData.rol_id}
              onChange={(e) => handleInputChange('rol_id', e.target.value)}
              className={`modal-input ${fieldErrors.rol_id?.length ? 'error' : ''}`}
              disabled={isReadOnly}
            >
              <option value="">Seleccionar rol</option>
              {roles.map(rol => (
                <option key={rol.id} value={rol.id}>{rol.nombre}</option>
              ))}
            </select>
            {fieldErrors.rol_id?.length > 0 && (
              <div className="error-message">
                {fieldErrors.rol_id[0]}
              </div>
            )}
          </div>

          {/* Confirmar Contraseña - Solo en agregar */}
          {modalTipo === 'agregar' && (
            <div className="modal-field">
              <label className="modal-label">
                Confirmar Contraseña<span className="required">*</span>:
              </label>
              <div className="password-container" style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmarContraseña}
                  onChange={(e) => handleInputChange('confirmarContraseña', e.target.value)}
                  className={`modal-input ${fieldErrors.confirmarContraseña?.length ? 'error' : ''}`}
                  placeholder="Confirme la contraseña"
                  maxLength="50"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    zIndex: 1
                  }}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {fieldErrors.confirmarContraseña?.length > 0 && (
                <div className="error-message">
                  {fieldErrors.confirmarContraseña[0]}
                </div>
              )}
              {formData.contraseña && formData.confirmarContraseña && 
               formData.contraseña === formData.confirmarContraseña && (
                <div className="success-message">
                  ✓ Las contraseñas coinciden
                </div>
              )}
            </div>
          )}

          {/* Estado */}
          {modalTipo !== 'agregar' && (
            <div className="modal-field">
              <label className="modal-label">Estado:</label>
              <div className="switch-container">
                <InputSwitch
                  checked={formData.activo}
                  onChange={(e) => handleInputChange('activo', e.value)}
                  disabled={isReadOnly}
                />
                <span className="switch-label">
                  {formData.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="modal-footer">
        <button className="modal-btn cancel-btn" onClick={onCancel}>
          {isReadOnly ? 'Cerrar' : 'Cancelar'}
        </button>
        {!isReadOnly && (
          <button className="modal-btn save-btn" onClick={handleSave}>
            Guardar
          </button>
        )}
      </div>
    </div>
  );
}