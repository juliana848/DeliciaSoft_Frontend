import React, { useState, useEffect } from 'react';
import Modal from '../../../components/modal';
import categoriaInsumoApiService from '../../../services/categoriainsumos';

export default function agregarCategoria({ 
  cerrar, 
  showNotification, 
  cargarCategorias 
}) {
  const [nombreEditado, setNombreEditado] = useState('');
  const [descripcionEditada, setDescripcionEditada] = useState('');
  const [errores, setErrores] = useState({ nombre: '', descripcion: '' });
  const [loading, setLoading] = useState(false);

  // Validación en tiempo real
  useEffect(() => {
    const nuevosErrores = { nombre: '', descripcion: '' };

    if (!nombreEditado.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    } else if (nombreEditado.trim().length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (nombreEditado.trim().length > 50) {
      nuevosErrores.nombre = 'El nombre no puede superar los 50 caracteres';
    } else if (!/^[A-Za-zÀÁÉÍÓÚÀáéíóúÑñ\s]+$/.test(nombreEditado.trim())) {
      nuevosErrores.nombre = 'El nombre solo puede contener letras y espacios';
    }

    if (!descripcionEditada.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    } else if (descripcionEditada.trim().length < 10) {
      nuevosErrores.descripcion = 'La descripción debe tener al menos 10 caracteres';
    } else if (descripcionEditada.trim().length > 200) {
      nuevosErrores.descripcion = 'La descripción no puede superar los 200 caracteres';
    }

    setErrores(nuevosErrores);
  }, [nombreEditado, descripcionEditada]);

  const validarFormulario = () => {
    if (errores.nombre || errores.descripcion) {
      if (errores.nombre) showNotification(errores.nombre, 'error');
      else if (errores.descripcion) showNotification(errores.descripcion, 'error');
      return false;
    }
    return true;
  };

  const guardarNuevaCategoria = async () => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);
      
      const datosCategoria = {
        nombreCategoria: nombreEditado.trim(),
        descripcion: descripcionEditada.trim(),
        estado: true
      };

      await categoriaInsumoApiService.crearCategoria(datosCategoria);
      
      showNotification('Categoría agregada exitosamente');
      await cargarCategorias();
      cerrar();
    } catch (error) {
      console.error('Error al agregar categoría:', error);
      showNotification('Error al agregar la categoría: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={true} onClose={cerrar}>
      <h2 className="modal-title">Agregar Categoría de Insumo</h2>
      
      <div className="modal-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label>
            Nombre*
            <input
              value={nombreEditado}
              onChange={(e) => setNombreEditado(e.target.value)}
              className="modal-input"
              placeholder="Ej: Frutas, Lácteos, Harinas..."
              disabled={loading}
              autoFocus
            />
            {errores.nombre && <p className="error" style={{ color: '#dc3545', fontSize: '12px', margin: '5px 0 0 0' }}>{errores.nombre}</p>}
          </label>

          <label>
            Descripción*
            <textarea
              value={descripcionEditada}
              onChange={(e) => setDescripcionEditada(e.target.value)}
              className="modal-input textarea"
              rows={3}
              placeholder="Descripción detallada de la categoría..."
              style={{ resize: 'vertical' }}
              disabled={loading}
            />
            {errores.descripcion && <p className="error" style={{ color: '#dc3545', fontSize: '12px', margin: '5px 0 0 0' }}>{errores.descripcion}</p>}
          </label>

          <div style={{ 
            backgroundColor: '#e3f2fd', 
            padding: '10px', 
            borderRadius: '4px',
            fontSize: '12px',
            color: '#1565c0'
          }}>
            <strong>Nota:</strong> La nueva categoría se creará en estado <strong>Activo</strong> por defecto.
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button 
          className="modal-btn cancel-btn" 
          onClick={cerrar}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          className="modal-btn save-btn"
          onClick={guardarNuevaCategoria}
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </Modal>
  );
}