import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';
import '../adminStyles.css';

export default function Productos() {
  // Estados generales
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });

  // Modal principal producto
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Formularios
  const [nombreEditado, setNombreEditado] = useState('');
  const [precioEditado, setPrecioEditado] = useState('');
  const [categoriaEditada, setCategoriaEditada] = useState('');

  // Modal recetas
  const [modalRecetasVisible, setModalRecetasVisible] = useState(false);
  const [recetasDisponibles, setRecetasDisponibles] = useState([]);
  const [recetasSeleccionadas, setRecetasSeleccionadas] = useState([]);
  const [recetaDetalleVisible, setRecetaDetalleVisible] = useState(null); // id receta con detalles desplegados

  // Mock inicial para categorías, productos y recetas
  useEffect(() => {
    const mockCategorias = [
      { id: 301, nombre: 'Fresas con crema' },
      { id: 302, nombre: 'Obleas' },
      { id: 303, nombre: 'Cupcakes' },
      { id: 304, nombre: 'Postres' },
      { id: 305, nombre: 'Pasteles' },
      { id: 306, nombre: 'Arroz con leche' },
    ];
    setCategorias(mockCategorias);

    const mockProductos = [
      {
        id: 1,
        nombre: 'Torta de Chocolate',
        precio: 25000,
        idCategoriaProducto: 305,
        categoria: 'Pasteles',
        estado: true,
        recetas: []
      },
        {
        id: 2,
        nombre: 'Cupcake de Vainilla',
        precio: 7000,
        idCategoriaProducto: 303,
        categoria: 'Cupcakes',
        estado: true,
        recetas: [],
      },
      {
        id: 3,
        nombre: 'Fresas con Leche Condensada',
        precio: 9000,
        idCategoriaProducto: 301,
        categoria: 'Fresas con crema',
        estado: true,
        recetas: [],
      },
      {
        id: 4,
        nombre: 'Arroz con Leche Tradicional',
        precio: 8500,
        idCategoriaProducto: 306,
        categoria: 'Arroz con leche',
        estado: false,
        recetas: [],
      },
      {
        id: 5,
        nombre: 'Oblea con Arequipe y Queso',
        precio: 6000,
        idCategoriaProducto: 302,
        categoria: 'Obleas',
        estado: true,
        recetas: [],
      },
    ];
    setProductos(mockProductos);

    const mockRecetas = [
      {
    id: 1,
    nombre: 'Receta Base Chocolate',
    pasos: ['Derretir chocolate', 'Mezclar con harina', 'Hornear 40 min'],
    insumos: ['Chocolate', 'Harina', 'Huevos', 'Azúcar'],
    imagen: 'https://images.unsplash.com/photo-1604152135912-04a470154c4b?fit=crop&w=600&q=80'
  },
  {
    id: 2,
    nombre: 'Receta Base Vainilla',
    pasos: ['Batir huevos', 'Agregar esencia de vainilla', 'Hornear'],
    insumos: ['Huevos', 'Azúcar', 'Harina', 'Vainilla'],
    imagen: 'https://images.unsplash.com/photo-1599785209707-28c5f3e43c53?fit=crop&w=600&q=80'
  },
  {
    id: 3,
    nombre: 'Receta Fresas con Crema',
    pasos: ['Lavar fresas', 'Batir crema', 'Servir en copa'],
    insumos: ['Fresas', 'Crema de leche', 'Azúcar'],
    imagen: 'https://images.unsplash.com/photo-1605478522030-1c56a4d3896d?fit=crop&w=600&q=80'
  },
  {
    id: 4,
    nombre: 'Receta Arroz con Leche',
    pasos: ['Hervir arroz', 'Agregar leche y azúcar', 'Cocinar a fuego lento'],
    insumos: ['Arroz', 'Leche', 'Canela', 'Azúcar'],
    imagen: 'https://images.unsplash.com/photo-1612361362044-d45e5de58c00?fit=crop&w=600&q=80'
  },
  {
    id: 5,
    nombre: 'Receta Obleas Clásicas',
    pasos: ['Colocar oblea', 'Agregar arequipe y queso', 'Tapar con otra oblea'],
    insumos: ['Obleas', 'Arequipe', 'Queso rallado'],
    imagen: 'https://images.unsplash.com/photo-1653160056143-b232b93450e1?fit=crop&w=600&q=80'
  },
  {
    id: 6,
    nombre: 'Receta Cupcake Base',
    pasos: ['Mezclar ingredientes secos', 'Agregar líquidos', 'Hornear'],
    insumos: ['Harina', 'Azúcar', 'Huevos', 'Leche', 'Esencia de vainilla'],
    imagen: 'https://images.unsplash.com/photo-1519428870410-42e44efb96b9?fit=crop&w=600&q=80'
  }
    ];
    setRecetasDisponibles(mockRecetas);
  }, []);

  // Notificaciones
  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };
  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  // Abrir modal productos (agregar, editar, visualizar, eliminar)
  const abrirModal = (tipo, producto = null) => {
    setModalTipo(tipo);
    setProductoSeleccionado(producto);
    if (tipo === 'editar') {
      setNombreEditado(producto.nombre);
      setPrecioEditado(producto.precio.toString());
      setCategoriaEditada(producto.idCategoriaProducto.toString());
      setRecetasSeleccionadas(producto.recetas || []);
    }
    if (tipo === 'agregar') {
      setNombreEditado('');
      setPrecioEditado('');
      setCategoriaEditada('');
      setRecetasSeleccionadas([]);
    }
    setModalVisible(true);
  };
  const cerrarModal = () => {
    setModalVisible(false);
    setProductoSeleccionado(null);
    setModalTipo(null);
    setNombreEditado('');
    setPrecioEditado('');
    setCategoriaEditada('');
    setRecetasSeleccionadas([]);
  };

  // Abrir y cerrar modal recetas
  const abrirModalRecetas = () => {
    setModalRecetasVisible(true);
  };
  const cerrarModalRecetas = () => {
    setModalRecetasVisible(false);
    setRecetaDetalleVisible(null);
  };

  // Toggle mostrar detalle de pasos e insumos de una receta (en el modal recetas)
  const toggleDetalleReceta = (id) => {
    setRecetaDetalleVisible(recetaDetalleVisible === id ? null : id);
  };

  // Cambiar estado producto
  const toggleEstado = (producto) => {
    const nuevosProductos = productos.map(p => (
      p.id === producto.id ? { ...p, estado: !p.estado } : p
    ));
    setProductos(nuevosProductos);
    showNotification(`Producto ${producto.estado ? 'desactivado' : 'activado'} correctamente.`);
  };

  // Validación formulario producto
  const validarFormulario = () => {
    if (!nombreEditado.trim()) {
      showNotification('El nombre es obligatorio', 'error');
      return false;
    }
    if (!precioEditado || parseFloat(precioEditado) <= 0) {
      showNotification('El precio debe ser mayor a 0', 'error');
      return false;
    }
    if (!categoriaEditada) {
      showNotification('Debe seleccionar una categoría', 'error');
      return false;
    }
    return true;
  };

  // Guardar producto nuevo
  const guardarNuevoProducto = () => {
    if (!validarFormulario()) return;
    const nuevoId = productos.length ? Math.max(...productos.map(p => p.id)) + 1 : 1;
    const catObj = categorias.find(c => c.id.toString() === categoriaEditada);
    const nuevoProd = {
      id: nuevoId,
      nombre: nombreEditado,
      precio: parseFloat(precioEditado),
      idCategoriaProducto: parseInt(categoriaEditada),
      categoria: catObj.nombre,
      estado: true,
      recetas: recetasSeleccionadas,
    };
    setProductos([...productos, nuevoProd]);
    cerrarModal();
    showNotification('Producto agregado con éxito');
  };

  // Guardar edición producto
  const guardarEdicion = () => {
    if (!validarFormulario()) return;
    const catObj = categorias.find(c => c.id.toString() === categoriaEditada);
    const prodEditados = productos.map(p => (
      p.id === productoSeleccionado.id
        ? {
            ...p,
            nombre: nombreEditado,
            precio: parseFloat(precioEditado),
            idCategoriaProducto: parseInt(categoriaEditada),
            categoria: catObj.nombre,
            recetas: recetasSeleccionadas
          }
        : p
    ));
    setProductos(prodEditados);
    cerrarModal();
    showNotification('Producto editado con éxito');
  };

  // Eliminar producto
  const eliminarProducto = () => {
    const prodFiltrados = productos.filter(p => p.id !== productoSeleccionado.id);
    setProductos(prodFiltrados);
    cerrarModal();
    showNotification('Producto eliminado');
  };

  // Toggle selección de receta en modal recetas
  const toggleRecetaSeleccionada = (receta) => {
    if (recetasSeleccionadas.some(r => r.id === receta.id)) {
      setRecetasSeleccionadas(recetasSeleccionadas.filter(r => r.id !== receta.id));
    } else {
      setRecetasSeleccionadas([...recetasSeleccionadas, receta]);
    }
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    p.categoria.toLowerCase().includes(filtro.toLowerCase())
  );

  // Formato precio
  const formatearPrecio = (precio) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(precio);

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
        <SearchBar placeholder="Buscar productos..." value={filtro} onChange={setFiltro} />
      </div>

      <h2 className="admin-section-title">Productos</h2>

      <DataTable value={productosFiltrados} paginator rows={5} className="admin-table">
        <Column
          header="N°" 
          body={(_, { rowIndex }) => rowIndex + 1} 
          headerStyle={{ textAlign: 'right', paddingLeft:'15px'}}
          bodyStyle={{ textAlign: 'center', paddingLeft:'10px'}}
          style={{ width: '0.5rem' }}
        />
        <Column 
          field="nombre" 
          header="Nombre"
          headerStyle={{ textAlign: 'right', paddingLeft:'105px'}}
          bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
          style={{ width: '250px' }}
        />
        <Column
          field="precio"
          header="Precio"
          body={(row) => formatearPrecio(row.precio)}
          headerStyle={{ textAlign: 'right', paddingLeft:'105px'}}
          bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
          style={{ width: '250px' }}
        />
        <Column 
          field="categoria" 
          header="Categoría" 
          headerStyle={{ textAlign: 'right', paddingLeft:'105px'}}
          bodyStyle={{ textAlign: 'center', paddingLeft:'40px'}}
          style={{ width: '250px' }}
          />
        <Column
          header="Estado"
          body={(row) => (
            <InputSwitch checked={row.estado} onChange={() => toggleEstado(row)} />
          )}
          headerStyle={{ textAlign: 'right', paddingLeft:'25px'}}
          bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
          style={{ width: '50px' }}
        />
        <Column
          header="Acción"
          body={(row) => (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="admin-button gray"
                onClick={() => abrirModal('visualizar', row)}
                aria-label="Ver producto"
                title="Ver producto"
              >
                🔍
              </button>
              <button
                className="admin-button yellow"
                onClick={() => abrirModal('editar', row)}
                aria-label="Editar producto"
                title="Editar producto"
              >
                ✏️
              </button>
              <button
                className="admin-button red"
                onClick={() => abrirModal('eliminar', row)}
                aria-label="Eliminar producto"
                title="Eliminar producto"
              >
                🗑️
              </button>
            </div>
          )}
          headerStyle={{ textAlign: 'right', paddingLeft:'65px'}}
          bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
          style={{ width: '250px' }}
        />
      </DataTable>

      {/* Modal agregar/editar producto */}
      {(modalTipo === 'agregar' || modalTipo === 'editar') && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2>{modalTipo === 'agregar' ? 'Agregar Producto' : 'Editar Producto'}</h2>
          <div className="modal-content">
            <input
              type="text"
              placeholder="Nombre"
              value={nombreEditado}
              onChange={(e) => setNombreEditado(e.target.value)}
              className="modal-input"
            />
            <input
              type="number"
              placeholder="Precio"
              value={precioEditado}
              onChange={(e) => setPrecioEditado(e.target.value)}
              className="modal-input"
            />
            <select
              value={categoriaEditada}
              onChange={(e) => setCategoriaEditada(e.target.value)}
              className="modal-input"
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>

            <button
              className="modal-input-button"
              style={{ marginTop: '0.5rem' }}
              onClick={abrirModalRecetas}
            >
              📖 Seleccionar Recetas ({recetasSeleccionadas.length})
            </button>

            {/* Mostrar resumen de recetas seleccionadas */}
            {recetasSeleccionadas.length > 0 && (
              <div className="resumen-recetas">
                <h4>Recetas seleccionadas:</h4>
                <ul>
                  {recetasSeleccionadas.map((r) => (
                    <li key={r.id}>
                      <strong>{r.nombre}</strong> - {r.insumos.length} insumos, {r.pasos.length} pasos
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>
              Cancelar
            </button>
            <button
              className="modal-btn save-btn"
              onClick={modalTipo === 'agregar' ? guardarNuevoProducto : guardarEdicion}
            >
              Guardar
            </button>
          </div>
        </Modal>
      )}

      {/* Modal recetas */}
      {modalRecetasVisible && (
        <Modal visible={modalRecetasVisible} onClose={cerrarModalRecetas}>
          <h3>Seleccionar Recetas</h3>
          <ul className="lista-recetas-modal">
            {recetasDisponibles.map((receta) => (
              <li key={receta.id} className="receta-item">
                <label style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={recetasSeleccionadas.some((r) => r.id === receta.id)}
                    onChange={() => toggleRecetaSeleccionada(receta)}
                  />{' '}
                  <strong>{receta.nombre}</strong>
                </label>

                <button
                  type="button"
                  className="modal-input-button-slide"
                  onClick={() => toggleDetalleReceta(receta.id)}
                  aria-label="Mostrar detalles"
                >
                  {recetaDetalleVisible === receta.id ? '▲ Ocultar detalles' : '▼ Mostrar detalles'}
                </button>

                {recetaDetalleVisible === receta.id && (
                  <div className="detalle-receta">
                    <div>
                      <strong>Insumos:</strong>
                      <ul>
                        {receta.insumos.map((insumo, i) => (
                          <li key={i}>{insumo}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Pasos:</strong>
                      <ol>
                        {receta.pasos.map((paso, i) => (
                          <li key={i}>{paso}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="modal-footer">
            <button className="modal-btn save-btn" onClick={cerrarModalRecetas}>
              Listo
            </button>
          </div>
        </Modal>
      )}

      {/* Modal eliminar */}
      {modalTipo === 'eliminar' && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2>Confirmar Eliminación</h2>
          <p>
            ¿Estás seguro de eliminar el producto{' '}
            <strong>{productoSeleccionado?.nombre}</strong>?
          </p>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>
              Cancelar
            </button>
            <button className="modal-btn save-btn" onClick={eliminarProducto}>
              Eliminar
            </button>
          </div>
        </Modal>
      )}

      {/* Modal visualizar */}
      {modalTipo === 'visualizar' && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2>Detalles del Producto</h2>
          <p>
            <strong>Nombre:</strong> {productoSeleccionado?.nombre}
          </p>
          <p>
            <strong>Precio:</strong> {formatearPrecio(productoSeleccionado?.precio || 0)}
          </p>
          <p>
            <strong>Categoría:</strong> {productoSeleccionado?.categoria}
          </p>

          <h3 className='red-title'>--| Recetas Asociadas |--</h3>
            {productoSeleccionado?.recetas?.length > 0 ? (
              productoSeleccionado.recetas.map((r) => (
                <div key={r.id} className="detalle-receta-visualizar">
                  {r.imagen && (
                    <img
                      src={r.imagen}
                      alt={r.nombre}
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                  )}
                  <h4>{r.nombre}</h4>
                  <p>
                    <strong>Insumos:</strong> {r.insumos.join(', ')}
                  </p>
                  <p>
                    <strong>Pasos:</strong>
                  </p>
                  <ol>
                    {r.pasos.map((paso, i) => (
                      <li key={i}>{paso}</li>
                    ))}
                  </ol>
                </div>
              ))
            ) : (
              <p>No hay recetas asociadas.</p>
            )}

          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
