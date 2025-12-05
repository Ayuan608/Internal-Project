import React from 'react';
import {
    FileText,
    FileSpreadsheet,
    Presentation,
    FilePieChart,
    EllipsisVertical,
} from 'lucide-react';

function Files({ sidebarOpen, setSidebarOpen }) {
    const files = [
        {
            type: "PDF file",
            icon: <FilePieChart size={24} className="text-red-500" />,
            location: "C:/Users/Admin...",
            modified: "Today 10:27",
            size: "1.8 MB"
        },
        {
            type: "Docs file",
            icon: <FileText size={28} className="text-blue-400" />,
            location: "C:/Users/Admin...",
            modified: "Today 10:27",
            size: "1.8 MB"
        },
        {
            type: "Slides file",
            icon: <Presentation size={28} className="text-orange-400" />,
            location: "C:/Users/Admin...",
            modified: "Today 10:27",
            size: "1.8 MB"
        },
        {
            type: "Sheets file",
            icon: <FileSpreadsheet size={28} className="text-green-500" />,
            location: "C:/Users/Admin...",
            modified: "Today 10:27",
            size: "1.8 MB"
        }
    ];

    return (
        <div className="mt-6 overflow-y-auto">
            <table className="min-w-full table-auto text-left text-white">
                <thead className="text-white text-[18px]">
                    <tr className="border-b border-white/20">
                        <th className="px-6 py-2 font-extralight">File Name</th>
                        <th className="px-6 py-2 font-extralight">Location</th>
                        <th className="px-6 py-2 font-extralight">Last Modified</th>
                        <th className="px-6 py-2 font-extralight">Size</th>
                        <th className="px-6 py-2 font-extralight">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {files.map((file, index) => (
                        <tr
                            key={index}
                            className="cursor-pointer hover:bg-white/5 transition"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <td className="px-6 py-3 flex items-center gap-3">
                                {file.icon}
                                {file.type}
                            </td>

                            <td className="px-6 py-3">{file.location}</td>
                            <td className="px-6 py-3">{file.modified}</td>
                            <td className="px-6 py-3">{file.size}</td>

                            <td className="px-6 py-3 flex gap-6">
                                <button className="bg-[#1c1c27] px-2 py-1 rounded text-[14px] hover:bg-[#1f1f2d]">
                                    Share
                                </button>
                                <EllipsisVertical size={26} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Files;
