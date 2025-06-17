import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';

export default function InsumosTable() {
  const [insumos, setInsumos] = useState([
    { id: 1, nombre: 'Harina', categoria: 'Secos', cantidad: 10, unidad: 'kg', estado: true, marca: 'Nestlé' },
    { id: 2, nombre: 'Azúcar', categoria: 'Endulzantes', cantidad: 5, unidad: 'kg', estado: false, marca: 'Diana' },
    { id: 3, nombre: 'Huevos', categoria: 'Frescos', cantidad: 30, unidad: 'unid', estado: true, marca: 'Colanta' }
  ]);

  const [filtro, setFiltro] = useState('');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modal, setModal] = useState({ visible: false, tipo: '', insumo: null });
  const [form, setForm] = useState({ nombre: '', categoria: '', cantidad: '', unidad: 'kg', marca: '', imagen: '', estado: true });

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const toggleEstado = (id) => {
    const insumo = insumos.find(i => i.id === id);
    setInsumos(insumos.map(i => i.id === id ? { ...i, estado: !i.estado } : i));
    showNotification(`Insumo ${insumo.estado ? 'desactivado' : 'activado'} exitosamente`);
  };

  const abrirModal = (tipo, insumo = null) => {
    setModal({ visible: true, tipo, insumo });
    if (tipo === 'editar' && insumo) setForm({ ...insumo });
    if (tipo === 'agregar') setForm({ nombre: '', categoria: '', cantidad: '', unidad: 'kg', marca: '', imagen: '', estado: true });
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
    if (!form.nombre.trim()) {
      showNotification('El nombre es obligatorio', 'error');
      return false;
    }
    if (!form.categoria.trim()) {
      showNotification('La categoría es obligatoria', 'error');
      return false;
    }
    if (!form.cantidad || form.cantidad <= 0) {
      showNotification('La cantidad debe ser mayor a 0', 'error');
      return false;
    }
    if (!form.marca.trim()) {
      showNotification('El insumo debe tener una marca', 'error');
      return false;
    }
    return true;
  };

  const guardar = () => {
    if (!validarFormulario()) return;

    if (modal.tipo === 'agregar') {
      const nuevoId = Math.max(...insumos.map(i => i.id), 0) + 1;
      setInsumos([...insumos, { ...form, id: nuevoId }]);
      showNotification('Insumo agregado exitosamente');
    } else if (modal.tipo === 'editar') {
      setInsumos(insumos.map(i => i.id === modal.insumo.id ? form : i));
      showNotification('Insumo actualizado exitosamente');
    }
    cerrarModal();
  };

  const eliminar = () => {
    setInsumos(insumos.filter(i => i.id !== modal.insumo.id));
    showNotification('Insumo eliminado exitosamente');
    cerrarModal();
  };

  const cerrarModal = () => setModal({ visible: false, tipo: '', insumo: null });

  const insumosFiltrados = insumos.filter(i => 
    i.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
    i.categoria.toLowerCase().includes(filtro.toLowerCase())
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
        <button className="admin-button pink" onClick={() => abrirModal('agregar')}>
          + Agregar
        </button>
        <SearchBar value={filtro} onChange={setFiltro} placeholder="Buscar insumo..." />
      </div>

      <h2 className="admin-section-title">Insumos</h2>
      <DataTable value={insumosFiltrados} paginator rows={5} className="admin-table">
        <Column header="N°" body={(rowData, { rowIndex }) => rowIndex + 1} style={{ width: '3rem', textAlign: 'center' }} />
        <Column field="nombre" header="Nombre" />
        <Column field="categoria" header="Categoría" />
        <Column header="Cantidad" body={i => `${i.cantidad} ${i.unidad}`} />
        <Column header="Estado" body={i => (
          <InputSwitch checked={i.estado} onChange={() => toggleEstado(i.id)} />
        )} />
        <Column header="Acción" body={i => (
          <div>
            <button className="admin-button gray" title="ver" onClick={() => abrirModal('ver', i)}>&#128065;</button>
            <button className="admin-button yellow" onClick={() => abrirModal('editar', i)}>✏️</button>
            <button className="admin-button red" onClick={() => abrirModal('eliminar', i)}>🗑️</button>
          </div>
        )} />
      </DataTable>

      {modal.visible && (
        <Modal visible={modal.visible} onClose={cerrarModal}>
          <h2 className="modal-title">
            {modal.tipo === 'agregar' && 'Agregar Insumo'}
            {modal.tipo === 'editar' && 'Editar Insumo'}
            {modal.tipo === 'ver' && 'Detalles Insumo'}
            {modal.tipo === 'eliminar' && 'Eliminar Insumo'}
          </h2>

          <div className="modal-body">
            {modal.tipo === 'eliminar' ? (
              <p>¿Eliminar <strong>{modal.insumo?.nombre}</strong>?</p>
            ) : modal.tipo === 'ver' ? (
              <div>
                <p><strong>Nombre:</strong> {modal.insumo?.nombre}</p>
                <p><strong>Categoría:</strong> {modal.insumo?.categoria}</p>
                <p><strong>Cantidad:</strong> {modal.insumo?.cantidad} {modal.insumo?.unidad}</p>
                <p><strong>Marca:</strong> {modal.insumo?.marca}</p>
                {modal.insumo?.imagen && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Imagen:</strong>
                    <img src={modal.insumo.imagen} alt={modal.insumo.nombre} style={{ maxWidth: '100%', maxHeight: '150px', display: 'block', marginTop: '5px' }} />
                  </div>
                )}
                <p><strong>Estado:</strong> {modal.insumo?.estado ? 'Activo' : 'Inactivo'}</p>
              </div>
            ) : (
              <div>
                <label>
                  Nombre:
                  <input name="nombre" value={form.nombre} onChange={handleChange} className="modal-input" required />
                </label>
                <label>
                  Categoría:
                  <select name="categoria" value={form.categoria} onChange={handleChange} className="modal-input">
                    <option value="">Selecciona una categoría</option>
                    <option value="Secos">Secos</option>
                    <option value="Frescos">Frescos</option>
                    <option value="Endulzantes">Endulzantes</option>
                    <option value="Otros">Otros</option>
                  </select>
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ flex: 1 }}>
                    Cantidad:
                    <input type="number" name="cantidad" value={form.cantidad} onChange={handleChange} className="modal-input" required />
                  </label>
                  <label style={{ flex: 1 }}>
                    Unidad:
                    <select name="unidad" value={form.unidad} onChange={handleChange} className="modal-input">
                      <option value="kg">kilogramo(kg)</option>
                      <option value="g">Gramo(g)</option>
                      <option value="l">Litros(l)</option>
                      <option value="ml">Mililitros(ml)</option>
                      <option value="unid">unidades(u)</option>
                    </select>
                  </label>
                </div>
                <label>
                  Marca:
                  <select name="marca" value={form.marca} onChange={handleChange} className="modal-input">
                    <option value="">Selecciona una marca</option>
                    <option value="Nestlé">Nestlé</option>
                    <option value="Diana">Diana</option>
                    <option value="Colanta">Colanta</option>
                    <option value="Otra">Otra</option>
                  </select>
                </label>
                <label>
                  Imagen:
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
                </label>
                {form.imagen && (
                  <img src={form.imagen} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: '100px', marginTop: '5px' }} />
                )}
                {modal.tipo !== 'agregar' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '10px' }}>
                    Estado:
                    <InputSwitch checked={form.estado} onChange={e => setForm({ ...form, estado: e.value })} />
                  </label>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>
              {modal.tipo === 'ver' ? 'Cerrar' : 'Cancelar'}
            </button>
            {modal.tipo !== 'ver' && (
              <button className={`modal-btn ${modal.tipo === 'eliminar' ? 'delete-btn' : 'save-btn'}`} onClick={modal.tipo === 'eliminar' ? eliminar : guardar}>
                {modal.tipo === 'eliminar' ? 'Eliminar' : 'Guardar'}
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
