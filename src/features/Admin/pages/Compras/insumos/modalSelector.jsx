import React from "react";
import Modal from "../../../components/modal";

export default function SelectorCatalogo({
  modalSelectorVisible,
  cerrarModalSelector,
  insumoParaCatalogo,
  seleccionarTipoCatalogo,
}) {
  if (!modalSelectorVisible) return null;

  return (
    <Modal visible={modalSelectorVisible} onClose={cerrarModalSelector}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        margin: '-20px -20px 20px -20px',
        borderRadius: '12px 12px 0 0',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '15px',
          fontSize: '24px',
          cursor: 'pointer',
          opacity: '0.8',
          transition: 'opacity 0.2s'
        }} 
        onClick={cerrarModalSelector}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.8'}>
          ×
        </div>
        
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎯</div>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '600' }}>
          Seleccionar Tipo de Catálogo
        </h2>
        <p style={{ margin: 0, opacity: '0.9', fontSize: '16px' }}>
          ¿Qué tipo de catálogo deseas crear para <strong>{insumoParaCatalogo?.nombre}</strong>?
        </p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '15px',
        padding: '20px 0'
      }}>
        {/* ADICIONES */}
        <div 
          className="catalog-option"
          onClick={() => seleccionarTipoCatalogo('adicion')}
          style={{
            background: 'linear-gradient(145deg, #ff6b6b, #ee5a52)',
            color: 'white',
            padding: '25px 15px',
            borderRadius: '16px',
            cursor: 'pointer',
            textAlign: 'center',
            border: 'none',
            boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(255, 107, 107, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.3)';
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🍬</div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '600' }}>Adiciones</h3>
          <p style={{ margin: 0, fontSize: '13px', opacity: '0.9' }}>
            Extras generales
          </p>
        </div>

        {/* TOPPINGS */}
        <div 
          className="catalog-option"
          onClick={() => seleccionarTipoCatalogo('topping')}
          style={{
            background: 'linear-gradient(145deg, #f093fb, #f5576c)',
            color: 'white',
            padding: '25px 15px',
            borderRadius: '16px',
            cursor: 'pointer',
            textAlign: 'center',
            border: 'none',
            boxShadow: '0 8px 25px rgba(240, 147, 251, 0.3)',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(240, 147, 251, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(240, 147, 251, 0.3)';
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🍫</div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '600' }}>Toppings</h3>
          <p style={{ margin: 0, fontSize: '13px', opacity: '0.9' }}>
            Coberturas especiales
          </p>
        </div>

        {/* SALSAS */}
        <div 
          className="catalog-option"
          onClick={() => seleccionarTipoCatalogo('salsa')}
          style={{
            background: 'linear-gradient(145deg, #fa709a, #fee140)',
            color: 'white',
            padding: '25px 15px',
            borderRadius: '16px',
            cursor: 'pointer',
            textAlign: 'center',
            border: 'none',
            boxShadow: '0 8px 25px rgba(250, 112, 154, 0.3)',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(250, 112, 154, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(250, 112, 154, 0.3)';
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌶️</div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '600' }}>Salsas</h3>
          <p style={{ margin: 0, fontSize: '13px', opacity: '0.9' }}>
            Acompañamientos líquidos
          </p>
        </div>

        {/* SABORES */}
        <div 
          className="catalog-option"
          onClick={() => seleccionarTipoCatalogo('sabor')}
          style={{
            background: 'linear-gradient(145deg, #a8edea, #fed6e3)',
            color: '#333',
            padding: '25px 15px',
            borderRadius: '16px',
            cursor: 'pointer',
            textAlign: 'center',
            border: 'none',
            boxShadow: '0 8px 25px rgba(168, 237, 234, 0.4)',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(168, 237, 234, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(168, 237, 234, 0.4)';
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎨</div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '600' }}>Sabores</h3>
          <p style={{ margin: 0, fontSize: '13px', opacity: '0.8' }}>
            Variedades de gusto
          </p>
        </div>
        
        {/* RELLENOS */}
        <div 
          className="catalog-option"
          onClick={() => seleccionarTipoCatalogo('relleno')}
          style={{
            background: 'linear-gradient(145deg, #4ecdc4, #44a08d)',
            color: 'white',
            padding: '25px 15px',
            borderRadius: '16px',
            cursor: 'pointer',
            textAlign: 'center',
            border: 'none',
            boxShadow: '0 8px 25px rgba(78, 205, 196, 0.3)',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(78, 205, 196, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(78, 205, 196, 0.3)';
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🥧</div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '600' }}>Rellenos</h3>
          <p style={{ margin: 0, fontSize: '13px', opacity: '0.9' }}>
            Cremas y mezclas
          </p>
        </div>
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        paddingTop: '20px',
        borderTop: '1px solid #eee',
        marginTop: '20px'
      }}>
        <button 
          onClick={cerrarModalSelector}
          style={{
            background: '#f8f9fa',
            color: '#6c757d',
            border: '2px solid #dee2e6',
            borderRadius: '8px',
            padding: '10px 30px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#e9ecef';
            e.target.style.borderColor = '#adb5bd';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#f8f9fa';
            e.target.style.borderColor = '#dee2e6';
          }}
        >
          Cancelar
        </button>
      </div>
    </Modal>
  );
}