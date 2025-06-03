import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';

export default function InsumosTable() {
  const [insumos, setInsumos] = useState([
    { id: 1, nombre: 'Harina', categoria: 'Secos', cantidad: 10, unidad: 'kg', estado: true },
    { id: 2, nombre: 'Azúcar', categoria: 'Endulzantes', cantidad: 5, unidad: 'kg', estado: false },
    { id: 3, nombre: 'Huevos', categoria: 'Frescos', cantidad: 30, unidad: 'unid', estado: true }
  ]);
  
  const [filtro, setFiltro] = useState('');
  const [modal, setModal] = useState({ visible: false, tipo: '', insumo: null });
  const [form, setForm] = useState({ nombre: '', categoria: '', cantidad: '', unidad: 'kg', estado: true });

  const toggleEstado = (id) => {
    setInsumos(insumos.map(i => i.id === id ? { ...i, estado: !i.estado } : i));
  };

  const abrirModal = (tipo, insumo = null) => {
    setModal({ visible: true, tipo, insumo });
    if (tipo === 'editar' && insumo) setForm({ ...insumo });
    if (tipo === 'agregar') setForm({ nombre: '', categoria: '', cantidad: '', unidad: 'kg', estado: true });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const guardar = () => {
    if (modal.tipo === 'agregar') {
      const nuevoId = Math.max(...insumos.map(i => i.id), 0) + 1;
      setInsumos([...insumos, { ...form, id: nuevoId }]);
    } else if (modal.tipo === 'editar') {
      setInsumos(insumos.map(i => i.id === modal.insumo.id ? form : i));
    }
    cerrarModal();
  };

  const eliminar = () => {
    setInsumos(insumos.filter(i => i.id !== modal.insumo.id));
    cerrarModal();
  };

  const cerrarModal = () => setModal({ visible: false, tipo: '', insumo: null });

  const insumosFiltrados = insumos.filter(i => 
    i.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
    i.categoria.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="admin-wrapper">
      <div className="admin-toolbar">
        <button className="admin-button pink" onClick={() => abrirModal('agregar')}>
          + Agregar
        </button>
        <SearchBar value={filtro} onChange={setFiltro} placeholder="Buscar insumo..." />
      </div>

      <DataTable value={insumosFiltrados} paginator rows={5} className="admin-table">
        <Column field="nombre" header="Nombre" />
        <Column field="categoria" header="Categoría" />
        <Column header="Cantidad" body={i => `${i.cantidad} ${i.unidad}`} />
        <Column header="Estado" body={i => (
          <InputSwitch checked={i.estado} onChange={() => toggleEstado(i.id)} />
        )} />
        <Column header="Acción" body={i => (
          <div>
            <button className="admin-button gray" onClick={() => abrirModal('ver', i)}>👁️</button>
            <button className="admin-button yellow" onClick={() => abrirModal('editar', i)}>✏️</button>
            <button className="admin-button red" onClick={() => abrirModal('eliminar', i)}>🗑️</button>
          </div>
        )} />
      </DataTable>

      {/* Modal único para todos los casos */}
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
                    <img 
                      src={modal.insumo.imagen} 
                      alt={modal.insumo.nombre} 
                      style={{ maxWidth: '100%', maxHeight: '150px', display: 'block', marginTop: '5px' }}
                    />
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
                  <input name="categoria" value={form.categoria} onChange={handleChange} className="modal-input" required />
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ flex: 1 }}>
                    Cantidad:
                    <input type="number" name="cantidad" value={form.cantidad} onChange={handleChange} className="modal-input" required />
                  </label>
                  <label style={{ flex: 1 }}>
                    Unidad:
                    <select name="unidad" value={form.unidad} onChange={handleChange} className="modal-input">
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="l">l</option>
                      <option value="ml">ml</option>
                      <option value="unid">unidades</option>
                    </select>
                  </label>
                </div>
                <label>
                  Marca:
                  <input name="marca" value={form.marca} onChange={handleChange} className="modal-input" />
                </label>
                <label>
                  Imagen (URL):
                  <input name="imagen" value={form.imagen} onChange={handleChange} className="modal-input" placeholder="https://..." />
                </label>
                {form.imagen && (
                  <img 
                    src={form.imagen} 
                    alt="Vista previa" 
                    style={{ maxWidth: '100%', maxHeight: '100px', marginTop: '5px' }}
                  />
                )}
                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '10px' }}>
                  Estado:
                  <InputSwitch checked={form.estado} onChange={e => setForm({ ...form, estado: e.value })} />
                </label>
              </div>
            )}
          </div>


          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>
              {modal.tipo === 'ver' ? 'Cerrar' : 'Cancelar'}
            </button>
            
            {modal.tipo !== 'ver' && (
              <button 
                className={`modal-btn ${modal.tipo === 'eliminar' ? 'delete-btn' : 'save-btn'}`}
                onClick={modal.tipo === 'eliminar' ? eliminar : guardar}
              >
                {modal.tipo === 'eliminar' ? 'Eliminar' : 'Guardar'}
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}