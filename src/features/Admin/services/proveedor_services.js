const BASE_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/proveedor";

class ProveedorApiService {
  constructor() {
    this.baseHeaders = { 
      'Content-Type': 'application/json'
    };
  }

  async crearProveedor(proveedorData) {
    console.log('📤 Enviando datos para crear proveedor:', proveedorData);
    
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: this.baseHeaders,
      body: JSON.stringify(proveedorData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      console.error('❌ Error en la respuesta del servidor:', errorData);
      throw new Error(errorData.message || 'Error al crear proveedor');
    }
    
    const data = await response.json();
    console.log('✅ Proveedor creado exitosamente:', data);
    return this.transformarProveedorDesdeAPI(data);
  }

  async actualizarProveedor(id, proveedorData) {
    console.log('📤 Enviando datos para actualizar proveedor:', { id, proveedorData });
    
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: this.baseHeaders,
      body: JSON.stringify(proveedorData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      console.error('❌ Error al actualizar proveedor:', errorData);
      throw new Error(errorData.message || 'Error al actualizar proveedor');
    }
    
    const data = await response.json();
    console.log('✅ Proveedor actualizado exitosamente:', data);
    return this.transformarProveedorDesdeAPI(data);
  }

  async eliminarProveedor(id) {
    console.log('🗑️ Eliminando proveedor con ID:', id);
    
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: this.baseHeaders,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      console.error('❌ Error al eliminar proveedor:', errorData);
      throw new Error(errorData.message || 'Error al eliminar proveedor');
    }
    
    console.log('✅ Proveedor eliminado exitosamente');
    return true;
  }

  async cambiarEstadoProveedor(id, nuevoEstado) {
    console.log('🔄 Cambiando estado del proveedor:', { id, nuevoEstado });
    
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: this.baseHeaders,
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    
    if (!response.ok) {
      // 🆕 Mejorar manejo de errores para capturar el mensaje específico
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      console.error('❌ Error al cambiar estado:', errorData);
      
      // Crear un error con la estructura correcta para que el frontend lo capture
      const error = new Error(errorData.message || 'Error al cambiar estado');
      error.response = { data: errorData };
      throw error;
    }
    
    const data = await response.json();
    console.log('✅ Estado cambiado exitosamente:', data);
    return this.transformarProveedorDesdeAPI(data);
  }

  async obtenerProveedores() {
    console.log('📋 Obteniendo lista de proveedores...');
    
    const response = await fetch(BASE_URL, {
      method: 'GET',
      headers: this.baseHeaders,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      console.error('❌ Error al obtener proveedores:', errorData);
      throw new Error(errorData.message || 'Error al obtener proveedores');
    }
    
    const data = await response.json();
    console.log('✅ Proveedores obtenidos:', data);
    return this.transformarProveedoresDesdeAPI(data);
  }

  transformarProveedorDesdeAPI(proveedor) {
    if (!proveedor) return null;
    
    const tipoProveedor = proveedor.TipoProveedor || 'Natural';
    const esJuridico = tipoProveedor === 'Jurídico';
    
    return {
      idProveedor: proveedor.idproveedor,
      tipo: tipoProveedor,
      tipoDocumento: proveedor.tipodocumento,
      documento: proveedor.documento ? String(proveedor.documento) : '',
      extra: proveedor.documento ? String(proveedor.documento) : '',
      nombre: esJuridico ? (proveedor.nombreempresa || '') : (proveedor.nombreproveedor || ''),
      nombreProveedor: proveedor.nombreproveedor || '',
      nombreEmpresa: proveedor.nombreempresa || '',
      nombreContacto: esJuridico ? (proveedor.nombreproveedor || '') : '',
      contacto: proveedor.contacto ? String(proveedor.contacto) : '',
      correo: proveedor.correo || '',
      direccion: proveedor.direccion || '',
      estado: Boolean(proveedor.estado)
    };
  }

  transformarProveedoresDesdeAPI(proveedores) {
    if (!Array.isArray(proveedores)) {
      console.warn('⚠️ Los datos recibidos no son un array:', proveedores);
      return [];
    }
    
    return proveedores
      .map(p => this.transformarProveedorDesdeAPI(p))
      .filter(p => p !== null);
  }
}

const proveedorApiService = new ProveedorApiService();
export default proveedorApiService;