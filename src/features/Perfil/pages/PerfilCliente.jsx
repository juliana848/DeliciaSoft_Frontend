import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Shield, Lock, Eye, EyeOff, Save, Edit3, LogOut, X, Check, AlertTriangle, Key, Loader } from 'lucide-react';
import { usePerfil } from '../../../hooks/usePerfil';
import GoogleAddressAutocomplete from '../../../shared/components/GoogleAddressAutocomplete';
import './PerfilCliente.css';

const PerfilCliente = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [showSuspendForm, setShowSuspendForm] = useState(false);

  // Hook personalizado con todas las funcionalidades
  const {
    loading,
    updating,
    userData,
    originalData,
    error,
    errores,
    suspendToken,
    tokenError,
    tokenEnviado,
    enviandoToken,
    tiempoRestante,
    handleInputChange,
    handlePlaceSelect,
    actualizarPerfil,
    cambiarContrasena,
    suspenderCuenta,
    cerrarSesion,
    cancelarEdicion,
    hayCambiosSinGuardar,
    handleTokenChange,
    enviarTokenSuspension,
    cancelarSuspension,
    formatearTiempoRestante,
    limpiarError
  } = usePerfil();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 4000);
  };

  const handleSave = async () => {
    const resultado = await actualizarPerfil();
    if (resultado.success) {
      setIsEditing(false);
      showCustomAlert('success', '¡Perfil actualizado exitosamente!');
    } else {
      showCustomAlert('error', resultado.error || 'Error al actualizar el perfil');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSave = async () => {
    const resultado = await cambiarContrasena(passwordData);
    if (resultado.success) {
      // Limpiar formulario
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordFields(false);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      showCustomAlert('success', '¡Contraseña actualizada correctamente!');
    } else {
      showCustomAlert('error', resultado.error || 'Error al cambiar la contraseña');
    }
  };

  const handleSuspendAccount = async () => {
    const resultado = await suspenderCuenta();
    if (resultado.success) {
      setShowSuspendModal(false);
      showCustomAlert('warning', 'Tu cuenta ha sido suspendida.');
    } else {
      showCustomAlert('error', resultado.error || 'Error al suspender la cuenta');
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    cerrarSesion();
    showCustomAlert('info', '¡Hasta pronto!');
  };

  const handleGoBack = () => {
    if (hayCambiosSinGuardar()) {
      if (window.confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const handleCancelEdit = () => {
    cancelarEdicion();
    setIsEditing(false);
  };

  // Función para cerrar modal cuando se hace clic en el overlay
  const handleModalOverlayClick = (e, modalType) => {
    if (e.target === e.currentTarget) {
      switch(modalType) {
        case 'suspend':
          setShowSuspendModal(false);
          break;
        case 'logout':
          setShowLogoutModal(false);
          break;
        default:
          break;
      }
    }
  };

  // Mostrar loading mientras carga los datos
  if (loading) {
    return (
      <div className="profile-container loading-container">
        <div className="loading-content">
          <Loader className="loading-spinner" size={48} />
          <h2>Cargando perfil...</h2>
          <p>Obteniendo tus datos desde el servidor</p>
        </div>
      </div>
    );
  }

  const renderProfileTab = () => (
    <div className="content-body">
      <div className="form-grid">
        {/* Información Personal */}
        <div className="form-section">
          <h3 className="section-title">
            <User className="section-icon" />
            Información Personal
          </h3>
          
          <div className="form-group">
            <label className="form-label">Tipo de Documento</label>
            <select
              name="tipoDocumento"
              value={userData?.tipoDocumento || 'CC'}
              onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
              disabled={!isEditing}
              className="form-select"
            >
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="PA">Pasaporte</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Número de Documento *</label>
            <input
              type="text"
              value={userData?.numeroDocumento || ''}
              onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
              onFocus={() => limpiarError('numeroDocumento')}
              disabled={!isEditing}
              className={`form-input ${errores.numeroDocumento ? 'error' : ''}`}
              placeholder="Máximo 10 dígitos"
              maxLength="10"
            />
            {errores.numeroDocumento && (
              <small className="error-text">{errores.numeroDocumento}</small>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Nombres *</label>
            <input
              type="text"
              value={userData?.nombre || ''}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              onFocus={() => limpiarError('nombre')}
              disabled={!isEditing}
              className={`form-input ${errores.nombre ? 'error' : ''}`}
              placeholder="Ingresa tu nombre"
            />
            {errores.nombre && (
              <small className="error-text">{errores.nombre}</small>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Apellidos *</label>
            <input
              type="text"
              value={userData?.apellido || ''}
              onChange={(e) => handleInputChange('apellido', e.target.value)}
              onFocus={() => limpiarError('apellido')}
              disabled={!isEditing}
              className={`form-input ${errores.apellido ? 'error' : ''}`}
              placeholder="Ingresa tu apellido"
            />
            {errores.apellido && (
              <small className="error-text">{errores.apellido}</small>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Fecha de Nacimiento</label>
            <div className="input-with-icon">
              <Calendar className="input-icon" />
              <input
                type="date"
                value={userData?.fechaNacimiento || ''}
                onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                onFocus={() => limpiarError('fechaNacimiento')}
                disabled={!isEditing}
                className={`form-input ${errores.fechaNacimiento ? 'error' : ''}`}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
              />
            </div>
            {errores.fechaNacimiento && (
              <small className="error-text">{errores.fechaNacimiento}</small>
            )}
            <small className="help-text">Debes tener al menos 13 años</small>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="form-section">
          <h3 className="section-title">
            <Phone className="section-icon" />
            Información de Contacto
          </h3>

          <div className="form-group">
            <label className="form-label">Correo Electrónico *</label>
            <div className="input-with-icon">
              <Mail className="input-icon" />
              <input
                type="email"
                value={userData?.correo || ''}
                onChange={(e) => handleInputChange('correo', e.target.value)}
                onFocus={() => limpiarError('correo')}
                disabled={!isEditing}
                className={`form-input ${errores.correo ? 'error' : ''}`}
                placeholder="tucorreo@ejemplo.com"
              />
            </div>
            {errores.correo && (
              <small className="error-text">{errores.correo}</small>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Número de Celular</label>
            <div className="input-with-icon">
              <Phone className="input-icon" />
              <input
                type="tel"
                value={userData?.celular || ''}
                onChange={(e) => handleInputChange('celular', e.target.value)}
                onFocus={() => limpiarError('celular')}
                disabled={!isEditing}
                className={`form-input ${errores.celular ? 'error' : ''}`}
                placeholder="Máximo 10 dígitos"
                maxLength="10"
              />
            </div>
            {errores.celular && (
              <small className="error-text">{errores.celular}</small>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Dirección</label>
            <div className="input-with-icon">
              <MapPin className="input-icon" />
              {isEditing ? (
                <GoogleAddressAutocomplete
                  value={userData?.direccion || ''}
                  onChange={(direccion) => handleInputChange('direccion', direccion)}
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="Busca tu dirección"
                  error={errores.direccion}
                  disabled={!isEditing}
                />
              ) : (
                <input
                  type="text"
                  value={userData?.direccion || ''}
                  disabled={true}
                  className="form-input"
                  placeholder="Calle 123 #45-67"
                />
              )}
            </div>
            {errores.direccion && (
              <small className="error-text">{errores.direccion}</small>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Barrio</label>
            <input
              type="text"
              value={userData?.barrio || ''}
              onChange={(e) => handleInputChange('barrio', e.target.value)}
              disabled={!isEditing}
              className="form-input"
              placeholder="Se llena automáticamente con la dirección"
              readOnly={isEditing}
            />
            <small className="help-text">Se completa automáticamente al seleccionar la dirección</small>
          </div>

          <div className="form-group">
            <label className="form-label">Ciudad</label>
            <input
              type="text"
              value={userData?.ciudad || ''}
              onChange={(e) => handleInputChange('ciudad', e.target.value)}
              disabled={!isEditing}
              className="form-input"
              placeholder="Se llena automáticamente con la dirección"
              readOnly={isEditing}
            />
            <small className="help-text">Se completa automáticamente al seleccionar la dirección</small>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="content-body">
      <div className="form-grid">
        {/* Cambiar Contraseña */}
        <div className="form-section">
          <h3 className="section-title">
            <Lock className="section-icon" />
            Cambiar Contraseña
          </h3>
          
          {!showPasswordFields ? (
            <div>
              <p className="security-text">
                Mantén tu cuenta segura actualizando tu contraseña regularmente.
              </p>
              <button
                onClick={() => setShowPasswordFields(true)}
                className="modern-button primary-button"
                disabled={updating}
              >
                <Lock size={18} />
                <span>Cambiar Contraseña</span>
              </button>
            </div>
          ) : (
            <div className="password-change-form">
              <div className="form-group">
                <label className="form-label">Contraseña Actual *</label>
                <div className="password-group">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`form-input ${errores.currentPassword ? 'error' : ''}`}
                    placeholder="Ingresa tu contraseña actual"
                    disabled={updating}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    disabled={updating}
                  >
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errores.currentPassword && (
                  <small className="error-text">{errores.currentPassword}</small>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Nueva Contraseña *</label>
                <div className="password-group">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`form-input ${errores.newPassword ? 'error' : ''}`}
                    placeholder="Mínimo 6 caracteres"
                    disabled={updating}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={updating}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errores.newPassword && (
                  <small className="error-text">{errores.newPassword}</small>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Confirmar Nueva Contraseña *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`form-input ${errores.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirma tu nueva contraseña"
                  disabled={updating}
                />
                {errores.confirmPassword && (
                  <small className="error-text">{errores.confirmPassword}</small>
                )}
              </div>

              <div className="button-group">
                <button
                  onClick={() => {
                    setShowPasswordFields(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setShowCurrentPassword(false);
                    setShowNewPassword(false);
                  }}
                  className="modern-button secondary-button"
                  disabled={updating}
                >
                  <X size={18} />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handlePasswordSave}
                  className="modern-button success-button"
                  disabled={updating}
                >
                  {updating ? <Loader className="spinner" size={18} /> : <Save size={18} />}
                  <span>Actualizar Contraseña</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Suspender Cuenta */}
        <div className="form-section">
          <h3 className="section-title">
            <Shield className="section-icon" />
            Suspender Cuenta
          </h3>

          {!showSuspendForm ? (
            <>
              <p className="security-text">
                Desactiva temporalmente tu cuenta. Tu información se mantendrá segura 
                y podrás reactivarla cuando desees contactando al administrador.
              </p>

              <div className="suspend-info">
                <p className="suspend-warning">
                  <strong>¿Qué sucede cuando suspendes tu cuenta?</strong>
                </p>
                <ul className="suspend-list">
                  <li>• Tu cuenta será marcada como "Desactivada"</li>
                  <li>• No podrás iniciar sesión hasta reactivarla</li>
                  <li>• Tus datos personales permanecen seguros</li>
                  <li>• Puedes reactivarla contactando al soporte</li>
                </ul>
              </div>

              <button
                onClick={() => setShowSuspendForm(true)}
                className="modern-button warning-button"
                disabled={updating}
              >
                <AlertTriangle size={18} />
                <span>Suspender Cuenta</span>
              </button>
            </>
          ) : (
            <>
              {!tokenEnviado ? (
                <>
                  <p className="security-text">
                    Para suspender tu cuenta, enviaremos un código de verificación de 6 dígitos 
                    a tu correo electrónico: <strong>{userData?.correo}</strong>
                  </p>

                  <div className="button-group">
                    <button
                      onClick={() => {
                        setShowSuspendForm(false);
                        cancelarSuspension();
                      }}
                      className="modern-button secondary-button"
                      disabled={enviandoToken}
                    >
                      <X size={18} />
                      <span>Cancelar</span>
                    </button>
                    <button
                      onClick={enviarTokenSuspension}
                      className="modern-button warning-button"
                      disabled={enviandoToken}
                    >
                      {enviandoToken ? <Loader className="spinner" size={18} /> : <Mail size={18} />}
                      <span>Enviar Código</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="security-text">
                    Se ha enviado un código de verificación de 6 dígitos a tu correo: <strong>{userData?.correo}</strong>
                  </p>

                  <div className="form-group">
                    <label className="form-label">Código de Verificación</label>
                    <div className="input-with-icon">
                      <Key className="input-icon" />
                      <input
                        type="text"
                        value={suspendToken}
                        onChange={(e) => handleTokenChange(e.target.value)}
                        placeholder="123456"
                        className={`form-input ${tokenError ? 'error' : ''}`}
                        disabled={updating}
                        maxLength="6"
                        style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }}
                      />
                    </div>
                    {tokenError && <p className="error-text">{tokenError}</p>}
                    
                    {tiempoRestante > 0 && (
                      <div className="token-timer">
                        <small className="help-text">
                          Código válido por: <strong>{formatearTiempoRestante()}</strong>
                        </small>
                      </div>
                    )}
                  </div>

                  <div className="token-actions">
                    <p className="security-text">
                      ¿No recibiste el código? Revisa tu carpeta de spam o solicita uno nuevo cuando expire.
                    </p>
                  </div>

                  <div className="button-group">
                    <button
                      onClick={() => {
                        setShowSuspendForm(false);
                        cancelarSuspension();
                      }}
                      className="modern-button secondary-button"
                      disabled={updating}
                    >
                      <X size={18} />
                      <span>Cancelar</span>
                    </button>
                    <button
                      onClick={handleSuspendAccount}
                      className="modern-button warning-button"
                      disabled={updating || !suspendToken.trim() || suspendToken.length !== 6}
                    >
                      {updating ? <Loader className="spinner" size={18} /> : <AlertTriangle size={18} />}
                      <span>Confirmar Suspensión</span>
                    </button>
                  </div>

                  {tiempoRestante <= 0 && (
                    <div className="token-expired">
                      <p className="error-text">El código ha expirado.</p>
                      <button
                        onClick={enviarTokenSuspension}
                        className="modern-button primary-button"
                        disabled={enviandoToken}
                      >
                        {enviandoToken ? <Loader className="spinner" size={18} /> : <Mail size={18} />}
                        <span>Enviar Nuevo Código</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="profile-container">
      {/* Alerta personalizada */}
      {showAlert.show && (
        <div className={`alert alert-${showAlert.type}`}>
          <div className="alert-content">
            {showAlert.type === 'success' && <Check size={20} />}
            {showAlert.type === 'warning' && <AlertTriangle size={20} />}
            {showAlert.type === 'info' && <Shield size={20} />}
            {showAlert.type === 'error' && <X size={20} />}
            <span>{showAlert.message}</span>
          </div>
        </div>
      )}

      {/* Botón de regreso en esquina superior izquierda */}
      <button onClick={handleGoBack} className="back-button-corner">
        <ArrowLeft size={20} />
        <span>Regresar</span>
      </button>

      <div className="profile-layout">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          {/* Avatar y info básica */}
          <div className="profile-avatar">
            <div className="avatar-circle">
              <User size={48} />
            </div>
            <h2 className="profile-name">{userData?.nombre} {userData?.apellido}</h2>
            <p className="profile-email">{userData?.correo}</p>
            {!userData?.estado && (
              <span className="status-badge suspended">Cuenta Suspendida</span>
            )}
          </div>

          {/* Navegación */}
          <nav>
            <ul className="profile-nav">
              <li className="nav-item">
                <button
                  className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="nav-icon" size={20} />
                  Mi Perfil
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-button ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  <Shield className="nav-icon" size={20} />
                  Seguridad
                </button>
              </li>
            </ul>
          </nav>

          {/* Botón de cerrar sesión */}
          <div className="logout-section">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="modern-button logout-button"
              disabled={updating}
            >
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="profile-main">
          {/* Header */}
          <header className="content-header">
            <div className="header-content">
              <h1 className="header-title">
                {activeTab === 'profile' ? 'Mi Información Personal' : 'Configuración de Seguridad'}
              </h1>
              <p className="header-subtitle">
                {activeTab === 'profile' 
                  ? 'Mantén tu información actualizada para un mejor servicio' 
                  : 'Protege tu cuenta con configuraciones de seguridad'
                }
              </p>
            </div>
            
            {activeTab === 'profile' && (
              <div className="header-actions">
                {isEditing ? (
                  <div className="edit-actions">
                    <button
                      onClick={handleCancelEdit}
                      className="modern-button secondary-button"
                      disabled={updating}
                    >
                      <X size={18} />
                      <span>Cancelar</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="modern-button success-button"
                      disabled={updating}
                    >
                      {updating ? <Loader className="spinner" size={18} /> : <Save size={18} />}
                      <span>Guardar</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="modern-button primary-button-header"
                    disabled={updating}
                  >
                    <Edit3 size={18} />
                    <span>Editar Perfil</span>
                  </button>
                )}
              </div>
            )}
          </header>

          {/* Contenido dinámico */}
          {activeTab === 'profile' ? renderProfileTab() : renderSecurityTab()}
        </main>
      </div>

      {/* Modal de Logout */}
      {showLogoutModal && (
        <div 
          className="modal-overlay" 
          onClick={(e) => handleModalOverlayClick(e, 'logout')}
        >
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <LogOut size={48} className="modal-icon logout-icon" />
              <h3 className="modal-title">¿Cerrar Sesión?</h3>
            </div>
            <p className="modal-text">
              ¿Estás seguro que deseas cerrar sesión? Tendrás que iniciar sesión 
              nuevamente para acceder a tu perfil y realizar pedidos.
            </p>
            <div className="modal-buttons">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="modern-button secondary-button"
                disabled={updating}
              >
                <X size={18} />
                <span>Cancelar</span>
              </button>
              <button
                onClick={handleLogout}
                className="modern-button danger-button"
                disabled={updating}
              >
                <LogOut size={18} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfilCliente;