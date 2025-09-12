// VerificarCodigo.jsx - Versión mejorada y compacta
import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, ArrowRight, RotateCcw, LogIn } from 'lucide-react';

const ModalIngresarCodigo = ({ codigoCorrecto, onClose, onCodigoValido, correoEmail = null, esParaLogin = false }) => {
  const [codigo, setCodigo] = useState(['', '', '', '', '', '']);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [intentos, setIntentos] = useState(0);

  // DETECTAR CONTEXTO: Determinar si es login o recuperación
  const isLogin = esParaLogin || correoEmail !== null;
  
  // Recuperar el correo según el contexto
  const correo = correoEmail || sessionStorage.getItem('tempEmailRecovery') || 'tu@email.com';
  
  // Verificar si viene desde contacto
  const vieneDesdeContacto = localStorage.getItem('redirectAfterLogin') === '/contactenos';

  // Agregar clase al body para ocultar el toggle
  useEffect(() => {
    document.body.classList.add('hide-toggle');
    return () => {
      document.body.classList.remove('hide-toggle');
    };
  }, []);

  // Auto-focus en el primer input al montar el componente
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
    // Solo permitir números
    if (value && !/^[0-9]$/.test(value)) return;
    
    const newCodigo = [...codigo];
    newCodigo[index] = value;
    setCodigo(newCodigo);

    // Auto-focus al siguiente input si se ingresó un dígito
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!codigo[index] && index > 0) {
        // Si el campo está vacío y presiona backspace, ir al anterior
        const prevInput = document.getElementById(`code-${index - 1}`);
        prevInput?.focus();
      } else {
        // Limpiar el campo actual
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

  const manejarVerificacion = () => {
    const codigoCompleto = codigo.join('');
    
    if (codigoCompleto.length < 6) {
      showCustomAlert('error', 'Por favor, ingresa el código completo de 6 dígitos.');
      return;
    }

    setIsLoading(true);
    setIntentos(prev => prev + 1);

    // Simular una pequeña validación
    setTimeout(() => {
      if (codigoCompleto === String(codigoCorrecto)) {
        if (isLogin) {
          if (vieneDesdeContacto) {
            showCustomAlert('success', 'Código verificado. Redirigiendo al formulario de contacto...');
          } else {
            showCustomAlert('success', 'Código verificado. Iniciando sesión...');
          }
        } else {
          showCustomAlert('success', 'Código verificado correctamente');
        }
        
        setTimeout(() => {
          onCodigoValido();
        }, 1500);
      } else {
        showCustomAlert('error', 'Código incorrecto. Inténtalo nuevamente.');
        setCodigo(['', '', '', '', '', '']);
        setTimeout(() => {
          document.getElementById('code-0')?.focus();
        }, 100);
      }
      setIsLoading(false);
    }, 800);
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

  // TEXTOS DINÁMICOS según contexto
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

  // SOLO mostrar progreso si NO es login (es decir, solo para recuperación de contraseña)
  const getProgreso = () => {
    if (isLogin) {
      return null; // NO mostrar pasos para login
    }

    // Solo mostrar para recuperación de contraseña
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
      return '#fbbf24'; // Amarillo para contacto
    }
    return '#e91e63'; // Rosa por defecto
  };

  return (
    <div className="recovery-overlay">
      {showAlert.show && (
        <div className={`custom-alert alert-${showAlert.type}`}>
          {showAlert.message}
        </div>
      )}

      <div className="recovery-modal" style={{ maxWidth: '480px', padding: '1.8rem 1.5rem' }}>
        {/* Indicador de progreso SOLO para recuperación de contraseña */}
        {getProgreso()}

        {/* Mensaje especial si viene desde contacto */}
        {vieneDesdeContacto && (
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7, #fcd34d)',
            color: '#92400e',
            padding: '12px',
            borderRadius: '8px',
            margin: '0 0 15px 0',
            fontSize: '13px',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            Una vez verificado, tus datos se autocompletarán automáticamente
          </div>
        )}

        <div className="modal-content">
          <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
            <div className="icon-container" style={{ width: '60px', height: '60px', marginBottom: '1rem' }}>
              {getIcono()}
            </div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{getTitulo()}</h2>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
              {getDescripcion()} <strong>{correo}</strong>
            </p>
          </div>

          <div className="modal-body">
            <div className="code-input-container" style={{ margin: '1.5rem 0' }}>
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
                    width: '44px',
                    height: '52px'
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem' }}>
              <button 
                onClick={manejarVerificacion}
                className="btn-primary"
                disabled={isLoading || !codigoCompleto}
                style={{
                  flex: '1',
                  backgroundColor: getBotonColor(),
                  color: vieneDesdeContacto ? '#111827' : 'white',
                  padding: '14px 20px',
                  fontSize: '15px',
                  minHeight: '48px'
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
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
              
              <button 
                type="button" 
                onClick={onClose}
                className="btn-secondary"
                disabled={isLoading}
                style={{ flex: '1', padding: '14px 20px', fontSize: '15px', minHeight: '48px' }}
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
                borderRadius: '8px',
                padding: '12px',
                color: '#e91e63',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(233, 30, 99, 0.1)';
                e.target.style.borderColor = '#e91e63';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(233, 30, 99, 0.05)';
                e.target.style.borderColor = 'rgba(233, 30, 99, 0.2)';
              }}
            >
              <RotateCcw size={14} />
              Reenviar código
            </button>

            {/* Información de ayuda compacta */}
            <div style={{
              background: 'rgba(233, 30, 99, 0.05)',
              border: '1px solid rgba(233, 30, 99, 0.1)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ color: '#5f6368', fontSize: '13px', lineHeight: '1.4' }}>
                {isLogin 
                  ? 'Revisa tu bandeja de spam si no recibiste el código'
                  : 'El código expira en 10 minutos por seguridad'
                }
              </div>
            </div>

            {/* Contador de intentos */}
            {intentos > 0 && (
              <div style={{
                textAlign: 'center',
                marginTop: '1rem',
                color: '#9aa0a6',
                fontSize: '13px'
              }}>
                Intentos: {intentos}/3
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalIngresarCodigo;