import * as React from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import { DeviceContext } from "../Home";
import { useNavigate } from "react-router-dom";
import Link from "@mui/material/Link";
import { Button } from "@mui/material";

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}
const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function Devices() {
  const [device, setDevice] = React.useContext(DeviceContext);
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 10, sm: 10, md: 10 }}
      >
        <Card sx={{ maxWidth: 300 }}>
          <CardHeader title="Device 1" />
          <CardMedia
            component="img"
            height="500"
            image="/imgs/toilet1.png"
            alt="toilet1"
          />
          <CardContent>
            <Button
              onClick={() => {
                setDevice(1);
                navigate("/devices/detail/");
              }}
            >
              Details
            </Button>
            <Button
              onClick={() => {
                setDevice(1);
                navigate("/devices/usage/");
              }}
            >
              Usage
            </Button>
            <Button
              onClick={() => {
                setDevice(1);
                navigate("/devices/livability/");
              }}
            >
              Livability
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ maxWidth: 300 }}>
          <CardHeader title="Device 2" />
          <CardMedia
            component="img"
            height="500"
            image="/imgs/toilet2.png"
            alt="toilet2"
          />
          <CardContent>
            <Button
              onClick={() => {
                setDevice(2);
                navigate("/devices/detail/");
              }}
            >
              Details
            </Button>
            <Button
              onClick={() => {
                setDevice(2);
                navigate("/devices/usage/");
              }}
            >
              Usage
            </Button>
            <Button
              onClick={() => {
                setDevice(2);
                navigate("/devices/livability/");
              }}
            >
              Livability
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ maxWidth: 300 }}>
          <CardHeader title="Device 3" />
          <CardMedia
            component="img"
            height="500"
            image="/imgs/toilet3.png"
            alt="toilet3"
          />
          <CardContent>
            <Button
              onClick={() => {
                setDevice(3);
                navigate("/devices/detail/");
              }}
            >
              Details
            </Button>
            <Button
              onClick={() => {
                setDevice(3);
                navigate("/devices/usage/");
              }}
            >
              Usage
            </Button>
            <Button
              onClick={() => {
                setDevice(3);
                navigate("/devices/livability/");
              }}
            >
              Livability
            </Button>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
