import React, { useEffect, useState } from 'react';
import { RefreshCw, Download, Search, AlertCircle, Database, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSheetDataByDepartment } from '../../../redux/sheetSlice';
import * as XLSX from 'xlsx';

const Performance = () => {
    const dispatch = useDispatch();
    const { headers, data, loading, error, department } = useSelector((state) => state.sheet);

    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedShift, setSelectedShift] = useState('all');
    const [tableHeaders, setTableHeaders] = useState([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        dispatch(fetchSheetDataByDepartment());
    }, [dispatch]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, startDate, endDate, selectedShift]);

    // Custom headers based on your requirements
    const customHeaders = [
        'NAME',
        'TG NAME',
        'TOTAL WORKING HOURS',
        'TIME START',
        'TIME END',
        'TOTAL TIME',
        'TASK',
        'TIME RANGE',
        'DEPOSIT',
        'CALLBACK/AGENT'
    ];

    // Function to calculate time difference
    const calculateTimeDifference = (startTime, endTime) => {
        if (!startTime || !endTime) return '0:00';

        try {
            const parseTime = (timeStr) => {
                // Handle different time formats
                let time = timeStr.toString().trim();

                // Remove any AM/PM and extra spaces
                time = time.replace(/[AP]M/gi, '').trim();

                // Handle 24-hour format
                if (time.includes(':')) {
                    const [hours, minutes] = time.split(':').map(part => parseInt(part) || 0);
                    return hours * 60 + minutes;
                }

                // Handle decimal format (like 6.5 hours)
                if (time.includes('.')) {
                    return Math.floor(parseFloat(time) * 60);
                }

                return parseInt(time) * 60 || 0;
            };

            const startMinutes = parseTime(startTime);
            const endMinutes = parseTime(endTime);

            let diffMinutes = endMinutes - startMinutes;

            // Handle overnight shifts (end time is next day)
            if (diffMinutes < 0) {
                diffMinutes += 24 * 60; // Add 24 hours
            }

            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;

            return `${hours}:${minutes.toString().padStart(2, '0')}`;
        } catch (error) {
            console.error('Error calculating time difference:', error);
            return '0:00';
        }
    };

    // Function to format date to MM/DD/YYYY
    const formatDate = (dateString) => {
        if (!dateString) return dateString;

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;

            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const year = date.getFullYear();

            return `${month}/${day}/${year}`;
        } catch (error) {
            return dateString;
        }
    };

    // Function to process data and group by shifts
    const processShiftData = () => {
        if (!data || data.length === 0) return { morning: [], night: [] };

        const morningShift = [];
        const nightShift = [];
        let currentShift = null;

        data.forEach((row) => {
            // Skip empty rows
            if (!row || row.length === 0 || (row.length === 1 && !row[0])) {
                return;
            }

            // Check if this row indicates a shift header
            if (typeof row[0] === 'string') {
                const firstCell = row[0].toLowerCase();

                if (firstCell.includes('morning shift')) {
                    currentShift = 'morning';
                    return;
                } else if (firstCell.includes('night shift')) {
                    currentShift = 'night';
                    return;
                }
            }

            // Skip header rows
            if (row.some(cell =>
                typeof cell === 'string' &&
                (cell.toUpperCase().includes('NAME') && cell.toUpperCase().includes('TG NAME'))
            )) {
                return;
            }

            // Add to appropriate shift based on currentShift
            if (currentShift === 'morning') {
                morningShift.push(row);
            } else if (currentShift === 'night') {
                nightShift.push(row);
            }
        });

        return { morning: morningShift, night: nightShift };
    };

    // Function to process and enhance rows with calculated time
    const processRowsWithTimeCalculation = (rows) => {
        return rows.map(row => {
            // Your data structure analysis:
            // Index 3: Start Time (e.g., '13:30')
            // Index 4: End Time (e.g., '19:30') 
            // Index 5: Total Time (e.g., '6:00:00')

            const startTime = row[3]; // Start Time
            const endTime = row[4];   // End Time

            // Calculate total time
            const calculatedTotalTime = calculateTimeDifference(startTime, endTime);

            // Create enhanced row with calculated time
            const enhancedRow = [...row];

            // Replace or add calculated total time at index 5
            if (enhancedRow.length > 5) {
                enhancedRow[5] = calculatedTotalTime;
            } else {
                // If row doesn't have enough columns, add the calculated time
                while (enhancedRow.length < 6) {
                    enhancedRow.push('');
                }
                enhancedRow[5] = calculatedTotalTime;
            }

            return enhancedRow;
        });
    };

    // Function to filter rows with names and process data
    const getFilteredRows = () => {
        const { morning, night } = processShiftData();
        let shiftData = [];

        if (selectedShift === 'morning') {
            shiftData = morning;
        } else if (selectedShift === 'night') {
            shiftData = night;
        } else {
            shiftData = [...morning, ...night];
        }

        // Filter rows that have NAME value and process time calculation
        const filtered = shiftData.filter((row) => {
            const nameIndex = 0;
            const nameCell = row[nameIndex];

            // Check if this row has a valid name
            if (!nameCell ||
                typeof nameCell !== 'string' ||
                nameCell.trim() === '' ||
                nameCell.toLowerCase().includes('total') ||
                nameCell.toLowerCase().includes('workload')) {
                return false;
            }

            // Additional search filter
            const matchesSearch = !searchTerm ||
                row.some((cell) =>
                    String(cell).toLowerCase().includes(searchTerm.toLowerCase())
                );

            return matchesSearch;
        });

        // Process rows with time calculation
        return processRowsWithTimeCalculation(filtered)
            .map(row =>
                row.map(cell => {
                    // Format date cells (check if it looks like a date)
                    if (typeof cell === 'string' &&
                        (cell.includes('-') || cell.includes('/')) &&
                        cell.match(/\d{4}/)) {
                        return formatDate(cell);
                    }
                    return cell;
                })
            );
    };

    // Function to extract total workload for each person
    const getTotalWorkloadData = () => {
        const { morning, night } = processShiftData();
        const allData = selectedShift === 'all' ? [...morning, ...night] :
            selectedShift === 'morning' ? morning : night;

        const workloadData = [];

        allData.forEach((row, index) => {
            const nameCell = row[0];

            // Check if this is a name row
            if (nameCell && typeof nameCell === 'string' &&
                nameCell.trim() !== '' &&
                !nameCell.toLowerCase().includes('total') &&
                !nameCell.toLowerCase().includes('workload')) {

                // Look for TOTAL WORKLOAD in subsequent rows
                for (let i = index + 1; i < Math.min(index + 10, allData.length); i++) {
                    const nextRow = allData[i];
                    if (nextRow && nextRow.length > 0) {
                        const firstCell = String(nextRow[0] || '').toLowerCase();
                        const lastCell = nextRow[nextRow.length - 1];

                        if (firstCell.includes('total workload') && lastCell) {
                            workloadData.push({
                                name: nameCell.trim(),
                                workload: lastCell,
                                shift: morning.includes(row) ? 'Morning' : 'Night'
                            });
                            break;
                        }
                    }
                }
            }
        });

        return workloadData;
    };

    const filteredRows = getFilteredRows();
    const workloadData = getTotalWorkloadData();

    // Pagination calculations
    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredRows.slice(indexOfFirstRow, indexOfLastRow);

    // Pagination handlers
    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    const handleRefresh = () => dispatch(fetchSheetDataByDepartment());

    const handleExport = () => {
        if (filteredRows.length === 0) return alert('No data to export');

        const dataToExport = [customHeaders, ...filteredRows];
        const ws = XLSX.utils.aoa_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, department || 'Sheet');
        XLSX.writeFile(wb, `${department || 'Data'}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    // Function to get cell color based on column header and value
    const getCellColor = (header, value) => {
        if (!header) return 'text-white';

        const headerLower = header.toLowerCase();

        // For deposit column
        if (headerLower.includes('deposit')) {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                if (numValue >= 500) return 'text-green-400';
                if (numValue >= 300) return 'text-yellow-400';
                return 'text-red-400';
            }
        }

        // For total time column
        if (headerLower.includes('total time')) {
            if (typeof value === 'string' && value.includes(':')) {
                const [hours] = value.split(':');
                const totalHours = parseInt(hours);
                if (!isNaN(totalHours)) {
                    if (totalHours >= 8) return 'text-green-400';
                    if (totalHours >= 6) return 'text-yellow-400';
                    return 'text-red-400';
                }
            }
        }

        return 'text-white';
    };

    console.log('Custom Headers:', customHeaders);
    console.log('Filtered Rows with Time Calculation:', filteredRows);

    return (
        <div className="p-4">
            {/* Filters & Actions */}
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <div className="flex items-center gap-3 flex-1">
                    {/* Shift Filter */}
                    <select
                        value={selectedShift}
                        onChange={(e) => setSelectedShift(e.target.value)}
                        className="px-3 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                        <option value="all">All Shifts</option>
                        <option value="morning">Morning Shift</option>
                        <option value="night">Night Shift</option>
                    </select>

                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    {/* Date Filters */}
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

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        disabled={filteredRows.length === 0}
                        className="bg-emerald-600/15 border border-emerald-500/30 rounded-lg pl-4 pr-10 py-3.5 text-emerald-400 font-medium text-sm backdrop-blur-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none flex gap-1 items-center"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="bg-purple-600/15 border border-purple-500/30 rounded-lg pl-4 pr-10 py-3.5 text-purple-400 font-medium text-sm backdrop-blur-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none flex gap-1 items-center"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Total Workload Summary */}
            {workloadData.length > 0 && (
                <div className="mb-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-3">Total Workload Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {workloadData.map((item, index) => (
                            <div key={index} className="bg-gray-700/30 rounded p-3 border border-gray-600">
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-medium">{item.name}</span>
                                    <span className={`px-2 py-1 rounded text-xs ${item.shift === 'Morning' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                                        }`}>
                                        {item.shift}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-green-400 mt-2">
                                    {item.workload}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <strong className="font-semibold">Error loading data:</strong>
                        <p className="mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="w-full bg-[rgba(59,130,246,0.03)] rounded-xl border border-gray-700 shadow-xl overflow-hidden">
                <div className="bg-[rgba(59,130,246,0.03)] px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">
                        {selectedShift === 'all' ? 'All Shifts' :
                            selectedShift === 'morning' ? 'Morning Shift' : 'Night Shift'}
                    </h2>
                    <span className="text-sm text-gray-400">
                        {filteredRows.length > 0
                            ? `Showing ${indexOfFirstRow + 1}-${Math.min(indexOfLastRow, filteredRows.length)} of ${filteredRows.length} records`
                            : 'No data'}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[rgba(59,130,246,0.05)] whitespace-nowrap border-b border-gray-700">
                            <tr>
                                {customHeaders.map((header, index) => (
                                    <th key={index} className="px-6 py-4 font-semibold uppercase text-white text-start">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={customHeaders.length} className="text-center py-8 text-gray-400">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading data...
                                    </td>
                                </tr>
                            ) : currentRows.length === 0 ? (
                                <tr>
                                    <td colSpan={customHeaders.length} className="text-center py-8 text-gray-400">
                                        <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        No records found.
                                    </td>
                                </tr>
                            ) : (
                                currentRows.map((row, i) => (
                                    <tr
                                        key={i}
                                        className="border-b border-gray-800 hover:bg-[rgba(59,130,246,0.05)] transition-colors"
                                    >
                                        {customHeaders.map((header, j) => (
                                            <td
                                                key={j}
                                                className={`px-6 py-4 whitespace-nowrap text-start ${getCellColor(header, row[j] || '')}`}
                                            >
                                                {row[j] || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {filteredRows.length > 0 && (
                    <div className="bg-[#f5f6fa13] px-6 py-4 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-gray-400 text-sm">
                                Showing {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filteredRows.length)} of {filteredRows.length} records
                            </span>

                            {/* Rows per page selector */}
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-sm">Rows per page:</span>
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Page navigation */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={goToFirstPage}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded border border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                                >
                                    <ChevronsLeft className="w-4 h-4 text-gray-300" />
                                </button>
                                <button
                                    onClick={goToPrevPage}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded border border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4 text-gray-300" />
                                </button>

                                <span className="px-3 py-1 text-sm text-gray-300">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded border border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                </button>
                                <button
                                    onClick={goToLastPage}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded border border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                                >
                                    <ChevronsRight className="w-4 h-4 text-gray-300" />
                                </button>
                            </div>

                            {/* Page number input */}
                            <div className="flex items-center gap-2 ml-4">
                                <span className="text-gray-400 text-sm">Go to:</span>
                                <input
                                    type="number"
                                    min="1"
                                    max={totalPages}
                                    value={currentPage}
                                    onChange={(e) => {
                                        const page = Number(e.target.value);
                                        if (page >= 1 && page <= totalPages) {
                                            setCurrentPage(page);
                                        }
                                    }}
                                    className="w-16 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-[#f5f6fa13] px-6 py-3 border-t border-gray-700 text-sm flex justify-between items-center flex-wrap gap-3">
                    <div className="flex flex-wrap gap-3 items-center">
                        <span className="text-gray-400 font-semibold">Color Legend:</span>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span className="text-green-400">Deposit ≥ 500 / Time ≥ 8h</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                            <span className="text-yellow-400">Deposit 300-499 / Time 6-7h</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded"></div>
                            <span className="text-red-400">Deposit &lt; 300 / Time &lt; 6h</span>
                        </div>
                    </div>

                    {department && <span className="text-blue-400">{department} Department</span>}
                </div>
            </div>
        </div>
    );
};

export default Performance;