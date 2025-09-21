// pdf.jsx
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

const COLORES = {
    rosaPrincipal: [255, 20, 147],     
    rosaClaro: [255, 182, 193],      
    amarillo: [255, 215, 0],        
    amarilloClaro: [255, 255, 224],   
    grisTexto: [64, 64, 64],        
    blanco: [255, 255, 255]
};

// Configuración de la empresa (personalizable)
const EMPRESA_CONFIG = { 
    nombre: "Delicias Darsy",
    subtitulo: 'Gestión de Compras',
    usarLogoPersonalizado: true, 
    logoURL: '/imagenes/logo-delicias-darsy.png', 
    logoFormato: 'PNG',
    logoAncho: 35,     // Aumentado de 38 a 45
    logoAlto: 25,      // Aumentado de 30 a 36
    logoFooterSize: 15 // Aumentado de 12 a 15
};

/**
 * Obtiene la fecha y hora local del servidor
 */
const obtenerFechaHoraServidor = () => {
    const ahora = new Date();
    const opciones = {
        timeZone: 'America/Bogota', // Zona horaria de Colombia
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        // hour: '2-digit',
        // minute: '2-digit',
        // second: '2-digit',
        hour12: false
    };
    
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

/**
 * @param {jsPDF} doc
 * @param {number} x 
 * @param {number} y 
 * @param {number} size 
 */
const crearLogo = (doc, x, y, size = 20) => {
    
    if (EMPRESA_CONFIG.usarLogoPersonalizado && EMPRESA_CONFIG.logoURL) {
        try {
            // Crear fondo blanco circular para el logo
            doc.setFillColor(...COLORES.blanco);
            const radioFondo = (size / 2) + 3; // Un poco más grande que el logo
            doc.circle(x, y, radioFondo, 'F');
            
            // Borde sutil para el fondo
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.circle(x, y, radioFondo, 'S');
            
            // Agregar el logo
            doc.addImage(
                EMPRESA_CONFIG.logoURL,          
                EMPRESA_CONFIG.logoFormato,      
                x - size/2,                      
                y - size/2,                      
                size,                        
                size                            
            );
            
            console.log('Logo personalizado cargado exitosamente');
            
        } catch (error) {
            console.error('Error al cargar logo personalizado:', error);
            console.log('Usando logo generado como respaldo');
            crearLogoGenerado(doc, x, y, size);
        }
        
    } else {
        crearLogoGenerado(doc, x, y, size);
    }
};

/**
 * @param {jsPDF} doc 
 * @param {number} x
 * @param {number} y 
 * @param {number} size 
 */
const crearLogoGenerado = (doc, x, y, size) => {
    // Fondo blanco circular
    doc.setFillColor(...COLORES.blanco);
    const radioFondo = (size / 2) + 3;
    doc.circle(x, y, radioFondo, 'F');
    
    // Círculo exterior rosa
    doc.setFillColor(...COLORES.rosaPrincipal);
    doc.circle(x, y, size, 'F');
    
    // Círculo interior amarillo
    doc.setFillColor(...COLORES.amarillo);
    doc.circle(x, y, size * 0.6, 'F');
    
    // Iniciales en el centro
    doc.setFontSize(size * 0.8);
    doc.setTextColor(...COLORES.blanco);
    doc.setFont('helvetica', 'bold');
    doc.text('DD', x - 4, y + 3);
};

const crearHeader = (doc) => {
    const altoFucsia = 40;
    const altoRosaClaro = 10;

    // Fondo fucsia
    doc.setFillColor(...COLORES.rosaPrincipal);
    doc.rect(0, 0, 210, altoFucsia, 'F');

    // Logo con fondo blanco - más grande
    crearLogo(doc, 160, 20, EMPRESA_CONFIG.logoAncho);

    // Texto dentro del fucsia
    doc.setFontSize(18);
    doc.setTextColor(...COLORES.blanco);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE COMPRA ', 20, 18);

    doc.setFontSize(14);
    doc.text('Delicias Darsy', 20, 26);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(EMPRESA_CONFIG.subtitulo, 20, 33);

    // Franja rosa claro
    doc.setFillColor(...COLORES.rosaClaro);
    doc.rect(0, altoFucsia, 210, altoRosaClaro, 'F');

    // Línea decorativa amarilla
    doc.setDrawColor(...COLORES.amarillo);
    doc.setLineWidth(2);
    doc.line(20, altoFucsia + altoRosaClaro + 5, 190, altoFucsia + altoRosaClaro + 5);
};

/**
 * Crea la sección de información de la compra
 * @param {jsPDF} doc
 * @param {Object} compra
 */
const crearInfoCompra = (doc, compra) => {
    doc.setTextColor(...COLORES.grisTexto);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    // Caja de información
    doc.setFillColor(...COLORES.amarilloClaro);
    doc.rect(20, 60, 170, 25, 'F'); 
    
    doc.setDrawColor(...COLORES.amarillo);
    doc.setLineWidth(0.5);
    doc.rect(20, 60, 170, 25);

    // Información del proveedor y fecha
    doc.setFont('helvetica', 'bold');
    doc.text('PROVEEDOR:', 25, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(compra.proveedor || 'N/A', 65, 70);

    doc.setFont('helvetica', 'bold');
    doc.text('FECHA DE COMPRA:  ', 25, 77);
    doc.setFont('helvetica', 'normal');
    doc.text(compra.fecha_compra || compra.fecha || 'N/A', 75, 77);

    // Número de compra
    doc.setFont('helvetica', 'bold');
    doc.text('COMPRA N°:', 130, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(compra.id ? compra.id.toString() : 'N/A', 165, 70);

    // Fecha de registro con hora del servidor
    const { fecha, hora } = obtenerFechaHoraServidor();
    doc.setFont('helvetica', 'bold');
    doc.text('FECHA REGISTRO:  ', 130, 77);
    doc.setFont('helvetica', 'normal');
    doc.text(compra.fecha_registro || fecha, 165, 77);
};

/**
 * Crea la tabla de insumos con el diseño solicitado
 * @param {jsPDF} doc 
 * @param {Array} insumos 
 */
const crearTablaInsumos = (doc, insumos) => {
    
    autoTable(doc, {
        head: [['Nombre Producto', 'Cantidad', 'Unidad Medida', 'Precio unitario', 'Subtotal']],
        body: insumos.map(insumo => [
            insumo.nombre || 'N/A',
            insumo.cantidad || 0,
            insumo.unidad_medida || 'Unidad',
            `$${(insumo.precio || 0).toFixed(2)}`,
            `$${((insumo.cantidad || 0) * (insumo.precio || 0)).toFixed(2)}`,
            'Ver'
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
            fillColor: [240, 240, 240], // Gris claro como en la imagen
            textColor: [80, 80, 80],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle'
        },
        alternateRowStyles: {
            fillColor: [248, 248, 248] // Alternancia muy sutil
        },
        columnStyles: {
            0: { halign: 'left', cellWidth: 42 },      // Nombre Producto
            1: { halign: 'center', cellWidth: 25 },    // Cantidad  
            2: { halign: 'center', cellWidth: 40 },    // Unidad Medida
            3: { halign: 'right', cellWidth: 25 },     // Precio unitario
            4: { halign: 'right', cellWidth: 45, fontStyle: 'bold' }, // Subtotal
        },
        // tableLineColor: [220, 220, 220],
        // tableLineWidth: 0.1,
        // margin: { left: 20, right: 20 }
    }); 
};

/**
 * Crea la sección del total
 * @param {jsPDF} doc 
 * @param {number} total
 * @param {number} finalY 
 */
const crearTotal = (doc, total, finalY) => {
    // Caja del total
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

/**
 * @param {jsPDF} doc 
 * @param {string} observaciones 
 * @param {number} startY 
 */
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

/**
 * Crea el footer del PDF con logo de Delicias Darsy
 * @param {jsPDF} doc - Instancia de jsPDF
 */
const crearFooter = (doc) => {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(...COLORES.rosaClaro);
    doc.rect(0, pageHeight - 20, 210, 20, 'F');

    doc.setFontSize(8);
    doc.setTextColor(...COLORES.grisTexto);
    doc.setFont('helvetica', 'normal');
    doc.text('Documento generado automáticamente - Delicias Darsy', 20, pageHeight - 10);
    
    // Usar fecha y hora del servidor con formato organizado
    const { fecha, hora } = obtenerFechaHoraServidor();
    doc.text(`Fecha: ${fecha} - ${hora}`, 20, pageHeight - 5);

    // Logo más pequeño y proporcional en el footer con fondo blanco
    crearLogo(doc, 180, pageHeight - 10, EMPRESA_CONFIG.logoFooterSize);
};

/**
 * @returns {string} ID único
 */
const generarIdCompra = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Calcula el total de la compra
 * @param {Array} insumos - Array de insumos
 * @returns {number} Total calculado
 */
const calcularTotal = (insumos) => {
    return insumos.reduce((sum, insumo) => {
        const cantidad = insumo.cantidad || 0;
        const precio = insumo.precio || 0;
        return sum + (cantidad * precio);
    }, 0);
};

/**
 * Función principal para generar el PDF
 * @param {Object} compra - Datos de la compra
 */
export const generarPDFCompra = (compra) => {
    try {
        // Validar que existan insumos
        if (!compra.insumos || compra.insumos.length === 0) {
            throw new Error('No hay insumos para generar el PDF');
        }

        const doc = new jsPDF();
        
        // Asegurar que la compra tenga un ID
        const compraCompleta = {
            ...compra,
            id: compra.id || generarIdCompra()
        };

        // Crear todas las secciones del PDF
        crearHeader(doc);
        crearInfoCompra(doc, compraCompleta);
        crearTablaInsumos(doc, compraCompleta.insumos);
        
        const total = calcularTotal(compraCompleta.insumos);
        
        // Obtener la posición Y final de la tabla
        const finalY = doc.previousAutoTable ? doc.previousAutoTable.finalY : 150;
        const totalY = crearTotal(doc, total, finalY);
        
        crearObservaciones(doc, compraCompleta.observaciones, totalY);
        crearFooter(doc);

        // Generar nombre del archivo
        const { fecha } = obtenerFechaHoraServidor();
        const nombreArchivo = `compra-${compraCompleta.id}-${fecha.replace(/\//g, '-')}.pdf`;

        // Guardar el PDF
        doc.save(nombreArchivo);
        
        return true;
    } catch (error) {
        console.error('Error al generar PDF:', error);
        throw error;
    }
};

/**
 * @param {Object} config
 */
export const configurarEmpresa = (config) => {
    Object.assign(EMPRESA_CONFIG, config);
};

/**
 * @param {string} logoURL 
 * @param {string} formato 
 * @param {number} ancho 
 * @param {number} alto 
 */
export const configurarLogo = (logoURL, formato = 'PNG', ancho = 12, alto = 12) => {
    EMPRESA_CONFIG.usarLogoPersonalizado = true;
    EMPRESA_CONFIG.logoURL = logoURL;
    EMPRESA_CONFIG.logoFormato = formato;
    EMPRESA_CONFIG.logoAncho = ancho;
    EMPRESA_CONFIG.logoAlto = alto;


};



export default generarPDFCompra;