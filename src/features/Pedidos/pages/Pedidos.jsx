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
    limpiarProductosSeleccionados
  } = useContext(CartContext);

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

  const siguienteDesdeProductos = () => {
    // Validar que haya productos
    const productos = productosDelContexto || [];
    if (productos.length === 0) {
      alert('⚠️ Debes agregar al menos un producto al carrito');
      return;
    }

    // Calcular cantidad total
    const cantidadTotal = productos.reduce((sum, p) => sum + (p.cantidad || 1), 0);
    
    if (cantidadTotal < 10) {
      alert(`⚠️ Necesitas al menos 10 productos. Tienes ${cantidadTotal}`);
      return;
    }

    // Guardar productos en el pedido actual
    setPedidoActual(prev => ({
      ...prev,
      productos: productos
    }));

    // 🎯 IR DIRECTAMENTE A PERSONALIZACIÓN
    console.log('✅ Productos validados, yendo a personalización...');
    
    // Guardar en localStorage para personalización
    localStorage.setItem('carritoParaPersonalizar', JSON.stringify(productos));
    
    // Navegar a personalización
    window.location.href = '/pedidos/PersonalizacionProductos';
  };

  const calcularTotal = () => {
    let total = 0;
    
    const productos = pedidoActual.productos.length > 0 
      ? pedidoActual.productos 
      : (productosDelContexto || []);
    
    total += productos.reduce((sum, producto) => 
      sum + (producto.precio * (producto.cantidad || 1)), 0
    );
    
    total += pedidoActual.toppings.reduce((sum, topping) => 
      sum + (topping.precio || 0), 0
    );
    
    total += pedidoActual.adiciones.reduce((sum, adicion) => 
      sum + (adicion.precio || 0), 0
    );
    
    total += pedidoActual.salsas.reduce((sum, salsa) => 
      sum + (salsa.precio || 0), 0
    );
    
    return total;
  };

  const manejarConfirmacion = (pedidoConComentarios) => {
    setPedidoActual(prev => ({
      ...prev,
      comentarios: pedidoConComentarios.comentarios || ''
    }));
    setVistaActual('pago');
  };

  const prepararDatosVenta = async (datosPago) => {
    const productos = pedidoActual.productos.length > 0 
      ? pedidoActual.productos 
      : (productosDelContexto || []);

    console.log('📦 Productos a enviar:', productos);

    // 🔒 OBTENER CLIENTE AUTENTICADO
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
      console.warn('⚠️ No se pudo obtener cliente autenticado, usando genérico:', error);
    }

    const productosConExtras = productos.map(producto => {
      const precioBase = producto.precio * (producto.cantidad || 1);
      
      // 🆕 OBTENER PERSONALIZACIÓN ESPECÍFICA DEL PRODUCTO
      let precioExtras = 0;
      let personalizacion = null;
      
      if (personalizacionesGuardadas && personalizacionesGuardadas[producto.id]) {
        personalizacion = personalizacionesGuardadas[producto.id];
        
        // Calcular precio de personalizaciones específicas
        if (personalizacion.toppings?.length > 0) {
          precioExtras += personalizacion.toppings.reduce((sum, t) => sum + (t.precio || 0), 0);
        }
        if (personalizacion.salsas?.length > 0) {
          precioExtras += personalizacion.salsas.reduce((sum, s) => sum + (s.precio || 0), 0);
        }
        if (personalizacion.adiciones?.length > 0) {
          precioExtras += personalizacion.adiciones.reduce((sum, a) => sum + (a.precio || 0), 0);
        }
      }

      const subtotal = precioBase + precioExtras;
      const iva = subtotal * 0.19;

      return {
        fechaventa: new Date().toISOString(),
        cliente: clienteId,
        idproductogeneral: producto.id,
        cantidad: producto.cantidad || 1,
        preciounitario: producto.precio,
        subtotal: subtotal,
        iva: iva,
        // 🆕 Incluir personalización
        personalizacion: personalizacion ? {
          toppings: personalizacion.toppings || [],
          salsas: personalizacion.salsas || [],
          adiciones: personalizacion.adiciones || [],
          comentarios: personalizacion.comentarios || ''
        } : null
      };
    });

    const totalFinal = calcularTotal();
    const ivaTotal = totalFinal * 0.19;

    // Obtener nombre de sede correcto
    const sedeNombre = datosPago.sedeNombre || 
                       pedidoActual.opciones.entrega?.ubicacionData?.nombre || 
                       'San Benito';

    console.log('🏪 Sede seleccionada:', sedeNombre);
    console.log('👤 Cliente ID:', clienteId);
    console.log('📝 Nombre cliente:', nombreCliente);

    return {
      fechaventa: new Date().toISOString(),
      cliente: clienteId,
      clienteId: clienteId,
      clienteNombre: nombreCliente,
      sede: sedeNombre,
      sedeNombre: sedeNombre,
      metodopago: datosPago.metodo || pedidoActual.opciones.pago,
      tipoventa: 'pedido',
      total: totalFinal + ivaTotal,
      detalleventa: productosConExtras,
      datosEntrega: pedidoActual.opciones.entrega?.datosEntrega,
      comentarios: pedidoActual.comentarios,
      personalizacionesProductos: personalizacionesGuardadas,
      extras: {
        toppings: pedidoActual.toppings,
        adiciones: pedidoActual.adiciones,
        salsas: pedidoActual.salsas
      }
    };
  };

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