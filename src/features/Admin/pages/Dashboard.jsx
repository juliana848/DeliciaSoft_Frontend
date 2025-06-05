import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [ventasTimeReal, setVentasTimeReal] = useState([
    { producto: 'Fresas con crema', cantidad: 12, color: '#FF1493' },
    { producto: 'Cupcakes', cantidad: 8, color: '#FF8C00' },
    { producto: 'Batiscacos', cantidad: 15, color: '#4ECDC4' },
    { producto: 'Galletas', cantidad: 11, color: '#45B7D1' },
    { producto: 'Mini donas', cantidad: 9, color: '#32CD32' }
  ]);

  const ventasDiarias = [
    { dia: 'Lun', semanaAnterior: 4500, semanaActual: 4800 },
    { dia: 'Mar', semanaAnterior: 3200, semanaActual: 3600 },
    { dia: 'Mie', semanaAnterior: 4800, semanaActual: 5100 },
    { dia: 'Jue', semanaAnterior: 3900, semanaActual: 4200 },
    { dia: 'Vie', semanaAnterior: 5200, semanaActual: 5600 },
    { dia: 'Sab', semanaAnterior: 2800, semanaActual: 3100 },
    { dia: 'Dom', semanaAnterior: 3600, semanaActual: 3900 }
  ];

  const ventasMensuales = [
    { mes: 'Marzo', mesAnterior: 75, mesActual: 85 },
    { mes: 'Abril', mesAnterior: 82, mesActual: 78 },
    { mes: 'Mayo', mesAnterior: 88, mesActual: 95 }
  ];

  // Simulación de actualización en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setVentasTimeReal(prev => 
        prev.map(item => ({
          ...item,
          cantidad: Math.max(5, item.cantidad + Math.floor(Math.random() * 3) - 1)
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const styles = {
    dashboard: {
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      padding: '20px',
      color: '#333'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '30px',
      color: '#333'
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
    chartsRow: {
      display: 'flex',
      gap: '20px',
      marginBottom: '30px',
      flexWrap: 'wrap'
    },
    chartCard: {
      background: 'white',
      borderRadius: '10px',
      padding: '20px',
      flex: '2',
      minWidth: '400px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    sideCard: {
      background: 'white',
      borderRadius: '10px',
      padding: '20px',
      flex: '1',
      minWidth: '300px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    chartTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '20px',
      color: '#333'
    },
    chartLegend: {
      display: 'flex',
      gap: '15px',
      marginBottom: '15px',
      fontSize: '12px'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    legendColor: {
      width: '12px',
      height: '12px',
      borderRadius: '2px'
    },
    monthlyItem: {
      marginBottom: '15px'
    },
    monthlyLabel: {
      fontSize: '14px',
      fontWeight: '400',
      marginBottom: '8px',
      color: '#333',
      display: 'flex',
      justifyContent: 'space-between'
    },
    monthlyBar: {
      width: '100%'
    },
    realtimeItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '12px',
      padding: '8px 0'
    },
    realtimeIcon: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      marginRight: '12px'
    },
    realtimeText: {
      flex: 1
    },
    realtimeProduct: {
      fontSize: '13px',
      fontWeight: '400',
      color: '#333',
      marginBottom: '2px'
    },
    realtimeCantidad: {
      fontSize: '11px',
      color: '#666'
    },
    onlineIndicator: {
      width: '8px',
      height: '8px',
      backgroundColor: '#4CAF50',
      borderRadius: '50%',
      display: 'inline-block',
      marginRight: '8px'
    }
  };

  return (
    <div style={styles.dashboard}>
      <div style={styles.container}>
        <h1 style={styles.header}>Dashboard</h1>
        
        {/* Stats Cards */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statTitle}>Ventas totales</div>
            <div style={styles.statValue}>$ 1.247.500</div>
            <div style={styles.statChange}>
              125 unidades/mes <span style={{color: '#4CAF50', marginLeft: '10px'}}>↗ 12.3%</span>
            </div>
            <div style={styles.statProgress}>
              <div style={styles.progressBarVentas}></div>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statTitle}>Gastos totales</div>
            <div style={styles.statValue}>$ 485.000</div>
            <div style={styles.statChange}>
              Meta: $520.000 <span style={{color: '#4CAF50', marginLeft: '10px'}}>↗ 6.7%</span>
            </div>
            <div style={styles.statProgress}>
              <div style={styles.progressBarGastos}></div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={styles.chartsRow}>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Ventas diarias</h3>
            <div style={styles.chartLegend}>
              <div style={styles.legendItem}>
                <div style={{...styles.legendColor, backgroundColor: '#CCCCCC'}}></div>
                <span>Semana anterior</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{...styles.legendColor, backgroundColor: '#FF1493'}}></div>
                <span>Esta semana</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ventasDiarias} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="dia" 
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="semanaAnterior" fill="#CCCCCC" radius={[2, 2, 0, 0]} />
                <Bar dataKey="semanaActual" fill="#FF1493" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.sideCard}>
            <h3 style={styles.chartTitle}>
              Ventas en tiempo real
              <span style={styles.onlineIndicator}></span>
            </h3>
            {ventasTimeReal.map((item, index) => (
              <div key={index} style={styles.realtimeItem}>
                <div style={{...styles.realtimeIcon, backgroundColor: item.color}}></div>
                <div style={styles.realtimeText}>
                  <div style={styles.realtimeProduct}>{item.producto}</div>
                  <div style={styles.realtimeCantidad}>{item.cantidad} unidades</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Sales */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Ventas mensuales</h3>
          <div style={styles.chartLegend}>
            <div style={styles.legendItem}>
              <div style={{...styles.legendColor, backgroundColor: '#CCCCCC'}}></div>
              <span>Mes anterior</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{...styles.legendColor, backgroundColor: '#FFD700'}}></div>
              <span>Este mes</span>
            </div>
          </div>
          {ventasMensuales.map((item, index) => (
            <div key={index} style={styles.monthlyItem}>
              <div style={styles.monthlyLabel}>
                <span>{item.mes}</span>
              </div>
              <div style={styles.monthlyBar}>
                <div 
                  style={{
                    height: '15px',
                    backgroundColor: '#CCCCCC',
                    borderRadius: '0px',
                    width: `${item.mesAnterior}%`,
                    marginBottom: '6px'
                  }}
                ></div>
                <div 
                  style={{
                    height: '15px',
                    backgroundColor: '#FFD700',
                    borderRadius: '0px',
                    width: `${item.mesActual}%`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;