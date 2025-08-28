const BASE_URL = "https://deliciasoft-backend.onrender.com/api/insumos";
const CATEGORIAS_URL = "https://deliciasoft-backend.onrender.com/api/categoria-insumos";
const UNIDADES_URL = "https://deliciasoft-backend.onrender.com/api/unidadmedida";

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
        console.error('🚨 Detalles del error de la API:', errorData);
      } catch (e) {
        console.error('❌ No se pudo parsear la respuesta de error:', e);
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.details = errorDetails;
      throw error;
    }
    return response.json();
  }


  async obtenerUnidadesMedida() {
    try {
      if (this.unidadesCache && this.unidadesCache.length > 0) {
        console.log('📦 Usando unidades desde cache:', this.unidadesCache);
        return this.unidadesCache;
      }
      
      console.log('🌐 === OBTENIENDO UNIDADES DE MEDIDA ===');
      console.log('🔗 URL:', UNIDADES_URL);
      console.log('📤 Headers:', this.baseHeaders);
      
      const response = await fetch(UNIDADES_URL, {
        method: "GET",
        headers: this.baseHeaders,
      });
      
      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
      

      const responseText = await response.text();
      console.log('📄 Raw response:', responseText);
      

      if (!response.ok) {
        console.error('❌ Response no OK:', response.status, responseText);
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }
      
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : null;
        console.log('📏 Datos parseados:', data);
        console.log('📏 Tipo de datos:', typeof data);
        console.log('📏 Es array?:', Array.isArray(data));
      } catch (parseError) {
        console.error('❌ Error al parsear JSON:', parseError);
        throw new Error(`Error parsing JSON: ${parseError.message}`);
      }
      
      // Validaciones
      if (!data) {
        throw new Error('❌ La respuesta está vacía o es null');
      }
      
      if (!Array.isArray(data)) {
        console.error('❌ La respuesta no es un array:', data);

        if (typeof data === 'object') {
          console.log('🔍 Propiedades del objeto:', Object.keys(data));
  
          for (const key of Object.keys(data)) {
            if (Array.isArray(data[key])) {
              console.log(`✅ Encontrado array en propiedad '${key}':`, data[key]);
              data = data[key];
              break;
            }
          }
        }
        
        if (!Array.isArray(data)) {
          throw new Error('❌ No se pudo encontrar un array válido en la respuesta');
        }
      }
      
      console.log('📏 Unidades finales (' + data.length + ' elementos):', data);
      

      if (data.length > 0) {
        console.log('🔍 Estructura del primer elemento:', data[0]);
        console.log('🔍 Claves disponibles:', Object.keys(data[0]));
      }
      
      this.unidadesCache = data;
      console.log('✅ Unidades cacheadas exitosamente');
      console.log('=====================================');
      
      return data;
    } catch (error) {
      console.error('❌ === ERROR EN OBTENER UNIDADES ===');
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
      console.error('====================================');
      

      this.unidadesCache = null;
      throw error;
    }
  }

  async obtenerCategorias() {
    try {
      if (this.categoriasCache && this.categoriasCache.length > 0) {
        console.log('📦 Usando categorías desde cache:', this.categoriasCache);
        return this.categoriasCache;
      }
      
      console.log('🌐 === OBTENIENDO CATEGORÍAS ===');
      console.log('🔗 URL:', CATEGORIAS_URL);
      console.log('📤 Headers:', this.baseHeaders);
      
      const response = await fetch(CATEGORIAS_URL, {
        method: "GET",
        headers: this.baseHeaders,
      });
      
      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
      

      const responseText = await response.text();
      console.log('📄 Raw response:', responseText);
      

      if (!response.ok) {
        console.error('❌ Response no OK:', response.status, responseText);
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }
      
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : null;
        console.log('📂 Datos parseados:', data);
        console.log('📂 Tipo de datos:', typeof data);
        console.log('📂 Es array?:', Array.isArray(data));
      } catch (parseError) {
        console.error('❌ Error al parsear JSON:', parseError);
        throw new Error(`Error parsing JSON: ${parseError.message}`);
      }
      

      if (!data) {
        throw new Error('❌ La respuesta está vacía o es null');
      }
      
      if (!Array.isArray(data)) {
        console.error('❌ La respuesta no es un array:', data);
        

        if (typeof data === 'object') {
          console.log('🔍 Propiedades del objeto:', Object.keys(data));
          
          // Buscar arrays en las propiedades
          for (const key of Object.keys(data)) {
            if (Array.isArray(data[key])) {
              console.log(`✅ Encontrado array en propiedad '${key}':`, data[key]);
              data = data[key];
              break;
            }
          }
        }
        
        if (!Array.isArray(data)) {
          throw new Error('❌ No se pudo encontrar un array válido en la respuesta');
        }
      }
      
      console.log('📂 Categorías finales (' + data.length + ' elementos):', data);
      

      if (data.length > 0) {
        console.log('🔍 Estructura del primer elemento:', data[0]);
        console.log('🔍 Claves disponibles:', Object.keys(data[0]));
      }
      
      this.categoriasCache = data;
      console.log('✅ Categorías cacheadas exitosamente');
      console.log('====================================');
      
      return data;
    } catch (error) {
      console.error('❌ === ERROR EN OBTENER CATEGORÍAS ===');
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
      console.error('======================================');
      

      this.categoriasCache = null;
      throw error;
    }
  }


  async verificarIDsValidos(insumo) {
    try {
      console.log('🔍 Verificando IDs válidos para:', insumo);
      

      const idUnidadMedida = parseInt(insumo.idunidadmedida);
      const idCategoriaInsumos = parseInt(insumo.idcategoriainsumos);
      
      if (isNaN(idUnidadMedida) || idUnidadMedida <= 0) {
        throw new Error(`❌ ID de unidad de medida inválido: ${insumo.idunidadmedida}`);
      }
      
      if (isNaN(idCategoriaInsumos) || idCategoriaInsumos <= 0) {
        throw new Error(`❌ ID de categoría inválido: ${insumo.idcategoriainsumos}`);
      }


      console.log('📡 Obteniendo datos de referencia...');
      const [unidades, categorias] = await Promise.all([
        this.obtenerUnidadesMedida(),
        this.obtenerCategorias()
      ]);

      console.log('📊 Datos obtenidos:');
      console.log('  - Unidades:', unidades?.length || 0);
      console.log('  - Categorías:', categorias?.length || 0);


      if (!unidades || unidades.length === 0) {
        throw new Error('❌ No se pudieron obtener las unidades de medida disponibles');
      }
      
      if (!categorias || categorias.length === 0) {
        throw new Error('❌ No se pudieron obtener las categorías disponibles');
      }


      console.log('📏 Unidades disponibles:');
      unidades.forEach(u => {
        console.log(`  - ID: ${u.idunidadmedida} | Nombre: ${u.unidadmedida}`);
      });
      
     console.log('📂 Categorías disponibles:');
categorias.forEach(c => {
  const nombre = c.nombrecategoria || c.nombre || c.name || 'Sin nombre';
  console.log(`  - ID: ${c.idcategoriainsumos} | Nombre: ${nombre}`);
});

// Verificar categoría
const categoriaExiste = categorias.some(c => parseInt(c.idcategoriainsumos) === idCategoriaInsumos);
if (!categoriaExiste) {
  const categoriasDisponibles = categorias.map(
    c => `${c.idcategoriainsumos} (${c.nombrecategoria || c.nombre || 'Sin nombre'})`
  ).join(', ');
  throw new Error(`❌ La categoría ID ${idCategoriaInsumos} no existe. IDs disponibles: ${categoriasDisponibles}`);
}


      // Verificar unidad de medida - USANDO CAMPO CORRECTO
      const unidadExiste = unidades.some(u => parseInt(u.idunidadmedida) === idUnidadMedida);
      if (!unidadExiste) {
        const unidadesDisponibles = unidades.map(u => `${u.idunidadmedida} (${u.unidadmedida})`).join(', ');
        throw new Error(`❌ La unidad de medida ID ${idUnidadMedida} no existe. IDs disponibles: ${unidadesDisponibles}`);
      }


  
      console.log('✅ Todos los IDs son válidos');
      console.log(`  ✓ Unidad de medida ID: ${idUnidadMedida}`);
      console.log(`  ✓ Categoría ID: ${idCategoriaInsumos}`);
      
      return true;
    } catch (error) {
      console.error('❌ Error en verificación de IDs:', error.message);
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
      console.error('❌ Error al obtener insumos:', error);
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
        const categoria = categorias.find(c => parseInt(c.id) === parseInt(insumo.idcategoriainsumos));
        
        return {
          ...insumo,
          nombreUnidadMedida: unidad ? unidad.unidadmedida : 'Unidad desconocida',
          nombreCategoria: categoria ? (categoria.nombre || categoria.nombrecategoria) : 'Categoría desconocida'
        };
      });
    } catch (error) {
      console.error('❌ Error al enriquecer insumos:', error);
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
      console.error(`❌ Error al obtener insumo ${id}:`, error);
      throw error;
    }
  }


  async crearInsumo(insumoData) {
    try {
      console.log('🚀 === INICIANDO CREACIÓN DE INSUMO ===');
      console.log('📥 Datos originales recibidos:', JSON.stringify(insumoData, null, 2));


      this.limpiarCache();


      const insumoAPI = this.transformarInsumoParaAPI(insumoData);
      console.log('🔄 Datos transformados para API:', JSON.stringify(insumoAPI, null, 2));


      this.validarDatosInsumo(insumoAPI);

      console.log('🔍 Verificando foreign keys...');
      await this.verificarIDsValidos(insumoAPI);

      console.log('📤 Enviando datos al servidor...');
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: this.baseHeaders,
        body: JSON.stringify(insumoAPI),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Respuesta de error del servidor:', errorText);
        
        // Intentar parsear como JSON
        try {
          const errorData = JSON.parse(errorText);
          console.error('📋 Detalles del error:', errorData);
          

          if (errorText.includes('foreign key') || errorText.includes('constraint')) {
            throw new Error('❌ Error de clave foránea: Verifica que la categoría y unidad de medida seleccionadas existan en la base de datos');
          }
        } catch (parseError) {
          console.error('No se pudo parsear el error como JSON');
        }
        
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Insumo creado exitosamente:', data);
      console.log('===========================================');
      
      return this.transformarInsumoDesdeAPI(data);
    } catch (error) {
      console.error('❌ === ERROR EN CREACIÓN DE INSUMO ===');
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
      console.error('=====================================');
      throw error;
    }
  }

  // 🔹 Actualizar insumo
  async actualizarInsumo(id, insumoData) {
    try {
      console.log('🔄 Actualizando insumo ID:', id);
      
      const insumoAPI = this.transformarInsumoParaAPI(insumoData);
      
      // Verificar IDs válidos
      await this.verificarIDsValidos(insumoAPI);
      this.validarDatosInsumo(insumoAPI);

      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: this.baseHeaders,
        body: JSON.stringify(insumoAPI),
      });

      const data = await this.handleResponse(response);
      return this.transformarInsumoDesdeAPI(data);
    } catch (error) {
      console.error(`❌ Error al actualizar insumo ${id}:`, error);
      throw error;
    }
  }

  // 🔹 Eliminar insumo
  async eliminarInsumo(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: this.baseHeaders,
      });
      await this.handleResponse(response);
      return { success: true, message: "Insumo eliminado exitosamente" };
    } catch (error) {
      console.error(`❌ Error al eliminar insumo ${id}:`, error);
      throw error;
    }
  }

  // 🔹 Cambiar estado de insumo
  async cambiarEstadoInsumo(id, nuevoEstado) {
    try {
      const insumoActual = await this.obtenerInsumoPorId(id);
      const datosActualizados = {
        ...this.transformarInsumoParaAPI(insumoActual),
        estado: nuevoEstado,
      };

      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: this.baseHeaders,
        body: JSON.stringify(datosActualizados),
      });

      const data = await this.handleResponse(response);
      return this.transformarInsumoDesdeAPI(data);
    } catch (error) {
      console.error(`❌ Error al cambiar estado del insumo ${id}:`, error);
      throw error;
    }
  }


  validarDatosInsumo(insumo) {
    const errores = [];
    
    console.log('🔍 === VALIDANDO DATOS DE INSUMO ===');
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

    console.log('⚠️ Errores de validación encontrados:', errores);
    console.log('===================================');

    if (errores.length > 0) {
      throw new Error("❌ Datos inválidos: " + errores.join("; "));
    }
  }

  transformarInsumoParaAPI(insumo) {
    console.log('🔄 === TRANSFORMANDO INSUMO PARA API ===');
    console.log('Datos originales:', JSON.stringify(insumo, null, 2));
    
    const transformed = {
      nombreinsumo: insumo.nombreInsumo ? String(insumo.nombreInsumo).trim() : '',
      idcategoriainsumos: insumo.idCategoriaInsumos ? parseInt(insumo.idCategoriaInsumos) : null,
      idunidadmedida: insumo.idUnidadMedida ? parseInt(insumo.idUnidadMedida) : null,
      cantidad: insumo.cantidad !== undefined && insumo.cantidad !== null && insumo.cantidad !== '' ? parseFloat(insumo.cantidad) : 0,
      estado: insumo.estado !== undefined ? Boolean(insumo.estado) : true,
    };

    if (insumo.idImagen && String(insumo.idImagen).trim() !== '') {
      transformed.idimagen = String(insumo.idImagen).trim();
    }

    console.log('Datos transformados:', JSON.stringify(transformed, null, 2));
    console.log('======================================');
    
    return transformed;
  }

transformarInsumoDesdeAPI(insumo) {
  if (!insumo) return null;
  
  return {
    id: insumo.idinsumo,
    nombreInsumo: insumo.nombreinsumo,
    idCategoriaInsumos: insumo.idcategoriainsumos,
    idUnidadMedida: insumo.idunidadmedida,
    cantidad: insumo.cantidad,
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

  async diagnosticarConexiones() {
    console.log('🔧 === DIAGNÓSTICO DE CONEXIONES ===');
    
    try {
      // Probar conexión a insumos
      console.log('🔍 Probando conexión a insumos...');
      const responseInsumos = await fetch(BASE_URL, { 
        method: 'GET', 
        headers: this.baseHeaders 
      });
      console.log('📊 Estado insumos:', responseInsumos.status, responseInsumos.statusText);
      
      // Probar conexión a categorías
      console.log('🔍 Probando conexión a categorías...');
      const responseCategorias = await fetch(CATEGORIAS_URL, { 
        method: 'GET', 
        headers: this.baseHeaders 
      });
      console.log('📊 Estado categorías:', responseCategorias.status, responseCategorias.statusText);
      
      // Probar conexión a unidades
      console.log('🔍 Probando conexión a unidades...');
      const responseUnidades = await fetch(UNIDADES_URL, { 
        method: 'GET', 
        headers: this.baseHeaders 
      });
      console.log('📊 Estado unidades:', responseUnidades.status, responseUnidades.statusText);
      

      await this.mostrarIDsDisponibles();
      
      console.log('✅ Diagnóstico completado');
      console.log('==================================');
      
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
    }
  }


  async mostrarIDsDisponibles() {
    try {
      console.log('📊 === INFORMACIÓN DE IDs DISPONIBLES ===');
      
      const [unidades, categorias] = await Promise.all([
        this.obtenerUnidadesMedida(),
        this.obtenerCategorias()
      ]);

      console.log('📏 UNIDADES DE MEDIDA (' + (unidades?.length || 0) + ' total):');
      if (unidades && unidades.length > 0) {
        unidades.forEach(u => {
          console.log(`  ✓ ID: ${u.idunidadmedida} - Nombre: "${u.unidadmedida}"`);
        });
      } else {
        console.log('  ⚠️ No se encontraron unidades de medida');
      }

      console.log('📂 CATEGORÍAS (' + (categorias?.length || 0) + ' total):');
      if (categorias && categorias.length > 0) {
        categorias.forEach(c => {
          const nombre = c.nombre || c.nombrecategoria || c.name || 'Sin nombre';
          console.log(`  ✓ ID: ${c.id} - Nombre: "${nombre}"`);
        });
      } else {
        console.log('  ⚠️ No se encontraron categorías');
      }

      console.log('==========================================');
      
      return { unidades, categorias };
    } catch (error) {
      console.error('❌ Error al mostrar IDs disponibles:', error);
      return { unidades: [], categorias: [] };
    }
  }

  limpiarCache() {
    this.unidadesCache = null;
    this.categoriasCache = null;
    console.log('🧹 Cache limpiado - se obtendrán datos frescos en la próxima consulta');
  }

  // probar la creación con datos reales de la API
  async probarCreacion() {
    try {
      console.log('🧪 === PROBANDO CREACIÓN CON DATOS DE EJEMPLO ===');
      
      // obtener IDs disponibles
      const { unidades, categorias } = await this.mostrarIDsDisponibles();
      
      if (!unidades || unidades.length === 0 || !categorias || categorias.length === 0) {
        console.error('❌ No hay datos suficientes para probar');
        return;
      }
      

      const insumoEjemplo = {
        nombreInsumo: "Insumo de Prueba " + Date.now(),
        idCategoriaInsumos: categorias[0].id, 
        idUnidadMedida: unidades[0].idunidadmedida, 
        cantidad: 10,
        estado: true
      };
      
      console.log('📝 Datos de ejemplo:', JSON.stringify(insumoEjemplo, null, 2));
      
      const resultado = await this.crearInsumo(insumoEjemplo);
      console.log('✅ Prueba exitosa:', resultado);
      
      return resultado;
    } catch (error) {
      console.error('❌ Error en prueba de creación:', error);
      throw error;
    }
  }
}

const insumoApiService = new InsumoApiService();
export default insumoApiService;