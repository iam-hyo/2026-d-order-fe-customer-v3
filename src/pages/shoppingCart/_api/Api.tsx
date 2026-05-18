import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const booth_id = sessionStorage.getItem("boothId");
export const ApiShopping: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Booth-ID": booth_id,
  },
});

ApiShopping.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const boothId = sessionStorage.getItem("boothId");
    const tableNum = sessionStorage.getItem("tableNum");

    config.headers["X-Booth-Id"] = boothId || "";
    config.headers["X-Table-Number"] = tableNum || "";

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

ApiShopping.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.status === 400) {
      return Promise.reject(error);
    }
  }
);
