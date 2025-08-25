// Servicio API para gestión de usuarios
const API_BASE_URL = 'https://deliciasoft-backend.onrender.com/api';

class UsuarioApiService {
  // Obtener todos los usuarios
  async obtenerUsuarios() {
    try {
      console.log('Obteniendo usuarios desde API...');
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
      console.log('Usuarios obtenidos de la API:', data);
      
      const transformedData = this.transformarUsuariosDesdeAPI(data);
      console.log('Usuarios transformados:', transformedData);
      
      return transformedData;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw new Error('Error al obtener la lista de usuarios: ' + error.message);
    }
  }

  // Obtener usuario por ID
  async obtenerUsuarioPorId(id) {
    try {
      console.log('Obteniendo usuario por ID:', id);
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
      console.log('Usuario obtenido:', data);
      
      return this.transformarUsuarioDesdeAPI(data);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  }

  // Crear nuevo usuario
  async crearUsuario(usuarioData) {
    try {
      console.log('Datos a enviar para crear usuario:', usuarioData);
      const usuarioAPI = this.transformarUsuarioParaAPI(usuarioData);
      console.log('Datos transformados para API:', usuarioAPI);
      
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuarioAPI),
      });
      
      console.log('Respuesta del servidor:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error en el servidor' }));
        console.error('Error del servidor:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Usuario creado exitosamente:', data);
      
      return this.transformarUsuarioDesdeAPI(data);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  // Actualizar usuario
  async actualizarUsuario(id, usuarioData) {
    try {
      console.log('Actualizando usuario:', id, usuarioData);
      const usuarioAPI = this.transformarUsuarioParaAPI(usuarioData);
      console.log('Datos transformados para actualizar:', usuarioAPI);
      
      const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuarioAPI),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error en el servidor' }));
        console.error('Error al actualizar:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Usuario actualizado exitosamente:', data);
      
      return this.transformarUsuarioDesdeAPI(data);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  // Eliminar usuario
  async eliminarUsuario(id) {
    try {
      console.log('Eliminando usuario:', id);
      const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error en el servidor' }));
        console.error('Error al eliminar:', errorData);
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
      console.log('Cambiando estado del usuario:', id, 'a', nuevoEstado);
      const usuarioActual = await this.obtenerUsuarioPorId(id);
      
      const datosActualizados = {
        ...this.transformarUsuarioParaAPI(usuarioActual),
        estado: nuevoEstado
      };

      const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosActualizados)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error en el servidor' }));
        throw new Error(errorData.message || 'Error al actualizar usuario');
      }

      const data = await response.json();
      return this.transformarUsuarioDesdeAPI(data);
    } catch (error) {
      console.error('Error completo:', error);
      throw new Error(`No se pudo actualizar el estado: ${error.message}`);
    }
  }

  // Obtener todos los roles desde la API de roles
  async obtenerRoles() {
    try {
      console.log('Obteniendo roles...');
      const response = await fetch(`${API_BASE_URL}/rol`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Roles obtenidos:', data);
      
      return data.map(rol => ({
        id: rol.idrol,
        nombre: rol.rol
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
      // Si tienes una API específica para tipos de documento, úsala
      // Por ahora devuelvo los valores estándar
      return [
        { id: 'CC', nombre: 'Cédula de Ciudadanía' },
        { id: 'CE', nombre: 'Cédula de Extranjería' },
        { id: 'PA', nombre: 'Pasaporte' },
        { id: 'NIT', nombre: 'NIT' }
      ];
    } catch (error) {
      console.error('Error al obtener tipos de documento:', error);
      return [
        { id: 'CC', nombre: 'Cédula de Ciudadanía' },
        { id: 'CE', nombre: 'Cédula de Extranjería' },
        { id: 'PA', nombre: 'Pasaporte' },
        { id: 'NIT', nombre: 'NIT' }
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

  // Transformar datos desde la API (base de datos a frontend)
  transformarUsuarioDesdeAPI(usuario) {
    console.log('Transformando usuario desde API:', usuario);
    
    const transformed = {
      id: usuario.idusuario,
      nombres: usuario.nombre || '',
      apellidos: usuario.apellido || '',
      correo: usuario.correo || '',
      contraseña: '********', // Nunca mostrar la contraseña real
      rol_id: usuario.idrol,
      rol_nombre: usuario.rol?.rol || 'Sin rol',
      tipo_documento_id: usuario.tipodocumento || '',
      tipo_documento_nombre: this.obtenerNombreTipoDocumento(usuario.tipodocumento),
      documento: usuario.documento ? usuario.documento.toString() : '',
      activo: usuario.estado !== false
    };
    
    console.log('Usuario transformado:', transformed);
    return transformed;
  }

  // Transformar múltiples usuarios desde la API
  transformarUsuariosDesdeAPI(usuarios) {
    if (!Array.isArray(usuarios)) {
      console.warn('Los datos de usuarios no son un array:', usuarios);
      return [];
    }
    return usuarios.map(usuario => this.transformarUsuarioDesdeAPI(usuario));
  }

  // Transformar datos para la API (frontend a base de datos)
  transformarUsuarioParaAPI(usuario) {
    console.log('Transformando usuario para API:', usuario);
    
    const usuarioAPI = {
      tipodocumento: usuario.tipo_documento_id || usuario.tipodocumento,
      documento: parseInt(usuario.documento),
      nombre: usuario.nombres || usuario.nombre,
      apellido: usuario.apellidos || usuario.apellido,
      correo: usuario.correo,
      idrol: parseInt(usuario.rol_id || usuario.idrol),
      estado: usuario.activo !== undefined ? usuario.activo : true
    };

    // Solo incluir contraseña si se proporciona y no es el valor por defecto
    if (usuario.contraseña && usuario.contraseña.trim() && usuario.contraseña !== '********') {
      usuarioAPI.hashcontrasena = usuario.contraseña;
    }

    console.log('Datos transformados para API:', usuarioAPI);
    return usuarioAPI;
  }

  // Obtener nombre del tipo de documento
  obtenerNombreTipoDocumento(tipo) {
    const tipos = {
      'CC': 'Cédula de Ciudadanía',
      'CE': 'Cédula de Extranjería', 
      'PA': 'Pasaporte',
      'NIT': 'NIT'
    };
    return tipos[tipo] || 'Tipo no definido';
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