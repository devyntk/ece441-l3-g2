import devicesItems from "../Devices.json";
import {Col, Row} from "react-bootstrap";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';



export default function Devices() {
    return (
        <Card sx={{ maxWidth: 500 }}>
            <CardActionArea>
          <CardMedia
            component="img"
            height="500"
            image="/imgs/toilet1.png"
            alt="toilet1"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              Device 1
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Details
            </Typography>
          </CardContent>
          </CardActionArea>
        </Card>

        
      );
}