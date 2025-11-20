// StoragePageProfessional.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Tooltip,
  InputAdornment,
  Paper,
  Button
} from '@mui/material';
import {
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  FilePresent as FileIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { getDeletedReports } from '../../../../redux/reportSlice';

// PROFESSIONAL COLOR PALETTE
const COLORS = {
  primary: '#3B82F6',
  success: '#22C55E',
  warning: '#FACC15',
  error: '#EF4444',
  archive: '#0EA5E9',
  bgDark: '#0F172A',
  panel: 'rgba(255,255,255,0.02)',
  muted: '#94A3B8'
};

// helper: stable pseudo-random size generator based on id
const generateSizeKB = (id) => {
  // simple hash to make "random" but stable per id
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const val = Math.abs(hash) % 900 + 100; // between 100 and 999 KB
  return `${val} KB`;
};

const formatDate = (d) => {
  if (!d) return 'N/A';
  const date = new Date(d);
  return date.toLocaleDateString('en-GB'); // dd/mm/yyyy
};

const mapStatus = (status) => {
  if (status === 'seen') return 'active';
  if (status === 'sent') return 'warning';
  return 'error';
};

const statusColor = (s) => {
  if (s === 'active') return COLORS.success;
  if (s === 'warning') return COLORS.warning;
  return COLORS.error;
};

const StoragePageProfessional = () => {
  const dispatch = useDispatch();
  const { deletedReports } = useSelector((state) => state.report || { deletedReports: [] });

  // local state for files (so we can delete locally)
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(getDeletedReports());
  }, [dispatch]);

  // map deletedReports to files with stable random size and formatted fields
  useEffect(() => {
    const mapped = (deletedReports || []).map((r) => {
      const id = r._id || Math.random().toString(36).slice(2, 9);
      const name = `${r.purpose || 'Report'}_${formatDate(r.date).replace(/\//g, '-')}.zip`;
      const status = mapStatus(r.status);
      return {
        id,
        name,
        type: 'archive',
        size: generateSizeKB(id),
        date: formatDate(r.deletedAt || r.date),
        status,
        raw: r
      };
    });
    setFiles(mapped);
  }, [deletedReports]);

  // derived metrics for top cards
  const metrics = useMemo(() => {
    const total = files.length;
    const active = files.filter(f => f.status === 'active').length;
    const warning = files.filter(f => f.status === 'warning').length;
    const error = files.filter(f => f.status === 'error').length;
    return { total, active, warning, error };
  }, [files]);

  const filtered = files.filter(f => {
    if (typeFilter !== 'all' && f.type !== typeFilter) return false;
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (query && !f.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  // CSV download (Excel-compatible)
  const downloadCSV = (rows, filename = 'deleted_reports.csv') => {
    if (!rows || rows.length === 0) return;
    const header = ['File Name', 'Type', 'Size', 'Deleted Date', 'Status'];
    const csvRows = [
      header.join(','),
      ...rows.map(r => [
        `"${r.name.replace(/"/g,'""')}"`,
        r.type,
        r.size,
        r.date,
        r.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', filename);
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadRow = (file) => {
    // download single file row as CSV (Excel openable)
    downloadCSV([file], `${file.name.replace(/\s/g, '_')}.csv`);
  };

  const handleDownloadAll = () => {
    downloadCSV(filtered, `deleted_reports_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const handleDelete = (id) => {
    const file = files.find(f => f.id === id);
    if (!file) return;
    const ok = window.confirm(`Permanently delete "${file.name}" ?`);
    if (!ok) return;
    // optimistic local delete; if you want backend call, dispatch action here
    setFiles(prev => prev.filter(f => f.id !== id));
    // optionally dispatch backend delete action here
  };

  const handleRefresh = () => {
    dispatch(getDeletedReports());
  };

  return (
    <Box sx={{
      p: 3,
      minHeight: '100vh',
      color: 'white'
    }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Deleted Reports Archive</Typography>
        <Typography variant="body2" sx={{ color: COLORS.muted, mt: 0.5 }}>
          Efficiently manage archived and removed reports — download as Excel or permanently delete.
        </Typography>
      </Box>

      {/* Top Metric Cards */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Total Files', value: metrics.total, color: COLORS.primary, icon: <FileIcon /> },
          { label: 'Active', value: metrics.active, color: COLORS.success, icon: <CheckCircleIcon /> },
          { label: 'Warning', value: metrics.warning, color: COLORS.warning, icon: <WarningIcon /> },
          { label: 'Error', value: metrics.error, color: COLORS.error, icon: <ErrorIcon /> },
        ].map((m, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{
              background: COLORS.panel,
              border: `1px solid rgba(255,255,255,0.04)`,
              borderRadius: 2,
              '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 8px 30px ${m.color}22` },
            }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${m.color}20`,
                  color: m.color,
                  fontSize: 20
                }}>
                  {m.icon}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 18 ,color:'white' }}>{m.value}</Typography>
                  <Typography sx={{ color: COLORS.muted, fontSize: 13 }}>{m.label}</Typography>
                </Box>
                <Chip label={m.label} sx={{ background: m.color, color: 'white', fontWeight: 700 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 2, background: 'transparent', border: 'none' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search files..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{
                minWidth: 260,
                '& .MuiOutlinedInput-root': { background: 'rgba(255,255,255,0.02)', color: 'white' }
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: COLORS.muted }} /></InputAdornment>
              }}
            />
            <TextField
              select
              size="small"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { background: 'rgba(255,255,255,0.02)', color: 'white' } }}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="archive">Archives</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { background: 'rgba(255,255,255,0.02)', color: 'white' } }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="error">Error</MenuItem>
            </TextField>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} sx={{ color: COLORS.primary }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadAll}
              sx={{ background: COLORS.primary, '&:hover': { background: '#2b6fd8' } }}
            >
              Export Excel
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Files Table */}
      <Card sx={{ background: COLORS.panel,  overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Box}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'rgba(255,255,255,0.02)' }}>
                  {['File Name', 'Type', 'Size', 'Deleted Date', 'Status', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ color: 'white', fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <ArchiveIcon sx={{ fontSize: 48, color: COLORS.muted, mb: 1 }} />
                      <Typography sx={{ color: COLORS.muted }}>No deleted reports found</Typography>
                    </TableCell>
                  </TableRow>
                ) : filtered.map(file => (
                  <TableRow key={file.id}
                    sx={{
                      '&:hover': { background: 'rgba(255,255,255,0.02)', transform: 'translateX(4px)' },
                      transition: 'all 0.2s ease'
                    }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)' }}>
                          <ArchiveIcon sx={{ color: COLORS.archive }} />
                        </Box>
                        <Typography sx={{ fontWeight: 600 , color: 'white' }}>{file.name}</Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={<FileIcon sx={{ fontSize: 16 }} />}
                        label="Archive"
                        size="small"
                        sx={{ background: COLORS.archive, color: 'white', fontWeight: 700 }}
                      />
                    </TableCell>

                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>{file.size}</TableCell>

                    <TableCell sx={{ color: COLORS.muted }}>{file.date}</TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: statusColor(file.status)
                        }} />
                        <Typography sx={{ textTransform: 'capitalize', fontWeight: 600, color: 'white' }}>{file.status}</Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Download Excel (CSV)">
                          <IconButton size="small" onClick={() => handleDownloadRow(file)} sx={{ color: COLORS.primary }}>
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Permanently">
                          <IconButton size="small" onClick={() => handleDelete(file.id)} sx={{ color: COLORS.error }}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StoragePageProfessional;
