import React, { useState, useEffect } from 'react';
import CompraActions from './CompraActions';
import CompraForm from './CompraForm';
import compraApiService from './compras_services';
import './styles/ComprasManager.css';

export default function ComprasManager() {
    const [vistaActual, setVistaActual] = useState('activas');
    const [compras, setCompras] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [compraSeleccionada, setCompraSeleccionada] = useState(null);
    const [modalTipo, setModalTipo] = useState('');

    // Función para cambiar a vista de anuladas
    const cambiarAVistaAnuladas = () => {
        console.log('🔄 Cambiando a vista anuladas...');
        setVistaActual('anuladas');
        
        // Forzar re-render después de cambiar vista
        setTimeout(() => {
            console.log('🔍 Vista actual después del cambio:', 'anuladas');
            console.log('📊 Compras anuladas disponibles:', compras.filter(c => c.estado === false).length);
        }, 100);
    };

    // Función para anular compra
    const anularCompra = async (compra) => {
        if (!window.confirm('¿Está seguro de que desea anular esta compra?')) {
            return;
        }

        try {
            setCargando(true);
            
            console.log('🚫 INICIANDO ANULACIÓN');
            console.log('📋 Compra:', compra);
            
            const idCompra = compra.id || compra.idcompra;
            console.log('🆔 ID:', idCompra);
            
            if (!idCompra) {
                throw new Error('ID de compra no válido');
            }

            // Llamar servicio para anular
            console.log('📡 Llamando servicio cambiarEstadoCompra...');
            const resultado = await compraApiService.cambiarEstadoCompra(idCompra, false);
            console.log('✅ Resultado del servicio:', resultado);

            // Actualizar estado local INMEDIATAMENTE
            console.log('🔄 Actualizando estado local...');
            setCompras(prevCompras => {
                const nuevasCompras = prevCompras.map(c => {
                    const idC = c.id || c.idcompra;
                    if (idC === idCompra) {
                        console.log(`✏️ Actualizando compra ${idC}: estado false`);
                        return { ...c, estado: false };
                    }
                    return c;
                });
                
                console.log('📊 Total compras después de actualizar:', nuevasCompras.length);
                console.log('📊 Compras activas:', nuevasCompras.filter(c => c.estado === true).length);
                console.log('📊 Compras anuladas:', nuevasCompras.filter(c => c.estado === false).length);
                
                return nuevasCompras;
            });

            // Esperar un momento y luego cambiar vista
            setTimeout(() => {
                cambiarAVistaAnuladas();
                alert('✅ Compra anulada exitosamente. Vista cambiada a "Compras Anuladas".');
            }, 500);
            
        } catch (error) {
            console.error('❌ Error al anular compra:', error);
            alert(`❌ Error: ${error.message}`);
        } finally {
            setCargando(false);
        }
    };

    // Función para reactivar compra
    const reactivarCompra = async (compra) => {
        if (!window.confirm('¿Está seguro de que desea reactivar esta compra?')) {
            return;
        }

        try {
            setCargando(true);
            
            console.log('✅ INICIANDO REACTIVACIÓN');
            console.log('📋 Compra:', compra);
            
            const idCompra = compra.id || compra.idcompra;
            console.log('🆔 ID:', idCompra);
            
            if (!idCompra) {
                throw new Error('ID de compra no válido');
            }

            // Llamar servicio para reactivar
            console.log('📡 Llamando servicio cambiarEstadoCompra...');
            const resultado = await compraApiService.cambiarEstadoCompra(idCompra, true);
            console.log('✅ Resultado del servicio:', resultado);

            // Actualizar estado local
            console.log('🔄 Actualizando estado local...');
            setCompras(prevCompras => {
                const nuevasCompras = prevCompras.map(c => {
                    const idC = c.id || c.idcompra;
                    if (idC === idCompra) {
                        console.log(`✏️ Actualizando compra ${idC}: estado true`);
                        return { ...c, estado: true };
                    }
                    return c;
                });
                
                console.log('📊 Total compras después de actualizar:', nuevasCompras.length);
                console.log('📊 Compras activas:', nuevasCompras.filter(c => c.estado === true).length);
                console.log('📊 Compras anuladas:', nuevasCompras.filter(c => c.estado === false).length);
                
                return nuevasCompras;
            });

            // Cambiar a vista activas
            setTimeout(() => {
                setVistaActual('activas');
                alert('✅ Compra reactivada exitosamente. Vista cambiada a "Compras Activas".');
            }, 500);
            
        } catch (error) {
            console.error('❌ Error al reactivar compra:', error);
            alert(`❌ Error: ${error.message}`);
        } finally {
            setCargando(false);
        }
    };

    // Función para ver detalles
const verCompra = async (compra) => {
    try {
        setCargando(true);
        console.log('Cargando compra completa para ID:', compra.id || compra.idcompra);
        
        // Obtener la compra completa con sus detalles
        const compraCompleta = await compraApiService.obtenerCompraPorId(compra.id || compra.idcompra);
        
        console.log('Compra completa obtenida:', compraCompleta);
        
        setCompraSeleccionada(compraCompleta);
        setModalTipo('ver');
        setMostrarModal(true);
    } catch (error) {
        console.error('Error al cargar compra:', error);
        alert('Error al cargar los detalles de la compra');
    } finally {
        setCargando(false);
    }
};

    // Función para generar PDF
    const generarPDF = async (compra) => {
        try {
            setCargando(true);
            const idCompra = compra.id || compra.idcompra;
            console.log('📄 Generando PDF para compra:', idCompra);
            
            const response = await fetch(`https://deliciasoft-backend-i6g9.onrender.com/api/compra/${idCompra}/pdf`);
            
            if (!response.ok) {
                throw new Error('Error al generar PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `compra-${idCompra}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            console.log('✅ PDF generado exitosamente');
        } catch (error) {
            console.error('❌ Error al generar PDF:', error);
            alert('❌ Error al generar el PDF');
        } finally {
            setCargando(false);
        }
    };

    // FILTRO MEJORADO - ASEGURAR QUE FUNCIONE
    const comprasFiltradas = compras.filter(compra => {
        // Asegurar que el estado sea booleano
        const estadoCompra = Boolean(compra.estado);
        
        if (vistaActual === 'activas') {
            return estadoCompra === true;
        } else if (vistaActual === 'anuladas') {
            return estadoCompra === false;
        }
        
        return false;
    });

    // Logs de debugging para el filtro
    console.log('🔍 FILTRO DEBUG:');
    console.log('📊 Vista actual:', vistaActual);
    console.log('📊 Total compras:', compras.length);
    console.log('📊 Compras filtradas:', comprasFiltradas.length);
    console.log('📊 Compras activas disponibles:', compras.filter(c => Boolean(c.estado) === true).length);
    console.log('📊 Compras anuladas disponibles:', compras.filter(c => Boolean(c.estado) === false).length);

    // Cargar compras al iniciar
   useEffect(() => {
    const cargarCompras = async () => {
        try {
            setCargando(true);
            console.log('Cargando compras...');
            const data = await compraApiService.obtenerCompras();
            console.log('Compras cargadas:', data.length);
            
            // ORDENAR POR FECHA DESCENDENTE (más reciente primero)
            const comprasOrdenadas = data.sort((a, b) => {
                const fechaA = new Date(a.fechaCompra || a.fechacompra).getTime();
                const fechaB = new Date(b.fechaCompra || b.fechacompra).getTime();
                return fechaB - fechaA; // Fechas más recientes primero
            });
            
            const activas = comprasOrdenadas.filter(c => Boolean(c.estado) === true);
            const anuladas = comprasOrdenadas.filter(c => Boolean(c.estado) === false);
            console.log('Al cargar - Activas:', activas.length, 'Anuladas:', anuladas.length);
            
            setCompras(comprasOrdenadas);
        } catch (error) {
            console.error('Error al cargar compras:', error);
            alert(`Error al cargar compras: ${error.message}`);
        } finally {
            setCargando(false);
        }
    };

    cargarCompras();
}, []);

    return (
        <div className="compras-manager">
            {/* Header con navegación */}
            <div className="header-section">
                <div className="nav-buttons">
                    <button 
                        className={`nav-btn ${vistaActual === 'activas' ? 'active' : ''}`}
                        onClick={() => {
                            console.log('🔄 Cambiando a vista ACTIVAS');
                            setVistaActual('activas');
                        }}
                    >
                        📋 Compras ({compras.filter(c => Boolean(c.estado) === true).length})
                    </button>
                    <button 
                        className={`nav-btn ${vistaActual === 'anuladas' ? 'active' : ''}`}
                        onClick={() => {
                            console.log('🔄 Cambiando a vista ANULADAS');
                            setVistaActual('anuladas');
                        }}
                    >
                        🚫 Ver Anuladas ({compras.filter(c => Boolean(c.estado) === false).length})
                    </button>
                </div>
                
                <button 
                    className="btn-add"
                    onClick={() => {
                        setModalTipo('crear');
                        setMostrarModal(true);
                        setCompraSeleccionada(null);
                    }}
                >
                    + Agregar
                </button>
                
                <input
                    type="text"
                    placeholder="Buscar Compras"
                    className="search-input"
                />
            </div>

            {/* Indicador de vista */}
            <div className="vista-indicator">
                <h2>
                    {vistaActual === 'activas' ? '📋 Compras Activas' : '🚫 Compras Anuladas'}
                    <span className="count-badge">({comprasFiltradas.length})</span>
                </h2>
                
                {/* DEBUG INFO */}
                <div style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
                    Debug: Total={compras.length}, Activas={compras.filter(c => Boolean(c.estado) === true).length}, 
                    Anuladas={compras.filter(c => Boolean(c.estado) === false).length}, 
                    Filtradas={comprasFiltradas.length}
                </div>
            </div>

            {/* Loading indicator */}
            {cargando && (
                <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                    ⏳ Cargando...
                </div>
            )}

            {/* Tabla de compras */}
            <div className="table-container">
                <table className="compras-table">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Proveedor</th>
                            <th>Fecha Compra</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comprasFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="empty-message">
                                    {cargando 
                                        ? '⏳ Cargando...' 
                                        : vistaActual === 'activas' 
                                            ? '📋 No hay compras activas' 
                                            : '🚫 No hay compras anuladas'
                                    }
                                </td>
                            </tr>
                        ) : (
                            comprasFiltradas.map((compra) => {
                                const idCompra = compra.id || compra.idcompra;
                                const estadoCompra = Boolean(compra.estado);
                                
                                return (
                                    <tr key={idCompra} className={estadoCompra ? 'active-row' : 'inactive-row'}>
                                        <td>{idCompra}</td>
                                        <td>
                                            {compra.proveedor?.nombre || 
                                             compra.proveedor?.nombreproveedor || 
                                             compra.proveedor?.nombreempresa || 
                                             compra.nombreProveedor ||
                                             'Sin proveedor'}
                                        </td>
                                        <td>
                                            {compra.fechaCompra ? 
                                                new Date(compra.fechaCompra).toLocaleDateString('es-CO') :
                                                compra.fechacompra ? 
                                                    new Date(compra.fechacompra).toLocaleDateString('es-CO') : 
                                                    'Sin fecha'
                                            }
                                        </td>
                                        <td>$ {new Intl.NumberFormat('es-CO').format(compra.total || 0)}</td>
                                        <td>
                                            <span className={`status-badge ${estadoCompra ? 'active' : 'inactive'}`}>
                                                {estadoCompra ? '✅ Activa' : '❌ Anulada'}
                                            </span>
                                        </td>
                                        <td>
                                            <CompraActions
                                                compra={compra}
                                                onVer={() => verCompra(compra)}
                                                onAnular={() => anularCompra(compra)}
                                                onReactivar={() => reactivarCompra(compra)}
                                                onGenerarPDF={() => generarPDF(compra)}
                                                cargando={cargando}
                                            />
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {/* Modal para ver/editar/crear compras */}
{mostrarModal && (
    <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CompraForm
                modalTipo={modalTipo}
                compraData={compraSeleccionada}
                insumosSeleccionados={compraSeleccionada?.detalles || []}
                setInsumosSeleccionados={() => {}} // Función vacía para modo ver
                proveedores={[]} // Array vacío o carga los proveedores si los necesitas
                errores={{}}
                setErrores={() => {}}
                cargando={false}
                onGuardar={() => {}}
                onCancelar={() => setMostrarModal(false)}
                onAbrirModalProveedor={() => {}}
                buscarProveedor=""
                setBuscarProveedor={() => {}}
                mostrarModalInsumos={false}
                setMostrarModalInsumos={() => {}}
            />
        </div>
                </div>
            )}
        </div>
    );
}