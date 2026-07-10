import axios from 'axios';

const apiClient = axios.create();

apiClient.interceptors.request.use(
  (config) => {
    // Check if the URL points to the microservice / api. If so, append X-Api-Key.
    // Given the previous codebase, it seems all requests from these components are for the microservice API.
    const apiKey = import.meta.env.VITE_X_API_KEY || sessionStorage.getItem("api_key") || localStorage.getItem("api_key") || "";
    if (apiKey && apiKey !== "null" && apiKey !== "undefined") {
        config.headers['X-Api-Key'] = apiKey;
        config.headers['x-api-key'] = apiKey; // Some backend might expect lowercase
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
