// ventas.jsx
import React, { useState, useEffect, useMemo } from 'react'; // ADDED: useMemo
import '../../adminStyles.css'; // Asegúrate de que este archivo CSS exista

// Importar los nuevos componentes
import VentasListar from './VentasListar';
import VentasCrear from './VentasCrear';
import VentasAnularModal from './VentasAnularModal';
import VentasDetalleModal from './VentasDetalleModal';
import VentasAbonosModal from './VentasAbonosModal';
import VentasAgregarAbonoModal from './VentasAgregarAbonoModal';
import VentasDetalleAbonoModal from './VentasDetalleAbonoModal';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Renamed import from Notification to AppNotification
import AppNotification from '../../components/Notification';
import SearchBar from '../../components/SearchBar'; // ADDED: Import SearchBar

export default function Ventas() {
    const [allSales, setAllSales] = useState([]); // RENAMED: from 'ventas' to 'allSales' to hold all data
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

    const [showProductOptions, setShowProductOptions] = useState({});

    const [mostrarAgregarVenta, setMostrarAgregarVenta] = useState(false); // This controls visibility of VentasCrear
    const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);
    const [mostrarModalInsumos, setMostrarModalInsumos] = useState(false);

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

    const [abonos, setAbonos] = useState([]);
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

    // State for filter type - Default to 'directa'
    const [filtroTipoVenta, setFiltroTipoVenta] = useState('directa'); // 'directa', 'pedido', 'anulado'

    useEffect(() => {
        const mockVentas = [
            {
                id: 1,
                cliente: 'Laura Sánchez',
                sede: 'San Benito',
                metodo_pago: 'Efectivo',
                estado: 'Venta directa',
                tipo_venta: 'directa',
                fecha_venta: '01/06/2025',
                fecha_finalizacion: '01/06/2025',
                productos: [
                    { id: 101, nombre: 'Harina', cantidad: 5, precio: 20000, adiciones: [], salsas: [], sabores: [] },
                    { id: 102, nombre: 'Azúcar', cantidad: 3, precio: 15000, adiciones: [], salsas: [], sabores: [] },
                    {
                        id: 103,
                        nombre: 'Pastel de Chocolate',
                        cantidad: 1,
                        precio: 35000,
                        adiciones: [
                            { id: 1, nombre: 'Chispas de Chocolate', precio: 2000 },
                            { id: 2, nombre: 'Frutos Rojos', precio: 3000 }
                        ],
                        salsas: [
                            { id: 1, nombre: 'Salsa de Arequipe', precio: 0 },
                            { id: 2, nombre: 'Salsa de Chocolate', precio: 0 }
                        ],
                        sabores: [
                            { id: 1, nombre: 'Relleno de Vainilla', precio: 4000 },
                            { id: 2, nombre: 'Relleno de Crema', precio: 3500 }
                        ]
                    },
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
                tipo_venta: 'pedido',
                fecha_venta: '02/06/2025',
                fecha_entrega: '07/06/2025',
                fecha_finalizacion: '',
                productos: [
                    {
                        id: 201,
                        nombre: 'Galletas surtidas',
                        cantidad: 10,
                        precio: 8000,
                        adiciones: [
                            { id: 3, nombre: 'Cobertura de Chocolate', precio: 1500 }
                        ],
                        salsas: [],
                        sabores: []
                    },
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
                tipo_venta: 'pedido',
                fecha_venta: '03/06/2025',
                fecha_entrega: '10/06/2025',
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
                tipo_venta: 'pedido',
                fecha_venta: '04/06/2025',
                fecha_entrega: '05/06/2025',
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
                tipo_venta: 'pedido',
                fecha_venta: '05/06/2025',
                fecha_entrega: '08/06/2025',
                fecha_finalizacion: '',
                productos: [
                    { id: 501, nombre: 'Colorantes', cantidad: 5, precio: 5000, adiciones: [], salsas: [], sabores: [] },
                    { id: 502, nombre: 'Decoraciones', cantidad: 10, precio: 3500, adiciones: [], salsas: [], sabores: [] },
                ],
                subtotal: 60000,
                iva: 11400,
                total: 71400
            },
            {
                id: 6,
                cliente: 'María Fernanda',
                sede: 'San Benito',
                metodo_pago: 'Efectivo',
                estado: 'Anulado',
                tipo_venta: 'directa',
                fecha_venta: '06/06/2025',
                fecha_finalizacion: '06/06/2025',
                productos: [
                    { id: 601, nombre: 'Harina de Almendras', cantidad: 2, precio: 25000, adiciones: [], salsas: [], sabores: [] },
                ],
                subtotal: 50000,
                iva: 9500,
                total: 59500
            },
            {
                id: 7,
                cliente: 'Roberto Casas',
                sede: 'San Pablo',
                metodo_pago: 'Tarjeta',
                estado: 'Anulado',
                tipo_venta: 'pedido',
                fecha_venta: '07/06/2025',
                fecha_entrega: '12/06/2025',
                fecha_finalizacion: '07/06/2025',
                productos: [
                    { id: 701, nombre: 'Chocolates Finos', cantidad: 3, precio: 18000, adiciones: [], salsas: [], sabores: [] },
                ],
                subtotal: 54000,
                iva: 10260,
                total: 64260
            }
        ];
        setAllSales(mockVentas); // Set all sales data here
    }, []);

    const validarFormularioVenta = () => {
        const errores = {};

        if (!ventaData.tipo_venta || ventaData.tipo_venta.trim() === '') {
            errores.tipo_venta = 'El tipo de venta es requerido';
        }

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
            errores.fecha_venta = 'La fecha de venta es requerida';
        }

        if (ventaData.tipo_venta === 'pedido' && (!ventaData.fecha_entrega || ventaData.fecha_entrega.trim() === '')) {
            errores.fecha_entrega = 'La fecha de entrega es requerida para pedidos';
        }

        if (insumosSeleccionados.length === 0) {
            errores.productos = 'Debe agregar al menos un producto';
        }

        return errores;
    };

    const generarPDFVenta = (venta) => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('FACTURA DE VENTA', 20, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Delicias Darsy', 20, 30);
        doc.text('Medellín, Antioquia', 20, 35);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORMACIÓN DE LA VENTA', 20, 50);

        doc.setFont('helvetica', 'normal');
        doc.text(`Cliente: ${venta.cliente}`, 20, 60);
        doc.text(`Sede: ${venta.sede}`, 20, 67);
        doc.text(`Método de Pago: ${venta.metodo_pago}`, 20, 74);
        doc.text(`Estado: ${venta.estado}`, 20, 81);

        doc.text(`Número de Venta: ${venta.id}`, 120, 60);
        doc.text(`Fecha de Venta: ${venta.fecha_venta}`, 120, 67);
        if (venta.fecha_entrega) {
            doc.text(`Fecha de Entrega: ${venta.fecha_entrega}`, 120, 74);
        }
        if (venta.fecha_finalizacion) {
            doc.text(`Fecha Finalización: ${venta.fecha_finalizacion}`, 120, venta.fecha_entrega ? 81 : 74);
        }


        const productosData = venta.productos.map(producto => {
            const subtotalProducto = producto.cantidad * producto.precio;

            let totalAdiciones = 0;
            if (producto.adiciones && producto.adiciones.length > 0) {
                totalAdiciones = producto.adiciones.reduce((sum, adicion) => sum + adicion.precio, 0) * producto.cantidad;
            }

            const totalConAdiciones = subtotalProducto + totalAdiciones;

            return [
                producto.nombre,
                producto.cantidad,
                `$${producto.precio.toFixed(2)}`,
                `$${subtotalProducto.toFixed(2)}`,
                totalAdiciones > 0 ? `$${totalAdiciones.toFixed(2)}` : '-',
                `$${totalConAdiciones.toFixed(2)}`
            ];
        });
        autoTable(doc, {
            head: [['Producto', 'Cant.', 'Precio Unit.', 'Subtotal', 'Adiciones', 'Total']],
            body: productosData,
            startY: 90,
            styles: {
                fillColor: [255, 228, 225],
                textColor: 0,
                fontSize: 9,
            },
            headStyles: {
                fillColor: [255, 105, 180],
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center',
            },
            columnStyles: {
                0: { cellWidth: 50 },
                1: { halign: 'center', cellWidth: 20 },
                2: { halign: 'right', cellWidth: 25 },
                3: { halign: 'right', cellWidth: 25 },
                4: { halign: 'right', cellWidth: 25 },
                5: { halign: 'right', cellWidth: 25 }
            }
        });

        let currentY = doc.lastAutoTable.finalY + 10;

        const productosConAdiciones = venta.productos.filter(p => p.adiciones && p.adiciones.length > 0);

        if (productosConAdiciones.length > 0) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Detalles de Adiciones:', 20, currentY);
            currentY += 7;

            doc.setFont('helvetica', 'normal');
            productosConAdiciones.forEach(producto => {
                doc.text(`• ${producto.nombre}:`, 25, currentY);
                currentY += 5;

                producto.adiciones.forEach(adicion => {
                    doc.text(`  - ${adicion.nombre}: $${adicion.precio.toFixed(2)}`, 30, currentY);
                    currentY += 4;
                });
                currentY += 2;
            });
            currentY += 5;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        const totalStartX = 130;
        doc.text(`Subtotal:`, totalStartX, currentY);
        doc.text(`$${venta.subtotal.toFixed(2)}`, totalStartX + 40, currentY);

        doc.text(`IVA:`, totalStartX, currentY + 7);
        doc.text(`$${venta.iva.toFixed(2)}`, totalStartX + 40, currentY + 7);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`TOTAL:`, totalStartX, currentY + 17);
        doc.text(`$${venta.total.toFixed(2)}`, totalStartX + 40, currentY + 17);

        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('¡Gracias por su compra!', 20, pageHeight - 25);
        doc.text(`Generado el: ${new Date().toLocaleDateString('es-CO')}`, 20, pageHeight - 20);
        doc.text(`Hora: ${new Date().toLocaleTimeString('es-CO')}`, 20, pageHeight - 15);

        doc.save(`venta-${venta.id}-${venta.cliente.replace(/\s+/g, '_')}.pdf`);
    };

    const validarAbono = () => {
        const errores = {};

        if (!abonoData.metodo_pago || abonoData.metodo_pago.trim() === '') {
            errores.metodo_pago = 'El método de pago es requerido';
        }

        if (!abonoData.total_pagado || parseFloat(abonoData.total_pagado) <= 0) {
            errores.total_pagado = 'El monto debe ser mayor a 0';
        }

        if (!abonoData.fecha || abonoData.fecha.trim() === '') {
            errores.fecha = 'La fecha es requerida';
        }

        return errores;
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAbonoData(prev => ({ ...prev, comprobante_imagen: reader.result }));
                showNotification('Imagen cargada exitosamente', 'success');
            };
            reader.readAsDataURL(file);
        } else {
            setAbonoData(prev => ({ ...prev, comprobante_imagen: null }));
        }
    };

    const agregarAbono = () => {
        const errores = validarAbono();
        if (Object.keys(errores).length > 0) {
            setErroresValidacion(errores);
            const camposFaltantes = Object.entries(errores).map(([campo, mensaje]) => {
                const nombresCampos = { metodo_pago: 'Método de Pago', total_pagado: 'Total Pagado', fecha: 'Fecha' };
                return `${nombresCampos[campo] || campo}: ${mensaje}`;
            });
            showNotification(`Faltan campos por completar:\n${camposFaltantes.join('\n')}`, 'error');
            return;
        }

        const nuevoAbono = {
            id: abonos.length > 0 ? Math.max(...abonos.map(a => a.id)) + 1 : 1,
            id_venta: ventaSeleccionada.id,
            ...abonoData,
            fecha: new Date().toLocaleDateString(), // Ensure date is formatted consistently
            anulado: false
        };

        setAbonos(prev => [...prev, nuevoAbono]);
        
        // Update the sale's state if fully paid or partially paid
        setAllSales(prevSales => prevSales.map(venta => { // UPDATED: Changed from setVentas to setAllSales
            if (venta.id === ventaSeleccionada.id) {
                const montoActualPagado = (venta.abonos || []).reduce((sum, abono) => sum + parseFloat(abono.total_pagado), 0);
                const nuevoTotalPagado = montoActualPagado + parseFloat(abonoData.total_pagado);
                let nuevoEstado = venta.estado;
                if (nuevoTotalPagado >= venta.total) {
                    nuevoEstado = 'Terminado'; // Or 'Pagado', depending on desired state
                } else if (nuevoTotalPagado > 0 && venta.estado !== 'Terminado' && venta.estado !== 'Anulado') {
                    // Only change to 'Por pagar' if not already Terminado or Anulado
                    nuevoEstado = 'Por pagar';
                }
                return { ...venta, abonos: [...(venta.abonos || []), nuevoAbono], estado: nuevoEstado };
            }
            return venta;
        }));
        showNotification('Abono agregado exitosamente', 'success');
        setMostrarModalAgregarAbono(false);
        setAbonoData({ metodo_pago: '', total_pagado: '', fecha: new Date().toISOString().split('T')[0], comprobante_imagen: null });
        setErroresValidacion({});
    };

    const anularAbono = (id) => {
        setAbonos(prev => prev.map(abono => abono.id === id ? { ...abono, anulado: true } : abono ));
        showNotification('Abono anulado exitosamente', 'success');
    };

    const verDetalleAbono = (abono) => {
        setAbonoSeleccionado(abono);
        setMostrarModalDetalleAbono(true);
    };

    const toggleProductOptions = (productId) => {
        setShowProductOptions(prev => {
            const newState = {};
            if (prev[productId]) {
                return {};
            } else {
                newState[productId] = true;
                return newState;
            }
        });
    };

    const toggleNestedDetails = (productId) => {
        setNestedDetailsVisible(prev => {
            const newState = {};
            if (prev[productId]) {
                return {};
            } else {
                newState[productId] = true;
                return newState;
            }
        });
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
        setShowProductOptions({});
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setVentaSeleccionada(null);
        setModalTipo(null);
        setShowProductOptions({});
    };

    const anularVenta = () => {
        setAllSales(prev => prev.map(v => // UPDATED: Changed from setVentas to setAllSales
            v.id === ventaSeleccionada.id ? { ...v, estado: 'Anulado', fecha_finalizacion: new Date().toLocaleDateString() } : v
        ));
        cerrarModal();
        showNotification('Venta anulada exitosamente');
    };

    // Filtered sales based on search and tab selection
    const ventasFiltradas = useMemo(() => {
        const lowerCaseFiltro = filtro.toLowerCase();
        return allSales.filter(venta => { // UPDATED: Filter from allSales
            const matchesSearch = (
                (venta.cliente || '').toLowerCase().includes(lowerCaseFiltro) ||
                (venta.sede || '').toLowerCase().includes(lowerCaseFiltro) ||
                (venta.id && String(venta.id).includes(lowerCaseFiltro))
            );

            if (filtroTipoVenta === 'directa') {
                return matchesSearch && venta.tipo_venta === 'directa' && venta.estado !== 'Anulado'; // EXCLUDES Anulado
            } else if (filtroTipoVenta === 'pedido') {
                return matchesSearch && venta.tipo_venta === 'pedido' && venta.estado !== 'Anulado'; // EXCLUDES Anulado
            } else if (filtroTipoVenta === 'anulado') {
                return matchesSearch && venta.estado === 'Anulado'; // ONLY Anulado
            }
            return false; // Should not reach here if filtroTipoVenta is always one of the three
        })
        .sort((a, b) => { // Keep sorting logic
            // Example sorting: Anulled sales always at the end
            if (a.estado === 'Anulado' && b.estado !== 'Anulado') {
                return 1;
            }
            if (b.estado === 'Anulado' && a.estado !== 'Anulado') {
                return -1;
            }
            // Add your default sorting logic here if needed, e.g., by date
            return 0;
        });
    }, [allSales, filtro, filtroTipoVenta]); // Dependencies for useMemo

    // Handler for changes in Estado column in VentasListar
    const manejarCambioEstado = (ventaActualizada, nuevoEstado) => {
        setAllSales(prevSales => prevSales.map(venta => { // UPDATED: Update allSales
            if (venta.id === ventaActualizada.id) {
                return { ...venta, estado: nuevoEstado };
            }
            return venta;
        }));
        showNotification(`Estado de venta ${ventaActualizada.id} actualizado a ${nuevoEstado}`, 'success');
    };

    const getRowClassName = (rowData) => {
        return rowData.estado === 'Anulado' ? 'row-anulado' : ''; // Apply CSS class for anulled rows
    };


    return (
                <div className="admin-container" style={{ padding: '20px', backgroundColor: 'rgb(251, 234, 242)', minHeight: '100vh' }}>

            {/* Notification Component */}
            <AppNotification
                visible={notification.visible}
                mensaje={notification.mensaje}
                tipo={notification.tipo}
                onClose={hideNotification}
            />

            {mostrarAgregarVenta ? (
                <VentasCrear
                    ventaData={ventaData}
                    handleChange={(e) => setVentaData({ ...ventaData, [e.target.name]: e.target.value })}
                    erroresValidacion={erroresValidacion}
                    insumosSeleccionados={insumosSeleccionados}
                    toggleNestedDetails={toggleNestedDetails}
                    nestedDetailsVisible={nestedDetailsVisible}
                    handleCantidadChange={(id, cantidad) => {
                        setInsumosSeleccionados(prev => prev.map(item => item.id === id ? { ...item, cantidad } : item));
                    }}
                    abrirModalAdiciones={(id) => { setProductoEditandoId(id); setMostrarModalAdiciones(true); }}
                    abrirModalSalsas={(id) => { setProductoEditandoId(id); setMostrarModalSalsas(true); }}
                    abrirModalRellenos={(id) => { setProductoEditandoId(id); setMostrarModalRellenos(true); }}
                    removeInsumo={(id) => setInsumosSeleccionados(prev => prev.filter(item => item.id !== id))}
                    removeAdicion={(productoId, adicionId) => {
                        setInsumosSeleccionados(prev => prev.map(prod =>
                            prod.id === productoId ? { ...prod, adiciones: prod.adiciones.filter(ad => ad.id !== adicionId) } : prod
                        ));
                    }}
                    removeSalsa={(productoId, salsaId) => {
                        setInsumosSeleccionados(prev => prev.map(prod =>
                            prod.id === productoId ? { ...prod, salsas: prod.salsas.filter(s => s.id !== salsaId) } : prod
                        ));
                    }}
                    removeRelleno={(productoId, rellenoId) => {
                        setInsumosSeleccionados(prev => prev.map(prod =>
                            prod.id === productoId ? { ...prod, sabores: prod.sabores.filter(r => r.id !== rellenoId) } : prod
                        ));
                    }}
                    setMostrarModalInsumos={setMostrarModalInsumos}
                    subtotal={insumosSeleccionados.reduce((sum, item) => sum + (item.cantidad * item.precio) + item.adiciones.reduce((acc, ad) => acc + ad.precio, 0) * item.cantidad, 0)}
                    iva={(insumosSeleccionados.reduce((sum, item) => sum + (item.cantidad * item.precio) + item.adiciones.reduce((acc, ad) => acc + ad.precio, 0) * item.cantidad, 0)) * 0.19}
                    total={insumosSeleccionados.reduce((sum, item) => sum + (item.cantidad * item.precio) + item.adiciones.reduce((acc, ad) => acc + ad.precio, 0) * item.cantidad, 0) * 1.19}
                    guardarVenta={() => {
                        const errores = validarFormularioVenta();
                        if (Object.keys(errores).length > 0) {
                            setErroresValidacion(errores);
                            const camposFaltantes = Object.entries(errores).map(([campo, mensaje]) => {
                                const nombresCampos = {
                                    tipo_venta: 'Tipo de Venta', cliente: 'Cliente', sede: 'Sede',
                                    metodo_pago: 'Método de Pago', fecha_venta: 'Fecha de Venta',
                                    fecha_entrega: 'Fecha de Entrega', productos: 'Productos'
                                };
                                return `${nombresCampos[campo] || campo}: ${mensaje}`;
                            });
                            showNotification(`Faltan campos por completar:\n${camposFaltantes.join('\n')}`, 'error');
                            return;
                        }

                        const nuevaVenta = {
                            id: allSales.length > 0 ? Math.max(...allSales.map(v => v.id)) + 1 : 1, // Use allSales
                            ...ventaData,
                            productos: insumosSeleccionados,
                            subtotal: insumosSeleccionados.reduce((sum, item) => sum + (item.cantidad * item.precio) + item.adiciones.reduce((acc, ad) => acc + ad.precio, 0) * item.cantidad, 0),
                            iva: (insumosSeleccionados.reduce((sum, item) => sum + (item.cantidad * item.precio) + item.adiciones.reduce((acc, ad) => acc + ad.precio, 0) * item.cantidad, 0)) * 0.19,
                            total: insumosSeleccionados.reduce((sum, item) => sum + (item.cantidad * item.precio) + item.adiciones.reduce((acc, ad) => acc + ad.precio, 0) * item.cantidad, 0) * 1.19,
                            fecha_registro: new Date().toLocaleDateString(),
                            estado: ventaData.tipo_venta === 'directa' ? 'Venta directa' : 'Pendiente'
                        };

                        setAllSales(prev => [...prev, nuevaVenta]); // Use setAllSales
                        showNotification('Venta guardada exitosamente');
                        setMostrarAgregarVenta(false);
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
                        setErroresValidacion({});
                    }}
                    setMostrarAgregarVenta={setMostrarAgregarVenta}
                    mostrarModalInsumos={mostrarModalInsumos}
                    agregarInsumos={(nuevosInsumos) => {
                        setInsumosSeleccionados(prev => {
                            const newInsumos = [...prev];
                            nuevosInsumos.forEach(nuevo => {
                                const existingIndex = newInsumos.findIndex(item => item.id === nuevo.id);
                                if (existingIndex > -1) {
                                    newInsumos[existingIndex].cantidad += nuevo.cantidad;
                                } else {
                                    newInsumos.push({ ...nuevo, adiciones: [], salsas: [], sabores: [] });
                                }
                            });
                            return newInsumos;
                        });
                    }}
                    mostrarModalAdiciones={mostrarModalAdiciones}
                    agregarAdiciones={(adicionesToAdd) => {
                        setInsumosSeleccionados(prev => prev.map(item =>
                            item.id === productoEditandoId ? { ...item, adiciones: adicionesToAdd } : item
                        ));
                        setMostrarModalAdiciones(false);
                        setProductoEditandoId(null);
                    }}
                    mostrarModalSalsas={mostrarModalSalsas}
                    agregarSalsas={(salsasToAdd) => {
                        setInsumosSeleccionados(prev => prev.map(item =>
                            item.id === productoEditandoId ? { ...item, salsas: salsasToAdd } : item
                        ));
                        setMostrarModalSalsas(false);
                        setProductoEditandoId(null);
                    }}
                    mostrarModalRellenos={mostrarModalRellenos}
                    agregarRellenos={(rellenosToAdd) => {
                        setInsumosSeleccionados(prev => prev.map(item =>
                            item.id === productoEditandoId ? { ...item, sabores: rellenosToAdd } : item
                        ));
                        setMostrarModalRellenos(false);
                        setProductoEditandoId(null);
                    }}
                    setProductoEditandoId={setProductoEditandoId}
                    productoEditandoId={productoEditandoId}
                />
            ) : (
                <>
                    <div className="admin-toolbar">
                        <button className="admin-button pink" onClick={() => setMostrarAgregarVenta(true)}>
                            + Agregar
                        </button>
                        <SearchBar
                            filtro={filtro}
                            setFiltro={setFiltro}
                            placeholder="Buscar por cliente, sede o N° de venta"
                        />
                    </div>

                    <VentasListar
                        ventasFiltradas={ventasFiltradas}
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
                    />
                </>
            )}

            <VentasDetalleModal
                visible={modalVisible && modalTipo === 'visualizar'}
                onClose={cerrarModal}
                ventaSeleccionada={ventaSeleccionada}
                showProductOptions={showProductOptions}
                setShowProductOptions={toggleProductOptions}
            />

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
                abonos={abonos.filter(abono => abono.id_venta === ventaSeleccionada?.id)}
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
            />
        </div>
    );
}