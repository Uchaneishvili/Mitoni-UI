import RequestHelper from '../utils/RequestHelper';

export const reservationService = {
  getAll: async (params = {}) => {
    return RequestHelper.client.get('/reservations', { params });
  },
  
  getById: async (id) => {
    return RequestHelper.client.get(`/reservations/${id}`);
  },

  create: async (data) => {
    return RequestHelper.client.post('/reservations', data);
  },

  update: async (id, data) => {
    return RequestHelper.client.put(`/reservations/${id}`, data);
  },

  updateStatus: async (id, status) => {
    return RequestHelper.client.patch(`/reservations/${id}/status`, { status });
  },

  delete: async (id) => {
    return RequestHelper.client.delete(`/reservations/${id}`);
  },

};
