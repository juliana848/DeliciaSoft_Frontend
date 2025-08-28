// Versión que replica exactamente lo que funciona en Postman
const BASE_URL = "https://deliciasoft-backend.onrender.com/api/proveedor";

class ProveedorApiService {
  constructor() {
    this.baseHeaders = { 
      'Content-Type': 'application/json'
    };
  }

  // Crear proveedor
  async crearProveedor(proveedorData) {
    const payload = this.crearPayloadPostman(proveedorData);
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: this.baseHeaders,
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return this.transformarProveedorDesdeAPI(data);
  }

  crearPayloadPostman(proveedorData) {
    return {
      tipodocumento: proveedorData.tipodocumento || "DNI",
      documento: parseInt(proveedorData.documento),
      nombreempresa: proveedorData.nombreempresa || null,
      nombreproveedor: proveedorData.nombreproveedor || null,
      contacto: parseInt(proveedorData.contacto),
      correo: proveedorData.correo,
      direccion: proveedorData.direccion,
      estado: proveedorData.estado,
      TipoProveedor: proveedorData.TipoProveedor || "Natural"
    };
  }

  // 🔄 Actualizar proveedor
  async actualizarProveedor(id, proveedorData) {
    const payload = this.crearPayloadPostman(proveedorData);
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: this.baseHeaders,
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return this.transformarProveedorDesdeAPI(data);
  }

  // 🗑️ Eliminar proveedor
  async eliminarProveedor(id) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: this.baseHeaders,
    });
    if (!response.ok) throw new Error(await response.text());
    return true;
  }

  // ✅ Cambiar solo el estado
  async cambiarEstadoProveedor(id, nuevoEstado) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: this.baseHeaders,
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return this.transformarProveedorDesdeAPI(data);
  }

  async obtenerProveedores() {
    const response = await fetch(BASE_URL, {
      method: 'GET',
      headers: this.baseHeaders,
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return this.transformarProveedoresDesdeAPI(data);
  }

  transformarProveedorDesdeAPI(proveedor) {
    if (!proveedor) return null;
    const tipoProveedor = proveedor.TipoProveedor || 'Natural';
    const esJuridico = tipoProveedor === 'Jurídico';
    return {
      idProveedor: proveedor.idproveedor,
      tipo: tipoProveedor,
      tipoDocumento: proveedor.tipodocumento,
      documento: proveedor.documento ? String(proveedor.documento) : '',
      extra: proveedor.documento ? String(proveedor.documento) : '',
      nombre: esJuridico ? (proveedor.nombreempresa || '') : (proveedor.nombreproveedor || ''),
      nombreProveedor: proveedor.nombreproveedor || '',
      nombreEmpresa: proveedor.nombreempresa || '',
      nombreContacto: esJuridico ? (proveedor.nombreproveedor || '') : '',
      contacto: proveedor.contacto ? String(proveedor.contacto) : '',
      correo: proveedor.correo || '',
      direccion: proveedor.direccion || '',
      estado: Boolean(proveedor.estado)
    };
  }

  transformarProveedoresDesdeAPI(proveedores) {
    return Array.isArray(proveedores) 
      ? proveedores.map(p => this.transformarProveedorDesdeAPI(p)).filter(p => p !== null)
      : [];
  }
}

const proveedorApiService = new ProveedorApiService();
export default proveedorApiService;
  