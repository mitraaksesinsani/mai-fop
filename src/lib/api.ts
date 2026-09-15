// Mock API instance returning typed Promise<{ data: any }>
const api = {
  get: async (...args: any[]): Promise<{ data: any }> => ({ data: [] }),
  post: async (...args: any[]): Promise<{ data: any }> => {
    if (args[0]?.includes('login')) {
      return {
        data: {
          accessToken: 'dummy_token_123',
          user: {
            id: 'ec0a5b9c-1e1c-4c32-854d-6884336e58a7',
            email: 'admin@mai.co.id',
            name: 'Admin Proper',
            role: 'ADMIN'
          }
        }
      };
    }
    return { data: {} };
  },
  put: async (...args: any[]): Promise<{ data: any }> => ({ data: {} }),
  patch: async (...args: any[]): Promise<{ data: any }> => ({ data: {} }),
  delete: async (...args: any[]): Promise<{ data: any }> => ({ data: {} }),
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} }
  }
};

export default api;
