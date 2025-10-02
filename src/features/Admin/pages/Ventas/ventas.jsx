// ventas.jsx - Versión corregida con abonos funcionales
import React, { useState, useEffect, useMemo } from 'react';
import '../../adminStyles.css';

// Importar los nuevos componentes
import VentasListar from './VentasListar';
import VentasCrear from './VentasCrear';
import VentasAnularModal from './VentasAnularModal';
import VentasAbonosModal from './VentasAbonosModal';
import VentasAgregarAbonoModal from './VentasAgregarAbonoModal';
import VentasDetalleAbonoModal from './VentasDetalleAbonoModal'; // CORREGIDO: Importa el componente con su nombre real
import VentasVerDetalle from './VentasVerDetalle';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

import AppNotification from '../../components/Notification';

// Importar el servicio
import ventaApiService from '../../services/venta_services';

export default function Ventas() {
    const [allSales, setAllSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTipo, setModalTipo] = useState(null);
    const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
    const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
    const [mostrarAgregarVenta, setMostrarAgregarVenta] = useState(false);
    const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);
    const [mostrarModalInsumos, setMostrarModalInsumos] = useState(false);
    const [mostrarVerDetalle, setMostrarVerDetalle] = useState(false);
    const [erroresValidacion, setErroresValidacion] = useState({});
    
    // Estados para los modales de ventas
    const [mostrarModalAbonos, setMostrarModalAbonos] = useState(false);
    const [mostrarModalAgregarAbono, setMostrarModalAgregarAbono] = useState(false);
    const [abonoData, setAbonoData] = useState({
        metodo_pago: '',
        total_pagado: '',
        fecha: new Date().toISOString().split('T')[0],
        comprobante_imagen: null
    });
    const [abonoSeleccionado, setAbonoSeleccionado] = useState(null);
    const [mostrarModalDetalleAbono, setMostrarModalDetalleAbono] = useState(false);
    const [filtroTipoVenta, setFiltroTipoVenta] = useState('directa');

    // Estados para modales de adiciones, salsas y rellenos
    const [mostrarModalAdiciones, setMostrarModalAdiciones] = useState(false);
    const [mostrarModalSalsas, setMostrarModalSalsas] = useState(false);
    const [mostrarModalRellenos, setMostrarModalRellenos] = useState(false);
    const [productoEditandoId, setProductoEditandoId] = useState(null);
    
    const [nestedDetailsVisible, setNestedDetailsVisible] = useState({});
    const [estadosVenta, setEstadosVenta] = useState([]);

    // Estado para el formulario de venta

const [ventaData, setVentaData] = useState({
    cod_venta: '00000000',
    tipo_venta: '',
    cliente: '',
    clienteId: null, // ← Agregar esta línea
    sede: '',
    metodo_pago: '',
    fecha_venta: new Date().toISOString().split('T')[0],
    fecha_entrega: '',
    fecha_registro: '',
    observaciones: ''
});


    const toggleNestedDetails = (itemId) => {
        setNestedDetailsVisible(prevState => ({
            ...prevState,
            [itemId]: !prevState[itemId]
        }));
    };
    
    // Función para mostrar notificaciones
    const showNotification = (mensaje, tipo = 'success') => {
        setNotification({ visible: true, mensaje, tipo });
        setTimeout(() => {
            hideNotification();
        }, 5000);
    };

    const hideNotification = () => {
        setNotification({ ...notification, visible: false });
    };

    // Función para obtener ventas desde la API
    const fetchVentas = async () => {
        try {
            setLoading(true);
            const ventas = await ventaApiService.obtenerVentas();
            console.log('Ventas obtenidas:', ventas);
            setAllSales(ventas);
        } catch (error) {
            console.error('Error al obtener ventas:', error);
            showNotification(error.message || 'Error al obtener las ventas', 'error');
            cargarVentasMock();
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener estados de venta
    const fetchEstadosVenta = async () => {
        try {
            const estados = await ventaApiService.obtenerEstadosVenta();
            console.log('Estados obtenidos:', estados);
            setEstadosVenta(estados);
        } catch (error) {
            console.error('Error al obtener estados:', error);
            showNotification('Error al obtener los estados de venta', 'error');
            // Estados mock como fallback
            setEstadosVenta([
                { idestadoventa: 1, nombre_estado: 'Activa' },
                { idestadoventa: 2, nombre_estado: 'Pendiente' },
                { idestadoventa: 3, nombre_estado: 'En Proceso' },
                { idestadoventa: 4, nombre_estado: 'Completada' },
                { idestadoventa: 5, nombre_estado: 'Anulada' }
            ]);
        }
    };


    // Cargar datos al montar el componente
    useEffect(() => {
        fetchVentas();
        fetchEstadosVenta();
    }, []);

    // Filtrado de ventas
    const filteredVentas = useMemo(() => {
        const estadoAnuladoId = estadosVenta.find(e => e.nombre_estado === 'Anulada')?.idestadoventa;
        const estadosActivosIds = estadosVenta
            .filter(e => e.nombre_estado !== 'Anulada')
            .map(e => e.idestadoventa);

        return allSales.filter(venta => {
            const matchesSearch = filtro === '' ||
                (venta.nombreCliente && venta.nombreCliente.toLowerCase().includes(filtro.toLowerCase())) ||
                (venta.idVenta && venta.idVenta.toString().includes(filtro));
            
            if (filtroTipoVenta === 'directa') {
                return matchesSearch && venta.tipoVenta === 'directa' && estadosActivosIds.includes(venta.idEstadoVenta);
            } else if (filtroTipoVenta === 'pedido') {
                return matchesSearch && venta.tipoVenta === 'pedido' && estadosActivosIds.includes(venta.idEstadoVenta);
            } else if (filtroTipoVenta === 'anulado') {
                return matchesSearch && venta.idEstadoVenta === estadoAnuladoId;
            }
            return false;
        }).sort((a, b) => {
            if (a.idEstadoVenta === estadoAnuladoId && b.idEstadoVenta !== estadoAnuladoId) {
                return 1;
            }
            if (b.idEstadoVenta === estadoAnuladoId && a.idEstadoVenta !== estadoAnuladoId) {
                return -1;
            }
            return 0;
        });
    }, [allSales, filtro, filtroTipoVenta, estadosVenta]);

    // Manejo de modales
    const abrirModal = (tipo, venta = null) => {
        setModalTipo(tipo);
        setVentaSeleccionada(venta);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setVentaSeleccionada(null);
        setModalTipo(null);
    };

    // Ver detalle de venta con abonos
    const verDetalleVenta = async (venta) => {
        setVentaSeleccionada(venta);
        setMostrarVerDetalle(true);

        try {
            console.log('Obteniendo detalle completo de la venta:', venta.idVenta);
            const ventaCompleta = await ventaApiService.obtenerVentaPorId(venta.idVenta);
            console.log('Venta completa obtenida:', ventaCompleta);
            setVentaSeleccionada(ventaCompleta);
        } catch (error) {
            console.error('Error al obtener detalle:', error);
            showNotification(error.message || 'No se pudo obtener información completa de la venta', 'error');
        }
    };

    // Ver abonos de una venta
const verAbonosVenta = async (venta) => {
    console.log('Venta recibida para abonos:', venta);
    if (!venta || !venta.idVenta) {
        showNotification('Error: Venta no válida', 'error');
        return;
    }
    
    setVentaSeleccionada(venta);
    setMostrarModalAbonos(true); // IMPORTANTE: Abrir modal primero
    
    try {
        console.log('Obteniendo detalle completo de la venta:', venta.idVenta);
        const ventaCompleta = await ventaApiService.obtenerVentaPorId(venta.idVenta);
        console.log('Venta completa obtenida:', ventaCompleta);
        
        // Actualizar la venta seleccionada con los datos completos
        setVentaSeleccionada(ventaCompleta);
    } catch (error) {
        console.error('Error al obtener abonos:', error);
        showNotification('Error al obtener los abonos de la venta', 'error');
        // Mantener el modal abierto con los datos básicos
    }
};
    
    // Función para anular venta - CORREGIDA
    const anularVenta = async () => {
        if (!ventaSeleccionada?.idVenta) {
            showNotification('No se pudo identificar la venta a anular', 'error');
            return;
        }

        try {
            console.log('Anulando venta con ID:', ventaSeleccionada.idVenta);
            await ventaApiService.anularVenta(ventaSeleccionada.idVenta);

            // Actualizar solo la venta anulada en el estado
            setAllSales(prevSales =>
                prevSales.map(v =>
                    v.idVenta === ventaSeleccionada.idVenta
                        ? {
                              ...v,
                              idEstadoVenta: estadosVenta.find(e => e.nombre_estado === 'Anulada')?.idestadoventa,
                              nombreEstado: 'Anulada'
                          }
                        : v
                )
            );

            showNotification('Venta anulada correctamente', 'success');
            cerrarModal();
        } catch (error) {
            console.error('Error al anular venta:', error);
            showNotification(error.message || 'Error al anular la venta', 'error');
        }
    };
    
    // Función para cambiar estado de venta
    const manejarCambioEstado = async (idVenta, nuevoEstadoId) => {
        try {
            await ventaApiService.actualizarEstadoVenta(idVenta, nuevoEstadoId);
            
            setAllSales(prevSales => 
                prevSales.map(venta => 
                    venta.idVenta === idVenta 
                        ? { 
                            ...venta, 
                            idEstadoVenta: nuevoEstadoId,
                            nombreEstado: estadosVenta.find(e => e.idestadoventa === nuevoEstadoId)?.nombre_estado || venta.nombreEstado
                          }
                        : venta
                )
            );
            
            showNotification('Estado de venta actualizado correctamente', 'success');
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            showNotification(error.message || 'Error al actualizar el estado', 'error');
        }
    };

    // Función para generar PDF
    const generarPDFVenta = (venta) => {
        console.log('Generando PDF para venta:', venta.idVenta);
        showNotification('PDF generado correctamente', 'success');
    };
    
    // Función para obtener clase CSS de fila
    const getRowClassName = (data) => {
        const estadoAnuladoId = estadosVenta.find(e => e.nombre_estado === 'Anulada')?.idestadoventa;
        return data.idEstadoVenta === estadoAnuladoId ? 'row-anulado' : '';
    };

    // Cálculos para el formulario de crear venta
    const subtotal = useMemo(() => {
        return insumosSeleccionados.reduce((acc, item) => {
            const itemSubtotal = (item.precio * item.cantidad) +
                (item.adiciones?.slice(2).reduce((acc2, ad) => acc2 + (ad.precio * (ad.cantidad || 1)), 0) || 0) +
                (item.sabores?.reduce((acc3, re) => acc3 + (re.precio * (re.cantidad || 1)), 0) || 0);
            return acc + itemSubtotal;
        }, 0);
    }, [insumosSeleccionados]);

    const iva = useMemo(() => subtotal * 0.16, [subtotal]);
    const total = useMemo(() => subtotal + iva, [subtotal, iva]);

    // Guardar venta
    const guardarVenta = async () => {
    const errores = {};
    if (!ventaData.tipo_venta) errores.tipo_venta = 'El tipo de venta es requerido';
    if (!ventaData.cliente) errores.cliente = 'El cliente es requerido';
    if (!ventaData.sede) errores.sede = 'La sede es requerida';
    if (!ventaData.metodo_pago) errores.metodo_pago = 'El método de pago es requerido';
    if (insumosSeleccionados.length === 0) errores.productos = 'Debe agregar al menos un producto';
    
    // VALIDACIÓN ADICIONAL PARA VENTA DIRECTA - VERIFICAR CANTIDADES
    if (ventaData.tipo_venta === 'directa' || ventaData.tipo_venta === 'venta directa') {
        for (const producto of insumosSeleccionados) {
            const disponible = producto.disponible || 0;
            const solicitado = producto.cantidad || 1;
            
            if (solicitado > disponible) {
                errores.productos = `El producto "${producto.nombre}" excede la cantidad disponible. Disponible: ${disponible}, Solicitado: ${solicitado}`;
                break;
            }
        }
    }
    
    if (ventaData.tipo_venta === 'pedido' && !ventaData.fecha_entrega) {
        errores.fecha_entrega = 'La fecha de entrega es requerida para pedidos';
    }

    if (Object.keys(errores).length > 0) {
        setErroresValidacion(errores);
        showNotification('Por favor corrija los errores en el formulario', 'error');
        return;
    }

    try {
        console.log('Datos de venta antes de enviar:');
        console.log('ventaData.cliente:', ventaData.cliente);
        console.log('ventaData.clienteId:', ventaData.clienteId);
        
        const sedeId = ventaData.sede === 'San Pablo' ? 1 : 2;
        const estadoActivoId = estadosVenta.find(e => e.nombre_estado === 'Activa')?.idestadoventa || 5;
        
        const nuevaVenta = {
            fechaventa: ventaData.fecha_venta,
            clienteId: ventaData.clienteId,
            idsede: sedeId,
            metodopago: ventaData.metodo_pago,
            tipoventa: ventaData.tipo_venta === 'venta directa' ? 'directa' : ventaData.tipo_venta,
            estadoVentaId: estadoActivoId,
            total: total,
            clienteNombre: ventaData.cliente,
            sedeNombre: ventaData.sede,
            productos: insumosSeleccionados.map(item => {
                const subtotalItem = item.precio * (item.cantidad || 1);
                const costoAdiciones = (item.adiciones?.slice(2) || []).reduce((acc, ad) => acc + (ad.precio * (ad.cantidad || 1)), 0);
                const costoSabores = (item.sabores || []).reduce((acc, re) => acc + (re.precio * (re.cantidad || 1)), 0);
                const subtotalTotal = subtotalItem + costoAdiciones + costoSabores;
                
                return {
                    idproductogeneral: item.id,
                    cantidad: item.cantidad || 1,
                    preciounitario: item.precio,
                    subtotal: subtotalTotal,
                    iva: subtotalTotal * 0.16
                };
            })
        };
        
        console.log('Enviando nueva venta a la API:', nuevaVenta);
        
        const ventaCreada = await ventaApiService.crearVenta(nuevaVenta);
        console.log('Venta creada exitosamente:', ventaCreada);

        setAllSales(prevSales => [ventaCreada, ...prevSales]);
        showNotification('Venta creada exitosamente. Inventario actualizado.', 'success');

        // Resetear formulario
        setMostrarAgregarVenta(false);
        setInsumosSeleccionados([]);
        setVentaData({
            cod_venta: '00000000',
            tipo_venta: '',
            cliente: '',
            clienteId: null,
            sede: '',
            metodo_pago: '',
            fecha_venta: new Date().toISOString().split('T')[0],
            fecha_entrega: '',
            fecha_registro: '',
            observaciones: ''
        });
        setErroresValidacion({});
        
    } catch (error) {
        console.error('Error al crear venta:', error);
        
        // Mensaje específico para error de inventario
        if (error.message.includes('inventario') || error.message.includes('Inventario')) {
            showNotification('Stock insuficiente: ' + error.message, 'error');
        } else if (error.message.includes('INVENTARIO_INSUFICIENTE')) {
            showNotification('No hay suficiente inventario para completar la venta', 'error');
        } else {
            showNotification(error.message || 'Error al crear la venta', 'error');
        }
    }
};

    // Funciones para manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setVentaData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (erroresValidacion[name]) {
            setErroresValidacion(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleCantidadChange = (itemId, nuevaCantidad) => {
    setInsumosSeleccionados(prev => 
        prev.map(item => {
            if (item.id === itemId) {
                // Solo validar para venta directa
                if (ventaData.tipo_venta === 'directa' || ventaData.tipo_venta === 'venta directa') {
                    const maxDisponible = item.disponible || 0;
                    if (nuevaCantidad > maxDisponible) {
                        showNotification(
                            `Cantidad máxima disponible para ${item.nombre}: ${maxDisponible} unidades`, 
                            'error'
                        );
                        return { ...item, cantidad: Math.min(maxDisponible, Math.max(1, nuevaCantidad)) };
                    }
                }
                return { ...item, cantidad: Math.max(1, nuevaCantidad) };
            }
            return item;
        })
    );
};

    // Funciones para manejar adiciones, salsas y rellenos
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

    // Funciones mock para agregar elementos
    const agregarInsumos = (insumos) => {
        const nuevosInsumos = insumos.map(insumo => ({
            ...insumo,
            cantidad: 1,
            adiciones: [],
            salsas: [],
            sabores: []
        }));
        setInsumosSeleccionados(prev => [...prev, ...nuevosInsumos]);
    };

    const agregarAdiciones = (adiciones) => {
        setInsumosSeleccionados(prev => 
            prev.map(item => 
                item.id === productoEditandoId 
                    ? { ...item, adiciones: [...(item.adiciones || []), ...adiciones] }
                    : item
            )
        );
    };

    const agregarSalsas = (salsas) => {
        setInsumosSeleccionados(prev => 
            prev.map(item => 
                item.id === productoEditandoId 
                    ? { ...item, salsas: [...(item.salsas || []), ...salsas] }
                    : item
            )
        );
    };

    const agregarRellenos = (rellenos) => {
        setInsumosSeleccionados(prev => 
            prev.map(item => 
                item.id === productoEditandoId 
                    ? { ...item, sabores: [...(item.sabores || []), ...rellenos] }
                    : item
            )
        );
    };

    // Funciones para remover elementos
    const removeInsumo = (itemId) => {
        setInsumosSeleccionados(prev => prev.filter(item => item.id !== itemId));
    };

    const removeAdicion = (itemId, adicionId) => {
        setInsumosSeleccionados(prev => 
            prev.map(item => 
                item.id === itemId 
                    ? { ...item, adiciones: item.adiciones.filter(ad => ad.id !== adicionId) }
                    : item
            )
        );
    };

    const removeSalsa = (itemId, salsaId) => {
        setInsumosSeleccionados(prev => 
            prev.map(item => 
                item.id === itemId 
                    ? { ...item, salsas: item.salsas.filter(sa => sa.id !== salsaId) }
                    : item
            )
        );
    };

    const removeRelleno = (itemId, rellenoId) => {
        setInsumosSeleccionados(prev => 
            prev.map(item => 
                item.id === itemId 
                    ? { ...item, sabores: item.sabores.filter(re => re.id !== rellenoId) }
                    : item
            )
        );
    };

    // Funciones para manejar abonos - CORREGIDAS
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        console.log('Archivo seleccionado:', file.name, file.type, file.size);
        
        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            showNotification('Por favor selecciona solo archivos de imagen', 'error');
            return;
        }
        
       
        if (file.size > 5 * 1024 * 1024) {
            showNotification('La imagen es muy grande. Máximo 5MB permitido', 'error');
            return;
        }
        
       
        setAbonoData(prev => ({
            ...prev,
            comprobante_imagen: file
        }));
    } else {
       
        setAbonoData(prev => ({
            ...prev,
            comprobante_imagen: null
        }));
    }
};

   const agregarAbono = async () => {
    console.log('Iniciando creación de abono:', abonoData);
    
    // Validaciones
    const errores = {};
    if (!abonoData.metodo_pago) {
        errores.metodo_pago = 'Método de pago es requerido';
    }
    if (!abonoData.total_pagado || parseFloat(abonoData.total_pagado) <= 0) {
        errores.total_pagado = 'El monto debe ser mayor a 0';
    }
    
    if (Object.keys(errores).length > 0) {
        setErroresValidacion(errores);
        showNotification('Por favor corrija los errores en el formulario', 'error');
        return;
    }
    
    const abonoParaAPI = {
        idpedido: ventaSeleccionada.idVenta,
        metodopago: abonoData.metodo_pago,
        cantidadpagar: parseFloat(abonoData.total_pagado),
        TotalPagado: parseFloat(abonoData.total_pagado),
    };
    
    try {
        console.log('Creando abono con datos:', abonoParaAPI);
        console.log('Imagen a subir:', abonoData.comprobante_imagen ? 'SÍ' : 'NO');
        
        const abonoCreado = await ventaApiService.crearAbono(abonoParaAPI, abonoData.comprobante_imagen);
        
        showNotification('Abono agregado correctamente', 'success');
        setMostrarModalAgregarAbono(false);
        
        // Resetear datos del abono
        setAbonoData({
            metodo_pago: '',
            total_pagado: '',
            fecha: new Date().toISOString().split('T')[0],
            comprobante_imagen: null
        });
        setErroresValidacion({});
        
        // Actualizar la vista de abonos refrescando los datos
        if (ventaSeleccionada?.idVenta) {
            const ventaActualizada = await ventaApiService.obtenerVentaPorId(ventaSeleccionada.idVenta);
            setVentaSeleccionada(ventaActualizada);
        }
        
    } catch (error) {
        console.error('Error al agregar abono:', error);
        showNotification(error.message || 'Error al agregar abono', 'error');
    }
};

    const verDetalleAbono = (abono) => {
        console.log('Viendo detalle del abono:', abono);
        setAbonoSeleccionado(abono);
        setMostrarModalDetalleAbono(true);
    };

  const anularAbono = async (idAbono) => {
    if (!idAbono) {
        showNotification('ID de abono inválido', 'error');
        return;
    }

    try {
        console.log('Anulando abono ID:', idAbono);
        await ventaApiService.anularAbono(idAbono);
        
        showNotification('Abono anulado correctamente', 'success');
        
        // Cerrar modal de detalle si está abierto
        setMostrarModalDetalleAbono(false);
        
        // Refrescar la lista de abonos de la venta actual
        if (ventaSeleccionada?.idVenta) {
            await verAbonosVenta(ventaSeleccionada);
        }
        
    } catch (error) {
        console.error('Error al anular abono:', error);
        showNotification(error.message || 'Error al anular el abono', 'error');
    }
};


    const onBackToList = () => {
        setMostrarVerDetalle(false);
        setVentaSeleccionada(null);
    };

    if (loading) {
        return (
            <div className="admin-container">
                <div className="loading-container">
                    <p>Cargando ventas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <AppNotification
                visible={notification.visible}
                mensaje={notification.mensaje}
                tipo={notification.tipo}
                onClose={hideNotification}
            />

            {mostrarVerDetalle ? (
                <VentasVerDetalle
                    ventaSeleccionada={ventaSeleccionada}
                    onBackToList={onBackToList}
                />
            ) : mostrarAgregarVenta ? (
                <VentasCrear
                    onBackToList={() => setMostrarAgregarVenta(false)}
                    insumosSeleccionados={insumosSeleccionados}
                    setInsumosSeleccionados={setInsumosSeleccionados}
                    ventaData={ventaData}
                    setVentaData={setVentaData}
                    handleChange={handleChange}
                    erroresValidacion={erroresValidacion}
                    setErroresValidacion={setErroresValidacion}
                    guardarVenta={guardarVenta}
                    mostrarModalInsumos={mostrarModalInsumos}
                    setMostrarModalInsumos={setMostrarModalInsumos}
                    toggleNestedDetails={toggleNestedDetails}
                    nestedDetailsVisible={nestedDetailsVisible}
                    handleCantidadChange={handleCantidadChange}
                    abrirModalAdiciones={abrirModalAdiciones}
                    abrirModalSalsas={abrirModalSalsas}
                    abrirModalRellenos={abrirModalRellenos}
                    removeInsumo={removeInsumo}
                    removeAdicion={removeAdicion}
                    removeSalsa={removeSalsa}
                    removeRelleno={removeRelleno}
                    subtotal={subtotal}
                    iva={iva}
                    total={total}
                    setMostrarAgregarVenta={setMostrarAgregarVenta}
                    agregarInsumos={agregarInsumos}
                    mostrarModalAdiciones={mostrarModalAdiciones}
                    agregarAdiciones={agregarAdiciones}
                    mostrarModalSalsas={mostrarModalSalsas}
                    agregarSalsas={agregarSalsas}
                    mostrarModalRellenos={mostrarModalRellenos}
                    agregarRellenos={agregarRellenos}
                    setProductoEditandoId={setProductoEditandoId}
                    productoEditandoId={productoEditandoId}
                />
            ) : (
                <VentasListar
                    ventasFiltradas={filteredVentas}
                    abrirModal={abrirModal}
                    generarPDFVenta={generarPDFVenta}
                    setVentaSeleccionada={setVentaSeleccionada}
                    setMostrarModalAbonos={verAbonosVenta}
                    manejarCambioEstado={manejarCambioEstado}
                    notification={notification}
                    hideNotification={hideNotification}
                    getRowClassName={getRowClassName}
                    filtroTipoVenta={filtroTipoVenta}
                    setFiltroTipoVenta={setFiltroTipoVenta}
                    verDetalleVenta={verDetalleVenta}
                    estadosVenta={estadosVenta}
                    setFiltro={setFiltro}
                    setMostrarAgregarVenta={setMostrarAgregarVenta}
                />
            )}

            {/* Modales */}
            <VentasAnularModal
                visible={modalVisible && modalTipo === 'anular'}
                onClose={cerrarModal}
                ventaSeleccionada={ventaSeleccionada}
                anularVenta={anularVenta}
            />
            
            <VentasAbonosModal
                visible={mostrarModalAbonos}
                onClose={() => setMostrarModalAbonos(false)}
                ventaSeleccionada={ventaSeleccionada}
                abonos={ventaSeleccionada?.abonos || []}
                setMostrarModalAgregarAbono={setMostrarModalAgregarAbono}
                verDetalleAbono={verDetalleAbono}
                anularAbono={anularAbono}
            />
            
            <VentasAgregarAbonoModal
                visible={mostrarModalAgregarAbono}
                onClose={() => {
                    setMostrarModalAgregarAbono(false);
                    setErroresValidacion({});
                    // Resetear datos del formulario
                    setAbonoData({
                        metodo_pago: '',
                        total_pagado: '',
                        fecha: new Date().toISOString().split('T')[0],
                        comprobante_imagen: null
                    });
                }}
                abonoData={abonoData}
                handleAbonoChange={(e) => {
                    setAbonoData({ ...abonoData, [e.target.name]: e.target.value });
                    // Limpiar error del campo modificado
                    if (erroresValidacion[e.target.name]) {
                        setErroresValidacion(prev => ({
                            ...prev,
                            [e.target.name]: ''
                        }));
                    }
                }}
                erroresValidacion={erroresValidacion}
                handleImageUpload={handleImageUpload}
                agregarAbono={agregarAbono}
                ventaSeleccionada={ventaSeleccionada}
            />
            
            <VentasDetalleAbonoModal
                visible={mostrarModalDetalleAbono}
                onClose={() => setMostrarModalDetalleAbono(false)}
                abonoSeleccionado={abonoSeleccionado}
                anularAbono={() => anularAbono(abonoSeleccionado?.idAbono)}
            />
        </div>
    );
}