import React from "react";
import "./App.css";
import { AppRoutes } from "./AppRoutes";
import { AuthContextProvider } from "./context-providers/AuthContextProvider";

function App(): JSX.Element {
  return (
    <div>
      <AuthContextProvider>
        <AppRoutes />
      </AuthContextProvider>
    </div>
  );
}

export default App;
