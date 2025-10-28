import React, { useState, useEffect, useContext } from 'react';
import './OpcionesPagoView.css';
import ventaApiService from '../../Admin/services/venta_services.js';
import sedeApiService from '../../Admin/services/sedes_services.js';
import { CartContext } from "../../Cartas/pages/CartContext";

const OpcionesPagoView = ({ pedido, total, onPedidoCompletado, onAnterior, onOpcionSeleccionada, prepararDatosVenta }) => {
  const { carrito } = useContext(CartContext);
  
  const [metodoPago, setMetodoPago] = useState('');
  const [sedeSeleccionada, setSedeSeleccionada] = useState('');
  const [mostrarDatosBanco, setMostrarDatosBanco] = useState(false);
  const [comprobante, setComprobante] = useState(null);
  const [errorComprobante, setErrorComprobante] = useState('');
  const [numeroPedido] = useState(() => {
    return `PED-${Date.now().toString().slice(-6)}`;
  });

  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [showImageUploadAlert, setShowImageUploadAlert] = useState(false);
  const [procesandoPedido, setProcesandoPedido] = useState(false);

  const [sedes, setSedes] = useState([]);
  const [cargandoSedes, setCargandoSedes] = useState(true);
  const [errorSedes, setErrorSedes] = useState('');
  const [personalizacionesProductos, setPersonalizacionesProductos] = useState({});

  useEffect(() => {
    console.log('🔍 OpcionesPagoView - Verificando productos...');
    console.log('Productos del pedido prop:', pedido?.productos);
    console.log('Productos del carrito context:', carrito);

    // Cargar personalizaciones
    const personalizacionesStorage = localStorage.getItem('personalizacionesPedido');
    if (personalizacionesStorage) {
      try {
        const personalizaciones = JSON.parse(personalizacionesStorage);
        setPersonalizacionesProductos(personalizaciones);
        console.log('✅ Personalizaciones cargadas:', personalizaciones);
      } catch (error) {
        console.error('Error al cargar personalizaciones:', error);
      }
    }
  }, [pedido, carrito]);

  useEffect(() => {
    const cargarSedes = async () => {
      try {
        setCargandoSedes(true);
        setErrorSedes('');
        const sedesData = await sedeApiService.obtenerSedes();
        
        const sedesTransformadas = sedesData
          .filter(sede => sede.activo)
          .map(sede => ({
            id: sede.id.toString(),
            nombre: sede.nombre,
            direccion: sede.Direccion || sede.direccion || 'Dirección no disponible',
            horario: sede.horario || '9:00 AM - 6:00 PM',
            telefono: sede.Telefono || sede.telefono
          }));
        
        setSedes(sedesTransformadas);
        
        if (sedesTransformadas.length === 0) {
          setErrorSedes('No hay sedes disponibles');
          setSedes([
            {
              id: 'san-benito',
              nombre: 'San Benito',
              direccion: 'CALLE 9 #7-34',
              horario: '9:00 AM - 6:00 PM'
            }
          ]);
        }
      } catch (error) {
        console.error('Error al cargar sedes:', error);
        setErrorSedes(`Error al cargar sedes: ${error.message}`);
        setSedes([
          {
            id: 'san-benito',
            nombre: 'San Benito',
            direccion: 'CALLE 9 #7-34',
            horario: '9:00 AM - 6:00 PM'
          }
        ]);
      } finally {
        setCargandoSedes(false);
      }
    };

    cargarSedes();
  }, []);

  // 🎯 FUNCIÓN CLAVE: Obtener productos de múltiples fuentes
  const obtenerTodosLosProductos = () => {
    console.log('📦 Obteniendo productos...');
    
    // Prioridad 1: Productos del pedido
    if (pedido?.productos && Array.isArray(pedido.productos) && pedido.productos.length > 0) {
      console.log('✅ Usando productos del pedido prop');
      return pedido.productos;
    }
    
    // Prioridad 2: Productos del carrito context
    if (carrito && Array.isArray(carrito) && carrito.length > 0) {
      console.log('✅ Usando productos del carrito context');
      return carrito;
    }
    
    // Prioridad 3: Recuperar de localStorage como último recurso
    try {
      const carritoStorage = localStorage.getItem('carritoParaPersonalizar');
      if (carritoStorage) {
        const productosStorage = JSON.parse(carritoStorage);
        if (productosStorage && productosStorage.length > 0) {
          console.log('✅ Usando productos de localStorage');
          return productosStorage;
        }
      }
    } catch (error) {
      console.error('Error al recuperar carrito de localStorage:', error);
    }
    
    console.warn('⚠️ No se encontraron productos en ninguna fuente');
    return [];
  };

  const calcularTotales = () => {
    const productos = obtenerTodosLosProductos();
    let subtotalProductos = 0;
    let subtotalExtras = 0;

    console.log('💰 Calculando totales con productos:', productos.length);

    // Calcular productos base
    if (productos && Array.isArray(productos)) {
      subtotalProductos = productos.reduce((sum, producto) => 
        sum + (producto.precio * (producto.cantidad || 1)), 0
      );
    }

    // Calcular extras desde el pedido (toppings, salsas globales)
    if (pedido?.toppings) {
      subtotalExtras += pedido.toppings.reduce((sum, topping) => sum + (topping.precio || 0), 0);
    }
    if (pedido?.adiciones) {
      subtotalExtras += pedido.adiciones.reduce((sum, adicion) => sum + (adicion.precio || 0), 0);
    }
    if (pedido?.salsas) {
      subtotalExtras += pedido.salsas.reduce((sum, salsa) => sum + (salsa.precio || 0), 0);
    }

    // Calcular personalizaciones desde localStorage
    try {
      if (Object.keys(personalizacionesProductos).length > 0 && productos) {
        productos.forEach(producto => {
          const personalizacionProducto = personalizacionesProductos[producto.id];
          if (personalizacionProducto) {
            for (let unidad = 1; unidad <= (producto.cantidad || 1); unidad++) {
              const personalizacionUnidad = personalizacionProducto[unidad];
              if (personalizacionUnidad) {
                // Sumar toppings
                if (personalizacionUnidad.toppings) {
                  subtotalExtras += personalizacionUnidad.toppings.reduce((sum, item) => sum + (item.precio || 0), 0);
                }
                // Sumar salsas
                if (personalizacionUnidad.salsas) {
                  subtotalExtras += personalizacionUnidad.salsas.reduce((sum, item) => sum + (item.precio || 0), 0);
                }
                // Sumar rellenos
                if (personalizacionUnidad.rellenos) {
                  subtotalExtras += personalizacionUnidad.rellenos.reduce((sum, item) => sum + (item.precio || 0), 0);
                }
                // Sumar adiciones
                if (personalizacionUnidad.adiciones) {
                  subtotalExtras += personalizacionUnidad.adiciones.reduce((sum, item) => sum + (item.precio || 0), 0);
                }
                // Sumar sabores
                if (personalizacionUnidad.sabores) {
                  subtotalExtras += personalizacionUnidad.sabores.reduce((sum, item) => sum + (item.precio || 0), 0);
                }
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Error al calcular personalizaciones:', error);
    }

    const totalFinal = subtotalProductos + subtotalExtras;
    const abono = Math.round(totalFinal / 2);

    console.log('📊 Totales calculados:', {
      subtotalProductos,
      subtotalExtras,
      totalFinal,
      abono
    });

    return {
      subtotalProductos,
      subtotalExtras,
      totalFinal,
      abono
    };
  };

  const { subtotalProductos, subtotalExtras, totalFinal, abono } = calcularTotales();

  const triggerAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleMetodoPago = (metodo) => {
    setMetodoPago(metodo);
    setErrorComprobante('');
    setComprobante(null);
    setShowImageUploadAlert(false);

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
    setShowImageUploadAlert(false);

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
      setShowImageUploadAlert(true);
      setTimeout(() => {
        setShowImageUploadAlert(false);
      }, 3000);
    }
  };

  const copiarDatos = () => {
    const datos = `Banco Bancolombia\nAhorro\nCuenta: 123-456-789\nCédula: 12.345.678\nNombre: Juan Pérez\nNequi: 300 123 45 67\nValor a transferir: $${abono.toLocaleString()}`;

    navigator.clipboard.writeText(datos).then(() => {
      triggerAlert('success', 'Datos bancarios copiados al portapapeles');
    });
  };

  const mostrarAlertaEfectivo = () => {
    const sedeInfo = sedes.find(sede => sede.id === sedeSeleccionada);
    const mensaje = `
Número de Pedido: ${numeroPedido}
Sede: ${sedeInfo.nombre}
Dirección: ${sedeInfo.direccion}
Horario: ${sedeInfo.horario}
Valor a pagar: $${abono.toLocaleString()}

IMPORTANTE: Presenta este número de pedido al llegar a la sede.`;

    triggerAlert('info', mensaje);
  };

  const procesarPago = async () => {
    if (!metodoPago) {
      triggerAlert('error', 'Por favor selecciona un método de pago.');
      return;
    }

    if (metodoPago === 'transferencia' && !comprobante) {
      setErrorComprobante('Es obligatorio subir el comprobante de transferencia');
      return;
    }

    if (metodoPago === 'efectivo' && !sedeSeleccionada) {
      triggerAlert('error', 'Por favor selecciona una sede para el pago en efectivo.');
      return;
    }

    // Validar que el total sea mayor a 0
    if (totalFinal <= 0) {
      triggerAlert('error', '❌ Error: El total del pedido debe ser mayor a 0. Por favor verifica los productos.');
      console.error('❌ Total inválido:', totalFinal);
      return;
    }

    setProcesandoPedido(true);

    try {
      // Obtener información de la sede
      const sedeInfo = sedes.find(s => s.id === sedeSeleccionada);
      const sedeNombre = sedeInfo?.nombre || sedes[0]?.nombre || 'San Benito';
      
      console.log('🏪 Sede seleccionada:', sedeNombre);
      console.log('💳 Método de pago:', metodoPago);
      console.log('💰 Abono:', abono);
      console.log('💰 Total:', totalFinal);
      console.log('📦 Subtotal Productos:', subtotalProductos);
      console.log('✨ Subtotal Extras:', subtotalExtras);
      
      // Preparar datos de la venta con validación explícita
      const datosPagoInfo = {
        metodo: metodoPago,
        sede: sedeSeleccionada,
        sedeNombre: sedeNombre,
        abono: Number(abono),
        total: Number(totalFinal),
        subtotalProductos: Number(subtotalProductos),
        subtotalExtras: Number(subtotalExtras),
        numeroPedido: numeroPedido,
        comprobante: comprobante
      };

      console.log('📋 Datos de pago antes de preparar venta:', datosPagoInfo);
      
      // Preparar datos de la venta (ahora es async)
      const datosVenta = await prepararDatosVenta(datosPagoInfo);

      console.log('📤 Datos de venta preparados:', datosVenta);
      
      // Validar que datosVenta tenga el total correcto
      if (!datosVenta.total || datosVenta.total <= 0) {
        throw new Error(`Total inválido en datosVenta: ${datosVenta.total}. Usando totalFinal: ${totalFinal}`);
      }

      // PASO 1: Crear la venta
      console.log('📄 Creando venta...');
      const ventaCreada = await ventaApiService.crearVenta(datosVenta);
      console.log('✅ Venta creada exitosamente:', ventaCreada);

      // PASO 2: Crear el abono
      const abonoData = {
        idpedido: ventaCreada.idVenta,
        metodopago: metodoPago,
        cantidadpagar: abono,
        TotalPagado: abono
      };

      console.log('📄 Creando abono con datos:', abonoData);
      const abonoCreado = await ventaApiService.crearAbono(abonoData, comprobante);
      console.log('✅ Abono creado exitosamente:', abonoCreado);

      // PASO 3: Actualizar estado según método de pago
      if (metodoPago === 'efectivo') {
        // Para efectivo, establecer estado "Activa" (ID 5)
        await ventaApiService.actualizarEstadoVenta(ventaCreada.idVenta, 5);
        
        triggerAlert('success', 
          `¡Pedido creado exitosamente!\n` +
          `Número: ${numeroPedido}\n` +
          `Sede: ${sedeNombre}\n` +
          `Dirección: ${sedeInfo?.direccion || 'Ver en la sede'}\n` +
          `Horario: ${sedeInfo?.horario || '9:00 AM - 6:00 PM'}\n` +
          `Valor a pagar: $${abono.toLocaleString()}\n\n` +
          `IMPORTANTE: Presenta este número de pedido al llegar a la sede.`
        );
      } else if (metodoPago === 'transferencia') {
        // Para transferencia, dejar en "En espera" (ID 1) hasta verificar comprobante
        triggerAlert('success', 
          `¡Pedido creado exitosamente!\n` +
          `Número: ${numeroPedido}\n` +
          `Abono registrado: $${abono.toLocaleString()}\n` +
          `Tu pedido quedará pendiente hasta verificar el comprobante de pago.\n` +
          `Te notificaremos cuando sea aprobado.`
        );
      }

      // Guardar datos del pago para referencia
      const datosPago = {
        metodo: metodoPago,
        sede: sedeSeleccionada,
        sedeNombre: sedeNombre,
        abono: abono,
        total: totalFinal,
        numeroPedido: numeroPedido,
        comprobante: comprobante,
        idVenta: ventaCreada.idVenta,
        idAbono: abonoCreado.id || abonoCreado.idabono
      };

      onOpcionSeleccionada(datosPago);
      
      // Esperar 3 segundos y recargar la página para mostrar el nuevo pedido
      setTimeout(() => {
        console.log('🔄 Recargando página...');
        window.location.reload();
      }, 3000);

    } catch (error) {
      console.error('❌ Error al procesar pago:', error);
      
      // Mensajes de error específicos
      let mensajeError = 'Error al crear el pedido';
      
      if (error.message.includes('inventario') || error.message.includes('Inventario')) {
        mensajeError = `Stock insuficiente: ${error.message}`;
      } else if (error.message.includes('INVENTARIO_INSUFICIENTE')) {
        mensajeError = 'No hay suficiente inventario disponible para completar el pedido';
      } else if (error.message.includes('sede')) {
        mensajeError = 'Error con la sede seleccionada. Por favor intenta de nuevo';
      } else {
        mensajeError = error.message || 'Error desconocido al procesar el pedido';
      }
      
      triggerAlert('error', mensajeError);
    } finally {
      setProcesandoPedido(false);
    }
  };

  return (
    <div className="opciones-pago-view">
      {procesandoPedido && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            marginBottom: '2rem',
            animation: 'float 3s ease-in-out infinite'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              border: '8px solid #f3f3f3',
              borderTop: '8px solid #e91e63',
              borderRadius: '50%',
              animation: 'spin 1.5s linear infinite'
            }} />
          </div>
          
          <p style={{
            color: '#e91e63',
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '1rem',
            fontFamily: 'Arial, sans-serif',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            Procesando tu pedido...
          </p>
          
          <p style={{
            color: '#6c757d',
            fontSize: '16px',
            fontWeight: '500',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            Por favor espera mientras confirmamos tu pedido
          </p>
          
          <div style={{
            width: '300px',
            height: '8px',
            backgroundColor: 'rgba(240, 240, 240, 0.8)',
            borderRadius: '20px',
            overflow: 'hidden',
            position: 'relative',
            marginTop: '2rem'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '50%',
              background: 'linear-gradient(90deg, #f48fb1, #ec407a, #ff69b4, #ec407a, #f48fb1)',
              backgroundSize: '200% 100%',
              borderRadius: '20px',
              animation: 'loadingBar 2s ease-in-out infinite, shimmer 3s linear infinite'
            }}/>
          </div>

          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              
              @keyframes loadingBar {
                0% { left: -50%; }
                50% { left: 100%; }
                100% { left: -50%; }
              }
              
              @keyframes shimmer {
                0% { background-position: 0% 0%; }
                100% { background-position: 200% 0%; }
              }
              
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-15px); }
              }
              
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
              }
            `}
          </style>
        </div>
      )}

      {showAlert.show && (
        <div className={`custom-alert ${showAlert.type}`}>
          <span className="alert-icon">
            {showAlert.type === 'success' && '✓'}
            {showAlert.type === 'error' && '✗'}
            {showAlert.type === 'info' && 'i'}
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
          <div style={{
            background: '#fce4ec',
            padding: '12px 20px',
            borderRadius: '12px',
            border: '2px solid #e91e63',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '15px',
            fontSize: '15px',
            boxShadow: '0 2px 8px rgba(233, 30, 99, 0.2)'
          }}>
            <span style={{ fontSize: '20px' }}>ℹ️</span>
            <span style={{ color: '#c2185b', fontWeight: '600' }}>Los productos personalizados requieren un abono del 50% para iniciar la producción</span>
          </div>
        </div>

        <div className="resumen-pago">
          <h3 className="resumen-title">📋 Resumen del Pedido</h3>

          {(() => {
            const productos = obtenerTodosLosProductos();
            
            if (!productos || productos.length === 0) {
              return (
                <div style={{
                  padding: '30px',
                  textAlign: 'center',
                  background: '#fff3cd',
                  borderRadius: '12px',
                  border: '2px dashed #ffc107'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚠️</div>
                  <h4 style={{ color: '#856404', marginBottom: '10px' }}>
                    No se encontraron productos
                  </h4>
                  <p style={{ color: '#856404', fontSize: '14px' }}>
                    Por favor, regresa y agrega productos al carrito
                  </p>
                </div>
              );
            }

            return (
              <>
                <div className="productos-lista">
                  <h4 className="subseccion-title">Productos:</h4>
                  {productos.map((producto, index) => (
                    <div key={index} className="producto-pago-item">
                      <span className="producto-nombre">{producto.nombre}</span>
                      <span className="producto-cantidad">x{producto.cantidad || 1}</span>
                      <span className="producto-precio">${(producto.precio * (producto.cantidad || 1)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Mostrar personalizaciones si existen */}
                {(() => {
                  const tienePersonalizaciones = productos.some(producto => {
                    const personalizacionProducto = personalizacionesProductos[producto.id];
                    if (!personalizacionProducto) return false;
                    
                    return Object.values(personalizacionProducto).some(unidad => 
                      (unidad.toppings?.length > 0) ||
                      (unidad.salsas?.length > 0) ||
                      (unidad.rellenos?.length > 0) ||
                      (unidad.adiciones?.length > 0) ||
                      (unidad.sabores?.length > 0)
                    );
                  });

                  if (!tienePersonalizaciones) return null;

                  return (
                    <div className="extras-section">
                      <h4 className="subseccion-title">🎨 Personalizaciones:</h4>
                      {productos.map(producto => {
                        const personalizacionProducto = personalizacionesProductos[producto.id];
                        if (!personalizacionProducto) return null;

                        const extrasProducto = [];
                        
                        Object.values(personalizacionProducto).forEach(unidad => {
                          ['toppings', 'salsas', 'rellenos', 'adiciones', 'sabores'].forEach(tipo => {
                            if (unidad[tipo]?.length > 0) {
                              unidad[tipo].forEach(item => {
                                const existente = extrasProducto.find(e => e.nombre === item.nombre);
                                if (existente) {
                                  existente.cantidad++;
                                } else {
                                  extrasProducto.push({
                                    nombre: item.nombre,
                                    precio: item.precio || 0,
                                    cantidad: 1
                                  });
                                }
                              });
                            }
                          });
                        });

                        if (extrasProducto.length === 0) return null;

                        return (
                          <div key={producto.id} style={{ marginBottom: '15px' }}>
                            <strong style={{ 
                              display: 'block', 
                              marginBottom: '8px',
                              color: '#495057',
                              fontSize: '14px'
                            }}>
                              {producto.nombre}:
                            </strong>
                            {extrasProducto.map((extra, idx) => (
                              <div key={idx} className="extra-item">
                                <span>
                                  {extra.nombre} {extra.cantidad > 1 && `x${extra.cantidad}`}
                                </span>
                                <span>
                                  {extra.precio > 0 
                                    ? `+$${(extra.precio * extra.cantidad).toLocaleString()}`
                                    : 'Gratis'
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </>
            );
          })()}

          {pedido?.toppings && pedido.toppings.length > 0 && (
            <div className="extras-section">
              <h4 className="subseccion-title">Toppings:</h4>
              {pedido.toppings.map((topping, index) => (
                <div key={index} className="extra-item">
                  <span>{topping.nombre}</span>
                  <span>${(topping.precio || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {pedido?.adiciones && pedido.adiciones.length > 0 && (
            <div className="extras-section">
              <h4 className="subseccion-title">Adiciones:</h4>
              {pedido.adiciones.map((adicion, index) => (
                <div key={index} className="extra-item">
                  <span>{adicion.nombre}</span>
                  <span>${adicion.precio.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {pedido?.salsas && pedido.salsas.length > 0 && (
            <div className="extras-section">
              <h4 className="subseccion-title">Salsas:</h4>
              {pedido.salsas.map((salsa, index) => (
                <div key={index} className="extra-item">
                  <span>{salsa.nombre}</span>
                  <span>${salsa.precio.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          <div className="totales">
            <div className="total-item">
              <span>Subtotal Productos:</span>
              <span>${subtotalProductos.toLocaleString()}</span>
            </div>
            {subtotalExtras > 0 && (
              <div className="total-item">
                <span>Personalizaciones:</span>
                <span>${subtotalExtras.toLocaleString()}</span>
              </div>
            )}
            <div className="total-item total-final">
              <span>Total del Pedido:</span>
              <span>${totalFinal.toLocaleString()}</span>
            </div>
            <div className="total-item abono-destacado">
              <span>💸 Abono requerido (50%):</span>
              <span className="abono-valor">${abono.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="metodos-pago">
          <h3 className="metodos-title">Selecciona tu método de pago</h3>

          <div className="metodos-grid">
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
                    <h5>📝 Datos para transferencia:</h5>
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
                        <span className="error-icon">✗</span>
                        <span>{errorComprobante}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

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
                  
                  {cargandoSedes && (
                    <div className="loading-sedes">
                      <div className="loading-spinner-small"></div>
                      <span>Cargando sedes...</span>
                    </div>
                  )}
                  
                  {errorSedes && (
                    <div className="error-sedes">
                      <span className="error-icon">⚠️</span>
                      <span>{errorSedes}</span>
                    </div>
                  )}
                  
                  {!cargandoSedes && sedes.map(sede => (
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
                        {sede.telefono && (
                          <span className="sede-telefono">📞 {sede.telefono}</span>
                        )}
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
            disabled={
              procesandoPedido ||
              !metodoPago || 
              (metodoPago === 'efectivo' && !sedeSeleccionada) || 
              (metodoPago === 'transferencia' && !comprobante)
            }
          >
            {procesandoPedido ? 'Procesando...' : 'Completar Pedido'}
            <span className="btn-icon">✓</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpcionesPagoView;