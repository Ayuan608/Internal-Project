import * as React from "react";
import Switch, { switchClasses } from "@mui/joy/Switch";
import { Box, Typography } from "@mui/joy";

export default function ExampleIosSwitch() {
  const [checked, setChecked] = React.useState(false);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: checked ? "normal" : "bold",
          color: checked ? "white/70" : "white",
          transition: "all 0.2s",
        }}
      >
        Morning Shift
      </Typography>

      <Switch
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
        sx={(theme) => ({
          "--Switch-thumbShadow": "0 3px 7px 0 rgba(0 0 0 / 0.12)",
          "--Switch-thumbSize": "27px",
          "--Switch-trackWidth": "51px",
          "--Switch-trackHeight": "31px",
          "--Switch-trackBackground": theme.vars.palette.background.level3,
          [`& .${switchClasses.thumb}`]: {
            transition: "width 0.2s, left 0.2s",
          },
          "&:hover": {
            "--Switch-trackBackground": theme.vars.palette.background.level3,
          },
          "&:active": {
            "--Switch-thumbWidth": "32px",
          },
          [`&.${switchClasses.checked}`]: {
            "--Switch-trackBackground": "#3b82f6",
            "&:hover": {
              "--Switch-trackBackground": "#3178ea",
            },
          },
        })}
      />

      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: checked ? "bold" : "normal",
          color: checked ? "white" : "white/70",
          transition: "all 0.2s",
        }}
      >
        Night Shift
      </Typography>
    </Box>
  );
}
