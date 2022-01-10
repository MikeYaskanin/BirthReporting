import React, { FunctionComponent } from "react";
import { Route, RouteProps } from "react-router";
import { AuthContext } from "./context-providers/AuthContextProvider";
import { AuthService } from "./services/AuthService";

export const AuthRoute: FunctionComponent<RouteProps> = (props: RouteProps) => {
  const authContext = React.useContext(AuthContext);
  if (authContext && authContext.isLoggedIn) {
    return <Route {...props}></Route>;
  } else {
    AuthService.beginAuthenticationIfNeeded();
    return <div></div>;
  }
};
