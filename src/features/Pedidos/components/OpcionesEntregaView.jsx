import React, { useState, useEffect } from 'react';
import './OpcionesEntregaView.css';

const OpcionesEntregaView = ({ pedido, onSiguiente, onAnterior, onOpcionSeleccionada }) => {
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState('');
  const [datosEntrega, setDatosEntrega] = useState({
    fecha: '',
    hora: '',
    telefono: '',
    observaciones: ''
  });
  
  const [alertas, setAlertas] = useState([]);
  const [errores, setErrores] = useState({});

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

  // Función para agregar una alerta
  const agregarAlerta = (tipo, mensaje) => {
    const nuevaAlerta = {
      id: Date.now() + Math.random(),
      tipo,
      mensaje,
      timestamp: Date.now()
    };
    
    setAlertas(prev => [...prev, nuevaAlerta]);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      setAlertas(prev => prev.filter(alerta => alerta.id !== nuevaAlerta.id));
    }, 5000);
  };

  // Función para validar teléfono
  const validarTelefono = (telefono) => {
    const regex = /^[3][0-9]{9}$/;
    return regex.test(telefono.replace(/\s/g, ''));
  };

  // Función para validar fecha (mínimo 2 semanas)
  const validarFecha = (fecha) => {
    if (!fecha) return false;
    
    const fechaSeleccionada = new Date(fecha);
    const fechaActual = new Date();
    const fechaMinima = new Date();
    fechaMinima.setDate(fechaMinima.getDate() + 14); // 2 semanas después
    
    return fechaSeleccionada >= fechaMinima;
  };

  // Función para validar hora según el día
  const validarHora = (fecha, hora) => {
    if (!fecha || !hora) return false;
    
    const fechaSeleccionada = new Date(fecha);
    const diaSemana = fechaSeleccionada.getDay();
    
    // Validar horarios según la ubicación seleccionada
    const ubicacion = ubicaciones.find(u => u.id === ubicacionSeleccionada);
    if (!ubicacion) return false;
    
    const [horaNum] = hora.split(':').map(Number);
    
    if (ubicacionSeleccionada === 'san-benito') {
      return horaNum >= 9 && horaNum < 18;
    } else if (ubicacionSeleccionada === 'san-pablo') {
      return horaNum >= 10 && horaNum < 19;
    }
    
    return true;
  };

  // Validaciones en tiempo real
  useEffect(() => {
    const nuevosErrores = {};
    
    // Validar ubicación
    if (!ubicacionSeleccionada) {
      nuevosErrores.ubicacion = 'Debe seleccionar una ubicación';
    }
    
    // Validar fecha
    if (datosEntrega.fecha) {
      if (!validarFecha(datosEntrega.fecha)) {
        nuevosErrores.fecha = 'La fecha debe ser al menos 2 semanas después de hoy';
      }
    }
    
    // Validar hora
    if (datosEntrega.hora && datosEntrega.fecha) {
      if (!validarHora(datosEntrega.fecha, datosEntrega.hora)) {
        nuevosErrores.hora = 'La hora seleccionada no está disponible para esta ubicación';
      }
    }
    
    // Validar teléfono
    if (datosEntrega.telefono) {
      if (!validarTelefono(datosEntrega.telefono)) {
        nuevosErrores.telefono = 'El teléfono debe ser un celular colombiano válido (10 dígitos)';
      }
    }
    
    setErrores(nuevosErrores);
  }, [ubicacionSeleccionada, datosEntrega]);

  // Manejar selección de ubicación
  const manejarSeleccionUbicacion = (ubicacionId) => {
    setUbicacionSeleccionada(ubicacionId);
    const ubicacion = ubicaciones.find(u => u.id === ubicacionId);
    agregarAlerta('success', `✅ Ubicación "${ubicacion.nombre}" seleccionada correctamente`);
  };

  // Manejar cambio de fecha
  const manejarCambioFecha = (fecha) => {
    setDatosEntrega(prev => ({...prev, fecha}));
    
    if (fecha) {
      if (validarFecha(fecha)) {
        agregarAlerta('success', '✅ Fecha válida seleccionada');
      } else {
        agregarAlerta('error', '❌ La fecha debe ser al menos 2 semanas después de hoy');
      }
    }
  };

  // Manejar cambio de hora
  const manejarCambioHora = (hora) => {
    setDatosEntrega(prev => ({...prev, hora}));
    
    if (hora && datosEntrega.fecha) {
      if (validarHora(datosEntrega.fecha, hora)) {
        agregarAlerta('success', '✅ Hora válida seleccionada');
      } else {
        agregarAlerta('error', '❌ La hora no está disponible para esta ubicación');
      }
    }
  };

  // Manejar cambio de teléfono
 const manejarCambioTelefono = (telefono) => {
  setDatosEntrega(prev => ({...prev, telefono}));

  if (telefono.length === 10) {
    if (validarTelefono(telefono)) {
      agregarAlerta('success', '✅ Teléfono válido');
    } else {
      agregarAlerta('error', '❌ Ingrese un teléfono celular colombiano válido');
    }
  }
};


  const handleContinue = () => {
    // Validar campos obligatorios
    const camposObligatorios = [
      { campo: 'ubicacion', valor: ubicacionSeleccionada, mensaje: 'Debe seleccionar una ubicación' },
      { campo: 'fecha', valor: datosEntrega.fecha, mensaje: 'Debe seleccionar una fecha de entrega' },
      { campo: 'hora', valor: datosEntrega.hora, mensaje: 'Debe seleccionar una hora de entrega' },
      { campo: 'telefono', valor: datosEntrega.telefono, mensaje: 'Debe ingresar un teléfono de contacto' }
    ];

    const camposFaltantes = camposObligatorios.filter(campo => !campo.valor);
    
    if (camposFaltantes.length > 0) {
      camposFaltantes.forEach(campo => {
        agregarAlerta('error', `❌ ${campo.mensaje}`);
      });
      return;
    }

    // Validar que no haya errores
    if (Object.keys(errores).length > 0) {
      agregarAlerta('error', '❌ Por favor corrija los errores antes de continuar');
      return;
    }

    // Si todo está bien
    agregarAlerta('success', '✅ Formulario completado correctamente');
    
    setTimeout(() => {
      onOpcionSeleccionada({
        ubicacion: ubicacionSeleccionada,
        datosEntrega: datosEntrega
      });
      onSiguiente();
    }, 1000);
  };

  const isFormValid = ubicacionSeleccionada && 
                      datosEntrega.fecha && 
                      datosEntrega.hora && 
                      datosEntrega.telefono &&
                      Object.keys(errores).length === 0;

  // Calcular fecha mínima (2 semanas después)
  const fechaMinima = new Date();
  fechaMinima.setDate(fechaMinima.getDate() + 14);
  const fechaMinimaString = fechaMinima.toISOString().split('T')[0];

  return (
    <div className="opciones-entrega-container">
      {/* Contenedor de alertas */}
      <div className="alertas-container">
        {alertas.map(alerta => (
          <div 
            key={alerta.id} 
            className={`alerta alerta-${alerta.tipo}`}
          >
            <span className="alerta-mensaje">{alerta.mensaje}</span>
            <button 
              className="alerta-cerrar"
              onClick={() => setAlertas(prev => prev.filter(a => a.id !== alerta.id))}
            >
              ×
            </button>
          </div>
        ))}
      </div>

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
                className={`ubicacion-card ${ubicacionSeleccionada === ubicacion.id ? 'selected' : ''} ${errores.ubicacion ? 'error' : ''}`}
              >
                <input 
                  type="radio" 
                  name="ubicacion" 
                  value={ubicacion.id}
                  checked={ubicacionSeleccionada === ubicacion.id}
                  onChange={(e) => manejarSeleccionUbicacion(e.target.value)}
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
          {errores.ubicacion && <span className="error-message">* {errores.ubicacion}</span>}

          {ubicacionSeleccionada && (
            <div className="formulario-entrega">
              <h3 className="form-title">Datos de tu Pedido</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📅</span>
                    Fecha de entrega *
                  </label>
                  <input 
                    type="date" 
                    value={datosEntrega.fecha}
                    min={fechaMinimaString}
                    onChange={(e) => manejarCambioFecha(e.target.value)}
                    className={`form-input ${errores.fecha ? 'error' : ''}`}
                  />
                  {errores.fecha && <span className="error-message">* {errores.fecha}</span>}
                  <small className="form-help">Mínimo 2 semanas desde hoy</small>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🕐</span>
                    Hora de entrega *
                  </label>
                  <select 
                    value={datosEntrega.hora}
                    onChange={(e) => manejarCambioHora(e.target.value)}
                    className={`form-select ${errores.hora ? 'error' : ''}`}
                  >
                    <option value="">Seleccionar hora</option>
                    {horariosDisponibles.map(hora => (
                      <option key={hora} value={hora}>
                        {hora}
                      </option>
                    ))}
                  </select>
                  {errores.hora && <span className="error-message">* {errores.hora}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📱</span>
                  Teléfono de contacto *
                </label>
                <input 
                  type="tel" 
                  placeholder="Ej: 3001234567"
                  value={datosEntrega.telefono}
                  onChange={(e) => manejarCambioTelefono(e.target.value)}
                  className={`form-input ${errores.telefono ? 'error' : ''}`}
                  maxLength="10"
                />
                {errores.telefono && <span className="error-message">* {errores.telefono}</span>}
                <small className="form-help">Celular colombiano de 10 dígitos</small>
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
                  maxLength="500"
                />
                <small className="form-help">{datosEntrega.observaciones.length}/500 caracteres</small>
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