import * as React from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { Flag } from "lucide-react";

const data = [
  { label: "India", value: 50000 },
  { label: "USA", value: 35000 },
  { label: "Brazil", value: 10000 },
  { label: "Other", value: 5000 },
];

const countries = [
  {
    name: "India",
    value: 50,
    flag: <Flag color="#ccc" size={18} />,
    color: "hsl(220, 60%, 60%)",
  },
  {
    name: "USA",
    value: 35,
    flag: <Flag color="#ccc" size={18} />,
    color: "hsl(220, 60%, 45%)",
  },
  {
    name: "Brazil",
    value: 10,
    flag: <Flag color="#ccc" size={18} />,
    color: "hsl(220, 60%, 35%)",
  },
  {
    name: "Other",
    value: 5,
    flag: <Flag color="#ccc" size={18} />,
    color: "hsl(220, 60%, 25%)",
  },
];

interface StyledTextProps {
  variant: "primary" | "secondary";
}

const StyledText = styled("text", {
  shouldForwardProp: (prop) => prop !== "variant",
})<StyledTextProps>(({ theme }) => ({
  textAnchor: "middle",
  dominantBaseline: "central",
  fill: "#fff",
  fontWeight: 500,
  fontSize: "14px",
}));

interface PieCenterLabelProps {
  primaryText: string;
  secondaryText: string;
}

function PieCenterLabel({ primaryText, secondaryText }: PieCenterLabelProps) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10;
  const secondaryY = primaryY + 24;

  return (
    <>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </>
  );
}

const colors = [
  "hsl(220, 60%, 60%)",
  "hsl(220, 60%, 45%)",
  "hsl(220, 60%, 35%)",
  "hsl(220, 60%, 25%)",
];

export default function ChartUserByCountry() {
  return (
    <Card
      variant="outlined"
      sx={{
        gap: "8px",
        height: "100%",
        width: "25%",
        bgcolor: "#121212",
        color: "white",
        borderColor: "#2e2e2e",
      }}
    >
      <CardContent>
        <Typography component="h2" variant="subtitle2" sx={{ color: "white" }}>
          Users by country
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", width: "25%" }}>
          <PieChart
            colors={colors}
            margin={{ left: 80, right: 80, top: 80, bottom: 80 }}
            series={[
              {
                data,
                innerRadius: 75,
                outerRadius: 100,
                paddingAngle: 0,
                highlightScope: { fade: "global", highlight: "item" },
              },
            ]}
            height={260}
            width={260}
            hideLegend
          >
            <PieCenterLabel primaryText="98.5K" secondaryText="Total" />
          </PieChart>
        </Box>

        {countries.map((country, index) => (
          <Stack
            key={index}
            direction="row"
            sx={{ alignItems: "center", gap: 2, pb: 2 }}
          >
            {country.flag}
            <Stack sx={{ gap: 1, flexGrow: 1 }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "white" }}
                >
                  {country.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "#aaa" }}>
                  {country.value}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={country.value}
                sx={{
                  height: 6,
                  backgroundColor: "#1e1e1e",
                  [`& .${linearProgressClasses.bar}`]: {
                    backgroundColor: country.color,
                  },
                }}
              />
            </Stack>
          </Stack>
        ))}
      </CardContent>
    </Card>
  );
}
