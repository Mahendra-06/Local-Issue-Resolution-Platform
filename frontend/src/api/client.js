/**
 * Centralized API Client for CivicPulse
 * Configured via VITE_API_BASE_URL
 */

export class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    const cleaned = envUrl.trim().replace(/\/+$/, '');
    // Ensure the base URL always terminates with /api
    return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
  }
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getBaseUrl();

const getAuthHeaders = () => {
  const token = localStorage.getItem('civicpulse_token');
  const headers = {
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse(response, { endpoint = '', tokenSent = null } = {}) {
  const contentType = response.headers.get('content-type');
  let data = null;

  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMessage =
      (data && (data.message || data.error || data.detail)) ||
      `HTTP error ${response.status}: ${response.statusText}`;

    // Handle 401 Unauthorized token expiry or invalid session
    // Never trigger session invalidation for authentication endpoints (e.g., failed credentials or public checks)
    const isAuthRoute =
      endpoint.includes('/auth/login') ||
      endpoint.includes('/auth/register') ||
      endpoint.includes('/auth/departments');

    if (response.status === 401 && !isAuthRoute) {
      // Dispatched event so auth context can handle token invalidation for active session
      window.dispatchEvent(
        new CustomEvent('civicpulse_unauthorized', {
          detail: { endpoint, tokenSent },
        })
      );
    }

    throw new ApiError(errorMessage, response.status, data);
  }

  return data;
}

export const apiClient = {
  baseURL: API_BASE_URL,

  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`);
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });

    const tokenSent = localStorage.getItem('civicpulse_token');
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response, { endpoint, tokenSent });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        `Unable to connect to CivicPulse backend at ${this.baseURL}. Please ensure your server is running.`,
        0,
        { originalError: err.message }
      );
    }
  },

  async post(endpoint, body = {}) {
    const tokenSent = localStorage.getItem('civicpulse_token');
    try {
      const response = await fetch(`${this.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      return await handleResponse(response, { endpoint, tokenSent });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        `Unable to reach backend service for request: ${err.message}`,
        0,
        { originalError: err.message }
      );
    }
  },

  async put(endpoint, body = {}) {
    const tokenSent = localStorage.getItem('civicpulse_token');
    try {
      const response = await fetch(`${this.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      return await handleResponse(response, { endpoint, tokenSent });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        `Unable to reach backend service for request: ${err.message}`,
        0,
        { originalError: err.message }
      );
    }
  },

  async patch(endpoint, body = {}) {
    const tokenSent = localStorage.getItem('civicpulse_token');
    try {
      const response = await fetch(`${this.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      return await handleResponse(response, { endpoint, tokenSent });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        `Unable to reach backend service for request: ${err.message}`,
        0,
        { originalError: err.message }
      );
    }
  },

  async delete(endpoint) {
    const tokenSent = localStorage.getItem('civicpulse_token');
    try {
      const response = await fetch(`${this.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response, { endpoint, tokenSent });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        `Unable to reach backend service for request: ${err.message}`,
        0,
        { originalError: err.message }
      );
    }
  },

  async upload(endpoint, formData) {
    const tokenSent = localStorage.getItem('civicpulse_token');
    try {
      const authHeaders = getAuthHeaders();
      // Remove content-type so browser sets boundary for multipart/form-data
      delete authHeaders['Content-Type'];

      const response = await fetch(`${this.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`, {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      });
      return await handleResponse(response, { endpoint, tokenSent });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        `File upload failed: ${err.message}`,
        0,
        { originalError: err.message }
      );
    }
  },
};
