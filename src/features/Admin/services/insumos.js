const BASE_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/insumos";
const CATEGORIAS_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/categoria-insumos";
const UNIDADES_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/unidadmedida";

// ✅ 5 CATÁLOGOS: Adiciones, Toppings, Salsas, Sabores, Rellenos
const CATALOGO_ADICIONES_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-adiciones";
const CATALOGO_TOPPINGS_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-toppings";
const CATALOGO_SALSAS_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-salsas";
const CATALOGO_SABORES_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-sabor";
const CATALOGO_RELLENOS_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-relleno";

class InsumoApiService {
  constructor() {
    this.baseHeaders = { "Content-Type": "application/json" };
    this.unidadesCache = null;
    this.categoriasCache = null;
  }

  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error('Error de la API:', errorData);
      } catch (e) {
        console.error('No se pudo parsear la respuesta:', e);
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }
    return response.json();
  }

  async crearMultiplesCatalogos(insumoId, catalogos) {
    try {
      console.log('🎯 CREANDO MÚLTIPLES CATÁLOGOS');
      console.log('ID Insumo:', insumoId);
      console.log('Catálogos a crear:', JSON.stringify(catalogos, null, 2));

      const resultados = [];

      for (const catalogo of catalogos) {
        try {
          console.log(`\n📦 Procesando catálogo tipo: ${catalogo.tipo}`);

          let url;
          switch (catalogo.tipo.toLowerCase()) {
            case 'adicion':
              url = CATALOGO_ADICIONES_URL;
              break;
            case 'topping':
              url = CATALOGO_TOPPINGS_URL;
              break;
            case 'salsa':
              url = CATALOGO_SALSAS_URL;
              break;
            case 'sabor':
              url = CATALOGO_SABORES_URL;
              break;
            case 'relleno':
              url = CATALOGO_RELLENOS_URL;
              break;
            default:
              throw new Error(`Tipo de catálogo inválido: ${catalogo.tipo}`);
          }

          const datosParaEnviar = {
            idinsumos: parseInt(insumoId),
            nombre: catalogo.nombre.trim(),
            precioadicion: parseFloat(catalogo.precioadicion || 0),
            estado: Boolean(catalogo.estado)
          };

          console.log(`Enviando a: ${url}`);
          console.log('Datos:', JSON.stringify(datosParaEnviar, null, 2));

          const response = await fetch(url, {
            method: "POST",
            headers: this.baseHeaders,
            body: JSON.stringify(datosParaEnviar),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error en ${catalogo.tipo}:`, errorText);
            resultados.push({
              tipo: catalogo.tipo,
              exito: false,
              error: errorText
            });
            continue;
          }

          const resultado = await response.json();
          console.log(`✅ ${catalogo.tipo} creado:`, resultado);
          resultados.push({
            tipo: catalogo.tipo,
            exito: true,
            data: resultado
          });

        } catch (error) {
          console.error(`Error creando catálogo ${catalogo.tipo}:`, error);
          resultados.push({
            tipo: catalogo.tipo,
            exito: false,
            error: error.message
          });
        }
      }

      console.log('\n📊 Resumen de catálogos:', resultados);
      return resultados;

    } catch (error) {
      console.error('Error en crearMultiplesCatalogos:', error);
      throw error;
    }
  }

  transformarInsumoParaAPI(insumo) {
    console.log("TRANSFORMANDO INSUMO PARA API");
    console.log("Datos originales:", JSON.stringify(insumo, null, 2));

    const transformed = {
      idinsumo: insumo.id || insumo.idinsumo || insumo.idInsumo,
      nombreinsumo: insumo.nombreInsumo ? String(insumo.nombreInsumo).trim() : "",
      idcategoriainsumos: insumo.idCategoriaInsumos ? parseInt(insumo.idCategoriaInsumos) : null,
      idunidadmedida: insumo.idUnidadMedida ? parseInt(insumo.idUnidadMedida) : null,
      cantidad:
        insumo.cantidad !== undefined && insumo.cantidad !== null && insumo.cantidad !== ""
          ? parseFloat(insumo.cantidad)
          : 0,
      precio: 
        insumo.precio !== undefined && insumo.precio !== null && insumo.precio !== ""
        ? parseFloat(insumo.precio)
        : 0,
      stockminimo: 
        (insumo.stockMinimo !== undefined && insumo.stockMinimo !== null && insumo.stockMinimo !== "")
          ? parseInt(insumo.stockMinimo)
          : (insumo.stockminimo !== undefined && insumo.stockminimo !== null && insumo.stockminimo !== "")
          ? parseInt(insumo.stockminimo)
          : 5,
      estado: insumo.estado !== undefined ? Boolean(insumo.estado) : true,
    };

    if (insumo.idImagen && insumo.idImagen !== null && insumo.idImagen !== "") {
      transformed.idimagen = parseInt(insumo.idImagen);
      console.log("ID de imagen incluido:", transformed.idimagen);
    }

    console.log("Datos transformados:", JSON.stringify(transformed, null, 2));
    return transformed;
  }

  async crearInsumo(insumoData) {
    try {
      console.log('🚀 INICIANDO CREACIÓN DE INSUMO');
      console.log('Datos recibidos:', JSON.stringify(insumoData, null, 2));

      const catalogosSeleccionados = insumoData.catalogosSeleccionados || [];
      const nombreCatalogo = insumoData.nombreCatalogo;
      const precioadicion = insumoData.precioadicion;
      const estadoCatalogo = insumoData.estadoCatalogo;

      console.log('Catálogos seleccionados:', catalogosSeleccionados);

      this.limpiarCache();

      const insumoAPI = this.transformarInsumoParaAPI(insumoData);
      console.log('Datos transformados:', JSON.stringify(insumoAPI, null, 2));

      this.validarDatosInsumo(insumoAPI);
      await this.verificarIDsValidos(insumoAPI);

      console.log('📤 Enviando insumo al servidor...');
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: this.baseHeaders,
        body: JSON.stringify(insumoAPI),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }

      const insumoCreado = await response.json();
      console.log('✅ Insumo creado:', insumoCreado);

      const insumoId = insumoCreado.idinsumo;

      if (catalogosSeleccionados && catalogosSeleccionados.length > 0) {
        console.log('🎯 Creando catálogos múltiples...');
        
        const catalogosParaCrear = catalogosSeleccionados.map(tipo => ({
          tipo: tipo,
          nombre: nombreCatalogo,
          precioadicion: parseFloat(precioadicion || 0),
          estado: estadoCatalogo
        }));

        console.log('Catálogos a crear:', JSON.stringify(catalogosParaCrear, null, 2));

        const resultadosCatalogos = await this.crearMultiplesCatalogos(insumoId, catalogosParaCrear);
        
        const algunoExitoso = resultadosCatalogos.some(r => r.exito);
        if (!algunoExitoso) {
          console.error('⚠️ Ningún catálogo se creó exitosamente');
        }
      }

      return this.transformarInsumoDesdeAPI(insumoCreado);

    } catch (error) {
      console.error('❌ ERROR EN CREACIÓN DE INSUMO');
      console.error('Mensaje:', error.message);
      throw error;
    }
  }

  async actualizarInsumo(id, insumoData) {
    try {
      console.log("=== ACTUALIZANDO INSUMO ===");
      console.log("ID:", id);
      console.log("Datos:", JSON.stringify(insumoData, null, 2));

      const catalogosSeleccionados = insumoData.catalogosSeleccionados || [];
      const nombreCatalogo = insumoData.nombreCatalogo;
      const precioadicion = insumoData.precioadicion;
      const estadoCatalogo = insumoData.estadoCatalogo;

      const insumoAPI = this.transformarInsumoParaAPI({
        ...insumoData,
        cantidad: Number(insumoData.cantidad) || 0,
      });

      await this.verificarIDsValidos(insumoAPI);
      this.validarDatosInsumo(insumoAPI);

      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: this.baseHeaders,
        body: JSON.stringify(insumoAPI),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      if (catalogosSeleccionados && catalogosSeleccionados.length > 0) {
        console.log('🎯 Creando catálogos múltiples durante la actualización...');
        
        const catalogosParaCrear = catalogosSeleccionados.map(tipo => ({
          tipo: tipo,
          nombre: nombreCatalogo,
          precioadicion: parseFloat(precioadicion || 0),
          estado: estadoCatalogo
        }));

        console.log('Catálogos a crear:', JSON.stringify(catalogosParaCrear, null, 2));

        const resultadosCatalogos = await this.crearMultiplesCatalogos(id, catalogosParaCrear);
        
        const algunoExitoso = resultadosCatalogos.some(r => r.exito);
        if (!algunoExitoso) {
          console.error('⚠️ Ningún catálogo se creó exitosamente');
        }
      }

      return this.transformarInsumoDesdeAPI(data);

    } catch (error) {
      console.error(`Error al actualizar insumo ${id}:`, error);
      throw error;
    }
  }

  async eliminarInsumo(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: this.baseHeaders,
      });
      await this.handleResponse(response);
      return { success: true };
    } catch (error) {
      console.error(`Error al eliminar insumo ${id}:`, error);
      throw error;
    }
  }

  async cambiarEstadoInsumo(id, nuevoEstado) {
    try {
      console.log(`Cambiando estado de ${id} a:`, nuevoEstado);
      
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "GET",
        headers: this.baseHeaders,
      });

      if (!response.ok) {
        throw new Error(`No se pudo obtener el insumo: ${response.status}`);
      }

      const insumoActual = await response.json();

      const datosActualizados = {
        nombreinsumo: insumoActual.nombreinsumo,
        idcategoriainsumos: insumoActual.idcategoriainsumos,
        idunidadmedida: insumoActual.idunidadmedida,
        estado: nuevoEstado,
        cantidad: parseFloat(insumoActual.cantidad || 0),
        precio: parseFloat(insumoActual.precio || 0),
        stockminimo: parseInt(insumoActual.stockminimo || 5)
      };

      const updateResponse = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: this.baseHeaders,
        body: JSON.stringify(datosActualizados),
      });

      if (!updateResponse.ok) {
        throw new Error(`Error al cambiar estado: ${updateResponse.status}`);
      }

      const data = await updateResponse.json();
      return this.transformarInsumoDesdeAPI(data);

    } catch (error) {
      console.error(`Error al cambiar estado del insumo ${id}:`, error);
      throw error;
    }
  }

  // 🆕 MÉTODO ACTUALIZADO: Ordena por ID descendente (más recientes primero)
  async obtenerInsumos() {
    try {
      const response = await fetch(`${BASE_URL}`, {
        method: "GET",
        headers: this.baseHeaders,
      });
      const data = await this.handleResponse(response);
      const insumosEnriquecidos = await this.enriquecerInsumosConReferencias(data);
      const insumosTransformados = this.transformarInsumosDesdeAPI(insumosEnriquecidos);
      
      // ✅ ORDENAR POR ID DESCENDENTE (más recientes primero)
      return insumosTransformados.sort((a, b) => {
        const idA = a.id || 0;
        const idB = b.id || 0;
        return idB - idA; // Orden descendente
      });
    } catch (error) {
      console.error('Error al obtener insumos:', error);
      throw error;
    }
  }

  async obtenerInsumoPorId(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "GET",
        headers: this.baseHeaders,
      });
      if (response.status === 404) throw new Error("Insumo no encontrado");
      const data = await this.handleResponse(response);
      const [insumoEnriquecido] = await this.enriquecerInsumosConReferencias([data]);
      return this.transformarInsumoDesdeAPI(insumoEnriquecido);
    } catch (error) {
      console.error(`Error al obtener insumo ${id}:`, error);
      throw error;
    }
  }

  async enriquecerInsumosConReferencias(insumos) {
    try {
      if (!Array.isArray(insumos) || insumos.length === 0) return insumos;

      const [unidades, categorias] = await Promise.all([
        this.obtenerUnidadesMedida(),
        this.obtenerCategorias()
      ]);

      return insumos.map(insumo => {
        const unidad = unidades.find(u => parseInt(u.idunidadmedida) === parseInt(insumo.idunidadmedida));
        const categoria = categorias.find(c => parseInt(c.id || c.idcategoriainsumos) === parseInt(insumo.idcategoriainsumos));
        
        return {
          ...insumo,
          nombreUnidadMedida: unidad ? unidad.unidadmedida : 'Unidad desconocida',
          nombreCategoria: categoria ? (categoria.nombre || categoria.nombrecategoria) : 'Categoría desconocida'
        };
      });
    } catch (error) {
      console.error('Error al enriquecer insumos:', error);
      return insumos;
    }
  }

  async obtenerUnidadesMedida() {
    try {
      if (this.unidadesCache && this.unidadesCache.length > 0) {
        return this.unidadesCache;
      }
      
      const response = await fetch(UNIDADES_URL, {
        method: "GET",
        headers: this.baseHeaders,
      });

      const data = await this.handleResponse(response);
      this.unidadesCache = Array.isArray(data) ? data : [];
      return this.unidadesCache;

    } catch (error) {
      console.error('Error al obtener unidades:', error);
      return [];
    }
  }

  async obtenerCategorias() {
    try {
      if (this.categoriasCache && this.categoriasCache.length > 0) {
        return this.categoriasCache;
      }
      
      const response = await fetch(CATEGORIAS_URL, {
        method: "GET",
        headers: this.baseHeaders,
      });

      const data = await this.handleResponse(response);
      this.categoriasCache = Array.isArray(data) ? data : [];
      return this.categoriasCache;

    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return [];
    }
  }

  async obtenerCatalogos(tipoCatalogo) {
    try {
      let url;
      
      switch (tipoCatalogo.toLowerCase()) {
        case 'adicion':
          url = CATALOGO_ADICIONES_URL;
          break;
        case 'topping':
          url = CATALOGO_TOPPINGS_URL;
          break;
        case 'salsa':
          url = CATALOGO_SALSAS_URL;
          break;
        case 'sabor':
          url = CATALOGO_SABORES_URL;
          break;
        case 'relleno':
          url = CATALOGO_RELLENOS_URL;
          break;
        default:
          throw new Error(`Tipo de catálogo inválido: ${tipoCatalogo}`);
      }

      const response = await fetch(url, {
        method: "GET",
        headers: this.baseHeaders,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error al obtener catálogos de ${tipoCatalogo}:`, error);
      throw error;
    }
  }

  validarDatosInsumo(insumo) {
    const errores = [];
    
    if (!insumo.nombreinsumo || insumo.nombreinsumo.trim() === '') {
      errores.push("El nombre del insumo es requerido");
    }
    
    if (!insumo.idcategoriainsumos || parseInt(insumo.idcategoriainsumos) <= 0) {
      errores.push("La categoría es requerida");
    }
    
    if (!insumo.idunidadmedida || parseInt(insumo.idunidadmedida) <= 0) {
      errores.push("La unidad de medida es requerida");
    }

    if (errores.length > 0) {
      throw new Error("Datos inválidos: " + errores.join("; "));
    }
  }

  async verificarIDsValidos(insumo) {
    try {
      const [unidades, categorias] = await Promise.all([
        this.obtenerUnidadesMedida(),
        this.obtenerCategorias()
      ]);

      const categoriaExiste = categorias.some(c => parseInt(c.id || c.idcategoriainsumos) === parseInt(insumo.idcategoriainsumos));
      if (!categoriaExiste) {
        throw new Error(`La categoría ID ${insumo.idcategoriainsumos} no existe`);
      }

      const unidadExiste = unidades.some(u => parseInt(u.idunidadmedida) === parseInt(insumo.idunidadmedida));
      if (!unidadExiste) {
        throw new Error(`La unidad de medida ID ${insumo.idunidadmedida} no existe`);
      }

      return true;
    } catch (error) {
      console.error('Error en verificación de IDs:', error);
      throw error;
    }
  }

  transformarInsumoDesdeAPI(insumo) {
    if (!insumo) return null;
    
    return {
      id: insumo.idinsumo,
      nombreInsumo: insumo.nombreinsumo,
      idCategoriaInsumos: insumo.idcategoriainsumos,
      idUnidadMedida: insumo.idunidadmedida,
      cantidad: insumo.cantidad,
      precio: insumo.precio,
      stockMinimo: insumo.stockminimo || insumo.stockMinimo || 5,
      estado: insumo.estado,
      idImagen: insumo.idimagen,
      nombreUnidadMedida: insumo.unidadmedida 
        ? insumo.unidadmedida.unidadmedida 
        : (insumo.nombreUnidadMedida || "Unidad desconocida"),
      nombreCategoria: insumo.categoriainsumos 
        ? insumo.categoriainsumos.nombrecategoria 
        : (insumo.nombreCategoria || "Categoría desconocida")
    };
  }

  transformarInsumosDesdeAPI(insumos) {
    if (!Array.isArray(insumos)) return [];
    return insumos.map((i) => this.transformarInsumoDesdeAPI(i));
  }

  limpiarCache() {
    this.unidadesCache = null;
    this.categoriasCache = null;
  }

  async crearCatalogo(tipoCatalogo, datos) {
    let url;
    
    switch (tipoCatalogo.toLowerCase()) {
      case 'adicion':
        url = CATALOGO_ADICIONES_URL;
        break;
      case 'topping':
        url = CATALOGO_TOPPINGS_URL;
        break;
      case 'salsa':
        url = CATALOGO_SALSAS_URL;
        break;
      case 'sabor':
        url = CATALOGO_SABORES_URL;
        break;
      case 'relleno':
        url = CATALOGO_RELLENOS_URL;
        break;
      default:
        throw new Error(`Tipo de catálogo inválido: ${tipoCatalogo}`);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: this.baseHeaders,
      body: JSON.stringify(datos),
    });

    return await this.handleResponse(response);
  }
}

const insumoApiService = new InsumoApiService();
export default insumoApiService;