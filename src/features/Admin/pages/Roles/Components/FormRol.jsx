import React, { useState, useEffect } from 'react';
import { InputSwitch } from 'primereact/inputswitch';
import roleApiService from '../../../services/roles_services';

export default function RoleForm({ initialData, formType, permisos, onSave, onCancel, showNotification, allRoles, currentRoleId }) {
  const [formData, setFormData] = useState(initialData);
  const [validaciones, setValidaciones] = useState({
    nombre: { valido: false, mensaje: '' },
    descripcion: { valido: false, mensaje: '' }
  });
  const [guardando, setGuardando] = useState(false);

  const isReadOnly = formType === 'visualizar';

  useEffect(() => {
    setFormData(initialData);
    if (formType === 'editar' && initialData) {
      setValidaciones({
        nombre: validarNombre(initialData.nombre),
        descripcion: validarDescripcion(initialData.descripcion)
      });
    } else {
      setValidaciones({
        nombre: { valido: false, mensaje: '' },
        descripcion: { valido: false, mensaje: '' }
      });
    }
  }, [initialData, formType]);

  const permisosPorModulo = permisos.reduce((acc, permiso) => {
    if (!acc[permiso.modulo]) {
      acc[permiso.modulo] = [];
    }
    acc[permiso.modulo].push(permiso);
    return acc;
  }, {});

  // VALIDACIONES AJUSTADAS A LOS LÍMITES DE LA BASE DE DATOS
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

    // LÍMITE AJUSTADO A LA BD (VARCHAR(20))
    if (nombreTrimmed.length > 20) {
      return { valido: false, mensaje: 'El nombre no puede tener más de 20 caracteres' };
    }

    const nombreExiste = allRoles.some(
      rol =>
        rol.nombre.toLowerCase() === nombreTrimmed.toLowerCase() &&
        (formType === 'agregar' || rol.id !== currentRoleId)
    );

    if (nombreExiste) {
      return { valido: false, mensaje: 'Ya existe un rol con este nombre' };
    }

    return { valido: true, mensaje: '' };
  };

  const validarDescripcion = (descripcion) => {
    const descripcionTrimmed = descripcion.trim();

    if (!descripcionTrimmed) {
      return { valido: false, mensaje: 'La descripción es obligatoria' };
    }

    if (descripcionTrimmed.length < 5) {
      return { valido: false, mensaje: 'La descripción debe tener al menos 5 caracteres' };
    }

    // LÍMITE AJUSTADO A LA BD (VARCHAR(30))
    if (descripcionTrimmed.length > 30) {
      return { valido: false, mensaje: 'La descripción no puede tener más de 30 caracteres' };
    }

    return { valido: true, mensaje: '' };
  };

  const manejarCambioNombre = (valor) => {
    if (isReadOnly) return;
    
    const soloLetras = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    const sinEspaciosMultiples = soloLetras.replace(/\s+/g, ' ');
    setFormData(prev => ({ ...prev, nombre: sinEspaciosMultiples }));
    const validacion = validarNombre(sinEspaciosMultiples);
    setValidaciones(prev => ({ ...prev, nombre: validacion }));
  };

  const handleInputChange = (field, value) => {
    if (isReadOnly) return;
    
    if (field === 'nombre') {
      manejarCambioNombre(value);
    } else if (field === 'descripcion') {
      setFormData(prev => ({ ...prev, [field]: value }));
      const validacion = validarDescripcion(value);
      setValidaciones(prev => ({ ...prev, descripcion: validacion }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handlePermisoChange = (permisoId, checked) => {
    if (isReadOnly) return;
    
    setFormData(prev => ({
      ...prev,
      permisos: checked
        ? [...prev.permisos, permisoId]
        : prev.permisos.filter(id => id !== permisoId)
    }));
  };

  const validarFormulario = () => {
    const nombreValidacion = validarNombre(formData.nombre);
    const descripcionValidacion = validarDescripcion(formData.descripcion);

    setValidaciones({
      nombre: nombreValidacion,
      descripcion: descripcionValidacion
    });

    if (!nombreValidacion.valido) {
      showNotification(nombreValidacion.mensaje, 'error');
      return false;
    }

    if (!descripcionValidacion.valido) {
      showNotification(descripcionValidacion.mensaje, 'error');
      return false;
    }

    if (formData.permisos.length === 0) {
      showNotification('Debe seleccionar al menos un permiso para el rol', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isReadOnly) return;
    
    if (!validarFormulario()) return;

    try {
      setGuardando(true);
      
      // Validar datos antes de enviar
      const validacion = roleApiService.validarDatosRol(formData);
      if (!validacion.valido) {
        showNotification(validacion.errores[0], 'error');
        return;
      }

      await onSave(formData);
      
    } catch (error) {
      console.error('Error al guardar:', error);
      showNotification(`Error al guardar: ${error.message}`, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const formularioValido = validaciones.nombre.valido && 
                          validaciones.descripcion.valido && 
                          formData.permisos.length > 0;

  const getTitleByType = () => {
    switch (formType) {
      case 'agregar': return 'Agregar Rol';
      case 'editar': return 'Editar Rol';
      case 'visualizar': return 'Ver Detalles del Rol';
      default: return 'Rol';
    }
  };

  const getModulosOrdenados = () => {
    return Object.keys(permisosPorModulo).sort();
  };

  return (
    <div style={{ width: '900px', maxWidth: '90vw' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#000000' }}>
        {getTitleByType()}
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Información Básica */}
          <div>
            <h3 style={{ color: '#c2185b', marginBottom: '1rem' }}>Información Básica</h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Nombre del Rol
                {!isReadOnly && <span style={{ color: 'red' }}> *</span>}
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                readOnly={isReadOnly}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: isReadOnly 
                    ? '2px solid #e0e0e0' 
                    : `2px solid ${validaciones.nombre.valido ? '#4caf50' : (validaciones.nombre.mensaje ? '#f44336' : '#f48fb1')}`,
                  borderRadius: '6px',
                  outline: 'none',
                  backgroundColor: isReadOnly 
                    ? '#f5f5f5' 
                    : validaciones.nombre.valido ? '#f1f8e9' : (validaciones.nombre.mensaje ? '#ffebee' : 'white'),
                  cursor: isReadOnly ? 'default' : 'text'
                }}
                placeholder={isReadOnly ? '' : "Ej: Administrador"}
                maxLength={20} // LÍMITE AJUSTADO
              />
              {!isReadOnly && validaciones.nombre.mensaje && (
                <small style={{
                  color: validaciones.nombre.valido ? '#4caf50' : '#f44336',
                  fontSize: '0.8rem',
                  display: 'block',
                  marginTop: '0.3rem'
                }}>
                  {validaciones.nombre.mensaje}
                </small>
              )}
              {!isReadOnly && (
                <small style={{ color: '#666', fontSize: '0.75rem', display: 'block', marginTop: '0.2rem' }}>
                  Solo se permiten letras y espacios ({formData.nombre.length}/20)
                </small>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Descripción
                {!isReadOnly && <span style={{ color: 'red' }}> *</span>}
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                readOnly={isReadOnly}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: isReadOnly 
                    ? '2px solid #e0e0e0' 
                    : `2px solid ${validaciones.descripcion.valido ? '#4caf50' : (validaciones.descripcion.mensaje ? '#f44336' : '#f48fb1')}`,
                  borderRadius: '6px',
                  outline: 'none',
                  minHeight: '80px',
                  resize: isReadOnly ? 'none' : 'vertical',
                  backgroundColor: isReadOnly 
                    ? '#f5f5f5' 
                    : validaciones.descripcion.valido ? '#f1f8e9' : (validaciones.descripcion.mensaje ? '#ffebee' : 'white'),
                  cursor: isReadOnly ? 'default' : 'text'
                }}
                placeholder={isReadOnly ? '' : "Describe las responsabilidades..."}
                maxLength={30} // LÍMITE AJUSTADO
              />
              {!isReadOnly && validaciones.descripcion.mensaje && (
                <small style={{
                  color: validaciones.descripcion.valido ? '#4caf50' : '#f44336',
                  fontSize: '0.8rem',
                  display: 'block',
                  marginTop: '0.3rem'
                }}>
                  {validaciones.descripcion.mensaje}
                </small>
              )}
              {!isReadOnly && (
                <small style={{ color: '#666', fontSize: '0.75rem', display: 'block', marginTop: '0.2rem' }}>
                  {formData.descripcion.length}/30 caracteres
                </small>
              )}
            </div>

            {/* Campo Estado */}
            {(formType === 'editar' || formType === 'visualizar') && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <label style={{ fontWeight: 'bold' }}>Estado:</label>
                  <InputSwitch
                    checked={formData.activo}
                    onChange={(e) => handleInputChange('activo', e.value)}
                    disabled={isReadOnly}
                  />
                  <span style={{
                    color: formData.activo ? '#4caf50' : '#f44336',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    {formData.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Permisos del Sistema */}
          <div>
            <h3 style={{ color: '#c2185b', marginBottom: '1rem' }}>
              Permisos del Sistema
              {!isReadOnly && <span style={{ color: 'red' }}> *</span>}
            </h3>

            <div style={{
              padding: '1rem',
              border: `2px solid ${formData.permisos.length === 0 && !isReadOnly ? '#f44336' : '#f48fb1'}`,
              borderRadius: '10px',
              backgroundColor: isReadOnly ? '#f8f8f8' : '#fafafa',
              maxHeight: '350px',
              overflowY: 'auto'
            }}>
              {getModulosOrdenados().length > 0 ? (
                getModulosOrdenados().map((modulo) => (
                  <div key={modulo} style={{ marginBottom: '1rem' }}>
                    <h4 style={{
                      color: '#c2185b',
                      fontSize: '0.9rem',
                      marginBottom: '0.5rem',
                      borderBottom: '1px solid #f48fb1',
                      paddingBottom: '0.2rem'
                    }}>
                      {modulo}
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '0.5rem',
                      marginLeft: '1rem'
                    }}>
                      {permisosPorModulo[modulo].map((permiso) => (
                        <div key={permiso.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.3rem',
                          borderRadius: '4px',
                          backgroundColor: formData.permisos.includes(permiso.id) 
                            ? '#f3e5f5' 
                            : 'transparent'
                        }}>
                          <input
                            type="checkbox"
                            id={`permiso-${permiso.id}`}
                            checked={formData.permisos.includes(permiso.id)}
                            onChange={(e) => handlePermisoChange(permiso.id, e.target.checked)}
                            disabled={isReadOnly}
                            style={{ 
                              width: '16px', 
                              height: '16px', 
                              cursor: isReadOnly ? 'default' : 'pointer',
                              accentColor: '#c2185b'
                            }}
                          />
                          <label
                            htmlFor={`permiso-${permiso.id}`}
                            style={{
                              fontSize: '0.85rem',
                              cursor: isReadOnly ? 'default' : 'pointer',
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
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', padding: '2rem' }}>
                  <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                  No hay permisos disponibles
                </div>
              )}
            </div>
            
            {!isReadOnly && (
              <div style={{ marginTop: '0.5rem' }}>
                <small style={{ 
                  color: formData.permisos.length === 0 ? '#f44336' : '#666',
                  fontSize: '0.8rem',
                  fontWeight: formData.permisos.length === 0 ? 'bold' : 'normal'
                }}>
                  {formData.permisos.length === 0 
                    ? 'Debe seleccionar al menos un permiso' 
                    : `${formData.permisos.length} permiso(s) seleccionado(s)`}
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid #eee'
        }}>
          <button 
            className="modal-btn cancel-btn" 
            type="button" 
            onClick={onCancel}
            disabled={guardando}
          >
            {isReadOnly ? 'Cerrar' : 'Cancelar'}
          </button>
          {!isReadOnly && (
            <button
              className={`modal-btn ${formularioValido && !guardando ? 'save-btn' : 'save-btn-disabled'}`}
              type="submit"
              disabled={!formularioValido || guardando}
              style={{
                opacity: formularioValido && !guardando ? 1 : 0.5,
                cursor: formularioValido && !guardando ? 'pointer' : 'not-allowed',
                position: 'relative'
              }}
            >
              {guardando ? (
                <>
                  <i className="pi pi-spin pi-spinner" style={{ marginRight: '0.5rem' }}></i>
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}