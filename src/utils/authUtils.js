// utils/authUtils.js
// Utilidades para manejo de autenticación en toda la aplicación

export const AuthUtils = {
  // Obtener información del usuario logueado
  getCurrentUser() {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const userRole = localStorage.getItem('userRole');
      const userData = localStorage.getItem('userData');
      
      if (userEmail && userRole) {
        return {
          email: userEmail,
          role: userRole,
          data: userData ? JSON.parse(userData) : null,
          isAuthenticated: true
        };
      }
      
      return {
        email: null,
        role: null,
        data: null,
        isAuthenticated: false
      };
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return {
        email: null,
        role: null,
        data: null,
        isAuthenticated: false
      };
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    return !!(token && userRole);
  },

  // Verificar si es administrador
  isAdmin() {
    const userRole = localStorage.getItem('userRole');
    return userRole === 'admin';
  },

  // Verificar si es cliente
  isClient() {
    const userRole = localStorage.getItem('userRole');
    return userRole === 'cliente';
  },

  // Cerrar sesión
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userData');
    // No remover productosTemporales aquí para mantener el carrito
  },

  // Cerrar sesión completa (incluyendo carrito)
  fullLogout() {
    localStorage.clear();
  },

  // Redirigir según el rol del usuario
  redirectByRole(navigate) {
    const userRole = localStorage.getItem('userRole');
    const productosTemporales = localStorage.getItem('productosTemporales');

    if (userRole === 'admin') {
      navigate('/admin/pages/Dashboard');
    } else if (userRole === 'cliente') {
      if (productosTemporales) {
        navigate('/pedidos');
      } else {
        navigate('/');
        window.location.reload();
      }
    } else {
      navigate('/');
    }
  },

  // Guardar información del usuario después del login
  setUserSession(userRole, email, userData) {
    localStorage.setItem('authToken', 'jwt-token-' + Date.now());
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userEmail', email);
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  },

  // Validar formato de email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar contraseña
  validatePassword(password) {
    return {
      isValid: password.length >= 8 && /(?=.*[A-Z])/.test(password) && /(?=.*[!@#$%^&*])/.test(password),
      hasMinLength: password.length >= 8,
      hasUppercase: /(?=.*[A-Z])/.test(password),
      hasSpecialChar: /(?=.*[!@#$%^&*])/.test(password)
    };
  },

  // Obtener mensaje de estado de autenticación
  getAuthStatus() {
    const user = this.getCurrentUser();
    if (user.isAuthenticated) {
      return {
        status: 'authenticated',
        message: `Bienvenido ${user.role === 'admin' ? 'Administrador' : 'Cliente'}`,
        user: user
      };
    }
    return {
      status: 'unauthenticated',
      message: 'No autenticado',
      user: null
    };
  }
};

// Hook personalizado para React (opcional)
export const useAuth = () => {
  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const currentUser = AuthUtils.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = (userRole, email, userData) => {
    AuthUtils.setUserSession(userRole, email, userData);
    setUser(AuthUtils.getCurrentUser());
  };

  const logout = () => {
    AuthUtils.logout();
    setUser(AuthUtils.getCurrentUser());
  };

  return {
    user,
    isLoading,
    isAuthenticated: user?.isAuthenticated || false,
    isAdmin: user?.role === 'admin',
    isClient: user?.role === 'cliente',
    login,
    logout
  };
};

export default AuthUtils;