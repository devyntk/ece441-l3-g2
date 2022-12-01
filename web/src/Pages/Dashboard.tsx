import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Chart from "../Components/OverviewChart";
import Component from "react";
import * as React from "react";
import SimpleMap from "./OverviewMap";
import Typography from "@mui/material/Typography";

import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
  onSnapshot,
  Timestamp,
  orderBy,
  DocumentData,
  limit,
} from "firebase/firestore";

export default function Dashboard() {
  const db = getFirestore();
  const [data, setData] = React.useState<DocumentData>([]);

  React.useEffect(() => {
    const q = query(
      collection(db, "device-one"),
      orderBy("timestamp", "desc"),
      limit(1)
    );
    const unsub = onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setData(doc.data())
      });
      return () => {
        unsub();
      };
    });
  }, []);

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
            <SimpleMap />
          </Paper>
        </Grid>
        {/* Chart */}
        <Grid item xs={12} md={8} lg={9}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 240,
            }}
          >
            <Chart />
          </Paper>
        </Grid>
        {/* Recent Deposits */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 240,
            }}
          >
            {/* Overall Status */}
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              System Status
            </Typography>
            <Typography component="p" variant="h4">
                {data.water}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              Currently needing attention
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
