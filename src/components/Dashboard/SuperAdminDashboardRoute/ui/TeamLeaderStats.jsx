import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StatCard from "./StatCard";

export default function TeamLeaderStats({ title, data, SecondaryTitle }) {
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%" } }}>
      {/* cards */}
      <div className="px-2">
        <Typography component="h2" variant="h6">
          {title}
        </Typography>
        <div className="text-white/70 mb-2">{SecondaryTitle}</div>
      </div>

      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {data.map((card, index) => (
          <Grid key={index} item xs={12} sm={3} lg={3}>
            <StatCard {...card} index={index} />
          </Grid>
        ))}
      </Grid>
    </Box>  
  );
}
