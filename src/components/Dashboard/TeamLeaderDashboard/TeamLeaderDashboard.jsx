import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCombinedDepartmentsData } from "../../../redux/combinedQuotaSlice";
import TeamLeaderDashboardUI from "../SuperAdminDashboardRoute/ui/TeamLeaderDashboardUI";
import { useTeamLeaderDashboard } from "../../hooks/useTeamLeaderDashboard";

export default function TeamLeaderDashboard() {
  const {
    dashboardData,
    teamLeaderStats,
    isInitialized,
    isRefreshing,
    combinedQuotaLoading,
    department,
    processRealData,
    setIsInitialized,
    setIsRefreshing,
    timeFilter,
    setTimeFilter,
    filteredStats,
    shiftChartData,
    quotaManagementData
  } = useTeamLeaderDashboard();

  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.combinedQuota);

  // Initialize data
  const initializeData = useCallback(async () => {
    if (!isInitialized && !combinedQuotaLoading && department) {
      setIsRefreshing(true);
      try {
        await dispatch(fetchCombinedDepartmentsData());
        setIsInitialized(true); 
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [dispatch, isInitialized, combinedQuotaLoading, department, setIsRefreshing, setIsInitialized]);

  // Process when data changes
  useEffect(() => {
    if (data && data.length > 0 && department) {
      processRealData(data, department, timeFilter);
    }
  }, [data, department, processRealData, timeFilter]);

  // Initialize on mount
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (isInitialized && department) {
        dispatch(fetchCombinedDepartmentsData());
      }
    }, 120000);
    return () => clearInterval(interval);
  }, [dispatch, isInitialized, department]);



  if (!department || (!data && isInitialized)) {
    return (
      <div className="min-h-screen text-gray-100 bg-black flex items-center justify-center">
        <div className="text-xl">
          {!department ? "Department information not available" : "No data available"}
        </div>
      </div>
    );
  }

  return (
    <TeamLeaderDashboardUI
      dashboardData={dashboardData}
      teamLeaderStats={filteredStats}
      isRefreshing={isRefreshing}
      department={department}
      timeFilter={timeFilter}
      setTimeFilter={setTimeFilter}
      shiftChartData={shiftChartData}
      quotaManagementData={quotaManagementData}
    />
  );
}