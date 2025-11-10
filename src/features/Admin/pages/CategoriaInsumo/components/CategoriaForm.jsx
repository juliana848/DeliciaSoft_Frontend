// src/pages/categorias/components/CategoriaForm.jsx

import React from 'react';
import { InputSwitch } from 'primereact/inputswitch';
import SearchableInput from '../SearchableInput';

const CategoriaForm = ({ 
  nombre, 
  descripcion, 
  estado, 
  errores, 
  onNombreChange, 
  onDescripcionChange, 
  onEstadoChange,
  sugerencias,
  disabled,
  modo = 'agregar' // 'agregar' | 'editar' | 'visualizar'
}) => {
  const isReadOnly = modo === 'visualizar';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <label>
        Nombre*
        {isReadOnly ? (
          <input
            value={nombre}
            className="modal-input"
            readOnly
            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
          />
        ) : (
          <>
            <SearchableInput
              value={nombre}
              onChange={onNombreChange}
              sugerencias={sugerencias}
              placeholder="Seleccione o escriba una categoría"
              error={!!errores.nombre}
              disabled={disabled}
            />
            {errores.nombre && <p className="error">{errores.nombre}</p>}
          </>
        )}
      </label>

      <label>
        Descripción*
        <textarea
          value={descripcion}
          onChange={(e) => onDescripcionChange(e.target.value)}
          className="modal-input textarea"
          rows={3}
          style={{ 
            resize: 'vertical',
            ...(isReadOnly && { backgroundColor: '#f5f5f5', cursor: 'not-allowed' })
          }}
          readOnly={isReadOnly}
          disabled={disabled && !isReadOnly}
        />
        {!isReadOnly && errores.descripcion && <p className="error">{errores.descripcion}</p>}
      </label>
      
      {modo === 'editar' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ margin: 0 }}>Estado:</label>
          <InputSwitch
            checked={estado}
            onChange={(e) => onEstadoChange(e.value)}
            disabled={disabled}
          />
          <span style={{ fontSize: '0.9rem', color: '#666' }}>
            {estado ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      )}

      {modo === 'visualizar' && (
        <label>
          Estado
          <input
            value={estado ? 'Activo' : 'Inactivo'}
            className="modal-input"
            readOnly
            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
          />
        </label>
      )}
    </div>
  );
};

export default CategoriaForm;