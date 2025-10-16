import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Button,
  Paper,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const rows = [
  {
    title: "CSR Outsourcing",
    pricing: "Per seat",
    value: "$82,000",
    status: "Signed",
    start: "2025-07-01",
    end: "2026-09-30",
  },
  {
    title: "IT Support SLA",
    pricing: "Fixed",
    value: "$82,000",
    status: "Pending",
    start: "2025-07-01",
    end: "2026-09-30",
  },
  {
    title: "Cloud Migration",
    pricing: "Project-based",
    value: "$82,000",
    status: "Signed",
    start: "2025-07-01",
    end: "2026-09-30",
  },
  {
    title: "Customer Training",
    pricing: "Per session",
    value: "$82,000",
    status: "Expired",
    start: "2025-07-01",
    end: "2026-09-30",
  },
];

const statusColor = {
  Signed: "success",
  Pending: "warning",
  Expired: "error",
};

const ContactsPricingTable = () => {
  return (
    <Paper
      sx={{
        backgroundColor: "#0f1116",
        color: "#fff",
        padding: 2,
        borderRadius: "10px",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" color="#fff">
          Contacts & Pricing
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="subtitle2" color="gray">
            Total: <strong>$82,000</strong>
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#1e40af",
              textTransform: "none",
              borderRadius: 2,
              fontWeight: "bold",
            }}
          >
            + Add Contract
          </Button>
        </Box>
      </Box>

      <TableContainer>
        <Table className="space-y-5" size="small">
          <TableHead>
            <TableRow sx={{ borderBottom: "1px solid #2c2f36" }}>
              {[
                "Title",
                "Pricing",
                "Value",
                "Status",
                "Start",
                "End",
                "Action",
              ].map((head) => (
                <TableCell
                  key={head}
                  sx={{ color: "#cbd5e1", borderBottom: "1px solid #2c2f36" }}
                >
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {head}
                    {head !== "Action" && (
                      <ArrowDropDownIcon fontSize="small" />
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody className="overflow-auto max-w-[600px]">
            {rows.map((row, idx) => (
              <TableRow
                key={idx}
                hover
              >
                <TableCell className="whitespace-nowrap" sx={{ color: "#fff" }}>
                  {row.title}
                </TableCell>
                <TableCell className="whitespace-nowrap" sx={{ color: "#fff" }}>{row.pricing}</TableCell>
                <TableCell sx={{ color: "#fff" }}>{row.value}</TableCell>
                <TableCell>
                  <Chip
                    label={row.status}
                    size="small"
                    color={statusColor[row.status] || "default"}
                    sx={{ fontWeight: "bold" }}
                  />
                </TableCell>
                <TableCell
                  className="whitespace-nowrap"
                  sx={{ color: "#cbd5e1" }}
                >
                  {row.start}
                </TableCell>
                <TableCell
                  className="whitespace-nowrap"
                  sx={{ color: "#cbd5e1" }}
                >
                  {row.end}
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      sx={{
                        backgroundColor: "#a855f7",
                        color: "#fff",
                        textTransform: "none",
                        fontSize: "0.75rem",
                        borderRadius: "10px",
                        px: 2,
                        "&:hover": {
                          backgroundColor: "#9333ea",
                        },
                      }}
                    >
                      Advance
                    </Button>
                    <Button
                      size="small"
                      sx={{
                        backgroundColor: "#1f2937",
                        color: "#fff",
                        textTransform: "none",
                        fontSize: "0.75rem",
                        borderRadius: "10px",
                        px: 2,
                      }}
                    >
                      Billing
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Optional: Legend below the table */}
      <Box mt={2} fontSize="0.75rem" color="gray">
        <Typography>
          ➤ Vendor Manager → Approval →{" "}
          <span className="text-green-400">Signed</span> → Renewal Due →{" "}
          <span className="text-red-400">Expired</span> → Archived
        </Typography>
      </Box>
    </Paper>
  );
};

export default ContactsPricingTable;
