import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, ArrowRight, RotateCcw, LogIn } from 'lucide-react';

const ModalIngresarCodigo = ({ codigoCorrecto, onClose, onCodigoValido, correoEmail = null, esParaLogin = false }) => {
  const [codigo, setCodigo] = useState(['', '', '', '', '', '']);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [intentos, setIntentos] = useState(0);

  const isLogin = esParaLogin || correoEmail !== null;
  const correo = correoEmail || sessionStorage.getItem('tempEmailRecovery') || 'tu@email.com';
  const vieneDesdeContacto = localStorage.getItem('redirectAfterLogin') === '/contactenos';

  useEffect(() => {
    document.body.classList.add('hide-toggle');
    return () => {
      document.body.classList.remove('hide-toggle');
    };
  }, []);

  useEffect(() => {
    document.getElementById('code-0')?.focus();
  }, []);

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  const handleCodeChange = (index, value) => {
    if (value && !/^[0-9]$/.test(value)) return;
    
    const newCodigo = [...codigo];
    newCodigo[index] = value;
    setCodigo(newCodigo);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!codigo[index] && index > 0) {
        const prevInput = document.getElementById(`code-${index - 1}`);
        prevInput?.focus();
      } else {
        const newCodigo = [...codigo];
        newCodigo[index] = '';
        setCodigo(newCodigo);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    } else if (e.key === 'Enter') {
      manejarVerificacion();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const digits = paste.replace(/[^0-9]/g, '').split('').slice(0, 6);
    
    if (digits.length === 6) {
      setCodigo(digits);
      setTimeout(() => {
        document.getElementById('code-5')?.focus();
      }, 10);
    }
  };

  // 🔥 MÉTODO CRÍTICO CORREGIDO: No mostrar éxito hasta confirmar con el servidor
  const manejarVerificacion = async () => {
    const codigoCompleto = codigo.join('');
    
    if (codigoCompleto.length < 6) {
      showCustomAlert('error', 'Por favor, ingresa el código completo de 6 dígitos.');
      return;
    }

    // 🔥 OBTENER CÓDIGO CORRECTO DEL STORAGE PARA RECUPERACIÓN
    const codigoAlmacenado = isLogin ? codigoCorrecto : sessionStorage.getItem('tempRecoveryCode');
    
    console.log('🔍 Código ingresado:', codigoCompleto);
    console.log('🔑 Código esperado:', codigoAlmacenado);
    console.log('🎯 Es para login?:', isLogin);

    setIsLoading(true);
    setIntentos(prev => prev + 1);

    // Esperar un momento para simular validación
    await new Promise(resolve => setTimeout(resolve, 600));

    if (isLogin) {
      // 🔥 PARA LOGIN: Enviar al servidor sin mostrar éxito aún
      try {
        console.log('📤 Enviando código al servidor para validación...');
        await onCodigoValido(codigoCompleto);
        // Si llega aquí sin error, el código fue válido
        // La alerta de éxito la mostrará LoginForm después del login
      } catch (error) {
        // 🔥 SI HAY ERROR: Mostrar alerta de error y limpiar código
        console.error('❌ Error validando código:', error.message);
        showCustomAlert('error', error.message || 'Código incorrecto. Intenta nuevamente.');
        setCodigo(['', '', '', '', '', '']);
        setTimeout(() => {
          document.getElementById('code-0')?.focus();
        }, 100);
      } finally {
        setIsLoading(false);
      }
      
    } else {
      // 🔥 Para recuperación de contraseña: validar contra sessionStorage
      if (codigoCompleto === String(codigoAlmacenado)) {
        console.log('✅ Código correcto para recuperación');
        showCustomAlert('success', 'Código verificado correctamente');
        setTimeout(() => {
          onCodigoValido();
        }, 1000);
      } else {
        console.error('❌ Código incorrecto:', codigoCompleto, 'vs', codigoAlmacenado);
        showCustomAlert('error', 'Código incorrecto. Inténtalo nuevamente.');
        setCodigo(['', '', '', '', '', '']);
        setTimeout(() => {
          document.getElementById('code-0')?.focus();
        }, 100);
      }
      setIsLoading(false);
    }
  };

  const reenviarCodigo = () => {
    if (isLogin) {
      showCustomAlert('success', 'Código de acceso reenviado');
    } else {
      showCustomAlert('success', 'Código reenviado a tu correo');
    }
    setIntentos(0);
    setCodigo(['', '', '', '', '', '']);
    setTimeout(() => {
      document.getElementById('code-0')?.focus();
    }, 100);
  };

  const codigoCompleto = codigo.join('').length === 6;

  const getTitulo = () => {
    if (isLogin) {
      return vieneDesdeContacto ? 'Verificar para Contacto' : 'Verificar Acceso';
    }
    return 'Verificar Código';
  };

  const getDescripcion = () => {
    if (isLogin) {
      if (vieneDesdeContacto) {
        return `Ingresa el código de 6 dígitos para iniciar sesión y autocompletar el formulario`;
      }
      return `Ingresa el código de 6 dígitos enviado a tu correo`;
    }
    return `Ingresa el código de 6 dígitos enviado a`;
  };

  const getBotonTexto = () => {
    if (isLogin) {
      return vieneDesdeContacto ? 'Verificar e Ir a Contacto' : 'Verificar e Iniciar';
    }
    return 'Verificar';
  };

  const getIcono = () => {
    return isLogin ? <LogIn size={24} /> : <Shield size={24} />;
  };

  const getProgreso = () => {
    if (isLogin) {
      return null;
    }

    return (
      <div className="progress-indicator" style={{ marginBottom: '1.2rem' }}>
        <div className="step completed">
          <div className="step-circle">
            <CheckCircle size={16} />
          </div>
          <span>Correo</span>
        </div>
        <div className="step-line completed"></div>
        <div className="step active">
          <div className="step-circle">2</div>
          <span>Código</span>
        </div>
        <div className="step-line"></div>
        <div className="step">
          <div className="step-circle">3</div>
          <span>Nueva Contraseña</span>
        </div>
      </div>
    );
  };

  const getBotonColor = () => {
    if (isLogin && vieneDesdeContacto) {
      return '#fbbf24';
    }
    return '#e91e63';
  };

  return (
    <div className="recovery-overlay">
      {showAlert.show && (
        <div className={`custom-alert alert-${showAlert.type}`} style={{ zIndex: 10000 }}>
          {showAlert.message}
        </div>
      )}

     <div className="recovery-modal" style={{ maxWidth: '420px', padding: '1.3rem 1.2rem' }}>
        {getProgreso()}

        {vieneDesdeContacto && (
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7, #fcd34d)',
            color: '#92400e',
            padding: '10px',
            borderRadius: '6px',
            margin: '0 0 12px 0',
            fontSize: '12px',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            Una vez verificado, tus datos se autocompletarán automáticamente
          </div>
        )}

        <div className="modal-content">
          <div className="modal-header" style={{ marginBottom: '1rem' }}>
            <div className="icon-container" style={{ width: '50px', height: '50px', marginBottom: '0.6rem' }}>
              {getIcono()}
            </div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.3rem' }}>{getTitulo()}</h2>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.3' }}>
              {getDescripcion()} <strong>{correo}</strong>
            </p>
          </div>

          <div className="modal-body">
            <div className="code-input-container" style={{ margin: '1rem 0' }}>
              {codigo.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="code-digit-input"
                  disabled={isLoading}
                  style={{
                    borderColor: digit ? getBotonColor() : '#f1f3f4',
                    background: digit ? '#ffffff' : '#fafbfc',
                    width: '38px',
                    height: '44px'
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '0.8rem' }}>
              <button 
                onClick={manejarVerificacion}
                className="btn-primary"
                disabled={isLoading || !codigoCompleto}
                style={{
                  flex: '1',
                  backgroundColor: getBotonColor(),
                  color: vieneDesdeContacto ? '#111827' : 'white',
                  padding: '11px 16px',
                  fontSize: '14px',
                  minHeight: '42px'
                }}
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Verificando...
                  </>
                ) : (
                  <>
                    {getBotonTexto()}
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
              
              <button 
                type="button" 
                onClick={onClose}
                className="btn-secondary"
                disabled={isLoading}
                style={{ flex: '1', padding: '11px 16px', fontSize: '14px', minHeight: '42px' }}
              >
                Cancelar
              </button>
            </div>

            <button 
              type="button" 
              onClick={reenviarCodigo}
              disabled={isLoading}
              style={{
                width: '100%',
                background: 'rgba(233, 30, 99, 0.05)',
                border: '1px solid rgba(233, 30, 99, 0.2)',
                borderRadius: '6px',
                padding: '10px',
                color: '#e91e63',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.3s ease'
              }}
            >
              <RotateCcw size={12} />
              Reenviar código
            </button>

            <div style={{
              background: 'rgba(233, 30, 99, 0.05)',
              border: '1px solid rgba(233, 30, 99, 0.1)',
              borderRadius: '6px',
              padding: '10px',
              marginTop: '0.8rem',
              textAlign: 'center'
            }}>
              <div style={{ color: '#5f6368', fontSize: '12px', lineHeight: '1.3' }}>
                {isLogin 
                  ? 'Revisa tu bandeja de spam si no recibiste el código'
                  : 'El código expira en 10 minutos por seguridad'
                }
              </div>
            </div>

            {intentos > 0 && (
              <div style={{
                textAlign: 'center',
                marginTop: '0.8rem',
                color: intentos >= 3 ? '#ef4444' : '#9aa0a6',
                fontSize: '12px',
                fontWeight: intentos >= 3 ? '600' : 'normal'
              }}>
                Intentos: {intentos}/3
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .recovery-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9998;
          padding: 20px;
        }

        .recovery-modal {
          background: white;
          border-radius: 20px;
          width: 100%;
          position: relative;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          animation: modalSlideIn 0.4s ease-out;
          overflow-y: auto;
          z-index: 9998;
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

        .code-input-container {
          display: flex;
          gap: 8px;
          justify-content: center;
          align-items: center;
        }

        .code-digit-input {
          text-align: center;
          font-size: 18px;
          font-weight: 700;
          border: 2px solid;
          border-radius: 12px;
          transition: all 0.3s ease;
          outline: none;
        }

        .code-digit-input:focus {
          border-color: #e91e63 !important;
          box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1);
          transform: scale(1.05);
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
          font-weight: 600 !important;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 25px rgba(233, 30, 99, 0.4) !important;
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
          font-weight: 600 !important;
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

          .code-input-container {
            gap: 4px !important;
          }

          .code-digit-input {
            width: 38px !important;
            height: 46px !important;
            font-size: 16px !important;
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

export default ModalIngresarCodigo;