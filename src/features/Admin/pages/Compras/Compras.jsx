import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../../adminStyles.css';
import Modal from '../../components/modal';
import SearchBar from '../../components/SearchBar';
import Notification from '../../components/Notification';
import AgregarInsumosModal from '../../components/AgregarInsumosModal';
import { generarPDFCompra, configurarEmpresa } from '../pdf';
import { XCircle } from 'lucide-react';
import compraApiService from '../../services/compras_services';
import proveedorApiService from '../../services/proveedor_services';
import insumoApiService from '../../services/insumos'; // AGREGADO: Import para actualizar stock

export default function ComprasTable() {
    const [compras, setCompras] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTipo, setModalTipo] = useState(null);
    const [compraSeleccionada, setCompraSeleccionada] = useState(null);
    const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
    const [mostrarAgregarCompra, setMostrarAgregarCompra] = useState(false);
    const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);
    const [mostrarModalInsumos, setMostrarModalInsumos] = useState(false);
    const [mostrarAnuladas, setMostrarAnuladas] = useState(false);
    const [proveedores, setProveedores] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [proveedorId, setProveedorId] = useState("");

    // Estados para el modal de proveedores
    const [modalProveedorVisible, setModalProveedorVisible] = useState(false);
    const [modalProveedorTipo, setModalProveedorTipo] = useState(null);
    const [loadingProveedor, setLoadingProveedor] = useState(false);

    // Estados del formulario de proveedor
    const [tipoProveedor, setTipoProveedor] = useState('Natural');
    const [nombre, setNombre] = useState('');
    const [contacto, setContactoProveedor] = useState('');
    const [correo, setCorreo] = useState('');
    const [direccion, setDireccion] = useState('');
    const [documentoONit, setDocumentoONit] = useState('');
    const [tipoDocumento, setTipoDocumento] = useState('CC');
    const [nombreEmpresa, setNombreEmpresa] = useState('');
    const [nombreContacto, setNombreContacto] = useState('');
    const [estadoProveedor, setEstadoProveedor] = useState(true);

    // Estados de validación para proveedor
    const [errorsProveedor, setErrorsProveedor] = useState({});
    const [touchedProveedor, setTouchedProveedor] = useState({});

    const [errores, setErrores] = useState({
        proveedor: '',
        fecha_compra: '',
        insumos: ''
    });

    const obtenerFechaActual = () => new Date().toISOString().split('T')[0];

    const [compraData, setCompraData] = useState({
        proveedor: '',
        idProveedor: null,
        fechaCompra: '',
        fechaRegistro: obtenerFechaActual(),
        observaciones: ''
    });

    const formatoCOP = (valor) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    };

    const showNotification = (mensaje, tipo = 'success') => {
        setNotification({
            visible: true,
            mensaje,
            tipo
        });
    };

    const hideNotification = () => {
        setNotification({
            visible: false,
            mensaje: '',
            tipo: 'success'
        });
    };

    const cargarProveedores = async () => {
        try {
            const proveedoresAPI = await proveedorApiService.obtenerProveedores();
            setProveedores(proveedoresAPI);
        } catch (error) {
            console.error('Error al cargar proveedores:', error);
            setNotification({
                visible: true,
                mensaje: 'Error al cargar los proveedores: ' + error.message,
                tipo: 'error'
            });
        }
    };

    // Funciones de validación para proveedores
    const validateProveedorField = (field, value) => {
        let error = '';

        switch (field) {
            case 'nombre':
                if (tipoProveedor === 'Natural') {
                    if (!value.trim()) {
                        error = 'El nombre es obligatorio';
                    } else if (value.trim().length < 3) {
                        error = 'El nombre debe tener al menos 3 caracteres';
                    } else if (value.trim().length > 50) {
                        error = 'El nombre no puede tener más de 50 caracteres';
                    } else if (!/^[A-Za-zÀÁÉÍÓÚÑÜ àáéíóúñ\s.]+$/.test(value)) {
                        error = 'El nombre solo puede contener letras, espacios y puntos';
                    }
                }
                break;

            case 'nombreEmpresa':
                if (tipoProveedor === 'Jurídico') {
                    if (!value.trim()) {
                        error = 'El nombre de empresa es obligatorio';
                    } else if (value.trim().length < 3) {
                        error = 'El nombre de empresa debe tener al menos 3 caracteres';
                    } else if (value.trim().length > 50) {
                        error = 'El nombre de empresa no puede tener más de 50 caracteres';
                    }
                }
                break;

            case 'nombreContacto':
                if (tipoProveedor === 'Jurídico') {
                    if (!value.trim()) {
                        error = 'El nombre del contacto es obligatorio';
                    } else if (value.trim().length < 3) {
                        error = 'El nombre del contacto debe tener al menos 3 caracteres';
                    } else if (value.trim().length > 50) {
                        error = 'El nombre del contacto no puede tener más de 50 caracteres';
                    } else if (!/^[A-Za-zÀÁÉÍÓÚÑÜ àáéíóúñ\s.]+$/.test(value)) {
                        error = 'El nombre del contacto solo puede contener letras, espacios y puntos';
                    }
                }
                break;

            case 'contacto':
                if (!value.trim()) {
                    error = 'El contacto es obligatorio';
                } else if (!/^\d+$/.test(value)) {
                    error = 'El contacto debe contener solo números';
                } else if (value.length < 3) {
                    error = 'El contacto debe tener al menos 3 dígitos';
                } else if (value.length > 10) {
                    error = 'El contacto no puede tener más de 10 dígitos';
                }
                break;

            case 'correo':
                if (!value.trim()) {
                    error = 'El correo es obligatorio';
                } else if (value.length > 50) {
                    error = 'El correo no puede tener más de 50 caracteres';
                } else {
                    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!correoRegex.test(value) || !value.includes('@')) {
                        error = 'Correo no válido';
                    }
                }
                break;

            case 'direccion':
                if (!value.trim()) {
                    error = 'La dirección es obligatoria';
                } else if (value.trim().length < 5) {
                    error = 'La dirección debe tener al menos 5 caracteres';
                } else if (value.trim().length > 30) {
                    error = 'La dirección no puede tener más de 30 caracteres';
                }
                break;

            case 'documentoONit':
                const fieldLabel = tipoProveedor === 'Natural' ? 'Documento' : 'NIT';
                if (!value.trim()) {
                    error = `${fieldLabel} es obligatorio`;
                } else if (!/^\d+$/.test(value)) {
                    error = `${fieldLabel} debe contener solo números`;
                } else if (tipoProveedor === 'Natural') {
                    if (value.length < 7) {
                        error = 'El documento debe tener al menos 7 dígitos';
                    } else if (value.length > 10) {
                        error = 'El documento no puede tener más de 10 dígitos';
                    }
                } else {
                    if (value.length < 9) {
                        error = 'El NIT debe tener al menos 9 dígitos';
                    } else if (value.length > 12) {
                        error = 'El NIT no puede tener más de 12 dígitos';
                    }
                }
                break;

            default:
                break;
        }

        return error;
    };

    const handleProveedorFieldChange = (field, value) => {
        switch (field) {
            case 'tipoProveedor':
                setTipoProveedor(value);
                if (value === 'Natural') {
                    setTipoDocumento('CC');
                    setNombreEmpresa('');
                    setNombreContacto('');
                } else {
                    setTipoDocumento('NIT');
                    setNombre('');
                }
                if (documentoONit) {
                    const docError = validateProveedorField('documentoONit', documentoONit);
                    setErrorsProveedor(prev => ({ ...prev, documentoONit: docError }));
                }
                break;
            case 'tipoDocumento':
                setTipoDocumento(value);
                break;
            case 'nombre':
                setNombre(value);
                break;
            case 'nombreEmpresa':
                setNombreEmpresa(value);
                break;
            case 'nombreContacto':
                setNombreContacto(value);
                break;
            case 'contacto':
                setContactoProveedor(value);
                break;
            case 'correo':
                setCorreo(value);
                break;
            case 'direccion':
                setDireccion(value);
                break;
            case 'documentoONit':
                setDocumentoONit(value);
                break;
            case 'estadoProveedor':
                setEstadoProveedor(value);
                break;
        }

        if (touchedProveedor[field]) {
            const error = validateProveedorField(field, value);
            setErrorsProveedor(prev => ({ ...prev, [field]: error }));
        }
    };

    const handleProveedorFieldBlur = (field, value) => {
        setTouchedProveedor(prev => ({ ...prev, [field]: true }));
        const error = validateProveedorField(field, value);
        setErrorsProveedor(prev => ({ ...prev, [field]: error }));

        if (field === 'correo' && !error) {
            const emailExists = proveedores.some(p => p.correo.toLowerCase() === value.toLowerCase());
            if (emailExists) {
                setErrorsProveedor(prev => ({ ...prev, correo: 'Ya existe un proveedor con este correo' }));
            }
        }

        if (field === 'nombre' && !error && tipoProveedor === 'Natural') {
            const nameExists = proveedores.some(p => p.nombre && p.nombre.toLowerCase() === value.toLowerCase());
            if (nameExists) {
                setErrorsProveedor(prev => ({ ...prev, nombre: 'Ya existe un proveedor con este nombre' }));
            }
        }

        if (field === 'nombreEmpresa' && !error && tipoProveedor === 'Jurídico') {
            const nameExists = proveedores.some(p => p.nombreEmpresa && p.nombreEmpresa.toLowerCase() === value.toLowerCase());
            if (nameExists) {
                setErrorsProveedor(prev => ({ ...prev, nombreEmpresa: 'Ya existe un proveedor con este nombre de empresa' }));
            }
        }
    };

    const abrirModalProveedor = () => {
        setModalProveedorTipo('agregar');
        setTipoProveedor('Natural');
        setNombre('');
        setContactoProveedor('');
        setCorreo('');
        setDireccion('');
        setDocumentoONit('');
        setTipoDocumento('CC');
        setNombreEmpresa('');
        setNombreContacto('');
        setEstadoProveedor(true);
        setErrorsProveedor({});
        setTouchedProveedor({});
        setModalProveedorVisible(true);
    };

    const cerrarModalProveedor = () => {
        setModalProveedorVisible(false);
        setModalProveedorTipo(null);
    };

    const validarCamposProveedor = () => {
        let fields = ['contacto', 'correo', 'direccion', 'documentoONit'];

        if (tipoProveedor === 'Natural') {
            fields = [...fields, 'nombre'];
        } else {
            fields = [...fields, 'nombreEmpresa', 'nombreContacto'];
        }

        let hasErrors = false;
        const newErrors = {};

        fields.forEach(field => {
            let value;
            switch (field) {
                case 'nombre': value = nombre; break;
                case 'nombreEmpresa': value = nombreEmpresa; break;
                case 'nombreContacto': value = nombreContacto; break;
                case 'contacto': value = contacto; break;
                case 'correo': value = correo; break;
                case 'direccion': value = direccion; break;
                case 'documentoONit': value = documentoONit; break;
            }

            const error = validateProveedorField(field, value);
            if (error) {
                newErrors[field] = error;
                hasErrors = true;
            }
        });

        // Verificar duplicados
        const emailExists = proveedores.some(p => p.correo.toLowerCase() === correo.toLowerCase());
        if (emailExists) {
            newErrors.correo = 'Ya existe un proveedor con este correo';
            hasErrors = true;
        }

        if (tipoProveedor === 'Natural') {
            const nameExists = proveedores.some(p => p.nombre && p.nombre.toLowerCase() === nombre.toLowerCase());
            if (nameExists) {
                newErrors.nombre = 'Ya existe un proveedor con este nombre';
                hasErrors = true;
            }
        } else {
            const nameExists = proveedores.some(p => p.nombreEmpresa && p.nombreEmpresa.toLowerCase() === nombreEmpresa.toLowerCase());
            if (nameExists) {
                newErrors.nombreEmpresa = 'Ya existe un proveedor con este nombre de empresa';
                hasErrors = true;
            }
        }

        setErrorsProveedor(newErrors);
        setTouchedProveedor(fields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

        if (hasErrors) {
            showNotification('Por favor corrige los errores en el formulario', 'error');
            return false;
        }

        return true;
    };

    const guardarProveedor = async () => {
        if (!validarCamposProveedor()) return;

        setLoadingProveedor(true);
        try {
            const proveedorData = {
                tipo: tipoProveedor,
                tipoDocumento,
                documento: documentoONit,
                extra: documentoONit,
                contacto: contacto,
                correo,
                direccion,
                estado: estadoProveedor,
                ...(tipoProveedor === 'Natural' ? {
                    nombre: nombre,
                    nombreProveedor: nombre
                } : {
                    nombreEmpresa,
                    nombreContacto,
                    nombre: nombreEmpresa
                })
            };

            const nuevoProveedor = await proveedorApiService.crearProveedor(proveedorData);

            // Recargar la lista de proveedores
            await cargarProveedores();

            // Seleccionar automáticamente el nuevo proveedor
            setCompraData(prev => ({
                ...prev,
                idProveedor: nuevoProveedor.idProveedor || nuevoProveedor.id,
                proveedor: nuevoProveedor.nombre || nuevoProveedor.nombreProveedor
            }));

            setErrores(prev => ({ ...prev, proveedor: '' }));

            showNotification('Proveedor agregado exitosamente');
            cerrarModalProveedor();
        } catch (error) {
            console.error('Error al guardar proveedor:', error);
            showNotification(error.message || 'Error al guardar el proveedor', 'error');
        } finally {
            setLoadingProveedor(false);
        }
    };

    const generarPDF = async (compra) => {
        try {
            const compraCompleta = await compraApiService.obtenerCompraPorId(compra.id);

            if (!compraCompleta.detalles || compraCompleta.detalles.length === 0) {
                setNotification({
                    visible: true,
                    mensaje: 'No se puede generar PDF: La compra no tiene insumos registrados',
                    tipo: 'error'
                });
                return;
            }

            const datosCompra = {
                id: compraCompleta.id,
                proveedor: compraCompleta.proveedor?.nombre || 'N/A',
                fecha_compra: compraCompleta.fechaCompra,
                fecha_registro: compraCompleta.fechaRegistro,
                observaciones: compraCompleta.observaciones || '',
                insumos: compraCompleta.detalles.map(detalle => ({
                    nombre: detalle.insumo?.nombre || 'N/A',
                    cantidad: detalle.cantidad,
                    precio: detalle.precioUnitario,
                    unidad: detalle.insumo?.unidad || 'N/A'
                }))
            };

            await generarPDFCompra(datosCompra);

            setNotification({
                visible: true,
                mensaje: 'PDF generado exitosamente',
                tipo: 'success'
            });

        } catch (error) {
            console.error('Error al generar PDF:', error);
            setNotification({
                visible: true,
                mensaje: 'Error al generar el PDF: ' + error.message,
                tipo: 'error'
            });
        }
    };

    // Cargar datos iniciales
    useEffect(() => {
        cargarCompras();
        cargarProveedores();
    }, []);

    const cargarCompras = async () => {
        try {
            setCargando(true);
            const comprasAPI = await compraApiService.obtenerCompras();
            setCompras(comprasAPI);
        } catch (error) {
            console.error('Error al cargar compras:', error);
            setNotification({
                visible: true,
                mensaje: 'Error al cargar las compras: ' + error.message,
                tipo: 'error'
            });
        } finally {
            setCargando(false);
        }
    };

    const validarFecha = (fecha) => {
        if (!fecha) return 'La fecha de compra es obligatoria';
        const fechaCompra = new Date(fecha);
        const fechaActual = new Date();
        fechaActual.setHours(23, 59, 59, 999);

        if (fechaCompra > fechaActual) {
            return 'La fecha de compra no puede ser mayor al día presente';
        }

        return '';
    };

    const validarProveedor = (idProveedor) => {
        if (!idProveedor) return 'Debe seleccionar un proveedor';
        return '';
    };

    const validarInsumos = (insumos) => {
        if (insumos.length === 0) return 'Debe agregar al menos un insumo';
        return '';
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setCompraSeleccionada(null);
        setModalTipo(null);
    };

    const cancelarFormulario = () => {
        setMostrarAgregarCompra(false);
        setCompraData({
            proveedor: "",
            idProveedor: null,
            fechaCompra: "",
            fechaRegistro: obtenerFechaActual(),
            observaciones: "",
        });
        setInsumosSeleccionados([]);
        setErrores({
            proveedor: "",
            fecha_compra: "",
            insumos: "",
        });
    };

    const anularCompra = async () => {
        try {
            setCargando(true);
            await compraApiService.cambiarEstadoCompra(compraSeleccionada.id, false);
            await cargarCompras();
            cerrarModal();
            showNotification("Compra anulada exitosamente");
        } catch (error) {
            console.error("Error al anular compra:", error);
            setNotification({
                visible: true,
                mensaje: "Error al anular la compra: " + error.message,
                tipo: "error",
            });
        } finally {
            setCargando(false);
        }
    };

    // NUEVA FUNCIÓN: Actualizar stock de insumos
    const actualizarStockInsumos = async (insumosComprados) => {
        try {
            console.log('=== ACTUALIZANDO STOCK DE INSUMOS ===');
            console.log('Insumos a actualizar:', insumosComprados);

            const actualizaciones = [];

            for (const insumo of insumosComprados) {
                try {
                    console.log(`Actualizando insumo ID ${insumo.id}:`);
                    console.log(`  - Cantidad a sumar: ${insumo.cantidad}`);

                    // Obtener datos actuales del insumo
                    const insumoActual = await insumoApiService.obtenerInsumoPorId(insumo.id);
                    console.log(`  - Stock actual: ${insumoActual.cantidad}`);

                    // Calcular nuevo stock
                    const nuevoStock = (insumoActual.cantidad || 0) + (insumo.cantidad || 0);
                    console.log(`  - Nuevo stock: ${nuevoStock}`);

                    // Preparar datos para actualización (usando la estructura correcta para la API)
                    const datosActualizacion = {
                        nombreInsumo: insumoActual.nombreInsumo,
                        idCategoriaInsumos: insumoActual.idCategoriaInsumos,
                        idUnidadMedida: insumoActual.idUnidadMedida,
                        cantidad: nuevoStock,
                        estado: insumoActual.estado,
                        idImagen: insumoActual.idImagen
                    };

                    console.log(`  - Datos para actualización:`, datosActualizacion);

                    // Actualizar el insumo
                    const insumoActualizado = await insumoApiService.actualizarInsumo(insumo.id, datosActualizacion);

                    actualizaciones.push({
                        id: insumo.id,
                        nombre: insumo.nombre,
                        stockAnterior: insumoActual.cantidad,
                        cantidadComprada: insumo.cantidad,
                        stockNuevo: nuevoStock,
                        exito: true
                    });

                    console.log(`  ✅ Stock actualizado exitosamente`);

                } catch (error) {
                    console.error(`❌ Error al actualizar insumo ${insumo.id}:`, error);

                    actualizaciones.push({
                        id: insumo.id,
                        nombre: insumo.nombre,
                        error: error.message,
                        exito: false
                    });

                    // No lanzar el error para que continúe con los demás insumos
                    showNotification(
                        `Advertencia: No se pudo actualizar el stock de "${insumo.nombre}": ${error.message}`,
                        'warning'
                    );
                }
            }

            // Mostrar resumen de actualizaciones
            const exitosos = actualizaciones.filter(a => a.exito);
            const fallidos = actualizaciones.filter(a => !a.exito);

            console.log('=== RESUMEN DE ACTUALIZACIONES ===');
            console.log(`✅ Exitosos: ${exitosos.length}`);
            console.log(`❌ Fallidos: ${fallidos.length}`);

            if (exitosos.length > 0) {
                console.log('Actualizaciones exitosas:');
                exitosos.forEach(a => {
                    console.log(`  - ${a.nombre}: ${a.stockAnterior} + ${a.cantidadComprada} = ${a.stockNuevo}`);
                });
            }

            if (fallidos.length > 0) {
                console.log('Actualizaciones fallidas:');
                fallidos.forEach(a => {
                    console.log(`  - ${a.nombre}: ${a.error}`);
                });
            }

            console.log('================================');

            // Mostrar notificación resumen
            if (exitosos.length > 0 && fallidos.length === 0) {
                showNotification(
                    `✅ Stock actualizado para ${exitosos.length} insumo(s)`,
                    'success'
                );
            } else if (exitosos.length > 0 && fallidos.length > 0) {
                showNotification(
                    `⚠️ Stock actualizado para ${exitosos.length} insumo(s), ${fallidos.length} fallaron`,
                    'warning'
                );
            } else if (fallidos.length > 0) {
                showNotification(
                    `❌ Error: No se pudo actualizar el stock de ${fallidos.length} insumo(s)`,
                    'error'
                );
            }

            return actualizaciones;

        } catch (error) {
            console.error('❌ Error general al actualizar stocks:', error);
            throw new Error(`Error al actualizar stock de insumos: ${error.message}`);
        }
    };

    const abrirModal = async (tipo, compra = null) => {
        console.log("abrirModal llamado con:", tipo, compra);
        setModalTipo(tipo);
        setCompraSeleccionada(compra);

        if (tipo === "ver" && compra) {
            try {
                setCargando(true);

                const compraId =
                    compra.id ||
                    compra.idcompra ||
                    compra.idCompra ||
                    compra.id_compra ||
                    compra.compraId;

                if (!compraId) {
                    console.error("❌ No se pudo determinar el ID de la compra:", compra);
                    showNotification("Error: No se encontró un ID válido", "error");
                    return;
                }

                console.log("🆔 ID detectado:", compraId);

                // Obtener la compra del backend
                const datosCompra = await compraApiService.obtenerCompraPorId(compraId);
                console.log("📊 Compra obtenida:", datosCompra);

                // Mapear proveedor y campos principales
                setCompraData({
                    proveedor: datosCompra.proveedor?.nombre || "N/A",
                    idProveedor: datosCompra.idProveedor || null,
                    fechaCompra: datosCompra.fechaCompra
                        ? String(datosCompra.fechaCompra).slice(0, 10)
                        : "",
                    fechaRegistro: datosCompra.fechaRegistro
                        ? String(datosCompra.fechaRegistro).slice(0, 10)
                        : "",
                    observaciones: datosCompra.observaciones || "",
                });

                const detalles = datosCompra.detalles || [];
                console.log("📋 Detalles encontrados:", detalles);

                const insumosFormateados = detalles.map((detalle) => ({
                    id: detalle.insumo?.id || detalle.idInsumo,
                    nombre: detalle.insumo?.nombre || "N/A",
                    cantidad: Number(detalle.cantidad) || 0,
                    precioUnitario: Number(detalle.precioUnitario) || 0,
                    unidad: detalle.insumo?.unidad || "N/A",
                }));

                setInsumosSeleccionados(insumosFormateados);
                setMostrarAgregarCompra(true);
            } catch (error) {
                console.error("❌ Error al cargar compra:", error);
                showNotification("Error al cargar la compra: " + error.message, "error");
            } finally {
                setCargando(false);
            }
        } else if (tipo === "agregar") {
            setCompraData({
                proveedor: "",
                idProveedor: null,
                fechaCompra: "",
                fechaRegistro: new Date().toISOString().split("T")[0],
                observaciones: "",
            });
            setInsumosSeleccionados([]);
            setErrores({ proveedor: "", fecha_compra: "", insumos: "" });
            setMostrarAgregarCompra(true);
        } else if (tipo === "anular") {
            setModalVisible(true);
        }
    };

    // Función de filtrado mejorada
    const filtrarCompras = (compras, filtro) => {
        if (!filtro || filtro.trim() === '') {
            return compras;
        }

        const filtroLower = filtro.toLowerCase().trim();
        
        return compras.filter(compra => {
            const proveedorMatch = compra.proveedor?.nombre && compra.proveedor.nombre.toLowerCase().includes(filtroLower);
            const fechaMatch = compra.fechaCompra && compra.fechaCompra.toLowerCase().includes(filtroLower);
            const observacionesMatch = compra.observaciones && compra.observaciones.toLowerCase().includes(filtroLower);
            
            const idMatch = compra.id && compra.id.toString().includes(filtroLower);
            const totalMatch = compra.total && compra.total.toString().includes(filtroLower);
            const subtotalMatch = compra.subtotal && compra.subtotal.toString().includes(filtroLower);
            const ivaMatch = compra.iva && compra.iva.toString().includes(filtroLower);
            
            const totalFormateado = compra.total ? formatoCOP(compra.total) : '';
            const subtotalFormateado = compra.subtotal ? formatoCOP(compra.subtotal) : '';
            const ivaFormateado = compra.iva ? formatoCOP(compra.iva) : '';
            
            const totalFormateadoMatch = totalFormateado.toLowerCase().includes(filtroLower);
            const subtotalFormateadoMatch = subtotalFormateado.toLowerCase().includes(filtroLower);
            const ivaFormateadoMatch = ivaFormateado.toLowerCase().includes(filtroLower);
            
            return proveedorMatch || 
                    fechaMatch || 
                    observacionesMatch ||
                    idMatch || 
                    totalMatch || 
                    subtotalMatch || 
                    ivaMatch ||
                    totalFormateadoMatch ||
                    subtotalFormateadoMatch ||
                    ivaFormateadoMatch;
        });
    };

    // Aplicar filtros
    const comprasFiltradas = filtrarCompras(compras, filtro).filter(c =>
        mostrarAnuladas ? !c.estado : c.estado
    );

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'idProveedor') {
            const provSel = proveedores.find(p => p.idProveedor === Number(value));
            setCompraData(prev => ({
                ...prev,
                idProveedor: value ? Number(value) : null,
                proveedor: provSel?.nombre || provSel?.nombreProveedor || provSel?.nombreempresa || ''
            }));
            setErrores(prev => ({ ...prev, proveedor: provSel ? '' : 'Debe seleccionar un proveedor' }));
        } else {
            setCompraData(prev => ({ ...prev, [name]: value }));
            if (name === 'fechaCompra') {
                setErrores(prev => ({ ...prev, fecha_compra: validarFecha(value) }));
            }
        }
    };

    const agregarInsumos = (nuevos) => {
        // ASEGURAR QUE LOS DATOS SEAN NÚMEROS AL AGREGAR
        const nuevosInsumosNormalizados = nuevos.map(insumo => ({
            ...insumo,
            cantidad: parseInt(insumo.cantidad) || 1, // Forzar entero
            precio: parseFloat(insumo.precio || insumo.precioUnitario) || 0, // Forzar decimal
            precioUnitario: parseFloat(insumo.precio || insumo.precioUnitario) || 0
        }));

        const nuevosInsumos = [
            ...insumosSeleccionados,
            ...nuevosInsumosNormalizados.filter(n => !insumosSeleccionados.some(i => i.id === n.id))
        ];
        
        console.log('Insumos agregados normalizados:', nuevosInsumosNormalizados);
        setInsumosSeleccionados(nuevosInsumos);
        setErrores(prev => ({ ...prev, insumos: validarInsumos(nuevosInsumos) }));
        showNotification('Insumos agregados exitosamente');
    };

    const handleCantidadChange = (id, value) => {
        const val = Math.max(1, parseInt(value) || 1); // Usar parseInt en lugar de Number
        setInsumosSeleccionados(prev =>
            prev.map(item => (item.id === id ? { ...item, cantidad: val } : item))
        );
    };

    const removeInsumo = (id) => {
        const nuevosInsumos = insumosSeleccionados.filter(item => item.id !== id);
        setInsumosSeleccionados(nuevosInsumos);
        setErrores(prev => ({ ...prev, insumos: validarInsumos(nuevosInsumos) }));
        showNotification('Insumo eliminado de la lista');
    };

    const validarFormulario = () => {
        const errorProveedor = validarProveedor(compraData.idProveedor);
        const errorFecha = validarFecha(compraData.fechaCompra);
        const errorInsumos = validarInsumos(insumosSeleccionados);
        
        setErrores({
            proveedor: errorProveedor,
            fecha_compra: errorFecha,
            insumos: errorInsumos
        });
        
        if (errorProveedor) {
            showNotification(errorProveedor, 'error');
            return false;
        }
        if (errorFecha) {
            showNotification(errorFecha, 'error');
            return false;
        }
        if (errorInsumos) {
            showNotification(errorInsumos, 'error');
            return false;
        }
        return true;
    };

    // FUNCIÓN MODIFICADA: Guardar compra con actualización de stock
    const guardarCompra = async () => {
        try {
            if (!compraData.idProveedor || insumosSeleccionados.length === 0) {
                showNotification("Debe seleccionar un proveedor y agregar al menos un insumo", "error");
                return;
            }

            setCargando(true); // Mostrar loading

            const subtotal = insumosSeleccionados.reduce(
                (acc, item) => acc + (item.cantidad || 0) * (item.precioUnitario || item.precio || 0),
                0
            );
            const iva = subtotal * 0.19;
            const total = subtotal + iva;

            const nuevaCompraData = {
                idProveedor: compraData.idProveedor,
                fechaCompra: compraData.fechaCompra,
                fechaRegistro: compraData.fechaRegistro,
                observaciones: compraData.observaciones,
                detalles: insumosSeleccionados.map(item => ({
                    idInsumo: item.id,
                    cantidad: item.cantidad,
                    precioUnitario: item.precioUnitario || item.precio,
                    subtotalProducto: (item.cantidad || 0) * (item.precioUnitario || item.precio || 0)
                })),
                subtotal,
                iva,
                total
            };

            console.log('Guardando compra con datos:', nuevaCompraData);

            // Crear la compra
            const compraCreada = await compraApiService.crearCompra(nuevaCompraData);
            console.log('Compra creada exitosamente:', compraCreada);

            // NUEVA FUNCIONALIDAD: Actualizar stock de insumos
            console.log('Actualizando stock de insumos...');
            await actualizarStockInsumos(insumosSeleccionados);

            showNotification("Compra guardada correctamente y stock actualizado");
            cancelarFormulario();
            await cargarCompras();
        } catch (error) {
            console.error("Error al guardar la compra:", error);
            showNotification("Error al guardar la compra: " + error.message, "error");
        } finally {
            setCargando(false);
        }
    };

    const subtotal = insumosSeleccionados.reduce((s, i) => s + (i.precio || i.precioUnitario || 0) * (i.cantidad || 0), 0);
    const iva = subtotal * 0.19; 
    const total = subtotal + iva;
    
    return (
        <div className="admin-wrapper">
            <Notification visible={notification.visible} mensaje={notification.mensaje} tipo={notification.tipo} onClose={hideNotification} />

            {cargando && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: 'rgba(0,0,0,0.5)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 9999 
                }}>
                    <div style={{ 
                        background: 'white', 
                        padding: '20px', 
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <div style={{ 
                            width: '20px', 
                            height: '20px', 
                            border: '2px solid #f3f3f3',
                            borderTop: '2px solid #3498db',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        Cargando...
                    </div>
                </div>
            )}

            {!mostrarAgregarCompra ? (
                <>
                    <div className="admin-toolbar" >
                        <button 
                            className="admin-button pink" 
                            onClick={() => abrirModal('agregar')} 
                            type="button"
                            disabled={cargando}
                        >
                            + Agregar
                        </button>

                        <SearchBar 
                            placeholder="Buscar Compras" 
                            value={filtro} 
                            onChange={setFiltro} 
                        />
                    </div>

                    <div className="admin-section-header">
                        <h2 className="admin-tab">Compras</h2>

                        <button
                            className="admin-tab"
                            onClick={() => setMostrarAnuladas(prev => !prev)}
                            type="button"
                        >
                            {mostrarAnuladas ? 'Ver Activas' : 'Ver Anuladas'}
                        </button>
                    </div>

                    <DataTable
                        value={comprasFiltradas}
                        className="admin-table"
                        paginator rows={10} rowsPerPageOptions={[5,10,25,50]}
                        rowClassName={rowData => !rowData.estado ? 'fila-anulada' : ''}
                    >
                        <Column header="N°" body={(r, { rowIndex }) => rowIndex + 1} style={{ width: '3rem', textAlign: 'center' }} />
                        <Column 
                            field="proveedor" 
                            header="Proveedor" 
                            body={rowData => rowData.proveedor?.nombre || 'N/A'}
                        />
                        <Column 
                            field="fechaCompra" 
                            header="Fecha Compra" 
                            body={rowData => {
                                try {
                                    return new Date(rowData.fechaCompra).toLocaleDateString('es-ES');
                                } catch {
                                    return rowData.fechaCompra || 'N/A';
                                }
                            }}
                        />
                        <Column
                            field="total"
                            header="Total"
                            body={(rowData) => formatoCOP(rowData.total)}
                        />
                        <Column
                            header="Acción"
                            body={rowData => {
                                if (!rowData.estado) return <span style={{ color: 'gray' }}>Anulada</span>;
                                return (
                                    <>
                                        <button className="admin-button gray" title="Visualizar" onClick={() => abrirModal('ver', rowData)} disabled={cargando}>👁</button>
                                        <button
                                            className="admin-button red"
                                            title="Anular"
                                            onClick={() => abrirModal('anular', rowData)}
                                            disabled={cargando}
                                        >
                                            🛑
                                        </button>
                                        <button 
                                            className="admin-button blue" 
                                            title="Descargar PDF" 
                                            onClick={() => generarPDF(rowData)}
                                            disabled={cargando}
                                        >
                                            <i className="fas fa-download" style={{ marginRight: '5px' }}></i>
                                        </button>
                                    </>
                                );
                            }}
                        />
                    </DataTable>

                    {modalTipo === 'anular' && compraSeleccionada && (
                        <Modal visible={modalVisible} onClose={cerrarModal}>
                            <h2 className="modal-title">Confirmar Anulación</h2>
                            <div className="modal-body">
                                <p>¿Seguro que deseas anular la compra del proveedor <strong>{compraSeleccionada.proveedor?.nombre}</strong>?</p>
                            </div>
                            <div className="modal-footer">
                                <button className="modal-btn cancel-btn" onClick={cerrarModal} disabled={cargando}>Cancelar</button>
                                <button className="modal-btn save-btn" onClick={anularCompra} disabled={cargando}>Anular</button>
                            </div>
                        </Modal>
                    )}
                </>
            ) : (
                <div className="compra-form-container">
                    <div className="compra-header-actions" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '1rem'
                    }}>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            Proveedores cargados: {proveedores.length}
                        </div>
                    </div>
                    
                    <div className="compra-fields-grid">
                        <div className="field-group">
                            <label>Proveedor*</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                                <select
                                    name="idProveedor"
                                    value={compraData.idProveedor || ''}
                                    onChange={handleChange}
                                    disabled={modalTipo === 'ver' || cargando}
                                    style={{ 
                                        borderColor: errores.proveedor ? 'red' : '',
                                        flex: 1
                                    }}
                                >
                                    <option value="">Seleccione un proveedor</option>
                                    {proveedores.map(proveedor => (
                                        <option key={proveedor.idProveedor} value={proveedor.idProveedor}>
                                            {proveedor.nombre || proveedor.nombreProveedor || proveedor.nombreempresa}
                                        </option>
                                    ))}
                                </select>
                                
                                {modalTipo !== 'ver' && (
                                    <button
                                        type="button"
                                        onClick={abrirModalProveedor}
                                        className="admin-button pink"
                                        title="Agregar nuevo proveedor"
                                        disabled={cargando}
                                        style={{
                                            minWidth: '40px',
                                            height: '38px',
                                            padding: '0 8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        +
                                    </button>
                                )}
                            </div>

                            {errores.proveedor && (
                                <small style={{ color: 'red', fontSize: '12px' }}>
                                    {errores.proveedor}
                                </small>
                            )}
                            {proveedores.length === 0 && (
                                <small style={{ color: 'orange', fontSize: '10px' }}>
                                    No hay proveedores disponibles
                                </small>
                            )}
                        </div>
                        
                        <div className="field-group">
                            <label>Fecha de compra*</label>
                            <input
                                type="date"
                                name="fechaCompra"
                                value={compraData.fechaCompra}
                                onChange={handleChange}
                                disabled={modalTipo === 'ver' || cargando}
                                max={obtenerFechaActual()}
                                style={{ borderColor: errores.fecha_compra ? 'red' : '' }}
                            />
                            {errores.fecha_compra && (
                                <small style={{ color: 'red', fontSize: '12px' }}>
                                    {errores.fecha_compra}
                                </small>
                            )}
                        </div>
                        
                        <div className="field-group">
                            <label>Fecha de registro</label>
                            <input
                                type="date"
                                name="fechaRegistro"
                                value={compraData.fechaRegistro}
                                onChange={handleChange}
                                disabled
                            />
                        </div>
                    </div>
                    
                    <div className="section-divider"></div>
                    
                    <div className="detalle-section">
                        <h2>Detalle*</h2>
                        {errores.insumos && (
                            <small style={{ color: 'red', fontSize: '12px', display: 'block', marginBottom: '10px' }}>
                                {errores.insumos}
                            </small>
                        )}
                                                        
                        <table className="compra-detalle-table">
                            <thead className="p-datatable-thead">
                                <tr>
                                    <th>Nombre Producto</th>
                                    <th>Cantidad</th>
                                    <th>Unidad_Medida</th>
                                    <th>Precio unitario</th>
                                    <th>Subtotal</th> 
                                    {modalTipo !== 'ver' && <th>Acción</th>}
                                </tr>
                            </thead>
                            <tbody className="p-datatable">
                                {insumosSeleccionados.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.nombre}</td>
                                        <td>
                                            {modalTipo === 'ver' ? 
                                                (
                                                    item.cantidad
                                                ) : (
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.cantidad}
                                                        onChange={(e) =>
                                                            handleCantidadChange(item.id, parseInt(e.target.value))
                                                        }
                                                        disabled={cargando}
                                                    />
                                                )}
                                        </td>
                                        <td>{item.unidad}</td>
                                        <td>{formatoCOP(item.precio || item.precioUnitario || 0)}</td>
                                        <td>
                                            {formatoCOP((item.cantidad || 0) * (item.precio || item.precioUnitario || 0))}
                                        </td>
                                        {modalTipo !== 'ver' && (
                                            <td>
                                                <button
                                                    className="btn-eliminar"
                                                    onClick={() => removeInsumo(item.id)}
                                                    disabled={cargando}
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {modalTipo !== 'ver' && (
                            <button 
                                className="btn-agregar-insumos"
                                onClick={() => setMostrarModalInsumos(true)}
                                disabled={cargando}
                            >
                                + Agregar Insumos
                            </button>
                        )}
                    </div>
                    
                    <div className="section-divider"></div>
                    
                    <div className="compra-totales-grid">
                        <div className="total-item">
                            <span>Subtotal:</span>
                            <span>{formatoCOP(subtotal)}</span>
                        </div>
                        <div className="total-item">
                            <span>IVA (19%):</span>
                            <span>{formatoCOP(iva)}</span>
                        </div>
                        <div className="total-item">
                            <span>Total:</span>
                            <span>{formatoCOP(total)}</span>
                        </div>
                    </div>

                    <div className="compra-header-actions"
                        style={{
                            marginTop: '1rem',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '0.5rem'
                        }}>
                        <button 
                            className="modal-btn cancel-btn"
                            onClick={cancelarFormulario}
                            disabled={cargando}
                        >
                            {modalTipo === 'ver' ? 'Cerrar' : 'Cancelar'}
                        </button>
                        {modalTipo !== 'ver' && (
                            <button 
                                className="modal-btn save-btn"
                                onClick={guardarCompra}
                                disabled={cargando}
                            >
                                Guardar
                            </button>
                        )}
                    </div>
                    
                    {mostrarModalInsumos && modalTipo !== 'ver' && (
                        <AgregarInsumosModal
                            onClose={() => setMostrarModalInsumos(false)}
                            onAgregar={agregarInsumos}
                        />
                    )}
                </div>
            )}

            {/* Modal de Proveedores */}
            {modalProveedorVisible && modalProveedorTipo === 'agregar' && (
                <Modal visible={modalProveedorVisible} onClose={cerrarModalProveedor} className="modal-wide">
                    <h2 className="modal-title">Agregar Proveedor</h2>
                    <div className="modal-body">
                        <div className="modal-form-grid-wide">
                            <label>Tipo de Proveedor*
                                <select
                                    value={tipoProveedor}
                                    onChange={(e) => handleProveedorFieldChange('tipoProveedor', e.target.value)}
                                    className="modal-input"
                                    disabled={loadingProveedor}
                                >
                                    <option value="Natural">Natural</option>
                                    <option value="Jurídico">Jurídico</option>
                                </select>
                            </label>

                            <label>Tipo de Documento*
                                <select
                                    value={tipoDocumento}
                                    onChange={(e) => handleProveedorFieldChange('tipoDocumento', e.target.value)}
                                    className="modal-input"
                                    disabled={loadingProveedor}
                                >
                                    {tipoProveedor === 'Natural' ? (
                                        <>
                                            <option value="CC">Cédula de Ciudadanía</option>
                                            <option value="CE">Cédula de Extranjería</option>
                                            <option value="TI">Tarjeta de Identidad</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="NIT">NIT</option>
                                            <option value="RUT">RUT</option>
                                        </>
                                    )}
                                </select>
                            </label>

                            <label>{tipoProveedor === 'Natural' ? 'Número de Documento*' : (tipoDocumento === 'RUT' ? 'RUT*' : 'NIT*')}
                                <input
                                    type="text"
                                    value={documentoONit}
                                    onChange={(e) => handleProveedorFieldChange('documentoONit', e.target.value)}
                                    onBlur={(e) => handleProveedorFieldBlur('documentoONit', e.target.value)}
                                    className={`modal-input ${errorsProveedor.documentoONit ? 'error' : ''}`}
                                    placeholder={tipoProveedor === 'Natural' ? 'Número de documento' : (tipoDocumento === 'RUT' ? 'Número de RUT' : 'Número de NIT')}
                                    maxLength={tipoProveedor === 'Natural' ? '10' : (tipoDocumento === 'RUT' ? '10' : '12')}
                                    disabled={loadingProveedor}
                                />
                                {errorsProveedor.documentoONit && <span className="error-message">{errorsProveedor.documentoONit}</span>}
                            </label>

                            {tipoProveedor === 'Natural' ? (
                                <label>Nombre Completo*
                                    <input
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => handleProveedorFieldChange('nombre', e.target.value)}
                                        onBlur={(e) => handleProveedorFieldBlur('nombre', e.target.value)}
                                        className={`modal-input ${errorsProveedor.nombre ? 'error' : ''}`}
                                        placeholder="Ingrese el nombre completo"
                                        disabled={loadingProveedor}
                                    />
                                    {errorsProveedor.nombre && <span className="error-message">{errorsProveedor.nombre}</span>}
                                </label>
                            ) : (
                                <>
                                    <label>Razón Social*
                                        <input
                                            type="text"
                                            value={nombreEmpresa}
                                            onChange={(e) => handleProveedorFieldChange('nombreEmpresa', e.target.value)}
                                            onBlur={(e) => handleProveedorFieldBlur('nombreEmpresa', e.target.value)}
                                            className={`modal-input ${errorsProveedor.nombreEmpresa ? 'error' : ''}`}
                                            placeholder="Ingrese la razón social"
                                            disabled={loadingProveedor}
                                        />
                                        {errorsProveedor.nombreEmpresa && <span className="error-message">{errorsProveedor.nombreEmpresa}</span>}
                                    </label>

                                    <label>Nombre del Contacto*
                                        <input
                                            type="text"
                                            value={nombreContacto}
                                            onChange={(e) => handleProveedorFieldChange('nombreContacto', e.target.value)}
                                            onBlur={(e) => handleProveedorFieldBlur('nombreContacto', e.target.value)}
                                            className={`modal-input ${errorsProveedor.nombreContacto ? 'error' : ''}`}
                                            placeholder="Ingrese el nombre del contacto"
                                            disabled={loadingProveedor}
                                        />
                                        {errorsProveedor.nombreContacto && <span className="error-message">{errorsProveedor.nombreContacto}</span>}
                                    </label>
                                </>
                            )}

                            <label>Teléfono*
                                <input
                                    type="text"
                                    value={contacto}
                                    onChange={(e) => handleProveedorFieldChange('contacto', e.target.value)}
                                    onBlur={(e) => handleProveedorFieldBlur('contacto', e.target.value)}
                                    className={`modal-input ${errorsProveedor.contacto ? 'error' : ''}`}
                                    placeholder="Número de teléfono (10 dígitos)"
                                    maxLength="10"
                                    disabled={loadingProveedor}
                                />
                                {errorsProveedor.contacto && <span className="error-message">{errorsProveedor.contacto}</span>}
                            </label>

                            <label>Correo Electrónico*
                                <input
                                    type="email"
                                    value={correo}
                                    onChange={(e) => handleProveedorFieldChange('correo', e.target.value)}
                                    onBlur={(e) => handleProveedorFieldBlur('correo', e.target.value)}
                                    className={`modal-input ${errorsProveedor.correo ? 'error' : ''}`}
                                    placeholder="ejemplo@correo.com"
                                    disabled={loadingProveedor}
                                />
                                {errorsProveedor.correo && <span className="error-message">{errorsProveedor.correo}</span>}
                            </label>

                            <label>Dirección*
                                <input
                                    type="text"
                                    value={direccion}
                                    onChange={(e) => handleProveedorFieldChange('direccion', e.target.value)}
                                    onBlur={(e) => handleProveedorFieldBlur('direccion', e.target.value)}
                                    className={`modal-input ${errorsProveedor.direccion ? 'error' : ''}`}
                                    placeholder="Dirección completa"
                                    disabled={loadingProveedor}
                                />
                                {errorsProveedor.direccion && <span className="error-message">{errorsProveedor.direccion}</span>}
                            </label>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button 
                            className="modal-btn cancel-btn" 
                            onClick={cerrarModalProveedor}
                            disabled={loadingProveedor}
                        >
                            Cancelar
                        </button>
                        <button 
                            className="modal-btn save-btn" 
                            onClick={guardarProveedor}
                            disabled={loadingProveedor}
                        >
                            {loadingProveedor ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </Modal>
            )}
            
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .fila-anulada {
                    background-color: #ffebee !important;
                    opacity: 0.7;
                }
            `}</style>
        </div>
    );
}