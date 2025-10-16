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
    const criticos = insumos.filter(insumo => {
      const cantidad = parseFloat(insumo.cantidad) || 0;
      return cantidad <= 0 && insumo.estado;
    });
    setInsumosCriticos(criticos);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const pedidosProximos = pedidos.filter(pedido => {
      if (!pedido.fechaEntrega) return false;
      const estadosExcluidos = ['entregado', 'completado', 'cancelado', 'anulado', 'finalizado'];
      const estadoVenta = (pedido.nombreEstado || '').toLowerCase();
      const estadoId = pedido.idEstadoVenta || pedido.estadoVentaId;
      if (estadosExcluidos.includes(estadoVenta) || estadoId === 4 || estadoId === 5 || estadoId === 6) return false;
      if (pedido.tipoVenta === 'directa' || pedido.tipoVenta === 'venta directa') return false;
      const fechaEntrega = new Date(pedido.fechaEntrega);
      fechaEntrega.setHours(0, 0, 0, 0);
      const diferenciaDias = Math.ceil((fechaEntrega - hoy) / (1000 * 60 * 60 * 24));
      return diferenciaDias >= -30 && diferenciaDias <= 5;
    });
    setPedidosPorVencer(pedidosProximos);

    const pedidosEntregar = pedidos.filter(pedido => {
      const esPorEntregar = pedido.idEstadoVenta === 3 || pedido.estadoVentaId === 3;
      if (!esPorEntregar) return false;
      if (pedido.tipoVenta === 'directa' || pedido.tipoVenta === 'venta directa') return false;
      if (!pedido.fechaEntrega) return true;
      const fechaEntrega = new Date(pedido.fechaEntrega);
      fechaEntrega.setHours(0, 0, 0, 0);
      const diferenciaDias = Math.ceil((fechaEntrega - hoy) / (1000 * 60 * 60 * 24));
      return diferenciaDias <= 7;
    });
    setPedidosPorEntregar(pedidosEntregar);

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
    return Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const todosPedidos = [...pedidosPorVencer, ...pedidosPorEntregar]
    .filter((pedido, index, self) => 
      index === self.findIndex(p => (p.idpedido && p.idpedido === pedido.idpedido) || (p.idVenta && p.idVenta === pedido.idVenta))
    )
    .sort((a, b) => new Date(a.fechaEntrega) - new Date(b.fechaEntrega));

  return (
    <>
      <div style={{ position: 'relative' }}>
        {/* Botón campanita - TAMAÑO  */}
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
          
          {/* Badge - TAMAÑO 14px */}
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

        {/* Panel - ANCHO 300px */}
        {abierto && (
          <div
            style={{
              position: 'absolute',
              top: '36px',
              right: '0',
              width: '300px',
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
                { key: 'insumos', icon: Package, label: 'Insumos', count: insumosCriticos.length, color: '#ef4444' },
                { key: 'pedidos', icon: ShoppingCart, label: 'Pedidos', count: todosPedidos.length, color: '#f59e0b' },
                { key: 'produccion', icon: Factory, label: 'Producción', count: 0, color: '#6b7280' }
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
              {pestanaActiva === 'insumos' ? (
                insumosCriticos.length > 0 ? (
                  <div style={{ padding: '8px' }}>
                    {insumosCriticos.map((insumo, index) => (
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
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateX(2px)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.25)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.15)';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '6px' }}>
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
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '35px 15px', textAlign: 'center', color: '#9ca3af' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Stock en buen estado</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#9ca3af' }}>Todos los insumos disponibles</p>
                  </div>
                )
              ) : pestanaActiva === 'pedidos' ? (
                todosPedidos.length > 0 ? (
                  <div style={{ padding: '8px' }}>
                    {todosPedidos.map((pedido, index) => {
                      const diasRestantes = calcularDiasRestantes(pedido.fechaEntrega);
                      const esUrgente = diasRestantes <= 2;
                      const esPasado = diasRestantes < 0;
                      const esPorEntregar = pedido.idEstadoVenta === 3 || pedido.estadoVentaId === 3;
                      
                      return (
                        <div
                          key={index}
                          style={{
                            padding: '8px',
                            background: esUrgente || esPasado ? 'linear-gradient(135deg, #fee2e2, #fecaca)' : 'linear-gradient(135deg, #fef3c7, #fde68a)',
                            borderLeft: `2px solid ${esUrgente || esPasado ? '#ef4444' : '#f59e0b'}`,
                            borderRadius: '6px',
                            marginBottom: '6px',
                            fontSize: '10px',
                            boxShadow: `0 2px 4px rgba(${esUrgente || esPasado ? '239, 68, 68' : '245, 158, 11'}, 0.15)`,
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(2px)';
                            e.currentTarget.style.boxShadow = `0 2px 8px rgba(${esUrgente || esPasado ? '239, 68, 68' : '245, 158, 11'}, 0.25)`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.boxShadow = `0 2px 4px rgba(${esUrgente || esPasado ? '239, 68, 68' : '245, 158, 11'}, 0.15)`;
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '6px' }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: '0 0 3px 0', fontWeight: '700', color: esUrgente || esPasado ? '#7f1d1d' : '#78350f', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <ShoppingCart size={11} />
                                Pedido #{pedido.idpedido || pedido.idVenta}
                              </p>
                              <p style={{ margin: '0 0 3px 0', color: esUrgente || esPasado ? '#991b1b' : '#92400e', fontSize: '9px', fontWeight: '600' }}>
                                👤 {pedido.nombreCliente || 'Cliente'}
                              </p>
                              {esPorEntregar && (
                                <p style={{ margin: '0 0 3px 0', color: '#2563eb', fontSize: '8px', fontWeight: '700', backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '1px 4px', borderRadius: '3px', display: 'inline-block' }}>
                                  📦 Por Entregar
                                </p>
                              )}
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                                <span style={{ color: esUrgente || esPasado ? '#7f1d1d' : '#78350f', fontWeight: '700', fontSize: '9px' }}>
                                  📅 {formatearFecha(pedido.fechaEntrega)}
                                </span>
                                <span style={{ color: esUrgente || esPasado ? '#991b1b' : '#92400e', fontSize: '8px', backgroundColor: `rgba(${esUrgente || esPasado ? '127, 29, 29' : '120, 53, 15'}, 0.1)`, padding: '1px 4px', borderRadius: '3px', fontWeight: '600' }}>
                                  {esPasado ? `¡${Math.abs(diasRestantes)} día(s) ATRASADO!` : diasRestantes === 0 ? '¡HOY!' : diasRestantes === 1 ? 'Mañana' : `En ${diasRestantes} días`}
                                </span>
                              </div>
                            </div>
                            <div style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: esUrgente || esPasado ? '#dc2626' : '#f59e0b', color: 'white', fontSize: '8px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                              {esPasado ? '🚨 ATRASADO' : esUrgente ? '🚨 URGENTE' : '⏰ PRÓXIMO'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '35px 15px', textAlign: 'center', color: '#9ca3af' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Sin pedidos próximos</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#9ca3af' }}>No hay entregas próximas</p>
                  </div>
                )
              ) : (
                <div style={{ padding: '35px 15px', textAlign: 'center', color: '#9ca3af' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏭</div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Producción al día</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#9ca3af' }}>Sin alertas</p>
                </div>
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
                {pestanaActiva === 'insumos' ? 'Requiere reabastecimiento' : 'Pedidos próximos'}
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