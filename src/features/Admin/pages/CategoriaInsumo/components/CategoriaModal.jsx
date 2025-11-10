// src/pages/categorias/components/CategoriaModal.jsx

import React from 'react';
import Modal from '../../../components/modal';
import CategoriaForm from './CategoriaForm';

const CategoriaModal = ({ 
  visible, 
  tipo, 
  categoria, 
  formData,
  sugerencias,
  onClose, 
  onSave, 
  loading 
}) => {
  
  if (!visible) return null;

  // Modal de confirmación de eliminación
  if (tipo === 'eliminar' && categoria) {
    return (
      <Modal visible={visible} onClose={onClose}>
        <h2 className="modal-title">Confirmar Eliminación</h2>
        <div className="modal-body">
          <p>¿Seguro que quieres eliminar la categoría <strong>{categoria.nombre}</strong>?</p>
        </div>
        <div className="modal-footer">
          <button 
            className="modal-btn cancel-btn" 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            className="modal-btn save-btn" 
            onClick={onSave}
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </Modal>
    );
  }

  // Modal de formulario (agregar/editar/visualizar)
  const getTitulo = () => {
    switch(tipo) {
      case 'agregar': return 'Agregar Categoria de Insumo';
      case 'editar': return 'Editar Categoría';
      case 'visualizar': return 'Detalles Categoría';
      default: return 'Categoría';
    }
  };

  const getModo = () => {
    return tipo; // 'agregar', 'editar', o 'visualizar'
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <h2 className="modal-title">{getTitulo()}</h2>
      <div className="modal-body">
        <CategoriaForm
          nombre={formData.nombre}
          descripcion={formData.descripcion}
          estado={formData.estado}
          errores={formData.errores}
          onNombreChange={formData.setNombre}
          onDescripcionChange={formData.setDescripcion}
          onEstadoChange={formData.setEstado}
          sugerencias={sugerencias}
          disabled={loading}
          modo={getModo()}
        />
      </div>
      <div className="modal-footer">
        <button 
          className="modal-btn cancel-btn" 
          onClick={onClose}
          disabled={loading}
        >
          {tipo === 'visualizar' ? 'Cerrar' : 'Cancelar'}
        </button>
        {tipo !== 'visualizar' && (
          <button
            className="modal-btn save-btn"
            onClick={onSave}
            disabled={loading || !formData.isValid()}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        )}
      </div>
    </Modal>
  );
};

export default CategoriaModal;