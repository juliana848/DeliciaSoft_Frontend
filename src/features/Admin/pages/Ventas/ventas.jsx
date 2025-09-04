// ventas.jsx
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
import SearchBar from '../../components/SearchBar';

// Importar el servicio
import ventaApiService from '../../services/venta_services';

export default function Ventas() {
    const [allSales, setAllSales] = useState([]);
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

    const [nestedDetailsVisible, setNestedDetailsVisible] = useState({});

    const [estadosVenta, setEstadosVenta] = useState([]);

    const toggleNestedDetails = (itemId) => {
        setNestedDetailsVisible(prevState => ({
            ...prevState,
            [itemId]: !prevState[itemId]
        }));
    };
    
    const [mostrarModalAdiciones, setMostrarModalAdiciones] = useState(false);
    const [mostrarModalSalsas, setMostrarModalSalsas] = useState(false);
    const [mostrarModalRellenos, setMostrarModalRellenos] = useState(false);
    const [productoEditandoId, setProductoEditandoId] = useState(null);
    
    const verDetalleVenta = async (venta) => {
        try {
            console.log('Intentando obtener el detalle de la venta con ID:', venta.idVenta);
            const ventaCompleta = await ventaApiService.obtenerVentaPorId(venta.idVenta);
            setVentaSeleccionada(ventaCompleta);
            setMostrarVerDetalle(true);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };
    
    const fetchVentas = async () => {
        try {
            const ventas = await ventaApiService.obtenerVentas();
            setAllSales(ventas);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const fetchEstadosVenta = async () => {
        try {
            const estados = await ventaApiService.obtenerEstadosVenta();
            setEstadosVenta(estados);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };
    
    useEffect(() => {
        fetchVentas();
        fetchEstadosVenta();
    }, []);

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

    const showNotification = (mensaje, tipo) => {
        setNotification({ visible: true, mensaje, tipo });
        setTimeout(() => {
            hideNotification();
        }, 5000);
    };

    const hideNotification = () => {
        setNotification({ ...notification, visible: false });
    };

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
    
    const anularVenta = async () => {
        try {
            await ventaApiService.anularVenta(ventaSeleccionada.idVenta);
            showNotification('Venta anulada correctamente', 'success');
            await fetchVentas(); // Recargar la lista de ventas
            cerrarModal();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };
    
    const manejarCambioEstado = async (idVenta, nuevoEstadoId) => {
        try {
            await ventaApiService.actualizarEstadoVenta(idVenta, nuevoEstadoId);
            showNotification('Estado de venta actualizado correctamente', 'success');
            await fetchVentas();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const generarPDFVenta = (venta) => {
        // Lógica para generar PDF (no necesita cambios por la API)
    };
    
    const getRowClassName = (data) => {
        const estadoAnuladoId = estadosVenta.find(e => e.nombre_estado === 'Anulada')?.idestadoventa;
        return data.idEstadoVenta === estadoAnuladoId ? 'row-anulado' : '';
    };

    const guardarVenta = async () => {
        // Validaciones...
        const nuevaVenta = {
            fechaventa: ventaData.fecha_venta,
            cliente: ventaData.cliente,
            idsede: ventaData.sede,
            metodopago: ventaData.metodo_pago,
            tipoventa: ventaData.tipo_venta,
            idestadoventa: estadosVenta.find(e => e.nombre_estado === 'Activa')?.idestadoventa || 1,
            total: total,
            detalleventa: insumosSeleccionados.map(item => ({
                idproductogeneral: item.id,
                cantidad: item.cantidad,
                preciounitario: item.precio,
                iva: item.iva,
            })),
        };
        try {
            await ventaApiService.crearVenta(nuevaVenta);
            showNotification('Venta creada exitosamente', 'success');
            setMostrarAgregarVenta(false);
            setInsumosSeleccionados([]);
            setVentaData({ ...ventaData, tipo_venta: '', cliente: '' }); // Resetear el formulario
            await fetchVentas(); // Recargar la lista
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const handleImageUpload = (e) => {
        // Lógica de subida de imagen (no necesita cambios)
    };

    const agregarAbono = async () => {
        const abonoParaAPI = {
            idpedido: ventaSeleccionada.idVenta,
            metodopago: abonoData.metodo_pago,
            TotalPagado: parseFloat(abonoData.total_pagado),
            fecha: abonoData.fecha,
        };
        try {
            await ventaApiService.crearAbono(abonoParaAPI);
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
            showNotification(error.message, 'error');
        }
    };
    
    const verDetalleAbono = (abono) => {
        setAbonoSeleccionado(abono);
        setMostrarModalDetalleAbono(true);
    };

    const anularAbono = async () => {
        // Lógica para anular abono
    };

    const onBackToList = () => {
        setMostrarVerDetalle(false);
        setVentaSeleccionada(null);
    };

    return (
        <div className="admin-container">
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
                    erroresValidacion={erroresValidacion}
                    setErroresValidacion={setErroresValidacion}
                    guardarVenta={guardarVenta}
                    mostrarModalInsumos={mostrarModalInsumos}
                    setMostrarModalInsumos={setMostrarModalInsumos}
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
                />
            )}
            <VentasAnularModal
                visible={modalVisible}
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