import {
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import GoogleMapReact from "google-map-react";
import React, { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { DeviceContext } from "../Home";
import { Marker } from "./OverviewMap";
import {
  collection,
  DocumentData,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { format } from "date-fns";

function StatPaper(props: { name: String; children: ReactNode }) {
  return (
    <Grid item xs={12} md={4} lg={3}>
      <Paper
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          {props.name}
        </Typography>
        <Typography component="p" variant="h4">
          {props.children}
        </Typography>
      </Paper>
    </Grid>
  );
}

export default function DeviceDetail() {
  const [device, setDevice] = React.useContext(DeviceContext);

  const [deviceData, setDeviceData] = React.useState<DocumentData | null>(null);
  const [data, setData] = React.useState<DocumentData | null>(null);
  const db = getFirestore();

  onSnapshot(
    query(collection(db, "devices"), where("id", "==", device), limit(1)),
    (querySnapshot) => {
        let dataTemp: DocumentData|null = null;
        querySnapshot.forEach((doc) => {
          dataTemp = doc.data();
        });
        if (dataTemp == null){
            return null;
        }
        setDeviceData(dataTemp);
    }
  );

  if (deviceData) {
    onSnapshot(
      query(
        collection(db, deviceData.collectionName),
        orderBy("timestamp"),
        limit(1)
      ),
      (querySnapshot) => {
        let dataTemp: DocumentData = {};
        querySnapshot.forEach((doc) => {
          dataTemp = doc.data();
        });
        setData(dataTemp);
      }
    );
  }
  if (!data || !deviceData) {
    return (
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: "100vh" }}
      >
        <Grid item xs={3}>
          <CircularProgress></CircularProgress>
        </Grid>
      </Grid>
    );
  }
  const formattedDate = format(data.timestamp.toDate(), "MM/dd/yyyy h:mma");
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 240,
            }}
          >
            <GoogleMapReact
              bootstrapURLKeys={{
                key: "AIzaSyDAK-NEM2_3wgC29Jmz2NwL9KzHd7xvm8I",
              }}
              defaultCenter={{
                lat: deviceData.location._lat,
                lng: deviceData.location._long,
              }}
              defaultZoom={14}
            >
                <Marker
                  id={deviceData.id}
                  lat={deviceData.location._lat}
                  lng={deviceData.location._long}
                />
            </GoogleMapReact>
          </Paper>
        </Grid>
        <StatPaper name="Last Update">{formattedDate}</StatPaper>
        <StatPaper name="Temperature">{data.temp} C</StatPaper>
        <StatPaper name="Humidity">{data.hum}%</StatPaper>
        <StatPaper name="TVOC">{data.tvoc}</StatPaper>
        <StatPaper name="CO2">{data.co2}</StatPaper>
      </Grid>
    </Container>
  );
}
