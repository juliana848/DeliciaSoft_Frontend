const BASE_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/categoria-insumos";

class CategoriaInsumoApiService {
  constructor() {
    this.baseHeaders = { "Content-Type": "application/json" };
  }

  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }
    return response.json();
  }


  async obtenerCategorias() {
    const response = await fetch(`${BASE_URL}`, {
      method: "GET",
      headers: this.baseHeaders,
    });
    const data = await this.handleResponse(response);
    return this.transformarCategoriasDesdeAPI(data);
  }

  async obtenerCategoriaPorId(id) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: this.baseHeaders,
    });
    if (response.status === 404) throw new Error("Categoría no encontrada");
    const data = await this.handleResponse(response);
    return this.transformarCategoriaDesdeAPI(data);
  }

  async crearCategoria(categoriaData) {
    const categoriaAPI = this.transformarCategoriaParaAPI(categoriaData);
    this.validarDatosCategoria(categoriaAPI);

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: this.baseHeaders,
      body: JSON.stringify(categoriaAPI),
    });

    const data = await this.handleResponse(response);
    return this.transformarCategoriaDesdeAPI(data);
  }


  async actualizarCategoria(id, categoriaData) {
    const categoriaAPI = this.transformarCategoriaParaAPI(categoriaData);
    this.validarDatosCategoria(categoriaAPI);

    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: this.baseHeaders,
      body: JSON.stringify(categoriaAPI),
    });

    const data = await this.handleResponse(response);
    return this.transformarCategoriaDesdeAPI(data);
  }


  async eliminarCategoria(id) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: this.baseHeaders,
    });
    await this.handleResponse(response);
    return { success: true, message: "Categoría eliminada exitosamente" };
  }


  async cambiarEstadoCategoria(id, nuevoEstado) {
    const categoriaActual = await this.obtenerCategoriaPorId(id);
    const datosActualizados = {
      ...this.transformarCategoriaParaAPI(categoriaActual),
      estado: nuevoEstado,
    };

    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: this.baseHeaders,
      body: JSON.stringify(datosActualizados),
    });

    const data = await this.handleResponse(response);
    return this.transformarCategoriaDesdeAPI(data);
  }


  validarDatosCategoria(categoria) {
    const errores = [];
    if (!categoria.nombrecategoria) errores.push("El nombre de la categoría es requerido");
    if (!categoria.descripcion) errores.push("La descripción es requerida");

    if (errores.length > 0) {
      throw new Error("Datos inválidos: " + errores.join(", "));
    }
  }


  transformarCategoriaParaAPI(categoria) {
    return {
      nombrecategoria: categoria.nombreCategoria,
      descripcion: categoria.descripcion,
      estado: categoria.estado !== undefined ? Boolean(categoria.estado) : true,
    };
  }


  transformarCategoriaDesdeAPI(categoria) {
    if (!categoria) return null;
    return {
      id: categoria.idcategoriainsumos,
      nombreCategoria: categoria.nombrecategoria,
      descripcion: categoria.descripcion,
      estado: categoria.estado,
    };
  }


  transformarCategoriasDesdeAPI(categorias) {
    if (!Array.isArray(categorias)) return [];
    return categorias.map((c) => this.transformarCategoriaDesdeAPI(c));
  }
}


const categoriaInsumoApiService = new CategoriaInsumoApiService();
export default categoriaInsumoApiService;
