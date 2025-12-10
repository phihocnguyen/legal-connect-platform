import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  timeout: 30000, // Increased to 30 seconds for heavy queries
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(
      `[AXIOS] ${response.config.method?.toUpperCase()} ${
        response.config.url
      }:`,
      response.status,
      response.data
    );
    return response;
  },
  (error: AxiosError) => {
    console.error(
      `[AXIOS ERROR] ${error.config?.method?.toUpperCase()} ${
        error.config?.url
      }:`,
      error.response?.status,
      error.response?.data
    );
    if (error.response?.status === 401) {
      console.log("[AXIOS] 401 Unauthorized");
      // Don't redirect for auth check endpoints - let the component handle 401
      const url = error.config?.url || "";
      const isAuthCheckEndpoint =
        url.includes("/auth/me") || url.includes("/auth/status");

      if (!isAuthCheckEndpoint) {
        console.log("[AXIOS] 401 on non-auth endpoint - redirecting to /login");
        // Use setTimeout to avoid redirect during component init
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
      }
    }
    if (error.response?.status === 403) {
      console.error("Access denied");
    }
    if (error.response && error.response.status >= 500) {
      console.error("Server error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export const apiClient = {
  get: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.get(url, config);
  },

  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.post(url, data, config);
  },

  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.put(url, data, config);
  },

  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.patch(url, data, config);
  },

  delete: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.delete(url, config);
  },
};

export default axiosInstance;
