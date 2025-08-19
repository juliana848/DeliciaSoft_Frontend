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
    'Azúcar': ['kg', 'g', 'lb', 'bolsa'],
    'Huevos': ['unid', 'docena', 'cartón'],
    'Leche': ['l', 'ml', 'galón', 'bolsa', 'cartón'],
    'Sal': ['kg', 'g', 'paquete'],
    'Mantequilla': ['g', 'kg', 'barra', 'paquete'],
    'Aceite': ['l', 'ml', 'botella'],
    'Arroz': ['kg', 'g', 'lb', 'bolsa'],
    'Pasta': ['kg', 'g', 'paquete'],
    'Tomate': ['kg', 'g', 'unid', 'caja']
  };
  const unidadesToIds = {
    'Kilogramos': 1,        
    'g': 2,         
    'l': 3,         
    'ml': 4,        
    'unid': 5,      
    'lb': 6,      
    'oz': 7,      
    'cuch': 8,      
    // Unidades sin ID en el JSON (las agregarás después)
    'bolsa': null,
    'paquete': null,
    'docena': null,
    'cartón': null,
    'galón': null,
    'barra': null,
    'botella': null,
    'caja': null
  };



  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [unidades, setUnidades] = useState([]); // Estado para unidades de medida desde API
  const [loading, setLoading] = useState(true);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingUnidades, setLoadingUnidades] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [showStockInfo, setShowStockInfo] = useState(false);
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modal, setModal] = useState({ visible: false, tipo: '', insumo: null });
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

 
useEffect(() => {
    const cargarDatos = async () => {
      console.log('🚀 Iniciando carga de datos del componente...');
      
      // Cargar categorías primero
      await cargarCategorias();
      
      // Cargar unidades de medida desde API
      await cargarUnidades();
      
      // Luego cargar insumos
      await cargarInsumos();
      
      console.log('✅ Carga de datos completada');
    };
    
    cargarDatos();
  }, []);


  const cargarUnidades = async () => {
    try {
      setLoadingUnidades(true);
      console.log('🔄 Iniciando carga de unidades de medida...');
      
      const unidadesAPI = await insumoApiService.obtenerUnidadesMedida();
      console.log('📏 Unidades recibidas de la API:', unidadesAPI);
      
      if (!unidadesAPI || unidadesAPI.length === 0) {
        console.warn('⚠️ No se encontraron unidades de medida');
        showNotification('No se encontraron unidades de medida', 'warning');
        setUnidades([]);
        return;
      }
      
      setUnidades(unidadesAPI);
      console.log('✅ Unidades cargadas exitosamente:', unidadesAPI.length);
    } catch (error) {
      console.error('❌ Error al cargar unidades:', error);
      showNotification('Error al cargar las unidades de medida: ' + error.message, 'error');
      setUnidades([]);
    } finally {
      setLoadingUnidades(false);
    }
  };


  const cargarCategorias = async () => {
    try {
      setLoadingCategorias(true);
      console.log('🔄 Iniciando carga de categorías...');
      
      const categoriasAPI = await categoriaInsumoApiService.obtenerCategorias();
      console.log('📊 Categorías recibidas de la API:', categoriasAPI);
      

      const categoriasActivas = categoriasAPI.filter(cat => cat.estado === true);
      console.log('✅ Categorías activas filtradas:', categoriasActivas);
      
      if (categoriasActivas.length === 0) {
        console.warn('⚠️ No se encontraron categorías activas');
        showNotification('No se encontraron categorías activas', 'warning');
      }
      
      setCategorias(categoriasActivas);
    } catch (error) {
      console.error('❌ Error al cargar categorías:', error);
      showNotification('Error al cargar las categorías: ' + error.message, 'error');
      setCategorias([]);
    } finally {
      setLoadingCategorias(false);
    }
  };

  
  const cargarInsumos = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando insumos...');
      
      const insumosAPI = await insumoApiService.obtenerInsumos();
      console.log('📦 Insumos recibidos:', insumosAPI);
      const insumosTransformados = insumosAPI.map(insumo => ({
        id: insumo.id,
        nombre: insumo.nombreInsumo,
        categoria: insumo.nombreCategoria || getCategoriaName(insumo.idCategoriaInsumos),
        cantidad: insumo.cantidad,
        unidad: insumo.nombreUnidadMedida || getUnidadName(insumo.idUnidadMedida),
        estado: insumo.estado,
        stockMinimo: 5, 
        _originalData: insumo
      }));
      
      setInsumos(insumosTransformados);
      console.log('✅ Insumos transformados:', insumosTransformados.length);
    } catch (error) {
      console.error('❌ Error al cargar insumos:', error);
      showNotification('Error al cargar los insumos: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCategoriaName = (id) => {
    const categoria = categorias.find(cat => cat.id === parseInt(id));
    console.log(`🔍 Buscando categoría con ID ${id}:`, categoria);
    return categoria ? categoria.nombreCategoria : 'Sin categoría'; 
  };


  const getUnidadName = (id) => {
    const unidad = unidades.find(uni => parseInt(uni.idunidadmedida) === parseInt(id));
    console.log(`🔍 Buscando unidad con ID ${id}:`, unidad);
    return unidad ? unidad.unidadmedida : 'unid';
  };

  const getCategoriaId = (nombre) => {
    const categoria = categorias.find(cat => cat.nombreCategoria === nombre);
    return categoria ? categoria.id : null;
  };


  const getUnidadId = (nombre) => {
    const unidad = unidades.find(uni => uni.unidadmedida === nombre);
    console.log(`🔍 Buscando ID de unidad para "${nombre}":`, unidad);
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

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const toggleStockInfo = () => {
    setShowStockInfo(!showStockInfo);
  };


  const toggleEstado = async (id) => {
    try {
      const insumo = insumos.find(i => i.id === id);
      const nuevoEstado = !insumo.estado;
      
      await insumoApiService.cambiarEstadoInsumo(id, nuevoEstado);
      
      setInsumos(insumos.map(i => i.id === id ? { ...i, estado: nuevoEstado } : i));
      showNotification(`Insumo ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);
      showNotification('Error al cambiar el estado: ' + error.message, 'error');
    }
  };


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


  const handleChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };


    if (name === 'nombreInsumo' && value) {
      const unidadesDisponibles = getUnidadesDisponibles(value);
      const unidadActual = newForm.idUnidadMedida;
      const unidadValida = unidadesDisponibles.some(u => u.idunidadmedida == unidadActual);
      
      if (!unidadValida && unidadesDisponibles.length > 0) {
        newForm.idUnidadMedida = unidadesDisponibles[0].idunidadmedida;
        console.log(`🔄 Unidad cambiada automáticamente a: ${unidadesDisponibles[0].unidadmedida}`);
      }
    }

    setForm(newForm);

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

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

  const convertirABase64 = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
    reader.onerror = (error) => console.error('Error al leer archivo:', error);
  };

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


  const guardar = async () => {
    if (!validarFormulario()) return;

    try {
      console.log('💾 === GUARDANDO INSUMO ===');
      console.log('📝 Datos del formulario:', JSON.stringify(form, null, 2));
      

      if (!form.nombreInsumo.trim()) {
        showNotification('El nombre del insumo es requerido', 'error');
        return;
      }
      
      if (!form.idCategoriaInsumos) {
        showNotification('La categoría es requerida', 'error');
        return;
      }
      
      if (!form.idUnidadMedida) {
        showNotification('La unidad de medida es requerida', 'error');
        return;
      }

      const datosAPI = {
        nombreInsumo: form.nombreInsumo.trim(),
        idCategoriaInsumos: parseInt(form.idCategoriaInsumos),
        idUnidadMedida: parseInt(form.idUnidadMedida),
        cantidad: form.cantidad ? parseFloat(form.cantidad) : 0,
        estado: form.estado,
        idImagen: form.idImagen || null
      };

      console.log('📤 Datos preparados para API:', JSON.stringify(datosAPI, null, 2));

      const categoriaExiste = categorias.find(c => c.id === datosAPI.idCategoriaInsumos);
      const unidadExiste = unidades.find(u => u.idunidadmedida === datosAPI.idUnidadMedida);
      
      console.log('🔍 Verificación de foreign keys:');
      console.log('  - Categoría encontrada:', categoriaExiste);
      console.log('  - Unidad encontrada:', unidadExiste);
      
      if (!categoriaExiste) {
        throw new Error(`La categoría con ID ${datosAPI.idCategoriaInsumos} no existe`);
      }
      
      if (!unidadExiste) {
        throw new Error(`La unidad de medida con ID ${datosAPI.idUnidadMedida} no existe`);
      }

      if (modal.tipo === 'agregar') {
        console.log('➕ Creando nuevo insumo...');
        await insumoApiService.crearInsumo(datosAPI);
        showNotification('Insumo agregado exitosamente');
      } else if (modal.tipo === 'editar') {
        console.log('✏️ Actualizando insumo existente...');
        await insumoApiService.actualizarInsumo(modal.insumo.id, datosAPI);
        showNotification('Insumo actualizado exitosamente');
      }


      await cargarInsumos();
      cerrarModal();
      console.log('✅ Guardado exitoso');
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      

      let mensajeError = 'Error al guardar el insumo';
      
      if (error.status === 500) {
        mensajeError = 'Error interno del servidor. Verifica que todos los datos sean válidos.';
      } else if (error.status === 400) {
        mensajeError = 'Datos inválidos. ' + (error.message || '');
      } else if (error.message && error.message.includes('foreign key')) {
        mensajeError = 'Error de clave foránea: Verifica que la categoría y unidad de medida existan.';
      } else if (error.message) {
        mensajeError = error.message;
      }
      
      showNotification(mensajeError, 'error');
    }
  };

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

  const insumosFiltrados = insumos.filter((insumo) => {
    if (!filtro.trim()) return true;
    
    const filtroLower = filtro.toLowerCase();
    return (
      insumo.nombre.toLowerCase().includes(filtroLower) ||
      insumo.categoria.toLowerCase().includes(filtroLower) ||
      insumo.unidad.toLowerCase().includes(filtroLower) ||
      insumo.cantidad.toString().toLowerCase().includes(filtroLower) ||
      insumo.stockMinimo.toString().toLowerCase().includes(filtroLower) ||
      (insumo.estado ? 'activo' : 'inactivo').includes(filtroLower) ||
      `${insumo.cantidad} ${insumo.unidad}`.toLowerCase().includes(filtroLower)
    );
  });

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

  const StockIndicator = ({ insumo }) => {
    const status = getStockStatus(insumo);
    const style = getStockStyle(insumo);
    const icons = {
      'agotado': '⛔',
      'critico': '⚠️',
      'bajo': '⚡',
      'normal': '✅'
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


  if (loading || loadingCategorias || loadingUnidades) {
    return (
      <div className="admin-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div>
          {loading && <div>🔄 Cargando insumos...</div>}
          {loadingCategorias && <div>📂 Cargando categorías...</div>}
          {loadingUnidades && <div>📏 Cargando unidades de medida...</div>}
        </div>
      </div>
    );
  }

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

      <DataTable value={insumosFiltrados} paginator rows={10} className="admin-table">
        <Column header="N°" body={(rowData, { rowIndex }) => rowIndex + 1} style={{ width: '3rem', textAlign: 'center' }} />
        <Column field="nombre" header="Nombre" />
        <Column field="categoria" header="Categoría" />
        <Column header="Stock Actual" body={(insumo) => <StockIndicator insumo={insumo} />} />
        <Column header="Stock Mínimo" body={(insumo) => <StockMinimoIndicator insumo={insumo} />} />
        <Column header="Estado" body={i => (
          <InputSwitch checked={i.estado} onChange={() => toggleEstado(i.id)} />
        )} />
        <Column
          header="Acción"
          body={(rowData) => (
            <>
              <button className="admin-button gray" title="Visualizar" onClick={() => abrirModal('ver', rowData)}>
                👁
              </button>
              <button 
                className={`admin-button yellow ${!rowData.estado ? 'disabled' : ''}`} 
                title="Editar" 
                onClick={() => rowData.estado && abrirModal('editar', rowData)}
                disabled={!rowData.estado}
                style={{ 
                  opacity: !rowData.estado ? 0.5 : 1, 
                  cursor: !rowData.estado ? 'not-allowed' : 'pointer' 
                }}
              >
                ✏️
              </button>
              <button 
                className={`admin-button red ${!rowData.estado ? 'disabled' : ''}`} 
                title="Eliminar" 
                onClick={() => rowData.estado && abrirModal('eliminar', rowData)}
                disabled={!rowData.estado}
                style={{ 
                  opacity: !rowData.estado ? 0.5 : 1, 
                  cursor: !rowData.estado ? 'not-allowed' : 'pointer' 
                }}
              >
                🗑️
              </button>
            </>
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
                  <select
                    name="idCategoriaInsumos"
                    value={form.idCategoriaInsumos}
                    onChange={handleChange}
                    className={`modal-input ${errors.idCategoriaInsumos ? 'input-invalid' : form.idCategoriaInsumos ? 'input-valid' : ''}`}
                    disabled={loadingCategorias}
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
                  {errors.idCategoriaInsumos && <span className="error-message">{errors.idCategoriaInsumos}</span>}
                  
                  {process.env.NODE_ENV === 'development' && (
                    <small style={{ color: '#666', fontSize: '12px' }}>
                      Debug: {categorias.length} categorías cargadas
                      {categorias.length > 0 && (
                        <span> - IDs: [{categorias.map(c => c.id).join(', ')}]</span>
                      )}
                    </small>
                  )}
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
                  

                  {process.env.NODE_ENV === 'development' && (
                    <small style={{ color: '#666', fontSize: '12px' }}>
                      Debug: {unidades.length} unidades cargadas
                      {form.nombreInsumo && (
                        <span> - Disponibles para {form.nombreInsumo}: {getUnidadesDisponibles(form.nombreInsumo).length}</span>
                      )}
                    </small>
                  )}
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

      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          color: '#666',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: '300px'
        }}>
          <strong>🔧 Dev Tools</strong>
          <br />
          <button 
            style={{ fontSize: '11px', margin: '5px 2px', padding: '2px 6px' }}
            onClick={async () => {
              console.log('🔬 Ejecutando diagnóstico...');
              await insumoApiService.diagnosticarConexiones();
            }}
          >
            Diagnóstico API
          </button>
          <button 
            style={{ fontSize: '11px', margin: '5px 2px', padding: '2px 6px' }}
            onClick={async () => {
              console.log('🧪 Probando creación...');
              try {
                await insumoApiService.probarCreacion();
                showNotification('Prueba de creación exitosa', 'success');
              } catch (error) {
                showNotification('Error en prueba: ' + error.message, 'error');
              }
            }}
          >
            Probar Creación
          </button>
          <button 
            style={{ fontSize: '11px', margin: '5px 2px', padding: '2px 6px' }}
            onClick={() => {
              insumoApiService.limpiarCache();
              showNotification('Cache limpiado', 'info');
            }}
          >
            Limpiar Cache
          </button>
        </div>
      )}
    </div>
  );
}