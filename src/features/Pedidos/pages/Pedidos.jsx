import React, { useState, useEffect, useContext } from 'react';
import { CartContext } from "../../Cartas/pages/CartContext";
import { useLocation } from 'react-router-dom';
import './Pedidos.css';
import authService from '../../Admin/services/authService';
import ventaApiService from '../../Admin/services/venta_services';

// Importar componentes
import ProductosView from '../components/ProductosView';
import OpcionesEntregaView from '../components/OpcionesEntregaView';
import ConfirmacionView from '../components/ConfirmacionView';
import OpcionesPagoView from '../components/OpcionesPagoView';
import HistorialView from '../components/HistorialView';

const Pedidos = () => {
  const location = useLocation();
  const [vistaActual, setVistaActual] = useState('productos');
  
  const [pedidoActual, setPedidoActual] = useState({
    productos: [],
    toppings: [],
    adiciones: [],
    salsas: [],
    comentarios: '',
    opciones: {
      entrega: null,
      pago: null
    }
  });

  const [tabActivo, setTabActivo] = useState('nuevo');
  const [personalizacionesGuardadas, setPersonalizacionesGuardadas] = useState(null);

  const { 
    productosSeleccionados: productosDelContexto,
    limpiarProductosSeleccionados,
    carrito
  } = useContext(CartContext);

  // ==========================================
  // 🔧 FUNCIONES DE NAVEGACIÓN Y GESTIÓN
  // ==========================================

  const cambiarVista = (nuevaVista) => {
    setVistaActual(nuevaVista);
  };

  const cambiarTab = (tab) => {
    setTabActivo(tab);
    switch(tab) {
      case 'nuevo':
        setVistaActual('productos');
        reiniciarPedido();
        break;
      case 'historial':
        setVistaActual('historial');
        break;
    }
  };

  const reiniciarPedido = () => {
    setPedidoActual({
      productos: [],
      toppings: [],
      adiciones: [],
      salsas: [],
      comentarios: '',
      opciones: {
        entrega: null,
        pago: null
      }
    });
    limpiarProductosSeleccionados();
  };

  // ==========================================
  // 🎯 EFFECTS
  // ==========================================

  useEffect(() => {
    // 🎯 Detectar si viene desde personalización
    if (location.state?.vista === 'entrega') {
      console.log('📍 Llegando desde personalización, cambiando a vista de entrega');
      setVistaActual('entrega');
    }

    // Recuperar personalizaciones guardadas
    const personalizacionesStorage = localStorage.getItem('personalizacionesPedido');
    if (personalizacionesStorage) {
      try {
        const personalizaciones = JSON.parse(personalizacionesStorage);
        setPersonalizacionesGuardadas(personalizaciones);
        console.log('✅ Personalizaciones recuperadas:', personalizaciones);
      } catch (error) {
        console.error('Error al recuperar personalizaciones:', error);
      }
    }
  }, [location]);

  useEffect(() => {
    if (productosDelContexto && productosDelContexto.length > 0) {
      setPedidoActual(prev => ({
        ...prev,
        productos: productosDelContexto
      }));
    }
  }, [productosDelContexto]);

  // ==========================================
  // 📦 FUNCIONES DE PRODUCTOS
  // ==========================================

  const obtenerTodosLosProductos = () => {
    // Prioridad 1: Productos del pedido actual
    if (pedidoActual.productos && pedidoActual.productos.length > 0) {
      return pedidoActual.productos;
    }
    
    // Prioridad 2: Productos del contexto
    if (productosDelContexto && productosDelContexto.length > 0) {
      return productosDelContexto;
    }
    
    // Prioridad 3: Carrito del contexto
    if (carrito && carrito.length > 0) {
      return carrito;
    }
    
    // Prioridad 4: LocalStorage
    try {
      const carritoStorage = localStorage.getItem('carritoParaPersonalizar');
      if (carritoStorage) {
        const productos = JSON.parse(carritoStorage);
        if (productos && productos.length > 0) {
          return productos;
        }
      }
    } catch (error) {
      console.error('Error al obtener productos de localStorage:', error);
    }
    
    return [];
  };

  const agregarProducto = (producto) => {
    setPedidoActual(prev => {
      const productosExistentes = [...prev.productos];
      const productoExistente = productosExistentes.find(p => p.id === producto.id);
      
      if (productoExistente) {
        productoExistente.cantidad = (productoExistente.cantidad || 1) + 1;
      } else {
        productosExistentes.push({ ...producto, cantidad: 1 });
      }
      
      return {
        ...prev,
        productos: productosExistentes
      };
    });
  };

  const eliminarProducto = (productoId) => {
    setPedidoActual(prev => ({
      ...prev,
      productos: prev.productos.filter(p => p.id !== productoId)
    }));
  };

  const actualizarCantidadProducto = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarProducto(productoId);
      return;
    }
    
    setPedidoActual(prev => ({
      ...prev,
      productos: prev.productos.map(p => 
        p.id === productoId ? { ...p, cantidad: nuevaCantidad } : p
      )
    }));
  };

  // ==========================================
  // 💰 CÁLCULO DE TOTALES
  // ==========================================

  const calcularTotal = () => {
    const productos = obtenerTodosLosProductos();
    let total = 0;
    
    // Subtotal de productos base
    total += productos.reduce((sum, producto) => 
      sum + (producto.precio * (producto.cantidad || 1)), 0
    );
    
    // Extras globales (si los hay)
    total += pedidoActual.toppings.reduce((sum, topping) => 
      sum + (topping.precio || 0), 0
    );
    
    total += pedidoActual.adiciones.reduce((sum, adicion) => 
      sum + (adicion.precio || 0), 0
    );
    
    total += pedidoActual.salsas.reduce((sum, salsa) => 
      sum + (salsa.precio || 0), 0
    );
    
    // Sumar personalizaciones individuales
    if (personalizacionesGuardadas) {
      productos.forEach(producto => {
        const personalizacionProducto = personalizacionesGuardadas[producto.id];
        if (personalizacionProducto) {
          for (let unidad = 1; unidad <= (producto.cantidad || 1); unidad++) {
            const personalizacionUnidad = personalizacionProducto[unidad];
            if (personalizacionUnidad) {
              // Sumar toppings
              if (personalizacionUnidad.toppings) {
                total += personalizacionUnidad.toppings.reduce((sum, item) => sum + (item.precio || 0), 0);
              }
              // Sumar salsas
              if (personalizacionUnidad.salsas) {
                total += personalizacionUnidad.salsas.reduce((sum, item) => sum + (item.precio || 0), 0);
              }
              // Sumar rellenos
              if (personalizacionUnidad.rellenos) {
                total += personalizacionUnidad.rellenos.reduce((sum, item) => sum + (item.precio || 0), 0);
              }
              // Sumar adiciones
              if (personalizacionUnidad.adiciones) {
                total += personalizacionUnidad.adiciones.reduce((sum, item) => sum + (item.precio || 0), 0);
              }
              // Sumar sabores
              if (personalizacionUnidad.sabores) {
                total += personalizacionUnidad.sabores.reduce((sum, item) => sum + (item.precio || 0), 0);
              }
            }
          }
        }
      });
    }
    
    console.log('💰 Total calculado:', total);
    return total;
  };

  // ==========================================
  // 🚀 NAVEGACIÓN ENTRE VISTAS
  // ==========================================

  const siguienteDesdeProductos = () => {
    const productos = obtenerTodosLosProductos();
    
    if (productos.length === 0) {
      alert('⚠️ Debes agregar al menos un producto al carrito');
      return;
    }

    const cantidadTotal = productos.reduce((sum, p) => sum + (p.cantidad || 1), 0);
    
    if (cantidadTotal < 10) {
      alert(`⚠️ Necesitas al menos 10 productos. Tienes ${cantidadTotal}`);
      return;
    }

    setPedidoActual(prev => ({
      ...prev,
      productos: productos
    }));

    console.log('✅ Productos validados, yendo a personalización...');
    localStorage.setItem('carritoParaPersonalizar', JSON.stringify(productos));
    window.location.href = '/pedidos/PersonalizacionProductos';
  };

  const manejarConfirmacion = (pedidoConComentarios) => {
    setPedidoActual(prev => ({
      ...prev,
      comentarios: pedidoConComentarios.comentarios || ''
    }));
    setVistaActual('pago');
  };

  // ==========================================
  // 🔧 FUNCIÓN CRÍTICA: prepararDatosVenta
  // ==========================================

const prepararDatosVenta = async (datosPago) => {
    console.log('🔥 prepararDatosVenta - Datos recibidos:', datosPago);
    
    // Extraer datos del pago
    const {
      metodo,
      sede,
      sedeNombre,
      abono,
      total,
      subtotalProductos,
      subtotalExtras,
      numeroPedido,
      comprobante
    } = datosPago;

    // ✅ VALIDACIÓN CRÍTICA: Verificar que el total llegó
    if (!total || total <= 0) {
      console.error('❌ ERROR: Total inválido recibido:', total);
      throw new Error(`Total inválido: ${total}. Debe ser mayor a 0.`);
    }

    console.log('✅ Total válido recibido:', total);

    // Obtener productos
    const productos = obtenerTodosLosProductos();
    
    if (!productos || productos.length === 0) {
      throw new Error('No hay productos en el pedido');
    }

    console.log('📦 Productos encontrados:', productos.length);

    // 🔐 OBTENER CLIENTE AUTENTICADO
    let clienteId = null;
    let nombreCliente = 'Cliente Pedido Online';
    
    try {
      const clienteAutenticado = await authService.obtenerDatosClienteLogueado();
      if (clienteAutenticado && clienteAutenticado.idcliente) {
        clienteId = clienteAutenticado.idcliente;
        nombreCliente = `${clienteAutenticado.nombre} ${clienteAutenticado.apellido}`;
        console.log('✅ Cliente autenticado:', nombreCliente, 'ID:', clienteId);
      }
    } catch (error) {
      console.warn('⚠️ No se pudo obtener cliente autenticado:', error);
    }

    if (!clienteId) {
      throw new Error('No se encontró el ID del cliente. Por favor inicia sesión.');
    }

    // Preparar productos con personalizaciones
    const productosConExtras = productos.map(producto => {
      const precioBase = producto.precio * (producto.cantidad || 1);
      let precioExtras = 0;
      let personalizacionesProducto = [];

      // Obtener personalizaciones del producto
      if (personalizacionesGuardadas && personalizacionesGuardadas[producto.id]) {
        const personalizacionProducto = personalizacionesGuardadas[producto.id];
        
        // Recorrer cada unidad
        for (let unidad = 1; unidad <= (producto.cantidad || 1); unidad++) {
          const personalizacionUnidad = personalizacionProducto[unidad];
          if (personalizacionUnidad) {
            // Sumar precios de personalizaciones
            ['toppings', 'salsas', 'rellenos', 'adiciones', 'sabores'].forEach(tipo => {
              if (personalizacionUnidad[tipo]?.length > 0) {
                precioExtras += personalizacionUnidad[tipo].reduce((sum, item) => sum + (item.precio || 0), 0);
              }
            });
            
            personalizacionesProducto.push({
              unidad: unidad,
              ...personalizacionUnidad
            });
          }
        }
      }

      const subtotalProducto = precioBase + precioExtras;

      return {
        fechaventa: new Date().toISOString(),
        cliente: clienteId,
        idproductogeneral: producto.id,
        nombreProducto: producto.nombre,
        cantidad: producto.cantidad || 1,
        preciounitario: producto.precio,
        precioExtras: precioExtras,
        subtotal: subtotalProducto,
        personalizaciones: personalizacionesProducto
      };
    });

    // 🎯 RECUPERAR DATOS DE ENTREGA GUARDADOS
    const datosEntregaStorage = localStorage.getItem('datosEntrega');
    const datosEntrega = datosEntregaStorage ? JSON.parse(datosEntregaStorage) : null;

    console.log('📅 Datos de entrega recuperados:', datosEntrega);

    // ✅ VALIDACIÓN: Para pedidos, la fecha de entrega es obligatoria
    if (!datosEntrega || !datosEntrega.fecha) {
      throw new Error('No se encontró la fecha de entrega. Por favor regresa y selecciona una fecha.');
    }

    // Formatear fecha de entrega (backend espera formato ISO o YYYY-MM-DD)
    const fechaEntrega = datosEntrega.fecha.includes('T') 
      ? datosEntrega.fecha 
      : `${datosEntrega.fecha}T${datosEntrega.hora || '12:00'}:00.000Z`;

    console.log('📅 Fecha de entrega formateada:', fechaEntrega);

    // 🎯 CONSTRUIR OBJETO DE VENTA CON TOTAL CORRECTO
    const datosVenta = {
      // ===== CLIENTE =====
      idCliente: clienteId,
      cliente: clienteId,
      clienteNombre: nombreCliente,
      
      // ===== SEDE =====
      idSede: Number(sede),
      sede: sedeNombre,
      sedeNombre: sedeNombre,
      
      // ===== PRODUCTOS =====
      productos: productosConExtras,
      detalleventa: productosConExtras,
      
      // ===== 💰 TOTALES (CRÍTICO) =====
      subtotalProductos: Number(subtotalProductos) || 0,
      subtotalExtras: Number(subtotalExtras) || 0,
      total: Number(total),           // ✅ TOTAL CALCULADO CORRECTAMENTE
      abono: Number(abono),           // ✅ 50% del total
      saldo: Number(total - abono),   // Lo que falta por pagar
      
      // ===== MÉTODO DE PAGO =====
      metodoPago: metodo,
      metodopago: metodo,
      
      // ===== TIPO DE VENTA =====
      tipoventa: 'pedido',
      tipo_venta: 'pedido',
      
      // ===== ESTADO =====
      // SIEMPRE usar estado 1 (En espera) para pedidos nuevos
      idEstado: 1,
      estadoVentaId: 1,
      estado: 'En espera',
      
      // ===== OTROS DATOS =====
      numeroPedido: numeroPedido,
      fechaventa: new Date().toISOString(),
      fechaPedido: new Date().toISOString(),
      fechaCreacion: new Date().toISOString(),
      
      // ===== 📅 FECHA DE ENTREGA (CRÍTICO PARA PEDIDOS) =====
      fechaentrega: fechaEntrega,
      fecha_entrega: fechaEntrega,
      
      // ===== PERSONALIZACIONES =====
      personalizacionesProductos: personalizacionesGuardadas,
      
      // ===== DATOS DE ENTREGA =====
      datosEntrega: {
        fechaEntrega: datosEntrega.fecha,
        horaEntrega: datosEntrega.hora,
        telefono: datosEntrega.telefono,
        observaciones: datosEntrega.observaciones || '',
        ubicacion: datosEntrega.ubicacion,
        ubicacionData: datosEntrega.ubicacionData
      },
      
      // ===== OBSERVACIONES =====
      comentarios: pedidoActual.comentarios || datosEntrega.observaciones || '',
      observaciones: pedidoActual.comentarios || datosEntrega.observaciones || '',
      
      // ===== EXTRAS GLOBALES =====
      extras: {
        toppings: pedidoActual.toppings || [],
        adiciones: pedidoActual.adiciones || [],
        salsas: pedidoActual.salsas || []
      }
    };
    // 🔍 VALIDACIONES FINALES
    console.log('🔍 Validando datos de venta...');
    
    if (!datosVenta.total || datosVenta.total <= 0) {
      console.error('❌ Total inválido en datosVenta:', datosVenta.total);
      throw new Error(`Total debe ser mayor a 0. Recibido: ${datosVenta.total}`);
    }
    
    if (!datosVenta.abono || datosVenta.abono <= 0) {
      console.error('❌ Abono inválido en datosVenta:', datosVenta.abono);
      throw new Error(`Abono debe ser mayor a 0. Recibido: ${datosVenta.abono}`);
    }
    
    if (!datosVenta.productos || datosVenta.productos.length === 0) {
      console.error('❌ No hay productos en datosVenta');
      throw new Error('Debe haber al menos un producto');
    }

    console.log('✅ Validaciones pasadas');
    console.log('📤 Datos de venta preparados:', {
      idCliente: datosVenta.idCliente,
      idSede: datosVenta.idSede,
      total: datosVenta.total,
      abono: datosVenta.abono,
      saldo: datosVenta.saldo,
      metodoPago: datosVenta.metodoPago,
      productos: datosVenta.productos.length,
      estado: datosVenta.estado
    });

    return datosVenta;
  };

  // ==========================================
  // 🎨 RENDERIZADO DE VISTAS
  // ==========================================

  const renderizarVista = () => {
    switch(vistaActual) {
      case 'productos':
        return (
          <ProductosView 
            onProductoSeleccionado={agregarProducto}
            onSiguiente={siguienteDesdeProductos}
            productosSeleccionados={pedidoActual.productos}
            onEliminarProducto={eliminarProducto}
            onActualizarCantidad={actualizarCantidadProducto}
          />
        );
      
      case 'entrega':
        return (
          <OpcionesEntregaView 
            pedido={pedidoActual}
            onSiguiente={() => cambiarVista('confirmacion')}
            onAnterior={() => cambiarVista('productos')}
            onOpcionSeleccionada={(opcion) => {
              setPedidoActual(prev => ({
                ...prev,
                opciones: { ...prev.opciones, entrega: opcion }
              }));
            }}
          />
        );
      
      case 'confirmacion':
        return (
          <ConfirmacionView 
            pedido={pedidoActual}
            total={calcularTotal()}
            onSiguiente={manejarConfirmacion}
            onAnterior={() => cambiarVista('entrega')}
            onEliminarProducto={eliminarProducto}
            onActualizarCantidad={actualizarCantidadProducto}
          />
        );
      
      case 'pago':
        return (
          <OpcionesPagoView 
            pedido={pedidoActual}
            total={calcularTotal()}
            prepararDatosVenta={prepararDatosVenta}
            onPedidoCompletado={() => {
              reiniciarPedido();
              cambiarTab('historial');
            }}
            onAnterior={() => cambiarVista('confirmacion')}
            onOpcionSeleccionada={(opcion) => {
              setPedidoActual(prev => ({
                ...prev,
                opciones: { ...prev.opciones, pago: opcion }
              }));
            }}
          />
        );
      
      case 'historial':
        return <HistorialView />;
      
      default:
        return (
          <ProductosView 
            onProductoSeleccionado={agregarProducto}
            onSiguiente={siguienteDesdeProductos}
            productosSeleccionados={pedidoActual.productos}
            onEliminarProducto={eliminarProducto}
            onActualizarCantidad={actualizarCantidadProducto}
          />
        );
    }
  };

  // ==========================================
  // 🎨 RENDER PRINCIPAL
  // ==========================================

  return (
    <div className="pedidos-container">
      <div className="pedidos-header">
        <h1 className="pedidos-title">SISTEMA DE PEDIDOS</h1>
        
        <div className="pedidos-nav">
          <button 
            className={`nav-tab ${tabActivo === 'nuevo' ? 'active' : ''}`}
            onClick={() => cambiarTab('nuevo')}
          >
            Nuevo pedido
          </button>
          <button 
            className={`nav-tab ${tabActivo === 'historial' ? 'active' : ''}`}
            onClick={() => cambiarTab('historial')}
          >
            Historial
          </button>
        </div>
      </div>

      {tabActivo === 'nuevo' && (
        <div className="progress-indicator">
          <div className="progress-steps">
            <div className={`step ${vistaActual === 'productos' ? 'active' : ''} ${['entrega', 'confirmacion', 'pago'].includes(vistaActual) ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Productos</span>
            </div>
            <div className={`step ${vistaActual === 'entrega' ? 'active' : ''} ${['confirmacion', 'pago'].includes(vistaActual) ? 'completed' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Entrega</span>
            </div>
            <div className={`step ${vistaActual === 'confirmacion' ? 'active' : ''} ${vistaActual === 'pago' ? 'completed' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Confirmar</span>
            </div>
            <div className={`step ${vistaActual === 'pago' ? 'active' : ''}`}>
              <span className="step-number">4</span>
              <span className="step-label">Pago</span>
            </div>
          </div>
        </div>
      )}

      <div className="pedidos-content">
        {renderizarVista()}
      </div>
    </div>
  );
};

export default Pedidos;