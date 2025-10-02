import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Contactenos = () => {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const [isRecaptchaLoaded, setIsRecaptchaLoaded] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    correo: '',
    telefono: '',
    mensaje: ''
  });

  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [errors, setErrors] = useState({});

  // URL base de la API
  const API_BASE_URL = 'https://deliciasoft-backend-i6g9.onrender.com';

  // Cargar datos del usuario si está logueado - CORREGIDO
  useEffect(() => {
    // Verificar primero si hay token de autenticación
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    console.log('Token de auth:', authToken); // Debug
    console.log('Datos de usuario raw:', userData); // Debug
    
    if (authToken && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        console.log('Datos del usuario cargados:', parsedUser); // Debug
        
        // Autocompletar TODOS los campos disponibles
        setFormData(prev => ({
          ...prev,
          nombre: parsedUser.nombre || '',
          apellidos: parsedUser.apellidos || '', // Ahora se debe cargar correctamente
          correo: parsedUser.correo || '',
          telefono: parsedUser.telefono || parsedUser.celular || '', // Buscar en ambos campos
          mensaje: '' // El mensaje siempre vacío
        }));
        
        // Mostrar mensaje de bienvenida si viene desde login
        const fromLogin = sessionStorage.getItem('fromLogin');
        if (fromLogin === 'true') {
          sessionStorage.removeItem('fromLogin');
          setTimeout(() => {
            setMessageType('success');
            setAlertMessage(`¡Bienvenido ${parsedUser.nombre}! Tus datos han sido autocompletados automáticamente.`);
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 5000);
          }, 500);
        }
        
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Limpiar datos corruptos
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    } else {
      console.log('No hay sesión activa'); // Debug
      // Asegurar que no hay datos residuales
      setUser(null);
      setFormData({
        nombre: '',
        apellidos: '',
        correo: '',
        telefono: '',
        mensaje: ''
      });
    }
  }, []); // Solo ejecutar una vez al montar

  // Cargar reCAPTCHA v2
  useEffect(() => {
    const loadRecaptcha = () => {
      if (window.grecaptcha) {
        setIsRecaptchaLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsRecaptchaLoaded(true);
      };
      document.head.appendChild(script);
    };

    loadRecaptcha();
  }, []);

  // Renderizar reCAPTCHA cuando esté cargado
  useEffect(() => {
    if (isRecaptchaLoaded && recaptchaRef.current && !recaptchaRef.current.hasChildNodes()) {
      window.grecaptcha.render(recaptchaRef.current, {
        sitekey: '6Lf-0MArAAAAAE3Oqa0W2uuTnxvoPgEk4cXs48bJ',
        callback: (token) => {
          setRecaptchaToken(token);
          // Limpiar error de reCAPTCHA si existe
          if (errors.recaptcha) {
            setErrors(prev => ({ ...prev, recaptcha: '' }));
          }
        },
        'expired-callback': () => {
          setRecaptchaToken('');
        }
      });
    }
  }, [isRecaptchaLoaded, errors.recaptcha]);

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar apellidos
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    } else if (formData.apellidos.trim().length < 2) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    }

    // Validar correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo electrónico es obligatorio';
    } else if (!emailRegex.test(formData.correo)) {
      newErrors.correo = 'El correo electrónico no es válido';
    }

    // Validar teléfono
    const phoneRegex = /^\d{10}$/;
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El número de teléfono es obligatorio';
    } else if (!phoneRegex.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener exactamente 10 números';
    }

    // Validar mensaje
    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es obligatorio';
    } else if (formData.mensaje.trim().length < 10) {
      newErrors.mensaje = 'El mensaje debe tener al menos 10 caracteres';
    } else if (formData.mensaje.trim().length > 1000) {
      newErrors.mensaje = 'El mensaje no puede exceder 1000 caracteres';
    }

    // Validar reCAPTCHA
    if (!recaptchaToken) {
      newErrors.recaptcha = 'Por favor, completa la verificación reCAPTCHA';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación especial para teléfono - solo números
    if (name === 'telefono') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData({
          ...formData,
          [name]: numericValue
        });
      }
    } else if (name === 'nombre' || name === 'apellidos') {
      // Validación para nombres - solo letras y espacios
      const nameValue = value.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ'\s]/g, '');
      if (nameValue.length <= 50) {
        setFormData({
          ...formData,
          [name]: nameValue
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setMessageType('error');
      setAlertMessage('Por favor, corrige los errores en el formulario');
      setShowMessage(true);
      
      // Hacer scroll hacia arriba para mostrar los errores
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setTimeout(() => {
        setShowMessage(false);
      }, 6000);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contacto/enviar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessageType('success');
        setAlertMessage(data.message);
        setShowMessage(true);
        setErrors({});
        
        // Limpiar formulario PERO mantener datos del usuario logueado
        setFormData({
          nombre: user?.nombre || '',
          apellidos: user?.apellidos || '',
          correo: user?.correo || '',
          telefono: user?.telefono || user?.celular || '',
          mensaje: '' // Solo limpiar el mensaje
        });

        // Reset reCAPTCHA
        if (window.grecaptcha) {
          window.grecaptcha.reset();
          setRecaptchaToken('');
        }

        // Hacer scroll hacia arriba para mostrar el mensaje de éxito
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
      } else {
        setMessageType('error');
        setAlertMessage(data.message || 'Error al enviar el mensaje. Inténtalo de nuevo.');
        setShowMessage(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessageType('error');
      setAlertMessage('Error de conexión. Verifica tu conexión a internet e inténtalo más tarde.');
      setShowMessage(true);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setShowMessage(false);
      }, 8000);
    }
  };

  const handleSedesClick = () => {
    navigate('/sedes');
  };

  const handleLoginRedirect = () => {
    // Guardar la intención de redirigir después del login
    localStorage.setItem('redirectAfterLogin', '/contactenos');
    navigate('/iniciar-sesion');
  };

  return (
    <>
      <div className="container-fluid" style={{ backgroundColor: '#fdf2f8', minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-7">
              <div className="bg-white rounded-4 shadow-sm p-4">
                <h2 className="fw-bold mb-4 text-center" style={{ color: '#ec4899', fontSize: '1.8rem' }}>
                  ¡Contáctanos!
                </h2>
                
                {/* Mostrar información del usuario logueado */}
                {user && (
                  <div className="alert d-flex align-items-center mb-4" style={{ backgroundColor: '#e0f2fe', borderColor: '#0891b2', color: '#0c4a6e', border: '1px solid #0891b2' }}>
                    <i className="bi bi-person-check-fill me-2"></i>
                    <div>
                      <strong>¡Hola {user.nombre}!</strong> Hemos autocompletado algunos campos con tu información.
                    </div>
                  </div>
                )}

                {/* Sugerencia para usuarios no logueados */}
                {!user && (
                  <div className="alert alert-warning d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-info-circle-fill me-2"></i>
                      <span>¿Tienes cuenta? Inicia sesión para autocompletar tus datos</span>
                    </div>
                    <button 
                      onClick={handleLoginRedirect}
                      className="btn btn-sm btn-outline-warning"
                    >
                      Iniciar sesión
                    </button>
                  </div>
                )}
                
                {showMessage && (
                  <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} d-flex align-items-center mb-4`} role="alert">
                    <i className={`bi ${messageType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
                    {alertMessage}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Nombre *"
                      className={`form-control form-control-lg ${errors.nombre ? 'is-invalid' : ''}`}
                      style={{ 
                        backgroundColor: user?.nombre ? '#f3f4f6' : '#e5e7eb',
                        border: errors.nombre ? '2px solid #dc3545' : 'none',
                        borderRadius: '12px',
                        padding: '15px 20px'
                      }}
                      readOnly={user && user.nombre}
                      maxLength="50"
                    />
                    {errors.nombre && (
                      <div className="invalid-feedback d-block">
                        <small>{errors.nombre}</small>
                      </div>
                    )}
                    {user?.nombre && (
                      <small className="text-muted">Campo autocompletado desde tu perfil</small>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <input
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      placeholder="Apellidos *"
                      className={`form-control form-control-lg ${errors.apellidos ? 'is-invalid' : ''}`}
                      style={{ 
                        backgroundColor: user?.apellidos ? '#f3f4f6' : '#e5e7eb',
                        border: errors.apellidos ? '2px solid #dc3545' : 'none',
                        borderRadius: '12px',
                        padding: '15px 20px'
                      }}
                      readOnly={user && user.apellidos}
                      maxLength="50"
                    />
                    {errors.apellidos && (
                      <div className="invalid-feedback d-block">
                        <small>{errors.apellidos}</small>
                      </div>
                    )}
                    {user?.apellidos && (
                      <small className="text-muted">Campo autocompletado desde tu perfil</small>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      placeholder="Correo electrónico *"
                      className={`form-control form-control-lg ${errors.correo ? 'is-invalid' : ''}`}
                      style={{ 
                        backgroundColor: user?.correo ? '#f3f4f6' : '#e5e7eb',
                        border: errors.correo ? '2px solid #dc3545' : 'none',
                        borderRadius: '12px',
                        padding: '15px 20px'
                      }}
                      readOnly={user && user.correo}
                    />
                    {errors.correo && (
                      <div className="invalid-feedback d-block">
                        <small>{errors.correo}</small>
                      </div>
                    )}
                    {user?.correo && (
                      <small className="text-muted">Campo autocompletado desde tu perfil</small>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Número de teléfono (10 dígitos) *"
                      className={`form-control form-control-lg ${errors.telefono ? 'is-invalid' : ''}`}
                      style={{ 
                        backgroundColor: (user?.telefono || user?.celular) ? '#f3f4f6' : '#e5e7eb',
                        border: errors.telefono ? '2px solid #dc3545' : 'none',
                        borderRadius: '12px',
                        padding: '15px 20px'
                      }}
                      readOnly={user && (user.telefono || user.celular)}
                      maxLength="10"
                    />
                    {errors.telefono && (
                      <div className="invalid-feedback d-block">
                        <small>{errors.telefono}</small>
                      </div>
                    )}
                    {(user?.telefono || user?.celular) && (
                      <small className="text-muted">Campo autocompletado desde tu perfil</small>
                    )}
                    {!(user?.telefono || user?.celular) && (
                      <small className="text-muted">Solo números, exactamente 10 dígitos</small>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <textarea
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      placeholder="Déjanos tu mensaje aquí... *"
                      rows="5"
                      className={`form-control form-control-lg ${errors.mensaje ? 'is-invalid' : ''}`}
                      style={{ 
                        backgroundColor: '#e5e7eb',
                        border: errors.mensaje ? '2px solid #dc3545' : 'none',
                        borderRadius: '12px',
                        padding: '15px 20px',
                        resize: 'vertical'
                      }}
                      maxLength="1000"
                    ></textarea>
                    {errors.mensaje && (
                      <div className="invalid-feedback d-block">
                        <small>{errors.mensaje}</small>
                      </div>
                    )}
                    <small className="text-muted">
                      {formData.mensaje.length}/1000 caracteres
                    </small>
                  </div>

                  {/* reCAPTCHA v2 */}
                  <div className="mb-3 d-flex justify-content-center">
                    <div ref={recaptchaRef}></div>
                  </div>
                  {errors.recaptcha && (
                    <div className="text-center mb-3">
                      <small className="text-danger">{errors.recaptcha}</small>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <button 
                      type="submit" 
                      className="btn btn-lg px-5 py-3 fw-bold"
                      disabled={isSubmitting}
                      style={{ 
                        backgroundColor: isSubmitting ? '#d1d5db' : '#fbbf24',
                        color: '#111827',
                        border: 'none',
                        borderRadius: '50px',
                        transition: 'all 0.3s ease',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer'
                      }}
                      onMouseOver={(e) => {
                        if (!isSubmitting) {
                          e.target.style.backgroundColor = '#f59e0b';
                          e.target.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isSubmitting) {
                          e.target.style.backgroundColor = '#fbbf24';
                          e.target.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Enviando...
                        </>
                      ) : (
                        'Enviar mensaje'
                      )}
                    </button>
                  </div>
                  
                  <div className="text-center mt-3">
                    <small className="text-muted">* Campos obligatorios</small>
                  </div>
                </form>
              </div>
            </div>
            
            <div className="col-lg-5">
              <div className="h-100">
                <h2 className="fw-bold mb-4 text-center" style={{ color: '#ec4899', fontSize: '1.8rem' }}>
                  CONTACTOS
                </h2>
                
                <div className="d-flex flex-column gap-4">
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        backgroundColor: '#ec4899',
                        color: 'white'
                      }}
                    >
                      <i className="bi bi-telephone-fill"></i>
                    </div>
                    <span className="fw-semibold fs-5">+57 321 309 85 04</span>
                  </div>
                  
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        backgroundColor: '#ec4899',
                        color: 'white'
                      }}
                    >
                      <i className="bi bi-whatsapp"></i>
                    </div>
                    <span className="fw-semibold fs-5">Delicias_Darsy🧁</span>
                  </div>
                  
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        backgroundColor: '#ec4899',
                        color: 'white'
                      }}
                    >
                      <i className="bi bi-instagram"></i>
                    </div>
                    <span className="fw-semibold fs-5">@delicias_darsy</span>
                  </div>
                  
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        backgroundColor: '#ec4899',
                        color: 'white'
                      }}
                    >
                      <i className="bi bi-geo-alt-fill"></i>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="fw-semibold fs-6 mb-2">Nuestras ubicaciones:</span>
                      <button 
                        onClick={handleSedesClick}
                        className="btn btn-outline-pink fw-semibold"
                        style={{ 
                          borderColor: '#ec4899',
                          color: '#ec4899',
                          borderRadius: '25px',
                          padding: '8px 20px',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#ec4899';
                          e.target.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = '#ec4899';
                        }}
                      >
                        Ver nuestras sedes
                      </button>
                    </div>
                  </div>
                  
                  {/* Información adicional */}
                  <div className="mt-4 p-3 bg-white rounded-3 shadow-sm">
                    <h5 className="text-center mb-3" style={{ color: '#ec4899' }}>
                      <i className="bi bi-clock me-2"></i>
                      Horarios de atención
                    </h5>
                    <div className="text-center">
                      <p className="mb-2"><strong>Lunes a Viernes:</strong> 8:00 AM - 6:00 PM</p>
                      <p className="mb-2"><strong>Sábados:</strong> 9:00 AM - 4:00 PM</p>
                      <p className="mb-0"><strong>Domingos:</strong> 10:00 AM - 2:00 PM</p>
                    </div>
                  </div>

                  <div className="mt-3 p-3" style={{ backgroundColor: '#fef3c7', borderRadius: '12px', border: '2px solid #fbbf24' }}>
                    <h6 className="text-center mb-2" style={{ color: '#92400e' }}>
                      <i className="bi bi-lightning-charge-fill me-2"></i>
                      Respuesta rápida
                    </h6>
                    <p className="text-center mb-0" style={{ color: '#92400e', fontSize: '14px' }}>
                      Te responderemos en menos de 24 horas
                    </p>
                  </div>

                  {/* Botón de WhatsApp directo */}
                  <div className="text-center">
                    <a 
                      href="https://wa.me/573213098504?text=¡Hola! Me gustaría obtener más información sobre sus productos 🧁"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success btn-lg fw-bold"
                      style={{
                        borderRadius: '25px',
                        padding: '12px 30px',
                        backgroundColor: '#25d366',
                        borderColor: '#25d366',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#128c7e';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#25d366';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <i className="bi bi-whatsapp me-2"></i>
                      Escríbenos ahora
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contactenos;