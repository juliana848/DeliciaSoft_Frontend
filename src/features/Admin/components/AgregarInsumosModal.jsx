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

  // Función para obtener imagen desde Spoonacular API
  const obtenerImagenDesdeAPI = (nombreInsumo, categoria) => {
    const nombreLower = (nombreInsumo || '').toLowerCase().trim();
    
    const mapaIngredientes = {
      'leche': 'milk',
      'mantequilla': 'butter',
      'queso': 'cheese',
      'yogurt': 'yogurt',
      'crema': 'cream',
      'nata': 'heavy-cream',
      'huevo': 'egg',
      'huevos': 'egg',
      'clara': 'egg-white',
      'yema': 'egg-yolk',
      'harina': 'flour',
      'harina de trigo': 'white-flour',
      'arroz': 'rice',
      'avena': 'oats',
      'maíz': 'corn',
      'maicena': 'cornstarch',
      'azucar': 'sugar',
      'azúcar': 'sugar',
      'azúcar morena': 'brown-sugar',
      'miel': 'honey',
      'panela': 'brown-sugar',
      'sal': 'salt',
      'pimienta': 'pepper',
      'canela': 'cinnamon',
      'vainilla': 'vanilla',
      'extracto de vainilla': 'vanilla-extract',
      'fresa': 'strawberry',
      'fresas': 'strawberries',
      'mora': 'blackberry',
      'arándano': 'blueberry',
      'banano': 'banana',
      'manzana': 'apple',
      'naranja': 'orange',
      'limón': 'lemon',
      'piña': 'pineapple',
      'mango': 'mango',
      'durazno': 'peach',
      'chocolate': 'chocolate',
      'cacao': 'cocoa-powder',
      'chispas de chocolate': 'chocolate-chips',
      'nuez': 'walnuts',
      'almendra': 'almonds',
      'maní': 'peanuts',
      'avellana': 'hazelnuts',
      'aceite': 'vegetable-oil',
      'aceite de oliva': 'olive-oil',
      'manteca': 'lard',
      'levadura': 'yeast',
      'polvo de hornear': 'baking-powder',
      'bicarbonato': 'baking-soda',
      'gelatina': 'gelatin',
      'mermelada': 'jam',
      'caramelo': 'caramel',
      'crema de leche': 'heavy-cream'
    };
    
    let ingredienteEnIngles = null;
    
    if (mapaIngredientes[nombreLower]) {
      ingredienteEnIngles = mapaIngredientes[nombreLower];
    } else {
      for (const [espanol, ingles] of Object.entries(mapaIngredientes)) {
        if (nombreLower.includes(espanol) || espanol.includes(nombreLower)) {
          ingredienteEnIngles = ingles;
          break;
        }
      }
    }
    
    if (ingredienteEnIngles) {
      return `https://spoonacular.com/cdn/ingredients_100x100/${ingredienteEnIngles}.jpg`;
    }
    
    return obtenerImagenPorDefectoPorCategoria(categoria);
  };

  const obtenerImagenPorDefectoPorCategoria = (categoria) => {
    const categoriaLower = (categoria || '').toLowerCase();
    
    if (categoriaLower.includes('lácte') || categoriaLower.includes('lacte')) {
      return 'https://spoonacular.com/cdn/ingredients_100x100/milk.jpg';
    }
    if (categoriaLower.includes('fruta')) {
      return 'https://spoonacular.com/cdn/ingredients_100x100/strawberries.jpg';
    }
    if (categoriaLower.includes('seco') || categoriaLower.includes('nuec')) {
      return 'https://spoonacular.com/cdn/ingredients_100x100/almonds.jpg';
    }
    if (categoriaLower.includes('cereal') || categoriaLower.includes('grano')) {
      return 'https://spoonacular.com/cdn/ingredients_100x100/flour.jpg';
    }
    if (categoriaLower.includes('dulce') || categoriaLower.includes('azúcar')) {
      return 'https://spoonacular.com/cdn/ingredients_100x100/sugar.jpg';
    }
    if (categoriaLower.includes('condimento') || categoriaLower.includes('especia')) {
      return 'https://spoonacular.com/cdn/ingredients_100x100/salt.jpg';
    }
    if (categoriaLower.includes('chocolate')) {
      return 'https://spoonacular.com/cdn/ingredients_100x100/chocolate.jpg';
    }
    
    return 'https://spoonacular.com/cdn/ingredients_100x100/flour.jpg';
  };

  const obtenerPrecioEstimado = (nombreInsumo, categoria) => {
    const nombreLower = (nombreInsumo || '').toLowerCase();
    
    if (nombreLower.includes('huevo')) return 6000;
    if (nombreLower.includes('harina')) return 4500;
    if (nombreLower.includes('leche')) return 3500;
    if (nombreLower.includes('azucar') || nombreLower.includes('azúcar')) return 3000;
    if (nombreLower.includes('sal')) return 1500;
    if (nombreLower.includes('arroz')) return 4000;
    
    if (categoria === 'frutas') return 5000;
    if (categoria === 'secos') return 3500;
    
    return 2500;
  };

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
        
        const insumosActivos = data.filter(insumo => {
          const estado = insumo.estado || insumo.activo || insumo.active || insumo.isActive;
          
          if (typeof estado === 'boolean') {
            return estado === true;
          } else if (typeof estado === 'string') {
            return estado.toLowerCase() === 'true' || estado.toLowerCase() === 'activo';
          } else if (typeof estado === 'number') {
            return estado === 1;
          }
          
          return true;
        });

        const insumosTransformados = insumosActivos.map(insumo => {
          let precio = 0;
          let esPrecioReal = false;
          
          const precioRaw = insumo.precio || insumo.preciounitario || insumo.precioUnitario || insumo.precio_unitario;
          
          if (precioRaw !== undefined && precioRaw !== null) {
            const precioNumerico = parseFloat(precioRaw);
            if (!isNaN(precioNumerico) && precioNumerico > 0) {
              precio = precioNumerico;
              esPrecioReal = true;
            }
          }
          
          const nombreInsumo = insumo.nombreinsumo || insumo.nombre || 'Sin nombre';
          const categoria = insumo.categoriainsumos?.nombrecategoria || 'Sin categoría';
          
          const imagenAPI = obtenerImagenDesdeAPI(nombreInsumo, categoria);
          
          return {
            id: insumo.idinsumo || insumo.id,
            nombre: nombreInsumo,
            unidad: insumo.unidadmedida?.unidadmedida || 'Unidad',
            precio: precio,
            precioUnitario: precio,
            cantidad: parseInt(insumo.cantidad) || 1,
            category: categoria,
            imagen: imagenAPI,
            esPrecioReal: esPrecioReal,
            estado: insumo.estado || true,
            datosOriginales: insumo
          };
        });

        setInsumos(insumosTransformados);
        
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
    if (insumo.precio <= 0) {
      alert(`⚠️ El insumo "${insumo.nombre}" no tiene precio configurado. Por favor, edita el precio primero haciendo clic en el botón ✏️`);
      return;
    }
    
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
    e.stopPropagation();
    setInsumoParaPrecio(insumo);
    
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

      await actualizarPrecioInsumo(insumoParaPrecio.id, nuevoPrecio);
      
      setInsumos(prev => prev.map(insumo => 
        insumo.id === insumoParaPrecio.id 
          ? { ...insumo, precio: nuevoPrecio, precioUnitario: nuevoPrecio, esPrecioReal: true }
          : insumo
      ));

      setSelectedInsumos(prev => prev.map(insumo =>
        insumo.id === insumoParaPrecio.id
          ? { ...insumo, precio: nuevoPrecio, precioUnitario: nuevoPrecio, esPrecioReal: true }
          : insumo
      ));

      setMostrarModalPrecio(false);
      setInsumoParaPrecio(null);
      setPrecioTemporal('');
    } catch (error) {
      alert('Error al actualizar el precio: ' + error.message);
    }
  };

  const handleAgregar = () => {
    const insumosSinPrecio = selectedInsumos.filter(insumo => insumo.precio <= 0);
    
    if (insumosSinPrecio.length > 0) {
      alert(`⚠️ Los siguientes insumos no tienen precio configurado: ${insumosSinPrecio.map(i => i.nombre).join(', ')}. Por favor, configura los precios antes de continuar.`);
      return;
    }
    
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
            background-color: rgba(0, 0, 0, 0.5);
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999;
          }

          .adicion-modal-container {
            background: linear-gradient(135deg, #fff0f5 0%, #ffe4ec 100%);
            border-radius: 25px;
            padding: 25px;
            width: 90%;
            max-width: 900px;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 15px 40px rgba(214, 51, 132, 0.3);
            animation: fadeIn 0.3s ease-in-out;
          }

          .adicion-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #ff69b4;
          }

          .adicion-modal-header h2 {
            color: #d63384;
            margin: 0;
            font-size: 24px;
            font-weight: bold;
          }

          .adicion-modal-header-actions {
            display: flex;
            gap: 10px;
            align-items: center;
          }

          .adicion-modal-close-btn {
            background: #fff;
            border: 2px solid #ff69b4;
            border-radius: 50%;
            width: 35px;
            height: 35px;
            font-size: 20px;
            cursor: pointer;
            color: #d63384;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          }

          .adicion-modal-close-btn:hover {
            background: #ff69b4;
            color: white;
            transform: rotate(90deg);
          }

          .adicion-modal-btn-header {
            padding: 10px 20px;
            border: none;
            border-radius: 12px;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .adicion-modal-btn-header.add {
            background: linear-gradient(135deg, #ff69b4, #d63384);
            color: white;
            box-shadow: 0 4px 15px rgba(214, 51, 132, 0.3);
          }

          .adicion-modal-btn-header.add:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(214, 51, 132, 0.4);
          }

          .adicion-modal-btn-header:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .adicion-modal-btn-counter {
            background: white;
            color: #d63384;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
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
            padding: 12px 20px;
            border-radius: 15px;
            border: 2px solid #ffb6c1;
            font-size: 16px;
            background: white;
            transition: border-color 0.3s ease;
          }

          .adicion-modal-search-container input:focus {
            outline: none;
            border-color: #ff69b4;
            box-shadow: 0 0 10px rgba(255, 105, 180, 0.2);
          }

          .adicion-modal-filter-btn {
            padding: 12px 20px;
            border: 2px solid #ff69b4;
            border-radius: 15px;
            background-color: white;
            color: #d63384;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
          }

          .adicion-modal-filter-btn:hover {
            background-color: #ff69b4;
            color: white;
          }

          .adicion-modal-categories-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            background-color: white;
            border-radius: 15px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 1000;
            min-width: 180px;
            max-height: 250px;
            overflow-y: auto;
            margin-top: 5px;
            border: 2px solid #ff69b4;
          }

          .adicion-modal-category-btn {
            padding: 10px 15px;
            border: 2px solid #ffb6c1;
            border-radius: 10px;
            background-color: white;
            color: #d63384;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
            text-align: left;
            font-weight: 500;
          }

          .adicion-modal-category-btn.selected {
            background: linear-gradient(135deg, #ff69b4, #d63384);
            color: white;
            border-color: #d63384;
          }

          .adicion-modal-category-btn:hover:not(.selected) {
            background-color: #ffe4ec;
            border-color: #ff69b4;
          }

          .adicion-modal-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }

          .adicion-modal-card {
            background: white;
            border-radius: 20px;
            padding: 15px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(214, 51, 132, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;
            border: 3px solid #ffb6c1;
            position: relative;
            overflow: hidden;
          }

          .adicion-modal-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #ff69b4, #d63384, #ff69b4);
            background-size: 200% 100%;
            animation: gradientShift 3s ease infinite;
          }

          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          .adicion-modal-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(214, 51, 132, 0.25);
            border-color: #ff69b4;
          }

          .adicion-modal-card-selected {
            border-color: #d63384;
            background: linear-gradient(135deg, #fff0f5, #ffe4ec);
            box-shadow: 0 8px 25px rgba(214, 51, 132, 0.3);
          }

          .adicion-modal-card-selected::before {
            height: 6px;
          }

          .adicion-modal-card-sin-precio {
            border-color: #ffa500;
            background: #fff8e1;
          }

          .adicion-modal-card-sin-precio::before {
            background: linear-gradient(90deg, #ffa500, #ff8c00, #ffa500);
            background-size: 200% 100%;
          }

          .adicion-modal-card img {
            width: 110px;
            height: 110px;
            object-fit: cover;
            border-radius: 15px;
            margin: 10px auto;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          }

          .adicion-modal-card h4 {
            font-size: 16px;
            color: #d63384;
            margin: 10px 0 5px 0;
            font-weight: 700;
          }

          .adicion-modal-card p {
            font-size: 13px;
            color: #666;
            margin: 4px 0;
          }

          .adicion-modal-card .precio-real {
            font-weight: bold;
            color: #28a745;
            font-size: 15px;
            margin-top: 8px;
          }

          .adicion-modal-card .precio-sin-configurar {
            font-weight: bold;
            color: #ffa500;
            font-size: 15px;
            font-style: italic;
          }

          .btn-editar-precio {
            position: absolute;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, #ff69b4, #d63384);
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            color: white;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(214, 51, 132, 0.3);
            transition: all 0.3s ease;
            z-index: 10;
          }

          .btn-editar-precio:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(214, 51, 132, 0.4);
          }

          .btn-editar-precio.sin-precio {
            background: linear-gradient(135deg, #ffa500, #ff8c00);
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }

          .modal-precio {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1001;
            animation: fadeIn 0.2s ease;
          }

          .modal-precio-contenido {
            background: white;
            padding: 30px;
            border-radius: 20px;
            min-width: 350px;
            text-align: center;
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
            border: 3px solid #ff69b4;
          }

          .modal-precio h3 {
            color: #d63384;
            margin-bottom: 15px;
          }

          .modal-precio input {
            width: 100%;
            padding: 12px;
            margin: 15px 0;
            border: 2px solid #ff69b4;
            border-radius: 10px;
            font-size: 16px;
            box-sizing: border-box;
          }

          .modal-precio input:focus {
            outline: none;
            border-color: #d63384;
            box-shadow: 0 0 10px rgba(255, 105, 180, 0.3);
          }

          .modal-precio-botones {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
          }

          .adicion-modal-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #ffb6c1;
          }

          .adicion-modal-info {
            font-size: 14px;
            color: #666;
            font-weight: 500;
          }

          .adicion-modal-info div {
            font-size: 11px;
            color: #999;
            margin-top: 4px;
          }

          .adicion-modal-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 12px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
          }

          .adicion-modal-btn-cancel {
            background-color: #f8d7da;
            color: #721c24;
            border: 2px solid #f5c6cb;
          }

          .adicion-modal-btn-cancel:hover {
            background-color: #f5c6cb;
          }

          .adicion-modal-btn-add {
            background: linear-gradient(135deg, #ff69b4, #d63384);
            color: white;
            box-shadow: 0 4px 15px rgba(214, 51, 132, 0.3);
          }

          .adicion-modal-btn-add:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(214, 51, 132, 0.4);
          }

          .adicion-modal-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .no-results {
            text-align: center;
            padding: 60px 20px;
            color: #999;
          }

          .no-results p {
            font-size: 16px;
            margin-bottom: 10px;
          }

          .info-message {
            background: linear-gradient(135deg, #d4edda, #c3e6cb);
            border: 2px solid #28a745;
            border-radius: 12px;
            padding: 15px 20px;
            margin-bottom: 20px;
            color: #155724;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .warning-message {
            background: linear-gradient(135deg, #fff3cd, #ffeaa7);
            border: 2px solid #ffa500;
            border-radius: 12px;
            padding: 15px 20px;
            margin-bottom: 20px;
            color: #856404;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          /* Scrollbar personalizado */
          .adicion-modal-container::-webkit-scrollbar {
            width: 8px;
          }

          .adicion-modal-container::-webkit-scrollbar-track {
            background: #ffe4ec;
            border-radius: 10px;
          }

          .adicion-modal-container::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #ff69b4, #d63384);
            border-radius: 10px;
          }

          .adicion-modal-container::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #d63384, #ff1493);
          }
        `}</style>

        {/* Header con título y botones */}
        <div className="adicion-modal-header">
          <h2>✨ Seleccionar Insumos Activos</h2>
          <div className="adicion-modal-header-actions">
            <button 
              className="adicion-modal-btn-header add" 
              onClick={handleAgregar}
              disabled={selectedInsumos.length === 0}
            >
              <span>Agregar</span>
              {selectedInsumos.length > 0 && (
                <span className="adicion-modal-btn-counter">{selectedInsumos.length}</span>
              )}
            </button>
            <button onClick={onClose} className="adicion-modal-close-btn">×</button>
          </div>
        </div>



        {/* Barra de búsqueda y filtros */}
        <div className="adicion-modal-search-container">
          <input
            type="text"
            placeholder="🔍 Buscar insumo activo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="adicion-modal-filter-btn"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <span>📂</span>
            <span>Categorías</span>
            <span>{showCategoryDropdown ? '▲' : '▼'}</span>
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

        {/* Grid de insumos */}
        {filteredInsumos.length === 0 && !cargando ? (
          <div className="no-results">
            <p style={{ fontSize: '48px', margin: '0 0 20px 0' }}>🔍</p>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#d63384' }}>
              No se encontraron insumos
            </p>
            <p>Intenta con otros términos de búsqueda o cambia la categoría</p>
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

                  <img 
                    src={insumo.imagen} 
                    alt={insumo.nombre}
                    onError={(e) => {
                      e.target.src = 'https://spoonacular.com/cdn/ingredients_100x100/flour.jpg';
                    }}
                  />
                  
                  <h4>{insumo.nombre}</h4>
                  <p style={{ color: '#999', fontSize: '12px' }}>{insumo.unidad}</p>
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
                    <p style={{ fontSize: '11px', fontStyle: 'italic', color: '#ff69b4' }}>
                      {insumo.category}
                    </p>
                  )}
                  <p style={{ fontSize: '11px', color: '#aaa' }}>Stock: {insumo.cantidad}</p>
                  
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: '#28a745',
                      color: 'white',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      boxShadow: '0 2px 8px rgba(40, 167, 69, 0.4)'
                    }}>
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer con información */}
        <div className="adicion-modal-footer">
          <div className="adicion-modal-info">
            📦 {filteredInsumos.length} insumos activos disponibles
            <div>
              {insumosConPrecio > 0 && `✅ ${insumosConPrecio} con precio`}
              {insumosConPrecio > 0 && insumosSinPrecio > 0 && ' | '}
              {insumosSinPrecio > 0 && `⚠️ ${insumosSinPrecio} sin precio`}
            </div>
          </div>
        </div>

        {/* Modal para editar precio */}
        {mostrarModalPrecio && (
          <div className="modal-precio" onClick={() => {
            setMostrarModalPrecio(false);
            setInsumoParaPrecio(null);
            setPrecioTemporal('');
          }}>
            <div className="modal-precio-contenido" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ color: '#d63384', fontSize: '20px', marginBottom: '10px' }}>
                {insumoParaPrecio?.precio > 0 ? '💰 Actualizar precio' : '⚠️ Configurar precio'}
              </h3>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                {insumoParaPrecio?.nombre}
              </p>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
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
                step="100"
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
                  {insumoParaPrecio?.precio > 0 ? '✅ Actualizar' : '💾 Guardar'} Precio
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