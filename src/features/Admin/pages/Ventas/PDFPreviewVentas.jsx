import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    subtitulo: 'Gestión de Ventas',
    usarLogoPersonalizado: true, 
    logoURL: '/imagenes/logo-delicias-darsy.png', 
    logoFormato: 'PNG',
    logoAncho: 35,
    logoAlto: 25,
    logoFooterSize: 15
};

const PDFPreviewVentas = ({ visible, onClose, ventaData, onDownload }) => {
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función para obtener fecha y hora de Colombia
    const obtenerFechaHoraColombia = () => {
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
        doc.text('DETALLE DE VENTA', 20, 18);

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

    const crearInfoVenta = (doc, venta) => {
        doc.setTextColor(...COLORES.grisTexto);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Caja de información
        doc.setFillColor(...COLORES.grisFondo);
        doc.rect(20, 60, 170, 40, 'F'); 
        
        doc.setDrawColor(...COLORES.grisElegante);
        doc.setLineWidth(0.5);
        doc.rect(20, 60, 170, 40);

        // COLUMNA IZQUIERDA
        // Cliente
        doc.setFont('helvetica', 'bold');
        doc.text('CLIENTE:', 25, 68);
        doc.setFont('helvetica', 'normal');
        const nombreCliente = venta.nombreCliente || venta.cliente || 'N/A';
        doc.text(nombreCliente, 55, 68);

        // Sede
        doc.setFont('helvetica', 'bold');
        doc.text('SEDE:', 25, 75);
        doc.setFont('helvetica', 'normal');
        doc.text(venta.nombreSede || venta.sede || 'N/A', 55, 75);

        // Tipo de venta
        doc.setFont('helvetica', 'bold');
        doc.text('TIPO VENTA:', 25, 82);
        doc.setFont('helvetica', 'normal');
        const tipoVenta = venta.tipoVenta === 'directa' ? 'Venta Directa' : 'Pedido';
        doc.text(tipoVenta, 55, 82);

        // Fecha de venta
        doc.setFont('helvetica', 'bold');
        doc.text('FECHA VENTA:', 25, 89);
        doc.setFont('helvetica', 'normal');
        
        let fechaVenta = venta.fechaVenta || venta.fecha_venta || '';
        if (fechaVenta) {
            if (fechaVenta.includes('T')) {
                fechaVenta = fechaVenta.split('T')[0];
            }
            if (fechaVenta.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [year, month, day] = fechaVenta.split('-');
                fechaVenta = `${day}/${month}/${year}`;
            }
        }
        doc.text(fechaVenta || 'N/A', 60, 89);

        // COLUMNA DERECHA
        // Número de venta
        doc.setFont('helvetica', 'bold');
        doc.text('VENTA N°:', 120, 68);
        doc.setFont('helvetica', 'normal');
        doc.text(venta.idVenta ? venta.idVenta.toString() : 'N/A', 150, 68);

        // Método de pago
        doc.setFont('helvetica', 'bold');
        doc.text('MÉTODO PAGO:', 120, 75);
        doc.setFont('helvetica', 'normal');
        doc.text(venta.metodoPago || 'N/A', 160, 75);

        // Estado
        doc.setFont('helvetica', 'bold');
        doc.text('ESTADO:', 120, 82);
        doc.setFont('helvetica', 'normal');
        doc.text(venta.nombreEstado || 'N/A', 145, 82);

        // Fecha de registro
        const { fecha: fechaRegistroColombia } = obtenerFechaHoraColombia();
        doc.setFont('helvetica', 'bold');
        doc.text('FECHA REGISTRO:', 120, 89);
        doc.setFont('helvetica', 'normal');
        doc.text(fechaRegistroColombia, 165, 89);

        // Fecha de entrega (solo para pedidos)
        if (venta.tipoVenta === 'pedido' && venta.fechaEntrega) {
            doc.setFont('helvetica', 'bold');
            doc.text('FECHA ENTREGA:', 25, 96);
            doc.setFont('helvetica', 'normal');
            
            let fechaEntrega = venta.fechaEntrega;
            if (fechaEntrega.includes('T')) {
                fechaEntrega = fechaEntrega.split('T')[0];
            }
            if (fechaEntrega.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [year, month, day] = fechaEntrega.split('-');
                fechaEntrega = `${day}/${month}/${year}`;
            }
            doc.text(fechaEntrega, 60, 96);
        }
    };

    const crearTablaProductos = (doc, productos) => {
        const startY = ventaData.tipoVenta === 'pedido' && ventaData.fechaEntrega ? 108 : 108;
        
        autoTable(doc, {
            head: [['Producto', 'Cantidad', 'Precio Unit.', 'Subtotal']],
            body: productos.map(producto => [
                producto.nombreProducto || producto.nombre || `ID: ${producto.idproductogeneral}` || 'N/A',
                formatearNumero(producto.cantidad || 0),
                formatearMoneda(producto.precioUnitario || producto.precio || 0),
                formatearMoneda(producto.subtotal || ((producto.cantidad || 0) * (producto.precioUnitario || producto.precio || 0)))
            ]),
            startY: startY,
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
                0: { halign: 'left', cellWidth: 70 },
                1: { halign: 'center', cellWidth: 30 },
                2: { halign: 'right', cellWidth: 40 },
                3: { halign: 'right', cellWidth: 40, fontStyle: 'bold' }
            },
            margin: { top: 15 }
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
        
        const totalFormateado = formatearMoneda(total);
        doc.text(totalFormateado, 185, totalY + 10, { align: 'right' });
        
        return totalY;
    };

    const crearSeccionAbonos = (doc, abonos, startY) => {
        if (!abonos || abonos.length === 0) return startY;

        const abonosActivos = abonos.filter(abono => !abono.anulado);
        if (abonosActivos.length === 0) return startY;

        // Título de sección
        doc.setFontSize(12);
        doc.setTextColor(...COLORES.grisTexto);
        doc.setFont('helvetica', 'bold');
        doc.text('ABONOS REALIZADOS:', 20, startY + 20);

        // Tabla de abonos
        autoTable(doc, {
            head: [['Fecha', 'Monto', 'Método de Pago']],
            body: abonosActivos.map(abono => {
                let fechaAbono = abono.fecha || abono.fechaAbono || '';
                if (fechaAbono.includes('T')) {
                    fechaAbono = fechaAbono.split('T')[0];
                }
                if (fechaAbono.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const [year, month, day] = fechaAbono.split('-');
                    fechaAbono = `${day}/${month}/${year}`;
                }

                return [
                    fechaAbono,
                    formatearMoneda(abono.monto || abono.totalPagado || 0),
                    abono.metodoPago || 'N/A'
                ];
            }),
            startY: startY + 25,
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
                halign: 'center'
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 50 },
                1: { halign: 'right', cellWidth: 50, fontStyle: 'bold' },
                2: { halign: 'center', cellWidth: 70 }
            }
        });

        return doc.previousAutoTable.finalY;
    };

    const crearResumenPago = (doc, total, abonos, startY) => {
        if (!abonos || abonos.length === 0) return;

        const abonosActivos = abonos.filter(abono => !abono.anulado);
        const totalAbonado = abonosActivos.reduce((sum, abono) => 
            sum + parseFloat(abono.monto || abono.totalPagado || 0), 0
        );
        const saldoPendiente = total - totalAbonado;

        const resumenY = startY + 10;

        // Caja de total abonado
        doc.setFillColor(46, 125, 50); // Verde
        doc.rect(20, resumenY, 80, 12, 'F');
        doc.setDrawColor(...COLORES.amarillo);
        doc.setLineWidth(0.8);
        doc.rect(20, resumenY, 80, 12);

        doc.setFontSize(11);
        doc.setTextColor(...COLORES.blanco);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL ABONADO:', 25, resumenY + 8);
        doc.text(formatearMoneda(totalAbonado), 95, resumenY + 8, { align: 'right' });

        // Caja de saldo pendiente
        doc.setFillColor(211, 47, 47); // Rojo
        doc.rect(110, resumenY, 80, 12, 'F');
        doc.setDrawColor(...COLORES.amarillo);
        doc.rect(110, resumenY, 80, 12);

        doc.text('SALDO PENDIENTE:', 115, resumenY + 8);
        doc.text(formatearMoneda(saldoPendiente), 185, resumenY + 8, { align: 'right' });
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

    const generarPDFPreview = async (venta) => {
        try {
            setLoading(true);
            setError(null);

            if (!venta.detalleVenta || venta.detalleVenta.length === 0) {
                throw new Error('No hay productos para generar el PDF');
            }

            const doc = new jsPDF();
            
            const ventaCompleta = {
                ...venta,
                idVenta: venta.idVenta || Date.now().toString()
            };

            crearHeader(doc);
            crearInfoVenta(doc, ventaCompleta);
            crearTablaProductos(doc, ventaCompleta.detalleVenta);
            
            const total = ventaCompleta.total || 0;
            const finalY = doc.previousAutoTable ? doc.previousAutoTable.finalY : 150;
            const totalY = crearTotal(doc, total, finalY);
            
            // Crear sección de abonos si existen
            let abonosY = totalY;
            if (ventaCompleta.abonos && ventaCompleta.abonos.length > 0) {
                abonosY = crearSeccionAbonos(doc, ventaCompleta.abonos, totalY);
                crearResumenPago(doc, total, ventaCompleta.abonos, abonosY);
            }
            
            crearObservaciones(doc, ventaCompleta.observaciones, abonosY);
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
            if (!ventaData || !ventaData.detalleVenta || ventaData.detalleVenta.length === 0) {
                throw new Error('No hay productos para generar el PDF');
            }
            const doc = await generarPDFPreview(ventaData);
            const { fecha } = obtenerFechaHoraColombia();
            const nombreArchivo = `venta-${ventaData.idVenta || Date.now()}-${fecha.replace(/\//g, '-')}.pdf`;
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
        if (visible && ventaData) {
            generarPDFPreview(ventaData);
        }
    }, [visible, ventaData]);

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
                            Previsualización de Venta
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
                                    onClick={() => generarPDFPreview(ventaData)}
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

export default PDFPreviewVentas;