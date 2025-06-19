import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import '../adminStyles.css'; // Asegúrate de que este archivo CSS exista
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';
import AgregarProductosModal from '../components/catalogos/AgregarProductosModal';
import AgregarAdicionesModal from '../components/catalogos/AgregarAdicionesModal';
import AgregarSalsasModal from '../components/catalogos/AgregarSalsasModal';
import AgregarRellenosModal from '../components/catalogos/AgregarRellenosModal';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

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

    // Nuevo estado para controlar la visibilidad de la modal de opciones por producto
    const [showProductOptions, setShowProductOptions] = useState({});

    const [mostrarAgregarVenta, setMostrarAgregarVenta] = useState(false);
    const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);
    const [mostrarModalInsumos, setMostrarModalInsumos] = useState(false);
    
    // Estado para errores de validación
    const [erroresValidacion, setErroresValidacion] = useState({});

    const [ventaData, setVentaData] = useState({
        cod_venta: '00000000',
        tipo_venta: '',
        cliente: '',
        sede: '',
        metodo_pago: '',
        fecha_venta: new Date().toISOString().split('T')[0], // Fecha automática
        fecha_registro: '',
        observaciones: ''
    });

    const [abonos, setAbonos] = useState([]);
    const [mostrarModalAbonos, setMostrarModalAbonos] = useState(false);
    const [mostrarModalAgregarAbono, setMostrarModalAgregarAbono] = useState(false);
    const [abonoData, setAbonoData] = useState({
        metodo_pago: '',
        total_pagado: '',
        fecha: new Date().toISOString().split('T')[0], // Fecha automática para abonos
        comprobante_imagen: null // AQUI: Campo de imagen para el comprobante
    });

    // NUEVOS ESTADOS para el detalle del abono
    const [abonoSeleccionado, setAbonoSeleccionado] = useState(null);
    const [mostrarModalDetalleAbono, setMostrarModalDetalleAbono] = useState(false);

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
                        sabores: [ // Usamos 'sabores' para representar rellenos
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
                fecha_venta: '02/06/2025',
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

    // Función para validar el formulario de venta
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

        if (insumosSeleccionados.length === 0) {
            errores.productos = 'Debe agregar al menos un producto';
        }

        return errores;
    };


    const generarPDFVenta = (venta) => {
        const doc = new jsPDF();

        // Título principal
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('FACTURA DE VENTA', 20, 20);

        // Información de la empresa
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Delicias Darsy', 20, 30);
        doc.text('Medellín, Antioquia', 20, 35);

        // Información de la venta - Lado izquierdo
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORMACIÓN DE LA VENTA', 20, 50);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Cliente: ${venta.cliente}`, 20, 60);
        doc.text(`Sede: ${venta.sede}`, 20, 67);
        doc.text(`Método de Pago: ${venta.metodo_pago}`, 20, 74);
        doc.text(`Estado: ${venta.estado}`, 20, 81);

        // Información - Lado derecho
        doc.text(`Número de Venta: ${venta.id}`, 120, 60);
        doc.text(`Fecha de Venta: ${venta.fecha_venta}`, 120, 67);
        if (venta.fecha_finalizacion) {
            doc.text(`Fecha Finalización: ${venta.fecha_finalizacion}`, 120, 74);
        }

        // Preparar datos de productos con adiciones
        const productosData = venta.productos.map(producto => {
            const subtotalProducto = producto.cantidad * producto.precio;
            
            // Calcular total de adiciones
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
                fillColor: [255, 228, 225], // Rosa claro (igual que compras)
                textColor: 0,
                fontSize: 9,
            },
            headStyles: {
                fillColor: [255, 105, 180], // Rosa fuerte (igual que compras)
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center',
            },
            columnStyles: {
                0: { cellWidth: 50 }, // Producto
                1: { halign: 'center', cellWidth: 20 }, // Cantidad
                2: { halign: 'right', cellWidth: 25 }, // Precio Unit.
                3: { halign: 'right', cellWidth: 25 }, // Subtotal
                4: { halign: 'right', cellWidth: 25 }, // Adiciones
                5: { halign: 'right', cellWidth: 25 }  // Total
            }
        });

        // Mostrar detalles de adiciones si existen
        let currentY = doc.lastAutoTable.finalY + 10;
        
        // Verificar si hay productos con adiciones para mostrar detalles
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

        // Totales
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        // Cuadro de totales - lado derecho
        const totalStartX = 130;
        doc.text(`Subtotal:`, totalStartX, currentY);
        doc.text(`$${venta.subtotal.toFixed(2)}`, totalStartX + 40, currentY);
        
        doc.text(`IVA:`, totalStartX, currentY + 7);
        doc.text(`$${venta.iva.toFixed(2)}`, totalStartX + 40, currentY + 7);
        
        // Total destacado
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`TOTAL:`, totalStartX, currentY + 17);
        doc.text(`$${venta.total.toFixed(2)}`, totalStartX + 40, currentY + 17);

        // Pie de página
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('¡Gracias por su compra!', 20, pageHeight - 25);
        doc.text(`Generado el: ${new Date().toLocaleDateString('es-CO')}`, 20, pageHeight - 20);
        doc.text(`Hora: ${new Date().toLocaleTimeString('es-CO')}`, 20, pageHeight - 15);

        // Guardar PDF
        doc.save(`venta-${venta.id}-${venta.cliente.replace(/\s+/g, '_')}.pdf`);
    };

    // 3. Función alternativa más simple (sin tabla de adiciones)
    const generarPDFVentaSimple = (venta) => {
        const doc = new jsPDF();

        // Título
        doc.setFontSize(16);
        doc.text('Detalle de Venta', 20, 20);

        // Información básica
        doc.setFontSize(12);
        doc.text(`Cliente: ${venta.cliente}`, 20, 35);
        doc.text(`Sede: ${venta.sede}`, 20, 42);
        doc.text(`Fecha: ${venta.fecha_venta}`, 20, 49);
        doc.text(`Estado: ${venta.estado}`, 20, 56);
        doc.text(`Método de Pago: ${venta.metodo_pago}`, 20, 63);

        // Productos
        doc.text('Productos:', 20, 80);
        let yPos = 90;
        
        venta.productos.forEach((producto, index) => {
            const subtotal = producto.cantidad * producto.precio;
            doc.text(`• ${producto.nombre} - Cant: ${producto.cantidad} - $${producto.precio.toFixed(2)} = $${subtotal.toFixed(2)}`, 25, yPos);
            yPos += 7;
            
            // Mostrar adiciones si las tiene
            if (producto.adiciones && producto.adiciones.length > 0) {
                producto.adiciones.forEach(adicion => {
                    doc.text(`  + ${adicion.nombre}: $${adicion.precio.toFixed(2)}`, 30, yPos);
                    yPos += 5;
                });
            }
            yPos += 3;
        });

        // Totales
        yPos += 10;
        doc.text(`Subtotal: $${venta.subtotal.toFixed(2)}`, 20, yPos);
        doc.text(`IVA: $${venta.iva.toFixed(2)}`, 20, yPos + 7);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL: $${venta.total.toFixed(2)}`, 20, yPos + 17);

        doc.save(`venta-${venta.id}.pdf`);
    };

    // Función para validar abonos
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

        // No se valida comprobante_imagen como requerido por ahora
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

        const totalPagado = parseFloat(abonoData.total_pagado);
        const ventaTotal = ventaSeleccionada.total;
        const faltaPorPagar = ventaTotal - totalPagado;

        const nuevoAbono = {
            id: Date.now(),
            fecha: abonoData.fecha,
            metodo_pago: abonoData.metodo_pago,
            monto: totalPagado,
            falta_por_pagar: faltaPorPagar,
            comprobante_imagen: abonoData.comprobante_imagen, // Incluir la imagen
            anulado: false // Nuevo campo para anular
        };

        setAbonos(prev => [...prev, nuevoAbono]);
        setAbonoData({
            metodo_pago: '',
            total_pagado: '',
            fecha: new Date().toISOString().split('T')[0],
            comprobante_imagen: null // Resetear el campo de imagen
        });
        setErroresValidacion({});
        setMostrarModalAgregarAbono(false);
        showNotification('Abono registrado exitosamente');
    };

    // NUEVAS FUNCIONES para anular y ver detalle del abono
    const anularAbono = (abonoId) => {
        setAbonos(prev =>
            prev.map(abono =>
                abono.id === abonoId ? { ...abono, anulado: true } : abono
            )
        );
        showNotification('Abono anulado exitosamente', 'success');
    };

    const verDetalleAbono = (abono) => {
        setAbonoSeleccionado(abono);
        setMostrarModalDetalleAbono(true);
    };
    
    // Función para alternar la visibilidad de las opciones de un producto (solo una a la vez)
    const toggleProductOptions = (productId) => {
        setShowProductOptions(prev => {
            const newState = {};
            // Si el producto clickeado ya estaba abierto, lo cerramos
            if (prev[productId]) {
                return {};
            } else {
                // Si no, cerramos todos y abrimos solo el clickeado
                newState[productId] = true;
                return newState;
            }
        });
    };

    // Función para alternar detalles anidados (también solo uno a la vez)
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
        setShowProductOptions({}); // Reiniciar las opciones de producto al abrir una nueva venta
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setVentaSeleccionada(null);
        setModalTipo(null);
        setShowProductOptions({}); // Asegurarse de ocultar todas las opciones al cerrar el modal principal
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
        const { name, value } = e.target;
        setVentaData({ ...ventaData, [name]: value });
        
        // Limpiar error específico cuando el usuario corrige el campo
        if (erroresValidacion[name]) {
            setErroresValidacion(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // New handler for abonoData to clear errors
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
                .map(item => ({ ...item, cantidad: 1, adiciones: [], salsas: [], sabores: [] })) // Inicializar arrays vacíos
        ]);
        
        // Limpiar error de productos si había
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
                item.id === id ? { ...item, cantidad: Math.max(1, value) } : item
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

    const guardarVenta = () => {
        const errores = validarFormularioVenta();
        
        if (Object.keys(errores).length > 0) {
            setErroresValidacion(errores);
            
            // Mostrar alertas específicas para cada campo faltante
            const camposFaltantes = Object.entries(errores).map(([campo, mensaje]) => {
                const nombresCampos = {
                    tipo_venta: 'Tipo de Venta',
                    cliente: 'Cliente',
                    sede: 'Sede',
                    metodo_pago: 'Método de Pago',
                    fecha_venta: 'Fecha de Venta',
                    productos: 'Productos'
                };
                return `${nombresCampos[campo] || campo}: ${mensaje}`;
            });
            
            showNotification(`Faltan campos por completar:\n${camposFaltantes.join('\n')}`, 'error');
            return;
        }

        const nuevaVenta = {
            id: ventas.length + 1,
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
            estado: ventaData.tipo_venta === 'venta directa' ? 'Venta directa' : 'Pendiente',
            fecha_finalizacion: ventaData.tipo_venta === 'venta directa' ? new Date().toLocaleDateString() : ''
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
            fecha_registro: '',
            observaciones: ''
        });
        setInsumosSeleccionados([]);
        setNestedDetailsVisible({});
        setErroresValidacion({});
        setMostrarAgregarVenta(false);
    };

    // Función para obtener el estilo de fila según el estado
    const getRowClassName = (rowData) => {
        return rowData.estado === 'Anulado' ? 'venta-anulada' : '';
    };

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
                            + Agregar
                        </button>
                        <SearchBar
                            placeholder="Buscar cliente..."
                            value={filtro}
                            onChange={setFiltro}
                        />
                    </div>

                    <h2 className="admin-section-title">Ventas</h2>
                    <DataTable
                        value={ventasFiltradas}
                        className="admin-table"
                        paginator rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        rowClassName={getRowClassName}
                    >
                        <Column
                            header="N°"
                            body={(rowData, { rowIndex }) => rowIndex + 1}
                            style={{ width: '3rem', textAlign: 'center' }}
                            headerStyle={{ paddingLeft: '1rem' }}
                        />

                        <Column field="cliente" header="Cliente" headerStyle={{ paddingLeft: '4rem' }}/>
                        <Column field="sede" header="Sede"  headerStyle={{ paddingLeft: '2.5rem' }}/>
                        <Column field="fecha_venta" header="Fecha" headerStyle={{ paddingLeft: '2.5rem' }}/>
                        <Column field="total" header="Total" headerStyle={{ paddingLeft: '1.5rem' }} />
                        <Column
                            header="Estado"
                            headerStyle={{ paddingLeft: '2.5rem' }}
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
                            headerStyle={{ paddingLeft: '6rem' }}
                            body={(rowData) => (
                                <>
                                    <button className="admin-button gray" title="Visualizar" onClick={() => abrirModal('visualizar', rowData)}>
                                        🔍
                                    </button>
                                    <button
                                        className="admin-button red"
                                        title="Anular"
                                        onClick={() => abrirModal('anular', rowData)}
                                        disabled={rowData.estado === 'Anulado'}
                                    >🛑</button>
                                    <button
                                        className="admin-button blue"
                                        title="Descargar PDF"
                                        onClick={() => generarPDFVenta(rowData)}
                                    >
                                        ⬇️
                                    </button>
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
                        {modalTipo === 'visualizar' && ventaSeleccionada && (
                            <div className="detalle-venta-modal">
                                <h3>Detalle de la Venta #{ventaSeleccionada.id}</h3>
                                <div className="modal-content-columns">
                                    <div className="column">
                                        <h4>Información de la Venta:</h4>
                                        <p><strong>Cliente:</strong> {ventaSeleccionada.cliente}</p>
                                        <p><strong>Sede:</strong> {ventaSeleccionada.sede}</p>
                                        <p><strong>Método de Pago:</strong> {ventaSeleccionada.metodo_pago}</p>
                                        <p><strong>Estado:</strong> {ventaSeleccionada.estado}</p>
                                        {ventaSeleccionada.fecha_venta && <p><strong>Fecha de Venta:</strong> {ventaSeleccionada.fecha_venta}</p>}
                                        {ventaSeleccionada.fecha_finalizacion && <p><strong>Fecha de Finalización:</strong> {ventaSeleccionada.fecha_finalizacion}</p>}
                                    </div>
                                    <div className="column">
                                        <h4>Productos Incluidos:</h4>
                                        <div className="productos-lista">
                                            {ventaSeleccionada.productos.length > 0 ? (
                                                ventaSeleccionada.productos.map((item) => (
                                                    <div key={item.id} className="producto-item-container">
                                                        <div className="producto-item-header">
                                                            <div className="producto-info">
                                                                <strong>Producto:</strong> {item.nombre} (Cantidad: {item.cantidad}) - ${item.precio.toLocaleString()} c/u
                                                            </div>
                                                            {/* Mostrar el botón solo si el producto tiene adiciones, salsas o rellenos */}
                                                            {(item.adiciones?.length > 0 || item.salsas?.length > 0 || item.sabores?.length > 0) && (
                                                                <button
                                                                    className="admin-button small-button dropdown-toggle"
                                                                    onClick={() => {
                                                                        // Cerrar todos los otros productos abiertos
                                                                        const newShowState = {};
                                                                        Object.keys(showProductOptions).forEach(key => {
                                                                            newShowState[key] = false;
                                                                        });
                                                                        // Toggle el producto actual
                                                                        newShowState[item.id] = !showProductOptions[item.id];
                                                                        setShowProductOptions(newShowState);
                                                                    }}
                                                                >
                                                                    {showProductOptions[item.id] ? '▲ Ocultar' : '▼ Opciones'}
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Desplegable de opciones dentro del contenedor */}
                                                        {showProductOptions[item.id] && (
                                                            <div className="product-options-dropdown">
                                                                {item.adiciones && item.adiciones.length > 0 && (
                                                                    <div className="options-section">
                                                                        <strong>Adiciones:</strong>
                                                                        <ul>
                                                                            {item.adiciones.map((ad, adIndex) => (
                                                                                <li key={adIndex}>{ad.nombre} (${ad.precio.toLocaleString()})</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                {item.salsas && item.salsas.length > 0 && (
                                                                    <div className="options-section">
                                                                        <strong>Salsas:</strong>
                                                                        <ul>
                                                                            {item.salsas.map((sa, saIndex) => (
                                                                                <li key={saIndex}>{sa.nombre} (${sa.precio.toLocaleString()})</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                {item.sabores && item.sabores.length > 0 && (
                                                                    <div className="options-section">
                                                                        <strong>Rellenos:</strong>
                                                                        <ul>
                                                                            {item.sabores.map((re, reIndex) => (
                                                                                <li key={reIndex}>{re.nombre} (${re.precio.toLocaleString()})</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No hay productos en esta venta.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="resumen-venta">
                                    <p><strong>Subtotal:</strong> ${ventaSeleccionada.subtotal.toLocaleString()}</p>
                                    <p><strong>IVA:</strong> ${ventaSeleccionada.iva.toLocaleString()}</p>
                                    <p><strong>Total:</strong> ${ventaSeleccionada.total.toLocaleString()}</p>
                                </div>
                                <div className="modal-footer">
                                    <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cerrar</button>
                                </div>
                            </div>
                        )}
                    </Modal>
                    {modalTipo === 'anular' && (
                            <Modal visible={modalVisible} onClose={cerrarModal}>
                            <h2 className="modal-title">Confirmar anulación</h2>
                            <div className="modal-body">
                                <p>¿Está seguro que desea anular la venta de {ventaSeleccionada.cliente}?</p>
                                <p style={{ color: '#e53935', fontSize: '14px' }}>
                                    Esta acción no se puede deshacer.
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
                                <button className="modal-btn save-btn" onClick={anularVenta}>Anular</button>
                            </div>
                            </Modal>
                    )}

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
                                                    <th>Comprobante</th> {/* Nueva columna */}
                                                    <th>Acciones</th> {/* Nueva columna */}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {abonos.map(abono => (
                                                    <tr key={abono.id} className={abono.anulado ? 'abono-anulado' : ''}>
                                                        <td>{abono.fecha}</td>
                                                        <td>{abono.metodo_pago}</td>
                                                        <td>${abono.monto.toLocaleString()}</td>
                                                        <td>${abono.falta_por_pagar.toLocaleString()}</td>
                                                        <td>
                                                            {abono.comprobante_imagen ? (
                                                                <img src={abono.comprobante_imagen} alt="Comprobante" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                                            ) : (
                                                                'N/A'
                                                            )}
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="admin-button gray"
                                                                title="Ver Detalle"
                                                                onClick={() => verDetalleAbono(abono)}
                                                            >
                                                                🔍
                                                            </button>
                                                            <button
                                                                className="admin-button red"
                                                                title="Anular Abono"
                                                                onClick={() => anularAbono(abono.id)}
                                                                disabled={abono.anulado}
                                                            >
                                                                🛑
                                                            </button>
                                                        </td>
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
                            onClose={() => {
                                setMostrarModalAgregarAbono(false);
                                setErroresValidacion({}); // Clear errors when modal closes
                            }}
                        >
                            <div className="agregar-abono-modal">
                                <h3>Agregar Abono</h3>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    agregarAbono();
                                }}>
                                    <div className={`form-group ${erroresValidacion.metodo_pago ? 'has-error' : ''}`}>
                                        <label>Método de Pago:</label>
                                        <select
                                            name="metodo_pago"
                                            value={abonoData.metodo_pago}
                                            onChange={handleAbonoChange}
                                            className={erroresValidacion.metodo_pago ? 'field-error' : ''}
                                            required
                                        >
                                            <option value="">Seleccione</option>
                                            <option value="efectivo">Efectivo</option>
                                            <option value="transferencia">Transferencia</option>
                                        </select>
                                        {erroresValidacion.metodo_pago && (
                                            <span className="error-message">{erroresValidacion.metodo_pago}</span>
                                        )}
                                    </div>
                                    <div className={`form-group ${erroresValidacion.total_pagado ? 'has-error' : ''}`}>
                                        <label>Total Pagado:</label>
                                        <input
                                            type="number"
                                            name="total_pagado"
                                            min="0"
                                            step="0.01"
                                            value={abonoData.total_pagado}
                                            onChange={handleAbonoChange}
                                            className={erroresValidacion.total_pagado ? 'field-error' : ''}
                                            required
                                        />
                                        {erroresValidacion.total_pagado && (
                                            <span className="error-message">{erroresValidacion.total_pagado}</span>
                                        )}
                                    </div>
                                    <div className={`form-group ${erroresValidacion.fecha ? 'has-error' : ''}`}>
                                        <label>Fecha:</label>
                                        <input
                                            type="date"
                                            name="fecha"
                                            value={abonoData.fecha}
                                            onChange={handleAbonoChange}
                                            className={erroresValidacion.fecha ? 'field-error' : ''}
                                            required
                                        />
                                        {erroresValidacion.fecha && (
                                            <span className="error-message">{erroresValidacion.fecha}</span>
                                        )}
                                    </div>
                                    {/* Campo para subir imagen */}
                                    <div className="form-group">
                                        <label>Comprobante (Imagen):</label>
                                        <input
                                            type="file"
                                            accept="image/*" // Solo acepta archivos de imagen
                                            onChange={handleImageUpload}
                                        />
                                        {abonoData.comprobante_imagen && (
                                            <img src={abonoData.comprobante_imagen} alt="Previsualización" style={{ maxWidth: '100px', maxHeight: '100px', marginTop: '10px' }} />
                                        )}
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
                                        <button type="button" className="modal-btn cancel-btn" onClick={() => {
                                            setMostrarModalAgregarAbono(false);
                                            setErroresValidacion({});
                                        }}>
                                            Cancelar
                                        </button>
                                        <button type="submit" className="modal-btn save-btn">
                                            Guardar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Modal>
                    )}

                    {/* NUEVA MODAL para Ver Detalle del Abono */}
                    {mostrarModalDetalleAbono && abonoSeleccionado && (
                        <Modal
                            visible={mostrarModalDetalleAbono}
                            onClose={() => setMostrarModalDetalleAbono(false)}
                        >
                            <div className="detalle-abono-modal">
                                <h3>Detalle del Abono #{abonoSeleccionado.id}</h3>
                                <p><strong>Fecha:</strong> {abonoSeleccionado.fecha}</p>
                                <p><strong>Método de Pago:</strong> {abonoSeleccionado.metodo_pago}</p>
                                <p><strong>Monto:</strong> ${abonoSeleccionado.monto.toLocaleString()}</p>
                                <p><strong>Falta por Pagar:</strong> ${abonoSeleccionado.falta_por_pagar.toLocaleString()}</p>
                                <p><strong>Estado:</strong> {abonoSeleccionado.anulado ? 'Anulado' : 'Activo'}</p>
                                
                                {abonoSeleccionado.comprobante_imagen && (
                                    <div className="comprobante-preview">
                                        <h4>Comprobante:</h4>
                                        <img src={abonoSeleccionado.comprobante_imagen} alt="Comprobante de Abono" style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ccc' }} />
                                    </div>
                                )}
                                <div className="modal-footer">
                                    <button className="modal-btn cancel-btn" onClick={() => setMostrarModalDetalleAbono(false)}>Cerrar</button>
                                </div>
                            </div>
                        </Modal>
                    )}

                </>
            ) : (
                
                        // Formulario para agregar venta
                <div className="compra-form-container" >
                    <h1>Agregar</h1>

                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            guardarVenta();
                        }}
                    >
                        <div className="compra-fields-grid">
                            <div className={`field-group ${erroresValidacion.tipo_venta ? 'has-error' : ''}`}>
                            <label>Tipo de Venta <span style={{ color: 'red' }}>*</span></label>
                            <select
                                name="tipo_venta"
                                value={ventaData.tipo_venta}
                                onChange={handleChange}
                                className={erroresValidacion.tipo_venta ? 'field-error' : ''}
                                required
                            >
                                <option value="">Seleccione</option>
                                <option value="venta directa">Venta Directa</option>
                                <option value="pedido">Pedido</option>
                            </select>
                            {erroresValidacion.tipo_venta && (
                                <span className="error-message">{erroresValidacion.tipo_venta}</span>
                            )}
                            </div>
                            <div className={`field-group ${erroresValidacion.fecha_venta ? 'has-error' : ''}`}>
                            <label>Fecha de Venta </label>
                            <input
                                type="date"
                                name="fecha_venta"
                                value={ventaData.fecha_venta}
                                onChange={handleChange}
                                className={erroresValidacion.fecha_venta ? 'field-error' : ''}
                                required
                            />
                            {erroresValidacion.fecha_venta && (
                                <span className="error-message">{erroresValidacion.fecha_venta}</span>
                            )}
                            </div>
                            <div className={`field-group ${erroresValidacion.sede ? 'has-error' : ''}`}>
                                <label>Sede  <span style={{ color: 'red' }}>*</span></label>
                                <select
                                    name="sede"
                                    value={ventaData.sede}
                                    onChange={handleChange}
                                    className={erroresValidacion.sede ? 'field-error' : ''}
                                    required
                                >
                                    <option value="">Seleccione</option>
                                    <option value="San Pablo">San Pablo</option>
                                    <option value="San Benito">San Benito</option>
                                </select>
                                {erroresValidacion.sede && (
                                    <span className="error-message">{erroresValidacion.sede}</span>
                                )}
                                </div>
                            <div className={`field-group ${erroresValidacion.cliente ? 'has-error' : ''}`}>
                            <label>Cliente  <span style={{ color: 'red' }}>*</span></label>
                            <select
                                name="cliente"
                                value={ventaData.cliente}
                                onChange={handleChange}
                                className={erroresValidacion.cliente ? 'field-error' : ''}
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
                            {erroresValidacion.cliente && (
                                <span className="error-message">{erroresValidacion.cliente}</span>
                            )}
                            </div>
                            <div className={`field-group ${erroresValidacion.metodo_pago ? 'has-error' : ''}`}>
                            <label>
                            Método de Pago <span style={{ color: 'red' }}>*</span>
                            </label>
                            <select
                                name="metodo_pago"
                                value={ventaData.metodo_pago}
                                onChange={handleChange}
                                className={erroresValidacion.metodo_pago ? 'field-error' : ''}
                                required
                            >
                                <option value="">Seleccione</option>
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">Transferencia</option>
                            </select>
                            {erroresValidacion.metodo_pago && (
                                <span className="error-message">{erroresValidacion.metodo_pago}</span>
                            )}
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
                                + Agregar
                            </button>
                            {erroresValidacion.productos && (
                                <div className="error-message" style={{marginTop: '8px', textAlign: 'center'}}>
                                    {erroresValidacion.productos}
                                </div>
                            )}
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
                            <button
                                type="button"
                                className="modal-btn cancel-btn"
                                onClick={() => setMostrarAgregarVenta(false)}
                            >
                                Cancelar
                            </button>
                            <button className="modal-btn save-btn" type="submit">
                                Guardar
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