import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';

export default function RecetasTable() {
  const [recetas, setRecetas] = useState([
    {
      id: 1,
      nombre: 'Pan de ajo',
      descripcion: 'Receta deliciosa de pan con mantequilla y ajo.',
      ingredientes: 'Harina, ajo, mantequilla, levadura',
      preparacion: 'Mezcla todo y hornea por 25 minutos.',
      tiempo_preparacion: '30 min',
      imagen: '',
      estado: true,
    },
      {
      id: 2,
      nombre: 'fresas con crema',
      descripcion: 'Receta deliciosa con fresas y crema.',
      ingredientes: 'crema de leche, azucar,fresas',
      preparacion: 'batir por 20 min, picar fresa',
      tiempo_preparacion: '41 min',
      imagen: '',
      estado: true,
    },
      {
      id: 3,
      nombre: 'Pan de ajo',
      descripcion: 'Receta deliciosa de pan con mantequilla y ajo.',
      ingredientes: 'Harina, ajo, mantequilla, levadura',
      preparacion: 'Mezcla todo y hornea por 25 minutos.',
      tiempo_preparacion: '30 min',
      imagen: '',
      estado: true,
    },
      {
      id: 4,
      nombre: 'Pan frances',
      descripcion: 'Receta deliciosa de pan con mantequilla y ajo.',
      ingredientes: 'Harina, ajo, mantequilla, levadura',
      preparacion: 'Mezcla todo y hornea por 25 minutos.',
      tiempo_preparacion: '30 min',
      imagen: '',
      estado: true,
    },
      {
      id: 5,
      nombre: 'postres',
      descripcion: 'Receta deliciosa de pan con mantequilla y ajo.',
      ingredientes: 'Harina, ajo, mantequilla, levadura',
      preparacion: 'Mezcla todo y hornea por 25 minutos.',
      tiempo_preparacion: '30 min',
      imagen: '',
      estado: true,
    }
  ]);

  const [filtro, setFiltro] = useState('');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modal, setModal] = useState({ visible: false, tipo: '', receta: null });
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    ingredientes: '',
    preparacion: '',
    tiempo_preparacion: '',
    imagen: '',
    estado: true,
  });

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const toggleEstado = (id) => {
    const receta = recetas.find(r => r.id === id);
    setRecetas(recetas.map(r => r.id === id ? { ...r, estado: !r.estado } : r));
    showNotification(`Receta ${receta.estado ? 'desactivada' : 'activada'} exitosamente`);
  };

  const abrirModal = (tipo, receta = null) => {
    setModal({ visible: true, tipo, receta });
    if (tipo === 'editar' && receta) setForm({ ...receta });
    if (tipo === 'agregar') {
      setForm({
        nombre: '',
        descripcion: '',
        ingredientes: '',
        preparacion: '',
        tiempo_preparacion: '',
        imagen: '',
        estado: true,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const convertirABase64 = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
    reader.onerror = (error) => console.error('Error al leer archivo:', error);
  };

  const validarFormulario = () => {
    if (!form.nombre.trim()) return showNotification('El nombre es obligatorio', 'error');
    if (!form.descripcion.trim()) return showNotification('La descripción es obligatoria', 'error');
    if (!form.ingredientes.trim()) return showNotification('Los ingredientes son obligatorios', 'error');
    if (!form.preparacion.trim()) return showNotification('Los pasos de preparación son obligatorios', 'error');
    if (!form.tiempo_preparacion.trim()) return showNotification('El tiempo de preparación es obligatorio', 'error');
    return true;
  };

  const guardar = () => {
    if (!validarFormulario()) return;

    if (modal.tipo === 'agregar') {
      const nuevoId = Math.max(...recetas.map(r => r.id), 0) + 1;
      setRecetas([...recetas, { ...form, id: nuevoId }]);
      showNotification('Receta agregada exitosamente');
    } else if (modal.tipo === 'editar') {
      setRecetas(recetas.map(r => r.id === modal.receta.id ? form : r));
      showNotification('Receta actualizada exitosamente');
    }
    cerrarModal();
  };

  const eliminar = () => {
    setRecetas(recetas.filter(r => r.id !== modal.receta.id));
    showNotification('Receta eliminada exitosamente');
    cerrarModal();
  };

  const cerrarModal = () => setModal({ visible: false, tipo: '', receta: null });

  const recetasFiltradas = recetas.filter(r =>
    r.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    r.descripcion.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="admin-wrapper">
      <Notification {...notification} onClose={hideNotification} />

      <div className="admin-toolbar">
        <button className="admin-button pink" onClick={() => abrirModal('agregar')}>+ Agregar</button>
        <SearchBar value={filtro} onChange={setFiltro} placeholder="Buscar receta..." />
      </div>

      <h2 className="admin-section-title">Recetas</h2>
      <DataTable value={recetasFiltradas} paginator rows={5} className="admin-table">
        <Column header="N°" body={(rowData, { rowIndex }) => rowIndex + 1} />
        <Column field="nombre" header="Nombre" />
        <Column field="tiempo_preparacion" header="Tiempo" />
        <Column field="estado" header="Estado" body={r => <InputSwitch checked={r.estado} onChange={() => toggleEstado(r.id)} />} />
        <Column header="Acción" body={r => (
          <div>
            <button className="admin-button gray" onClick={() => abrirModal('ver', r)}>🔍</button>
            <button className="admin-button yellow" onClick={() => abrirModal('editar', r)}>✏️</button>
            <button className="admin-button red" onClick={() => abrirModal('eliminar', r)}>🗑️</button>
          </div>
        )} />
      </DataTable>

      {modal.visible && (
        <Modal visible={modal.visible} onClose={cerrarModal}>
          <h2 className="modal-title">
            {modal.tipo === 'agregar' && 'Agregar Receta'}
            {modal.tipo === 'editar' && 'Editar Receta'}
            {modal.tipo === 'ver' && 'Detalles de la Receta'}
            {modal.tipo === 'eliminar' && 'Eliminar Receta'}
          </h2>

          <div className="modal-body">
          {modal.tipo === 'eliminar' ? (
            <p>¿Eliminar <strong>{modal.receta?.nombre}</strong>?</p>
          ) : modal.tipo === 'ver' ? (
            <div>
              <p><strong>Nombre:</strong> {modal.receta?.nombre}</p>
              <p><strong>Descripción:</strong> {modal.receta?.descripcion}</p>
              <p><strong>Ingredientes:</strong> {modal.receta?.ingredientes}</p>
              <p><strong>Preparación:</strong> {modal.receta?.preparacion}</p>
              <p><strong>Tiempo de preparación:</strong> {modal.receta?.tiempo_preparacion}</p>
              {modal.receta?.imagen && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Imagen:</strong>
                  <img src={modal.receta.imagen} alt={modal.receta.nombre} style={{ maxWidth: '100%', maxHeight: '150px', display: 'block', marginTop: '5px' }} />
                </div>
              )}
            </div>
          ) : (
            <div className="modal-form-grid">
              <label>
                Nombre*
                <input name="nombre" value={form.nombre} onChange={handleChange} className="modal-input" required />
              </label>
              <label>
                Tiempo preparación*
                <input name="tiempo_preparacion" value={form.tiempo_preparacion} onChange={handleChange} className="modal-input" required />
              </label>
              <label>
                Descripción*
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="modal-input" required />
              </label>
              <label>
                Ingredientes*
                <textarea name="ingredientes" value={form.ingredientes} onChange={handleChange} className="modal-input" required />
              </label>
              <label>
                Preparación*
                <textarea name="preparacion" value={form.preparacion} onChange={handleChange} className="modal-input" required />
              </label>
              <label>
                Imagen
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const archivo = e.target.files[0];
                    if (archivo) {
                      convertirABase64(archivo, (base64) => {
                        setForm((prev) => ({ ...prev, imagen: base64 }));
                      });
                    }
                  }}
                  className="modal-input"
                />
                {form.imagen && (
                  <img src={form.imagen} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: '100px', marginTop: '5px' }} />
                )}
              </label>
            </div>
          )}

          </div>

          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>
              {modal.tipo === 'ver' ? 'Cerrar' : 'Cancelar'}
            </button>
            {modal.tipo !== 'ver' && (
              <button className={`modal-btn save-btn ${modal.tipo === 'eliminar' ? 'delete-btn' : ''}`} onClick={modal.tipo === 'eliminar' ? eliminar : guardar}>
                {modal.tipo === 'eliminar' ? 'Eliminar' : 'Guardar'}
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
