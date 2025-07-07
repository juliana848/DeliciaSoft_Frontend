import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import './Produccion/components/Css/Produccion.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';
import ModalAgregarProductos from './Produccion/components/ModalAgregarProductos';
import ModalDetalleReceta from './Produccion/components/ModalDetalleReceta';
import ModalInsumos from './Produccion/components/ModalInsumos';
import ModalAgregar from './Produccion/components/ModalAgregar';


export default function Produccion() {
    const [filtro, setFiltro] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTipo, setModalTipo] = useState(null);
    const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);
    const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
    const [mostrarAgregarProceso, setMostrarAgregarProceso] = useState(false);
    const [mostrarModalProductos, setMostrarModalProductos] = useState(false);
    const [mostrarDetalleInsumos, setMostrarDetalleInsumos] = useState(false);
    const [productoDetalleInsumos, setProductoDetalleInsumos] = useState(null);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
        const [productoEditandoReceta, setProductoEditandoReceta] = useState(null);
    const [mostrarModalRecetaDetalle, setMostrarModalRecetaDetalle] = useState(false);
    const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);
    const [procesos, setProcesos] = useState([]);
    const [pestanaActiva, setPestanaActiva] = useState('pedido');
    
    function obtenerImagen(producto) {
    if (
        producto.imagen &&
        (producto.imagen.startsWith("/") || producto.imagen.startsWith("http"))
    ) {
        return producto.imagen;
    } else {
        return "https://source.unsplash.com/120x120/?" + encodeURIComponent(producto.nombre + " postre");
    }
    }
    
    // Estados para el formulario de producción
    const [procesoData, setProcesoData] = useState({
    nombreProduccion: '',
    fechaCreacion: new Date().toISOString().split('T')[0],
    fechaEntrega: new Date().toISOString().split('T')[0],
    estadoProduccion: 'Empaquetando 🟠',
    estadoPedido: 'Abonado 🟣',
    numeroPedido: ''
    });

const procesosFiltrados = procesos.filter((p, i) => {
  // Asegura que solo se muestren los procesos del tipo actual (pedido o fabrica)
  if (p.tipoProduccion !== pestanaActiva) return false;

  const texto = filtro.toLowerCase();

  return (
    String(i + 1).includes(texto) || // N°
    p.nombreProduccion?.toLowerCase().includes(texto) || // Producción
    p.fechaCreacion?.toLowerCase().includes(texto) || // Fecha creación
    p.fechaEntrega?.toLowerCase().includes(texto) || // Fecha entrega
    p.numeroPedido?.toLowerCase().includes(texto) || // N° Pedido
    p.estadoPedido?.toLowerCase().includes(texto) || // Estado Pedido
    p.estadoProduccion?.toLowerCase().includes(texto) // Estado Producción
  );
});

const productosDisponibles = [
  {
    id: 1,
    nombre: 'Mini Donas',
    imagen: 'https://www.gourmet.cl/wp-content/uploads/2014/06/donuts.jpg',
    insumos: [
      { cantidad: 2, unidad: 'kg', nombre: 'Harina' },
      { cantidad: 1, unidad: 'kg', nombre: 'Azúcar' },
      { cantidad: 6, unidad: 'unidades', nombre: 'Huevos' }
    ],
    receta: {
      id: 32,
      nombre: 'Mini Donas con Azúcar y Canela',
      pasos: ['Freír donas', 'Pasar por mezcla de azúcar y canela'],
      insumos: ['Harina', 'Canela', 'Azúcar', 'Levadura', 'Huevos'],
      imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeC4LnjzReB9EHRknBi99jxMEV1TCbh1IsCw&s'
    }
  },
  {
    id: 2,
    nombre: 'Fresas con Crema',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLJpYaCsw9PrMPGeksePsJ11H1M3TICsywrg&s',
    insumos: [
      { cantidad: 5, unidad: 'g', nombre: 'Fresas' },
      { cantidad: 250, unidad: 'ml', nombre: 'Crema para batir' },
      { cantidad: 500, unidad: 'g', nombre: 'Azúcar glass' }
    ],
    receta: {
      id: 38,
      nombre: 'Fresas con Crema y Galleta',
      pasos: ['Colocar fresas en vaso', 'Agregar crema batida', 'Espolvorear galleta triturada'],
      insumos: ['Fresas', 'Crema de leche', 'Galleta María'],
      imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFzhVvkezQ69ngkBxtRgsySIVk_ovSiw6knQ&s'
    }
  },
  {
    id: 3,
    nombre: 'Pastel de Chocolate',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRqBba-wH5E0DMJztvKWuifPz8CnGoLs0N1g&s',
    insumos: [
      { cantidad: 3, unidad: 'kg', nombre: 'Harina' },
      { cantidad: 1.5, unidad: 'kg', nombre: 'Chocolate' },
      { cantidad: 1, unidad: 'kg', nombre: 'Mantequilla' },
      { cantidad: 12, unidad: 'unidades', nombre: 'Huevos' }
    ],
    receta: {
      id: 36,
      nombre: 'Torta de Chocolate con Café',
      pasos: ['Preparar mezcla con café', 'Hornear', 'Cubrir con ganache'],
      insumos: ['Harina', 'Café fuerte', 'Cacao', 'Azúcar', 'Huevos'],
      imagen: 'https://media.elgourmet.com/recetas/cover/1bdd8a837944f3a10abc33eeb9a036f8_3_3_photo.png'
    }
  },
  {
    id: 4,
    nombre: 'Obleas',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRX0_olEQJ1-IrfGe2hIdHZC5Aq1Kuh8vxKgg&s',
    insumos: [
      { cantidad: 1, unidad: 'paquete', nombre: 'Obleas' },
      { cantidad: 500, unidad: 'g', nombre: 'Arequipe' },
      { cantidad: 100, unidad: 'g', nombre: 'Queso rallado' }
    ],
    receta: {
      id: 35,
      nombre: 'Obleas con Queso y Miel',
      pasos: ['Agregar queso rallado', 'Rociar con miel de abejas', 'Servir fresca'],
      insumos: ['Obleas', 'Queso fresco', 'Miel de abejas'],
      imagen: 'https://thumbs.dreamstime.com/b/obleas-de-postre-colombianas-tradicionales-con-queso-fruta-y-salsa-caramelo-dulce-picada-tradicional-colombiano-219811662.jpg'
    }
  },
  {
    id: 5,
    nombre: 'Cupcakes',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbXVXFGLuon_IjkR_ApTXv7dFsK0-YqRgxJw&s',
    insumos: [
      { cantidad: 2, unidad: 'kg', nombre: 'Harina' },
      { cantidad: 1, unidad: 'kg', nombre: 'Azúcar' },
      { cantidad: 1, unidad: 'kg', nombre: 'Mantequilla' },
      { cantidad: 10, unidad: 'unidades', nombre: 'Huevos' }
    ],
    receta: {
      id: 39,
      nombre: 'Cupcakes de Limón con Merengue',
      pasos: ['Hornear cupcakes de limón', 'Decorar con merengue flameado'],
      insumos: ['Harina', 'Limón', 'Azúcar', 'Claras de huevo'],
      imagen: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiTQAWQv-QmMMpX4DYAOjoJtQ5UR0Io3lDpL7iq4emP5Gco4fonzZ4vcXGnvY7MJATPrcLqkfxij6LBL0OiDnYT_26QCAjjBQGZKs-3A2FX4-_RUWSBXzGHojEODq7ON6v1RXTahZDl07I4/s1600/Cupcakes+de+lim%25C3%25B3n+y+merengue.JPG'
    }
  },
  {
    id: 6,
    nombre: 'Arroz con Leche',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJfttSCCVrpPKvtnKQKkBV8DT5Ttyrhq14EA&s',
    insumos: [
      { cantidad: 1, unidad: 'kg', nombre: 'Arroz' },
      { cantidad: 1, unidad: 'litro', nombre: 'Leche' },
      { cantidad: 200, unidad: 'g', nombre: 'Azúcar' },
      { cantidad: 1, unidad: 'rama', nombre: 'Canela' }
    ],
    receta: {
      id: 40,
      nombre: 'Arroz con Leche y Coco',
      pasos: ['Cocer arroz', 'Agregar leche de coco y azúcar', 'Enfriar y servir'],
      insumos: ['Arroz', 'Leche de coco', 'Azúcar', 'Canela'],
      imagen: 'https://comopreparar.co/wp-content/uploads/2024/04/Delicioso-postre-Arroz-de-leche-de-coco-500x375.jpg'
    }
  },
  {
    id: 7,
    nombre: 'Postre de Galleta y Arequipe',
    imagen: 'https://ducales.com.co/wp-content/uploads/2019/01/receta-3.png',
    insumos: [
      { cantidad: 1, unidad: 'kg', nombre: 'Base de galleta' },
      { cantidad: 500, unidad: 'ml', nombre: 'Leche condensada' },
      { cantidad: 200, unidad: 'g', nombre: 'Frutas' }
    ],
    receta: {
      id: 42,
      nombre: 'Postre de Galleta y Arequipe',
      pasos: ['Capas de galleta y arequipe', 'Refrigerar por 2 horas'],
      insumos: ['Galletas', 'Arequipe', 'Crema de leche'],
      imagen: 'https://ducales.com.co/wp-content/uploads/2019/01/receta-3.png'
    }
  },
  {
    id: 8,
    nombre: 'Bombones de Chocolate Blanco',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEWe9y5x-O3i4Uq0pdYIpmbArKM0FOC7wBIw&s',
    insumos: [
      { cantidad: 1, unidad: 'kg', nombre: 'Chocolate blanco' },
      { cantidad: 0.1, unidad: 'kg', nombre: 'Esencia de fresa' },
      { cantidad: 0.1, unidad: 'kg', nombre: 'Colorante rosa' }
    ],
    receta: {
      id: 41,
      nombre: 'Bombones de Chocolate Blanco con Fresa',
      pasos: ['Derretir chocolate blanco', 'Rellenar moldes con fresa', 'Refrigerar'],
      insumos: ['Chocolate blanco', 'Esencia de fresa', 'Colorante rosa'],
      imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEWe9y5x-O3i4Uq0pdYIpmbArKM0FOC7wBIw&s'
    }
  }
];

useEffect(() => {
  const mockProcesos = [
    {
      id: 1,
      tipoProduccion: 'pedido',
      nombreProduccion: 'Producción #1',
      fechaCreacion: '2025-06-01',
      fechaEntrega: '2025-06-05',
      estadoPedido: 'Abonado 🟣',
      numeroPedido: 'P-001',
      productos: [
        {
          id: 3,
          nombre: 'Pastel de Chocolate',
          sede: 'San Pablo',
          cantidad: 1,
          receta: productosDisponibles.find(p => p.id === 3)?.receta
        }
      ]
    },
    {
      id: 2,
      tipoProduccion: 'fabrica',
      nombreProduccion: 'Producción #2',
      fechaCreacion: '2025-06-02',
      estadoProduccion: 'Empaquetando 🟠',
      productos: [
        {
          id: 1,
          nombre: 'Mini Donas',
          sede: 'San Benito',
          cantidad: 12,
          receta: productosDisponibles.find(p => p.id === 1)?.receta
        },
        {
          id: 2,
          nombre: 'Fresas con Crema',
          sede: 'San Pablo',
          cantidad: 6,
          receta: productosDisponibles.find(p => p.id === 2)?.receta
        }
      ]
    }
  ];

  const validos = mockProcesos.filter(p =>
    p.nombreProduccion && Array.isArray(p.productos) && p.productos.length > 0
  );

  setProcesos(validos);
}, []);

    const showNotification = (mensaje, tipo = 'success') => {
        setNotification({ visible: true, mensaje, tipo });
    };

    const hideNotification = () => {
        setNotification({ visible: false, mensaje: '', tipo: 'success' });
    };

    const abrirModal = (tipo, proceso) => {
        setModalTipo(tipo);
        setProcesoSeleccionado(proceso);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setProcesoSeleccionado(null);
        setModalTipo(null);
    };

    const abrirModalRecetaDetalle = (receta) => {
        setRecetaSeleccionada(receta);
        setMostrarModalRecetaDetalle(true);
    };

    const cerrarModalRecetaDetalle = () => {
        setMostrarModalRecetaDetalle(false);
        setRecetaSeleccionada(null);
    };

    const eliminarProceso = () => {
        const updated = procesos.filter(p => p.id !== procesoSeleccionado.id);
        setProcesos(updated);
        cerrarModal();
        showNotification('Proceso eliminado exitosamente');produccion.estado
    };

    // Función para actualizar el estado de un proceso
    const actualizarEstadoProceso = (procesoId, campo, valor) => {
        setProcesos(prev => 
            prev.map(proceso => 
                proceso.id === procesoId 
                    ? { ...proceso, [campo]: valor }
                    : proceso
            )
        );
        showNotification('Estado actualizado correctamente');
    };

    const handleChange = (e) => {
        setProcesoData({...procesoData, [e.target.name]: e.target.value});
    };

    const estadoProduccion = procesoData.estadoProduccion || 'Empaquetando 🟠';
    const estadoPedido = procesoData.estadoPedido || 'Abonado 🟣';
    const fechaCreacion = procesoData.fechaCreacion || new Date().toISOString().split('T')[0];
    const fechaEntrega = procesoData.fechaEntrega || new Date().toISOString().split('T')[0];

const agregarProducto = (producto) => {

  setProductosSeleccionados(prev => {
    const existe = prev.find(p => p.id === producto.id);
    if (existe) {
      return prev.map(p =>
        p.id === producto.id
          ? { ...p, cantidad: p.cantidad + 1 }
          : p
      );
    } else {
      const nuevo = {
        id: productoCompleto.id,
        nombre: productoCompleto.nombre,
        imagen: productoCompleto.imagen,
        insumos: productoCompleto.insumos,
        cantidad: 1,
        sede: '',
        receta: productoCompleto.receta || null
      };
      return [...prev, nuevo];
    }
  });
};



    const removeProducto = (id) => {
        setProductosSeleccionados(prev => prev.filter(item => item.id !== id));
        showNotification('Producto eliminado de la lista');
    };

    const cambiarSede = (id, nuevaSede) => {
    setProductosSeleccionados(prev =>
        prev.map(p => p.id === id ? { ...p, sede: nuevaSede } : p)
    );
    };


const cambiarCantidad = (id, nuevaCantidad) => {
  // Primero encontramos el producto que se quiere actualizar
  const productoAEditar = productosSeleccionados.find(p => p.id === id);
  if (!productoAEditar) return;

  const insumosMultiplicados = (producto, cantidad) => {
    return producto.insumos.map(insumo => ({
      nombre: insumo.nombre,
      cantidad: insumo.cantidad * cantidad
    }));
  };

  // Calculamos los insumos de todos los productos (considerando la nueva cantidad para el producto editado)
  const totales = {};

  productosSeleccionados.forEach(p => {
    const cantidadUsar = p.id === id ? nuevaCantidad : p.cantidad;
    p.insumos.forEach(insumo => {
      const nombre = insumo.nombre;
      const total = insumo.cantidad * cantidadUsar;
      totales[nombre] = (totales[nombre] || 0) + total;
    });
  });

  // Validamos si alguno supera el tope
  const excedeLimite = Object.entries(totales).some(([nombre, total]) => total > 25000);

  if (excedeLimite) {
    showNotification('Límite de insumos superado (máx. 25000)', 'error');
    return;
  }

  // Si todo bien, actualizamos la cantidad
  setProductosSeleccionados(prev =>
    prev.map(item =>
      item.id === id ? { ...item, cantidad: Math.max(1, nuevaCantidad) } : item
    )
  );
};

const numeroPedidos = procesos.filter(p => p.tipoProduccion === 'pedido').length;

const verInsumosProducto = (producto) => {
  const base = productosDisponibles.find(p => p.id === producto.id);
  if (!base || !base.insumos) return;

  const cantidad = producto.cantidad || 1;

  const insumosMultiplicados = base.insumos.map(insumo => ({
    ...insumo,
    cantidad: parseFloat(insumo.cantidad) * cantidad
  }));

  const productoConInsumos = {
    ...producto,
    imagen: base.imagen, // asegura imagen
    insumos: insumosMultiplicados
  };

  setProductoDetalleInsumos(productoConInsumos);
  setMostrarDetalleInsumos(true);
};


    const guardarProceso = () => {
        if (productosSeleccionados.length === 0) {
            showNotification('Debe agregar al menos un producto al proceso.', 'error');
            console.log('Ejecutando guardarProceso');
            return;
        }
        
        if (!procesoData.nombreProduccion.trim()) {
        showNotification('El nombre de la producción es obligatorio', 'error');
        return;
        }

        if (procesoData.tipoProduccion === 'pedido') {
        if (!procesoData.fechaEntrega) {
            showNotification('La fecha de entrega es obligatoria', 'error');
            return;
        }

        const hoy = new Date();
        const entrega = new Date(procesoData.fechaEntrega);
        const diff = (entrega - hoy) / (1000 * 60 * 60 * 24);

        if (diff < 15 || diff > 30) {
            showNotification('La fecha debe estar entre 15 días y 1 mes desde hoy', 'error');
            return;
        }
        }

        if (productosSeleccionados.some(p => !p.sede)) {
        showNotification('Todos los productos deben tener sede', 'error');
        return;
        }

        const nombreExiste = procesos.some(
            (p) => p.nombreProduccion.trim().toLowerCase() === procesoData.nombreProduccion.trim().toLowerCase()
        );

        if (nombreExiste) {
        showNotification('Ya existe una producción con ese nombre.', 'error');
        return;
        }


    const nuevoProceso = {
    id: procesos.length + 1,
    tipoProduccion: procesoData.tipoProduccion,
    nombreProduccion: procesoData.nombreProduccion,
    fechaCreacion: procesoData.fechaCreacion,
    fechaEntrega: procesoData.tipoProduccion === 'pedido' ? procesoData.fechaEntrega : '',
    estadoProduccion: procesoData.estadoProduccion,
    estadoPedido: procesoData.estadoPedido,
    productos: productosSeleccionados,
    sede: procesoData.sede || '',
    numeroPedido: `P-${String(procesos.length + 1).padStart(3, '0')}`
    };

        setProcesos(prev => [...prev, nuevoProceso]);

        showNotification('Proceso guardado correctamente', 'success');

        
        
        // Resetear el formulario
        setProcesoData({
            nombreProduccion: '',
            fechaCreacion: '',
            fechaEntrega: '',
            estadoProduccion: 'Empaquetando 🟠',
            estadoPedido: 'Abonado 🟣',
            numeroPedido: ''
        });
        setProductosSeleccionados([]);
        setMostrarAgregarProceso(false);
    };

const estadosProduccion = [
    'Pendiente 🟡',
    'Empaquetando 🟠',
    'En producción 🔵',
    'Decorado 🟤',
    'Empaquetado 🟦',
    'Entregado 🟢',
    'N/A 🔴'
];

const estadospedido = [
    'Abonado 🟣',
    'Empaquetando 🟠',
    'En producción 🔵',
    'Decorado 🟤',
    'Empaquetado 🟦',
    'Entregado a ventas 🔵',
    'Entregado al cliente 🟢',
    'N/A 🔴'
];



const obtenerOpcionesEstadoProduccion = (estadoActual) => {
    const mapaTransiciones = {
        'Empaquetando 🟠':['Pendiente 🟡','Empaquetando 🟠','En producción 🔵'],
        'Pendiente 🟡': ['Pendiente 🟡','Empaquetando 🟠'],
        'En producción 🔵': ['En producción 🔵','Decorado 🟤'],
        'Decorado 🟤': ['Decorado 🟤','Empaquetado 🟦'],
        'Empaquetado 🟦': ['Empaquetado 🟦','Entregado 🟢'],
        'Entregado 🟢': ['Entregado 🟢'],
        'N/A 🔴': []
    };

    const siguientes = mapaTransiciones[estadoActual] || [];
    return [...siguientes, 'N/A 🔴'];
};


const obtenerOpcionesEstadopedido = (estadoActual) => {
    const mapaTransiciones = {
        'Abonado 🟣':['Abonado 🟣','Empaquetando 🟠'],
        'Empaquetando 🟠':['Abonado 🟣','Empaquetando 🟠','En producción 🔵'],
        'En producción 🔵': ['En producción 🔵','Decorado 🟤'],
        'Decorado 🟤':['Decorado 🟤','Empaquetado 🟦'],
        'Empaquetado 🟦': ['Empaquetado 🟦','Entregado a ventas 🔵','Entregado al cliente 🟢'],
        'Entregado a ventas 🔵': ['Entregado a ventas 🔵'],
        'Entregado al cliente 🟢': ['Entregado al cliente 🟢'],
        'N/A 🔴': []
    };

    const siguientes = mapaTransiciones[estadoActual] || [];
    return [...siguientes, 'N/A 🔴'];
};

    // Componente para renderizar selects editables en la tabla
const renderEstadoSelect = (rowData, campo, forzarDeshabilitado = false) => {
  const estadoActual = rowData[campo];
  const esProduccion = campo === 'estadoProduccion';
  const esPedido = campo === 'estadoPedido';

  const deshabilitar =
    forzarDeshabilitado ||
    (esProduccion && ['Entregado 🟢', 'N/A 🔴'].includes(estadoActual)) ||
    (esPedido && ['Entregado a ventas 🔵', 'Entregado al cliente 🟢', 'N/A 🔴'].includes(estadoActual));

  return (
    <select
      value={estadoActual}
      onChange={(e) => actualizarEstadoProceso(rowData.id, campo, e.target.value)}
      disabled={deshabilitar}
      style={{
        width: '180px',
        padding: '4px',
        fontSize: '14px',
        border: 'none',
        appearance: 'none',
        background: 'transparent',
        color: deshabilitar ? '#888' : '#000',
        cursor: deshabilitar ? 'not-allowed' : 'pointer'
      }}
    >
      {(esProduccion
        ? obtenerOpcionesEstadoProduccion(estadoActual)
        : obtenerOpcionesEstadopedido(estadoActual)
      ).map((estado) => (
        <option key={estado} value={estado}>{estado}</option>
      ))}
    </select>
  );
};


    return (
        <div className="admin-wrapper">
            <Notification
                visible={notification.visible}
                mensaje={notification.mensaje}
                tipo={notification.tipo}
                onClose={hideNotification}
            />

            {!mostrarAgregarProceso ? (
                <>
                    <div className="admin-toolbar">
                        <button 
                            className="admin-button pink" 
                            onClick={() => setMostrarAgregarProceso(true)}
                            type="button"
                        >
                            + Agregar
                        </button>
                        <SearchBar placeholder="Buscar producción..." value={filtro} onChange={setFiltro} />
                    </div>

                <div className="ventas-header-container">
                    <h2 className="admin-section-title">Gestión de producción</h2>
                    <div className="filter-buttons-container" style={{ justifyContent: 'flex-end' }}>
                    <button
                        className={`filter-tab ${pestanaActiva === 'pedido' ? 'filter-tab-active' : ''}`}
                        onClick={() => setPestanaActiva('pedido')}
                    >
                        Pedidos
                    </button>
                    <button
                        className={`filter-tab ${pestanaActiva === 'fabrica' ? 'filter-tab-active' : ''}`}
                        onClick={() => setPestanaActiva('fabrica')}
                    >
                        Fábrica
                    </button>
                    </div>
                </div>
                    

{pestanaActiva === 'pedido' && (
  <DataTable
    value={procesosFiltrados}
    className="admin-table"
    paginator rows={10}
    rowsPerPageOptions={[5, 10, 25, 50]}>
    <Column 
        header="N°" 
        body={(rowData, { rowIndex }) => rowIndex + 1} 
        headerStyle={{ textAlign: 'right', paddingLeft:'15px'}}
        bodyStyle={{ textAlign: 'center', paddingLeft:'10px'}}
        style={{ width: '0.5rem' }}/>
    <Column 
        field="nombreProduccion" 
        header="Producción"
        headerStyle={{ textAlign: 'right', paddingLeft:'30px'}}
        bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
        style={{ width: '150px' }} />
    <Column
        field="fechaCreacion" 
        header="Fecha Creación" 
        headerStyle={{ textAlign: 'right', paddingLeft:'50px'}}
        bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
        style={{ width: '200px' }}/>
    <Column 
        field="fechaEntrega" 
        header="Fecha Entrega"
        headerStyle={{ textAlign: 'right', paddingLeft:'50px'}}
        bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
        style={{ width: '200px' }}/>
    <Column
        header="Estado Pedido"
        body={(rowData) => renderEstadoSelect(rowData, 'estadoPedido')}
        headerStyle={{ textAlign: 'right', paddingLeft:'40px'}}
        bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
        style={{ width: '250px' }}
    />
    <Column field="numeroPedido" header="N° Pedido" />
    <Column
        header="Acción"
        headerStyle={{ textAlign: 'right', paddingLeft:'100px'}}
        bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
        style={{ width: '250px' }}
        body={(rowData) => (
        <>
          <button
            className="admin-button gray"
            title="Visualizar"
            onClick={() => abrirModal('visualizar', rowData)}
          >
            🔍
          </button>
          <button
            className="admin-button red"
            title="Eliminar"
            onClick={() => abrirModal('eliminar', rowData)}
          >
            🗑️
          </button>
        </>
      )}
    />
  </DataTable>
)}

{pestanaActiva === 'fabrica' && (
  <DataTable
    value={procesosFiltrados}
    className="admin-table"
    paginator rows={10}
    rowsPerPageOptions={[5, 10, 25, 50]}
  >
    <Column 
        header="N°" 
        body={(rowData, { rowIndex }) => rowIndex + 1} 
        headerStyle={{ textAlign: 'right', paddingLeft:'15px'}}
        bodyStyle={{ textAlign: 'center', paddingLeft:'10px'}}
        style={{ width: '0.5rem' }}/>
    <Column 
        field="nombreProduccion" 
        header="Producción"
        headerStyle={{ textAlign: 'right', paddingLeft:'105px'}}
        bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
        style={{ width: '250px' }} />
    <Column 
        field="fechaCreacion" 
        header="Fecha Creación" 
        headerStyle={{ textAlign: 'right', paddingLeft:'105px'}}
        bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
        style={{ width: '250px' }}/>
    <Column
        header="Estado Producción"
        body={(rowData) => renderEstadoSelect(rowData, 'estadoProduccion')}
        headerStyle={{ textAlign: 'right', paddingLeft:'56px'}}
        bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
        style={{ width: '250px' }}/>
    <Column
        header="Acción"
        headerStyle={{ textAlign: 'right', paddingLeft:'125px'}}
        bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
        style={{ width: '250px' }}
        body={(rowData) => (
        <>
          <button
            className="admin-button gray"
            title="Visualizar"
            onClick={() => abrirModal('visualizar', rowData)}
          >
            🔍
          </button>
          <button
            className="admin-button red"
            title="Eliminar"
            onClick={() => abrirModal('eliminar', rowData)}
          >
            🗑️
          </button>
        </>
      )}
    />
  </DataTable>
)}


                        <Modal visible={modalVisible} onClose={cerrarModal}>
                        {modalTipo === 'visualizar' && procesoSeleccionado && (
                            <div>
                                    <h2 className="form-title">Detalle de Producción #{procesoSeleccionado.id}</h2>
                                    <div className="form-group">
                                        <label className="form-label">Producción</label>
                                        <input
                                        type="text"
                                        className="form-input"
                                        value={procesoSeleccionado.nombreProduccion}
                                        disabled
                                        />
                                    </div>
                                    <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Fecha Creación</label>
                                        <input
                                        type="text"
                                        className="form-input"
                                        value={procesoSeleccionado.fechaCreacion}
                                        disabled
                                        />
                                    </div>

                                    {procesoSeleccionado.tipoProduccion === 'pedido' && (
                                        <div className="form-group">
                                        <label className="form-label">Fecha Entrega</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={procesoSeleccionado.fechaEntrega}
                                            disabled
                                        />
                                        </div>
                                    )}
                                    </div>
                                    <div className="form-row">

                                    {pestanaActiva === 'fabrica' && (
                                    <div className="form-group">
                                        <label className="form-label">Estado Producción</label>
                                        <input
                                        type="text"
                                        className="form-input"
                                        value={procesoSeleccionado.estadoProduccion || 'N/A'}
                                        disabled
                                        />
                                    </div>
                                    )}
                                    {pestanaActiva === 'pedido' && (
                                    <div className="form-group">
                                        <label className="form-label">Estado Pedido</label>
                                        <input
                                        type="text"
                                        className="form-input"
                                        value={procesoSeleccionado.estadoPedido || 'N/A'}
                                        disabled
                                        />
                                    </div>
                                    )}

                                    </div>
                                {procesoSeleccionado.tipoProduccion === 'pedido' && (
                                <div className="form-group">
                                    <label className="form-label">N° Pedido</label>
                                    <input
                                    type="text"
                                    className="form-input"
                                    value={procesoSeleccionado.numeroPedido}
                                    disabled
                                    />
                                </div>
                                    )}

                                
                                <h4>Productos:</h4>
                                <div style={{ maxHeight: '150px', overflowY: 'auto', marginTop: '10px' }}>
                                <table className="productos-table" style={{ width: '100%' }}>
                                    <thead>
                                    <tr>
                                        <th>Imagen</th>
                                        <th>Nombre</th>
                                        <th>Sede</th>
                                        <th>Cantidad</th>
                                        <th>Receta</th>
                                        <th>Insumos</th>
                                    </tr>
                                    </thead>
                                    <tbody>
{procesoSeleccionado.productos.map((item) => {
  const productoCompleto = productosDisponibles.find(p => p.id === item.id);
  return (
    <tr key={item.id}>
      <td>
        <img
          src={productoCompleto?.imagen || 'https://via.placeholder.com/50'}
          alt={item.nombre}
          width="50"
          height="50"
          style={{ objectFit: 'cover', borderRadius: '4px' }}
        />
      </td>
      <td>{item.nombre}</td>
      <td>{item.sede}</td>
      <td>{item.cantidad}</td>
      <td>
        {item.receta ? (
          <button
            className="btn-receta"
            onClick={() => abrirModalRecetaDetalle(item.receta)}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📖 {item.receta.nombre}
          </button>
        ) : (
          <span style={{ color: '#999' }}>Sin receta</span>
        )}
      </td>
      <td>
        <button
          className="btn-insumos"
          onClick={() => {
            setProductoDetalleInsumos({
              ...item,
              insumos:
                item.insumos ||
                productoCompleto?.insumos?.map(insumo => ({
                  ...insumo,
                  cantidad: parseFloat(insumo.cantidad) * (item.cantidad || 1)
                })) ||
                [],
              imagen: item.imagen || productoCompleto?.imagen,
              cantidad: item.cantidad || 1
            });
            setMostrarDetalleInsumos(true);
          }}
          style={{
            background: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📋 Ver insumos
        </button>
      </td>
    </tr>
  );
})}


                                    </tbody>
                                </table>
                                </div>
                                <div className="modal-footer">
                                <button className="modal-btn save-btn" onClick={cerrarModal}>regresar</button>
                            </div>
                            </div>
                        )}


                        {modalTipo === 'eliminar' && (
                        <div>
                            <h2>Elimiminar producción</h2>
                            <h3>
                            ¿Seguro que desea eliminar <strong>{procesoSeleccionado?.nombreProduccion}</strong>?
                            </h3>
                            <div className="modal-footer">
                            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
                            <button className="modal-btn save-btn" onClick={eliminarProceso}>Eliminar</button>
                            </div>
                        </div>
                        )}
                    </Modal>

                    {mostrarModalRecetaDetalle && recetaSeleccionada && (
                        <Modal visible={mostrarModalRecetaDetalle} onClose={cerrarModalRecetaDetalle}>
                            <div className="receta-detalle-container">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                    <img 
                                        src={recetaSeleccionada.imagen} 
                                        alt={recetaSeleccionada.nombre}
                                        width="80" 
                                        height="80"
                                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                    <div>
                                        <h2 style={{ margin: '0 0 8px 0' }}>{recetaSeleccionada.nombre}</h2>
                                        <p style={{ margin: '0', color: '#666' }}>
                                            {recetaSeleccionada.insumos.length} insumos • {recetaSeleccionada.pasos.length} pasos
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <h3>📋 Insumos necesarios:</h3>
                                        <ul style={{ listStyle: 'none', padding: '0' }}>
                                            {recetaSeleccionada.insumos.map((insumo, index) => (
                                                <li key={index} style={{ 
                                                    padding: '8px', 
                                                    marginBottom: '4px', 
                                                    backgroundColor: '#f5f5f5', 
                                                    borderRadius: '4px' 
                                                }}>
                                                    • {insumo}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3>👩‍🍳 Pasos de preparación:</h3>
                                        <ol style={{ paddingLeft: '20px' }}>
                                            {recetaSeleccionada.pasos.map((paso, index) => (
                                                <li key={index} style={{ 
                                                    padding: '8px 0', 
                                                    marginBottom: '8px',
                                                    borderBottom: '1px solid #eee'
                                                }}>
                                                    {paso}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>

                                <div className="modal-footer" style={{ marginTop: '20px' }}>
                                    <button
                                        className="modal-btn cancel-btn"
                                        onClick={cerrarModalRecetaDetalle}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    )}

                    {mostrarDetalleInsumos && productoDetalleInsumos && (
                        <Modal visible={mostrarDetalleInsumos} onClose={() => setMostrarDetalleInsumos(false)}>
                            <div className="insumos-modal-container">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                    <img 
                                        src={productoDetalleInsumos.imagen} 
                                        alt={productoDetalleInsumos.nombre}
                                        width="80" 
                                        height="80"
                                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                    <div>
                                        <h2 style={{ margin: '0 0 8px 0' }}>Insumos para: {productoDetalleInsumos.nombre}</h2>
                                        <p style={{ margin: '0', color: '#666' }}>
                                            {productoDetalleInsumos.insumos?.length || 0} insumos necesarios
                                        </p>
                                    </div>
                                </div>
                                
                                <table className="insumos-table" style={{ 
                                    width: '100%', 
                                    borderCollapse: 'collapse',
                                    marginTop: '20px'
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th style={{ 
                                                padding: '12px', 
                                                textAlign: 'left', 
                                                borderBottom: '2px solid #dee2e6',
                                                fontWeight: 'bold'
                                            }}>Cantidad</th>
                                            <th style={{ 
                                                padding: '12px', 
                                                textAlign: 'left', 
                                                borderBottom: '2px solid #dee2e6',
                                                fontWeight: 'bold'
                                            }}>Unidad</th>
                                            <th style={{ 
                                                padding: '12px', 
                                                textAlign: 'left', 
                                                borderBottom: '2px solid #dee2e6',
                                                fontWeight: 'bold'
                                            }}>Insumo</th>
                                        </tr>
                                    </thead>
<tbody>
{productoDetalleInsumos.insumos?.map((insumo, index) => {
  const cantidadBase = parseFloat(insumo.cantidad) || 0;
  const cantidadMultiplicada = (cantidadBase * (productoDetalleInsumos.cantidad || 1)).toFixed(2);

  return (
    <tr key={index}>
      <td style={{ padding: '12px', fontWeight: 'bold' }}>{cantidadMultiplicada}</td>
      <td>{insumo.unidad || 'N/A'}</td>
      <td>{insumo.nombre || insumo}</td>
    </tr>
  );
})}

</tbody>
                                </table>
                                
                                <div className="modal-footer" style={{ marginTop: '20px' }}>
                                    <button
                                        className="modal-btn cancel-btn"
                                        onClick={() => setMostrarDetalleInsumos(false)}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    )}
                </>
            ) : (
                <div className="compra-form-container">
  <h1>Agregar Producción</h1>

  <form
    onSubmit={(e) => {
      e.preventDefault();
      guardarProceso();
    }}
  >
    <div className="compra-fields-grid">
    <div className="field-group">
    <label>Tipo de Producción<span style={{ color: 'red' }}>*</span></label>
    <select
    name="tipoProduccion"
    className="modal-input"
    value={procesoData.tipoProduccion}
    onChange={handleChange}
    required
    >
    <option value="">Seleccione</option>
    <option value="pedido">Pedido</option>
    <option value="fabrica">Fábrica</option>
    </select>
    </div>

      <div className="field-group">
        <label>Nombre de la Producción <span style={{ color: 'red' }}>*</span></label>
        <input
        type="text"
        list="opcionesProduccion"
        name="nombreProduccion"
        value={procesoData.nombreProduccion}
        onChange={handleChange}
        className="modal-input"
        required
        />
        <datalist id="opcionesProduccion">
        {[...Array(10)].map((_, i) => (
            <option key={i} value={`Producción #${i + 1}`} />
        ))}
        {procesos.map((p, i) => (
            <option key={`exist-${i}`} value={p.nombreProduccion} />
        ))}
        </datalist>
      </div>

      <div className="field-group">
        <label>Fecha de creación</label>
        <input
          type="date"
          className="modal-input"
          value={new Date().toISOString().split('T')[0]}
          disabled
        />
      </div>

{procesoData.tipoProduccion === 'pedido' && (
  <>
    <div className="field-group">
      <label>Fecha de Entrega<span style={{ color: 'red' }}>*</span></label>
      <input
        type="date"
        name="fechaEntrega"
        className="modal-input"
        value={procesoData.fechaEntrega}
        onChange={handleChange}
        required
        min={new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]}
        max={new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}
      />
    </div>

    <div className="field-group">
      <label>Número del pedido</label>
      <input
        type="text"
        className="modal-input"
        value={`P-${String(numeroPedidos + 1).padStart(3, '0')}`}
        disabled
        />
    </div>
  </>
)}
    </div>

<button
  type="button"
  className="admin-button pink"
  onClick={() => setMostrarModalProductos(true)}
>
  + Agregar
</button>
                        {productosSeleccionados.length > 0 && (
                            <div className="productos-seleccionados">
                                <h3>Productos agregados:</h3>
                                <table className="productos-table">
                                    <thead>
                                    <tr>
                                        <th>Imagen</th>
                                        <th>Nombre</th>
                                        <th>Sede<span style={{ color: 'red' }}>*</span></th>
                                        <th>Cantidad</th>
                                        <th>Receta</th>
                                        <th>Insumos</th>
                                        <th>Acción</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                        {productosSeleccionados.map(item => (
                                            <tr key={item.id}>
                                            <td>
                                                <img 
                                                src={item.imagen || 'https://via.placeholder.com/50'} 
                                                alt={item.nombre} 
                                                width="50" 
                                                height="50"
                                                style={{ objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            </td>
                                            <td>
                                                <div>{item.nombre}</div>
                                                {item.receta && (
                                                <small style={{ fontSize: '12px', color: '#666' }}>
                                                    📘 {item.receta.nombre}
                                                </small>
                                                )}
                                            </td>
                                            <td>
                                                <select value={item.sede} onChange={(e) => cambiarSede(item.id, e.target.value)} required>
                                                <option value="">Seleccione</option>
                                                <option value="San Pablo">San Pablo</option>
                                                <option value="San Benito">San Benito</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                type="number"
                                                min="1"
                                                value={item.cantidad}
                                                onChange={(e) => cambiarCantidad(item.id, parseInt(e.target.value))}
                                                style={{ width: '60px' }}
                                                />
                                            </td>
                                            <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {item.receta ? (
                                                <button 
                                                    type="button"
                                                    className="btn-insumos"
                                                    onClick={() => abrirModalRecetaDetalle(item.receta)}
                                                    style={{ 
                                                    background: '#4CAF50', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    padding: '3px 6px',
                                                    fontSize: '15px',
                                                    borderRadius: '3px',
                                                    cursor: 'pointer'
                                                    }}
                                                >
                                                    📘 receta
                                                </button>
                                                ) : (
                                                <span style={{ color: '#888', fontSize: '12px' }}>Sin receta</span>
                                                )}
                                            </div>
                                            </td>
                                            <td>
                                            <button
                                            className="btn-insumos"
                                            onClick={() => verInsumosProducto(producto)}
                                            style={{ 
                                              background: '#2196F3',
                                              color: 'white',
                                              border: 'none',
                                              padding: '4px 6px',
                                              fontSize: '15px',
                                              borderRadius: '4px',
                                              cursor: 'pointer'
                                            }}
                                          >
                                            📋 insumos
                                          </button>
                                            </td>
                                            <td>
                                            <button
                                                type="button"
                                                className="btn-eliminar"
                                                onClick={() => removeProducto(item.id)}
                                                style={{ 
                                                background: '#f44336', 
                                                color: 'white', 
                                                border: 'none', 
                                                padding: '3px 6px',
                                                fontSize: '20px',
                                                borderRadius: '100%',
                                                cursor: 'pointer'
                                                }}
                                            >
                                                🗑️
                                            </button>
                                            </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                </table>
                            </div>
                        )}

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="modal-btn cancel-btn"
                                onClick={() => setMostrarAgregarProceso(false)}
                            >Cancelar</button>
                            <button className="modal-btn save-btn" type="submit">Guardar</button>
                            </div>
                        </form>

            {mostrarModalProductos && (
                <Modal visible={mostrarModalProductos} onClose={() => setMostrarModalProductos(false)}>
                <ModalAgregarProductos
                    productosDisponibles={productosDisponibles}
                    productosSeleccionados={productosSeleccionados}
                    setProductosSeleccionados={setProductosSeleccionados}
                    filtro={filtro}
                    setFiltro={setFiltro}
                    onClose={() => setMostrarModalProductos(false)}
                />
                </Modal>

                )}

{mostrarModalRecetaDetalle && recetaSeleccionada && (
  <Modal visible={mostrarModalRecetaDetalle} onClose={cerrarModalRecetaDetalle}>
    <ModalDetalleReceta receta={recetaSeleccionada} onClose={cerrarModalRecetaDetalle} />
  </Modal>
)}

{mostrarDetalleInsumos && productoDetalleInsumos && (
  <Modal visible={mostrarDetalleInsumos} onClose={() => setMostrarDetalleInsumos(false)}>
    <ModalInsumos
      producto={productoDetalleInsumos}
      onClose={() => setMostrarDetalleInsumos(false)}
    />
  </Modal>
)}

                </div>
            )}
        </div>
    );
}