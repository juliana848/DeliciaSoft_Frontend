import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react';
import authService from '../../Admin/services/authService';

const ModalCambiarContrasena = ({ onClose, onContrasenaCambiada }) => {
  const [passwords, setPasswords] = useState({
    nueva: '',
    confirmar: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    nueva: false,
    confirmar: false
  });
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Obtener datos de recuperación desde sessionStorage
  const correoRecuperacion = sessionStorage.getItem('tempEmailRecovery') || '';
  
  // Para el código de recuperación necesitaremos obtenerlo del modal anterior
  // Por simplicidad, usaremos un código temporal aquí
  const [codigoRecuperacion] = useState(() => {
    // En un caso real, este código vendría del modal anterior
    return sessionStorage.getItem('tempRecoveryCode') || '';
  });

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

  const handleInputChange = (field, value) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePasswords = () => {
    const { nueva, confirmar } = passwords;
    
    if (!nueva.trim()) {
      showCustomAlert('error', 'Por favor, ingresa la nueva contraseña.');
      return false;
    }

    if (nueva.length < 6) {
      showCustomAlert('error', 'La contraseña debe tener al menos 6 caracteres.');
      return false;
    }

    if (!confirmar.trim()) {
      showCustomAlert('error', 'Por favor, confirma la nueva contraseña.');
      return false;
    }

    if (nueva !== confirmar) {
      showCustomAlert('error', 'Las contraseñas no coinciden.');
      return false;
    }

    return true;
  };

  const manejarCambioContrasena = async (e) => {
    e.preventDefault();
    
    if (!validatePasswords()) return;
    
    if (!correoRecuperacion) {
      showCustomAlert('error', 'No se encontró el correo de recuperación.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Cambiando contraseña para:', correoRecuperacion);
      
      // USAR EL NUEVO MÉTODO DEL SERVICIO
      const result = await authService.cambiarPasswordConCodigo(
        correoRecuperacion,
        codigoRecuperacion,
        passwords.nueva
      );

      if (result.success) {
        showCustomAlert('success', '✅ Contraseña actualizada correctamente');
        
        // Limpiar datos temporales
        sessionStorage.removeItem('tempEmailRecovery');
        sessionStorage.removeItem('tempRecoveryCode');
        
        setTimeout(() => {
          onContrasenaCambiada();
        }, 1500);
      } else {
        showCustomAlert('error', result.message || 'Error al cambiar la contraseña');
      }

    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      showCustomAlert('error', 'Error de conexión. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '#ddd' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { label: 'Muy débil', color: '#ef4444' },
      { label: 'Débil', color: '#f97316' },
      { label: 'Regular', color: '#eab308' },
      { label: 'Buena', color: '#22c55e' },
      { label: 'Excelente', color: '#10b981' }
    ];

    return { strength, ...levels[Math.min(strength - 1, 4)] || levels[0] };
  };

  const passwordStrength = getPasswordStrength(passwords.nueva);
  const passwordsMatch = passwords.nueva && passwords.confirmar && passwords.nueva === passwords.confirmar;

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
        {/* Indicador de progreso */}
        <div className="progress-indicator" style={{ marginBottom: '1.5rem' }}>
          <div className="step completed">
            <div className="step-circle">
              <CheckCircle size={16} />
            </div>
            <span>Correo</span>
          </div>
          <div className="step-line completed"></div>
          <div className="step completed">
            <div className="step-circle">
              <CheckCircle size={16} />
            </div>
            <span>Código</span>
          </div>
          <div className="step-line completed"></div>
          <div className="step active">
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
              <Lock size={24} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Nueva Contraseña
            </h2>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
              Ingresa tu nueva contraseña para <strong>{correoRecuperacion}</strong>
            </p>
          </div>

          <div className="modal-body">
            <form onSubmit={manejarCambioContrasena}>
              {/* Nueva contraseña */}
              <div className="input-group" style={{ marginBottom: '1rem' }}>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPasswords.nueva ? 'text' : 'password'}
                    placeholder="Nueva Contraseña"
                    value={passwords.nueva}
                    onChange={(e) => handleInputChange('nueva', e.target.value)}
                    disabled={isLoading}
                    className="styled-input"
                    style={{
                      width: '100%',
                      padding: '14px 44px 14px 44px',
                      fontSize: '15px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('nueva')}
                    className="password-toggle"
                    disabled={isLoading}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af'
                    }}
                  >
                    {showPasswords.nueva ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {/* Indicador de fortaleza */}
                {passwords.nueva && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{
                      width: '100%',
                      height: '4px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                        height: '100%',
                        backgroundColor: passwordStrength.color,
                        transition: 'all 0.3s ease'
                      }}></div>
                    </div>
                    <p style={{
                      fontSize: '12px',
                      color: passwordStrength.color,
                      margin: '4px 0 0 0',
                      fontWeight: '500'
                    }}>
                      Fortaleza: {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPasswords.confirmar ? 'text' : 'password'}
                    placeholder="Confirmar Nueva Contraseña"
                    value={passwords.confirmar}
                    onChange={(e) => handleInputChange('confirmar', e.target.value)}
                    disabled={isLoading}
                    className="styled-input"
                    style={{
                      width: '100%',
                      padding: '14px 44px 14px 44px',
                      fontSize: '15px',
                      borderColor: passwords.confirmar ? 
                        (passwordsMatch ? '#22c55e' : '#ef4444') : '#f1f3f4'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmar')}
                    className="password-toggle"
                    disabled={isLoading}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af'
                    }}
                  >
                    {showPasswords.confirmar ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {/* Indicador de coincidencia */}
                {passwords.confirmar && (
                  <p style={{
                    fontSize: '12px',
                    color: passwordsMatch ? '#22c55e' : '#ef4444',
                    margin: '4px 0 0 0',
                    fontWeight: '500'
                  }}>
                    {passwordsMatch ? '✅ Las contraseñas coinciden' : '❌ Las contraseñas no coinciden'}
                  </p>
                )}
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '1rem'
              }}>
                <button 
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading || !passwords.nueva || !passwords.confirmar || !passwordsMatch}
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
                      Actualizando...
                    </>
                  ) : (
                    <>
                      Actualizar Contraseña
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

              {/* Recomendaciones de seguridad */}
              <div style={{
                background: 'rgba(233, 30, 99, 0.05)',
                border: '1px solid rgba(233, 30, 99, 0.1)',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <h4 style={{
                  color: '#e91e63',
                  fontSize: '13px',
                  margin: '0 0 8px 0',
                  fontWeight: '600'
                }}>
                  💡 Recomendaciones para una contraseña segura:
                </h4>
                <ul style={{
                  color: '#5f6368',
                  fontSize: '12px',
                  margin: '0',
                  paddingLeft: '16px',
                  lineHeight: '1.5'
                }}>
                  <li>Al menos 8 caracteres de longitud</li>
                  <li>Incluye mayúsculas y minúsculas</li>
                  <li>Agrega números y símbolos</li>
                  <li>Evita información personal</li>
                </ul>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
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

export default ModalCambiarContrasena;