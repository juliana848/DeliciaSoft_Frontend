const compraValidationService = {
    async validarAnulacionCompra(idCompra) {
        try {
            const compra = await this.obtenerCompraConDetalles(idCompra);
            
            console.log('Compra obtenida:', compra);
            console.log('Detalles de compra:', compra.detalles);
            
            // Si NO tiene insumos, SÍ puede anular
            if (!compra || !compra.detalles || compra.detalles.length === 0) {
                return {
                    puedeAnular: true,
                    mensaje: 'La compra puede ser anulada (sin insumos)',
                    detalles: []
                };
            }

            const validaciones = [];
            let tieneProblemas = false;

            for (const detalle of compra.detalles) {
                const idInsumo = detalle.idinsumos || detalle.idInsumo || detalle.idinsumo;
                const cantidad = parseFloat(detalle.cantidad) || 0;
                
                console.log('Validando insumo:', idInsumo, 'Cantidad:', cantidad);
                
                const validacion = await this.validarInsumoParaAnulacion(idInsumo, cantidad);
                
                validaciones.push(validacion);
                
                if (!validacion.puedeAnular) {
                    tieneProblemas = true;
                }
            }

            // Si hay problemas (insumos en uso), NO puede anular
            if (tieneProblemas) {
                return {
                    puedeAnular: false,
                    mensaje: 'No se puede anular la compra porque algunos insumos están siendo usados en producción',
                    detalles: validaciones
                };
            }

            // Si no hay problemas, SÍ puede anular
            return {
                puedeAnular: true,
                mensaje: 'La compra puede ser anulada',
                detalles: validaciones
            };

        } catch (error) {
            console.error('Error al validar anulación:', error);
            throw new Error('Error al validar la anulación de la compra');
        }
    },

    async validarInsumoParaAnulacion(idInsumo, cantidadCompra) {
        try {
            const response = await fetch(
                `https://deliciasoft-backend-i6g9.onrender.com/api/insumos/${idInsumo}`
            );
            const insumo = await response.json();

            const usoEnProduccion = await this.obtenerUsoEnProduccion(idInsumo);

            const stockActual = parseFloat(insumo.cantidad) || 0;
            const stockDespuesAnulacion = stockActual - cantidadCompra;

            // LÓGICA: Si después de anular, el stock es suficiente para producción
            const puedeAnular = stockDespuesAnulacion >= usoEnProduccion.totalUsado;

            let razon = '';
            if (!puedeAnular) {
                razon = `Stock insuficiente. Actual: ${stockActual}, después de anular: ${stockDespuesAnulacion}, necesario en producción: ${usoEnProduccion.totalUsado}`;
            }

            return {
                idInsumo,
                nombreInsumo: insumo.nombreinsumo || insumo.nombreInsumo,
                stockActual,
                cantidadCompra,
                stockDespuesAnulacion,
                usoEnProduccion: usoEnProduccion.totalUsado,
                produccionesAfectadas: usoEnProduccion.producciones,
                puedeAnular,
                razon
            };

        } catch (error) {
            console.error(`Error al validar insumo ${idInsumo}:`, error);
            throw error;
        }
    },

    async obtenerUsoEnProduccion(idInsumo) {
        try {
            const response = await fetch(
                'https://deliciasoft-backend-i6g9.onrender.com/api/produccion'
            );
            const producciones = await response.json();

            const produccionesActivas = producciones.filter(p => 
                p.estado === true || 
                p.estado === 'En proceso' || 
                p.estado === 'Pendiente'
            );

            let totalUsado = 0;
            const produccionesAfectadas = [];

            for (const produccion of produccionesActivas) {
                const detalles = await this.obtenerDetallesProduccion(produccion.id || produccion.idproduccion);
                
                const usoInsumo = detalles.find(d => {
                    const id = d.idinsumo || d.idInsumo || d.idinsumos;
                    return id === idInsumo;
                });

                if (usoInsumo) {
                    const cantidad = parseFloat(usoInsumo.cantidad) || 0;
                    totalUsado += cantidad;
                    
                    produccionesAfectadas.push({
                        idProduccion: produccion.id || produccion.idproduccion,
                        fechaProduccion: produccion.fechaProduccion || produccion.fechaproduccion,
                        cantidad: cantidad,
                        estado: produccion.estado
                    });
                }
            }

            return {
                totalUsado,
                producciones: produccionesAfectadas
            };

        } catch (error) {
            console.error('Error al obtener uso en producción:', error);
            return {
                totalUsado: 0,
                producciones: []
            };
        }
    },

    async obtenerDetallesProduccion(idProduccion) {
        try {
            const response = await fetch(
                `https://deliciasoft-backend-i6g9.onrender.com/api/produccion/${idProduccion}/detalles`
            );
            return await response.json();
        } catch (error) {
            console.error(`Error al obtener detalles de producción ${idProduccion}:`, error);
            return [];
        }
    },

    async obtenerCompraConDetalles(idCompra) {
        try {
            const response = await fetch(
                `https://deliciasoft-backend-i6g9.onrender.com/api/compra/${idCompra}`
            );
            const compra = await response.json();
            
            return {
                ...compra,
                detalles: compra.detallecompra || compra.detalles || compra.DetalleCompras || []
            };
        } catch (error) {
            console.error(`Error al obtener compra ${idCompra}:`, error);
            throw error;
        }
    }
};

export default compraValidationService;