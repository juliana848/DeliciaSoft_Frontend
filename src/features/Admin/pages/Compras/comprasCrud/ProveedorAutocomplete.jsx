import React, { useState, useRef, useEffect } from 'react';
import '../comprasCrud/styles/ProveedorAutocomplete.css';

const ProveedorAutocomplete = ({ 
  proveedores = [], 
  value = '', 
  onChange, 
  onSelect,
  disabled = false,
  error = false,
  placeholder = "Buscar por nombre o documento..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const wrapperRef = useRef(null);

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

  // Actualizar searchTerm cuando cambie value desde fuera
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Filtrar proveedores según búsqueda Y que estén activos
  const proveedoresFiltrados = proveedores.filter(p => {
    // Filtrar solo proveedores activos
    const estaActivo = p.estado === true || p.estado === 1 || p.estado === '1';
    if (!estaActivo) return false;

    // Filtrar por término de búsqueda
    const nombre = (p.nombre || p.nombreProveedor || p.nombreproveedor || p.nombreempresa || '').toLowerCase();
    const documento = (p.documento || p.nit || '').toString();
    const search = searchTerm.toLowerCase();
    return nombre.includes(search) || documento.includes(search);
  });

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    if (onChange) onChange(newValue);
  };

  const handleSelect = (proveedor) => {
    const nombre = proveedor.nombre || proveedor.nombreProveedor || proveedor.nombreproveedor || proveedor.nombreempresa;
    setSearchTerm(nombre);
    setIsOpen(false);
    if (onSelect) onSelect(proveedor);
  };

  const handleFocus = () => {
    if (!disabled) setIsOpen(true);
  };

  return (
    <div ref={wrapperRef} className="proveedor-autocomplete">
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={`autocomplete-input ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
      />

      {isOpen && !disabled && proveedoresFiltrados.length > 0 && (
        <div className="autocomplete-dropdown">
          {proveedoresFiltrados.map((proveedor) => {
            const nombre = proveedor.nombre || proveedor.nombreProveedor || proveedor.nombreproveedor || proveedor.nombreempresa;
            const documento = proveedor.documento || proveedor.nit || '';
            
            return (
              <div
                key={proveedor.idProveedor || proveedor.idproveedor}
                onClick={() => handleSelect(proveedor)}
                className="autocomplete-item"
              >
                <span className="item-nombre">{nombre}</span>
                <span className="item-documento">{documento}</span>
              </div>
            );
          })}
        </div>
      )}

      {isOpen && !disabled && searchTerm && proveedoresFiltrados.length === 0 && (
        <div className="autocomplete-dropdown">
          <div className="autocomplete-empty">
            No se encontraron proveedores activos
          </div>
        </div>
      )}
    </div>
  );
};

export default ProveedorAutocomplete;