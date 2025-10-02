// src/services/produccion_services.js

const BASE_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/produccion";

class ProduccionApiService {
  constructor() {
    this.baseHeaders = { "Content-Type": "application/json" };
  }

  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorDetails = null;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorDetails = errorData;
        console.error("🚨 Detalles del error de la API:", errorData);
      } catch (e) {
        console.error("❌ No se pudo parsear la respuesta de error:", e);
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.details = errorDetails;
      throw error;
    }
    return response.json();
  }

  async obtenerProducciones({ tipo } = {}) {
    try {
      const url = tipo ? `${BASE_URL}?tipo=${encodeURIComponent(tipo)}` : BASE_URL;
      const response = await fetch(url, {
        method: "GET",
        headers: this.baseHeaders,
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("❌ Error al obtener producciones:", error);
      throw error;
    }
  }

  async obtenerProduccionPorId(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "GET",
        headers: this.baseHeaders,
      });
      if (response.status === 404) throw new Error("Producción no encontrada");
      return this.handleResponse(response);
    } catch (error) {
      console.error(`❌ Error al obtener producción ${id}:`, error);
      throw error;
    }
  }

async crearProduccion(data) {
  try {
    console.log("📤 Payload que se envía al backend:", data); // 👀 log para debug

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: this.baseHeaders,
      body: JSON.stringify(data),
    });

    console.log("📥 Respuesta cruda del backend:", response); // 👀 log para ver status
    return this.handleResponse(response);
  } catch (error) {
    console.error("❌ Error al crear producción:", error);
    throw error;
  }
}


  async actualizarProduccion(id, data) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: this.baseHeaders,
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error(`❌ Error al actualizar producción ${id}:`, error);
      throw error;
    }
  }

  async actualizarEstado(id, estados) {
    try {
      const response = await fetch(`${BASE_URL}/${id}/estado`, {
        method: "PATCH",
        headers: this.baseHeaders,
        body: JSON.stringify(estados),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error(`❌ Error al actualizar estado de producción ${id}:`, error);
      throw error;
    }
  }

  async eliminarProduccion(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: this.baseHeaders,
      });
      await this.handleResponse(response);
      return { success: true, message: "Producción eliminada exitosamente" };
    } catch (error) {
      console.error(`❌ Error al eliminar producción ${id}:`, error);
      throw error;
    }
  }
}

const produccionApiService = new ProduccionApiService();
export default produccionApiService;
