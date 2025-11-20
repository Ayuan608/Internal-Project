import React, { useEffect, useState } from 'react';
import { RefreshCw, Download, Search, AlertCircle, Database, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSheetDataByDepartment } from '../../../redux/sheetSlice';
import * as XLSX from 'xlsx';

const Performance = () => {
    const dispatch = useDispatch();
    const { headers, loading, error, department, sections } = useSelector((state) => state.sheet);

    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        console.log("🚀 Dispatching fetchSheetDataByDepartment...");
        dispatch(fetchSheetDataByDepartment())
            .unwrap()
            .then((result) => {
                console.log("✅ API Response:", result);
                if (result.sections && result.sections[0] && result.sections[0].data) {
                    const rawData = result.sections[0].data;
                    console.log("📊 Raw data from API:", rawData);

                    // Process and filter valid data
                    const processedData = processAndFilterData(rawData);
                    setTableData(processedData);
                    console.log("✅ Processed valid data:", processedData);
                }
            })
            .catch((error) => {
                console.error("❌ fetchSheetDataByDepartment failed:", error);
            });
    }, [dispatch]);

    // Department-wise headers
    const getCustomHeaders = () => {
        const dept = department?.toLowerCase() || 'csr';

        if (dept.includes('deposit')) {
            return [
                'NAME',
                'livechecking',
                '1st checkback',
                '2nd /3rd checkback',
                'Paycheck',
                'Daily records',
                'offline',
                'Total',
            ];
        } else if (dept.includes('withdraw') || dept.includes('wd')) {
            return [
                'NAME',
                'Total Transaction passed',
                'Total amount passed',
                'Total Transaction Rejected',
                'Total amount Rejected',
                'Total Transaction process',
                'Total Amount process'
            ];
        } else {
            // Default CSR headers
            return [
                'NAME',
                'Completed convo',
                'Total Effective',
                'Total message',
                'missed chats',
                'Online Time',
                'Positive rates',
                'Negative rates',
                'Offline',
            ];
        }
    };

    const customHeaders = getCustomHeaders();

    // Function to check if a row has valid data
    const isValidDataRow = (row) => {
        if (!row || !Array.isArray(row) || row.length === 0) {
            return false;
        }

        // Check if first cell (NAME) is valid
        const nameCell = row[0];
        if (!nameCell ||
            typeof nameCell !== 'string' ||
            nameCell.trim() === '' ||
            nameCell.toLowerCase().includes('total') ||
            nameCell.toLowerCase().includes('shift') ||
            nameCell.toLowerCase().includes('member') ||
            nameCell.toLowerCase().includes('name') && row.length < 3) {
            return false;
        }

        // Check if row has at least some meaningful data
        const meaningfulCells = row.filter(cell => {
            if (!cell) return false;
            const strCell = String(cell).trim();
            return strCell !== '' &&
                !strCell.toLowerCase().includes('total') &&
                !strCell.toLowerCase().includes('shift');
        });

        return meaningfulCells.length >= 3; // At least 3 meaningful cells
    };

    // Function to process and filter data
    const processAndFilterData = (rawData) => {
        if (!rawData || !Array.isArray(rawData)) {
            return [];
        }

        console.log("🔄 Processing raw data, total rows:", rawData.length);

        // Find the header row index
        let dataStartIndex = 0;
        for (let i = 0; i < Math.min(10, rawData.length); i++) {
            const row = rawData[i];
            if (row && row.length > 0) {
                const firstCell = String(row[0] || '').toLowerCase();
                // Look for actual data rows (not headers)
                if (firstCell &&
                    !firstCell.includes('member') &&
                    !firstCell.includes('name') &&
                    !firstCell.includes('shift') &&
                    !firstCell.includes('total') &&
                    firstCell.trim() !== '') {
                    dataStartIndex = i;
                    break;
                }
            }
        }

        console.log("📍 Data starts from index:", dataStartIndex);

        // Extract data rows and filter valid ones
        const validData = [];
        for (let i = dataStartIndex; i < rawData.length; i++) {
            const row = rawData[i];
            if (isValidDataRow(row)) {
                validData.push(row);
            }
        }

        console.log("✅ Valid data rows found:", validData.length);
        return validData;
    };

    // Function to calculate time difference
    const calculateTimeDifference = (startTime, endTime) => {
        if (!startTime || !endTime) return '0:00';

        try {
            const parseTime = (timeStr) => {
                let time = String(timeStr).trim();
                time = time.replace(/[AP]M/gi, '').trim();

                if (time.includes(':')) {
                    const [hours, minutes] = time.split(':').map(part => parseInt(part) || 0);
                    return hours * 60 + minutes;
                }

                if (time.includes('.')) {
                    return Math.floor(parseFloat(time) * 60);
                }

                return parseInt(time) * 60 || 0;
            };

            const startMinutes = parseTime(startTime);
            const endMinutes = parseTime(endTime);

            let diffMinutes = endMinutes - startMinutes;
            if (diffMinutes < 0) diffMinutes += 24 * 60;

            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;

            return `${hours}:${minutes.toString().padStart(2, '0')}`;
        } catch (error) {
            return '0:00';
        }
    };

    // Function to process rows with time calculation
    const processRowsWithTimeCalculation = (rows) => {
        return rows.map(row => {
            // Ensure row has enough columns for the current headers
            const enhancedRow = [...row];
            while (enhancedRow.length < customHeaders.length) {
                enhancedRow.push('');
            }

            return enhancedRow;
        });
    };

    // Get filtered rows based on search
    const getFilteredRows = () => {
        let filtered = tableData;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(row =>
                row.some(cell =>
                    String(cell).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        // Process rows
        return processRowsWithTimeCalculation(filtered);
    };

    const filteredRows = getFilteredRows();

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

    const handleRefresh = () => {
        dispatch(fetchSheetDataByDepartment())
            .unwrap()
            .then((result) => {
                if (result.sections && result.sections[0] && result.sections[0].data) {
                    const processedData = processAndFilterData(result.sections[0].data);
                    setTableData(processedData);
                }
            });
    };

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

    // Function to get row status color based on employee status
    const getRowStatusColor = (row) => {
        if (!department?.toLowerCase().includes('csr')) return "";
        if (!row || row.length === 0) return '';

        // Check first few cells for status keywords
        const rowText = row.slice(0, 3).join(' ').toLowerCase();

        if (rowText.includes('suspended') || rowText.includes('suspend')) {
            return 'bg-yellow-900 bg-opacity-20';
        }
        if (rowText.includes('absent')) {
            return 'bg-red-900 bg-opacity-20 text-red-600';
        }

        return
    };

    // Calculate column totals
    const calculateColumnTotals = () => {
        const totals = new Array(customHeaders.length).fill(0);

        filteredRows.forEach(row => {
            row.forEach((cell, index) => {
                if (index === 0) return; // Skip NAME column

                const value = parseFloat(cell);
                if (!isNaN(value)) {
                    totals[index] += value;
                }
            });
        });

        return totals;
    };

    const columnTotals = calculateColumnTotals();

    // Function to get cell color based on column header and value - DEPARTMENT SPECIFIC
    const getCellColor = (header, value) => {
        if (!header || value === undefined || value === null || value === '') {
            return 'text-gray-300';
        }

        const headerLower = header.toLowerCase();
        const numValue = parseFloat(value);
        const dept = department?.toLowerCase() || 'csr';

        // For CSR Department
        if (dept.includes('csr') || !dept.includes('deposit') && !dept.includes('withdraw')) {
            // For Completed Conversations
            if (headerLower.includes('completed convo') || headerLower.includes('completed')) {
                if (!isNaN(numValue)) {
                    if (numValue >= 20) return 'text-green-400';
                    if (numValue >= 10) return 'text-yellow-400';
                    return 'text-red-400';
                }
            }

            // For Total Effective
            if (headerLower.includes('total effective') || headerLower.includes('effective')) {
                if (!isNaN(numValue)) {
                    if (numValue >= 15) return 'text-green-400';
                    if (numValue >= 8) return 'text-yellow-400';
                    return 'text-red-400';
                }
            }

            // For Positive Rates (Percentage)
            if (headerLower.includes('positive rates') || headerLower.includes('positive')) {
                if (!isNaN(numValue)) {
                    if (numValue >= 80) return 'text-green-400';
                    if (numValue >= 60) return 'text-yellow-400';
                    return 'text-red-400';
                }
            }

            // For Negative Rates (Percentage) - Lower is better
            if (headerLower.includes('negative rates') || headerLower.includes('negative')) {
                if (!isNaN(numValue)) {
                    if (numValue <= 5) return 'text-green-400';
                    if (numValue <= 15) return 'text-yellow-400';
                    return 'text-red-400';
                }
            }

            // For Missed Chats - Lower is better
            if (headerLower.includes('missed chats') || headerLower.includes('missed')) {
                if (!isNaN(numValue)) {
                    if (numValue <= 2) return 'text-green-400';
                    if (numValue <= 5) return 'text-yellow-400';
                    return 'text-red-400';
                }
            }

            // For Online Time (hours)
            if (headerLower.includes('online time') || headerLower.includes('online')) {
                if (!isNaN(numValue)) {
                    if (numValue >= 7) return 'text-green-400';
                    if (numValue >= 5) return 'text-yellow-400';
                    return 'text-red-400';
                }
                // Handle time format like "7:30"
                if (typeof value === 'string' && value.includes(':')) {
                    const [hours] = value.split(':');
                    const totalHours = parseInt(hours);
                    if (!isNaN(totalHours)) {
                        if (totalHours >= 7) return 'text-green-400';
                        if (totalHours >= 5) return 'text-yellow-400';
                        return 'text-red-400';
                    }
                }
            }
        }

        // For Deposit Department
        if (dept.includes('deposit')) {
            // For Deposit Amounts
            if (headerLower.includes('deposit') && !headerLower.includes('rejected')) {
                if (!isNaN(numValue)) {
                    if (numValue >= 10000) return 'text-green-400';
                    if (numValue >= 5000) return 'text-yellow-400';
                    return 'text-red-400';
                }
            }

            // For Success Rate
            if (headerLower.includes('success rate')) {
                if (!isNaN(numValue)) {
                    if (numValue >= 90) return 'text-green-400';
                    if (numValue >= 75) return 'text-yellow-400';
                    return 'text-red-400';
                }
            }

            // For Rejection Rate - Lower is better
            if (headerLower.includes('rejection rate')) {
                if (!isNaN(numValue)) {
                    if (numValue <= 5) return 'text-green-400';
                    if (numValue <= 15) return 'text-yellow-400';
                    return 'text-red-400';
                }
            }
        }

        // For Withdraw Department
        if (dept.includes('withdraw') || dept.includes('wd')) {
            // For Withdraw Amounts
            if (headerLower.includes('withdraw') && !headerLower.includes('rejected')) {
                if (!isNaN(numValue)) {
                    if (numValue >= 8000) return 'text-green-400';
                    if (numValue >= 4000) return 'text-yellow-400';
                    return 'text-red-400';
                }
            }

            // For Success Rate
            if (headerLower.includes('success rate')) {
                if (!isNaN(numValue)) {
                    if (numValue >= 90) return 'text-green-400';
                    if (numValue >= 75) return 'text-yellow-400';
                    return 'text-red-400';
                }
            }

            // For Rejection Rate - Lower is better
            if (headerLower.includes('rejection rate')) {
                if (!isNaN(numValue)) {
                    if (numValue <= 5) return 'text-green-400';
                    if (numValue <= 15) return 'text-yellow-400';
                    return 'text-red-400';
                }
            }
        }

        return 'text-gray-300';
    };


    return (
        <div className="p-6 min-h-screen">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-4">
                    {department?.toLowerCase().includes('deposit') ? 'Deposit Department' :
                        department?.toLowerCase().includes('withdraw') ? 'Withdraw Department' : 'CSR Department'} - Performance Dashboard
                </h1>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4  p-4 rounded-lg shadow-sm border border-slate-700">
                <div className="flex items-center gap-3 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Search ${department?.toLowerCase().includes('deposit') ? 'deposit transactions...' : department?.toLowerCase().includes('withdraw') ? 'withdraw transactions...' : 'conversations...'}`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[rgba(59,130,246,0.03)] border border-slate-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Date Filters */}
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2.5 bg-[rgba(59,130,246,0.03)] border border-slate-800 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2.5 bg-[rgba(59,130,246,0.03)] border border-slate-800 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {(searchTerm || startDate || endDate) && (
                        <button
                            onClick={handleClearFilters}
                            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-gray-200 rounded-lg transition-all duration-200 font-medium"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        disabled={filteredRows.length === 0}
                        className="bg-emerald-600 hover:bg-emerald-700 rounded-lg px-4 py-2.5 text-white font-medium text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 flex gap-2 items-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2.5 text-white font-medium text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex gap-2 items-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 bg-red-900 bg-opacity-20 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-start gap-2 shadow-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <strong className="font-semibold">Error loading data:</strong>
                        <p className="mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="w-full  rounded-lg border border-slate-700 shadow-md overflow-hidden">
                <div className=" px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">
                        {department?.toLowerCase().includes('deposit') ? 'Deposit Department' :
                            department?.toLowerCase().includes('withdraw') ? 'Withdraw Department' : 'CSR Department'} - Performance Data
                    </h2>
                    <span className="text-sm text-blue-100">
                        {filteredRows.length > 0
                            ? `Showing ${indexOfFirstRow + 1}-${Math.min(indexOfLastRow, filteredRows.length)} of ${filteredRows.length} records`
                            : 'No data available'}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className=" whitespace-nowrap">
                            <tr>
                                {customHeaders.map((header, index) => (
                                    <th key={index} className="px-4 py-3 font-semibold uppercase text-gray-200 text-center text-xs border-b-2 border-slate-800">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={customHeaders.length} className="text-center py-8 text-gray-400">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                                        Loading data...
                                    </td>
                                </tr>
                            ) : currentRows.length === 0 ? (
                                <tr>
                                    <td colSpan={customHeaders.length} className="text-center py-8 text-gray-400">
                                        <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        {tableData.length > 0 ? 'No records match your filters' : 'No data available'}
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {currentRows.map((row, i) => (
                                        <tr
                                            key={i}
                                            className={`border-b border-slate-700 transition-colors  ${getRowStatusColor(row)}`}
                                        >
                                            {customHeaders.map((header, j) => (
                                                <td
                                                    key={j}
                                                    className={`px-4 py-3 whitespace-nowrap text-center text-sm ${j === 0 ? 'font-medium text-gray-100' : getCellColor(header, row[j])}`}
                                                >
                                                    {row[j] !== undefined && row[j] !== null && row[j] !== '' && row[j] !== '-' ? row[j] : '0'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {/* Totals Row */}
                                    <tr className=" border-t-2 border-blue-500 font-semibold">
                                        <td className="px-4 py-3 text-center text-sm text-gray-100 uppercase">
                                            Total
                                        </td>
                                        {columnTotals.slice(1).map((total, index) => (
                                            <td key={index + 1} className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-100">
                                                {total > 0 ? total.toFixed(0) : '0'}
                                            </td>
                                        ))}
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {filteredRows.length > 0 && (
                    <div className=" px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className='flex items-center gap-5'>
                            <div className="flex items-center gap-4">
                                <span className="text-gray-300 text-sm font-medium">
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
                                        className="bg-slate-800 border border-slate-800 rounded-lg px-3 py-1.5 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                            </div>


                            {/* Legend - Bottom */}
                            <div>
                                <div className="flex flex-wrap gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span className="text-sm text-gray-300">Active/Present</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <span className="text-sm text-gray-300">Suspended</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <span className="text-sm text-gray-300">Absent</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-sm text-gray-300">Performance Indicator</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Page navigation */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={goToFirstPage}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors bg-slate-800"
                                >
                                    <ChevronsLeft className="w-4 h-4 text-gray-400" />
                                </button>
                                <button
                                    onClick={goToPrevPage}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors bg-slate-800"
                                >
                                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                                </button>

                                <span className="px-4 py-2 text-sm text-gray-300 font-medium bg-slate-800 border border-slate-800 rounded-lg">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors bg-slate-800"
                                >
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>
                                <button
                                    onClick={goToLastPage}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors bg-slate-800"
                                >
                                    <ChevronsRight className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>


                        </div>
                    </div>
                )}
            </div>


        </div>
    );
};

export default Performance;