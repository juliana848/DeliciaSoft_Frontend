import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../Cartas/pages/CartContext';
import './PersonalizacionProductos.css';

const PersonalizacionProductos = () => {
  const navigate = useNavigate();
  const { carrito } = useContext(CartContext);
  const topRef = useRef(null);
  
  const [productoActualIndex, setProductoActualIndex] = useState(0);
  const [unidadActual, setUnidadActual] = useState(1);
  const [personalizaciones, setPersonalizaciones] = useState({});
  const [catalogos, setCatalogos] = useState({
    toppings: [],
    salsas: [],
    rellenos: [],
    adiciones: [],
    sabores: []
  });
  const [configuraciones, setConfiguraciones] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });

  // 🆕 URLs ACTUALIZADAS CON TOPPINGS Y SALSAS
  const API_URLS = {
    adiciones: 'https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-adiciones',
    rellenos: 'https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-relleno',
    sabores: 'https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-sabor',
    toppings: 'https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-toppings',  // 🆕 NUEVO
    salsas: 'https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-salsas',      // 🆕 NUEVO
    configuracion: 'https://deliciasoft-backend-i6g9.onrender.com/api/configuracion-producto'
  };

  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // 🆕 CARGAR TODOS LOS CATÁLOGOS INCLUYENDO TOPPINGS Y SALSAS
      const [adicionesRes, rellenosRes, saboresRes, toppingsRes, salsasRes] = await Promise.all([
        fetch(API_URLS.adiciones).catch(() => ({ ok: false })),
        fetch(API_URLS.rellenos).catch(() => ({ ok: false })),
        fetch(API_URLS.sabores).catch(() => ({ ok: false })),
        fetch(API_URLS.toppings).catch(() => ({ ok: false })),  // 🆕 NUEVO
        fetch(API_URLS.salsas).catch(() => ({ ok: false }))     // 🆕 NUEVO
      ]);

      let adicionesData = [], rellenosData = [], saboresData = [], toppingsData = [], salsasData = [];

      if (adicionesRes.ok) adicionesData = await adicionesRes.json();
      if (rellenosRes.ok) rellenosData = await rellenosRes.json();
      if (saboresRes.ok) saboresData = await saboresRes.json();
      if (toppingsRes.ok) toppingsData = await toppingsRes.json();  // 🆕 NUEVO
      if (salsasRes.ok) salsasData = await salsasRes.json();        // 🆕 NUEVO

      console.log('📦 Catálogos cargados:');
      console.log('Adiciones:', adicionesData);
      console.log('Rellenos:', rellenosData);
      console.log('Sabores:', saboresData);
      console.log('Toppings:', toppingsData);  // 🆕 NUEVO
      console.log('Salsas:', salsasData);      // 🆕 NUEVO

      const getPlaceholderImage = (nombre, color = 'E91E63') => {
        return `https://via.placeholder.com/50x50/${color}/FFFFFF?text=${encodeURIComponent(nombre?.charAt(0) || '?')}`;
      };

      // 🆕 PROCESAR TOPPINGS Y SALSAS
      setCatalogos({
        toppings: Array.isArray(toppingsData) 
          ? toppingsData.filter(t => t.estado).map(t => ({
              id: t.idtopping || t.id,
              nombre: t.nombre,
              precio: parseFloat(t.precioadicion || 0),
              imagen: (t.imagen && t.imagen.trim() !== '') ? t.imagen : getPlaceholderImage(t.nombre, '8B4513')
            }))
          : [],
        salsas: Array.isArray(salsasData)
          ? salsasData.filter(s => s.estado).map(s => ({
              id: s.idsalsa || s.id,
              nombre: s.nombre,
              precio: parseFloat(s.precioadicion || 0),
              imagen: (s.imagen && s.imagen.trim() !== '') ? s.imagen : getPlaceholderImage(s.nombre, 'FF5722')
            }))
          : [],
        rellenos: Array.isArray(rellenosData) 
          ? rellenosData.filter(r => r.estado).map(r => ({
              id: r.idrelleno || r.id,
              nombre: r.nombre,
              precio: parseFloat(r.precioadicion || 0),
              imagen: (r.imagen && r.imagen.trim() !== '') ? r.imagen : getPlaceholderImage(r.nombre, '007BFF')
            }))
          : [],
        adiciones: Array.isArray(adicionesData)
          ? adicionesData.filter(a => a.estado).map(a => ({
              id: a.idadiciones || a.id,
              nombre: a.nombre,
              precio: parseFloat(a.precioadicion || 0),
              imagen: (a.imagen && a.imagen.trim() !== '') ? a.imagen : getPlaceholderImage(a.nombre, 'E91E63')
            }))
          : [],
        sabores: Array.isArray(saboresData)
          ? saboresData.filter(s => s.estado).map(s => ({
              id: s.idsabor || s.id,
              nombre: s.nombre,
              precio: parseFloat(s.precioadicion || 0),
              imagen: (s.imagen && s.imagen.trim() !== '') ? s.imagen : getPlaceholderImage(s.nombre, 'FFC107')
            }))
          : []
      });

      // Cargar configuraciones
      const configs = {};
      for (const producto of carrito) {
        try {
          const configRes = await fetch(`${API_URLS.configuracion}/producto/${producto.id}`);
          if (configRes.ok) {
            const config = await configRes.json();
            configs[producto.id] = config;
          } else {
            configs[producto.id] = {
              permiteToppings: true,   // 🆕 ACTIVADO POR DEFECTO
              permiteSalsas: true,     // 🆕 ACTIVADO POR DEFECTO
              permiteRellenos: true,
              permiteAdiciones: true,
              permiteSabores: false,
              limiteTopping: 3,        // 🆕 LÍMITE POR DEFECTO
              limiteSalsa: 2,          // 🆕 LÍMITE POR DEFECTO
              limiteRelleno: 3,
              limiteSabor: 0
            };
          }
        } catch (error) {
          configs[producto.id] = {
            permiteToppings: true,
            permiteSalsas: true,
            permiteRellenos: true,
            permiteAdiciones: true,
            permiteSabores: false,
            limiteTopping: 3,
            limiteSalsa: 2,
            limiteRelleno: 3,
            limiteSabor: 0
          };
        }
      }
      
      setConfiguraciones(configs);

      // Inicializar personalizaciones
      const initialPersonalizaciones = {};
      carrito.forEach(producto => {
        initialPersonalizaciones[producto.id] = {};
        for (let i = 1; i <= producto.cantidad; i++) {
          initialPersonalizaciones[producto.id][i] = {
            toppings: [],
            salsas: [],
            rellenos: [],
            adiciones: [],
            sabores: []
          };
        }
      });
      setPersonalizaciones(initialPersonalizaciones);

    } catch (error) {
      console.error('Error cargando datos:', error);
      showCustomAlert('error', 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => setShowAlert({ show: false, type: '', message: '' }), 3000);
  };

  const productoActual = carrito[productoActualIndex];
  const configActual = configuraciones[productoActual?.id] || {};
  const personalizacionActual = personalizaciones[productoActual?.id]?.[unidadActual] || {
    toppings: [],
    salsas: [],
    rellenos: [],
    adiciones: [],
    sabores: []
  };

  const toggleItem = (tipo, item) => {
    const limites = {
      toppings: configActual.limiteTopping || 0,
      salsas: configActual.limiteSalsa || 0,
      rellenos: configActual.limiteRelleno || 0,
      sabores: configActual.limiteSabor || 0
    };

    const limite = limites[tipo] || 0;
    const itemsActuales = personalizacionActual[tipo];
    const existe = itemsActuales.find(i => i.id === item.id);

    if (existe) {
      setPersonalizaciones(prev => ({
        ...prev,
        [productoActual.id]: {
          ...prev[productoActual.id],
          [unidadActual]: {
            ...prev[productoActual.id][unidadActual],
            [tipo]: itemsActuales.filter(i => i.id !== item.id)
          }
        }
      }));
    } else {
      if (limite > 0 && itemsActuales.length >= limite) {
        showCustomAlert('error', `Solo puedes seleccionar hasta ${limite} ${tipo}`);
        return;
      }
      
      setPersonalizaciones(prev => ({
        ...prev,
        [productoActual.id]: {
          ...prev[productoActual.id],
          [unidadActual]: {
            ...prev[productoActual.id][unidadActual],
            [tipo]: [...itemsActuales, item]
          }
        }
      }));
    }
  };

  const aplicarATodas = () => {
    const personalizacionBase = personalizaciones[productoActual.id][unidadActual];
    
    setPersonalizaciones(prev => {
      const nuevasPersonalizaciones = { ...prev };
      for (let i = 1; i <= productoActual.cantidad; i++) {
        nuevasPersonalizaciones[productoActual.id][i] = {
          toppings: [...personalizacionBase.toppings],
          salsas: [...personalizacionBase.salsas],
          rellenos: [...personalizacionBase.rellenos],
          adiciones: [...personalizacionBase.adiciones],
          sabores: [...personalizacionBase.sabores]
        };
      }
      return nuevasPersonalizaciones;
    });

    showCustomAlert('success', `✅ Personalización aplicada a todas las ${productoActual.cantidad} unidades`);
  };

  const siguienteUnidad = () => {
    if (unidadActual < productoActual.cantidad) {
      setUnidadActual(unidadActual + 1);
      showCustomAlert('success', `✅ Unidad ${unidadActual} guardada`);
      scrollToTop();
    } else {
      siguienteProducto();
    }
  };

  const siguienteProducto = () => {
    if (productoActualIndex < carrito.length - 1) {
      setProductoActualIndex(productoActualIndex + 1);
      setUnidadActual(1);
      showCustomAlert('success', '✅ Producto completo. Siguiente...');
      scrollToTop();
    } else {
      finalizarPersonalizacion();
    }
  };

  const anteriorUnidad = () => {
    if (unidadActual > 1) {
      setUnidadActual(unidadActual - 1);
      scrollToTop();
    } else if (productoActualIndex > 0) {
      setProductoActualIndex(productoActualIndex - 1);
      const productoAnterior = carrito[productoActualIndex - 1];
      setUnidadActual(productoAnterior.cantidad);
      scrollToTop();
    }
  };

  const finalizarPersonalizacion = () => {
    localStorage.setItem('personalizacionesPedido', JSON.stringify(personalizaciones));
    console.log('✅ Personalizaciones guardadas:', personalizaciones);
    showCustomAlert('success', '🎉 ¡Personalización completada!');
    
    setTimeout(() => {
      navigate('/pedidos', { state: { vista: 'entrega' } });
    }, 1000);
  };

  const calcularTotalUnidad = () => {
    let total = productoActual.precio;
    ['toppings', 'salsas', 'rellenos', 'adiciones', 'sabores'].forEach(tipo => {
      total += personalizacionActual[tipo].reduce((sum, item) => sum + (item.precio || 0), 0);
    });
    return total;
  };

  const totalUnidadesPersonalizadas = carrito.reduce((sum, p, idx) => {
    if (idx < productoActualIndex) return sum + p.cantidad;
    if (idx === productoActualIndex) return sum + (unidadActual - 1);
    return sum;
  }, 0);

  const totalUnidades = carrito.reduce((sum, p) => sum + p.cantidad, 0);

  if (loading) {
    return (
      <div className="personalizacion-loading">
        <div className="loading-spinner"></div>
        <p>Cargando personalización...</p>
      </div>
    );
  }

  if (!productoActual) {
    return (
      <div className="personalizacion-empty">
        <div className="empty-icon">📦</div>
        <h2>No hay productos para personalizar</h2>
        <p>Agrega productos al carrito</p>
        <button onClick={() => navigate('/cartas')} className="btn-primary">
          Ver Productos
        </button>
      </div>
    );
  }

  return (
    <div ref={topRef} className="personalizacion-container">
      {showAlert.show && (
        <div className={`custom-alert ${showAlert.type}`}>
          {showAlert.message}
        </div>
      )}

      <div className="personalizacion-content">
        <div className="producto-header-compacto" style={{ border: '3px solid #e91e63' }}>
          <div className="producto-compacto-layout">
            <div 
              className="producto-imagen-compacta"
              style={{ backgroundImage: `url(${productoActual.imagen})` }}
            />
            
            <div className="producto-info-compacta">
              <h1 className="producto-nombre-compacto">{productoActual.nombre}</h1>
              <p className="producto-detalle-compacto">
                ${productoActual.precio.toLocaleString()} por unidad
              </p>
            </div>

            <div style={{ 
              background: 'linear-gradient(45deg, #e91e63, #f06292)', 
              color: 'white', 
              padding: '15px 25px', 
              borderRadius: '15px', 
              textAlign: 'center', 
              minWidth: '120px',
              boxShadow: '0 4px 15px rgba(233,30,99,0.3)'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{unidadActual}</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>de {productoActual.cantidad}</div>
            </div>
          </div>

          <div className="progress-total-container">
            <span className="progress-label">
              Progreso total: {totalUnidadesPersonalizadas + 1}/{totalUnidades} unidades
            </span>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ width: `${((totalUnidadesPersonalizadas + 1) / totalUnidades) * 100}%` }}
              />
            </div>
          </div>

          {productoActual.cantidad > 1 && (
            <button 
              onClick={aplicarATodas} 
              style={{
                width: '100%',
                marginTop: '15px',
                padding: '12px 20px',
                border: 'none',
                borderRadius: '12px',
                background: 'linear-gradient(45deg, #17a2b8, #20c997)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🔄 Aplicar esta personalización a las {productoActual.cantidad} unidades
            </button>
          )}
        </div>

        {/* 🆕 SECCIÓN TOPPINGS */}
        {configActual.permiteToppings && catalogos.toppings.length > 0 && (
          <SeccionCompacta
            titulo="🍫 Toppings"
            items={catalogos.toppings}
            seleccionados={personalizacionActual.toppings}
            onToggle={(item) => toggleItem('toppings', item)}
            limite={configActual.limiteTopping}
            mensajeVacio="No hay toppings disponibles"
          />
        )}

        {/* 🆕 SECCIÓN SALSAS */}
        {configActual.permiteSalsas && catalogos.salsas.length > 0 && (
          <SeccionCompacta
            titulo="🍯 Salsas"
            items={catalogos.salsas}
            seleccionados={personalizacionActual.salsas}
            onToggle={(item) => toggleItem('salsas', item)}
            limite={configActual.limiteSalsa}
            mensajeVacio="No hay salsas disponibles"
          />
        )}

        {configActual.permiteRellenos && catalogos.rellenos.length > 0 && (
          <SeccionCompacta
            titulo="🥧 Rellenos"
            items={catalogos.rellenos}
            seleccionados={personalizacionActual.rellenos}
            onToggle={(item) => toggleItem('rellenos', item)}
            limite={configActual.limiteRelleno}
            mensajeVacio="No hay rellenos disponibles"
          />
        )}

        {configActual.permiteAdiciones && catalogos.adiciones.length > 0 && (
          <SeccionCompacta
            titulo="✨ Adiciones"
            items={catalogos.adiciones}
            seleccionados={personalizacionActual.adiciones}
            onToggle={(item) => toggleItem('adiciones', item)}
            limite={null}
          />
        )}

        {configActual.permiteSabores && catalogos.sabores.length > 0 && (
          <SeccionCompacta
            titulo="🎨 Sabores"
            items={catalogos.sabores}
            seleccionados={personalizacionActual.sabores}
            onToggle={(item) => toggleItem('sabores', item)}
            limite={configActual.limiteSabor}
          />
        )}

        <div className="resumen-compacto">
          <h3>📋 Resumen Unidad {unidadActual}</h3>
          <div className="resumen-items">
            <div className="resumen-item">
              <span>Producto:</span>
              <span>${productoActual.precio.toLocaleString()}</span>
            </div>
            {['toppings', 'salsas', 'rellenos', 'adiciones', 'sabores'].map(tipo => {
              const items = personalizacionActual[tipo];
              if (items.length === 0) return null;
              const total = items.reduce((sum, item) => sum + (item.precio || 0), 0);
              return (
                <div key={tipo} className="resumen-item extras">
                  <span style={{ textTransform: 'capitalize' }}>{tipo}:</span>
                  <span>+${total.toLocaleString()}</span>
                </div>
              );
            })}
            <div className="resumen-item total">
              <span>Total:</span>
              <span>${calcularTotalUnidad().toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="navigation-buttons">
          <button
            onClick={anteriorUnidad}
            disabled={productoActualIndex === 0 && unidadActual === 1}
            className="btn-nav anterior"
          >
            ← Anterior
          </button>
          
          <button onClick={siguienteUnidad} className="btn-nav siguiente">
            {unidadActual < productoActual.cantidad 
              ? `Siguiente Unidad (${unidadActual + 1}/${productoActual.cantidad}) →`
              : productoActualIndex < carrito.length - 1
              ? 'Siguiente Producto →'
              : 'Finalizar ✓'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

const SeccionCompacta = ({ titulo, items, seleccionados, onToggle, limite, mensajeVacio }) => {
  return (
    <div className="seccion-compacta">
      <div className="seccion-header-compacta">
        <h3>{titulo}</h3>
        {limite > 0 && (
          <p className="limite-info">
            Hasta {limite} opciones ({seleccionados.length}/{limite})
          </p>
        )}
        {!limite && items.length > 0 && (
          <p className="limite-info">Selecciona las que desees</p>
        )}
      </div>

      {items.length === 0 ? (
        <div className="no-items">
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔭</div>
          <p>{mensajeVacio || 'No hay opciones disponibles'}</p>
        </div>
      ) : (
        <div className="items-grid-compacta">
          {items.map(item => {
            const isSelected = seleccionados.some(s => s.id === item.id);
            return (
              <div
                key={item.id}
                onClick={() => onToggle(item)}
                className={`item-card-compacta ${isSelected ? 'selected' : ''}`}
              >
                <div 
                  className="item-imagen-compacta"
                  style={{ backgroundImage: `url(${item.imagen})` }}
                />
                <div className="item-info-compacta">
                  <div className="item-nombre-compacto">{item.nombre}</div>
                  <div className="item-precio-compacto">
                    {item.precio > 0 ? `+$${item.precio.toLocaleString()}` : 'Gratis'}
                  </div>
                </div>
                {isSelected && (
                  <div className="item-checkbox-compacto">✓</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PersonalizacionProductos;