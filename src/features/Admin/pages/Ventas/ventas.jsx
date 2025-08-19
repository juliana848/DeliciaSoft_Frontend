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
    
    useEffect(() => {
        fetchVentas();
    }, []);

    const filteredVentas = useMemo(() => {
        // Se aplica el filtro de tipo de venta y la búsqueda
        return allSales.filter(venta => {
            const matchesSearch = filtro === '' ||
                (venta.cliente && venta.cliente.toLowerCase().includes(filtro.toLowerCase())) ||
                (venta.idVenta && venta.idVenta.toString().includes(filtro));
            
            if (filtroTipoVenta === 'directa') {
                return matchesSearch && venta.tipoVenta === 'directa' && venta.estadoVenta;
            } else if (filtroTipoVenta === 'pedido') {
                return matchesSearch && venta.tipoVenta === 'pedido' && venta.estadoVenta;
            } else if (filtroTipoVenta === 'anulado') {
                return matchesSearch && venta.estadoVenta === false;
            }
            return false;
        }).sort((a, b) => {
            if (a.estadoVenta === false && b.estadoVenta !== false) {
                return 1;
            }
            if (b.estadoVenta === false && a.estadoVenta !== false) {
                return -1;
            }
            return 0;
        });
    }, [allSales, filtro, filtroTipoVenta]);

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
    
    const generarPDFVenta = (venta) => {
        // Lógica para generar PDF (no necesita cambios por la API)
    };

    const manejarCambioEstado = (ventaActualizada, nuevoEstado) => {
        // Esta función podría ser redundante si el backend maneja el estado
        setAllSales(prevSales => prevSales.map(venta =>
            venta.idVenta === ventaActualizada.idVenta ? { ...venta, estadoVenta: nuevoEstado } : venta
        ));
    };
    
    const getRowClassName = (data) => {
        return data.estadoVenta === false ? 'row-anulado' : '';
    };

    const guardarVenta = async () => {
        // Validaciones...
        const nuevaVenta = {
            fechaventa: ventaData.fecha_venta,
            cliente: ventaData.cliente,
            idsede: ventaData.sede,
            metodopago: ventaData.metodo_pago,
            tipoventa: ventaData.tipo_venta,
            estadoventa: true, // Asumimos que al crear una venta, está activa
            total: total,
            detalleventa: insumosSeleccionados.map(item => ({
                idproductogeneral: item.id,
                cantidad: item.cantidad,
                preciounitario: item.precio,
                subtotal: item.subtotal,
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
            idimagen: null, // Necesitarías subir la imagen primero y obtener el id
            cantidadpagar: parseFloat(abonoData.total_pagado),
        };

        try {
            await ventaApiService.agregarAbono(abonoParaAPI);
            showNotification('Abono agregado exitosamente', 'success');
            // Recargar la venta seleccionada para mostrar el nuevo abono
            const ventaActualizada = await ventaApiService.obtenerVentaPorId(ventaSeleccionada.idVenta);
            setVentaSeleccionada(ventaActualizada);
            setMostrarModalAgregarAbono(false);
            setAbonoData({ metodo_pago: '', total_pagado: '', comprobante_imagen: null }); // Reset
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };
    
    const verDetalleAbono = (abono) => {
        setAbonoSeleccionado(abono);
        setMostrarModalDetalleAbono(true);
    };

    const anularAbono = (abonoId) => {
        // Lógica para anular abono
    };

    // Funciones para manejar los productos/insumos (sin cambios por la API)
    const handleCantidadChange = (id, e) => {
        // Lógica de cambio de cantidad
    };
    const abrirModalAdiciones = (id) => {
        // Lógica para abrir modal
    };
    const abrirModalSalsas = (id) => {
        // Lógica para abrir modal
    };
    const abrirModalRellenos = (id) => {
        // Lógica para abrir modal
    };
    const removeInsumo = (id) => {
        // Lógica para remover insumo
    };
    const removeAdicion = (insumoId, adicionId) => {
        // Lógica para remover adición
    };
    const removeSalsa = (insumoId, salsaId) => {
        // Lógica para remover salsa
    };
    const removeRelleno = (insumoId, rellenoId) => {
        // Lógica para remover relleno
    };
    const agregarInsumos = (insumos) => {
        // Lógica para agregar insumos
    };
    const agregarAdiciones = (adiciones) => {
        // Lógica para agregar adiciones
    };
    const agregarSalsas = (salsas) => {
        // Lógica para agregar salsas
    };
    const agregarRellenos = (rellenos) => {
        // Lógica para agregar rellenos
    };
    const subtotal = 0; // Lógica para calcular
    const iva = 0; // Lógica para calcular
    const total = 0; // Lógica para calcular
    

    const renderContent = () => {
        if (mostrarAgregarVenta) {
            return (
                <VentasCrear
                    ventaData={ventaData}
                    handleChange={(e) => setVentaData({ ...ventaData, [e.target.name]: e.target.value })}
                    erroresValidacion={erroresValidacion}
                    insumosSeleccionados={insumosSeleccionados}
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
                    setMostrarModalInsumos={setMostrarModalInsumos}
                    subtotal={subtotal}
                    iva={iva}
                    total={total}
                    guardarVenta={guardarVenta}
                    setMostrarAgregarVenta={setMostrarAgregarVenta}
                    mostrarModalInsumos={mostrarModalInsumos}
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
            );
        } else if (mostrarVerDetalle && ventaSeleccionada) {
            return (
                <VentasVerDetalle
                    ventaSeleccionada={ventaSeleccionada}
                    onBackToList={() => {
                        setMostrarVerDetalle(false);
                        setVentaSeleccionada(null);
                    }}
                />
            );
        } else {
            return (
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
                />
            );
        }
    };
    
    return (
        <div className="admin-wrapper">
            <div className="admin-actions">
                <button 
                    className="admin-button pink"
                    onClick={() => {
                        setMostrarAgregarVenta(true);
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
                        setInsumosSeleccionados([]);
                    }}
                >
                    + Agregar Venta
                </button>
            </div>
            
            <SearchBar filtro={filtro} setFiltro={setFiltro} />

            {renderContent()}

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