import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
import '../../adminStyles.css';
import Modal from '../../components/modal';
import SearchBar from '../../components/SearchBar';
import Notification from '../../components/Notification';

export default function InsumosTable() {
  // Definición de unidades por tipo de producto
  const unidadesPorProducto = {
    'Harina': ['kg', 'g', 'lb', 'bolsa', 'paquete'],
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

  const [insumos, setInsumos] = useState([
    { id: 1, nombre: 'Harina', categoria: 'Secos', cantidad: 10, unidad: 'kg', estado: true, stockMinimo: 5 },
    { id: 2, nombre: 'Azúcar', categoria: 'Endulzantes', cantidad: 1, unidad: 'kg', estado: false, stockMinimo: 3 },
    { id: 3, nombre: 'Huevos', categoria: 'Frescos', cantidad: 8, unidad: 'unid', estado: true, stockMinimo: 12 },
    { id: 4, nombre: 'Leche', categoria: 'Frescos', cantidad: 3, unidad: 'l', estado: true, stockMinimo: 5 },
    { id: 5, nombre: 'Sal', categoria: 'Secos', cantidad: 50, unidad: 'kg', estado: true, stockMinimo: 10 }
  ]);

  const [filtro, setFiltro] = useState('');
  const [showStockInfo, setShowStockInfo] = useState(false);
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modal, setModal] = useState({ visible: false, tipo: '', insumo: null });
  const [form, setForm] = useState({ 
    nombre: '', 
    categoria: '', 
    cantidad: '', 
    unidad: '', 
    imagen: '', 
    estado: true, 
    stockMinimo: 5
  });

  const opcionesNombre = Object.keys(unidadesPorProducto);
  const opcionesCategoria = ['Secos', 'Frescos', 'Endulzantes', 'Condimentos', 'Cereales', 'Lácteos', 'Otros'];

  const [errors, setErrors] = useState({
    nombre: null,
    categoria: null,
    cantidad: null,
    unidad: null,
    stockMinimo: null
  });

  // Obtener unidades disponibles para el producto actual
  const getUnidadesDisponibles = (nombreProducto) => {
    return unidadesPorProducto[nombreProducto] || ['unid', 'kg', 'g', 'l', 'ml'];
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

  const toggleEstado = (id) => {
    const insumo = insumos.find(i => i.id === id);
    setInsumos(insumos.map(i => i.id === id ? { ...i, estado: !i.estado } : i));
    showNotification(`Insumo ${insumo.estado ? 'desactivado' : 'activado'} exitosamente`);
  };

  const abrirModal = (tipo, insumo = null) => {
    setModal({ visible: true, tipo, insumo });
    if (tipo === 'editar' && insumo) {
      setForm({ 
        ...insumo,
        unidad: insumo.unidad || getUnidadesDisponibles(insumo.nombre)[0]
      });
    } else if (tipo === 'agregar') {
      setForm({ 
        nombre: '', 
        categoria: '', 
        cantidad: '', 
        unidad: '', 
        imagen: '', 
        estado: true, 
        stockMinimo: 5
      });
    }
    setErrors({});
  };

  const cerrarModal = () => {
    setModal({ visible: false, tipo: '', insumo: null });
    setForm({ 
      nombre: '', 
      categoria: '', 
      cantidad: '', 
      unidad: '', 
      imagen: '', 
      estado: true, 
      stockMinimo: 5
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };

    // Si cambia el nombre del producto, actualizar las unidades disponibles
    if (name === 'nombre' && value) {
      const unidades = getUnidadesDisponibles(value);
      newForm.unidad = unidades.includes(newForm.unidad) ? newForm.unidad : unidades[0] || '';
    }

    setForm(newForm);

    // Validación en tiempo real
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateField = (name, value) => {
    let error = null;
    
    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          error = 'El nombre es obligatorio';
        }
        break;
      
      case 'categoria':
        if (!value.trim()) {
          error = 'La categoría es obligatoria';
        }
        break;
      
      case 'unidad':
        if (!value.trim()) {
          error = 'La unidad es obligatoria';
        } else if (form.nombre && !getUnidadesDisponibles(form.nombre).includes(value)) {
          error = 'Unidad no válida para este producto';
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
      nombre: validateField('nombre', form.nombre),
      categoria: validateField('categoria', form.categoria),
      unidad: validateField('unidad', form.unidad),
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

  const guardar = () => {
    if (!validarFormulario()) return;

    if (modal.tipo === 'agregar') {
      const nuevoId = Math.max(...insumos.map(i => i.id), 0) + 1;
      setInsumos([...insumos, { ...form, id: nuevoId }]);
      showNotification('Insumo agregado exitosamente');
    } else if (modal.tipo === 'editar') {
      setInsumos(insumos.map(i => i.id === modal.insumo.id ? form : i));
      showNotification('Insumo actualizado exitosamente');
    }

    cerrarModal();
  };

  const eliminar = () => {
    setInsumos(insumos.filter(i => i.id !== modal.insumo.id));
    showNotification('Insumo eliminado exitosamente');
    cerrarModal();
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
      'agotado': '❌',
      'critico': '⚠️',
      'bajo': '⚡',
      'normal': '✔️'
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

      <div style={{ margin: '10px 0', display: 'flex', justifyContent: 'flex-end' }}>
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
                🔍
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

      {modal.insumo?.imagen && (
        <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
          <label>
            Imagen
            <div style={{ marginTop: '5px' }}>
              <img
                src={modal.insumo.imagen}
                alt={modal.insumo.nombre}
                style={{
                  maxWidth: '100%',
                  maxHeight: '150px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
          </label>
        </div>
      )}
    </div>
      ) : (
        <div className="modal-form-grid">
          <label>
            Nombre*
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className={`modal-input ${errors.nombre ? 'input-invalid' : form.nombre ? 'input-valid' : ''}`}
              list="nombres-sugeridos"
            />
            <datalist id="nombres-sugeridos">
              {opcionesNombre.map((op, i) => <option key={i} value={op} />)}
            </datalist>
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </label>

          <label>
            Categoría*
            <input
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              className={`modal-input ${errors.categoria ? 'input-invalid' : form.categoria ? 'input-valid' : ''}`}
              list="categorias-sugeridas"
            />
            <datalist id="categorias-sugeridas">
              {opcionesCategoria.map((op, i) => <option key={i} value={op} />)}
            </datalist>
            {errors.categoria && <span className="error-message">{errors.categoria}</span>}
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
              name="unidad"
              value={form.unidad}
              onChange={handleChange}
              className={`modal-input ${errors.unidad ? 'input-invalid' : form.unidad ? 'input-valid' : ''}`}
              disabled={!form.nombre}
            >
              <option value="">Selecciona una unidad</option>
              {form.nombre && getUnidadesDisponibles(form.nombre).map((op, i) => (
                <option key={i} value={op}>{op}</option>
              ))}
            </select>
            {errors.unidad && <span className="error-message">{errors.unidad}</span>}
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
                    setForm((prev) => ({ ...prev, imagen: base64 }));
                  });
                }
              }}
              className="modal-input"
            />
          </label>

          {form.imagen && (
            <img
              src={form.imagen}
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
    </div>
  );
}