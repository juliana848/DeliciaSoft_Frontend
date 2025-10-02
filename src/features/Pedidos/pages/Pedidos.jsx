import React, { useState, useEffect, useContext } from 'react';
import { CartContext } from "../../Cartas/pages/CartContext";
import './Pedidos.css';

// Importar servicios
import ventaApiService from '../../Admin/services/venta_services';

// Importar componentes
import ProductosView from '../components/ProductosView';
import ToppingsView from '../components/ToppingsView';
import AdicionesView from '../components/AdicionesView';
import SalsasView from '../components/SalsasView';
import OpcionesEntregaView from '../components/OpcionesEntregaView';
import ConfirmacionView from '../components/ConfirmacionView';
import OpcionesPagoView from '../components/OpcionesPagoView';
import HistorialView from '../components/HistorialView';

const Pedidos = () => {
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
  const [toppingsSeleccionados, setToppingsSeleccionados] = useState([]);
  const [adicionesSeleccionadas, setAdicionesSeleccionadas] = useState([]);
  const [salsasSeleccionadas, setSalsasSeleccionadas] = useState([]);

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
    setToppingsSeleccionados([]);
    setAdicionesSeleccionadas([]);
    setSalsasSeleccionadas([]);
    limpiarProductosSeleccionados();
  };

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
    setPedidoActual(prev => ({
      ...prev,
      productos: productosDelContexto || []
    }));
    setVistaActual('toppings');
  };

  const toggleTopping = (topping) => {
    setToppingsSeleccionados(prev => {
      const existe = prev.find(item => item.id === topping.id);
      if (existe) {
        return prev.filter(item => item.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  const toggleAdicion = (adicion) => {
    setAdicionesSeleccionadas(prev => {
      const existe = prev.find(item => item.id === adicion.id);
      if (existe) {
        return prev.filter(item => item.id !== adicion.id);
      } else {
        return [...prev, adicion];
      }
    });
  };

  const toggleSalsa = (salsa) => {
    setSalsasSeleccionadas(prev => {
      const existe = prev.find(item => item.id === salsa.id);
      if (existe) {
        return prev.filter(item => item.id !== salsa.id);
      } else {
        return [...prev, salsa];
      }
    });
  };

  const continuarDesdeToppings = () => {
    setPedidoActual(prev => ({
      ...prev,
      toppings: toppingsSeleccionados
    }));
    setVistaActual('adiciones');
  };

  const continuarDesdeAdiciones = () => {
    setPedidoActual(prev => ({
      ...prev,
      adiciones: adicionesSeleccionadas
    }));
    setVistaActual('salsas');
  };

  const continuarDesdeSalsas = () => {
    setPedidoActual(prev => ({
      ...prev,
      salsas: salsasSeleccionadas
    }));
    setVistaActual('entrega');
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

  // Función para preparar datos para la venta
  const prepararDatosVenta = (datosPago) => {
    const productos = pedidoActual.productos.length > 0 
      ? pedidoActual.productos 
      : (productosDelContexto || []);

    // Preparar productos con sus extras
    const productosConExtras = productos.map(producto => {
      const precioBase = producto.precio * (producto.cantidad || 1);
      
      // Calcular precio de extras (solo si hay toppings, adiciones o salsas)
      let precioExtras = 0;
      if (pedidoActual.toppings.length > 0) {
        precioExtras += pedidoActual.toppings.reduce((sum, t) => sum + (t.precio || 0), 0);
      }
      if (pedidoActual.adiciones.length > 0) {
        precioExtras += pedidoActual.adiciones.reduce((sum, a) => sum + a.precio, 0);
      }
      if (pedidoActual.salsas.length > 0) {
        precioExtras += pedidoActual.salsas.reduce((sum, s) => sum + s.precio, 0);
      }

      const subtotal = precioBase + precioExtras;
      const iva = subtotal * 0.19;

      return {
        idproductogeneral: producto.id,
        cantidad: producto.cantidad || 1,
        precio: producto.precio,
        preciounitario: producto.precio,
        subtotal: subtotal,
        iva: iva
      };
    });

    const totalFinal = calcularTotal();
    const ivaTotal = totalFinal * 0.19;

    return {
      fechaventa: new Date().toISOString(),
      cliente: null, // Cliente genérico para pedidos desde el sistema público
      clienteNombre: 'Cliente Pedido Online',
      sede: datosPago.sedeNombre || pedidoActual.opciones.entrega?.ubicacionData?.nombre,
      sedeNombre: datosPago.sedeNombre || pedidoActual.opciones.entrega?.ubicacionData?.nombre,
      metodopago: datosPago.metodo || pedidoActual.opciones.pago,
      tipoventa: 'pedido',
      total: totalFinal + ivaTotal,
      productos: productosConExtras,
      // Información adicional del pedido
      datosEntrega: pedidoActual.opciones.entrega?.datosEntrega,
      comentarios: pedidoActual.comentarios,
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

      case 'toppings':
        return (
          <ToppingsView 
            selectedItems={toppingsSeleccionados}
            onItemToggle={toggleTopping}
            onContinue={continuarDesdeToppings}
            onBack={() => setVistaActual('productos')}
          />
        );

      case 'adiciones':
        return (
          <AdicionesView 
            selectedItems={adicionesSeleccionadas}
            onItemToggle={toggleAdicion}
            onContinue={continuarDesdeAdiciones}
            onBack={() => setVistaActual('toppings')}
          />
        );

      case 'salsas':
        return (
          <SalsasView 
            selectedItems={salsasSeleccionadas}
            onItemToggle={toggleSalsa}
            onContinue={continuarDesdeSalsas}
            onBack={() => setVistaActual('adiciones')}
          />
        );
      
      case 'entrega':
        return (
          <OpcionesEntregaView 
            pedido={pedidoActual}
            onSiguiente={() => cambiarVista('confirmacion')}
            onAnterior={() => cambiarVista('salsas')}
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
            <div className={`step ${vistaActual === 'productos' ? 'active' : ''} ${['toppings', 'adiciones', 'salsas', 'entrega', 'confirmacion', 'pago'].includes(vistaActual) ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Productos</span>
            </div>
            <div className={`step ${['toppings', 'adiciones', 'salsas'].includes(vistaActual) ? 'active' : ''} ${['entrega', 'confirmacion', 'pago'].includes(vistaActual) ? 'completed' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Personalización</span>
            </div>
            <div className={`step ${vistaActual === 'entrega' ? 'active' : ''} ${['confirmacion', 'pago'].includes(vistaActual) ? 'completed' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Entrega</span>
            </div>
            <div className={`step ${vistaActual === 'confirmacion' ? 'active' : ''} ${vistaActual === 'pago' ? 'completed' : ''}`}>
              <span className="step-number">4</span>
              <span className="step-label">Confirmar</span>
            </div>
            <div className={`step ${vistaActual === 'pago' ? 'active' : ''}`}>
              <span className="step-number">5</span>
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