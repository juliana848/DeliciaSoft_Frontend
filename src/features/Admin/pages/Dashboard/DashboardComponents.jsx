import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { styles } from './DashboardStyles';
import { formatearValor } from './dashboardHelpers';

// Componente de carga
export const LoadingSpinner = ({ mensaje = 'Cargando datos...' }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '150px',
    flexDirection: 'column',
    gap: '8px'
  }}>
    <div className="loading-spinner"></div>
    <div style={{ fontSize: '12px' }}>{mensaje}</div>
  </div>
);

// Componente para mostrar cuando no hay datos
export const NoData = ({ mensaje = 'No hay datos disponibles' }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '150px',
    color: '#666',
    flexDirection: 'column',
    gap: '8px'
  }}>
    <span style={{ fontSize: '20px' }}>📊</span>
    <div style={{ fontSize: '12px' }}>{mensaje}</div>
  </div>
);

// Componente de error
export const ErrorMessage = ({ message }) => (
  <div style={{ 
    padding: '15px', 
    backgroundColor: '#ffebee', 
    color: '#c62828', 
    borderRadius: '4px',
    margin: '15px 0',
    fontSize: '12px'
  }}>
    {message}
  </div>
);

// Componente de tarjeta de estadísticas
export const StatCard = ({ titulo, valor, porcentaje, tipo }) => (
  <div style={styles.statCard}>
    <div style={styles.statTitle}>{titulo}</div>
    <div style={styles.statValue}>{formatearValor(valor)}</div>
    <div style={styles.statProgress}>
      <div style={{
        ...( tipo === 'ventas' ? styles.progressBarVentas : styles.progressBarCompras),
        width: porcentaje
      }}></div>
    </div>
  </div>
);

// Componente de item de venta
export const VentaItem = ({ venta }) => (
  <div style={styles.ventaItem}>
    <img src={venta.imagen} alt={venta.producto} style={styles.ventaImagen} />
    <div style={styles.ventaInfo}>
      <div style={styles.ventaNombre}>{venta.producto}</div>
      <div style={styles.ventaDetalles}>
        <span>x{venta.cantidad}</span>
        <span style={{...styles.sedeTag, backgroundColor: '#FF1493', color: 'white'}}>
          {venta.sede}
        </span>
      </div>
    </div>
    <div style={styles.ventaPrecio}>
      {formatearValor(venta.precio * venta.cantidad)}
    </div>
  </div>
);

// Custom Tooltip para gráficos de barras
export const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        padding: '8px', 
        border: '1px solid #ccc', 
        borderRadius: '4px', 
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        fontSize: '11px'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '4px 0 0 0', color: entry.color, fontSize: '10px' }}>
            {entry.name}: {formatearValor(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Tooltip para gráfico de torta
export const CustomPieTooltip = ({ active, payload, obtenerDatosTorta, mostrarPorcentajes }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = obtenerDatosTorta.reduce((sum, item) => sum + item.ventas, 0);
    const porcentaje = ((data.value / total) * 100).toFixed(1);
    
    return (
      <div style={{ 
        backgroundColor: 'white', 
        padding: '8px', 
        border: '1px solid #ccc', 
        borderRadius: '4px', 
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        fontSize: '11px'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: data.payload.color }}>
          {data.payload.categoria}
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '10px' }}>
          Ventas: {formatearValor(data.value)}
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '10px' }}>
          Cantidad: {data.payload.cantidad} unidades
        </p>
        {mostrarPorcentajes && (
          <p style={{ margin: '4px 0 0 0', fontSize: '10px' }}>
            Porcentaje: {porcentaje}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Renderizar etiquetas personalizadas en torta
export const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }, mostrarPorcentajes) => {
  if (!mostrarPorcentajes) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central" 
      fontSize="9" 
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Leyenda personalizada
export const CustomLegend = ({ obtenerDatosTorta }) => (
  <div style={{ 
    display: 'flex', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    gap: '10px', 
    marginTop: '15px' 
  }}>
    {obtenerDatosTorta.map((item, index) => (
      <div key={index} style={{ 
        display: 'flex', 
        alignItems: 'center', 
        fontSize: '10px', 
        maxWidth: '120px' 
      }}>
        <div style={{ 
          width: '10px', 
          height: '10px', 
          backgroundColor: item.color, 
          marginRight: '4px', 
          borderRadius: '2px' 
        }}></div>
        <span style={{ 
          color: '#333', 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis' 
        }}>
          {item.categoria}
        </span>
      </div>
    ))}
  </div>
);

export const TortaComponent = React.memo(({ 
  expanded = false, 
  periodoTorta, 
  setPeriodoTorta, 
  mostrarPorcentajes, 
  setMostrarPorcentajes, 
  setTortaExpandida, 
  obtenerDatosTorta 
}) => (
  <div style={expanded ? styles.tortaCardExpanded : styles.tortaCard}>
    {expanded && (
      <button 
        style={styles.closeButton} 
        onClick={() => setTortaExpandida(false)}
      >
        ×
      </button>
    )}
    <div style={styles.tortaHeader}>
      <div style={styles.tortaTitle}>
        Categorías Más Vendidas ({periodoTorta})
      </div>
      <div style={styles.tortaControls}>
        <div style={styles.selectorContainer}>
          <button 
            style={periodoTorta === 'diario' ? styles.selectorButtonActive : styles.selectorButton} 
            onClick={() => setPeriodoTorta('diario')}
          >
            Diario
          </button>
          <button 
            style={periodoTorta === 'semanal' ? styles.selectorButtonActive : styles.selectorButton} 
            onClick={() => setPeriodoTorta('semanal')}
          >
            Semanal
          </button>
          <button 
            style={periodoTorta === 'mensual' ? styles.selectorButtonActive : styles.selectorButton} 
            onClick={() => setPeriodoTorta('mensual')}
          >
            Mensual
          </button>
        </div>
        <button 
          style={mostrarPorcentajes ? styles.toggleButtonActive : styles.toggleButton} 
          onClick={() => setMostrarPorcentajes(!mostrarPorcentajes)}
        >
          %
        </button>
        {!expanded && (
          <button 
            style={styles.expandButton} 
            onClick={() => setTortaExpandida(true)}
          >
            📊
          </button>
        )}
      </div>
    </div>
    {obtenerDatosTorta.length === 0 ? (
      <NoData mensaje="No hay ventas registradas en este período" />
    ) : (
      <ResponsiveContainer width="100%" height={expanded ? 350 : 130}>
        <PieChart>
          <Pie 
            data={obtenerDatosTorta} 
            cx="50%" 
            cy="50%" 
            labelLine={false} 
            label={(props) => renderCustomizedLabel(props, mostrarPorcentajes)} 
            outerRadius={expanded ? 130 : 50} 
            fill="#8884d8" 
            dataKey="ventas"
          >
            {obtenerDatosTorta.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={(props) => (
            <CustomPieTooltip 
              {...props} 
              obtenerDatosTorta={obtenerDatosTorta} 
              mostrarPorcentajes={mostrarPorcentajes} 
            />
          )} />
          {expanded && <Legend content={() => <CustomLegend obtenerDatosTorta={obtenerDatosTorta} />} />}
        </PieChart>
      </ResponsiveContainer>
    )}
  </div>
));