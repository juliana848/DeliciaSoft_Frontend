// src/features/Admin/pages/Produccion.jsx
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import './Produccion/components/Css/Produccion.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';
import ModalAgregarProductos from './Produccion/components/ModalAgregarProductos';
import ModalDetalleReceta from './Produccion/components/ModalDetalleReceta';
import ModalInsumos from './Produccion/components/ModalInsumos';
import produccionApiService from '../services/produccion_services';

export default function Produccion() {
  const [filtro, setFiltro] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [mostrarAgregarProceso, setMostrarAgregarProceso] = useState(false);
  const [mostrarModalProductos, setMostrarModalProductos] = useState(false);
  const [mostrarDetalleInsumos, setMostrarDetalleInsumos] = useState(false);
  const [productoDetalleInsumos, setProductoDetalleInsumos] = useState(null);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [productoEditandoReceta, setProductoEditandoReceta] = useState(null);
  const [mostrarModalRecetaDetalle, setMostrarModalRecetaDetalle] = useState(false);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);
  const [procesos, setProcesos] = useState([]);
  const [pestanaActiva, setPestanaActiva] = useState('pedido');
  const [loading, setLoading] = useState(false);

  // ======================= MAPAS DE ESTADO ORGANIZADOS =======================
  const EstadoMap = {
    produccion: [
      { id: 1, label: 'Pendiente 🟡' },
      { id: 2, label: 'Empaquetando 🟠' },
      { id: 3, label: 'En producción 🔵' },
      { id: 4, label: 'Decorado 🟤' },
      { id: 5, label: 'Empaquetado 🟦' },
      { id: 6, label: 'Entregado 🟢' },
      { id: 99, label: 'N/A 🔴' }
    ],
    pedido: [
      { id: 1, label: 'Abonado 🟣' },
      { id: 2, label: 'Empaquetando 🟠' },
      { id: 3, label: 'En producción 🔵' },
      { id: 4, label: 'Decorado 🟤' },
      { id: 5, label: 'Empaquetado 🟦' },
      { id: 6, label: 'Entregado a ventas 🔵' },
      { id: 7, label: 'Entregado al cliente 🟢' },
      { id: 99, label: 'N/A 🔴' }
    ]
  };

  // Mapas directos (id → label)
  const estadoProduccionMap = Object.fromEntries(
    EstadoMap.produccion.map(estado => [estado.id, estado.label])
  );

  const estadoPedidoMap = Object.fromEntries(
    EstadoMap.pedido.map(estado => [estado.id, estado.label])
  );

  // Mapas inversos (label → id)
  const estadoProduccionInverse = Object.fromEntries(
    EstadoMap.produccion.map(estado => [estado.label, estado.id])
  );

  const estadoPedidoInverse = Object.fromEntries(
    EstadoMap.pedido.map(estado => [estado.label, estado.id])
  );

  // ======================= TRANSICIONES DE ESTADO =======================
  const transicionesProduccion = {
    1: [1, 2],     // Pendiente → Pendiente o Empaquetando
    2: [2, 3],     // Empaquetando → Empaquetando o En producción
    3: [3, 4],     // En producción → En producción o Decorado
    4: [4, 5],     // Decorado → Decorado o Empaquetado
    5: [5, 6],     // Empaquetado → Empaquetado o Entregado
    6: [6],        // Entregado → solo Entregado
    99: []         // N/A → sin transiciones
  };

  const transicionesPedido = {
    1: [1, 2],          // Abonado → Abonado o Empaquetando
    2: [1, 2, 3],       // Empaquetando → Abonado, Empaquetando o En producción
    3: [3, 4],          // En producción → En producción o Decorado
    4: [4, 5],          // Decorado → Decorado o Empaquetado
    5: [5, 6, 7],       // Empaquetado → Empaquetado, Entregado a ventas o Entregado al cliente
    6: [6],             // Entregado a ventas → solo Entregado a ventas
    7: [7],             // Entregado al cliente → solo Entregado al cliente
    99: []              // N/A → sin transiciones
  };

  const obtenerOpcionesEstadoProduccion = (estadoId) => {
    const siguientes = transicionesProduccion[estadoId] || [];
    return [...siguientes, 99].map((id) => ({
      id,
      label: estadoProduccionMap[id]
    }));
  };

  const obtenerOpcionesEstadoPedido = (estadoId) => {
    const siguientes = transicionesPedido[estadoId] || [];
    return [...siguientes, 99].map((id) => ({
      id,
      label: estadoPedidoMap[id]
    }));
  };

  // ======================= DATOS INICIALES =======================
  const [procesoData, setProcesoData] = useState({
    tipoProduccion: 'pedido',
    nombreProduccion: '',
    fechaCreacion: new Date().toISOString().split('T')[0],
    fechaEntrega: new Date().toISOString().split('T')[0],
    estadoProduccion: 2,    // Empaquetando
    estadoPedido: 1,        // Abonado
    numeroPedido: ''
  });

  // productosDisponibles — (mock / local data). Puedes reemplazar por llamada API si quieres.
  const [productosDisponibles] = useState([
    {
      id: 1,
      nombre: 'Mini Donas',
      imagen: 'https://www.gourmet.cl/wp-content/uploads/2014/06/donuts.jpg',
      insumos: [
        { cantidad: 2, unidad: 'kg', nombre: 'Harina' },
        { cantidad: 1, unidad: 'kg', nombre: 'Azúcar' },
        { cantidad: 6, unidad: 'unidades', nombre: 'Huevos' }
      ],
      receta: {
        id: 32,
        nombre: 'Mini Donas con Azúcar y Canela',
        pasos: ['Freír donas', 'Pasar por mezcla de azúcar y canela'],
        insumos: ['Harina', 'Canela', 'Azúcar', 'Levadura', 'Huevos'],
        imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeC4LnjzReB9EHRknBi99jxMEV1TCbh1IsCw&s'
      }
    },
    {
      id: 2,
      nombre: 'Fresas con Crema',
      imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLJpYaCsw9PrMPGeksePsJ11H1M3TICsywrg&s',
      insumos: [
        { cantidad: 5, unidad: 'g', nombre: 'Fresas' },
        { cantidad: 250, unidad: 'ml', nombre: 'Crema para batir' },
        { cantidad: 500, unidad: 'g', nombre: 'Azúcar glass' }
      ],
      receta: {
        id: 38,
        nombre: 'Fresas con Crema y Galleta',
        pasos: ['Colocar fresas en vaso', 'Agregar crema batida', 'Espolvorear galleta triturada'],
        insumos: ['Fresas', 'Crema de leche', 'Galleta María'],
        imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFzhVvkezQ69ngkBxtRgsySIVk_ovSiw6knQ&s'
      }
    },
    {
      id: 3,
      nombre: 'Pastel de Chocolate',
      imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRqBba-wH5E0DMJztvKWuifPz8CnGoLs0N1g&s',
      insumos: [
        { cantidad: 3, unidad: 'kg', nombre: 'Harina' },
        { cantidad: 1.5, unidad: 'kg', nombre: 'Chocolate' },
        { cantidad: 1, unidad: 'kg', nombre: 'Mantequilla' },
        { cantidad: 12, unidad: 'unidades', nombre: 'Huevos' }
      ],
      receta: {
        id: 36,
        nombre: 'Torta de Chocolate con Café',
        pasos: ['Preparar mezcla con café', 'Hornear', 'Cubrir con ganache'],
        insumos: ['Harina', 'Café fuerte', 'Cacao', 'Azúcar', 'Huevos'],
        imagen: 'https://media.elgourmet.com/recetas/cover/1bdd8a837944f3a10abc33eeb9a036f8_3_3_photo.png'
      }
    }
  ]);

  // ======================= EFECTOS Y CARGA DE DATOS =======================
  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await produccionApiService.obtenerProducciones();
        const mapped = Array.isArray(data)
          ? data.map((item) => ({
              id: item.idproduccion ?? item.id,
              tipoProduccion: item.TipoProduccion && item.TipoProduccion !== 'null'
              ? item.TipoProduccion
              : (item.tipoProduccion && item.tipoProduccion !== 'null'
                  ? item.tipoProduccion
                  : (item.numeropedido ? 'pedido' : 'fabrica')),

              nombreProduccion: item.numeropedido || item.nombreProduccion || `Producción #${item.idproduccion ?? item.id}`,
              fechaCreacion: item.fechapedido || item.fechaCreacion || (item.createdAt ? item.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
              fechaEntrega: item.fechaentrega || item.fechaEntrega || item.fechapedido || item.fechaCreacion || new Date().toISOString().split('T')[0],
              estadoProduccion: typeof item.estadoproduccion === 'number'
                ? item.estadoproduccion
                : estadoProduccionInverse[item.estadoproduccion] || 2, // default Empaquetando
              estadoPedido: typeof item.estadopedido === 'number'
                ? item.estadopedido
                : estadoPedidoInverse[item.estadopedido] || 1, // default Abonado
              numeroPedido: item.numeropedido || item.numeroPedido || '',
              productos: (item.detalleproduccion && Array.isArray(item.detalleproduccion)) ? item.detalleproduccion : []
            }))
          : [];
        setProcesos(mapped);
      } catch (e) {
        console.warn('Fallo obteniendo procesos, usando lista vacía:', e);
        setProcesos([]);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // ======================= FILTRADO =======================
  const procesosFiltrados = procesos.filter((p, i) => {
    if (p.tipoProduccion !== pestanaActiva) return false;
    const texto = filtro.toLowerCase();
    return (
      String(i + 1).includes(texto) ||
      (p.nombreProduccion && p.nombreProduccion.toLowerCase().includes(texto)) ||
      (p.fechaCreacion && p.fechaCreacion.toLowerCase().includes(texto)) ||
      (p.fechaEntrega && p.fechaEntrega.toLowerCase().includes(texto)) ||
      (p.numeroPedido && p.numeroPedido.toLowerCase().includes(texto)) ||
      (p.estadoPedido && estadoPedidoMap[p.estadoPedido]?.toLowerCase().includes(texto)) || 
      (p.estadoProduccion && estadoProduccionMap[p.estadoProduccion]?.toLowerCase().includes(texto)) 
    );
  });

  // ======================= FUNCIONES HELPER =======================
  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
    setTimeout(() => {
      setNotification((s) => ({ ...s, visible: false }));
    }, 4000);
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

  const abrirModalRecetaDetalle = (receta) => {
    setRecetaSeleccionada(receta);
    setMostrarModalRecetaDetalle(true);
  };

  const cerrarModalRecetaDetalle = () => {
    setMostrarModalRecetaDetalle(false);
    setRecetaSeleccionada(null);
  };

  // ======================= FUNCIONES DE ESTADO =======================
  const actualizarEstadoProceso = (procesoId, campo, valor) => {
    setProcesos(prev =>
      prev.map(p => (p.id === procesoId ? { ...p, [campo]: valor } : p))
    );
    showNotification('Estado actualizado correctamente');
    // Si quieres persistir en API, descomenta / añade llamada.
    // produccionApiService.actualizarEstado(procesoId, { [campo]: valor }).catch(e => console.error(e));
  };

  // ======================= FUNCIONES DE PRODUCTOS =======================
  const agregarProducto = (producto) => {
    setProductosSeleccionados(prev => {
      const existe = prev.find(p => p.id === producto.id);
      if (existe) {
        return prev.map(p => p.id === producto.id ? { ...p, cantidad: (p.cantidad || 1) + 1 } : p);
      } else {
        return [...prev, { 
          id: producto.id, 
          nombre: producto.nombre, 
          imagen: producto.imagen, 
          insumos: producto.insumos || [], 
          cantidad: 1, 
          sede: '', 
          receta: producto.receta || null 
        }];
      }
    });
  };

  const removeProducto = (id) => {
    setProductosSeleccionados(prev => prev.filter(item => item.id !== id));
    showNotification('Producto eliminado de la lista');
  };

  const cambiarSede = (id, nuevaSede) => {
    setProductosSeleccionados(prev => prev.map(p => p.id === id ? { ...p, sede: nuevaSede } : p));
  };

  const cambiarCantidad = (id, nuevaCantidad) => {
    if (!Number.isFinite(nuevaCantidad) || nuevaCantidad < 1) nuevaCantidad = 1;
    
    // Validación: no permitir cantidades que hagan que insumos totales > 25000
    const totales = {};
    const updated = productosSeleccionados.map(p => p.id === id ? { ...p, cantidad: nuevaCantidad } : p);
    updated.forEach(p => {
      (p.insumos || []).forEach(ins => {
        const total = (parseFloat(ins.cantidad) || 0) * (p.cantidad || 1);
        totales[ins.nombre] = (totales[ins.nombre] || 0) + total;
      });
    });
    const excede = Object.values(totales).some(v => v > 25000);
    if (excede) {
      showNotification('Límite de insumos superado (máx. 25000)', 'error');
      return;
    }
    setProductosSeleccionados(updated);
  };

  const verInsumosProducto = (producto) => {
    const base = productosDisponibles.find(p => p.id === producto.id) || producto;
    if (!base) return;
    const cantidad = producto.cantidad || 1;
    const insumosMultiplicados = (base.insumos || []).map(insumo => ({
      ...insumo,
      cantidad: (parseFloat(insumo.cantidad) || 0) * cantidad
    }));
    setProductoDetalleInsumos({ ...producto, imagen: base.imagen, insumos: insumosMultiplicados });
    setMostrarDetalleInsumos(true);
  };

  // ======================= MAPPERS API =======================
  const mapToApi = (proceso) => ({
    TipoProduccion: proceso.tipoProduccion,
    nombreproduccion: proceso.nombreProduccion,
    fechapedido: proceso.fechaCreacion,
    fechaentrega: proceso.fechaEntrega,
    estadoproduccion: proceso.estadoProduccion,
    estadopedido: proceso.estadoPedido,
    numeropedido: proceso.numeroPedido,
  });

  const mapFromApi = (data, fallback) => ({
    id: data?.idproduccion ?? data?.id ?? (fallback?.id ?? null),
    tipoProduccion: data?.TipoProduccion ?? fallback?.tipoProduccion ?? '',
    nombreProduccion: data?.nombreproduccion ?? fallback?.nombreProduccion ?? '',
    fechaCreacion: data?.fechapedido ?? fallback?.fechaCreacion ?? '',
    fechaEntrega: data?.fechaentrega ?? fallback?.fechaEntrega ?? '',
    estadoProduccion: data?.estadoproduccion ?? fallback?.estadoProduccion ?? '',
    estadoPedido: data?.estadopedido ?? fallback?.estadoPedido ?? '',
    numeroPedido: data?.numeropedido ?? fallback?.numeroPedido ?? '',
    productos: fallback?.productos ?? [],
  });

  // ======================= CRUD OPERATIONS =======================
  const guardarProceso = async () => {
    if (!procesoData.nombreProduccion || procesoData.nombreProduccion.trim() === '') {
      showNotification('El nombre de la producción es obligatorio', 'error');
      return;
    }

    if (procesoData.tipoProduccion === 'pedido') {
      if (!procesoData.fechaEntrega) {
        showNotification('La fecha de entrega es obligatoria', 'error');
        return;
      }
      const hoy = new Date();
      const entrega = new Date(procesoData.fechaEntrega);
      const diff = (entrega - hoy) / (1000 * 60 * 60 * 24);
      if (diff < 15 || diff > 30) {
        showNotification('La fecha debe estar entre 15 días y 1 mes desde hoy', 'error');
        return;
      }
    }

    // Payload con los nombres que espera tu backend
    const payload = {
      TipoProduccion: procesoData.tipoProduccion,
      nombreproduccion: procesoData.nombreProduccion,
      fechapedido: procesoData.fechaCreacion || new Date().toISOString().split('T')[0],
      fechaentrega: procesoData.tipoProduccion === 'pedido' ? procesoData.fechaEntrega : '',
      estadoproduccion: procesoData.estadoProduccion,
      estadopedido: procesoData.estadoPedido,
      numeropedido: procesoData.tipoProduccion === 'pedido'
        ? `P-${String(procesos.filter(p => p.tipoProduccion === 'pedido').length + 1).padStart(3, '0')}`
        : ''
    };

    console.log("📦 Enviando payload a la API:", payload);

    try {
      const creado = await produccionApiService.crearProduccion(payload);

      if (!creado || (!creado.idproduccion && !creado.id)) {
        throw new Error("La API devolvió respuesta inválida");
      }

      const nuevoLocal = {
        id: creado?.idproduccion ?? creado?.id,
        tipoProduccion: creado?.TipoProduccion ?? payload.TipoProduccion,
        nombreProduccion: creado?.nombreproduccion ?? payload.nombreproduccion,
        fechaCreacion: creado?.fechapedido ?? payload.fechapedido,
        fechaEntrega: creado?.fechaentrega ?? payload.fechaentrega,
        estadoProduccion: creado?.estadoproduccion ?? payload.estadoproduccion,
        estadoPedido: creado?.estadopedido ?? payload.estadopedido,
        numeroPedido: creado?.numeropedido ?? payload.numeropedido,
        productos: productosSeleccionados
      };

      setProcesos(prev => [nuevoLocal, ...prev]);
      showNotification('Proceso guardado correctamente', 'success');

      // Reset form
      setProcesoData({
        tipoProduccion: pestanaActiva,
        nombreProduccion: '',
        fechaCreacion: new Date().toISOString().split('T')[0],
        fechaEntrega: new Date().toISOString().split('T')[0],
        estadoProduccion: 2, // Empaquetando
        estadoPedido: 1,     // Abonado
        numeroPedido: ''
      });
      setProductosSeleccionados([]);
      setMostrarAgregarProceso(false);

    } catch (e) {
      console.error('❌ Error al crear producción en la API:', e);
      showNotification('Error al guardar en la API. Revisa backend o payload.', 'error');
    }
  };

  const eliminarProceso = async (proceso) => {
    try {
      if (proceso.id) {
        await produccionApiService.eliminarProduccion(proceso.id);
      }
    } catch (e) {
      console.warn('Error eliminando en API (se eliminará localmente):', e);
    } finally {
      setProcesos(prev => prev.filter(p => p.id !== proceso.id));
      cerrarModal();
      showNotification('Proceso eliminado exitosamente');
    }
  };

  // ======================= RENDER COMPONENTS =======================
  const renderEstadoSelect = (rowData, campo) => {
    const estadoActual = rowData[campo];
    const esProduccion = campo === 'estadoProduccion';
    
    // Determinar si está deshabilitado
    const estadosFinales = esProduccion 
      ? [6, 99]  // Entregado, N/A
      : [6, 7, 99]; // Entregado a ventas, Entregado al cliente, N/A
    
    const deshabilitar = estadosFinales.includes(estadoActual);
    
    // Obtener opciones disponibles
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

      {!mostrarAgregarProceso ? (
        <>
          <div className="admin-toolbar">
            <button 
              className="admin-button pink" 
              onClick={() => { setMostrarAgregarProceso(true); }} 
              type="button"
            >
              + Agregar
            </button>
            <SearchBar 
              placeholder="Buscar producción..." 
              value={filtro} 
              onChange={setFiltro} 
            />
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
          ) : (
            <>
              {pestanaActiva === 'pedido' ? (
                <DataTable 
                  value={procesosFiltrados} 
                  className="admin-table" 
                  paginator 
                  rows={10} 
                  rowsPerPageOptions={[5,10,25]}
                >
                  <Column header="N°" body={(rowData, { rowIndex }) => rowIndex + 1} />
                  <Column field="nombreProduccion" header="Producción" />
                  <Column field="fechaCreacion" header="Fecha Creación" />
                  <Column field="fechaEntrega" header="Fecha Entrega" />
                  <Column 
                    header="Estado Pedido" 
                    body={(rowData) => renderEstadoSelect(rowData, 'estadoPedido')} 
                  />
                  <Column field="numeroPedido" header="N° Pedido" />
                  <Column header="Acción" body={(rowData) => (
                    <>
                      <button 
                        className="admin-button gray" 
                        title="Visualizar" 
                        onClick={() => abrirModal('visualizar', rowData)}
                      >
                        🔍
                      </button>
                      <button 
                        className="admin-button red" 
                        title="Eliminar" 
                        onClick={() => abrirModal('eliminar', rowData)}
                      >
                        🗑️
                      </button>
                    </>
                  )} />
                </DataTable>
              ) : (
                <DataTable 
                  value={procesosFiltrados} 
                  className="admin-table" 
                  paginator 
                  rows={10} 
                  rowsPerPageOptions={[5,10,25]}
                >
                  <Column header="N°" body={(rowData, { rowIndex }) => rowIndex + 1} />
                  <Column field="nombreProduccion" header="Producción" />
                  <Column field="fechaCreacion" header="Fecha Creación" />
                  <Column 
                    header="Estado Producción" 
                    body={(rowData) => renderEstadoSelect(rowData, 'estadoProduccion')} 
                  />
                  <Column header="Acción" body={(rowData) => (
                    <>
                      <button 
                        className="admin-button gray" 
                        title="Visualizar" 
                        onClick={() => abrirModal('visualizar', rowData)}
                      >
                        🔍
                      </button>
                      <button 
                        className="admin-button red" 
                        title="Eliminar" 
                        onClick={() => abrirModal('eliminar', rowData)}
                      >
                        🗑️
                      </button>
                    </>
                  )} />
                </DataTable>
              )}
            </>
          )}

          {/* Modal de Visualización/Eliminación */}
          <Modal visible={modalVisible} onClose={cerrarModal}>
            {modalTipo === 'visualizar' && procesoSeleccionado && (
              <div>
                <h2 className="form-title">Detalle de Producción #{procesoSeleccionado.id}</h2>
                <div className="form-group">
                  <label className="form-label">Producción</label>
                  <input type="text" className="form-input" value={procesoSeleccionado.nombreProduccion} disabled />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Fecha Creación</label>
                    <input type="text" className="form-input" value={procesoSeleccionado.fechaCreacion} disabled />
                  </div>

                  {procesoSeleccionado.tipoProduccion === 'pedido' && (
                    <div className="form-group">
                      <label className="form-label">Fecha Entrega</label>
                      <input type="text" className="form-input" value={procesoSeleccionado.fechaEntrega || 'N/A'} disabled />
                    </div>
                  )}
                </div>

                <div className="form-row">
                  {pestanaActiva === 'fabrica' && (
                    <div className="form-group">
                      <label className="form-label">Estado Producción</label>
                      <input type="text" className="form-input" value={estadoProduccionMap[procesoSeleccionado.estadoProduccion] || 'N/A'} disabled />
                    </div>
                  )}
                  {pestanaActiva === 'pedido' && (
                    <div className="form-group">
                      <label className="form-label">Estado Pedido</label>
                      <input type="text" className="form-input" value={estadoPedidoMap[procesoSeleccionado.estadoPedido] || 'N/A'} disabled />
                    </div>
                  )}
                </div>

                {procesoSeleccionado.tipoProduccion === 'pedido' && (
                  <div className="form-group">
                    <label className="form-label">N° Pedido</label>
                    <input type="text" className="form-input" value={procesoSeleccionado.numeroPedido || 'N/A'} disabled />
                  </div>
                )}

                <h4>Productos:</h4>
                <div style={{ maxHeight: '150px', overflowY: 'auto', marginTop: '10px' }}>
                  <table className="productos-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Imagen</th>
                        <th>Nombre</th>
                        <th>Sede</th>
                        <th>Cantidad</th>
                        <th>Receta</th>
                        <th>Insumos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {procesoSeleccionado.productos?.map((item) => {
                        const productoCompleto = productosDisponibles.find(p => p.id === item.id) || item;
                        return (
                          <tr key={item.id}>
                            <td>
                              <img src={productoCompleto?.imagen || 'https://via.placeholder.com/50'} alt={item.nombre} width="50" height="50" style={{ objectFit: 'cover', borderRadius: '4px' }} />
                            </td>
                            <td>{item.nombre}</td>
                            <td>{item.sede || 'N/A'}</td>
                            <td>{item.cantidad}</td>
                            <td>
                              {item.receta ? (
                                <button className="btn-receta" onClick={() => abrirModalRecetaDetalle(item.receta)} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                                  📖 {item.receta.nombre}
                                </button>
                              ) : <span style={{ color: '#999' }}>Sin receta</span>}
                            </td>
                            <td>
                              <button className="btn-insumos" onClick={() => {
                                setProductoDetalleInsumos({
                                  ...item,
                                  insumos: item.insumos || productoCompleto?.insumos?.map(insumo => ({ ...insumo, cantidad: (parseFloat(insumo.cantidad) || 0) * (item.cantidad || 1) })) || [],
                                  imagen: item.imagen || productoCompleto?.imagen,
                                  cantidad: item.cantidad || 1
                                });
                                setMostrarDetalleInsumos(true);
                              }} style={{ background: '#2196F3', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                                📋 Ver insumos
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="modal-footer">
                  <button className="modal-btn save-btn" onClick={cerrarModal}>Regresar</button>
                </div>
              </div>
            )}

            {modalTipo === 'eliminar' && procesoSeleccionado && (
              <div>
                <h2>Eliminar producción</h2>
                <h3>¿Seguro que desea eliminar <strong>{procesoSeleccionado?.nombreProduccion}</strong>?</h3>
                <div className="modal-footer">
                  <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
                  <button className="modal-btn save-btn" onClick={() => eliminarProceso(procesoSeleccionado)}>Eliminar</button>
                </div>
              </div>
            )}
          </Modal>

          {/* Modal de Receta Detalle */}
          {mostrarModalRecetaDetalle && recetaSeleccionada && (
            <Modal visible={mostrarModalRecetaDetalle} onClose={cerrarModalRecetaDetalle}>
              <div className="receta-detalle-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <img src={recetaSeleccionada.imagen} alt={recetaSeleccionada.nombre} width="80" height="80" style={{ objectFit: 'cover', borderRadius: '8px' }} />
                  <div>
                    <h2 style={{ margin: '0 0 8px 0' }}>{recetaSeleccionada.nombre}</h2>
                    <p style={{ margin: '0', color: '#666' }}>{(recetaSeleccionada.insumos?.length || 0)} insumos • {(recetaSeleccionada.pasos?.length || 0)} pasos</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <h3>📋 Insumos necesarios:</h3>
                    <ul style={{ listStyle: 'none', padding: '0' }}>
                      {recetaSeleccionada.insumos?.map((insumo, index) => (
                        <li key={index} style={{ padding: '8px', marginBottom: '4px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>• {insumo}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3>👩‍🍳 Pasos de preparación:</h3>
                    <ol style={{ paddingLeft: '20px' }}>
                      {recetaSeleccionada.pasos?.map((paso, index) => (
                        <li key={index} style={{ padding: '8px 0', marginBottom: '8px', borderBottom: '1px solid #eee' }}>{paso}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="modal-footer" style={{ marginTop: '20px' }}>
                  <button className="modal-btn cancel-btn" onClick={cerrarModalRecetaDetalle}>Cerrar</button>
                </div>
              </div>
            </Modal>
          )}

          {/* Modal de Insumos */}
          {mostrarDetalleInsumos && productoDetalleInsumos && (
            <Modal visible={mostrarDetalleInsumos} onClose={() => setMostrarDetalleInsumos(false)}>
              <div className="insumos-modal-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <img src={productoDetalleInsumos.imagen} alt={productoDetalleInsumos.nombre} width="80" height="80" style={{ objectFit: 'cover', borderRadius: '8px' }} />
                  <div>
                    <h2 style={{ margin: '0 0 8px 0' }}>Insumos para: {productoDetalleInsumos.nombre}</h2>
                    <p style={{ margin: '0', color: '#666' }}>{(productoDetalleInsumos.insumos?.length || 0)} insumos necesarios</p>
                  </div>
                </div>

                <table className="insumos-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>Cantidad</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>Unidad</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>Insumo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productoDetalleInsumos.insumos?.map((insumo, index) => {
                      const cantidadBase = parseFloat(insumo.cantidad) || 0;
                      const cantidadMultiplicada = (cantidadBase * (productoDetalleInsumos.cantidad || 1)).toFixed(2);
                      return (
                        <tr key={index}>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{cantidadMultiplicada}</td>
                          <td>{insumo.unidad || 'N/A'}</td>
                          <td>{insumo.nombre || insumo}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="modal-footer" style={{ marginTop: '20px' }}>
                  <button className="modal-btn cancel-btn" onClick={() => setMostrarDetalleInsumos(false)}>Cerrar</button>
                </div>
              </div>
            </Modal>
          )}
        </>
      ) : (
        <div className="compra-form-container-produccion">
          <h1>Agregar Producción</h1>
          <form onSubmit={(e) => { e.preventDefault(); guardarProceso(); }}>
            <div className="compra-fields-grid">
              <div className="field-group">
                <label>Tipo de Producción<span style={{ color: 'red' }}>*</span></label>
                <select name="tipoProduccion" className="modal-input" value={procesoData.tipoProduccion} onChange={(e) => setProcesoData(prev => ({ ...prev, tipoProduccion: e.target.value }))} required>
                  <option value="pedido">Pedido</option>
                  <option value="fabrica">Fábrica</option>
                </select>
              </div>

              <div className="field-group">
                <label>Nombre de la Producción <span style={{ color: 'red' }}>*</span></label>
                <input type="text" list="opcionesProduccion" name="nombreProduccion" value={procesoData.nombreProduccion} onChange={(e) => setProcesoData(prev => ({ ...prev, nombreProduccion: e.target.value }))} className="modal-input" required />
                <datalist id="opcionesProduccion">
                  {[...Array(10)].map((_, i) => (<option key={i} value={`Producción #${i + 1}`} />))}
                  {procesos.map((p, i) => (<option key={`exist-${i}`} value={p.nombreProduccion} />))}
                </datalist>
              </div>

              <div className="field-group">
                <label>Fecha de creación</label>
                <input type="date" className="modal-input" value={procesoData.fechaCreacion} disabled />
              </div>

              {procesoData.tipoProduccion === 'pedido' && (
                <>
                  <div className="field-group">
                    <label>Fecha de Entrega<span style={{ color: 'red' }}>*</span></label>
                    <input type="date" name="fechaEntrega" className="modal-input" value={procesoData.fechaEntrega} onChange={(e) => setProcesoData(prev => ({ ...prev, fechaEntrega: e.target.value }))} required min={new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]} max={new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]} />
                  </div>
                  <div className="field-group">
                    <label>Número del pedido</label>
                    <input type="text" className="modal-input" value={`P-${String(procesos.filter(p => p.tipoProduccion === 'pedido').length + 1).padStart(3, '0')}`} disabled />
                  </div>
                </>
              )}
            </div>

            <button type="button" className="admin-button pink" onClick={() => setMostrarModalProductos(true)}>+ Agregar</button>

            {productosSeleccionados.length > 0 && (
              <div className="productos-seleccionados">
                <h3>Productos agregados:</h3>
                <table className="productos-table">
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Nombre</th>
                      <th>Sede<span style={{ color: 'red' }}>*</span></th>
                      <th>Cantidad</th>
                      <th>Receta</th>
                      <th>Insumos</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosSeleccionados.map(item => (
                      <tr key={item.id}>
                        <td><img src={item.imagen || 'https://via.placeholder.com/50'} alt={item.nombre} width="50" height="50" style={{ objectFit: 'cover', borderRadius: '4px' }} /></td>
                        <td>
                          <div>{item.nombre}</div>
                          {item.receta && (<small style={{ fontSize: '12px', color: '#666' }}>📘 {item.receta.nombre}</small>)}
                        </td>
                        <td>
                          <select value={item.sede || ''} onChange={(e) => cambiarSede(item.id, e.target.value)} required>
                            <option value="">Seleccione</option>
                            <option value="San Pablo">San Pablo</option>
                            <option value="San Benito">San Benito</option>
                          </select>
                        </td>
                        <td>
                          <input type="number" min="1" value={item.cantidad} onChange={(e) => cambiarCantidad(item.id, parseInt(e.target.value || 1, 10))} style={{ width: '60px' }} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {item.receta ? (
                              <button type="button" className="btn-insumos" onClick={() => abrirModalRecetaDetalle(item.receta)} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '3px 6px', fontSize: '15px', borderRadius: '3px', cursor: 'pointer' }}>📘 receta</button>
                            ) : (<span style={{ color: '#888', fontSize: '12px' }}>Sin receta</span>)}
                          </div>
                        </td>
                        <td>
                          <button className="btn-insumos" onClick={() => verInsumosProducto(item)} style={{ background: '#2196F3', color: 'white', border: 'none', padding: '4px 6px', fontSize: '15px', borderRadius: '4px', cursor: 'pointer' }}>📋 insumos</button>
                        </td>
                        <td>
                          <button type="button" className="btn-eliminar" onClick={() => removeProducto(item.id)} style={{ background: '#f44336', color: 'white', border: 'none', padding: '3px 6px', fontSize: '20px', borderRadius: '100%', cursor: 'pointer' }}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal-footer">
              <button type="button" className="modal-btn cancel-btn" onClick={() => setMostrarAgregarProceso(false)}>Cancelar</button>
              <button className="modal-btn save-btn" type="submit">Guardar</button>
            </div>
          </form>

          {mostrarModalProductos && (
            <Modal visible={mostrarModalProductos} onClose={() => setMostrarModalProductos(false)}>
              <ModalAgregarProductos
                productosDisponibles={productosDisponibles}
                productosSeleccionados={productosSeleccionados}
                setProductosSeleccionados={setProductosSeleccionados}
                onClose={() => setMostrarModalProductos(false)}
              />
            </Modal>
          )}

          {mostrarModalRecetaDetalle && recetaSeleccionada && (
            <Modal visible={mostrarModalRecetaDetalle} onClose={cerrarModalRecetaDetalle}>
              <ModalDetalleReceta receta={recetaSeleccionada} onClose={cerrarModalRecetaDetalle} />
            </Modal>
          )}

          {mostrarDetalleInsumos && productoDetalleInsumos && (
            <Modal visible={mostrarDetalleInsumos} onClose={() => setMostrarDetalleInsumos(false)}>
              <ModalInsumos producto={productoDetalleInsumos} onClose={() => setMostrarDetalleInsumos(false)} />
            </Modal>
          )}
        </div>
      )}
    </div>
  );
}
