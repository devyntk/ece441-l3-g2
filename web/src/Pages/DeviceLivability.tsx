import {
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { format, fromUnixTime, subDays } from "date-fns";
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
import React from "react";
import InlineGraph from "../Components/InlineGraph";
import { DeviceContext } from "../Home";
import { StatPaper } from "./DeviceDetail";

export default function DeviceLivability() {
  const [device, setDevice] = React.useContext(DeviceContext);

  const [deviceData, setDeviceData] = React.useState<DocumentData | null>(null);
  const [deviceHistory, setDeviceHistory] = React.useState<DocumentData[]>([]);
  const [data, setData] = React.useState<DocumentData | null>(null);
  const db = getFirestore();

  React.useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "devices"), where("id", "==", device), limit(1)),
      (querySnapshot) => {
        let dataTemp: DocumentData | null = null;
        querySnapshot.forEach((doc) => {
          dataTemp = doc.data();
        });
        if (dataTemp == null) {
          return null;
        }
        setDeviceData(dataTemp);
      }
    );
    return () => {
      unsub();
    };
  }, []);

  React.useEffect(() => {
    if (deviceData) {
      const unsub = onSnapshot(
        query(
          collection(db, deviceData.collectionName),
          orderBy("timestamp", "desc"),
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
      return () => {
        unsub();
      };
    }
  }, [deviceData]);

  React.useEffect(() => {
    if (deviceData) {
      const unsub = onSnapshot(
        query(
          collection(db, deviceData.collectionName),
          orderBy("timestamp", "desc"),
          where("timestamp", ">", subDays(new Date(), 1))
        ),
        (querySnapshot) => {
          const dataTemp: DocumentData[] = [];
          querySnapshot.forEach((doc) => {
            dataTemp.push(doc.data());
          });
          console.log(dataTemp);
          setDeviceHistory(dataTemp);
        }
      );
      return () => {
        unsub();
      };
    }
  }, [deviceData]);

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
      <Typography component="h2" variant="h4" color="primary">
        Device Livability (ID: {deviceData.id})
      </Typography>
      <Typography
        component="h3"
        variant="subtitle1"
        color="text.secondary"
        gutterBottom
      >
        Last Updated: {formattedDate} (only showing last 24 hours of data)
      </Typography>

      <Grid container spacing={3}>
        <InlineGraph
          name="Temperature"
          axisLabel="Degrees C"
          data={deviceHistory}
          yKey="temp"
        />
        <StatPaper name="Current Temp">{data.temp} C</StatPaper>

        <StatPaper name="Current Humidity">{data.hum}%</StatPaper>
        <InlineGraph
          name="Humidity"
          axisLabel="Humidity (%)"
          data={deviceHistory}
          yKey="hum"
        />
        <InlineGraph
          name="Total Volatile Organic Compounds (TVOC)"
          axisLabel="Parts per Billion (ppb)"
          data={deviceHistory}
          yKey="tvoc"
        />
        <StatPaper name="Current TVOC">{data.tvoc}ppb</StatPaper>
        <StatPaper name="Current eCO2">{data.co2}ppm</StatPaper>
        <InlineGraph
          name="Equivalent Calculated Carbon-Dioxide (eCO2)"
          axisLabel="Parts per Million (ppm)"
          data={deviceHistory}
          yKey="co2"
        />
      </Grid>
    </Container>
  );
}
