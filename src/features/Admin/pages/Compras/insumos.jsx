import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
import '../../adminStyles.css';
import Modal from '../../components/modal';
import SearchBar from '../../components/SearchBar';
import Notification from '../../components/Notification';
import insumoApiService from '../../services/insumos';
import categoriaInsumoApiService from '../../services/categoriainsumos';

export default function InsumosTable() {
  const unidadesPorProducto = {
    'Harina': ['Kilogramos', 'Gramos', 'libra', 'Bolsa', 'Paquete'],
    'Azúcar': ['Kilogramos', 'Gramos', 'libra', 'bolsa'],
    'Huevos': ['unid', 'docena', 'cartón'],
    'Leche': ['litros', 'mililitros', 'galón', 'bolsa', 'cartón'],
    'Sal': ['Kilogramos', 'Gramos', 'paquete'],
    'Mantequilla': ['Gramos', 'Kilogramos', 'barra', 'paquete'],
    'Aceite': ['litros', 'mililitros', 'botella'],
    'Arroz': ['Kilogramos', 'Gramos', 'libra', 'bolsa'],
    'Pasta': ['Kilogramos', 'Gramos', 'paquete'],
    'Tomate': ['Kilogramos', 'Gramos', 'unida', 'caja']
  };

  // Estados principales
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingUnidades, setLoadingUnidades] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [showStockInfo, setShowStockInfo] = useState(false);
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modal, setModal] = useState({ visible: false, tipo: '', insumo: null });
  
  // Estados para formulario principal de insumos
  const [form, setForm] = useState({ 
    nombreInsumo: '', 
    idCategoriaInsumos: '', 
    cantidad: '', 
    idUnidadMedida: '', 
    idImagen: null, 
    estado: true,
    stockMinimo: 5
  });

  const opcionesNombre = Object.keys(unidadesPorProducto);

  const [errors, setErrors] = useState({
    nombreInsumo: null,
    idCategoriaInsumos: null,
    cantidad: null,
    idUnidadMedida: null,
    stockMinimo: null
  });

  // Estados para el modal de categoría
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);
  const [formCategoria, setFormCategoria] = useState({
    nombreCategoria: '',
    descripcion: ''
  });
  const [erroresCategoria, setErroresCategoria] = useState({
    nombreCategoria: '',
    descripcion: ''
  });

  // Estados para el modal de catálogo
  const [modalCatalogoVisible, setModalCatalogoVisible] = useState(false);
  const [tipoCatalogo, setTipoCatalogo] = useState('');
  const [formCatalogo, setFormCatalogo] = useState({
    nombre: '',
    precioadicion: 0,
    estado: true
  });
  const [erroresCatalogo, setErroresCatalogo] = useState({
    nombre: '',
    precioadicion: ''
  });

  // Estados para el selector de tipo de catálogo
  const [modalSelectorVisible, setModalSelectorVisible] = useState(false);
  const [insumoParaCatalogo, setInsumoParaCatalogo] = useState(null);

  // Effect para cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      console.log('Iniciando carga de datos del componente...');
      
      await cargarCategorias();
      await cargarUnidades();
      await cargarInsumos();
      
      console.log('Carga de datos completada');
    };
    
    cargarDatos();
  }, []);

  // Función para cargar unidades
  const cargarUnidades = async () => {
    try {
      setLoadingUnidades(true);
      console.log('Iniciando carga de unidades de medida...');
      
      const unidadesAPI = await insumoApiService.obtenerUnidadesMedida();
      console.log('Unidades recibidas de la API:', unidadesAPI);
      
      if (!unidadesAPI || unidadesAPI.length === 0) {
        console.warn('No se encontraron unidades de medida');
        showNotification('No se encontraron unidades de medida', 'warning');
        setUnidades([]);
        return;
      }
      
      setUnidades(unidadesAPI);
      console.log('Unidades cargadas exitosamente:', unidadesAPI.length);
    } catch (error) {
      console.error('Error al cargar unidades:', error);
      showNotification('Error al cargar las unidades de medida: ' + error.message, 'error');
      setUnidades([]);
    } finally {
      setLoadingUnidades(false);
    }
  };

  // Función para cargar categorías
  const cargarCategorias = async () => {
    try {
      setLoadingCategorias(true);
      console.log('Iniciando carga de categorías...');
      
      const categoriasAPI = await categoriaInsumoApiService.obtenerCategorias();
      console.log('Categorías recibidas de la API:', categoriasAPI);
      
      const categoriasActivas = categoriasAPI.filter(cat => cat.estado === true);
      console.log('Categorías activas filtradas:', categoriasActivas);
      
      if (categoriasActivas.length === 0) {
        console.warn('No se encontraron categorías activas');
        showNotification('No se encontraron categorías activas', 'warning');
      }
      
      setCategorias(categoriasActivas);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      showNotification('Error al cargar las categorías: ' + error.message, 'error');
      setCategorias([]);
    } finally {
      setLoadingCategorias(false);
    }
  };

  // Función para cargar insumos
  const cargarInsumos = async () => {
    try {
      setLoading(true);
      console.log('Cargando insumos...');
      
      const insumosAPI = await insumoApiService.obtenerInsumos();
      console.log('Insumos recibidos:', insumosAPI);
      
      const insumosTransformados = insumosAPI.map(insumo => {
        let categoria = insumo.nombreCategoria;
        if (!categoria) {
          const categoriaEncontrada = categorias.find(cat => cat.id === parseInt(insumo.idCategoriaInsumos));
          categoria = categoriaEncontrada ? categoriaEncontrada.nombreCategoria : 'Categoría desconocida';
        }

        let unidad = insumo.nombreUnidadMedida;
        if (!unidad) {
          const unidadEncontrada = unidades.find(uni => parseInt(uni.idunidadmedida) === parseInt(insumo.idUnidadMedida));
          unidad = unidadEncontrada ? unidadEncontrada.unidadmedida : 'unid';
        }

        return {
          id: insumo.id,
          nombre: insumo.nombreInsumo,
          categoria,
          cantidad: insumo.cantidad,
          unidad,
          estado: insumo.estado,
          stockMinimo: 5,
          _originalData: insumo
        };
      });
      
      setInsumos(insumosTransformados);
      console.log('Insumos transformados:', insumosTransformados.length);
    } catch (error) {
      console.error('Error al cargar insumos:', error);
      showNotification('Error al cargar los insumos: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Funciones auxiliares
  const getCategoriaName = (id) => {
    const categoria = categorias.find(cat => cat.id === parseInt(id));
    return categoria ? categoria.nombreCategoria : 'Sin categoría';
  };

  const getUnidadName = (id) => {
    const unidad = unidades.find(uni => parseInt(uni.idunidadmedida) === parseInt(id));
    return unidad ? unidad.unidadmedida : 'unid';
  };

  const getCategoriaId = (nombre) => {
    const categoria = categorias.find(cat => cat.nombreCategoria === nombre);
    return categoria ? categoria.id : null;
  };

  const getUnidadId = (nombre) => {
    const unidad = unidades.find(uni => uni.unidadmedida === nombre);
    return unidad ? unidad.idunidadmedida : null;
  };

  const getUnidadesDisponibles = (nombreProducto) => {
    const unidadesPredefinidas = unidadesPorProducto[nombreProducto];
    
    if (unidadesPredefinidas) {
      return unidades.filter(unidadAPI => 
        unidadesPredefinidas.includes(unidadAPI.unidadmedida)
      );
    }
    
    return unidades;
  };

  // Función para determinar si una categoría es especial (requiere catálogo)
  const esCategoriaEspecial = (categoriaId) => {
    const categoria = categorias.find(cat => cat.id === parseInt(categoriaId));
    const nombreCategoria = categoria?.nombreCategoria?.toLowerCase();
    
    return ['rellenos', 'sabores', 'adiciones', 'toppings', 'relleno', 'sabor', 'adicion'].includes(nombreCategoria);
  };

  // Función para obtener el tipo de catálogo según la categoría
  const getTipoCatalogo = (categoriaId) => {
    const categoria = categorias.find(cat => cat.id === parseInt(categoriaId));
    const nombreCategoria = categoria?.nombreCategoria?.toLowerCase();
    
    if (nombreCategoria.includes('relleno')) return 'relleno';
    if (nombreCategoria.includes('sabor')) return 'sabor';
    if (nombreCategoria.includes('adicion') || nombreCategoria.includes('topping')) return 'adicion';
    
    return null;
  };

  // Funciones de notificación
  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const toggleStockInfo = () => {
    setShowStockInfo(!showStockInfo);
  };

  // Función para cambiar estado
  const toggleEstado = async (id) => {
    try {
      const insumo = insumos.find(i => i.id === id);
      const nuevoEstado = !insumo.estado;
      
      await insumoApiService.cambiarEstadoInsumo(id, nuevoEstado);
      
      setInsumos(insumos.map(i => i.id === id ? { ...i, estado: nuevoEstado } : i));
      showNotification(`Insumo ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      showNotification('Error al cambiar el estado: ' + error.message, 'error');
    }
  };

  // Funciones del modal principal
  const abrirModal = (tipo, insumo = null) => {
    setModal({ visible: true, tipo, insumo });
    if (tipo === 'editar' && insumo) {
      const originalData = insumo._originalData;
      setForm({ 
        nombreInsumo: originalData.nombreInsumo,
        idCategoriaInsumos: originalData.idCategoriaInsumos,
        cantidad: originalData.cantidad,
        idUnidadMedida: originalData.idUnidadMedida,
        idImagen: originalData.idImagen,
        estado: originalData.estado,
        stockMinimo: insumo.stockMinimo
      });
    } else if (tipo === 'agregar') {
      setForm({ 
        nombreInsumo: '', 
        idCategoriaInsumos: '', 
        cantidad: '', 
        idUnidadMedida: '', 
        idImagen: null, 
        estado: true, 
        stockMinimo: 5
      });
    }
    setErrors({});
  };

  const cerrarModal = () => {
    setModal({ visible: false, tipo: '', insumo: null });
    setForm({ 
      nombreInsumo: '', 
      idCategoriaInsumos: '', 
      cantidad: '', 
      idUnidadMedida: '', 
      idImagen: null, 
      estado: true, 
      stockMinimo: 5
    });
    setErrors({});
  };

  // Funciones para el modal de categoría
  const abrirModalCategoria = () => {
    setModalCategoriaVisible(true);
    setFormCategoria({
      nombreCategoria: '',
      descripcion: ''
    });
    setErroresCategoria({
      nombreCategoria: '',
      descripcion: ''
    });
  };

  const cerrarModalCategoria = () => {
    setModalCategoriaVisible(false);
    setFormCategoria({
      nombreCategoria: '',
      descripcion: ''
    });
    setErroresCategoria({
      nombreCategoria: '',
      descripcion: ''
    });
  };

  const handleChangeCategoriaForm = (e) => {
    const { name, value } = e.target;
    setFormCategoria(prev => ({
      ...prev,
      [name]: value
    }));

    const error = validateCategoriaField(name, value);
    setErroresCategoria(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateCategoriaField = (name, value) => {
    let error = '';

    switch (name) {
      case 'nombreCategoria':
        if (!value.trim()) {
          error = 'El nombre es obligatorio';
        } else if (value.trim().length < 3) {
          error = 'El nombre debe tener al menos 3 caracteres';
        } else if (value.trim().length > 50) {
          error = 'El nombre no puede superar los 50 caracteres';
        }
        break;
      
      case 'descripcion':
        if (!value.trim()) {
          error = 'La descripción es obligatoria';
        } else if (value.trim().length < 10) {
          error = 'La descripción debe tener al menos 10 caracteres';
        }
        break;
    }

    return error;
  };

  const guardarCategoria = async () => {
    const erroresValidacion = {
      nombreCategoria: validateCategoriaField('nombreCategoria', formCategoria.nombreCategoria),
      descripcion: validateCategoriaField('descripcion', formCategoria.descripcion)
    };

    setErroresCategoria(erroresValidacion);

    const hasErrors = Object.values(erroresValidacion).some(error => error !== '');
    
    if (hasErrors) {
      showNotification('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    try {
      const datosCategoria = {
        nombreCategoria: formCategoria.nombreCategoria.trim(),
        descripcion: formCategoria.descripcion.trim(),
        estado: true
      };

      const nuevaCategoria = await categoriaInsumoApiService.crearCategoria(datosCategoria);
      
      await cargarCategorias();
      
      setForm(prev => ({
        ...prev,
        idCategoriaInsumos: nuevaCategoria.id
      }));

      cerrarModalCategoria();
      showNotification('Categoría creada exitosamente');
    } catch (error) {
      console.error('Error al crear categoría:', error);
      showNotification('Error al crear la categoría: ' + error.message, 'error');
    }
  };

  // Funciones para el modal de catálogo
  const abrirModalSelectorCatalogo = (insumo) => {
    setInsumoParaCatalogo(insumo);
    setModalSelectorVisible(true);
  };

  const cerrarModalSelector = () => {
    setModalSelectorVisible(false);
    setInsumoParaCatalogo(null);
  };

  const seleccionarTipoCatalogo = (tipo) => {
    setTipoCatalogo(tipo);
    setModalSelectorVisible(false);
    setModalCatalogoVisible(true);
    setFormCatalogo({
      nombre: '',
      precioadicion: 0,
      estado: true
    });
    setErroresCatalogo({
      nombre: '',
      precioadicion: ''
    });
  };

  const cerrarModalCatalogo = () => {
    setModalCatalogoVisible(false);
    setTipoCatalogo('');
    setInsumoParaCatalogo(null);
    setFormCatalogo({
      nombre: '',
      precioadicion: 0,
      estado: true
    });
    setErroresCatalogo({
      nombre: '',
      precioadicion: ''
    });
  };

  const handleChangeCatalogoForm = (e) => {
    const { name, value } = e.target;
    setFormCatalogo(prev => ({
      ...prev,
      [name]: name === 'precioadicion' ? parseFloat(value) || 0 : value
    }));

    const error = validateCatalogoField(name, value);
    setErroresCatalogo(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateCatalogoField = (name, value) => {
    let error = '';

    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          error = 'El nombre es obligatorio';
        } else if (value.trim().length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres';
        } else if (value.trim().length > 20) {
          error = 'El nombre no puede superar los 20 caracteres';
        }
        break;
      
      case 'precioadicion':
        if (!value.toString().trim()) {
          error = 'El precio es obligatorio';
        } else if (isNaN(value) || Number(value) < 0) {
          error = 'El precio debe ser un número mayor o igual a 0';
        } else if (Number(value) > 100000) {
          error = 'El precio no puede ser mayor a 100,000';
        }
        break;
    }

    return error;
  };

  const guardarCatalogo = async () => {
    const erroresValidacion = {
      nombre: validateCatalogoField('nombre', formCatalogo.nombre),
      precioadicion: validateCatalogoField('precioadicion', formCatalogo.precioadicion)
    };

    setErroresCatalogo(erroresValidacion);

    const hasErrors = Object.values(erroresValidacion).some(error => error !== '');
    
    if (hasErrors) {
      showNotification('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    try {
      const datosCatalogo = {
        nombre: formCatalogo.nombre.trim(),
        precioadicion: formCatalogo.precioadicion,
        idinsumos: insumoParaCatalogo.id,
        estado: formCatalogo.estado
      };

      // Llamar al servicio según el tipo de catálogo
      await insumoApiService.crearCatalogo(tipoCatalogo, datosCatalogo);
      
      cerrarModalCatalogo();
      showNotification(`Catálogo de ${tipoCatalogo} creado exitosamente`);
    } catch (error) {
      console.error('Error al crear catálogo:', error);
      showNotification('Error al crear el catálogo: ' + error.message, 'error');
    }
  };

  // Manejo de cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };

    if (name === 'nombreInsumo' && value) {
      const unidadesDisponibles = getUnidadesDisponibles(value);
      const unidadActual = newForm.idUnidadMedida;
      const unidadValida = unidadesDisponibles.some(u => u.idunidadmedida == unidadActual);
      
      if (!unidadValida && unidadesDisponibles.length > 0) {
        newForm.idUnidadMedida = unidadesDisponibles[0].idunidadmedida;
      }
    }

    setForm(newForm);

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Validación de campos
  const validateField = (name, value) => {
    let error = null;
    
    switch (name) {
      case 'nombreInsumo':
        if (!value.toString().trim()) {
          error = 'El nombre es obligatorio';
        }
        break;
      
      case 'idCategoriaInsumos':
        if (!value) {
          error = 'La categoría es obligatoria';
        }
        break;
      
      case 'idUnidadMedida':
        if (!value) {
          error = 'La unidad es obligatoria';
        }
        break;
      
      case 'cantidad':
        if (!value.toString().trim()) {
          error = 'La cantidad es obligatoria';
        } else if (isNaN(value) || Number(value) <= 0) {
          error = 'La cantidad debe ser un número mayor a 0';
        } else if (Number(value) > 10000) {
          error = 'La cantidad no puede ser mayor a 10,000';
        }
        break;

      case 'stockMinimo':
        if (!value.toString().trim()) {
          error = 'El stock mínimo es obligatorio';
        } else if (isNaN(value) || Number(value) < 0) {
          error = 'El stock mínimo debe ser un número mayor o igual a 0';
        } else if (Number(value) > 1000) {
          error = 'El stock mínimo no puede ser mayor a 1,000';
        }
        break;
    }
    
    return error;
  };

  // Función para convertir archivo a Base64
  const convertirABase64 = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
    reader.onerror = (error) => console.error('Error al leer archivo:', error);
  };

  // Validación completa del formulario
  const validarFormulario = () => {
    const erroresValidacion = {
      nombreInsumo: validateField('nombreInsumo', form.nombreInsumo),
      idCategoriaInsumos: validateField('idCategoriaInsumos', form.idCategoriaInsumos),
      idUnidadMedida: validateField('idUnidadMedida', form.idUnidadMedida),
      cantidad: validateField('cantidad', form.cantidad),
      stockMinimo: validateField('stockMinimo', form.stockMinimo)
    };

    setErrors(erroresValidacion);

    const hasErrors = Object.values(erroresValidacion).some(error => error !== null);
    
    if (hasErrors) {
      showNotification('Por favor corrige los errores en el formulario', 'error');
      return false;
    }

    return true;
  };

  // Función para guardar insumo - FIX DEL BUG DE IMAGEN
  const guardar = async () => {
    if (!validarFormulario()) return;

    try {
      console.log('=== GUARDANDO INSUMO ===');
      
      const datosAPI = {
        nombreInsumo: form.nombreInsumo.trim(),
        idCategoriaInsumos: parseInt(form.idCategoriaInsumos),
        idUnidadMedida: parseInt(form.idUnidadMedida),
        cantidad: form.cantidad ? parseFloat(form.cantidad) : 0,
        estado: form.estado
      };

      // Solo incluir imagen si existe y no está vacía
      if (form.idImagen && form.idImagen.toString().trim() !== '') {
        datosAPI.idImagen = form.idImagen;
      }

      console.log('Datos preparados para API:', JSON.stringify(datosAPI, null, 2));

      if (modal.tipo === 'agregar') {
        console.log('Creando nuevo insumo...');
        await insumoApiService.crearInsumo(datosAPI);
        showNotification('Insumo agregado exitosamente');
      } else if (modal.tipo === 'editar') {
        console.log('Actualizando insumo existente...');
        await insumoApiService.actualizarInsumo(modal.insumo.id, datosAPI);
        showNotification('Insumo actualizado exitosamente');
      }

      await cargarInsumos();
      cerrarModal();
    } catch (error) {
      console.error('Error al guardar:', error);
      
      let mensajeError = 'Error al guardar el insumo';
      
      if (error.status === 500) {
        mensajeError = 'Error interno del servidor. Verifica que todos los datos sean válidos.';
      } else if (error.status === 400) {
        mensajeError = 'Datos inválidos. ' + (error.message || '');
      } else if (error.message) {
        mensajeError = error.message;
      }
      
      showNotification(mensajeError, 'error');
    }
  };

  // Función para eliminar insumo
  const eliminar = async () => {
    try {
      await insumoApiService.eliminarInsumo(modal.insumo.id);
      showNotification('Insumo eliminado exitosamente');
      await cargarInsumos();
      cerrarModal();
    } catch (error) {
      console.error('Error al eliminar:', error);
      showNotification('Error al eliminar: ' + error.message, 'error');
    }
  };

  // Filtrado de insumos
  const insumosFiltrados = insumos.filter((insumo) => {
    if (!filtro.trim()) return true;
    
    const filtroLower = filtro.toLowerCase();
    
    const toSafeString = (value) => {
      if (value === null || value === undefined) return '';
      return String(value).toLowerCase();
    };
    
    return (
      toSafeString(insumo.nombre).includes(filtroLower) ||
      toSafeString(insumo.categoria).includes(filtroLower) ||
      toSafeString(insumo.unidad).includes(filtroLower) ||
      toSafeString(insumo.cantidad).includes(filtroLower) ||
      toSafeString(insumo.stockMinimo).includes(filtroLower) ||
      toSafeString(insumo.estado ? 'activo' : 'inactivo').includes(filtroLower) ||
      toSafeString(`${insumo.cantidad} ${insumo.unidad}`).includes(filtroLower)
    );
  });

  // Funciones de stock
  const getStockStatus = (insumo) => {
    const { cantidad, stockMinimo } = insumo;
    const porcentaje = stockMinimo > 0 ? (cantidad / stockMinimo) * 100 : 100;
    
    if (cantidad <= 0) return 'agotado';
    if (porcentaje < 20) return 'critico';
    if (porcentaje < 50) return 'bajo';
    return 'normal';
  };

  const getStockStyle = (insumo) => {
    const status = getStockStatus(insumo);
    const baseStyle = {
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold',
      fontSize: '12px',
      textAlign: 'center'
    };

    switch (status) {
      case 'agotado':
        return { ...baseStyle, backgroundColor: '#ffcdd2', color: '#b71c1c', border: '1px solid #f44336' };
      case 'critico':
        return { ...baseStyle, backgroundColor: '#ffebee', color: '#c62828', border: '1px solid #ef5350' };
      case 'bajo':
        return { ...baseStyle, backgroundColor: '#fff3e0', color: '#ef6c00', border: '1px solid #ff9800' };
      default:
        return { ...baseStyle, backgroundColor: '#e8f5e8', color: '#2e7d32', border: '1px solid #4caf50' };
    }
  };

  // Componentes de indicadores
  const StockIndicator = ({ insumo }) => {
    const status = getStockStatus(insumo);
    const style = getStockStyle(insumo);
    const icons = {
      'agotado': 'A',
      'critico': 'C',
      'bajo': 'B',
      'normal': 'N'
    };
    
    return (
      <div style={style}>
        {insumo.cantidad} {insumo.unidad} {icons[status]}
      </div>
    );
  };

  const StockMinimoIndicator = ({ insumo }) => {
    const status = getStockStatus(insumo);
    const style = {
      padding: '2px 6px',
      borderRadius: '3px',
      fontSize: '11px',
      backgroundColor: status === 'critico' || status === 'bajo' || status === 'agotado' ? '#ffebee' : '#f5f5f5',
      color: status === 'critico' || status === 'bajo' || status === 'agotado' ? '#c62828' : '#666'
    };
    
    return (
      <div style={style}>
        Min: {insumo.stockMinimo} {insumo.unidad}
      </div>
    );
  };

  // Renderizado condicional para loading
  if (loading || loadingCategorias || loadingUnidades) {
    return (
      <div className="admin-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div>
          {loading && <div>Cargando insumos...</div>}
          {loadingCategorias && <div>Cargando categorías...</div>}
          {loadingUnidades && <div>Cargando unidades de medida...</div>}
        </div>
      </div>
    );
  }

  // Renderizado principal
  return (
    <div className="admin-wrapper">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      <div className="admin-toolbar">
        <button className="admin-button pink" onClick={() => abrirModal('agregar')}>+ Agregar</button>
        <SearchBar 
          value={filtro} 
          onChange={setFiltro} 
          placeholder="Buscar por nombre, categoría, cantidad, estado..." 
        />
      </div>

      <div style={{ margin: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '14px', color: '#666' }}>
          📊 {insumos.length} insumos | 📂 {categorias.length} categorías | 📏 {unidades.length} unidades
        </div>
        <button 
          className="admin-button info-button" 
          onClick={toggleStockInfo}
          style={{ 
            padding: '5px 10px', 
            fontSize: '14px',
            backgroundColor: '#e3f2fd',
            color: '#1565c0',
            border: '1px solid #bbdefb'
          }}
        >
          📚 
        </button>
      </div>

      {showStockInfo && (
        <div className="stock-info-message" style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '15px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ marginTop: 0 }}>📊 Niveles de Stock:</h4>
          <ul style={{ marginBottom: 0 }}>
            <li><strong>Crítico:</strong> Menos del 20% del stock mínimo</li>
            <li><strong>Bajo:</strong> Entre 20% y 50% del stock mínimo</li>
            <li><strong>Normal:</strong> Más del 50% del stock mínimo</li>
          </ul>
        </div>
      )}

      <h2 className="admin-section-title">Gestión de Insumos</h2>
      <DataTable
        value={insumosFiltrados}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 20]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} insumos"
        className="admin-table"
      >
        <Column header="Nº" body={(rowData, { rowIndex }) => rowIndex + 1} style={{ width: '3rem', textAlign: 'center' }} />
        <Column field="nombre" header="Nombre" />
        <Column field="categoria" header="Categoría" />
        <Column header="Stock Actual" body={(insumo) => <StockIndicator insumo={insumo} />} />
        <Column header="Stock Mínimo" body={(insumo) => <StockMinimoIndicator insumo={insumo} />} />
        <Column
          header="Estado"
          body={i => (
            <InputSwitch checked={i.estado} onChange={() => toggleEstado(i.id)} />
          )}
        />
        <Column
          header="Acción"
          body={(rowData) => (
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <button className="admin-button gray" title="Visualizar" onClick={() => abrirModal('ver', rowData)}>👁</button>
              <button
                className={`admin-button yellow ${!rowData.estado ? 'disabled' : ''}`}
                title="Editar"
                onClick={() => rowData.estado && abrirModal('editar', rowData)}
                disabled={!rowData.estado}
                style={{
                  opacity: !rowData.estado ? 0.5 : 1,
                  cursor: !rowData.estado ? 'not-allowed' : 'pointer'
                }}
              >✏️</button>
              <button
                className={`admin-button red ${!rowData.estado ? 'disabled' : ''}`}
                title="Eliminar"
                onClick={() => rowData.estado && abrirModal('eliminar', rowData)}
                disabled={!rowData.estado}
                style={{
                  opacity: !rowData.estado ? 0.5 : 1,
                  cursor: !rowData.estado ? 'not-allowed' : 'pointer'
                }}
              >🗑️</button>
              {/* BOTÓN CATÁLOGO MEJORADO */}
              {rowData.estado && esCategoriaEspecial(rowData._originalData?.idCategoriaInsumos) && (
                <button
                  className="catalog-button"
                  title="Agregar Catálogo"
                  onClick={() => abrirModalSelectorCatalogo(rowData)}
                  style={{
                    backgroundColor: '#6c5ce7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(108, 92, 231, 0.3)',
                    minHeight: '32px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#5f3dc4';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(108, 92, 231, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#6c5ce7';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(108, 92, 231, 0.3)';
                  }}
                >
                  <span style={{ fontSize: '14px' }}>📋</span>
                  <span>Catálogo</span>
                </button>
              )}
            </div>
          )}
        />
      </DataTable>

      
      {modal.visible && (
        <Modal visible={modal.visible} onClose={cerrarModal}>
          <h2 className="modal-title">
            {modal.tipo === 'agregar' && 'Agregar Insumo'}
            {modal.tipo === 'editar' && 'Editar Insumo'}
            {modal.tipo === 'ver' && 'Detalles Insumo'}
            {modal.tipo === 'eliminar' && 'Eliminar Insumo'}
          </h2>

          <div className="modal-body">
            {modal.tipo === 'eliminar' ? (
              <p>¿Eliminar <strong>{modal.insumo?.nombre}</strong>?</p>
            ) : modal.tipo === 'ver' ? (
              <div className="modal-form-grid">
                <label>
                  Nombre
                  <input
                    value={modal.insumo?.nombre || ''}
                    className="modal-input"
                    readOnly
                    style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                  />
                </label>

                <label>
                  Categoría
                  <input
                    value={modal.insumo?.categoria || ''}
                    className="modal-input"
                    readOnly
                    style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                  />
                </label>

                <label>
                  Cantidad
                  <input
                    type="number"
                    value={modal.insumo?.cantidad || ''}
                    className="modal-input"
                    readOnly
                    style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                  />
                </label>

                <label>
                  Unidad
                  <input
                    value={modal.insumo?.unidad || ''}
                    className="modal-input"
                    readOnly
                    style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                  />
                </label>

                <label style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <div>Stock Mínimo</div>
                      <input
                        type="number"
                        value={modal.insumo?.stockMinimo || ''}
                        className="modal-input"
                        readOnly
                        style={{
                          backgroundColor: '#f5f5f5',
                          cursor: 'not-allowed',
                          width: '100%'
                        }}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div>Estado</div>
                      <div style={{
                        marginTop: '5px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        backgroundColor: modal.insumo?.estado ? '#e8f5e9' : '#ffebee',
                        color: modal.insumo?.estado ? '#2e7d32' : '#c62828',
                        fontWeight: '500',
                        height: '38px'
                      }}>
                        {modal.insumo?.estado ? 'Activo' : 'Inactivo'}
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            ) : (
              <div className="modal-form-grid">
                <label>
                  Nombre*
                  <input
                    name="nombreInsumo"
                    value={form.nombreInsumo}
                    onChange={handleChange}
                    className={`modal-input ${errors.nombreInsumo ? 'input-invalid' : form.nombreInsumo ? 'input-valid' : ''}`}
                    list="nombres-sugeridos"
                  />
                  <datalist id="nombres-sugeridos">
                    {opcionesNombre.map((op, i) => <option key={i} value={op} />)}
                  </datalist>
                  {errors.nombreInsumo && <span className="error-message">{errors.nombreInsumo}</span>}
                </label>

                <label>
                  Categoría*
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <select
                      name="idCategoriaInsumos"
                      value={form.idCategoriaInsumos}
                      onChange={handleChange}
                      className={`modal-input ${errors.idCategoriaInsumos ? 'input-invalid' : form.idCategoriaInsumos ? 'input-valid' : ''}`}
                      disabled={loadingCategorias}
                      style={{ flex: 1 }}
                    >
                      <option value="">
                        {loadingCategorias ? 'Cargando categorías...' : 'Selecciona una categoría'}
                      </option>
                      {categorias.length === 0 && !loadingCategorias && (
                        <option value="" disabled>No hay categorías disponibles</option>
                      )}
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombreCategoria}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      type="button"
                      onClick={abrirModalCategoria}
                      style={{
                        width: '35px',
                        height: '35px',
                        borderRadius: '5px',
                        border: '1px solid #d1d5db',
                        backgroundColor: '#f9fafb',
                        color: '#374151',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        minWidth: '35px'
                      }}
                      title="Agregar nueva categoría"
                    >
                      +
                    </button>
                  </div>
                  
                  {errors.idCategoriaInsumos && <span className="error-message">{errors.idCategoriaInsumos}</span>}
                </label>

                <label>
                  Cantidad*
                  <input
                    type="number"
                    name="cantidad"
                    value={form.cantidad}
                    onChange={handleChange}
                    className={`modal-input ${errors.cantidad ? 'input-invalid' : form.cantidad ? 'input-valid' : ''}`}
                    min="0"
                    step="0.01"
                  />
                  {errors.cantidad && <span className="error-message">{errors.cantidad}</span>}
                </label>

                <label>
                  Unidad*
                  <select
                    name="idUnidadMedida"
                    value={form.idUnidadMedida}
                    onChange={handleChange}
                    className={`modal-input ${errors.idUnidadMedida ? 'input-invalid' : form.idUnidadMedida ? 'input-valid' : ''}`}
                    disabled={loadingUnidades}
                  >
                    <option value="">
                      {loadingUnidades ? 'Cargando unidades...' : 'Selecciona una unidad'}
                    </option>
                    {unidades.length === 0 && !loadingUnidades && (
                      <option value="" disabled>No hay unidades disponibles</option>
                    )}
                    {form.nombreInsumo ? (
                      getUnidadesDisponibles(form.nombreInsumo).map((unidad) => (
                        <option key={unidad.idunidadmedida} value={unidad.idunidadmedida}>
                          {unidad.unidadmedida}
                        </option>
                      ))
                    ) : (
                      unidades.map((unidad) => (
                        <option key={unidad.idunidadmedida} value={unidad.idunidadmedida}>
                          {unidad.unidadmedida}
                        </option>
                      ))
                    )}
                  </select>
                  {errors.idUnidadMedida && <span className="error-message">{errors.idUnidadMedida}</span>}
                </label>

                <label style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <div>Stock Mínimo*</div>
                      <input
                        type="number"
                        name="stockMinimo"
                        value={form.stockMinimo}
                        onChange={handleChange}
                        className={`modal-input ${errors.stockMinimo ? 'input-invalid' : form.stockMinimo ? 'input-valid' : ''}`}
                        min="0"
                        step="1"
                      />
                      {errors.stockMinimo && <span className="error-message">{errors.stockMinimo}</span>}
                    </div>
                    
                    {modal.tipo !== 'agregar' && (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '10px', paddingBottom: '5px' }}>
                        <span>Estado:</span>
                        <InputSwitch
                          checked={form.estado}
                          onChange={(e) => setForm({ ...form, estado: e.value })}
                          style={{ transform: 'scale(0.8)' }}
                        />
                      </div>
                    )}
                  </div>
                </label>

                <label style={{ gridColumn: '1 / -1' }}>
                  Imagen (Opcional)
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const archivo = e.target.files[0];
                      if (archivo) {
                        convertirABase64(archivo, (base64) => {
                          setForm((prev) => ({ ...prev, idImagen: base64 }));
                        });
                      }
                    }}
                    className="modal-input"
                  />
                </label>

                {form.idImagen && (
                  <img
                    src={form.idImagen}
                    alt="Vista previa"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100px',
                      marginTop: '-10px',
                      gridColumn: '1 / -1',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>
              {modal.tipo === 'ver' ? 'Cerrar' : 'Cancelar'}
            </button>
            {modal.tipo !== 'ver' && (
              <button
                className={`modal-btn save-btn ${modal.tipo === 'eliminar' ? 'delete-btn' : ''}`}
                onClick={modal.tipo === 'eliminar' ? eliminar : guardar}
              >
                {modal.tipo === 'eliminar' ? 'Eliminar' : 'Guardar'}
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* Modal para agregar categoría */}
      {modalCategoriaVisible && (
        <Modal visible={modalCategoriaVisible} onClose={cerrarModalCategoria}>
          <h2 className="modal-title">Agregar Nueva Categoría</h2>
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label>
                Nombre*
                <input
                  name="nombreCategoria"
                  value={formCategoria.nombreCategoria}
                  onChange={handleChangeCategoriaForm}
                  className={`modal-input ${erroresCategoria.nombreCategoria ? 'input-invalid' : formCategoria.nombreCategoria ? 'input-valid' : ''}`}
                  placeholder="Ingresa el nombre de la categoría"
                />
                {erroresCategoria.nombreCategoria && (
                  <span className="error-message">{erroresCategoria.nombreCategoria}</span>
                )}
              </label>
              
              <label>
                Descripción*
                <textarea
                  name="descripcion"
                  value={formCategoria.descripcion}
                  onChange={handleChangeCategoriaForm}
                  className={`modal-input textarea ${erroresCategoria.descripcion ? 'input-invalid' : formCategoria.descripcion ? 'input-valid' : ''}`}
                  rows={3}
                  style={{ resize: 'vertical' }}
                  placeholder="Describe la categoría..."
                />
                {erroresCategoria.descripcion && (
                  <span className="error-message">{erroresCategoria.descripcion}</span>
                )}
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              className="modal-btn cancel-btn" 
              onClick={cerrarModalCategoria}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="modal-btn save-btn"
              onClick={guardarCategoria}
              type="button"
            >
              Guardar
            </button>
          </div>
        </Modal>
      )}

      {/* Modal selector de tipo de catálogo - DISEÑO MEJORADO */}
      {modalSelectorVisible && (
        <Modal visible={modalSelectorVisible} onClose={cerrarModalSelector}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '30px',
            margin: '-20px -20px 20px -20px',
            borderRadius: '12px 12px 0 0',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '15px',
              fontSize: '24px',
              cursor: 'pointer',
              opacity: '0.8',
              transition: 'opacity 0.2s'
            }} 
            onClick={cerrarModalSelector}
            onMouseEnter={(e) => e.target.style.opacity = '1'}
            onMouseLeave={(e) => e.target.style.opacity = '0.8'}>
              ×
            </div>
            
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎯</div>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '600' }}>
              Seleccionar Tipo de Catálogo
            </h2>
            <p style={{ margin: 0, opacity: '0.9', fontSize: '16px' }}>
              ¿Qué tipo de catálogo deseas crear para <strong>{insumoParaCatalogo?.nombre}</strong>?
            </p>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            padding: '20px 0'
          }}>
            <div 
              className="catalog-option"
              onClick={() => seleccionarTipoCatalogo('adicion')}
              style={{
                background: 'linear-gradient(145deg, #ff6b6b, #ee5a52)',
                color: 'white',
                padding: '30px 20px',
                borderRadius: '16px',
                cursor: 'pointer',
                textAlign: 'center',
                border: 'none',
                boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
                transition: 'all 0.3s ease',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 12px 35px rgba(255, 107, 107, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.3)';
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>🧁</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>Adiciones</h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: '0.9' }}>
                Ingredientes extra para personalizar
              </p>
            </div>
            
            <div 
              className="catalog-option"
              onClick={() => seleccionarTipoCatalogo('relleno')}
              style={{
                background: 'linear-gradient(145deg, #4ecdc4, #44a08d)',
                color: 'white',
                padding: '30px 20px',
                borderRadius: '16px',
                cursor: 'pointer',
                textAlign: 'center',
                border: 'none',
                boxShadow: '0 8px 25px rgba(78, 205, 196, 0.3)',
                transition: 'all 0.3s ease',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 12px 35px rgba(78, 205, 196, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(78, 205, 196, 0.3)';
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>🥧</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>Rellenos</h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: '0.9' }}>
                Rellenos cremosos y deliciosos
              </p>
            </div>
            
            <div 
              className="catalog-option"
              onClick={() => seleccionarTipoCatalogo('sabor')}
              style={{
                background: 'linear-gradient(145deg, #a8edea, #fed6e3)',
                color: '#333',
                padding: '30px 20px',
                borderRadius: '16px',
                cursor: 'pointer',
                textAlign: 'center',
                border: 'none',
                boxShadow: '0 8px 25px rgba(168, 237, 234, 0.4)',
                transition: 'all 0.3s ease',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 12px 35px rgba(168, 237, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(168, 237, 234, 0.4)';
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>🍰</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>Sabores</h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: '0.8' }}>
                Sabores únicos y especiales
              </p>
            </div>
          </div>
          
          <div style={{ 
            textAlign: 'center', 
            paddingTop: '20px',
            borderTop: '1px solid #eee',
            marginTop: '20px'
          }}>
            <button 
              onClick={cerrarModalSelector}
              style={{
                background: '#f8f9fa',
                color: '#6c757d',
                border: '2px solid #dee2e6',
                borderRadius: '8px',
                padding: '10px 30px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e9ecef';
                e.target.style.borderColor = '#adb5bd';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f8f9fa';
                e.target.style.borderColor = '#dee2e6';
              }}
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {/* Modal para agregar catálogo específico - DISEÑO MEJORADO */}
      {modalCatalogoVisible && (
        <Modal visible={modalCatalogoVisible} onClose={cerrarModalCatalogo}>
          <div style={{
            background: tipoCatalogo === 'adicion' 
              ? 'linear-gradient(135deg, #ff6b6b, #ee5a52)' 
              : tipoCatalogo === 'relleno'
              ? 'linear-gradient(135deg, #4ecdc4, #44a08d)'
              : 'linear-gradient(135deg, #a8edea, #fed6e3)',
            color: tipoCatalogo === 'sabor' ? '#333' : 'white',
            padding: '30px',
            margin: '-20px -20px 20px -20px',
            borderRadius: '12px 12px 0 0',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '15px',
              fontSize: '24px',
              cursor: 'pointer',
              opacity: '0.8',
              transition: 'opacity 0.2s'
            }} 
            onClick={cerrarModalCatalogo}
            onMouseEnter={(e) => e.target.style.opacity = '1'}
            onMouseLeave={(e) => e.target.style.opacity = '0.8'}>
              ×
            </div>
            
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>
              {tipoCatalogo === 'adicion' ? '🧁' : tipoCatalogo === 'relleno' ? '🥧' : '🍰'}
            </div>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '600' }}>
              Crear {tipoCatalogo === 'adicion' ? 'Adición' : tipoCatalogo === 'relleno' ? 'Relleno' : 'Sabor'}
            </h2>
            <p style={{ margin: 0, opacity: '0.9', fontSize: '16px' }}>
              <strong>Insumo:</strong> {insumoParaCatalogo?.nombre} • <strong>Categoría:</strong> {insumoParaCatalogo?.categoria}
            </p>
          </div>
          
          <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '14px'
                }}>
                  Nombre del {tipoCatalogo === 'adicion' ? 'Adición' : tipoCatalogo === 'relleno' ? 'Relleno' : 'Sabor'}*
                </label>
                <input
                  name="nombre"
                  value={formCatalogo.nombre}
                  onChange={handleChangeCatalogoForm}
                  className={`modal-input ${erroresCatalogo.nombre ? 'input-invalid' : formCatalogo.nombre ? 'input-valid' : ''}`}
                  placeholder={`Ej: ${tipoCatalogo === 'adicion' ? 'Chispas de chocolate' : tipoCatalogo === 'relleno' ? 'Crema de vainilla' : 'Chocolate'}`}
                  maxLength={20}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e1e5e9',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#fff'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = tipoCatalogo === 'adicion' 
                      ? '#ff6b6b' 
                      : tipoCatalogo === 'relleno' 
                      ? '#4ecdc4' 
                      : '#a8edea';
                    e.target.style.boxShadow = `0 0 0 3px ${tipoCatalogo === 'adicion' 
                      ? 'rgba(255, 107, 107, 0.1)' 
                      : tipoCatalogo === 'relleno' 
                      ? 'rgba(78, 205, 196, 0.1)' 
                      : 'rgba(168, 237, 234, 0.1)'}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e1e5e9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {erroresCatalogo.nombre && (
                  <div style={{ 
                    color: '#dc3545', 
                    fontSize: '12px', 
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>⚠</span> {erroresCatalogo.nombre}
                  </div>
                )}
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '14px'
                }}>
                  Precio de Adición*
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6c757d',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}>$</span>
                  <input
                    type="number"
                    name="precioadicion"
                    value={formCatalogo.precioadicion}
                    onChange={handleChangeCatalogoForm}
                    className={`modal-input ${erroresCatalogo.precioadicion ? 'input-invalid' : 'input-valid'}`}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 35px',
                      borderRadius: '8px',
                      border: '2px solid #e1e5e9',
                      fontSize: '16px',
                      transition: 'all 0.2s ease',
                      backgroundColor: '#fff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = tipoCatalogo === 'adicion' 
                        ? '#ff6b6b' 
                        : tipoCatalogo === 'relleno' 
                        ? '#4ecdc4' 
                        : '#a8edea';
                      e.target.style.boxShadow = `0 0 0 3px ${tipoCatalogo === 'adicion' 
                        ? 'rgba(255, 107, 107, 0.1)' 
                        : tipoCatalogo === 'relleno' 
                        ? 'rgba(78, 205, 196, 0.1)' 
                        : 'rgba(168, 237, 234, 0.1)'}`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e1e5e9';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                {erroresCatalogo.precioadicion && (
                  <div style={{ 
                    color: '#dc3545', 
                    fontSize: '12px', 
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>⚠</span> {erroresCatalogo.precioadicion}
                  </div>
                )}
                <small style={{ 
                  color: '#6c757d', 
                  fontSize: '12px',
                  display: 'block',
                  marginTop: '6px'
                }}>
                  💡 Costo adicional cuando se use este {tipoCatalogo}
                </small>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <span style={{ fontWeight: '600', color: '#495057' }}>Estado:</span>
                <InputSwitch
                  checked={formCatalogo.estado}
                  onChange={(e) => setFormCatalogo(prev => ({ ...prev, estado: e.value }))}
                  style={{ transform: 'scale(1.1)' }}
                />
                <span style={{ 
                  color: formCatalogo.estado ? '#28a745' : '#dc3545',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  {formCatalogo.estado ? '✅ Activo' : '❌ Inactivo'}
                </span>
              </div>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end',
            paddingTop: '20px',
            borderTop: '1px solid #e9ecef',
            marginTop: '20px'
          }}>
            <button 
              onClick={cerrarModalCatalogo}
              style={{
                background: '#f8f9fa',
                color: '#6c757d',
                border: '2px solid #dee2e6',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e9ecef';
                e.target.style.borderColor = '#adb5bd';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f8f9fa';
                e.target.style.borderColor = '#dee2e6';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Cancelar
            </button>
            <button 
              onClick={guardarCatalogo}
              style={{
                background: tipoCatalogo === 'adicion' 
                  ? 'linear-gradient(135deg, #ff6b6b, #ee5a52)' 
                  : tipoCatalogo === 'relleno'
                  ? 'linear-gradient(135deg, #4ecdc4, #44a08d)'
                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
            >
              ✨ Crear {tipoCatalogo === 'adicion' ? 'Adición' : tipoCatalogo === 'relleno' ? 'Relleno' : 'Sabor'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}