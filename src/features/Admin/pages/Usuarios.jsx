import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  useEffect(() => {
    const mockUsuarios = [
      { 
        id: 1, 
        nombres: 'Juan Carlos', 
        apellidos: 'Pérez García',
        correo: 'juan@gmail.com', 
        contraseña: '123456',
        rol_id: 1, 
        rol_nombre: 'Administrador',
        tipo_documento_id: 1,
        tipo_documento_nombre: 'Cédula de Ciudadanía',
        documento: '12345678',
        activo: true 
      },
      { 
        id: 2, 
        nombres: 'María Elena', 
        apellidos: 'García López',
        correo: 'maria@gmail.com', 
        contraseña: '123456',
        rol_id: 2, 
        rol_nombre: 'Repostero',
        tipo_documento_id: 1,
        tipo_documento_nombre: 'Cédula de Ciudadanía',
        documento: '87654321',
        activo: true 
      },
      { 
        id: 3, 
        nombres: 'Carlos Alberto', 
        apellidos: 'Rodríguez Martínez',
        correo: 'carlos@gmail.com', 
        contraseña: '123456',
        rol_id: 3, 
        rol_nombre: 'Decorador',
        tipo_documento_id: 2,
        tipo_documento_nombre: 'Cédula de Extranjería',
        documento: '11223344',
        activo: false 
      },
      { 
        id: 4, 
        nombres: 'Ana Patricia', 
        apellidos: 'Martínez Hernández',
        correo: 'ana@gmail.com', 
        contraseña: '123456',
        rol_id: 2, 
        rol_nombre: 'Repostero',
        tipo_documento_id: 1,
        tipo_documento_nombre: 'Cédula de Ciudadanía',
        documento: '55667788',
        activo: true 
      },
      { 
        id: 5, 
        nombres: 'Luis Fernando', 
        apellidos: 'Fernández Silva',
        correo: 'luis@gmail.com', 
        contraseña: '123456',
        rol_id: 1, 
        rol_nombre: 'Administrador',
        tipo_documento_id: 3,
        tipo_documento_nombre: 'Pasaporte',
        documento: 'AB123456',
        activo: true 
      }
    ];

    const mockRoles = [
      { id: 1, nombre: 'Administrador' },
      { id: 2, nombre: 'Repostero' },
      { id: 3, nombre: 'Decorador' },
      { id: 4, nombre: 'Vendedor' }
    ];

    const mockTiposDocumento = [
      { id: 1, nombre: 'Cédula de Ciudadanía' },
      { id: 2, nombre: 'Cédula de Extranjería' },
      { id: 3, nombre: 'Pasaporte' },
      { id: 4, nombre: 'NIT' }
    ];

    setUsuarios(mockUsuarios);
    setRoles(mockRoles);
    setTiposDocumento(mockTiposDocumento);
  }, []);

  const toggleActivo = (usuario) => {
    const updated = usuarios.map(usr =>
      usr.id === usuario.id ? { ...usr, activo: !usr.activo } : usr
    );
    setUsuarios(updated);
    showNotification(`Usuario ${usuario.activo ? 'desactivado' : 'activado'} exitosamente`);
  };

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const abrirModal = (tipo, usuario = null) => {
    setModalTipo(tipo);
    setUsuarioSeleccionado(usuario);
    setFieldErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    
    if (tipo === 'agregar') {
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
    } else if (tipo === 'editar' && usuario) {
      setFormData({
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        contraseña: usuario.contraseña,
        confirmarContraseña: '',
        rol_id: usuario.rol_id,
        tipo_documento_id: usuario.tipo_documento_id,
        documento: usuario.documento,
        activo: usuario.activo
      });
    }
    
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setUsuarioSeleccionado(null);
    setModalTipo(null);
    setFieldErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
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
  };

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
    return trimmed.length >= 2 && trimmed.length <= 4; // Cambiado de 50 a 15
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
    // Lista de dominios comunes válidos (puedes expandir esta lista)
    const validDomains = [
      'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 
      'empresa.com', 'corporativo.co', 'admin.com'
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    // Permitir cualquier dominio válido, no solo los de la lista
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
      /123456/, /password/, /qwerty/, /admin/, /12345/,
      /000000/, /111111/, /222222/, /333333/, /444444/,
      /555555/, /666666/, /777777/, /888888/, /999999/
    ];
    return !commonPatterns.some(pattern => pattern.test(password.toLowerCase()));
  },

  noPersonalInfo: (password, nombres, apellidos, documento) => {
    const lowerPassword = password.toLowerCase();
    const personalInfo = [
      nombres?.toLowerCase(),
      apellidos?.toLowerCase(),
      documento
    ].filter(Boolean);
    
    return !personalInfo.some(info => 
      info && lowerPassword.includes(info.toLowerCase())
    );
  },

  // Validaciones de documento
  isValidDocumentFormat: (documento, tipoDocumento) => {
    const documentoTrimmed = documento.trim();
    
    switch(tipoDocumento) {
      case 1: // Cédula de Ciudadanía
        return /^\d{7,10}$/.test(documentoTrimmed);
      case 2: // Cédula de Extranjería  
        return /^\d{6,10}$/.test(documentoTrimmed);
      case 3: // Pasaporte
        return /^[A-Z0-9]{6,12}$/i.test(documentoTrimmed);
      case 4: // NIT
        return /^\d{9,11}$/.test(documentoTrimmed);
      default:
        return documentoTrimmed.length >= 6 && documentoTrimmed.length <= 12;
    }
  },

  isValidDocumentLength: (documento, tipoDocumento) => {
    const length = documento.trim().length;
    switch(tipoDocumento) {
      case 1: // Cédula de Ciudadanía
        return length >= 7 && length <= 10;
      case 2: // Cédula de Extranjería
        return length >= 6 && length <= 10;
      case 3: // Pasaporte
        return length >= 6 && length <= 12;
      case 4: // NIT
        return length >= 9 && length <= 11;
      default:
        return length >= 6 && length <= 12;
    }
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
      errors.push('Los nombres deben tener entre 2 y 15 caracteres'); // Actualizado
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
      errors.push('Los apellidos deben tener entre 2 y 15 caracteres'); // Actualizado
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
    if (!validationUtils.noPersonalInfo(contraseña, nombres, apellidos, documento)) {
      errors.push('La contraseña no debe contener información personal (nombres, apellidos, documento)');
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

  // ========== VALIDACIONES DE TIPO DE DOCUMENTO ==========
  if (!validationUtils.isValidSelection(tipo_documento_id)) {
    errors.push('Debe seleccionar un tipo de documento');
  }

  // ========== VALIDACIONES DE DOCUMENTO ==========
  if (!validationUtils.isRequired(documento)) {
    errors.push('El número de documento es obligatorio');
  } else {
    const tipoDocumentoNum = parseInt(tipo_documento_id);
    
    if (!validationUtils.isValidDocumentLength(documento, tipoDocumentoNum)) {
      errors.push('La longitud del documento no es válida para el tipo seleccionado');
    }
    if (!validationUtils.isValidDocumentFormat(documento, tipoDocumentoNum)) {
      errors.push('el formato del documento no es válido para el tipo seleccionado');
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
        errors.push('Debe tener entre 2 y 15 caracteres'); // Actualizado
      }
      break;

    case 'apellidos':
      if (valor && !validationUtils.isValidName(valor)) {
        errors.push('Solo se permiten letras y espacios');
      }
      if (valor && !validationUtils.hasValidNameLength(valor)) {
        errors.push('Debe tener entre 2 y 15 caracteres'); // Actualizado
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
      if (valor && formData.tipo_documento_id) {
        const tipoDoc = parseInt(formData.tipo_documento_id);
        if (!validationUtils.isValidDocumentFormat(valor, tipoDoc)) {
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

// Función para obtener sugerencias de contraseña segura
const generarSugerenciaContraseña = (nombres, apellidos) => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const primeraLetraNombre = nombres?.charAt(0)?.toUpperCase() || 'A';
  const primeraLetraApellido = apellidos?.charAt(0)?.toUpperCase() || 'B';
  const numeros = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const especiales = '!@#$%^&*'[Math.floor(Math.random() * 8)];
  
  return `${primeraLetraNombre}${primeraLetraApellido}${numeros}${especiales}`;
};

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validación en tiempo real
    const errors = validarCampoEnTiempoReal(field, value, formData, usuarios, usuarioSeleccionado);
    setFieldErrors(prev => ({
      ...prev,
      [field]: errors
    }));

    // Limpiar errores relacionados cuando se corrigen
    if (field === 'contraseña' && fieldErrors.confirmarContraseña) {
      setTimeout(() => {
        if (formData.confirmarContraseña && value === formData.confirmarContraseña) {
          setFieldErrors(prev => ({
            ...prev,
            confirmarContraseña: []
          }));
        }
      }, 100);
    }
    
    if (field === 'confirmarContraseña' && value === formData.contraseña) {
      setFieldErrors(prev => ({
        ...prev,
        confirmarContraseña: []
      }));
    }
  };

  const validarFormulario = () => {
    const validation = validarFormularioCompleto(
      formData, 
      modalTipo, 
      usuarios, 
      usuarioSeleccionado
    );
    
    if (!validation.isValid) {
      mostrarErrores(validation.errors, setNotification);
      return false;
    }
    
    return true;
  };

  const guardarUsuario = () => {
    if (!validarFormulario()) return;

    const rolSeleccionado = roles.find(r => r.id === parseInt(formData.rol_id));
    const tipoDocumentoSeleccionado = tiposDocumento.find(td => td.id === parseInt(formData.tipo_documento_id));
    
    if (modalTipo === 'agregar') {
      const nuevoId = usuarios.length ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
      const nuevoUsuario = {
        ...formData,
        id: nuevoId,
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        correo: formData.correo.trim().toLowerCase(),
        documento: formData.documento.trim(),
        rol_id: parseInt(formData.rol_id),
        rol_nombre: rolSeleccionado.nombre,
        tipo_documento_id: parseInt(formData.tipo_documento_id),
        tipo_documento_nombre: tipoDocumentoSeleccionado.nombre
      };
      
      delete nuevoUsuario.confirmarContraseña;
      
      setUsuarios([...usuarios, nuevoUsuario]);
      showNotification('Usuario agregado exitosamente');
    } else if (modalTipo === 'editar') {
      const updated = usuarios.map(usr =>
        usr.id === usuarioSeleccionado.id 
          ? { 
              ...usr, 
              ...formData,
              nombres: formData.nombres.trim(),
              apellidos: formData.apellidos.trim(),
              correo: formData.correo.trim().toLowerCase(),
              documento: formData.documento.trim(),
              rol_id: parseInt(formData.rol_id), 
              rol_nombre: rolSeleccionado.nombre,
              tipo_documento_id: parseInt(formData.tipo_documento_id),
              tipo_documento_nombre: tipoDocumentoSeleccionado.nombre
            }
          : usr
      );
      setUsuarios(updated);
      showNotification('Usuario actualizado exitosamente');
    }
    
    cerrarModal();
  };

  const confirmarEliminar = () => {
    const updated = usuarios.filter(usr => usr.id !== usuarioSeleccionado.id);
    setUsuarios(updated);
    cerrarModal();
    showNotification('Usuario eliminado exitosamente');
  };

  const usuariosFiltrados = usuarios.filter(usr =>
    usr.nombres.toLowerCase().includes(filtro.toLowerCase()) ||
    usr.apellidos.toLowerCase().includes(filtro.toLowerCase()) ||
    usr.correo.toLowerCase().includes(filtro.toLowerCase()) ||
    usr.rol_nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    usr.documento.toLowerCase().includes(filtro.toLowerCase()) ||
    usr.tipo_documento_nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="admin-wrapper">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      <div className="admin-toolbar">
        <button
          className="admin-button pink"
          onClick={() => abrirModal('agregar')}
          type="button"
        >
          + Agregar 
        </button>
        <SearchBar
          placeholder="Buscar usuario..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>

      <h2 className="admin-section-title">Usuarios</h2>
      <DataTable
        value={usuariosFiltrados}
        className="admin-table"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column 
          header="N°" 
          body={(rowData, { rowIndex }) => rowIndex + 1} 
          style={{ width: '3rem', textAlign: 'center' }}
          headerStyle={{ paddingLeft: '1rem' }}
        />
        <Column 
          field="nombres" 
          header="Nombres" 
          headerStyle={{ paddingLeft: '2.5rem' }}
        />
        <Column 
          field="apellidos" 
          header="Apellidos" 
          headerStyle={{ paddingLeft: '4rem' }}
        />
        <Column 
          field="correo" 
          header="Correo" 
          headerStyle={{ paddingLeft: '4rem' }}
        />
        <Column 
          field="rol_nombre" 
          header="Rol" 
          headerStyle={{ paddingLeft: '3.5rem' }}
        />
        <Column
          header="Estado"
          headerStyle={{ paddingLeft: '1rem' }}
          body={(rowData) => (
            <InputSwitch
              checked={rowData.activo}
              onChange={() => toggleActivo(rowData)}
            />
          )}
        />
        <Column
          header="Acciones"
          headerStyle={{ paddingLeft: '3rem' }}
          body={(rowData) => (
            <>
              <button className="admin-button gray" title="Visualizar" onClick={() => abrirModal('visualizar', rowData)}>
                🔍
              </button>
              <button
                className="admin-button yellow"
                title="Editar"
                onClick={() => abrirModal('editar', rowData)}
              >
                ✏️
              </button>
              <button
                className="admin-button red"
                title="Eliminar"
                onClick={() => abrirModal('eliminar', rowData)}
              >
                🗑️
              </button>
            </>
          )}
        />
      </DataTable>

      {/* Modal Agregar/Editar */}
      {(modalTipo === 'agregar' || modalTipo === 'editar') && modalVisible && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title modal-title-compact">
            {modalTipo === 'agregar' ? 'Agregar Usuario' : 'Editar Usuario'}
          </h2>
          <div className="modal-body modal-body-compact">
            <div className="modal-grid modal-grid-compact">
              <div className="modal-field">
                <label className="modal-label">
                  Tipo Documento<span className="required-asterisk">*</span>:
                </label>
                <div className="custom-select-wrapper">
                  <select
                    value={formData.tipo_documento_id}
                    onChange={(e) => handleInputChange('tipo_documento_id', e.target.value)}
                    className={`custom-select ${fieldErrors.tipo_documento_id?.length ? 'error' : ''}`}
                  >
                    <option value="">Seleccionar</option>
                    {tiposDocumento.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                    ))}
                  </select>
                  <div className="select-arrow">
                    <svg width="10" height="6" viewBox="0 0 12 8" fill="none">
                      <path d="M6 8L0 2L1.5 0.5L6 5L10.5 0.5L12 2L6 8Z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
                {fieldErrors.tipo_documento_id?.length > 0 && (
                  <div className="field-error">
                    {fieldErrors.tipo_documento_id[0]}
                  </div>
                )}
              </div>
              
              <div className="modal-field">
                <label className="modal-label">
                  Documento<span className="required-asterisk">*</span>:
                </label>
                <input
                  type="text"
                  value={formData.documento}
                  onChange={(e) => handleInputChange('documento', e.target.value)}
                  className={`modal-input ${fieldErrors.documento?.length ? 'error' : ''}`}
                  placeholder="Número"
                  maxLength="10"
                />
                {fieldErrors.documento?.length > 0 && (
                  <div className="field-error">
                    {fieldErrors.documento[0]}
                  </div>
                )}
                {formData.tipo_documento_id && (
                  <div className="field-hint">
                    {formData.tipo_documento_id === '1' && 'Cédula: 7-10 dígitos'}
                    {formData.tipo_documento_id === '2' && 'Cédula Extranjería: 6-10 dígitos'}
                    {formData.tipo_documento_id === '3' && 'Pasaporte: 6-12 caracteres alfanuméricos'}
                    {formData.tipo_documento_id === '4' && 'NIT: 9-11 dígitos'}
                  </div>
                )}
              </div>
              
              <div className="modal-field">
                <label className="modal-label">
                  Nombres<span className="required-asterisk">*</span>:
                </label>
                <input
                  type="text"
                  value={formData.nombres}
                  onChange={(e) => handleInputChange('nombres', e.target.value)}
                  className={`modal-input ${fieldErrors.nombres?.length ? 'error' : ''}`}
                  placeholder="Nombres"
                  maxLength="15"
                />
                {fieldErrors.nombres?.length > 0 && (
                  <div className="field-error">
                    {fieldErrors.nombres[0]}
                  </div>
                )}
              </div>
              
              <div className="modal-field">
                <label className="modal-label">
                  Apellidos<span className="required-asterisk">*</span>:
                </label>
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) => handleInputChange('apellidos', e.target.value)}
                  className={`modal-input ${fieldErrors.apellidos?.length ? 'error' : ''}`}
                  placeholder="Apellidos"
                  maxLength="15"
                />
                {fieldErrors.apellidos?.length > 0 && (
                  <div className="field-error">
                    {fieldErrors.apellidos[0]}
                  </div>
                )}
              </div>
              
              <div className="modal-field modal-field-full">
                <label className="modal-label">
                  Correo<span className="required-asterisk">*</span>:
                </label>
                <input
                  type="email"
                  value={formData.correo}
                  onChange={(e) => handleInputChange('correo', e.target.value)}
                  className={`modal-input ${fieldErrors.correo?.length ? 'error' : ''}`}
                  placeholder="ejemplo@correo.com"
                  maxLength="20"
                />
                {fieldErrors.correo?.length > 0 && (
                  <div className="field-error">
                    {fieldErrors.correo[0]}
                  </div>
                )}
              </div>
              
              <div className="modal-field">
                <label className="modal-label">
                  Contraseña<span className="required-asterisk">*</span>:
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.contraseña}
                    onChange={(e) => handleInputChange('contraseña', e.target.value)}
                    className={`modal-input password-input ${fieldErrors.contraseña?.length ? 'error' : ''}`}
                    placeholder="Contraseña segura"
                    maxLength="20"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {fieldErrors.contraseña?.length > 0 && (
                  <div className="field-error">
                    {fieldErrors.contraseña.slice(0, 2).map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </div>
                )}
              </div>

              {modalTipo === 'agregar' && (
                <div className="modal-field">
                  <label className="modal-label">
                    Confirmar Contraseña<span className="required-asterisk">*</span>:
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmarContraseña}
                      onChange={(e) => handleInputChange('confirmarContraseña', e.target.value)}
                      className={`modal-input password-input ${fieldErrors.confirmarContraseña?.length ? 'error' : ''}`}
                      placeholder="Confirme su contraseña"
                      maxLength="20"
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
                    <div className="field-error">
                      {fieldErrors.confirmarContraseña[0]}
                    </div>
                  )}
                  {formData.contraseña && formData.confirmarContraseña && 
                   formData.contraseña === formData.confirmarContraseña && (
                    <div className="field-success">
                      ✓ Las contraseñas coinciden
                    </div>
                  )}
                </div>
              )}
              
              <div className="modal-field modal-field-full">
                <label className="modal-label">
                  Rol<span className="required-asterisk">*</span>:
                </label>
                <div className="custom-select-wrapper">
                  <select
                    value={formData.rol_id}
                    onChange={(e) => handleInputChange('rol_id', e.target.value)}
                    className={`custom-select ${fieldErrors.rol_id?.length ? 'error' : ''}`}
                  >
                    <option value="">Seleccionar rol</option>
                    {roles.map(rol => (
                      <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                    ))}
                  </select>
                  <div className="select-arrow">
                    <svg width="10" height="6" viewBox="0 0 12 8" fill="none">
                      <path d="M6 8L0 2L1.5 0.5L6 5L10.5 0.5L12 2L6 8Z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
                {fieldErrors.rol_id?.length > 0 && (
                  <div className="field-error">
                    {fieldErrors.rol_id[0]}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
            <button className="modal-btn save-btn" onClick={guardarUsuario}>Guardar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}