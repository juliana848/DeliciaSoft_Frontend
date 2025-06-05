import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';
import AgregarProductosModal from '../components/catalogos/AgregarProductosModal';
import AgregarAdicionesModal from '../components/catalogos/AgregarAdicionesModal';
import AgregarSalsasModal from '../components/catalogos/AgregarSalsasModal';
import AgregarRellenosModal from '../components/catalogos/AgregarRellenosModal';

export default function Ventas() {
    const [ventas, setVentas] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTipo, setModalTipo] = useState(null);
    const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
    const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });

    const [mostrarModalAdiciones, setMostrarModalAdiciones] = useState(false);
    const [mostrarModalSalsas, setMostrarModalSalsas] = useState(false);
    const [mostrarModalRellenos, setMostrarModalRellenos] = useState(false);
    const [productoEditandoId, setProductoEditandoId] = useState(null);
    const [nestedDetailsVisible, setNestedDetailsVisible] = useState({});

    const [mostrarAgregarVenta, setMostrarAgregarVenta] = useState(false);
    const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);
    const [mostrarModalInsumos, setMostrarModalInsumos] = useState(false);
    const [ventaData, setVentaData] = useState({
        cod_venta: '00000000',
        tipo_venta: '', 
        cliente: '', 
        sede: '', 
        metodo_pago: '', 
        fecha_venta: '',
        fecha_registro: '', 
        observaciones: '' 
    });

    const [abonos, setAbonos] = useState([]);
    const [mostrarModalAbonos, setMostrarModalAbonos] = useState(false);
    const [mostrarModalAgregarAbono, setMostrarModalAgregarAbono] = useState(false);
    const [abonoData, setAbonoData] = useState({
    metodo_pago: '',
    total_pagado: '',
    fecha: ''
    });

    useEffect(() => {
        const mockVentas = [
            {
                id: 1,
                cliente: 'Laura Sánchez',
                sede: 'San Benito',
                metodo_pago: 'Efectivo',
                estado: 'Venta directa',
                fecha_venta: '01/06/2025',
                fecha_finalizacion: '01/06/2025',
                productos: [
                    { id: 101, nombre: 'Harina', cantidad: 5, precio: 20000, adiciones: [], salsas: [], sabores: [] },
                    { id: 102, nombre: 'Azúcar', cantidad: 3, precio: 15000, adiciones: [], salsas: [], sabores: [] },
                    { id: 103, nombre: 'Huevos', cantidad: 2, precio: 10000, adiciones: [], salsas: [], sabores: [] },
                ],
                subtotal: 100000,
                iva: 19000,
                total: 119000
            },
            {
                id: 2,
                cliente: 'Carlos Gómez',
                sede: 'San Pablo',
                metodo_pago: 'Transferencia',
                estado: 'En proceso',
                fecha_venta: '02/06/2025',
                fecha_finalizacion: '',
                productos: [
                    { id: 201, nombre: 'Chocolate', cantidad: 10, precio: 8000, adiciones: [], salsas: [], sabores: [] },
                    { id: 202, nombre: 'Mantequilla', cantidad: 4, precio: 3000, adiciones: [], salsas: [], sabores: [] },
                ],
                subtotal: 80000,
                iva: 15200,
                total: 95200
            },
            {
                id: 3,
                cliente: 'Dis.Martinez',
                sede: 'San Benito',
                metodo_pago: 'Efectivo',
                estado: 'Por pagar',
                fecha_venta: '03/06/2025',
                fecha_finalizacion: '',
                productos: [
                    { id: 301, nombre: 'Utensilios', cantidad: 1, precio: 50000, adiciones: [], salsas: [], sabores: [] },
                    { id: 302, nombre: 'Envases', cantidad: 20, precio: 3500, adiciones: [], salsas: [], sabores: [] },
                ],
                subtotal: 120000,
                iva: 22800,
                total: 142800
            },
            {
                id: 4,
                cliente: 'Panadería El Trigo',
                sede: 'San Pablo',
                metodo_pago: 'Transferencia',
                estado: 'Terminado',
                fecha_venta: '04/06/2025',
                fecha_finalizacion: '05/06/2025',
                productos: [
                    { id: 401, nombre: 'Harina integral', cantidad: 8, precio: 10000, adiciones: [], salsas: [], sabores: [] },
                    { id: 402, nombre: 'Levadura', cantidad: 15, precio: 1000, adiciones: [], salsas: [], sabores: [] },
                ],
                subtotal: 95000,
                iva: 18050,
                total: 113050
            },
            {
                id: 5,
                cliente: 'Dulces Delicias',
                sede: 'San Benito',
                metodo_pago: 'Efectivo',
                estado: 'Por entregar',
                fecha_venta: '05/06/2025',
                fecha_finalizacion: '',
                productos: [
                    { id: 501, nombre: 'Colorantes', cantidad: 5, precio: 5000, adiciones: [], salsas: [], sabores: [] },
                    { id: 502, nombre: 'Decoraciones', cantidad: 10, precio: 3500, adiciones: [], salsas: [], sabores: [] },
                ],
                subtotal: 60000,
                iva: 11400,
                total: 71400
            }
        ];
        setVentas(mockVentas);
    }, []);

const validarFormulario = () => {
  const errores = {};
  
  if (!ventaData.cliente || ventaData.cliente.trim() === '') {
    errores.cliente = 'Debe seleccionar un cliente';
  }
  
  if (!ventaData.sede || ventaData.sede.trim() === '') {
    errores.sede = 'Debe seleccionar una sede';
  }
  
  if (!ventaData.metodo_pago || ventaData.metodo_pago.trim() === '') {
    errores.metodo_pago = 'Debe seleccionar un método de pago';
  }
  
  if (!ventaData.fecha_venta || ventaData.fecha_venta.trim() === '') {
    errores.fecha_venta = 'Debe seleccionar una fecha de venta';
  }
  
  return errores;
};

const validarProductos = () => {
  const errores = {};
  
  if (insumosSeleccionados.length === 0) {
    errores.productos = 'Debe agregar al menos un producto';
    return errores;
  }
  
  insumosSeleccionados.forEach((producto, index) => {
    if (producto.cantidad <= 0) {
      errores[`cantidad_${producto.id}`] = `La cantidad debe ser mayor a 0`;
    }
    
    if (producto.precio <= 0) {
      errores[`precio_${producto.id}`] = `El precio debe ser mayor a 0`;
    }
    
    if (producto.adiciones.length > 5) {
      errores[`adiciones_${producto.id}`] = 'Máximo 5 adiciones por producto';
    }
    
    if (producto.salsas.length > 3) {
      errores[`salsas_${producto.id}`] = 'Máximo 3 salsas por producto';
    }
    
    if (producto.sabores.length > 2) {
      errores[`rellenos_${producto.id}`] = 'Máximo 2 rellenos por producto';
    }
  });
  
  return errores;
};

const validarAbono = () => {
  const errores = {};
  
  if (!abonoData.metodo_pago || abonoData.metodo_pago.trim() === '') {
    errores.metodo_pago = 'Debe seleccionar un método de pago';
  }
  
  if (!abonoData.total_pagado || parseFloat(abonoData.total_pagado) <= 0) {
    errores.total_pagado = 'El monto debe ser mayor a 0';
  }
  
  if (!abonoData.fecha || abonoData.fecha.trim() === '') {
    errores.fecha = 'Debe seleccionar una fecha';
  }
  
  return errores;
};

    const agregarAbono = () => {
  const totalPagado = parseFloat(abonoData.total_pagado);
  const ventaTotal = ventaSeleccionada.total;
  const faltaPorPagar = ventaTotal - totalPagado;
  
  const nuevoAbono = {
    id: Date.now(),
    fecha: abonoData.fecha,
    metodo_pago: abonoData.metodo_pago,
    monto: totalPagado,
    falta_por_pagar: faltaPorPagar
  };

  setAbonos(prev => [...prev, nuevoAbono]);
  setAbonoData({
    metodo_pago: '',
    total_pagado: '',
    fecha: ''
  });
  setMostrarModalAgregarAbono(false);
  showNotification('Abono registrado exitosamente');
};
    const toggleNestedDetails = (productoId) => {
        setNestedDetailsVisible(prev => ({
            ...prev,
            [productoId]: !prev[productoId] 
        }));
    };


    const showNotification = (mensaje, tipo = 'success') => {
        setNotification({ visible: true, mensaje, tipo });
    };

    const hideNotification = () => {
        setNotification({ visible: false, mensaje: '', tipo: 'success' });
    };

    const abrirModal = (tipo, venta) => {
        setModalTipo(tipo);
        setVentaSeleccionada(venta);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setVentaSeleccionada(null);
        setModalTipo(null);
    };
const anularVenta = () => {
  setVentas(prev => 
    prev.map(v => 
      v.id === ventaSeleccionada.id 
        ? { ...v, estado: 'Anulado', fecha_finalizacion: new Date().toLocaleDateString() }
        : v
    )
  );
  cerrarModal();
  showNotification('Venta anulada exitosamente');
};
    const exportarPDF = (venta) => {
        showNotification(`Venta ${venta.cod_venta || venta.id} exportada como PDF exitosamente`);
    };

    const ventasFiltradas = ventas.filter(v =>
        (v.cliente || '').toLowerCase().includes(filtro.toLowerCase())
    );

    const handleChange = (e) => {
        setVentaData({...ventaData, [e.target.name]: e.target.value});
    };

    const agregarInsumos = (nuevosInsumos) => {
        setInsumosSeleccionados(prev => [
            ...prev,
            ...nuevosInsumos
                .filter(nuevo => !prev.some(i => i.id === nuevo.id))
                .map(item => ({ ...item, cantidad: 1, adiciones: [], salsas: [], sabores: [] })) // Inicializar arrays vacíos
        ]);
        showNotification('Productos agregados exitosamente');
    };

    const agregarAdiciones = (nuevasAdiciones) => {
        setInsumosSeleccionados(prev =>
            prev.map(item =>
                item.id === productoEditandoId
                    ? {
                          ...item,
                          adiciones: [
                              ...item.adiciones,
                              ...nuevasAdiciones.filter(nuevo => !item.adiciones.some(a => a.id === nuevo.id))
                          ]
                      }
                    : item
            )
        );
        showNotification('Adiciones agregadas exitosamente');
        setMostrarModalAdiciones(false);
        setProductoEditandoId(null);
    };

    const agregarSalsas = (nuevasSalsas) => {
        setInsumosSeleccionados(prev =>
            prev.map(item =>
                item.id === productoEditandoId
                    ? {
                          ...item,
                          salsas: [
                              ...item.salsas,
                              ...nuevasSalsas.filter(nuevo => !item.salsas.some(s => s.id === nuevo.id))
                          ]
                      }
                    : item
            )
        );
        showNotification('Salsas agregadas exitosamente');
        setMostrarModalSalsas(false);
        setProductoEditandoId(null);
    };

    const agregarRellenos = (nuevosRellenos) => {
        setInsumosSeleccionados(prev =>
            prev.map(item =>
                item.id === productoEditandoId
                    ? {
                          ...item,
                          sabores: [ // Usamos 'sabores' para rellenos según el ejemplo
                              ...item.sabores,
                              ...nuevosRellenos.filter(nuevo => !item.sabores.some(r => r.id === nuevo.id))
                          ]
                      }
                    : item
            )
        );
        showNotification('Rellenos agregados exitosamente');
        setMostrarModalRellenos(false);
        setProductoEditandoId(null);
    };

    // Funciones para remover adiciones, salsas o rellenos de un producto específico
    const removeAdicion = (productoId, adicionId) => {
        setInsumosSeleccionados(prev =>
            prev.map(item =>
                item.id === productoId
                    ? { ...item, adiciones: item.adiciones.filter(a => a.id !== adicionId) }
                    : item
            )
        );
        showNotification('Adición eliminada');
    };

    const removeSalsa = (productoId, salsaId) => {
        setInsumosSeleccionados(prev =>
            prev.map(item =>
                item.id === productoId
                    ? { ...item, salsas: item.salsas.filter(s => s.id !== salsaId) }
                    : item
            )
        );
        showNotification('Salsa eliminada');
    };

    const removeRelleno = (productoId, rellenoId) => {
        setInsumosSeleccionados(prev =>
            prev.map(item =>
                item.id === productoId
                    ? { ...item, sabores: item.sabores.filter(r => r.id !== rellenoId) }
                    : item
            )
        );
        showNotification('Relleno eliminado');
    };

    // Función para abrir el modal de adiciones/salsas/rellenos para un producto específico
    const abrirModalAdiciones = (productoId) => {
        setProductoEditandoId(productoId);
        setMostrarModalAdiciones(true);
    };

     const abrirModalSalsas = (productoId) => {
        setProductoEditandoId(productoId);
        setMostrarModalSalsas(true);
    };

     const abrirModalRellenos = (productoId) => {
        setProductoEditandoId(productoId);
        setMostrarModalRellenos(true);
    };



    const handleCantidadChange = (id, value) => {
        setInsumosSeleccionados(prev => 
            prev.map(item => 
                item.id === id ? {...item, cantidad: Math.max(1, value)} : item
            )
        );
    };

    const removeInsumo = (id) => {
        setInsumosSeleccionados(prev => prev.filter(item => item.id !== id));
        showNotification('Insumo eliminado de la lista');
    };

 
    // Calcular el subtotal incluyendo productos, rellenos y adiciones (cobrando desde la tercera)
    const subtotal = insumosSeleccionados.reduce((sum, item) => {
        // Calcular el costo de las adiciones, cobrando solo a partir de la tercera
        const adicionesCost = item.adiciones.slice(2).reduce((acc, ad) => acc + (ad.precio * (ad.cantidad || 1)), 0);

        // Calcular el costo de los rellenos
        const rellenosCost = item.sabores.reduce((acc, re) => acc + (re.precio * (re.cantidad || 1)), 0);

        // El costo de las salsas es 0 según el requisito

        const itemTotal = (item.precio * item.cantidad) +
                          adicionesCost + // Sumar el costo calculado de las adiciones (desde la 3ra)
                          rellenosCost; // Sumar el costo de los rellenos

        return sum + itemTotal;
    }, 0);

    const iva = subtotal * 0.16;
    const total = subtotal + iva;


    const manejarCambioEstado = (venta, nuevoEstado) => {
        setVentas(prev =>
            prev.map(v =>
                v.id === venta.id ? { ...v, estado: nuevoEstado } : v
            )
        );
        showNotification(`Estado actualizado a "${nuevoEstado}"`);
    };

        // *** Función guardarVenta añadida ***
    const guardarVenta = () => {
        // Aquí puedes añadir validaciones si son necesarias antes de "guardar"
        if (insumosSeleccionados.length === 0) {
            showNotification('Debe agregar al menos un producto al detalle de la venta.', 'error');
            return;
        }

        // Simular guardar la venta (añadirla a la lista existente)
        const nuevaVenta = {
            id: ventas.length + 1, // Generar un ID simple (ajustar según tu lógica real)
            ...ventaData,
            productos: insumosSeleccionados.map(item => ({ // Guardar el detalle completo de productos, adiciones, etc.
                id: item.id,
                nombre: item.nombre,
                cantidad: item.cantidad,
                precio: item.precio,
                adiciones: item.adiciones,
                salsas: item.salsas,
                sabores: item.sabores,
            })),
            subtotal: subtotal,
            iva: iva,
            total: total,
            estado: ventaData.tipo_venta === 'venta directa' ? 'Venta directa' : 'Pendiente', // Establecer estado inicial basado en tipo
            fecha_finalizacion: ventaData.tipo_venta === 'venta directa' ? new Date().toLocaleDateString() : '' // Finalizar si es venta directa
        };

        setVentas(prev => [...prev, nuevaVenta]);

        // Mostrar notificación de éxito
        showNotification('Venta guardada correctamente', 'success');

        // Resetear el formulario y volver a la vista de lista
        setVentaData({
            cod_venta: '00000000',
            tipo_venta: '',
            cliente: '',
            sede: '',
            metodo_pago: '',
            fecha_venta: '',
            fecha_registro: '',
            observaciones: ''
        });
        setInsumosSeleccionados([]);
        setNestedDetailsVisible({}); // Resetear visibilidad de detalles anidados
        setMostrarAgregarVenta(false);
    };
    // *** Fin de la función guardarVenta ***


    return (
        <div className="admin-wrapper">
            <Notification
                visible={notification.visible}
                mensaje={notification.mensaje}
                tipo={notification.tipo}
                onClose={hideNotification}
            />

            {!mostrarAgregarVenta ? (
                <>
                    <div className="admin-toolbar">
                        <button 
                            className="admin-button pink" 
                            onClick={() => setMostrarAgregarVenta(true)}
                            type="button"
                        >
                            + Agregar Venta
                        </button>
                        <SearchBar 
                            placeholder="Buscar cliente..." 
                            value={filtro} 
                            onChange={setFiltro} 
                        />
                    </div>

                        <DataTable
                        value={ventasFiltradas}
                        className="admin-table"
                        paginator rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        >
                        <Column field="cliente" header="Cliente" />
                        <Column field="sede" header="Sede" />
                        <Column field="fecha_venta" header="Fecha" />
                        <Column field="total" header="Total" />
                            <Column
                                header="Estado"
                                body={(rowData) => (
                                <select
                                    value={rowData.estado}
                                    onChange={(e) => manejarCambioEstado(rowData, e.target.value)}
                                    className="admin-select"
                                    disabled={rowData.estado === 'Anulado' || rowData.estado === 'Venta directa'}
                                >
                                        <option value="Venta directa">Venta directa</option>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="En proceso">En proceso</option>
                                        <option value="Entregado">Entregado</option>
                                        <option value="Por entregar">Por entregar</option>
                                        <option value="Iniciado">Iniciado</option>
                                        <option value="Terminado">Terminado</option>
                                        <option value="Por pagar">Por pagar</option>
                                        <option value="Anulado">Anulado</option>
                                    </select>
                                )}
                            />
                        <Column
                            header="Acción"
                            body={(rowData) => (
                                <>
                                    <button
                                        className="admin-button gray"
                                        title="Ver Detalle"
                                        onClick={() => abrirModal('ver', rowData)}
                                    >👁️</button>
                                    <button
                                        className="admin-button red"
                                        title="Anular"
                                        onClick={() => abrirModal('anular', rowData)}
                                    >🛑</button>
                                    <button
                                        className="admin-button blue"
                                        title="Exportar PDF"
                                        onClick={() => exportarPDF(rowData)}
                                    >⬇️</button>
                                     <button
                                        className="admin-button green"
                                        title="Abonos"
                                        onClick={() => {
                                        setVentaSeleccionada(rowData);
                                        setMostrarModalAbonos(true);
                                        }}
                                    >
                                        💰
                                    </button>
                                </>
                            )}
                        />
                    </DataTable>

                    <Modal visible={modalVisible} onClose={cerrarModal}>
                        {modalTipo === 'ver' && ventaSeleccionada && (
                            <div>
                                <h3>Detalle Venta #{ventaSeleccionada.id}</h3>
                                <p><strong>Cliente:</strong> {ventaSeleccionada.cliente}</p>
                                <p><strong>Sede:</strong> {ventaSeleccionada.sede}</p>
                                <p><strong>Método de Pago:</strong> {ventaSeleccionada.metodo_pago}</p>
                                <p><strong>Estado:</strong> {ventaSeleccionada.estado}</p>

                                <h4>Productos:</h4>
                                <ul>
                                    {ventaSeleccionada.productos.map((item, index) => (
                                        <li key={index}>
                                            {item.nombre} (Cantidad: {item.cantidad}) - ${item.precio.toLocaleString()} c/u
                                            {item.adiciones && item.adiciones.length > 0 && (
                                                <ul>
                                                    <strong>Adiciones:</strong>
                                                    {item.adiciones.map((ad, adIndex) => (
                                                        <li key={adIndex}>{ad.nombre} (${ad.precio.toLocaleString()})</li>
                                                    ))}
                                                </ul>
                                            )}
                                            {item.salsas && item.salsas.length > 0 && (
                                                <ul>
                                                    <strong>Salsas:</strong>
                                                    {item.salsas.map((sa, saIndex) => (
                                                        <li key={saIndex}>{sa.nombre} (${sa.precio.toLocaleString()})</li>
                                                    ))}
                                                </ul>
                                            )}
                                            {item.sabores && item.sabores.length > 0 && (
                                                <ul>
                                                    <strong>Rellenos:</strong>
                                                    {item.sabores.map((re, reIndex) => (
                                                        <li key={reIndex}>{re.nombre} (${re.precio.toLocaleString()})</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                <p><strong>Subtotal:</strong> ${ventaSeleccionada.subtotal.toLocaleString()}</p>
                                <p><strong>IVA:</strong> ${ventaSeleccionada.iva.toLocaleString()}</p>
                                <p><strong>Total:</strong> ${ventaSeleccionada.total.toLocaleString()}</p>
                            </div>
                        )}
                        {modalTipo === 'anular' && (
                            <div>
                                <h3>¿Desea anular la venta #{ventaSeleccionada?.id}?</h3>
                                <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
                                <button className="modal-btn save-btn" onClick={anularVenta}>Anular</button>
                            </div>
                        )}
                    </Modal>
                    {mostrarModalAbonos && (
  <Modal
    visible={mostrarModalAbonos}
    onClose={() => setMostrarModalAbonos(false)}
  >
    <div className="abonos-modal">
      <h3>Abonos de la Venta #{ventaSeleccionada?.id}</h3>
      <div className="abonos-lista">
        {abonos.length > 0 ? (
          <table className="abonos-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Método de Pago</th>
                <th>Monto</th>
                <th>Falta por Pagar</th>
              </tr>
            </thead>
            <tbody>
              {abonos.map(abono => (
                <tr key={abono.id}>
                  <td>{abono.fecha}</td>
                  <td>{abono.metodo_pago}</td>
                  <td>${abono.monto.toLocaleString()}</td>
                  <td>${abono.falta_por_pagar.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay abonos registrados</p>
        )}
      </div>
      <button
        className="btn-agregar-abono"
        onClick={() => setMostrarModalAgregarAbono(true)}
      >
        + Agregar Abono
      </button>
    </div>
  </Modal>
)}

{mostrarModalAgregarAbono && (
  <Modal
    visible={mostrarModalAgregarAbono}
    onClose={() => setMostrarModalAgregarAbono(false)}
  >
    <div className="agregar-abono-modal">
      <h3>Agregar Abono</h3>
      <form onSubmit={(e) => {
        e.preventDefault();
        agregarAbono();
      }}>
        <div className="form-group">
          <label>Método de Pago:</label>
          <select
            name="metodo_pago"
            value={abonoData.metodo_pago}
            onChange={(e) => setAbonoData({...abonoData, metodo_pago: e.target.value})}
            required
          >
            <option value="">Seleccione</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>
        <div className="form-group">
          <label>Total Pagado:</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={abonoData.total_pagado}
            onChange={(e) => setAbonoData({...abonoData, total_pagado: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Fecha:</label>
          <input
            type="date"
            value={abonoData.fecha}
            onChange={(e) => setAbonoData({...abonoData, fecha: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Falta por Pagar:</label>
          <input
            type="number"
            readOnly
            value={ventaSeleccionada.total - (parseFloat(abonoData.total_pagado) || 0)}
          />
        </div>
        <div className="modal-buttons">
          <button type="button" className="btn-cancelar" onClick={() => setMostrarModalAgregarAbono(false)}>
            Cancelar
          </button>
          <button type="submit" className="btn-guardar">
            Guardar Abono
          </button>
        </div>
      </form>
    </div>
  </Modal>
)}
                </>
            ) : (
                
                          // Formulario para agregar venta
              <div className="compra-form-container" >
                <h1>Agregar Venta</h1>

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    guardarVenta();
                  }}
                >
                  <div className="compra-fields-grid">
                    <div className="field-group">
                      <label>Tipo de Venta</label>
                      <select
                        name="tipo_venta"
                        value={ventaData.tipo_venta}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione</option>
                        <option value="venta directa">Venta Directa</option>
                        <option value="pedido">Pedido</option>
                      </select>
                    </div>
                    <div className="field-group">
                      <label>Fecha de Venta</label>
                      <input
                        type="date"
                        name="fecha_venta"
                        value={ventaData.fecha_venta}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label>Sede</label>
                      <select
                        name="sede"
                        value={ventaData.sede}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione</option>
                        <option value="San Pablo">San Pablo</option>
                        <option value="San Benito">San Benito</option>
                      </select>
                    </div>
                    <div className="field-group">
                      <label>Cliente</label>
                      <select
                        name="cliente"
                        value={ventaData.cliente}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione</option>
                        <option value="Cliente Genérico">Cliente Genérico</option>
                        <option value="Carlos Pérez">Carlos Pérez</option>
                        <option value="Ana Gómez">Ana Gómez</option>
                        <option value="Luis Torres">Luis Torres</option>
                        <option value="María Sánchez">María Sánchez</option>
                        <option value="Juan Rodríguez">Juan Rodríguez</option>
                      </select>
                    </div>
                    <div className="field-group">
                      <label>Método de Pago</label>
                      <select
                        name="metodo_pago"
                        value={ventaData.metodo_pago}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                      </select>
                    </div>
                  </div>
                  <div className="section-divider"></div>
                  <div className="detalle-section">
                    <h2>Detalle:</h2>
                    {insumosSeleccionados.length > 0 && (
                      <table className="compra-detalle-table">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Cantidad</th>
                            <th>Precio Unitario</th> 
                            <th>Adiciones</th> 
                            <th>Salsas</th>
                            <th>Rellenos</th> 
                           <th>Subtotal Item</th> 
                            <th>Acciones</th> 
                          </tr>
                        </thead>

                                                <tbody>
                          {insumosSeleccionados.map(item => (
                            <React.Fragment key={item.id}>
                              {/* Fila Principal del Producto */}
                              <tr>
                                <td>
                                    {item.nombre}
                                    {/* Botón para alternar visibilidad de detalles anidados */}
                                    <button
                                        type="button"
                                        className="btn-small toggle-details-btn" // Añadida clase específica para estilos CSS
                                        onClick={() => toggleNestedDetails(item.id)}
                                        title={nestedDetailsVisible[item.id] ? 'Ocultar detalles' : 'Mostrar detalles'}
                                        // Puedes mover estos estilos inline a tu archivo CSS si prefieres
                                        style={{ marginLeft: '10px', padding: '2px 6px', fontSize: '10px' }}
                                    >
                                        {nestedDetailsVisible[item.id] ? '▲' : '▼'} {/* Icono simple */}
                                    </button>
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.cantidad || 1}
                                    onChange={e =>
                                      handleCantidadChange(item.id, parseInt(e.target.value) || 1)
                                    }
                                  />
                                </td>
                                <td>${item.precio.toLocaleString()}</td> {/* Precio Unitario */}
                                {/* Celdas para los botones de Agregar Adiciones, Salsas, Rellenos */}
                                <td>
                                    <button type="button" className="btn-small" onClick={() => abrirModalAdiciones(item.id)}>+ Adición</button>
                                </td>
                                <td>
                                     <button type="button" className="btn-small" onClick={() => abrirModalSalsas(item.id)}>+ Salsa</button>
                                </td>
                                <td>
                                     <button type="button" className="btn-small" onClick={() => abrirModalRellenos(item.id)}>+ Relleno</button>
                                </td>
                                {/* Celda para el Subtotal del Ítem */}
                                <td>
                                    ${((item.precio * item.cantidad) +
                                       item.adiciones.slice(2).reduce((acc, ad) => acc + (ad.precio * (ad.cantidad || 1)), 0) + // Adiciones cobradas desde la 3ra
                                       item.sabores.reduce((acc, re) => acc + (re.precio * (re.cantidad || 1)), 0) // Rellenos incluidos
                                       // Salsas no se suman aquí porque son gratis
                                      ).toLocaleString()}
                                </td>
                                {/* Celda para el botón de Eliminar Producto */}
                                <td>
                                  <button
                                    type="button"
                                    className="btn-eliminar"
                                    onClick={() => removeInsumo(item.id)}
                                  >
                                    Eliminar
                                  </button>
                                </td>
                              </tr>
                              {/* Fila para mostrar detalles de adiciones, salsas, rellenos - Renderizado condicional */}
                               {nestedDetailsVisible[item.id] && (
                                   <tr>
                                       {/* Esta celda ocupará el espacio de las primeras 3 columnas (Nombre, Cantidad, Precio Unitario) */}
                                       <td colSpan="3"></td>
                                       {/* Esta celda ocupará el espacio de las columnas de Adiciones, Salsas, Rellenos, Subtotal Item y Acciones */}
                                       <td colSpan="5">
                                           {/* Listado de Adiciones */}
                                           {item.adiciones.length > 0 && (
                                               <div className="nested-item-list"> {/* Clase para estilos CSS */}
                                                   <strong>Adiciones:</strong>
                                                   {item.adiciones.map(ad => (
                                                       <div key={ad.id}>
                                                           {ad.nombre} (${ad.precio.toLocaleString()})
                                                           <button type="button" className="btn-small btn-eliminar-nested" onClick={() => removeAdicion(item.id, ad.id)}>x</button>
                                                       </div>
                                                   ))}
                                               </div>
                                           )}
                                            {/* Listado de Salsas */}
                                           {item.salsas.length > 0 && (
                                                <div className="nested-item-list"> {/* Clase para estilos CSS */}
                                                    <strong>Salsas:</strong>
                                                    {item.salsas.map(sa => (
                                                       <div key={sa.id}>
                                                           {sa.nombre} (${sa.precio.toLocaleString()})
                                                            <button type="button" className="btn-small btn-eliminar-nested" onClick={() => removeSalsa(item.id, sa.id)}>x</button>
                                                       </div>
                                                   ))}
                                                </div>
                                           )}
                                            {/* Listado de Rellenos */}
                                           {item.sabores.length > 0 && (
                                                <div className="nested-item-list"> {/* Clase para estilos CSS */}
                                                    <strong>Rellenos:</strong>
                                                    {item.sabores.map(re => (
                                                       <div key={re.id}>
                                                           {re.nombre} (${re.precio.toLocaleString()})
                                                            <button type="button" className="btn-small btn-eliminar-nested" onClick={() => removeRelleno(item.id, re.id)}>x</button>
                                                       </div>
                                                   ))}
                                                </div>
                                           )}
                                            {/* Mensaje si no hay elementos anidados y los detalles están visibles */}
                                            {item.adiciones.length === 0 && item.salsas.length === 0 && item.sabores.length === 0 && (
                                                <p>No hay adiciones, salsas o rellenos añadidos.</p>
                                            )}
                                       </td>
                                   </tr>
                               )}
                            </React.Fragment>
                          ))}
                        </tbody>

                      </table>
                    )}

                    <button
                      type="button"
                      className="btn-agregar-insumos"
                      onClick={() => setMostrarModalInsumos(true)}
                    >
                      + Agregar Insumos
                    </button>
                  </div>

                  <div className="compra-totales-grid">
                    <div className="total-item">
                      <span>Subtotal:</span>
                      <span>${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="total-item">
                      <span>IVA (16%):</span>
                      <span>${iva.toLocaleString()}</span>
                    </div>
                    <div className="total-item">
                      <span>Total:</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="compra-header-actions">
                    <button className="btn-guardar" type="submit">Guardar Venta</button>
                    <button
                      type="button"
                      className="btn-regresar"
                      onClick={() => setMostrarAgregarVenta(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>

                {mostrarModalInsumos && (
                  <AgregarProductosModal
                    onClose={() => setMostrarModalInsumos(false)}
                    onAgregar={agregarInsumos}
                    insumosSeleccionados={insumosSeleccionados} // Pasar insumosSeleccionados para pre-seleccionar
                  />
                )}

                {/* Nuevos Modales */}
                {mostrarModalAdiciones && (
                    <AgregarAdicionesModal
                        onClose={() => { setMostrarModalAdiciones(false); setProductoEditandoId(null); }}
                        onAgregar={agregarAdiciones}
                        // Pasar las adiciones ya seleccionadas para este producto
                        adicionesSeleccionadas={insumosSeleccionados.find(item => item.id === productoEditandoId)?.adiciones || []}
                    />
                )}
                 {mostrarModalSalsas && (
                    <AgregarSalsasModal
                        onClose={() => { setMostrarModalSalsas(false); setProductoEditandoId(null); }}
                        onAgregar={agregarSalsas}
                         // Pasar las salsas ya seleccionadas para este producto
                        salsasSeleccionadas={insumosSeleccionados.find(item => item.id === productoEditandoId)?.salsas || []}
                    />
                )}
                 {mostrarModalRellenos && (
                    <AgregarRellenosModal
                        onClose={() => { setMostrarModalRellenos(false); setProductoEditandoId(null); }}
                        onAgregar={agregarRellenos}
                        // Pasar los rellenos ya seleccionados para este producto
                        rellenosSeleccionados={insumosSeleccionados.find(item => item.id === productoEditandoId)?.sabores || []}
                    />
                )}
              </div>
            )}
        </div>
    );
}



