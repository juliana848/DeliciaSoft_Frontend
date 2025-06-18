import React, { useState } from 'react';
import './OpcionesEntregaView.css';

const OpcionesEntregaView = ({ pedido, onSiguiente, onAnterior, onOpcionSeleccionada }) => {
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState('');
  const [datosEntrega, setDatosEntrega] = useState({
    fecha: '',
    hora: '',
    telefono: '',
    observaciones: ''
  });

  const ubicaciones = [
    {
      id: 'san-benito',
      nombre: 'San Benito',
      direccion: 'CALLE 9 #7-34',
      horarios: 'Lunes a Domingo: 9:00 AM - 6:00 PM',
      icon: '🛒'
    },
    {
      id: 'san-pablo',
      nombre: 'San Pablo',
      direccion: 'Carrera 15 #12-45',
      horarios: 'Lunes a Domingo: 10:00 AM - 7:00 PM',
      icon: '🛒'
    }
  ];

  const horariosDisponibles = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const handleContinue = () => {
    if (ubicacionSeleccionada && datosEntrega.fecha && datosEntrega.hora && datosEntrega.telefono) {
      // Pasar los datos de entrega al componente padre
      onOpcionSeleccionada({
        ubicacion: ubicacionSeleccionada,
        datosEntrega: datosEntrega
      });
      
      // Continuar a la siguiente vista
      onSiguiente();
    } else {
      alert('Por favor completa todos los campos obligatorios');
    }
  };

  const isFormValid = ubicacionSeleccionada && datosEntrega.fecha && datosEntrega.hora && datosEntrega.telefono;

  return (
    <div className="opciones-entrega-container">
      <div className="entrega-content">
        <div className="entrega-header">
          <h2 className="section-title">Selecciona tu Ubicación</h2>
          <div className="alert-container">
            <div className="alert-icon">⚠️</div>
            <span className="alert-text">Tu pedido contiene productos personalizados.</span>
          </div>
        </div>

        <div className="ubicaciones-container">
          <h3 className="subsection-title">Nuestros Carritos Móviles</h3>
          <div className="ubicaciones-grid">
            {ubicaciones.map((ubicacion) => (
              <label 
                key={ubicacion.id}
                className={`ubicacion-card ${ubicacionSeleccionada === ubicacion.id ? 'selected' : ''}`}
              >
                <input 
                  type="radio" 
                  name="ubicacion" 
                  value={ubicacion.id}
                  checked={ubicacionSeleccionada === ubicacion.id}
                  onChange={(e) => setUbicacionSeleccionada(e.target.value)}
                  className="radio-input"
                />
                <div className="card-content">
                  <div className="ubicacion-icon">{ubicacion.icon}</div>
                  <div className="ubicacion-info">
                    <span className="ubicacion-nombre">{ubicacion.nombre}</span>
                    <span className="ubicacion-direccion">{ubicacion.direccion}</span>
                    <span className="ubicacion-horarios">{ubicacion.horarios}</span>
                  </div>
                  <div className="radio-indicator"></div>
                </div>
              </label>
            ))}
          </div>

          {ubicacionSeleccionada && (
            <div className="formulario-entrega">
              <h3 className="form-title">Datos de tu Pedido</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📅</span>
                    Fecha de entrega
                  </label>
                  <input 
                    type="date" 
                    value={datosEntrega.fecha}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDatosEntrega(prev => ({...prev, fecha: e.target.value}))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🕐</span>
                    Hora de entrega
                  </label>
                  <select 
                    value={datosEntrega.hora}
                    onChange={(e) => setDatosEntrega(prev => ({...prev, hora: e.target.value}))}
                    className="form-select"
                  >
                    <option value="">Seleccionar hora</option>
                    {horariosDisponibles.map(hora => (
                      <option key={hora} value={hora}>
                        {hora}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📱</span>
                  Teléfono de contacto
                </label>
                <input 
                  type="tel" 
                  placeholder="Ej: 300 123 4567"
                  value={datosEntrega.telefono}
                  onChange={(e) => setDatosEntrega(prev => ({...prev, telefono: e.target.value}))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">💬</span>
                  Observaciones adicionales (Opcional)
                </label>
                <textarea 
                  placeholder="Deja aquí cualquier comentario adicional sobre tu pedido..."
                  value={datosEntrega.observaciones}
                  onChange={(e) => setDatosEntrega(prev => ({...prev, observaciones: e.target.value}))}
                  className="form-textarea"
                  rows="3"
                />
              </div>
            </div>
          )}
        </div>

        <div className="acciones-footer">
          <button 
            onClick={onAnterior}
            className="btn-anterior"
          >
            <span className="btn-icon">←</span>
            Anterior
          </button>
          <button 
            onClick={handleContinue}
            disabled={!isFormValid}
            className="btn-continuar"
          >
            Continuar
            <span className="btn-icon">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpcionesEntregaView;