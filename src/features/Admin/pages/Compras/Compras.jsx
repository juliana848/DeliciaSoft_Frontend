import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../../adminStyles.css';
import Modal from '../../components/modal';
import SearchBar from '../../components/SearchBar';
import Notification from '../../components/Notification';
import AgregarInsumosModal from '../../components/AgregarInsumosModal';
import PDFPreview from '../PDFPreview';
import { generarPDFCompra, configurarEmpresa } from '../pdf';
import { XCircle } from 'lucide-react';
import compraApiService from '../../services/compras_services';
import proveedorApiService from '../../services/proveedor_services';


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

    // Agregar estos nuevos estados después de los existentes
    const [mostrarDropdown, setMostrarDropdown] = useState(false);
    const [opcionSeleccionada, setOpcionSeleccionada] = useState(-1);

    // Estados para PDFPreview
    const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
    const [compraPdf, setCompraPdf] = useState(null);
    const [insumos, setInsumos] = useState([]);


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

    // NUEVO: Estado para buscador de proveedores
    const [buscarProveedor, setBuscarProveedor] = useState('');

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

    useEffect(() => {
  const cargarInsumos = async () => {
    const resp = await fetch("https://deliciasoft-backend.onrender.com/api/insumos");
    const raw = await resp.json();
    const insumos = transformarInsumosDesdeAPI(raw);

    console.log("📋 Insumos transformados (cantidad como number):", insumos);

    setInsumos(insumos); // <-- aquí guardas en tu estado
  };

  cargarInsumos();
}, []);



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

    // Nueva función para abrir preview de PDF
    const abrirPDFPreview = async (compra) => {
        try {
            setCargando(true);
            const compraCompleta = await compraApiService.obtenerCompraPorId(compra.id);

            if (!compraCompleta.detalles || compraCompleta.detalles.length === 0) {
                showNotification('No se puede generar PDF: La compra no tiene insumos registrados', 'error');
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
                    precioUnitario: detalle.precioUnitario,
                    unidad_medida: detalle.insumo?.unidad || 'N/A'
                }))
            };

            setCompraPdf(datosCompra);
            setPdfPreviewVisible(true);

        } catch (error) {
            console.error('Error al preparar PDF:', error);
            showNotification('Error al preparar la previsualización: ' + error.message, 'error');
        } finally {
            setCargando(false);
        }
    };

    // Función para cerrar preview de PDF
    const cerrarPDFPreview = () => {
        setPdfPreviewVisible(false);
        setCompraPdf(null);
    };

    // Función para descargar PDF desde el preview
    const descargarPDFDesdePreview = async () => {
        try {
            if (compraPdf) {
                await generarPDFCompra(compraPdf);
                showNotification('PDF descargado exitosamente', 'success');
            }
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            showNotification('Error al descargar el PDF: ' + error.message, 'error');
        }
    };

    // Función original de generar PDF (ahora redirige a preview)
    const generarPDF = async (compra) => {
        await abrirPDFPreview(compra);
    };

    // Cargar datos iniciales
    useEffect(() => {
        cargarCompras();
        cargarProveedores();
    }, []);

    const cargarCompras = async () => {
        try {
            setCargando(true);
            console.log('=== CARGANDO COMPRAS ===');
            const comprasAPI = await compraApiService.obtenerCompras();
            console.log('Compras obtenidas de la API:', comprasAPI);
            
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

    // FUNCIÓN CORREGIDA para anular compra


    const anularCompra = async () => {
  try {
    if (!compraSeleccionada || !compraSeleccionada.id) {
      showNotification("No se ha seleccionado una compra válida", "error");
      return;
    }

    setCargando(true);

    await compraApiService.cambiarEstadoCompra(compraSeleccionada.id, false);

    showNotification("Compra anulada correctamente", "success");
    setModalVisible(false);
    await cargarCompras(); // refrescar lista
  } catch (error) {
    console.error("❌ Error al anular compra:", error);
    showNotification("Error al anular la compra: " + error.message, "error");
  } finally {
    setCargando(false);
  }
};



const reactivarCompra = async (compra) => {
  try {
    setCargando(true);

    // 🟢 Sumar stock (convertir detalles a positivos)
    if (compra.detalles && compra.detalles.length > 0) {
      const detallesPositivos = compra.detalles.map((d) => ({
        idinsumo: d.idinsumo,
        cantidad: Math.abs(d.cantidad), // siempre positivo
      }));
      await actualizarStockInsumos(detallesPositivos);
    }

    // Cambiar estado en backend
    const resultado = await compraApiService.cambiarEstadoCompra(compra.id, true);

    if (resultado) {
      await cargarCompras();
      showNotification("Compra reactivada exitosamente.", "success");
    }
  } catch (error) {
    console.error("Error al reactivar compra:", error);
    showNotification("Error al reactivar la compra: " + error.message, "error");
  } finally {
    setCargando(false);
  }
};



    
    
// 🔥 Tu función principal
// ✅ Actualizar stock de insumos con fetch directo
function transformarInsumoDesdeAPI(apiInsumo) {
  return {
    idinsumo: apiInsumo.idinsumo,
    nombreinsumo: apiInsumo.nombreinsumo,
    idcategoriainsumos: apiInsumo.idcategoriainsumos,
    idunidadmedida: apiInsumo.idunidadmedida,
    idimagen: apiInsumo.idimagen,
    estado: apiInsumo.estado,
    cantidad: (apiInsumo.cantidad !== null && apiInsumo.cantidad !== undefined && apiInsumo.cantidad !== "")
      ? parseFloat(apiInsumo.cantidad)
      : 0,
    precio: apiInsumo.precio,
  };
}



const actualizarStockInsumos = async (detalles) => {
  try {
    // 1. Traer todos los insumos de la BD
    const resInsumos = await fetch("https://deliciasoft-backend.onrender.com/api/insumos");
    const listaInsumosRaw = await resInsumos.json();
    const listaInsumos = listaInsumosRaw.map(transformarInsumoDesdeAPI);

    // 2. Diccionario con stock actual
    const stockActual = {};
    listaInsumos.forEach((i) => {
      stockActual[i.idinsumo] = i.cantidad;
    });

    // 3. Diccionario con cantidades a sumar
    const stockCompra = {};
    detalles.forEach((d) => {
      stockCompra[d.idinsumo] = (stockCompra[d.idinsumo] || 0) + parseFloat(d.cantidad);
    });

    // 4. Actualizar cada insumo
    for (const id of Object.keys(stockCompra)) {
      const res = await fetch(`https://deliciasoft-backend.onrender.com/api/Insumos/${id}`);
const insumoRaw = await res.json();

console.log("🔍 Insumo crudo desde API:", insumoRaw);  // <-- así vemos qué viene

const insumoActual = transformarInsumoDesdeAPI(insumoRaw);
console.log("📦 Insumo normalizado:", insumoActual);


      const cantidadActual = insumoActual.cantidad;
      const cantidadNueva = Number((cantidadActual + stockCompra[id]).toFixed(2));

      console.log(`🔄 Actualizando insumo ${id}: ${cantidadActual} + ${stockCompra[id]} = ${cantidadNueva}`);

      // ✅ payload con número real
      const payload = {
        idinsumo: insumoActual.idinsumo,
        nombreinsumo: insumoActual.nombreinsumo,
        idcategoriainsumos: insumoActual.idcategoriainsumos,
        idunidadmedida: insumoActual.idunidadmedida,
        idimagen: insumoActual.idimagen,
        estado: insumoActual.estado,
        cantidad: cantidadNueva,
      };

      await fetch(`https://deliciasoft-backend.onrender.com/api/Insumos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log(`✅ Insumo ${id} actualizado con cantidad ${cantidadNueva}`);
    }

  } catch (error) {
    console.error("❌ Error actualizando stock de insumos:", error);
    throw error;
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
  } else if (tipo === "anular" && compra) {
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

    setCompraSeleccionada({ ...compra, id: compraId });
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

    // LÓGICA CORREGIDA: Aplicar filtros según estado - MEJORADA
    const comprasFiltradas = filtrarCompras(compras, filtro).filter(c => {
        // Debug para ver qué está pasando
        console.log('Compra:', c.id, 'Estado:', c.estado, 'Mostrar anuladas:', mostrarAnuladas);
        
        if (mostrarAnuladas) {
            // Mostrar compras anuladas (estado === false)
            return c.estado === false;
        } else {
            // Mostrar compras activas (estado === true o undefined para compatibilidad)
            return c.estado === true || c.estado === undefined;
        }
    });

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

    // FUNCIÓN CORREGIDA: Agregar insumos con conversión correcta
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

    // 🔹 Función principal para guardar la compra
const guardarCompra = async () => {
  try {
    if (!compraData.idProveedor || insumosSeleccionados.length === 0) {
      showNotification("Debe seleccionar un proveedor y agregar al menos un insumo", "error");
      return;
    }

    setCargando(true);

    // Calcular subtotal, IVA y total
    const subtotal = insumosSeleccionados.reduce(
      (acc, item) => acc + (item.cantidad || 0) * (item.precioUnitario || item.precio || 0),
      0
    );
    const iva = subtotal * 0.19;
    const total = subtotal + iva;

    // ✅ Armar detalles
    const detalles = insumosSeleccionados.map(item => ({
  idinsumo: item.idinsumo ?? item.id,
  cantidad: Number(item.cantidad) || 0,
  precioUnitario: item.precioUnitario || item.precio,
  subtotalProducto: (Number(item.cantidad) || 0) * (item.precioUnitario || item.precio || 0)
}));

    const nuevaCompraData = {
      idProveedor: compraData.idProveedor,
      fechaCompra: compraData.fechaCompra,
      fechaRegistro: compraData.fechaRegistro,
      observaciones: compraData.observaciones,
      detalles,
      subtotal,
      iva,
      total,
    };

    console.log("📦 Guardando compra con datos:", nuevaCompraData);

    // 1. Crear la compra
    const compraCreada = await compraApiService.crearCompra(nuevaCompraData);
    console.log("✅ Compra creada exitosamente:", compraCreada);

    // 2. Actualizar stock con función separada
    await actualizarStockInsumos(detalles);

    // 3. Notificación y refresco
    showNotification("Compra guardada correctamente y stock actualizado");
    cancelarFormulario();
    await cargarCompras();
  } catch (error) {
    console.error("❌ Error al guardar la compra:", error);
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

            {/* Modal de previsualización de PDF - MEJORADO CON MAS TAMAÑO */}
            <PDFPreview 
                visible={pdfPreviewVisible}
                onClose={cerrarPDFPreview}
                compraData={compraPdf}
                onDownload={descargarPDFDesdePreview}
                // Agregamos prop personalizada para tamaño más grande
                modalSize="large"
            />

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
                        tableStyle={{ 
                            tableLayout: 'fixed',
                            width: '100%'
                        }}
                    >
                        <Column 
                            header="N°" 
                            body={(r, { rowIndex }) => rowIndex + 1} 
                            style={{ 
                                width: '60px', 
                                textAlign: 'center',
                                padding: '8px 4px'
                            }} 
                            headerStyle={{
                                width: '60px',
                                textAlign: 'center',
                                padding: '8px 4px'
                            }}
                        />
                        <Column 
                            field="proveedor" 
                            header="Proveedor" 
                            body={rowData => rowData.proveedor?.nombre || 'N/A'}
                            style={{ 
                                width: '25%',
                                textAlign: 'left',
                                padding: '8px'
                            }}
                            headerStyle={{
                                width: '25%',
                                textAlign: 'left',
                                padding: '8px'
                            }}
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
                            style={{ 
                                width: '20%',
                                textAlign: 'center',
                                padding: '8px'
                            }}
                            headerStyle={{
                                width: '20%',
                                textAlign: 'center',
                                padding: '8px'
                            }}
                        />
                        <Column
                            field="total"
                            header="Total"
                            body={(rowData) => formatoCOP(rowData.total)}
                            style={{ 
                                width: '20%',
                                textAlign: 'right',
                                padding: '8px'
                            }}
                            headerStyle={{
                                width: '20%',
                                textAlign: 'right',
                                padding: '8px'
                            }}
                        />
                        <Column
                            header="Acción"
                            body={rowData => {
                                // LÓGICA CORREGIDA: Mostrar diferentes acciones según el estado
                                if (!rowData.estado) {
                                    // Para compras anuladas
                                    return (
                                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                            <button 
                                                className="admin-button gray" 
                                                title="Visualizar" 
                                                onClick={() => abrirModal('ver', rowData)} 
                                                disabled={cargando}
                                            >
                                                👁
                                            </button>
                                            <button
                                                className="admin-button green"
                                                title="Reactivar"
                                                onClick={() => reactivarCompra(rowData)}
                                                disabled={cargando}
                                            >
                                                ↩️
                                            </button>
                                            <button 
                                                className="admin-button blue" 
                                                title="Descargar PDF" 
                                                onClick={() => generarPDF(rowData)}
                                                disabled={cargando}
                                            >
                                                📄
                                            </button>
                                        </div>
                                    );
                                }

                                // Para compras activas
                                return (
                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                        <button 
                                            className="admin-button gray" 
                                            title="Visualizar" 
                                            onClick={() => abrirModal('ver', rowData)} 
                                            disabled={cargando}
                                        >
                                            👁
                                        </button>
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
                                            📄
                                        </button>
                                    </div>
                                );
                            }}
                            style={{ 
                                width: '15%',
                                textAlign: 'center',
                                padding: '8px'
                            }}
                            headerStyle={{
                                width: '15%',
                                textAlign: 'center',
                                padding: '8px'
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
            {/* CAMPO CON DATALIST */}
            <div style={{ flex: 1 }}>
                <input
                    type="text"
                    list="proveedores-list"
                    placeholder="Buscar o seleccionar proveedor..."
                    value={buscarProveedor}
                    onChange={(e) => {
                        setBuscarProveedor(e.target.value);
                        // Buscar coincidencia exacta para autoseleccionar
                        const proveedorEncontrado = proveedores.find(p => {
                            const nombre = p.nombre || p.nombreProveedor || p.nombreempresa || '';
                            return nombre.toLowerCase() === e.target.value.toLowerCase();
                        });
                        if (proveedorEncontrado) {
                            setCompraData(prev => ({
                                ...prev,
                                idProveedor: proveedorEncontrado.idProveedor,
                                proveedor: proveedorEncontrado.nombre || proveedorEncontrado.nombreProveedor || proveedorEncontrado.nombreempresa
                            }));
                            setErrores(prev => ({ ...prev, proveedor: '' }));
                        } else {
                            setCompraData(prev => ({
                                ...prev,
                                idProveedor: null,
                                proveedor: ''
                            }));
                        }
                    }}
                    style={{ 
                        width: '100%',
                        padding: '8px',
                        border: errores.proveedor ? '1px solid red' : '1px solid #ccc',
                        borderRadius: '4px'

                    }}
                    
                    disabled={modalTipo === 'ver' || cargando}
                />
                
                <datalist id="proveedores-list">
                    {proveedores.map(proveedor => (
                        <option 
                            key={proveedor.idProveedor} 
                            value={proveedor.nombre || proveedor.nombreProveedor || proveedor.nombreempresa}
                        />
                    ))}
                </datalist>
            </div>
            
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
                        justifyContent: 'center',
                        alignSelf: 'flex-end'
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
        {/* Mostrar proveedor seleccionado */}
        {compraData.idProveedor && (
            <small style={{ color: 'green', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                ✓ Seleccionado: {compraData.proveedor}
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
                                    <th style={{ width: '30%', textAlign: 'left', padding: '12px 8px' }}>Nombre Producto</th>
                                    <th style={{ width: '15%', textAlign: 'center', padding: '12px 8px' }}>Cantidad</th>
                                    <th style={{ width: '15%', textAlign: 'center', padding: '12px 8px' }}>Unidad Medida</th>
                                    <th style={{ width: '20%', textAlign: 'right', padding: '12px 8px' }}>Precio unitario</th>
                                    <th style={{ width: '15%', textAlign: 'right', padding: '12px 8px' }}>Subtotal</th> 
                                    {modalTipo !== 'ver' && <th style={{ width: '5%', textAlign: 'center', padding: '12px 8px' }}>Acción</th>}
                                </tr>
                            </thead>
                            <tbody className="p-datatable">
                                {insumosSeleccionados.map((item) => (
                                    <tr key={item.id}>
                                        <td style={{ padding: '8px', textAlign: 'left' }}>{item.nombre}</td>
                                        <td style={{ padding: '8px', textAlign: 'center' }}>
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
                                                        style={{ width: '80px', textAlign: 'center' }}
                                                    />
                                                )}
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'center' }}>{item.unidad}</td>
                                        <td style={{ padding: '8px', textAlign: 'right' }}>{formatoCOP(item.precio || item.precioUnitario || 0)}</td>
                                        <td style={{ padding: '8px', textAlign: 'right' }}>
                                            {formatoCOP((item.cantidad || 0) * (item.precio || item.precioUnitario || 0))}
                                        </td>
                                        {modalTipo !== 'ver' && (
                                            <td style={{ padding: '8px', textAlign: 'center' }}>
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

    
                /* Estilos para el datalist mejorado */
                input[list]::-webkit-list-button {
                    display: none;
                }
                
                input[list] {
                    position: relative;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8.825c-.2 0-.4-.1-.5-.2L1.2 4.3c-.3-.3-.3-.8 0-1.1s.8-.3 1.1 0L6 7.1l3.7-3.9c.3-.3.8-.3 1.1 0s.3.8 0 1.1L6.5 8.625c-.1.1-.3.2-.5.2z'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 8px center;
                    background-size: 12px;
                    padding-right: 30px !important;
                    cursor: pointer;
                }
                
                input[list]:focus {
                    outline: 2px solid #007bff;
                    outline-offset: 2px;
                    border-color: #007bff;
                    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
                }
                
                /* Para navegadores que soportan datalist styling */
                datalist {
                    position: absolute;
                    background-color: white;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    max-height: 200px;
                    overflow-y: auto;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    z-index: 1000;
                }
                
                datalist option {
                    padding: 8px 12px;
                    cursor: pointer;
                    border-bottom: 1px solid #f0f0f0;
                    font-size: 14px;
                }
                
                datalist option:hover {
                    background-color: #f8f9fa;
                }
                
                datalist option:last-child {
                    border-bottom: none;
                }
                
                /* Estilo cuando el proveedor está seleccionado */
                .proveedor-seleccionado {
                    background-color: #e8f5e8 !important;
                    border-color: #28a745 !important;
                }
                
                /* Animación sutil para el ícono de confirmación */
                .check-animation {
                    animation: checkFade 0.3s ease-in;
                }
                
                @keyframes checkFade {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .fila-anulada {
                    background-color: #ffebee !important;
                    opacity: 0.7;
                }
    
                .fila-anulada {
                    background-color: #ffebee !important;
                    opacity: 0.7;
                }
                
                /* Estilos mejorados para la alineación de tabla */
                .admin-table .p-datatable-header-cell {
                    text-align: center;
                    vertical-align: middle;
                    padding: 12px 8px;
                    font-weight: 600;
                    background-color: #f8f9fa;
                    border-bottom: 2px solid #dee2e6;
                }
                
                .admin-table .p-datatable-tbody > tr > td {
                    vertical-align: middle;
                    padding: 8px;
                    border-bottom: 1px solid #dee2e6;
                }
                
                .compra-detalle-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                    font-size: 14px;
                }
                
                .compra-detalle-table th {
                    background-color: #f8f9fa;
                    font-weight: 600;
                    border: 1px solid #dee2e6;
                    white-space: nowrap;
                }
                
                .compra-detalle-table td {
                    border: 1px solid #dee2e6;
                    vertical-align: middle;
                }
                
                .compra-detalle-table tbody tr:nth-child(even) {
                    background-color: #f8f9fa;
                }
                
                .compra-detalle-table tbody tr:hover {
                    background-color: #e9ecef;
                }

                /* Botón verde para reactivar */
                .admin-button.green {
                    background-color: #28a745;
                    color: white;
                    border: 1px solid #28a745;
                }

                .admin-button.green:hover {
                    background-color: #218838;
                    border-color: #1e7e34;
                }

                .admin-button.green:disabled {
                    background-color: #6c757d;
                    border-color: #6c757d;
                    opacity: 0.65;
                }
            `}</style>
        </div>
    );
}