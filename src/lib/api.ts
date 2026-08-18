// Mock API instance returning typed Promise<{ data: any }>
const api = {
  get: async (...args: any[]): Promise<{ data: any }> => ({ data: [] }),
  post: async (...args: any[]): Promise<{ data: any }> => {
    if (args[0]?.includes('login')) {
      return {
        data: {
          accessToken: 'dummy_token_123',
          user: {
            id: '1',
            email: 'admin@foplp.com',
            name: 'Admin FOPLP',
            role: 'Admin'
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
