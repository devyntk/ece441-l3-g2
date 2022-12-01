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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

export default function DeviceUsage() {
  const theme = useTheme();
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
        Device Usage (ID: {deviceData.id})
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
        <StatPaper name="Water Tank">
          {data.water ? "Full" : "Not Full"}
        </StatPaper>
        <InlineGraph
          name="Water Tank Full"
          axisLabel="Is Full"
          data={deviceHistory}
          yKey="water"
        />
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Typography
              component="h3"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Hand Sanitizer Sensor
            </Typography>
            <Typography component="p" variant="h4">
              {data.liquid > 200 ? "Okay" : "Low"}
            </Typography>
            <Typography component="p" variant="h6" color="text.secondary">
              Raw Value: {data.liquid}
            </Typography>
          </Paper>
        </Grid>
        <InlineGraph
          name="Hand Sanitizer Sensor"
          axisLabel="Raw Values"
          data={deviceHistory}
          yKey="liquid"
        />
        <Grid item xs={12} md={8} lg={9}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 240,
            }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Door Opens
            </Typography>
            <ResponsiveContainer>
              <BarChart
                data={deviceHistory}
                margin={{
                  top: 16,
                  right: 16,
                  bottom: 0,
                  left: 24,
                }}
              >
                <XAxis
                  dataKey="timestamp.seconds"
                  tickFormatter={(unixTime) =>
                    format(fromUnixTime(unixTime), "h:mm")
                  }
                  stroke={theme.palette.text.secondary}
                  //   style={theme.typography.body2}
                  type="number"
                  domain={["auto", "auto"]}
                  scale="time"
                ></XAxis>
                <YAxis
                  stroke={theme.palette.text.secondary}
                  style={theme.typography.body2}
                  domain={["dataMin", "dataMax"]}
                >
                  <Label
                    angle={270}
                    position="left"
                    style={{
                      textAnchor: "middle",
                      fill: theme.palette.text.primary,
                      ...theme.typography.body1,
                    }}
                  >
                    Door opens
                  </Label>
                </YAxis>

                <Tooltip
                  labelStyle={{
                    color: theme.palette.primary.main,
                  }}
                  labelFormatter={(unixTime) =>
                    format(fromUnixTime(unixTime), "MM/dd h:mma")
                  }
                />
                <Bar
                  type="monotone"
                  dataKey="opens"
                  stroke={theme.palette.primary.main}
                  name="Door Opens"
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <StatPaper name="Occupancy">
          {data.pir ? "Occupied" : "Not Occupied"}
        </StatPaper>
        <StatPaper name="Door Status">
          {data.door ? "Closed" : "Open"}
        </StatPaper>
      </Grid>
    </Container>
  );
}
