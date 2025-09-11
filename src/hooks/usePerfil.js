// hooks/usePerfil.js
import { useState, useEffect, useCallback } from 'react';
import perfilService from '../features/Admin/services/perfilService';
import emailService from '../features/Admin/services/emailService';
import { useNavigate } from 'react-router-dom';
import { useValidaciones } from './useValidaciones';

export const usePerfil = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userData, setUserData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [error, setError] = useState(null);
  
  // Estados para token de suspensión
  const [suspendToken, setSuspendToken] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [tokenEnviado, setTokenEnviado] = useState(false);
  const [enviandoToken, setEnviandoToken] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  
  const navigate = useNavigate();

  // Hook de validaciones
  const {
    errores,
    validarPerfilCompleto,
    validarCambioContrasena,
    validarCampo,
    limpiarErrores,
    limpiarError,
    formatearNumero,
    formatearTexto,
    validarTexto
  } = useValidaciones();

  // Función para mostrar alertas
  const showAlert = useCallback((type, message) => {
    console.log(`${type.toUpperCase()}: ${message}`);
  }, []);

  // Timer para el tiempo restante del token
  useEffect(() => {
    let interval;
    if (tokenEnviado && userData?.correo) {
      interval = setInterval(() => {
        const tiempoActual = emailService.obtenerTiempoRestanteToken(userData.correo);
        setTiempoRestante(tiempoActual);
        
        if (tiempoActual <= 0) {
          setTokenEnviado(false);
          clearInterval(interval);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tokenEnviado, userData?.correo]);

  // Formatear tiempo restante
  const formatearTiempoRestante = useCallback(() => {
    const minutos = Math.floor(tiempoRestante / 60);
    const segundos = tiempoRestante % 60;
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  }, [tiempoRestante]);

  // Cargar perfil inicial
  const cargarPerfil = useCallback(async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setLoading(true);
      }
      setError(null);
      limpiarErrores();
      
      // Validar sesión
      const sesionValida = await perfilService.validarSesion();
      if (!sesionValida) {
        showAlert('warning', 'Sesión expirada. Redirigiendo al login...');
        setTimeout(() => navigate('/iniciar-sesion'), 2000);
        return;
      }

      // Obtener perfil
      const perfil = await perfilService.obtenerPerfilCliente();
      setUserData(perfil);
      setOriginalData({ ...perfil });
      
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      setError(error.message);
      
      // Intentar datos de localStorage como fallback
      const datosLocal = perfilService.obtenerDatosLocalStorage();
      if (datosLocal) {
        setUserData(datosLocal);
        setOriginalData({ ...datosLocal });
        showAlert('warning', 'Usando datos guardados. Algunos datos pueden no estar actualizados.');
      } else {
        showAlert('error', 'Error al cargar perfil. Redirigiendo al login...');
        setTimeout(() => navigate('/iniciar-sesion'), 3000);
      }
    } finally {
      if (showLoadingIndicator) {
        setLoading(false);
      }
    }
  }, [navigate, showAlert, limpiarErrores]);

  // Manejar cambio de campos con validación en tiempo real
  const handleInputChange = useCallback((campo, valor) => {
    let valorFormateado = valor;

    // Formatear según el tipo de campo
    switch (campo) {
      case 'nombre':
      case 'apellido':
      case 'barrio':
      case 'ciudad':
        valorFormateado = formatearTexto(valor);
        break;
      case 'numeroDocumento':
      case 'celular':
        valorFormateado = formatearNumero(valor);
        // Limitar longitud
        if (campo === 'numeroDocumento' && valorFormateado.length > 10) {
          valorFormateado = valorFormateado.substring(0, 10);
        }
        if (campo === 'celular' && valorFormateado.length > 10) {
          valorFormateado = valorFormateado.substring(0, 10);
        }
        break;
      case 'correo':
        valorFormateado = formatearTexto(valor.toLowerCase());
        break;
      default:
        break;
    }

    // Actualizar datos
    setUserData(prev => ({
      ...prev,
      [campo]: valorFormateado
    }));

    // Validar campo individual
    validarCampo(campo, valorFormateado, userData);
  }, [formatearTexto, formatearNumero, validarCampo, userData]);

  // Manejar selección de dirección desde Google Places
  const handlePlaceSelect = useCallback((placeData) => {
    // Extraer solo la parte antes de la primera coma
    const direccionCorta = placeData.direccion ? 
      placeData.direccion.split(',')[0].trim() : '';

    setUserData(prev => ({
      ...prev,
      direccion: direccionCorta,
      barrio: placeData.barrio || '',
      ciudad: placeData.ciudad || ''
    }));

    // Limpiar errores de dirección si se selecciona correctamente
    ['direccion', 'barrio', 'ciudad'].forEach(campo => {
      limpiarError(campo);
    });
  }, [limpiarError]);

  // Actualizar perfil con validaciones completas
  const actualizarPerfil = useCallback(async (datosActualizados = userData) => {
    try {
      setUpdating(true);
      setError(null);

      // Validar datos completos
      const esValido = validarPerfilCompleto(datosActualizados);
      if (!esValido) {
        showAlert('warning', 'Por favor corrige los errores en el formulario');
        return { success: false, error: 'Datos inválidos' };
      }

      const perfilActualizado = await perfilService.actualizarPerfil(datosActualizados);
      setUserData(perfilActualizado);
      setOriginalData({ ...perfilActualizado });
      
      limpiarErrores();
      showAlert('success', '¡Perfil actualizado exitosamente!');
      return { success: true };
      
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setError(error.message);
      showAlert('error', error.message);
      return { success: false, error: error.message };
    } finally {
      setUpdating(false);
    }
  }, [userData, validarPerfilCompleto, showAlert, limpiarErrores]);

  // Cambiar contraseña con validaciones
  const cambiarContrasena = useCallback(async (passwordData) => {
    try {
      setUpdating(true);
      setError(null);

      // Validar datos de contraseña
      const esValido = validarCambioContrasena(passwordData);
      if (!esValido) {
        showAlert('warning', 'Por favor corrige los errores en las contraseñas');
        return { success: false, error: 'Datos de contraseña inválidos' };
      }

      await perfilService.cambiarContrasena(
        passwordData.currentPassword, 
        passwordData.newPassword
      );

      limpiarErrores();
      showAlert('success', '¡Contraseña actualizada correctamente!');
      return { success: true };
      
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setError(error.message);
      showAlert('error', error.message);
      return { success: false, error: error.message };
    } finally {
      setUpdating(false);
    }
  }, [validarCambioContrasena, showAlert, limpiarErrores]);

  // Enviar token de suspensión
  const enviarTokenSuspension = useCallback(async () => {
    try {
      setEnviandoToken(true);
      setTokenError('');
      
      if (!userData?.correo) {
        throw new Error('No se encontró el correo del usuario');
      }

      const resultado = await emailService.enviarTokenSuspension(userData.correo);
      
      if (resultado.success) {
        setTokenEnviado(true);
        const tiempo = emailService.obtenerTiempoRestanteToken(userData.correo);
        setTiempoRestante(tiempo);
        
        if (resultado.isDevelopment) {
          showAlert('info', 'Código de suspensión generado. Revisa la consola del navegador.');
        } else {
          showAlert('success', 'Código de suspensión enviado a tu correo electrónico.');
        }
      } else {
        throw new Error(resultado.message || 'Error al enviar el token');
      }
      
    } catch (error) {
      console.error('Error al enviar token:', error);
      setTokenError(error.message);
      showAlert('error', error.message);
    } finally {
      setEnviandoToken(false);
    }
  }, [userData?.correo, showAlert]);

  // Manejar cambio de token de suspensión
  const handleTokenChange = useCallback((valor) => {
    // Solo permitir números y limitar a 6 dígitos
    const tokenLimpio = valor.replace(/\D/g, '').substring(0, 6);
    setSuspendToken(tokenLimpio);
    
    if (tokenError) {
      setTokenError('');
    }
  }, [tokenError]);

  // Suspender cuenta con validación de token
  const suspenderCuenta = useCallback(async () => {
    try {
      setUpdating(true);
      setError(null);

      if (!userData?.correo) {
        throw new Error('No se encontró el correo del usuario');
      }

      if (!suspendToken || suspendToken.length !== 6) {
        setTokenError('El código debe tener 6 dígitos');
        return { success: false, error: 'Código inválido' };
      }

      // Validar token con emailService
      const validacion = await emailService.validarTokenSuspension(userData.correo, suspendToken);
      
      if (!validacion.success) {
        setTokenError(validacion.message);
        return { success: false, error: validacion.message };
      }

      // Si el token es válido, suspender la cuenta
      await perfilService.suspenderCuenta();
      
      setSuspendToken('');
      setTokenError('');
      setTokenEnviado(false);
      
      showAlert('warning', 'Tu cuenta ha sido suspendida. Contacta al administrador para reactivarla.');
      
      setTimeout(() => navigate('/iniciar-sesion'), 3000);
      return { success: true };
      
    } catch (error) {
      console.error('Error al suspender cuenta:', error);
      setError(error.message);
      setTokenError(error.message);
      showAlert('error', error.message);
      return { success: false, error: error.message };
    } finally {
      setUpdating(false);
    }
  }, [suspendToken, userData?.correo, showAlert, navigate]);

  // Cancelar proceso de suspensión
  const cancelarSuspension = useCallback(() => {
    setSuspendToken('');
    setTokenError('');
    setTokenEnviado(false);
    setTiempoRestante(0);
  }, []);

  // Cerrar sesión
  const cerrarSesion = useCallback(() => {
    const userName = userData?.nombre || 'Usuario';
    perfilService.cerrarSesion();
    showAlert('info', `¡Hasta pronto ${userName}!`);
    
    setTimeout(() => {
      navigate('/iniciar-sesion');
      window.location.reload();
    }, 2000);
  }, [userData, navigate, showAlert]);

  // Recargar perfil
  const recargarPerfil = useCallback(() => {
    cargarPerfil(false);
  }, [cargarPerfil]);

  // Cancelar edición
  const cancelarEdicion = useCallback(() => {
    if (originalData) {
      setUserData({ ...originalData });
      limpiarErrores();
    }
  }, [originalData, limpiarErrores]);

  // Verificar si hay cambios sin guardar
  const hayCambiosSinGuardar = useCallback(() => {
    if (!userData || !originalData) return false;
    return JSON.stringify(userData) !== JSON.stringify(originalData);
  }, [userData, originalData]);

  // Cargar perfil al montar el hook
  useEffect(() => {
    cargarPerfil();
  }, [cargarPerfil]);

  return {
    // Estados
    loading,
    updating,
    userData,
    originalData,
    error,
    errores,
    
    // Estados del token
    suspendToken,
    tokenError,
    tokenEnviado,
    enviandoToken,
    tiempoRestante,
    
    // Funciones principales
    setUserData,
    handleInputChange,
    handlePlaceSelect,
    actualizarPerfil,
    cambiarContrasena,
    suspenderCuenta,
    cerrarSesion,
    recargarPerfil,
    cancelarEdicion,
    hayCambiosSinGuardar,
    
    // Funciones de token
    setSuspendToken,
    handleTokenChange,
    setTokenError,
    enviarTokenSuspension,
    cancelarSuspension,
    formatearTiempoRestante,
    
    // Funciones de validación
    validarCampo,
    limpiarErrores,
    limpiarError,
    
    // Helpers
    showAlert
  };
};

export default usePerfil;