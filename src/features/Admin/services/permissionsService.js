// services/permissionsService.js
const API_BASE_URL = 'https://deliciasoft-backend.onrender.com/api';

class PermissionsService {
  constructor() {
    this.userPermissions = [];
    this.permissionsCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutos
  }

  // Obtener permisos del usuario actual
  async getUserPermissions(forceRefresh = false) {
    try {
      const userData = localStorage.getItem('userData');
      
      if (!userData) {
        console.warn('No se encontraron datos de usuario');
        return ['Dashboard']; // Permiso mínimo
      }

      const user = JSON.parse(userData);
      const rolId = user.idrol || user.rol_id;

      if (!rolId) {
        console.warn('No se encontró ID de rol');
        return ['Dashboard'];
      }

      // Verificar cache
      const cacheKey = `permissions_${rolId}`;
      const cached = this.permissionsCache.get(cacheKey);
      
      if (!forceRefresh && cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
        console.log('Usando permisos desde cache');
        this.userPermissions = cached.permissions;
        return cached.permissions;
      }

      // Obtener permisos desde la API
      const permissions = await this.fetchPermissionsFromAPI(rolId);
      
      // Guardar en cache
      this.permissionsCache.set(cacheKey, {
        permissions,
        timestamp: Date.now()
      });

      this.userPermissions = permissions;
      return permissions;

    } catch (error) {
      console.error('Error al obtener permisos del usuario:', error);
      return ['Dashboard'];
    }
  }

  // Obtener permisos desde la API
  async fetchPermissionsFromAPI(rolId) {
    try {
      // Método 1: Obtener el rol completo con permisos
      const rolResponse = await fetch(`${API_BASE_URL}/rol/${rolId}`);
      
      if (rolResponse.ok) {
        const rolData = await rolResponse.json();
        
        if (rolData.permisos && Array.isArray(rolData.permisos)) {
          // Obtener todos los permisos para mapear IDs a nombres
          const allPermissionsResponse = await fetch(`${API_BASE_URL}/permisos`);
          
          if (allPermissionsResponse.ok) {
            const allPermissions = await allPermissionsResponse.json();
            
            // Mapear los IDs de permisos a nombres
            const permissionNames = rolData.permisos
              .map(permisoId => {
                const permiso = allPermissions.find(p => p.idpermiso === permisoId);
                return permiso ? permiso.descripcion : null;
              })
              .filter(nombre => nombre !== null);
            
            if (permissionNames.length > 0) {
              console.log('Permisos obtenidos (método 1):', permissionNames);
              return permissionNames;
            }
          }
        }
      }

      // Método 2: Endpoint directo de permisos del rol
      const permisosResponse = await fetch(`${API_BASE_URL}/rol/${rolId}/permisos`);
      
      if (permisosResponse.ok) {
        const permisos = await permisosResponse.json();
        const permissionNames = permisos.map(p => p.descripcion || p.modulo);
        
        if (permissionNames.length > 0) {
          console.log('Permisos obtenidos (método 2):', permissionNames);
          return permissionNames;
        }
      }

      // Fallback: permisos mínimos
      console.warn('No se pudieron obtener permisos, usando permisos mínimos');
      return ['Dashboard'];

    } catch (error) {
      console.error('Error en fetchPermissionsFromAPI:', error);
      return ['Dashboard'];
    }
  }

  // Verificar si el usuario tiene un permiso específico
  hasPermission(permission) {
    if (!permission) return true; // Si no requiere permiso específico
    
    return this.userPermissions.includes(permission);
  }

  // Verificar múltiples permisos (OR - al menos uno)
  hasAnyPermission(permissions) {
    if (!permissions || permissions.length === 0) return true;
    
    return permissions.some(permission => this.hasPermission(permission));
  }

  // Verificar múltiples permisos (AND - todos)
  hasAllPermissions(permissions) {
    if (!permissions || permissions.length === 0) return true;
    
    return permissions.every(permission => this.hasPermission(permission));
  }

  // Filtrar elementos de menú basado en permisos
  filterMenuItems(menuItems) {
    return menuItems.filter(item => {
      // Verificar permiso del item principal
      if (item.permission && !this.hasPermission(item.permission)) {
        return false;
      }

      // Si tiene submenú, filtrar subitems
      if (item.hasSubmenu && item.submenu) {
        const filteredSubmenu = item.submenu.filter(subItem => {
          return !subItem.permission || this.hasPermission(subItem.permission);
        });

        // Solo mostrar si tiene al menos un subitem accesible
        if (filteredSubmenu.length === 0) {
          return false;
        }

        // Crear una copia con el submenú filtrado
        item.submenu = filteredSubmenu;
      }

      return true;
    });
  }

  // Verificar acceso a una ruta
  canAccessRoute(route) {
    const routePermissions = this.getRoutePermissions();
    const requiredPermission = routePermissions[route];
    
    if (!requiredPermission) {
      return true; // Si no requiere permiso específico
    }

    return this.hasPermission(requiredPermission);
  }

  // Mapeo de rutas a permisos
  getRoutePermissions() {
    return {
      '/admin/pages/Dashboard': 'Dashboard',
      '/admin/pages/Roles': 'Roles',
      '/admin/pages/Usuarios': 'Usuarios',
      '/admin/pages/Clientes': 'Cliente',
      '/admin/pages/Sede': 'Sedes',
      '/admin/pages/Ventas': 'Ventas',
      '/admin/pages/insumos': 'Insumos',
      '/admin/pages/CategoriaInsumo': 'Cat.Insumos',
      '/admin/pages/proveedores': 'Proveedores',
      '/admin/pages/compras': 'Compras',
      '/admin/pages/CategoriaProductos': 'Cat.Productos',
      '/admin/pages/productos': 'Productos',
      '/admin/pages/Recetas': 'Productos',
      '/admin/pages/produccion': 'Produccion'
    };
  }

  // Limpiar cache de permisos
  clearCache() {
    this.permissionsCache.clear();
    this.userPermissions = [];
  }

  // Obtener permisos actuales sin hacer llamada a la API
  getCurrentPermissions() {
    return [...this.userPermissions];
  }

  // Verificar si los permisos están cargados
  arePermissionsLoaded() {
    return this.userPermissions.length > 0;
  }

  // Refrescar permisos del usuario
  async refreshPermissions() {
    return await this.getUserPermissions(true);
  }

  // Obtener información de permiso por nombre
  getPermissionInfo(permissionName) {
    const permissionInfo = {
      'Dashboard': {
        name: 'Dashboard',
        description: 'Acceso al panel principal',
        module: 'Dashboard'
      },
      'Roles': {
        name: 'Roles',
        description: 'Gestión de roles y permisos',
        module: 'Configuración'
      },
      'Usuarios': {
        name: 'Usuarios',
        description: 'Gestión de usuarios del sistema',
        module: 'Usuarios'
      },
      'Cliente': {
        name: 'Cliente',
        description: 'Gestión de clientes',
        module: 'Ventas'
      },
      'Ventas': {
        name: 'Ventas',
        description: 'Gestión de ventas',
        module: 'Ventas'
      },
      'Sedes': {
        name: 'Sedes',
        description: 'Gestión de sedes',
        module: 'Ventas'
      },
      'Cat.Productos': {
        name: 'Categorías de Productos',
        description: 'Gestión de categorías de productos',
        module: 'Productos'
      },
      'Productos': {
        name: 'Productos',
        description: 'Gestión de productos',
        module: 'Productos'
      },
      'Cat.Insumos': {
        name: 'Categorías de Insumos',
        description: 'Gestión de categorías de insumos',
        module: 'Compras'
      },
      'Insumos': {
        name: 'Insumos',
        description: 'Gestión de insumos',
        module: 'Compras'
      },
      'Proveedores': {
        name: 'Proveedores',
        description: 'Gestión de proveedores',
        module: 'Compras'
      },
      'Compras': {
        name: 'Compras',
        description: 'Gestión de compras',
        module: 'Compras'
      },
      'Produccion': {
        name: 'Producción',
        description: 'Gestión de producción',
        module: 'Producción'
      }
    };

    return permissionInfo[permissionName] || {
      name: permissionName,
      description: permissionName,
      module: 'Desconocido'
    };
  }

  // Debug: Mostrar información de permisos
  debugPermissions() {
    console.group('🔐 Debug de Permisos');
    console.log('Permisos actuales:', this.userPermissions);
    console.log('Cache de permisos:', this.permissionsCache);
    console.log('Permisos cargados:', this.arePermissionsLoaded());
    
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      console.log('Datos del usuario:', user);
      console.log('ID del rol:', user.idrol || user.rol_id);
    }
    console.groupEnd();
  }
}

// Crear instancia singleton
const permissionsService = new PermissionsService();

export default permissionsService;