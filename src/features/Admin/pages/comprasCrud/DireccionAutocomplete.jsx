import React, { useState, useEffect, useRef } from 'react';
import './styles/DireccionAutocomplete.css';

const DireccionAutocomplete = ({ 
  value = '', 
  onChange, 
  onSelect,
  disabled = false,
  error = false,
  placeholder = "Ingrese la dirección"
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);
  const autocompleteService = useRef(null);
  const sessionToken = useRef(null);
  const debounceTimer = useRef(null);

  // Inicializar Google Places Autocomplete Service
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDOY0reKwNlyzVgvV9VgT7wSdboYKOTdjY`;
      script.async = true;
      script.defer = true;
      script.onload = initializeService;
      document.head.appendChild(script);
    } else {
      initializeService();
    }
  }, []);

  const initializeService = () => {
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
    }
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Actualizar valor cuando cambia desde fuera
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Función para buscar sugerencias con debounce
  const searchPlaces = (searchText) => {
    if (!searchText || searchText.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (!autocompleteService.current) {
      console.warn('Google Places service no está disponible');
      return;
    }

    setIsLoading(true);

    const request = {
      input: searchText,
      sessionToken: sessionToken.current,
      componentRestrictions: { country: 'co' }, // Restringir a Colombia
      types: ['address'] // Solo direcciones
    };

    autocompleteService.current.getPlacePredictions(
      request,
      (predictions, status) => {
        setIsLoading(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
          setIsOpen(true);
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setSuggestions([]);
          setIsOpen(false);
        } else {
          console.warn('Error en Places API:', status);
          setSuggestions([]);
        }
      }
    );
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (onChange) {
      onChange(newValue);
    }

    // Limpiar timer anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Esperar 500ms antes de buscar (optimización)
    debounceTimer.current = setTimeout(() => {
      searchPlaces(newValue);
    }, 500);
  };

  const handleSelect = (suggestion) => {
    const selectedAddress = suggestion.description;
    setInputValue(selectedAddress);
    setIsOpen(false);
    setSuggestions([]);
    
    // Renovar session token después de seleccionar
    if (window.google && window.google.maps && window.google.maps.places) {
      sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
    }
    
    if (onSelect) {
      onSelect(selectedAddress);
    }
    if (onChange) {
      onChange(selectedAddress);
    }
  };

  const handleFocus = () => {
    if (!disabled && inputValue.length >= 3) {
      searchPlaces(inputValue);
    }
  };

  return (
    <div ref={wrapperRef} className="direccion-autocomplete">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={`autocomplete-input ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
      />

      {isLoading && (
        <div className="autocomplete-loading">
          <div className="loading-spinner"></div>
        </div>
      )}

      {isOpen && !disabled && suggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.place_id}
              onClick={() => handleSelect(suggestion)}
              className="autocomplete-item"
            >
              <div className="item-icon">📍</div>
              <div className="item-content">
                <div className="item-main">{suggestion.structured_formatting.main_text}</div>
                <div className="item-secondary">{suggestion.structured_formatting.secondary_text}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && !disabled && !isLoading && suggestions.length === 0 && inputValue.length >= 3 && (
        <div className="autocomplete-dropdown">
          <div className="autocomplete-empty">
            No se encontraron direcciones
          </div>
        </div>
      )}
    </div>
  );
};

export default DireccionAutocomplete;