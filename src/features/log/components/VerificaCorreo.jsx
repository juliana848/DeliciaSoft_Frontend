import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import authService from '../../Admin/services/authService';

const ModalVerificarCorreo = ({ onCodigoGenerado, onClose }) => {
  const [correo, setCorreo] = useState('');
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

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
      console.log('Solicitando recuperación de contraseña para:', correo);
      
      const result = await authService.solicitarRecuperacionPassword(correo);
      
      if (result.success) {
        showCustomAlert('success', '✅ Código enviado a tu correo electrónico');
        
        // CRÍTICO: Guardar tanto el correo como el código en sessionStorage
        sessionStorage.setItem('tempEmailRecovery', correo);
        sessionStorage.setItem('tempRecoveryCode', result.codigo || '');
        
        console.log('✅ Código guardado en sessionStorage:', result.codigo);
        
        setTimeout(() => {
          onCodigoGenerado(result.codigo);
        }, 1500);
      } else {
        showCustomAlert('error', result.message || 'Error al enviar el código');
      }

    } catch (error) {
      console.error('Error:', error);
      showCustomAlert('error', 'Error de conexión. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="recovery-overlay">
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

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .recovery-modal {
            margin: 1rem !important;
            padding: 1.5rem 1rem !important;
            max-height: 90vh !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ModalVerificarCorreo;