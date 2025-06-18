import React, { useState, useEffect } from 'react'; // Import useEffect
import './OpcionesPagoView.css';

const OpcionesPagoView = ({ pedido, total, onPedidoCompletado, onAnterior, onOpcionSeleccionada }) => {
  const [metodoPago, setMetodoPago] = useState('');
  const [sedeSeleccionada, setSedeSeleccionada] = useState('');
  const [mostrarDatosBanco, setMostrarDatosBanco] = useState(false);
  const [comprobante, setComprobante] = useState(null);
  const [errorComprobante, setErrorComprobante] = useState('');
  const [numeroPedido] = useState(() => {
    return `PED-${Date.now().toString().slice(-6)}`;
  });

  // Nuevo estado para la alerta personalizada
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  // Estado para la alerta de subida de imagen
  const [showImageUploadAlert, setShowImageUploadAlert] = useState(false);

  // Calcular totales
  const subtotal = total || 0;
  const iva = Math.round(subtotal * 0.19);
  const totalFinal = subtotal + iva;
  const abono = Math.round(totalFinal / 2); // 50% de abono

  const sedes = [
    {
      id: 'san-benito',
      nombre: 'San Benito',
      direccion: 'CALLE 9 #7-34',
      horario: '9:00 AM - 6:00 PM'
    },
    {
      id: 'san-pablo',
      nombre: 'San Pablo',
      direccion: 'Carrera 15 #12-45',
      horario: '10:00 AM - 7:00 PM'
    }
  ];

  // Función para mostrar la alerta personalizada
  const triggerAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 5000); // La alerta se oculta después de 5 segundos
  };

  const handleMetodoPago = (metodo) => {
    setMetodoPago(metodo);
    setErrorComprobante('');
    setComprobante(null);
    setShowImageUploadAlert(false); // Hide image upload alert when changing method

    if (metodo === 'transferencia') {
      setMostrarDatosBanco(true);
      setSedeSeleccionada('');
    } else {
      setMostrarDatosBanco(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setErrorComprobante('');
    setShowImageUploadAlert(false); // Hide previous image upload alert

    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrorComprobante('Solo se permiten archivos de imagen (JPG, PNG, WEBP)');
        setComprobante(null);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrorComprobante('El archivo es demasiado grande. Máximo 5MB.');
        setComprobante(null);
        return;
      }

      setComprobante(file);
      setShowImageUploadAlert(true); // Show success alert
      setTimeout(() => {
        setShowImageUploadAlert(false);
      }, 3000); // Hide success alert after 3 seconds
    }
  };

  const copiarDatos = () => {
    const datos = `Banco Bancolombia\nAhorro\nCuenta: 123-456-789\nCédula: 12.345.678\nNombre: Juan Pérez\nNequi: 300 123 45 67\nValor a transferir: $${abono.toLocaleString()}`;

    navigator.clipboard.writeText(datos).then(() => {
      triggerAlert('success', '✅ Datos bancarios copiados al portapapeles');
    });
  };

  const mostrarAlertaEfectivo = () => {
    const sedeInfo = sedes.find(sede => sede.id === sedeSeleccionada);
    const mensaje = `
📋 Número de Pedido: ${numeroPedido}
📍 Sede: ${sedeInfo.nombre}
📍 Dirección: ${sedeInfo.direccion}
⏰ Horario: ${sedeInfo.horario}
💰 Valor a pagar: $${abono.toLocaleString()}

⚠️ IMPORTANTE: Presenta este número de pedido al llegar a la sede.`;

    triggerAlert('info', mensaje); // Use the custom alert for this
  };

  const procesarPago = () => {
    if (!metodoPago) {
      triggerAlert('error', '❌ Por favor selecciona un método de pago.');
      return;
    }

    if (metodoPago === 'transferencia') {
      if (!comprobante) {
        setErrorComprobante('Es obligatorio subir el comprobante de transferencia');
        return;
      }
    }

    if (metodoPago === 'efectivo') {
      if (!sedeSeleccionada) {
        triggerAlert('error', '❌ Por favor selecciona una sede para el pago en efectivo.');
        return;
      }
      mostrarAlertaEfectivo(); // This will now trigger the custom alert
    }

    const datosPago = {
      metodo: metodoPago,
      sede: sedeSeleccionada,
      abono: abono,
      total: totalFinal,
      numeroPedido: numeroPedido,
      comprobante: comprobante // Note: In a real app, you'd upload this file to a server
    };

    onOpcionSeleccionada(datosPago);
    onPedidoCompletado();
    triggerAlert('success', '🎉 ¡Pedido completado con éxito! Revisa la información de pago.');
  };

  return (
    <div className="opciones-pago-view">
      {/* Alerta personalizada */}
      {showAlert.show && (
        <div className={`custom-alert ${showAlert.type}`}>
          <span className="alert-icon">
            {showAlert.type === 'success' && '✅'}
            {showAlert.type === 'error' && '❌'}
            {showAlert.type === 'info' && 'ℹ️'}
          </span>
          <div className="alert-message">
            {showAlert.message.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
          <button className="close-alert-btn" onClick={() => setShowAlert({ show: false, type: '', message: '' })}>
            &times;
          </button>
        </div>
      )}

      {/* Alerta de imagen subida */}
      {showImageUploadAlert && (
        <div className="custom-alert success image-upload-alert">
          <span className="alert-icon">📸</span>
          <div className="alert-message">
            <p>¡Imagen subida correctamente!</p>
            <p className="file-name-display">{comprobante?.name}</p>
          </div>
          <button className="close-alert-btn" onClick={() => setShowImageUploadAlert(false)}>
            &times;
          </button>
        </div>
      )}

      <div className="pago-contenido">
        <div className="seccion-header">
          <h2 className="seccion-title">💳 Opciones de Pago</h2>
          <div className="numero-pedido">
            <span>📋 Número de Pedido: <strong>{numeroPedido}</strong></span>
          </div>
          <div className="alert-info">
            <span className="alert-icon">ℹ️</span>
            <span>Los productos personalizados requieren un abono del 50% para iniciar la producción</span>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="resumen-pago">
          <h3 className="resumen-title">📋 Resumen del Pedido</h3>

          <div className="productos-lista">
            {pedido.productos.map((producto, index) => (
              <div key={index} className="producto-pago-item">
                <span className="producto-nombre">{producto.nombre}</span>
                <span className="producto-cantidad">x{producto.cantidad}</span>
                <span className="producto-precio">${(producto.precio * producto.cantidad).toLocaleString()}</span>
              </div>
            ))}

            {pedido.toppings && pedido.toppings.length > 0 && (
              <div className="extras-section">
                <span className="extras-title">Toppings:</span>
                {pedido.toppings.map((topping, index) => (
                  <div key={index} className="extra-item">
                    <span>{topping.nombre}</span>
                    <span>${topping.precio.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {pedido.adiciones && pedido.adiciones.length > 0 && (
              <div className="extras-section">
                <span className="extras-title">Adiciones:</span>
                {pedido.adiciones.map((adicion, index) => (
                  <div key={index} className="extra-item">
                    <span>{adicion.nombre}</span>
                    <span>${adicion.precio.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="totales">
            <div className="total-item">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="total-item">
              <span>IVA (19%):</span>
              <span>${iva.toLocaleString()}</span>
            </div>
            <div className="total-item total-final">
              <span>Total:</span>
              <span>${totalFinal.toLocaleString()}</span>
            </div>
            <div className="total-item abono-destacado">
              <span>🔸 Abono requerido (50%):</span>
              <span className="abono-valor">${abono.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="metodos-pago">
          <h3 className="metodos-title">Selecciona tu método de pago</h3>

          <div className="metodos-grid">
            {/* Transferencia */}
            <div className={`metodo-card ${metodoPago === 'transferencia' ? 'selected' : ''}`}>
              <label className="metodo-label">
                <input
                  type="radio"
                  name="metodoPago"
                  value="transferencia"
                  checked={metodoPago === 'transferencia'}
                  onChange={() => handleMetodoPago('transferencia')}
                />
                <div className="metodo-content">
                  <div className="metodo-icon">🏦</div>
                  <div className="metodo-info">
                    <h4>Transferencia Bancaria</h4>
                    <p>Bancolombia o Nequi</p>
                  </div>
                </div>
              </label>

              {mostrarDatosBanco && (
                <div className="datos-banco">
                  <div className="banco-info">
                    <h5>📍 Datos para transferencia:</h5>
                    <div className="dato-item">
                      <span className="dato-label">Banco:</span>
                      <span>Bancolombia</span>
                    </div>
                    <div className="dato-item">
                      <span className="dato-label">Tipo:</span>
                      <span>Cuenta de Ahorros</span>
                    </div>
                    <div className="dato-item">
                      <span className="dato-label">Número:</span>
                      <span>123-456-789</span>
                    </div>
                    <div className="dato-item">
                      <span className="dato-label">Cédula:</span>
                      <span>12.345.678</span>
                    </div>
                    <div className="dato-item">
                      <span className="dato-label">Nombre:</span>
                      <span>Juan Pérez</span>
                    </div>
                    <div className="dato-item">
                      <span className="dato-label">Nequi:</span>
                      <span>300 123 45 67</span>
                    </div>
                    <div className="dato-item destacado">
                      <span className="dato-label">Valor a transferir:</span>
                      <span>${abono.toLocaleString()}</span>
                    </div>
                    <button className="btn-copiar" onClick={copiarDatos}>
                      📋 Copiar datos
                    </button>
                  </div>

                  {/* Sección de subir comprobante */}
                  <div className="comprobante-section">
                    <h5>📎 Subir Comprobante <span className="obligatorio">*</span></h5>
                    <div className="upload-area">
                      <input
                        type="file"
                        id="comprobante"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="file-input"
                      />
                      <label htmlFor="comprobante" className="upload-label">
                        {comprobante ? (
                          <div className="file-selected">
                            <span className="file-icon">✅</span>
                            <span className="file-name">{comprobante.name}</span>
                          </div>
                        ) : (
                          <div className="upload-placeholder">
                            <span className="upload-icon">📷</span>
                            <span>Seleccionar imagen del comprobante</span>
                            <small>JPG, PNG, WEBP (máx. 5MB)</small>
                          </div>
                        )}
                      </label>
                    </div>
                    {errorComprobante && (
                      <div className="error-message">
                        <span className="error-icon">❌</span>
                        <span>{errorComprobante}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Efectivo en sede */}
            <div className={`metodo-card ${metodoPago === 'efectivo' ? 'selected' : ''}`}>
              <label className="metodo-label">
                <input
                  type="radio"
                  name="metodoPago"
                  value="efectivo"
                  checked={metodoPago === 'efectivo'}
                  onChange={() => handleMetodoPago('efectivo')}
                />
                <div className="metodo-content">
                  <div className="metodo-icon">💵</div>
                  <div className="metodo-info">
                    <h4>Efectivo en Sede</h4>
                    <p>Paga directamente en nuestras ubicaciones</p>
                  </div>
                </div>
              </label>

              {metodoPago === 'efectivo' && (
                <div className="sedes-efectivo">
                  <h5>📍 Selecciona la sede: <span className="obligatorio">*</span></h5>
                  {sedes.map(sede => (
                    <label key={sede.id} className={`sede-option ${sedeSeleccionada === sede.id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="sede"
                        value={sede.id}
                        checked={sedeSeleccionada === sede.id}
                        onChange={(e) => setSedeSeleccionada(e.target.value)}
                      />
                      <div className="sede-info">
                        <span className="sede-nombre">{sede.nombre}</span>
                        <span className="sede-direccion">{sede.direccion}</span>
                        <span className="sede-horario">{sede.horario}</span>
                      </div>
                    </label>
                  ))}

                  {sedeSeleccionada && (
                    <div className="valor-efectivo">
                      <span className="valor-label">Valor a pagar:</span>
                      <span className="valor-cantidad">${abono.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="acciones-footer">
          <button className="btn-anterior" onClick={onAnterior}>
            <span className="btn-icon">←</span>
            Anterior
          </button>
          <button
            className="btn-continuar"
            onClick={procesarPago}
            disabled={!metodoPago || (metodoPago === 'efectivo' && !sedeSeleccionada) || (metodoPago === 'transferencia' && !comprobante)}
          >
            Completar Pedido
            <span className="btn-icon">✓</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpcionesPagoView;