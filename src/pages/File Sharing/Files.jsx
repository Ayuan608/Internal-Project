import React, { useState } from 'react';
import { Share2, MoreVertical, FileText, File, Presentation } from 'lucide-react';

function Files({ onSelectFile }) {
    // Sample files data
    const [files, setFiles] = useState([
        {
            id: 1,
            name: 'Project Report.docx',
            type: 'Docs',
            date: 'Today 10:27',
            location: 'C:/Users/Memin...',
            size: '1.8 MB'
        },
        {
            id: 2,
            name: 'Financial Analysis.xlsx',
            type: 'Sheets',
            date: 'Today 10:27',
            location: 'C:/Users/Memin...',
            size: '2.3 MB'
        },
        {
            id: 3,
            name: 'Quarterly Presentation.pptx',
            type: 'Slides',
            date: 'Today 10:27',
            location: 'C:/Users/Memin...',
            size: '4.1 MB'
        },
        {
            id: 4,
            name: 'Contract.pdf',
            type: 'PDF',
            date: 'Today 10:27',
            location: 'C:/Users/Memin...',
            size: '1.2 MB'
        }
    ]);

    const getFileIcon = (type) => {
        switch (type) {
            case 'Docs':
                return <FileText className="w-5 h-5 text-blue-400" />;
     
            case 'Slides':
                return <Presentation className="w-5 h-5 text-orange-400" />;
            case 'PDF':
                return <File className="w-5 h-5 text-red-400" />;
            default:
                return <File className="w-5 h-5 text-gray-400" />;
        }
    };

    const handleFileClick = (file) => {
        console.log("File clicked:", file);
        if (onSelectFile) {
            onSelectFile(file);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-white">
                <thead>
                    <tr className="border-b border-white/10">
                        <th className="py-3 px-4 text-left text-sm font-light">File Name</th>
                        <th className="py-3 px-4 text-left text-sm font-light">Date</th>
                        <th className="py-3 px-4 text-left text-sm font-light">Location</th>
                        <th className="py-3 px-4 text-left text-sm font-light">Last Modified</th>
                        <th className="py-3 px-4 text-left text-sm font-light">Size</th>
                        <th className="py-3 px-4 text-left text-sm font-light">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file) => (
                        <tr 
                            key={file.id} 
                            className="border-b border-white/10 hover:bg-white/5 cursor-pointer transition"
                            onClick={() => handleFileClick(file)}
                        >
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                    {getFileIcon(file.type)}
                                    <span className="text-sm">{file.name}</span>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-white/70">{file.date}</td>
                            <td className="py-3 px-4 text-sm text-white/70">{file.location}</td>
                            <td className="py-3 px-4 text-sm text-white/70">{file.date}</td>
                            <td className="py-3 px-4 text-sm text-white/70">{file.size}</td>
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                    <button 
                                        className="p-1.5 hover:bg-white/10 rounded transition"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log("Share:", file.name);
                                        }}
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        className="p-1.5 hover:bg-white/10 rounded transition"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log("More options:", file.name);
                                        }}
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Files;