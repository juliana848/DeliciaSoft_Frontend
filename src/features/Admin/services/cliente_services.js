// cliente_services.js actualizado para crear ventas
const API_BASE_URL = 'https://deliciasoft-backend-i6g9.onrender.com/api';

class ClienteApiService {
  // Obtener todos los clientes para el dropdown
async obtenerClientesParaVenta() {
  try {
    const response = await fetch(`${API_BASE_URL}/clientes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Agregar cliente genérico al inicio de la lista
    const clientesConGenerico = [
      {
        idcliente: null,
        nombre: 'Cliente',
        apellido: 'Genérico',
        numeroDocumento: '', // Asegurar campo documento
        nombreCompleto: 'Cliente Genérico'
      },
      ...data.map(cliente => ({
        ...cliente,
        numeroDocumento: cliente.numerodocumento || '', // Mapear documento desde API
        nombreCompleto: `${cliente.nombre} ${cliente.apellido}`.trim()
      }))
    ];
    
    return clientesConGenerico;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    // Retornar solo cliente genérico en caso de error
    return [{
      idcliente: null,
      nombre: 'Cliente',
      apellido: 'Genérico',
      numeroDocumento: '',
      nombreCompleto: 'Cliente Genérico'
    }];
  }
}

  // Obtener todos los clientes
  async obtenerClientes() {
    try {
      const response = await fetch(`${API_BASE_URL}/clientes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.transformarClientesDesdeAPI(data);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw new Error('Error al obtener la lista de clientes');
    }
  }

  // Obtener cliente por ID
  async obtenerClientePorId(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Cliente no encontrado');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.transformarClienteDesdeAPI(data);
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      throw error;
    }
  }

  // Crear nuevo cliente
  async crearCliente(clienteData) {
    try {
      // Validar duplicados antes de crear
      await this.validarDuplicados(clienteData, null);

      const clienteAPI = this.transformarClienteParaAPI(clienteData);
      
      const response = await fetch(`${API_BASE_URL}/clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clienteAPI),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.transformarClienteDesdeAPI(data);
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw error;
    }
  }

  // Actualizar cliente
  async actualizarCliente(id, clienteData) {
    try {
      // Validar duplicados antes de actualizar
      await this.validarDuplicados(clienteData, id);

      const clienteAPI = this.transformarClienteParaAPI(clienteData);
      
      const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clienteAPI),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.transformarClienteDesdeAPI(data);
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      throw error;
    }
  }

  // Eliminar cliente
  async eliminarCliente(id) {
    try {
      // Verificar primero si tiene ventas asociadas
      const tieneVentas = await this.clienteTieneVentas(id);
      if (tieneVentas) {
        throw new Error('No se puede eliminar el cliente porque tiene ventas asociadas');
      }

      const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return { success: true, message: 'Cliente eliminado exitosamente' };
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      throw error;
    }
  }

  // Cambiar estado del cliente (activar/desactivar)
  async toggleEstadoCliente(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/clientes/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar estado');
      }

      const data = await response.json();
      console.log('Respuesta completa de la API:', data);
      
      // El backend devuelve { message, cliente }, necesitamos el cliente
      const clienteActualizado = data.cliente || data;
      
      // Después del toggle, obtener el cliente actualizado directamente
      const clienteCompleto = await this.obtenerClientePorId(id);
      console.log('Cliente obtenido después del toggle:', clienteCompleto);
      
      return clienteCompleto;
    } catch (error) {
      console.error('Error al cambiar estado del cliente:', error);
      throw error;
    }
  }

  // Verificar si cliente tiene ventas
  async clienteTieneVentas(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/clientes/${id}/ventas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.tieneVentas || false;
    } catch (error) {
      console.error('Error al verificar ventas del cliente:', error);
      return false;
    }
  }

  // Validar duplicados con usuarios
  async validarDuplicados(clienteData, clienteIdExcluido = null) {
    try {
      // Verificar duplicados con otros clientes
      const clientes = await this.obtenerClientes();
      const clienteDuplicado = clientes.find(c => 
        (c.numeroDocumento === clienteData.numeroDocumento || c.correo === clienteData.correo) &&
        c.idCliente !== clienteIdExcluido
      );

      if (clienteDuplicado) {
        if (clienteDuplicado.numeroDocumento === clienteData.numeroDocumento) {
          throw new Error('Ya existe un cliente con este número de documento');
        }
        if (clienteDuplicado.correo === clienteData.correo) {
          throw new Error('Ya existe un cliente con este correo electrónico');
        }
      }

      // Verificar duplicados con usuarios
      const usuarios = await this.obtenerUsuarios();
      const usuarioDuplicado = usuarios.find(u => 
        u.documento === clienteData.numeroDocumento || u.correo === clienteData.correo
      );

      if (usuarioDuplicado) {
        if (usuarioDuplicado.documento === clienteData.numeroDocumento) {
          throw new Error('Ya existe un usuario con este número de documento');
        }
        if (usuarioDuplicado.correo === clienteData.correo) {
          throw new Error('Ya existe un usuario con este correo electrónico');
        }
      }

    } catch (error) {
      if (error.message.includes('Ya existe')) {
        throw error;
      }
      console.warn('No se pudo validar duplicados con usuarios:', error);
      // Continuar sin validación de usuarios si la API no está disponible
    }
  }

  // Obtener usuarios para validación de duplicados
  async obtenerUsuarios() {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.map(usuario => ({
        id: usuario.idusuario,
        documento: usuario.documento?.toString(),
        correo: usuario.correo
      }));
    } catch (error) {
      console.error('Error al obtener usuarios para validación:', error);
      throw error;
    }
  }

async actualizarContrasenaCliente(id, nuevaContrasena) {
  try {
    const response = await fetch(`${API_BASE_URL}/clientes/${id}/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nuevaContrasena }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    throw error;
  }
}

async obtenerPerfilCliente() {
  try {
    const profile = authService.getUserProfile();
    if (!profile || !profile.data || !profile.data.idcliente) {
      throw new Error('No hay sesión activa de cliente');
    }
    
    return await this.obtenerClientePorId(profile.data.idcliente);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    throw error;
  }
}

  // Transformar datos desde la API (snake_case a camelCase)
  transformarClienteDesdeAPI(cliente) {
    return {
      idCliente: cliente.idcliente,
      tipoDocumento: cliente.tipodocumento,
      numeroDocumento: cliente.numerodocumento,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      correo: cliente.correo,
      contrasena: cliente.hashcontrasena || '********',
      direccion: cliente.direccion,
      barrio: cliente.barrio,
      ciudad: cliente.ciudad,
      fechaNacimiento: cliente.fechanacimiento ? this.formatearFechaDesdeAPI(cliente.fechanacimiento) : '',
      celular: cliente.celular,
      estado: cliente.estado,
      nombreCompleto: `${cliente.nombre} ${cliente.apellido}`.trim()
    };
  }

  // Transformar múltiples clientes desde la API
  transformarClientesDesdeAPI(clientes) {
    if (!Array.isArray(clientes)) return [];
    return clientes.map(cliente => this.transformarClienteDesdeAPI(cliente));
  }

  transformarClienteParaAPI(cliente) {
    const clienteAPI = {
      tipodocumento: cliente.tipoDocumento,
      numerodocumento: cliente.numeroDocumento,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      correo: cliente.correo,
      direccion: cliente.direccion,
      barrio: cliente.barrio,
      ciudad: cliente.ciudad,
      celular: cliente.celular,
      estado: cliente.estado
    };

    // Solo incluir contraseña si se proporciona y no es el valor por defecto
    if (cliente.contrasena && cliente.contrasena.trim() && cliente.contrasena !== '********') {
      clienteAPI.hashcontrasena = cliente.contrasena;
    }

    // Formatear correctamente la fecha para Prisma
    if (cliente.fechaNacimiento) {
      clienteAPI.fechanacimiento = new Date(cliente.fechaNacimiento).toISOString();
    } else {
      clienteAPI.fechanacimiento = null;
    }

    return clienteAPI;
  }

  // Formatear fecha desde la API (YYYY-MM-DD)
  formatearFechaDesdeAPI(fecha) {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toISOString().split('T')[0];
  }

  // Formatear fecha para la API
  formatearFechaParaAPI(fecha) {
    if (!fecha) return null;
    return fecha;
  }

  // Manejar errores de red
  async manejarRespuesta(response) {
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }
    return response.json();
  }
}

// Crear instancia singleton del servicio
const clienteApiService = new ClienteApiService();

export default clienteApiService;