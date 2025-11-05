import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Grid,
    Chip,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    MenuItem,
    TextField,
    Tooltip,
} from '@mui/material';
import {
    Storage,
    Download,
    Delete,
    Archive,
    Refresh,
    CheckCircle,
    Warning,
    Error as ErrorIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { getDeletedReports } from '../../../../redux/reportSlice';

const StoragePage = () => {
    const dispatch = useDispatch();
    const [filterType, setFilterType] = useState('all');
    const { deletedReports } = useSelector((state) => state.report);

    useEffect(() => {
        dispatch(getDeletedReports());
    }, [dispatch]);

    const colors = {
        primary: '#6366F1',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        archives: '#84CC16'
    };

    // Calculate file size in MB based on content length
    const calculateFileSize = (content) => {
        if (!content) return '0.00';
        const sizeInBytes = new Blob([content]).size;
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
        return sizeInMB;
    };

    // Format date to readable format
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        });
    };

    // Determine status based on report status
    const getReportStatus = (status) => {
        if (status === 'seen') return 'active';
        if (status === 'sent') return 'warning';
        return 'error';
    };

    // Convert deleted reports to files data
    const filesData = deletedReports && deletedReports.length > 0 
        ? deletedReports.map((report) => ({
            id: report._id,
            name: `${report.purpose || 'Report'}_${formatDate(report.date).replace(/\//g, '-')}.zip`,
            type: 'archive',
            size: calculateFileSize(report.details),
            date: formatDate(report.deletedAt || report.date),
            status: getReportStatus(report.status),
            rawData: report
        }))
        : [];

    // Calculate total storage used by deleted reports
    const totalUsedStorageMB = filesData.reduce((acc, file) => acc + parseFloat(file.size), 0);
    const totalStorageGB = (totalUsedStorageMB / 1024).toFixed(2);
    const totalCapacityGB = 1024;
    const availableGB = (totalCapacityGB - totalUsedStorageMB / 1024).toFixed(2);
    const usagePercentage = Math.min(Math.round((totalUsedStorageMB / (totalCapacityGB * 1024)) * 100), 100);

    const storageData = {
        total: totalCapacityGB,
        used: totalStorageGB,
        available: availableGB,
        usagePercentage: usagePercentage,
        categories: [
            {
                name: 'Archives',
                used: totalStorageGB,
                color: colors.archives,
                icon: <Archive />,
                count: filesData.length
            },
        ]
    };

    const getStatusIcon = (status) => {
        const icons = {
            active: <CheckCircle sx={{ color: colors.success, fontSize: 20 }} />,
            warning: <Warning sx={{ color: colors.warning, fontSize: 20 }} />,
            error: <ErrorIcon sx={{ color: colors.error, fontSize: 20 }} />
        };
        return icons[status] || icons.active;
    };

    const getFileIcon = () => {
        return <Archive sx={{ color: colors.archives, fontSize: 24 }} />;
    };

    const filteredFiles = filterType === 'all' ? filesData : filesData.filter(file => file.type === filterType);

    return (
        <Box sx={{ p: 3, minHeight: '100vh', background: 'rgba(59,130,246,0.03)' }}>
            {/* Background Elements */}
            <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at 20% 80%, ${colors.archives}20 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, ${colors.primary}20 0%, transparent 50%),
                    radial-gradient(circle at 40% 40%, ${colors.info}15 0%, transparent 50%)`,
                zIndex: -1
            }} />

            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                <Box>
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                            fontWeight: 'bold',
                            background: `linear-gradient(45deg, ${colors.primary}, ${colors.info})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                        }}
                    >
                        Cloud Storage
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#94A3B8', fontWeight: 300 }}>
                        Manage your deleted reports archive
                    </Typography>
                </Box>
            </Box>

            {/* Storage Overview Cards */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
                {/* Main Storage Card */}
                <Grid item xs={12} md={4}>
                    <Card sx={{
                        background: 'rgba(59,130,246,0.03)',
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${colors.primary}30`,
                        borderRadius: 4,
                        height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: `0 20px 40px ${colors.primary}20`,
                            border: `1px solid ${colors.primary}60`
                        }
                    }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Box sx={{
                                    background: `linear-gradient(45deg, ${colors.primary}, ${colors.info})`,
                                    borderRadius: 3,
                                    p: 2,
                                    mr: 3,
                                }}>
                                    <Storage sx={{ color: 'white', fontSize: 32 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {storageData.used} GB
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                                        Used of {storageData.total} GB
                                    </Typography>
                                </Box>
                            </Box>

                            <LinearProgress
                                variant="determinate"
                                value={storageData.usagePercentage}
                                sx={{
                                    height: 12,
                                    borderRadius: 6,
                                    background: 'rgba(255,255,255,0.1)',
                                    '& .MuiLinearProgress-bar': {
                                        background: `linear-gradient(90deg, ${colors.primary}, ${colors.info})`,
                                        borderRadius: 6,
                                    }
                                }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                                    {storageData.available} GB available
                                </Typography>
                                <Chip
                                    label={`${storageData.usagePercentage}% Used`}
                                    sx={{
                                        background: colors.primary,
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Storage by Type Card */}
                <Grid item xs={12} md={8}>
                    <Card sx={{
                        background: 'rgba(59,130,246,0.03)',
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${colors.info}30`,
                        borderRadius: 4,
                        height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: `0 20px 40px ${colors.info}20`
                        }
                    }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h5" gutterBottom sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>
                                Storage by File Type
                            </Typography>
                            <Grid container spacing={3}>
                                {storageData.categories.map((category, index) => (
                                    <Grid item xs={12} key={index}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            p: 2,
                                            borderRadius: 3,
                                            background: 'rgba(255,255,255,0.05)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: 'rgba(255,255,255,0.1)',
                                                transform: 'translateX(8px)'
                                            }
                                        }}>
                                            <Box sx={{ color: category.color, mr: 2 }}>
                                                {category.icon}
                                            </Box>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
                                                    {category.name}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                                                    {category.used} GB • {category.count} files
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label="100%"
                                                size="small"
                                                sx={{
                                                    background: category.color,
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Files Table Section */}
            <Card sx={{
                background: 'rgba(59,130,246,0.03)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${colors.archives}30`,
                borderRadius: 4,
                overflow: 'hidden'
            }}>
                <CardContent sx={{ p: 0 }}>
                    {/* Table Header */}
                    <Box sx={{
                        p: 3,
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(59,130,246,0.03)'
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                                Deleted Reports ({filteredFiles.length})
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <TextField
                                    select
                                    size="small"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    sx={{
                                        minWidth: 140,
                                        '& .MuiOutlinedInput-root': {
                                            background: 'rgba(59,130,246,0.03)',
                                            color: 'white',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: 2
                                        }
                                    }}
                                >
                                    <MenuItem value="all">All Files</MenuItem>
                                    <MenuItem value="archive">📦 Archives</MenuItem>
                                </TextField>
                                <Tooltip title="Refresh Files">
                                    <IconButton 
                                        onClick={() => dispatch(getDeletedReports())}
                                        sx={{
                                            color: colors.info,
                                            '&:hover': {
                                                background: `${colors.info}20`,
                                            }
                                        }}
                                    >
                                        <Refresh />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Box>

                    {/* Files Table */}
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ background: 'rgba(59,130,246,0.1)' }}>
                                    {['File Name', 'Type', 'Size', 'Deleted Date', 'Status', 'Actions'].map((header) => (
                                        <TableCell
                                            key={header}
                                            sx={{
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '1rem',
                                                borderBottom: '2px solid rgba(255,255,255,0.2)'
                                            }}
                                        >
                                            {header}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredFiles.length > 0 ? (
                                    filteredFiles.map((file) => (
                                        <TableRow
                                            key={file.id}
                                            sx={{
                                                '&:hover': {
                                                    background: 'rgba(255,255,255,0.05)',
                                                    transition: 'all 0.3s ease'
                                                },
                                                borderBottom: '1px solid rgba(255,255,255,0.1)'
                                            }}
                                        >
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    {getFileIcon()}
                                                    <Typography sx={{ color: 'white', fontWeight: '500' }}>
                                                        {file.name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label="Archive"
                                                    size="small"
                                                    sx={{
                                                        background: colors.archives,
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        textTransform: 'capitalize',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: '500' }}>
                                                {file.size} MB
                                            </TableCell>
                                            <TableCell sx={{ color: '#94A3B8' }}>
                                                {file.date}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {getStatusIcon(file.status)}
                                                    <Typography sx={{
                                                        color: 'white',
                                                        textTransform: 'capitalize',
                                                        fontWeight: '500'
                                                    }}>
                                                        {file.status}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Tooltip title="Download">
                                                        <IconButton
                                                            size="small"
                                                            sx={{
                                                                color: colors.success,
                                                                '&:hover': {
                                                                    background: `${colors.success}20`,
                                                                }
                                                            }}
                                                        >
                                                            <Download />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Permanently">
                                                        <IconButton
                                                            size="small"
                                                            sx={{
                                                                color: colors.error,
                                                                '&:hover': {
                                                                    background: `${colors.error}20`,
                                                                }
                                                            }}
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                            <Archive sx={{ fontSize: 64, color: '#94A3B8', mb: 2 }} />
                                            <Typography variant="h6" sx={{ color: '#94A3B8' }}>
                                                No deleted reports found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default StoragePage;