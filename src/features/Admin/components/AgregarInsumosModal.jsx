import React, { useState, useEffect } from 'react';
import InsumoCard from './InsumoCard';

const AgregarInsumosModal = ({ onClose, onAgregar }) => {
  const [selectedInsumos, setSelectedInsumos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState(['Todos']);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModalPrecio, setMostrarModalPrecio] = useState(false);
  const [insumoParaPrecio, setInsumoParaPrecio] = useState(null);
  const [precioTemporal, setPrecioTemporal] = useState('');

  // Función para obtener imagen por defecto según categoría
  const obtenerImagenPorDefecto = (categoria, nombreInsumo) => {
    const categoriaLower = (categoria || '').toLowerCase();
    const nombreLower = (nombreInsumo || '').toLowerCase();
    
    if (nombreLower.includes('leche')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJVhI6leNnj0FWig5Z4uPFhq-lZafYWFkfYQ&s';
    if (nombreLower.includes('huevo')) return 'https://static.vecteezy.com/system/resources/previews/008/848/340/original/isolated-eggs-on-white-background-free-photo.jpg';
    if (nombreLower.includes('harina')) return 'https://olimpica.vtexassets.com/arquivos/ids/617052/7701008629240.jpg?v=637626523850430000';
    if (nombreLower.includes('azucar') || nombreLower.includes('azúcar')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxvQQZ8vQYm9mNxQM0x0xGzB1L1L1L1L1L1w&s';
    if (nombreLower.includes('sal')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKKdX3LZ8vMf9YzR4QnPjkKdL2vX8QlmwA&s';
    
    return 'https://via.placeholder.com/100x100/ff69b4/ffffff?text=📦';
  };

  // Función para obtener precio estimado (fallback)
  const obtenerPrecioEstimado = (nombreInsumo, categoria) => {
    const nombreLower = (nombreInsumo || '').toLowerCase();
    
    // Precios estimados comunes en Colombia (en COP)
    if (nombreLower.includes('huevo')) return 6000;
    if (nombreLower.includes('harina')) return 4500;
    if (nombreLower.includes('leche')) return 3500;
    if (nombreLower.includes('azucar') || nombreLower.includes('azúcar')) return 3000;
    if (nombreLower.includes('sal')) return 1500;
    if (nombreLower.includes('arroz')) return 4000;
    
    // Precios por categoría
    if (categoria === 'frutas') return 5000;
    if (categoria === 'secos') return 3500;
    
    return 2500;
  };

  // Actualizar precio de insumo en la base de datos
  const actualizarPrecioInsumo = async (insumoId, nuevoPrecio) => {
    try {
      const response = await fetch(`https://deliciasoft-backend.onrender.com/api/insumos/${insumoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ precio: nuevoPrecio })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error actualizando precio:', error);
      throw error;
    }
  };

  // Cargar insumos desde la API
  useEffect(() => {
    const cargarInsumos = async () => {
      try {
        setCargando(true);
        setError(null);
        
        const response = await fetch('https://deliciasoft-backend.onrender.com/api/insumos', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('🚀 Datos RAW de insumos desde API:', data);
        
        // **FILTRAR SOLO INSUMOS ACTIVOS**
        const insumosActivos = data.filter(insumo => {
          // Buscar diferentes campos posibles para el estado
          const estado = insumo.estado || insumo.activo || insumo.active || insumo.isActive;
          
          // Verificar si es boolean true o string 'true'/'activo'
          if (typeof estado === 'boolean') {
            return estado === true;
          } else if (typeof estado === 'string') {
            return estado.toLowerCase() === 'true' || estado.toLowerCase() === 'activo';
          } else if (typeof estado === 'number') {
            return estado === 1;
          }
          
          // Si no hay campo de estado definido, asumir que está activo
          return true;
        });

        console.log(`📊 Insumos filtrados: ${insumosActivos.length} activos de ${data.length} totales`);
        console.log('📋 Campos disponibles en primer insumo:', Object.keys(data[0] || {}));
        
        // Verificar si hay campo de precio en los datos
        const tienePrecio = insumosActivos.some(insumo => 
          insumo.precio !== undefined && 
          insumo.precio !== null && 
          parseFloat(insumo.precio) > 0
        );
        
        console.log('💰 ¿Los datos incluyen precios?', tienePrecio);
        
        // Transformar datos de la API al formato esperado
// Transformar datos de la API al formato esperado
        const insumosTransformados = insumosActivos.map(insumo => {
          // **OBTENER PRECIO REAL DE LA BASE DE DATOS**
          let precio = 0;
          let esPrecioReal = false;
          
          // Intentar obtener el precio de diferentes posibles campos
          const precioRaw = insumo.precio || insumo.preciounitario || insumo.precioUnitario || insumo.precio_unitario;
          
          if (precioRaw !== undefined && precioRaw !== null) {
            const precioNumerico = parseFloat(precioRaw);
            if (!isNaN(precioNumerico) && precioNumerico > 0) {
              precio = precioNumerico;
              esPrecioReal = true;
              console.log(`✅ Precio encontrado para ${insumo.nombreinsumo}: $${precio}`);
            }
          }
          
          // Si no hay precio, dejar en 0 para que se pueda configurar
          if (!esPrecioReal) {
            console.log(`⚠️ Sin precio para ${insumo.nombreinsumo}, debe configurarse manualmente`);
          }
          
          const insumoTransformado = {
            id: insumo.idinsumo || insumo.id,
            nombre: insumo.nombreinsumo || insumo.nombre || 'Sin nombre',
            unidad: insumo.unidadmedida?.unidadmedida || 'Unidad',
            precio: precio,
            precioUnitario: precio,
            cantidad: parseInt(insumo.cantidad) || 1,
            category: insumo.categoriainsumos?.nombrecategoria || 'Sin categoría',
            imagen: insumo.imagen || obtenerImagenPorDefecto(
              insumo.categoriainsumos?.nombrecategoria, 
              insumo.nombreinsumo
            ),
            esPrecioReal: esPrecioReal,
            estado: insumo.estado || true,
            datosOriginales: insumo
          };
          
          console.log(`${esPrecioReal ? '✅' : '⚠️'} ${insumoTransformado.nombre}: $${precio} (${esPrecioReal ? 'BD' : 'sin precio'})`);
          
          return insumoTransformado;
        });

        console.log('📦 Total insumos activos transformados:', insumosTransformados.length);
        console.log('💵 Insumos con precio de BD:', insumosTransformados.filter(i => i.esPrecioReal).length);
        console.log('⚠️ Insumos sin precio:', insumosTransformados.filter(i => !i.esPrecioReal).length);

        setInsumos(insumosTransformados);
        
        // Extraer categorías únicas
        const categoriasUnicas = ['Todos', ...new Set(insumosTransformados.map(i => i.category))];
        setCategorias(categoriasUnicas);
        
      } catch (error) {
        console.error('❌ Error al cargar insumos:', error);
        setError(error.message);
      } finally {
        setCargando(false);
      }
    };

    cargarInsumos();
  }, []);

  const filteredInsumos = insumos.filter(insumo =>
    insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'Todos' || insumo.category === selectedCategory)
  );

  const toggleInsumo = (insumo) => {
    // **VALIDAR PRECIO ANTES DE AGREGAR**
    if (insumo.precio <= 0) {
      alert(`⚠️ El insumo "${insumo.nombre}" no tiene precio configurado. Por favor, edita el precio primero haciendo clic en el botón ✏️`);
      return;
    }
    
    console.log('🎯 Seleccionando insumo:', {
      nombre: insumo.nombre,
      precio: insumo.precio,
      esPrecioReal: insumo.esPrecioReal
    });
    
    setSelectedInsumos(prev =>
      prev.some(i => i.id === insumo.id)
        ? prev.filter(i => i.id !== insumo.id)
        : [...prev, { 
            ...insumo, 
            cantidad: 1,
            precio: insumo.precio,
            precioUnitario: insumo.precio
          }]
    );
  };

  const abrirModalPrecio = (insumo, e) => {
    e.stopPropagation(); // Evitar que se seleccione el insumo
    setInsumoParaPrecio(insumo);
    
    // Si no tiene precio, sugerir uno estimado
    const precioInicial = insumo.precio > 0 
      ? insumo.precio.toString() 
      : obtenerPrecioEstimado(insumo.nombre, insumo.category).toString();
      
    setPrecioTemporal(precioInicial);
    setMostrarModalPrecio(true);
  };

  const guardarPrecio = async () => {
    try {
      const nuevoPrecio = parseFloat(precioTemporal);
      if (isNaN(nuevoPrecio) || nuevoPrecio <= 0) {
        alert('Por favor ingresa un precio válido mayor a 0');
        return;
      }

      // Actualizar en la base de datos
      await actualizarPrecioInsumo(insumoParaPrecio.id, nuevoPrecio);
      
      // Actualizar localmente
      setInsumos(prev => prev.map(insumo => 
        insumo.id === insumoParaPrecio.id 
          ? { ...insumo, precio: nuevoPrecio, precioUnitario: nuevoPrecio, esPrecioReal: true }
          : insumo
      ));

      // Actualizar insumos seleccionados si este insumo está seleccionado
      setSelectedInsumos(prev => prev.map(insumo =>
        insumo.id === insumoParaPrecio.id
          ? { ...insumo, precio: nuevoPrecio, precioUnitario: nuevoPrecio, esPrecioReal: true }
          : insumo
      ));

      setMostrarModalPrecio(false);
      setInsumoParaPrecio(null);
      setPrecioTemporal('');
      
      console.log(`✅ Precio actualizado para ${insumoParaPrecio.nombre}: $${nuevoPrecio}`);
    } catch (error) {
      alert('Error al actualizar el precio: ' + error.message);
    }
  };

  const handleAgregar = () => {
    // **VALIDAR QUE TODOS LOS INSUMOS SELECCIONADOS TENGAN PRECIO**
    const insumosSinPrecio = selectedInsumos.filter(insumo => insumo.precio <= 0);
    
    if (insumosSinPrecio.length > 0) {
      alert(`⚠️ Los siguientes insumos no tienen precio configurado: ${insumosSinPrecio.map(i => i.nombre).join(', ')}. Por favor, configura los precios antes de continuar.`);
      return;
    }
    
    console.log('📤 Enviando insumos seleccionados:', selectedInsumos);
    onAgregar(selectedInsumos);
    onClose();
  };

  if (cargando) {
    return (
      <div className="adicion-modal-overlay">
        <div className="adicion-modal-container" style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #ff69b4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Cargando insumos activos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adicion-modal-overlay">
        <div className="adicion-modal-container" style={{ textAlign: 'center', padding: '50px' }}>
          <h3 style={{ color: '#d63384', marginBottom: '20px' }}>Error al cargar insumos</h3>
          <p style={{ marginBottom: '20px' }}>{error}</p>
          <button className="adicion-modal-btn adicion-modal-btn-cancel" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const insumosConPrecio = insumos.filter(i => i.precio > 0).length;
  const insumosSinPrecio = insumos.filter(i => i.precio <= 0).length;

  return (
    <div className="adicion-modal-overlay">
      <div className="adicion-modal-container">
        <style>{`
          .adicion-modal-overlay {
            background-color: rgba(0, 0, 0, 0.4);
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999;
          }

          .adicion-modal-container {
            background: #fff0f5;
            border-radius: 20px;
            padding: 25px;
            width: 90%;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            animation: fadeIn 0.3s ease-in-out;
          }

          .adicion-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }

          .adicion-modal-close-btn {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #d63384;
          }

          .adicion-modal-search-container {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            position: relative;
          }

          .adicion-modal-search-container input {
            flex-grow: 1;
            padding: 10px;
            border-radius: 10px;
            border: 2px solid #ffb6c1;
            font-size: 16px;
          }

          .adicion-modal-filter-btn {
            padding: 10px 15px;
            border: none;
            border-radius: 10px;
            background-color: #ff69b4;
            color: white;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .adicion-modal-filter-btn:hover {
            background-color: #d63384;
          }

          .adicion-modal-categories-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            background-color: #ffe4ec;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 1000;
            min-width: 150px;
            max-height: 200px;
            overflow-y: auto;
          }

          .adicion-modal-category-btn {
            padding: 8px 15px;
            border: 1px solid #ff69b4;
            border-radius: 8px;
            background-color: #ffe4ec;
            color: #d63384;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s, color 0.2s;
            text-align: left;
          }

          .adicion-modal-category-btn.selected {
            background-color: #ff69b4;
            color: white;
          }

          .adicion-modal-category-btn:hover:not(.selected) {
            background-color: #ffb6c1;
          }

          .adicion-modal-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }

          .adicion-modal-card {
            background: #fff;
            border-radius: 16px;
            padding: 10px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: transform 0.2s;
            cursor: pointer;
            border: 3px solid transparent;
            position: relative;
          }

          .adicion-modal-card:hover {
            transform: translateY(-4px);
            border-color: #ff69b4;
          }

          .adicion-modal-card-selected {
            border-color: #d63384;
            background: #ffe4ec;
          }

          .adicion-modal-card-sin-precio {
            border-color: #ffa500;
            background: #fff8e1;
          }

          .adicion-modal-card img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 8px;
          }

          .adicion-modal-card h4 {
            font-size: 16px;
            color: #d63384;
            margin: 0 0 5px 0;
          }

          .adicion-modal-card p {
            font-size: 12px;
            color: #666;
            margin: 2px 0;
          }

          .adicion-modal-card .precio-real {
            font-weight: bold;
            color: #28a745;
            font-size: 14px;
          }

          .adicion-modal-card .precio-sin-configurar {
            font-weight: bold;
            color: #ffa500;
            font-size: 14px;
            font-style: italic;
          }

          .btn-editar-precio {
            position: absolute;
            top: 5px;
            right: 5px;
            background: #ff69b4;
            border: none;
            border-radius: 50%;
            width: 25px;
            height: 25px;
            color: white;
            font-size: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .btn-editar-precio:hover {
            background: #d63384;
          }

          .btn-editar-precio.sin-precio {
            background: #ffa500;
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }

          .modal-precio {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1001;
          }

          .modal-precio-contenido {
            background: white;
            padding: 20px;
            border-radius: 10px;
            min-width: 300px;
            text-align: center;
          }

          .modal-precio input {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 2px solid #ff69b4;
            border-radius: 5px;
            font-size: 16px;
          }

          .modal-precio-botones {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 15px;
          }

          .adicion-modal-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            margin-top: 20px;
          }

          .adicion-modal-info {
            font-size: 14px;
            color: #666;
          }

          .adicion-modal-buttons {
            display: flex;
            gap: 10px;
          }

          .adicion-modal-btn {
            padding: 10px 18px;
            border: none;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
          }

          .adicion-modal-btn-cancel {
            background-color: #f8d7da;
            color: #721c24;
          }

          .adicion-modal-btn-add {
            background-color: #ff69b4;
            color: white;
          }

          .adicion-modal-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .no-results {
            text-align: center;
            padding: 40px;
            color: #666;
          }

          .imagen-placeholder {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #ff69b4, #ffb6c1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            margin: 0 auto 8px;
          }

          .info-message {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
            color: #155724;
          }

          .warning-message {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
            color: #856404;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

        <div className="adicion-modal-header">
          <h2>Seleccionar Insumos Activos</h2>
          <button onClick={onClose} className="adicion-modal-close-btn">&times;</button>
        </div>

        {insumosConPrecio > 0 && insumosSinPrecio > 0 ? (
          <div className="warning-message">
            ⚠️ <strong>Atención:</strong> {insumosConPrecio} insumos tienen precio configurado, 
            pero {insumosSinPrecio} necesitan precio. Haz clic en ✏️ para configurar precios antes de agregar.
          </div>
        ) : insumosSinPrecio > 0 ? (
          <div className="warning-message">
            ⚠️ <strong>Importante:</strong> Todos los insumos necesitan precio configurado. 
            Haz clic en ✏️ para establecer precios desde la base de datos.
          </div>
        ) : (
          <div className="info-message">
            ✅ <strong>Perfecto:</strong> Todos los insumos activos tienen precios configurados en la base de datos.
          </div>
        )}

        <div className="adicion-modal-search-container">
          <input
            type="text"
            placeholder="Buscar insumo activo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="adicion-modal-filter-btn"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            Categorías
            {showCategoryDropdown ? ' ▲' : ' ▼'}
          </button>
          {showCategoryDropdown && (
            <div className="adicion-modal-categories-dropdown">
              {categorias.map(category => (
                <button
                  key={category}
                  className={`adicion-modal-category-btn ${selectedCategory === category ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowCategoryDropdown(false);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredInsumos.length === 0 && !cargando ? (
          <div className="no-results">
            <p>No se encontraron insumos activos con los criterios de búsqueda</p>
          </div>
        ) : (
          <div className="adicion-modal-grid">
            {filteredInsumos.map(insumo => {
              const isSelected = selectedInsumos.some(i => i.id === insumo.id);
              const sinPrecio = insumo.precio <= 0;
              return (
                <div
                  key={insumo.id}
                  className={`adicion-modal-card ${isSelected ? 'adicion-modal-card-selected' : ''} ${sinPrecio ? 'adicion-modal-card-sin-precio' : ''}`}
                  onClick={() => toggleInsumo(insumo)}
                >
                  <button 
                    className={`btn-editar-precio ${sinPrecio ? 'sin-precio' : ''}`}
                    onClick={(e) => abrirModalPrecio(insumo, e)}
                    title={sinPrecio ? "⚠️ Configurar precio" : "Editar precio"}
                  >
                    ✏️
                  </button>

                  {insumo.imagen && insumo.imagen !== 'https://via.placeholder.com/100x100/ff69b4/ffffff?text=📦' ? (
                    <img 
                      src={insumo.imagen} 
                      alt={insumo.nombre}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="imagen-placeholder" 
                    style={{ display: insumo.imagen && insumo.imagen !== 'https://via.placeholder.com/100x100/ff69b4/ffffff?text=📦' ? 'none' : 'flex' }}
                  >
                    📦
                  </div>
                  <h4>{insumo.nombre}</h4>
                  <p>{insumo.unidad}</p>
                  {insumo.precio > 0 ? (
                    <p className="precio-real">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0
                      }).format(insumo.precio)}
                    </p>
                  ) : (
                    <p className="precio-sin-configurar">
                      Sin precio ⚠️
                    </p>
                  )}
                  {insumo.category !== 'Sin categoría' && (
                    <p style={{ fontSize: '10px', fontStyle: 'italic' }}>{insumo.category}</p>
                  )}
                  <p style={{ fontSize: '10px', color: '#999' }}>Stock: {insumo.cantidad}</p>
                </div>
              );
            })}
          </div>
        )}

        <div className="adicion-modal-footer">
          <div className="adicion-modal-info">
            {filteredInsumos.length} insumos activos disponibles
            <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
              {insumosConPrecio > 0 && `✅ ${insumosConPrecio} con precio`}
              {insumosConPrecio > 0 && insumosSinPrecio > 0 && ' | '}
              {insumosSinPrecio > 0 && `⚠️ ${insumosSinPrecio} sin precio`}
            </div>
          </div>
          <div className="adicion-modal-buttons">
            <button className="adicion-modal-btn adicion-modal-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button 
              className="adicion-modal-btn adicion-modal-btn-add" 
              onClick={handleAgregar}
              disabled={selectedInsumos.length === 0}
            >
              Agregar ({selectedInsumos.length})
            </button>
          </div>
        </div>

        {/* Modal para editar precio */}
        {mostrarModalPrecio && (
          <div className="modal-precio">
            <div className="modal-precio-contenido">
              <h3>
                {insumoParaPrecio?.precio > 0 ? 'Actualizar precio de' : 'Configurar precio de'} {insumoParaPrecio?.nombre}
              </h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                {insumoParaPrecio?.precio > 0 
                  ? `Precio actual: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(insumoParaPrecio.precio)}`
                  : 'Este insumo no tiene precio configurado'
                }
              </p>
              <input
                type="number"
                value={precioTemporal}
                onChange={(e) => setPrecioTemporal(e.target.value)}
                placeholder="Ingrese el precio en COP"
                min="0"
                step="1"
                autoFocus
              />
              <div className="modal-precio-botones">
                <button 
                  className="adicion-modal-btn adicion-modal-btn-cancel"
                  onClick={() => {
                    setMostrarModalPrecio(false);
                    setInsumoParaPrecio(null);
                    setPrecioTemporal('');
                  }}
                >
                  Cancelar
                </button>
                <button 
                  className="adicion-modal-btn adicion-modal-btn-add"
                  onClick={guardarPrecio}
                  disabled={!precioTemporal || parseFloat(precioTemporal) <= 0}
                >
                  {insumoParaPrecio?.precio > 0 ? 'Actualizar' : 'Configurar'} Precio
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgregarInsumosModal;