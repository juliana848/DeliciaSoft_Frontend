import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';

export default function InsumosTable() {
  const [insumos, setInsumos] = useState([
    { id: 1, nombre: 'Harina', categoria: 'Secos', cantidad: 10, unidad: 'kg', estado: true },
    { id: 2, nombre: 'Azúcar', categoria: 'Endulzantes', cantidad: 3, unidad: 'kg', estado: false },
    { id: 3, nombre: 'Huevos', categoria: 'Frescos', cantidad: 30, unidad: 'unid', estado: true }
  ]);

  const [filtro, setFiltro] = useState('');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modal, setModal] = useState({ visible: false, tipo: '', insumo: null });
  const [form, setForm] = useState({ nombre: '', categoria: '', cantidad: '', unidad: 'kg', imagen: '', estado: true });
  const [stockBajo, setStockBajo] = useState(false);

  const opcionesNombre = ['Harina', 'Azúcar', 'Huevos', 'Sal', 'Leche'];
  const opcionesCategoria = ['Secos', 'Frescos', 'Endulzantes', 'Otros'];
  const opcionesUnidad = ['kg', 'g', 'l', 'ml', 'unid'];

  const [errors, setErrors] = useState({
    nombre: null,
    categoria: null,
    cantidad: null,
    unidad: null
  });

  useEffect(() => {
    const bajoStock = insumos.some(i => i.cantidad < 5);
    setStockBajo(bajoStock);
  }, [insumos]);

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
    if (tipo === 'editar' && insumo) {
      setForm({ ...insumo });
    } else if (tipo === 'agregar') {
      setForm({ nombre: '', categoria: '', cantidad: '', unidad: '', imagen: '', estado: true });
    }
    setErrors({});
  };

  const cerrarModal = () => {
    setModal({ visible: false, tipo: '', insumo: null });
    setForm({ nombre: '', categoria: '', cantidad: '', unidad: '', imagen: '', estado: true });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'nombre') {
      setErrors(prev => ({
        ...prev,
        nombre: value && !opcionesNombre.includes(value) ? 'Nombre inválido' : null
      }));
    } else if (name === 'categoria') {
      setErrors(prev => ({
        ...prev,
        categoria: value && !opcionesCategoria.includes(value) ? 'Categoría inválida' : null
      }));
    } else if (name === 'unidad') {
      setErrors(prev => ({
        ...prev,
        unidad: value && !opcionesUnidad.includes(value) ? 'Unidad inválida' : null
      }));
    } else if (name === 'cantidad') {
      setErrors(prev => ({
        ...prev,
        cantidad: value && (isNaN(value) || Number(value) <= 0) ? 'Cantidad inválida' : null
      }));
    }
  };

  const convertirABase64 = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
    reader.onerror = (error) => console.error('Error al leer archivo:', error);
  };

  const validarFormulario = () => {
    if (
      errors.nombre || errors.categoria || errors.unidad || errors.cantidad ||
      !form.nombre || !form.categoria || !form.unidad || !form.cantidad
    ) {
      showNotification('Por favor corrige los campos inválidos', 'error');
      return false;
    }

    if (!form.imagen.trim()) {
      showNotification('La imagen es obligatoria', 'error');
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

  const insumosFiltrados = insumos.filter((i) => {
    const filtroLower = filtro.toLowerCase();
    return (
      i.nombre.toLowerCase().includes(filtroLower) ||
      i.categoria.toLowerCase().includes(filtroLower) ||
      i.unidad.toLowerCase().includes(filtroLower) ||
      i.cantidad.toString().toLowerCase().includes(filtroLower) ||
      (i.estado ? 'activo' : 'inactivo').includes(filtroLower)
    );
  });

  return (
    <div className="admin-wrapper">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      <div className="admin-toolbar">
        <button className="admin-button pink" onClick={() => abrirModal('agregar')}>+ Agregar</button>
        <SearchBar value={filtro} onChange={setFiltro} placeholder="Buscar insumo..." />
      </div>

      <h2 className="admin-section-title">Gestión de Insumos</h2>

      {stockBajo && (
        <div className="stock-alert">
          ⚠️ Hay insumos con stock bajo. Revisa la lista para reponerlos.
        </div>
      )}

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
            <button className="admin-button gray" onClick={() => abrirModal('ver', i)}>🔍</button>
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
              <div className="modal-form-grid">
                <p><strong>Nombre:</strong> {modal.insumo?.nombre}</p>
                <p><strong>Categoría:</strong> {modal.insumo?.categoria}</p>
                <p><strong>Cantidad:</strong> {modal.insumo?.cantidad} {modal.insumo?.unidad}</p>
                <p><strong>Estado:</strong> {modal.insumo?.estado ? 'Activo' : 'Inactivo'}</p>
                {modal.insumo?.imagen && (
                  <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                    <strong>Imagen:</strong>
                    <img src={modal.insumo.imagen} alt={modal.insumo.nombre} style={{ maxWidth: '100%', maxHeight: '150px', marginTop: '5px' }} />
                  </div>
                )}
              </div>
            ) : (
              <div className="modal-form-grid">
                <label>
                  Nombre*
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className={`modal-input ${errors.nombre ? 'input-invalid' : form.nombre ? 'input-valid' : ''}`}
                    list="nombres-sugeridos"
                  />
                  <datalist id="nombres-sugeridos">
                    {opcionesNombre.map((op, i) => <option key={i} value={op} />)}
                  </datalist>
                </label>

                <label>
                  Categoría*
                  <input
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    className={`modal-input ${errors.categoria ? 'input-invalid' : form.categoria ? 'input-valid' : ''}`}
                    list="categorias-sugeridas"
                  />
                  <datalist id="categorias-sugeridas">
                    {opcionesCategoria.map((op, i) => <option key={i} value={op} />)}
                  </datalist>
                </label>

                <label>
                  Cantidad*
                  <input
                    type="number"
                    name="cantidad"
                    value={form.cantidad}
                    onChange={handleChange}
                    className={`modal-input ${errors.cantidad ? 'input-invalid' : form.cantidad ? 'input-valid' : ''}`}
                  />
                </label>

                <label>
                  Unidad*
                  <input
                    name="unidad"
                    value={form.unidad}
                    onChange={handleChange}
                    className={`modal-input ${errors.unidad ? 'input-invalid' : form.unidad ? 'input-valid' : ''}`}
                    list="unidades-sugeridas"
                  />
                  <datalist id="unidades-sugeridas">
                    {opcionesUnidad.map((op, i) => <option key={i} value={op} />)}
                  </datalist>
                </label>

                <label style={{ gridColumn: '1 / -1' }}>
                  Imagen*
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
                  <img
                    src={form.imagen}
                    alt="Vista previa"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100px',
                      marginTop: '-10px',
                      gridColumn: '1 / -1',
                    }}
                  />
                )}

                {modal.tipo !== 'agregar' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', gridColumn: '1 / -1' }}>
                    Estado:
                    <InputSwitch
                      checked={form.estado}
                      onChange={(e) => setForm({ ...form, estado: e.value })}
                    />
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
              <button
                className={`modal-btn save-btn ${modal.tipo === 'eliminar' ? 'delete-btn' : ''}`}
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
