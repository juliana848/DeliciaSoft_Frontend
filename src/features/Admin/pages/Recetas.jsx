import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';

export default function RecetasTabla() {
  const [recetas, setRecetas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    cantidad: '',
    unidad: 'kg',
    marca: '',
    imagen: '',
    especificaciones: '',
    estado: true
  });

  useEffect(() => {
    const mockRecetas = [
      {
        Idreceta: 1,
        IdProductoGeneral: 1,
        IdUnidadMedida: 1,
        nombre: "Harina",
        categoria: "Granos",
        cantidad: 2,
        unidad: "kg",
        marca: "Don Pancho",
        imagen: "https://via.placeholder.com/150",
        especificaciones: "Sin azúcar",
        estado: true,
        tieneVinculaciones: true
      },
      {
        Idreceta: 2,
        IdProductoGeneral: 2,
        IdUnidadMedida: 2,
        nombre: "Azúcar",
        categoria: "Endulzantes",
        cantidad: 1,
        unidad: "kg",
        marca: "Manuelita",
        imagen: "https://via.placeholder.com/150",
        especificaciones: "Azúcar refinada",
        estado: true,
        tieneVinculaciones: false
      },
      {
        Idreceta: 3,
        IdProductoGeneral: 3,
        IdUnidadMedida: 3,
        nombre: "Mantequilla",
        categoria: "Lácteos",
        cantidad: 500,
        unidad: "gr",
        marca: "Alpina",
        imagen: "https://via.placeholder.com/150",
        especificaciones: "Sin sal",
        estado: false,
        tieneVinculaciones: false
      }
    ];

    setRecetas(mockRecetas);
  }, []);

  const toggleEstado = (receta) => {
    const updated = recetas.map(r =>
      r.Idreceta === receta.Idreceta ? { ...r, estado: !r.estado } : r
    );
    setRecetas(updated);
    showNotification(`Receta ${receta.estado ? 'desactivada' : 'activada'} exitosamente`);
  };

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const abrirModal = (tipo, receta = null) => {
    setModalTipo(tipo);
    setRecetaSeleccionada(receta);
    
    if (tipo === 'agregar') {
      setFormData({
        nombre: '',
        categoria: '',
        cantidad: '',
        unidad: 'kg',
        marca: '',
        imagen: '',
        especificaciones: '',
        estado: true
      });
    } else if (tipo === 'editar' && receta) {
      setFormData({
        nombre: receta.nombre,
        categoria: receta.categoria,
        cantidad: receta.cantidad,
        unidad: receta.unidad,
        marca: receta.marca,
        imagen: receta.imagen,
        especificaciones: receta.especificaciones,
        estado: receta.estado
      });
    }
    
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setRecetaSeleccionada(null);
    setModalTipo(null);
    setFormData({
      nombre: '',
      categoria: '',
      cantidad: '',
      unidad: 'kg',
      marca: '',
      imagen: '',
      especificaciones: '',
      estado: true
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validarFormulario = () => {
    const { nombre, categoria, cantidad, unidad, marca } = formData;
    
    if (!nombre.trim()) {
      showNotification('El nombre es obligatorio', 'error');
      return false;
    }
    
    if (!categoria.trim()) {
      showNotification('La categoría es obligatoria', 'error');
      return false;
    }
    
    if (!cantidad || cantidad <= 0) {
      showNotification('La cantidad debe ser mayor a 0', 'error');
      return false;
    }
    
    if (!unidad.trim()) {
      showNotification('La unidad es obligatoria', 'error');
      return false;
    }
    
    if (!marca.trim()) {
      showNotification('La marca es obligatoria', 'error');
      return false;
    }
    
    // Validar que el nombre no esté repetido
    const nombreExiste = recetas.some(r => 
      r.nombre.toLowerCase() === nombre.toLowerCase() && 
      (modalTipo === 'agregar' || r.Idreceta !== recetaSeleccionada?.Idreceta)
    );
    if (nombreExiste) {
      showNotification('Ya existe una receta con este nombre', 'error');
      return false;
    }
    
    return true;
  };

  const guardarReceta = () => {
    if (!validarFormulario()) return;
    
    if (modalTipo === 'agregar') {
      const nuevoId = recetas.length ? Math.max(...recetas.map(r => r.Idreceta)) + 1 : 1;
      const nuevaReceta = {
        ...formData,
        Idreceta: nuevoId,
        IdProductoGeneral: nuevoId,
        IdUnidadMedida: nuevoId,
        cantidad: parseFloat(formData.cantidad)
      };
      
      setRecetas([...recetas, nuevaReceta]);
      showNotification('Receta agregada exitosamente');
    } else if (modalTipo === 'editar') {
      const updated = recetas.map(r =>
        r.Idreceta === recetaSeleccionada.Idreceta 
          ? { ...r, ...formData, cantidad: parseFloat(formData.cantidad) }
          : r
      );
      setRecetas(updated);
      showNotification('Receta actualizada exitosamente');
    }
    
    cerrarModal();
  };

  const manejarEliminacion = () => {
    // Verificar si la receta tiene vinculaciones
    if (recetaSeleccionada.tieneVinculaciones) {
      cerrarModal();
      showNotification('No se puede eliminar la receta porque tiene vinculaciones asociadas', 'error');
      return;
    }
    
    // Si no tiene vinculaciones, abrir modal de confirmación
    setModalTipo('confirmarEliminar');
  };

  const confirmarEliminar = () => {
    const updated = recetas.filter(r => r.Idreceta !== recetaSeleccionada.Idreceta);
    setRecetas(updated);
    cerrarModal();
    showNotification('Receta eliminada exitosamente');
  };

  const recetasFiltradas = recetas.filter(receta =>
    receta.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    receta.categoria.toLowerCase().includes(filtro.toLowerCase()) ||
    receta.marca.toLowerCase().includes(filtro.toLowerCase()) ||
    receta.unidad.toLowerCase().includes(filtro.toLowerCase())
  );

  const unidades = [
    { label: 'Kilogramos', value: 'kg' },
    { label: 'Gramos', value: 'gr' },
    { label: 'Litros', value: 'lt' },
    { label: 'Mililitros', value: 'ml' },
    { label: 'Unidades', value: 'und' },
    { label: 'Cucharadas', value: 'cda' },
    { label: 'Cucharaditas', value: 'cdta' },
    { label: 'Tazas', value: 'tza' }
  ];

  return (
    <div className="admin-wrapper">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      <div className="admin-toolbar">
        <button
          className="admin-button pink"
          onClick={() => abrirModal('agregar')}
          type="button"
          style={{ padding: '10px 18px', fontSize: '15px', fontWeight: '500' }}
        >
          + Agregar Receta
        </button>
        <SearchBar
          placeholder="Buscar receta..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>
      <h2 className="admin-section-title">Gestión de Recetas</h2>
      <DataTable
        value={recetasFiltradas}
        className="admin-table"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column 
          header="Numero" 
          body={(rowData, { rowIndex }) => rowIndex + 1} 
          style={{ width: '3rem', textAlign: 'center' }}
        />
        <Column field="nombre" header="Nombre" />
        <Column field="categoria" header="Categoría" />
        <Column 
          header="Cantidad" 
          body={(rowData) => `${rowData.cantidad} ${rowData.unidad}`}
        />
        <Column field="marca" header="Marca" />
        <Column
          header="Estado"
          body={(rowData) => (
            <InputSwitch
              checked={rowData.estado}
              onChange={() => toggleEstado(rowData)}
            />
          )}
        />
        <Column
          header="Acciones"
          body={(rowData) => (
            <>
              <button className="admin-button gray" title="Visualizar" onClick={() => abrirModal('visualizar', rowData)}>
                &#128065; {/* 👁 */}
              </button>
              <button
                className="admin-button yellow"
                title="Editar"
                onClick={() => abrirModal('editar', rowData)}
              >
                ✏️
              </button>
              <button
                className="admin-button red"
                title="Eliminar"
                onClick={() => abrirModal('eliminar', rowData)}
              >
                🗑️
              </button>
            </>
          )}
        />
      </DataTable>

      {/* Modal Agregar/Editar */}
      {(modalTipo === 'agregar' || modalTipo === 'editar') && modalVisible && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title text-base">
            {modalTipo === 'agregar' ? 'Agregar Receta' : 'Editar Receta'}
          </h2>

          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '0.50fr 0.50fr', gap: '0.25rem', width: '100%', minWidth: '500px' }}>
              
              {/* Fila 1: Nombre y Categoría */}
              <div className="modal-field">
                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>Nombre:</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className="modal-input text-sm p-1"
                  style={{ width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px' }}
                  maxLength={50}
                />
              </div>

              <div className="modal-field">
                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>Categoría:</label>
                <input
                  type="text"
                  value={formData.categoria}
                  onChange={(e) => handleInputChange('categoria', e.target.value)}
                  className="modal-input text-sm p-1"
                  style={{ width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px' }}
                  maxLength={30}
                />
              </div>

              {/* Fila 2: Cantidad y Unidad */}
              <div className="modal-field">
                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>Cantidad:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.cantidad}
                  onChange={(e) => handleInputChange('cantidad', e.target.value)}
                  className="modal-input text-sm p-1"
                  style={{ width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px' }}
                />
              </div>

              <div className="modal-field">
                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>Unidad:</label>
                <select
                  value={formData.unidad}
                  onChange={(e) => handleInputChange('unidad', e.target.value)}
                  className="modal-input text-sm p-1"
                  style={{ width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px' }}
                >
                  {unidades.map(unidad => (
                    <option key={unidad.value} value={unidad.value}>
                      {unidad.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fila 3: Marca y Especificaciones */}
              <div className="modal-field">
                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>Marca:</label>
                <input
                  type="text"
                  value={formData.marca}
                  onChange={(e) => handleInputChange('marca', e.target.value)}
                  className="modal-input text-sm p-1"
                  style={{ width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px' }}
                  maxLength={30}
                />
              </div>

              <div className="modal-field">
                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>Especificaciones:</label>
                <input
                  type="text"
                  value={formData.especificaciones}
                  onChange={(e) => handleInputChange('especificaciones', e.target.value)}
                  className="modal-input text-sm p-1"
                  style={{ width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px' }}
                  maxLength={100}
                  placeholder="Opcional"
                />
              </div>

              {/* Fila 4: Imagen y Estado */}
              <div className="modal-field">
                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>URL Imagen:</label>
                <input
                  type="url"
                  value={formData.imagen}
                  onChange={(e) => handleInputChange('imagen', e.target.value)}
                  className="modal-input text-sm p-1"
                  style={{ width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px' }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="modal-field">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.2rem' }}>
                  <label className="text-sm" style={{ fontSize: '12px' }}>Estado:</label>
                  <InputSwitch
                    checked={formData.estado}
                    onChange={(e) => handleInputChange('estado', e.value)}
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="modal-footer mt-2 flex justify-end gap-2">
            <button className="modal-btn cancel-btn text-sm px-3 py-1" onClick={cerrarModal}>Cancelar</button>
            <button className="modal-btn save-btn text-sm px-3 py-1" onClick={guardarReceta}>Guardar</button>
          </div>
        </Modal>
      )}

      {/* Modal Visualizar */}
      {modalTipo === 'visualizar' && recetaSeleccionada && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Detalles de la Receta</h2>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Columna 1 */}
              <div>
                <p><strong>ID Receta:</strong> {recetaSeleccionada.Idreceta}</p>
                <p><strong>Nombre:</strong> {recetaSeleccionada.nombre}</p>
                <p><strong>Categoría:</strong> {recetaSeleccionada.categoria}</p>
                <p><strong>Cantidad:</strong> {recetaSeleccionada.cantidad} {recetaSeleccionada.unidad}</p>
                <p><strong>Marca:</strong> {recetaSeleccionada.marca}</p>
              </div>
              
              {/* Columna 2 */}
              <div>
                <p><strong>Especificaciones:</strong> {recetaSeleccionada.especificaciones || 'N/A'}</p>
                <p><strong>Estado:</strong> {recetaSeleccionada.estado ? 'Activo' : 'Inactivo'}</p>
                <p><strong>Imagen:</strong> 
                  {recetaSeleccionada.imagen && (
                    <img 
                      src={recetaSeleccionada.imagen} 
                      alt={recetaSeleccionada.nombre}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', marginLeft: '10px' }}
                    />
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cerrar</button>
          </div>
        </Modal>
      )}

      {/* Modal Eliminar - Pregunta inicial */}
      {modalTipo === 'eliminar' && recetaSeleccionada && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Eliminar Receta</h2>
          <div className="modal-body">
            <p>¿Está seguro que desea eliminar la receta <strong>{recetaSeleccionada.nombre}</strong>?</p>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
            <button className="modal-btn save-btn" onClick={manejarEliminacion}>Eliminar</button>
          </div>
        </Modal>
      )}

      {/* Modal Confirmar Eliminación */}
      {modalTipo === 'confirmarEliminar' && recetaSeleccionada && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Confirmar Eliminación</h2>
          <div className="modal-body">
            <p>¿Está completamente seguro que desea eliminar la receta <strong>{recetaSeleccionada.nombre}</strong>?</p>
            <p style={{ color: '#e53935', fontSize: '14px' }}>
              Esta acción no se puede deshacer y se eliminará toda la información de la receta.
            </p>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
            <button className="modal-btn save-btn" onClick={confirmarEliminar}>Confirmar Eliminación</button>
          </div>
        </Modal>
      )}
    </div>
  );
}