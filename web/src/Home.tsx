import * as React from "react";
import { styled } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InfoIcon from "@mui/icons-material/Info";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import MapIcon from "@mui/icons-material/Map";
import SensorDoorIcon from "@mui/icons-material/SensorDoor";
import Button from "@mui/material/Button";
import { getAuth, signOut } from "firebase/auth";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { Route, Routes, Link as RouterLink } from "react-router-dom";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import StarBorder from "@mui/icons-material/StarBorder";

import Dashboard from "./Pages/Dashboard";
import Devices from "./Pages/Devices";
import Input_field from "./Components/Input_field";
import WcIcon from "@mui/icons-material/Wc";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import DeviceDetail from "./Pages/DeviceDetail";
import DeviceUsage from "./Pages/DeviceUsage";
import DeviceLivability from "./Pages/DeviceLivability";

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

export const DeviceContext = React.createContext<
  [number | null, React.Dispatch<React.SetStateAction<number | null>>]
>([null, () => {}]);

export default function Home() {
  const [device, setDevice] = React.useState<number | null>(null);

  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="absolute" open={open}>
        <Toolbar
          sx={{
            pr: "24px", // keep right padding when drawer closed
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: "36px",
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            Portapotty Monitor
          </Typography>
          <Button
            sx={{ color: "#fff" }}
            onClick={() => {
              const auth = getAuth();
            }}
          ></Button>
          <Button
            sx={{ color: "#fff" }}
            onClick={() => {
              const auth = getAuth();
              signOut(auth);
            }}
          >
            Logout
          </Button>

          {/* <IconButton color="inherit">
                        <Badge badgeContent={4} color="secondary">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton> */}
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: [1],
          }}
        >
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>

        <Divider />

        <List component="nav">
          <ListItemButton component={RouterLink} to="/">
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
          <ListItemButton component={RouterLink} to="/devices/">
            <ListItemIcon>
              <WcIcon />
            </ListItemIcon>
            <ListItemText primary="Devices" />
          </ListItemButton>
          {device != null ? (
            <>
              <ListSubheader component="div" inset>
                Selected Device ({device})
              </ListSubheader>
              <ListItemButton component={RouterLink} to="/devices/detail/">
                <ListItemIcon>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText primary="Details" />
              </ListItemButton>
              <ListItemButton component={RouterLink} to="/devices/usage/">
                <ListItemIcon>
                  <SensorDoorIcon />
                </ListItemIcon>
                <ListItemText primary="Usage" />
              </ListItemButton>
              <ListItemButton component={RouterLink} to="/devices/livability/">
                <ListItemIcon>
                  <ThermostatIcon />
                </ListItemIcon>
                <ListItemText primary="Livability" />
              </ListItemButton>
            </>
          ) : (
            <></>
          )}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <Toolbar />
        <DeviceContext.Provider value={[device, setDevice]}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/devices/" element={<Devices />} />
            <Route path="/devices/detail/" element={<DeviceDetail />} />
            <Route path="/devices/usage/" element={<DeviceUsage />} />
            <Route path="/devices/livability/" element={<DeviceLivability />} />
          </Routes>
        </DeviceContext.Provider>
      </Box>
    </Box>
  );
}
