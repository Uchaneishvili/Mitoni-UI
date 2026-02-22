import axios from 'axios';

export default class RequestHelper {
  static BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1/';
  
  static _client = null;

  static get client() {
    if (!this._client) {
      this._client = axios.create({
        baseURL: this.BASE_URL,
        headers: {
          'Content-Type': 'application/json',
          // Note: Since this is an MVP without authentication, 
          // we omit the Authorization header.
        },
        timeout: 10000, // 10 second timeout
      });

      this._client.interceptors.response.use(
        (response) => {
          const res = response.data;

          if (res?.success && res?.data?.data) {
            return { data: res.data.data, total: res.data.meta?.total || res.data.data.length };
          }
          if (Array.isArray(res)) {
            return { data: res, total: res.length };
          }
          if (res && Array.isArray(res.data)) {
            return { data: res.data, total: res.total || res.data.length };
          }
          if (res && Array.isArray(res.items)) {
            return { data: res.items, total: res.total || res.items.length };
          }
          
          return res; 
        },
        (error) => {
          console.error('API Error:', error?.response?.data || error.message);
          return Promise.reject(error);
        }
      );
    }

    return this._client;
  }
}
