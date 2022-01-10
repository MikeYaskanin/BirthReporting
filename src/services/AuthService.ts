import { BaseHttp } from "../config/AxiosConfig";

const ACCESS_TOKEN_STORAGE_KEY = "BFDR_A_T";
const REFRESH_TOKEN_STORAGE_KEY = "BFDR_R_T";
const AUTH_STATE_STORAGE_KEY = "BFDR_AUTH_STATE";

export type AccessTokenResponse = {
  access_token: string;
  id_token: string;
  refresh_token: string;
};

export class AuthService {
  private static storeAuthTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  }

  private static storeAccessToken(accessToken: string) {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  }

  public static clearStoredTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  private static clearStoredAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }

  private static generateStateForAuth(): string {
    const randomStateForAuth = Date.now() + "-" + Math.random();
    localStorage.setItem(AUTH_STATE_STORAGE_KEY, randomStateForAuth);
    return randomStateForAuth;
  }

  public static getSingleUseStoredAuthState(): string {
    const storedSingleUseState = localStorage.getItem(AUTH_STATE_STORAGE_KEY);
    // Remove this code immediately after fetching it to avoid duplicate request
    localStorage.removeItem(AUTH_STATE_STORAGE_KEY);
    if (storedSingleUseState) {
      return storedSingleUseState;
    }

    throw Error("Stored authentication state not found");
  }

  public static getAccessTokens(code: string): Promise<AccessTokenResponse> {
    const requestParams: Record<string, string> = {
      code,
      client_id: AuthService.getAuthClientId(),
      redirect_uri: AuthService.getAuthRedirectUri(),
      grant_type: "authorization_code",
    };

    const data = Object.keys(requestParams)
      .map((key) => `${key}=${encodeURIComponent(requestParams[key])}`)
      .join("&");

    return BaseHttp.post(
      "https://authorization.cerner.com/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/protocols/oauth2/profiles/smart-v1/token",
      data,
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      }
    ).then((response) => {
      if (response.data?.access_token) {
        AuthService.storeAuthTokens(
          response.data.access_token,
          response.data.refresh_token
        );
      }
      return response.data;
    });
  }

  private static getAuthRedirectUri(): string {
    return "http://localhost:3000/auth-redirect";
  }

  private static getAuthClientId(): string {
    const cernerClientId = "";
    if(!cernerClientId) {
      throw new Error("No Cerner client ID provided! Go to https://code.cerner.com/developer/smart-on-fhir/apps to register an app and get the client ID");
    }
    return cernerClientId;
  }

  public static getStoredToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  }

  public static getStoredRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  public static beginAuthenticationIfNeeded(): void {
    const authUrl =
      "https://authorization.cerner.com/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/protocols/oauth2/profiles/smart-v1/personas/provider/authorize" +
      `?client_id=${AuthService.getAuthClientId()}` +
      `&redirect_uri=${AuthService.getAuthRedirectUri()}` +
      "&scope=profile fhirUser openid online_access user/Patient.read user/Observation.read user/RelatedPerson.read user/Coverage.read user/Condition.read user/Procedure.read" +
      "&response_type=code" +
      "&aud=https://fhir-ehr-code.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d" +
      `&state=${AuthService.generateStateForAuth()}`;
    window.location.href = authUrl;
  }

  public static getAuthenticatedUser(): { userId: number } | null {
    if (AuthService.getStoredToken()) {
      return { userId: 1234 };
    }
    return null;
  }

  /**
   * If a refresh token is found, then a request will be made to refresh the user's access token
   * When successful, the token will be updated and the returned promise will resolve
   *
   * Promise is rejected on error.
   * @returns a promise
   */
  public static attemptTokenRefresh(): Promise<void> {
    this.clearStoredAccessToken();
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      return Promise.reject(new Error("No refresh token found"));
    }

    return new Promise((resolve, reject) => {
      const requestParams = {
        client_id: AuthService.getAuthClientId(),
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      };

      const data = Object.keys(requestParams)
        .map(
          (key) =>
            `${key}=${encodeURIComponent(
              requestParams[key as keyof typeof requestParams]
            )}`
        )
        .join("&");

      return BaseHttp.post(
        "https://authorization.cerner.com/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/protocols/oauth2/profiles/smart-v1/token",
        data,
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache",
          },
        }
      )
        .then((response) => {
          if (response.data?.access_token) {
            this.storeAccessToken(response.data.access_token);
            resolve();
          } else {
            reject(new Error("access token not returned"));
          }
        })
        .catch(reject);
    });
  }
}
