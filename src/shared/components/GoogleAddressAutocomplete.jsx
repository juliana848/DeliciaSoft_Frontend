import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const GoogleAddressAutocomplete = ({ 
    value, 
    onChange, 
    onPlaceSelect,
    placeholder = "Ingrese su dirección",
    error = "",
    disabled = false,
    style = {}
}) => {
    const inputRef = useRef(null);
    const autocompleteRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        version: "weekly",
        libraries: ["places"]
    });

    useEffect(() => {
        loader.load().then(() => {
            setIsLoaded(true);
        }).catch(e => {
            console.error('Error loading Google Maps API:', e);
        });
    }, []);

    useEffect(() => {
        if (isLoaded && inputRef.current && !disabled) {
            // Configurar autocompletado
            const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['address'],
                componentRestrictions: { country: 'co' }, // Restringir a Colombia
                fields: ['address_components', 'formatted_address', 'geometry', 'name']
            });

            autocompleteRef.current = autocomplete;

            // Escuchar cuando se selecciona un lugar
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                
                if (place.formatted_address) {
                    // Extraer componentes de la dirección
                    const addressComponents = place.address_components || [];
                    let barrio = '';
                    let ciudad = '';

                    addressComponents.forEach(component => {
                        const types = component.types;
                        if (types.includes('sublocality') || types.includes('neighborhood')) {
                            barrio = component.long_name;
                        }
                        if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                            ciudad = component.long_name;
                        }
                    });

                    // Llamar callbacks
                   onChange(place.formatted_address);
                        if (onPlaceSelect) {
                            onPlaceSelect({
                                ...place,
                                address_components: addressComponents,
                                barrio: barrio,
                                ciudad: ciudad,
                                coordenadas: {
                                    lat: place.geometry?.location?.lat(),
                                    lng: place.geometry?.location?.lng()
                                }
                            });
                    }
                    setShowSuggestions(false);
                }
            });

            return () => {
                if (autocompleteRef.current) {
                    window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
                }
            };
        }
    }, [isLoaded, disabled, onChange, onPlaceSelect]);

    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        onChange(inputValue);

        // Si Google Places está cargado y hay texto, mostrar sugerencias
        if (isLoaded && inputValue.length > 2) {
            const service = new window.google.maps.places.AutocompleteService();
            service.getPlacePredictions({
                input: inputValue,
                componentRestrictions: { country: 'co' },
                types: ['address']
            }, (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setSuggestions(predictions.slice(0, 5)); // Mostrar máximo 5 sugerencias
                    setShowSuggestions(true);
                } else {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            });
        } else {
            setShowSuggestions(false);
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        service.getDetails({
            placeId: suggestion.place_id,
            fields: ['address_components', 'formatted_address', 'geometry', 'name']
        }, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                // Extraer componentes
                const addressComponents = place.address_components || [];
                let barrio = '';
                let ciudad = '';

                addressComponents.forEach(component => {
                    const types = component.types;
                    if (types.includes('sublocality') || types.includes('neighborhood')) {
                        barrio = component.long_name;
                    }
                    if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                        ciudad = component.long_name;
                    }
                });

                onChange(place.formatted_address);
                    if (onPlaceSelect) {
                        onPlaceSelect({
                            ...place,
                            address_components: addressComponents,
                            barrio: barrio,
                            ciudad: ciudad,
                            coordenadas: {
                                lat: place.geometry?.location?.lat(),
                                lng: place.geometry?.location?.lng()
                            }
                        });
                    }
                setShowSuggestions(false);
            }
        });
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleInputChange}
                onFocus={() => value.length > 2 && suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={isLoaded ? placeholder : "Cargando Google Maps..."}
                disabled={disabled || !isLoaded}
                style={{
                    width: '100%',
                    height: '28px',
                    fontSize: '12px',
                    padding: '2px 4px',
                    borderColor: error ? 'red' : '#ccc',
                    border: '1px solid',
                    borderRadius: '4px',
                    backgroundColor: disabled ? '#f5f5f5' : 'white',
                    color: disabled ? '#666' : 'black',
                    ...style
                }}
            />
            
            {/* Sugerencias dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderTop: 'none',
                    borderRadius: '0 0 4px 4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={suggestion.place_id}
                            onClick={() => handleSuggestionClick(suggestion)}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                borderBottom: index < suggestions.length - 1 ? '1px solid #eee' : 'none',
                                fontSize: '12px',
                                ':hover': {
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                                {suggestion.structured_formatting.main_text}
                            </div>
                            <div style={{ color: '#666', fontSize: '11px' }}>
                                {suggestion.structured_formatting.secondary_text}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Error message */}
            {error && (
                <small style={{ color: 'red', fontSize: '10px', display: 'block', marginTop: '2px' }}>
                    {error}
                </small>
            )}
            
            {/* Loading indicator */}
            {!isLoaded && (
                <small style={{ color: '#666', fontSize: '10px', display: 'block', marginTop: '2px' }}>
                    Cargando Google Maps...
                </small>
            )}
        </div>
    );
};

export default GoogleAddressAutocomplete;