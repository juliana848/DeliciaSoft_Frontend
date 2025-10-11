import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Modal from '../components/modal';

const COLORES = {
    rosaPrincipal: [255, 20, 147],     
    rosaClaro: [255, 182, 193],      
    amarillo: [255, 215, 0],        
    amarilloClaro: [255, 255, 224],   
    grisTexto: [64, 64, 64],        
    blanco: [255, 255, 255],
    grisElegante: [108, 117, 125],
    grisFondo: [248, 249, 250]
};

const EMPRESA_CONFIG = { 
    nombre: "Delicias Darsy",
    subtitulo: 'Gestión de Compras',
    usarLogoPersonalizado: true, 
    logoURL: '/imagenes/logo-delicias-darsy.png', 
    logoFormato: 'PNG',
    logoAncho: 35,
    logoAlto: 25,
    logoFooterSize: 15
};

const PDFPreview = ({ visible, onClose, compraData, onDownload }) => {
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función para obtener fecha y hora de Colombia
    const obtenerFechaHoraColombia = () => {
        const ahora = new Date();
        
        // Fecha en formato Colombia
        const fecha = ahora.toLocaleDateString('es-CO', {
            timeZone: 'America/Bogota',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        
        // Hora en formato Colombia (24 horas)
        const hora = ahora.toLocaleTimeString('es-CO', {
            timeZone: 'America/Bogota',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        return { fecha, hora };
    };

    // Función para formatear números con separador de miles
    const formatearNumero = (numero) => {
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numero);
    };

    // Función para formatear moneda colombiana
    const formatearMoneda = (valor) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(valor);
    };

    const crearLogo = (doc, x, y, size = 20) => {
        if (EMPRESA_CONFIG.usarLogoPersonalizado && EMPRESA_CONFIG.logoURL) {
            try {
                doc.setFillColor(...COLORES.blanco);
                const radioFondo = (size / 2) + 3;
                doc.circle(x, y, radioFondo, 'F');
                
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.5);
                doc.circle(x, y, radioFondo, 'S');
                
                doc.addImage(
                    EMPRESA_CONFIG.logoURL,          
                    EMPRESA_CONFIG.logoFormato,      
                    x - size/2,                      
                    y - size/2,                      
                    size,                        
                    size                            
                );
            } catch (error) {
                console.error('Error al cargar logo personalizado:', error);
                crearLogoGenerado(doc, x, y, size);
            }
        } else {
            crearLogoGenerado(doc, x, y, size);
        }
    };

    const crearLogoGenerado = (doc, x, y, size) => {
        doc.setFillColor(...COLORES.blanco);
        const radioFondo = (size / 2) + 3;
        doc.circle(x, y, radioFondo, 'F');
        
        doc.setFillColor(...COLORES.rosaPrincipal);
        doc.circle(x, y, size, 'F');
        
        doc.setFillColor(...COLORES.amarillo);
        doc.circle(x, y, size * 0.6, 'F');
        
        doc.setFontSize(size * 0.8);
        doc.setTextColor(...COLORES.blanco);
        doc.setFont('helvetica', 'bold');
        doc.text('DD', x - 4, y + 3);
    };

    const crearHeader = (doc) => {
        const altoFucsia = 40;
        const altoRosaClaro = 10;

        doc.setFillColor(...COLORES.rosaPrincipal);
        doc.rect(0, 0, 210, altoFucsia, 'F');

        crearLogo(doc, 160, 20, EMPRESA_CONFIG.logoAncho);

        doc.setFontSize(18);
        doc.setTextColor(...COLORES.blanco);
        doc.setFont('helvetica', 'bold');
        doc.text('DETALLE DE COMPRA', 20, 18);

        doc.setFontSize(14);
        doc.text('Delicias Darsy', 20, 26);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(EMPRESA_CONFIG.subtitulo, 20, 33);

        doc.setFillColor(...COLORES.rosaClaro);
        doc.rect(0, altoFucsia, 210, altoRosaClaro, 'F');

        doc.setDrawColor(...COLORES.amarillo);
        doc.setLineWidth(2);
        doc.line(20, altoFucsia + altoRosaClaro + 5, 190, altoFucsia + altoRosaClaro + 5);
    };

    const crearInfoCompra = (doc, compra) => {
        doc.setTextColor(...COLORES.grisTexto);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Aumentar altura del rectángulo para incluir documento
        doc.setFillColor(...COLORES.grisFondo);
        doc.rect(20, 60, 170, 32, 'F'); 
        
        doc.setDrawColor(...COLORES.grisElegante);
        doc.setLineWidth(0.5);
        doc.rect(20, 60, 170, 32);

        // COLUMNA IZQUIERDA
        // Proveedor
        doc.setFont('helvetica', 'bold');
        doc.text('PROVEEDOR:', 25, 68);
        doc.setFont('helvetica', 'normal');
        const nombreProveedor = compra.proveedor || 'N/A';
        doc.text(nombreProveedor, 60, 68);

        // Documento del proveedor
        doc.setFont('helvetica', 'bold');
        doc.text('DOCUMENTO:', 25, 75);
        doc.setFont('helvetica', 'normal');
        const documentoProveedor = compra.documento_proveedor || compra.documentoProveedor || 'N/A';
        doc.text(documentoProveedor, 60, 75);

        // Fecha de compra
        doc.setFont('helvetica', 'bold');
        doc.text('FECHA COMPRA:', 25, 82);
        doc.setFont('helvetica', 'normal');
        
        let fechaCompra = compra.fecha_compra || compra.fecha || '';
        if (fechaCompra) {
            if (fechaCompra.includes('T')) {
                fechaCompra = fechaCompra.split('T')[0];
            }
            if (fechaCompra.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [year, month, day] = fechaCompra.split('-');
                fechaCompra = `${day}/${month}/${year}`;
            }
        }
        doc.text(fechaCompra || 'N/A', 60, 82);

        // COLUMNA DERECHA
        // Número de compra
        doc.setFont('helvetica', 'bold');
        doc.text('COMPRA N°:', 120, 68);
        doc.setFont('helvetica', 'normal');
        doc.text(compra.id ? compra.id.toString() : 'N/A', 148, 68);

        // Fecha de registro
        doc.setFont('helvetica', 'bold');
        doc.text('FECHA REGISTRO:', 120, 75);
        doc.setFont('helvetica', 'normal');
        
        const { fecha: fechaRegistroColombia } = obtenerFechaHoraColombia();
        doc.text(fechaRegistroColombia, 160, 75);
    };

    const crearTablaInsumos = (doc, insumos) => {
        autoTable(doc, {
            head: [['Nombre Producto', 'Cantidad', 'Unidad Medida', 'Precio unitario', 'Subtotal']],
            body: insumos.map(insumo => [
                insumo.nombre || 'N/A',
                formatearNumero(insumo.cantidad || 0),
                insumo.unidad_medida || insumo.unidad || 'Unidad',
                formatearMoneda(insumo.precio || 0),
                formatearMoneda((insumo.cantidad || 0) * (insumo.precio || 0))
            ]),
            startY: 110, // Aumentado de 100 a 110 para más espacio
            styles: {
                fillColor: COLORES.blanco,
                textColor: COLORES.grisTexto,
                fontSize: 10,
                cellPadding: 5,
                lineWidth: 0.1,
                lineColor: [220, 220, 220],
                halign: 'center'
            },
            headStyles: {
                fillColor: [240, 240, 240],
                textColor: [80, 80, 80],
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'center',
                valign: 'middle',
                cellPadding: 5
            },
            alternateRowStyles: {
                fillColor: [252, 252, 252]
            },
            columnStyles: {
                0: { halign: 'left', cellWidth: 45 },
                1: { halign: 'center', cellWidth: 25 },
                2: { halign: 'center', cellWidth: 35 },
                3: { halign: 'right', cellWidth: 35 },
                4: { halign: 'right', cellWidth: 40, fontStyle: 'bold' }
            },
            margin: { top: 15 } // Margen adicional superior
        }); 
    };

    const crearTotal = (doc, total, finalY) => {
        const totalY = finalY + 10;
        
        doc.setFillColor(...COLORES.grisElegante);
        doc.rect(130, totalY, 60, 15, 'F');
        
        doc.setDrawColor(...COLORES.amarillo);
        doc.setLineWidth(1);
        doc.rect(130, totalY, 60, 15);

        doc.setFontSize(14);
        doc.setTextColor(...COLORES.blanco);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL:', 135, totalY + 10);
        
        // Formatear total con signo de pesos y separador de miles
        const totalFormateado = formatearMoneda(total);
        doc.text(totalFormateado, 185, totalY + 10, { align: 'right' });
        
        return totalY;
    };

    const crearObservaciones = (doc, observaciones, startY) => {
        if (observaciones && observaciones.trim() !== '') {
            doc.setFontSize(11);
            doc.setTextColor(...COLORES.grisTexto);
            doc.setFont('helvetica', 'bold');
            doc.text('OBSERVACIONES:', 20, startY + 25);
            
            doc.setFont('helvetica', 'normal');
            const observacionesLines = doc.splitTextToSize(observaciones, 170);
            doc.text(observacionesLines, 20, startY + 32);
        }
    };

    const crearFooter = (doc) => {
        const pageHeight = doc.internal.pageSize.height;
        doc.setFillColor(...COLORES.rosaClaro);
        doc.rect(0, pageHeight - 20, 210, 20, 'F');

        doc.setFontSize(8);
        doc.setTextColor(...COLORES.grisTexto);
        doc.setFont('helvetica', 'normal');
        doc.text('Documento generado automáticamente - Delicias Darsy', 20, pageHeight - 10);
        
        const { fecha, hora } = obtenerFechaHoraColombia();
        doc.text(`Generado: ${fecha} - ${hora}`, 20, pageHeight - 5);

        crearLogo(doc, 180, pageHeight - 10, EMPRESA_CONFIG.logoFooterSize);
    };

    const calcularTotal = (insumos) => {
        return insumos.reduce((sum, insumo) => {
            const cantidad = insumo.cantidad || 0;
            const precio = insumo.precio || 0;
            return sum + (cantidad * precio);
        }, 0);
    };

    const generarPDFPreview = async (compra) => {
        try {
            setLoading(true);
            setError(null);

            if (!compra.insumos || compra.insumos.length === 0) {
                throw new Error('No hay insumos para generar el PDF');
            }

            const doc = new jsPDF();
            
            const compraCompleta = {
                ...compra,
                id: compra.id || Date.now().toString()
            };

            crearHeader(doc);
            crearInfoCompra(doc, compraCompleta);
            crearTablaInsumos(doc, compraCompleta.insumos);
            
            const total = calcularTotal(compraCompleta.insumos);
            const finalY = doc.previousAutoTable ? doc.previousAutoTable.finalY : 150;
            const totalY = crearTotal(doc, total, finalY);
            
            crearObservaciones(doc, compraCompleta.observaciones, totalY);
            crearFooter(doc);

            const pdfBlob = doc.output('datauristring');
            setPdfDataUrl(pdfBlob);
            
            return doc;
        } catch (error) {
            console.error('Error al generar PDF preview:', error);
            setError('Error al generar la previsualización del PDF');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            setLoading(true);
            setError(null);
            if (!compraData || !compraData.insumos || compraData.insumos.length === 0) {
                throw new Error('No hay insumos para generar el PDF');
            }
            const doc = await generarPDFPreview(compraData);
            const { fecha } = obtenerFechaHoraColombia();
            const nombreArchivo = `compra-${compraData.id || Date.now()}-${fecha.replace(/\//g, '-')}.pdf`;
            doc.save(nombreArchivo);
            if (onDownload) onDownload();
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            setError('Error al descargar el PDF');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible && compraData) {
            generarPDFPreview(compraData);
        }
    }, [visible, compraData]);

    if (!visible) return null;

    return (
        <>
            <div 
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onClick={onClose}
            >
                <div 
                    style={{
                        width: '95vw',
                        height: '90vh',
                        maxWidth: '1400px',
                        maxHeight: '850px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '20px',
                        borderBottom: '2px solid #e0e0e0',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px 8px 0 0'
                    }}>
                        <h2 style={{
                            margin: 0,
                            color: '#333',
                            fontSize: '1.5rem',
                            fontWeight: '600'
                        }}>
                            Previsualización de Compra
                        </h2>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={handleDownload}
                                disabled={loading || error}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#ee52a5',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    cursor: loading || error ? 'not-allowed' : 'pointer',
                                    opacity: loading || error ? 0.6 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                📥 Descargar
                            </button>
                            
                            <button 
                                onClick={onClose}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                ✖ Cerrar
                            </button>
                        </div>
                    </div>

                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        minHeight: '700px',
                        position: 'relative'
                    }}>
                        {loading && (
                            <div style={{
                                textAlign: 'center',
                                color: '#666'
                            }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    border: '4px solid #f3f3f3',
                                    borderTop: '4px solid #ff1493',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    margin: '0 auto 20px'
                                }}></div>
                                <p style={{ fontSize: '18px' }}>Generando previsualización...</p>
                            </div>
                        )}

                        {error && (
                            <div style={{
                                textAlign: 'center',
                                color: '#dc3545',
                                fontSize: '18px'
                            }}>
                                <p>⚠ {error}</p>
                                <button 
                                    onClick={() => generarPDFPreview(compraData)}
                                    style={{
                                        marginTop: '15px',
                                        padding: '10px 20px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '16px'
                                    }}
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}

                        {pdfDataUrl && !loading && !error && (
                            <iframe
                                src={pdfDataUrl}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    minHeight: '700px'
                                }}
                                title="Previsualización PDF"
                            />
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

export default PDFPreview;