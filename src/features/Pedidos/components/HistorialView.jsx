import React, { useState, useEffect } from 'react';
import ventaApiService from '../../Admin/services/venta_services';
import authService from '../../Admin/services/authService';
import productoApiService from '../../Admin/services/productos_services';

const HistorialView = () => {
  const [pedidoExpandido, setPedidoExpandido] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pedidoToAnnull, setPedidoToAnnull] = useState(null);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clienteActual, setClienteActual] = useState(null);
  const [productosDisponibles, setProductosDisponibles] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Obtener catálogo de productos
      const productos = await productoApiService.obtenerProductos();
      setProductosDisponibles(productos);
      console.log('Productos disponibles cargados:', productos);

      // 2. Obtener cliente autenticado
      const perfilCliente = await authService.obtenerDatosClienteLogueado();
      setClienteActual(perfilCliente);
      console.log('Cliente autenticado:', perfilCliente);

      // 3. Obtener todas las ventas
      const todasLasVentas = await ventaApiService.obtenerVentas();
      console.log('Todas las ventas:', todasLasVentas);

      // 4. Filtrar ventas del cliente
      const ventasDelCliente = todasLasVentas.filter(venta => {
        const nombreVenta = venta.nombreCliente?.toLowerCase() || '';
        return nombreVenta.includes(perfilCliente.nombre.toLowerCase()) && 
               nombreVenta.includes(perfilCliente.apellido.toLowerCase());
      });

      console.log(`Ventas del cliente:`, ventasDelCliente);

      // 5. Función auxiliar para obtener nombre de producto (igual que en VentasVerDetalle)
      const getProductName = (idProducto) => {
        const producto = productos.find(p => p.idproductogeneral === idProducto);
        return producto?.nombre || `ID: ${idProducto}`;
      };

      // 6. Transformar ventas a pedidos con detalles completos
      const pedidosTransformados = await Promise.all(
        ventasDelCliente.map(async (venta) => {
          try {
            // Obtener detalle completo (igual que en VentasVerDetalle)
            const detalleCompleto = await ventaApiService.obtenerVentaPorId(venta.idVenta);
            console.log(`Detalle de venta ${venta.idVenta}:`, detalleCompleto);
            
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
              ubicacion: `${perfilCliente.direccion || 'Sin dirección'}, ${perfilCliente.barrio || 'Sin barrio'}`,
              abono: detalleCompleto?.abonos?.reduce((sum, abono) => 
                sum + parseFloat(abono.TotalPagado || abono.monto || 0), 0
              ) || 0,
              total: parseFloat(venta.total || 0),
              metodoPago: venta.metodoPago || 'No especificado',
              tipoVenta: venta.tipoVenta,
              // ✅ USAR detalleVenta directamente como en VentasVerDetalle
              productos: (detalleCompleto?.detalleVenta || []).map(item => ({
                id: item.iddetalleventa,
                // ✅ Usar la función getProductName en lugar de nombreProducto
                nombre: getProductName(item.idproductogeneral),
                cantidad: item.cantidad || 1,
                precio: parseFloat(item.precioUnitario || 0),
                subtotal: parseFloat(item.subtotal || 0),
                // Mapear extras correctamente
                toppings: (item.sabores || []).map(s => s.nombre),
                adicciones: (item.adiciones || []).map(a => a.nombre),
                salsas: (item.salsas || []).map(s => s.nombre)
              })),
              observaciones: venta.tipoVenta === 'pedido' ? 'Pedido programado' : 'Venta directa',
              abonos: (detalleCompleto?.abonos || []).map(abono => ({
                fecha: new Date().toLocaleDateString('es-CO'),
                monto: parseFloat(abono.TotalPagado || abono.monto || 0),
                tipo: abono.metodoPago || abono.metodopago || 'No especificado'
              }))
            };
          } catch (error) {
            console.error(`Error al obtener detalles de venta ${venta.idVenta}:`, error);
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
              ubicacion: 'No disponible',
              abono: 0,
              total: parseFloat(venta.total || 0),
              metodoPago: venta.metodoPago || 'No especificado',
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

  const mapearEstadoVenta = (idEstadoVenta) => {
    const mapeoEstados = {
      1: 'pendiente',
      2: 'enProduccion',
      3: 'entregadoVentas',
      4: 'entregado',
      5: 'abonado',
      6: 'anulado'
    };
    return mapeoEstados[idEstadoVenta] || 'pendiente';
  };

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  const toggleDetalles = (pedidoId) => {
    setPedidoExpandido(pedidoExpandido === pedidoId ? null : pedidoId);
  };

  const handleAnularPedidoClick = (pedidoId) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (pedido && ['pendiente', 'abonado'].includes(pedido.estado)) {
      setPedidoToAnnull(pedidoId);
      setShowConfirmModal(true);
    } else {
      showCustomAlert('error', 'Este pedido no se puede anular en su estado actual');
    }
  };

  const confirmAnularPedido = async () => {
    try {
      const pedido = pedidos.find(p => p.id === pedidoToAnnull);
      if (pedido) {
        await ventaApiService.anularVenta(pedido.idVenta);
        setPedidos(prevPedidos => 
          prevPedidos.map(p => 
            p.id === pedidoToAnnull ? { ...p, estado: 'anulado' } : p
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

  const cancelAnularPedido = () => {
    setShowConfirmModal(false);
    setPedidoToAnnull(null);
    showCustomAlert('info', 'Anulación de pedido cancelada.');
  };

  const estadosDisponibles = {
    pendiente: { color: '#ffc107', label: 'Pendiente' },
    abonado: { color: '#6f42c1', label: 'Abonado' },
    enProduccion: { color: '#007bff', label: 'En producción' },
    entregadoVentas: { color: '#17a2b8', label: 'Por entregar' },
    anulado: { color: '#dc3545', label: 'Anulado' },
    entregado: { color: '#9b9b9b', label: 'Entregado' }
  };

  const pedidosFiltrados = filtroEstado === 'todos' 
    ? pedidos 
    : pedidos.filter(pedido => pedido.estado === filtroEstado);

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
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
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
      {showAlert.show && (
        <div style={{
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
          background: showAlert.type === 'success'
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : showAlert.type === 'error'
            ? 'linear-gradient(135deg, #ec4899, #be185d)'
            : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}>
          {showAlert.message}
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
              Bienvenido/a {clienteActual.nombre}
            </p>
          )}
        </div>

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
                  transition: 'all 0.3s ease'
                }}
              >
                {estado.label} ({count})
              </button>
            );
          })}
        </div>

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
              <h3 style={{ color: '#6c757d' }}>
                {filtroEstado === 'todos' ? 'No tienes pedidos aún' : 'No hay pedidos con este estado'}
              </h3>
            </div>
          ) : (
            pedidosFiltrados.map((pedido) => (
              <div key={pedido.id} style={{
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                border: '2px solid #f8f9fa',
                overflow: 'hidden'
              }}>
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
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#495057', margin: '0 0 5px 0' }}>
                        Pedido {pedido.id}
                      </h3>
                      <p style={{ color: '#6c757d', fontSize: '14px', margin: '0' }}>
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
                      <span style={{
                        color: estadosDisponibles[pedido.estado].color,
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        {estadosDisponibles[pedido.estado].label}
                      </span>
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
                        fontWeight: '600'
                      }}
                    >
                      {pedidoExpandido === pedido.id ? 'Ocultar' : 'Ver Detalles'}
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
                          fontWeight: '600'
                        }}
                      >
                        Anular
                      </button>
                    )}
                  </div>
                </div>

                {pedidoExpandido === pedido.id && (
                  <div style={{ padding: '20px', background: '#f8f9fa' }}>
                    {pedido.productos && pedido.productos.length > 0 && (
                      <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '20px'
                      }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
                          🍽️ Productos
                        </h4>
                        {pedido.productos.map((producto, idx) => (
                          <div key={idx} style={{
                            padding: '15px',
                            background: '#f8f9fa',
                            borderRadius: '10px',
                            marginBottom: '10px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                              <h5 style={{ margin: 0 }}>{producto.nombre}</h5>
                              <div>
                                <div>Cantidad: {producto.cantidad}</div>
                                <div style={{ color: '#e91e63', fontWeight: '600' }}>
                                  ${producto.precio.toLocaleString()}
                                </div>
                              </div>
                            </div>
                            {producto.toppings?.length > 0 && (
                              <div style={{ marginTop: '10px' }}>
                                <strong>Toppings:</strong> {producto.toppings.join(', ')}
                              </div>
                            )}
                            {producto.adicciones?.length > 0 && (
                              <div style={{ marginTop: '5px' }}>
                                <strong>Adiciones:</strong> {producto.adicciones.join(', ')}
                              </div>
                            )}
                            {producto.salsas?.length > 0 && (
                              <div style={{ marginTop: '5px' }}>
                                <strong>Salsas:</strong> {producto.salsas.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

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
            maxWidth: '450px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div>
            <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>¿Anular Pedido?</h3>
            <p style={{ marginBottom: '30px' }}>
              ¿Seguro que quieres anular el pedido {pedidoToAnnull}?
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={cancelAnularPedido}
                style={{
                  padding: '12px 25px',
                  border: '2px solid #6c757d',
                  borderRadius: '10px',
                  background: 'white',
                  cursor: 'pointer'
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
                  background: '#dc3545',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Sí, Anular
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialView;