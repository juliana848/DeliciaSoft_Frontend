// services/emailService.js
const API_BASE_URL = 'https://deliciasoft-backend-i6g9.onrender.com/api';

class EmailService {
  // Generar código de 6 dígitos
  generarCodigoSuspension() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Enviar token de suspensión al correo
  async enviarTokenSuspension(correo) {
    try {
      // Generar código
      const codigo = this.generarCodigoSuspension();
      
      console.log('Enviando token de suspensión a:', correo);
      
      try {
        // Usar el endpoint de auth existente
        const response = await fetch(`${API_BASE_URL}/auth/send-reset-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: correo, // Cambiado de 'correo' a 'email'
            userType: 'cliente'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Guardar temporalmente para validación posterior
          sessionStorage.setItem(`suspension_token_${correo}`, JSON.stringify({
            codigo: data.token || codigo, // Usar el token del backend o el generado
            timestamp: Date.now(),
            expiresIn: 5 * 60 * 1000 // 5 minutos
          }));

          return {
            success: true,
            codigo: data.token || codigo,
            message: 'Token de suspensión enviado a tu correo electrónico'
          };
        } else {
          // Si el endpoint no responde correctamente, usar modo desarrollo
          throw new Error('Endpoint no disponible');
        }
      } catch (backendError) {
        console.warn('Usando auth service como fallback o modo desarrollo:', backendError);
        
        // Modo desarrollo - mostrar el código en consola y guardar temporalmente
        console.log(`%c🔐 TOKEN DE SUSPENSIÓN (Modo Desarrollo)`, 'background: #ff6b35; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
        console.log(`%c📧 Correo: ${correo}`, 'color: #333; font-weight: bold;');
        console.log(`%c🔢 Código: ${codigo}`, 'color: #ff6b35; font-weight: bold; font-size: 16px;');
        console.log(`%c⏰ Válido por: 5 minutos`, 'color: #666;');
        
        // Guardar temporalmente el código para validación (solo en desarrollo)
        sessionStorage.setItem(`suspension_token_${correo}`, JSON.stringify({
          codigo: codigo,
          timestamp: Date.now(),
          expiresIn: 5 * 60 * 1000 // 5 minutos
        }));

        return {
          success: true,
          codigo: codigo,
          message: 'Token de suspensión generado (modo desarrollo). Usa el código: ' + codigo,
          isDevelopment: true
        };
      }
    } catch (error) {
      console.error('Error al enviar token de suspensión:', error);
      return {
        success: false,
        message: 'Error al enviar el token de suspensión: ' + error.message
      };
    }
  }

  // Validar token de suspensión
  async validarTokenSuspension(correo, codigoIngresado) {
    try {
      // Primero intentar validar con el backend usando el endpoint de auth
      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-reset-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: correo,
            token: codigoIngresado,
            userType: 'cliente'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return {
            success: data.valid || data.success || false,
            message: data.message || (data.valid || data.success ? 'Token válido' : 'Token inválido')
          };
        }
      } catch (backendError) {
        console.warn('Backend no disponible para validación, usando modo desarrollo');
      }

      // Modo desarrollo - validar desde sessionStorage
      const tokenData = sessionStorage.getItem(`suspension_token_${correo}`);
      if (!tokenData) {
        return {
          success: false,
          message: 'No hay token activo para este correo'
        };
      }

      const { codigo, timestamp, expiresIn } = JSON.parse(tokenData);
      const ahora = Date.now();

      // Verificar expiración
      if (ahora - timestamp > expiresIn) {
        sessionStorage.removeItem(`suspension_token_${correo}`);
        return {
          success: false,
          message: 'El token ha expirado. Solicita uno nuevo.'
        };
      }

      // Verificar código
      if (codigoIngresado === codigo) {
        // Limpiar token después de uso exitoso
        sessionStorage.removeItem(`suspension_token_${correo}`);
        return {
          success: true,
          message: 'Token válido'
        };
      } else {
        return {
          success: false,
          message: 'El código ingresado es incorrecto'
        };
      }

    } catch (error) {
      console.error('Error al validar token:', error);
      return {
        success: false,
        message: 'Error al validar el token: ' + error.message
      };
    }
  }

  // Limpiar tokens expirados (utilidad)
  limpiarTokensExpirados() {
    try {
      const keys = Object.keys(sessionStorage);
      const ahora = Date.now();

      keys.forEach(key => {
        if (key.startsWith('suspension_token_')) {
          try {
            const tokenData = JSON.parse(sessionStorage.getItem(key));
            if (ahora - tokenData.timestamp > tokenData.expiresIn) {
              sessionStorage.removeItem(key);
            }
          } catch (error) {
            // Si hay error parseando, eliminar la key
            sessionStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Error al limpiar tokens expirados:', error);
    }
  }

  // Verificar si hay token activo para un correo
  tieneTokenActivo(correo) {
    try {
      const tokenData = sessionStorage.getItem(`suspension_token_${correo}`);
      if (!tokenData) return false;

      const { timestamp, expiresIn } = JSON.parse(tokenData);
      const ahora = Date.now();

      return ahora - timestamp < expiresIn;
    } catch (error) {
      return false;
    }
  }

  // Obtener tiempo restante del token
  obtenerTiempoRestanteToken(correo) {
    try {
      const tokenData = sessionStorage.getItem(`suspension_token_${correo}`);
      if (!tokenData) return 0;

      const { timestamp, expiresIn } = JSON.parse(tokenData);
      const ahora = Date.now();
      const tiempoRestante = expiresIn - (ahora - timestamp);

      return Math.max(0, Math.ceil(tiempoRestante / 1000)); // en segundos
    } catch (error) {
      return 0;
    }
  }
}

// Crear instancia singleton
const emailService = new EmailService();

export default emailService;