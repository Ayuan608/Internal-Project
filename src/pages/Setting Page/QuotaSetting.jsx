import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Paper,
  Divider,
  Chip,
  Stack,
  Container,
  CircularProgress,
  Slider,
  Switch,
  FormControlLabel,
  TextField,
  alpha
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Save as SaveIcon,
  PieChart as PieChartIcon,
  Warning as WarningIcon,
  AccessTime as ClockIcon,
  People as UsersIcon,
  AttachMoney as DollarSignIcon,
  CreditCard as CreditCardIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import toast from 'react-hot-toast';
import { getAllQuotas, createQuota, resetAllQuotas } from '../../redux/quotaSlice';
import { useDispatch, useSelector } from 'react-redux';

// Simple dark mode styling
const SimpleCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#9696a814',
  border: '1px solid #2d2d3a',
  borderRadius: '8px',
  color: '#e0e0e0'
}));

const SimpleShiftCard = styled(Paper)(({ theme }) => ({
  backgroundColor: '#9696a814',
  border: '1px solid #373747',
  borderRadius: '6px',
  padding: '16px',
  color: '#e0e0e0'
}));

const SimpleTab = styled(Tab)(({ theme }) => ({
  backgroundColor: '#9696a814',
  color: '#b0b0b0',
  borderRadius: '6px',
  margin: '2px',
  textTransform: 'none',
  fontWeight: 500,
  minHeight: '36px',
  '&.Mui-selected': {
    backgroundColor: '#3a3a4a',
    color: '#ffffff',
    border: '1px solid #4a4a5a'
  },
  '&:hover': {
    backgroundColor: '#323242',
    color: '#ffffff'
  }
}));

const SimpleSlider = styled(Slider)(({ theme }) => ({
  color: '#9696a814',
  height: 6,
  marginTop: '12px',
  marginBottom: '8px',
  '& .MuiSlider-track': {
    border: 'none'
  },
  '& .MuiSlider-rail': {
    opacity: 0.3,
    backgroundColor: '#9696a814'
  },
  '& .MuiSlider-thumb': {
    height: 18,
    width: 18,
    backgroundColor: '#4a9eff',
    border: '2px solid #1e1e28'
  },
  '& .MuiSlider-valueLabel': {
    backgroundColor: '#4a9eff',
    borderRadius: '4px',
    fontSize: '0.75rem'
  }
}));

function QuotaSetting({ activeTab }) {
  const dispatch = useDispatch();
  const { quotaData, loading } = useSelector(state => state.quota);

  const [quotas, setQuotas] = useState({
    CSR: {
      morning12hr: 500,
      morning9hr: 350,
      night12hr: 500,
      night9hr: 350,
      basis: "Completed Convo",
      min: 250,
      max: 1000,
      default: 500
    },
    Deposit: {
      morning12hr: 530,
      morning9hr: 400,
      night12hr: 530,
      night9hr: 400,
      basis: "Total Deposits",
      min: 250,
      max: 1000,
      default: 530
    },
    Withdraw: {
      morning12hr: 1400,
      morning9hr: 900,
      night12hr: 1500,
      night9hr: 1000,
      basis: "Total Transaction Process",
      min: 700,
      max: 2000,
      default: 1000
    }
  });

  const [activeDept, setActiveDept] = useState("CSR");
  const [showSliderValue, setShowSliderValue] = useState(true);

  // Fetch quotas on component mount
  useEffect(() => {
    fetchQuotas();
  }, []);

  // Update local state when Redux data changes
  useEffect(() => {
    if (quotaData && quotaData.length > 0) {
      const newQuotas = { ...quotas };
      quotaData.forEach(item => {
        if (newQuotas[item.department]) {
          newQuotas[item.department] = {
            ...newQuotas[item.department],
            morning12hr: item.shiftQuota.morning12hr,
            morning9hr: item.shiftQuota.morning9hr,
            night12hr: item.shiftQuota.night12hr,
            night9hr: item.shiftQuota.night9hr,
            basis: getBasis(item.department)
          };
        }
      });
      setQuotas(newQuotas);
    }
  }, [quotaData]);

  const fetchQuotas = async () => {
    try {
      await dispatch(getAllQuotas()).unwrap();
    } catch (error) {
      toast.error("Failed to fetch quotas");
    }
  };

  // Get basis for each department
  const getBasis = (department) => {
    switch (department) {
      case "CSR":
        return "Completed Convo";
      case "Deposit":
        return "Total Deposits";
      case "Withdraw":
        return "Total Transaction Process";
      default:
        return "";
    }
  };

  // Handle slider change
  const handleSliderChange = (dept, shift) => (event, newValue) => {
    setQuotas(prev => ({
      ...prev,
      [dept]: {
        ...prev[dept],
        [shift]: newValue
      }
    }));
  };

  // Handle input change
  const handleInputChange = (dept, shift) => (event) => {
    const value = parseInt(event.target.value) || quotas[dept].min;
    const clampedValue = Math.min(Math.max(value, quotas[dept].min), quotas[dept].max);
    
    setQuotas(prev => ({
      ...prev,
      [dept]: {
        ...prev[dept],
        [shift]: clampedValue
      }
    }));
  };

  // Save quota to backend
  const handleSaveQuota = async (dept) => {
    try {
      const quotaData = {
        department: dept,
        morning12hr: quotas[dept].morning12hr,
        morning9hr: quotas[dept].morning9hr,
        night12hr: quotas[dept].night12hr,
        night9hr: quotas[dept].night9hr
      };

      await dispatch(createQuota(quotaData)).unwrap();
      toast.success(`${dept} department quotas saved successfully!`);
      
      // Refresh quotas
      await fetchQuotas();
    } catch (error) {
      toast.error("Failed to save quota");
    }
  };

  // Reset all quotas
  const handleResetAll = async () => {
    try {
      await dispatch(resetAllQuotas()).unwrap();
      toast.success("All quotas reset to default values!");
      
      // Refresh quotas
      await fetchQuotas();
    } catch (error) {
      toast.error("Failed to reset quotas");
    }
  };

  // Reset single shift to default
  const resetShift = (dept, shift) => {
    let defaultValue;
    if (shift.includes('9hr')) {
      defaultValue = Math.floor(quotas[dept].default * 0.7);
    } else {
      defaultValue = quotas[dept].default;
    }
    
    setQuotas(prev => ({
      ...prev,
      [dept]: {
        ...prev[dept],
        [shift]: defaultValue
      }
    }));
  };

  // Department data
  const departments = [
    { 
      id: "CSR", 
      name: "CSR Department", 
      description: "Customer Service Representative",
      icon: <UsersIcon sx={{ color: '#4a9eff' }} />
    },
    { 
      id: "Deposit", 
      name: "Deposit Department", 
      description: "Deposit Operations",
      icon: <DollarSignIcon sx={{ color: '#4a9eff' }} />
    },
    { 
      id: "Withdraw", 
      name: "Withdraw Department", 
      description: "Withdrawal Operations",
      icon: <CreditCardIcon sx={{ color: '#4a9eff' }} />
    }
  ];

  const shifts = [
    { id: "morning12hr", label: "Morning 12hr Shift" },
    { id: "morning9hr", label: "Morning 9hr Shift" },
    { id: "night12hr", label: "Night 12hr Shift" },
    { id: "night9hr", label: "Night 9hr Shift" }
  ];

  if (activeTab !== "change-quota") return null;

  return (
    <Container maxWidth="" sx={{ py: 4, minHeight: '100vh' }}>
      {/* Header */}
      <SimpleCard sx={{ mb: 4 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <PieChartIcon sx={{ fontSize: 32, color: '#4a9eff' }} />
            <Box>
              <Typography variant="h5" component="h1" gutterBottom sx={{ 
                fontWeight: 'bold', 
                color: '#ffffff'
              }}>
                Quota Settings
              </Typography>
              <Typography variant="body1" sx={{ color: '#a0a0a0' }}>
                Configure quota targets based on different shift timings
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </SimpleCard>

      {/* Department Selection Tabs */}
      <SimpleCard sx={{ mb: 4, p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
          <Tabs
            value={activeDept}
            onChange={(e, newValue) => setActiveDept(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ flex: 1 }}
          >
            {departments.map((dept) => (
              <SimpleTab
                key={dept.id}
                value={dept.id}
                icon={dept.icon}
                label={dept.name.split(" ")[0]}
                iconPosition="start"
              />
            ))}
          </Tabs>
          
          <FormControlLabel
            control={
              <Switch
                checked={showSliderValue}
                onChange={(e) => setShowSliderValue(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="body2" sx={{ color: '#a0a0a0' }}>
                Show Values
              </Typography>
            }
          />
        </Stack>
      </SimpleCard>

      {/* Department Quota Configuration */}
      <Box sx={{ mb: 6 }}>
        {departments.map((dept) => (
          <Box key={dept.id} sx={{ display: activeDept === dept.id ? 'block' : 'none' }}>
            <SimpleCard sx={{ p: 3 }}>
              {/* Department Header */}
              <Stack 
                direction={{ xs: 'column', md: 'row' }} 
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', md: 'center' }}
                spacing={2}
                mb={4}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ 
                    backgroundColor: '#9696a814', 
                    border: '1px solid #373747',
                    borderRadius: '6px',
                    px: 2,
                    py: 1
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                      {dept.name}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#a0a0a0' }}>
                    {dept.description}
                  </Typography>
                </Stack>
                
                <Box sx={{ 
                  backgroundColor: '#2a2a36', 
                  border: '1px solid #373747',
                  borderRadius: '6px',
                  px: 2,
                  py: 1
                }}>
                  <Typography variant="body2" sx={{ color: '#a0a0a0' }}>
                    Basis: <span style={{ color: '#ffb74d', fontWeight: 'bold' }}>{quotas[dept.id].basis}</span>
                  </Typography>
                </Box>
              </Stack>

              {/* Shift Cards Grid */}
              <Grid container spacing={2}>
                {shifts.map((shift) => (
                  <Grid item xs={12} sm={6} key={shift.id}>
                    <SimpleShiftCard>
                      {/* Shift Header */}
                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: 'bold', 
                        color: '#ffffff',
                        mb: 2
                      }}>
                        {shift.label}
                      </Typography>
                      
                      {/* Current Target */}
                      <Box sx={{ 
                        mb: 2, 
                        p: 1.5, 
                        backgroundColor: '#1e1e28',
                        borderRadius: '4px',
                        border: '1px solid #373747'
                      }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ color: '#a0a0a0' }}>
                            Current Target:
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 'bold', 
                            color: '#4a9eff'
                          }}>
                            {quotas[dept.id][shift.id]}
                          </Typography>
                        </Stack>
                      </Box>
                      
                      {/* Slider */}
                      <SimpleSlider
                        value={quotas[dept.id][shift.id]}
                        onChange={handleSliderChange(dept.id, shift.id)}
                        valueLabelDisplay={showSliderValue ? "on" : "off"}
                        aria-labelledby={`${shift.id}-slider`}
                        min={quotas[dept.id].min}
                        max={quotas[dept.id].max}
                        step={10}
                        marks={[
                          { value: quotas[dept.id].min, label: `${quotas[dept.id].min}` },
                          { value: quotas[dept.id].max, label: `${quotas[dept.id].max}` }
                        ]}
                      />
                      
                      {/* Controls */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                        <Typography variant="caption" sx={{ color: '#808080' }}>
                          Min: {quotas[dept.id].min}
                        </Typography>
                        
                        <TextField
                          type="number"
                          size="small"
                          value={quotas[dept.id][shift.id]}
                          onChange={handleInputChange(dept.id, shift.id)}
                          inputProps={{ 
                            min: quotas[dept.id].min, 
                            max: quotas[dept.id].max,
                            style: { 
                              color: '#ffffff',
                              textAlign: 'center',
                              backgroundColor: '#1e1e28'
                            }
                          }}
                          sx={{ 
                            width: 80,
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#1e1e28',
                              '& fieldset': {
                                borderColor: '#373747',
                              },
                              '&:hover fieldset': {
                                borderColor: '#4a4a5a',
                              }
                            }
                          }}
                        />
                        
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => resetShift(dept.id, shift.id)}
                          sx={{ 
                            color: '#4a9eff',
                            borderColor: '#4a4a5a',
                            fontSize: '0.75rem',
                            '&:hover': {
                              borderColor: '#4a9eff',
                              backgroundColor: 'rgba(74, 158, 255, 0.1)'
                            }
                          }}
                        >
                          Reset to Default
                        </Button>
                        
                        <Typography variant="caption" sx={{ color: '#808080' }}>
                          Max: {quotas[dept.id].max}
                        </Typography>
                      </Stack>
                    </SimpleShiftCard>
                  </Grid>
                ))}
              </Grid>

              {/* Save Changes Button */}
              <Divider sx={{ my: 3, borderColor: '#373747' }} />
              <Stack direction="row" justifyContent="flex-end">
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={18} sx={{ color: '#ffffff' }} /> : <SaveIcon />}
                  onClick={() => handleSaveQuota(dept.id)}
                  disabled={loading}
                  sx={{ 
                    backgroundColor: '#4a9eff',
                    '&:hover': {
                      backgroundColor: '#3a8eff'
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#2a2a36',
                      color: '#808080'
                    }
                  }}
                >
                  {loading ? 'Saving...' : `Save Changes for ${dept.name}`}
                </Button>
              </Stack>
            </SimpleCard>
          </Box>
        ))}
      </Box>

      {/* Reset All Card */}
      <SimpleCard sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <WarningIcon sx={{ color: '#ffb74d' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                Reset All Departments
              </Typography>
              <Typography variant="body2" sx={{ color: '#a0a0a0' }}>
                Reset all quotas to their default values
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={18} sx={{ color: '#ffb74d' }} /> : <RefreshIcon />}
            onClick={handleResetAll}
            disabled={loading}
            sx={{ 
              color: '#ffb74d',
              borderColor: '#ffb74d',
              '&:hover': {
                borderColor: '#ffb74d',
                backgroundColor: 'rgba(255, 183, 77, 0.1)'
              },
              '&.Mui-disabled': {
                borderColor: '#373747',
                color: '#808080'
              }
            }}
          >
            {loading ? 'Resetting...' : 'RESET ALL QUOTAS'}
          </Button>
        </Stack>
      </SimpleCard>
    </Container>
  );
}

export default QuotaSetting;