import React, { useState, useRef, useEffect } from 'react';

/**
 * Componente de autocompletado de direcciones usando Nominatim (OpenStreetMap)
 * API GRATUITA - No requiere API key
 */
export default function DireccionAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Ingrese la dirección",
  disabled = false,
  readOnly = false 
}) {
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [indiceSugerenciaActiva, setIndiceSugerenciaActiva] = useState(-1);
  const inputRef = useRef(null);
  const sugerenciasRef = useRef(null);
  const timeoutRef = useRef(null);

  // Buscar direcciones en Nominatim (OpenStreetMap) - API GRATUITA
  const buscarDirecciones = async (texto) => {
    if (!texto || texto.length < 3) {
      setSugerencias([]);
      return;
    }

    try {
      setCargando(true);
      
      // Nominatim API - Completamente gratuita, sin API key
      const url = `https://nominatim.openstreetmap.org/search?` + 
        `q=${encodeURIComponent(texto + ', Medellín, Colombia')}` +
        `&format=json` +
        `&addressdetails=1` +
        `&limit=8` +
        `&countrycodes=co`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          // Nominatim requiere un User-Agent identificable
          'User-Agent': 'SedeApp/1.0'
        }
      });

      if (!response.ok) throw new Error('Error en la búsqueda');

      const datos = await response.json();
      
      // Filtrar solo resultados de Medellín
      const resultadosMedellin = datos.filter(lugar => 
        lugar.address && 
        (lugar.address.city === 'Medellín' || 
         lugar.address.county === 'Medellín' ||
         lugar.display_name.toLowerCase().includes('medellín'))
      );

      // Formatear resultados
      const direccionesFormateadas = resultadosMedellin.map(lugar => ({
        displayName: lugar.display_name,
        direccion: formatearDireccion(lugar),
        lat: lugar.lat,
        lon: lugar.lon,
        tipo: lugar.type
      }));

      setSugerencias(direccionesFormateadas);
      setMostrarSugerencias(direccionesFormateadas.length > 0);
      
    } catch (error) {
      console.error('Error al buscar direcciones:', error);
      setSugerencias([]);
    } finally {
      setCargando(false);
    }
  };

  // Formatear dirección de forma más legible y compatible con validación
  const formatearDireccion = (lugar) => {
    const addr = lugar.address;
    let direccion = '';

    // Extraer componentes de dirección
    let calle = addr.road || '';
    let numero = addr.house_number || '';
    let barrio = addr.suburb || addr.neighbourhood || '';

    // Si tenemos calle y número, formatear al estilo colombiano
    if (calle && numero) {
      // Intentar convertir al formato Calle # Número
      const partesCalle = calle.match(/(\d+[A-Za-z]?)/);
      const numeroCalle = partesCalle ? partesCalle[1] : '';
      
      if (numeroCalle) {
        // Determinar si es Calle o Carrera
        const tipoCalle = calle.toLowerCase().includes('carrera') || calle.toLowerCase().includes('cra') 
          ? 'Carrera' 
          : 'Calle';
        
        direccion = `${tipoCalle} ${numeroCalle} #${numero}`;
      } else {
        direccion = `${calle} #${numero}`;
      }
      
      // Agregar barrio si existe
      if (barrio) {
        direccion += `, ${barrio}`;
      }
    } 
    // Si solo tenemos calle
    else if (calle) {
      direccion = calle;
      if (barrio) direccion += `, ${barrio}`;
    }
    // Si solo tenemos barrio
    else if (barrio) {
      direccion = barrio;
    }
    // Fallback: usar display_name
    else {
      const partes = lugar.display_name.split(',');
      direccion = partes.slice(0, 2).join(', ').trim();
    }

    return direccion;
  };

  // Manejar cambios en el input con debounce
  const handleInputChange = (e) => {
    const nuevoValor = e.target.value;
    onChange(nuevoValor);

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Esperar 500ms después de que el usuario deje de escribir
    timeoutRef.current = setTimeout(() => {
      buscarDirecciones(nuevoValor);
    }, 500);

    setIndiceSugerenciaActiva(-1);
  };

  // Seleccionar una sugerencia
  const seleccionarSugerencia = (sugerencia) => {
    onChange(sugerencia.direccion);
    setMostrarSugerencias(false);
    setSugerencias([]);
    setIndiceSugerenciaActiva(-1);
  };

  // Manejar teclas de navegación
  const handleKeyDown = (e) => {
    if (!mostrarSugerencias || sugerencias.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIndiceSugerenciaActiva(prev => 
          prev < sugerencias.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIndiceSugerenciaActiva(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (indiceSugerenciaActiva >= 0) {
          seleccionarSugerencia(sugerencias[indiceSugerenciaActiva]);
        }
        break;
      case 'Escape':
        setMostrarSugerencias(false);
        setIndiceSugerenciaActiva(-1);
        break;
      default:
        break;
    }
  };

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        sugerenciasRef.current &&
        !sugerenciasRef.current.contains(event.target)
      ) {
        setMostrarSugerencias(false);
        setIndiceSugerenciaActiva(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Obtener icono según el tipo de lugar
  const obtenerIcono = (tipo) => {
    const iconos = {
      'residential': '🏠',
      'commercial': '🏢',
      'retail': '🏪',
      'house': '🏡',
      'building': '🏢',
      'apartments': '🏘️',
      'neighbourhood': '📍',
      'road': '🛣️',
    };
    return iconos[tipo] || '📌';
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="modal-input"
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        style={{
          minHeight: '60px',
          resize: 'vertical',
          fontFamily: 'inherit',
          width: '100%',
        }}
      />

      {/* Indicador de carga */}
      {cargando && (
        <div style={{
          position: 'absolute',
          right: '12px',
          top: '12px',
          fontSize: '14px'
        }}>
          ⏳ Buscando...
        </div>
      )}

      {/* Lista de sugerencias */}
      {mostrarSugerencias && sugerencias.length > 0 && !readOnly && !disabled && (
        <div
          ref={sugerenciasRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            marginTop: '4px',
            maxHeight: '300px',
            overflowY: 'auto',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 1000,
          }}
        >
          <div style={{ 
            padding: '8px 12px', 
            borderBottom: '1px solid #f3f4f6',
            backgroundColor: '#f9fafb',
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: 500
          }}>
            📍 Direcciones encontradas en Medellín
          </div>
          
          {sugerencias.map((sugerencia, index) => (
            <div
              key={index}
              onClick={() => seleccionarSugerencia(sugerencia)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: indiceSugerenciaActiva === index ? '#fce7f3' : 'white',
                borderBottom: index < sugerencias.length - 1 ? '1px solid #f3f4f6' : 'none',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={() => setIndiceSugerenciaActiva(index)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '18px', marginTop: '2px' }}>
                  {obtenerIcono(sugerencia.tipo)}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#111827',
                    fontWeight: '500',
                    marginBottom: '4px'
                  }}>
                    {sugerencia.direccion}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6b7280',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {sugerencia.displayName}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensaje de ayuda */}
      {!cargando && value && value.length > 0 && value.length < 3 && (
        <small style={{ 
          color: '#6b7280', 
          fontSize: '12px', 
          display: 'block', 
          marginTop: '4px' 
        }}>
          💡 Escribe al menos 3 caracteres para buscar direcciones
        </small>
      )}

      {/* Sin resultados */}
      {!cargando && mostrarSugerencias && sugerencias.length === 0 && value.length >= 3 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          marginTop: '4px',
          padding: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          🔍 No se encontraron direcciones. Intenta con otra búsqueda.
        </div>
      )}
    </div>
  );
}