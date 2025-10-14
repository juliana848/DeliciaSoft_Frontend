import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

export default function NotificationBell({ insumos = [] }) {
  const [abierto, setAbierto] = useState(false);
  const [insumosCriticos, setInsumosCriticos] = useState([]);
  const [pestanaActiva, setPestanaActiva] = useState('insumos');

  useEffect(() => {
    // Calcular insumos CRÍTICOS (cantidad = 0 - agotados)
    const criticos = insumos.filter(insumo => {
      const cantidad = parseFloat(insumo.cantidad) || 0;
      return cantidad <= 0 && insumo.estado;
    });
    setInsumosCriticos(criticos);
  }, [insumos]);

  const tieneNotificaciones = insumosCriticos.length > 0;

  return (
    <div style={{ position: 'relative' }}>
      {/* Botón campanita */}
      <button
        onClick={() => setAbierto(!abierto)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          transition: 'all 0.2s ease',
          backgroundColor: abierto ? '#f3f4f6' : 'transparent'
        }}
        onMouseEnter={(e) => {
          if (!abierto) e.target.style.backgroundColor = '#f3f4f6';
        }}
        onMouseLeave={(e) => {
          if (!abierto) e.target.style.backgroundColor = 'transparent';
        }}
        title="Notificaciones de stock"
      >
        <Bell size={24} color="#374151" />
        
        {/* Badge de notificaciones */}
        {tieneNotificaciones && (
          <div
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {insumosCriticos.length > 9 ? '9+' : insumosCriticos.length}
          </div>
        )}
      </button>

      {/* Panel de notificaciones */}
      {abierto && (
        <div
          style={{
            position: 'absolute',
            top: '50px',
            right: '0',
            width: '380px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            maxHeight: '500px',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #e5e7eb'
          }}
        >
          {/* Encabezado */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}
          >
            <div>
              <h3 style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                Stock Crítico
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                {tieneNotificaciones 
                  ? `${insumosCriticos.length} insumo${insumosCriticos.length > 1 ? 's' : ''} agotado${insumosCriticos.length > 1 ? 's' : ''}` 
                  : 'Todo en orden'}
              </p>
            </div>
            <button
              onClick={() => setAbierto(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#1f2937'}
              onMouseLeave={(e) => e.target.style.color = '#6b7280'}
            >
              <X size={20} />
            </button>
          </div>

          {/* Pestañas */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              padding: '0'
            }}
          >
            <button
              onClick={() => setPestanaActiva('insumos')}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                backgroundColor: pestanaActiva === 'insumos' ? 'white' : '#f3f4f6',
                borderBottom: pestanaActiva === 'insumos' ? '2px solid #ec4899' : 'none',
                color: pestanaActiva === 'insumos' ? '#ec4899' : '#6b7280',
                fontWeight: pestanaActiva === 'insumos' ? '600' : '500',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (pestanaActiva !== 'insumos') e.target.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                if (pestanaActiva !== 'insumos') e.target.style.backgroundColor = '#f3f4f6';
              }}
            >
              📦 Insumos
            </button>
            <button
              onClick={() => setPestanaActiva('pedido')}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                backgroundColor: pestanaActiva === 'pedido' ? 'white' : '#f3f4f6',
                borderBottom: pestanaActiva === 'pedido' ? '2px solid #ec4899' : 'none',
                color: pestanaActiva === 'pedido' ? '#ec4899' : '#6b7280',
                fontWeight: pestanaActiva === 'pedido' ? '600' : '500',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (pestanaActiva !== 'pedido') e.target.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                if (pestanaActiva !== 'pedido') e.target.style.backgroundColor = '#f3f4f6';
              }}
            >
              📋 Pedido
            </button>
            <button
              onClick={() => setPestanaActiva('produccion')}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                backgroundColor: pestanaActiva === 'produccion' ? 'white' : '#f3f4f6',
                borderBottom: pestanaActiva === 'produccion' ? '2px solid #ec4899' : 'none',
                color: pestanaActiva === 'produccion' ? '#ec4899' : '#6b7280',
                fontWeight: pestanaActiva === 'produccion' ? '600' : '500',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (pestanaActiva !== 'produccion') e.target.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                if (pestanaActiva !== 'produccion') e.target.style.backgroundColor = '#f3f4f6';
              }}
            >
              🏭 Producción
            </button>
          </div>

          {/* Contenido */}
          <div
            style={{
              overflowY: 'auto',
              maxHeight: '400px',
              flex: 1
            }}
          >
            {pestanaActiva === 'insumos' ? (
              tieneNotificaciones ? (
                <div style={{ padding: '12px' }}>
                  {insumosCriticos.map((insumo, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '12px',
                        backgroundColor: '#fee2e2',
                        borderLeft: '4px solid #ef4444',
                        borderRadius: '6px',
                        marginBottom: '8px',
                        fontSize: '13px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#1f2937' }}>
                            {insumo.nombreInsumo || insumo.nombreinsumo}
                          </p>
                          <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px' }}>
                            {insumo.nombreCategoria || insumo.categoriainsumos?.nombrecategoria || 'Sin categoría'}
                          </p>
                          <div style={{ 
                            display: 'flex', 
                            gap: '12px', 
                            alignItems: 'center',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{ 
                              color: '#991b1b',
                              fontWeight: '600'
                            }}>
                              Stock: {insumo.cantidad} {insumo.nombreUnidadMedida || insumo.unidadmedida?.unidadmedida || 'unid'}
                            </span>
                            <span style={{ 
                              color: '#6b7280',
                              fontSize: '11px'
                            }}>
                              Mín: {insumo.stockMinimo || 5}
                            </span>
                          </div>
                        </div>
                        <div
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            marginTop: '2px'
                          }}
                        >
                          ⚠️ Agotado
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: '#9ca3af'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    Sin stock crítico
                  </p>
                </div>
              )
            ) : (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#9ca3af'
                }}
              >
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Sin notificaciones en esta sección
                </p>
              </div>
            )}
          </div>

          {/* Pie */}
          {tieneNotificaciones && pestanaActiva === 'insumos' && (
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                fontSize: '12px',
                color: '#6b7280',
                textAlign: 'center'
              }}
            >
              📊 Requiere reabastecimiento inmediato
            </div>
          )}
        </div>
      )}

      {/* Overlay para cerrar */}
      {abierto && (
        <div
          onClick={() => setAbierto(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
        />
      )}
    </div>
  );
}