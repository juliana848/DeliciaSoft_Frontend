import React, { useState, useEffect } from 'react';
import ventaApiService from '../../Admin/services/venta_services';
import clienteApiService from '../../Admin/services/cliente_services';
import authService from '../../Admin/services/authService';

const HistorialView = () => {
  // Estado para controlar qué pedido está expandido
  const [pedidoExpandido, setPedidoExpandido] = useState(null);
  
  // Estados de modales y alertas
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pedidoToAnnull, setPedidoToAnnull] = useState(null);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });

  // Estados principales
  const [pedidos, setPedidos] = useState([]);
  const [estados, setEstados] = useState({});
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clienteActual, setClienteActual] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Obtener el perfil del cliente autenticado
      const perfilCliente = await authService.obtenerDatosClienteLogueado();
      setClienteActual(perfilCliente);
      console.log('Cliente autenticado:', perfilCliente);

      // 2. Obtener estados de venta para el mapeo
      const estadosAPI = await ventaApiService.obtenerEstadosVenta();
      const estadosMap = estadosAPI.reduce((acc, estado) => {
        acc[estado.idestadoventa] = {
          color: obtenerColorEstado(estado.idestadoventa),
          label: estado.nombre_estado
        };
        return acc;
      }, {});
      setEstados(estadosMap);
      console.log('Estados cargados:', estadosMap);

      // 3. Obtener todas las ventas
      const todasLasVentas = await ventaApiService.obtenerVentas();
      console.log('Todas las ventas obtenidas:', todasLasVentas);

      // 4. Filtrar solo las ventas del cliente autenticado
      const ventasDelCliente = todasLasVentas.filter(venta => {
        // Comparar por nombre completo o ID si está disponible
        const nombreVenta = venta.nombreCliente?.toLowerCase() || '';
        const nombreCompleto = `${perfilCliente.nombre} ${perfilCliente.apellido}`.toLowerCase();
        return nombreVenta.includes(perfilCliente.nombre.toLowerCase()) && 
               nombreVenta.includes(perfilCliente.apellido.toLowerCase());
      });

      console.log(`Ventas del cliente ${perfilCliente.nombre}:`, ventasDelCliente);

      // 5. Transformar ventas a formato de pedidos
      const pedidosTransformados = await Promise.all(
        ventasDelCliente.map(async (venta) => {
          try {
            // Obtener detalles completos de cada venta
            const detalleCompleto = await ventaApiService.obtenerVentaPorId(venta.idVenta);
            
            return {
              id: `P${venta.idVenta.toString().padStart(3, '0')}`,
              idVenta: venta.idVenta,
              fecha: new Date(venta.fechaVenta).toLocaleDateString('es-CO'),
              hora: new Date(venta.fechaVenta).toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              estado: mapearEstadoVenta(venta.idEstadoVenta),
              cliente: venta.nombreCliente,
              telefono: perfilCliente.celular || 'No registrado',
              ubicacion: `${perfilCliente.direccion}, ${perfilCliente.barrio}` || 'No registrada',
              abono: detalleCompleto?.abonos?.reduce((sum, abono) => sum + abono.TotalPagado, 0) || 0,
              total: venta.total,
              metodoPago: venta.metodoPago,
              tipoVenta: venta.tipoVenta,
              productos: detalleCompleto?.detalleVenta?.map(item => ({
                id: item.iddetalleventa,
                nombre: item.nombreProducto,
                cantidad: item.cantidad,
                precio: item.precioUnitario,
                subtotal: item.subtotal,
                toppings: item.sabores?.map(sabor => sabor.nombre) || [],
                adicciones: item.adiciones?.map(adicion => adicion.nombre) || [],
                salsas: item.salsas?.map(salsa => salsa.nombre) || []
              })) || [],
              observaciones: venta.tipoVenta === 'pedido' ? 'Pedido programado' : 'Venta directa',
              abonos: detalleCompleto?.abonos?.map(abono => ({
                fecha: new Date().toLocaleDateString('es-CO'),
                monto: abono.TotalPagado,
                tipo: abono.metodoPago
              })) || []
            };
          } catch (error) {
            console.error(`Error al obtener detalles de venta ${venta.idVenta}:`, error);
            // Retornar versión básica si falla el detalle
            return {
              id: `P${venta.idVenta.toString().padStart(3, '0')}`,
              idVenta: venta.idVenta,
              fecha: new Date(venta.fechaVenta).toLocaleDateString('es-CO'),
              hora: new Date(venta.fechaVenta).toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              estado: mapearEstadoVenta(venta.idEstadoVenta),
              cliente: venta.nombreCliente,
              telefono: perfilCliente.celular || 'No registrado',
              ubicacion: `${perfilCliente.direccion}, ${perfilCliente.barrio}` || 'No registrada',
              abono: 0,
              total: venta.total,
              metodoPago: venta.metodoPago,
              tipoVenta: venta.tipoVenta,
              productos: [],
              observaciones: 'Error al cargar detalles',
              abonos: []
            };
          }
        })
      );

      setPedidos(pedidosTransformados);
      console.log('Pedidos transformados:', pedidosTransformados);

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError(`Error al cargar el historial: ${error.message}`);
      showCustomAlert('error', 'Error al cargar el historial de pedidos');
    } finally {
      setLoading(false);
    }
  };

  // Función para mapear estados de venta a estados de pedido
  const mapearEstadoVenta = (idEstadoVenta) => {
    const mapeoEstados = {
      1: 'pendiente',     // En espera
      2: 'enProduccion',  // En producción
      3: 'entregadoVentas', // Por entregar
      4: 'entregado',     // Finalizado
      5: 'abonado',       // Activa (consideramos como abonado)
      6: 'anulado'        // Anulada
    };
    return mapeoEstados[idEstadoVenta] || 'pendiente';
  };

  // Función para obtener colores de estado
  const obtenerColorEstado = (idEstado) => {
    const colores = {
      1: '#ffc107', // En espera - amarillo
      2: '#007bff', // En producción - azul
      3: '#17a2b8', // Por entregar - cyan
      4: '#9b9b9b', // Finalizado - gris
      5: '#6f42c1', // Activa - púrpura
      6: '#dc3545'  // Anulada - rojo
    };
    return colores[idEstado] || '#6c757d';
  };

  // Función para mostrar alertas
  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  // Función para alternar expansión de detalles
  const toggleDetalles = (pedidoId) => {
    setPedidoExpandido(pedidoExpandido === pedidoId ? null : pedidoId);
  };

  // Función para manejar anulación de pedido
  const handleAnularPedidoClick = (pedidoId) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (pedido && ['pendiente', 'abonado'].includes(pedido.estado)) {
      setPedidoToAnnull(pedidoId);
      setShowConfirmModal(true);
    } else {
      showCustomAlert('error', 'Este pedido no se puede anular en su estado actual');
    }
  };

  // Función para confirmar anulación
  const confirmAnularPedido = async () => {
    try {
      const pedido = pedidos.find(p => p.id === pedidoToAnnull);
      if (pedido) {
        await ventaApiService.anularVenta(pedido.idVenta);
        
        // Actualizar estado local
        setPedidos(prevPedidos => 
          prevPedidos.map(p => 
            p.id === pedidoToAnnull
              ? { ...p, estado: 'anulado' }
              : p
          )
        );
        
        showCustomAlert('success', `Pedido ${pedidoToAnnull} anulado exitosamente.`);
      }
    } catch (error) {
      console.error('Error al anular pedido:', error);
      showCustomAlert('error', 'Error al anular el pedido. Intente nuevamente.');
    } finally {
      setShowConfirmModal(false);
      setPedidoToAnnull(null);
    }
  };

  // Función para cancelar anulación
  const cancelAnularPedido = () => {
    setShowConfirmModal(false);
    setPedidoToAnnull(null);
    showCustomAlert('info', 'Anulación de pedido cancelada.');
  };

  // Filtrar pedidos
  const pedidosFiltrados = filtroEstado === 'todos' 
    ? pedidos 
    : pedidos.filter(pedido => pedido.estado === filtroEstado);

  // Estados disponibles para filtros
  const estadosDisponibles = {
    pendiente: { color: '#ffc107', label: 'Pendiente' },
    abonado: { color: '#6f42c1', label: 'Abonado' },
    enProduccion: { color: '#007bff', label: 'En producción' },
    entregadoVentas: { color: '#17a2b8', label: 'Por entregar' },
    anulado: { color: '#dc3545', label: 'Anulado' },
    entregado: { color: '#9b9b9b', label: 'Entregado' }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '400px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'white',
        borderRadius: '15px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '20px',
            animation: 'spin 2s linear infinite'
          }}>⏳</div>
          <p style={{ color: '#6c757d' }}>Cargando tu historial de pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
        <h3 style={{ color: '#dc3545', marginBottom: '10px' }}>Error al cargar datos</h3>
        <p style={{ color: '#6c757d', marginBottom: '20px' }}>{error}</p>
        <button
          onClick={cargarDatos}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '10px',
            background: '#e91e63',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      padding: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Alerta personalizada */}
      {showAlert.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 2000,
            padding: '1rem 1.5rem',
            borderRadius: '15px',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.9rem',
            minWidth: '300px',
            background:
              showAlert.type === 'success'
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : showAlert.type === 'error'
                ? 'linear-gradient(135deg, #ec4899, #be185d)'
                : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}
        >
          {showAlert.message}
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            background: 'linear-gradient(45deg, #e91e63, #f06292)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px'
          }}>
            Mi Historial de Pedidos
          </h1>
          {clienteActual && (
            <p style={{ color: '#6c757d', fontSize: '16px' }}>
              Bienvenido/a {clienteActual.nombre} - Aquí puedes ver todos tus pedidos
            </p>
          )}
        </div>

        {/* Filtros */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: '600', color: '#495057', marginRight: '10px' }}>
            Filtrar por estado:
          </span>
          <button
            onClick={() => setFiltroEstado('todos')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '20px',
              background: filtroEstado === 'todos' ? '#e91e63' : '#f8f9fa',
              color: filtroEstado === 'todos' ? 'white' : '#6c757d',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            Todos ({pedidos.length})
          </button>
          {Object.entries(estadosDisponibles).map(([key, estado]) => {
            const count = pedidos.filter(p => p.estado === key).length;
            return (
              <button
                key={key}
                onClick={() => setFiltroEstado(key)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '20px',
                  background: filtroEstado === key ? estado.color : '#f8f9fa',
                  color: filtroEstado === key ? 'white' : '#6c757d',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: estado.color
                }}></div>
                {estado.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Lista de Pedidos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {pedidosFiltrados.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
              <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>
                {filtroEstado === 'todos' ? 'No tienes pedidos aún' : 'No hay pedidos con este estado'}
              </h3>
              <p style={{ color: '#adb5bd' }}>
                {filtroEstado === 'todos' 
                  ? '¡Realiza tu primer pedido y aparecerá aquí!'
                  : 'No se encontraron pedidos con el filtro seleccionado'
                }
              </p>
            </div>
          ) : (
            pedidosFiltrados.map((pedido) => (
              <div key={pedido.id} style={{
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                border: '2px solid #f8f9fa',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}>
                {/* Header del pedido */}
                <div style={{
                  padding: '20px',
                  borderBottom: '1px solid #f8f9fa',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '15px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: '700', 
                        color: '#495057',
                        margin: '0 0 5px 0'
                      }}>
                        Pedido {pedido.id}
                      </h3>
                      <p style={{ 
                        color: '#6c757d', 
                        fontSize: '14px',
                        margin: '0'
                      }}>
                        {pedido.fecha} • {pedido.hora}
                      </p>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      background: `${estadosDisponibles[pedido.estado].color}15`,
                      border: `2px solid ${estadosDisponibles[pedido.estado].color}30`
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: estadosDisponibles[pedido.estado].color
                      }}></div>
                      <span style={{
                        color: estadosDisponibles[pedido.estado].color,
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        {estadosDisponibles[pedido.estado].label}
                      </span>
                    </div>

                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      background: pedido.tipoVenta === 'pedido' ? '#e3f2fd' : '#f3e5f5',
                      color: pedido.tipoVenta === 'pedido' ? '#1976d2' : '#7b1fa2',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {pedido.tipoVenta === 'pedido' ? '🛍️ Pedido' : '🏪 Venta directa'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ textAlign: 'right', marginRight: '10px' }}>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>Total</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#e91e63' }}>
                        ${pedido.total.toLocaleString()}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleDetalles(pedido.id)}
                      style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '10px',
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {pedidoExpandido === pedido.id ? 'Ocultar Detalles' : 'Ver Detalles'}
                    </button>
                    
                    {['pendiente', 'abonado'].includes(pedido.estado) && (
                      <button
                        onClick={() => handleAnularPedidoClick(pedido.id)}
                        style={{
                          padding: '10px 20px',
                          border: 'none',
                          borderRadius: '10px',
                          background: 'linear-gradient(45deg, #dc3545, #e85a67)',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Anular Pedido
                      </button>
                    )}
                  </div>
                </div>

                {/* Detalles del pedido */}
                {pedidoExpandido === pedido.id && (
                  <div style={{ padding: '20px', background: '#f8f9fa' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '20px',
                      marginBottom: '25px'
                    }}>
                      {/* Información del cliente */}
                      <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #dee2e6'
                      }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#495057',
                          marginBottom: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          👤 Información de Entrega
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div><strong>Cliente:</strong> {pedido.cliente}</div>
                          <div><strong>Teléfono:</strong> {pedido.telefono}</div>
                          <div><strong>Ubicación:</strong> {pedido.ubicacion}</div>
                          <div><strong>Método de pago:</strong> {pedido.metodoPago}</div>
                        </div>
                      </div>

                      {/* Información financiera */}
                      <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #dee2e6'
                      }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#495057',
                          marginBottom: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          💰 Información de Pago
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Total:</span>
                            <strong>${pedido.total.toLocaleString()}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Abono:</span>
                            <strong style={{ color: pedido.abono > 0 ? '#28a745' : '#dc3545' }}>
                              ${pedido.abono.toLocaleString()}
                            </strong>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            paddingTop: '8px',
                            borderTop: '1px solid #dee2e6'
                          }}>
                            <span><strong>Pendiente:</strong></span>
                            <strong style={{ color: '#e91e63' }}>
                              ${(pedido.total - pedido.abono).toLocaleString()}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Productos */}
                    {pedido.productos && pedido.productos.length > 0 && (
                      <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #dee2e6'
                      }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#495057',
                          marginBottom: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          🍽️ Productos del Pedido
                        </h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          {pedido.productos.map((producto, index) => (
                            <div key={producto.id || index} style={{
                              padding: '15px',
                              background: '#f8f9fa',
                              borderRadius: '10px',
                              border: '1px solid #e9ecef'
                            }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '10px'
                              }}>
                                <h5 style={{
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  color: '#495057',
                                  margin: '0'
                                }}>
                                  {producto.nombre}
                                </h5>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                    Cantidad: {producto.cantidad}
                                  </div>
                                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#e91e63' }}>
                                    ${producto.precio.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              
                              {producto.toppings && producto.toppings.length > 0 && (
                                <div style={{ marginBottom: '8px' }}>
                                  <strong style={{ fontSize: '14px', color: '#495057' }}>
                                    🧄 Sabores:
                                  </strong>
                                  <div style={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    gap: '5px',
                                    marginTop: '5px'
                                  }}>
                                    {producto.toppings.map((topping, index) => (
                                      <span key={index} style={{
                                        padding: '4px 8px',
                                        background: '#e91e63',
                                        color: 'white',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                      }}>
                                        {topping}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {producto.adicciones && producto.adicciones.length > 0 && (
                                <div style={{ marginBottom: '8px' }}>
                                  <strong style={{ fontSize: '14px', color: '#495057' }}>
                                    ➕ Adiciones:
                                  </strong>
                                  <div style={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    gap: '5px',
                                    marginTop: '5px'
                                  }}>
                                    {producto.adicciones.map((adicion, index) => (
                                      <span key={index} style={{
                                        padding: '4px 8px',
                                        background: '#17a2b8',
                                        color: 'white',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                      }}>
                                        {adicion}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {producto.salsas && producto.salsas.length > 0 && (
                                <div>
                                  <strong style={{ fontSize: '14px', color: '#495057' }}>
                                    🌶️ Salsas:
                                  </strong>
                                  <div style={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    gap: '5px',
                                    marginTop: '5px'
                                  }}>
                                    {producto.salsas.map((salsa, index) => (
                                      <span key={index} style={{
                                        padding: '4px 8px',
                                        background: '#fd7e14',
                                        color: 'white',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                      }}>
                                        {salsa}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Abonos realizados */}
                    {pedido.abonos && pedido.abonos.length > 0 && (
                      <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #dee2e6',
                        marginTop: '20px'
                      }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#495057',
                          marginBottom: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          💳 Historial de Pagos
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {pedido.abonos.map((abono, index) => (
                            <div key={index} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '10px',
                              background: '#f8f9fa',
                              borderRadius: '8px',
                              border: '1px solid #e9ecef'
                            }}>
                              <div>
                                <div style={{ fontWeight: '500', fontSize: '14px' }}>
                                  {abono.tipo}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                  {abono.fecha}
                                </div>
                              </div>
                              <div style={{ 
                                fontWeight: '600', 
                                color: '#28a745',
                                fontSize: '16px'
                              }}>
                                ${abono.monto.toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Observaciones */}
                    {pedido.observaciones && (
                      <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #dee2e6',
                        marginTop: '20px'
                      }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#495057',
                          marginBottom: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          📝 Observaciones
                        </h4>
                        <p style={{ 
                          color: '#6c757d',
                          margin: '0',
                          fontSize: '14px',
                          fontStyle: 'italic'
                        }}>
                          {pedido.observaciones}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            width: '90%',
            maxWidth: '450px',
            boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
            textAlign: 'center',
            animation: 'fadeInUp 0.3s ease-out',
            position: 'relative'
          }}>
            <button
              onClick={cancelAnularPedido}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#adb5bd'
              }}
            >
              &times;
            </button>
            <div style={{ fontSize: '60px', marginBottom: '20px', lineHeight: '1' }}>
              ⚠️
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#495057',
              marginBottom: '15px'
            }}>
              ¿Anular Pedido?
            </h3>
            <p style={{
              color: '#6c757d',
              fontSize: '16px',
              marginBottom: '30px'
            }}>
              Estás a punto de anular el pedido <strong style={{color: '#e91e63'}}>{pedidoToAnnull}</strong>. Esta acción no se puede deshacer.
              ¿Estás seguro de que quieres continuar?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button
                onClick={cancelAnularPedido}
                style={{
                  padding: '12px 25px',
                  border: '2px solid #6c757d',
                  borderRadius: '10px',
                  background: 'white',
                  color: '#6c757d',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmAnularPedido}
                style={{
                  padding: '12px 25px',
                  border: 'none',
                  borderRadius: '10px',
                  background: 'linear-gradient(45deg, #dc3545, #e85a67)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 10px rgba(220, 53, 69, 0.3)'
                }}
              >
                Sí, Anular
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 100%, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translate3d(100%, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default HistorialView;