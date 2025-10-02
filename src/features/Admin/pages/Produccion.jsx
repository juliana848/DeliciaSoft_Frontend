// src/features/Admin/pages/Produccion.jsx
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import './Produccion/components/Css/Produccion.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';
import FormCrearProduccion from './Produccion/components/FormCrearProduccion';
import ModalVisualizarProduccion from './Produccion/components/ModalVisualizarProduccion';
import ModalEliminarProduccion from './Produccion/components/ModalEliminarProduccion';
import produccionApiService from '../services/produccion_services';
import { estadoProduccionMap, estadoPedidoMap } from './Produccion/utils/estadosMaps';
import { obtenerOpcionesEstadoProduccion, obtenerOpcionesEstadoPedido } from './Produccion/utils/transicionesEstado';

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
      const estados = {
        [campo === 'estadoProduccion' ? 'estadoproduccion' : 'estadopedido']: valor
      };
      await produccionApiService.actualizarEstado(procesoId, estados);
      setProcesos(prev => prev.map(p => (p.id === procesoId ? { ...p, [campo]: valor } : p)));
      showNotification('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error actualizando estado:', error);
      showNotification('Error al actualizar el estado', 'error');
    }
  };

  // ======================= ELIMINAR PROCESO =======================
  const eliminarProceso = async (proceso) => {
    try {
      if (proceso.id) await produccionApiService.eliminarProduccion(proceso.id);
      setProcesos(prev => prev.filter(p => p.id !== proceso.id));
      cerrarModal();
      showNotification('Proceso eliminado exitosamente');
    } catch (e) {
      console.error('Error eliminando proceso:', e);
      showNotification('Error al eliminar el proceso', 'error');
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

    return (
      <select
        value={estadoActual}
        onChange={(e) => actualizarEstadoProceso(rowData.id, campo, parseInt(e.target.value))}
        disabled={deshabilitar}
        style={{
          width: '180px',
          padding: '4px',
          fontSize: '14px',
          border: 'none',
          appearance: 'none',
          background: 'transparent',
          color: deshabilitar ? '#888' : '#000',
          cursor: deshabilitar ? 'not-allowed' : 'pointer'
        }}
      >
        {opciones.map((opcion) => (
          <option key={opcion.id} value={opcion.id}>
            {opcion.label}
          </option>
        ))}
      </select>
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
          <div className="admin-toolbar">
            <button
              className="admin-button pink"
              onClick={() => setMostrarAgregarProceso(true)}
              type="button"
            >
              + Agregar
            </button>
            <SearchBar placeholder="Buscar producción..." value={filtro} onChange={setFiltro} />
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
            <div className="admin-content-empty">🔄 Cargando Producciones...</div>
          ) : procesosFiltrados.length === 0 ? (
            <div className="admin-content-empty">No hay producciones de tipo "{pestanaActiva}" registradas</div>
          ) : (
            <>
              {pestanaActiva === 'pedido' ? (
                <DataTable value={procesosFiltrados} className="admin-table" paginator rows={10} rowsPerPageOptions={[5,10,25]}>
                  <Column header="N°" body={(rowData, { rowIndex }) => rowIndex + 1} />
                  <Column field="nombreProduccion" header="Producción" />
                  <Column field="fechaCreacion" header="Fecha Creación" />
                  <Column field="fechaEntrega" header="Fecha Entrega" />
                  <Column header="Estado Pedido" body={(rowData) => renderEstadoSelect(rowData, 'estadoPedido')} />
                  <Column field="numeroPedido" header="N° Pedido" />
                  <Column header="Acción" body={(rowData) => (
                    <>
                      <button className="admin-button gray" title="Visualizar" onClick={() => abrirModal('visualizar', rowData)}>👁</button>
                      <button className="admin-button red" title="Eliminar" onClick={() => abrirModal('eliminar', rowData)}>🗑️</button>
                    </>
                  )} />
                </DataTable>
              ) : (
                <DataTable value={procesosFiltrados} className="admin-table" paginator rows={10} rowsPerPageOptions={[5,10,25]}>
                  <Column header="N°" body={(rowData, { rowIndex }) => rowIndex + 1} />
                  <Column field="nombreProduccion" header="Producción" />
                  <Column field="fechaCreacion" header="Fecha Creación" />
                  <Column header="Estado Producción" body={(rowData) => renderEstadoSelect(rowData, 'estadoProduccion')} />
                  <Column header="Acción" body={(rowData) => (
                    <>
                      <button className="admin-button gray" title="Visualizar" onClick={() => abrirModal('visualizar', rowData)}>👁</button>
                      <button className="admin-button red" title="Eliminar" onClick={() => abrirModal('eliminar', rowData)}>🗑️</button>
                    </>
                  )} />
                </DataTable>
              )}
            </>
          )}

          {modalVisible && modalTipo === 'eliminar' && (
            <Modal visible={true} onClose={cerrarModal}>
              <ModalEliminarProduccion
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