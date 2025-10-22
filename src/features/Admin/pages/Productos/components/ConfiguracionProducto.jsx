import React, { useState, useEffect } from "react";
import configuracionProductoService from "../../../services/configuracionProductoService";
import Notification from "../../../components/Notification";
import "./css/productoscss.css";

export default function ConfiguracionProducto({ idProducto, nombreProducto, onSave, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [notification, setNotification] = useState({
    visible: false,
    mensaje: "",
    tipo: "success",
  });

  const [configuracion, setConfiguracion] = useState({
    idproductogeneral: idProducto,
    tipoPersonalizacion: "basico",
    limiteTopping: 0,
    limiteSalsa: 0,
    limiteRelleno: 0,
    limiteSabor: 0,
    permiteToppings: false,
    permiteSalsas: false,
    permiteAdiciones: false,
    permiteRellenos: false,
    permiteSabores: false,
  });

  const showNotification = (mensaje, tipo = "success") =>
    setNotification({ visible: true, mensaje, tipo });
  const hideNotification = () =>
    setNotification({ visible: false, mensaje: "", tipo: "success" });

  // Cargar configuración existente
  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        setLoadingData(true);
        const data = await configuracionProductoService.obtenerPorProducto(idProducto);
        
        if (data && !data.esNuevo) {
          setConfiguracion(data);
        } else {
          setConfiguracion({
            idproductogeneral: idProducto,
            tipoPersonalizacion: "basico",
            limiteTopping: 0,
            limiteSalsa: 0,
            limiteRelleno: 0,
            limiteSabor: 0,
            permiteToppings: false,
            permiteSalsas: false,
            permiteAdiciones: false,
            permiteRellenos: false,
            permiteSabores: false,
          });
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error);
        showNotification("Error al cargar configuración: " + error.message, "error");
      } finally {
        setLoadingData(false);
      }
    };

    if (idProducto) {
      cargarConfiguracion();
    }
  }, [idProducto]);

  // Manejar cambio de tipo de personalización
  const handleTipoChange = (tipo) => {
    let nuevaConfig = { ...configuracion, tipoPersonalizacion: tipo };

    switch (tipo) {
      case "basico":
        // Sin personalización
        nuevaConfig = {
          ...nuevaConfig,
          permiteToppings: false,
          permiteSalsas: false,
          permiteAdiciones: false,
          permiteRellenos: false,
          permiteSabores: false,
          limiteTopping: 0,
          limiteSalsa: 0,
          limiteRelleno: 0,
          limiteSabor: 0,
        };
        break;
      case "toppings":
        // Con toppings y salsas - usuario decide qué activar
        nuevaConfig = {
          ...nuevaConfig,
          permiteToppings: false,
          permiteSalsas: false,
          permiteAdiciones: false,
          permiteRellenos: false,
          permiteSabores: false,
          limiteTopping: 0,
          limiteSalsa: 0,
          limiteRelleno: 0,
          limiteSabor: 0,
        };
        break;
      case "personalizado":
        // Solo sabores y rellenos
        nuevaConfig = {
          ...nuevaConfig,
          permiteToppings: false,
          permiteSalsas: false,
          permiteAdiciones: false,
          permiteRellenos: false,
          permiteSabores: false,
          limiteTopping: 0,
          limiteSalsa: 0,
          limiteRelleno: 0,
          limiteSabor: 0,
        };
        break;
    }

    setConfiguracion(nuevaConfig);
  };

  // Manejar cambio de límite
  const handleLimiteChange = (campo, valor) => {
    const numero = parseInt(valor);
    
    // Si es menor a 1, desactivar el permiso
    if (numero < 1 || isNaN(numero)) {
      const campoPermiso = 'permite' + campo.replace('limite', '').charAt(0).toUpperCase() + 
                           campo.replace('limite', '').slice(1) + 's';
      
      setConfiguracion((prev) => ({
        ...prev,
        [campo]: 0,
        [campoPermiso]: false
      }));
    } else {
      setConfiguracion((prev) => ({
        ...prev,
        [campo]: numero
      }));
    }
  };

  // Manejar cambio de checkbox de permiso
  const handlePermissionChange = (campo, campoLimite, valorDefault = 1) => {
    setConfiguracion((prev) => {
      const nuevoValor = !prev[campo];
      
      return {
        ...prev,
        [campo]: nuevoValor,
        [campoLimite]: nuevoValor ? valorDefault : 0
      };
    });
  };

  // Guardar configuración
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validar
      configuracionProductoService.validarConfiguracion(configuracion);
      
      // Guardar
      const resultado = await configuracionProductoService.guardarConfiguracion(configuracion);
      
      showNotification("Configuración guardada exitosamente", "success");
      
      if (onSave) {
        setTimeout(() => onSave(resultado), 1500);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      showNotification("Error al guardar: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="compra-form-container">
        <p style={{ textAlign: "center", padding: "20px" }}>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="compra-form-container">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      <form onSubmit={handleSubmit}>
        {/* Header Compacto */}
        <div className="form-card" style={{ marginBottom: "16px" }}>
          <h2 className="section-title" style={{ fontSize: "1.2rem", marginBottom: "4px" }}>
            ⚙️ Configuración de Personalización
          </h2>
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
            <strong>{nombreProducto}</strong>
          </p>
        </div>

        {/* Tipo de Personalización - Compacto */}
        <div className="form-card" style={{ marginBottom: "16px" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "12px", fontWeight: "600" }}>
            Tipo de Personalización
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
            {[
              { value: "basico", label: "Básico", desc: "Sin personalización" },
              { value: "toppings", label: "Toppings", desc: "Toppings + Salsas + Adiciones" },
              { value: "personalizado", label: "Personalizado", desc: "Sabores y Rellenos" }
            ].map((tipo) => (
              <button
                key={tipo.value}
                type="button"
                onClick={() => handleTipoChange(tipo.value)}
                style={{
                  padding: "12px 8px",
                  borderRadius: "8px",
                  border: configuracion.tipoPersonalizacion === tipo.value 
                    ? "2px solid #3b82f6" 
                    : "2px solid #e5e7eb",
                  background: configuracion.tipoPersonalizacion === tipo.value 
                    ? "#dbeafe" 
                    : "#fff",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "center"
                }}
              >
                <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>{tipo.label}</div>
                <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "4px" }}>
                  {tipo.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Opciones - Grid 2 columnas según el tipo */}
        {configuracion.tipoPersonalizacion === "toppings" && (
          <div className="form-card" style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "12px", fontWeight: "600" }}>
              Opciones Disponibles
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
              {/* Toppings */}
              <div style={{ 
                padding: "10px", 
                border: "1px solid #e5e7eb", 
                borderRadius: "6px",
                background: configuracion.permiteToppings ? "#f0f9ff" : "#fff"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={configuracion.permiteToppings}
                      onChange={() => handlePermissionChange("permiteToppings", "limiteTopping", 3)}
                      style={{ width: "16px", height: "16px" }}
                    />
                    <span style={{ fontSize: "0.85rem", fontWeight: "500" }}>🍕 Toppings</span>
                  </label>
                </div>
                {configuracion.permiteToppings && (
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={configuracion.limiteTopping}
                    onChange={(e) => handleLimiteChange("limiteTopping", e.target.value)}
                    placeholder="Límite"
                    style={{ 
                      width: "100%", 
                      padding: "6px 8px", 
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      textAlign: "center",
                      fontSize: "0.85rem"
                    }}
                  />
                )}
              </div>

              {/* Salsas */}
              <div style={{ 
                padding: "10px", 
                border: "1px solid #e5e7eb", 
                borderRadius: "6px",
                background: configuracion.permiteSalsas ? "#f0f9ff" : "#fff"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={configuracion.permiteSalsas}
                      onChange={() => handlePermissionChange("permiteSalsas", "limiteSalsa", 2)}
                      style={{ width: "16px", height: "16px" }}
                    />
                    <span style={{ fontSize: "0.85rem", fontWeight: "500" }}>🥫 Salsas</span>
                  </label>
                </div>
                {configuracion.permiteSalsas && (
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={configuracion.limiteSalsa}
                    onChange={(e) => handleLimiteChange("limiteSalsa", e.target.value)}
                    placeholder="Límite"
                    style={{ 
                      width: "100%", 
                      padding: "6px 8px", 
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      textAlign: "center",
                      fontSize: "0.85rem"
                    }}
                  />
                )}
              </div>

              {/* Adiciones - Ocupa 2 columnas */}
              <div style={{ 
                padding: "10px", 
                border: "1px solid #e5e7eb", 
                borderRadius: "6px",
                background: configuracion.permiteAdiciones ? "#f0fdf4" : "#fff",
                gridColumn: "span 2"
              }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={configuracion.permiteAdiciones}
                    onChange={() => setConfiguracion(prev => ({ 
                      ...prev, 
                      permiteAdiciones: !prev.permiteAdiciones 
                    }))}
                    style={{ width: "16px", height: "16px" }}
                  />
                  <span style={{ fontSize: "0.85rem", fontWeight: "500" }}>➕ Adiciones</span>
                  <span style={{ fontSize: "0.7rem", color: "#10b981", marginLeft: "auto" }}>
                    (Se cobra)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Modo Personalizado - Grid 2 columnas */}
        {configuracion.tipoPersonalizacion === "personalizado" && (
          <div className="form-card" style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "12px", fontWeight: "600" }}>
              Opciones Disponibles
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
              {/* Rellenos */}
              <div style={{ 
                padding: "10px", 
                border: "1px solid #e5e7eb", 
                borderRadius: "6px",
                background: configuracion.permiteRellenos ? "#fef3c7" : "#fff"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={configuracion.permiteRellenos}
                      onChange={() => handlePermissionChange("permiteRellenos", "limiteRelleno", 1)}
                      style={{ width: "16px", height: "16px" }}
                    />
                    <span style={{ fontSize: "0.85rem", fontWeight: "500" }}>🥧 Rellenos</span>
                  </label>
                </div>
                {configuracion.permiteRellenos && (
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={configuracion.limiteRelleno}
                    onChange={(e) => handleLimiteChange("limiteRelleno", e.target.value)}
                    placeholder="Límite"
                    style={{ 
                      width: "100%", 
                      padding: "6px 8px", 
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      textAlign: "center",
                      fontSize: "0.85rem"
                    }}
                  />
                )}
              </div>

              {/* Sabores */}
              <div style={{ 
                padding: "10px", 
                border: "1px solid #e5e7eb", 
                borderRadius: "6px",
                background: configuracion.permiteSabores ? "#fce7f3" : "#fff"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={configuracion.permiteSabores}
                      onChange={() => handlePermissionChange("permiteSabores", "limiteSabor", 1)}
                      style={{ width: "16px", height: "16px" }}
                    />
                    <span style={{ fontSize: "0.85rem", fontWeight: "500" }}>🍦 Sabores</span>
                  </label>
                </div>
                {configuracion.permiteSabores && (
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={configuracion.limiteSabor}
                    onChange={(e) => handleLimiteChange("limiteSabor", e.target.value)}
                    placeholder="Límite"
                    style={{ 
                      width: "100%", 
                      padding: "6px 8px", 
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      textAlign: "center",
                      fontSize: "0.85rem"
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resumen Compacto */}
        {configuracion.tipoPersonalizacion !== "basico" && (
          <div className="form-card" style={{ background: "#f9fafb", marginBottom: "12px", padding: "12px" }}>
            <h3 style={{ fontSize: "0.9rem", marginBottom: "6px", fontWeight: "600" }}>
              📊 Resumen
            </h3>
            
            <div style={{ fontSize: "0.8rem", color: "#374151" }}>
              {configuracion.tipoPersonalizacion === "toppings" && (
                <div style={{ paddingLeft: "10px", borderLeft: "2px solid #3b82f6" }}>
                  {configuracion.permiteToppings && (
                    <div>• Toppings: Máx. {configuracion.limiteTopping}</div>
                  )}
                  {configuracion.permiteSalsas && (
                    <div>• Salsas: Máx. {configuracion.limiteSalsa}</div>
                  )}
                  {configuracion.permiteAdiciones && (
                    <div>• Adiciones: Permitidas</div>
                  )}
                  {!configuracion.permiteToppings && !configuracion.permiteSalsas && !configuracion.permiteAdiciones && (
                    <div style={{ color: "#9ca3af", fontStyle: "italic" }}>Sin opciones seleccionadas</div>
                  )}
                </div>
              )}
              
              {configuracion.tipoPersonalizacion === "personalizado" && (
                <div style={{ paddingLeft: "10px", borderLeft: "2px solid #8b5cf6" }}>
                  {configuracion.permiteRellenos && (
                    <div>• Rellenos: Máx. {configuracion.limiteRelleno}</div>
                  )}
                  {configuracion.permiteSabores && (
                    <div>• Sabores: Máx. {configuracion.limiteSabor}</div>
                  )}
                  {!configuracion.permiteRellenos && !configuracion.permiteSabores && (
                    <div style={{ color: "#9ca3af", fontStyle: "italic" }}>Sin opciones seleccionadas</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="action-buttons" style={{ marginTop: "12px" }}>
          <button 
            type="button" 
            className="btn btn-cancel" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-save"
            disabled={loading}
          >
            {loading ? "Guardando..." : "💾 Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}