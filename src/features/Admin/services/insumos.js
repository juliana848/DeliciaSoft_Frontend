const BASE_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/insumos";
const CATEGORIAS_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/categoria-insumos";
const UNIDADES_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/unidadmedida";

// URLs para los catálogos
const CATALOGO_ADICIONES_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-adiciones";
const CATALOGO_RELLENOS_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-relleno";
const CATALOGO_SABORES_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-sabor";

class InsumoApiService {
  constructor() {
    this.baseHeaders = { "Content-Type": "application/json" };
    this.unidadesCache = null;
    this.categoriasCache = null;
  }

  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorDetails = null;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorDetails = errorData;
        console.error('Error de la API:', errorData);
      } catch (e) {
        console.error('No se pudo parsear la respuesta de error:', e);
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.details = errorDetails;
      throw error;
    }
    return response.json();
  }

  // FUNCIÓN PARA CREAR CATÁLOGOS (mantenida para compatibilidad)
  async crearCatalogo(tipoCatalogo, datosCatalogo) {
    try {
      console.log('CREANDO CATÁLOGO');
      console.log('Tipo:', tipoCatalogo);
      console.log('Datos:', JSON.stringify(datosCatalogo, null, 2));

      let url;
      let datosAPI;

      switch (tipoCatalogo.toLowerCase()) {
        case 'adicion':
        case 'adiciones':
          url = CATALOGO_ADICIONES_URL;
          datosAPI = {
            idinsumos: parseInt(datosCatalogo.idinsumos),
            nombre: datosCatalogo.nombre.trim(),
            precioadicion: parseFloat(datosCatalogo.precioadicion),
            estado: Boolean(datosCatalogo.estado)
          };
          break;

        case 'relleno':
        case 'rellenos':
          url = CATALOGO_RELLENOS_URL;
          datosAPI = {
            idinsumos: parseInt(datosCatalogo.idinsumos),
            nombre: datosCatalogo.nombre.trim(),
            precioadicion: parseFloat(datosCatalogo.precioadicion),
            estado: Boolean(datosCatalogo.estado)
          };
          break;

        case 'sabor':
        case 'sabores':
          url = CATALOGO_SABORES_URL;
          datosAPI = {
            idinsumos: parseInt(datosCatalogo.idinsumos),
            nombre: datosCatalogo.nombre.trim(),
            precioadicion: parseFloat(datosCatalogo.precioadicion),
            estado: Boolean(datosCatalogo.estado)
          };
          break;

        default:
          throw new Error(`Tipo de catálogo no válido: ${tipoCatalogo}`);
      }

      console.log('Enviando datos a:', url);
      console.log('Datos preparados:', JSON.stringify(datosAPI, null, 2));

      const response = await fetch(url, {
        method: "POST",
        headers: this.baseHeaders,
        body: JSON.stringify(datosAPI),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`Error al crear catálogo: ${response.status} - ${errorText}`);
      }

      const resultado = await response.json();
      console.log('Catálogo creado exitosamente:', resultado);
      
      return resultado;
    } catch (error) {
      console.error('Error en crearCatalogo:', error);
      throw error;
    }
  }

  // ⭐ NUEVA FUNCIÓN: Crear catálogo automáticamente después de crear insumo
  async crearCatalogoAutomatico(insumoId, datosCatalogo) {
    try {
      console.log('🎯 CREANDO CATÁLOGO AUTOMÁTICO');
      console.log('ID Insumo:', insumoId);
      console.log('Datos catálogo:', JSON.stringify(datosCatalogo, null, 2));

      const { tipo, nombre, precioadicion, estado } = datosCatalogo;

      // Preparar datos para enviar
      const datosParaEnviar = {
        idinsumos: parseInt(insumoId),
        nombre: nombre.trim(),
        precioadicion: parseFloat(precioadicion),
        estado: Boolean(estado)
      };

      // Determinar URL según el tipo
      let url;
      switch (tipo.toLowerCase()) {
        case 'adicion':
          url = CATALOGO_ADICIONES_URL;
          break;
        case 'sabor':
          url = CATALOGO_SABORES_URL;
          break;
        case 'relleno':
          url = CATALOGO_RELLENOS_URL;
          break;
        default:
          throw new Error(`Tipo de catálogo no válido: ${tipo}`);
      }

      console.log('Enviando a:', url);
      console.log('Datos:', JSON.stringify(datosParaEnviar, null, 2));

      const response = await fetch(url, {
        method: "POST",
        headers: this.baseHeaders,
        body: JSON.stringify(datosParaEnviar),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error al crear catálogo:', errorText);
        throw new Error(`Error al crear catálogo: ${response.status} - ${errorText}`);
      }

      const resultado = await response.json();
      console.log('✅ Catálogo creado exitosamente:', resultado);
      
      return resultado;
    } catch (error) {
      console.error('❌ Error en crearCatalogoAutomatico:', error);
      // No lanzamos el error para que no falle toda la operación
      // Solo registramos el error
      console.warn('⚠️ El insumo se creó pero el catálogo falló. Puedes agregarlo manualmente después.');
      return null;
    }
  }

  // FUNCIÓN PARA OBTENER CATÁLOGOS
  async obtenerCatalogos(tipoCatalogo) {
    try {
      let url;
      
      switch (tipoCatalogo.toLowerCase()) {
        case 'adicion':
        case 'adiciones':
          url = CATALOGO_ADICIONES_URL;
          break;
        case 'relleno':
        case 'rellenos':
          url = CATALOGO_RELLENOS_URL;
          break;
        case 'sabor':
        case 'sabores':
          url = CATALOGO_SABORES_URL;
          break;
        default:
          throw new Error(`Tipo de catálogo no válido: ${tipoCatalogo}`);
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

  async obtenerUnidadesMedida() {
    try {
      if (this.unidadesCache && this.unidadesCache.length > 0) {
        console.log('Usando unidades desde cache:', this.unidadesCache);
        return this.unidadesCache;
      }
      
      console.log('OBTENIENDO UNIDADES DE MEDIDA');
      console.log('URL:', UNIDADES_URL);
      
      const response = await fetch(UNIDADES_URL, {
        method: "GET",
        headers: this.baseHeaders,
      });
      
      console.log('Response status:', response.status);

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        console.error('Response no OK:', response.status, responseText);
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }
      
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : null;
        console.log('Datos parseados:', data);
      } catch (parseError) {
        console.error('Error al parsear JSON:', parseError);
        throw new Error(`Error parsing JSON: ${parseError.message}`);
      }
      
      if (!data) {
        throw new Error('La respuesta está vacía o es null');
      }
      
      if (!Array.isArray(data)) {
        console.error('La respuesta no es un array:', data);
        if (typeof data === 'object') {
          console.log('Propiedades del objeto:', Object.keys(data));
          for (const key of Object.keys(data)) {
            if (Array.isArray(data[key])) {
              console.log(`Encontrado array en propiedad '${key}':`, data[key]);
              data = data[key];
              break;
            }
          }
        }
        
        if (!Array.isArray(data)) {
          throw new Error('No se pudo encontrar un array válido en la respuesta');
        }
      }
      
      console.log('Unidades finales (' + data.length + ' elementos):', data);

      if (data.length > 0) {
        console.log('Estructura del primer elemento:', data[0]);
        console.log('Claves disponibles:', Object.keys(data[0]));
      }
      
      this.unidadesCache = data;
      console.log('Unidades cacheadas exitosamente');
      
      return data;
    } catch (error) {
      console.error('ERROR EN OBTENER UNIDADES');
      console.error('Mensaje:', error.message);
      
      this.unidadesCache = null;
      throw error;
    }
  }

  async obtenerCategorias() {
    try {
      if (this.categoriasCache && this.categoriasCache.length > 0) {
        console.log('Usando categorías desde cache:', this.categoriasCache);
        return this.categoriasCache;
      }
      
      console.log('OBTENIENDO CATEGORÍAS');
      console.log('URL:', CATEGORIAS_URL);
      
      const response = await fetch(CATEGORIAS_URL, {
        method: "GET",
        headers: this.baseHeaders,
      });
      
      console.log('Response status:', response.status);

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        console.error('Response no OK:', response.status, responseText);
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }
      
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : null;
        console.log('Datos parseados:', data);
      } catch (parseError) {
        console.error('Error al parsear JSON:', parseError);
        throw new Error(`Error parsing JSON: ${parseError.message}`);
      }

      if (!data) {
        throw new Error('La respuesta está vacía o es null');
      }
      
      if (!Array.isArray(data)) {
        console.error('La respuesta no es un array:', data);
        if (typeof data === 'object') {
          console.log('Propiedades del objeto:', Object.keys(data));
          for (const key of Object.keys(data)) {
            if (Array.isArray(data[key])) {
              console.log(`Encontrado array en propiedad '${key}':`, data[key]);
              data = data[key];
              break;
            }
          }
        }
        
        if (!Array.isArray(data)) {
          throw new Error('No se pudo encontrar un array válido en la respuesta');
        }
      }
      
      console.log('Categorías finales (' + data.length + ' elementos):', data);

      if (data.length > 0) {
        console.log('Estructura del primer elemento:', data[0]);
        console.log('Claves disponibles:', Object.keys(data[0]));
      }
      
      this.categoriasCache = data;
      console.log('Categorías cacheadas exitosamente');
      
      return data;
    } catch (error) {
      console.error('ERROR EN OBTENER CATEGORÍAS');
      console.error('Mensaje:', error.message);
      
      this.categoriasCache = null;
      throw error;
    }
  }

  async verificarIDsValidos(insumo) {
    try {
      console.log('Verificando IDs válidos para:', insumo);
      
      const idUnidadMedida = parseInt(insumo.idunidadmedida);
      const idCategoriaInsumos = parseInt(insumo.idcategoriainsumos);
      
      if (isNaN(idUnidadMedida) || idUnidadMedida <= 0) {
        throw new Error(`ID de unidad de medida inválido: ${insumo.idunidadmedida}`);
      }
      
      if (isNaN(idCategoriaInsumos) || idCategoriaInsumos <= 0) {
        throw new Error(`ID de categoría inválido: ${insumo.idcategoriainsumos}`);
      }

      console.log('Obteniendo datos de referencia...');
      const [unidades, categorias] = await Promise.all([
        this.obtenerUnidadesMedida(),
        this.obtenerCategorias()
      ]);

      console.log('Datos obtenidos:');
      console.log('  - Unidades:', unidades?.length || 0);
      console.log('  - Categorías:', categorias?.length || 0);

      if (!unidades || unidades.length === 0) {
        throw new Error('No se pudieron obtener las unidades de medida disponibles');
      }
      
      if (!categorias || categorias.length === 0) {
        throw new Error('No se pudieron obtener las categorías disponibles');
      }

      const categoriaExiste = categorias.some(c => parseInt(c.idcategoriainsumos || c.id) === idCategoriaInsumos);
      if (!categoriaExiste) {
        const categoriasDisponibles = categorias.map(
          c => `${c.idcategoriainsumos || c.id} (${c.nombrecategoria || c.nombre || 'Sin nombre'})`
        ).join(', ');
        throw new Error(`La categoría ID ${idCategoriaInsumos} no existe. IDs disponibles: ${categoriasDisponibles}`);
      }

      const unidadExiste = unidades.some(u => parseInt(u.idunidadmedida) === idUnidadMedida);
      if (!unidadExiste) {
        const unidadesDisponibles = unidades.map(u => `${u.idunidadmedida} (${u.unidadmedida})`).join(', ');
        throw new Error(`La unidad de medida ID ${idUnidadMedida} no existe. IDs disponibles: ${unidadesDisponibles}`);
      }

      console.log('Todos los IDs son válidos');
      console.log(`  Unidad de medida ID: ${idUnidadMedida}`);
      console.log(`  Categoría ID: ${idCategoriaInsumos}`);
      
      return true;
    } catch (error) {
      console.error('Error en verificación de IDs:', error.message);
      throw error;
    }
  }

  async obtenerInsumos() {
    try {
      const response = await fetch(`${BASE_URL}`, {
        method: "GET",
        headers: this.baseHeaders,
      });
      const data = await this.handleResponse(response);
      const insumosEnriquecidos = await this.enriquecerInsumosConReferencias(data);
      return this.transformarInsumosDesdeAPI(insumosEnriquecidos);
    } catch (error) {
      console.error('Error al obtener insumos:', error);
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

  // ⭐ FUNCIÓN MODIFICADA: Ahora maneja la creación automática de catálogos
  async crearInsumo(insumoData) {
    try {
      console.log('🚀 INICIANDO CREACIÓN DE INSUMO');
      console.log('Datos originales recibidos:', JSON.stringify(insumoData, null, 2));

      // Guardar datos del catálogo antes de la transformación
      const datosCatalogo = insumoData.datosCatalogo;
      console.log('Datos del catálogo detectados:', datosCatalogo ? 'Sí' : 'No');
      if (datosCatalogo) {
        console.log('Tipo de catálogo:', datosCatalogo.tipo);
      }

      this.limpiarCache();

      const insumoAPI = this.transformarInsumoParaAPI(insumoData);
      console.log('Datos transformados para API:', JSON.stringify(insumoAPI, null, 2));

      this.validarDatosInsumo(insumoAPI);

      console.log('Verificando foreign keys...');
      await this.verificarIDsValidos(insumoAPI);

      console.log('📤 Enviando datos del insumo al servidor...');
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: this.baseHeaders,
        body: JSON.stringify(insumoAPI),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Respuesta de error del servidor:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          console.error('Detalles del error:', errorData);
          
          if (errorText.includes('foreign key') || errorText.includes('constraint')) {
            throw new Error('Error de clave foránea: Verifica que la categoría y unidad de medida seleccionadas existan en la base de datos');
          }
        } catch (parseError) {
          console.error('No se pudo parsear el error como JSON');
        }
        
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }

      const insumoCreado = await response.json();
      console.log('✅ Insumo creado exitosamente:', insumoCreado);

      // ⭐ SI HAY DATOS DE CATÁLOGO, CREAR EN LA TABLA CORRESPONDIENTE
      if (datosCatalogo && insumoCreado.idinsumo) {
        console.log('🎯 Creando entrada en catálogo...');
        try {
          await this.crearCatalogoAutomatico(insumoCreado.idinsumo, datosCatalogo);
          console.log('✅ Catálogo creado exitosamente');
        } catch (catalogoError) {
          console.error('⚠️ Error al crear catálogo (el insumo fue creado):', catalogoError);
          // No lanzamos el error para que no falle toda la operación
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
      console.log("=== DEBUG ACTUALIZACIÓN ===");
      console.log("ID del insumo:", id);
      console.log("Datos recibidos del frontend:", JSON.stringify(insumoData, null, 2));

      const insumoAPI = this.transformarInsumoParaAPI({
        ...insumoData,
        cantidad: Number(insumoData.cantidad) || 0,
      });

      console.log("Datos después de transformación:", JSON.stringify(insumoAPI, null, 2));

      await this.verificarIDsValidos(insumoAPI);
      this.validarDatosInsumo(insumoAPI);

      console.log("Enviando PUT request a:", `${BASE_URL}/${id}`);

      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: this.baseHeaders,
        body: JSON.stringify(insumoAPI),
      });

      console.log("Response status:", response.status);
      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log("Respuesta del servidor:", JSON.stringify(data, null, 2));

      const resultado = this.transformarInsumoDesdeAPI(data);
      console.log("Resultado final transformado:", JSON.stringify(resultado, null, 2));

      return resultado;
    } catch (error) {
      console.error(`Error al actualizar insumo ${id}:`, error);
      throw error;
    }
  }

 // Modificar la función transformarInsumoParaAPI en insumos.js

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

  // ⭐ AGREGAR ID DE IMAGEN SI EXISTE
  if (insumo.idImagen && insumo.idImagen !== null && insumo.idImagen !== "") {
    transformed.idimagen = parseInt(insumo.idImagen);
    console.log("ID de imagen incluido:", transformed.idimagen);
  }

  console.log("Datos transformados:", JSON.stringify(transformed, null, 2));

  return transformed;
}
  async eliminarInsumo(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: this.baseHeaders,
      });
      await this.handleResponse(response);
      console.log('Insumo eliminado exitosamente');
      return { success: true, message: "Insumo eliminado exitosamente" };
    } catch (error) {
      console.error(`Error al eliminar insumo ${id}:`, error);
      throw error;
    }
  }

  async cambiarEstadoInsumo(id, nuevoEstado) {
    try {
      console.log(`Cambiando estado del insumo ${id} a:`, nuevoEstado);
      
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "GET",
        headers: this.baseHeaders,
      });

      if (!response.ok) {
        throw new Error(`No se pudo obtener el insumo: ${response.status}`);
      }

      const insumoActual = await response.json();
      console.log('Insumo actual obtenido:', insumoActual);

      const datosActualizados = {
        nombreinsumo: insumoActual.nombreinsumo,
        idcategoriainsumos: insumoActual.idcategoriainsumos,
        idunidadmedida: insumoActual.idunidadmedida,
        estado: nuevoEstado,
        cantidad: parseFloat(insumoActual.cantidad || 0),
        precio: parseFloat(insumoActual.precio || 0),
        stockminimo: parseInt(insumoActual.stockminimo || 5)
      };

      console.log('Enviando actualización:', datosActualizados);

      const updateResponse = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: this.baseHeaders,
        body: JSON.stringify(datosActualizados),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`Error al cambiar estado: ${updateResponse.status}`);
      }

      const data = await updateResponse.json();
      console.log('Estado cambiado exitosamente:', data);
      return this.transformarInsumoDesdeAPI(data);
    } catch (error) {
      console.error(`Error al cambiar estado del insumo ${id}:`, error);
      throw error;
    }
  }

  validarDatosInsumo(insumo) {
    const errores = [];
    
    console.log('VALIDANDO DATOS DE INSUMO');
    console.log('Datos a validar:', JSON.stringify(insumo, null, 2));
    
    if (!insumo.nombreinsumo || typeof insumo.nombreinsumo !== 'string' || insumo.nombreinsumo.trim() === '') {
      errores.push("El nombre del insumo es requerido y debe ser una cadena válida");
    }
    
    if (!insumo.idcategoriainsumos) {
      errores.push("La categoría es requerida");
    } else {
      const categoria = parseInt(insumo.idcategoriainsumos);
      if (isNaN(categoria) || categoria <= 0) {
        errores.push(`La categoría debe ser un ID válido mayor a 0 (recibido: ${insumo.idcategoriainsumos})`);
      }
    }
    
    if (!insumo.idunidadmedida) {
      errores.push("La unidad de medida es requerida");
    } else {
      const unidad = parseInt(insumo.idunidadmedida);
      if (isNaN(unidad) || unidad <= 0) {
        errores.push(`La unidad de medida debe ser un ID válido mayor a 0 (recibido: ${insumo.idunidadmedida})`);
      }
    }
    
    if (insumo.cantidad !== undefined && insumo.cantidad !== null) {
      const cantidad = parseFloat(insumo.cantidad);
      if (isNaN(cantidad) || cantidad < 0) {
        errores.push(`La cantidad debe ser un número válido mayor o igual a 0 (recibido: ${insumo.cantidad})`);
      }
    }

    console.log('Validando precio:', insumo.precio);
    if (insumo.precio !== undefined && insumo.precio !== null && insumo.precio !== "") {
      const precio = parseFloat(insumo.precio);
      console.log('Precio parseado:', precio);
      if (isNaN(precio) || precio < 0) {
        errores.push(`El precio debe ser un número válido mayor o igual a 0 (recibido: ${insumo.precio})`);
      }
    }

    console.log('Validando stock mínimo:', insumo.stockminimo);
    if (insumo.stockminimo !== undefined && insumo.stockminimo !== null && insumo.stockminimo !== "") {
      const stockMinimo = parseInt(insumo.stockminimo);
      console.log('Stock mínimo parseado:', stockMinimo);
      if (isNaN(stockMinimo) || stockMinimo < 0) {
        errores.push(`El stock mínimo debe ser un número entero mayor o igual a 0 (recibido: ${insumo.stockminimo})`);
      }
    }

    console.log('Errores de validación encontrados:', errores);

    if (errores.length > 0) {
      throw new Error("Datos inválidos: " + errores.join("; "));
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
    console.log('Cache limpiado - se obtendrán datos frescos en la próxima consulta');
  }

  async probarCreacion() {
    try {
      console.log('PROBANDO CREACIÓN CON DATOS DE EJEMPLO');
      
      const [unidades, categorias] = await Promise.all([
        this.obtenerUnidadesMedida(),
        this.obtenerCategorias()
      ]);
      
      if (!unidades || unidades.length === 0 || !categorias || categorias.length === 0) {
        console.error('No hay datos suficientes para probar');
        return;
      }

      const insumoEjemplo = {
        nombreInsumo: "Insumo de Prueba " + Date.now(),
        idCategoriaInsumos: categorias[0].id || categorias[0].idcategoriainsumos, 
        idUnidadMedida: unidades[0].idunidadmedida, 
        cantidad: 10,
        precio: 25.50,
        stockMinimo: 5,
        estado: true
      };
      
      console.log('Datos de ejemplo:', JSON.stringify(insumoEjemplo, null, 2));
      
      const resultado = await this.crearInsumo(insumoEjemplo);
      console.log('Prueba exitosa:', resultado);
      
      return resultado;
    } catch (error) {
      console.error('Error en prueba de creación:', error);
      throw error;
    }
  }
}

const insumoApiService = new InsumoApiService();
export default insumoApiService;