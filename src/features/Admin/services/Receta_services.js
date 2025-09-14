// URLs corregidas basadas en las rutas del backend
const BASE_URL = "https://deliciasoft-backend.onrender.com/api/receta/recetas";
const DETALLE_RECETA_URL = "https://deliciasoft-backend.onrender.com/api/receta/detalle-recetas";
const INSUMOS_URL = "https://deliciasoft-backend.onrender.com/api/insumos";
const UNIDADES_URL = "https://deliciasoft-backend.onrender.com/api/unidadmedida";

class RecetaApiService {
  constructor() {
    this.baseHeaders = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };
  }

  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorDetails = {};
      
      try {
        const errorData = await response.json();
        console.error('Error details from backend:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorDetails = errorData;
      } catch (e) {
        try {
          const errorText = await response.text();
          console.error('Error text from backend:', errorText);
          errorMessage = errorText || errorMessage;
          errorDetails.rawError = errorText;
        } catch (textError) {
          console.error('Could not parse error response');
        }
      }
      
      errorDetails.statusCode = response.status;
      errorDetails.statusText = response.statusText;
      
      const error = new Error(errorMessage);
      error.details = errorDetails;
      throw error;
    }
    return response.json();
  }

  async obtenerRecetas() {
    try {
      console.log('Obteniendo recetas desde:', BASE_URL);
      
      const response = await fetch(BASE_URL, {
        method: "GET",
        headers: this.baseHeaders,
      });
      
      const data = await this.handleResponse(response);
      console.log('Recetas obtenidas:', data.length);
      
      return data;
    } catch (error) {
      console.error('Error en obtenerRecetas:', error);
      throw error;
    }
  }

  async obtenerRecetaPorId(id) {
    try {
      console.log(`Buscando receta ID: ${id}`);
      
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "GET",
        headers: this.baseHeaders,
      });
      
      if (response.status === 404) {
        throw new Error("Receta no encontrada");
      }
      
      const receta = await this.handleResponse(response);
      console.log('Receta encontrada:', receta.nombrereceta);
      
      return receta;
    } catch (error) {
      console.error('Error al obtener receta por ID:', error);
      throw error;
    }
  }

  async crearReceta(recetaData) {
    try {
      console.log('Creando nueva receta:', recetaData.nombrereceta);

      // Validar datos de entrada
      this.validarDatosReceta(recetaData);

      // Preparar datos para el backend
      const datosCompletos = {
        nombrereceta: recetaData.nombrereceta.trim(),
        especificaciones: recetaData.especificaciones?.trim() || "Sin especificaciones",
        insumos: recetaData.insumos || []
      };

      console.log('Enviando datos:', datosCompletos);

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: this.baseHeaders,
        body: JSON.stringify(datosCompletos),
      });

      const recetaCreada = await this.handleResponse(response);
      console.log('Receta creada exitosamente:', recetaCreada);

      return recetaCreada;

    } catch (error) {
      console.error('Error al crear receta:', error);
      throw error;
    }
  }

  async actualizarReceta(id, recetaData) {
    try {
      console.log(`Actualizando receta ID: ${id}`);
      
      // Validar datos
      this.validarDatosReceta(recetaData);

      const datosActualizacion = {
        nombrereceta: recetaData.nombrereceta?.trim(),
        especificaciones: recetaData.especificaciones?.trim(),
        insumos: recetaData.insumos || []
      };

      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: this.baseHeaders,
        body: JSON.stringify(datosActualizacion),
      });

      const recetaActualizada = await this.handleResponse(response);
      console.log('Receta actualizada:', recetaActualizada);

      return recetaActualizada;

    } catch (error) {
      console.error('Error al actualizar receta:', error);
      throw error;
    }
  }

  async eliminarReceta(id) {
    try {
      console.log(`Eliminando receta ID: ${id}`);
      
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: this.baseHeaders,
      });

      const resultado = await this.handleResponse(response);
      console.log('Receta eliminada:', resultado);

      return resultado;

    } catch (error) {
      console.error('Error al eliminar receta:', error);
      throw error;
    }
  }

  async obtenerInsumos() {
    try {
      console.log('Obteniendo insumos disponibles...');
      
      const response = await fetch(INSUMOS_URL, {
        method: "GET",
        headers: this.baseHeaders,
      });

      const insumos = await this.handleResponse(response);
      console.log(`Insumos obtenidos: ${insumos.length}`);
      
      // Filtrar solo insumos activos
      return insumos.filter(insumo => insumo.estado === true);

    } catch (error) {
      console.error('Error al obtener insumos:', error);
      throw error;
    }
  }

  async obtenerUnidadesMedida() {
    try {
      console.log('Obteniendo unidades de medida...');
      
      const response = await fetch(UNIDADES_URL, {
        method: "GET",
        headers: this.baseHeaders,
      });

      const unidades = await this.handleResponse(response);
      console.log(`Unidades obtenidas: ${unidades.length}`);
      
      return unidades;

    } catch (error) {
      console.error('Error al obtener unidades:', error);
      throw error;
    }
  }

  async obtenerDetallesReceta(idReceta) {
    try {
      console.log(`Obteniendo detalles de receta: ${idReceta}`);
      
      const response = await fetch(`${DETALLE_RECETA_URL}/receta/${idReceta}`, {
        method: "GET",
        headers: this.baseHeaders,
      });

      if (response.status === 404) {
        return [];
      }

      const detalles = await this.handleResponse(response);
      console.log(`Detalles obtenidos: ${detalles.length}`);
      
      return detalles;

    } catch (error) {
      console.error('Error obteniendo detalles:', error);
      return [];
    }
  }

  async buscarRecetas(parametros = {}) {
    try {
      console.log('Buscando recetas con parámetros:', parametros);
      
      // Construir query string
      const queryParams = new URLSearchParams();
      
      if (parametros.q) queryParams.append('q', parametros.q);
      if (parametros.categoria) queryParams.append('categoria', parametros.categoria);
      if (parametros.conInsumos) queryParams.append('conInsumos', parametros.conInsumos);
      
      const url = `https://deliciasoft-backend.onrender.com/api/receta/recetas/search?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: this.baseHeaders,
      });

      const resultados = await this.handleResponse(response);
      console.log(`Búsqueda completada: ${resultados.total} resultados`);
      
      return resultados;

    } catch (error) {
      console.error('Error en búsqueda:', error);
      throw error;
    }
  }

  async obtenerEstadisticas() {
    try {
      console.log('Obteniendo estadísticas de recetas...');
      
      const response = await fetch(`https://deliciasoft-backend.onrender.com/api/receta/recetas/estadisticas`, {
        method: "GET",
        headers: this.baseHeaders,
      });

      const estadisticas = await this.handleResponse(response);
      console.log('Estadísticas obtenidas:', estadisticas);
      
      return estadisticas;

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  validarDatosReceta(receta) {
    const errores = [];

    if (!receta.nombrereceta || !receta.nombrereceta.trim()) {
      errores.push("El nombre de la receta es requerido");
    }

    if (receta.nombrereceta && receta.nombrereceta.trim().length > 50) {
      errores.push("El nombre de la receta no puede exceder 50 caracteres");
    }

    if (receta.especificaciones && receta.especificaciones.length > 80) {
      errores.push("Las especificaciones no pueden exceder 80 caracteres");
    }

    if (receta.insumos && Array.isArray(receta.insumos)) {
      receta.insumos.forEach((insumo, index) => {
        if (!insumo.id && !insumo.idinsumo) {
          errores.push(`Insumo en posición ${index + 1} no tiene ID válido`);
        }

        const cantidad = parseFloat(insumo.cantidad);
        if (isNaN(cantidad) || cantidad <= 0) {
          errores.push(`Insumo "${insumo.nombre || 'Desconocido'}" debe tener cantidad válida > 0`);
        }
      });
    }

    if (errores.length > 0) {
      console.error('Errores de validación:', errores);
      throw new Error("Datos inválidos: " + errores.join(", "));
    }

    console.log('Validación exitosa');
  }

  calcularCostoReceta(receta) {
    if (!receta.insumos || !Array.isArray(receta.insumos)) {
      return 0;
    }

    const costo = receta.insumos.reduce((total, insumo) => {
      const precio = parseFloat(insumo.precio) || 0;
      const cantidad = parseFloat(insumo.cantidad) || 1;
      return total + (precio * cantidad);
    }, 0);

    return Math.round(costo);
  }

  formatearCosto(costo) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(costo || 0);
  }

  async testConnection() {
    try {
      console.log('Testando conexión...');
      
      const response = await fetch(BASE_URL, {
        method: "GET",
        headers: this.baseHeaders,
      });
      
      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Conexión exitosa' : `Error HTTP ${response.status}`
      };
    } catch (error) {
      console.error('Error en test:', error);
      return {
        success: false,
        error: error.message,
        message: 'No se pudo conectar con el servidor'
      };
    }
  }
}

// Exportar una instancia del servicio
const recetaApiService = new RecetaApiService();
export default recetaApiService;