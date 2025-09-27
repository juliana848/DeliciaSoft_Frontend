// services/permissionsService.js
const API_BASE_URL = 'https://deliciasoft-backend.onrender.com/api';

class PermissionsService {
  constructor() {
    this.userPermissions = [];
    this.permissionsCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; 
  }


  async getUserPermissions(forceRefresh = false) {
    try {
      const userData = localStorage.getItem('userData');
      
      if (!userData) {
        console.warn('No se encontraron datos de usuario');
        return ['Dashboard']; 
      }

      const user = JSON.parse(userData);
      const rolId = user.idrol || user.rol_id;

      if (!rolId) {
        console.warn('No se encontró ID de rol');
        return ['Dashboard'];
      }

      const cacheKey = `permissions_${rolId}`;
      const cached = this.permissionsCache.get(cacheKey);
      
      if (!forceRefresh && cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
        console.log('Usando permisos desde cache');
        this.userPermissions = cached.permissions;
        return cached.permissions;
      }

      const permissions = await this.fetchPermissionsFromAPI(rolId);
      
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

  async fetchPermissionsFromAPI(rolId) {
    try {
      const rolResponse = await fetch(`${API_BASE_URL}/rol/${rolId}`);
      
      if (rolResponse.ok) {
        const rolData = await rolResponse.json();
        
        if (rolData.permisos && Array.isArray(rolData.permisos)) {
          const allPermissionsResponse = await fetch(`${API_BASE_URL}/permisos`);
          
          if (allPermissionsResponse.ok) {
            const allPermissions = await allPermissionsResponse.json();
            
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

      const permisosResponse = await fetch(`${API_BASE_URL}/rol/${rolId}/permisos`);
      
      if (permisosResponse.ok) {
        const permisos = await permisosResponse.json();
        const permissionNames = permisos.map(p => p.descripcion || p.modulo);
        
        if (permissionNames.length > 0) {
          console.log('Permisos obtenidos (método 2):', permissionNames);
          return permissionNames;
        }
      }

      console.warn('No se pudieron obtener permisos, usando permisos mínimos');
      return ['Dashboard'];

    } catch (error) {
      console.error('Error en fetchPermissionsFromAPI:', error);
      return ['Dashboard'];
    }
  }

  hasPermission(permission) {
    if (!permission) return true; 
    
    return this.userPermissions.includes(permission);
  }

  hasAnyPermission(permissions) {
    if (!permissions || permissions.length === 0) return true;
    
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasAllPermissions(permissions) {
    if (!permissions || permissions.length === 0) return true;
    
    return permissions.every(permission => this.hasPermission(permission));
  }

  filterMenuItems(menuItems) {
    return menuItems.filter(item => {
      if (item.permission && !this.hasPermission(item.permission)) {
        return false;
      }

      if (item.hasSubmenu && item.submenu) {
        const filteredSubmenu = item.submenu.filter(subItem => {
          return !subItem.permission || this.hasPermission(subItem.permission);
        });

        if (filteredSubmenu.length === 0) {
          return false;
        }

        item.submenu = filteredSubmenu;
      }

      return true;
    });
  }

  canAccessRoute(route) {
    const routePermissions = this.getRoutePermissions();
    const requiredPermission = routePermissions[route];
    
    if (!requiredPermission) {
      return true; 
    }

    return this.hasPermission(requiredPermission);
  }


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


  clearCache() {
    this.permissionsCache.clear();
    this.userPermissions = [];
  }


  getCurrentPermissions() {
    return [...this.userPermissions];
  }


  arePermissionsLoaded() {
    return this.userPermissions.length > 0;
  }


  async refreshPermissions() {
    return await this.getUserPermissions(true);
  }


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
}

const permissionsService = new PermissionsService();

export default permissionsService;