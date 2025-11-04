import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './contactenos.css';

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

  const API_BASE_URL = 'https://deliciasoft-backend-i6g9.onrender.com';

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (authToken && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        setFormData(prev => ({
          ...prev,
          nombre: parsedUser.nombre || '',
          apellidos: parsedUser.apellidos || '',
          correo: parsedUser.correo || '',
          telefono: parsedUser.telefono || parsedUser.celular || '',
          mensaje: ''
        }));
        
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
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    } else {
      setUser(null);
      setFormData({
        nombre: '',
        apellidos: '',
        correo: '',
        telefono: '',
        mensaje: ''
      });
    }
  }, []);

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

 useEffect(() => {
    if (isRecaptchaLoaded && recaptchaRef.current && !recaptchaRef.current.hasChildNodes()) {
      // Verificar que grecaptcha y render estén disponibles
      if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
        try {
          window.grecaptcha.render(recaptchaRef.current, {
            sitekey: '6Lf-0MArAAAAAE3Oqa0W2uuTnxvoPgEk4cXs48bJ',
            callback: (token) => {
              setRecaptchaToken(token);
              if (errors.recaptcha) {
                setErrors(prev => ({ ...prev, recaptcha: '' }));
              }
            },
            'expired-callback': () => {
              setRecaptchaToken('');
            }
          });
        } catch (error) {
          console.error('Error rendering reCAPTCHA:', error);
        }
      } else {
        // Si no está disponible, esperar un poco más
        const timer = setTimeout(() => {
          if (window.grecaptcha && typeof window.grecaptcha.render === 'function' && recaptchaRef.current) {
            try {
              window.grecaptcha.render(recaptchaRef.current, {
                sitekey: '6Lf-0MArAAAAAE3Oqa0W2uuTnxvoPgEk4cXs48bJ',
                callback: (token) => {
                  setRecaptchaToken(token);
                  if (errors.recaptcha) {
                    setErrors(prev => ({ ...prev, recaptcha: '' }));
                  }
                },
                'expired-callback': () => {
                  setRecaptchaToken('');
                }
              });
            } catch (error) {
              console.error('Error rendering reCAPTCHA (delayed):', error);
            }
          }
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isRecaptchaLoaded, errors.recaptcha]);
  
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    } else if (formData.apellidos.trim().length < 2) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo electrónico es obligatorio';
    } else if (!emailRegex.test(formData.correo)) {
      newErrors.correo = 'El correo electrónico no es válido';
    }

    const phoneRegex = /^\d{10}$/;
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El número de teléfono es obligatorio';
    } else if (!phoneRegex.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener exactamente 10 números';
    }

    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es obligatorio';
    } else if (formData.mensaje.trim().length < 10) {
      newErrors.mensaje = 'El mensaje debe tener al menos 10 caracteres';
    } else if (formData.mensaje.trim().length > 1000) {
      newErrors.mensaje = 'El mensaje no puede exceder 1000 caracteres';
    }

    if (!recaptchaToken) {
      newErrors.recaptcha = 'Por favor, completa la verificación reCAPTCHA';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telefono') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData({
          ...formData,
          [name]: numericValue
        });
      }
    } else if (name === 'nombre' || name === 'apellidos') {
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
        
        setFormData({
          nombre: user?.nombre || '',
          apellidos: user?.apellidos || '',
          correo: user?.correo || '',
          telefono: user?.telefono || user?.celular || '',
          mensaje: ''
        });

        if (window.grecaptcha) {
          window.grecaptcha.reset();
          setRecaptchaToken('');
        }

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
    localStorage.setItem('redirectAfterLogin', '/contactenos');
    navigate('/iniciar-sesion');
  };

  return (
    <div className="contact-page-wrapper">
      <div className="contact-container">
        {/* Decorative elements */}
        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>
        
        <div className="contact-content">
          {/* Left side - Form */}
          <div className="form-section">
            <div className="form-card">
              <div className="form-header">
                <h1 className="form-title">¡Contáctanos!</h1>
                <div className="title-underline"></div>
              </div>
              
              {user && (
                <div className="user-info-banner">
                  <i className="bi bi-person-check-fill"></i>
                  <div>
                    <strong>¡Hola {user.nombre}!</strong> Hemos autocompletado algunos campos con tu información.
                  </div>
                </div>
              )}

              {!user && (
                <div className="login-suggestion">
                  <div className="login-text">
                    <i className="bi bi-info-circle-fill"></i>
                    <span>¿Tienes cuenta? Inicia sesión para autocompletar tus datos</span>
                  </div>
                  <button onClick={handleLoginRedirect} className="login-btn">
                    Iniciar sesión
                  </button>
                </div>
              )}
              
              {showMessage && (
                <div className={`message-alert ${messageType === 'success' ? 'success' : 'error'}`}>
                  <i className={`bi ${messageType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
                  {alertMessage}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="elegant-form">
                <div className="form-row">
                  <div className="input-group">
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder=" "
                      className={`elegant-input ${errors.nombre ? 'error' : ''} ${user?.nombre ? 'readonly' : ''}`}
                      readOnly={user && user.nombre}
                      maxLength="50"
                    />
                    <label className="elegant-label">Nombre *</label>
                    {errors.nombre && <span className="error-text">{errors.nombre}</span>}
                    {user?.nombre && <small className="auto-text">Autocompletado</small>}
                  </div>
                  
                  <div className="input-group">
                    <input
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      placeholder=" "
                      className={`elegant-input ${errors.apellidos ? 'error' : ''} ${user?.apellidos ? 'readonly' : ''}`}
                      readOnly={user && user.apellidos}
                      maxLength="50"
                    />
                    <label className="elegant-label">Apellidos *</label>
                    {errors.apellidos && <span className="error-text">{errors.apellidos}</span>}
                    {user?.apellidos && <small className="auto-text">Autocompletado</small>}
                  </div>
                </div>
                
                <div className="input-group">
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder=" "
                    className={`elegant-input ${errors.correo ? 'error' : ''} ${user?.correo ? 'readonly' : ''}`}
                    readOnly={user && user.correo}
                  />
                  <label className="elegant-label">Correo electrónico *</label>
                  {errors.correo && <span className="error-text">{errors.correo}</span>}
                  {user?.correo && <small className="auto-text">Autocompletado</small>}
                </div>
                
                <div className="input-group">
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder=" "
                    className={`elegant-input ${errors.telefono ? 'error' : ''} ${(user?.telefono || user?.celular) ? 'readonly' : ''}`}
                    readOnly={user && (user.telefono || user.celular)}
                    maxLength="10"
                  />
                  <label className="elegant-label">Número de teléfono (10 dígitos) *</label>
                  {errors.telefono && <span className="error-text">{errors.telefono}</span>}
                  {(user?.telefono || user?.celular) && <small className="auto-text">Autocompletado</small>}
                  {!(user?.telefono || user?.celular) && !errors.telefono && (
                    <small className="helper-text">Solo números, exactamente 10 dígitos</small>
                  )}
                </div>
                
                <div className="input-group">
                  <textarea
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    placeholder=" "
                    rows="5"
                    className={`elegant-input elegant-textarea ${errors.mensaje ? 'error' : ''}`}
                    maxLength="1000"
                  ></textarea>
                  <label className="elegant-label">Déjanos tu mensaje aquí... *</label>
                  {errors.mensaje && <span className="error-text">{errors.mensaje}</span>}
                  <small className="char-count">{formData.mensaje.length}/1000 caracteres</small>
                </div>

                <div className="recaptcha-wrapper">
                  <div ref={recaptchaRef}></div>
                  {errors.recaptcha && <span className="error-text recaptcha-error">{errors.recaptcha}</span>}
                </div>
                
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar mensaje
                      <i className="bi bi-send-fill"></i>
                    </>
                  )}
                </button>
                
                <small className="required-text">* Campos obligatorios</small>
              </form>
            </div>
          </div>
          
          {/* Right side - Contact info */}
          <div className="info-section">
            <h2 className="info-title">Información de Contacto</h2>
            
            <div className="contact-items">
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="bi bi-telephone-fill"></i>
                </div>
                <div className="contact-details">
                  <span className="contact-label">Teléfono</span>
                  <span className="contact-value">+57 321 309 85 04</span>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="bi bi-whatsapp"></i>
                </div>
                <div className="contact-details">
                  <span className="contact-label">WhatsApp</span>
                  <a 
                    href="https://wa.me/573213098504?text=¡Hola! Me gustaría obtener más información sobre sus productos 🧁"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-inline-btn"
                  >
                    Escríbenos ahora
                  </a>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="bi bi-instagram"></i>
                </div>
                <div className="contact-details">
                  <span className="contact-label">Instagram</span>
                  <span className="contact-value">@delicias_darsy</span>
                </div>
              </div>
              
              <div className="contact-item location-item">
                <div className="contact-icon">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <div className="contact-details">
                  <span className="contact-label">Ubicaciones</span>
                  <button onClick={handleSedesClick} className="location-btn">
                    Ver nuestras sedes
                    <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="info-card schedule-card">
              <h3 className="card-title">
                <i className="bi bi-clock"></i>
                Horarios de atención
              </h3>
              <div className="schedule-list">
                <div className="schedule-item">
                  <span>Lunes a Viernes</span>
                  <span className="schedule-time">8:00 AM - 6:00 PM</span>
                </div>
                <div className="schedule-item">
                  <span>Sábados</span>
                  <span className="schedule-time">9:00 AM - 4:00 PM</span>
                </div>
                <div className="schedule-item">
                  <span>Domingos</span>
                  <span className="schedule-time">10:00 AM - 2:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contactenos;