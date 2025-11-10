import { obtenerFechaColombia } from '../pages/comprasCrud/Utils/fechaUtils';

const BASE_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/compra";

class CompraApiService {
  constructor() {
    this.baseHeaders = { "Content-Type": "application/json" };
  }

  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      throw new Error(errorMessage);
    }
    return response.json();
  }

  // MÉTODO PARA CAMBIAR ESTADO - USANDO ENDPOINTS ESPECÍFICOS DEL BACKEND
  async cambiarEstadoCompra(id, nuevoEstado) {
    try {
      console.log(`=== INICIANDO CAMBIO DE ESTADO ===`);
      console.log('ID de compra:', id);
      console.log('Nuevo estado:', nuevoEstado);
      
      // Determinar endpoint según el estado deseado
      const endpoint = nuevoEstado ? 'activar' : 'anular';
      const url = `${BASE_URL}/${id}/${endpoint}`;
      
      console.log('URL del endpoint:', url);

      // Realizar petición al backend
      const response = await fetch(url, {
        method: "PUT",
        headers: this.baseHeaders,
      });

      console.log('Status respuesta:', response.status);
      console.log('StatusText:', response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const resultado = await response.json();
      console.log('Respuesta del servidor:', resultado);

      // El backend devuelve { message: "...", compra: {...} }
      const compraActualizada = resultado.compra || resultado;
      
      if (!compraActualizada) {
        console.error('No se recibió compra actualizada');
        throw new Error('Respuesta inválida del servidor');
      }

      // Verificar que el estado cambió correctamente
      console.log('Estado recibido:', compraActualizada.estado);
      if (compraActualizada.estado !== nuevoEstado) {
        console.warn(`ADVERTENCIA: Estado esperado ${nuevoEstado}, recibido ${compraActualizada.estado}`);
      } else {
        console.log(`ÉXITO: Estado cambiado a ${compraActualizada.estado}`);
      }

      // Transformar y retornar
      const resultado_transformado = this.transformarCompraDesdeAPI(compraActualizada);
      console.log('Compra transformada final:', resultado_transformado);
      
      return resultado_transformado;

    } catch (error) {
      console.error('ERROR EN cambiarEstadoCompra:', error);
      throw new Error(`No se pudo ${nuevoEstado ? 'reactivar' : 'anular'} la compra: ${error.message}`);
    }
  }

  // OBTENER TODAS LAS COMPRAS
  async obtenerCompras() {
    try {
      console.log('Obteniendo compras desde:', BASE_URL);
      const response = await fetch(`${BASE_URL}`, {
        method: "GET",
        headers: this.baseHeaders,
      });
      const data = await this.handleResponse(response);
      console.log('Datos crudos de la API:', data.length, 'compras');
      
      const comprasTransformadas = this.transformarComprasDesdeAPI(data);
      console.log('Compras transformadas:', comprasTransformadas.length);
      
      // Debug de estados
      const activas = comprasTransformadas.filter(c => c.estado === true);
      const anuladas = comprasTransformadas.filter(c => c.estado === false);
      console.log('Estados después de transformar: Activas:', activas.length, 'Anuladas:', anuladas.length);
      
      return comprasTransformadas;
    } catch (error) {
      console.error('Error en obtenerCompras:', error);
      throw error;
    }
  }

  async obtenerCompraPorId(id) {
    try {
      console.log('Obteniendo compra por ID:', id);
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "GET",
        headers: this.baseHeaders,
      });
      if (response.status === 404) throw new Error("Compra no encontrada");
      const data = await this.handleResponse(response);
      console.log('Compra obtenida desde API:', data);
      console.log('Proveedor en respuesta:', data.proveedor || data.Proveedor);
      return this.transformarCompraDesdeAPI(data);
    } catch (error) {
      console.error('Error en obtenerCompraPorId:', error);
      throw error;
    }
  }

  async crearCompra(compraData) {
    try {
      const compraAPI = this.transformarCompraParaAPI(compraData);
      this.validarDatosCompra(compraAPI);

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: this.baseHeaders,
        body: JSON.stringify(compraAPI),
      });

      const data = await this.handleResponse(response);
      return this.transformarCompraDesdeAPI(data);
    } catch (error) {
      console.error('Error en crearCompra:', error);
      throw error;
    }
  }

  async actualizarCompra(id, compraData) {
    try {
      const compraAPI = this.transformarCompraParaAPI(compraData);
      this.validarDatosCompra(compraAPI);

      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: this.baseHeaders,
        body: JSON.stringify(compraAPI),
      });

      const data = await this.handleResponse(response);
      return this.transformarCompraDesdeAPI(data);
    } catch (error) {
      console.error('Error en actualizarCompra:', error);
      throw error;
    }
  }

  async eliminarCompra(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: this.baseHeaders,
      });
      await this.handleResponse(response);
      return { success: true, message: "Compra eliminada exitosamente" };
    } catch (error) {
      console.error('Error en eliminarCompra:', error);
      throw error;
    }
  }

  // Validaciones
  validarDatosCompra(compra) {
    const errores = [];
    
    if (!compra.idproveedor) errores.push("El proveedor es requerido");
    if (!compra.fechacompra) errores.push("La fecha de compra es requerida");
    if (!compra.subtotal || compra.subtotal <= 0) errores.push("El subtotal debe ser mayor a 0");
    if (!compra.total || compra.total <= 0) errores.push("El total debe ser mayor a 0");

    if (errores.length > 0) {
      throw new Error("Datos inválidos: " + errores.join(", "));
    }
  }

  // TRANSFORMACIONES - MEJORADAS
  transformarCompraParaAPI(compra) {
    return {
      idproveedor: compra.idProveedor,
      fecharegistro: compra.fechaRegistro || obtenerFechaColombia(),
      fechacompra: compra.fechaCompra,
      subtotal: parseFloat(compra.subtotal) || 0,
      iva: parseFloat(compra.iva) || 0,
      total: parseFloat(compra.total) || 0,
      observaciones: compra.observaciones || '',
      estado: compra.estado !== undefined ? compra.estado : true,
      detallecompra: compra.detalles ? compra.detalles.map(d => this.transformarDetalleCompraParaAPI(d)) : []
    };
  }

  transformarCompraDesdeAPI(compra) {
    if (!compra) return null;
    
    // TRANSFORMACIÓN MEJORADA CON LOGS
    console.log('Transformando compra:', compra.idcompra, 'Estado original:', compra.estado, typeof compra.estado);
    
    const resultado = {
      id: compra.idcompra || compra.id,
      idcompra: compra.idcompra || compra.id,
      idProveedor: compra.idproveedor || compra.idProveedor,
      fechaRegistro: compra.fecharegistro || compra.fechaRegistro,
      fechaCompra: compra.fechacompra || compra.fechaCompra,
      fechacompra: compra.fechacompra || compra.fechaCompra,
      subtotal: parseFloat(compra.subtotal) || 0,
      iva: parseFloat(compra.iva) || 0,
      total: parseFloat(compra.total) || 0,
      // IMPORTANTE: Asegurar que estado sea booleano
      estado: Boolean(compra.estado),
      observaciones: compra.observaciones || '',
      nombreProveedor: compra.nombreProveedor || compra.proveedor?.nombreproveedor || compra.proveedor?.nombreempresa,
      proveedor: this.transformarProveedorDesdeAPI(compra.proveedor || compra.Proveedor),
      detalles: this.transformarDetallesCompraDesdeAPI(compra.detallecompra || compra.detalles || compra.DetalleCompras || [])
    };
    
    console.log('Estado transformado final:', resultado.estado, typeof resultado.estado);
    console.log('Proveedor transformado:', resultado.proveedor);
    return resultado;
  }

  // ✅ CORRECCIÓN AQUÍ - Agregar todos los campos del proveedor incluido documento
  transformarProveedorDesdeAPI(proveedor) {
    if (!proveedor) return null;
    
    console.log('Transformando proveedor:', proveedor);
    
    return {
      id: proveedor.idproveedor || proveedor.id,
      idproveedor: proveedor.idproveedor || proveedor.id,
      idProveedor: proveedor.idproveedor || proveedor.id,
      nombre: proveedor.nombreproveedor || 
              proveedor.nombre || 
              proveedor.nombreempresa ||
              proveedor.nombreCategoria || 
              proveedor.nombre_proveedor,
      nombreproveedor: proveedor.nombreproveedor || proveedor.nombre,
      nombreempresa: proveedor.nombreempresa,
      // ✅ AGREGADO: Incluir documento/NIT
      documento: proveedor.documento || 
                 proveedor.nit || 
                 proveedor.documentoproveedor ||
                 proveedor.documentoProveedor ||
                 '',
      nit: proveedor.nit || proveedor.documento || '',
      telefono: proveedor.telefono || '',
      email: proveedor.email || proveedor.correo || '',
      direccion: proveedor.direccion || ''
    };
  }

  transformarComprasDesdeAPI(compras) {
    if (!Array.isArray(compras)) {
      console.warn('Las compras no son un array:', compras);
      return [];
    }
    return compras.map((c) => this.transformarCompraDesdeAPI(c));
  }

  // Transformaciones DETALLE COMPRA
  transformarDetalleCompraParaAPI(detalle) {
    return {
      idinsumos: detalle.idinsumos ?? detalle.idinsumo ?? detalle.idInsumo ?? detalle.id,
      cantidad: detalle.cantidad,
      preciounitario: detalle.preciounitario ?? detalle.precioUnitario,
      subtotalproducto: detalle.subtotalproducto ?? detalle.subtotalProducto
    };
  }

  transformarDetalleCompraDesdeAPI(detalle) {
    if (!detalle) return null;

    return {
      id: detalle.iddetallecompra || detalle.id,
      idCompra: detalle.idcompra || detalle.idCompra,
      idInsumo: detalle.idinsumos || detalle.idInsumo || null,
      cantidad: parseFloat(detalle.cantidad) || 0,
      precioUnitario: parseFloat(detalle.preciounitario || detalle.precioUnitario) || 0,
      subtotalProducto: parseFloat(detalle.subtotalproducto || detalle.subtotalProducto) || 0,
      insumo: detalle.insumos || detalle.insumo ? {
        id: (detalle.insumos || detalle.insumo).idinsumo || (detalle.insumos || detalle.insumo).id,
        nombre: (detalle.insumos || detalle.insumo).nombreinsumo || (detalle.insumos || detalle.insumo).nombre,
        unidad: (detalle.insumos || detalle.insumo).unidad || 'N/A'
      } : null
    };
  }

  transformarDetallesCompraDesdeAPI(detalles) {
    if (!Array.isArray(detalles)) return [];
    return detalles.map((d) => this.transformarDetalleCompraDesdeAPI(d));
  }
}

const compraApiService = new CompraApiService();
export default compraApiService;