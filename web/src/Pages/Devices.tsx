import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Stack from '@mui/material/Stack';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}
const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));


export default function Devices() {
  const [expanded, setExpanded] = React.useState(false);
  const [expanded2, setExpanded2] = React.useState(false);
  const [expanded3, setExpanded3] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  const handleExpandClick2 = () => {
    setExpanded2(!expanded2);
  };
  const handleExpandClick3 = () => {
    setExpanded3(!expanded3);
  };
    return (
      <div>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 10, sm: 10, md: 10 }}
      >
      <Card sx={{ maxWidth: 300 }}>
      <CardHeader
        title="Device 1"
      />
      <CardMedia
         component="img"
         height="500"
         image="/imgs/toilet1.png"
         alt="toilet1"
      />
      <CardActions disableSpacing>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph>Details</Typography>
          <Typography paragraph>Location</Typography>
          <Typography paragraph>Usage</Typography>
          <Typography paragraph>Livability</Typography>
        </CardContent>
      </Collapse>
    </Card>

    <Card sx={{ maxWidth: 300 }}>
    <CardHeader
        title="Device 2"

      />
      <CardMedia
         component="img"
         height="500"
         image="/imgs/toilet2.png"
         alt="toilet2"
      />
      <CardActions disableSpacing>
      <ExpandMore
          expand={expanded2}
          onClick={handleExpandClick2}
          aria-expanded={expanded2}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded2} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph>Details</Typography>
          <Typography paragraph>Location</Typography>
          <Typography paragraph>Usage</Typography>
          <Typography paragraph>Livability</Typography>
        </CardContent>
      </Collapse>
    </Card>

    <Card sx={{ maxWidth: 300 }}>
    <CardHeader
        title="Device 3"
      />
      <CardMedia
         component="img"
         height="500"
         image="/imgs/toilet3.png"
         alt="toilet3"
      />
      <CardActions disableSpacing>
        <ExpandMore
          expand={expanded3}
          onClick={handleExpandClick3}
          aria-expanded={expanded3}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded3} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph>Details</Typography>
          <Typography paragraph>Location</Typography>
          <Typography paragraph>Usage</Typography>
          <Typography paragraph>Livability</Typography>
        </CardContent>
      </Collapse>
    </Card>



    </Stack>
    </div>
  );
}