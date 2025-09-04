// venta_services.js - CORREGIDO - Mapeo de campos
const API_BASE_URL = 'https://deliciasoft-backend.onrender.com/api';

class VentaApiService {

    // Obtener mapeo de sedes
    obtenerIdSede(nombreSede) {
        const sedes = {
            'San Pablo': 1,
            'San Benito': 2
        };
        return sedes[nombreSede] || 1;
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
            // Si ya es un objeto Date
            if (fecha instanceof Date) {
                return fecha.toISOString();
            }
            
            // Si es un string, intentar parsearlo
            if (typeof fecha === 'string') {
                // Si ya está en formato ISO, devolverlo
                if (fecha.includes('T') && fecha.includes('Z')) {
                    return fecha;
                }
                
                // Si está en formato YYYY-MM-DD, agregar tiempo
                if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    return `${fecha}T00:00:00.000Z`;
                }
                
                // Intentar crear Date y convertir
                const dateObj = new Date(fecha);
                if (isNaN(dateObj.getTime())) {
                    throw new Error('Fecha inválida');
                }
                return dateObj.toISOString();
            }
            
            // Si no es string ni Date, usar fecha actual
            console.warn('Fecha no reconocida, usando fecha actual:', fecha);
            return new Date().toISOString();
            
        } catch (error) {
            console.error('Error al formatear fecha:', error, 'Fecha original:', fecha);
            // Fallback a fecha actual
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
        
        // Calcular subtotal e IVA desde el detalle
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
            // Transformar adiciones desde detalleadiciones
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
        return abonosApi.map(abono => ({
            idAbono: abono.idabono,
            idPedido: abono.idpedido,
            metodoPago: abono.metodopago,
            cantidadPagar: parseFloat(abono.cantidadpagar || 0),
            TotalPagado: parseFloat(abono.TotalPagado || 0)
        }));
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
            
            // Fallback: intentar con la ruta básica
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
            
            // Transformar datos básicos
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
            
            // Estados por defecto en caso de error
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
        
        // Determinar el ID del cliente
        let clienteId = null;
        if (ventaData.cliente && ventaData.cliente !== 'Cliente Genérico') {
            // Si se seleccionó un cliente específico, extraer su ID
            clienteId = parseInt(ventaData.clienteId) || null;
        }
        
        // Obtener el ID de la sede
        const sedeId = this.obtenerIdSede(ventaData.sedeNombre || ventaData.sede);
        
        // CORREGIR EL MAPEO DE TIPO DE VENTA PARA RESPETAR LÍMITE DE CARACTERES
        let tipoVenta = ventaData.tipoventa || ventaData.tipo_venta;
        if (tipoVenta === 'venta directa') {
            tipoVenta = 'directa'; // Cambiar a "directa" (7 caracteres)
        } else if (tipoVenta === 'pedido') {
            tipoVenta = 'pedido'; // Mantener "pedido" (6 caracteres)
        }
        
        // Obtener el estado según el tipo de venta (usando el valor original para la lógica)
        const estadoId = this.obtenerEstadoSegunTipo(ventaData.tipoventa || ventaData.tipo_venta);
        
        // Preparar los detalles de venta
        const detallesVenta = (ventaData.detalleventa || ventaData.productos || []).map(producto => ({
            idproductogeneral: parseInt(producto.idproductogeneral || producto.id),
            cantidad: parseInt(producto.cantidad || 1),
            preciounitario: parseFloat(producto.preciounitario || producto.precio || 0),
            subtotal: parseFloat(producto.subtotal || (producto.precio * producto.cantidad) || 0),
            iva: parseFloat(producto.iva || ((producto.precio * producto.cantidad) * 0.16) || 0)
        }));

        // FORMATEAR LA FECHA CORRECTAMENTE
        const fechaFormateada = this.formatearFecha(ventaData.fechaventa || ventaData.fecha_venta);
        console.log('Fecha original:', ventaData.fechaventa || ventaData.fecha_venta);
        console.log('Fecha formateada:', fechaFormateada);

        // Transformar los datos al formato que espera la API - MAPEO CORREGIDO
        const ventaParaAPI = {
            fechaventa: fechaFormateada,
            cliente: clienteId,
            idsede: sedeId,
            metodopago: ventaData.metodopago || ventaData.metodo_pago,  // CORREGIDO: mapeo correcto
            tipoventa: tipoVenta,      // CORREGIDO: usar valor truncado
            estadoVentaId: estadoId,
            total: parseFloat(ventaData.total || 0),
            detalleventa: detallesVenta
        };

        console.log('Datos transformados para la API:', ventaParaAPI);
        
        // Validar que los campos obligatorios no estén null
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
        
        // Crear la venta
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
        
        // Retornar la venta en el formato esperado por el frontend
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

    // FUNCIÓN PARA OBTENER DETALLE DE VENTA
    async obtenerVentaPorId(idVenta) {
        try {
            console.log('Obteniendo detalle de venta ID:', idVenta);
            
            // Primero intentar con el endpoint de detalles específico
            let response = await fetch(`${API_BASE_URL}/venta/${idVenta}/detalles`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            // Si no funciona, intentar con el endpoint básico
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
                body: JSON.stringify({ estadoVentaId: 6 }) // 6 = Anulada
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

    // FUNCIÓN PARA CREAR ABONO
    async crearAbono(abonoData) {
        try {
            console.log('Creando abono:', abonoData);
            const response = await fetch(`${API_BASE_URL}/abono`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(abonoData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error al crear abono:', error);
            throw new Error(`No se pudo crear el abono: ${error.message}`);
        }
    }

    // FUNCIÓN PARA TESTING/DEBUG - VERIFICA CONECTIVIDAD
    async testConnection() {
        try {
            console.log('Testando conexión a:', API_BASE_URL);
            
            // Intentar con estado-venta primero (más simple)
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
export default ventaApiService;