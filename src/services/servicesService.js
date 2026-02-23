import RequestHelper from '../utils/RequestHelper';

export const servicesService = {
  getAll: async (params = {}) => {
    return RequestHelper.client.get('/services', { params });
  },
  
  getById: async (id) => {
    return RequestHelper.client.get(`/services/${id}`);
  },

  create: async (data) => {
    return RequestHelper.client.post('/services', data);
  },

  update: async (id, data) => {
    return RequestHelper.client.put(`/services/${id}`, data);
  },

  delete: async (id) => {
    return RequestHelper.client.delete(`/services/${id}`);
  }
};
