import { Grid, Paper, Typography, useTheme } from "@mui/material";
import { DocumentData } from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { format, fromUnixTime, subDays } from "date-fns";

export default function InlineGraph(props: {
  name: string;
  axisLabel: string;
  data: DocumentData[];
  yKey: string;
}) {
  const theme = useTheme();

  return (
    <Grid item xs={12} md={8} lg={9}>
      <Paper
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          height: 240,
        }}
      >
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          {props.name}
        </Typography>
        <ResponsiveContainer>
          <LineChart
            data={props.data}
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
              {props.axisLabel && (
                <Label
                  angle={270}
                  position="left"
                  style={{
                    textAnchor: "middle",
                    fill: theme.palette.text.primary,
                    ...theme.typography.body1,
                  }}
                >
                  {props.axisLabel}
                </Label>
              )}
            </YAxis>

            <Tooltip
              labelStyle={{
                color: theme.palette.primary.main,
              }}
              labelFormatter={(unixTime) =>
                format(fromUnixTime(unixTime), "MM/dd h:mma")
              }
            />
            <Line
              type="monotone"
              dataKey={props.yKey}
              stroke={theme.palette.primary.main}
              dot={false}
              name={props.name}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Grid>
  );
}
