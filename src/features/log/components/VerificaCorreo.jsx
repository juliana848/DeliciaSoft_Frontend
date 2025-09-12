import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight } from 'lucide-react';

const ModalVerificarCorreo = ({ onCodigoGenerado, onClose }) => {
  const [correo, setCorreo] = useState('');
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Agregar clase al body para ocultar el toggle
  useEffect(() => {
    document.body.classList.add('hide-toggle');
    return () => {
      document.body.classList.remove('hide-toggle');
    };
  }, []);

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 4000);
  };

  const handleResponse = async (response) => {
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
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    
    if (!correo.trim()) {
      showCustomAlert('error', 'Por favor, ingresa tu correo electrónico.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      showCustomAlert('error', 'Por favor, ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);

    try {
      // Primera petición: buscar el usuario en ambas tablas
      const findUserResponse = await fetch('https://deliciasoft-backend.onrender.com/api/auth/find-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          correo: correo
        }),
      });

      let userData;
      let userType = 'cliente'; // Por defecto

      if (findUserResponse.ok) {
        const findResult = await findUserResponse.json();
        if (!findResult.found) {
          showCustomAlert('error', 'No existe una cuenta con este correo electrónico.');
          setIsLoading(false);
          return;
        }
        userType = findResult.userType;
        userData = findResult;
      } else {
        // Fallback: simular búsqueda exitosa para testing
        console.warn('API de búsqueda no disponible, usando modo prueba');
        userData = { found: true, userType: 'cliente' };
      }

      // Segunda petición: solicitar código de recuperación
      const response = await fetch('https://deliciasoft-backend.onrender.com/api/auth/request-password-reset', {
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

      const { isJson, data } = await handleResponse(response);

      if (!isJson) {
        console.warn('Endpoint de recuperación no disponible, generando código localmente');
        const codigoGenerado = Math.floor(100000 + Math.random() * 900000).toString();
        
        showCustomAlert('success', '✅ Código generado (modo desarrollo): ' + codigoGenerado);
        
        sessionStorage.setItem('tempEmailRecovery', correo);
        sessionStorage.setItem('tempUserType', userType);
        
        setTimeout(() => {
          onCodigoGenerado(codigoGenerado);
        }, 2000);
        
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        showCustomAlert('success', '✅ Código enviado a tu correo electrónico');
        
        sessionStorage.setItem('tempEmailRecovery', correo);
        sessionStorage.setItem('tempUserType', userType);
        
        const codigo = data.codigo || Math.floor(100000 + Math.random() * 900000).toString();
        
        setTimeout(() => {
          onCodigoGenerado(codigo);
        }, 1500);
      } else {
        showCustomAlert('error', data.message || 'Error al enviar el código');
      }

    } catch (error) {
      console.error('Error:', error);
      
      if (error.message.includes('fetch')) {
        console.warn('Error de conexión, generando código localmente para testing');
        const codigoGenerado = Math.floor(100000 + Math.random() * 900000).toString();
        
        showCustomAlert('success', '✅ Código generado (modo offline): ' + codigoGenerado);
        
        sessionStorage.setItem('tempEmailRecovery', correo);
        sessionStorage.setItem('tempUserType', 'cliente');
        
        setTimeout(() => {
          onCodigoGenerado(codigoGenerado);
        }, 2000);
      } else {
        showCustomAlert('error', 'Error de conexión. Inténtalo nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="recovery-overlay">
      {/* Alerta personalizada */}
      {showAlert.show && (
        <div className={`custom-alert alert-${showAlert.type}`}>
          {showAlert.message}
        </div>
      )}

      <div className="recovery-modal" style={{ 
        maxWidth: '480px',
        padding: '2rem 1.5rem 1.5rem',
        minHeight: 'auto',
        maxHeight: '85vh'
      }}>
        {/* Indicador de progreso más compacto */}
        <div className="progress-indicator" style={{ marginBottom: '1.5rem' }}>
          <div className="step active">
            <div className="step-circle">1</div>
            <span>Correo</span>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="step-circle">2</div>
            <span>Código</span>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="step-circle">3</div>
            <span>Nueva Contraseña</span>
          </div>
        </div>

        <div className="modal-content">
          <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
            <div className="icon-container" style={{ 
              width: '60px', 
              height: '60px',
              marginBottom: '1rem'
            }}>
              <Mail size={24} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Recuperar Contraseña
            </h2>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
              Ingresa tu correo electrónico para enviarte un código de verificación
            </p>
          </div>

          <div className="modal-body">
            <form onSubmit={manejarEnvio}>
              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    placeholder="Correo Electrónico"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    disabled={isLoading}
                    className="styled-input"
                    autoComplete="email"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 44px',
                      fontSize: '15px'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '1rem'
              }}>
                <button 
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading || !correo.trim()}
                  style={{
                    flex: '1',
                    padding: '14px 20px',
                    fontSize: '15px',
                    fontWeight: '600',
                    minHeight: '48px'
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar Código
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
                
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="btn-secondary"
                  disabled={isLoading}
                  style={{
                    flex: '1',
                    padding: '14px 20px',
                    fontSize: '15px',
                    fontWeight: '600',
                    minHeight: '48px'
                  }}
                >
                  Cancelar
                </button>
              </div>

              {/* Información de ayuda más compacta */}
              <div style={{
                background: 'rgba(233, 30, 99, 0.05)',
                border: '1px solid rgba(233, 30, 99, 0.1)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{
                  color: '#5f6368',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}>
                  Te enviaremos un código de 6 dígitos para verificar tu identidad
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .recovery-overlay {
          padding: 20px;
        }

        .styled-input:focus {
          border-color: #e91e63 !important;
          box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1) !important;
        }

        .btn-primary {
          background: #e91e63 !important;
          border: none !important;
          border-radius: 12px !important;
          color: white !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          transition: all 0.3s ease !important;
        }

        .btn-primary:hover:not(:disabled) {
          background: #c2185b !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3) !important;
        }

        .btn-secondary {
          background: white !important;
          border: 2px solid #f1f3f4 !important;
          border-radius: 12px !important;
          color: #5f6368 !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s ease !important;
        }

        .btn-secondary:hover:not(:disabled) {
          border-color: #e91e63 !important;
          color: #e91e63 !important;
          background: rgba(233, 30, 99, 0.05) !important;
        }

        .btn-primary:disabled, .btn-secondary:disabled {
          opacity: 0.6 !important;
          cursor: not-allowed !important;
          transform: none !important;
        }

        @media (max-width: 640px) {
          .recovery-modal {
            margin: 1rem !important;
            padding: 1.5rem 1rem !important;
            max-height: 90vh !important;
          }

          .progress-indicator {
            margin-bottom: 1rem !important;
          }

          .step-circle {
            width: 36px !important;
            height: 36px !important;
            font-size: 13px !important;
          }

          .step-line {
            width: 30px !important;
          }

          .modal-header h2 {
            font-size: 1.3rem !important;
          }

          .icon-container {
            width: 50px !important;
            height: 50px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ModalVerificarCorreo;