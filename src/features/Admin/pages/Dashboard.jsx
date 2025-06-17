import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('diario');
  const [mostrarVentas, setMostrarVentas] = useState(true);
  const [mostrarGastos, setMostrarGastos] = useState(true);
  const [sedeSeleccionada, setSedeSeleccionada] = useState('todas');
  const [ventasRealTime, setVentasRealTime] = useState([]);

  // Datos para diferentes períodos
  const datosDiarios = [
    { periodo: 'Lun', ventas: 4800, gastos: 2200 },
    { periodo: 'Mar', ventas: 3600, gastos: 1800 },
    { periodo: 'Mie', ventas: 5100, gastos: 2400 },
    { periodo: 'Jue', ventas: 4200, gastos: 2000 },
    { periodo: 'Vie', ventas: 5600, gastos: 2800 },
    { periodo: 'Sab', ventas: 3100, gastos: 1500 },
    { periodo: 'Dom', ventas: 3900, gastos: 1900 }
  ];

  const datosSemanales = [
    { periodo: 'Semana 1', ventas: 28500, gastos: 14200 },
    { periodo: 'Semana 2', ventas: 32100, gastos: 15800 },
    { periodo: 'Semana 3', ventas: 29800, gastos: 14500 },
    { periodo: 'Semana 4', ventas: 35200, gastos: 17100 }
  ];

  const datosMensuales = [
    { periodo: 'Enero', ventas: 85000, gastos: 42000 },
    { periodo: 'Febrero', ventas: 92000, gastos: 45000 },
    { periodo: 'Marzo', ventas: 88000, gastos: 43500 },
    { periodo: 'Abril', ventas: 95000, gastos: 47000 },
    { periodo: 'Mayo', ventas: 102000, gastos: 49500 },
    { periodo: 'Junio', ventas: 78000, gastos: 38000 }
  ];

  // Productos disponibles
  const productos = [
    {
      id: 1,
      nombre: 'Fresas con Crema',
      imagen: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=100&h=100&fit=crop&crop=center',
      precio: 8500
    },
    {
      id: 2,
      nombre: 'Obleas',
      imagen: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=100&h=100&fit=crop&crop=center',
      precio: 4500
    },
    {
      id: 3,
      nombre: 'Arroz con Leche',
      imagen: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=100&h=100&fit=crop&crop=center',
      precio: 6000
    },
    {
      id: 4,
      nombre: 'Cupcakes',
      imagen: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=100&h=100&fit=crop&crop=center',
      precio: 7200
    },
    {
      id: 5,
      nombre: 'Torta de Chocolate',
      imagen: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&h=100&fit=crop&crop=center',
      precio: 15000
    }
  ];

  const sedes = ['San Pablo', 'San Benito'];

  // Simular ventas en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const nuevoProducto = productos[Math.floor(Math.random() * productos.length)];
      const sede = sedes[Math.floor(Math.random() * sedes.length)];
      const cantidad = Math.floor(Math.random() * 5) + 1;
      
      const nuevaVenta = {
        id: Date.now(),
        producto: nuevoProducto.nombre,
        imagen: nuevoProducto.imagen,
        cantidad: cantidad,
        precio: nuevoProducto.precio,
        sede: sede,
        timestamp: new Date()
      };

      setVentasRealTime(prev => {
        const nuevasVentas = [nuevaVenta, ...prev];
        return nuevasVentas.slice(0, 8); // Mantener solo las últimas 8 ventas
      });
    }, 3000); // Nueva venta cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  const obtenerDatos = () => {
    switch (periodoSeleccionado) {
      case 'diario':
        return datosDiarios;
      case 'semanal':
        return datosSemanales;
      case 'mensual':
        return datosMensuales;
      default:
        return datosDiarios;
    }
  };

  const ventasFiltradas = ventasRealTime.filter(venta => {
    if (sedeSeleccionada === 'todas') return true;
    return venta.sede === sedeSeleccionada;
  });

  const styles = {
    dashboard: {
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      padding: '20px',
      color: '#333'
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto'
    },
    header: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '30px',
      color: '#333'
    },
    mainContent: {
      display: 'flex',
      gap: '20px',
      marginBottom: '30px',
      flexWrap: 'wrap',
      alignItems: 'flex-start'
    },
    leftSection: {
      flex: '2',
      minWidth: '400px',
      maxWidth: 'calc(100% - 370px)'
    },
    rightSection: {
      flex: '1',
      minWidth: '350px',
      maxWidth: '350px'
    },
    statsRow: {
      display: 'flex',
      gap: '20px',
      marginBottom: '30px',
      flexWrap: 'wrap'
    },
    statCard: {
      background: 'white',
      borderRadius: '10px',
      padding: '20px',
      flex: '1',
      minWidth: '200px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      position: 'relative'
    },
    statTitle: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '10px',
      fontWeight: '400'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '10px'
    },
    statChange: {
      fontSize: '12px',
      fontWeight: '400',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      color: '#666'
    },
    statProgress: {
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      height: '4px',
      borderRadius: '0 0 10px 10px',
      overflow: 'hidden'
    },
    progressBarVentas: {
      height: '100%',
      background: 'linear-gradient(90deg, #FF1493 0%, #FF69B4 100%)',
      width: '78%'
    },
    progressBarGastos: {
      height: '100%',
      background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
      width: '65%'
    },
    realtimeCard: {
      background: 'white',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      height: 'fit-content'
    },
    realtimeHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
      flexWrap: 'wrap',
      gap: '10px'
    },
    realtimeTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    liveIndicator: {
      width: '8px',
      height: '8px',
      backgroundColor: '#4CAF50',
      borderRadius: '50%',
      animation: 'pulse 2s infinite'
    },
    sedeSelector: {
      padding: '6px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '12px',
      backgroundColor: 'white',
      cursor: 'pointer'
    },
    ventasList: {
      maxHeight: '400px',
      overflowY: 'auto',
      paddingRight: '5px'
    },
    ventaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 0',
      borderBottom: '1px solid #f0f0f0',
      animation: 'slideIn 0.5s ease-out'
    },
    ventaImagen: {
      width: '40px',
      height: '40px',
      borderRadius: '6px',
      objectFit: 'cover'
    },
    ventaInfo: {
      flex: '1',
      minWidth: '0'
    },
    ventaNombre: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#333',
      marginBottom: '2px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    ventaDetalles: {
      fontSize: '11px',
      color: '#666',
      display: 'flex',
      gap: '8px'
    },
    ventaPrecio: {
      fontSize: '12px',
      fontWeight: 'bold',
      color: '#FF1493',
      textAlign: 'right'
    },
    sedeTag: {
      fontSize: '10px',
      padding: '2px 6px',
      borderRadius: '10px',
      fontWeight: '500'
    },
    sedeSanPablo: {
      backgroundColor: '#FF1493',
      color: 'white'
    },
    sedeSanBenito: {
      backgroundColor: '#4CAF50',
      color: 'white'
    },
    chartCard: {
      background: 'white',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    chartHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '15px'
    },
    chartTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333'
    },
    controlsContainer: {
      display: 'flex',
      gap: '15px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    selectorContainer: {
      display: 'flex',
      gap: '5px'
    },
    selectorButton: {
      padding: '8px 16px',
      border: '1px solid #ddd',
      backgroundColor: 'white',
      color: '#666',
      fontSize: '12px',
      cursor: 'pointer',
      borderRadius: '4px',
      transition: 'all 0.2s'
    },
    selectorButtonActive: {
      padding: '8px 16px',
      border: '1px solid #FF1493',
      backgroundColor: '#FF1493',
      color: 'white',
      fontSize: '12px',
      cursor: 'pointer',
      borderRadius: '4px',
      transition: 'all 0.2s'
    },
    toggleContainer: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    },
    toggleButton: {
      padding: '6px 12px',
      border: '1px solid #ddd',
      backgroundColor: 'white',
      color: '#666',
      fontSize: '11px',
      cursor: 'pointer',
      borderRadius: '4px',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    toggleButtonActive: {
      padding: '6px 12px',
      border: '1px solid #FF1493',
      backgroundColor: '#FF1493',
      color: 'white',
      fontSize: '11px',
      cursor: 'pointer',
      borderRadius: '4px',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    toggleButtonGastos: {
      padding: '6px 12px',
      border: '1px solid #ddd',
      backgroundColor: 'white',
      color: '#666',
      fontSize: '11px',
      cursor: 'pointer',
      borderRadius: '4px',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    toggleButtonGastosActive: {
      padding: '6px 12px',
      border: '1px solid #888',
      backgroundColor: '#888',
      color: 'white',
      fontSize: '11px',
      cursor: 'pointer',
      borderRadius: '4px',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    colorIndicator: {
      width: '8px',
      height: '8px',
      borderRadius: '50%'
    }
  };

  const formatearValor = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ 
              margin: '5px 0 0 0', 
              color: entry.color,
              fontSize: '12px'
            }}>
              {entry.name}: {formatearValor(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.dashboard}>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
      <div style={styles.container}>
        <h1 style={styles.header}>Dashboard</h1>
        
        <div style={styles.mainContent}>
          {/* Sección Izquierda */}
          <div style={styles.leftSection}>
            {/* Stats Cards */}
            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <div style={styles.statTitle}>Ventas totales</div>
                <div style={styles.statValue}>$ 354.200</div>
                <div style={styles.statProgress}>
                  <div style={styles.progressBarVentas}></div>
                </div>
              </div>
              
              <div style={styles.statCard}>
                <div style={styles.statTitle}>Gastos totales</div>
                <div style={styles.statValue}>$ 49.600</div>
                <div style={styles.statProgress}>
                  <div style={styles.progressBarGastos}></div>
                </div>
              </div>
            </div>

            {/* Chart dentro de la sección izquierda */}
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <h3 style={styles.chartTitle}>
                  {periodoSeleccionado === 'diario' ? 'Ventas y Gastos Diarios' :
                   periodoSeleccionado === 'semanal' ? 'Ventas y Gastos Semanales' :
                   'Ventas y Gastos Mensuales'}
                </h3>
                
                <div style={styles.controlsContainer}>
                  {/* Selector de Período */}
                  <div style={styles.selectorContainer}>
                    <button
                      style={periodoSeleccionado === 'diario' ? styles.selectorButtonActive : styles.selectorButton}
                      onClick={() => setPeriodoSeleccionado('diario')}
                    >
                      Diario
                    </button>
                    <button
                      style={periodoSeleccionado === 'semanal' ? styles.selectorButtonActive : styles.selectorButton}
                      onClick={() => setPeriodoSeleccionado('semanal')}
                    >
                      Semanal
                    </button>
                    <button
                      style={periodoSeleccionado === 'mensual' ? styles.selectorButtonActive : styles.selectorButton}
                      onClick={() => setPeriodoSeleccionado('mensual')}
                    >
                      Mensual
                    </button>
                  </div>

                  {/* Toggle Buttons */}
                  <div style={styles.toggleContainer}>
                    <button
                      style={mostrarVentas ? styles.toggleButtonActive : styles.toggleButton}
                      onClick={() => setMostrarVentas(!mostrarVentas)}
                    >
                      <div style={{...styles.colorIndicator, backgroundColor: '#FF1493'}}></div>
                      Ventas
                    </button>
                    <button
                      style={mostrarGastos ? styles.toggleButtonGastosActive : styles.toggleButtonGastos}
                      onClick={() => setMostrarGastos(!mostrarGastos)}
                    >
                      <div style={{...styles.colorIndicator, backgroundColor: '#888'}}></div>
                      Gastos
                    </button>
                  </div>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={obtenerDatos()} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="periodo" 
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    fontSize={11}
                    tickFormatter={(value) => `$${(value / 1000)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {mostrarVentas && (
                    <Bar 
                      dataKey="ventas" 
                      fill="#FF1493" 
                      radius={[2, 2, 0, 0]} 
                      name="Ventas"
                    />
                  )}
                  {mostrarGastos && (
                    <Bar 
                      dataKey="gastos" 
                      fill="#888888" 
                      radius={[2, 2, 0, 0]} 
                      name="Gastos"
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sección Derecha - Ventas en Tiempo Real */}
          <div style={styles.rightSection}>
            <div style={styles.realtimeCard}>
              <div style={styles.realtimeHeader}>
                <div style={styles.realtimeTitle}>
                  <div style={styles.liveIndicator}></div>
                  Ventas en Tiempo Real
                </div>
                <select 
                  style={styles.sedeSelector}
                  value={sedeSeleccionada}
                  onChange={(e) => setSedeSeleccionada(e.target.value)}
                >
                  <option value="todas">Todas las sedes</option>
                  <option value="San Pablo">San Pablo</option>
                  <option value="San Benito">San Benito</option>
                </select>
              </div>
              
              <div style={styles.ventasList}>
                {ventasFiltradas.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                    Esperando ventas...
                  </div>
                ) : (
                  ventasFiltradas.map((venta) => (
                    <div key={venta.id} style={styles.ventaItem}>
                      <img 
                        src={venta.imagen} 
                        alt={venta.producto}
                        style={styles.ventaImagen}
                      />
                      <div style={styles.ventaInfo}>
                        <div style={styles.ventaNombre}>{venta.producto}</div>
                        <div style={styles.ventaDetalles}>
                          <span>x{venta.cantidad}</span>
                          <span 
                            style={{
                              ...styles.sedeTag,
                              ...(venta.sede === 'San Pablo' ? styles.sedeSanPablo : styles.sedeSanBenito)
                            }}
                          >
                            {venta.sede}
                          </span>
                        </div>
                      </div>
                      <div style={styles.ventaPrecio}>
                        {formatearValor(venta.precio * venta.cantidad)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;