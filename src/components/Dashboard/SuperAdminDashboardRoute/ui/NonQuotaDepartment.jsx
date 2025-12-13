import { useDispatch, useSelector } from 'react-redux';
import { fetchCombinedDepartmentsData } from '../../../../redux/combinedQuotaSlice';
import { useEffect, useMemo } from 'react';

const NonQuotaDepartment = () => {
    const dispatch = useDispatch()
    const { data } = useSelector((state) => state.combinedQuota);
    const { department } = useSelector((state) => state?.auth?.data)

    useEffect(() => {
        dispatch(fetchCombinedDepartmentsData())
    }, [])

    // Department-specific quota configuration
    const departmentConfig = {
        'CSR': {
            quota: 560,
            valueIndex: 3,
            nameIndex: 2
        },
        'Deposit': {
            quota: 560,
            valueIndex: 9,
            nameIndex: 2
        },
        'Withdraw': {
            quota: 1500,
            valueIndex: 7,
            nameIndex: 2
        }
    };

    // Keywords to exclude from the data
    const excludedKeywords = [
        "shift",
        "highlights",
        "half data",
        "failed",
        "assigned",
        "reached",
        "total",
        "member",
        "reject",
        "拒绝提现",
        "deposit total",
        "withdraw total",
        "senior",
        "morning",
        "12 Hours",
        "9 HOURS",
        "completed",
        "convo",
        "x",
        "name",                       
        "output",                     
        "total transaction process",  
        "transaction",
    ];

    // Filter non-quota data based on department
    const nonQuotaData = useMemo(() => {
        if (!data || !department) return [];

        const config = departmentConfig[department];
        if (!config) return [];



        const filteredData = data
            .filter(row => {
                // Check if row belongs to current department
                if (row[0] !== department) return false;

                // Check if name is empty or contains excluded keywords
                const name = String(row[config.nameIndex] || '').toLowerCase();
                const hasExcludedKeyword = excludedKeywords.some(keyword =>
                    name.includes(keyword.toLowerCase())
                );

                // Exclude if name is empty, contains excluded keywords, or is just whitespace
                if (!name.trim() || hasExcludedKeyword) return false;

                // Get the output value from specified index
                const rawValue = row[config.valueIndex];
                const outputValue = parseInt(rawValue) || 0;



                // Special condition for Withdraw department - exclude if length is less than or equal to 3
                if (department === 'Withdraw') {
                    const stringValue = String(rawValue || '');
                    if (stringValue.length <= 3) {
                        // console.log(`Excluding ${name} - value length ${stringValue.length} <= 3`);
                        return false;
                    }
                }

                // Return true if output is less than department quota
                const shouldInclude = outputValue < config.quota;
                if (!shouldInclude) {
                    // console.log(`Excluding ${name} - output ${outputValue} >= quota ${config.quota}`);
                }
                return shouldInclude;
            })
            .map(row => {
                const rawValue = row[config.valueIndex];
                const outputValue = parseInt(rawValue) || 0;
                const target = config.quota;
                const completion = Math.round((outputValue / target) * 100);
                const variance = outputValue - target;

                const memberData = {
                    date: row[1],
                    name: row[config.nameIndex],
                    department: row[0],
                    output: outputValue,
                    rawValue: rawValue,
                    target: target,
                    completion: completion,
                    variance: variance
                };


                return memberData;
            });

        return filteredData;
    }, [data, department]);


    const currentConfig = departmentConfig[department] || {};
    const totalAgents = data ? data.filter(row => {
        if (row[0] !== department) return false;
        const config = departmentConfig[department];
        const name = String(row[config.nameIndex] || '').toLowerCase();
        const hasExcludedKeyword = excludedKeywords.some(keyword =>
            name.includes(keyword.toLowerCase())
        );

        // Special condition for Withdraw department - exclude if length is less than or equal to 3
        if (department === 'Withdraw') {
            const stringValue = String(row[config.valueIndex] || '');
            if (stringValue.length <= 3) return false;
        }

        return !hasExcludedKeyword && name.trim();
    }).length : 0;

    // Calculate statistics for legend
    const stats = useMemo(() => {
        const below50 = nonQuotaData.filter(member => member.completion < 50).length;
        const below80 = nonQuotaData.filter(member => member.completion >= 50 && member.completion < 80).length;
        const below100 = nonQuotaData.filter(member => member.completion >= 80 && member.completion < 100).length;

        return { below50, below80, below100 };
    }, [nonQuotaData]);



    return (
        <div className="min-h-screen p-6">
            {/* Header Section */}
            <div className="mb-6">
                <h1 className="text-white text-2xl font-bold mb-2">
                    Non-Quota Dashboard - {department} Department
                </h1>
                <p className="text-gray-400 mb-4">
                    Track members who haven't met their quota targets
                </p>

                {/* Stats Cards */}
                <div className="flex gap-4 mb-6">
                    <div className="bg-red-900/30 px-4 py-2 rounded-lg border border-red-700/50">
                        <span className="text-red-300 text-sm font-medium">
                            {nonQuotaData.length} Non-Quota Agents
                        </span>
                    </div>
                    <div className="bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-700/50">
                        <span className="text-blue-300 text-sm font-medium">
                            {totalAgents} Total Agents
                        </span>
                    </div>
                    <div className="bg-green-900/30 px-4 py-2 rounded-lg border border-green-700/50">
                        <span className="text-green-300 text-sm font-medium">
                            Quota Target: {currentConfig.quota || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-white">
                Showing {nonQuotaData.length} non-quota agents in {department} department
                <span className="ml-2 px-2 py-1 bg-red-900/30 text-red-300 rounded text-xs">
                    Quota Not Met
                </span>
                {department === 'Withdraw' && (
                    <span className="ml-2 px-2 py-1 bg-purple-900/30 text-purple-300 rounded text-xs">
                        Filtered: Length &gt; 3
                    </span>
                )}
            </div>

            {/* Table */}
            <div className="rounded-lg overflow-hidden border border-white/10 mb-5">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-600">
                                    DATE
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-600">
                                    NAME
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-600">
                                    DEPARTMENT
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-600">
                                    OUTPUT
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-600">
                                    TARGET
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-600">
                                    COMPLETION
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-600">
                                    VARIANCE
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {nonQuotaData.map((member, index) => (
                                <tr key={index} className="hover:bg-gray-750 transition-colors border-b border-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                        {member.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                                        {member.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded-full text-xs font-medium">
                                            {member.department}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-white font-semibold">
                                        {member.rawValue}
                                        <span className="text-xs text-gray-400 ml-1">

                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                        {member.target}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`font-bold ${member.completion < 50 ? "text-red-400" : member.completion < 80 ? "text-yellow-400 " : "text-green-400"
                                            }`}>
                                            {member.completion}%
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap font-bold ${member.variance < 0 ? "text-red-400" : "text-green-400"
                                        }`}>
                                        {member.variance > 0 ? `+${member.variance}` : member.variance}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Empty State */}
            {nonQuotaData.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">🎉 Excellent Performance!</div>
                    <div className="text-gray-500 text-sm">All agents have met their quota targets for this department.</div>
                </div>
            )}

            {/* Attractive Legend */}
            <div className="rounded-lg p-4 mb-6">
                <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Performance Legend</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-sm">Critical (&lt;50%)</span>
                        <span className="bg-red-900/50 text-red-300 px-2 py-1 rounded text-xs font-bold">
                            {stats.below50}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <span className="text-white text-sm">Warning (50-79%)</span>
                        <span className="bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded text-xs font-bold">
                            {stats.below80}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-white text-sm">Near Target (80-99%)</span>
                        <span className="bg-green-900/50 text-green-300 px-2 py-1 rounded text-xs font-bold">
                            {stats.below100}
                        </span>
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span className="text-white text-sm">Quota Target: {currentConfig.quota || 'N/A'}</span>
                        <span className="text-gray-400 text-xs">(100% completion required)</span>
                    </div>
                    {department === 'Withdraw' && (
                        <div className="flex items-center space-x-2 mt-2">
                            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                            <span className="text-white text-sm">Withdraw Filter: Output length must be greater than 3</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NonQuotaDepartment;