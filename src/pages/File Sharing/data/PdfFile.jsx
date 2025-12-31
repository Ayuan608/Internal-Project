import React, { useState } from 'react'
import { Plus, RefreshCcw, Search, Settings, SquareCheckBig, Trash2 } from 'lucide-react'
import Files from '../Files';
function PdfFile() {
    const [isRotating, setIsRotating] = useState(false);

    const handleRefresh = () => {
        setIsRotating(true);
        setTimeout(() => setIsRotating(false), 500);
    };

    return (
        <div className='flex-1 p-6 h-screen'>
            <div className="relative mb-6 w-full max-w-4xl">
                <input
                    type="text"
                    placeholder="Search for templates"
                    className="bg-[#f5f6fa0b] text-white placeholder-white rounded-full pl-10 pr-4 py-3.5 w-full text-sm focus:outline-none"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-white" />
            </div>
            <h1 className='text-xl text-white mb-4 font-semibold'>Create new Docs File</h1>
            <div className="w-[200px] h-[280px] flex flex-col items-center bg-[#222c432b] rounded-xl p-3 ">
                <div className="group relative h-full w-full border-2 border-dashed border-[#E5252A] rounded-lg overflow-hidden cursor-pointer transition-all">

                    <div className="flex items-center justify-center w-full h-full">
                        <div className="w-[93%] h-[95%] bg-[#E5252A] rounded-md"></div>
                    </div>

                    <div className="absolute inset-0 bg-black/40 group-hover:bg-[#07091037] transition-all duration-300 rounded-lg z-10" />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                        <Plus className="text-white w-10 h-10" />
                    </div>
                </div>

                <div className="mt-3  text-white text-sm">Blank</div>
            </div>
            <div className="bg-[#f5f6fa13] px-4 py-2.5 mt-5 rounded-full flex items-center gap-2 w-fit mb-8 cursor-pointer hover:bg-[#2a2d3b] transition">
                <Plus size={20} />
                <span className="text-sm">Open Document</span>
            </div>
            <div className="border-b border-[#9E9FA74D] pb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-3">
                    Recent
                    <RefreshCcw
                        size={20}
                        className={`cursor-pointer text-white transition-transform duration-500 ${isRotating ? 'animate-spin' : ''}`}
                        onClick={handleRefresh}
                    />
                </h2>

                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-xl bg-[#1c1c27] transition cursor-pointer">
                        <SquareCheckBig className="w-5 h-5 text-white" />
                    </button>
                    <button
                        onClick={() => confirm('Are you sure you want to delete?')}
                        className="p-2 rounded-xl bg-[#1c1c27] transition cursor-pointer"
                    >
                        <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                    <button className="p-2 rounded-xl bg-[#1c1c27] transition cursor-pointer">
                        <Settings className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
            <Files />
        </div>
    )
}

export default PdfFile