// import React, { useEffect, useState } from 'react';
// import { MessageCircle, RefreshCw, Download, Search, AlertCircle, Database } from 'lucide-react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchSheetDataByDepartment } from '../../../redux/sheetSlice'; // ✅ Updated import
// import * as XLSX from 'xlsx';

// const Performance = () => {
//     const dispatch = useDispatch();

//     // ✅ Use departmentSheet slice instead of sheet
//     const { 
//         data: sheetData, 
//         loading: sheetLoading, 
//         error: sheetError,
//         department: sheetDepartment,
//         count: totalCount 
//     } = useSelector((state) => state.sheet);

//     const { data: userData } = useSelector((state) => state.auth);

//     const [performanceData, setPerformanceData] = useState([]);
//     const [filteredData, setFilteredData] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [startDate, setStartDate] = useState('');
//     const [endDate, setEndDate] = useState('');

//     // ✅ Fetch data on mount
//     useEffect(() => {
//         console.log('🚀 Component mounted, fetching department sheet data...');
//         dispatch(fetchSheetDataByDepartment());
//     }, [dispatch]);

//     // ✅ Process sheet data when it changes
//     useEffect(() => {
//         if (sheetData && sheetData.length > 0) {
//             console.log('📊 Sheet Data Received:', {
//                 department: sheetDepartment,
//                 rowCount: sheetData.length,
//                 firstRow: sheetData[0]
//             });

//             // Skip header row if it exists
//             const dataRows = sheetData[0]?.includes('Member') ? sheetData.slice(1) : sheetData;

//             const formattedData = dataRows.map((row, index) => {
//                 const memberName = row[0] || 'Unknown';
//                 const role = memberName.toLowerCase().includes('csr') ? 'CSR' : 
//                              memberName.toLowerCase().includes('trainee') ? 'Trainee' : 'Staff';

//                 return {
//                     id: `${sheetDepartment}-${index}`,
//                     name: memberName,
//                     role: role,
//                     date: row[1] || new Date().toLocaleDateString(),
//                     completed: Number(row[2] || 0),
//                     totalEffective: Number(row[3] || 0),
//                     messages: Number(row[4] || 0),
//                     missedChats: Number(row[5] || 0),
//                     avgOnlineTime: row[6] || '0:00:00',
//                     frt: row[7] || '0:00:00',
//                     positivePercentage: parseFloat(row[8]) || 0,
//                     negatives: parseFloat(row[9]) || 0
//                 };
//             });

//             console.log(`✅ Formatted ${formattedData.length} records for ${sheetDepartment} department`);
//             setPerformanceData(formattedData);
//             setFilteredData(formattedData);
//         } else {
//             console.log('⚠️ No sheet data available');
//             setPerformanceData([]);
//             setFilteredData([]);
//         }
//     }, [sheetData, sheetDepartment]);

//     // ✅ Filter data based on search and date range
//     useEffect(() => {
//         let filtered = [...performanceData];

//         if (searchTerm) {
//             filtered = filtered.filter(item =>
//                 item.name.toLowerCase().includes(searchTerm.toLowerCase())
//             );
//         }

//         if (startDate || endDate) {
//             filtered = filtered.filter(item => {
//                 const itemDate = new Date(item.date);
//                 const start = startDate ? new Date(startDate) : null;
//                 const end = endDate ? new Date(endDate) : null;

//                 if (start && end) {
//                     return itemDate >= start && itemDate <= end;
//                 } else if (start) {
//                     return itemDate >= start;
//                 } else if (end) {
//                     return itemDate <= end;
//                 }
//                 return true;
//             });
//         }

//         setFilteredData(filtered);
//     }, [searchTerm, startDate, endDate, performanceData]);

//     const handleRefresh = () => {
//         console.log('🔄 Refreshing department sheet data...');
//         dispatch(fetchSheetDataByDepartment());
//     };

//     const handleExport = () => {
//         if (filteredData.length === 0) {
//             alert('No data to export');
//             return;
//         }

//         const ws = XLSX.utils.json_to_sheet(filteredData.map(item => ({
//             'Member': item.name,
//             'Role': item.role,
//             'Date': item.date,
//             'Completed Convo': item.completed,
//             'Total Effective': item.totalEffective,
//             'Total Message': item.messages,
//             'Missed Chats': item.missedChats,
//             'Ave. Online Time': item.avgOnlineTime,
//             '1st Response': item.frt,
//             'Positive rates': item.positivePercentage,
//             'Negatives': item.negatives
//         })));

//         const wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, 'Performance');

//         const department = sheetDepartment || userData?.department || 'Unknown';
//         XLSX.writeFile(wb, `${department}_Performance_${new Date().toISOString().split('T')[0]}.xlsx`);

//         console.log(`📥 Exported ${filteredData.length} records for ${department}`);
//     };

//     const handleClearFilters = () => {
//         setSearchTerm('');
//         setStartDate('');
//         setEndDate('');
//     };

//     const getStatusColor = (value, thresholds) => {
//         if (value >= thresholds.good) return 'text-green-400';
//         if (value >= thresholds.average) return 'text-yellow-400';
//         return 'text-red-400';
//     };

//     return (
//         <div className='p-2'>
//             {/* Department Info Banner */}
//             <div className="mb-4 flex items-center justify-between gap-4">
//                 {sheetDepartment && (
//                     <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg">
//                         <Database className="w-4 h-4 text-blue-400" />
//                         <span className="text-blue-400 font-medium">
//                             📊 {sheetDepartment} Department
//                         </span>
//                         <span className="text-blue-300 text-sm">
//                             ({totalCount} rows loaded)
//                         </span>
//                     </div>
//                 )}

//                 {userData?.FullName && (
//                     <div className="text-sm text-gray-400">
//                         Logged in as: <span className="text-white font-medium">{userData.FullName}</span>
//                     </div>
//                 )}
//             </div>

//             {/* Filters and Actions */}
//             <div className="flex justify-between items-center gap-3 mb-4">
//                 <div className="flex items-center gap-3 flex-1">
//                     <div className="relative flex-1 max-w-md">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                         <input
//                             type="text"
//                             placeholder="Search Employee..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
//                         />
//                     </div>

//                     <div className="flex items-center gap-2">
//                         <input
//                             type="date"
//                             value={startDate}
//                             onChange={(e) => setStartDate(e.target.value)}
//                             className="px-3 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
//                         />
//                         <span className="text-gray-400">to</span>
//                         <input
//                             type="date"
//                             value={endDate}
//                             onChange={(e) => setEndDate(e.target.value)}
//                             className="px-3 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
//                         />
//                     </div>

//                     {(searchTerm || startDate || endDate) && (
//                         <button
//                             onClick={handleClearFilters}
//                             className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
//                         >
//                             Clear
//                         </button>
//                     )}
//                 </div>

//                 <div className="flex items-center gap-3">
//                     <button
//                         onClick={handleExport}
//                         disabled={filteredData.length === 0}
//                         className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
//                     >
//                         <Download className="w-4 h-4" />
//                         Export
//                     </button>
//                     <button
//                         onClick={handleRefresh}
//                         disabled={sheetLoading}
//                         className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
//                     >
//                         <RefreshCw className={`w-4 h-4 ${sheetLoading ? 'animate-spin' : ''}`} />
//                         Refresh
//                     </button>
//                 </div>
//             </div>

//             {/* Error Message */}
//             {sheetError && (
//                 <div className="mb-4 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg flex items-start gap-2">
//                     <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
//                     <div>
//                         <strong className="font-semibold">Error loading data:</strong>
//                         <p className="mt-1">{sheetError}</p>
//                         <p className="text-sm mt-1 text-red-300">
//                             Please check your department access or try refreshing the page.
//                         </p>
//                     </div>
//                 </div>
//             )}

//             {/* Main Table */}
//             <div className="w-full bg-[rgba(59,130,246,0.03)] rounded-xl border border-gray-700 shadow-xl overflow-hidden">
//                 <div className="bg-[rgba(59,130,246,0.03)] px-6 py-4 border-b border-gray-700">
//                     <div className="flex justify-between items-center">
//                         <h2 className="text-xl font-semibold text-white">
//                             Performance Metrics
//                             {sheetDepartment && (
//                                 <span className="ml-2 text-blue-400 text-base font-normal">
//                                     - {sheetDepartment} Department
//                                 </span>
//                             )}
//                         </h2>
//                         <div className="text-sm text-gray-400">
//                             {filteredData.length > 0 
//                                 ? `Showing ${filteredData.length} of ${performanceData.length} records` 
//                                 : 'No Data'}
//                         </div>
//                     </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead className="bg-[rgba(59,130,246,0.03)] border-b border-gray-700">
//                             <tr>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Member</th>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Date</th>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Completed</th>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Effective</th>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Messages</th>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Missed</th>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Online Time</th>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">FRT</th>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Positive %</th>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Negatives</th>
//                             </tr>
//                         </thead>

//                         <tbody className="bg-[rgba(59,130,246,0.03)]">
//                             {sheetLoading ? (
//                                 <tr>
//                                     <td colSpan="10" className="px-6 py-8 text-center text-gray-400">
//                                         <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
//                                         <p>Loading {sheetDepartment || 'department'} data...</p>
//                                         <p className="text-xs mt-1">Fetching from Google Sheets...</p>
//                                     </td>
//                                 </tr>
//                             ) : filteredData.length === 0 ? (
//                                 <tr>
//                                     <td colSpan="10" className="px-6 py-8 text-center text-gray-400">
//                                         <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
//                                         {searchTerm || startDate || endDate 
//                                             ? '🔍 No records found matching your filters.' 
//                                             : `📭 No data available for ${sheetDepartment || 'your'} department.`}
//                                         {!searchTerm && !startDate && !endDate && (
//                                             <p className="text-xs mt-2">Click the Refresh button to load data from Google Sheets.</p>
//                                         )}
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 filteredData.map((row) => (
//                                     <tr key={row.id} className="border-b border-gray-700 hover:bg-[rgba(59,130,246,0.05)] transition-colors">
//                                         <td className="px-6 py-4 whitespace-nowrap">
//                                             <div className="flex items-center">
//                                                 <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
//                                                     {row.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
//                                                 </div>
//                                                 <div className="ml-4">
//                                                     <div className="text-sm font-medium text-white">{row.name}</div>
//                                                     <div className={`text-xs ${row.role === 'CSR' ? 'text-blue-400' : 'text-purple-400'}`}>
//                                                         {row.role}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 text-sm text-white">{row.date}</td>
//                                         <td className="px-6 py-4">
//                                             <div className={`text-lg font-bold ${getStatusColor(row.completed, { good: 50, average: 30 })}`}>
//                                                 {row.completed}
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 text-sm text-white">{row.totalEffective}</td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center gap-2">
//                                                 <MessageCircle className="w-4 h-4 text-blue-400" />
//                                                 <span className="text-sm text-white">{row.messages}</span>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className={`text-sm font-semibold ${row.missedChats <= 2 ? 'text-green-400' : 'text-red-400'}`}>
//                                                 {row.missedChats}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4 text-sm text-white">{row.avgOnlineTime}</td>
//                                         <td className="px-6 py-4">
//                                             <div className={`text-sm font-bold ${getStatusColor(50 - parseFloat(row.frt.split(':')[2] || 0), { good: 10, average: 0 })}`}>
//                                                 {row.frt}
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center gap-2">
//                                                 <span className={`text-lg font-bold ${getStatusColor(row.positivePercentage, { good: 15, average: 10 })}`}>
//                                                     {row.positivePercentage.toFixed(2)}%
//                                                 </span>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className={`text-lg font-bold ${row.negatives <= 10 ? 'text-green-400' : row.negatives <= 25 ? 'text-yellow-400' : 'text-red-400'}`}>
//                                                 {row.negatives.toFixed(2)}%
//                                             </span>
//                                         </td>
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* Footer */}
//                 <div className="bg-[#f5f6fa13] px-6 py-3 border-t border-gray-700">
//                     <div className="flex justify-between items-center text-sm text-gray-400">
//                         <div>
//                             Showing {filteredData.length} of {performanceData.length} records
//                             {sheetDepartment && (
//                                 <span className="ml-2 text-blue-400">from {sheetDepartment} department</span>
//                             )}
//                         </div>
//                         <div className="flex gap-4">
//                             <div className="flex items-center gap-1">
//                                 <div className="w-2 h-2 bg-green-400 rounded-full"></div>
//                                 <span>Good</span>
//                             </div>
//                             <div className="flex items-center gap-1">
//                                 <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
//                                 <span>Average</span>
//                             </div>
//                             <div className="flex items-center gap-1">
//                                 <div className="w-2 h-2 bg-red-400 rounded-full"></div>
//                                 <span>Needs Improvement</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Performance;




// components/Performance.js
import { useEffect, useState } from 'react';
import { MessageCircle, RefreshCw, Download, Search, AlertCircle, Database, Users, Grid } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSheetDataByDepartment, fetchAllDepartmentsData } from '../../../redux/sheetSlice';
import * as XLSX from 'xlsx';

const Performance = () => {
    const dispatch = useDispatch();

    // Redux state
    const {
        data: sheetData,
        loading: sheetLoading,
        error: sheetError,
        department: sheetDepartment,
        count: totalCount,

        // All departments data
        allData,
        allDepartmentsData,
        allDepartmentsLoading,
        allDepartmentsError,
        totalRecords
    } = useSelector((state) => state.sheet);

    const { data: userData } = useSelector((state) => state.auth);

    // Local state
    const [performanceData, setPerformanceData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [viewMode, setViewMode] = useState('department'); // 'department' or 'all'

    // Fetch data based on view mode
    useEffect(() => {
        if (viewMode === 'department') {
            console.log('🚀 Fetching department data...');
            dispatch(fetchSheetDataByDepartment());
        } else {
            console.log('🚀 Fetching ALL departments data...');
            dispatch(fetchAllDepartmentsData());
        }
    }, [dispatch, viewMode]);

    // Process data when it changes
    useEffect(() => {
        let dataToProcess = [];

        if (viewMode === 'department') {
            dataToProcess = sheetData || [];
        } else {
            dataToProcess = allData || [];
        }

        if (dataToProcess.length > 0) {
            console.log(`📊 Processing ${dataToProcess.length} records in ${viewMode} view`);

            const formattedData = dataToProcess.map((row, index) => {
                // If row is already formatted (from allData), use it directly
                if (row.id && row.department) {
                    return row;
                }

                // If row is raw data from sheet, format it
                const memberName = row[0] || `Employee-${index + 1}`;
                const role = determineRole(memberName);

                return {
                    id: `${viewMode === 'department' ? sheetDepartment : 'all'}-${index}-${Date.now()}`,
                    department: viewMode === 'department' ? sheetDepartment : 'Multiple',
                    name: memberName,
                    role: role,
                    date: formatDate(row[1]),
                    completed: safeNumber(row[2]),
                    totalEffective: safeNumber(row[3]),
                    messages: safeNumber(row[4]),
                    missedChats: safeNumber(row[5]),
                    avgOnlineTime: formatTime(row[6]),
                    frt: formatTime(row[7]),
                    positivePercentage: safePercentage(row[8]),
                    negatives: safePercentage(row[9])
                };
            });

            console.log(`✅ Formatted ${formattedData.length} records`);
            setPerformanceData(formattedData);
            setFilteredData(formattedData);
        } else {
            console.log('⚠️ No data available');
            setPerformanceData([]);
            setFilteredData([]);
        }
    }, [sheetData, allData, viewMode, sheetDepartment]);

    // Helper functions (same as before)
    const determineRole = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('csr')) return 'CSR';
        if (lowerName.includes('trainee')) return 'Trainee';
        if (lowerName.includes('manager')) return 'Manager';
        if (lowerName.includes('supervisor')) return 'Supervisor';
        return 'Staff';
    };

    const safeNumber = (value) => {
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    };

    const safePercentage = (value) => {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : Math.min(100, Math.max(0, num));
    };

    const formatDate = (dateString) => {
        if (!dateString) return new Date().toLocaleDateString();
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '0:00:00';
        return timeString;
    };

    // Filter data based on search and date range
    useEffect(() => {
        let filtered = [...performanceData];

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.role.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (startDate || endDate) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.date);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;

                if (start && end) {
                    return itemDate >= start && itemDate <= end;
                } else if (start) {
                    return itemDate >= start;
                } else if (end) {
                    return itemDate <= end;
                }
                return true;
            });
        }

        setFilteredData(filtered);
    }, [searchTerm, startDate, endDate, performanceData]);

    // Handlers
    const handleRefresh = () => {
        console.log(`🔄 Refreshing ${viewMode} data...`);
        if (viewMode === 'department') {
            dispatch(fetchSheetDataByDepartment());
        } else {
            dispatch(fetchAllDepartmentsData());
        }
    };

    const handleExport = () => {
        if (filteredData.length === 0) {
            alert('No data to export');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(filteredData.map(item => ({
            'Department': item.department,
            'Member': item.name,
            'Role': item.role,
            'Date': item.date,
            'Completed Convo': item.completed,
            'Total Effective': item.totalEffective,
            'Total Message': item.messages,
            'Missed Chats': item.missedChats,
            'Ave. Online Time': item.avgOnlineTime,
            '1st Response': item.frt,
            'Positive rates': item.positivePercentage,
            'Negatives': item.negatives
        })));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Performance');

        const fileName = viewMode === 'department'
            ? `${sheetDepartment}_Performance_${new Date().toISOString().split('T')[0]}.xlsx`
            : `All_Departments_Performance_${new Date().toISOString().split('T')[0]}.xlsx`;

        XLSX.writeFile(wb, fileName);
        console.log(`📥 Exported ${filteredData.length} records`);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
    };

    const getStatusColor = (value, thresholds) => {
        if (value >= thresholds.good) return 'text-green-400';
        if (value >= thresholds.average) return 'text-yellow-400';
        return 'text-red-400';
    };

    const isLoading = viewMode === 'department' ? sheetLoading : allDepartmentsLoading;
    const error = viewMode === 'department' ? sheetError : allDepartmentsError;

    return (
        <div className='p-2'>
            {/* Header Section */}
            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {/* View Mode Toggle */}
                    <div className="flex bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('department')}
                            className={`px-4 py-2 rounded-md transition-all ${viewMode === 'department'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Users className="w-4 h-4 inline mr-2" />
                            My Department
                        </button>
                        <button
                            onClick={() => setViewMode('all')}
                            className={`px-4 py-2 rounded-md transition-all ${viewMode === 'all'
                                    ? 'bg-purple-500 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Grid className="w-4 h-4 inline mr-2" />
                            All Departments
                        </button>
                    </div>

                    {/* Department Info */}
                    {viewMode === 'department' && sheetDepartment && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                            <Database className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400 font-medium">
                                📊 {sheetDepartment} Department
                            </span>
                            <span className="text-blue-300 text-sm">
                                ({totalCount} records)
                            </span>
                        </div>
                    )}

                    {viewMode === 'all' && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg">
                            <Grid className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-400 font-medium">
                                🌟 All Departments
                            </span>
                            <span className="text-purple-300 text-sm">
                                ({totalRecords} total records)
                            </span>
                        </div>
                    )}
                </div>

                {/* User Info */}
                {userData?.FullName && (
                    <div className="text-sm text-gray-400">
                        <Users className="w-4 h-4 inline mr-1" />
                        Logged in as: <span className="text-white font-medium">{userData.FullName}</span>
                        {userData.department && (
                            <span className="ml-2 text-purple-400">({userData.department})</span>
                        )}
                    </div>
                )}
            </div>

            {/* Rest of your component remains the same */}
            {/* Filters and Actions */}
            <div className="flex justify-between items-center gap-3 mb-4">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={viewMode === 'department' ? "Search Employee..." : "Search Employee, Department..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    {(searchTerm || startDate || endDate) && (
                        <button
                            onClick={handleClearFilters}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
                        >
                            Clear
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        disabled={filteredData.length === 0}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <strong className="font-semibold">Error loading data:</strong>
                        <p className="mt-1">{error}</p>
                        <p className="text-sm mt-1 text-red-300">
                            Please try refreshing the page.
                        </p>
                    </div>
                </div>
            )}

            {/* Main Table */}
            <div className="w-full bg-[rgba(59,130,246,0.03)] rounded-xl border border-gray-700 shadow-xl overflow-hidden">
                <div className="bg-[rgba(59,130,246,0.03)] px-6 py-4 border-b border-gray-700">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-white">
                            Performance Metrics
                            {viewMode === 'department' && sheetDepartment && (
                                <span className="ml-2 text-blue-400 text-base font-normal">
                                    - {sheetDepartment} Department
                                </span>
                            )}
                            {viewMode === 'all' && (
                                <span className="ml-2 text-purple-400 text-base font-normal">
                                    - All Departments
                                </span>
                            )}
                        </h2>
                        <div className="text-sm text-gray-400">
                            {filteredData.length > 0
                                ? `Showing ${filteredData.length} of ${performanceData.length} records`
                                : 'No Data'}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[rgba(59,130,246,0.03)] border-b border-gray-700">
                            <tr>
                                {viewMode === 'all' && (
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Department</th>
                                )}
                                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Member</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Date</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Completed</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Effective</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Messages</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Missed</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Online Time</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">FRT</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Positive %</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Negatives</th>
                            </tr>
                        </thead>

                        <tbody className="bg-[rgba(59,130,246,0.03)]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={viewMode === 'all' ? 11 : 10} className="px-6 py-8 text-center text-gray-400">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        <p>Loading {viewMode === 'department' ? sheetDepartment || 'department' : 'all departments'} data...</p>
                                        <p className="text-xs mt-1">Fetching from Google Sheets...</p>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={viewMode === 'all' ? 11 : 10} className="px-6 py-8 text-center text-gray-400">
                                        <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        {searchTerm || startDate || endDate
                                            ? '🔍 No records found matching your filters.'
                                            : `📭 No data available for ${viewMode === 'department' ? (sheetDepartment || 'your') + ' department' : 'all departments'}.`}
                                        {!searchTerm && !startDate && !endDate && (
                                            <p className="text-xs mt-2">Click the Refresh button to load data from Google Sheets.</p>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((row) => (
                                    <tr key={row.id} className="border-b border-gray-700 hover:bg-[rgba(59,130,246,0.05)] transition-colors">
                                        {viewMode === 'all' && (
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${row.department === 'CSR' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                                                        row.department === 'Deposit' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                                                            'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                                                    }`}>
                                                    {row.department}
                                                </span>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                    {row.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-white">{row.name}</div>
                                                    <div className={`text-xs ${row.role === 'CSR' ? 'text-blue-400' : 'text-purple-400'}`}>
                                                        {row.role}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white">{row.date}</td>
                                        <td className="px-6 py-4">
                                            <div className={`text-lg font-bold ${getStatusColor(row.completed, { good: 50, average: 30 })}`}>
                                                {row.completed}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white">{row.totalEffective}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <MessageCircle className="w-4 h-4 text-blue-400" />
                                                <span className="text-sm text-white">{row.messages}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-semibold ${row.missedChats <= 2 ? 'text-green-400' : 'text-red-400'}`}>
                                                {row.missedChats}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white">{row.avgOnlineTime}</td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm font-bold ${getStatusColor(50 - parseFloat(row.frt.split(':')[2] || 0), { good: 10, average: 0 })}`}>
                                                {row.frt}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-lg font-bold ${getStatusColor(row.positivePercentage, { good: 15, average: 10 })}`}>
                                                    {row.positivePercentage.toFixed(2)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-lg font-bold ${row.negatives <= 10 ? 'text-green-400' : row.negatives <= 25 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                {row.negatives.toFixed(2)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="bg-[#f5f6fa13] px-6 py-3 border-t border-gray-700">
                    <div className="flex justify-between items-center text-sm text-gray-400">
                        <div>
                            Showing {filteredData.length} of {performanceData.length} records
                            {viewMode === 'department' && sheetDepartment && (
                                <span className="ml-2 text-blue-400">from {sheetDepartment} department</span>
                            )}
                            {viewMode === 'all' && (
                                <span className="ml-2 text-purple-400">from all departments</span>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span>Good</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                <span>Average</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                <span>Needs Improvement</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Performance;