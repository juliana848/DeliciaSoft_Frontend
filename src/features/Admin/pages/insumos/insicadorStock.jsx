import React from "react";

export default function IndicadorStock({ insumo }) {
  // Función para obtener el nombre de la unidad
  const getUnidadNombre = (insumo) => {
    if (insumo.nombreUnidadMedida) return insumo.nombreUnidadMedida;
    if (insumo.unidadmedida?.unidadmedida) return insumo.unidadmedida.unidadmedida;
    if (insumo.unidad) return insumo.unidad;
    return "unid";
  };

  // Calcular porcentaje de stock
  const porcentaje = insumo.stockMinimo > 0 ? (insumo.cantidad / insumo.stockMinimo) * 100 : 100;
  
  // Determinar estado y estilo
  const getStockInfo = () => {
    if (insumo.cantidad <= 0) {
      return {
        texto: "A", // Agotado
        backgroundColor: "#ffcdd2",
        color: "#b71c1c",
        borderColor: "#f44336"
      };
    } else if (porcentaje < 20) {
      return {
        texto: "C", // Crítico
        backgroundColor: "#ffcdd2", 
        color: "#b71c1c",
        borderColor: "#f44336"
      };
    } else if (porcentaje < 50) {
      return {
        texto: "B", // Bajo
        backgroundColor: "#fff3e0",
        color: "#ef6c00",
        borderColor: "#ff9800"
      };
    } else {
      return {
        texto: "N", // Normal
        backgroundColor: "#e8f5e8",
        color: "#2e7d32",
        borderColor: "#4caf50"
      };
    }
  };

  const stockInfo = getStockInfo();
  const unidad = getUnidadNombre(insumo);
  const cantidad = insumo.cantidad || 0;

  const estilo = {
    padding: '6px 12px',
    borderRadius: '12px',
    fontWeight: '500',
    fontSize: '12px',
    textAlign: 'center',
    display: 'inline-block',
    minWidth: '120px',
    border: `1px solid ${stockInfo.borderColor}`,
    backgroundColor: stockInfo.backgroundColor,
    color: stockInfo.color
  };

  return (
    <div style={estilo}>
      {cantidad} {unidad} {stockInfo.texto}
    </div>
  );
}