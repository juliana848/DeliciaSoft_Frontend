import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import ventaApiService from '../services/venta_services';
import compraApiService from '../services/compras_services';
import productosApiService from '../services/productos_services';

const Dashboard = () => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('diario');
  const [mostrarVentas, setMostrarVentas] = useState(true);
  const [mostrarCompras, setMostrarCompras] = useState(true);
  const [sedeSeleccionada, setSedeSeleccionada] = useState('todas');
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

  // Funciones para procesar datos
  const procesarDatosCompras = (compras) => {
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    // Inicializar acumuladores
    const comprasDiarias = new Array(7).fill(0);
    const comprasSemanales = new Array(4).fill(0);
    const comprasMensuales = new Array(12).fill(0);

    // Procesar cada compra
    compras.forEach(compra => {
      const fecha = new Date(compra.fechacompra || compra.fechaCompra);
      const dia = fecha.getDay(); // 0-6
      const mes = fecha.getMonth(); // 0-11
      const semana = Math.floor(fecha.getDate() / 7); // 0-3
      const total = parseFloat(compra.total || 0);

      comprasDiarias[dia] += total;
      if (semana < 4) comprasSemanales[semana] += total;
      comprasMensuales[mes] += total;
    });

    // Formatear datos
    const datosDiarios = diasSemana.map((dia, index) => ({
      periodo: dia,
      compras: comprasDiarias[index]
    }));

    const datosSemanales = comprasSemanales.map((total, index) => ({
      periodo: `Semana ${index + 1}`,
      compras: total
    }));

    const datosMensuales = meses.map((mes, index) => ({
      periodo: mes,
      compras: comprasMensuales[index]
    }));

    return { datosDiarios, datosSemanales, datosMensuales };
  };

  const procesarDatosVentas = (ventas) => {
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    // Inicializar acumuladores
    const ventasDiarias = new Array(7).fill(0);
    const ventasSemanales = new Array(4).fill(0);
    const ventasMensuales = new Array(12).fill(0);

    // Procesar cada venta
    ventas.forEach(venta => {
      const fecha = new Date(venta.fechaventa || venta.fechaVenta);
      const dia = fecha.getDay(); // 0-6
      const mes = fecha.getMonth(); // 0-11
      const semana = Math.floor(fecha.getDate() / 7); // 0-3
      const total = parseFloat(venta.total || 0);

      ventasDiarias[dia] += total;
      if (semana < 4) ventasSemanales[semana] += total;
      ventasMensuales[mes] += total;
    });

    // Formatear datos
    const datosDiarios = diasSemana.map((dia, index) => ({
      periodo: dia,
      ventas: ventasDiarias[index]
    }));

    const datosSemanales = ventasSemanales.map((total, index) => ({
      periodo: `Semana ${index + 1}`,
      ventas: total
    }));

    const datosMensuales = meses.map((mes, index) => ({
      periodo: mes,
      ventas: ventasMensuales[index]
    }));

    return { datosDiarios, datosSemanales, datosMensuales };
  };

  // Colores para las categorías
  const coloresCategorias = {
    'Fresas con Crema': '#FF1493',
    'Obleas': '#FF69B4',
    'Cupcakes': '#FFB6C1',
    'Postres': '#FF20B2',
    'Tortas': '#DC143C',
    'Arroz con Leche': '#FF8FA3',
    'Sándwiches': '#FF007F'
  };

  // Función para procesar ventas por categorías
  const procesarVentasPorCategoria = (ventas, periodoInicio, periodoFin) => {
    const ventasPorCategoria = {};
    
    ventas.forEach(venta => {
      const fechaVenta = new Date(venta.fechaventa || venta.fechaVenta);
      
      if (fechaVenta >= periodoInicio && fechaVenta <= periodoFin) {
        // Acceder a los detalles de venta correctamente
        const detalles = venta.detalleventa || venta.detalleVenta || [];
        
        detalles.forEach(detalle => {
          const productoInfo = detalle.productogeneral || detalle.producto || {};
          const categoria = productoInfo.categoria?.nombre || 'Otros';
          const cantidad = parseInt(detalle.cantidad || 0);
          
          if (!ventasPorCategoria[categoria]) {
            ventasPorCategoria[categoria] = {
              cantidad: 0,
              total: 0
            };
          }
          ventasPorCategoria[categoria].cantidad += cantidad;
          ventasPorCategoria[categoria].total += parseFloat(detalle.subtotal || 0);
        });
      }
    });

    // Convertir a formato para el gráfico
    return Object.entries(ventasPorCategoria).map(([categoria, datos]) => ({
      categoria,
      ventas: datos.total,
      cantidad: datos.cantidad,
      color: generarColorAleatorio()
    })).sort((a, b) => b.ventas - a.ventas);
  };


  // Función para cargar sedes
  const cargarSedes = async () => {
    try {
      const sedesObtenidas = await ventaApiService.obtenerSedes();
      setSedes(sedesObtenidas);
      console.log('Sedes cargadas:', sedesObtenidas);
    } catch (error) {
      console.error('Error al cargar sedes:', error);
    }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      let ventas = [];
      let compras = [];
      
      try {
        ventas = await ventaApiService.obtenerVentas();
        console.log('Ventas obtenidas correctamente');
      } catch (ventasError) {
        console.error('Error al obtener ventas:', ventasError);
        setError('No se pudieron cargar las ventas');
      }

      try {
        compras = await compraApiService.obtenerCompras();
        console.log('Compras obtenidas correctamente');
      } catch (comprasError) {
        console.error('Error al obtener compras:', comprasError);
        // No establecemos error general para permitir que el dashboard funcione con las ventas
      }

      // Procesar ventas si hay datos
      if (ventas.length > 0) {
        const datosVentasProcesados = procesarDatosVentas(ventas);
        setDatosVentas({
          diarios: datosVentasProcesados.datosDiarios,
          semanales: datosVentasProcesados.datosSemanales,
          mensuales: datosVentasProcesados.datosMensuales
        });
      }

      // Procesar compras si hay datos
      if (compras.length > 0) {
        const datosComprasProcesados = procesarDatosCompras(compras);
        setDatosCompras({
          diarios: datosComprasProcesados.datosDiarios,
          semanales: datosComprasProcesados.datosSemanales,
          mensuales: datosComprasProcesados.datosMensuales
        });
      } else {
        // Si no hay datos de compras, inicializar con valores vacíos
        setDatosCompras({
          diarios: [],
          semanales: [],
          mensuales: []
        });
      }

      // Procesar categorías por períodos
      const ahora = new Date();
      const inicioDia = new Date(ahora);
      inicioDia.setHours(0, 0, 0, 0);
      
      const inicioSemana = new Date(ahora);
      inicioSemana.setDate(ahora.getDate() - ahora.getDay());
      inicioSemana.setHours(0, 0, 0, 0);
      
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      
      setDatosCategorias({
        diarias: procesarVentasPorCategoria(ventas, inicioDia, ahora),
        semanales: procesarVentasPorCategoria(ventas, inicioSemana, ahora),
        mensuales: procesarVentasPorCategoria(ventas, inicioMes, ahora)
      });

      // Actualizar ventas en tiempo real - últimas 5 ventas
      const ventasRecientes = ventas
        .sort((a, b) => new Date(b.fechaventa || b.fechaVenta) - new Date(a.fechaventa || a.fechaVenta))
        .slice(0, 5)
        .map(venta => {
          const detalle = (venta.detalleventa || venta.detalleVenta || [])[0] || {};
          const productoInfo = detalle.productogeneral || detalle.producto || {};
          return {
            idVenta: venta.idventa || venta.idVenta,
            producto: productoInfo.nombre || 'Producto no especificado',
            cantidad: parseInt(detalle.cantidad || 0),
            precio: parseFloat(detalle.subtotal || 0),
            imagen: productoInfo.imagen || '',
            sede: venta.sede?.nombre || venta.nombreSede || 'Sede principal',
            timestamp: new Date(venta.fechaventa || venta.fechaVenta)
          };
        });

      setVentasRealTime(ventasRecientes);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      if (err.name === 'AbortError') {
        setError('La carga de datos fue cancelada');
      } else if (err.response?.status === 404) {
        setError('No se encontraron datos para mostrar');
      } else if (err.response?.status === 401) {
        setError('No tienes permisos para ver estos datos');
      } else if (!navigator.onLine) {
        setError('No hay conexión a internet. Por favor, verifica tu conexión');
      } else {
        setError('Error al cargar los datos del dashboard: ' + (err.message || 'Error desconocido'));
      }
    } finally {
      setLoading(false);
    }
  };

const cargarVentasEnTiempoReal = async () => {
  try {
    console.log('Iniciando carga de ventas en tiempo real...');
    const ventas = await ventaApiService.obtenerVentas(); // ← trae listado-resumen

    // Ordenar y limitar a las 5 más recientes
    const ventasOrdenadas = ventas
      .sort((a, b) => new Date(b.fechaVenta) - new Date(a.fechaVenta))
      .slice(0, 5);

    // Ahora sí, obtener el detalle de cada venta por ID
    const ventasProcesadas = await Promise.all(
      ventasOrdenadas.map(async (venta) => {
        try {
          const ventaConDetalles = await ventaApiService.obtenerVentaPorId(venta.idVenta);
          const detalle = ventaConDetalles.detalleVenta?.[0];

          if (!detalle) {
            console.warn(`La venta ${venta.idVenta} no tiene detalle`);
            return null;
          }

          // Buscar info del producto
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

    // Filtrar ventas válidas
    const ventasValidas = ventasProcesadas.filter(v => v !== null);
    console.log('Ventas válidas procesadas:', ventasValidas);

    setVentasRealTime(ventasValidas);
  } catch (error) {
    console.error('Error al cargar ventas en tiempo real:', error);
  }
};



  useEffect(() => {
    cargarSedes();
    cargarDatos();
    cargarVentasEnTiempoReal();
    
    // Actualizar ventas en tiempo real cada 30 segundos
    const intervaloRealTime = setInterval(cargarVentasEnTiempoReal, 30000);
    
    // Actualizar estadísticas cada 5 minutos
    const intervaloEstadisticas = setInterval(cargarDatos, 300000);
    
    return () => {
      clearInterval(intervaloRealTime);
      clearInterval(intervaloEstadisticas);
    };
  }, []);

  const obtenerDatosCalculados = useMemo(() => {
    const datosVentasActuales = datosVentas[periodoSeleccionado === 'diario' ? 'diarios' : 
                                          periodoSeleccionado === 'semanal' ? 'semanales' : 'mensuales'];
    const datosComprasActuales = datosCompras[periodoSeleccionado === 'diario' ? 'diarios' : 
                                            periodoSeleccionado === 'semanal' ? 'semanales' : 'mensuales'];

    // Combinar datos de ventas y compras
    return datosVentasActuales.map((dato, index) => ({
      periodo: dato.periodo,
      ventas: dato.ventas,
      compras: datosComprasActuales[index]?.compras || 0
    }));
  }, [periodoSeleccionado, datosVentas, datosCompras]);

  const calcularTotales = useMemo(() => {
    const totalVentas = obtenerDatosCalculados.reduce((sum, dato) => sum + (dato.ventas || 0), 0);
    const totalCompras = obtenerDatosCalculados.reduce((sum, dato) => sum + (dato.compras || 0), 0);
    const porcentajeVentas = totalVentas > 0 ? 100 : 0;
    // Si no hay datos de compras, el porcentaje será 0
    const porcentajeCompras = (totalVentas > 0 && totalCompras > 0) ? (totalCompras / totalVentas) * 100 : 0;

    return {
      ventas: totalVentas,
      compras: totalCompras,
      porcentajeVentas: `${Math.min(100, porcentajeVentas)}%`,
      porcentajeCompras: `${Math.min(100, porcentajeCompras)}%`
    };
  }, [periodoSeleccionado, datosVentas, datosCompras]);

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

// Componente de carga
const LoadingSpinner = ({ mensaje = 'Cargando datos...' }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '200px',
    flexDirection: 'column',
    gap: '10px'
  }}>
    <div className="loading-spinner"></div>
    <div>{mensaje}</div>
  </div>
);

// Componente para mostrar cuando no hay datos
const NoData = ({ mensaje = 'No hay datos disponibles' }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    color: '#666',
    flexDirection: 'column',
    gap: '10px'
  }}>
    <span style={{ fontSize: '24px' }}>📊</span>
    <div>{mensaje}</div>
  </div>
);

// Componente de error
const ErrorMessage = ({ message }) => (
  <div style={{ 
    padding: '20px', 
    backgroundColor: '#ffebee', 
    color: '#c62828', 
    borderRadius: '4px',
    margin: '20px 0'
  }}>
    {message}
  </div>
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
      padding: '10px',
      borderBottom: '1px solid #f0f0f0',
      transition: 'background-color 0.3s ease'
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
      border: '1px solid #A9A9A9', /* Changed from #CCCCCC to #A9A9A9 */
      backgroundColor: '#A9A9A9', /* Changed from #CCCCCC to #A9A9A9 */
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
      <style>{`
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        @keyframes slideIn { 
          from { 
            opacity: 0; 
            transform: translateY(-20px); 
            background-color: rgba(255, 20, 147, 0.1);
          } 
          to { 
            opacity: 1; 
            transform: translateY(0);
            background-color: transparent;
          } 
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #FF1493;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .venta-nueva {
          animation: slideIn 0.5s ease-out;
        }
      `}</style>
      
      <div style={styles.container}>
        <h1 style={styles.header}>Dashboard</h1>
        
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <div>
            {tortaExpandida && <div style={styles.overlay} onClick={() => setTortaExpandida(false)} />}
            <div style={styles.mainContent}>
          <div style={styles.leftSection}>
            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <div style={styles.statTitle}>Ventas totales</div>
                <div style={styles.statValue}>{formatearValor(calcularTotales.ventas)}</div>
                <div style={styles.statProgress}>
                  <div style={{...styles.progressBarVentas, width: calcularTotales.porcentajeVentas}}></div>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statTitle}>Compras totales</div>
                <div style={styles.statValue}>{formatearValor(calcularTotales.compras)}</div>
                <div style={styles.statProgress}>
                  <div style={{...styles.progressBarCompras, width: calcularTotales.porcentajeCompras}}></div>
                </div>
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
                      <div style={{...styles.colorIndicator, backgroundColor: '#A9A9A9'}}></div>Compras {/* Changed from #CCCCCC to #A9A9A9 */}
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
                    <YAxis axisLine={false} tickLine={false} fontSize={11} tickFormatter={(value) => `${(value / 1000)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    {mostrarVentas && <Bar dataKey="ventas" fill="#FF1493" radius={[2, 2, 0, 0]} name="Ventas" />}
                    {mostrarCompras && <Bar dataKey="compras" fill="#A9A9A9" radius={[2, 2, 0, 0]} name="Compras" />}
                  </BarChart>
                )}
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
                  {sedes.map(sede => (
                    <option key={sede.idsede} value={sede.nombre}>{sede.nombre}</option>
                  ))}
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
                          <span style={{...styles.sedeTag, backgroundColor: '#FF1493', color: 'white'}}>{venta.sede}</span>
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
        )}
      </div>
    </div>
  );
}
export default Dashboard;