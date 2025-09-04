// ventas.jsx - Versión corregida
import React, { useState, useEffect, useMemo } from 'react';
import '../../adminStyles.css';

// Importar los nuevos componentes
import VentasListar from './VentasListar';
import VentasCrear from './VentasCrear';
import VentasAnularModal from './VentasAnularModal';
import VentasAbonosModal from './VentasAbonosModal';
import VentasAgregarAbonoModal from './VentasAgregarAbonoModal';
import VentasDetalleAbonoModal from './VentasDetalleAbonoModal';
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
            // Cargar datos mock como fallback
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

    // Datos mock para desarrollo/fallback
    const cargarVentasMock = () => {
        const ventasMock = [
            {
                idVenta: 1,
                fechaVenta: '2024-12-15',
                total: 50000,
                metodoPago: 'efectivo',
                tipoVenta: 'directa',
                idEstadoVenta: 1,
                nombreEstado: 'Activa',
                nombreCliente: 'Juan Pérez',
                nombreSede: 'San Pablo'
            },
            {
                idVenta: 2,
                fechaVenta: '2024-12-14',
                total: 75000,
                metodoPago: 'transferencia',
                tipoVenta: 'pedido',
                idEstadoVenta: 2,
                nombreEstado: 'Pendiente',
                nombreCliente: 'María González',
                nombreSede: 'San Benito'
            },
            {
                idVenta: 3,
                fechaVenta: '2024-12-13',
                total: 30000,
                metodoPago: 'efectivo',
                tipoVenta: 'directa',
                idEstadoVenta: 5,
                nombreEstado: 'Anulada',
                nombreCliente: 'Carlos López',
                nombreSede: 'San Pablo'
            }
        ];
        setAllSales(ventasMock);
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
    
    // Función para ver detalle de venta
    const verDetalleVenta = async (venta) => {
        try {
            console.log('Intentando obtener el detalle de la venta con ID:', venta.idVenta);
            const ventaCompleta = await ventaApiService.obtenerVentaPorId(venta.idVenta);
            setVentaSeleccionada(ventaCompleta);
            setMostrarVerDetalle(true);
        } catch (error) {
            console.error('Error al obtener detalle:', error);
            showNotification(error.message || 'Error al obtener el detalle de la venta', 'error');
        }
    };
    
    // Función para anular venta
    const anularVenta = async () => {
        try {
            // Aquí iría la llamada a la API para anular
            // await ventaApiService.anularVenta(ventaSeleccionada.idVenta);
            showNotification('Venta anulada correctamente', 'success');
            await fetchVentas(); // Recargar la lista de ventas
            cerrarModal();
        } catch (error) {
            console.error('Error al anular venta:', error);
            showNotification(error.message || 'Error al anular la venta', 'error');
        }
    };
    
    // Función para cambiar estado de venta
 const manejarCambioEstado = async (idVenta, nuevoEstadoId) => {
        try {
            // Hacer la llamada a la API
            await ventaApiService.actualizarEstadoVenta(idVenta, nuevoEstadoId);
            
            // Actualizar el estado local inmediatamente sin recargar
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
        // Aquí iría la lógica para generar PDF
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

    // Función para guardar venta
    const guardarVenta = async () => {
        // Validaciones básicas
        const errores = {};
        
        if (!ventaData.tipo_venta) errores.tipo_venta = 'El tipo de venta es requerido';
        if (!ventaData.cliente) errores.cliente = 'El cliente es requerido';
        if (!ventaData.sede) errores.sede = 'La sede es requerida';
        if (!ventaData.metodo_pago) errores.metodo_pago = 'El método de pago es requerido';
        if (insumosSeleccionados.length === 0) errores.productos = 'Debe agregar al menos un producto';
        
        if (Object.keys(errores).length > 0) {
            setErroresValidacion(errores);
            return;
        }

        const nuevaVenta = {
            fechaventa: ventaData.fecha_venta,
            cliente: ventaData.cliente,
            idsede: ventaData.sede === 'San Pablo' ? 1 : 2, // Mapear nombres a IDs
            metodopago: ventaData.metodo_pago,
            tipoventa: ventaData.tipo_venta,
            estadoVentaId: estadosVenta.find(e => e.nombre_estado === 'Activa')?.idestadoventa || 1,
            total: total,
            detalleventa: insumosSeleccionados.map(item => ({
                idproductogeneral: item.id,
                cantidad: item.cantidad,
                preciounitario: item.precio,
                subtotal: item.precio * item.cantidad,
                iva: (item.precio * item.cantidad) * 0.16,
            })),
        };
        
        try {
            await ventaApiService.crearVenta(nuevaVenta);
            showNotification('Venta creada exitosamente', 'success');
            
            // Resetear formulario
            setMostrarAgregarVenta(false);
            setInsumosSeleccionados([]);
            setVentaData({
                cod_venta: '00000000',
                tipo_venta: '',
                cliente: '',
                sede: '',
                metodo_pago: '',
                fecha_venta: new Date().toISOString().split('T')[0],
                fecha_entrega: '',
                fecha_registro: '',
                observaciones: ''
            });
            setErroresValidacion({});
            
            // Recargar lista
            await fetchVentas();
        } catch (error) {
            console.error('Error al crear venta:', error);
            showNotification(error.message || 'Error al crear la venta', 'error');
        }
    };

    // Funciones para manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setVentaData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Limpiar error del campo modificado
        if (erroresValidacion[name]) {
            setErroresValidacion(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleCantidadChange = (itemId, nuevaCantidad) => {
        setInsumosSeleccionados(prev => 
            prev.map(item => 
                item.id === itemId 
                    ? { ...item, cantidad: Math.max(1, nuevaCantidad) }
                    : item
            )
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

    // Funciones para manejar abonos
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAbonoData(prev => ({
                ...prev,
                comprobante_imagen: file
            }));
        }
    };

    const agregarAbono = async () => {
        const abonoParaAPI = {
            idpedido: ventaSeleccionada.idVenta,
            metodopago: abonoData.metodo_pago,
            TotalPagado: parseFloat(abonoData.total_pagado),
            fecha: abonoData.fecha,
        };
        try {
            // await ventaApiService.crearAbono(abonoParaAPI);
            showNotification('Abono agregado correctamente', 'success');
            setMostrarModalAgregarAbono(false);
            setAbonoData({
                metodo_pago: '',
                total_pagado: '',
                fecha: new Date().toISOString().split('T')[0],
                comprobante_imagen: null
            });
            await verDetalleVenta(ventaSeleccionada);
        } catch (error) {
            console.error('Error al agregar abono:', error);
            showNotification(error.message || 'Error al agregar abono', 'error');
        }
    };
    
    const verDetalleAbono = (abono) => {
        setAbonoSeleccionado(abono);
        setMostrarModalDetalleAbono(true);
    };

    const anularAbono = async () => {
        try {
            showNotification('Abono anulado correctamente', 'success');
            setMostrarModalDetalleAbono(false);
        } catch (error) {
            console.error('Error al anular abono:', error);
            showNotification('Error al anular el abono', 'error');
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
                    setMostrarModalAbonos={setMostrarModalAbonos}
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
                }}
                abonoData={abonoData}
                handleAbonoChange={(e) => setAbonoData({ ...abonoData, [e.target.name]: e.target.value })}
                erroresValidacion={erroresValidacion}
                handleImageUpload={handleImageUpload}
                agregarAbono={agregarAbono}
                ventaSeleccionada={ventaSeleccionada}
            />
            
            <VentasDetalleAbonoModal
                visible={mostrarModalDetalleAbono}
                onClose={() => setMostrarModalDetalleAbono(false)}
                abonoSeleccionado={abonoSeleccionado}
                anularAbono={anularAbono}
            />
        </div>
    );
}