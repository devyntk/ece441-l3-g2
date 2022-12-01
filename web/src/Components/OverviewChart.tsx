import * as React from "react";
import { useTheme } from "@mui/material/styles";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
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
} from "firebase/firestore";
import { format, fromUnixTime, subDays } from "date-fns";

// Generate Sales Data
function createData(time: string, amount?: number) {
  return { time, amount };
}

const data = [
  createData("00:00", 0),
  createData("03:00", 300),
  createData("06:00", 600),
  createData("09:00", 800),
  createData("12:00", 1500),
  createData("15:00", 2000),
  createData("18:00", 2400),
  createData("21:00", 2400),
  createData("24:00", undefined),
];

export default function Chart() {
  const db = getFirestore();
  const theme = useTheme();

  const [data, setData] = React.useState<{ time: Timestamp; amount: number }[]>(
    []
  );

  const q = query(
    collection(db, "device-one"),
    orderBy("timestamp", "desc"),
    where("timestamp", ">", subDays(new Date(), 1))
  );
  React.useEffect(() => {
    const ubsub = onSnapshot(q, (querySnapshot) => {
      const dataTemp: { time: Timestamp; amount: number }[] = [];
      querySnapshot.forEach((doc) => {
        dataTemp.push({
          time: doc.data().timestamp,
          amount: doc.data().water,
        });
      });
      setData(dataTemp);
      return () => {
        ubsub();
      };
    });
  }, []);

  return (
    <React.Fragment>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Water Level
      </Typography>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 16,
            right: 16,
            bottom: 0,
            left: 24,
          }}
        >
          <XAxis
            dataKey="time.seconds"
            tickFormatter={(unixTime) => format(fromUnixTime(unixTime), "h:mm")}
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
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
              Approximate Fill Level
            </Label>
          </YAxis>
          <Line
            isAnimationActive={true}
            type="monotone"
            dataKey="amount"
            stroke={theme.palette.primary.main}
            dot={false}
          />
          <Tooltip></Tooltip>
        </LineChart>
      </ResponsiveContainer>
    </React.Fragment>
  );
}
