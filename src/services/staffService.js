import RequestHelper from '../utils/RequestHelper';

export const staffService = {
  getAll: async (params = {}) => {
    return RequestHelper.client.get('/staff', { params });
  },
  
  getById: async (id) => {
    return RequestHelper.client.get(`/staff/${id}`);
  },

  create: async (staffData) => {
    return RequestHelper.client.post('/staff', staffData);
  },

  update: async (id, staffData) => {
    return RequestHelper.client.put(`/staff/${id}`, staffData);
  },

  delete: async (id) => {
    return RequestHelper.client.delete(`/staff/${id}`);
  },

  assignServices: async (id, serviceIds) => {
    return RequestHelper.client.post(`/staff/${id}/services`, { serviceIds });
  }
};
