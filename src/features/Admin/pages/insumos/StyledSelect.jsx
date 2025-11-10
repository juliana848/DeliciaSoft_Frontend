import React, { useState, useRef, useEffect } from 'react';

export default function StyledSelect({ 
  opciones, 
  valorSeleccionado, 
  onChange, 
  placeholder = "Selecciona una opción",
  error = false,
  className = "",
  campoValor = "id",
  campoTexto = "nombre"
}) {
  const [abierto, setAbierto] = useState(false);
  const [resaltado, setResaltado] = useState(0);
  const contenedorRef = useRef(null);
  const listaRef = useRef(null);

  // Obtener texto de la opción seleccionada
  const opcionSeleccionada = opciones.find(op => op[campoValor] === valorSeleccionado);
  const textoMostrar = opcionSeleccionada?.[campoTexto] || '';

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickFuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

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
          prev < opciones.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setResaltado(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (opciones[resaltado]) {
          onChange(opciones[resaltado][campoValor]);
          setAbierto(false);
        }
        break;
      case 'Escape':
        setAbierto(false);
        break;
    }
  };

  const seleccionarOpcion = (valor) => {
    onChange(valor);
    setAbierto(false);
    setResaltado(0);
  };

  return (
    <div 
      ref={contenedorRef} 
      className={className} 
      style={{ position: 'relative', width: '100%' }}
      onKeyDown={manejarTeclas}
      tabIndex={0}
    >
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
            maxHeight: '280px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Lista de opciones */}
          <div 
            ref={listaRef}
            style={{ 
              overflowY: 'auto',
              maxHeight: '280px'
            }}
          >
            {opciones.length > 0 ? (
              opciones.map((opcion, index) => (
                <div
                  key={opcion[campoValor]}
                  onClick={() => seleccionarOpcion(opcion[campoValor])}
                  onMouseEnter={() => setResaltado(index)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    backgroundColor: resaltado === index ? '#ffe5f0' : 
                                   valorSeleccionado === opcion[campoValor] ? '#fff0f7' : 'white',
                    borderLeft: valorSeleccionado === opcion[campoValor] ? '3px solid #e91e63' : '3px solid transparent',
                    transition: 'all 0.15s',
                    fontSize: '14px'
                  }}
                >
                  {opcion[campoTexto]}
                </div>
              ))
            ) : (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                color: '#999',
                fontSize: '14px'
              }}>
                No hay opciones disponibles
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}