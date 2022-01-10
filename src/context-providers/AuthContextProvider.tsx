import React, { ReactNode, useEffect } from "react";
import { AuthService } from "../services/AuthService";

export const BfdrUserStorageKey = "currentBfdrUser";

export const AuthContext = React.createContext<
  | {
      isLoggedIn: boolean;
      logout: () => void;
      userInfo: AuthUser | null;
      setUserInfo: (userInfo: AuthUser) => void;
      initialized: boolean;
    }
  | undefined
>(undefined);

type AuthContextProps = {
  children: ReactNode;
};

export type AuthUser = {
  name: string;
  exp: number;
};

export const AuthContextProvider: React.FC<AuthContextProps> = ({
  children,
}: AuthContextProps) => {
  const [userInfo, setUserInfoState] = React.useState<AuthUser | null>(null);
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const isLoggedIn = React.useMemo(() => Boolean(userInfo?.name), [userInfo]);

  useEffect(() => {
    // When the app loads, attempt to load the authenticated user
    const authUserString = localStorage.getItem(BfdrUserStorageKey);
    if (authUserString) {
      const authUser = JSON.parse(authUserString) as AuthUser;
      if (new Date(authUser.exp * 1000) > new Date()) {
        setUserInfoState(authUser);
        setInitialized(true);
        return;
      }
    }

    // Logout of the application if no user found, just to be safe
    logout();
    setInitialized(true);
  }, []);

  function logout(): void {
    // TODO: Implement the log out action!
    localStorage.removeItem(BfdrUserStorageKey);
    AuthService.clearStoredTokens();
    setUserInfoState(null);
  }

  function setUserInfo(user: AuthUser): void {
    localStorage.setItem(BfdrUserStorageKey, JSON.stringify(user));
    setUserInfoState(user);
  }

  return (
    <AuthContext.Provider
      value={{
        logout,
        isLoggedIn,
        userInfo,
        setUserInfo,
        initialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
