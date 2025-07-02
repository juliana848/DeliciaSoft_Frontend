// ventas.jsx
import React, { useState, useEffect } from 'react';
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

    // New state for filter type - Default to 'directa'
    const [filtroTipoVenta, setFiltroTipoVenta] = useState('directa'); // 'directa', 'pedido'

    useEffect(() => {
        const mockVentas = [
            {
                id: 1,
                cliente: 'Laura Sánchez',
                sede: 'San Benito',
                metodo_pago: 'Efectivo',
                estado: 'Venta directa',
                tipo_venta: 'directa', // ADDED: Explicit tipo_venta
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
                tipo_venta: 'pedido', // ADDED: Explicit tipo_venta
                fecha_venta: '02/06/2025',
                fecha_entrega: '07/06/2025', // ADDED: Example for pedido
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
                tipo_venta: 'pedido', // ADDED: Explicit tipo_venta
                fecha_venta: '03/06/2025',
                fecha_entrega: '10/06/2025', // ADDED: Example for pedido
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
                tipo_venta: 'pedido', // ADDED: Explicit tipo_venta
                fecha_venta: '04/06/2025',
                fecha_entrega: '05/06/2025', // ADDED: Example for pedido
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
                tipo_venta: 'pedido', // ADDED: Explicit tipo_venta
                fecha_venta: '05/06/2025',
                fecha_entrega: '08/06/2025', // ADDED: Example for pedido
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
        setVentas(mockVentas);
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
                const nombresCampos = {
                    metodo_pago: 'Método de Pago',
                    total_pagado: 'Total Pagado',
                    fecha: 'Fecha'
                };
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
        setVentas(prevVentas => prevVentas.map(venta => {
            if (venta.id === ventaSeleccionada.id) {
                const montoActualPagado = (venta.abonos || []).reduce((sum, abono) => sum + parseFloat(abono.total_pagado), 0);
                const nuevoTotalPagado = montoActualPagado + parseFloat(abonoData.total_pagado);

                let nuevoEstado = venta.estado;
                if (nuevoTotalPagado >= venta.total) {
                    nuevoEstado = 'Terminado'; // Or 'Pagado', depending on desired state
                } else if (nuevoTotalPagado > 0) {
                    nuevoEstado = 'Por pagar'; // Indicate partial payment
                }

                return {
                    ...venta,
                    abonos: [...(venta.abonos || []), nuevoAbono],
                    estado: nuevoEstado // Update sale state based on payment
                };
            }
            return venta;
        }));

        showNotification('Abono agregado exitosamente', 'success');
        setMostrarModalAgregarAbono(false);
        setAbonoData({
            metodo_pago: '',
            total_pagado: '',
            fecha: new Date().toISOString().split('T')[0],
            comprobante_imagen: null
        });
        setErroresValidacion({});
    };

    const anularAbono = (id) => {
        setAbonos(prev => prev.map(abono =>
            abono.id === id ? { ...abono, anulado: true } : abono
        ));
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
        setVentas(prev => prev.map(v => v.id === ventaSeleccionada.id ? { ...v, estado: 'Anulado', fecha_finalizacion: new Date().toLocaleDateString() } : v));
        cerrarModal();
        showNotification('Venta anulada exitosamente');
    };

    const ventasFiltradas = ventas
        .filter(v => {
            const lowerCaseFiltro = filtro.toLowerCase();
            const matchesSearch = (
                (v.cliente || '').toLowerCase().includes(lowerCaseFiltro) ||
                (v.sede || '').toLowerCase().includes(lowerCaseFiltro) ||
                (v.id && String(v.id).includes(lowerCaseFiltro))
            );

            // Only filter by the selected type ('directa' or 'pedido')
            return matchesSearch && v.tipo_venta === filtroTipoVenta;
        })
        .sort((a, b) => {
            // Sort 'Anulado' sales to the end within their respective tipo_venta groups
            if (a.estado === 'Anulado' && b.estado !== 'Anulado') {
                return 1; // 'a' (Anulado) comes after 'b'
            }
            if (a.estado !== 'Anulado' && b.estado === 'Anulado') {
                return -1; // 'a' comes before 'b' (Anulado)
            }
            // If both are 'Anulado' or both are not 'Anulado', maintain original order or secondary sort
            return 0;
        });

    const removeInsumo = (id) => {
        setInsumosSeleccionados(prev => prev.filter(item => item.id !== id));
        showNotification('Producto eliminado');
    };

    const handleCantidadChange = (id, cantidad) => {
        setInsumosSeleccionados(prev => prev.map(item =>
            item.id === id ? { ...item, cantidad: parseInt(cantidad) || 0 } : item
        ));
    };

    const abrirModalAdiciones = (productId) => {
        setProductoEditandoId(productId);
        setMostrarModalAdiciones(true);
    };

    const abrirModalSalsas = (productId) => {
        setProductoEditandoId(productId);
        setMostrarModalSalsas(true);
    };

    const abrirModalRellenos = (productId) => {
        setProductoEditandoId(productId);
        setMostrarModalRellenos(true);
    };

    const getRowClassName = (data) => {
        return {
            'anulado-row': data.estado === 'Anulado'
        };
    };

    const subtotal = insumosSeleccionados.reduce((sum, item) => {
        const adicionesCost = item.adiciones.reduce((acc, ad) => acc + (ad.precio * (ad.cantidad || 1)), 0);
        const salsasCost = item.salsas.reduce((acc, sal) => acc + (sal.precio * (sal.cantidad || 1)), 0);
        const rellenosCost = item.sabores.reduce((acc, re) => acc + (re.precio * (re.cantidad || 1)), 0);
        const itemTotal = (item.precio * item.cantidad) + adicionesCost + salsasCost + rellenosCost;
        return sum + itemTotal;
    }, 0);

    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    const manejarCambioEstado = (venta, nuevoEstado) => {
        setVentas(prev => prev.map(v => v.id === venta.id ? { ...v, estado: nuevoEstado } : v
        ));
        showNotification(`Estado actualizado a "${nuevoEstado}"`);
    };

    const guardarVenta = () => {
        const errores = validarFormularioVenta();
        if (Object.keys(errores).length > 0) {
            setErroresValidacion(errores);
            const camposFaltantes = Object.entries(errores).map(([campo, mensaje]) => {
                const nombresCampos = {
                    tipo_venta: 'Tipo de Venta',
                    cliente: 'Cliente',
                    sede: 'Sede',
                    metodo_pago: 'Método de Pago',
                    fecha_venta: 'Fecha de Venta',
                    fecha_entrega: 'Fecha de Entrega', // ADDED: Field name for error message
                    productos: 'Productos'
                };
                return `${nombresCampos[campo] || campo}: ${mensaje}`;
            });
            showNotification(`Faltan campos por completar:\n${camposFaltantes.join('\n')}`, 'error');
            return;
        }

        const nuevaVenta = {
            id: ventas.length > 0 ? Math.max(...ventas.map(v => v.id)) + 1 : 1, // Ensure unique ID
            ...ventaData,
            productos: insumosSeleccionados.map(item => ({
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
            estado: ventaData.tipo_venta === 'directa' ? 'Venta directa' : 'Pendiente', // Use 'directa' or 'pedido' for consistency
            fecha_finalizacion: ventaData.tipo_venta === 'directa' ? new Date().toLocaleDateString() : ''
        };

        setVentas(prev => [...prev, nuevaVenta]);
        showNotification('Venta guardada correctamente', 'success');
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
        setMostrarAgregarVenta(false); // Hide the form after saving
    };

    const handleAbonoChange = (e) => {
        const { name, value } = e.target;
        setAbonoData(prev => ({ ...prev, [name]: value }));
        if (erroresValidacion[name]) {
            setErroresValidacion(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const agregarInsumos = (nuevosInsumos) => {
        setInsumosSeleccionados(prev => [
            ...prev,
            ...nuevosInsumos
                .filter(nuevo => !prev.some(i => i.id === nuevo.id))
                .map(item => ({ ...item, cantidad: 1, adiciones: [], salsas: [], sabores: [] }))
        ]);
        if (erroresValidacion.productos) {
            setErroresValidacion(prev => {
                const newErrors = { ...prev };
                delete newErrors.productos;
                return newErrors;
            });
        }
        showNotification('Productos agregados exitosamente');
    };

    const agregarAdiciones = (nuevasAdiciones) => {
        setInsumosSeleccionados(prev => prev.map(item =>
            item.id === productoEditandoId ?
                {
                    ...item,
                    adiciones: [
                        ...item.adiciones,
                        ...nuevasAdiciones.filter(nuevo => !item.adiciones.some(a => a.id === nuevo.id))
                    ]
                } : item
        ));
        showNotification('Adiciones agregadas exitosamente');
        setMostrarModalAdiciones(false);
        setProductoEditandoId(null);
    };

    const agregarSalsas = (nuevasSalsas) => {
        setInsumosSeleccionados(prev => prev.map(item =>
            item.id === productoEditandoId ?
                {
                    ...item,
                    salsas: [
                        ...item.salsas,
                        ...nuevasSalsas.filter(nuevo => !item.salsas.some(s => s.id === nuevo.id))
                    ]
                } : item
        ));
        showNotification('Salsas agregadas exitosamente');
        setMostrarModalSalsas(false);
        setProductoEditandoId(null);
    };

    const agregarRellenos = (nuevosRellenos) => {
        setInsumosSeleccionados(prev => prev.map(item =>
            item.id === productoEditandoId ?
                {
                    ...item,
                    sabores: [
                        ...item.sabores,
                        ...nuevosRellenos.filter(nuevo => !item.sabores.some(r => r.id === nuevo.id))
                    ]
                } : item
        ));
        showNotification('Rellenos agregados exitosamente');
        setMostrarModalRellenos(false);
        setProductoEditandoId(null);
    };

    const removeAdicion = (productoId, adicionId) => {
        setInsumosSeleccionados(prev => prev.map(item =>
            item.id === productoId ?
                { ...item, adiciones: item.adiciones.filter(a => a.id !== adicionId) } : item
        ));
        showNotification('Adición eliminada');
    };

    const removeSalsa = (productoId, salsaId) => {
        setInsumosSeleccionados(prev => prev.map(item =>
            item.id === productoId ?
                { ...item, salsas: item.salsas.filter(s => s.id !== salsaId) } : item
        ));
        showNotification('Salsa eliminada');
    };

    const removeRelleno = (productoId, rellenoId) => {
        setInsumosSeleccionados(prev => prev.map(item =>
            item.id === productoId ?
                { ...item, sabores: item.sabores.filter(r => r.id !== rellenoId) } : item
        ));
        showNotification('Relleno eliminado');
    };


    return (
        <div className="admin-container" style={{ padding: '20px', backgroundColor: 'rgb(251, 234, 242)', minHeight: '100vh' }}>


            <AppNotification
                visible={notification.visible}
                mensaje={notification.mensaje}
                tipo={notification.tipo}
                onClose={hideNotification}
            />

            {!mostrarAgregarVenta ? (
                <>

                    <div className="admin-button-container" style={{ marginBottom: '15px' }}>
                        <button
                            className="admin-button pink"
                            onClick={() => setMostrarAgregarVenta(true)}
                            type="button"
                        >
                            + Agregar
                        </button>
                                            <SearchBar
                        filtro={filtro}
                        setFiltro={setFiltro}
                        placeholder="Buscar por cliente, sede, o ID de venta..."
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
            ) : (
                <VentasCrear
                    ventaData={ventaData}
                    handleChange={(e) => {
                        const { name, value } = e.target;
                        setVentaData(prev => ({ ...prev, [name]: value }));
                        if (erroresValidacion && erroresValidacion.hasOwnProperty(name)) {
                            setErroresValidacion(prev => ({ ...prev, [name]: '' }));
                        }
                    }}
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
            )}

            <VentasDetalleModal
                visible={modalVisible && modalTipo === 'visualizar'}
                onClose={cerrarModal}
                ventaSeleccionada={ventaSeleccionada}
                showProductOptions={showProductOptions}
                setShowProductOptions={setShowProductOptions}
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
                handleAbonoChange={handleAbonoChange}
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