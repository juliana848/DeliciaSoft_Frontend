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
      console.log('🔄 Solicitando recuperación de contraseña para:', correo);
      
      const result = await authService.solicitarRecuperacionPassword(correo);
      
      console.log('📋 Resultado completo del servidor:', result);
      console.log('🔑 Código recibido del servidor:', result.codigo);
      
      if (result.success) {
        // 🔥 VALIDACIÓN CRÍTICA: Verificar que el código existe
        if (!result.codigo) {
          console.error('❌ ERROR: No se recibió código del servidor');
          showCustomAlert('error', 'Error: No se recibió código de verificación');
          return;
        }

        showCustomAlert('success', '✅ Código enviado a tu correo electrónico');
        
        // 🔥 GUARDAR TANTO CORREO COMO CÓDIGO
        sessionStorage.setItem('tempEmailRecovery', correo);
        sessionStorage.setItem('tempRecoveryCode', result.codigo);
        
        console.log('✅ Datos guardados en sessionStorage:');
        console.log('  - Correo:', correo);
        console.log('  - Código:', result.codigo);
        
        // Verificar que se guardó correctamente
        const codigoGuardado = sessionStorage.getItem('tempRecoveryCode');
        console.log('✅ Verificación - Código guardado:', codigoGuardado);
        
        setTimeout(() => {
          onCodigoGenerado(result.codigo);
        }, 1500);
      } else {
        showCustomAlert('error', result.message || 'Error al enviar el código');
      }

    } catch (error) {
      console.error('❌ Error en manejarEnvio:', error);
      showCustomAlert('error', 'Error de conexión. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="recovery-overlay">
      {showAlert.show && (
        <div className={`custom-alert alert-${showAlert.type}`} style={{ zIndex: 10000 }}>
          {showAlert.message}
        </div>
      )}

<div className="recovery-modal" style={{ 
        maxWidth: '400px',
        padding: '1.2rem 1rem'
      }}>
        <div className="progress-indicator" style={{ marginBottom: '0.8rem' }}>
          <div className="step active">
            <div className="step-circle">1</div>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="step-circle">2</div>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="step-circle">3</div>
          </div>
        </div>

        <div className="modal-content">
          <div className="modal-header" style={{ marginBottom: '0.8rem' }}>
            <div className="icon-container" style={{ 
              width: '45px', 
              height: '45px',
              marginBottom: '0.5rem'
            }}>
              <Mail size={20} />
            </div>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>
              Recuperar Contraseña
            </h2>
            <p style={{ fontSize: '0.8rem', lineHeight: '1.25' }}>
              Ingresa tu correo para recibir el código
            </p>
          </div>

          <div className="modal-body">
            <form onSubmit={manejarEnvio}>
              <div className="input-group" style={{ marginBottom: '0.8rem' }}>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={15} />
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
                      padding: '10px 10px 10px 36px',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '0.7rem'
              }}>
                <button 
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading || !correo.trim()}
                  style={{
                    flex: '1',
                    padding: '10px 14px',
                    fontSize: '13px',
                    fontWeight: '600',
                    minHeight: '38px'
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
                      <ArrowRight size={13} />
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
                    padding: '10px 14px',
                    fontSize: '13px',
                    fontWeight: '600',
                    minHeight: '38px'
                  }}
                >
                  Cancelar
                </button>
              </div>

              <div style={{
                background: 'rgba(233, 30, 99, 0.05)',
                border: '1px solid rgba(233, 30, 99, 0.1)',
                borderRadius: '6px',
                padding: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  color: '#5f6368',
                  fontSize: '11px',
                  lineHeight: '1.3'
                }}>
                  Te enviaremos un código de 6 dígitos
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <style jsx>{`
      .recovery-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background: rgba(0, 0, 0, 0.8) !important;
      backdrop-filter: blur(15px) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 999999 !important;
      padding: 15px !important;
      animation: fadeInOverlay 0.4s ease-out !important;
    }

    .recovery-modal {
      background: #ffffff !important;
      border-radius: 18px !important;
      padding: 1.3rem 1.2rem !important;
      max-width: 440px !important;
      width: 95% !important;
      max-height: none !important;
      overflow-y: visible !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25) !important;
      animation: slideInModal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      position: relative !important;
    }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .progress-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          background: #f1f3f4;
          color: #9aa0a6;
          border: 2px solid #f1f3f4;
        }

        .step.active .step-circle {
          background: #e91e63;
          color: white;
          border-color: #e91e63;
        }

        .step.completed .step-circle {
          background: #10b981;
          color: white;
          border-color: #10b981;
        }

        .step span {
          font-size: 12px;
          color: #9aa0a6;
          font-weight: 500;
          text-align: center;
        }

        .step.active span {
          color: #e91e63;
          font-weight: 600;
        }

        .step.completed span {
          color: #10b981;
          font-weight: 600;
        }

        .step-line {
          width: 40px;
          height: 2px;
          background: #f1f3f4;
          margin: 0 5px;
          margin-top: -20px;
        }

        .step-line.completed {
          background: #10b981;
        }

        .icon-container {
          background: linear-gradient(135deg, #e91e63, #ad1457);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto;
          box-shadow: 0 8px 25px rgba(233, 30, 99, 0.3);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: #9ca3af;
          z-index: 1;
        }

        .styled-input {
          width: 100%;
          padding: 14px 14px 14px 44px;
          font-size: 15px;
          border: 2px solid #f1f3f4;
          border-radius: 12px;
          outline: none;
          transition: all 0.3s ease;
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

        .custom-alert {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          padding: 1rem 1.5rem;
          border-radius: 15px;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          min-width: 300px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          animation: slideInRight 0.5s ease-out;
        }

        .alert-success {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .alert-error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 640px) {
          .recovery-modal {
            margin: 1rem !important;
            padding: 1.5rem 1rem !important;
            max-height: 90vh !important;
          }

          .custom-alert {
            right: 10px !important;
            left: 10px !important;
            min-width: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ModalVerificarCorreo;