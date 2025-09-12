// hooks/useValidaciones.js
import { useState, useCallback } from 'react';

export const useValidaciones = () => {
  const [errores, setErrores] = useState({});

  // Validar texto (no puede empezar con espacios)
  const validarTexto = useCallback((valor, nombreCampo, esObligatorio = false) => {
    if (esObligatorio && (!valor || valor.trim() === '')) {
      return `El ${nombreCampo} es obligatorio`;
    }
    
    if (valor && valor.length > 0 && valor[0] === ' ') {
      return `El ${nombreCampo} no puede empezar con espacios`;
    }
    
    if (valor && valor.trim().length < 2 && esObligatorio) {
      return `El ${nombreCampo} debe tener al menos 2 caracteres`;
    }
    
    return null;
  }, []);

  // Validar número de documento
  const validarNumeroDocumento = useCallback((valor) => {
    if (!valor || valor.trim() === '') {
      return 'El número de documento es obligatorio';
    }
    
    // Remover espacios y caracteres no numéricos
    const numeroLimpio = valor.replace(/\D/g, '');
    
    if (numeroLimpio.length < 6) {
      return 'El número de documento debe tener al menos 6 dígitos';
    }
    
    if (numeroLimpio.length > 10) {
      return 'El número de documento no puede tener más de 10 dígitos';
    }
    
    return null;
  }, []);

  // Validar teléfono/celular
  const validarTelefono = useCallback((valor) => {
    if (!valor || valor.trim() === '') {
      return null; // Teléfono es opcional
    }
    
    // Remover espacios y caracteres no numéricos
    const numeroLimpio = valor.replace(/\D/g, '');
    
    if (numeroLimpio.length < 7) {
      return 'El número de teléfono debe tener al menos 7 dígitos';
    }
    
    if (numeroLimpio.length > 10) {
      return 'El número de teléfono no puede tener más de 10 dígitos';
    }
    
    return null;
  }, []);

  // Validar email
  const validarEmail = useCallback((valor) => {
    if (!valor || valor.trim() === '') {
      return 'El correo electrónico es obligatorio';
    }
    
    if (valor[0] === ' ') {
      return 'El correo no puede empezar con espacios';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(valor)) {
      return 'Por favor ingresa un correo electrónico válido';
    }
    
    return null;
  }, []);

  // Validar fecha de nacimiento (mayor de 13 años)
  const validarFechaNacimiento = useCallback((valor) => {
    if (!valor) {
      return null; // Fecha es opcional
    }
    
    const fechaNacimiento = new Date(valor);
    const fechaActual = new Date();
    const edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();
    const mesActual = fechaActual.getMonth();
    const mesNacimiento = fechaNacimiento.getMonth();
    
    // Ajustar edad si no ha pasado el cumpleaños este año
    let edadReal = edad;
    if (mesActual < mesNacimiento || 
        (mesActual === mesNacimiento && fechaActual.getDate() < fechaNacimiento.getDate())) {
      edadReal--;
    }
    
    if (edadReal < 13) {
      return 'Debes tener al menos 13 años para registrarte';
    }
    
    if (edadReal > 120) {
      return 'Por favor ingresa una fecha de nacimiento válida';
    }
    
    return null;
  }, []);

  // Validar contraseña
  const validarContrasena = useCallback((valor) => {
    if (!valor || valor.trim() === '') {
      return 'La contraseña es obligatoria';
    }
    
    if (valor[0] === ' ') {
      return 'La contraseña no puede empezar con espacios';
    }
    
    if (valor.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    
    return null;
  }, []);

  // Validar confirmación de contraseña
  const validarConfirmacionContrasena = useCallback((valor, contrasenaOriginal) => {
    if (!valor || valor.trim() === '') {
      return 'Por favor confirma tu contraseña';
    }
    
    if (valor !== contrasenaOriginal) {
      return 'Las contraseñas no coinciden';
    }
    
    return null;
  }, []);

  // Validar perfil completo
  const validarPerfilCompleto = useCallback((userData) => {
    const erroresValidacion = {};

    // Validar nombre
    const errorNombre = validarTexto(userData.nombre, 'nombre', true);
    if (errorNombre) erroresValidacion.nombre = errorNombre;

    // Validar apellido
    const errorApellido = validarTexto(userData.apellido, 'apellido', true);
    if (errorApellido) erroresValidacion.apellido = errorApellido;

    // Validar email
    const errorEmail = validarEmail(userData.correo);
    if (errorEmail) erroresValidacion.correo = errorEmail;

    // Validar número de documento
    const errorDocumento = validarNumeroDocumento(userData.numeroDocumento);
    if (errorDocumento) erroresValidacion.numeroDocumento = errorDocumento;

    // Validar teléfono si está presente
    if (userData.celular) {
      const errorTelefono = validarTelefono(userData.celular);
      if (errorTelefono) erroresValidacion.celular = errorTelefono;
    }

    // Validar fecha de nacimiento si está presente
    if (userData.fechaNacimiento) {
      const errorFecha = validarFechaNacimiento(userData.fechaNacimiento);
      if (errorFecha) erroresValidacion.fechaNacimiento = errorFecha;
    }

    setErrores(erroresValidacion);
    return Object.keys(erroresValidacion).length === 0;
  }, [validarTexto, validarEmail, validarNumeroDocumento, validarTelefono, validarFechaNacimiento]);

  // Validar cambio de contraseña
  const validarCambioContrasena = useCallback((passwordData) => {
    const erroresValidacion = {};

    // Validar contraseña actual
    const errorActual = validarTexto(passwordData.currentPassword, 'contraseña actual', true);
    if (errorActual) erroresValidacion.currentPassword = errorActual;

    // Validar nueva contraseña
    const errorNueva = validarContrasena(passwordData.newPassword);
    if (errorNueva) erroresValidacion.newPassword = errorNueva;

    // Validar confirmación
    const errorConfirmacion = validarConfirmacionContrasena(
      passwordData.confirmPassword, 
      passwordData.newPassword
    );
    if (errorConfirmacion) erroresValidacion.confirmPassword = errorConfirmacion;

    setErrores(erroresValidacion);
    return Object.keys(erroresValidacion).length === 0;
  }, [validarTexto, validarContrasena, validarConfirmacionContrasena]);

  // Limpiar errores
  const limpiarErrores = useCallback(() => {
    setErrores({});
  }, []);

  // Limpiar error específico
  const limpiarError = useCallback((campo) => {
    setErrores(prev => {
      const nuevosErrores = { ...prev };
      delete nuevosErrores[campo];
      return nuevosErrores;
    });
  }, []);

  // Validar campo individual en tiempo real
  const validarCampo = useCallback((nombreCampo, valor, userData = {}) => {
    let error = null;

    switch (nombreCampo) {
      case 'nombre':
        error = validarTexto(valor, 'nombre', true);
        break;
      case 'apellido':
        error = validarTexto(valor, 'apellido', true);
        break;
      case 'correo':
        error = validarEmail(valor);
        break;
      case 'numeroDocumento':
        error = validarNumeroDocumento(valor);
        break;
      case 'celular':
        error = validarTelefono(valor);
        break;
      case 'fechaNacimiento':
        error = validarFechaNacimiento(valor);
        break;
      case 'currentPassword':
        error = validarTexto(valor, 'contraseña actual', true);
        break;
      case 'newPassword':
        error = validarContrasena(valor);
        break;
      case 'confirmPassword':
        error = validarConfirmacionContrasena(valor, userData.newPassword);
        break;
      default:
        break;
    }

    setErrores(prev => ({
      ...prev,
      [nombreCampo]: error
    }));

    return !error;
  }, [validarTexto, validarEmail, validarNumeroDocumento, validarTelefono, 
      validarFechaNacimiento, validarContrasena, validarConfirmacionContrasena]);

  // Formatear número (solo números)
  const formatearNumero = useCallback((valor) => {
    return valor.replace(/\D/g, '');
  }, []);

  // Formatear texto (sin espacios al inicio)
  const formatearTexto = useCallback((valor) => {
    if (!valor) return valor;
    // Remover espacios al inicio pero mantener espacios internos
    return valor.replace(/^\s+/, '');
  }, []);

  return {
    errores,
    validarPerfilCompleto,
    validarCambioContrasena,
    validarCampo,
    limpiarErrores,
    limpiarError,
    formatearNumero,
    formatearTexto,
    // Validaciones individuales para uso directo
    validarTexto,
    validarEmail,
    validarNumeroDocumento,
    validarTelefono,
    validarFechaNacimiento,
    validarContrasena,
    validarConfirmacionContrasena
  };
};

export default useValidaciones;