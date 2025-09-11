import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';
import categoriaProductoApiService from '../services/categoriaProductosService';

export default function CategoriaProductos() {
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [descripcionEditada, setDescripcionEditada] = useState('');
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [previewImagen, setPreviewImagen] = useState(null);
  const fileInputRef = useRef(null);

  // Cargar categorías al montar el componente
  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const categoriasObtenidas = await categoriaProductoApiService.obtenerCategorias();
      
      // Mapear los datos de la API al formato esperado por el componente
      const categoriasMapeadas = categoriasObtenidas.map(categoria => ({
        id: categoria.idcategoriaproducto,
        nombre: categoria.nombrecategoria,
        descripcion: categoria.descripcion,
        activo: categoria.estado,
        imagen: categoria.imagenes ? categoria.imagenes.urlimg : null
      }));
      
      setCategorias(categoriasMapeadas);
    } catch (error) {
      showNotification('Error al cargar las categorías: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleActivo = async (categoria) => {
    try {
      setLoading(true);
      
      // Llamar al servicio para cambiar el estado
      await categoriaProductoApiService.toggleEstadoCategoria(categoria.id);
      
      // Actualizar el estado local
      const updated = categorias.map(cat =>
        cat.id === categoria.id ? { ...cat, activo: !cat.activo } : cat
      );
      setCategorias(updated);
      
      showNotification(`Categoría ${categoria.activo ? 'desactivada' : 'activada'} exitosamente`);
    } catch (error) {
      showNotification('Error al cambiar el estado: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Validar archivo
        categoriaProductoApiService.validarArchivoImagen(file);
        
        setArchivoImagen(file);
        
        // Crear preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImagen(e.target.result);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        showNotification(error.message, 'error');
        e.target.value = '';
      }
    }
  };

  const limpiarImagen = () => {
    setArchivoImagen(null);
    setPreviewImagen(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const abrirModal = (tipo, categoria) => {
    setModalTipo(tipo);
    setCategoriaSeleccionada(categoria);

    if (tipo === 'editar') {
      setNombreEditado(categoria.nombre);
      setDescripcionEditada(categoria.descripcion);
      setPreviewImagen(categoria.imagen);
      setArchivoImagen(null);
    }

    if (tipo === 'agregar') {
      setNombreEditado('');
      setDescripcionEditada('');
      setPreviewImagen(null);
      setArchivoImagen(null);
    }

    if (tipo === 'visualizar') {
      setPreviewImagen(categoria.imagen);
    }

    setModalVisible(true);
  };

  const abrirModalAgregar = () => {
    abrirModal('agregar', null);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setCategoriaSeleccionada(null);
    setModalTipo(null);
    setNombreEditado('');
    setDescripcionEditada('');
    limpiarImagen();
  };

  const validarFormulario = () => {
    if (!nombreEditado.trim()) {
      showNotification('El nombre es obligatorio', 'error');
      return false;
    }
    if (nombreEditado.length > 20) {
      showNotification('El nombre no puede tener más de 20 caracteres', 'error');
      return false;
    }
    if (!descripcionEditada.trim()) {
      showNotification('La descripción es obligatoria', 'error');
      return false;
    }
    if (descripcionEditada.length > 50) {
      showNotification('La descripción no puede tener más de 50 caracteres', 'error');
      return false;
    }
    return true;
  };

  const guardarEdicion = async () => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);
      
      const datosActualizados = {
        nombre: nombreEditado,
        descripcion: descripcionEditada,
        estado: categoriaSeleccionada.activo
      };

      const categoriaActualizada = await categoriaProductoApiService.actualizarCategoria(
        categoriaSeleccionada.id, 
        datosActualizados, 
        archivoImagen
      );
      
      // Actualizar el estado local
      const updated = categorias.map(cat =>
        cat.id === categoriaSeleccionada.id
          ? { 
              ...cat, 
              nombre: nombreEditado, 
              descripcion: descripcionEditada,
              imagen: categoriaActualizada.imagenes ? categoriaActualizada.imagenes.urlimg : cat.imagen
            }
          : cat
      );
      setCategorias(updated);
      
      cerrarModal();
      showNotification('Categoría editada exitosamente');
    } catch (error) {
      showNotification('Error al editar la categoría: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminar = async () => {
    try {
      setLoading(true);
      
      // Verificar si la categoría tiene productos asociados
      const tieneProductos = await categoriaProductoApiService.categoriaTieneProductos(categoriaSeleccionada.id);
      
      if (tieneProductos) {
        showNotification('No se puede eliminar una categoría que tiene productos asociados', 'error');
        return;
      }

      await categoriaProductoApiService.eliminarCategoria(categoriaSeleccionada.id);
      
      // Actualizar el estado local
      const updated = categorias.filter(cat => cat.id !== categoriaSeleccionada.id);
      setCategorias(updated);
      
      cerrarModal();
      showNotification('Categoría eliminada exitosamente');
    } catch (error) {
      showNotification('Error al eliminar la categoría: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const guardarNuevaCategoria = async () => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);
      
      const nuevaCategoria = {
        nombre: nombreEditado,
        descripcion: descripcionEditada,
        estado: true
      };

      const categoriaCreada = await categoriaProductoApiService.crearCategoria(nuevaCategoria, archivoImagen);
      
      // Agregar la nueva categoría al estado local
      const categoriaMapeada = {
        id: categoriaCreada.idcategoriaproducto,
        nombre: categoriaCreada.nombrecategoria,
        descripcion: categoriaCreada.descripcion,
        activo: categoriaCreada.estado,
        imagen: categoriaCreada.imagenes ? categoriaCreada.imagenes.urlimg : null
      };

      setCategorias([...categorias, categoriaMapeada]);
      
      cerrarModal();
      showNotification('Categoría agregada exitosamente');
    } catch (error) {
      showNotification('Error al agregar la categoría: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Template para mostrar imagen en la tabla
  const imagenBodyTemplate = (rowData) => {
    if (rowData.imagen) {
      return (
        <img 
          src={rowData.imagen} 
          alt={rowData.nombre}
          style={{ 
            width: '50px', 
            height: '50px', 
            borderRadius: '8px', 
            objectFit: 'cover',
            cursor: 'pointer'
          }}
          onClick={() => abrirModal('visualizar', rowData)}
        />
      );
    }
    return (
      <div style={{ 
        width: '50px', 
        height: '50px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: '#666'
      }}>
        Sin imagen
      </div>
    );
  };

  const categoriasFiltradas = categorias.filter(cat =>
    cat.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    cat.descripcion.toLowerCase().includes(filtro.toLowerCase())
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
        <button
          className="admin-button pink"
          onClick={abrirModalAgregar}
          type="button"
          disabled={loading}
        >
          + Agregar
        </button>
        <SearchBar
          placeholder="Buscar categoría..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>

      <h2 className="admin-section-title">Gestión de categorías de productos</h2>
      
      <DataTable
        value={categoriasFiltradas}
        className="admin-table"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
        loading={loading}
        emptyMessage="No se encontraron categorías"
      >
        <Column
          header="N°"
          body={(_, { rowIndex }) => rowIndex + 1}
          style={{ width: '3rem' }}
          headerStyle={{ textAlign: 'right', paddingLeft:'25px'}}
          bodyStyle={{ textAlign: 'center', paddingLeft:'3px'}}
        />
        <Column
          header="Imagen"
          body={imagenBodyTemplate}
          headerStyle={{ textAlign: 'center', paddingLeft:'10px'}}
          bodyStyle={{ textAlign: 'center', paddingLeft:'10px'}}
          style={{ width: '100px' }}
        />
        <Column
          field="nombre"
          header="Nombre"
          headerStyle={{ textAlign: 'right', paddingLeft:'80px'}}
          bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
          style={{ width: '200px',maxHeight: '300px'}}
        />
        <Column
          field="descripcion"
          header="Descripción"
          bodyClassName="descripcion-col"
          headerStyle={{ textAlign: 'right', paddingLeft:'80px'}}
          bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
          style={{ width: '200px' }}
        />
        <Column
          header="Estado"
          body={(rowData) => (
            <InputSwitch
              checked={rowData.activo}
              onChange={() => toggleActivo(rowData)}
              disabled={loading}
            />
          )}
          headerStyle={{ textAlign: 'right', paddingLeft:'80px'}}
          bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
          style={{ width: '150px' }}
        />
        <Column
          header="Acción"
          body={(rowData) => (
            <>
              <button
                className="admin-button gray"
                title="Visualizar"
                onClick={() => abrirModal('visualizar', rowData)}
                disabled={loading}
              >
                👁
              </button>
              <button
                className={`admin-button ${rowData.activo ? 'yellow' : 'yellow-disabled'}`}
                title="Editar"
                onClick={() => rowData.activo && abrirModal('editar', rowData)}
                disabled={!rowData.activo || loading}
              >
                ✏️
              </button>
              <button
                className={`admin-button ${rowData.activo ? 'red' : 'red-disabled'}`}
                title="Eliminar"
                onClick={() => rowData.activo && abrirModal('eliminar', rowData)}
                disabled={!rowData.activo || loading}
              >
                🗑️
              </button>
            </>
          )}
          headerStyle={{ textAlign: 'right', paddingLeft:'80px'}}
          bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
          style={{ width: '180px' }}
        />
      </DataTable>

      {/* Modal Agregar / Editar */}
      {(modalTipo === 'agregar' || modalTipo === 'editar') && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">
            {modalTipo === 'agregar' ? 'Agregar Nueva Categoría' : 'Editar Categoría'}
          </h2>
          <div className="modal-body">
            <label>
              Nombre:
              <input
                type="text"
                value={nombreEditado}
                onChange={(e) => setNombreEditado(e.target.value)}
                className="modal-input"
                maxLength={20}
                disabled={loading}
              />
              <small>{nombreEditado.length}/20 caracteres</small>
            </label>
            <label style={{ marginTop: '1rem', display: 'block' }}>
              Descripción:
              <textarea
                value={descripcionEditada}
                onChange={(e) => setDescripcionEditada(e.target.value)}
                className="modal-input"
                rows={3}
                maxLength={50}
                disabled={loading}
              />
              <small>{descripcionEditada.length}/50 caracteres</small>
            </label>
            
            {/* Campo de imagen */}
            <label style={{ marginTop: '1rem', display: 'block' }}>
              Imagen (opcional):
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="modal-input"
                disabled={loading}
                style={{ marginTop: '0.5rem' }}
              />
              <small style={{ color: '#666' }}>
                Formatos permitidos: JPEG, PNG, WebP. Tamaño máximo: 5MB
              </small>
            </label>

            {/* Preview de imagen */}
            {previewImagen && (
              <div style={{ marginTop: '1rem' }}>
                <label>Vista previa:</label>
                <div style={{ 
                  marginTop: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px' 
                }}>
                  <img
                    src={previewImagen}
                    alt="Preview"
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid #ddd'
                    }}
                  />
                  <button
                    type="button"
                    onClick={limpiarImagen}
                    disabled={loading}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Quitar imagen
                  </button>
                </div>
              </div>
            )}

            {modalTipo === 'editar' && (
              <label style={{ marginTop: '1rem', display: 'block' }}>
                Estado:
                <div style={{ marginTop: '0.5rem' }}>
                  <InputSwitch
                    checked={categoriaSeleccionada?.activo || false}
                    onChange={(e) => {
                      setCategoriaSeleccionada({
                        ...categoriaSeleccionada,
                        activo: e.value
                      });
                    }}
                    disabled={loading}
                  />
                  <span style={{ marginLeft: '0.5rem' }}>
                    {categoriaSeleccionada?.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </label>
            )}
          </div>
          <div className="modal-footer">
            <button 
              className="modal-btn cancel-btn" 
              onClick={cerrarModal}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              className="modal-btn save-btn" 
              onClick={modalTipo === 'agregar' ? guardarNuevaCategoria : guardarEdicion}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal Visualizar */}
      {modalTipo === 'visualizar' && categoriaSeleccionada && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Detalles de la Categoría</h2>
          <div className="modal-body">
            {/* Mostrar imagen si existe */}
            {previewImagen && (
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Imagen:</label>
                <img
                  src={previewImagen}
                  alt={categoriaSeleccionada.nombre}
                  style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid #ddd'
                  }}
                />
              </div>
            )}
            <label>
              Nombre:
              <input
                type="text"
                value={categoriaSeleccionada.nombre}
                readOnly
                className="modal-input"
              />
            </label>
            <label style={{ marginTop: '1rem', display: 'block' }}>
              Descripción:
              <textarea
                value={categoriaSeleccionada.descripcion}
                readOnly
                className="modal-input"
                rows={3}
              />
            </label>
            <label style={{ marginTop: '1rem', display: 'block' }}>
              Estado:
              <div style={{ marginTop: '0.5rem' }}>
                <InputSwitch
                  checked={categoriaSeleccionada?.activo || false}
                  disabled={true}
                />
                <span style={{ marginLeft: '0.5rem' }}>
                  {categoriaSeleccionada?.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </label>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cerrar</button>
          </div>
        </Modal>
      )}

      {/* Modal Eliminar */}
      {modalTipo === 'eliminar' && categoriaSeleccionada && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">¿Eliminar Categoría?</h2>
          <div className="modal-body">
            <p>¿Estás seguro de que deseas eliminar la categoría <strong>{categoriaSeleccionada.nombre}</strong>?</p>
            <p style={{ color: '#dc3545', fontSize: '0.9rem' }}>
              Esta acción no se puede deshacer y también eliminará la imagen asociada.
            </p>
          </div>
          <div className="modal-footer">
            <button 
              className="modal-btn cancel-btn" 
              onClick={cerrarModal}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              className="modal-btn save-btn" 
              onClick={confirmarEliminar}
              disabled={loading}
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}