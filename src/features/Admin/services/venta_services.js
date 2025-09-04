const API_BASE_URL = 'https://deliciasoft-backend.onrender.com/api';

class VentaApiService {

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
            subtotal: parseFloat(ventaApi.subtotal || 0),
            iva: parseFloat(ventaApi.iva || 0),
            detalleventa: this.transformarDetalleVentaDesdeAPI(ventaApi.detalleventa),
            abonos: this.transformarAbonosDesdeAPI(ventaApi.abonos)
        };
    }

    transformarDetalleVentaDesdeAPI(detalleApi) {
        if (!detalleApi) return [];
        return detalleApi.map(item => ({
            iddetalleventa: item.iddetalleventa,
            idventa: item.idventa,
            idproductogeneral: item.idproductogeneral,
            cantidad: item.cantidad,
            nombreProducto: item.productoGeneral?.nombre || item.productogeneral?.nombre || 'Producto N/A',
            precioUnitario: parseFloat(item.preciounitario),
            subtotal: parseFloat(item.subtotal),
            iva: parseFloat(item.iva),
            adiciones: item.adiciones?.map(a => ({
                id: a.idadiciones,
                nombre: a.catalogoadiciones?.nombre || a.catalogoAdiciones?.nombre || 'Adición N/A',
                precio: parseFloat(a.preciounitario || 0),
                cantidad: a.cantidadadicionada || 1
            })) || [],
            salsas: item.salsas?.map(s => ({
                id: s.idsalsa,
                nombre: s.catalogosalsa?.nombre || s.catalogoSalsa?.nombre || 'Salsa N/A',
                precio: parseFloat(s.preciounitario || 0),
                cantidad: s.cantidadadicionada || 1
            })) || [],
            sabores: item.sabores?.map(r => ({
                id: r.idsabor,
                nombre: r.catalogosabor?.nombre || r.catalogoSabor?.nombre || 'Sabor N/A',
                precio: parseFloat(r.preciounitario || 0),
                cantidad: r.cantidadadicionada || 1
            })) || []
        }));
    }

    transformarAbonosDesdeAPI(abonosApi) {
        if (!abonosApi) return [];
        return abonosApi.map(abono => ({
            idAbono: abono.idabono,
            idPedido: abono.idpedido,
            metodoPago: abono.metodopago,
            cantidadPagar: parseFloat(abono.cantidadpagar || 0),
            TotalPagado: parseFloat(abono.TotalPagado || 0)
        }));
    }

    // FUNCIÓN PRINCIPAL PARA OBTENER VENTAS - CORREGIDA
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
                nombreEstado: 'Activa', // Default
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
                { idestadoventa: 1, nombre_estado: 'Activa' },
                { idestadoventa: 2, nombre_estado: 'Pendiente' },
                { idestadoventa: 3, nombre_estado: 'En Proceso' },
                { idestadoventa: 4, nombre_estado: 'Completada' },
                { idestadoventa: 5, nombre_estado: 'Anulada' }
            ];
        }
    }

    async crearVenta(ventaData) {
        try {
            console.log('Creando venta con datos:', ventaData);
            const response = await fetch(`${API_BASE_URL}/venta`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ventaData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error al crear venta:', errorText);
                throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
            }
            
            const ventaCreada = await response.json();
            console.log('Venta creada exitosamente:', ventaCreada);
            return ventaCreada;
        } catch (error) {
            console.error('Error al crear la venta:', error);
            throw new Error(`No se pudo crear la venta: ${error.message}`);
        }
    }

    async obtenerVentaPorId(idVenta) {
        try {
            console.log('Obteniendo detalle de venta ID:', idVenta);
            const response = await fetch(`${API_BASE_URL}/venta/${idVenta}/detalles`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
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
                body: JSON.stringify({ estadoVentaId: 5 }) // 5 = "Anulada"
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error al anular:', errorText);
                throw new Error(`HTTP error! Status: ${response.status}. ${errorText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error al anular venta:', error);
            throw new Error(`No se pudo anular la venta: ${error.message}`);
        }
    }

    // FUNCIÓN PARA ACTUALIZAR ESTADO DE VENTA
  // FUNCIÓN PARA ACTUALIZAR ESTADO DE VENTA - MEJORADA
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