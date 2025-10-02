// services/authService.js
const API_BASE_URL = 'https://deliciasoft-backend-i6g9.onrender.com/api';

class AuthService {
  // Función auxiliar para manejar errores de respuesta
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return { isJson: true, data };
    } else {
      const text = await response.text();
      console.error('Respuesta no-JSON recibida:', text.substring(0, 500));
      return { 
        isJson: false, 
        data: { 
          message: 'Error del servidor: respuesta inválida',
          responseText: text.substring(0, 200)
        } 
      };
    }
  }

  // 1. ENVIAR CÓDIGO DE VALIDACIÓN PARA LOGIN (CON DEBUGGING MEJORADO)
   async enviarCodigoValidacionLogin(correo, userType = null) {
    try {
      console.log('📧 Enviando código de validación a:', correo);
      console.log('📧 Tipo de usuario especificado:', userType);
      console.log('🌐 URL del API:', API_BASE_URL);
      
      const requestBody = { 
        correo, 
        userType: userType || 'cliente' 
      };
      
      console.log('📦 Datos a enviar:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/auth/send-verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Status de respuesta:', response.status);
      console.log('📡 Headers de respuesta:', [...response.headers.entries()]);

      const { isJson, data } = await this.handleResponse(response);

      if (isJson && response.ok && data.success) {
        console.log('✅ Código enviado exitosamente:', data);
        return {
          success: true,
          codigo: data.codigo, // IMPORTANTE: Código real del servidor
          message: data.message || 'Código enviado correctamente',
          userType: data.userType,
          emailSent: data.emailSent || false,
          provider: data.provider || 'Unknown'
        };
      } else {
        console.error('❌ Error enviando código:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          isJson: isJson
        });
        
        return {
          success: false,
          message: data.message || `Error ${response.status}: ${response.statusText}`,
          status: response.status,
          responseData: data
        };
      }

    } catch (error) {
      console.error('❌ Error en enviarCodigoValidacionLogin:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // MEJORADO: Fallback más consistente para desarrollo
      const codigoGenerado = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('🔓 CÓDIGO FALLBACK GENERADO:', codigoGenerado);
      
      return {
        success: true,
        codigo: codigoGenerado,
        message: 'Código generado (modo fallback - error de conexión)',
        fallback: true,
        emailSent: false,
        provider: 'Fallback Local',
        originalError: error.message
      };
    }
  }

  // MÉTODO CON DETECCIÓN AUTOMÁTICA MEJORADO
  async enviarCodigoValidacionLoginConDeteccion(correo) {
    try {
      console.log('🔍 Detectando tipo de usuario para:', correo);
      
      // Intentar detectar si es admin/usuario
      let userType = 'cliente'; // valor por defecto
      
      try {
        console.log('🔍 Consultando endpoint de usuarios...');
        const usuariosResponse = await fetch(`${API_BASE_URL}/usuarios`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          // Agregar timeout para evitar que se cuelgue
          signal: AbortSignal.timeout(5000)
        });
        
        console.log('📡 Status consulta usuarios:', usuariosResponse.status);
        
        if (usuariosResponse.ok) {
          const usuarios = await usuariosResponse.json();
          const esUsuario = usuarios.some(u => u.correo === correo);
          if (esUsuario) {
            userType = 'admin';
            console.log('✅ Usuario detectado como admin');
          } else {
            console.log('ℹ️ Usuario no encontrado en tabla usuarios');
          }
        } else {
          console.warn('⚠️ No se pudo consultar usuarios, status:', usuariosResponse.status);
        }
      } catch (detectionError) {
        console.warn('⚠️ Error en detección automática:', detectionError.message);
      }
      
      console.log('🎯 Tipo de usuario final detectado:', userType);
      
      // Ahora enviar el código con el tipo correcto
      return await this.enviarCodigoValidacionLogin(correo, userType);
      
    } catch (error) {
      console.error('❌ Error crítico en detección automática:', error);
      // Fallback simple
      return await this.enviarCodigoValidacionLogin(correo, 'cliente');
    }
  }

  // 2. LOGIN CON VALIDACIÓN (CON DEBUGGING MEJORADO)
  async loginConValidacion(correo, password, codigo) {
    try {
      console.log('🔐 Haciendo login con validación para:', correo);
      console.log('🔑 Código proporcionado:', codigo);
      
      const requestBody = {
        correo,
        password,
        codigo
      };
      
      console.log('📦 Datos de login:', { correo, codigo: codigo, passwordLength: password.length });
      
      const response = await fetch(`${API_BASE_URL}/auth/verify-code-and-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        // Timeout para login
        signal: AbortSignal.timeout(10000)
      });

      console.log('📡 Status login:', response.status);

      const { isJson, data } = await this.handleResponse(response);

      if (isJson && response.ok && data.success) {
        console.log('✅ Login exitoso:', {
          userType: data.userType,
          hasToken: !!data.token,
          hasUser: !!data.user
        });
        return {
          success: true,
          user: data.user,
          userType: data.userType,
          token: data.token
        };
      } else {
        console.error('❌ Error en login:', {
          status: response.status,
          data: data
        });
        return {
          success: false,
          message: data.message || 'Error al iniciar sesión',
          status: response.status
        };
      }

    } catch (error) {
      console.error('❌ Error en loginConValidacion:', error);
      return {
        success: false,
        message: 'Error de conexión. Inténtalo nuevamente.',
        originalError: error.message
      };
    }
  }

  // 3. SOLICITAR CÓDIGO PARA RECUPERAR CONTRASEÑA
  async solicitarRecuperacionPassword(correo) {
    try {
      console.log('🔄 Solicitando recuperación de contraseña para:', correo);
      
      const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ correo }),
        signal: AbortSignal.timeout(10000)
      });

      const { isJson, data } = await this.handleResponse(response);

      if (isJson && response.ok) {
        return {
          success: true,
          codigo: data.codigo, // Para desarrollo
          message: data.message || 'Código enviado correctamente'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al enviar código'
        };
      }

    } catch (error) {
      console.error('❌ Error en solicitar recuperación:', error);
      // Fallback para desarrollo
      const codigoGenerado = Math.floor(100000 + Math.random() * 900000).toString();
      return {
        success: true,
        codigo: codigoGenerado,
        message: 'Código generado (modo desarrollo)',
        fallback: true
      };
    }
  }

  // 4. CAMBIAR CONTRASEÑA CON CÓDIGO
  async cambiarPasswordConCodigo(correo, codigo, nuevaPassword) {
    try {
      console.log('🔄 Cambiando contraseña con código para:', correo);
      
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          correo,
          codigo,
          nuevaPassword
        }),
        signal: AbortSignal.timeout(10000)
      });

      const { isJson, data } = await this.handleResponse(response);

      if (isJson && response.ok) {
        return {
          success: true,
          message: data.message || 'Contraseña actualizada correctamente'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al cambiar contraseña'
        };
      }

    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      return {
        success: false,
        message: 'Error de conexión. Inténtalo nuevamente.'
      };
    }
  }

  // 5. LOGIN DIRECTO (OPCIONAL - PARA COMPATIBILIDAD)
  async loginDirecto(correo, password) {
    try {
      console.log('🔐 Login directo para:', correo);
      
      const response = await fetch(`${API_BASE_URL}/auth/direct-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          correo,
          password
        }),
        signal: AbortSignal.timeout(10000)
      });

      const { isJson, data } = await this.handleResponse(response);

      if (isJson && response.ok && data.success) {
        return {
          success: true,
          user: data.user,
          userType: data.userType,
          token: data.token
        };
      } else {
        return {
          success: false,
          message: data.message || 'Credenciales incorrectas'
        };
      }

    } catch (error) {
      console.error('❌ Error en login directo:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  // MÉTODO DE TESTING PARA DIAGNOSTICAR PROBLEMAS
  async testConnection() {
    try {
      console.log('🧪 Probando conexión con el servidor...');
      
      const response = await fetch(`${API_BASE_URL}/auth/test-config`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });

      console.log('📡 Status test:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Configuración del servidor:', data);
        return { success: true, config: data };
      } else {
        console.error('❌ Server test failed:', response.status);
        return { success: false, status: response.status };
      }

    } catch (error) {
      console.error('❌ Error en test de conexión:', error);
      return { success: false, error: error.message };
    }
  }

  // MÉTODOS EXISTENTES (MANTENER PARA COMPATIBILIDAD)
  async registrarCliente(datosCliente) {
    try {
      console.log('📝 Registrando cliente:', datosCliente);
      
      const clienteData = {
        tipodocumento: datosCliente.tipoDocumento,
        numerodocumento: datosCliente.documento,
        nombre: datosCliente.nombre,
        apellido: datosCliente.apellido,
        correo: datosCliente.correo,
        celular: datosCliente.contacto,
        hashcontrasena: datosCliente.password,
        direccion: '',
        barrio: '',
        ciudad: '',
        fechanacimiento: null,
        estado: true
      };

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

      console.log('✅ Cliente registrado exitosamente:', data);
      return {
        success: true,
        user: data,
        message: 'Registro exitoso'
      };

    } catch (error) {
      console.error('❌ Error al registrar cliente:', error);
      return {
        success: false,
        message: error.message || 'Error de conexión con el servidor'
      };
    }
  }

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
            signal: AbortSignal.timeout(5000)
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

          return Array.isArray(data) ? data.some(item => item.correo === correo) : false;
        } catch (error) {
          console.warn(`Error verificando ${endpoint}:`, error.message);
          return false;
        }
      };

      const [usuarioExiste, clienteExiste] = await Promise.all([
        verificarEnEndpoint('usuarios'),
        verificarEnEndpoint('clientes')
      ]);

      return usuarioExiste || clienteExiste;
    } catch (error) {
      console.error('❌ Error al verificar correo:', error);
      return false;
    }
  }

  async obtenerDatosClienteLogueado() {
    try {
      const profile = this.getUserProfile();
      if (!profile || profile.role !== 'cliente') {
        throw new Error('No hay sesión de cliente activa');
      }

      if (profile.data && profile.data.idcliente) {
        return profile.data;
      }

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
      console.error('❌ Error obteniendo datos del cliente:', error);
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