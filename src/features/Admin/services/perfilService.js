// services/perfilService.js
const API_BASE_URL = 'https://deliciasoft-backend-i6g9.onrender.com/api';

class PerfilService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.userEmail = localStorage.getItem('userEmail');
    this.userRole = localStorage.getItem('userRole');
  }

  // Actualizar token si ha cambiado
  actualizarToken() {
    this.token = localStorage.getItem('authToken');
    this.userEmail = localStorage.getItem('userEmail');
    this.userRole = localStorage.getItem('userRole');
  }

  // Headers con token de autenticación
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Obtener perfil del cliente logueado
  async obtenerPerfilCliente() {
    try {
      this.actualizarToken();
      
      if (!this.userEmail || this.userRole !== 'cliente') {
        throw new Error('No hay sesión de cliente activa');
      }

      console.log('Obteniendo perfil para:', this.userEmail);

      // Obtener todos los clientes para buscar el actual
      const response = await fetch(`${API_BASE_URL}/clientes`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const clientes = await response.json();
      const clienteActual = clientes.find(c => c.correo === this.userEmail && c.estado === true);

      if (!clienteActual) {
        throw new Error('Cliente no encontrado o inactivo');
      }

      // Transformar datos del cliente
      const perfilTransformado = this.transformarClienteDesdeAPI(clienteActual);
      
      // Actualizar localStorage con datos completos
      localStorage.setItem('userData', JSON.stringify(clienteActual));
      
      console.log('Perfil obtenido:', perfilTransformado);
      return perfilTransformado;

    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  }

  // Actualizar perfil del cliente
  async actualizarPerfil(datosActualizados) {
    try {
      this.actualizarToken();
      
      if (!this.userEmail || this.userRole !== 'cliente') {
        throw new Error('No hay sesión de cliente activa');
      }

      // Primero obtener el ID del cliente
      const perfilActual = await this.obtenerPerfilCliente();
      const clienteId = perfilActual.idCliente;

      console.log('Actualizando cliente ID:', clienteId);
      console.log('Datos a actualizar:', datosActualizados);

      // Transformar datos para la API
      const datosParaAPI = this.transformarClienteParaAPI(datosActualizados);
      
      // No incluir la contraseña si no se está cambiando
      if (!datosActualizados.contrasena || datosActualizados.contrasena === '********') {
        delete datosParaAPI.hashcontrasena;
      }

      const response = await fetch(`${API_BASE_URL}/clientes/${clienteId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(datosParaAPI)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      const clienteActualizado = await response.json();
      
      // Actualizar localStorage
      localStorage.setItem('userData', JSON.stringify(clienteActualizado));
      
      return this.transformarClienteDesdeAPI(clienteActualizado);

    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  }

  // Cambiar contraseña específicamente
  async cambiarContrasena(contrasenaActual, nuevaContrasena) {
    try {
      this.actualizarToken();
      
      if (!this.userEmail || this.userRole !== 'cliente') {
        throw new Error('No hay sesión de cliente activa');
      }

      // Primero validar la contraseña actual
      const validacion = await fetch(`${API_BASE_URL}/auth/direct-login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          correo: this.userEmail,
          password: contrasenaActual,
          userType: 'cliente'
        })
      });

      if (!validacion.ok) {
        throw new Error('La contraseña actual es incorrecta');
      }

      // Obtener ID del cliente
      const perfilActual = await this.obtenerPerfilCliente();
      const clienteId = perfilActual.idCliente;

      // Actualizar contraseña usando el endpoint específico
      const response = await fetch(`${API_BASE_URL}/clientes/${clienteId}/password`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ nuevaContrasena })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar contraseña');
      }

      return await response.json();

    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }

  // Suspender cuenta del cliente
  async suspenderCuenta() {
    try {
      this.actualizarToken();
      
      if (!this.userEmail || this.userRole !== 'cliente') {
        throw new Error('No hay sesión de cliente activa');
      }

      // Obtener ID del cliente
      const perfilActual = await this.obtenerPerfilCliente();
      const clienteId = perfilActual.idCliente;

      // Cambiar estado a false (suspendido)
      const response = await fetch(`${API_BASE_URL}/clientes/${clienteId}/estado`, {
        method: 'PATCH',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al suspender cuenta');
      }

      const resultado = await response.json();
      
      // Limpiar localStorage
      this.cerrarSesion();
      
      return resultado;

    } catch (error) {
      console.error('Error al suspender cuenta:', error);
      throw error;
    }
  }

  // Validar sesión actual
  async validarSesion() {
    try {
      this.actualizarToken();
      
      if (!this.token || !this.userEmail || this.userRole !== 'cliente') {
        return false;
      }

      // Intentar obtener el perfil para validar que la sesión sigue activa
      await this.obtenerPerfilCliente();
      return true;

    } catch (error) {
      console.error('Sesión inválida:', error);
      return false;
    }
  }

  // Cerrar sesión
  cerrarSesion() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userData');
    localStorage.removeItem('userName');
  }

  // Transformar datos desde la API (snake_case a camelCase)
  transformarClienteDesdeAPI(cliente) {
    return {
      idCliente: cliente.idcliente,
      tipoDocumento: cliente.tipodocumento || 'CC',
      numeroDocumento: cliente.numerodocumento || '',
      nombre: cliente.nombre || '',
      apellido: cliente.apellido || '',
      correo: cliente.correo || '',
      contrasena: '********', // Nunca mostrar la contraseña real
      direccion: cliente.direccion || '',
      barrio: cliente.barrio || '',
      ciudad: cliente.ciudad || '',
      fechaNacimiento: cliente.fechanacimiento ? this.formatearFechaDesdeAPI(cliente.fechanacimiento) : '',
      celular: cliente.celular || '',
      estado: cliente.estado ?? true,
      nombreCompleto: `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim()
    };
  }

  // Transformar datos para la API (camelCase a snake_case)
  transformarClienteParaAPI(cliente) {
    const clienteAPI = {
      tipodocumento: cliente.tipoDocumento || 'CC',
      numerodocumento: cliente.numeroDocumento || '',
      nombre: cliente.nombre || '',
      apellido: cliente.apellido || '',
      correo: cliente.correo || '',
      direccion: cliente.direccion || '',
      barrio: cliente.barrio || '',
      ciudad: cliente.ciudad || '',
      celular: cliente.celular || '',
      estado: cliente.estado ?? true
    };

    // Solo incluir contraseña si se proporciona y no es el placeholder
    if (cliente.contrasena && cliente.contrasena !== '********') {
      clienteAPI.hashcontrasena = cliente.contrasena;
    }

    // Formatear fecha para la API
    if (cliente.fechaNacimiento) {
      try {
        const fecha = new Date(cliente.fechaNacimiento);
        clienteAPI.fechanacimiento = fecha.toISOString();
      } catch (error) {
        console.warn('Error al formatear fecha:', error);
        clienteAPI.fechanacimiento = null;
      }
    } else {
      clienteAPI.fechanacimiento = null;
    }

    return clienteAPI;
  }

  // Formatear fecha desde la API (ISO string a YYYY-MM-DD)
  formatearFechaDesdeAPI(fecha) {
    if (!fecha) return '';
    try {
      const date = new Date(fecha);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Error al formatear fecha desde API:', error);
      return '';
    }
  }

  // Verificar si hay cambios pendientes
  hayDatosEnLocalStorage() {
    try {
      const userData = localStorage.getItem('userData');
      return !!userData;
    } catch (error) {
      return false;
    }
  }

  // Obtener datos desde localStorage como fallback
  obtenerDatosLocalStorage() {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const cliente = JSON.parse(userData);
        return this.transformarClienteDesdeAPI(cliente);
      }
      return null;
    } catch (error) {
      console.error('Error al leer localStorage:', error);
      return null;
    }
  }
}

// Crear instancia singleton
const perfilService = new PerfilService();

export default perfilService;