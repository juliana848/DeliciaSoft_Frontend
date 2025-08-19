// src/services/venta_services.js

const API_BASE_URL = 'https://deliciasoft-backend.onrender.com/api';

// Datos de prueba para simular la obtención de nombres a partir de IDs
const mockClientes = [
    { id: 1, nombre: 'Laura Sánchez' },
    { id: 2, nombre: 'Carlos Gómez' },
    { id: 3, nombre: 'Juan Pérez' },
    // Agrega más clientes según sea necesario
];

const mockSedes = [
    { id: 1, nombre: 'San Benito' },
    { id: 2, nombre: 'San Pablo' },
    { id: 3, nombre: 'Centro' },
    // Agrega más sedes según sea necesario
];

const mockProductos = [
    { id: 101, nombre: 'Harina' },
    { id: 102, nombre: 'Azúcar' },
    { id: 103, nombre: 'Pastel de Chocolate' },
    // Agrega más productos según sea necesario
];

class VentaApiService {
  // Transforma los datos de snake_case a camelCase para la aplicación
  transformarVentaDesdeAPI(ventaApi) {
    if (!ventaApi) return null;
    return {
      idVenta: ventaApi.idventa,
      fechaVenta: ventaApi.fechaventa,
      idCliente: ventaApi.cliente, // Se mantiene el ID para buscar el nombre
      idSede: ventaApi.idsede, // Se mantiene el ID para buscar el nombre
      metodoPago: ventaApi.metodopago,
      tipoVenta: ventaApi.tipoventa,
      estadoVenta: ventaApi.estadoventa,
      total: parseFloat(ventaApi.total),
    };
  }

  // Transforma el detalle de venta
  transformarDetalleVentaDesdeAPI(detalleApi) {
    if (!detalleApi) return [];
    return detalleApi.map(item => ({
      iddetalleventa: item.iddetalleventa,
      idventa: item.idventa,
      idproductogeneral: item.idproductogeneral,
      cantidad: item.cantidad,
      precioUnitario: parseFloat(item.preciounitario),
      subtotal: parseFloat(item.subtotal),
      iva: parseFloat(item.iva),
    }));
  }

  // Transforma los abonos
  transformarAbonosDesdeAPI(abonosApi) {
    if (!abonosApi) return [];
    return abonosApi.map(abono => ({
      idAbono: abono.idabono,
      idPedido: abono.idpedido,
      metodoPago: abono.metodopago,
      idImagen: abono.idimagen,
      cantidadPagar: parseFloat(abono.cantidadpagar),
    }));
  }
  
  // Transforma los datos de camelCase a snake_case para la API
  transformarVentaParaAPI(venta) {
    return {
      fechaventa: venta.fechaVenta,
      cliente: venta.cliente,
      idsede: venta.idSede,
      metodopago: venta.metodoPago,
      tipoventa: venta.tipoVenta,
      estadoventa: venta.estadoVenta,
      total: venta.total,
    };
  }

  // **NUEVA FUNCIÓN para obtener el nombre del cliente por ID**
  getNombreCliente(id) {
      const cliente = mockClientes.find(c => c.id === id);
      return cliente ? cliente.nombre : `Cliente ${id}`;
  }

  // **NUEVA FUNCIÓN para obtener el nombre de la sede por ID**
  getNombreSede(id) {
      const sede = mockSedes.find(s => s.id === id);
      return sede ? sede.nombre : `Sede ${id}`;
  }
  
  // **NUEVA FUNCIÓN para obtener el nombre del producto por ID**
  getNombreProducto(id) {
      const producto = mockProductos.find(p => p.id === id);
      return producto ? producto.nombre : `Producto ${id}`;
  }

  // Métodos para interactuar con la API
  async obtenerVentas() {
    try {
      const response = await fetch(`${API_BASE_URL}/venta`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      return data.map(venta => {
          const ventaTransformada = this.transformarVentaDesdeAPI(venta);
          // Agrega los nombres para el listado
          return {
              ...ventaTransformada,
              nombreCliente: this.getNombreCliente(ventaTransformada.idCliente),
              nombreSede: this.getNombreSede(ventaTransformada.idSede),
          };
      });
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      throw new Error('No se pudo obtener la lista de ventas.');
    }
  }

  async obtenerVentaPorId(id) {
    try {
      // Fetch the main sale details
      const responseVenta = await fetch(`${API_BASE_URL}/venta/${id}`);
      if (!responseVenta.ok) throw new Error(`HTTP error! Status: ${responseVenta.status}`);
      const ventaData = await responseVenta.json();
      
      // Fetch the detailed sale items
      const responseDetalle = await fetch(`${API_BASE_URL}/detalleventa?idventa=${id}`);
      const detalleData = await responseDetalle.json();
      
      // Fetch the payments (abonos)
      const responseAbonos = await fetch(`${API_BASE_URL}/abonos?idpedido=${id}`);
      const abonosData = await responseAbonos.json();

      const ventaTransformada = this.transformarVentaDesdeAPI(ventaData);
      const detalleTransformado = this.transformarDetalleVentaDesdeAPI(detalleData);
      const abonosTransformados = this.transformarAbonosDesdeAPI(abonosData);

      // Combina toda la información en un solo objeto para el detalle
      return {
        ...ventaTransformada,
        nombreCliente: this.getNombreCliente(ventaTransformada.idCliente),
        nombreSede: this.getNombreSede(ventaTransformada.idSede),
        detalleVenta: detalleTransformado.map(item => ({
            ...item,
            nombreProducto: this.getNombreProducto(item.idproductogeneral)
        })),
        abonos: abonosTransformados,
      };

    } catch (error) {
      console.error('Error al obtener venta:', error);
      throw new Error('Venta no encontrada.');
    }
  }

  // ... (el resto de las funciones como crearVenta, anularVenta, etc., no necesitan cambios)
  async crearVenta(ventaData) {
    try {
      const response = await fetch(`${API_BASE_URL}/venta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ventaData),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const nuevaVenta = await response.json();
      return this.transformarVentaDesdeAPI(nuevaVenta);
    } catch (error) {
      console.error('Error al crear venta:', error);
      throw new Error('No se pudo crear la venta.');
    }
  }

  async anularVenta(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/venta/${id}/anular`, {
            method: 'PATCH',
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error al anular la venta:', error);
        throw new Error('No se pudo anular la venta.');
    }
  }

  async agregarAbono(abonoData) {
    try {
      const response = await fetch(`${API_BASE_URL}/abonos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(abonoData),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error al agregar abono:', error);
      throw new Error('No se pudo agregar el abono.');
    }
  }
}

const ventaApiService = new VentaApiService();
export default ventaApiService;