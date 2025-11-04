import React, { useState } from 'react';
import categoriaProductoApiService from '../../../services/categoriaProductosService';

export default function CategoriaDelete({ visible = true, categoria, onClose, onDeleted, showNotification }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!categoria) return;
    setLoading(true);
    try {
      const tiene = await categoriaProductoApiService.categoriaTieneProductos(categoria.id);
      if (tiene) {
        showNotification('No se puede eliminar una categoría que tiene productos asociados', 'error');
        setLoading(false);
        return;
      }
      await categoriaProductoApiService.eliminarCategoria(categoria.id);
      showNotification('Categoría eliminada exitosamente', 'success');
      onDeleted(categoria.id);
      onClose();
    } catch (err) {
      showNotification('Error al eliminar la categoría: ' + (err.message || err), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!visible || !categoria) return null; // <--- Aseguramos que solo renderice si hay categoría

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem',
        width: '400px', maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Eliminar Categoría</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <p>¿Estás seguro de que deseas eliminar la categoría <strong>{categoria.nombre}</strong>?</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#fff' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', backgroundColor: '#e91e63', color: '#fff' }}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
