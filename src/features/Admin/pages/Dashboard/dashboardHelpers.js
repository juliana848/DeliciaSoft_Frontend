// dashboardHelpers.js - VERSIÓN FINAL CORREGIDA CON LÓGICA UNIFORME

// Función para formatear valores monetarios
export const formatearValor = (valor) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor);
};

// COLORES EN TONOS ROSADOS
const COLORES_ROSADOS = [
  '#FF1493', // DeepPink
  '#FF69B4', // HotPink
  '#FFB6C1', // LightPink
  '#FFC0CB', // Pink
  '#FF85A1', // Rosa medio
  '#FF007F', // Rosa brillante
  '#E75480', // Rosa oscuro
  '#F08080', // Rosa claro coral
  '#FA8072', // Salmon
  '#F4A7B9', // Rosa pastel
  '#E91E63', // Rosa material
  '#C71585', // MediumVioletRed
  '#DA70D6', // Orchid
  '#EE82EE', // Violet
  '#FF6EB4'  // Rosa vibrante
];

// Función para obtener color rosado según índice
export const generarColorAleatorio = () => {
  return COLORES_ROSADOS[Math.floor(Math.random() * COLORES_ROSADOS.length)];
};

// ✅ FUNCIÓN CENTRAL PARA CONVERTIR FECHAS - USA ESTO EN TODO EL DASHBOARD
const convertirFechaAColombiaDesdeString = (fechaStr) => {
  if (!fechaStr) return null;
  // Tomar solo la parte de fecha y fijar zona -05:00 (Bogotá)
  const soloFecha = fechaStr.split('T')[0]; // "2025-10-13"
  return new Date(`${soloFecha}T00:00:00-05:00`);
};

// ✅ Procesar datos de compras - USANDO CONVERSIÓN UNIFORME
export const procesarDatosCompras = (compras) => {
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  // Usar fecha de Colombia
  const ahora = new Date();
  const hoy = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  
  // ✅ Solo datos de LA SEMANA ACTUAL
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay());
  inicioSemana.setHours(0, 0, 0, 0);
  
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6);
  finSemana.setHours(23, 59, 59, 999);
  
  console.log('📦 Procesando compras - Semana actual:', inicioSemana.toLocaleDateString(), '-', finSemana.toLocaleDateString());
  
  const comprasDiarias = new Array(7).fill(0);
  const comprasSemanales = new Array(4).fill(0);
  const comprasMensuales = new Array(12).fill(0);

  compras.forEach(compra => {
    const fechaStr = compra.fechacompra || compra.fechaCompra;
    if (!fechaStr) return;
    
    const fecha = convertirFechaAColombiaDesdeString(fechaStr);
    if (!fecha) return;
    
    const total = parseFloat(compra.total || 0);
    
    // Para gráfico DIARIO: solo semana actual
    if (fecha >= inicioSemana && fecha <= finSemana) {
      const dia = fecha.getDay();
      comprasDiarias[dia] += total;
    }
    
    // Para gráfico SEMANAL: últimas 4 semanas
    const diasDiferencia = Math.floor((hoy - fecha) / (24 * 60 * 60 * 1000));
    const semanaActual = Math.floor(diasDiferencia / 7);
    if (semanaActual >= 0 && semanaActual < 4) {
      comprasSemanales[3 - semanaActual] += total;
    }
    
    // Para gráfico MENSUAL: mes actual
    if (fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()) {
      comprasMensuales[fecha.getMonth()] += total;
    }
  });

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

// ✅ Procesar datos de ventas - USANDO CONVERSIÓN UNIFORME
export const procesarDatosVentas = (ventas) => {
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  // Usar fecha de Colombia
  const ahora = new Date();
  const hoy = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  
  // ✅ Solo datos de LA SEMANA ACTUAL
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay());
  inicioSemana.setHours(0, 0, 0, 0);
  
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6);
  finSemana.setHours(23, 59, 59, 999);
  
  console.log('💰 Procesando ventas - Semana actual:', inicioSemana.toLocaleDateString(), '-', finSemana.toLocaleDateString());
  console.log('📅 Hoy es:', diasSemana[hoy.getDay()], hoy.toLocaleDateString());
  
  const ventasDiarias = new Array(7).fill(0);
  const ventasSemanales = new Array(4).fill(0);
  const ventasMensuales = new Array(12).fill(0);

  ventas.forEach(venta => {
    const fechaStr = venta.fechaventa || venta.fechaVenta;
    if (!fechaStr) return;
    
    const fecha = convertirFechaAColombiaDesdeString(fechaStr);
    if (!fecha) return;
    
    const total = parseFloat(venta.total || 0);
    
    // Para gráfico DIARIO: solo semana actual
    if (fecha >= inicioSemana && fecha <= finSemana) {
      const dia = fecha.getDay();
      ventasDiarias[dia] += total;
      console.log(`✅ Venta semana actual: ${diasSemana[dia]} - $${total}`);
    }
    
    // Para gráfico SEMANAL: últimas 4 semanas
    const diasDiferencia = Math.floor((hoy - fecha) / (24 * 60 * 60 * 1000));
    const semanaActual = Math.floor(diasDiferencia / 7);
    if (semanaActual >= 0 && semanaActual < 4) {
      ventasSemanales[3 - semanaActual] += total;
    }
    
    // Para gráfico MENSUAL: mes actual
    if (fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()) {
      ventasMensuales[fecha.getMonth()] += total;
    }
  });

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

  console.log('📊 Ventas del día actual:', ventasDiarias[hoy.getDay()]);

  return { datosDiarios, datosSemanales, datosMensuales };
};

// ✅ Procesar ventas por categoría - USANDO CONVERSIÓN UNIFORME
export const procesarVentasPorCategoria = (ventas, periodoInicio, periodoFin) => {
  const ventasPorCategoria = {};
  
  console.log('📊 === PROCESANDO CATEGORÍAS ===');
  console.log('Total de ventas a procesar:', ventas.length);
  console.log('Periodo:', periodoInicio.toLocaleDateString(), 'hasta', periodoFin.toLocaleDateString());
  
  ventas.forEach(venta => {
    const fechaStr = venta.fechaventa || venta.fechaVenta;
    if (!fechaStr) return;
    
    // ✅ USAR LA MISMA CONVERSIÓN QUE EN procesarDatosVentas
    const fechaVenta = convertirFechaAColombiaDesdeString(fechaStr);
    if (!fechaVenta) return;
    
    // Verificar si la venta está en el período
    if (fechaVenta >= periodoInicio && fechaVenta <= periodoFin) {
      console.log(`✅ Venta en período: ${fechaVenta.toLocaleDateString('es-CO')}`);
      
      const detalles = venta.detalleventa || venta.detalleVenta || [];
      
      detalles.forEach(detalle => {
        // ✅ MEJORADO: Múltiples formas de obtener la categoría
        let categoria = 'Otros';
        let categoriaEncontrada = false;
        
        // Método 1: De productogeneral (relación directa)
        if (detalle.productogeneral) {
          const producto = detalle.productogeneral;
          
          // Buscar en categoriaproducto (relación)
          if (producto.categoriaproducto?.nombrecategoria) {
            categoria = producto.categoriaproducto.nombrecategoria;
            categoriaEncontrada = true;
          }
          // Buscar en campo directo categoria
          else if (producto.categoria) {
            categoria = typeof producto.categoria === 'string' 
              ? producto.categoria 
              : producto.categoria.nombrecategoria || producto.categoria.nombre;
            categoriaEncontrada = true;
          }
        }
        
        // Método 2: Campo directo en detalle
        if (!categoriaEncontrada && detalle.categoria) {
          categoria = typeof detalle.categoria === 'string'
            ? detalle.categoria
            : detalle.categoria.nombrecategoria || detalle.categoria.nombre || 'Otros';
          categoriaEncontrada = true;
        }
        
        // Método 3: Buscar en el nombre del producto (fallback)
        if (!categoriaEncontrada && detalle.nombreProducto) {
          const nombre = detalle.nombreProducto.toLowerCase();
          if (nombre.includes('sandwich') || nombre.includes('sándwich')) {
            categoria = 'Sandwich';
          } else if (nombre.includes('cupcake') || nombre.includes('torta') || nombre.includes('pastel')) {
            categoria = 'Cupcakes';
          } else if (nombre.includes('bebida') || nombre.includes('jugo')) {
            categoria = 'Bebidas';
          }
        }
        
        const cantidad = parseInt(detalle.cantidad || 0);
        const subtotal = parseFloat(detalle.subtotal || 0);
        
        if (!ventasPorCategoria[categoria]) {
          ventasPorCategoria[categoria] = {
            cantidad: 0,
            total: 0,
            productos: new Set()
          };
        }
        
        ventasPorCategoria[categoria].cantidad += cantidad;
        ventasPorCategoria[categoria].total += subtotal;
        
        const nombreProducto = detalle.nombreProducto || 
                               detalle.productogeneral?.nombreproducto || 
                               'Sin nombre';
        
        ventasPorCategoria[categoria].productos.add(nombreProducto);
        
        console.log(`  📦 ${categoria}: +${cantidad} unidades, +$${subtotal}`);
      });
    } else {
      console.log(`❌ Venta fuera de período: ${fechaVenta.toLocaleDateString('es-CO')}`);
    }
  });

  console.log('📈 Categorías procesadas:', Object.keys(ventasPorCategoria));

  // Convertir a array y ordenar
  const resultado = Object.entries(ventasPorCategoria)
    .map(([categoria, datos], index) => ({
      categoria,
      ventas: datos.total,
      cantidad: datos.cantidad,
      cantidadProductos: datos.productos.size,
      color: COLORES_ROSADOS[index % COLORES_ROSADOS.length]
    }))
    .sort((a, b) => b.ventas - a.ventas)
    .slice(0, 10);

  console.log('🎯 Top categorías:', resultado.map(r => `${r.categoria}: $${r.ventas}`));
  
  return resultado;
};

// ✅ Calcular total de hoy - USANDO CONVERSIÓN UNIFORME
export const calcularTotalDeHoy = (lista, campoFecha = 'fecha') => {
  if (!Array.isArray(lista)) return 0;

  const hoy = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  hoy.setHours(0, 0, 0, 0);
  const mañana = new Date(hoy);
  mañana.setDate(hoy.getDate() + 1);

  return lista.reduce((total, item) => {
    const fechaStr = item[campoFecha] || item[campoFecha.toLowerCase()] || item.fechaventa || item.fechaVenta;
    if (!fechaStr) return total;

    const fecha = convertirFechaAColombiaDesdeString(fechaStr);
    if (!fecha) return total;

    if (fecha >= hoy && fecha < mañana) {
      const valor = parseFloat(item.total || item.monto || item.precio || 0);
      return total + (isNaN(valor) ? 0 : valor);
    }
    return total;
  }, 0);
};