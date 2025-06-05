import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [precioEditado, setPrecioEditado] = useState('');
  const [cantidadEditada, setCantidadEditada] = useState('');
  const [categoriaEditada, setCategoriaEditada] = useState('');

  useEffect(() => {
    // Mock de categorías
    const mockCategorias = [
      { id: 301, nombre: 'Fresas con crema' },
      { id: 302, nombre: 'Obleas' },
      { id: 303, nombre: 'Cupcakes' },
      { id: 304, nombre: 'Postres' },
      { id: 305, nombre: 'Pasteles' },
      { id: 306, nombre: 'Arroz con leche' },
    ];
    setCategorias(mockCategorias);

    // Mock de productos
    const mockProductos = [
      { 
        id: 1, 
        nombre: 'Torta de Chocolate', 
        precio: 25000.00, 
        cantidad: 15, 
        idCategoriaProducto: 305,
        categoria: 'Pasteles',
        estado: true 
      },
      { 
        id: 2, 
        nombre: 'Cupcake de Vainilla', 
        precio: 3500.50, 
        cantidad: 50, 
        idCategoriaProducto: 303,
        categoria: 'Cupcakes',
        estado: true 
      },
      { 
        id: 3, 
        nombre: 'Fresas con Crema Especial', 
        precio: 8000.00, 
        cantidad: 20, 
        idCategoriaProducto: 301,
        categoria: 'Fresas con crema',
        estado: false 
      },
      { 
        id: 4, 
        nombre: 'Oblea Tradicional', 
        precio: 4500.00, 
        cantidad: 30, 
        idCategoriaProducto: 302,
        categoria: 'Obleas',
        estado: true 
      },
      { 
        id: 5, 
        nombre: 'Arroz con Leche Casero', 
        precio: 6000.00, 
        cantidad: 25, 
        idCategoriaProducto: 306,
        categoria: 'Arroz con leche',
        estado: true 
      },
    ];
    setProductos(mockProductos);
  }, []);

  const toggleEstado = (producto) => {
    const updated = productos.map(prod =>
      prod.id === producto.id ? { ...prod, estado: !prod.estado } : prod
    );
    setProductos(updated);
    showNotification(`Producto ${producto.estado ? 'desactivado' : 'activado'} exitosamente`);
  };

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const abrirModal = (tipo, producto) => {
    setModalTipo(tipo);
    setProductoSeleccionado(producto);
    if (tipo === 'editar') {
      setNombreEditado(producto.nombre);
      setPrecioEditado(producto.precio.toString());
      setCantidadEditada(producto.cantidad.toString());
      setCategoriaEditada(producto.idCategoriaProducto.toString());
    }
    if (tipo === 'agregar') {
      setNombreEditado('');
      setPrecioEditado('');
      setCantidadEditada('');
      setCategoriaEditada('');
    }
    setModalVisible(true);
  };

  const abrirModalAgregar = () => {
    abrirModal('agregar', null);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setProductoSeleccionado(null);
    setModalTipo(null);
    setNombreEditado('');
    setPrecioEditado('');
    setCantidadEditada('');
    setCategoriaEditada('');
  };

  const validarFormulario = () => {
    if (!nombreEditado.trim()) {
      showNotification('El nombre del producto es obligatorio', 'error');
      return false;
    }
    if (!precioEditado || parseFloat(precioEditado) <= 0) {
      showNotification('El precio debe ser mayor a 0', 'error');
      return false;
    }
    if (!cantidadEditada || parseInt(cantidadEditada) < 0) {
      showNotification('La cantidad debe ser un número válido', 'error');
      return false;
    }
    if (!categoriaEditada) {
      showNotification('Debe seleccionar una categoría', 'error');
      return false;
    }
    return true;
  };

  const guardarEdicion = () => {
    if (!validarFormulario()) return;

    const categoriaSeleccionada = categorias.find(cat => cat.id.toString() === categoriaEditada);
    
    const updated = productos.map(prod =>
      prod.id === productoSeleccionado.id ? { 
        ...prod, 
        nombre: nombreEditado,
        precio: parseFloat(precioEditado),
        cantidad: parseInt(cantidadEditada),
        idCategoriaProducto: parseInt(categoriaEditada),
        categoria: categoriaSeleccionada.nombre
      } : prod
    );
    setProductos(updated);
    cerrarModal();
    showNotification('Producto editado exitosamente');
  };

  const confirmarEliminar = () => {
    const updated = productos.filter(prod => prod.id !== productoSeleccionado.id);
    setProductos(updated);
    cerrarModal();
    showNotification('Producto eliminado exitosamente');
  };

  const guardarNuevoProducto = () => {
    if (!validarFormulario()) return;

    const nuevoId = productos.length ? Math.max(...productos.map(p => p.id)) + 1 : 1;
    const categoriaSeleccionada = categorias.find(cat => cat.id.toString() === categoriaEditada);

    setProductos([...productos, {
      id: nuevoId,
      nombre: nombreEditado,
      precio: parseFloat(precioEditado),
      cantidad: parseInt(cantidadEditada),
      idCategoriaProducto: parseInt(categoriaEditada),
      categoria: categoriaSeleccionada.nombre,
      estado: true
    }]);

    cerrarModal();
    showNotification('Producto agregado exitosamente');
  };

  const productosFiltrados = productos.filter(prod =>
    prod.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    prod.categoria.toLowerCase().includes(filtro.toLowerCase())
  );

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  return (
    <div className="admin-wrapper">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      {/* Buscador */}
      <div className="admin-toolbar">
        <button
          className="admin-button pink"
          onClick={abrirModalAgregar}
          type="button"
        >
          + Agregar
        </button>
        <SearchBar
          placeholder="Buscar productos..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>

      <h2 className="admin-section-title">Productos</h2>
      
      {/* Tabla */}
      <DataTable
        value={productosFiltrados}
        className="admin-table"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column
          header="Número"
          body={(_, { rowIndex }) => (productosFiltrados.indexOf(productosFiltrados[rowIndex]) + 1)}
          style={{ width: '3rem' }}
        />
        <Column field="nombre" header="Nombre Producto" />
        <Column 
          field="precio" 
          header="Precio" 
          body={(rowData) => formatearPrecio(rowData.precio)}
        />
        <Column field="cantidad" header="Cantidad" />
        <Column field="categoria" header="Categoría" />
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
          header="Acción"
          body={(rowData) => (
            <>
              <button 
                className="admin-button gray" 
                title="Visualizar" 
                onClick={() => abrirModal('visualizar', rowData)}
              >
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

      {/* Modal Agregar */}
      {modalTipo === 'agregar' && modalVisible && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Agregar Nuevo Producto</h2>
          <div className="modal-body">
            <label>
              Nombre del Producto:
              <input
                type="text"
                value={nombreEditado}
                onChange={(e) => setNombreEditado(e.target.value)}
                className="modal-input"
                placeholder="Ingrese el nombre del producto"
              />
            </label>
            <label style={{ marginTop: '1rem', display: 'block' }}>
              Precio:
              <input
                type="number"
                step="0.01"
                min="0"
                value={precioEditado}
                onChange={(e) => setPrecioEditado(e.target.value)}
                className="modal-input"
                placeholder="0.00"
              />
            </label>
            <label style={{ marginTop: '1rem', display: 'block' }}>
              Cantidad:
              <input
                type="number"
                min="0"
                value={cantidadEditada}
                onChange={(e) => setCantidadEditada(e.target.value)}
                className="modal-input"
                placeholder="0"
              />
            </label>
            <label style={{ marginTop: '1rem', display: 'block' }}>
              Categoría:
              <select
                value={categoriaEditada}
                onChange={(e) => setCategoriaEditada(e.target.value)}
                className="modal-input"
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
            <button className="modal-btn save-btn" onClick={guardarNuevoProducto}>
              Guardar
            </button>
          </div>
        </Modal>
      )}

      {/* Modal Visualizar */}
      {modalTipo === 'visualizar' && productoSeleccionado && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Detalles del Producto</h2>
          <div className="modal-body">
            <p><strong>ID:</strong> {productoSeleccionado.id}</p>
            <p><strong>Nombre:</strong> {productoSeleccionado.nombre}</p>
            <p><strong>Precio:</strong> {formatearPrecio(productoSeleccionado.precio)}</p>
            <p><strong>Cantidad:</strong> {productoSeleccionado.cantidad}</p>
            <p><strong>Categoría:</strong> {productoSeleccionado.categoria}</p>
            <p><strong>Estado:</strong> {productoSeleccionado.estado ? 'Activo' : 'Inactivo'}</p>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cerrar</button>
          </div>
        </Modal>
      )}

      {/* Modal Editar */}
      {modalTipo === 'editar' && productoSeleccionado && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Editar Producto</h2>
          <div className="modal-body">
            <label>
              Nombre del Producto:
              <input
                type="text"
                value={nombreEditado}
                onChange={(e) => setNombreEditado(e.target.value)}
                className="modal-input"
              />
            </label>
            <label style={{ marginTop: '1rem', display: 'block' }}>
              Precio:
              <input
                type="number"
                step="0.01"
                min="0"
                value={precioEditado}
                onChange={(e) => setPrecioEditado(e.target.value)}
                className="modal-input"
              />
            </label>
            <label style={{ marginTop: '1rem', display: 'block' }}>
              Cantidad:
              <input
                type="number"
                min="0"
                value={cantidadEditada}
                onChange={(e) => setCantidadEditada(e.target.value)}
                className="modal-input"
              />
            </label>
            <label style={{ marginTop: '1rem', display: 'block' }}>
              Categoría:
              <select
                value={categoriaEditada}
                onChange={(e) => setCategoriaEditada(e.target.value)}
                className="modal-input"
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
            <button className="modal-btn save-btn" onClick={guardarEdicion}>Guardar</button>
          </div>
        </Modal>
      )}

      {/* Modal Eliminar */}
      {modalTipo === 'eliminar' && productoSeleccionado && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Confirmar Eliminación</h2>
          <div className="modal-body">
            <p>¿Seguro que quieres eliminar el producto <strong>{productoSeleccionado.nombre}</strong>?</p>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
            <button className="modal-btn save-btn" onClick={confirmarEliminar}>Eliminar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}