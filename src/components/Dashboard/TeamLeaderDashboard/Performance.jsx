import React, { useEffect, useState } from 'react';
import { RefreshCw, Download, Search, AlertCircle, Database } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSheetDataByDepartment } from '../../../redux/sheetSlice';
import * as XLSX from 'xlsx';

const Performance = () => {
    const dispatch = useDispatch();
    const { headers, data, loading, error, department } = useSelector((state) => state.sheet);

    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedShift, setSelectedShift] = useState('all'); // 'all', 'morning', 'night'

    useEffect(() => {
        dispatch(fetchSheetDataByDepartment());
    }, [dispatch]);

    // Function to process data and group by shifts
    const processShiftData = () => {
        if (!data || data.length === 0) return { morning: [], night: [] };

        const morningShift = [];
        const nightShift = [];
        let currentShift = null;

        data.forEach((row, index) => {
            // Check if this row indicates a shift header
            if (row.length > 0 && typeof row[0] === 'string') {
                const firstCell = row[0].toLowerCase();

                if (firstCell.includes('morning shift')) {
                    currentShift = 'morning';
                    return;
                } else if (firstCell.includes('night shift')) {
                    currentShift = 'night';
                    return;
                }
            }

            // Skip empty rows
            if (row.length === 0 || (row.length === 1 && !row[0])) {
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

        // Filter rows that have NAME value
        return shiftData.filter((row) => {
            // Find NAME column index (assuming it's the first column with actual name data)
            const nameIndex = 0; // Based on your data structure
            const nameCell = row[nameIndex];

            // Check if this row has a valid name (not empty, not a header, not "Total", etc.)
            if (!nameCell ||
                typeof nameCell !== 'string' ||
                nameCell.trim() === '' ||
                nameCell.toLowerCase().includes('name') ||
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
                !nameCell.toLowerCase().includes('name') &&
                !nameCell.toLowerCase().includes('total')) {

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

    const handleRefresh = () => dispatch(fetchSheetDataByDepartment());

    const handleExport = () => {
        if (filteredRows.length === 0) return alert('No data to export');

        const dataToExport = [headers, ...filteredRows];
        const ws = XLSX.utils.aoa_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, department || 'Sheet');
        XLSX.writeFile(wb, `${department || 'Data'}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
    };

    // Function to get cell color based on column header and value
    const getCellColor = (header, value) => {
        const headerLower = header?.toLowerCase();

        // For "Completed" column - check if >= 530
        if (headerLower === 'completed convo') {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                return numValue >= 530 ? 'text-green-400' : 'text-orange-400';
            }
        }

        if (headerLower === 'online time') {
            if (typeof value === 'string' && value.includes(':')) {
                const [hoursStr, minutesStr] = value.split(':');
                const hours = parseInt(hoursStr, 10);
                const minutes = parseInt(minutesStr, 10);
                const totalMinutes = hours * 60 + minutes;
                const cutoff = 10 * 60 + 30;
                return totalMinutes >= cutoff ? 'text-green-400' : 'text-red-400';
            }
        }

        // For workload cells - color code based on value
        if (headerLower?.includes('workload') || headerLower?.includes('deposit')) {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                if (numValue >= 500) return 'text-green-400';
                if (numValue >= 300) return 'text-yellow-400';
                return 'text-red-400';
            }
        }

        return 'text-white';
    };

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
                            ? `Showing ${filteredRows.length} records`
                            : 'No data'}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[rgba(59,130,246,0.05)] whitespace-nowrap border-b border-gray-700">
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index} className="px-6 py-4 text-left font-semibold uppercase text-white">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={headers.length} className="text-center py-8 text-gray-400">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading data...
                                    </td>
                                </tr>
                            ) : filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={headers.length} className="text-center py-8 text-gray-400">
                                        <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        No records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((row, i) => (
                                    <tr
                                        key={i}
                                        className="border-b border-gray-800 hover:bg-[rgba(59,130,246,0.05)] transition-colors"
                                    >
                                        {row.map((cell, j) => (
                                            <td
                                                key={j}
                                                className={`px-6 py-4 whitespace-nowrap text-center ${getCellColor(headers[j], cell)}`}
                                            >
                                                {cell || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-[#f5f6fa13] px-6 py-3 border-t border-gray-700 text-sm flex justify-between items-center flex-wrap gap-3">
                    <span className="text-gray-400">
                        Showing {filteredRows.length} records
                    </span>

                    <div className="flex flex-wrap gap-3 items-center">
                        <span className="text-gray-400 font-semibold">Workload Legend:</span>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span className="text-green-400">≥ 500</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                            <span className="text-yellow-400">300-499</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded"></div>
                            <span className="text-red-400">&lt; 300</span>
                        </div>
                    </div>

                    {department && <span className="text-blue-400">{department} Department</span>}
                </div>
            </div>
        </div>
    );
};

export default Performance;