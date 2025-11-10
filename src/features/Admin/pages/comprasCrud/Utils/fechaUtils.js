// utils/fechaUtils.js

/**
 * Obtiene la fecha actual de Colombia (zona horaria America/Bogota)
 * @param {boolean} soloFecha - Si true, retorna solo YYYY-MM-DD
 * @returns {string} - Fecha en formato ISO o YYYY-MM-DD
 */
export const obtenerFechaColombia = (soloFecha = true) => {
    try {
        // Crear fecha en zona horaria de Colombia
        const fechaColombia = new Date().toLocaleString('en-US', {
            timeZone: 'America/Bogota',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        // Convertir a formato YYYY-MM-DD
        const [fecha, hora] = fechaColombia.split(', ');
        const [mes, dia, año] = fecha.split('/');
        
        if (soloFecha) {
            return `${año}-${mes}-${dia}`;
        }
        
        return `${año}-${mes}-${dia}T${hora}`;
    } catch (error) {
        console.error('Error al obtener fecha de Colombia:', error);
        // Fallback a fecha local
        return new Date().toISOString().split('T')[0];
    }
};

/**
 * Obtiene la fecha y hora actual de Colombia como objeto Date
 * @returns {Date}
 */
export const obtenerDateColombia = () => {
    const fechaStr = obtenerFechaColombia(false);
    return new Date(fechaStr);
};

/**
 * Formatea una fecha al formato colombiano DD/MM/YYYY
 * @param {string|Date} fecha 
 * @returns {string}
 */
export const formatearFechaColombia = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

/**
 * Valida que una fecha no sea mayor a la fecha actual de Colombia
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {boolean}
 */
export const esFechaValidaColombia = (fecha) => {
    const fechaIngresada = new Date(fecha + 'T00:00:00');
    const fechaActualColombia = new Date(obtenerFechaColombia(false));
    
    // Normalizar a medianoche para comparar solo fechas
    fechaActualColombia.setHours(23, 59, 59, 999);
    
    return fechaIngresada <= fechaActualColombia;
};