import React from 'react';
import Tooltip from '../../../components/Tooltip';

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
                <Tooltip text="Visualizar">
                    <button 
                        className="admin-button gray" 
                        onClick={() => {
                            console.log('Ver compra anulada:', compra);
                            onVer(compra);
                        }} 
                        disabled={cargando}
                    >
                        👁
                    </button>
                </Tooltip>
                {/* <Tooltip text="Reactivar">
                    <button
                        className="admin-button green"
                        onClick={() => {
                            console.log('Reactivar compra:', compra);
                            onReactivar(compra);
                        }}
                        disabled={cargando}
                    >
                        ↩️
                    </button>
                </Tooltip>
                <Tooltip text="Descargar PDF">
                    <button 
                        className="admin-button blue" 
                        onClick={() => {
                            console.log('Generar PDF compra anulada:', compra);
                            onGenerarPDF(compra);
                        }}
                        disabled={cargando}
                    >
                        📄
                    </button>
                </Tooltip> */}
            </div>
        );
    }

    // Para compras activas
    return (
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
            <Tooltip text="Visualizar">
                <button 
                    className="admin-button gray" 
                    onClick={() => {
                        console.log('Ver compra activa:', compra);
                        onVer(compra);
                    }} 
                    disabled={cargando}
                >
                    👁
                </button>
            </Tooltip>

            <Tooltip text="Anular">
                <button
                    className="admin-button red"
                    onClick={() => {
                        console.log('Anular compra:', compra);
                        onAnular(compra);
                    }}
                    disabled={cargando}
                >
                    🛑  
                </button>
            </Tooltip>

            <Tooltip text="Descargar PDF">
                <button 
                    className="admin-button blue" 
                    onClick={() => {
                        console.log('Generar PDF compra activa:', compra);
                        onGenerarPDF(compra);
                    }}
                    disabled={cargando}
                >
                    📄
                </button>
            </Tooltip>
        </div>
    );
}