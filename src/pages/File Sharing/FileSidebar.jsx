import {
    Plus,
    Trash,
    FileText,
    FileSpreadsheet,
    Presentation,
    FilePieChart
} from "lucide-react";

import { HomeIcon } from "@heroicons/react/24/solid";

const FileSidebar = ({ selected, setSelected }) => {
    const menuItems = [
        {
            name: "Home",
            icon: <HomeIcon className="w-6 h-6 text-[#3B82F6]" />,
        },
        {
            name: "New",
            icon: <Plus className="w-6 h-6 text-[#3B82F6]" />,
        },

        { name: "Docs", icon: <FileText className="w-6 h-6 text-[#3B82F6]" /> },
        { name: "Slides", icon: <Presentation className="w-6 h-6 text-[#F97316]" /> },
        { name: "Sheets", icon: <FileSpreadsheet className="w-6 h-6 text-[#22C55E]" /> },
        { name: "PDF", icon: <FilePieChart className="w-6 h-6 text-[#EF4444]" /> },

        {
            name: "Deleted",
            icon: <Trash className="w-6 h-6 text-[#9E9FA7]" />,
            delete: true,
        },
    ];

    return (
        <div className="flex">
            <div className="h-full w-[90px] bg-[rgba(59,130,246,0.03)] backdrop-blur-xl  flex flex-col items-center py-6 space-y-4 text-white">

                {menuItems.map((item, idx) => {
                    const isActive = selected === item.name;

                    return (
                        <div
                            key={idx}
                            onClick={() => {
                                if (!item.delete) setSelected(item.name);
                                else confirm("Are you sure you want to delete?");
                            }}
                            className={`
                                group w-full flex flex-col items-center cursor-pointer transition-all
                                ${isActive ? "text-white" : "text-gray-400 hover:text-white"}
                            `}
                        >
                            {/* Icon Container */}
                            <div
                                className={`
                                    w-12 h-12 flex items-center justify-center rounded-xl transition-all
                                    ${isActive
                                        ? "bg-white/20 shadow-lg shadow-blue-500/20"
                                        : "bg-white/5 group-hover:bg-white/10"
                                    }
                                `}
                            >
                                {item.icon}
                            </div>

                            {/* Label */}
                            <span
                                className={`text-[12px] mt-1 tracking-wide transition-colors
                                    ${isActive ? "text-white" : "text-gray-300"}
                                `}
                            >
                                {item.name}
                            </span>
                        </div>
                    );
                })}

            </div>
        </div>
    );
};

export default FileSidebar;
