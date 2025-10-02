import React from 'react';
import { InputSwitch } from 'primereact/inputswitch';
import { useProveedorForm } from '../hooks/useProveedorForm';
import './modalstyle.css'

const ProveedorForm = ({ tipo, proveedor, proveedores, onSave, onCancel, loading }) => {
  const {
    formData,
    errors,
    handleFieldChange,
    handleFieldBlur,
    validarCampos
  } = useProveedorForm({ tipo, proveedor, proveedores });

  const handleSubmit = () => {
    if (!validarCampos()) return;
    onSave(formData);
  };

  return (
    <>
      <h2 className="modal-title">
        {tipo === 'agregar' ? 'Agregar Proveedor' : 'Editar Proveedor'}
      </h2>
      
      <div className="modal-body">
        <div className="modal-form-grid-wide">
          
          {/* Tipo de Proveedor */}
          <label>Tipo de Proveedor*
            <select
              value={formData.tipoProveedor}
              onChange={(e) => handleFieldChange('tipoProveedor', e.target.value)}
              className="modal-input"
              disabled={loading}
            >
              <option value="Natural">Natural</option>
              <option value="Jurídico">Jurídico</option>
            </select>
          </label>

          {/* Tipo de Documento */}
          <label>Tipo de Documento*
            <select
              value={formData.tipoDocumento}
              onChange={(e) => handleFieldChange('tipoDocumento', e.target.value)}
              className="modal-input"
              disabled={loading}
            >
              {formData.tipoProveedor === 'Natural' ? (
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

          {/* Número de Documento */}
          <label>
            {formData.tipoProveedor === 'Natural' 
              ? 'Número de Documento*' 
              : (formData.tipoDocumento === 'RUT' ? 'RUT*' : 'NIT*')
            }
            <input
              type="text"
              value={formData.documentoONit}
              onChange={(e) => handleFieldChange('documentoONit', e.target.value)}
              onBlur={(e) => handleFieldBlur('documentoONit', e.target.value)}
              className={`modal-input ${errors.documentoONit ? 'error' : ''}`}
              placeholder={
                formData.tipoProveedor === 'Natural' 
                  ? 'Número de documento' 
                  : (formData.tipoDocumento === 'RUT' ? 'Número de RUT' : 'Número de NIT')
              }
              maxLength={formData.tipoProveedor === 'Natural' ? '10' : (formData.tipoDocumento === 'RUT' ? '10' : '12')}
              disabled={loading}
            />
            {errors.documentoONit && <span className="error-message">{errors.documentoONit}</span>}
          </label>

          {/* Campos específicos según tipo */}
          {formData.tipoProveedor === 'Natural' ? (
            <label>Nombre Completo*
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleFieldChange('nombre', e.target.value)}
                onBlur={(e) => handleFieldBlur('nombre', e.target.value)}
                className={`modal-input ${errors.nombre ? 'error' : ''}`}
                placeholder="Ingrese el nombre completo"
                disabled={loading}
              />
              {errors.nombre && <span className="error-message">{errors.nombre}</span>}
            </label>
          ) : (
            <>
              <label>Razón Social*
                <input
                  type="text"
                  value={formData.nombreEmpresa}
                  onChange={(e) => handleFieldChange('nombreEmpresa', e.target.value)}
                  onBlur={(e) => handleFieldBlur('nombreEmpresa', e.target.value)}
                  className={`modal-input ${errors.nombreEmpresa ? 'error' : ''}`}
                  placeholder="Ingrese la razón social"
                  disabled={loading}
                />
                {errors.nombreEmpresa && <span className="error-message">{errors.nombreEmpresa}</span>}
              </label>

              <label>Nombre del Contacto*
                <input
                  type="text"
                  value={formData.nombreContacto}
                  onChange={(e) => handleFieldChange('nombreContacto', e.target.value)}
                  onBlur={(e) => handleFieldBlur('nombreContacto', e.target.value)}
                  className={`modal-input ${errors.nombreContacto ? 'error' : ''}`}
                  placeholder="Ingrese el nombre del contacto"
                  disabled={loading}
                />
                {errors.nombreContacto && <span className="error-message">{errors.nombreContacto}</span>}
              </label>
            </>
          )}

          {/* Teléfono */}
          <label>Teléfono*
            <input
              type="text"
              value={formData.contacto}
              onChange={(e) => handleFieldChange('contacto', e.target.value)}
              onBlur={(e) => handleFieldBlur('contacto', e.target.value)}
              className={`modal-input ${errors.contacto ? 'error' : ''}`}
              placeholder="Número de teléfono (7-10 dígitos)"
              maxLength="10"
              disabled={loading}
            />
            {errors.contacto && <span className="error-message">{errors.contacto}</span>}
          </label>

          {/* Correo */}
          <label>Correo Electrónico*
            <input
              type="email"
              value={formData.correo}
              onChange={(e) => handleFieldChange('correo', e.target.value)}
              onBlur={(e) => handleFieldBlur('correo', e.target.value)}
              className={`modal-input ${errors.correo ? 'error' : ''}`}
              placeholder="ejemplo@correo.com"
              disabled={loading}
            />
            {errors.correo && <span className="error-message">{errors.correo}</span>}
          </label>

          {/* Dirección */}
          <label>Dirección*
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => handleFieldChange('direccion', e.target.value)}
              onBlur={(e) => handleFieldBlur('direccion', e.target.value)}
              className={`modal-input ${errors.direccion ? 'error' : ''}`}
              placeholder="Dirección completa"
              disabled={loading}
            />
            {errors.direccion && <span className="error-message">{errors.direccion}</span>}
          </label>

          {/* Estado solo en edición */}
          {tipo === 'editar' && (
            <label>Estado
              <div className="switch-container" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                <span style={{ color: formData.estadoProveedor ? '#4CAF50' : '#f44336', fontWeight: 'bold' }}>
                  {formData.estadoProveedor ? 'Activo' : 'Inactivo'}
                </span>
                <InputSwitch
                  checked={formData.estadoProveedor}
                  onChange={(e) => handleFieldChange('estadoProveedor', e.value)}
                  disabled={loading}
                />
              </div>
            </label>
          )}

        </div>
      </div>

      <div className="modal-footer">
        <button 
          className="modal-btn cancel-btn" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </button>
        <button 
          className="modal-btn save-btn" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </>
  );
};

export default ProveedorForm;