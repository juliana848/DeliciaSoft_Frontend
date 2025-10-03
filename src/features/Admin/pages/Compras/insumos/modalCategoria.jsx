import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';

const SearchableSelect = ({ 
  categorias, 
  valorSeleccionado, 
  onChange, 
  onAgregarNueva,
  placeholder = "Selecciona una categoría",
  error = false 
}) => {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [resaltado, setResaltado] = useState(0);
  const contenedorRef = useRef(null);
  const inputRef = useRef(null);
  const listaRef = useRef(null);

  // Filtrar categorías según búsqueda
  const categoriasFiltradas = categorias.filter(cat =>
    cat.nombreCategoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Obtener nombre de la categoría seleccionada
  const categoriaSeleccionada = categorias.find(cat => cat._id === valorSeleccionado);
  const textoMostrar = categoriaSeleccionada?.nombreCategoria || '';

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickFuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setAbierto(false);
        setBusqueda('');
      }
    };

    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  // Focus en input cuando se abre
  useEffect(() => {
    if (abierto && inputRef.current) {
      inputRef.current.focus();
    }
  }, [abierto]);

  // Scroll automático al elemento resaltado
  useEffect(() => {
    if (listaRef.current && abierto) {
      const elemento = listaRef.current.children[resaltado];
      if (elemento) {
        elemento.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [resaltado, abierto]);

  const manejarTeclas = (e) => {
    if (!abierto && (e.key === 'Enter' || e.key === 'ArrowDown')) {
      e.preventDefault();
      setAbierto(true);
      return;
    }

    if (!abierto) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setResaltado(prev => 
          prev < categoriasFiltradas.length ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setResaltado(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (resaltado === categoriasFiltradas.length) {
          onAgregarNueva();
          setAbierto(false);
        } else if (categoriasFiltradas[resaltado]) {
          onChange(categoriasFiltradas[resaltado]._id);
          setAbierto(false);
          setBusqueda('');
        }
        break;
      case 'Escape':
        setAbierto(false);
        setBusqueda('');
        break;
    }
  };

  const seleccionarCategoria = (id) => {
    onChange(id);
    setAbierto(false);
    setBusqueda('');
    setResaltado(0);
  };

  return (
    <div ref={contenedorRef} style={{ position: 'relative', width: '100%' }}>
      {/* Input principal */}
      <div
        onClick={() => setAbierto(!abierto)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 12px',
          border: `2px solid ${error ? '#ef4444' : abierto ? '#ec4899' : '#e5e7eb'}`,
          borderRadius: '8px',
          backgroundColor: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s',
          minHeight: '44px'
        }}
      >
        <span style={{ 
          flex: 1, 
          color: textoMostrar ? '#1f2937' : '#9ca3af',
          fontSize: '14px'
        }}>
          {textoMostrar || placeholder}
        </span>
        <ChevronDown 
          size={20} 
          color="#6b7280"
          style={{
            transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}
        />
      </div>

      {/* Dropdown */}
      {abierto && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            backgroundColor: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            maxHeight: '320px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Campo de búsqueda */}
          <div style={{ 
            padding: '8px',
            borderBottom: '1px solid #e5e7eb',
            position: 'sticky',
            top: 0,
            backgroundColor: 'white',
            borderRadius: '8px 8px 0 0'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <Search size={18} color="#6b7280" />
              <input
                ref={inputRef}
                type="text"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setResaltado(0);
                }}
                onKeyDown={manejarTeclas}
                placeholder="Buscar categoría..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '14px',
                  color: '#1f2937'
                }}
              />
            </div>
          </div>

          {/* Lista de opciones */}
          <div 
            ref={listaRef}
            style={{ 
              overflowY: 'auto',
              maxHeight: '240px'
            }}
          >
            {categoriasFiltradas.length > 0 ? (
              categoriasFiltradas.map((cat, index) => (
                <div
                  key={cat._id}
                  onClick={() => seleccionarCategoria(cat._id)}
                  onMouseEnter={() => setResaltado(index)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    backgroundColor: resaltado === index ? '#fce7f3' : 
                                   valorSeleccionado === cat._id ? '#fdf2f8' : 'white',
                    borderLeft: valorSeleccionado === cat._id ? '3px solid #ec4899' : '3px solid transparent',
                    transition: 'all 0.15s',
                    fontSize: '14px',
                    color: '#1f2937'
                  }}
                >
                  {cat.nombreCategoria}
                </div>
              ))
            ) : (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '14px'
              }}>
                No se encontraron categorías
              </div>
            )}

            {/* Botón agregar nueva */}
            <div
              onClick={() => {
                onAgregarNueva();
                setAbierto(false);
              }}
              onMouseEnter={() => setResaltado(categoriasFiltradas.length)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: resaltado === categoriasFiltradas.length ? '#fef3c7' : '#fffbeb',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#d97706',
                fontWeight: '500',
                transition: 'all 0.15s'
              }}
            >
              <Plus size={18} />
              <span>Agregar nueva categoría</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de demostración
export default function App() {
  const [categorias] = useState([
    { _id: '1', nombreCategoria: 'Adiciones' },
    { _id: '2', nombreCategoria: 'Salsas' },
    { _id: '3', nombreCategoria: 'Relleno' },
    { _id: '4', nombreCategoria: 'Sabores' },
    { _id: '5', nombreCategoria: 'Lacteos' },
    { _id: '6', nombreCategoria: 'Frutas' },
    { _id: '7', nombreCategoria: 'Granos' },
    { _id: '8', nombreCategoria: 'Endulzantes' },
    { _id: '9', nombreCategoria: 'Desechables' },
    { _id: '10', nombreCategoria: 'Utencilios' },
    { _id: '11', nombreCategoria: 'Frutos secos' },
    { _id: '12', nombreCategoria: 'Toppings' }
  ]);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [mostrarModalNueva, setMostrarModalNueva] = useState(false);

  return (
    <div style={{ 
      padding: '40px',
      maxWidth: '600px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        marginBottom: '24px',
        color: '#1f2937'
      }}>
        Select Personalizado con Búsqueda
      </h1>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151'
        }}>
          Categoría*
        </label>
        
        <SearchableSelect
          categorias={categorias}
          valorSeleccionado={categoriaSeleccionada}
          onChange={setCategoriaSeleccionada}
          onAgregarNueva={() => setMostrarModalNueva(true)}
          placeholder="Selecciona una categoría"
        />
        
        {categoriaSeleccionada && (
          <p style={{ 
            marginTop: '12px', 
            fontSize: '13px', 
            color: '#6b7280' 
          }}>
            Seleccionado: <strong>{categorias.find(c => c._id === categoriaSeleccionada)?.nombreCategoria}</strong>
          </p>
        )}
      </div>

      {mostrarModalNueva && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}
        onClick={() => setMostrarModalNueva(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              maxWidth: '400px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              marginBottom: '16px',
              color: '#1f2937'
            }}>
              Agregar Nueva Categoría
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Aquí iría tu modal de ModalCategoria
            </p>
            <button
              onClick={() => setMostrarModalNueva(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ec4899',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '12px',
          color: '#1f2937'
        }}>
          Características:
        </h3>
        <ul style={{ 
          fontSize: '14px', 
          color: '#4b5563',
          lineHeight: '1.8',
          paddingLeft: '20px'
        }}>
          <li>Búsqueda en tiempo real</li>
          <li>Navegación con teclado (flechas, Enter, Escape)</li>
          <li>Diseño moderno y limpio</li>
          <li>Botón integrado para agregar nueva categoría</li>
          <li>Indica visualmente la opción seleccionada</li>
          <li>Cierre automático al hacer clic fuera</li>
        </ul>
      </div>
    </div>
  );
}