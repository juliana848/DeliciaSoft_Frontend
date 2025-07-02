import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Dashboard = () => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('diario');
  const [mostrarVentas, setMostrarVentas] = useState(true);
  const [mostrarCompras, setMostrarCompras] = useState(true);
  const [sedeSeleccionada, setSedeSeleccionada] = useState('todas');
  const [ventasRealTime, setVentasRealTime] = useState([]);
  const [periodoTorta, setPeriodoTorta] = useState('diario');
  const [mostrarPorcentajes, setMostrarPorcentajes] = useState(false);
  const [tortaExpandida, setTortaExpandida] = useState(false);

  // Datos para diferentes períodos
  const datosDiarios = [
    { periodo: 'Lun', ventas: 4800, compras: 2200 },
    { periodo: 'Mar', ventas: 3600, compras: 1800 },
    { periodo: 'Mie', ventas: 5100, compras: 2400 },
    { periodo: 'Jue', ventas: 4200, compras: 2000 },
    { periodo: 'Vie', ventas: 5600, compras: 2800 },
    { periodo: 'Sab', ventas: 3100, compras: 1500 },
    { periodo: 'Dom', ventas: 3900, compras: 1900 }
  ];

  const datosSemanales = [
    { periodo: 'Semana 1', ventas: 28500, compras: 14200 },
    { periodo: 'Semana 2', ventas: 32100, compras: 15800 },
    { periodo: 'Semana 3', ventas: 29800, compras: 14500 },
    { periodo: 'Semana 4', ventas: 35200, compras: 17100 }
  ];

  const datosMensuales = [
    { periodo: 'Enero', ventas: 85000, compras: 42000 },
    { periodo: 'Febrero', ventas: 92000, compras: 45000 },
    { periodo: 'Marzo', ventas: 88000, compras: 43500 },
    { periodo: 'Abril', ventas: 95000, compras: 47000 },
    { periodo: 'Mayo', ventas: 102000, compras: 49500 },
    { periodo: 'Junio', ventas: 78000, compras: 38000 }
  ];

  // Datos de categorías diferenciados por período
  const categoriasDiarias = [
    { categoria: 'Fresas con Crema', ventas: 1200, color: '#FF1493' },
    { categoria: 'Obleas', ventas: 800, color: '#FF69B4' },
    { categoria: 'Cupcakes', ventas: 950, color: '#FFB6C1' },
    { categoria: 'Postres', ventas: 700, color: '#FF20B2' },
    { categoria: 'Tortas', ventas: 600, color: '#DC143C' },
    { categoria: 'Arroz con Leche', ventas: 450, color: '#FF8FA3' },
    { categoria: 'Sándwiches', ventas: 320, color: '#FF007F' }
  ];

  const categoriasSemanales = [
    { categoria: 'Fresas con Crema', ventas: 8400, color: '#FF1493' },
    { categoria: 'Obleas', ventas: 5600, color: '#FF69B4' },
    { categoria: 'Cupcakes', ventas: 6650, color: '#FFB6C1' },
    { categoria: 'Postres', ventas: 4900, color: '#FF20B2' },
    { categoria: 'Tortas', ventas: 4200, color: '#DC143C' },
    { categoria: 'Arroz con Leche', ventas: 3150, color: '#FF8FA3' },
    { categoria: 'Sándwiches', ventas: 2240, color: '#FF007F' }
  ];

  const categoriasMensuales = [
    { categoria: 'Fresas con Crema', ventas: 33600, color: '#FF1493' },
    { categoria: 'Obleas', ventas: 22400, color: '#FF69B4' },
    { categoria: 'Cupcakes', ventas: 26600, color: '#FFB6C1' },
    { categoria: 'Postres', ventas: 19600, color: '#FF20B2' },
    { categoria: 'Tortas', ventas: 16800, color: '#DC143C' },
    { categoria: 'Arroz con Leche', ventas: 12600, color: '#FF8FA3' },
    { categoria: 'Sándwiches', ventas: 8960, color: '#FF007F' }
  ];

  const productos = [
    { id: 1, nombre: 'Fresas con Crema', imagen: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=100&h=100&fit=crop&crop=center', precio: 8500, categoria: 'Fresas con Crema' },
    { id: 2, nombre: 'Obleas', imagen: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=100&h=100&fit=crop&crop=center', precio: 4500, categoria: 'Obleas' },
    { id: 3, nombre: 'Arroz con Leche', imagen: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=100&h=100&fit=crop&crop=center', precio: 6000, categoria: 'Arroz con Leche' },
    { id: 4, nombre: 'Cupcakes', imagen: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=100&h=100&fit=crop&crop=center', precio: 7200, categoria: 'Cupcakes' },
    { id: 5, nombre: 'Torta de Chocolate', imagen: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&h=100&fit=crop&crop=center', precio: 15000, categoria: 'Tortas' },
    { id: 6, nombre: 'Postre de Fresa', imagen: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=100&h=100&fit=crop&crop=center', precio: 5500, categoria: 'Postres' },
    { id: 7, nombre: 'Sándwich Club', imagen: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=100&h=100&fit=crop&crop=center', precio: 9500, categoria: 'Sándwiches' }
  ];

  const sedes = ['San Pablo', 'San Benito'];

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
        categoria: nuevoProducto.categoria,
        timestamp: new Date()
      };

      setVentasRealTime(prev => [nuevaVenta, ...prev].slice(0, 8));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const obtenerDatos = () => {
    switch (periodoSeleccionado) {
      case 'diario': return datosDiarios;
      case 'semanal': return datosSemanales;
      case 'mensual': return datosMensuales;
      default: return datosDiarios;
    }
  };

  const obtenerDatosTorta = useMemo(() => {
    switch (periodoTorta) {
      case 'diario': return categoriasDiarias;
      case 'semanal': return categoriasSemanales;
      case 'mensual': return categoriasMensuales;
      default: return categoriasDiarias;
    }
  }, [periodoTorta]);

  const ventasFiltradas = ventasRealTime.filter(venta => 
    sedeSeleccionada === 'todas' || venta.sede === sedeSeleccionada
  );

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
    progressBarCompras: {
      height: '100%',
      background: 'linear-gradient(90deg,rgb(238, 76, 233) 0%,rgb(244, 90, 218) 100%)',
      width: '65%'
    },
    realtimeCard: {
      background: 'white',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      height: 'fit-content',
      marginBottom: '20px'
    },
    tortaCard: {
      background: 'white',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      height: 'fit-content'
    },
    tortaCardExpanded: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'white',
      borderRadius: '10px',
      padding: '30px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      zIndex: 1000,
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      overflow: 'auto'
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 999
    },
    realtimeHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
      flexWrap: 'wrap',
      gap: '10px'
    },
    tortaHeader: {
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
    tortaTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333'
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
    tortaControls: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    ventasList: {
      maxHeight: '300px',
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
    toggleButtonCompras: {
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
    toggleButtonComprasActive: {
      padding: '6px 12px',
      border: '1px solid #FFB6C1', 
      backgroundColor: '#FFB6C1', 
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
    },
    expandButton: {
      padding: '6px 10px',
      border: '1px solid #ddd',
      backgroundColor: 'white',
      color: '#666',
      fontSize: '11px',
      cursor: 'pointer',
      borderRadius: '4px',
      transition: 'all 0.2s'
    },
    closeButton: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#666'
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
        <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '5px 0 0 0', color: entry.color, fontSize: '12px' }}>
              {entry.name}: {formatearValor(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = obtenerDatosTorta.reduce((sum, item) => sum + item.ventas, 0);
      const porcentaje = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: data.payload.color }}>{data.payload.categoria}</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>Ventas: {formatearValor(data.value)}</p>
          {mostrarPorcentajes && <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>Porcentaje: {porcentaje}%</p>}
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (!mostrarPorcentajes) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="11" fontWeight="bold">{`${(percent * 100).toFixed(0)}%`}</text>;
  };

  const CustomLegend = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
      {obtenerDatosTorta.map((item, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', fontSize: '12px', maxWidth: '150px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: item.color, marginRight: '5px', borderRadius: '2px' }}></div>
          <span style={{ color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.categoria}</span>
        </div>
      ))}
    </div>
  );

  const TortaComponent = React.memo(({ expanded = false }) => (
    <div style={expanded ? styles.tortaCardExpanded : styles.tortaCard}>
      {expanded && <button style={styles.closeButton} onClick={() => setTortaExpandida(false)}>×</button>}
      <div style={styles.tortaHeader}>
        <div style={styles.tortaTitle}>Ventas por Categoría ({periodoTorta})</div>
        <div style={styles.tortaControls}>
          <div style={styles.selectorContainer}>
            <button style={periodoTorta === 'diario' ? styles.selectorButtonActive : styles.selectorButton} onClick={() => setPeriodoTorta('diario')}>Diario</button>
            <button style={periodoTorta === 'semanal' ? styles.selectorButtonActive : styles.selectorButton} onClick={() => setPeriodoTorta('semanal')}>Semanal</button>
            <button style={periodoTorta === 'mensual' ? styles.selectorButtonActive : styles.selectorButton} onClick={() => setPeriodoTorta('mensual')}>Mensual</button>
          </div>
          <button style={mostrarPorcentajes ? styles.toggleButtonActive : styles.toggleButton} onClick={() => setMostrarPorcentajes(!mostrarPorcentajes)}>%</button>
          {!expanded && <button style={styles.expandButton} onClick={() => setTortaExpandida(true)}>📊</button>}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={expanded ? 400 : 200}>
        <PieChart>
          <Pie data={obtenerDatosTorta} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} outerRadius={expanded ? 150 : 80} fill="#8884d8" dataKey="ventas">
            {obtenerDatosTorta.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
          {expanded && <Legend content={<CustomLegend />} />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  ));

  return (
    <div style={styles.dashboard}>
      <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } } @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }`}</style>
      
      {tortaExpandida && <div style={styles.overlay} onClick={() => setTortaExpandida(false)} />}
      
      <div style={styles.container}>
        <h1 style={styles.header}>Dashboard</h1>
        
        <div style={styles.mainContent}>
          <div style={styles.leftSection}>
            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <div style={styles.statTitle}>Ventas totales</div>
                <div style={styles.statValue}>$ 354.200</div>
                <div style={styles.statProgress}><div style={styles.progressBarVentas}></div></div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statTitle}>Compras totales</div>
                <div style={styles.statValue}>$ 49.600</div>
                <div style={styles.statProgress}><div style={styles.progressBarCompras}></div></div>
              </div>
            </div>

            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <h3 style={styles.chartTitle}>
                  {periodoSeleccionado === 'diario' ? 'Ventas y Compras Diarias' : periodoSeleccionado === 'semanal' ? 'Ventas y Compras Semanales' : 'Ventas y Compras Mensuales'}
                </h3>
                <div style={styles.controlsContainer}>
                  <div style={styles.selectorContainer}>
                    <button style={periodoSeleccionado === 'diario' ? styles.selectorButtonActive : styles.selectorButton} onClick={() => setPeriodoSeleccionado('diario')}>Diario</button>
                    <button style={periodoSeleccionado === 'semanal' ? styles.selectorButtonActive : styles.selectorButton} onClick={() => setPeriodoSeleccionado('semanal')}>Semanal</button>
                    <button style={periodoSeleccionado === 'mensual' ? styles.selectorButtonActive : styles.selectorButton} onClick={() => setPeriodoSeleccionado('mensual')}>Mensual</button>
                  </div>
                  <div style={styles.toggleContainer}>
                    <button style={mostrarVentas ? styles.toggleButtonActive : styles.toggleButton} onClick={() => setMostrarVentas(!mostrarVentas)}>
                      <div style={{...styles.colorIndicator, backgroundColor: '#FF1493'}}></div>Ventas
                    </button>
                    <button style={mostrarCompras ? styles.toggleButtonComprasActive : styles.toggleButtonCompras} onClick={() => setMostrarCompras(!mostrarCompras)}>
                      <div style={{...styles.colorIndicator, backgroundColor: '#FFB6C1'}}></div>Compras
                    </button>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={obtenerDatos()} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="periodo" axisLine={false} tickLine={false} fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} fontSize={11} tickFormatter={(value) => `${(value / 1000)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  {mostrarVentas && <Bar dataKey="ventas" fill="#FF1493" radius={[2, 2, 0, 0]} name="Ventas" />}
                  {mostrarCompras && <Bar dataKey="compras" fill="#FFB6C1" radius={[2, 2, 0, 0]} name="Compras" />}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={styles.rightSection}>
            <div style={{ marginBottom: '30px' }}>
              <TortaComponent />
            </div>
            <div style={styles.realtimeCard}>
              <div style={styles.realtimeHeader}>
                <div style={styles.realtimeTitle}>
                  <div style={styles.liveIndicator}></div>Ventas en Tiempo Real
                </div>
                <select style={styles.sedeSelector} value={sedeSeleccionada} onChange={(e) => setSedeSeleccionada(e.target.value)}>
                  <option value="todas">Todas las sedes</option>
                  <option value="San Pablo">San Pablo</option>
                  <option value="San Benito">San Benito</option>
                </select>
              </div>
              <div style={styles.ventasList}>
                {ventasFiltradas.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Esperando ventas...</div>
                ) : (
                  ventasFiltradas.map((venta) => (
                    <div key={venta.id} style={styles.ventaItem}>
                      <img src={venta.imagen} alt={venta.producto} style={styles.ventaImagen} />
                      <div style={styles.ventaInfo}>
                        <div style={styles.ventaNombre}>{venta.producto}</div>
                        <div style={styles.ventaDetalles}>
                          <span>x{venta.cantidad}</span>
                          <span style={{...styles.sedeTag, ...(venta.sede === 'San Pablo' ? styles.sedeSanPablo : styles.sedeSanBenito)}}>{venta.sede}</span>
                        </div>
                      </div>
                      <div style={styles.ventaPrecio}>{formatearValor(venta.precio * venta.cantidad)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {tortaExpandida && <TortaComponent expanded={true} />}
    </div>
  );
};

export default Dashboard;