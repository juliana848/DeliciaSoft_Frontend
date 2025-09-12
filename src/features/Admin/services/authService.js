// services/authService.js
const API_BASE_URL = 'https://deliciasoft-backend.onrender.com/api';

class AuthService {
  // Función auxiliar para manejar errores de respuesta
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return { isJson: true, data };
    } else {
      const text = await response.text();
      console.error('Respuesta no-JSON recibida:', text.substring(0, 200));
      return { 
        isJson: false, 
        data: { 
          message: 'Error del servidor: respuesta inválida' 
        } 
      };
    }
  }

  // Nuevo método: Enviar código de validación para login
  async enviarCodigoValidacionLogin(correo) {
    try {
      // Verificar si el usuario existe en usuarios o clientes
      const existeEnUsuarios = await this.verificarUsuarioExiste(correo, 'usuarios');
      const existeEnClientes = await this.verificarUsuarioExiste(correo, 'clientes');

      if (!existeEnUsuarios && !existeEnClientes) {
        return {
          success: false,
          message: 'No existe una cuenta con este correo electrónico'
        };
      }

      // Determinar tipo de usuario
      const userType = existeEnUsuarios ? 'usuario' : 'cliente';

      try {
        const response = await fetch(`${API_BASE_URL}/auth/send-verification-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            correo: correo,
            userType: userType
          }),
        });

        const { isJson, data } = await this.handleResponse(response);

        if (isJson && response.ok) {
          return {
            success: true,
            codigo: data.codigo || Math.floor(100000 + Math.random() * 900000).toString(),
            message: 'Código enviado correctamente'
          };
        } else {
          throw new Error(data.message || 'Error al enviar código');
        }
      } catch (error) {
        console.warn('Error enviando código, generando localmente:', error);
        // Fallback: generar código localmente
        const codigoGenerado = Math.floor(100000 + Math.random() * 900000).toString();
        
        return {
          success: true,
          codigo: codigoGenerado,
          message: 'Código generado (modo desarrollo)'
        };
      }

    } catch (error) {
      console.error('Error en enviarCodigoValidacionLogin:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  // Nuevo método: Login con validación (después del código)
  async loginConValidacion(correo, contrasena) {
    try {
      // Usar el endpoint directo de login
      const response = await fetch(`${API_BASE_URL}/auth/direct-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          correo: correo,
          password: contrasena,
          userType: 'usuario' // Intentar primero como usuario
        }),
      });

      const { isJson, data } = await this.handleResponse(response);

      if (isJson && response.ok && data.success) {
        return {
          success: true,
          user: data.user,
          userType: data.userType
        };
      }

      // Si no funciona como usuario, intentar como cliente
      const responseCliente = await fetch(`${API_BASE_URL}/auth/direct-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          correo: correo,
          password: contrasena,
          userType: 'cliente'
        }),
      });

      const { isJson: isJsonCliente, data: dataCliente } = await this.handleResponse(responseCliente);

      if (isJsonCliente && responseCliente.ok && dataCliente.success) {
        return {
          success: true,
          user: dataCliente.user,
          userType: dataCliente.userType
        };
      }

      // Si ambos fallan, usar método directo
      return await this.login(correo, contrasena);

    } catch (error) {
      console.error('Error en loginConValidacion:', error);
      return await this.login(correo, contrasena);
    }
  }

  // Método auxiliar para verificar si un usuario existe
  async verificarUsuarioExiste(correo, tabla) {
    try {
      const response = await fetch(`${API_BASE_URL}/${tabla}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      if (!response.ok) return false;

      const { isJson, data } = await this.handleResponse(response);
      
      if (!isJson || !Array.isArray(data)) return false;

      return data.some(item => item.correo === correo && item.estado === true);
    } catch (error) {
      console.error(`Error verificando ${tabla}:`, error);
      return false;
    }
  }

  // Login directo usando el endpoint correcto
  async validarUsuario(correo, contrasena) {
    try {
      console.log('Validando usuario:', correo);
      const response = await fetch(`${API_BASE_URL}/auth/direct-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          correo: correo,
          password: contrasena,
          userType: 'usuario'
        }),
      });

      const { isJson, data } = await this.handleResponse(response);

      if (!isJson) {
        return await this.validarDirectoUsuario(correo, contrasena);
      }

      if (response.ok && data.success) {
        return {
          success: true,
          user: data.user,
          userType: 'admin'
        };
      } else {
        throw new Error(data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error al validar usuario:', error);
      return await this.validarDirectoUsuario(correo, contrasena);
    }
  }

  // Login directo de cliente
  async validarCliente(correo, contrasena) {
    try {
      console.log('Validando cliente:', correo);
      const response = await fetch(`${API_BASE_URL}/auth/direct-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          correo: correo,
          password: contrasena,
          userType: 'cliente'
        }),
      });

      const { isJson, data } = await this.handleResponse(response);

      if (!isJson) {
        return await this.validarDirectoCliente(correo, contrasena);
      }

      if (response.ok && data.success) {
        return {
          success: true,
          user: data.user,
          userType: 'cliente'
        };
      } else {
        throw new Error(data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error al validar cliente:', error);
      return await this.validarDirectoCliente(correo, contrasena);
    }
  }

  // Método de fallback para validar usuarios directamente
  async validarDirectoUsuario(correo, contrasena) {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      const { isJson, data } = await this.handleResponse(response);

      if (isJson && Array.isArray(data)) {
        const usuario = data.find(u => u.correo === correo && u.estado === true);
        
        if (usuario && usuario.hashcontrasena === contrasena) {
          return {
            success: true,
            user: usuario,
            userType: 'admin'
          };
        }
      }

      throw new Error('Usuario no encontrado o contraseña incorrecta');
    } catch (error) {
      return {
        success: false,
        message: 'Credenciales incorrectas'
      };
    }
  }

  // Método de fallback para validar clientes directamente
  async validarDirectoCliente(correo, contrasena) {
    try {
      const response = await fetch(`${API_BASE_URL}/clientes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      const { isJson, data } = await this.handleResponse(response);

      if (isJson && Array.isArray(data)) {
        const cliente = data.find(c => c.correo === correo && c.estado === true);
        
        if (cliente && cliente.hashcontrasena === contrasena) {
          return {
            success: true,
            user: cliente,
            userType: 'cliente'
          };
        }
      }

      throw new Error('Cliente no encontrado o contraseña incorrecta');
    } catch (error) {
      return {
        success: false,
        message: 'Credenciales incorrectas'
      };
    }
  }

  // Login original (mantener compatibilidad)
  async login(correo, contrasena) {
    try {
      const usuarioResult = await this.validarUsuario(correo, contrasena);
      if (usuarioResult.success) {
        return usuarioResult;
      }

      const clienteResult = await this.validarCliente(correo, contrasena);
      if (clienteResult.success) {
        return clienteResult;
      }

      return {
        success: false,
        message: 'Credenciales incorrectas'
      };

    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  // Registrar cliente - CORREGIDO para usar el endpoint correcto /clientes
  async registrarCliente(datosCliente) {
    try {
      console.log('Registrando cliente:', datosCliente);
      
      // Preparar los datos con todos los campos requeridos
      const clienteData = {
        tipodocumento: datosCliente.tipoDocumento,
        numerodocumento: datosCliente.documento,
        nombre: datosCliente.nombre,
        apellido: datosCliente.apellido,
        correo: datosCliente.correo,
        celular: datosCliente.contacto,
        hashcontrasena: datosCliente.password,
        // Campos con valores por defecto
        direccion: '',
        barrio: '',
        ciudad: '',
        fechanacimiento: null,
        estado: true
      };

      // CORREGIDO: Usar /clientes en lugar de /cliente
      const response = await fetch(`${API_BASE_URL}/clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(clienteData),
      });

      const { isJson, data } = await this.handleResponse(response);

      if (!isJson) {
        throw new Error('Error del servidor: respuesta inválida');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Error en el servidor');
      }

      console.log('Cliente registrado exitosamente:', data);
      return {
        success: true,
        user: data,
        message: 'Registro exitoso'
      };

    } catch (error) {
      console.error('Error al registrar cliente:', error);
      return {
        success: false,
        message: error.message || 'Error de conexión con el servidor'
      };
    }
  }

  // Verificar si el correo ya existe - CORREGIDO
  async verificarCorreoExistente(correo) {
    try {
      const verificarEnEndpoint = async (endpoint) => {
        try {
          const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
          });

          if (!response.ok) {
            console.warn(`No se pudo verificar en ${endpoint}:`, response.status);
            return false;
          }

          const { isJson, data } = await this.handleResponse(response);
          
          if (!isJson) {
            console.warn(`Respuesta no-JSON de ${endpoint}`);
            return false;
          }

          console.log(`Verificando correo ${correo} en ${endpoint}:`, data);
          return Array.isArray(data) ? data.some(item => item.correo === correo) : false;
        } catch (error) {
          console.warn(`Error verificando ${endpoint}:`, error.message);
          return false;
        }
      };

      const [usuarioExiste, clienteExiste] = await Promise.all([
        verificarEnEndpoint('usuarios'),
        verificarEnEndpoint('clientes') // CORREGIDO: usar 'clientes'
      ]);

      console.log('Usuario existe:', usuarioExiste, 'Cliente existe:', clienteExiste);
      return usuarioExiste || clienteExiste;
    } catch (error) {
      console.error('Error al verificar correo:', error);
      return false;
    }
  }

  async obtenerDatosClienteLogueado() {
  try {
    const profile = this.getUserProfile();
    if (!profile || profile.role !== 'cliente') {
      throw new Error('No hay sesión de cliente activa');
    }

    // Si ya tenemos los datos completos en userData
    if (profile.data && profile.data.idcliente) {
      return profile.data;
    }

    // Si no, buscar en el endpoint de clientes
    const response = await fetch(`${API_BASE_URL}/clientes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener datos del cliente');
    }

    const clientes = await response.json();
    const cliente = clientes.find(c => c.correo === profile.email);
    
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // Actualizar localStorage con datos completos
    localStorage.setItem('userData', JSON.stringify(cliente));
    
    return cliente;
  } catch (error) {
    console.error('Error obteniendo datos del cliente:', error);
    throw error;
  }
}

  // Obtener perfil del usuario logueado
  getUserProfile() {
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    const userData = localStorage.getItem('userData');
    
    if (userEmail && userRole) {
      return {
        email: userEmail,
        role: userRole,
        data: userData ? JSON.parse(userData) : null
      };
    }
    
    return null;
  }

  // Cerrar sesión
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userData');
    localStorage.removeItem('productosTemporales');
  }

  // Verificar si está autenticado
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    return !!(token && userRole);
  }

  // Verificar si es administrador
  isAdmin() {
    const userRole = localStorage.getItem('userRole');
    return userRole === 'admin';
  }

  // Verificar si es cliente
  isCliente() {
    const userRole = localStorage.getItem('userRole');
    return userRole === 'cliente';
  }
}

// Crear instancia singleton
const authService = new AuthService();

export default authService;