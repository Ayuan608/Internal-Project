import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Upload, Download } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadFile, getFiles } from '../../../redux/FileUploadSlice';
import * as XLSX from 'xlsx';

const Performance = () => {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);
    const { data: fileData, loading } = useSelector((state) => state.file);
    const [performanceData, setPerformanceData] = useState([]);

    useEffect(() => {
        dispatch(getFiles());
    }, [dispatch]);

    useEffect(() => {
        if (fileData && fileData.length > 0) {
            setPerformanceData(fileData);
        }
    }, [fileData]);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];

        if (!allowedTypes.includes(file.type)) {
            alert('Please select a valid Excel file (.xlsx or .xls)');
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                // Map Excel data to required format
                const formattedData = jsonData.map(row => {
                    const memberName = row['Member'] || row['Name'] || 'Unknown';

                    // Extract role - check if CSR or Trainee
                    const role = memberName.toLowerCase().includes('csr') ? 'CSR' :
                        memberName.toLowerCase().includes('trainee') ? 'Trainee' : 'Staff';

                    return {
                        name: memberName,
                        role: role,
                        date: row['Date'] || new Date().toLocaleDateString(),
                        completed: Number(row['Completed Convo'] || row['Completed'] || 0),
                        totalEffective: Number(row['Total Effective'] || 0),
                        messages: Number(row['Total Message'] || row['Messages'] || 0),
                        missedChats: Number(row['Missed Chats'] || 0),
                        avgOnlineTime: row['Ave. Online Time'] || '0:00:00',
                        frt: row['1st Response'] || '0:00:00',
                        positivePercentage: parseFloat(row['Positive rates']) || 0,
                        negatives: parseFloat(row['Negatives']) || 0
                    };
                });

                setPerformanceData(formattedData);

                // Upload to backend
                await dispatch(uploadFile(file)).unwrap();
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Error processing file:', error);
            alert('Error processing file. Please check the format.');
        }

        // Clear input
        event.target.value = '';
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleExport = () => {
        if (performanceData.length === 0) {
            alert('No data to export');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(performanceData.map(item => ({
            'Member': item.name,
            'Date': item.Date,
            'Completed Convo': item.CompletedConvo,
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
        XLSX.writeFile(wb, `performance_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const getStatusColor = (value, thresholds) => {
        if (value >= thresholds.good) return 'text-green-400';
        if (value >= thresholds.average) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className='p-2'>
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
            />

            <div className="flex justify-end items-center gap-3 mb-4">
                <button
                    onClick={handleImportClick}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
                >
                    <Upload className="w-4 h-4" />
                    {loading ? 'Uploading...' : 'Import File'}
                </button>
                <button
                    onClick={handleExport}
                    disabled={performanceData.length === 0}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export File
                </button>
            </div>

            <div className="w-full bg-[rgba(59,130,246,0.03)] rounded-xl border border-gray-700 shadow-xl overflow-hidden">
                <div className="bg-[rgba(59,130,246,0.03)] px-6 py-4 border-b border-gray-700">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-white">Performance Metrics</h2>
                        <div className="text-sm text-gray-400">
                            {performanceData.length > 0 ? `${performanceData.length} Records` : 'No Data'}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[rgba(59,130,246,0.03)] border-b border-gray-700">
                            <tr>
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
                            {performanceData.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="px-6 py-8 text-center text-gray-400">
                                        No data available. Please import an Excel file.
                                    </td>
                                </tr>
                            ) : (
                                performanceData.map((row, index) => (
                                    <tr key={index} className="border-b border-gray-700 hover:bg-[rgba(59,130,246,0.05)]">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                    {row.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
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

                <div className="bg-[#f5f6fa13] px-6 py-3 border-t border-gray-700">
                    <div className="flex justify-between items-center text-sm text-gray-400">
                        <div>Showing {performanceData.length} records</div>
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