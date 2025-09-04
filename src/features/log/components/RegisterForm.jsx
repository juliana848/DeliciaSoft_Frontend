import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../Admin/services/authService';

const RegisterForm = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    tipoDocumento: '',
    documento: '',
    contacto: '',
    password: '',
    confirmPassword: '',
  });

  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  // Límites de caracteres actualizados
  const fieldLimits = {
    nombre: 10,
    apellido: 10,
    correo: 100,
    documento: 10,
    contacto: 15,
    password: 50
  };

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 4000);
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'nombre':
      case 'apellido':
        if (!value.trim()) {
          error = `${name === 'nombre' ? 'Nombre' : 'Apellido'} es requerido`;
        } else if (value.trim().length < 2) {
          error = `${name === 'nombre' ? 'Nombre' : 'Apellido'} debe tener al menos 2 caracteres`;
        } else if (value.length > fieldLimits[name]) {
          error = `${name === 'nombre' ? 'Nombre' : 'Apellido'} no puede exceder ${fieldLimits[name]} caracteres`;
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(value)) {
          error = 'Solo se permiten letras, sin espacios';
        }
        break;
      
      case 'correo':
        if (!value.trim()) {
          error = 'Correo electrónico es requerido';
        } else if (value.length > fieldLimits.correo) {
          error = `Correo no puede exceder ${fieldLimits.correo} caracteres`;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Formato de correo electrónico inválido';
        }
        break;
      
      case 'tipoDocumento':
        if (!value) {
          error = 'Tipo de documento es requerido';
        }
        break;
      
      case 'documento':
        if (!value.trim()) {
          error = 'Número de documento es requerido';
        } else if (value.length < 6) {
          error = 'Número de documento debe tener al menos 6 dígitos';
        } else if (value.length > fieldLimits.documento) {
          error = `Número de documento no puede exceder ${fieldLimits.documento} dígitos`;
        } else if (!/^\d+$/.test(value)) {
          error = 'Solo se permiten números';
        }
        break;
      
      case 'contacto':
        if (!value.trim()) {
          error = 'Número de contacto es requerido';
        } else if (value.length < 10) {
          error = 'Número de contacto debe tener al menos 10 dígitos';
        } else if (value.length > fieldLimits.contacto) {
          error = `Número de contacto no puede exceder ${fieldLimits.contacto} dígitos`;
        } else if (!/^\d+$/.test(value)) {
          error = 'Solo se permiten números';
        }
        break;
      
      case 'password':
        if (!value) {
          error = 'Contraseña es requerida';
        } else if (value.length < 8) {
          error = 'Contraseña debe tener al menos 8 caracteres';
        } else if (value.length > fieldLimits.password) {
          error = `Contraseña no puede exceder ${fieldLimits.password} caracteres`;
        } else if (!/(?=.*[A-Z])/.test(value)) {
          error = 'Contraseña debe tener al menos una mayúscula';
        } else if (!/(?=.*[!@#$%^&*])/.test(value)) {
          error = 'Contraseña debe tener al menos un carácter especial (!@#$%^&*)';
        }
        break;
      
      case 'confirmPassword':
        if (!value) {
          error = 'Confirmación de contraseña es requerida';
        } else if (value !== formData.password) {
          error = 'Las contraseñas no coinciden';
        }
        break;
    }
    
    return error;
  };

  // Función para prevenir espacios en campos específicos
  const preventSpaces = (fieldName, value) => {
    if (['nombre', 'apellido', 'correo', 'documento', 'contacto'].includes(fieldName)) {
      return value.replace(/\s/g, '');
    }
    return value;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // APLICAR LÍMITES PRIMERO - MUY IMPORTANTE
    if (name === 'documento') {
      value = value.replace(/\D/g, '').substring(0, 10); // Solo números, máximo 10
    } else if (name === 'contacto') {
      value = value.replace(/\D/g, '').substring(0, 15); // Solo números, máximo 15
    } else if (name === 'nombre' || name === 'apellido') {
      value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').substring(0, 10); // Solo letras, máximo 10
    } else if (name === 'correo') {
      value = value.replace(/\s/g, '').substring(0, 100); // Sin espacios, máximo 100
    } else if (name === 'password') {
      value = value.substring(0, 50); // Solo límite de longitud para password
    }
    
    // Prevenir espacios en otros campos (excepto password)
    if (['nombre', 'apellido', 'correo', 'documento', 'contacto'].includes(name)) {
      value = value.replace(/\s/g, '');
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validar campo en tiempo real
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Validar confirmación de contraseña cuando cambie la contraseña
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }));
    }
  };

  const validateCurrentStep = () => {
    let fieldsToValidate = [];
    let isValid = true;
    const errors = {};

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['tipoDocumento', 'documento'];
        break;
      case 2:
        fieldsToValidate = ['nombre', 'apellido'];
        break;
      case 3:
        fieldsToValidate = ['correo', 'contacto'];
        break;
      case 4:
        fieldsToValidate = ['password', 'confirmPassword'];
        break;
    }

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    setFieldErrors(prev => ({ ...prev, ...errors }));
    return isValid;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      showCustomAlert('error', 'Por favor, completa correctamente todos los campos del paso actual.');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
      showCustomAlert('error', 'Por favor, completa correctamente todos los campos.');
      return;
    }

    // Validación final de todos los campos
    const allFields = Object.keys(formData);
    let hasErrors = false;
    const finalErrors = {};

    allFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        finalErrors[field] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setFieldErrors(finalErrors);
      showCustomAlert('error', 'Por favor, corrige todos los errores antes de continuar.');
      return;
    }

    setIsLoading(true);

    try {
      // Verificar si el correo ya existe
      const correoExiste = await authService.verificarCorreoExistente(formData.correo);
      if (correoExiste) {
        showCustomAlert('error', 'Ya existe una cuenta con este correo electrónico.');
        setIsLoading(false);
        return;
      }

      // Registrar cliente usando el servicio con el endpoint correcto
      const result = await authService.registrarCliente(formData);

      if (result.success) {
        showCustomAlert('success', '¡Registro exitoso!');

        setTimeout(() => {
          navigate('/iniciar-sesion');
        }, 1500);
      } else {
        showCustomAlert('error', result.message || 'Error al registrar usuario');
      }

    } catch (error) {
      console.error('Error en registro:', error);
      showCustomAlert('error', 'Error de conexión. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener el ícono de validación
  const getValidationIcon = (fieldName) => {
    const hasError = fieldErrors[fieldName];
    const hasValue = formData[fieldName];
    
    if (!hasValue) return null;
    
    if (hasError) {
      return <span className="validation-icon error-icon">❌</span>;
    } else {
      return <span className="validation-icon success-icon">✅</span>;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="form-group">
              <div className="input-container">
                <select
                  name="tipoDocumento"
                  className={`select-documento ${fieldErrors.tipoDocumento ? 'error' : ''}`}
                  value={formData.tipoDocumento}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Tipo de documento</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PA">Pasaporte</option>
                  <option value="NIT">NIT</option>
                </select>
                {getValidationIcon('tipoDocumento')}
              </div>
              {fieldErrors.tipoDocumento && <span className="error-message">{fieldErrors.tipoDocumento}</span>}
            </div>
            <div className="form-group">
              <div className="input-container">
                <input
                  type="text"
                  name="documento"
                  placeholder="Número de documento"
                  value={formData.documento}
                  onChange={handleChange}
                  maxLength={fieldLimits.documento}
                  className={fieldErrors.documento ? 'error' : ''}
                  disabled={isLoading}
                />
                {getValidationIcon('documento')}
              </div>
              <small className="char-counter">{formData.documento.length}/{fieldLimits.documento}</small>
              {fieldErrors.documento && <span className="error-message">{fieldErrors.documento}</span>}
            </div>
          </>
        );
      
      case 2:
        return (
          <>
            <div className="form-group">
              <div className="input-container">
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  maxLength={fieldLimits.nombre}
                  className={fieldErrors.nombre ? 'error' : ''}
                  disabled={isLoading}
                />
                {getValidationIcon('nombre')}
              </div>
              <small className="char-counter">{formData.nombre.length}/{fieldLimits.nombre}</small>
              {fieldErrors.nombre && <span className="error-message">{fieldErrors.nombre}</span>}
            </div>
            <div className="form-group">
              <div className="input-container">
                <input
                  type="text"
                  name="apellido"
                  placeholder="Apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  maxLength={fieldLimits.apellido}
                  className={fieldErrors.apellido ? 'error' : ''}
                  disabled={isLoading}
                />
                {getValidationIcon('apellido')}
              </div>
              <small className="char-counter">{formData.apellido.length}/{fieldLimits.apellido}</small>
              {fieldErrors.apellido && <span className="error-message">{fieldErrors.apellido}</span>}
            </div>
          </>
        );
      
      case 3:
        return (
          <>
            <div className="form-group">
              <div className="input-container">
                <input
                  type="email"
                  name="correo"
                  placeholder="Correo electrónico"
                  value={formData.correo}
                  onChange={handleChange}
                  maxLength={fieldLimits.correo}
                  className={fieldErrors.correo ? 'error' : ''}
                  disabled={isLoading}
                />
                {getValidationIcon('correo')}
              </div>
              <small className="char-counter">{formData.correo.length}/{fieldLimits.correo}</small>
              {fieldErrors.correo && <span className="error-message">{fieldErrors.correo}</span>}
            </div>
            <div className="form-group">
              <div className="input-container">
                <input
                  type="text"
                  name="contacto"
                  placeholder="Número de contacto"
                  value={formData.contacto}
                  onChange={handleChange}
                  maxLength={fieldLimits.contacto}
                  className={fieldErrors.contacto ? 'error' : ''}
                  disabled={isLoading}
                />
                {getValidationIcon('contacto')}
              </div>
              <small className="char-counter">{formData.contacto.length}/{fieldLimits.contacto}</small>
              {fieldErrors.contacto && <span className="error-message">{fieldErrors.contacto}</span>}
            </div>
          </>
        );
      
      case 4:
        return (
          <>
            <div className="form-group">
              <div className="input-container password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  className={fieldErrors.password ? 'error' : ''}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? '🔒' : '👁'}
                </button>
                {getValidationIcon('password')}
              </div>
              <small className="char-counter">{formData.password.length}/{fieldLimits.password}</small>
              {fieldErrors.password && <span className="error-message">{fieldErrors.password}</span>}
            </div>
            <div className="form-group">
              <div className="input-container password-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirmar contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={fieldErrors.confirmPassword ? 'error' : ''}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? '🔒' : '👁'}
                </button>
                {getValidationIcon('confirmPassword')}
              </div>
              {fieldErrors.confirmPassword && <span className="error-message">{fieldErrors.confirmPassword}</span>}
            </div>
            
            {/* Información sobre requisitos de contraseña */}
            <div className="password-requirements">
              <strong>Requisitos de contraseña:</strong>
              <ul>
                <li style={{ color: formData.password.length >= 8 ? '#10b981' : '#666' }}>
                  {formData.password.length >= 8 ? '✅' : '❌'} Al menos 8 caracteres
                </li>
                <li style={{ color: /(?=.*[A-Z])/.test(formData.password) ? '#10b981' : '#666' }}>
                  {/(?=.*[A-Z])/.test(formData.password) ? '✅' : '❌'} Una letra mayúscula
                </li>
                <li style={{ color: /(?=.*[!@#$%^&*])/.test(formData.password) ? '#10b981' : '#666' }}>
                  {/(?=.*[!@#$%^&*])/.test(formData.password) ? '✅' : '❌'} Un carácter especial (!@#$%^&*)
                </li>
              </ul>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="form-container sign-up">
      {/* Alerta personalizada */}
      {showAlert.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 2000,
            padding: '1rem 1.5rem',
            borderRadius: '15px',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.9rem',
            minWidth: '300px',
            background:
              showAlert.type === 'success'
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #ec4899, #be185d)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            animation: 'slideInRight 0.5s ease-out',
          }}
        >
          {showAlert.message}
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit}>
        {/* Indicador de progreso con clase específica */}
        <div className="registro-step-indicator">
          <div className="registro-progress-bar">
            <div 
              className="registro-progress-fill" 
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
          <span className="registro-step-text">Paso {currentStep} de 4</span>
        </div>

        {/* Título del paso actual */}
        <div className="registro-step-title">
          {currentStep === 1 && "Tipo y Número de Documento"}
          {currentStep === 2 && "Información Personal"}
          {currentStep === 3 && "Correo y Contacto"}
          {currentStep === 4 && "Contraseña"}
        </div>

        {/* Campos del paso actual */}
        {renderStep()}

        {/* Botones de navegación */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button 
              type="button" 
              className="nav-button prev-button"
              onClick={handlePrevious}
              disabled={isLoading}
            >
              ← Anterior
            </button>
          )}
          
          {currentStep < 4 ? (
            <button 
              type="button" 
              className="nav-button next-button"
              onClick={handleNext}
              disabled={isLoading}
            >
              Siguiente →
            </button>
          ) : (
            <button 
              type="submit" 
              className="hiddenn1"
              disabled={isLoading}
              style={{
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Registrando...' : 'Registrar'}
            </button>
          )}
        </div>

        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '10px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #ffffff',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        )}
      </form>

      <style jsx>{`
        .form-group {
          width: 100%;
          margin-bottom: 15px;
          position: relative;
        }

        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-container {
          position: relative;
        }

        .eye-button {
          position: absolute;
          right: 0px;
          top: 50%;
          transform: translateY(-76%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          padding: 0;
          color: #555;
          z-index: 10;
          width: 40px; 
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }}

        .eye-button:hover {
          background: rgba(255, 255, 255, 1);
          border-color: #666;
        }

        .password-container input {
          padding-right: 75px !important;
        }

        .validation-icon {
          right: 70px; /* Modificado de 8px a 12px */
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          z-index: 5;
        }

        .error-message {
          color: #dc3545;
          font-size: 11px;
          margin-top: 4px;
          display: block;
        }

        .char-counter {
          position: absolute;
          right: 5px;
          top: 35px;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.6);
          background-color: rgba(255, 255, 255, 0.3);
          padding: 2px 6px;
          border-radius: 3px;
        }

        .containerlog input.error,
        .select-documento.error {
          border: 2px solid #dc3545 !important;
          background-color: rgb(255, 255, 255) !important;
        }

        /* Estilos específicos para el indicador de pasos del registro */
        .registro-step-indicator {
          width: 100%;
          margin-bottom: 20px;
        }

        .registro-progress-bar {
          width: 100%;
          height: 8px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 10px;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .registro-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff58a6, #fc0278, #ff007b);
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 4px rgba(255, 88, 166, 0.3);
        }

        .registro-step-text {
          font-size: 15px;
          color: rgb(255, 255, 255) !important;
          font-weight: 600;
          text-align: center;
          display: block;
        }

        .registro-step-title {
          color: #fff;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
          text-align: center;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          letter-spacing: 0.5px;
        }

        .form-navigation {
          display: flex;
          gap: 10px;
          justify-content: space-between;
          width: 100%;
          margin-top: 15px;
        }

        .nav-button {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          transition: all 0.3s ease;
          min-width: 100px;
        }

        .nav-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .prev-button {
          background-color: rgba(255, 255, 255, 0.1);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .prev-button:hover:not(:disabled) {
          background-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .next-button {
          background-color: #ff58a6;
          color: #fff;
          margin-left: auto;
        }

        .next-button:hover:not(:disabled) {
          background-color: #fc0278;
          transform: translateY(-1px);
        }

        .password-requirements {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.8);
          margin-top: 10px;
          background-color: rgb(255, 255, 255);
          padding: 12px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .password-requirements ul {
          margin: 8px 0;
          padding-left: 15px;
        }

        .password-requirements li {
          margin: 4px 0;
          transition: color 0.3s ease;
          list-style: none;
          padding-left: 0;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RegisterForm;