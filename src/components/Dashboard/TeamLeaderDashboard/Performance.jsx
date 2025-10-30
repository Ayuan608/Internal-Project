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

    useEffect(() => {
        dispatch(fetchSheetDataByDepartment());
    }, [dispatch]);

    // Filtered rows based on search and date range
    const filteredRows = data.filter((row) => {
        const matchesSearch =
            !searchTerm ||
            row.some((cell) =>
                String(cell).toLowerCase().includes(searchTerm.toLowerCase())
            );

        const dateIndex = headers.findIndex((h) =>
            h.toLowerCase().includes('date')
        );
        if (dateIndex === -1) return matchesSearch;

        const dateValue = new Date(row[dateIndex]);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        const withinDate =
            (!start || dateValue >= start) && (!end || dateValue <= end);

        return matchesSearch && withinDate;
    });

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

    return (
        <div className="p-4">
            {/* Filters & Actions */}
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <div className="flex items-center gap-3 flex-1">
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
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="w-full bg-[rgba(59,130,246,0.03)] rounded-xl border border-gray-700 shadow-xl overflow-hidden">
                <div className="bg-[rgba(59,130,246,0.03)] px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">
                        {department ? `${department} Department Data` : 'Performance Data'}
                    </h2>
                    <span className="text-sm text-gray-400">
                        {filteredRows.length > 0
                            ? `Showing ${filteredRows.length} of ${data.length} records`
                            : 'No data'}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-white">
                        <thead className="bg-[rgba(59,130,246,0.05)] whitespace-nowrap border-b border-gray-700">
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index} className="px-6 py-4 text-left font-semibold uppercase">
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
                                            <td key={j} className="px-6 py-4 whitespace-nowrap text-center">
                                                {cell || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-[#f5f6fa13] px-6 py-3 border-t border-gray-700 text-sm text-gray-400 flex justify-between">
                    <span>
                        Showing {filteredRows.length} of {data.length} records
                    </span>
                    <div className="mb-4 flex flex-wrap gap-3 items-center text-sm">
                        <span className="text-gray-400 font-semibold">Color Legend:</span>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span className="text-white">Reached Quota</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded"></div>
                            <span className="text-white">Failed to Reach Quota</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                            <span className="text-white">Half Data / No Data</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-cyan-400 rounded"></div>
                            <span className="text-white">Assigned in Zoho</span>
                        </div>
                    </div>
                    {department && <span className="text-blue-400">{department} Department</span>}

                </div>
            </div>
        </div>
    );
};

export default Performance;
