import React from 'react';

export default function CompraActions({ 
    compra, 
    onVer, 
    onAnular, 
    onReactivar, 
    onGenerarPDF, 
    cargando 
}) {
    // Verificar el estado correctamente
    if (!compra.estado || compra.estado === false) {
        // Para compras anuladas
        return (
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                <button 
                    className="admin-button gray" 
                    title="Visualizar" 
                    onClick={() => {
                        console.log('Ver compra anulada:', compra);
                        onVer(compra);
                    }} 
                    disabled={cargando}
                >
                    👁
                </button>
                {/* <button
                    className="admin-button green"
                    title="Reactivar"
                    onClick={() => {
                        console.log('Reactivar compra:', compra);
                        onReactivar(compra);
                    }}
                    disabled={cargando}
                >
                    ↩️
                </button>
                <button 
                    className="admin-button blue" 
                    title="Descargar PDF" 
                    onClick={() => {
                        console.log('Generar PDF compra anulada:', compra);
                        onGenerarPDF(compra);
                    }}
                    disabled={cargando}
                >
                    📄
                </button> */}
            </div>
        );
    }

    // Para compras activas
    return (
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
            <button 
                className="admin-button gray" 
                title="Visualizar" 
                onClick={() => {
                    console.log('Ver compra activa:', compra);
                    onVer(compra);
                }} 
                disabled={cargando}
            >
                👁
            </button>
            <button
                className="admin-button red"
                title="Anular"
                onClick={() => {
                    console.log('Anular compra:', compra);
                    onAnular(compra);
                }}
                disabled={cargando}
            >
                🛑  
            </button>
            <button 
                className="admin-button blue" 
                title="Descargar PDF" 
                onClick={() => {
                    console.log('Generar PDF compra activa:', compra);
                    onGenerarPDF(compra);
                }}
                disabled={cargando}
            >
                📄
            </button>
        </div>
    );
}