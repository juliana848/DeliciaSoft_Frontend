import React from "react";

export default function IndicadorStockMin({ insumo }) {
  // Función para obtener el nombre de la unidad
  const getUnidadNombre = (insumo) => {
    if (insumo.nombreUnidadMedida) return insumo.nombreUnidadMedida;
    if (insumo.unidadmedida?.unidadmedida) return insumo.unidadmedida.unidadmedida;
    if (insumo.unidad) return insumo.unidad;
    return "unid";
  };

  // Función para determinar el estilo según el nivel de stock
  const getStockMinStyle = (insumo) => {
    const { cantidad, stockMinimo } = insumo;
    const porcentaje = stockMinimo > 0 ? (cantidad / stockMinimo) * 100 : 100;
    
    const baseStyle = {
      padding: '6px 12px',
      borderRadius: '12px',
      fontWeight: '500',
      fontSize: '12px',
      textAlign: 'center',
      display: 'inline-block',
      minWidth: '120px',
      border: '1px solid'
    };

    // Determinar color según el estado del stock
    if (cantidad <= 0) {
      // Stock agotado - fondo rosa fuerte
      return {
        ...baseStyle,
        backgroundColor: '#ffcdd2',
        color: '#b71c1c',
        borderColor: '#f44336'
      };
    } else if (porcentaje < 20) {
      // Stock crítico - fondo rosa fuerte
      return {
        ...baseStyle,
        backgroundColor: '#ffcdd2', 
        color: '#b71c1c',
        borderColor: '#f44336'
      };
    } else if (porcentaje < 50) {
      // Stock bajo - fondo rosa claro
      return {
        ...baseStyle,
        backgroundColor: '#f8bbd9',
        color: '#c62828',
        borderColor: '#e91e63'
      };
    } else {
      // Stock normal - fondo verde
      return {
        ...baseStyle,
        backgroundColor: '#e8f5e8',
        color: '#2e7d32',
        borderColor: '#4caf50'
      };
    }
  };

  const stockMinimo = insumo.stockMinimo || 5;
  const unidad = getUnidadNombre(insumo);
  const estilo = getStockMinStyle(insumo);

  return (
    <div style={estilo}>
      Min: {stockMinimo} {unidad}
    </div>
  );
}