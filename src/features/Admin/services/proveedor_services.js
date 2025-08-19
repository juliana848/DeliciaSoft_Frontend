// Servicio API para gestión de proveedores - Versión Corregida
const BASE_URL = "https://deliciasoft-backend.onrender.com/api/proveedor";

class ProveedorApiService {
  constructor() {
    this.baseHeaders = { 'Content-Type': 'application/json' };
  }

  // Obtener todos los proveedores
  async obtenerProveedores() {
    const response = await fetch(`${BASE_URL}`, {
      method: 'GET',
      headers: this.baseHeaders,
    });
    const data = await this.handleResponse(response);
    return this.transformarProveedoresDesdeAPI(data);
  }

  // Obtener proveedor por ID
  async obtenerProveedorPorId(id) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'GET',
      headers: this.baseHeaders,
    });
    if (response.status === 404) throw new Error('Proveedor no encontrado');
    const data = await this.handleResponse(response);
    return this.transformarProveedorDesdeAPI(data);
  }

  // Crear proveedor  // 👇 Este método DEBE estar dentro de la clase
  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }
    return response.json();
  }

  // Ejemplo en crearProveedor
  async crearProveedor(proveedorData) {
    const proveedorAPI = this.transformarProveedorParaAPI(proveedorData);
    this.validarDatosProveedor(proveedorAPI);

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: this.baseHeaders,
      body: JSON.stringify(proveedorAPI),
    });

    // ✅ ahora sí existe this.handleResponse
    const data = await this.handleResponse(response);
    return this.transformarProveedorDesdeAPI(data);
  }


  // Actualizar proveedor
  async actualizarProveedor(id, proveedorData) {
    const proveedorAPI = this.transformarProveedorParaAPI(proveedorData);
    this.validarDatosProveedor(proveedorAPI);
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: this.baseHeaders,
      body: JSON.stringify(proveedorAPI),
    });
    const data = await this.handleResponse(response);
    return this.transformarProveedorDesdeAPI(data);
  }

  // Eliminar proveedor
  async eliminarProveedor(id) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: this.baseHeaders,
    });
    await this.handleResponse(response);
    return { success: true, message: 'Proveedor eliminado exitosamente' };
  }

  // Cambiar estado
  async cambiarEstadoProveedor(id, nuevoEstado) {
    const proveedorActual = await this.obtenerProveedorPorId(id);
    const datosActualizados = {
      ...this.transformarProveedorParaAPI(proveedorActual),
      estado: nuevoEstado,
    };
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: this.baseHeaders,
      body: JSON.stringify(datosActualizados),
    });
    const data = await this.handleResponse(response);
    return this.transformarProveedorDesdeAPI(data);
  }


  // Validar datos del proveedor antes de enviar
 validarDatosProveedor(proveedor) {
  const errores = [];

  if (!proveedor.tipodocumento) errores.push('Tipo de documento es requerido');
  if (!proveedor.documento) errores.push('Documento es requerido');
  if (!proveedor.contacto) errores.push('Contacto es requerido');
  if (!proveedor.correo) errores.push('Correo es requerido');
  if (!proveedor.direccion) errores.push('Dirección es requerida');

  if (proveedor.tipo === 'Jurídico') {
    if (!proveedor.nombreempresa) errores.push('Razón social es requerida para persona jurídica');
    if (!proveedor.nombreproveedor) errores.push('Nombre del contacto es requerido para persona jurídica');
  } else {
    if (!proveedor.nombreproveedor) errores.push('Nombre es requerido para persona natural');
  }

  if (errores.length > 0) {
    throw new Error('Datos inválidos: ' + errores.join(', '));
  }
}


  // Transformar datos desde la API (camelCase)
 transformarProveedorParaAPI(proveedor) {
  console.log('Transformando proveedor para API:', proveedor);
  
  const esJuridico = proveedor.tipo === 'Jurídico';
  
  return {
    tipodocumento: proveedor.tipoDocumento,   // <-- en minúsculas
    documento: this.parseToInt(proveedor.documento || proveedor.extra),
    nombreempresa: esJuridico ? (proveedor.nombreEmpresa || null) : null,
    nombreproveedor: esJuridico 
      ? (proveedor.nombreContacto || null) 
      : (proveedor.nombre || proveedor.nombreProveedor || null),
    contacto: this.parseToInt(proveedor.contacto),
    correo: proveedor.correo,
    direccion: proveedor.direccion,
    estado: proveedor.estado !== undefined ? Boolean(proveedor.estado) : true
  };
}

  // Transformar múltiples proveedores desde la API
  transformarProveedoresDesdeAPI(proveedores) {
    if (!Array.isArray(proveedores)) {
      console.warn('Los datos de proveedores no son un array:', proveedores);
      return [];
    }
    return proveedores
      .map(p => this.transformarProveedorDesdeAPI(p))
      .filter(p => p !== null);
  }

  // Transformar datos para enviar a la API (camelCase)
  transformarProveedorParaAPI(proveedor) {
    console.log('Transformando proveedor para API:', proveedor);
    
    const esJuridico = proveedor.tipo === 'Jurídico';
    
const resultado = {
  tipodocumento: proveedor.tipoDocumento,
  documento: this.parseToInt(proveedor.documento || proveedor.extra),
  nombreempresa: esJuridico ? (proveedor.nombreEmpresa || null) : null,
  nombreproveedor: esJuridico 
    ? (proveedor.nombreContacto || null) 
    : (proveedor.nombre || proveedor.nombreProveedor || null),
  contacto: this.parseToInt(proveedor.contacto),
  correo: proveedor.correo,
  direccion: proveedor.direccion,
  estado: proveedor.estado !== undefined ? Boolean(proveedor.estado) : true
};

    
    console.log('Resultado transformación para API:', resultado);
    return resultado;
  }

  // Helper para parsear enteros de forma segura
  parseToInt(value) {
    if (value === null || value === undefined || value === '') return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
  }

  // Método para probar conectividad con la API
  async probarConexion() {
    try {
      const response = await fetch(`${API_BASE_URL}/proveedor`, {
        method: 'GET',
        headers: this.baseHeaders,
      });
      
      if (response.ok) {
        console.log('✅ Conexión con API exitosa');
        return true;
      } else {
        console.error('❌ Error en conexión con API:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Error de conectividad:', error);
      return false;
    }
  }
}

// Crear instancia singleton del servicio
const proveedorApiService = new ProveedorApiService();

// Probar conexión al inicializar (opcional)
if (process.env.NODE_ENV === 'development') {
  proveedorApiService.probarConexion();
}

export default proveedorApiService;
