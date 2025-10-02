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
    tipoProduccion: pestanaActiva,
    nombreProduccion: '',
    fechaCreacion: new Date().toISOString().split('T')[0],
    fechaEntrega: ''
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
            cantidad: 1, // <--- cantidad por defecto en crear
            cantidadesPorSede: {} // <--- inicializar objeto de cantidades por sede
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

  const cambiarSede = (id, nuevaSede) => {
    setProductosSeleccionados(prev => 
      prev.map(p => p.id === id ? { ...p, sede: nuevaSede } : p)
    );
  };

  const cambiarCantidad = (id, nuevaCantidad) => {
    const cantidad = parseInt(nuevaCantidad) || 1;
    if (cantidad < 1) return;
    
    setProductosSeleccionados(prev =>
      prev.map(p => (p.id === id ? { ...p, cantidad } : p))
    );
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

  const verInsumosProducto = (producto) => {
    try {
      const base = productosDisponibles.find(p => p.id === producto.id) || producto;
      if (!base) {
        showNotification('No se encontró información del producto', 'error');
        return;
      }

      const cantidadProducto = producto.cantidad || 1; // siempre al menos 1

      const insumosMultiplicados = (base.insumos || []).map(insumo => ({
        ...insumo,
        cantidad: (parseFloat(insumo.cantidad) || 0) * cantidadProducto,
        unidadmedida: insumo.unidadmedida || 'N/A',
        nombreinsumo: insumo.nombreinsumo || insumo.nombre || insumo.insumo?.nombreinsumo || 'Sin nombre'
      }));

      setProductoDetalleInsumos({
        ...producto,
        imagen: base.imagen,
        insumos: insumosMultiplicados
      });
      setMostrarDetalleInsumos(true);

    } catch (error) {
      console.error('Error al cargar insumos del producto:', error);
      showNotification('Error al cargar insumos del producto', 'error');
    }
  };

  const abrirModalRecetaDetalle = async (producto) => {
    try {
      if (!producto.receta?.id) {
        showNotification('Este producto no tiene receta asociada', 'error');
        return;
      }

      const res = await fetch('https://deliciasoft-backend.onrender.com/api/receta/recetas');
      const data = await res.json();

      const recetaCompleta = data.find(r => r.idreceta === producto.receta.id);
      if (!recetaCompleta) {
        showNotification('No se encontró la receta en la base de datos', 'error');
        return;
      }

      recetaCompleta.imagen = producto.imagen;

      setRecetaSeleccionada(recetaCompleta);
      setMostrarModalRecetaDetalle(true);

    } catch (error) {
      console.error('Error cargando receta:', error);
      showNotification('Error al cargar detalle de receta', 'error');
    }
  };

  const cerrarModalRecetaDetalle = () => {
    setMostrarModalRecetaDetalle(false);
    setRecetaSeleccionada(null);
  };

  const guardarProceso = async () => {
    if (!procesoData.nombreProduccion || procesoData.nombreProduccion.trim() === '') {
      showNotification('El nombre de la producción es obligatorio', 'error');
      return;
    }

    if (procesoData.tipoProduccion === 'pedido') {
      if (!procesoData.fechaEntrega) {
        showNotification('La fecha de entrega es obligatoria para pedidos', 'error');
        return;
      }
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const entrega = new Date(procesoData.fechaEntrega);
      entrega.setHours(0, 0, 0, 0);
      const diff = Math.ceil((entrega - hoy) / (1000 * 60 * 60 * 24));
      
      if (diff < 15) {
        showNotification('La fecha de entrega debe ser al menos 15 días desde hoy', 'error');
        return;
      }
      if (diff > 30) {
        showNotification('La fecha de entrega no puede ser mayor a 30 días desde hoy', 'error');
        return;
      }
    }

    if (productosSeleccionados.length === 0) {
      showNotification('Debe agregar al menos un producto', 'error');
      return;
    }

    if (procesoData.tipoProduccion === 'fabrica') {
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
    } else {
      const productosSinSede = productosSeleccionados.filter(p => !p.sede);
      if (productosSinSede.length > 0) {
        showNotification('Todos los productos deben tener una sede asignada', 'error');
        return;
      }
    }

    const payload = {
      TipoProduccion: procesoData.tipoProduccion,
      nombreproduccion: procesoData.nombreProduccion.trim(),
      fechapedido: procesoData.fechaCreacion || new Date().toISOString().split('T')[0],
      fechaentrega: procesoData.tipoProduccion === 'pedido' ? procesoData.fechaEntrega : null,
      productos: productosSeleccionados.map(p => {
        if (procesoData.tipoProduccion === 'fabrica') {
          return {
            id: p.id,
            cantidad: p.cantidad,
            cantidadesPorSede: p.cantidadesPorSede || {},
            sede: null
          };
        } else {
          return {
            id: p.id,
            cantidad: parseInt(p.cantidad) || 1,
            sede: p.sede,
            cantidadesPorSede: null
          };
        }
      })
    };

    try {
      const creado = await produccionApiService.crearProduccion(payload);

      if (!creado || (!creado.idproduccion && !creado.id)) {
        throw new Error("La API devolvió respuesta inválida");
      }

      const nuevoLocal = {
        id: creado.idproduccion || creado.id,
        tipoProduccion: creado.TipoProduccion,
        nombreProduccion: creado.nombreproduccion,
        fechaCreacion: creado.fechapedido,
        fechaEntrega: creado.fechaentrega,
        estadoProduccion: creado.estadoproduccion,
        estadoPedido: creado.estadopedido,
        numeroPedido: creado.numeropedido || '',
        productos: productosSeleccionados
      };

      setProcesos(prev => [nuevoLocal, ...prev]);
      
      let mensaje = `Producción "${creado.nombreproduccion}" creada exitosamente`;
      if (procesoData.tipoProduccion === 'fabrica') {
        mensaje += '. Insumos descontados e inventario actualizado.';
      }
      
      showNotification(mensaje, 'success');
      onCancelar();

    } catch (e) {
      console.error('Error al crear producción:', e);
      
      if (e.message && e.message.includes('Insumos insuficientes')) {
        showNotification(
          'No hay suficientes insumos para esta producción. Revisa el inventario.',
          'error',
          8000
        );
      } else if (e.details?.tipo === 'INSUMOS_INSUFICIENTES') {
        const detalles = e.details.insuficientes.map(ins => 
          `${ins.nombreinsumo}: Falta ${ins.faltante.toFixed(2)} ${ins.unidad}`
        ).join(', ');
        showNotification(
          `Insumos insuficientes: ${detalles}`,
          'error',
          10000
        );
      } else {
        showNotification(e.message || 'Error al guardar la producción', 'error');
      }
    }
  };

  return (
    <>
      <div className="compra-form-container">
        {/* Header con información */}
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
          {/* Información de la Producción */}
          <div className="form-card">
            <h2 className="section-title">
              <span className="title-icon">📋</span>
              Información de la Producción
            </h2>
            
            <div className="form-grid">
              <div className="field-group">
                <label className="field-label">Tipo de Producción<span style={{ color: 'red' }}>*</span></label>
                <select 
                  name="tipoProduccion" 
                  className="form-input" 
                  value={procesoData.tipoProduccion} 
                  onChange={(e) => setProcesoData(prev => ({ ...prev, tipoProduccion: e.target.value }))} 
                  required
                >
                  <option value="pedido">Pedido</option>
                  <option value="fabrica">Fábrica</option>
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Nombre de la Producción <span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="text" 
                  name="nombreProduccion" 
                  value={procesoData.nombreProduccion} 
                  onChange={(e) => setProcesoData(prev => ({ ...prev, nombreProduccion: e.target.value }))} 
                  className="form-input"
                  placeholder="Ej: Producción pasteles navideños"
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

              {procesoData.tipoProduccion === 'pedido' && (
                <div className="field-group">
                  <label className="field-label">Fecha de Entrega<span style={{ color: 'red' }}>*</span></label>
                  <input 
                    type="date" 
                    name="fechaEntrega" 
                    className="form-input" 
                    value={procesoData.fechaEntrega} 
                    onChange={(e) => setProcesoData(prev => ({ ...prev, fechaEntrega: e.target.value }))} 
                    required 
                    min={new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]} 
                    max={new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]} 
                  />
                  <small style={{ color: '#6b7280', fontSize: '12px' }}>
                    Entre 15 y 30 días desde hoy
                  </small>
                </div>
              )}
            </div>
          </div>

          {/* Productos */}
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
                    {procesoData.tipoProduccion === 'fabrica' ? (
                      <>
                        {sedes.map(sede => (
                          <th key={sede.id || sede.idsede}>
                            {sede.nombre}<span style={{ color: 'red' }}>*</span>
                          </th>
                        ))}
                        <th>Total</th>
                      </>
                    ) : (
                      <>
                        <th>Sede<span style={{ color: 'red' }}>*</span></th>
                        <th>Cantidad</th>
                      </>
                    )}
                    <th>Receta</th>
                    <th>Insumos</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {productosSeleccionados.length === 0 ? (
                    <tr>
                      <td colSpan={procesoData.tipoProduccion === 'fabrica' ? (6 + sedes.length) : 7} 
                          style={{textAlign: 'center', padding: '20px', color: '#6b7280'}}>
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
                        
                        {procesoData.tipoProduccion === 'fabrica' ? (
                          <>
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
                          </>
                        ) : (
                          <>
                            <td>
                              <select 
                                value={item.sede || ''} 
                                onChange={(e) => cambiarSede(item.id, e.target.value)} 
                                className="form-input"
                                required
                              >
                                <option value="">Seleccione</option>
                                {sedes.map(sede => (
                                  <option key={sede.id || sede.idsede} value={sede.nombre}>
                                    {sede.nombre}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="quantity-cell">
                              <input 
                                type="number" 
                                min="1" 
                                value={item.cantidad} 
                                onChange={(e) => cambiarCantidad(item.id, e.target.value)} 
                                className="quantity-input"
                              />
                            </td>
                          </>
                        )}
                        
                        <td className="action-cell">
                          {item.receta ? (
                            <button 
                              type="button" 
                              className="btn-small" 
                              onClick={() => abrirModalRecetaDetalle(item)} 
                              style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' }}
                            >
                              Ver receta
                            </button>
                          ) : (
                            <span style={{ color: '#6b7280', fontSize: '12px' }}>Sin receta</span>
                          )}
                        </td>
                        <td className="action-cell">
                          <button 
                            type="button"
                            className="btn-small" 
                            onClick={() => verInsumosProducto(item)} 
                            style={{ background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)' }}
                          >
                            Ver insumos
                          </button>
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
              tipoProduccion={procesoData.tipoProduccion}
              sedes={sedes}
            />
          </Modal>
        )}

        {mostrarModalRecetaDetalle && recetaSeleccionada && (
          <Modal visible={mostrarModalRecetaDetalle} onClose={cerrarModalRecetaDetalle}>
            <ModalDetalleReceta 
              receta={recetaSeleccionada} 
              onClose={cerrarModalRecetaDetalle} 
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
