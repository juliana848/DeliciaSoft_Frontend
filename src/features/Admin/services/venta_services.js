// venta_services.js - ACTUALIZADO con soporte para sedes dinámicas
const API_BASE_URL = 'https://deliciasoft-backend-i6g9.onrender.com/api';

class VentaApiService {
    // Cache para las sedes obtenidas de la API
    constructor() {
        this.sedesCache = null;
        this.cacheExpiry = null;
        this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutos
    }

    // Función para obtener sedes desde la API con cache
    async obtenerSedes() {
        try {
            // Verificar si el cache es válido
            if (this.sedesCache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
                return this.sedesCache;
            }

            console.log('Obteniendo sedes desde API...');
            const response = await fetch(`${API_BASE_URL}/sede`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const sedes = await response.json();
            console.log('Sedes obtenidas:', sedes);

            // Filtrar solo sedes activas y guardar en cache
            const sedesActivas = sedes.filter(sede => sede.estado === true);
            this.sedesCache = sedesActivas;
            this.cacheExpiry = Date.now() + this.CACHE_DURATION;

            return sedesActivas;
        } catch (error) {
            console.error('Error al obtener sedes:', error);
            
            // Sedes de fallback si falla la API
            const fallbackSedes = [
                { idsede: 1, nombre: 'San Pablo' },
                { idsede: 2, nombre: 'San Benito' }
            ];
            
            // Si no hay cache válido, usar fallback
            if (!this.sedesCache) {
                this.sedesCache = fallbackSedes;
            }
            
            return this.sedesCache;
        }
    }

    // Obtener ID de sede por nombre (dinámico)
    async obtenerIdSede(nombreSede) {
        try {
            const sedes = await this.obtenerSedes();
            const sede = sedes.find(s => s.nombre === nombreSede);
            
            if (sede) {
                console.log(`Sede encontrada: ${nombreSede} -> ID: ${sede.idsede}`);
                return sede.idsede;
            }
            
            // Si no se encuentra, usar mapeo por defecto
            console.warn(`Sede '${nombreSede}' no encontrada, usando mapeo por defecto`);
            const sedesDefault = {
                'San Pablo': 1,
                'San Benito': 2
            };
            return sedesDefault[nombreSede] || 1;
        } catch (error) {
            console.error('Error al obtener ID de sede:', error);
            // Fallback al mapeo hardcodeado
            const sedesDefault = {
                'San Pablo': 1,
                'San Benito': 2
            };
            return sedesDefault[nombreSede] || 1;
        }
    }

    // Obtener estado según tipo de venta
    obtenerEstadoSegunTipo(tipoVenta) {
        if (tipoVenta === 'venta directa' || tipoVenta === 'directa') {
            return 5; 
        } else if (tipoVenta === 'pedido') {
            return 1; 
        }
        return 5; 
    }

    // FUNCIÓN PARA FORMATEAR FECHA CORRECTAMENTE
    formatearFecha(fecha) {
        try {
            if (fecha instanceof Date) {
                return fecha.toISOString();
            }
            
            if (typeof fecha === 'string') {
                if (fecha.includes('T') && fecha.includes('Z')) {
                    return fecha;
                }
                
                if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    return `${fecha}T00:00:00.000Z`;
                }
                
                const dateObj = new Date(fecha);
                if (isNaN(dateObj.getTime())) {
                    throw new Error('Fecha inválida');
                }
                return dateObj.toISOString();
            }
            
            console.warn('Fecha no reconocida, usando fecha actual:', fecha);
            return new Date().toISOString();
            
        } catch (error) {
            console.error('Error al formatear fecha:', error, 'Fecha original:', fecha);
            return new Date().toISOString();
        }
    }

    transformarVentaDesdeAPI(ventaApi) {
        if (!ventaApi) return null;
        return {
            idVenta: ventaApi.idventa,
            fechaVenta: ventaApi.fechaventa,
            total: parseFloat(ventaApi.total || 0),
            metodoPago: ventaApi.metodopago,
            tipoVenta: ventaApi.tipoventa,
            idEstadoVenta: ventaApi.idestadoventa,
            nombreEstado: ventaApi.nombreEstado,
            nombreCliente: ventaApi.nombreCliente,
            nombreSede: ventaApi.nombreSede,
        };
    }

    transformarVentaCompletaDesdeAPI(ventaApi) {
        if (!ventaApi) return null;
        
        let subtotal = 0;
        let iva = 0;
        if (ventaApi.detalleventa && ventaApi.detalleventa.length > 0) {
            subtotal = ventaApi.detalleventa.reduce((acc, item) => acc + parseFloat(item.subtotal || 0), 0);
            iva = ventaApi.detalleventa.reduce((acc, item) => acc + parseFloat(item.iva || 0), 0);
        }
        
        return {
            idVenta: ventaApi.idventa,
            fechaVenta: ventaApi.fechaventa,
            nombreCliente: ventaApi.clienteData ? `${ventaApi.clienteData.nombre} ${ventaApi.clienteData.apellido}` : 'N/A',
            nombreSede: ventaApi.sede ? ventaApi.sede.nombre : 'N/A',
            metodoPago: ventaApi.metodopago,
            tipoVenta: ventaApi.tipoventa,
            idEstadoVenta: ventaApi.estadoVentaId,
            nombreEstado: ventaApi.estadoVenta?.nombre_estado || 'N/A',
            total: parseFloat(ventaApi.total),
            subtotal: subtotal,
            iva: iva,
            detalleVenta: this.transformarDetalleVentaDesdeAPI(ventaApi.detalleventa),
            abonos: this.transformarAbonosDesdeAPI(ventaApi.abonos)
        };
    }

    transformarDetalleVentaDesdeAPI(detalleApi) {
        if (!detalleApi || !Array.isArray(detalleApi)) return [];
        
        return detalleApi.map(item => ({
            iddetalleventa: item.iddetalleventa,
            idventa: item.idventa,
            idproductogeneral: item.idproductogeneral,
            cantidad: item.cantidad,
            nombreProducto: item.productogeneral?.nombre || 'Producto N/A',
            precioUnitario: parseFloat(item.preciounitario || 0),
            subtotal: parseFloat(item.subtotal || 0),
            iva: parseFloat(item.iva || 0),
            adiciones: item.detalleadiciones?.map(da => ({
                id: da.catalogoadiciones?.idadiciones || da.idadiciones,
                nombre: da.catalogoadiciones?.nombre || 'Adición N/A',
                precio: parseFloat(da.catalogoadiciones?.precio || 0),
                cantidad: da.cantidadadicionada || 1
            })) || [],
            salsas: item.detallesalsas?.map(ds => ({
                id: ds.catalogosalsa?.idsalsa || ds.idsalsa,
                nombre: ds.catalogosalsa?.nombre || 'Salsa N/A',
                precio: parseFloat(ds.catalogosalsa?.precio || 0),
                cantidad: ds.cantidadadicionada || 1
            })) || [],
            sabores: item.detallesabores?.map(dr => ({
                id: dr.catalogosabor?.idsabor || dr.idsabor,
                nombre: dr.catalogosabor?.nombre || 'Sabor N/A',
                precio: parseFloat(dr.catalogosabor?.precio || 0),
                cantidad: dr.cantidadadicionada || 1
            })) || []
        }));
    }

   transformarAbonosDesdeAPI(abonosApi) {
    if (!abonosApi || !Array.isArray(abonosApi)) return [];
    return abonosApi.map(abono => {
        // Usar los campos exactos que devuelve tu backend
        const montoAbono = parseFloat(abono.monto || abono.cantidadpagar || abono.cantidadPagar || abono.totalPagado || 0);
        
        return {
            id: abono.id || abono.idabono || abono.idAbono,
            idAbono: abono.id || abono.idabono || abono.idAbono, // Para compatibilidad
            idPedido: abono.idPedido || abono.idpedido,
            metodoPago: abono.metodoPago || abono.metodopago,
            metodo_pago: abono.metodoPago || abono.metodopago, // Para compatibilidad
            monto: montoAbono,
            cantidadpagar: montoAbono, // Para compatibilidad
            cantidadPagar: montoAbono, // Para compatibilidad  
            totalPagado: montoAbono,
            TotalPagado: montoAbono, // Para compatibilidad
            comprobante_imagen: abono.comprobante_imagen || abono.imagenes?.urlimg || null,
            imagenes: abono.imagenes || null, // Mantener estructura original
            fecha: abono.fecha || new Date().toISOString().split('T')[0],
            anulado: Boolean(abono.anulado),
            cliente: abono.cliente || 'N/A',
            totalVenta: parseFloat(abono.totalVenta || 0)
        };
    });
}

    // FUNCIÓN PRINCIPAL PARA OBTENER VENTAS
    async obtenerVentas() {
        try {
            console.log('Obteniendo ventas desde:', `${API_BASE_URL}/venta/listado-resumen`);
            const response = await fetch(`${API_BASE_URL}/venta/listado-resumen`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! Status: ${response.status}. ${errorText}`);
            }
            
            const ventasApi = await response.json();
            console.log('Ventas recibidas desde API:', ventasApi);
            
            return ventasApi.map(this.transformarVentaDesdeAPI.bind(this));
        } catch (error) {
            console.error('Error al obtener el listado de ventas:', error);
            
            try {
                console.log('Intentando con ruta básica...');
                return await this.obtenerVentasBasico();
            } catch (fallbackError) {
                console.error('Error en fallback:', fallbackError);
                throw new Error(`No se pudieron obtener las ventas: ${error.message}`);
            }
        }
    }

    // FUNCIÓN ALTERNATIVA USANDO EL ENDPOINT BÁSICO
    async obtenerVentasBasico() {
        try {
            console.log('Obteniendo ventas desde endpoint básico:', `${API_BASE_URL}/venta`);
            const response = await fetch(`${API_BASE_URL}/venta`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error en ruta básica:', errorText);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const ventasApi = await response.json();
            console.log('Ventas básicas recibidas:', ventasApi);
            
            return ventasApi.map(venta => ({
                idVenta: venta.idventa,
                fechaVenta: venta.fechaventa,
                total: parseFloat(venta.total || 0),
                metodoPago: venta.metodopago || '',
                tipoVenta: venta.tipoventa || '',
                idEstadoVenta: venta.estadoVenta || 1,
                nombreEstado: 'Activa',
                nombreCliente: venta.cliente || 'Cliente N/A',
                nombreSede: venta.sede || 'Sede N/A'
            }));
        } catch (error) {
            console.error('Error al obtener ventas básico:', error);
            throw new Error(`No se pudieron obtener las ventas: ${error.message}`);
        }
    }
    
    // FUNCIÓN PARA OBTENER LOS ESTADOS DE LAS VENTAS
    async obtenerEstadosVenta() {
        try {
            console.log('Obteniendo estados de venta desde:', `${API_BASE_URL}/estado-venta`);
            const response = await fetch(`${API_BASE_URL}/estado-venta`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error al obtener estados:', errorText);
                throw new Error(`HTTP error! Status: ${response.status}. ${errorText}`);
            }
            
            const estados = await response.json();
            console.log('Estados recibidos:', estados);
            return estados;
        } catch (error) {
            console.error('Error al obtener los estados de venta:', error);
            
            console.log('Usando estados por defecto...');
            return [
                { idestadoventa: 1, nombre_estado: 'En espera' },
                { idestadoventa: 2, nombre_estado: 'En producción' },
                { idestadoventa: 3, nombre_estado: 'Por entregar' },
                { idestadoventa: 4, nombre_estado: 'Finalizado' },
                { idestadoventa: 5, nombre_estado: 'Activa' },
                { idestadoventa: 6, nombre_estado: 'Anulada' }
            ];
        }
    }

async crearVenta(ventaData) {
    try {
        console.log('Datos originales recibidos para crear venta:', ventaData);
        
        // CORRECCIÓN PRINCIPAL: Simplificar la lógica del cliente
        let clienteId = null;
        if (ventaData.clienteId !== null && ventaData.clienteId !== undefined) {
            clienteId = parseInt(ventaData.clienteId);
            console.log('Cliente ID procesado:', clienteId);
        } else {
            console.log('Usando cliente genérico (null)');
        }
        
        // Obtener ID de sede dinámicamente
        const sedeId = await this.obtenerIdSede(ventaData.sedeNombre || ventaData.sede);
        console.log(`Sede procesada: ${ventaData.sedeNombre || ventaData.sede} -> ID: ${sedeId}`);
        
        let tipoVenta = ventaData.tipoventa || ventaData.tipo_venta;
        if (tipoVenta === 'venta directa') {
            tipoVenta = 'directa';
        } else if (tipoVenta === 'pedido') {
            tipoVenta = 'pedido';
        }
        
        const estadoId = this.obtenerEstadoSegunTipo(ventaData.tipoventa || ventaData.tipo_venta);
        
        const detallesVenta = (ventaData.detalleventa || ventaData.productos || []).map(producto => ({
            idproductogeneral: parseInt(producto.idproductogeneral || producto.id),
            cantidad: parseInt(producto.cantidad || 1),
            preciounitario: parseFloat(producto.preciounitario || producto.precio || 0),
            subtotal: parseFloat(producto.subtotal || (producto.precio * producto.cantidad) || 0),
            iva: parseFloat(producto.iva || ((producto.precio * producto.cantidad) * 0.16) || 0)
        }));

        const fechaFormateada = this.formatearFecha(ventaData.fechaventa || ventaData.fecha_venta);
        console.log('Fecha original:', ventaData.fechaventa || ventaData.fecha_venta);
        console.log('Fecha formateada:', fechaFormateada);

        const ventaParaAPI = {
            fechaventa: fechaFormateada,
            cliente: clienteId,
            idsede: sedeId,
            metodopago: ventaData.metodopago || ventaData.metodo_pago,
            tipoventa: tipoVenta,
            estadoVentaId: estadoId,
            total: parseFloat(ventaData.total || 0),
            detalleventa: detallesVenta
        };

        console.log('Datos transformados para la API:', ventaParaAPI);
        console.log('Cliente final que se enviará:', clienteId);
        console.log('Sede final que se enviará:', sedeId);
        
        if (!ventaParaAPI.metodopago) {
            throw new Error('Método de pago es requerido');
        }
        if (!ventaParaAPI.tipoventa) {
            throw new Error('Tipo de venta es requerido');
        }
        if (!ventaParaAPI.total || ventaParaAPI.total <= 0) {
            throw new Error('Total debe ser mayor a 0');
        }
        if (!detallesVenta.length) {
            throw new Error('Debe incluir al menos un producto');
        }
        
        const response = await fetch(`${API_BASE_URL}/venta`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ventaParaAPI)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error al crear venta:', errorText);
            throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
        }
        
        const ventaCreada = await response.json();
        console.log('Venta creada exitosamente:', ventaCreada);
        
        return {
            idVenta: ventaCreada.idventa,
            fechaVenta: ventaCreada.fechaventa,
            total: parseFloat(ventaCreada.total),
            metodoPago: ventaCreada.metodopago,
            tipoVenta: ventaCreada.tipoventa,
            idEstadoVenta: ventaCreada.estadoVentaId || estadoId,
            nombreEstado: estadoId === 5 ? 'Activa' : 'En espera',
            nombreCliente: ventaData.cliente || ventaData.clienteNombre || 'Cliente Genérico',
            nombreSede: ventaData.sede || ventaData.sedeNombre || 'N/A'
        };
        
    } catch (error) {
        console.error('Error al crear la venta:', error);
        throw new Error(`No se pudo crear la venta: ${error.message}`);
    }
}

    // FUNCIÓN PARA OBTENER DETALLE DE VENTA CON ABONOS - CORREGIDA
    async obtenerVentaPorId(idVenta) {
        try {
            console.log('Obteniendo detalle de venta ID:', idVenta);
            
            let response = await fetch(`${API_BASE_URL}/venta/${idVenta}/detalles`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.log('Endpoint de detalles no disponible, intentando con endpoint básico...');
                response = await fetch(`${API_BASE_URL}/venta/${idVenta}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error al obtener detalle:', errorText);
                throw new Error(`HTTP error! Status: ${response.status}. ${errorText}`);
            }
            
            const ventaApi = await response.json();
            console.log('Detalle de venta recibido:', ventaApi);
            
            // Obtener abonos de la venta usando la ruta corregida con ID de VENTA (no pedido)
            try {
                const abonosResponse = await fetch(`${API_BASE_URL}/abonos/pedido/${idVenta}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                
                if (abonosResponse.ok) {
                    const abonos = await abonosResponse.json();
                    console.log('Abonos obtenidos:', abonos);
                    ventaApi.abonos = abonos;
                } else {
                    console.warn('No se pudieron obtener los abonos');
                    ventaApi.abonos = [];
                }
            } catch (abonosError) {
                console.warn('Error al obtener abonos:', abonosError);
                ventaApi.abonos = [];
            }
            
            return this.transformarVentaCompletaDesdeAPI(ventaApi);
        } catch (error) {
            console.error('Error al obtener el detalle de la venta:', error);
            throw new Error(`No se pudo obtener el detalle de la venta: ${error.message}`);
        }
    }

    // FUNCIÓN PARA ANULAR VENTA
    async anularVenta(idVenta) {
        try {
            console.log('Anulando venta ID:', idVenta);
            
            const response = await fetch(`${API_BASE_URL}/venta/${idVenta}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estadoVentaId: 6 })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error al anular:', errorText);
                throw new Error(`HTTP error! Status: ${response.status}. ${errorText}`);
            }
            
            const ventaAnulada = await response.json();
            console.log('Venta anulada exitosamente:', ventaAnulada);
            return ventaAnulada;
        } catch (error) {
            console.error('Error al anular venta:', error);
            throw new Error(`No se pudo anular la venta: ${error.message}`);
        }
    }

    // FUNCIÓN PARA ACTUALIZAR ESTADO DE VENTA
    async actualizarEstadoVenta(idVenta, nuevoEstadoId) {
        try {
            console.log(`Actualizando estado de venta ${idVenta} a estado ${nuevoEstadoId}`);
            const response = await fetch(`${API_BASE_URL}/venta/${idVenta}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estadoVentaId: nuevoEstadoId })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error al actualizar estado:', errorText);
                throw new Error(`HTTP error! Status: ${response.status}. ${errorText}`);
            }
            
            const ventaActualizada = await response.json();
            console.log('Estado actualizado exitosamente:', ventaActualizada);
            return ventaActualizada;
        } catch (error) {
            console.error('Error al actualizar estado de venta:', error);
            throw new Error(`No se pudo actualizar el estado: ${error.message}`);
        }
    }

    // FUNCIÓN PARA CREAR ABONO CON IMAGEN - RUTA Y LÓGICA CORREGIDAS
    async crearAbono(abonoData, imagen = null) {
        try {
            console.log('Creando abono para venta ID:', abonoData.idpedido || abonoData.idPedido);
            
            // Crear FormData para enviar datos y archivo
            const formData = new FormData();
            
            // CORRECCIÓN IMPORTANTE: Enviar el ID de la VENTA, no del pedido
            // El backend se encargará de crear o encontrar el pedido correspondiente
            formData.append('idpedido', abonoData.idpedido || abonoData.idPedido);
            formData.append('metodopago', abonoData.metodopago || abonoData.metodo_pago);
            formData.append('cantidadpagar', abonoData.cantidadpagar || abonoData.total_pagado);
            formData.append('TotalPagado', abonoData.TotalPagado || abonoData.total_pagado);
            
            // Si hay imagen, agregarla al FormData
            if (imagen) {
                formData.append('comprobante', imagen);
                console.log('Imagen agregada al FormData:', imagen.name, imagen.size);
            }
            
            console.log('Datos del FormData:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, typeof value === 'object' ? `Archivo: ${value.name}` : value);
            }
            
            // RUTA CORREGIDA: usar /abonos en lugar de /abono
            const response = await fetch(`${API_BASE_URL}/abonos`, {
                method: 'POST',
                body: formData // No agregar Content-Type header, fetch lo hará automáticamente
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error al crear abono - Status:', response.status);
                console.error('Error al crear abono - Response:', errorText);
                
                let errorMessage = `Error del servidor (${response.status})`;
                
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.message) {
                        errorMessage = errorJson.message;
                        
                        // Mensajes de error específicos para el usuario
                        if (errorMessage.includes('too long for the column')) {
                            errorMessage = 'El método de pago seleccionado es muy largo. Use: efectivo, tarjeta, transferencia u otro.';
                        } else if (errorMessage.includes('ID de pedido es requerido')) {
                            errorMessage = 'Error interno: ID de venta requerido';
                        } else if (errorMessage.includes('Método de pago muy largo')) {
                            errorMessage = 'El método de pago es muy largo (máximo 20 caracteres)';
                        }
                    }
                } catch (parseError) {
                    console.warn('No se pudo parsear el error como JSON');
                }
                
                throw new Error(errorMessage);
            }
            
            const abonoCreado = await response.json();
            console.log('Abono creado exitosamente:', abonoCreado);
            return abonoCreado;
        } catch (error) {
            console.error('Error al crear abono:', error);
            throw new Error(`No se pudo crear el abono: ${error.message}`);
        }
    }

    // FUNCIÓN PARA ANULAR ABONO - RUTA CORREGIDA
    async anularAbono(idAbono) {
        try {
            console.log('Anulando abono ID:', idAbono);
            
            if (!idAbono || idAbono <= 0) {
                throw new Error('ID de abono inválido');
            }
            
            // RUTA CORREGIDA: usar /abonos en lugar de /abono
            const response = await fetch(`${API_BASE_URL}/abonos/${idAbono}/anular`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error al anular abono:', errorText);
                throw new Error(`HTTP error! Status: ${response.status}. ${errorText}`);
            }
            
            const abonoAnulado = await response.json();
            console.log('Abono anulado exitosamente:', abonoAnulado);
            return abonoAnulado;
        } catch (error) {
            console.error('Error al anular abono:', error);
            throw new Error(`No se pudo anular el abono: ${error.message}`);
        }
    }

    // FUNCIÓN PARA TESTING/DEBUG - VERIFICA CONECTIVIDAD
    async testConnection() {
        try {
            console.log('Testando conexión a:', API_BASE_URL);
            
            const response = await fetch(`${API_BASE_URL}/estado-venta`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            console.log('Test response status:', response.status);
            console.log('Test response ok:', response.ok);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Test data:', data);
                return { success: true, data };
            } else {
                const errorText = await response.text();
                console.log('Test error:', errorText);
                return { success: false, status: response.status, error: errorText };
            }
        } catch (error) {
            console.error('Error en test de conexión:', error);
            return { success: false, error: error.message };
        }
    }
}

const ventaApiService = new VentaApiService();
export default ventaApiService