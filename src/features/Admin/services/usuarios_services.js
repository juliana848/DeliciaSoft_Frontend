// Servicio API para gestión de usuarios
const API_BASE_URL = 'https://deliciasoft-backend.onrender.com/api';

class UsuarioApiService {
  // Obtener todos los usuarios
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
      return this.transformarUsuariosDesdeAPI(data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw new Error('Error al obtener la lista de usuarios');
    }
  }

  // Obtener usuario por ID
  async obtenerUsuarioPorId(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuario no encontrado');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.transformarUsuarioDesdeAPI(data);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  }

  // Crear nuevo usuario
  async crearUsuario(usuarioData) {
    try {
      const usuarioAPI = this.transformarUsuarioParaAPI(usuarioData);
      
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuarioAPI),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.transformarUsuarioDesdeAPI(data);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  // Actualizar usuario
  async actualizarUsuario(id, usuarioData) {
    try {
      const usuarioAPI = this.transformarUsuarioParaAPI(usuarioData);
      
      const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuarioAPI),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.transformarUsuarioDesdeAPI(data);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  // Eliminar usuario
  async eliminarUsuario(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return { success: true, message: 'Usuario eliminado exitosamente' };
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  // Cambiar estado del usuario
  async cambiarEstadoUsuario(id, nuevoEstado) {
    try {
      const usuarioActual = await this.obtenerUsuarioPorId(id);
      
      const datosActualizados = {
        ...this.transformarUsuarioParaAPI(usuarioActual),
        activo: nuevoEstado
      };

      // Eliminar campos que no se deben enviar en la actualización
      delete datosActualizados.id;
      delete datosActualizados.hashcontrasena;

      const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(datosActualizados)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error completo:', error);
      throw new Error(`No se pudo actualizar el estado: ${error.message}`);
    }
  }

  // Obtener todos los roles
  async obtenerRoles() {
    try {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.map(rol => ({
        id: rol.id,
        nombre: rol.nombre
      }));
    } catch (error) {
      console.error('Error al obtener roles:', error);
      // Fallback a roles mock si la API no funciona
      return [
        { id: 1, nombre: 'Administrador' },
        { id: 2, nombre: 'Repostero' },
        { id: 3, nombre: 'Decorador' },
        { id: 4, nombre: 'Vendedor' }
      ];
    }
  }

  // Obtener todos los tipos de documento
  async obtenerTiposDocumento() {
    try {
      const response = await fetch(`${API_BASE_URL}/tipos-documento`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.map(tipo => ({
        id: tipo.id,
        nombre: tipo.nombre
      }));
    } catch (error) {
      console.error('Error al obtener tipos de documento:', error);
      // Fallback a tipos mock si la API no funciona
      return [
        { id: 1, nombre: 'Cédula de Ciudadanía' },
        { id: 2, nombre: 'Cédula de Extranjería' },
        { id: 3, nombre: 'Pasaporte' },
        { id: 4, nombre: 'NIT' }
      ];
    }
  }

  // Verificar si usuario tiene ventas asociadas
  async usuarioTieneVentas(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${id}/ventas`, {
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
      console.error('Error al verificar ventas del usuario:', error);
      return false;
    }
  }

  // Transformar datos desde la API (snake_case a camelCase)
  transformarUsuarioDesdeAPI(usuario) {
    return {
      id: usuario.id,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      contraseña: usuario.hashcontrasena || '********',
      rol_id: usuario.rol_id,
      rol_nombre: usuario.rol?.nombre || 'Sin rol',
      tipo_documento_id: usuario.tipo_documento_id,
      tipo_documento_nombre: usuario.tipo_documento?.nombre || 'Sin tipo',
      documento: usuario.documento,
      activo: usuario.activo
    };
  }

  // Transformar múltiples usuarios desde la API
  transformarUsuariosDesdeAPI(usuarios) {
    if (!Array.isArray(usuarios)) return [];
    return usuarios.map(usuario => this.transformarUsuarioDesdeAPI(usuario));
  }

  // Transformar datos para la API (camelCase a snake_case)
  transformarUsuarioParaAPI(usuario) {
    const usuarioAPI = {
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      rol_id: parseInt(usuario.rol_id),
      tipo_documento_id: parseInt(usuario.tipo_documento_id),
      documento: usuario.documento,
      activo: usuario.activo !== undefined ? usuario.activo : true
    };

    // Solo incluir contraseña si se proporciona y no es el valor por defecto
    if (usuario.contraseña && usuario.contraseña.trim() && usuario.contraseña !== '********') {
      usuarioAPI.hashcontrasena = usuario.contraseña;
    }

    return usuarioAPI;
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
const usuarioApiService = new UsuarioApiService();

export default usuarioApiService;