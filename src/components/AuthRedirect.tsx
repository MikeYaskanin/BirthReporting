import decode from "jwt-decode";
import React from "react";
import { useHistory, useLocation } from "react-router";
import {
  AuthContext,
  AuthUser,
} from "../context-providers/AuthContextProvider";
import { AuthService } from "../services/AuthService";

const AuthRedirect: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const authContext = React.useContext(AuthContext);
  const urlParams = new URLSearchParams(location.search);
  React.useEffect(() => {
    const code = urlParams.get("code");
    if (!code) {
      authContext?.logout();
      history?.push("/");
      return;
    }

    try {
      if (
        AuthService.getSingleUseStoredAuthState() !== urlParams.get("state")
      ) {
        throw new Error("Invalid access");
      }
    } catch (e) {
      console.warn(e);
      authContext?.logout();
      history?.push("/");
      return;
    }

    AuthService.getAccessTokens(code).then((accessTokenResponse) => {
      if (accessTokenResponse.id_token) {
        const id = decode(accessTokenResponse.id_token) as {
          name: string;
          exp: number;
        };
        const userInfo: AuthUser = { name: id.name, exp: id.exp };
        authContext?.setUserInfo(userInfo);
      } else {
        authContext?.setUserInfo({ name: "test user", exp: 1234567 });
      }
      history.replace("/");
    });
  }, []);

  return <div></div>;
};

export default AuthRedirect;
