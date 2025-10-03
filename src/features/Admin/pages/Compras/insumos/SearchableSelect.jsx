import React, { useState, useRef, useEffect } from 'react';

export default function SearchableSelect({ 
  categorias, 
  valorSeleccionado, 
  onChange, 
  onAgregarNueva,
  placeholder = "Selecciona una categoría",
  error = false,
  className = ""
}) {
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
    <div ref={contenedorRef} className={className} style={{ position: 'relative', width: '100%' }}>
      {/* Input principal */}
      <div
        onClick={() => setAbierto(!abierto)}
        className={`modal-input ${error ? 'input-invalid' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          minHeight: '44px'
        }}
      >
        <span style={{ 
          flex: 1, 
          color: textoMostrar ? 'inherit' : '#999'
        }}>
          {textoMostrar || placeholder}
        </span>
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
          style={{
            transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
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
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            maxHeight: '320px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Campo de búsqueda */}
          <div style={{ 
            padding: '10px',
            borderBottom: '1px solid #eee',
            position: 'sticky',
            top: 0,
            backgroundColor: 'white'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
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
                  fontSize: '14px'
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
                    backgroundColor: resaltado === index ? '#ffe5f0' : 
                                   valorSeleccionado === cat._id ? '#fff0f7' : 'white',
                    borderLeft: valorSeleccionado === cat._id ? '3px solid #e91e63' : '3px solid transparent',
                    transition: 'all 0.15s',
                    fontSize: '14px'
                  }}
                >
                  {cat.nombreCategoria}
                </div>
              ))
            ) : (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                color: '#999',
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
                backgroundColor: resaltado === categoriasFiltradas.length ? '#fff9e6' : '#fffdf0',
                borderTop: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#e91e63',
                fontWeight: '500',
                transition: 'all 0.15s'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Agregar nueva categoría</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}