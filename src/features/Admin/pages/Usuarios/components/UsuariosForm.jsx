import React, { useState, useEffect, useRef } from 'react';
import { InputSwitch } from 'primereact/inputswitch';
import roleApiService from '../../../services/roles_services';



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

// ============================================
// COMPONENTE PARA SELECTOR DE ROL CON BÚSQUEDA
// ============================================
function RoleSelectorWithSearch({ 
  value, 
  onChange, 
  roles, 
  disabled, 
  onCreateRole,
  hasError 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar roles según búsqueda y solo mostrar activos
  const filteredRoles = roles.filter(rol =>
    rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    rol.activo !== false
  );

  // Obtener el rol seleccionado
  const selectedRole = roles.find(rol => rol.id === value);

  const handleSelectRole = (roleId) => {
    onChange(roleId);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      {/* Input de búsqueda con botón + */}
      <div style={{ 
        display: 'flex', 
        gap: '8px',
        alignItems: 'stretch'
      }}>
        <div style={{ 
          flex: 1,
          position: 'relative'
        }}>
          <input
            type="text"
            value={isDropdownOpen ? searchTerm : (selectedRole?.nombre || '')}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!isDropdownOpen) setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Buscar por nombre..."
            disabled={disabled}
            className={`modal-input ${hasError ? 'error' : ''}`}
            style={{
              paddingRight: '35px',
              cursor: disabled ? 'not-allowed' : 'text'
            }}
          />
          {!disabled && (
            <i 
              className="pi pi-search" 
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#999',
                pointerEvents: 'none'
              }}
            />
          )}
        </div>

        {/* Botón + para crear rol */}
       <button
  type="button"
  onClick={onCreateRole}
  disabled={disabled}
  style={{
    width: '36px',
    height: '36px',
    backgroundColor: disabled ? '#e0e0e0' : '#e91e63',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    flexShrink: 0
  }}
  onMouseOver={(e) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = '#c2185b';
      e.currentTarget.style.transform = 'scale(1.05)';
    }
  }}
  onMouseOut={(e) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = '#e91e63';
      e.currentTarget.style.transform = 'scale(1)';
    }
  }}
  title="Crear nuevo rol"
>
  +
</button>
      </div>

      {/* Dropdown con resultados */}
      {isDropdownOpen && !disabled && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          backgroundColor: 'white',
          border: '2px solid #f48fb1',
          borderRadius: '8px',
          maxHeight: '250px',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {filteredRoles.length > 0 ? (
            filteredRoles.map(rol => (
              <div
                key={rol.id}
                onClick={() => handleSelectRole(rol.id)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f5f5f5',
                  backgroundColor: value === rol.id ? '#fce4ec' : 'white',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  if (value !== rol.id) {
                    e.currentTarget.style.backgroundColor = '#f8f8f8';
                  }
                }}
                onMouseOut={(e) => {
                  if (value !== rol.id) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <div style={{ 
                  fontWeight: value === rol.id ? '600' : '400',
                  color: value === rol.id ? '#c2185b' : '#333',
                  marginBottom: '4px'
                }}>
                  {rol.nombre}
                  {value === rol.id && (
                    <i 
                      className="pi pi-check" 
                      style={{ 
                        marginLeft: '8px', 
                        color: '#4caf50',
                        fontSize: '14px'
                      }}
                    />
                  )}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666' 
                }}>
                  {rol.descripcion}
                </div>
              </div>
            ))
          ) : (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#999',
              fontStyle: 'italic'
            }}>
              <i className="pi pi-info-circle" style={{ marginRight: '8px' }}/>
              No se encontraron roles con "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// MODAL SIMPLE PARA CREAR ROL RÁPIDO
// ============================================
function QuickCreateRoleModal({ 
  isOpen, 
  onClose, 
  onSave, 
  permisos,
  showNotification 
}) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    permisos: [],
    activo: true
  });

  const [validaciones, setValidaciones] = useState({
    nombre: { valido: false, mensaje: '' },
    descripcion: { valido: false, mensaje: '' }
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form cuando se abre
      setFormData({
        nombre: '',
        descripcion: '',
        permisos: [],
        activo: true
      });
      setValidaciones({
        nombre: { valido: false, mensaje: '' },
        descripcion: { valido: false, mensaje: '' }
      });
    }
  }, [isOpen]);

  const validarNombre = (nombre) => {
    const nombreTrimmed = nombre.trim();

    if (!nombreTrimmed) {
      return { valido: false, mensaje: 'El nombre del rol es obligatorio' };
    }

    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!soloLetras.test(nombreTrimmed)) {
      return { valido: false, mensaje: 'El nombre solo puede contener letras y espacios' };
    }

    if (nombreTrimmed.length < 3) {
      return { valido: false, mensaje: 'El nombre debe tener al menos 3 caracteres' };
    }

    if (nombreTrimmed.length > 20) {
      return { valido: false, mensaje: 'El nombre no puede tener más de 20 caracteres' };
    }

    if (roleApiService.esRolAdmin(nombreTrimmed)) {
      return { valido: false, mensaje: 'No se puede crear otro rol con el nombre "Admin"' };
    }

    return { valido: true, mensaje: '✓ Nombre válido' };
  };

  const validarDescripcion = (descripcion) => {
    const descripcionTrimmed = descripcion.trim();

    if (!descripcionTrimmed) {
      return { valido: false, mensaje: 'La descripción es obligatoria' };
    }

    if (descripcionTrimmed.length < 5) {
      return { valido: false, mensaje: 'La descripción debe tener al menos 5 caracteres' };
    }

    if (descripcionTrimmed.length > 30) {
      return { valido: false, mensaje: 'La descripción no puede tener más de 30 caracteres' };
    }

    return { valido: true, mensaje: '✓ Descripción válida' };
  };

  const handleInputChange = (field, value) => {
    if (field === 'nombre') {
      const soloLetras = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
      const sinEspaciosMultiples = soloLetras.replace(/\s+/g, ' ');
      setFormData(prev => ({ ...prev, nombre: sinEspaciosMultiples }));
      const validacion = validarNombre(sinEspaciosMultiples);
      setValidaciones(prev => ({ ...prev, nombre: validacion }));
    } else if (field === 'descripcion') {
      setFormData(prev => ({ ...prev, [field]: value }));
      const validacion = validarDescripcion(value);
      setValidaciones(prev => ({ ...prev, descripcion: validacion }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handlePermisoChange = (permisoId, checked) => {
    setFormData(prev => ({
      ...prev,
      permisos: checked
        ? [...prev.permisos, permisoId]
        : prev.permisos.filter(id => id !== permisoId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nombreValidacion = validarNombre(formData.nombre);
    const descripcionValidacion = validarDescripcion(formData.descripcion);

    setValidaciones({
      nombre: nombreValidacion,
      descripcion: descripcionValidacion
    });

    if (!nombreValidacion.valido) {
      showNotification(nombreValidacion.mensaje, 'error');
      return;
    }

    if (!descripcionValidacion.valido) {
      showNotification(descripcionValidacion.mensaje, 'error');
      return;
    }

    if (formData.permisos.length === 0) {
      showNotification('Debe seleccionar al menos un permiso', 'error');
      return;
    }

    try {
      setSaving(true);
      await onSave(formData);
    } catch (error) {
      showNotification(`Error al crear rol: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // Agrupar permisos por módulo
  const permisosPorModulo = permisos.reduce((acc, permiso) => {
    if (!acc[permiso.modulo]) {
      acc[permiso.modulo] = [];
    }
    acc[permiso.modulo].push(permiso);
    return acc;
  }, {});

  const formularioValido = validaciones.nombre.valido && 
                          validaciones.descripcion.valido && 
                          formData.permisos.length > 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ 
          marginTop: 0, 
          marginBottom: '24px', 
          color: '#c2185b',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <i className="pi pi-plus-circle"/>
          Crear Rol Rápido
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Nombre del Rol */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: '#333'
            }}>
              Nombre del Rol <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: `2px solid ${validaciones.nombre.valido ? '#4caf50' : (validaciones.nombre.mensaje ? '#f44336' : '#f48fb1')}`,
                borderRadius: '6px',
                outline: 'none',
                backgroundColor: validaciones.nombre.valido ? '#f1f8e9' : (validaciones.nombre.mensaje ? '#ffebee' : 'white')
              }}
              placeholder="Ej: Vendedor"
              maxLength={20}
            />
            {validaciones.nombre.mensaje && (
              <small style={{
                color: validaciones.nombre.valido ? '#4caf50' : '#f44336',
                fontSize: '12px',
                display: 'block',
                marginTop: '4px'
              }}>
                {validaciones.nombre.mensaje}
              </small>
            )}
            <small style={{ color: '#666', fontSize: '11px', display: 'block', marginTop: '2px' }}>
              Solo letras y espacios ({formData.nombre.length}/20)
            </small>
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: '#333'
            }}>
              Descripción <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: `2px solid ${validaciones.descripcion.valido ? '#4caf50' : (validaciones.descripcion.mensaje ? '#f44336' : '#f48fb1')}`,
                borderRadius: '6px',
                outline: 'none',
                minHeight: '70px',
                resize: 'vertical',
                backgroundColor: validaciones.descripcion.valido ? '#f1f8e9' : (validaciones.descripcion.mensaje ? '#ffebee' : 'white')
              }}
              placeholder="Describe las responsabilidades..."
              maxLength={30}
            />
            {validaciones.descripcion.mensaje && (
              <small style={{
                color: validaciones.descripcion.valido ? '#4caf50' : '#f44336',
                fontSize: '12px',
                display: 'block',
                marginTop: '4px'
              }}>
                {validaciones.descripcion.mensaje}
              </small>
            )}
            <small style={{ color: '#666', fontSize: '11px', display: 'block', marginTop: '2px' }}>
              {formData.descripcion.length}/30 caracteres
            </small>
          </div>

          {/* Permisos */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: '#333'
            }}>
              Permisos del Sistema <span style={{ color: 'red' }}>*</span>
            </label>
            <div style={{
              padding: '16px',
              border: `2px solid ${formData.permisos.length === 0 ? '#f44336' : '#f48fb1'}`,
              borderRadius: '10px',
              backgroundColor: '#fafafa',
              maxHeight: '250px',
              overflowY: 'auto'
            }}>
              {Object.keys(permisosPorModulo).sort().map((modulo) => (
                <div key={modulo} style={{ marginBottom: '12px' }}>
                  <h4 style={{
                    color: '#c2185b',
                    fontSize: '14px',
                    marginBottom: '8px',
                    borderBottom: '1px solid #f48fb1',
                    paddingBottom: '4px'
                  }}>
                    {modulo}
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '8px',
                    marginLeft: '12px'
                  }}>
                    {permisosPorModulo[modulo].map((permiso) => (
                      <div key={permiso.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '4px',
                        borderRadius: '4px',
                        backgroundColor: formData.permisos.includes(permiso.id) ? '#f3e5f5' : 'transparent'
                      }}>
                        <input
                          type="checkbox"
                          id={`quick-permiso-${permiso.id}`}
                          checked={formData.permisos.includes(permiso.id)}
                          onChange={(e) => handlePermisoChange(permiso.id, e.target.checked)}
                          style={{ 
                            width: '16px', 
                            height: '16px', 
                            cursor: 'pointer',
                            accentColor: '#c2185b'
                          }}
                        />
                        <label
                          htmlFor={`quick-permiso-${permiso.id}`}
                          style={{
                            fontSize: '13px',
                            cursor: 'pointer',
                            margin: 0,
                            fontWeight: formData.permisos.includes(permiso.id) ? '600' : 'normal',
                            color: formData.permisos.includes(permiso.id) ? '#c2185b' : 'inherit'
                          }}
                        >
                          {permiso.nombre}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <small style={{ 
              color: formData.permisos.length === 0 ? '#f44336' : '#666',
              fontSize: '12px',
              display: 'block',
              marginTop: '4px',
              fontWeight: formData.permisos.length === 0 ? 'bold' : 'normal'
            }}>
              {formData.permisos.length === 0
                ? 'Debe seleccionar al menos un permiso' 
                : `${formData.permisos.length} permiso(s) seleccionado(s)`}
            </small>
          </div>

          {/* Botones */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #eee'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: '10px 24px',
                backgroundColor: '#f5f5f5',
                color: '#666',
                border: 'none',
                borderRadius: '6px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formularioValido || saving}
              style={{
                padding: '10px 24px',
                backgroundColor: formularioValido && !saving ? '#4caf50' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: formularioValido && !saving ? 'pointer' : 'not-allowed',
                fontWeight: '500',
                transition: 'all 0.2s',
                opacity: formularioValido && !saving ? 1 : 0.6
              }}
            >
              {saving ? (
                <>
                  <i className="pi pi-spin pi-spinner" style={{ marginRight: '8px' }}></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="pi pi-check" style={{ marginRight: '8px' }}></i>
                  Crear Rol
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL: FORMULARIO DE USUARIOS
// ============================================
export default function UsuariosForm({
  modalTipo,
  usuarioSeleccionado,
  roles: initialRoles,
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
  
  // Estados para gestión de roles
  const [roles, setRoles] = useState(initialRoles);
  const [showQuickCreateRole, setShowQuickCreateRole] = useState(false);
  const [permisos, setPermisos] = useState([]);
  const [loadingPermisos, setLoadingPermisos] = useState(false);

  const isReadOnly = modalTipo === 'visualizar';

  // Cargar permisos cuando se monta el componente
  useEffect(() => {
    cargarPermisos();
  }, []);

  // Actualizar roles cuando cambian desde el padre
  useEffect(() => {
    setRoles(initialRoles);
  }, [initialRoles]);

  const cargarPermisos = async () => {
    try {
      setLoadingPermisos(true);
      const permisosData = await roleApiService.obtenerPermisos();
      setPermisos(permisosData);
    } catch (error) {
      console.error('Error al cargar permisos:', error);
      setNotification({ 
        visible: true, 
        mensaje: 'No se pudieron cargar los permisos', 
        tipo: 'warning' 
      });
    } finally {
      setLoadingPermisos(false);
    }
  };

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

  // Función para manejar la creación rápida de rol
  const handleQuickCreateRole = async (roleData) => {
    try {
      const nuevoRol = await roleApiService.crearRol(roleData);
      
      // Actualizar lista de roles
      setRoles(prev => [...prev, nuevoRol]);
      
      // Seleccionar automáticamente el nuevo rol
      setFormData(prev => ({ ...prev, rol_id: nuevoRol.id }));
      
      // Cerrar modal de creación
      setShowQuickCreateRole(false);
      
      // Mostrar notificación de éxito
      setNotification({ 
        visible: true, 
        mensaje: `Rol "${nuevoRol.nombre}" creado exitosamente y seleccionado`, 
        tipo: 'success' 
      });
    } catch (error) {
      console.error('Error al crear rol rápido:', error);
      setNotification({ 
        visible: true, 
        mensaje: `Error al crear rol: ${error.message}`, 
        tipo: 'error' 
      });
    }
  };

  return (
  <>
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
            <div className="password-container">
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
                >
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
        <div className="usuarios-modal-column">
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

          {/* Rol con buscador y botón + */}
          <div className="modal-field">
            <label className="modal-label">
              Rol<span className="required">*</span>:
            </label>
            <RoleSelectorWithSearch
              value={formData.rol_id}
              onChange={(value) => handleInputChange('rol_id', value)}
              roles={roles}
              disabled={isReadOnly}
              onCreateRole={() => setShowQuickCreateRole(true)}
              hasError={fieldErrors.rol_id?.length > 0}
            />
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
              <div className="password-container">
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

          {/* Estado - Solo en editar/visualizar */}
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

    {/* Modal de Creación Rápida de Rol */}
    <QuickCreateRoleModal
      isOpen={showQuickCreateRole}
      onClose={() => setShowQuickCreateRole(false)}
      onSave={handleQuickCreateRole}
      permisos={permisos}
      showNotification={(mensaje, tipo) => setNotification({ 
        visible: true, 
        mensaje, 
        tipo 
      })}
    />
  </>
);
}