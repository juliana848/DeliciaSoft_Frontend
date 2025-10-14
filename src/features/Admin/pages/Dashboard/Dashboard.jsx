import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ventaApiService from '../../services/venta_services';
import compraApiService from '../../services/compras_services';
import productosApiService from '../../services/productos_services';

// Importar estilos y componentes
import { styles, globalStyles } from './DashboardStyles';
import { 
  LoadingSpinner, 
  NoData, 
  ErrorMessage, 
  StatCard, 
  VentaItem, 
  CustomTooltip,
  TortaComponent 
} from './DashboardComponents';

// ✅ IMPORTAR HELPERS CORREGIDOS
import { 
  procesarDatosCompras, 
  procesarDatosVentas, 
  procesarVentasPorCategoria 
} from './dashboardHelpers';

// ✅ FUNCIÓN AUXILIAR PARA CONVERTIR FECHAS (LA MISMA QUE EN HELPERS)
const convertirFechaAColombiaDesdeString = (fechaStr) => {
  if (!fechaStr) return null;
  const soloFecha = fechaStr.split('T')[0];
  return new Date(`${soloFecha}T00:00:00-05:00`);
};

const Dashboard = () => {
  // Estados
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('diario');
  const [mostrarVentas, setMostrarVentas] = useState(true);
  const [mostrarCompras, setMostrarCompras] = useState(true);
  const [sedeSeleccionada, setSedeSeleccionada] = useState('todas');
  const [sedeSeleccionadaTotales, setSedeSeleccionadaTotales] = useState('todas');
  const [ventasRealTime, setVentasRealTime] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [periodoTorta, setPeriodoTorta] = useState('diario');
  const [mostrarPorcentajes, setMostrarPorcentajes] = useState(false);
  const [tortaExpandida, setTortaExpandida] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [datosVentas, setDatosVentas] = useState({
    diarios: [],
    semanales: [],
    mensuales: []
  });
  const [datosCompras, setDatosCompras] = useState({
    diarios: [],
    semanales: [],
    mensuales: []
  });
  const [datosCategorias, setDatosCategorias] = useState({
    diarias: [],
    semanales: [],
    mensuales: []
  });

  // Función para cargar sedes
  const cargarSedes = async () => {
    try {
      const sedesObtenidas = await ventaApiService.obtenerSedes();
      setSedes(sedesObtenidas);
      console.log('🏢 Sedes cargadas:', sedesObtenidas);
    } catch (error) {
      console.error('❌ Error al cargar sedes:', error);
    }
  };

  // ✅ FUNCIÓN PRINCIPAL CORREGIDA
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 === INICIANDO CARGA DE DATOS DEL DASHBOARD ===');
      
      // Obtener fecha y hora actual de Colombia
      const ahora = new Date();
      const hoyColombia = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
      
      console.log('🕐 Fecha/Hora actual Colombia:', hoyColombia.toLocaleString('es-CO'));
      console.log('📅 Día de la semana:', ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][hoyColombia.getDay()]);

      let ventas = [];
      let ventasDetalladas = [];
      let compras = [];
      
      // PASO 1: Obtener ventas básicas
      try {
        ventas = await ventaApiService.obtenerVentas();
        console.log(`✅ ${ventas.length} ventas básicas obtenidas`);
      } catch (ventasError) {
        console.error('❌ Error al obtener ventas:', ventasError);
        setError('No se pudieron cargar las ventas');
        ventas = [];
      }

      // PASO 2: Obtener detalles completos con CATEGORÍAS
      if (ventas.length > 0) {
        console.log(`🔍 Obteniendo detalles completos de ${ventas.length} ventas...`);
        
        const detallesPromises = ventas.map(async (venta) => {
          try {
            const ventaCompleta = await ventaApiService.obtenerVentaPorId(venta.idVenta);
            
            // ✅ VERIFICAR QUE TENGA CATEGORÍAS
            if (ventaCompleta && ventaCompleta.detalleVenta) {
              ventaCompleta.detalleVenta.forEach(detalle => {
                if (!detalle.categoria && !detalle.productogeneral?.categoria) {
                  console.warn(`⚠️ Producto sin categoría en venta ${venta.idVenta}:`, detalle.nombreProducto);
                }
              });
            }
            
            return ventaCompleta;
          } catch (err) {
            console.warn(`⚠️ No se pudo obtener detalle de venta ${venta.idVenta}:`, err.message);
            return null;
          }
        });

        const detallesResultados = await Promise.all(detallesPromises);
        ventasDetalladas = detallesResultados.filter(v => v !== null);
        console.log(`✅ ${ventasDetalladas.length} ventas detalladas obtenidas`);
      }

      // PASO 3: Obtener compras
      try {
        compras = await compraApiService.obtenerCompras();
        console.log(`✅ ${compras.length} compras obtenidas`);
      } catch (comprasError) {
        console.error('⚠️ Error al obtener compras:', comprasError);
        compras = [];
      }

      // PASO 4: Procesar datos de ventas para gráficos
      if (ventas.length > 0) {
        const datosVentasProcesados = procesarDatosVentas(ventas, hoyColombia);
        setDatosVentas({
          diarios: datosVentasProcesados.datosDiarios,
          semanales: datosVentasProcesados.datosSemanales,
          mensuales: datosVentasProcesados.datosMensuales
        });
        console.log('✅ Datos de ventas procesados para gráficos');
      } else {
        // Datos vacíos con estructura correcta
        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        setDatosVentas({
          diarios: diasSemana.map(dia => ({ periodo: dia, ventas: 0 })),
          semanales: Array(4).fill(0).map((_, i) => ({ periodo: `Semana ${i + 1}`, ventas: 0 })),
          mensuales: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
                      .map(mes => ({ periodo: mes, ventas: 0 }))
        });
      }

      // PASO 5: Procesar datos de compras
      if (compras.length > 0) {
        const datosComprasProcesados = procesarDatosCompras(compras, hoyColombia);
        setDatosCompras({
          diarios: datosComprasProcesados.datosDiarios,
          semanales: datosComprasProcesados.datosSemanales,
          mensuales: datosComprasProcesados.datosMensuales
        });
        console.log('✅ Datos de compras procesados');
      } else {
        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        setDatosCompras({
          diarios: diasSemana.map(dia => ({ periodo: dia, compras: 0 })),
          semanales: Array(4).fill(0).map((_, i) => ({ periodo: `Semana ${i + 1}`, compras: 0 })),
          mensuales: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
                      .map(mes => ({ periodo: mes, compras: 0 }))
        });
      }

      // PASO 6: Procesar categorías
      if (ventasDetalladas.length > 0) {
        const inicioDia = new Date(hoyColombia);
        inicioDia.setHours(0, 0, 0, 0);
        
        const inicioSemana = new Date(hoyColombia);
        inicioSemana.setDate(hoyColombia.getDate() - hoyColombia.getDay());
        inicioSemana.setHours(0, 0, 0, 0);
        
        const inicioMes = new Date(hoyColombia.getFullYear(), hoyColombia.getMonth(), 1);
        
        console.log('📊 Procesando categorías más vendidas...');
        const categoriasDiarias = procesarVentasPorCategoria(ventasDetalladas, inicioDia, hoyColombia);
        const categoriasSemanales = procesarVentasPorCategoria(ventasDetalladas, inicioSemana, hoyColombia);
        const categoriasMensuales = procesarVentasPorCategoria(ventasDetalladas, inicioMes, hoyColombia);
        
        console.log('✅ Categorías diarias:', categoriasDiarias.length);
        console.log('✅ Categorías semanales:', categoriasSemanales.length);
        console.log('✅ Categorías mensuales:', categoriasMensuales.length);
        
        setDatosCategorias({
          diarias: categoriasDiarias,
          semanales: categoriasSemanales,
          mensuales: categoriasMensuales
        });
      } else {
        setDatosCategorias({
          diarias: [],
          semanales: [],
          mensuales: []
        });
      }

      // PASO 7: Procesar ventas en tiempo real - USANDO LA MISMA LÓGICA
      if (ventasDetalladas.length > 0) {
        console.log('⏱️ Procesando ventas en tiempo real...');
        
        const ventasRecientes = ventasDetalladas
          .sort((a, b) => new Date(b.fechaVenta) - new Date(a.fechaVenta))
          .slice(0, 5)
          .map(venta => {
            const detalle = (venta.detalleVenta || [])[0] || {};
            
            // ✅ USAR LA MISMA CONVERSIÓN QUE EN HELPERS
            const fechaStr = venta.fechaVenta;
            const fechaColombia = convertirFechaAColombiaDesdeString(fechaStr);
            
            return {
              idVenta: venta.idVenta,
              producto: detalle.nombreProducto || 'Producto',
              cantidad: parseInt(detalle.cantidad || 0),
              precio: parseFloat(detalle.subtotal || 0),
              imagen: '',
              sede: venta.nombreSede || 'Sede principal',
              timestamp: fechaColombia,
              fechaOriginal: venta.fechaVenta
            };
          });

        setVentasRealTime(ventasRecientes);
        console.log(`✅ ${ventasRecientes.length} ventas en tiempo real procesadas`);
        if (ventasRecientes.length > 0) {
          console.log('📅 Primera venta:', ventasRecientes[0].timestamp?.toLocaleString('es-CO'));
        }
      } else {
        setVentasRealTime([]);
      }

      console.log('=== ✅ CARGA DE DATOS COMPLETADA ===');
    } catch (err) {
      console.error('❌ Error general al cargar datos:', err);
      setError('Error al cargar los datos del dashboard: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar ventas en tiempo real con imágenes
  const cargarVentasEnTiempoReal = async () => {
    try {
      console.log('🔄 Actualizando ventas en tiempo real...');
      const ventas = await ventaApiService.obtenerVentas();

      const ventasOrdenadas = ventas
        .sort((a, b) => new Date(b.fechaVenta) - new Date(a.fechaVenta))
        .slice(0, 5);

      const ventasProcesadas = await Promise.all(
        ventasOrdenadas.map(async (venta) => {
          try {
            const ventaConDetalles = await ventaApiService.obtenerVentaPorId(venta.idVenta);
            const detalle = ventaConDetalles.detalleVenta?.[0];

            if (!detalle) return null;

            const productoInfo = await productosApiService.obtenerProductoPorId(detalle.idproductogeneral);

            return {
              idVenta: venta.idVenta,
              producto: productoInfo.nombre || productoInfo.nombreproducto || 'Producto N/A',
              cantidad: parseInt(detalle.cantidad || '0'),
              precio: parseFloat(detalle.subtotal || '0'),
              imagen: productoInfo.urlimagen || productoInfo.imagenes?.urlimg || '',
              sede: venta.nombreSede || 'Sede principal',
              timestamp: new Date(venta.fechaVenta)
            };
          } catch (error) {
            console.error(`Error al procesar venta ${venta.idVenta}:`, error);
            return null;
          }
        })
      );

      const ventasValidas = ventasProcesadas.filter(v => v !== null);
      setVentasRealTime(ventasValidas);
      console.log(`✅ ${ventasValidas.length} ventas actualizadas`);
    } catch (error) {
      console.error('❌ Error al cargar ventas en tiempo real:', error);
    }
  };

  // Effect para cargar datos iniciales
  useEffect(() => {
    cargarSedes();
    cargarDatos();
    cargarVentasEnTiempoReal();
    
    const intervaloRealTime = setInterval(cargarVentasEnTiempoReal, 30000);
    const intervaloEstadisticas = setInterval(cargarDatos, 300000);
    
    return () => {
      clearInterval(intervaloRealTime);
      clearInterval(intervaloEstadisticas);
    };
  }, []);

  // Cálculos usando useMemo
  const obtenerDatosCalculados = useMemo(() => {
    const datosVentasActuales = datosVentas[periodoSeleccionado === 'diario' ? 'diarios' : 
                                          periodoSeleccionado === 'semanal' ? 'semanales' : 'mensuales'];
    const datosComprasActuales = datosCompras[periodoSeleccionado === 'diario' ? 'diarios' : 
                                            periodoSeleccionado === 'semanal' ? 'semanales' : 'mensuales'];

    return datosVentasActuales.map((dato, index) => ({
      periodo: dato.periodo,
      ventas: dato.ventas,
      compras: datosComprasActuales[index]?.compras || 0
    }));
  }, [periodoSeleccionado, datosVentas, datosCompras]);

  // ✅ CALCULAR TOTALES DIARIOS CORREGIDO
  const calcularTotalesDiarios = useMemo(() => {
    const ahora = new Date();
    const hoy = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    hoy.setHours(0, 0, 0, 0);
    const finHoy = new Date(hoy);
    finHoy.setHours(23, 59, 59, 999);
    
    console.log('💰 === CALCULANDO TOTALES DIARIOS ===');
    console.log('📅 Rango hoy:', hoy.toLocaleString('es-CO'), 'hasta', finHoy.toLocaleString('es-CO'));
    console.log('🔢 Total ventas disponibles:', ventasRealTime.length);
    console.log('🏢 Sede seleccionada:', sedeSeleccionadaTotales);
    
    // Filtrar ventas del día actual
    const todasLasVentas = datosVentas.diarios?.flatMap(v => v.detalleVenta || []) || [];
    const ventasDiarias = todasLasVentas.filter(venta => {
      const fechaVenta = new Date(venta.fechaVenta || venta.timestamp);
      const esHoy = fechaVenta >= hoy && fechaVenta <= finHoy;
      const cumpleSede = sedeSeleccionadaTotales === 'todas' || venta.sede === sedeSeleccionadaTotales;
      return esHoy && cumpleSede;
    });

    const totalVentasDiarias = ventasDiarias.reduce((sum, venta) => sum + (venta.precio || 0), 0);
    
    console.log(`💵 Total ventas hoy: ${totalVentasDiarias} (${ventasDiarias.length} transacciones)`);

    // Obtener compras del día actual
    const diaActual = hoy.getDay();
    const comprasDiarias = datosCompras.diarios && datosCompras.diarios[diaActual] 
      ? datosCompras.diarios[diaActual].compras 
      : 0;
    
    console.log(`📦 Compras del día: ${comprasDiarias}`);
    
    const porcentajeVentas = totalVentasDiarias > 0 ? 100 : 0;
    const porcentajeCompras = (totalVentasDiarias > 0 && comprasDiarias > 0) 
      ? (comprasDiarias / totalVentasDiarias) * 100 
      : 0;

    console.log('=== ✅ FIN CÁLCULO TOTALES DIARIOS ===');

    return {
      ventas: totalVentasDiarias,
      compras: comprasDiarias,
      porcentajeVentas: `${Math.min(100, porcentajeVentas)}%`,
      porcentajeCompras: `${Math.min(100, porcentajeCompras)}%`,
      cantidadVentas: ventasDiarias.length
    };
  }, [ventasRealTime, sedeSeleccionadaTotales, datosCompras.diarios]);

  const obtenerDatosTorta = useMemo(() => {
    return datosCategorias[periodoTorta === 'diario' ? 'diarias' : 
                          periodoTorta === 'semanal' ? 'semanales' : 'mensuales'];
  }, [periodoTorta, datosCategorias]);

  const ventasFiltradas = useMemo(() => 
    ventasRealTime.filter(venta => 
      sedeSeleccionada === 'todas' || venta.sede === sedeSeleccionada
    ),
    [ventasRealTime, sedeSeleccionada]
  );

  return (
    <div style={styles.dashboard}>
      <style>{globalStyles}</style>
      
      <div style={styles.container}>
        <h1 style={styles.header}>Dashboard</h1>
        
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <div>
            {tortaExpandida && (
              <div style={styles.overlay} onClick={() => setTortaExpandida(false)} />
            )}
            
            <div style={styles.mainContent}>
              <div style={styles.leftSection}>
                <div style={styles.statsRow}>
                  <StatCard 
                    titulo={`Ventas de Hoy ${sedeSeleccionadaTotales !== 'todas' ? `(${sedeSeleccionadaTotales})` : '(Todas las sedes)'}`}
                    valor={calcularTotalesDiarios.ventas} 
                    porcentaje={calcularTotalesDiarios.porcentajeVentas} 
                    tipo="ventas" 
                  />
                  <StatCard 
                    titulo="Compras de Hoy" 
                    valor={calcularTotalesDiarios.compras} 
                    porcentaje={calcularTotalesDiarios.porcentajeCompras} 
                    tipo="compras" 
                  />
                  <div style={styles.sedeFilterCard}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                      Filtrar totales por sede
                    </div>
                    <select 
                      style={styles.sedeSelector} 
                      value={sedeSeleccionadaTotales} 
                      onChange={(e) => setSedeSeleccionadaTotales(e.target.value)}
                    >
                      <option value="todas">Todas las sedes</option>
                      {sedes.map(sede => (
                        <option key={sede.idsede} value={sede.nombre}>
                          {sede.nombre}
                        </option>
                      ))}
                    </select>
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
                      {calcularTotalesDiarios.cantidadVentas} ventas realizadas hoy
                    </div>
                  </div>
                </div>

                <div style={styles.chartCard}>
                  <div style={styles.chartHeader}>
                    <h3 style={styles.chartTitle}>
                      {periodoSeleccionado === 'diario' ? 'Ventas y Compras Diarias' : 
                       periodoSeleccionado === 'semanal' ? 'Ventas y Compras Semanales' : 
                       'Ventas y Compras Mensuales'}
                    </h3>
                    <div style={styles.controlsContainer}>
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
                      <div style={styles.toggleContainer}>
                        <button 
                          style={mostrarVentas ? styles.toggleButtonActive : styles.toggleButton} 
                          onClick={() => setMostrarVentas(!mostrarVentas)}
                        >
                          <div style={{...styles.colorIndicator, backgroundColor: '#FF1493'}}></div>
                          Ventas
                        </button>
                        <button 
                          style={mostrarCompras ? styles.toggleButtonComprasActive : styles.toggleButtonCompras} 
                          onClick={() => setMostrarCompras(!mostrarCompras)}
                        >
                          <div style={{...styles.colorIndicator, backgroundColor: '#A9A9A9'}}></div>
                          Compras
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={250}>
                    {obtenerDatosCalculados.length === 0 ? (
                      <NoData mensaje="No hay datos de ventas o compras para mostrar" />
                    ) : (
                      <BarChart data={obtenerDatosCalculados} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="periodo" axisLine={false} tickLine={false} fontSize={12} />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          fontSize={11} 
                          tickFormatter={(value) => `${(value / 1000)}k`} 
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {mostrarVentas && (
                          <Bar dataKey="ventas" fill="#FF1493" radius={[2, 2, 0, 0]} name="Ventas" />
                        )}
                        {mostrarCompras && (
                          <Bar dataKey="compras" fill="#A9A9A9" radius={[2, 2, 0, 0]} name="Compras" />
                        )}
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={styles.rightSection}>
                <div style={{ marginBottom: '30px' }}>
                  <TortaComponent 
                    periodoTorta={periodoTorta}
                    setPeriodoTorta={setPeriodoTorta}
                    mostrarPorcentajes={mostrarPorcentajes}
                    setMostrarPorcentajes={setMostrarPorcentajes}
                    setTortaExpandida={setTortaExpandida}
                    obtenerDatosTorta={obtenerDatosTorta}
                  />
                </div>
                
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
                      {sedes.map(sede => (
                        <option key={sede.idsede} value={sede.nombre}>
                          {sede.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.ventasList}>
                    {ventasFiltradas.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                        Esperando ventas...
                      </div>
                    ) : (
                      ventasFiltradas.map((venta) => (
                        <VentaItem key={venta.idVenta} venta={venta} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {tortaExpandida && (
              <TortaComponent 
                expanded={true}
                periodoTorta={periodoTorta}
                setPeriodoTorta={setPeriodoTorta}
                mostrarPorcentajes={mostrarPorcentajes}
                setMostrarPorcentajes={setMostrarPorcentajes}
                setTortaExpandida={setTortaExpandida}
                obtenerDatosTorta={obtenerDatosTorta}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;