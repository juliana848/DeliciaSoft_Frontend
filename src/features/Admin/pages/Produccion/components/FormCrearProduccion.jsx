// src/features/Admin/pages/Produccion/components/FormCrearProduccion.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../../../components/modal';
import ModalAgregarProductos from './ModalAgregarProductos';
import ModalDetalleReceta from './ModalDetalleReceta';
import ModalInsumos from './ModalInsumos';
import produccionApiService from '../../../services/produccion_services';
import productoApiService from '../../../services/productos_services';
import sedeApiService from '../../../services/sedes_services.js';
import './ProduccionForm.css';

export default function FormCrearProduccion({ 
  pestanaActiva, 
  procesos, 
  setProcesos, 
  showNotification, 
  onCancelar 
}) {
  const [mostrarModalProductos, setMostrarModalProductos] = useState(false);
  const [mostrarModalRecetaDetalle, setMostrarModalRecetaDetalle] = useState(false);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);
  const [mostrarDetalleInsumos, setMostrarDetalleInsumos] = useState(false);
  const [productoDetalleInsumos, setProductoDetalleInsumos] = useState(null);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [sedes, setSedes] = useState([]);
  const [cargandoSedes, setCargandoSedes] = useState(true);
  const [procesoData, setProcesoData] = useState({
    tipoProduccion: 'fabrica',
    nombreProduccion: '',
    fechaCreacion: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    cargarProductos();
    cargarSedes();
  }, []);

  const cargarSedes = async () => {
    try {
      setCargandoSedes(true);
      const sedesData = await sedeApiService.obtenerSedes();
      const sedesActivas = sedesData.filter(s => s.estado || s.activo);
      setSedes(sedesActivas);
    } catch (error) {
      console.error('Error cargando sedes:', error);
      showNotification('Error al cargar las sedes', 'error');
      setSedes([]);
    } finally {
      setCargandoSedes(false);
    }
  };

  const cargarProductos = async () => {
    try {
      setCargandoProductos(true);
      const productos = await productoApiService.obtenerProductosConRecetas();
      const productosFormateados = productos
        .filter(p => p.estado === true)
        .map(producto => {
          const receta = producto.receta
            ? {
                ...producto.receta,
                nombre: producto.receta.nombrereceta,
                especificaciones: producto.receta.especificaciones,
                insumos: producto.receta.insumos?.map(ins => ({
                  id: ins.iddetallereceta,
                  cantidad: ins.cantidad,
                  unidadmedida: ins.unidadmedida,
                  nombre: ins.insumo?.nombreinsumo || "Sin nombre"
                })) || []
              }
            : null;

          return {
            id: producto.idproductogeneral,
            nombre: producto.nombreproducto,
            imagen: producto.urlimagen || 'https://via.placeholder.com/150',
            categoria: producto.categoria,
            precio: producto.precioproducto,
            receta,
            insumos: receta?.insumos || [],
            cantidad: 1,
            cantidadesPorSede: {}
          };
        });
      
      setProductosDisponibles(productosFormateados);
    } catch (error) {
      showNotification('Error al cargar productos: ' + error.message, 'error');
      setProductosDisponibles([]);
    } finally {
      setCargandoProductos(false);
    }
  };

  const cambiarCantidadSede = (productoId, nombreSede, cantidad) => {
    const cantidadNum = parseInt(cantidad) || 0;
    setProductosSeleccionados(prev =>
      prev.map(p => {
        if (p.id === productoId) {
          const cantidadesPorSede = { 
            ...p.cantidadesPorSede, 
            [nombreSede]: cantidadNum
          };
          const cantidadTotal = Object.values(cantidadesPorSede).reduce(
            (sum, cant) => sum + (parseInt(cant) || 0), 
            0
          );
          return { ...p, cantidadesPorSede, cantidad: cantidadTotal };
        }
        return p;
      })
    );
  };

  const removeProducto = (id) => {
    setProductosSeleccionados(prev => prev.filter(item => item.id !== id));
    showNotification('Producto eliminado de la lista');
  };

  const guardarProceso = async () => {
    const nombreNormalizado = procesoData.nombreProduccion.trim();

    if (!nombreNormalizado || nombreNormalizado === '') {
      showNotification('El nombre de la producción es obligatorio', 'error');
      return;
    }

    if (!/^producción\s*/i.test(nombreNormalizado)) {
      showNotification("El nombre debe comenzar con 'Producción'", 'error');
      return;
    }

    const existeProduccion = procesos.some(
      (p) => p.nombreProduccion?.toLowerCase() === nombreNormalizado.toLowerCase()
    );

    if (existeProduccion) {
      showNotification('Ya existe una producción con ese nombre', 'error');
      return;
    }

    if (productosSeleccionados.length === 0) {
      showNotification('Debe agregar al menos un producto', 'error');
      return;
    }

    const productosSinCantidad = productosSeleccionados.filter(p => {
      const total = Object.values(p.cantidadesPorSede || {}).reduce(
        (sum, cant) => sum + (parseInt(cant) || 0), 
        0
      );
      return total === 0;
    });
    
    if (productosSinCantidad.length > 0) {
      showNotification('Todos los productos deben tener al menos una cantidad en alguna sede', 'error');
      return;
    }

    const payload = {
      TipoProduccion: 'fabrica',
      nombreproduccion: nombreNormalizado,
      fechapedido: procesoData.fechaCreacion,
      fechaentrega: null,
      productos: productosSeleccionados.map(p => ({
        id: p.id,
        cantidad: p.cantidad,
        cantidadesPorSede: p.cantidadesPorSede || {},
        sede: null
      }))
    };

    try {
      const creado = await produccionApiService.crearProduccion(payload);
      if (!creado || (!creado.idproduccion && !creado.id)) {
        throw new Error("La API devolvió respuesta inválida");
      }

      const nuevoLocal = {
        id: creado.idproduccion || creado.id,
        tipoProduccion: 'fabrica',
        nombreProduccion: creado.nombreproduccion,
        fechaCreacion: creado.fechapedido,
        estadoProduccion: creado.estadoproduccion,
        productos: productosSeleccionados
      };

      setProcesos(prev => [nuevoLocal, ...prev]);
      showNotification(`Producción "${creado.nombreproduccion}" creada exitosamente. Insumos descontados e inventario actualizado.`, 'success');
      onCancelar();
    } catch (e) {
      console.error('Error al crear producción:', e);
      showNotification(e.message || 'Error al guardar la producción', 'error');
    }
  };

  return (
    <>
      <div className="compra-form-container">
        <div className="header-info">
          <div className="info-badge">
            <span className="badge-icon">🏭</span>
            <span>Productos disponibles: {productosDisponibles?.length || 0}</span>
          </div>
        </div>
        
        {(cargandoProductos || cargandoSedes) && (
          <div className="error-banner">
            <span className="error-icon">⏳</span>
            Cargando datos...
          </div>
        )}
        
        <form onSubmit={(e) => { e.preventDefault(); guardarProceso(); }}>
          <div className="form-card">
            <h2 className="section-title">
              <span className="title-icon">📋</span>
              Información de la Producción
            </h2>
            
            <div className="form-grid">
              <div className="field-group">
                <label className="field-label">Tipo de Producción</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value="Fábrica" 
                  disabled 
                />
              </div>

              <div className="field-group">
                <label className="field-label">Nombre de la Producción<span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="text" 
                  name="nombreProduccion" 
                  value={procesoData.nombreProduccion} 
                  onChange={(e) => setProcesoData(prev => ({ ...prev, nombreProduccion: e.target.value }))} 
                  className="form-input"
                  placeholder="Ej: Producción #1"
                  maxLength={100}
                  required 
                />
              </div>

              <div className="field-group">
                <label className="field-label">Fecha de creación</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={procesoData.fechaCreacion} 
                  disabled 
                />
              </div>
            </div>
          </div>

          <div className="form-card">
            <h2 className="section-title">
              <span className="title-icon">📦</span>
              Productos agregados: ({productosSeleccionados.length})
            </h2>
            
            <div className="table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    {sedes.map(sede => (
                      <th key={sede.id || sede.idsede}>
                        {sede.nombre}<span style={{ color: 'red' }}>*</span>
                      </th>
                    ))}
                    <th>Total</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {productosSeleccionados.length === 0 ? (
                    <tr>
                      <td colSpan={sedes.length + 4} style={{textAlign: 'center', padding: '20px', color: '#6b7280'}}>
                        No hay productos en esta producción
                      </td>
                    </tr>
                  ) : (
                    productosSeleccionados.map(item => (
                      <tr key={item.id} className="product-row">
                        <td style={{textAlign: 'center'}}>
                          <img 
                            src={item.imagen || 'https://via.placeholder.com/50'} 
                            alt={item.nombre} 
                            width="50" 
                            height="50" 
                            style={{ objectFit: 'cover', borderRadius: '8px' }} 
                          />
                        </td>
                        <td className="product-name">
                          <div>{item.nombre}</div>
                          {item.receta && (
                            <small style={{ fontSize: '12px', color: '#6b7280' }}>
                              {item.receta.nombre}
                            </small>
                          )}
                        </td>
                        {sedes.map(sede => (
                          <td key={sede.id || sede.idsede} className="quantity-cell">
                            <input 
                              type="number" 
                              min="0" 
                              value={item.cantidadesPorSede?.[sede.nombre] || 0}
                              onChange={(e) => cambiarCantidadSede(item.id, sede.nombre, e.target.value)}
                              className="quantity-input"
                            />
                          </td>
                        ))}
                        <td className="quantity-cell">
                          <span className="quantity-display">
                            {Object.values(item.cantidadesPorSede || {}).reduce(
                              (sum, cant) => sum + (parseInt(cant) || 0), 
                              0
                            )}
                          </span>
                        </td>
                        <td className="action-cell">
                          <button 
                            type="button" 
                            className="delete-btn" 
                            onClick={() => removeProducto(item.id)} 
                            title="Eliminar producto"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <button 
            type="button" 
            className="add-products-btn" 
            onClick={() => setMostrarModalProductos(true)}
            disabled={cargandoProductos || cargandoSedes}
          >
            <span className="btn-icon">+</span>
            Agregar Productos
          </button>

          <div className="action-buttons">
            <button 
              type="button" 
              className="btn btn-cancel" 
              onClick={onCancelar}
            >
              Cancelar
            </button>
            <button 
              className="btn btn-save" 
              type="submit"
              disabled={cargandoProductos || cargandoSedes}
            >
              <span className="btn-icon">💾</span>
              Guardar
            </button>
          </div>
        </form>

        {mostrarModalProductos && (
          <Modal visible={mostrarModalProductos} onClose={() => setMostrarModalProductos(false)}>
            <ModalAgregarProductos
              productosDisponibles={productosDisponibles}
              productosSeleccionados={productosSeleccionados}
              setProductosSeleccionados={setProductosSeleccionados}
              onClose={() => setMostrarModalProductos(false)}
              tipoProduccion="fabrica"
              sedes={sedes}
            />
          </Modal>
        )}

        {mostrarModalRecetaDetalle && recetaSeleccionada && (
          <Modal visible={mostrarModalRecetaDetalle} onClose={() => setMostrarModalRecetaDetalle(false)}>
            <ModalDetalleReceta 
              receta={recetaSeleccionada} 
              onClose={() => setMostrarModalRecetaDetalle(false)} 
            />
          </Modal>
        )}

        {mostrarDetalleInsumos && productoDetalleInsumos && (
          <Modal visible={mostrarDetalleInsumos} onClose={() => setMostrarDetalleInsumos(false)}>
            <ModalInsumos 
              producto={productoDetalleInsumos} 
              onClose={() => setMostrarDetalleInsumos(false)} 
            />
          </Modal>
        )}
      </div>
    </>
  );
}
