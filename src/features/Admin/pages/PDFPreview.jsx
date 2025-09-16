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
    blanco: [255, 255, 255]
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

    // Función para obtener fecha y hora del servidor
    const obtenerFechaHoraServidor = () => {
        const ahora = new Date();
        const fecha = ahora.toLocaleDateString('es-CO', {
            timeZone: 'America/Bogota',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        
        const hora = ahora.toLocaleTimeString('es-CO', {
            timeZone: 'America/Bogota',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        return { fecha, hora };
    };

    // Función para crear el logo
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
        doc.text('DETALLE DE COMPRA ', 20, 18);

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
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        doc.setFillColor(...COLORES.amarilloClaro);
        doc.rect(20, 60, 170, 25, 'F'); 
        
        doc.setDrawColor(...COLORES.amarillo);
        doc.setLineWidth(0.5);
        doc.rect(20, 60, 170, 25);

        doc.setFont('helvetica', 'bold');
        doc.text('PROVEEDOR:', 25, 70);
        doc.setFont('helvetica', 'normal');
        doc.text(compra.proveedor || 'N/A', 65, 70);

        doc.setFont('helvetica', 'bold');
        doc.text('FECHA DE COMPRA:', 25, 77);
        doc.setFont('helvetica', 'normal');
        doc.text(compra.fecha_compra || compra.fecha || 'N/A', 75, 77);

        doc.setFont('helvetica', 'bold');
        doc.text('COMPRA N°:', 130, 70);
        doc.setFont('helvetica', 'normal');
        doc.text(compra.id ? compra.id.toString() : 'N/A', 165, 70);

        const { fecha } = obtenerFechaHoraServidor();
        doc.setFont('helvetica', 'bold');
        doc.text('FECHA REGISTRO:', 130, 77);
        doc.setFont('helvetica', 'normal');
        doc.text(compra.fecha_registro || fecha, 165, 77);
    };

    const crearTablaInsumos = (doc, insumos) => {
        autoTable(doc, {
            head: [['Nombre Producto', 'Cantidad', 'Unidad Medida', 'Precio unitario', 'Subtotal']],
            body: insumos.map(insumo => [
                insumo.nombre || 'N/A',
                insumo.cantidad || 0,
                insumo.unidad_medida || insumo.unidad || 'Unidad',
                `$${(insumo.precio || 0).toFixed(2)}`,
                `$${((insumo.cantidad || 0) * (insumo.precio || 0)).toFixed(2)}`
            ]),
            startY: 95, 
            styles: {
                fillColor: COLORES.blanco,
                textColor: COLORES.grisTexto,
                fontSize: 9,
                cellPadding: 4,
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
                valign: 'middle'
            },
            alternateRowStyles: {
                fillColor: [248, 248, 248]
            },
            columnStyles: {
                0: { halign: 'left', cellWidth: 42 },
                1: { halign: 'center', cellWidth: 25 },
                2: { halign: 'center', cellWidth: 40 },
                3: { halign: 'right', cellWidth: 25 },
                4: { halign: 'right', cellWidth: 45, fontStyle: 'bold' }
            }
        }); 
    };

    const crearTotal = (doc, total, finalY) => {
        const totalY = finalY + 10;
        doc.setFillColor(...COLORES.rosaPrincipal);
        doc.rect(130, totalY, 60, 15, 'F');
        
        doc.setDrawColor(...COLORES.amarillo);
        doc.setLineWidth(1);
        doc.rect(130, totalY, 60, 15);

        doc.setFontSize(14);
        doc.setTextColor(...COLORES.blanco);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL:', 135, totalY + 7);
        doc.text(`$${total.toFixed(2)}`, 165, totalY + 7);
        
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
        
        const { fecha, hora } = obtenerFechaHoraServidor();
        doc.text(`Fecha: ${fecha} - ${hora}`, 20, pageHeight - 5);

        crearLogo(doc, 180, pageHeight - 10, EMPRESA_CONFIG.logoFooterSize);
    };

    const calcularTotal = (insumos) => {
        return insumos.reduce((sum, insumo) => {
            const cantidad = insumo.cantidad || 0;
            const precio = insumo.precio || 0;
            return sum + (cantidad * precio);
        }, 0);
    };

    // Generar PDF para previsualización
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

            // Convertir a data URL para previsualización
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

    // Función para descargar el PDF
    const handleDownload = () => {
        if (onDownload) {
            onDownload();
        } else {
            // Fallback: generar y descargar directamente
            try {
                const doc = new jsPDF();
                // Repetir la lógica de generación
                crearHeader(doc);
                crearInfoCompra(doc, compraData);
                crearTablaInsumos(doc, compraData.insumos);
                
                const total = calcularTotal(compraData.insumos);
                const finalY = doc.previousAutoTable ? doc.previousAutoTable.finalY : 150;
                const totalY = crearTotal(doc, total, finalY);
                
                crearObservaciones(doc, compraData.observaciones, totalY);
                crearFooter(doc);

                const { fecha } = obtenerFechaHoraServidor();
                const nombreArchivo = `compra-${compraData.id}-${fecha.replace(/\//g, '-')}.pdf`;
                doc.save(nombreArchivo);
            } catch (error) {
                console.error('Error al descargar PDF:', error);
            }
        }
    };

    // Generar PDF cuando se abre el modal
    useEffect(() => {
        if (visible && compraData) {
            generarPDFPreview(compraData);
        }
    }, [visible, compraData]);

    if (!visible) return null;

    return (
        <Modal visible={visible} onClose={onClose} className="pdf-preview-modal">
            <div className="pdf-preview-container">
                {/* Header con botones */}
                <div className="pdf-preview-header">
                    <h2 className="pdf-preview-title">Previsualización de Compra</h2>
                    <div className="pdf-preview-buttons">
                        <button 
                            className="pdf-btn download-btn"
                            onClick={handleDownload}
                            disabled={loading || error}
                        >
                            📥 Descargar
                        </button>
                        <button 
                            className="pdf-btn close-btn"
                            onClick={onClose}
                        >
                            ✖ Cerrar
                        </button>
                    </div>
                </div>

                {/* Contenido del PDF */}
                <div className="pdf-preview-content">
                    {loading && (
                        <div className="pdf-loading">
                            <div className="pdf-spinner"></div>
                            <p>Generando previsualización...</p>
                        </div>
                    )}

                    {error && (
                        <div className="pdf-error">
                            <p>❌ {error}</p>
                            <button onClick={() => generarPDFPreview(compraData)}>
                                Reintentar
                            </button>
                        </div>
                    )}

                    {pdfDataUrl && !loading && !error && (
                        <iframe
                            src={pdfDataUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 'none' }}
                            title="Previsualización PDF"
                        />
                    )}
                </div>
            </div>

            <style jsx>{`
                .pdf-preview-modal {
                    width: 90vw;
                    height: 90vh;
                    max-width: 1200px;
                    max-height: 800px;
                }

                .pdf-preview-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .pdf-preview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    border-bottom: 2px solid #e0e0e0;
                    background-color: #f8f9fa;
                }

                .pdf-preview-title {
                    margin: 0;
                    color: #333;
                    font-size: 1.2rem;
                    font-weight: 600;
                }

                .pdf-preview-buttons {
                    display: flex;
                    gap: 0.5rem;
                }

                .pdf-btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 4px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                }

                .download-btn {
                    background-color: #ee52a5ff;
                    color: white;
                }

                .download-btn:hover:not(:disabled) {
                    background-color: #ee90cbff;
                }

                .close-btn {
                    background-color: #6c757d;
                    color: white;
                }

                .close-btn:hover {
                    background-color: #5a6268;
                }

                .pdf-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .pdf-preview-content {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    background-color: #f5f5f5;
                }

                .pdf-loading {
                    text-align: center;
                    color: #666;
                }

                .pdf-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #ff1493;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }

                .pdf-error {
                    text-align: center;
                    color: #dc3545;
                }

                .pdf-error button {
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .pdf-preview-modal {
                        width: 95vw;
                        height: 95vh;
                    }

                    .pdf-preview-header {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .pdf-preview-title {
                        font-size: 1rem;
                    }
                }
            `}</style>
        </Modal>
    );
};

export default PDFPreview;