import React, { useState } from 'react';

const PedidosActivos = () => {
  // Estado para controlar qué pedido está expandido
  const [pedidoExpandido, setPedidoExpandido] = useState(null);
  
  // Estados de los pedidos
  const estados = {
    pendiente: { color: '#ffc107', label: 'Pendiente' },
    abonado: { color: '#6f42c1', label: 'Abonado' },
    enProduccion: { color: '#007bff', label: 'En producción' },
    entregadoVentas: { color: '#17a2b8', label: 'Entregado a ventas' },
    anulado: { color: '#dc3545', label: 'Anulado' },
    entregado: {color: '#9b9b9b', label: 'Entregado' }
    
  };

  // Datos de ejemplo de pedidos
  const [pedidos, setPedidos] = useState([
    {
      id: 'P001',
      fecha: '2024-06-15',
      hora: '10:30',
      estado: 'pendiente',
      cliente: 'María González',
      telefono: '300 123 4567',
      ubicacion: 'San Benito - CALLE 9 #7-34',
      abono: 210000,
      total: 420000,
      productos: [
        {
          id: 1,
          nombre: 'Fresas con crema',
          cantidad: 20,
          precio: 18000,
          toppings: ['Oreo', 'M&M', 'Mani'],
          adicciones: ['Queso', 'Melocoton']
        },
        {
          id: 2,
          nombre: 'Arroz con leche',
          cantidad: 15,
          precio: 8000,
          toppings: ['Mani', 'Arequipe'],
          adicciones: ['Queso extra']
        }
      ]
    },
    {
      id: 'P002',
      fecha: '2024-06-15',
      hora: '11:15',
      estado: 'abonado',
      cliente: 'Carlos Rodríguez',
      telefono: '310 987 6543',
      ubicacion: 'San Pablo - Carrera 15 #12-45',
      abono: 50000,
      total: 120000,
      productos: [
        {
          id: 3,
          nombre: 'Obleas',
          cantidad: 3,
          precio: 4000,
          toppings: ['Chips chocolate', 'Queso'],
          adicciones: ['Fresas', 'Mani']
        }
      ]
    },
       {
      id: 'P12342',
      cliente: 'Ana Martínez',
      telefono: '302 345 6789',
      ubicacion: 'San Benito - CALLE 9 #7-34',
      fecha: '2024-06-05',
      fechaEntrega: '2024-06-07',
      productos: [
        {
          nombre: 'Cupcakes Fresa',
          cantidad: 24,
          precio: 3000,
          toppings: ['Fresa', 'Crema'],
          adiciones: []
        },
        {
          nombre: 'Torta Red Velvet',
          cantidad: 1,
          precio: 23000,
          toppings: [],
          adiciones: []
        }
      ],
      total: 95000,
      abono: 95000,
      pendiente: 0,
      estado: 'entregado',
      observaciones: 'Evento corporativo',
      metodoPago: 'Tarjeta',
      abonos: [
        { fecha: '2024-06-05', monto: 47500, tipo: 'Adelanto' },
        { fecha: '2024-06-07', monto: 47500, tipo: 'Saldo final' }
      ]
    }

  ]);

  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Función para alternar la expansión de detalles
  const toggleDetalles = (pedidoId) => {
    setPedidoExpandido(pedidoExpandido === pedidoId ? null : pedidoId);
  };

  // Función para anular pedido
  const anularPedido = (pedidoId) => {
    if (window.confirm('¿Estás seguro de que quieres anular este pedido?')) {
      setPedidos(prevPedidos => 
        prevPedidos.map(pedido => 
          pedido.id === pedidoId 
            ? { ...pedido, estado: 'anulado' }
            : pedido
        )
      );
    }
  };

  // Filtrar pedidos según el estado seleccionado
  const pedidosFiltrados = filtroEstado === 'todos' 
    ? pedidos 
    : pedidos.filter(pedido => pedido.estado === filtroEstado);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      padding: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>
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
            Historial
          </h1>
          <p style={{ color: '#6c757d', fontSize: '16px' }}>
            Gestiona y supervisa todos tus pedidos en tiempo real
          </p>
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
            Todos
          </button>
          {Object.entries(estados).map(([key, estado]) => (
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
              {estado.label}
            </button>
          ))}
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
              <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>No hay pedidos</h3>
              <p style={{ color: '#adb5bd' }}>
                No se encontraron pedidos con el filtro seleccionado
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
                        Pedido #{pedido.id}
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
                      background: `${estados[pedido.estado].color}15`,
                      border: `2px solid ${estados[pedido.estado].color}30`
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: estados[pedido.estado].color
                      }}></div>
                      <span style={{
                        color: estados[pedido.estado].color,
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        {estados[pedido.estado].label}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => toggleDetalles(pedido.id)}
                      style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '10px',
                        background: 'linear-gradient(45deg,rgb(145, 148, 148),rgb(219, 66, 168))',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {pedidoExpandido === pedido.id ? 'Ocultar Detalles' : 'Ver Detalles'}
                    </button>
                    
                    {pedido.estado === 'pendiente' && (
                      <button
                        onClick={() => anularPedido(pedido.id)}
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
                          👤 Información del Cliente
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div><strong>Nombre:</strong> {pedido.cliente}</div>
                          <div><strong>Teléfono:</strong> {pedido.telefono}</div>
                          <div><strong>Ubicación:</strong> {pedido.ubicacion}</div>
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
                        {pedido.productos.map((producto) => (
                          <div key={producto.id} style={{
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
                                  🧄 Toppings:
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
                              <div>
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
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PedidosActivos;