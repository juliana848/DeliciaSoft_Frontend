// src/features/Admin/pages/Produccion.jsx
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import './Produccion/components/Css/Produccion.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';
import Tooltip from '../components/Tooltip';
import FormCrearProduccion from './Produccion/components/FormCrearProduccion';
import ModalVisualizarProduccion from './Produccion/components/ModalVisualizarProduccion';
import ModalEliminarProduccion from './Produccion/components/ModalEliminarProduccion';
import produccionApiService from '../services/produccion_services';
import { estadoProduccionMap, estadoPedidoMap } from './Produccion/utils/estadosMaps';
import { obtenerOpcionesEstadoProduccion, obtenerOpcionesEstadoPedido } from './Produccion/utils/transicionesEstado';
import LoadingSpinner from '../components/LoadingSpinner';
import { useOutletContext } from 'react-router-dom';

export default function Produccion() {
  const [filtro, setFiltro] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [mostrarAgregarProceso, setMostrarAgregarProceso] = useState(false);
  const [procesos, setProcesos] = useState([]);
  const [pestanaActiva, setPestanaActiva] = useState('pedido');
  const [loading, setLoading] = useState(false);
  const { actualizarProducciones } = useOutletContext() || {};

  // ======================= CARGA DE DATOS =======================
  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await produccionApiService.obtenerProducciones();
        // mapear datos al formato que esperas en la UI
        const mapped = Array.isArray(data)
          ? data.map((item) => {
              const tipo = (item.TipoProduccion || item.tipoProduccion || '').toLowerCase();
              const formatearFecha = (fecha) => {
                if (!fecha) return new Date().toISOString().split('T')[0];
                if (typeof fecha === 'string' && fecha.includes('T')) return fecha.split('T')[0];
                return fecha;
              };

              const productos = (item.detalleproduccion || []).map(detalle => ({
                id: detalle.id,
                nombre: detalle.nombre,
                cantidad: parseFloat(detalle.cantidad || 0),
                imagen: detalle.imagen,
                sede: detalle.sede || null,
                cantidadesPorSede: detalle.cantidadesPorSede || {},
                receta: detalle.receta || null,
                insumos: detalle.insumos || []
              }));

              return {
                id: item.idproduccion ?? item.id,
                tipoProduccion: tipo || 'fabrica',
                nombreProduccion: item.nombreproduccion || `Producción #${item.idproduccion}`,
                fechaCreacion: formatearFecha(item.fechapedido),
                fechaEntrega: formatearFecha(item.fechaentrega),
                estadoProduccion: item.estadoproduccion || 1,
                estadoPedido: item.estadopedido || 1,
                numeroPedido: item.numeropedido || '',
                productos
              };
            })
          : [];
        setProcesos(mapped);
      } catch (e) {
        console.error('Error obteniendo procesos:', e);
        setProcesos([]);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // ======================= FILTRADO =======================
  const procesosFiltrados = procesos.filter((p) => {
    if (p.tipoProduccion !== pestanaActiva) return false;
    const texto = filtro.toLowerCase();
    return (
      (p.nombreProduccion && p.nombreProduccion.toLowerCase().includes(texto)) ||
      (p.fechaCreacion && p.fechaCreacion.toLowerCase().includes(texto)) ||
      (p.fechaEntrega && p.fechaEntrega.toLowerCase().includes(texto)) ||
      (p.numeroPedido && p.numeroPedido.toLowerCase().includes(texto)) ||
      (p.estadoPedido && estadoPedidoMap[p.estadoPedido]?.toLowerCase().includes(texto)) ||
      (p.estadoProduccion && estadoProduccionMap[p.estadoProduccion]?.toLowerCase().includes(texto))
    );
  });

  // ======================= HELPERS =======================
  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
    setTimeout(() => setNotification((s) => ({ ...s, visible: false })), 4000);
  };
  const hideNotification = () => setNotification({ visible: false, mensaje: '', tipo: 'success' });

  const abrirModal = (tipo, proceso) => {
    setModalTipo(tipo);
    setProcesoSeleccionado(proceso);
    setModalVisible(true);
  };
  const cerrarModal = () => {
    setModalVisible(false);
    setProcesoSeleccionado(null);
    setModalTipo(null);
  };

  // ======================= ACTUALIZAR ESTADO =======================
  const actualizarEstadoProceso = async (procesoId, campo, valor) => {
    try {
      console.log(`🔄 Actualizando ${campo} a ${valor} para producción ${procesoId}`);
      
      // Construir el objeto con el nombre correcto del campo para el backend
      const estados = {};
      
      if (campo === 'estadoProduccion') {
        estados.estadoproduccion = valor; // Backend espera estadoproduccion en minúsculas
      } else if (campo === 'estadoPedido') {
        estados.estadopedido = valor; // Backend espera estadopedido en minúsculas
      }

      console.log('📤 Enviando estados:', estados);
      
      await produccionApiService.actualizarEstado(procesoId, estados);
      
      // Actualizar estado local
      setProcesos(prev => prev.map(p => 
        p.id === procesoId ? { ...p, [campo]: valor } : p
      ));
      
      showNotification('Estado actualizado correctamente');
    } catch (error) {
      console.error('❌ Error actualizando estado:', error);
      showNotification(`Error al actualizar el estado: ${error.message}`, 'error');
    }
  };

  // ======================= ELIMINAR PROCESO =======================
  const eliminarProceso = async (proceso) => {
    try {
      const id = proceso.idproduccion || proceso.id; // 🔥 soporte para ambas claves

      if (!id) {
        console.error("❌ No se encontró ID de producción en el proceso:", proceso);
        showNotification("Error: ID de producción no encontrado", "error");
        return;
      }

      console.log(`🚀 Intentando eliminar producción con ID: ${id}`);

      const resultado = await produccionApiService.eliminarProduccion(id);
      console.log("📦 Respuesta del service eliminarProduccion:", resultado);

      setProcesos((prev) => prev.filter((p) => p.idproduccion !== id && p.id !== id));
      console.log("✅ Producción removida del estado local");

      cerrarModal();
      showNotification("Producción eliminada exitosamente");
    } catch (e) {
      console.error("💥 Error al eliminar producción:", e);
      showNotification("Error al eliminar la producción", "error");
    }
  };

  // ======================= RENDER SELECT ESTADO =======================
  const renderEstadoSelect = (rowData, campo) => {
    const estadoActual = rowData[campo];
    const esProduccion = campo === 'estadoProduccion';
    const estadosFinales = esProduccion ? [6, 99] : [6, 7, 99];
    const deshabilitar = estadosFinales.includes(estadoActual);
    const opciones = esProduccion
      ? obtenerOpcionesEstadoProduccion(estadoActual)
      : obtenerOpcionesEstadoPedido(estadoActual);

    // Función para obtener el color según el estado - ROSA DEL BOTÓN AGREGAR
    const obtenerColorEstado = (idEstado) => {
      // Todos usan el mismo rosa del botón agregar (#E91E63)
      return { bg: '#E91E63', text: '#fff' };
    };

    const colorActual = obtenerColorEstado(estadoActual);

    return (
      <div style={{ position: 'relative', width: 'fit-content', display: 'inline-block' }}>
        <div style={{ position: 'relative' }}>
          <select
            value={estadoActual}
            onChange={(e) => actualizarEstadoProceso(rowData.id, campo, parseInt(e.target.value))}
            disabled={deshabilitar}
            className="estado-select-mejorado"
            style={{
              width: '180px',
              padding: '6px 28px 6px 10px',
              fontSize: '13px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '6px',
              appearance: 'none',
              backgroundColor: colorActual.bg,
              color: colorActual.text,
              cursor: deshabilitar ? 'not-allowed' : 'pointer',
              opacity: deshabilitar ? 0.6 : 1,
              boxShadow: deshabilitar 
                ? 'none' 
                : '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 -2px 0 rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              textAlign: 'left',
            }}
          >
            {opciones.map((opcion) => {
              const colorOpcion = obtenerColorEstado(opcion.id);
              return (
                <option 
                  key={opcion.id} 
                  value={opcion.id}
                  style={{
                    backgroundColor: colorOpcion.bg,
                    color: colorOpcion.text,
                    padding: '8px',
                  }}
                >
                  {opcion.label}
                </option>
              );
            })}
          </select>

          {/* Icono flecha dentro del mismo contenedor */}
          {!deshabilitar && (
            <div 
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: colorActual.text,
                fontSize: '12px',
                opacity: 0.9,
                fontWeight: 'bold',
              }}
            >
              ▼
            </div>
          )}
        </div>
      </div>
    );
  };

  // ======================= RENDER PRINCIPAL =======================
  return (
    <div className="admin-wrapper">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      {mostrarAgregarProceso ? (
        <FormCrearProduccion
          pestanaActiva={pestanaActiva}
          procesos={procesos}
          setProcesos={setProcesos}
          showNotification={showNotification}
          onCancelar={() => setMostrarAgregarProceso(false)}
        />
      ) : modalVisible && modalTipo === 'visualizar' ? (
        <ModalVisualizarProduccion
          proceso={procesoSeleccionado}
          pestanaActiva={pestanaActiva}
          onClose={cerrarModal}
        />
      ) : (
        <>
          {/* Toolbar: Buscador + Agregar a la derecha */}
          <div className="admin-toolbar">
            <SearchBar placeholder="Buscar producción..." value={filtro} onChange={setFiltro} />
            <button
              className="admin-button pink"
              onClick={() => setMostrarAgregarProceso(true)}
              type="button"
            >
              <i className="fas fa-plus"></i> Agregar
            </button>
          </div>

          <div className="ventas-header-container">
            <h2 className="admin-section-title">Gestión de producción</h2>
            <div className="filter-buttons-container" style={{ justifyContent: 'flex-end' }}>
              <button
                className={`filter-tab ${pestanaActiva === 'pedido' ? 'filter-tab-active' : ''}`}
                onClick={() => setPestanaActiva('pedido')}
              >
                Pedidos
              </button>
              <button
                className={`filter-tab ${pestanaActiva === 'fabrica' ? 'filter-tab-active' : ''}`}
                onClick={() => setPestanaActiva('fabrica')}
              >
                Fábrica
              </button>
            </div>
          </div>

          {loading ? (
            <div className="admin-loading-container">
              <LoadingSpinner />
            </div>
          ) : procesosFiltrados.length === 0 ? (
            <div className="admin-content-empty">No hay producciones de tipo "{pestanaActiva}" registradas</div>
          ) : (
            <>
              {pestanaActiva === 'pedido' ? (
                <DataTable
                  value={procesosFiltrados}
                  className="admin-table compact-paginator"
                  paginator
                  rows={5}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  tableStyle={{ minWidth: '50rem' }}
                >
                  <Column header="N°" body={(rowData, { rowIndex }) => rowIndex + 1} style={{ width: '50px' }} />
                  <Column field="nombreProduccion" header="Producción" />
                  <Column field="fechaCreacion" header="Fecha Creación" />
                  <Column field="fechaEntrega" header="Fecha Entrega" />
                  <Column header="Estado Pedido" body={(rowData) => renderEstadoSelect(rowData, 'estadoPedido')} />
                  <Column field="numeroPedido" header="N° Pedido" />
                  <Column 
                    header="Acciones" 
                    body={(rowData) => (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
                        <Tooltip text="Visualizar">
                          <button 
                            className="admin-button"
                            onClick={() => abrirModal('visualizar', rowData)}
                            style={{
                              background: '#e3f2fd',
                              color: '#1976d2',
                              border: 'none',
                              borderRadius: '6px',
                              width: '26px',
                              height: '26px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <i className="fas fa-eye" style={{ fontSize: '11px' }}></i>
                          </button>
                        </Tooltip>
                        <Tooltip text="Eliminar">
                          <button 
                            className="admin-button"
                            onClick={() => abrirModal('eliminar', rowData)}
                            style={{
                              background: '#ffebee',
                              color: '#d32f2f',
                              border: 'none',
                              borderRadius: '6px',
                              width: '26px',
                              height: '26px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <i className="fas fa-trash" style={{ fontSize: '11px' }}></i>
                          </button>
                        </Tooltip>
                      </div>
                    )}
                    style={{ width: '100px' }}
                  />
                </DataTable>
              ) : (
                <DataTable
                  value={procesosFiltrados}
                  className="admin-table compact-paginator"
                  paginator
                  rows={5}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  tableStyle={{ minWidth: '50rem' }}
                >
                  <Column header="N°" body={(rowData, { rowIndex }) => rowIndex + 1} style={{ width: '50px' }} />
                  <Column field="nombreProduccion" header="Producción" />
                  <Column field="fechaCreacion" header="Fecha Creación" />
                  <Column header="Estado Producción" body={(rowData) => renderEstadoSelect(rowData, 'estadoProduccion')} />
                  <Column 
                    header="Acciones" 
                    body={(rowData) => (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
                        <Tooltip text="Visualizar">
                          <button 
                            className="admin-button"
                            onClick={() => abrirModal('visualizar', rowData)}
                            style={{
                              background: '#e3f2fd',
                              color: '#1976d2',
                              border: 'none',
                              borderRadius: '6px',
                              width: '26px',
                              height: '26px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <i className="fas fa-eye" style={{ fontSize: '11px' }}></i>
                          </button>
                        </Tooltip>
                        <Tooltip text="Eliminar">
                          <button 
                            className="admin-button"
                            onClick={() => abrirModal('eliminar', rowData)}
                            style={{
                              background: '#ffebee',
                              color: '#d32f2f',
                              border: 'none',
                              borderRadius: '6px',
                              width: '26px',
                              height: '26px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <i className="fas fa-trash" style={{ fontSize: '11px' }}></i>
                          </button>
                        </Tooltip>
                      </div>
                    )}
                    style={{ width: '100px' }}
                  />
                </DataTable>
              )}
            </>
          )}
          {modalVisible && modalTipo === 'eliminar' && (
            <Modal visible={modalVisible} onClose={cerrarModal}>
              <ModalEliminarProduccion
                visible={modalVisible}
                proceso={procesoSeleccionado}
                onEliminar={eliminarProceso}
                onCancelar={cerrarModal}
              />
            </Modal>
          )}
        </>
      )}
    </div>
  );
}