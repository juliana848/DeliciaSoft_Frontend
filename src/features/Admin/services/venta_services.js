const API_BASE_URL = 'https://deliciasoft-backend.onrender.com/api';

class VentaApiService {

    transformarVentaDesdeAPI(ventaApi) {
        if (!ventaApi) return null;
        return {
            idVenta: ventaApi.idventa,
            fechaVenta: ventaApi.fechaventa,
            total: parseFloat(ventaApi.total),
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
            nombreEstado: ventaApi.estadoVenta.nombre_estado,
            total: parseFloat(ventaApi.total),
            subtotal: parseFloat(ventaApi.subtotal),
            iva: parseFloat(ventaApi.iva),
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
            nombreProducto: item.productoGeneral?.nombre,
            precioUnitario: parseFloat(item.preciounitario),
            subtotal: parseFloat(item.subtotal),
            iva: parseFloat(item.iva),
            adiciones: item.adiciones.map(a => ({
                id: a.idadiciones,
                nombre: a.catalogoadiciones.nombre,
                precio: a.preciounitario,
                cantidad: a.cantidadadicionada
            })),
            salsas: item.salsas.map(s => ({
                id: s.idsalsa,
                nombre: s.catalogosalsa.nombre,
                precio: s.preciounitario,
                cantidad: s.cantidadadicionada
            })),
            sabores: item.sabores.map(r => ({
                id: r.idsabor,
                nombre: r.catalogosabor.nombre,
                precio: r.preciounitario,
                cantidad: r.cantidadadicionada
            }))
        }));
    }

    transformarAbonosDesdeAPI(abonosApi) {
        if (!abonosApi) return [];
        return abonosApi.map(abono => ({
            idAbono: abono.idabono,
            idPedido: abono.idpedido,
            metodoPago: abono.metodopago,
            cantidadPagar: abono.cantidadpagar,
            TotalPagado: abono.TotalPagado
        }));
    }

    async obtenerVentas() {
        try {
            const response = await fetch(`${API_BASE_URL}/venta`);
            if (!response.ok) {
                throw new Error('No se pudieron obtener las ventas.');
            }
            const ventasApi = await response.json();
            return ventasApi.map(this.transformarVentaDesdeAPI);
        } catch (error) {
            console.error('Error al obtener el listado de ventas:', error);
            throw new Error('No se pudieron obtener las ventas.');
        }
    }
    
    // Nueva función agregada para obtener los estados de las ventas
    async obtenerEstadosVenta() {
        try {
            const response = await fetch(`${API_BASE_URL}/estado-venta`);
            if (!response.ok) {
                throw new Error('No se pudieron obtener los estados de venta.');
            }
            const estados = await response.json();
            return estados;
        } catch (error) {
            console.error('Error al obtener los estados de venta:', error);
            throw new Error('No se pudieron obtener los estados de venta.');
        }
    }

    async crearVenta(ventaData) {
        try {
            const response = await fetch(`${API_BASE_URL}/venta`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ventaData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al crear la venta:', error);
            throw new Error('No se pudo crear la venta. Por favor, revisa los datos.');
        }
    }

    async obtenerVentaPorId(idVenta) {
        try {
            const response = await fetch(`${API_BASE_URL}/venta/${idVenta}/detalles`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const ventaApi = await response.json();
            return this.transformarVentaCompletaDesdeAPI(ventaApi);
        } catch (error) {
            console.error('Error al obtener el detalle de la venta:', error);
            throw new Error('No se pudo obtener el detalle de la venta.');
        }
    }
}
const ventaApiService = new VentaApiService();
export default ventaApiService;