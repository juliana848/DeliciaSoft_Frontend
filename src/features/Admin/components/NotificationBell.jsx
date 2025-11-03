import React, { useState, useEffect } from 'react';
import { Bell, X, Package, ShoppingCart, AlertCircle, Factory, Trash2 } from 'lucide-react';

export default function NotificationBell({ insumos = [], pedidos = [], producciones = [] }) {
  const [abierto, setAbierto] = useState(false);
  const [insumosCriticos, setInsumosCriticos] = useState([]);
  const [pedidosNuevos, setPedidosNuevos] = useState([]);
  const [pedidosAtrasados, setPedidosAtrasados] = useState([]);
  const [pedidosPorVencer, setPedidosPorVencer] = useState([]);
  const [pedidosPorEntregar, setPedidosPorEntregar] = useState([]);
  const [pedidosEntregados, setPedidosEntregados] = useState([]);
  const [produccionesNuevas, setProduccionesNuevas] = useState([]);
  const [produccionesEntregadas, setProduccionesEntregadas] = useState([]);
  const [notificacionesEliminadas, setNotificacionesEliminadas] = useState(new Set());
  const [pestanaActiva, setPestanaActiva] = useState('pedidos');
  const [animarCampana, setAnimarCampana] = useState(false);

  useEffect(() => {
    // Filtrar insumos críticos
    const criticos = insumos.filter(insumo => {
      const cantidad = parseFloat(insumo.cantidad) || 0;
      return cantidad <= 0 && insumo.estado;
    });
    setInsumosCriticos(criticos);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Detectar pedidos nuevos (creados en las últimas 24 horas en estado "En espera")
    const hace24Horas = new Date();
    hace24Horas.setHours(hace24Horas.getHours() - 24);
    
    const nuevos = pedidos.filter(pedido => {
      if (notificacionesEliminadas.has(`pedido-nuevo-${pedido.idVenta || pedido.idpedido}`)) return false;
      const esEnEspera = pedido.idEstadoVenta === 1 || pedido.estadoVentaId === 1;
      const estadoVenta = (pedido.nombreEstado || '').toLowerCase();
      if (!esEnEspera && estadoVenta !== 'en espera') return false;
      if (pedido.tipoVenta === 'directa' || pedido.tipoVenta === 'venta directa') return false;
      
      const fechaVenta = new Date(pedido.fechaVenta || pedido.fechaventa);
      return fechaVenta >= hace24Horas;
    });
    setPedidosNuevos(nuevos);

    // Detectar pedidos por entregar (estado 3)
    const porEntregar = pedidos.filter(pedido => {
      if (notificacionesEliminadas.has(`pedido-entregar-${pedido.idVenta || pedido.idpedido}`)) return false;
      const esPorEntregar = pedido.idEstadoVenta === 3 || pedido.estadoVentaId === 3;
      if (!esPorEntregar) return false;
      if (pedido.tipoVenta === 'directa' || pedido.tipoVenta === 'venta directa') return false;
      return true;
    });
    setPedidosPorEntregar(porEntregar);

    // ✅ NUEVO: Detectar pedidos recién entregados (últimas 24 horas)
    const entregados = pedidos.filter(pedido => {
      if (notificacionesEliminadas.has(`pedido-entregado-${pedido.idVenta || pedido.idpedido}`)) return false;
      const esEntregado = pedido.idEstadoVenta === 4 || pedido.estadoVentaId === 4;
      const estadoVenta = (pedido.nombreEstado || '').toLowerCase();
      if (!esEntregado && estadoVenta !== 'finalizado' && estadoVenta !== 'entregado') return false;
      if (pedido.tipoVenta === 'directa' || pedido.tipoVenta === 'venta directa') return false;
      
      // Verificar si fue actualizado recientemente
      const fechaActualizacion = new Date(pedido.fechaActualizacion || pedido.updatedAt || pedido.fechaVenta);
      return fechaActualizacion >= hace24Horas;
    });
    setPedidosEntregados(entregados);
    
    const pedidosProximos = pedidos.filter(pedido => {
      if (notificacionesEliminadas.has(`pedido-proximo-${pedido.idVenta || pedido.idpedido}`)) return false;
      if (!pedido.fechaEntrega) return false;
      const estadosExcluidos = ['entregado', 'completado', 'cancelado', 'anulado', 'finalizado'];
      const estadoVenta = (pedido.nombreEstado || '').toLowerCase();
      const estadoId = pedido.idEstadoVenta || pedido.estadoVentaId;
      if (estadosExcluidos.includes(estadoVenta) || estadoId === 4 || estadoId === 5 || estadoId === 6) return false;
      if (pedido.tipoVenta === 'directa' || pedido.tipoVenta === 'venta directa') return false;
      const fechaEntrega = new Date(pedido.fechaEntrega);
      fechaEntrega.setHours(0, 0, 0, 0);
      const diferenciaDias = Math.ceil((fechaEntrega - hoy) / (1000 * 60 * 60 * 24));
      return diferenciaDias >= 0 && diferenciaDias <= 5;
    });
    setPedidosPorVencer(pedidosProximos);

    // Detectar pedidos atrasados
    const atrasados = pedidos.filter(pedido => {
      if (notificacionesEliminadas.has(`pedido-atrasado-${pedido.idVenta || pedido.idpedido}`)) return false;
      if (!pedido.fechaEntrega) return false;
      const estadosExcluidos = ['entregado', 'completado', 'cancelado', 'anulado', 'finalizado'];
      const estadoVenta = (pedido.nombreEstado || '').toLowerCase();
      const estadoId = pedido.idEstadoVenta || pedido.estadoVentaId;
      if (estadosExcluidos.includes(estadoVenta) || estadoId === 4 || estadoId === 5 || estadoId === 6) return false;
      if (pedido.tipoVenta === 'directa' || pedido.tipoVenta === 'venta directa') return false;
      const fechaEntrega = new Date(pedido.fechaEntrega);
      fechaEntrega.setHours(0, 0, 0, 0);
      const diferenciaDias = Math.ceil((fechaEntrega - hoy) / (1000 * 60 * 60 * 24));
      return diferenciaDias < 0;
    });
    setPedidosAtrasados(atrasados);

    // ✅ NUEVO: Detectar producciones nuevas (tipo fábrica creadas en últimas 24 horas)
    const produccionesRecientes = producciones.filter(prod => {
      if (notificacionesEliminadas.has(`produccion-nueva-${prod.id || prod.idproduccion}`)) return false;
      const tipo = (prod.tipoProduccion || prod.TipoProduccion || '').toLowerCase();
      if (tipo !== 'fabrica') return false;
      
      const fechaCreacion = new Date(prod.fechaCreacion || prod.fechapedido || prod.createdAt);
      return fechaCreacion >= hace24Horas;
    });
    setProduccionesNuevas(produccionesRecientes);

    // ✅ NUEVO: Detectar producciones entregadas (estado 6 en últimas 24 horas)
    const produccionesFinalizadas = producciones.filter(prod => {
      if (notificacionesEliminadas.has(`produccion-entregada-${prod.id || prod.idproduccion}`)) return false;
      const estadoProduccion = prod.estadoProduccion || prod.estadoproduccion;
      if (estadoProduccion !== 6) return false;
      
      const fechaActualizacion = new Date(prod.fechaActualizacion || prod.updatedAt || prod.fechaCreacion);
      return fechaActualizacion >= hace24Horas;
    });
    setProduccionesEntregadas(produccionesFinalizadas);

    // Animar campana si hay notificaciones nuevas
    const totalNotificaciones = criticos.length + nuevos.length + porEntregar.length + 
                                entregados.length + pedidosProximos.length + atrasados.length +
                                produccionesRecientes.length + produccionesFinalizadas.length;
    
    if (totalNotificaciones > 0) {
      setAnimarCampana(true);
      const timer = setTimeout(() => setAnimarCampana(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [insumos, pedidos, producciones, notificacionesEliminadas]);

  const tieneNotificaciones = insumosCriticos.length > 0 || pedidosNuevos.length > 0 || 
                              pedidosPorEntregar.length > 0 || pedidosEntregados.length > 0 ||
                              pedidosPorVencer.length > 0 || pedidosAtrasados.length > 0 ||
                              produccionesNuevas.length > 0 || produccionesEntregadas.length > 0;
  
  const totalNotificaciones = insumosCriticos.length + pedidosNuevos.length + pedidosPorEntregar.length +
                              pedidosEntregados.length + pedidosPorVencer.length + pedidosAtrasados.length +
                              produccionesNuevas.length + produccionesEntregadas.length;

  const calcularDiasRestantes = (fechaEntrega) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fecha = new Date(fechaEntrega);
    fecha.setHours(0, 0, 0, 0);
    return Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // ✅ Función para eliminar notificación
  const eliminarNotificacion = (id) => {
    setNotificacionesEliminadas(prev => new Set([...prev, id]));
  };

  // Clasificar pedidos por prioridad
  const pedidosClasificados = [
    ...pedidosNuevos.map(p => ({ ...p, clasificacion: 'nuevo', prioridad: 1 })),
    ...pedidosAtrasados.map(p => ({ ...p, clasificacion: 'atrasado', prioridad: 2 })),
    ...pedidosPorEntregar.map(p => ({ ...p, clasificacion: 'porEntregar', prioridad: 3 })),
    ...pedidosEntregados.map(p => ({ ...p, clasificacion: 'entregado', prioridad: 4 })),
    ...pedidosPorVencer.map(p => ({ ...p, clasificacion: 'proximo', prioridad: 5 }))
  ]
    .filter((pedido, index, self) => 
      index === self.findIndex(p => (p.idpedido && p.idpedido === pedido.idpedido) || (p.idVenta && p.idVenta === pedido.idVenta))
    )
    .sort((a, b) => {
      if (a.prioridad !== b.prioridad) return a.prioridad - b.prioridad;
      if (a.fechaEntrega && b.fechaEntrega) {
        return new Date(a.fechaEntrega) - new Date(b.fechaEntrega);
      }
      return 0;
    });

  // Clasificar producciones
  const produccionesClasificadas = [
    ...produccionesNuevas.map(p => ({ ...p, clasificacion: 'nueva', prioridad: 1 })),
    ...produccionesEntregadas.map(p => ({ ...p, clasificacion: 'entregada', prioridad: 2 }))
  ].sort((a, b) => a.prioridad - b.prioridad);

  return (
    <>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setAbierto(!abierto)}
          className={animarCampana ? 'bell-shake' : ''}
          style={{
            background: abierto ? 'linear-gradient(135deg, #ff69b4, #ff1493)' : 'linear-gradient(135deg, #ffffff, #fef7ff)',
            border: '2px solid #ff69b4',
            cursor: 'pointer',
            position: 'relative',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.3s ease',
            width: '32px',
            height: '32px',
            boxShadow: abierto ? '0 2px 10px rgba(255, 105, 180, 0.4)' : '0 2px 6px rgba(255, 105, 180, 0.2)'
          }}
          onMouseEnter={(e) => {
            if (!abierto) {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(255, 105, 180, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!abierto) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(255, 105, 180, 0.2)';
            }
          }}
          title="Notificaciones"
        >
          <Bell size={14} color={abierto ? 'white' : '#ff69b4'} strokeWidth={2.5} />
          
          {tieneNotificaciones && (
            <div
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '14px',
                height: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8px',
                fontWeight: 'bold',
                border: '1.5px solid white',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)',
                animation: 'pulse-badge 2s infinite'
              }}
            >
              {totalNotificaciones > 9 ? '9+' : totalNotificaciones}
            </div>
          )}
        </button>

        {abierto && (
          <div
            style={{
              position: 'absolute',
              top: '36px',
              right: '0',
              width: '320px',
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 6px 28px rgba(255, 105, 180, 0.25)',
              zIndex: 10001,
              maxHeight: '420px',
              display: 'flex',
              flexDirection: 'column',
              border: '2px solid #ff69b4',
              overflow: 'hidden',
              animation: 'slideDown 0.3s ease-out'
            }}
          >
            {/* Encabezado */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 10px',
              borderBottom: '2px solid #ffe4f0',
              background: 'linear-gradient(135deg, #fff5fb, #ffffff)'
            }}>
              <div>
                <h3 style={{ margin: '0', fontSize: '12px', fontWeight: '700', color: '#ff1493', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Bell size={12} />
                  Notificaciones
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#9ca3af', fontWeight: '500' }}>
                  {tieneNotificaciones ? `${totalNotificaciones} alerta${totalNotificaciones > 1 ? 's' : ''}` : 'Todo bien ✨'}
                </p>
              </div>
              <button
                onClick={() => setAbierto(false)}
                style={{
                  background: 'linear-gradient(135deg, #ff69b4, #ff1493)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  borderRadius: '50%',
                  transition: 'all 0.2s',
                  width: '22px',
                  height: '22px'
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
                <X size={12} />
              </button>
            </div>

            {/* Pestañas */}
            <div style={{ display: 'flex', borderBottom: '2px solid #ffe4f0', background: 'linear-gradient(135deg, #fff5fb, #ffffff)' }}>
              {[
                { key: 'pedidos', icon: ShoppingCart, label: 'Pedidos', count: pedidosClasificados.length, color: '#f59e0b' },
                { key: 'insumos', icon: Package, label: 'Insumos', count: insumosCriticos.length, color: '#ef4444' },
                { key: 'produccion', icon: Factory, label: 'Producción', count: produccionesClasificadas.length, color: '#8b5cf6' }
              ].map(({ key, icon: Icon, label, count, color }) => (
                <button
                  key={key}
                  onClick={() => setPestanaActiva(key)}
                  style={{
                    flex: 1,
                    padding: '7px 5px',
                    border: 'none',
                    backgroundColor: pestanaActiva === key ? 'white' : 'transparent',
                    borderBottom: pestanaActiva === key ? '2px solid #ff69b4' : 'none',
                    color: pestanaActiva === key ? '#ff1493' : '#9ca3af',
                    fontWeight: pestanaActiva === key ? '700' : '600',
                    cursor: 'pointer',
                    fontSize: '9px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px'
                  }}
                  onMouseEnter={(e) => {
                    if (pestanaActiva !== key) {
                      e.currentTarget.style.backgroundColor = '#fff5fb';
                      e.currentTarget.style.color = '#ff69b4';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pestanaActiva !== key) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#9ca3af';
                    }
                  }}
                >
                  <Icon size={10} />
                  {label}
                  {count > 0 && (
                    <span style={{ backgroundColor: color, color: 'white', borderRadius: '6px', padding: '1px 3px', fontSize: '7px', fontWeight: 'bold' }}>
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Contenido */}
            <div style={{ overflowY: 'auto', maxHeight: '330px', flex: 1, background: 'linear-gradient(to bottom, #ffffff, #fef7ff)' }}>
              {pestanaActiva === 'pedidos' ? (
                pedidosClasificados.length > 0 ? (
                  <div style={{ padding: '8px' }}>
                    {pedidosClasificados.map((pedido, index) => {
                      const { clasificacion } = pedido;
                      const notifId = `pedido-${clasificacion}-${pedido.idVenta || pedido.idpedido}`;
                      
                      const configs = {
                        nuevo: {
                          bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                          border: '#10b981',
                          textPrimary: '#065f46',
                          textSecondary: '#047857',
                          badge: '#059669',
                          badgeText: '🎉 NUEVO',
                          icon: '✨'
                        },
                        atrasado: {
                          bg: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                          border: '#ef4444',
                          textPrimary: '#7f1d1d',
                          textSecondary: '#991b1b',
                          badge: '#dc2626',
                          badgeText: '🚨 ATRASADO',
                          icon: '⚠️'
                        },
                        porEntregar: {
                          bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                          border: '#3b82f6',
                          textPrimary: '#1e3a8a',
                          textSecondary: '#1e40af',
                          badge: '#2563eb',
                          badgeText: '📦 POR ENTREGAR',
                          icon: '🚚'
                        },
                        entregado: {
                          bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                          border: '#10b981',
                          textPrimary: '#065f46',
                          textSecondary: '#047857',
                          badge: '#059669',
                          badgeText: '✅ ENTREGADO',
                          icon: '🎊'
                        },
                        proximo: {
                          bg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                          border: '#f59e0b',
                          textPrimary: '#78350f',
                          textSecondary: '#92400e',
                          badge: '#f59e0b',
                          badgeText: '⏰ PRÓXIMO',
                          icon: '📅'
                        }
                      };
                      
                      const config = configs[clasificacion] || configs.proximo;
                      const diasRestantes = pedido.fechaEntrega ? calcularDiasRestantes(pedido.fechaEntrega) : null;
                      
                      return (
                        <div
                          key={index}
                          style={{
                            padding: '8px',
                            background: config.bg,
                            borderLeft: `2px solid ${config.border}`,
                            borderRadius: '6px',
                            marginBottom: '6px',
                            fontSize: '10px',
                            boxShadow: `0 2px 4px ${config.border}26`,
                            transition: 'all 0.2s',
                            position: 'relative'
                          }}
                        >
                          <button
                            onClick={() => eliminarNotificacion(notifId)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(0,0,0,0.1)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '16px',
                              height: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              opacity: 0.6,
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '1';
                              e.currentTarget.style.background = config.badge;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '0.6';
                              e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
                            }}
                            title="Eliminar notificación"
                          >
                            <X size={10} color="white" />
                          </button>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '6px', paddingRight: '20px' }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: '0 0 3px 0', fontWeight: '700', color: config.textPrimary, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <ShoppingCart size={11} />
                                Pedido #{pedido.idpedido || pedido.idVenta}
                              </p>
                              <p style={{ margin: '0 0 3px 0', color: config.textSecondary, fontSize: '9px', fontWeight: '600' }}>
                                👤 {pedido.nombreCliente || 'Cliente'}
                              </p>
                              
                              <p style={{ margin: '0 0 3px 0', color: config.textSecondary, fontSize: '8px', fontWeight: '600' }}>
                                {config.icon} {pedido.nombreEstado || 'Estado N/A'}
                              </p>
                              
                              {pedido.fechaEntrega && clasificacion !== 'entregado' && (
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                                  <span style={{ color: config.textPrimary, fontWeight: '700', fontSize: '9px' }}>
                                    📅 {formatearFecha(pedido.fechaEntrega)}
                                  </span>
                                  {diasRestantes !== null && clasificacion !== 'nuevo' && (
                                    <span style={{ color: config.textSecondary, fontSize: '8px', backgroundColor: `${config.textPrimary}1a`, padding: '1px 4px', borderRadius: '3px', fontWeight: '600' }}>
                                      {clasificacion === 'atrasado' 
                                        ? `¡${Math.abs(diasRestantes)} día(s) ATRASADO!` 
                                        : diasRestantes === 0 
                                          ? '¡HOY!' 
                                          : diasRestantes === 1 
                                            ? 'Mañana' 
                                            : `En ${diasRestantes} días`}
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              {clasificacion === 'nuevo' && pedido.fechaVenta && (
                                <div style={{ marginTop: '4px' }}>
                                  <span style={{ color: config.textSecondary, fontSize: '8px', backgroundColor: `${config.textPrimary}1a`, padding: '1px 4px', borderRadius: '3px', fontWeight: '600' }}>
                                    Creado: {formatearFecha(pedido.fechaVenta)}
                                  </span>
                                </div>
                              )}

                              {clasificacion === 'entregado' && (
                                <div style={{ marginTop: '4px' }}>
                                  <span style={{ color: config.textSecondary, fontSize: '8px', backgroundColor: `${config.textPrimary}1a`, padding: '1px 4px', borderRadius: '3px', fontWeight: '600' }}>
                                    ¡Pedido completado exitosamente!
                                  </span>
                                </div>
                              )}
                            </div>
                            <div style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: config.badge, color: 'white', fontSize: '8px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                              {config.badgeText}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '35px 15px', textAlign: 'center', color: '#9ca3af' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Sin pedidos pendientes</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#9ca3af' }}>No hay alertas de pedidos</p>
                  </div>
                )
              ) : pestanaActiva === 'insumos' ? (
                insumosCriticos.length > 0 ? (
                  <div style={{ padding: '8px' }}>
                    {insumosCriticos.map((insumo, index) => {
                      const notifId = `insumo-critico-${insumo.idinsumo || index}`;
                      return (
                        <div
                          key={index}
                          style={{
                            padding: '8px',
                            background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                            borderLeft: '2px solid #ef4444',
                            borderRadius: '6px',
                            marginBottom: '6px',
                            fontSize: '10px',
                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.15)',
                            transition: 'all 0.2s',
                            position: 'relative'
                          }}
                        >
                          <button
                            onClick={() => eliminarNotificacion(notifId)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(0,0,0,0.1)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '16px',
                              height: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              opacity: 0.6,
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '1';
                              e.currentTarget.style.background = '#dc2626';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '0.6';
                              e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
                            }}
                            title="Eliminar notificación"
                          >
                            <X size={10} color="white" />
                          </button>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '6px', paddingRight: '20px' }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: '0 0 3px 0', fontWeight: '700', color: '#7f1d1d', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <AlertCircle size={11} />
                                {insumo.nombreInsumo || insumo.nombreinsumo}
                              </p>
                              <p style={{ margin: '0 0 3px 0', color: '#991b1b', fontSize: '9px', fontWeight: '600' }}>
                                📦 {insumo.nombreCategoria || insumo.categoriainsumos?.nombrecategoria || 'Sin categoría'}
                              </p>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <span style={{ color: '#7f1d1d', fontWeight: '700', fontSize: '9px' }}>
                                  Stock: {insumo.cantidad} {insumo.nombreUnidadMedida || 'unid'}
                                </span>
                                <span style={{ color: '#991b1b', fontSize: '8px', backgroundColor: 'rgba(127, 29, 29, 0.1)', padding: '1px 4px', borderRadius: '3px', fontWeight: '600' }}>
                                  Mín: {insumo.stockMinimo || 5}
                                </span>
                              </div>
                            </div>
                            <div style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: '#dc2626', color: 'white', fontSize: '8px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                              ⚠️ AGOTADO
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '35px 15px', textAlign: 'center', color: '#9ca3af' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Stock en buen estado</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#9ca3af' }}>Todos los insumos disponibles</p>
                  </div>
                )
              ) : (
                // Pestaña de Producción
                produccionesClasificadas.length > 0 ? (
                  <div style={{ padding: '8px' }}>
                    {produccionesClasificadas.map((produccion, index) => {
                      const { clasificacion } = produccion;
                      const notifId = `produccion-${clasificacion}-${produccion.id || produccion.idproduccion}`;
                      
                      const configs = {
                        nueva: {
                          bg: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                          border: '#8b5cf6',
                          textPrimary: '#5b21b6',
                          textSecondary: '#6d28d9',
                          badge: '#7c3aed',
                          badgeText: '🏭 NUEVA PRODUCCIÓN',
                          icon: '✨'
                        },
                        entregada: {
                          bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                          border: '#10b981',
                          textPrimary: '#065f46',
                          textSecondary: '#047857',
                          badge: '#059669',
                          badgeText: '✅ COMPLETADA',
                          icon: '🎉'
                        }
                      };
                      
                      const config = configs[clasificacion] || configs.nueva;
                      
                      return (
                        <div
                          key={index}
                          style={{
                            padding: '8px',
                            background: config.bg,
                            borderLeft: `2px solid ${config.border}`,
                            borderRadius: '6px',
                            marginBottom: '6px',
                            fontSize: '10px',
                            boxShadow: `0 2px 4px ${config.border}26`,
                            transition: 'all 0.2s',
                            position: 'relative'
                          }}
                        >
                          <button
                            onClick={() => eliminarNotificacion(notifId)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(0,0,0,0.1)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '16px',
                              height: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              opacity: 0.6,
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '1';
                              e.currentTarget.style.background = config.badge;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '0.6';
                              e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
                            }}
                            title="Eliminar notificación"
                          >
                            <X size={10} color="white" />
                          </button>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '6px', paddingRight: '20px' }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: '0 0 3px 0', fontWeight: '700', color: config.textPrimary, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Factory size={11} />
                                {produccion.nombreProduccion || `Producción #${produccion.id || produccion.idproduccion}`}
                              </p>
                              <p style={{ margin: '0 0 3px 0', color: config.textSecondary, fontSize: '9px', fontWeight: '600' }}>
                                {config.icon} Tipo: {(produccion.tipoProduccion || 'Fábrica').toUpperCase()}
                              </p>
                              
                              <div style={{ marginTop: '4px' }}>
                                <span style={{ color: config.textPrimary, fontWeight: '700', fontSize: '9px' }}>
                                  📅 {formatearFecha(produccion.fechaCreacion || produccion.fechapedido)}
                                </span>
                              </div>
                              
                              {clasificacion === 'nueva' && (
                                <div style={{ marginTop: '4px' }}>
                                  <span style={{ color: config.textSecondary, fontSize: '8px', backgroundColor: `${config.textPrimary}1a`, padding: '1px 4px', borderRadius: '3px', fontWeight: '600' }}>
                                    ¡Producción creada recientemente!
                                  </span>
                                </div>
                              )}
                              
                              {clasificacion === 'entregada' && (
                                <div style={{ marginTop: '4px' }}>
                                  <span style={{ color: config.textSecondary, fontSize: '8px', backgroundColor: `${config.textPrimary}1a`, padding: '1px 4px', borderRadius: '3px', fontWeight: '600' }}>
                                    ¡Producción completada exitosamente!
                                  </span>
                                </div>
                              )}
                            </div>
                            <div style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: config.badge, color: 'white', fontSize: '8px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                              {config.badgeText}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '35px 15px', textAlign: 'center', color: '#9ca3af' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏭</div>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Producción al día</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#9ca3af' }}>Sin alertas</p>
                  </div>
                )
              )}
            </div>

            {/* Pie */}
            {tieneNotificaciones && (
              <div style={{
                padding: '7px 10px',
                borderTop: '2px solid #ffe4f0',
                background: 'linear-gradient(135deg, #fff5fb, #ffffff)',
                fontSize: '9px',
                color: '#ff1493',
                textAlign: 'center',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}>
                <AlertCircle size={10} />
                {pestanaActiva === 'insumos' 
                  ? 'Requiere reabastecimiento' 
                  : pestanaActiva === 'pedidos' 
                    ? (() => {
                        const parts = [];
                        if (pedidosNuevos.length > 0) parts.push(`${pedidosNuevos.length} nuevo(s)`);
                        if (pedidosAtrasados.length > 0) parts.push(`${pedidosAtrasados.length} atrasado(s)`);
                        if (pedidosPorEntregar.length > 0) parts.push(`${pedidosPorEntregar.length} por entregar`);
                        if (pedidosEntregados.length > 0) parts.push(`${pedidosEntregados.length} entregado(s)`);
                        return parts.length > 0 ? parts.join(' • ') : 'Pedidos pendientes';
                      })()
                    : (() => {
                        const parts = [];
                        if (produccionesNuevas.length > 0) parts.push(`${produccionesNuevas.length} nueva(s)`);
                        if (produccionesEntregadas.length > 0) parts.push(`${produccionesEntregadas.length} completada(s)`);
                        return parts.length > 0 ? parts.join(' • ') : 'Alertas de producción';
                      })()}
              </div>
            )}
          </div>
        )}

        {abierto && <div onClick={() => setAbierto(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000 }} />}
      </div>

      <style>{`
        @keyframes bell-shake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }
        @keyframes pulse-badge {
          0%, 100% { transform: scale(1); box-shadow: 0 2px 4px rgba(239, 68, 68, 0.4); }
          50% { transform: scale(1.1); box-shadow: 0 2px 8px rgba(239, 68, 68, 0.6); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        div::-webkit-scrollbar { width: 4px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #ff69b4, #ff1493); border-radius: 2px; }
      `}</style>
    </>
  );
}