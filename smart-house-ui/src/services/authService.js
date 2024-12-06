export const authService = {
    getToken: () => localStorage.getItem('authToken'),
    clearToken: () => localStorage.removeItem('authToken'),
  };
  