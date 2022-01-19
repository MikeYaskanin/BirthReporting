import axios, { AxiosInstance } from "axios";
import { AuthService } from "../services/AuthService";

export const FhirHttp: AxiosInstance = axios.create({
  baseURL:
    "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
});

FhirHttp.interceptors.request.use((config) => {
  // Always add the content-type header if not already on the request
  if (!config.headers["content-type"]) {
    config.headers["content-type"] = "application/json";
  }
  // Always add the auth header to requests if not already present
  const accessToken = AuthService.getStoredToken();
  if (accessToken && !config.headers["Authorization"]) {
    // Auth tokens are placed in the Authorization header with the prefix: Bearer
    config.headers["Authorization"] = "Bearer " + accessToken;
  }
  return config;
});

FhirHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // A 401 error means that the access token has likely expired. Try to refresh it!
      return AuthService.attemptTokenRefresh()
        .then(() => {
          // Repeat the request again with the updated token & no new base url
          // https://stackoverflow.com/questions/51563821/axios-interceptors-retry-original-request-and-access-original-promise
          const accessToken = AuthService.getStoredToken();
          error.config.headers["Authorization"] = "Bearer " + accessToken;
          error.baseURL = undefined;
          return axios.request(error.config);
        })
        .catch(() => {
          alert("Your session has expired");
          AuthService.clearStoredTokens();
          window.location.href = "/";
        });
    } else if (!error || !error.response) {
      console.error(error);
      alert(
        "There was an error completing your request - due to network errors, this page may not have loaded correctly and/or your changes may not be saved. Try reloading the page or contact your administrator if the problem continues."
      );
    } else {
      return Promise.reject(error);
    }
  }
);

export const BaseHttp = axios.create();
