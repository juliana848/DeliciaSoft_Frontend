    import React, { useState, useRef, useEffect } from 'react';

export default function SearchableInput({ 
  value,
  onChange,
  sugerencias = [],
  placeholder = "Escribe o selecciona",
  error = false,
  disabled = false,
  className = ""
}) {
  const [abierto, setAbierto] = useState(false);
  const [resaltado, setResaltado] = useState(0);
  const contenedorRef = useRef(null);
  const inputRef = useRef(null);
  const listaRef = useRef(null);

  const sugerenciasFiltradas = sugerencias.filter(sug =>
    sug.toLowerCase().includes(value.toLowerCase())
  );

  useEffect(() => {
    const handleClickFuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  useEffect(() => {
    if (listaRef.current && abierto && sugerenciasFiltradas.length > 0) {
      const elemento = listaRef.current.children[resaltado];
      if (elemento) {
        elemento.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [resaltado, abierto]);

  const manejarTeclas = (e) => {
    if (!abierto && e.key === 'ArrowDown' && sugerenciasFiltradas.length > 0) {
      e.preventDefault();
      setAbierto(true);
      return;
    }

    if (!abierto) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setResaltado(prev => 
          prev < sugerenciasFiltradas.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setResaltado(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (sugerenciasFiltradas[resaltado]) {
          onChange(sugerenciasFiltradas[resaltado]);
          setAbierto(false);
        }
        break;
      case 'Escape':
        setAbierto(false);
        break;
    }
  };

  const seleccionarSugerencia = (sugerencia) => {
    onChange(sugerencia);
    setAbierto(false);
    setResaltado(0);
  };

  const handleInputChange = (e) => {
    const nuevoValor = e.target.value;
    onChange(nuevoValor);
    
    if (nuevoValor && sugerencias.length > 0) {
      setAbierto(true);
      setResaltado(0);
    }
  };

  const handleFocus = () => {
    if (sugerencias.length > 0) {
      setAbierto(true);
    }
  };

  return (
    <div 
      ref={contenedorRef} 
      className={className} 
      style={{ position: 'relative', width: '100%' }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={manejarTeclas}
        placeholder={placeholder}
        disabled={disabled}
        className={`modal-input ${error ? 'input-invalid' : ''}`}
        style={{
          width: '100%',
          paddingRight: sugerencias.length > 0 ? '40px' : '12px'
        }}
      />

      {sugerencias.length > 0 && !disabled && (
        <div
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#6b7280'
          }}
        >
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
      )}

      {abierto && sugerenciasFiltradas.length > 0 && !disabled && (
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
            maxHeight: '240px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div 
            ref={listaRef}
            style={{ 
              overflowY: 'auto',
              maxHeight: '240px'
            }}
          >
            {sugerenciasFiltradas.map((sugerencia, index) => {
              const estaSeleccionado = value.toLowerCase() === sugerencia.toLowerCase();
              return (
                <div
                  key={index}
                  onClick={() => seleccionarSugerencia(sugerencia)}
                  onMouseEnter={() => setResaltado(index)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    backgroundColor: resaltado === index ? '#ffe5f0' : 
                                   estaSeleccionado ? '#fff0f7' : 'white',
                    borderLeft: estaSeleccionado ? '3px solid #e91e63' : '3px solid transparent',
                    transition: 'all 0.15s',
                    fontSize: '14px'
                  }}
                >
                  {sugerencia}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}