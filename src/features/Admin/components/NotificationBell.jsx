import React, { useState, useEffect } from 'react';
import { Bell, X, Package, ShoppingCart, AlertCircle, Factory } from 'lucide-react';

export default function NotificationBell({ insumos = [], pedidos = [] }) {
  const [abierto, setAbierto] = useState(false);
  const [insumosCriticos, setInsumosCriticos] = useState([]);
  const [pedidosPorVencer, setPedidosPorVencer] = useState([]);
  const [pedidosPorEntregar, setPedidosPorEntregar] = useState([]);
  const [pestanaActiva, setPestanaActiva] = useState('insumos');
  const [animarCampana, setAnimarCampana] = useState(false);

  useEffect(() => {
    // Calcular insumos CRÍTICOS (cantidad = 0 - agotados)
    const criticos = insumos.filter(insumo => {
      const cantidad = parseFloat(insumo.cantidad) || 0;
      return cantidad <= 0 && insumo.estado;
    });
    setInsumosCriticos(criticos);

    console.log('🔔 Analizando pedidos para notificaciones:', pedidos);

    // Calcular pedidos que vencen en 5 días o menos O están atrasados
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const pedidosProximos = pedidos.filter(pedido => {
      // Verificar que tenga fecha de entrega
      if (!pedido.fechaEntrega) {
        return false;
      }

      // EXCLUIR pedidos completados, finalizados, entregados, cancelados o anulados
      const estadosExcluidos = ['entregado', 'completado', 'cancelado', 'anulado', 'finalizado'];
      const estadoVenta = (pedido.nombreEstado || '').toLowerCase();
      const estadoId = pedido.idEstadoVenta || pedido.estadoVentaId;
      
      // IDs de estados a EXCLUIR:
      // 4 = Finalizado (ya se entregó)
      // 5 = Activa (venta directa, no es pedido)
      // 6 = Anulada
      if (estadosExcluidos.includes(estadoVenta) || estadoId === 4 || estadoId === 5 || estadoId === 6) {
        console.log(`⏭️ Pedido ${pedido.idpedido || pedido.idVenta} excluido - Estado: ${estadoVenta} (ID: ${estadoId})`);
        return false;
      }

      // SOLO incluir pedidos tipo "pedido", no ventas directas
      if (pedido.tipoVenta === 'directa' || pedido.tipoVenta === 'venta directa') {
        console.log(`⏭️ Venta directa ${pedido.idpedido || pedido.idVenta} excluida`);
        return false;
      }
      
      const fechaEntrega = new Date(pedido.fechaEntrega);
      fechaEntrega.setHours(0, 0, 0, 0);
      
      const diferenciaDias = Math.ceil((fechaEntrega - hoy) / (1000 * 60 * 60 * 24));
      
      console.log(`📅 Pedido ${pedido.idpedido || pedido.idVenta}:`, {
        fechaEntrega: pedido.fechaEntrega,
        diferenciaDias,
        estadoVenta,
        estadoId,
        tipoVenta: pedido.tipoVenta
      });
      
      // Incluir pedidos próximos (0-5 días) o atrasados (hasta 30 días atrás)
      return diferenciaDias >= -30 && diferenciaDias <= 5;
    });
    
    console.log('📋 Pedidos próximos/atrasados:', pedidosProximos.length);
    setPedidosPorVencer(pedidosProximos);

    // NUEVO: Calcular pedidos en estado "Por Entregar" (ID 3)
    const pedidosEntregar = pedidos.filter(pedido => {
      // Verificar si el pedido está en estado "Por Entregar" (ID 3)
      const esPorEntregar = pedido.idEstadoVenta === 3 || pedido.estadoVentaId === 3;
      
      if (!esPorEntregar) {
        return false;
      }

      // EXCLUIR si es venta directa
      if (pedido.tipoVenta === 'directa' || pedido.tipoVenta === 'venta directa') {
        console.log(`⏭️ Venta directa "Por Entregar" ${pedido.idpedido || pedido.idVenta} excluida`);
        return false;
      }

      if (!pedido.fechaEntrega) {
        console.log(`⚠️ Pedido ${pedido.idpedido || pedido.idVenta} "Por Entregar" sin fecha de entrega`);
        return true; // Incluir de todas formas si está en estado "Por Entregar"
      }

      const fechaEntrega = new Date(pedido.fechaEntrega);
      fechaEntrega.setHours(0, 0, 0, 0);
      
      const diferenciaDias = Math.ceil((fechaEntrega - hoy) / (1000 * 60 * 60 * 24));
      
      console.log(`📦 Pedido "Por Entregar" ${pedido.idpedido || pedido.idVenta}:`, {
        fechaEntrega: pedido.fechaEntrega,
        diferenciaDias,
        hoy: hoy.toISOString(),
        incluir: diferenciaDias <= 7
      });
      
      // Mostrar pedidos "Por Entregar" que vencen en 7 días o menos, o están atrasados
      return diferenciaDias <= 7;
    });
    
    console.log('🚚 Pedidos "Por Entregar":', pedidosEntregar.length);
    setPedidosPorEntregar(pedidosEntregar);

    // Animar campana si hay notificaciones
    if (criticos.length > 0 || pedidosProximos.length > 0 || pedidosEntregar.length > 0) {
      setAnimarCampana(true);
      const timer = setTimeout(() => setAnimarCampana(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [insumos, pedidos]);

  const tieneNotificaciones = insumosCriticos.length > 0 || pedidosPorVencer.length > 0 || pedidosPorEntregar.length > 0;
  const totalNotificaciones = insumosCriticos.length + pedidosPorVencer.length + pedidosPorEntregar.length;

  const calcularDiasRestantes = (fechaEntrega) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fecha = new Date(fechaEntrega);
    fecha.setHours(0, 0, 0, 0);
    const diferencia = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
    return diferencia;
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Combinar todos los pedidos (próximos y por entregar) sin duplicados
  const todosPedidos = [...pedidosPorVencer, ...pedidosPorEntregar]
    .filter((pedido, index, self) => 
      index === self.findIndex(p => 
        (p.idpedido && p.idpedido === pedido.idpedido) || 
        (p.idVenta && p.idVenta === pedido.idVenta)
      )
    )
    .sort((a, b) => {
      const fechaA = new Date(a.fechaEntrega);
      const fechaB = new Date(b.fechaEntrega);
      return fechaA - fechaB;
    });

  return (
    <>
      <div style={{ position: 'relative' }}>
        {/* Botón campanita */}
        <button
          onClick={() => setAbierto(!abierto)}
          className={animarCampana ? 'bell-shake' : ''}
          style={{
            background: abierto 
              ? 'linear-gradient(135deg, #ff69b4, #ff1493)' 
              : 'linear-gradient(135deg, #ffffff, #fef7ff)',
            border: '2px solid #ff69b4',
            cursor: 'pointer',
            position: 'relative',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.3s ease',
            width: '44px',
            height: '44px',
            boxShadow: abierto 
              ? '0 6px 20px rgba(255, 105, 180, 0.4)' 
              : '0 4px 15px rgba(255, 105, 180, 0.2)'
          }}
          onMouseEnter={(e) => {
            if (!abierto) {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 105, 180, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!abierto) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 105, 180, 0.2)';
            }
          }}
          title="Notificaciones"
        >
          <Bell 
            size={22} 
            color={abierto ? 'white' : '#ff69b4'} 
            strokeWidth={2.5}
          />
          
          {/* Badge de notificaciones */}
          {tieneNotificaciones && (
            <div
              className="notification-badge"
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 'bold',
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                animation: 'pulse-badge 2s infinite'
              }}
            >
              {totalNotificaciones > 9 ? '9+' : totalNotificaciones}
            </div>
          )}
        </button>

        {/* Panel de notificaciones */}
        {abierto && (
          <div
            className="notification-panel"
            style={{
              position: 'absolute',
              top: '55px',
              right: '0',
              width: '400px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 12px 48px rgba(255, 105, 180, 0.25)',
              zIndex: 10001,
              maxHeight: '550px',
              display: 'flex',
              flexDirection: 'column',
              border: '2px solid #ff69b4',
              overflow: 'hidden',
              animation: 'slideDown 0.3s ease-out'
            }}
          >
            {/* Encabezado */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 20px',
                borderBottom: '2px solid #ffe4f0',
                background: 'linear-gradient(135deg, #fff5fb, #ffffff)'
              }}
            >
              <div>
                <h3 style={{ 
                  margin: '0', 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  color: '#ff1493',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Bell size={20} />
                  Notificaciones
                </h3>
                <p style={{ 
                  margin: '4px 0 0 0', 
                  fontSize: '13px', 
                  color: '#9ca3af',
                  fontWeight: '500'
                }}>
                  {tieneNotificaciones 
                    ? `${totalNotificaciones} alerta${totalNotificaciones > 1 ? 's' : ''} activa${totalNotificaciones > 1 ? 's' : ''}` 
                    : 'Todo bajo control ✨'}
                </p>
              </div>
              <button
                onClick={() => setAbierto(false)}
                style={{
                  background: 'linear-gradient(135deg, #ff69b4, #ff1493)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  borderRadius: '50%',
                  transition: 'all 0.2s',
                  width: '32px',
                  height: '32px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ff1493, #dc143c)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ff69b4, #ff1493)';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Pestañas */}
            <div
              style={{
                display: 'flex',
                borderBottom: '2px solid #ffe4f0',
                background: 'linear-gradient(135deg, #fff5fb, #ffffff)',
                padding: '0'
              }}
            >
              <button
                onClick={() => setPestanaActiva('insumos')}
                style={{
                  flex: 1,
                  padding: '14px 12px',
                  border: 'none',
                  backgroundColor: pestanaActiva === 'insumos' ? 'white' : 'transparent',
                  borderBottom: pestanaActiva === 'insumos' ? '3px solid #ff69b4' : 'none',
                  color: pestanaActiva === 'insumos' ? '#ff1493' : '#9ca3af',
                  fontWeight: pestanaActiva === 'insumos' ? '700' : '600',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  if (pestanaActiva !== 'insumos') {
                    e.currentTarget.style.backgroundColor = '#fff5fb';
                    e.currentTarget.style.color = '#ff69b4';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pestanaActiva !== 'insumos') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#9ca3af';
                  }
                }}
              >
                <Package size={15} />
                Insumos
                {insumosCriticos.length > 0 && (
                  <span style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    {insumosCriticos.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setPestanaActiva('pedidos')}
                style={{
                  flex: 1,
                  padding: '14px 12px',
                  border: 'none',
                  backgroundColor: pestanaActiva === 'pedidos' ? 'white' : 'transparent',
                  borderBottom: pestanaActiva === 'pedidos' ? '3px solid #ff69b4' : 'none',
                  color: pestanaActiva === 'pedidos' ? '#ff1493' : '#9ca3af',
                  fontWeight: pestanaActiva === 'pedidos' ? '700' : '600',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  if (pestanaActiva !== 'pedidos') {
                    e.currentTarget.style.backgroundColor = '#fff5fb';
                    e.currentTarget.style.color = '#ff69b4';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pestanaActiva !== 'pedidos') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#9ca3af';
                  }
                }}
              >
                <ShoppingCart size={15} />
                Pedidos
                {todosPedidos.length > 0 && (
                  <span style={{
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    {todosPedidos.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setPestanaActiva('produccion')}
                style={{
                  flex: 1,
                  padding: '14px 12px',
                  border: 'none',
                  backgroundColor: pestanaActiva === 'produccion' ? 'white' : 'transparent',
                  borderBottom: pestanaActiva === 'produccion' ? '3px solid #ff69b4' : 'none',
                  color: pestanaActiva === 'produccion' ? '#ff1493' : '#9ca3af',
                  fontWeight: pestanaActiva === 'produccion' ? '700' : '600',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  if (pestanaActiva !== 'produccion') {
                    e.currentTarget.style.backgroundColor = '#fff5fb';
                    e.currentTarget.style.color = '#ff69b4';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pestanaActiva !== 'produccion') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#9ca3af';
                  }
                }}
              >
                <Factory size={15} />
                Producción
              </button>
            </div>

            {/* Contenido */}
            <div
              style={{
                overflowY: 'auto',
                maxHeight: '420px',
                flex: 1,
                background: 'linear-gradient(to bottom, #ffffff, #fef7ff)'
              }}
            >
              {pestanaActiva === 'insumos' ? (
                insumosCriticos.length > 0 ? (
                  <div style={{ padding: '14px' }}>
                    {insumosCriticos.map((insumo, index) => (
                      <div
                        key={index}
                        className="notification-card"
                        style={{
                          padding: '14px',
                          background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                          borderLeft: '4px solid #ef4444',
                          borderRadius: '12px',
                          marginBottom: '10px',
                          fontSize: '13px',
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)',
                          transition: 'all 0.2s',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateX(4px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.25)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.15)';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '10px' }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ 
                              margin: '0 0 6px 0', 
                              fontWeight: '700', 
                              color: '#7f1d1d',
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <AlertCircle size={16} />
                              {insumo.nombreInsumo || insumo.nombreinsumo}
                            </p>
                            <p style={{ margin: '0 0 6px 0', color: '#991b1b', fontSize: '12px', fontWeight: '600' }}>
                              📦 {insumo.nombreCategoria || insumo.categoriainsumos?.nombrecategoria || 'Sin categoría'}
                            </p>
                            <div style={{ 
                              display: 'flex', 
                              gap: '12px', 
                              alignItems: 'center',
                              flexWrap: 'wrap'
                            }}>
                              <span style={{ 
                                color: '#7f1d1d',
                                fontWeight: '700',
                                fontSize: '13px'
                              }}>
                                Stock: {insumo.cantidad} {insumo.nombreUnidadMedida || insumo.unidadmedida?.unidadmedida || 'unid'}
                              </span>
                              <span style={{ 
                                color: '#991b1b',
                                fontSize: '11px',
                                backgroundColor: 'rgba(127, 29, 29, 0.1)',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontWeight: '600'
                              }}>
                                Mín: {insumo.stockMinimo || 5}
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              backgroundColor: '#dc2626',
                              color: 'white',
                              fontSize: '11px',
                              fontWeight: '700',
                              whiteSpace: 'nowrap',
                              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
                            }}
                          >
                            ⚠️ AGOTADO
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '60px 20px',
                      textAlign: 'center',
                      color: '#9ca3af'
                    }}
                  >
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#6b7280' }}>
                      Stock en buen estado
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#9ca3af' }}>
                      Todos los insumos disponibles
                    </p>
                  </div>
                )
              ) : pestanaActiva === 'pedidos' ? (
                todosPedidos.length > 0 ? (
                  <div style={{ padding: '14px' }}>
                    {todosPedidos.map((pedido, index) => {
                      const diasRestantes = calcularDiasRestantes(pedido.fechaEntrega);
                      const esUrgente = diasRestantes <= 2;
                      const esPorEntregar = pedido.idEstadoVenta === 3 || pedido.estadoVentaId === 3;
                      const esPasado = diasRestantes < 0;
                      
                      return (
                        <div
                          key={index}
                          className="notification-card"
                          style={{
                            padding: '14px',
                            background: esUrgente || esPasado
                              ? 'linear-gradient(135deg, #fee2e2, #fecaca)' 
                              : 'linear-gradient(135deg, #fef3c7, #fde68a)',
                            borderLeft: `4px solid ${esUrgente || esPasado ? '#ef4444' : '#f59e0b'}`,
                            borderRadius: '12px',
                            marginBottom: '10px',
                            fontSize: '13px',
                            boxShadow: esUrgente || esPasado
                              ? '0 2px 8px rgba(239, 68, 68, 0.15)' 
                              : '0 2px 8px rgba(245, 158, 11, 0.15)',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(4px)';
                            e.currentTarget.style.boxShadow = esUrgente || esPasado
                              ? '0 4px 12px rgba(239, 68, 68, 0.25)' 
                              : '0 4px 12px rgba(245, 158, 11, 0.25)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.boxShadow = esUrgente || esPasado
                              ? '0 2px 8px rgba(239, 68, 68, 0.15)' 
                              : '0 2px 8px rgba(245, 158, 11, 0.15)';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ 
                                margin: '0 0 6px 0', 
                                fontWeight: '700', 
                                color: esUrgente || esPasado ? '#7f1d1d' : '#78350f',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <ShoppingCart size={16} />
                                Pedido #{pedido.idpedido || pedido.id || pedido.idVenta}
                              </p>
                              <p style={{ 
                                margin: '0 0 6px 0', 
                                color: esUrgente || esPasado ? '#991b1b' : '#92400e', 
                                fontSize: '12px', 
                                fontWeight: '600' 
                              }}>
                                👤 {pedido.nombreCliente || pedido.cliente?.nombre || 'Cliente'}
                              </p>
                              {esPorEntregar && (
                                <p style={{ 
                                  margin: '0 0 6px 0', 
                                  color: '#2563eb', 
                                  fontSize: '11px', 
                                  fontWeight: '700',
                                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  display: 'inline-block'
                                }}>
                                  📦 Por Entregar
                                </p>
                              )}
                              <div style={{ 
                                display: 'flex', 
                                gap: '12px', 
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                marginTop: '8px'
                              }}>
                                <span style={{ 
                                  color: esUrgente || esPasado ? '#7f1d1d' : '#78350f',
                                  fontWeight: '700',
                                  fontSize: '13px'
                                }}>
                                  📅 {formatearFecha(pedido.fechaEntrega)}
                                </span>
                                <span style={{ 
                                  color: esUrgente || esPasado ? '#991b1b' : '#92400e',
                                  fontSize: '11px',
                                  backgroundColor: esUrgente || esPasado ? 'rgba(127, 29, 29, 0.1)' : 'rgba(120, 53, 15, 0.1)',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontWeight: '600'
                                }}>
                                  {esPasado ? `¡${Math.abs(diasRestantes)} día(s) ATRASADO!` :
                                   diasRestantes === 0 ? '¡HOY!' : 
                                   diasRestantes === 1 ? 'Mañana' : 
                                   `En ${diasRestantes} días`}
                                </span>
                              </div>
                            </div>
                            <div
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                backgroundColor: esUrgente || esPasado ? '#dc2626' : '#f59e0b',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: '700',
                                whiteSpace: 'nowrap',
                                boxShadow: esUrgente || esPasado
                                  ? '0 2px 6px rgba(220, 38, 38, 0.3)' 
                                  : '0 2px 6px rgba(245, 158, 11, 0.3)'
                              }}
                            >
                              {esPasado ? '🚨 ATRASADO' : esUrgente ? '🚨 URGENTE' : '⏰ PRÓXIMO'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '60px 20px',
                      textAlign: 'center',
                      color: '#9ca3af'
                    }}
                  >
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#6b7280' }}>
                      Sin pedidos próximos
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#9ca3af' }}>
                      No hay entregas en los próximos 7 días
                    </p>
                  </div>
                )
              ) : (
                <div
                  style={{
                    padding: '60px 20px',
                    textAlign: 'center',
                    color: '#9ca3af'
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏭</div>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#6b7280' }}>
                    Producción al día
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#9ca3af' }}>
                    Sin alertas de producción
                  </p>
                </div>
              )}
            </div>

            {/* Pie */}
            {tieneNotificaciones && (
              <div
                style={{
                  padding: '14px 18px',
                  borderTop: '2px solid #ffe4f0',
                  background: 'linear-gradient(135deg, #fff5fb, #ffffff)',
                  fontSize: '12px',
                  color: '#ff1493',
                  textAlign: 'center',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={14} />
                {pestanaActiva === 'insumos' 
                  ? 'Requiere reabastecimiento inmediato' 
                  : 'Pedidos próximos a entregar'}
              </div>
            )}
          </div>
        )}

        {/* Overlay para cerrar */}
        {abierto && (
          <div
            onClick={() => setAbierto(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10000
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes bell-shake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }

        .bell-shake {
          animation: bell-shake 0.5s ease-in-out;
        }

        @keyframes pulse-badge {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
          }
          50% { 
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.6);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .notification-panel::-webkit-scrollbar {
          width: 6px;
        }

        .notification-panel::-webkit-scrollbar-track {
          background: transparent;
        }

        .notification-panel::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #ff69b4, #ff1493);
          border-radius: 3px;
        }

        .notification-panel::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #ff1493, #dc143c);
        }
      `}</style>
    </>
  );
}