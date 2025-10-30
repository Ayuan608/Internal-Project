import React, { useState } from 'react';
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
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Tooltip,
} from '@mui/material';
import {
    Storage,
    CloudUpload,
    Download,
    Delete,
    InsertDriveFile,
    Image,
    VideoLibrary,
    Audiotrack,
    Archive,
    Refresh,
    FolderOpen,
    Security,
    Speed,
    CheckCircle,
    Warning,
    Error as ErrorIcon
} from '@mui/icons-material';

const StoragePage = () => {
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filterType, setFilterType] = useState('all');

    // Vibrant color scheme
    const colors = {
        primary: '#6366F1',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        documents: '#8B5CF6',
        images: '#EC4899',
        videos: '#F97316',
        audio: '#06B6D4',
        archives: '#84CC16'
    };

    // Mock data with vibrant colors
    const storageData = {
        total: 1024,
        used: 687,
        available: 337,
        usagePercentage: 67,
        categories: [
            {
                name: 'Documents',
                used: 245,
                color: colors.documents,
                icon: <InsertDriveFile />,
                growth: '+12%'
            },
            
         
        
            {
                name: 'Archives',
                used: 50,
                color: colors.archives,
                icon: <Archive />,
                growth: '+3%'
            },
        ]
    };

    const filesData = [
        { id: 1, name: 'Annual_Report_2024.pdf', type: 'document', size: '15.2 MB', date: '2024-01-15', status: 'active' },
        { id: 2, name: 'Vacation_Photos_Summer.zip', type: 'archive', size: '245.7 MB', date: '2024-01-14', status: 'active' },
        { id: 3, name: 'Product_Launch_Presentation.pptx', type: 'document', size: '32.1 MB', date: '2024-01-13', status: 'warning' },
        { id: 4, name: 'Background_Music_Track.mp3', type: 'audio', size: '8.7 MB', date: '2024-01-12', status: 'active' },
        { id: 5, name: 'Company_Brand_Assets.png', type: 'image', size: '12.1 MB', date: '2024-01-11', status: 'active' },
        { id: 6, name: 'Training_Video_Tutorial.mp4', type: 'video', size: '156.3 MB', date: '2024-01-10', status: 'active' },
    ];

    const getStatusIcon = (status) => {
        const icons = {
            active: <CheckCircle sx={{ color: colors.success, fontSize: 20 }} />,
            warning: <Warning sx={{ color: colors.warning, fontSize: 20 }} />,
            error: <ErrorIcon sx={{ color: colors.error, fontSize: 20 }} />
        };
        return icons[status] || icons.active;
    };

    const getFileIcon = (type) => {
        const icons = {
            document: <InsertDriveFile sx={{ color: colors.documents, fontSize: 24 }} />,
            image: <Image sx={{ color: colors.images, fontSize: 24 }} />,
            video: <VideoLibrary sx={{ color: colors.videos, fontSize: 24 }} />,
            audio: <Audiotrack sx={{ color: colors.audio, fontSize: 24 }} />,
            archive: <Archive sx={{ color: colors.archives, fontSize: 24 }} />
        };
        return icons[type] || <InsertDriveFile sx={{ color: colors.primary, fontSize: 24 }} />;
    };

    const getTypeColor = (type) => {
        const typeColors = {
            document: colors.documents,
            image: colors.images,
            video: colors.videos,
            audio: colors.audio,
            archive: colors.archives
        };
        return typeColors[type] || colors.primary;
    };

    const filteredFiles = filterType === 'all'
        ? filesData
        : filesData.filter(file => file.type === filterType);

    return (
        <Box sx={{ p: 3, minHeight: '100vh', background: 'rgba(59,130,246,0.03)' }}>
            {/* Background Elements */}
            <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at 20% 80%, ${colors.documents}20 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, ${colors.images}20 0%, transparent 50%),
                    radial-gradient(circle at 40% 40%, ${colors.videos}15 0%, transparent 50%)`,
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
                        Manage your files with style and efficiency
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
                                    <Grid item xs={12} sm={6} key={index}>
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
                                                    {category.used} GB • {category.growth}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={`${Math.round((category.used / storageData.used) * 100)}%`}
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
                border: `1px solid ${colors.videos}30`,
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
                                Files & Documents
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
                                    <MenuItem value="all">All File Types</MenuItem>
                                    <MenuItem value="document">📄 Documents</MenuItem>
                                    <MenuItem value="image">🖼️ Images</MenuItem>
                                    <MenuItem value="video">🎥 Videos</MenuItem>
                                    <MenuItem value="audio">🎵 Audio</MenuItem>
                                    <MenuItem value="archive">📦 Archives</MenuItem>
                                </TextField>
                                <Tooltip title="Refresh Files">
                                    <IconButton sx={{
                                        color: colors.info,
                                        '&:hover': {
                                            background: `${colors.info}20`,
                                        }
                                    }}>
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
                                    {['File Name', 'Type', 'Size', 'Date', 'Status', 'Actions'].map((header, index) => (
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
                                {filteredFiles.map((file, index) => (
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
                                                {getFileIcon(file.type)}
                                                <Typography sx={{ color: 'white', fontWeight: '500' }}>
                                                    {file.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={file.type}
                                                size="small"
                                                sx={{
                                                    background: getTypeColor(file.type),
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    textTransform: 'capitalize',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: '500' }}>
                                            {file.size}
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
                                                <Tooltip title="Delete">
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
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Upload Dialog */}
            <Dialog
                open={uploadDialogOpen}
                onClose={() => setUploadDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
                        borderRadius: 4
                    }
                }}
            >
                <DialogTitle sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    background: `linear-gradient(90deg, ${colors.primary}, ${colors.info})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                }}>
                    Upload New File
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <Box sx={{
                        border: `2px dashed ${colors.primary}`,
                        borderRadius: 3,
                        p: 6,
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            background: 'rgba(255,255,255,0.1)',
                            border: `2px dashed ${colors.info}`,
                        }
                    }}>
                        <CloudUpload sx={{ fontSize: 48, color: colors.primary, mb: 2 }} />
                        <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                            Drop your files here or click to browse
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                            Supports: PDF, Images, Videos, Audio, Archives
                        </Typography>
                        <input
                            type="file"
                            style={{ display: 'none' }}
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button
                        onClick={() => setUploadDialogOpen(false)}
                        sx={{
                            color: '#94A3B8',
                            '&:hover': { color: 'white' }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={!selectedFile}
                        onClick={() => setUploadDialogOpen(false)}
                        sx={{
                            background: `linear-gradient(45deg, ${colors.primary}, ${colors.info})`,
                            borderRadius: 2,
                            px: 4,
                            fontWeight: 'bold',
                            '&:hover': {
                                background: `linear-gradient(45deg, ${colors.info}, ${colors.primary})`,
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        Upload File
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StoragePage;