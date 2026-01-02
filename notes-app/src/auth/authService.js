import axios from 'axios';

// Detect the current host automatically for the API
const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_URL = `http://${currentHost}:8081/api/auth`;

class AuthService {
  async signup(email, password) {
    try {
      const response = await axios.post(`${API_URL}/signup`, { email, password });
      
      // If signup automatically logs user in or returns token:
      if (response.data.token) {
        this._setSession(response.data);
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  }

  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      
      if (response.data.token) {
        this._setSession(response.data);
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid email or password');
    }
  }

  _setSession(authData) {
    localStorage.setItem('authToken', authData.token);
    localStorage.setItem('userEmail', authData.user.email);
    localStorage.setItem('userId', authData.user.id);
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  getUserEmail() {
    return localStorage.getItem('userEmail');
  }

  getUserId() {
    return localStorage.getItem('userId');
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();