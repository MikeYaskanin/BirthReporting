import {
  AppBar,
  Backdrop,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
} from "@material-ui/core";
import { AccountCircle } from "@material-ui/icons";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { AuthRoute } from "./AuthRoute";
import AuthRedirect from "./components/AuthRedirect";
import RecordTable from "./components/RecordTable";
import { AuthContext } from "./context-providers/AuthContextProvider";

export const AppRoutes: React.FC = () => {
  const authContext = React.useContext(AuthContext);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement>();
  const open = Boolean(anchorEl);

  function handleMenu(event: React.MouseEvent<HTMLElement>): void {
    if (event.currentTarget) {
      setAnchorEl(event.currentTarget);
    }
  }

  function handleClose() {
    setAnchorEl(undefined);
  }
  return authContext?.initialized ? (
    <Router>
      <>
        <AppBar position="static">
          <Toolbar>
            <h1 style={{ fontWeight: 100 }}>BFDR Data Quality Tool</h1>
            <div style={{ flexGrow: 1 }} />
            {authContext?.isLoggedIn && (
              <div>
                <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem style={{ opacity: 0.9, fontWeight: 500 }} disabled>
                    {authContext.userInfo?.name}
                  </MenuItem>

                  <Divider />
                  <MenuItem
                    onClick={() => {
                      authContext.logout();
                      handleClose();
                      window.close();
                    }}
                  >
                    Log Out & Exit
                  </MenuItem>
                </Menu>
              </div>
            )}
          </Toolbar>
        </AppBar>
        <Switch>
          <Route path="/auth-redirect" exact component={AuthRedirect} />
          <AuthRoute path="/" component={RecordTable} />
        </Switch>
      </>
    </Router>
  ) : (
    <>
      <Backdrop open={true}>
        <CircularProgress style={{ color: "white" }} />
      </Backdrop>
    </>
  );
};
