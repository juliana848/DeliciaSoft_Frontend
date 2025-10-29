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
    adiciones: []
  });
  const [configuraciones, setConfiguraciones] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [modalAdiciones, setModalAdiciones] = useState(false);
  
  // 🎯 Estados para acordeones en resumen
  const [acordeones, setAcordeones] = useState({
    toppings: true,
    salsas: true,
    adiciones: true
  });
  
  const [searchToppings, setSearchToppings] = useState('');
  const [searchSalsas, setSearchSalsas] = useState('');
  const [searchAdiciones, setSearchAdiciones] = useState('');
  const [paginaToppings, setPaginaToppings] = useState(1);
  const [paginaSalsas, setPaginaSalsas] = useState(1);
  const [paginaAdiciones, setPaginaAdiciones] = useState(1);
  
  const ITEMS_POR_PAGINA = 9;

  const API_URLS = {
    adiciones: 'https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-adiciones',
    toppings: 'https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-toppings',
    salsas: 'https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-salsas',
    configuracion: 'https://deliciasoft-backend-i6g9.onrender.com/api/configuracion-producto',
    insumos: 'https://deliciasoft-backend-i6g9.onrender.com/api/insumos',
    imagenes: 'https://deliciasoft-backend-i6g9.onrender.com/api/imagenes'
  };

  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleAcordeon = (seccion) => {
    setAcordeones(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const [adicionesRes, toppingsRes, salsasRes, insumosRes] = await Promise.all([
        fetch(API_URLS.adiciones).catch(err => {
          console.error('❌ Error cargando adiciones:', err);
          return { ok: false };
        }),
        fetch(API_URLS.toppings).catch(err => {
          console.error('❌ Error cargando toppings:', err);
          return { ok: false };
        }),
        fetch(API_URLS.salsas).catch(err => {
          console.error('❌ Error cargando salsas:', err);
          return { ok: false };
        }),
        fetch(API_URLS.insumos).catch(err => {
          console.error('❌ Error cargando insumos:', err);
          return { ok: false };
        })
      ]);

      let adicionesData = [], toppingsData = [], salsasData = [], insumosData = [];

      if (adicionesRes.ok) {
        adicionesData = await adicionesRes.json();
        console.log('✅ Adiciones cargadas:', adicionesData.length);
      }
      
      if (toppingsRes.ok) {
        toppingsData = await toppingsRes.json();
        console.log('✅ Toppings cargados:', toppingsData.length);
      }
      
      if (salsasRes.ok) {
        salsasData = await salsasRes.json();
        console.log('✅ Salsas cargadas:', salsasData.length);
      }
      
      if (insumosRes.ok) {
        insumosData = await insumosRes.json();
        console.log('✅ Insumos cargados:', insumosData.length);
      }

      const getImagenInsumo = async (idinsumos) => {
        if (!idinsumos) {
          console.warn('⚠️ No hay idinsumos');
          return null;
        }

        const insumo = Array.isArray(insumosData) 
          ? insumosData.find(i => parseInt(i.idinsumo) === parseInt(idinsumos))
          : null;
        
        if (!insumo) {
          console.warn(`⚠️ No se encontró insumo con ID: ${idinsumos}`);
          return null;
        }

        console.log(`🔍 Procesando insumo ${idinsumos}:`, insumo);

        if (insumo.idimagen) {
          try {
            const imageUrl = `${API_URLS.imagenes}/${insumo.idimagen}`;
            console.log(`📡 Consultando imagen: ${imageUrl}`);
            
            const imageResponse = await fetch(imageUrl);
            
            if (imageResponse.ok) {
              const contentType = imageResponse.headers.get('content-type');
              console.log(`📸 Content-Type: ${contentType}`);
              
              if (contentType && contentType.startsWith('image/')) {
                console.log(`✅ Imagen directa encontrada: ${imageUrl}`);
                return imageUrl;
              }
              
              if (contentType && contentType.includes('json')) {
                const imageData = await imageResponse.json();
                console.log(`📦 Datos JSON de imagen:`, imageData);
                
                const imageUrlFromData = 
                  imageData.urlimg ||
                  imageData.url || 
                  imageData.ruta || 
                  imageData.urlimagen ||
                  imageData.imagenUrl ||
                  imageData.imagen ||
                  imageData.path ||
                  imageData.src;
                
                if (imageUrlFromData) {
                  console.log(`✅ URL extraída del JSON: ${imageUrlFromData}`);
                  
                  if (imageUrlFromData.startsWith('/')) {
                    const fullUrl = `https://deliciasoft-backend-i6g9.onrender.com${imageUrlFromData}`;
                    console.log(`🔗 URL completa construida: ${fullUrl}`);
                    return fullUrl;
                  }
                  
                  if (imageUrlFromData.startsWith('data:image')) {
                    console.log(`📸 Imagen base64 detectada`);
                    return imageUrlFromData;
                  }
                  
                  return imageUrlFromData;
                }
                
                if (imageData.data && imageData.data.url) {
                  console.log(`✅ URL en data.url: ${imageData.data.url}`);
                  return imageData.data.url;
                }
              }
            }
          } catch (error) {
            console.error(`❌ Error obteniendo imagen ${insumo.idimagen}:`, error);
          }
          
          const fallbackUrl = `${API_URLS.imagenes}/${insumo.idimagen}`;
          console.log(`⚠️ Usando URL directa como último recurso: ${fallbackUrl}`);
          return fallbackUrl;
        }

        if (insumo.imagenes) {
          if (insumo.imagenes.idimagenes) {
            const imagenUrl = `${API_URLS.imagenes}/${insumo.imagenes.idimagenes}`;
            console.log(`✅ Imagen desde relación Prisma: ${imagenUrl}`);
            return imagenUrl;
          }
          
          if (insumo.imagenes.url || insumo.imagenes.ruta) {
            const url = insumo.imagenes.url || insumo.imagenes.ruta;
            console.log(`✅ URL desde objeto imagenes: ${url}`);
            return url;
          }
        }

        console.warn(`⚠️ Insumo ${idinsumos} no tiene imagen disponible`);
        return null;
      };

      const getPlaceholderImage = (nombre, color = 'E91E63') => {
        const inicial = nombre?.charAt(0).toUpperCase() || '?';
        return `https://via.placeholder.com/100x100/${color}/FFFFFF?text=${encodeURIComponent(inicial)}`;
      };

      const toppingsPromises = Array.isArray(toppingsData) 
        ? toppingsData
            .filter(t => t.estado)
            .map(async (t, idx) => {
              const imagenInsumo = await getImagenInsumo(t.idinsumos);
              
              const toppingId = String(
                t.idtopping || 
                t.id || 
                t.idtoppings ||
                t.catalogotoppingId ||
                t.idinsumos || 
                `topping-${idx}`
              );
              
              console.log(`🍫 Topping #${idx} RAW:`, t);
              console.log(`🍫 Topping "${t.nombre}" - ID extraído: ${toppingId}`);
              
              return {
                id: toppingId,
                nombre: t.nombre,
                imagen: imagenInsumo || getPlaceholderImage(t.nombre, '8B4513'),
                _raw: t
              };
            })
        : [];

      const salsasPromises = Array.isArray(salsasData)
        ? salsasData
            .filter(s => s.estado)
            .map(async (s, idx) => {
              const imagenInsumo = await getImagenInsumo(s.idinsumos);
              const salsaId = String(s.idsalsa || s.id);
              console.log(`🍯 Salsa #${idx} "${s.nombre}" - ID: ${salsaId} (tipo: ${typeof salsaId}) - imagen: ${imagenInsumo || 'placeholder'}`);
              return {
                id: salsaId,
                nombre: s.nombre,
                imagen: imagenInsumo || getPlaceholderImage(s.nombre, 'FF5722')
              };
            })
        : [];

      const adicionesPromises = Array.isArray(adicionesData)
        ? adicionesData
            .filter(a => a.estado)
            .map(async (a, idx) => {
              const imagenInsumo = await getImagenInsumo(a.idinsumos);
              const adicionId = String(a.idadiciones || a.id);
              console.log(`✨ Adición #${idx} "${a.nombre}" - ID: ${adicionId} (tipo: ${typeof adicionId}) - imagen: ${imagenInsumo || 'placeholder'}`);
              return {
                id: adicionId,
                nombre: a.nombre,
                precio: parseFloat(a.precioadicion || 0),
                imagen: imagenInsumo || getPlaceholderImage(a.nombre, 'FFC107')
              };
            })
        : [];

      const [toppingsConImagenes, salsasConImagenes, adicionesConImagenes] = await Promise.all([
        Promise.all(toppingsPromises),
        Promise.all(salsasPromises),
        Promise.all(adicionesPromises)
      ]);

      setCatalogos({
        toppings: toppingsConImagenes,
        salsas: salsasConImagenes,
        adiciones: adicionesConImagenes
      });

      console.log('📊 Catálogos procesados:', {
        toppings: toppingsConImagenes.length,
        salsas: salsasConImagenes.length,
        adiciones: adicionesConImagenes.length
      });

      const configs = {};
      for (const producto of carrito) {
        try {
          const configRes = await fetch(`${API_URLS.configuracion}/producto/${producto.id}`);
          if (configRes.ok) {
            const config = await configRes.json();
            configs[producto.id] = config;
          } else {
            configs[producto.id] = {
              permiteToppings: false,
              permiteSalsas: false,
              permiteAdiciones: false,
              limiteTopping: 0,
              limiteSalsa: 0
            };
          }
        } catch (error) {
          configs[producto.id] = {
            permiteToppings: false,
            permiteSalsas: false,
            permiteAdiciones: false,
            limiteTopping: 0,
            limiteSalsa: 0
          };
        }
      }
      
      setConfiguraciones(configs);

      const initialPersonalizaciones = {};
      carrito.forEach(producto => {
        initialPersonalizaciones[producto.id] = {};
        for (let i = 1; i <= producto.cantidad; i++) {
          initialPersonalizaciones[producto.id][i] = {
            toppings: [],
            salsas: [],
            adiciones: []
          };
        }
      });
      setPersonalizaciones(initialPersonalizaciones);

    } catch (error) {
      console.error('❌ Error cargando datos:', error);
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
    adiciones: []
  };

  const seleccionarTopping = (item) => {
    console.log('🔍 Seleccionando topping:', item);
    console.log('📋 Toppings actuales:', personalizacionActual.toppings);
    
    const limite = configActual.limiteTopping || 0;
    const toppingsActuales = personalizacionActual.toppings || [];
    
    const itemIdStr = String(item.id);
    const yaSeleccionado = toppingsActuales.find(t => {
      const tIdStr = String(t.id);
      console.log(`  Comparando: "${tIdStr}" === "${itemIdStr}" ? ${tIdStr === itemIdStr}`);
      return tIdStr === itemIdStr;
    });
    
    console.log('✅ Ya seleccionado?', yaSeleccionado);
    
    if (yaSeleccionado) {
      console.log('🗑️ Quitando topping...');
      setPersonalizaciones(prev => ({
        ...prev,
        [productoActual.id]: {
          ...prev[productoActual.id],
          [unidadActual]: {
            ...prev[productoActual.id][unidadActual],
            toppings: toppingsActuales.filter(t => String(t.id) !== itemIdStr)
          }
        }
      }));
    } else {
      if (limite > 0 && toppingsActuales.length >= limite) {
        showCustomAlert('error', `Máximo ${limite} topping(s) permitido(s)`);
        return;
      }
      
      console.log('➕ Agregando topping...');
      setPersonalizaciones(prev => ({
        ...prev,
        [productoActual.id]: {
          ...prev[productoActual.id],
          [unidadActual]: {
            ...prev[productoActual.id][unidadActual],
            toppings: [...toppingsActuales, item]
          }
        }
      }));
    }
  };

  const seleccionarSalsa = (item) => {
    const limite = configActual.limiteSalsa || 0;
    const salsasActuales = personalizacionActual.salsas || [];
    
    const yaSeleccionado = salsasActuales.find(s => String(s.id) === String(item.id));
    
    if (yaSeleccionado) {
      setPersonalizaciones(prev => ({
        ...prev,
        [productoActual.id]: {
          ...prev[productoActual.id],
          [unidadActual]: {
            ...prev[productoActual.id][unidadActual],
            salsas: salsasActuales.filter(s => String(s.id) !== String(item.id))
          }
        }
      }));
    } else {
      if (limite > 0 && salsasActuales.length >= limite) {
        showCustomAlert('error', `Máximo ${limite} salsa(s) permitida(s)`);
        return;
      }
      
      setPersonalizaciones(prev => ({
        ...prev,
        [productoActual.id]: {
          ...prev[productoActual.id],
          [unidadActual]: {
            ...prev[productoActual.id][unidadActual],
            salsas: [...salsasActuales, item]
          }
        }
      }));
    }
  };

  const toggleAdicion = (item) => {
    const existe = personalizacionActual.adiciones.find(a => String(a.id) === String(item.id));
    
    setPersonalizaciones(prev => ({
      ...prev,
      [productoActual.id]: {
        ...prev[productoActual.id],
        [unidadActual]: {
          ...prev[productoActual.id][unidadActual],
          adiciones: existe 
            ? personalizacionActual.adiciones.filter(a => String(a.id) !== String(item.id))
            : [...personalizacionActual.adiciones, item]
        }
      }
    }));
  };

  const filtrarYPaginar = (items, search, pagina) => {
    const filtrados = items.filter(item => 
      item.nombre.toLowerCase().includes(search.toLowerCase())
    );
    const inicio = (pagina - 1) * ITEMS_POR_PAGINA;
    const fin = inicio + ITEMS_POR_PAGINA;
    return {
      items: filtrados.slice(inicio, fin),
      total: filtrados.length,
      totalPaginas: Math.ceil(filtrados.length / ITEMS_POR_PAGINA)
    };
  };

  const toppingsPaginados = filtrarYPaginar(catalogos.toppings, searchToppings, paginaToppings);
  const salsasPaginadas = filtrarYPaginar(catalogos.salsas, searchSalsas, paginaSalsas);
  const adicionesPaginadas = filtrarYPaginar(catalogos.adiciones, searchAdiciones, paginaAdiciones);

  const calcularTotalUnidad = () => {
    let total = productoActual.precio;
    total += personalizacionActual.adiciones.reduce((sum, item) => sum + (item.precio || 0), 0);
    return total;
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
      setPaginaToppings(1);
      setPaginaSalsas(1);
      setSearchToppings('');
      setSearchSalsas('');
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
    } else {
      navigate('/pedidos');
    }
  };

  const aplicarATodos = () => {
    const personalizacionBase = personalizaciones[productoActual.id][unidadActual];
    
    setPersonalizaciones(prev => {
      const nuevasPersonalizaciones = { ...prev };
      
      for (let i = 1; i <= productoActual.cantidad; i++) {
        nuevasPersonalizaciones[productoActual.id][i] = {
          toppings: [...personalizacionBase.toppings],
          salsas: [...personalizacionBase.salsas],
          adiciones: [...personalizacionBase.adiciones]
        };
      }
      
      return nuevasPersonalizaciones;
    });
    
    showCustomAlert('success', '✅ Personalización aplicada a todas las unidades');
    
    setTimeout(() => {
      siguienteProducto();
    }, 1000);
  };

  const finalizarPersonalizacion = () => {
    localStorage.setItem('personalizacionesPedido', JSON.stringify(personalizaciones));
    console.log('✅ Personalizaciones guardadas:', personalizaciones);
    showCustomAlert('success', '🎉 ¡Personalización completada!');
    
    setTimeout(() => {
      navigate('/pedidos', { state: { vista: 'entrega' } });
    }, 1000);
  };

  const tienePersonalizacion = configActual.permiteToppings || configActual.permiteSalsas || 
                                configActual.permiteAdiciones || configActual.permiteRellenos || 
                                configActual.permiteSabores;
  
  const tieneCatalogos = (configActual.permiteToppings && catalogos.toppings.length > 0) ||
                         (configActual.permiteSalsas && catalogos.salsas.length > 0) ||
                         (configActual.permiteAdiciones && catalogos.adiciones.length > 0);

  useEffect(() => {
    if (!loading && productoActual && (!tienePersonalizacion || !tieneCatalogos)) {
      console.log('Producto sin personalización disponible, saltando...');
      siguienteProducto();
    }
  }, [productoActualIndex, loading]);

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
        <div className="personalizacion-layout">
          <div className="left-panel">
            <div className="producto-header-compacto">
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

                <div className="unidad-badge">
                  <div className="unidad-badge-numero">{unidadActual}</div>
                  <div className="unidad-badge-texto">de {productoActual.cantidad}</div>
                </div>
              </div>

              {configActual.permiteAdiciones && catalogos.adiciones.length > 0 && (
                <button 
                  onClick={() => setModalAdiciones(true)}
                  className="btn-adicciones"
                >
                  <span className="icon">+</span>
                  Adicciones
                  {personalizacionActual.adiciones.length > 0 && (
                    <span className="badge-count">
                      {personalizacionActual.adiciones.length}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* 🎯 RESUMEN CON ACORDEONES */}
            <div className="resumen-compacto">
              <h3>📋 Resumen Unidad {unidadActual}</h3>
              <div className="resumen-items">
                <div className="resumen-item base">
                  <span className="resumen-item-nombre">
                    🍰 {productoActual.nombre}
                  </span>
                  <span className="resumen-item-precio">
                    ${productoActual.precio.toLocaleString()}
                  </span>
                </div>

                {/* Acordeón Toppings */}
                {personalizacionActual.toppings.length > 0 && (
                  <div className="resumen-seccion">
                    <div 
                      className="resumen-seccion-header"
                      onClick={() => toggleAcordeon('toppings')}
                    >
                      <div className="resumen-seccion-titulo">
                        🍫 Toppings
                        <span className="resumen-seccion-badge">
                          {personalizacionActual.toppings.length}
                        </span>
                      </div>
                      <span className={`resumen-seccion-icono ${acordeones.toppings ? 'open' : ''}`}>
                        ▼
                      </span>
                    </div>
                    <div className={`resumen-seccion-contenido ${acordeones.toppings ? 'open' : ''}`}>
                      <div className="resumen-seccion-lista">
                        {personalizacionActual.toppings.map((topping, index) => (
                          <div key={`topping-${topping.id}-${index}`} className="resumen-item">
                            <span className="resumen-item-nombre">+ {topping.nombre}</span>
                            <span className="resumen-item-precio">Gratis</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Acordeón Salsas */}
                {personalizacionActual.salsas.length > 0 && (
                  <div className="resumen-seccion">
                    <div 
                      className="resumen-seccion-header"
                      onClick={() => toggleAcordeon('salsas')}
                    >
                      <div className="resumen-seccion-titulo">
                        🍯 Salsas
                        <span className="resumen-seccion-badge">
                          {personalizacionActual.salsas.length}
                        </span>
                      </div>
                      <span className={`resumen-seccion-icono ${acordeones.salsas ? 'open' : ''}`}>
                        ▼
                      </span>
                    </div>
                    <div className={`resumen-seccion-contenido ${acordeones.salsas ? 'open' : ''}`}>
                      <div className="resumen-seccion-lista">
                        {personalizacionActual.salsas.map((salsa, index) => (
                          <div key={`salsa-${salsa.id}-${index}`} className="resumen-item">
                            <span className="resumen-item-nombre">+ {salsa.nombre}</span>
                            <span className="resumen-item-precio">Gratis</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Acordeón Adicciones */}
                {personalizacionActual.adiciones.length > 0 && (
                  <div className="resumen-seccion">
                    <div 
                      className="resumen-seccion-header"
                      onClick={() => toggleAcordeon('adiciones')}
                    >
                      <div className="resumen-seccion-titulo">
                        ✨ Adicciones
                        <span className="resumen-seccion-badge">
                          {personalizacionActual.adiciones.length}
                        </span>
                      </div>
                      <span className={`resumen-seccion-icono ${acordeones.adiciones ? 'open' : ''}`}>
                        ▼
                      </span>
                    </div>
                    <div className={`resumen-seccion-contenido ${acordeones.adiciones ? 'open' : ''}`}>
                      <div className="resumen-seccion-lista">
                        {personalizacionActual.adiciones.map((adicion, index) => (
                          <div key={`adicion-${adicion.id}-${index}`} className="resumen-item">
                            <span className="resumen-item-nombre">+ {adicion.nombre}</span>
                            <span className="resumen-item-precio">
                              +${adicion.precio.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="resumen-item total">
                  <span className="resumen-item-nombre">Total:</span>
                  <span className="resumen-item-precio">
                    ${calcularTotalUnidad().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="right-panel">
            {configActual.permiteToppings && catalogos.toppings.length > 0 && (
              <CatalogoBox
                titulo="🍫 Toppings"
                items={toppingsPaginados.items}
                seleccionados={personalizacionActual.toppings}
                onSelect={seleccionarTopping}
                search={searchToppings}
                onSearchChange={setSearchToppings}
                pagina={paginaToppings}
                totalPaginas={toppingsPaginados.totalPaginas}
                onPaginaChange={setPaginaToppings}
                limite={configActual.limiteTopping}
              />
            )}

            {configActual.permiteSalsas && catalogos.salsas.length > 0 && (
              <CatalogoBox
                titulo="🍯 Salsas"
                items={salsasPaginadas.items}
                seleccionados={personalizacionActual.salsas}
                onSelect={seleccionarSalsa}
                search={searchSalsas}
                onSearchChange={setSearchSalsas}
                pagina={paginaSalsas}
                totalPaginas={salsasPaginadas.totalPaginas}
                onPaginaChange={setPaginaSalsas}
                limite={configActual.limiteSalsa}
              />
            )}
          </div>
        </div>

        <div className="navigation-buttons">
          <button
            onClick={anteriorUnidad}
            className="btn-nav anterior"
          >
            ← Anterior
          </button>
          
          {productoActual.cantidad > 1 && (
            <button onClick={aplicarATodos} className="btn-nav aplicar-todos">
              ✨ Personalizar Todas las Unidades
            </button>
          )}
          
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

      {modalAdiciones && (
        <ModalAdiciones
          items={adicionesPaginadas.items}
          seleccionados={personalizacionActual.adiciones}
          onToggle={toggleAdicion}
          onClose={() => setModalAdiciones(false)}
          search={searchAdiciones}
          onSearchChange={setSearchAdiciones}
          pagina={paginaAdiciones}
          totalPaginas={adicionesPaginadas.totalPaginas}
          onPaginaChange={setPaginaAdiciones}
        />
      )}
    </div>
  );
};

const CatalogoBox = ({ 
  titulo, 
  items, 
  seleccionados = [],
  onSelect, 
  search, 
  onSearchChange,
  pagina,
  totalPaginas,
  onPaginaChange,
  limite = 0
}) => {
  return (
    <div className="catalogo-box">
      <div className="catalogo-header">
        <h3>{titulo}</h3>
        <p className="catalogo-limite">
          {limite > 0 ? `Máximo ${limite}` : 'Sin límite'}
        </p>
      </div>

      <div className="catalogo-search">
        <span className="catalogo-search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value);
            onPaginaChange(1);
          }}
        />
      </div>

      {items.length === 0 ? (
        <div className="no-items">
          <div className="icon">🔭</div>
          <p>No se encontraron resultados</p>
        </div>
      ) : (
        <>
          <div className="catalogo-grid-3x3">
            {items.map((item, index) => {
              const itemIdStr = String(item.id);
              const isSelected = seleccionados.some(s => {
                const sIdStr = String(s.id);
                const match = sIdStr === itemIdStr;
                if (index === 0) {
                  console.log(`🎯 Item "${item.nombre}" (${itemIdStr}) vs Seleccionados:`, 
                    seleccionados.map(sel => `"${sel.nombre}" (${String(sel.id)})`), 
                    'Match:', match);
                }
                return match;
              });
              
              return (
                <div
                  key={`item-${item.id}-${index}`}
                  onClick={() => onSelect(item)}
                  className={`item-card-3x3 ${isSelected ? 'selected' : ''}`}
                >
                  <div 
                    className="item-imagen-3x3"
                    style={{ 
                      backgroundImage: `url("${item.imagen}")`,
                      backgroundColor: '#e0e0e0',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                    title={item.imagen}
                  />
                  <div className="item-nombre-3x3">{item.nombre}</div>
                  {isSelected && (
                    <div className="item-check-3x3">✓</div>
                  )}
                </div>
              );
            })}
          </div>

          {totalPaginas > 1 && (
            <div className="catalogo-pagination">
              <button
                className="pagination-btn"
                onClick={() => onPaginaChange(Math.max(1, pagina - 1))}
                disabled={pagina === 1}
              >
                ←
              </button>
              <span className="pagination-info">
                {pagina} / {totalPaginas}
              </span>
              <button
                className="pagination-btn"
                onClick={() => onPaginaChange(Math.min(totalPaginas, pagina + 1))}
                disabled={pagina === totalPaginas}
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const ModalAdiciones = ({ 
  items, 
  seleccionados, 
  onToggle, 
  onClose,
  search,
  onSearchChange,
  pagina,
  totalPaginas,
  onPaginaChange
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✨ Adicciones</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-search">
            <span className="modal-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar adicciones..."
              value={search}
              onChange={(e) => {
                onSearchChange(e.target.value);
                onPaginaChange(1);
              }}
            />
          </div>

          {items.length === 0 ? (
            <div className="no-items">
              <div className="icon">🔭</div>
              <p>No se encontraron adicciones</p>
            </div>
          ) : (
            <div className="catalogo-grid-3x3">
              {items.map(item => {
                const isSelected = seleccionados.some(s => String(s.id) === String(item.id));
                return (
                  <div
                    key={item.id}
                    onClick={() => onToggle(item)}
                    className={`item-card-3x3 ${isSelected ? 'selected' : ''}`}
                  >
                    <div 
                      className="item-imagen-3x3"
                      style={{ 
                        backgroundImage: `url(${item.imagen})`,
                        backgroundColor: '#e0e0e0'
                      }}
                    />
                    <div className="item-nombre-3x3">{item.nombre}</div>
                    {item.precio > 0 && (
                      <div className="adicion-precio-mini">
                        +${item.precio.toLocaleString()}
                      </div>
                    )}
                    {isSelected && (
                      <div className="item-check-3x3">✓</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="catalogo-pagination">
            <button
              className="pagination-btn"
              onClick={() => onPaginaChange(Math.max(1, pagina - 1))}
              disabled={pagina === 1}
            >
              ←
            </button>
            <span className="pagination-info">
              {pagina} / {totalPaginas}
            </span>
            <button
              className="pagination-btn"
              onClick={() => onPaginaChange(Math.min(totalPaginas, pagina + 1))}
              disabled={pagina === totalPaginas}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalizacionProductos;