// Pedidos.jsx - Componente Principal Mejorado
import React, { useState, useEffect, useContext } from 'react';
import { CartContext } from "../../Cartas/pages/CartContext";
import './Pedidos.css';

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
  // Estado principal para manejar las vistas
  const [vistaActual, setVistaActual] = useState('productos');
  
  // Estado del pedido actual MEJORADO
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

  // Estado para la navegación del header
  const [tabActivo, setTabActivo] = useState('nuevo');

  // Estados para items seleccionados en cada vista
  const [toppingsSeleccionados, setToppingsSeleccionados] = useState([]);
  const [adicionesSeleccionadas, setAdicionesSeleccionadas] = useState([]);
  const [salsasSeleccionadas, setSalsasSeleccionadas] = useState([]);

  // Usar el contexto del carrito para mantener sincronización
  const { 
    productosSeleccionados: productosDelContexto,
    limpiarProductosSeleccionados
  } = useContext(CartContext);

  // Función para cambiar de vista
  const cambiarVista = (nuevaVista) => {
    setVistaActual(nuevaVista);
  };

  // Función para manejar el cambio de tabs
  const cambiarTab = (tab) => {
    setTabActivo(tab);
    switch(tab) {
      case 'nuevo':
        setVistaActual('productos');
        // Reiniciar el pedido cuando se va a nuevo pedido
        reiniciarPedido();
        break;
      case 'historial':
        setVistaActual('historial');
        break;
    }
  };

  // Función para reiniciar el pedido
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

  // Sincronizar productos del contexto con el pedido actual
  useEffect(() => {
    if (productosDelContexto && productosDelContexto.length > 0) {
      setPedidoActual(prev => ({
        ...prev,
        productos: productosDelContexto
      }));
    }
  }, [productosDelContexto]);

  // Función para agregar productos al pedido
  const agregarProducto = (producto) => {
    setPedidoActual(prev => {
      const productosExistentes = [...prev.productos];
      const productoExistente = productosExistentes.find(p => p.id === producto.id);
      
      if (productoExistente) {
        // Si ya existe, incrementar cantidad
        productoExistente.cantidad = (productoExistente.cantidad || 1) + 1;
      } else {
        // Si no existe, agregarlo con cantidad 1
        productosExistentes.push({ ...producto, cantidad: 1 });
      }
      
      return {
        ...prev,
        productos: productosExistentes
      };
    });
  };

  // Función para eliminar producto del pedido
  const eliminarProducto = (productoId) => {
    setPedidoActual(prev => ({
      ...prev,
      productos: prev.productos.filter(p => p.id !== productoId)
    }));
  };

  // Función para actualizar cantidad de producto
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

  // Función para cuando se hace clic en "Siguiente" después de seleccionar productos
  const siguienteDesdeProductos = () => {
    // Actualizar productos del pedido con los del contexto
    setPedidoActual(prev => ({
      ...prev,
      productos: productosDelContexto || []
    }));
    // Ir a la vista de toppings
    setVistaActual('toppings');
  };

  // Funciones para manejar la selección en las vistas
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

  // Función para continuar desde la vista de toppings
  const continuarDesdeToppings = () => {
    // Guardar toppings seleccionados en el pedido
    setPedidoActual(prev => ({
      ...prev,
      toppings: toppingsSeleccionados
    }));
    
    // Ir a vista de adiciones
    setVistaActual('adiciones');
  };

  // Función para continuar desde la vista de adiciones
  const continuarDesdeAdiciones = () => {
    // Guardar adiciones seleccionadas en el pedido
    setPedidoActual(prev => ({
      ...prev,
      adiciones: adicionesSeleccionadas
    }));
    
    // Ir a vista de salsas
    setVistaActual('salsas');
  };

  // Función para continuar desde la vista de salsas - IR DIRECTO A ENTREGA
  const continuarDesdeSalsas = () => {
    // Guardar salsas seleccionadas en el pedido
    setPedidoActual(prev => ({
      ...prev,
      salsas: salsasSeleccionadas
    }));
    
    // Ir directamente a opciones de entrega
    setVistaActual('entrega');
  };

  // Función para calcular el total MEJORADA
  const calcularTotal = () => {
    let total = 0;
    
    // Usar productos del estado del pedido actual o del contexto como fallback
    const productos = pedidoActual.productos.length > 0 
      ? pedidoActual.productos 
      : (productosDelContexto || []);
    
    // Sumar productos con cantidades
    total += productos.reduce((sum, producto) => 
      sum + (producto.precio * (producto.cantidad || 1)), 0
    );
    
    // Sumar toppings
    total += pedidoActual.toppings.reduce((sum, topping) => 
      sum + (topping.precio || 0), 0
    );
    
    // Sumar adiciones
    total += pedidoActual.adiciones.reduce((sum, adicion) => 
      sum + (adicion.precio || 0), 0
    );
    
    // Sumar salsas
    total += pedidoActual.salsas.reduce((sum, salsa) => 
      sum + (salsa.precio || 0), 0
    );
    
    return total;
  };

  // Función para manejar la confirmación del pedido
  const manejarConfirmacion = (pedidoConComentarios) => {
    setPedidoActual(prev => ({
      ...prev,
      comentarios: pedidoConComentarios.comentarios || ''
    }));
    setVistaActual('pago');
  };

  // Renderizar la vista actual
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
            onPedidoCompletado={() => {
              // Limpiar el pedido y cambiar a historial
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
      {/* Header con navegación */}
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

      {/* Indicador de progreso (solo para nuevo pedido) */}
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

      {/* Contenido principal */}
      <div className="pedidos-content">
        {renderizarVista()}
      </div>
    </div>
  );
};

export default Pedidos;