import React, { useState, useEffect } from 'react';
import { InputSwitch } from 'primereact/inputswitch';

export default function RoleForm({ initialData, formType, permisos, onSave, onCancel, showNotification, allRoles, currentRoleId }) {
  const [formData, setFormData] = useState(initialData);
  const [validaciones, setValidaciones] = useState({
    nombre: { valido: false, mensaje: '' },
    descripcion: { valido: false, mensaje: '' }
  });

  // Effect para inicializar el formulario o re-validar al cambiar los datos iniciales
  useEffect(() => {
    setFormData(initialData);
    // Realizar validaciones iniciales si es un formulario de edición
    if (formType === 'editar' && initialData) {
      setValidaciones({
        nombre: validarNombre(initialData.nombre),
        descripcion: validarDescripcion(initialData.descripcion)
      });
    } else {
      // Resetear validaciones para el modo agregar
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

    if (nombreTrimmed.length > 50) {
      return { valido: false, mensaje: 'El nombre no puede tener más de 50 caracteres' };
    }

    const nombreExiste = allRoles.some(rol =>
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

    if (descripcionTrimmed.length > 200) {
      return { valido: false, mensaje: 'La descripción no puede tener más de 200 caracteres' };
    }

    return { valido: true, mensaje: '' };
  };

  const manejarCambioNombre = (valor) => {
    const soloLetras = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    const sinEspaciosMultiples = soloLetras.replace(/\s+/g, ' ');
    setFormData(prev => ({ ...prev, nombre: sinEspaciosMultiples }));
    const validacion = validarNombre(sinEspaciosMultiples);
    setValidaciones(prev => ({ ...prev, nombre: validacion }));
  };

  const handleInputChange = (field, value) => {
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

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      onSave(formData);
    }
  };

  const formularioValido = validaciones.nombre.valido && validaciones.descripcion.valido;

  return (
    <div style={{ width: '800px', maxWidth: '90vw' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1.5rem'}}>
        {formType === 'agregar' ? 'Agregar Rol' : 'Editar Rol'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
          <div>
            <h3 style={{ color: '#c2185b', marginBottom: '1rem' }}>Información Básica</h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Nombre del Rol
                  <span style={{ color: 'red' }}> *</span>
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: `2px solid ${validaciones.nombre.valido ? '#4caf50' : (validaciones.nombre.mensaje ? '#f44336' : '#f48fb1')}`,
                  borderRadius: '6px',
                  outline: 'none',
                  backgroundColor: validaciones.nombre.valido ? '#f1f8e9' : (validaciones.nombre.mensaje ? '#ffebee' : 'white')
                }}
                placeholder="Ej: Administrador"
              />
              {validaciones.nombre.mensaje && (
                <small style={{
                  color: validaciones.nombre.valido ? '#4caf50' : '#f44336',
                  fontSize: '0.8rem',
                  display: 'block',
                  marginTop: '0.3rem'
                }}>
                  {validaciones.nombre.mensaje}
                </small>
              )}
              <small style={{ color: '#666', fontSize: '0.75rem', display: 'block', marginTop: '0.2rem' }}>
                Solo se permiten letras y espacios
              </small>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Descripción
                <span style={{ color: 'red' }}> *</span>
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: `2px solid ${validaciones.descripcion.valido ? '#4caf50' : (validaciones.descripcion.mensaje ? '#f44336' : '#f48fb1')}`,
                  borderRadius: '6px',
                  outline: 'none',
                  minHeight: '60px',
                  resize: 'vertical',
                  backgroundColor: validaciones.descripcion.valido ? '#f1f8e9' : (validaciones.descripcion.mensaje ? '#ffebee' : 'white')
                }}
                placeholder="Describe este rol..."
              />
              {validaciones.descripcion.mensaje && (
                <small style={{
                  color: validaciones.descripcion.valido ? '#4caf50' : '#f44336',
                  fontSize: '0.8rem',
                  display: 'block',
                  marginTop: '0.3rem'
                }}>
                  {validaciones.descripcion.mensaje}
                </small>
              )}
              <small style={{ color: '#666', fontSize: '0.75rem', display: 'block', marginTop: '0.2rem' }}>
                {formData.descripcion.length}/200 caracteres
              </small>
            </div>

            {formType === 'editar' && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <label style={{ fontWeight: 'bold' }}>Estado Activo:</label>
                  <InputSwitch
                    checked={formData.activo}
                    onChange={(e) => handleInputChange('activo', e.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 style={{ color: '#c2185b', marginBottom: '1rem' }}>Permisos del Sistema</h3>

            <div style={{
              padding: '1rem',
              border: '2px solid #f48fb1',
              borderRadius: '10px',
              backgroundColor: '#fafafa',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem'
              }}>
                {Object.values(permisosPorModulo).flat().map((permiso) => (
                  <div key={permiso.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.3rem',
                    borderRadius: '4px'
                  }}>
                    <input
                      type="checkbox"
                      id={`permiso-${permiso.id}`}
                      checked={formData.permisos.includes(permiso.id)}
                      onChange={(e) => handlePermisoChange(permiso.id, e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label
                      htmlFor={`permiso-${permiso.id}`}
                      style={{
                        fontSize: '0.9rem',
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

              {Object.values(permisosPorModulo).flat().length === 0 && (
                <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                  No hay permisos disponibles
                </p>
              )}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid #eee'
        }}>
          <button className="modal-btn cancel-btn" type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className={`modal-btn ${formularioValido ? 'save-btn' : 'save-btn-disabled'}`}
            type="submit"
            disabled={!formularioValido}
            style={{
              opacity: formularioValido ? 1 : 0.5,
              cursor: formularioValido ? 'pointer' : 'not-allowed'
            }}
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}