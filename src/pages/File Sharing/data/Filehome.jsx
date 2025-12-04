import React, { useState, useRef, useEffect } from "react";
import Files from "../Files";
import GroupSidebar from "../GroupSidebar";

import {
    FolderOpen,
    Funnel,
    Plus,
    RefreshCcw,
    Search,
    Settings,
    SquareCheckBig,
    Trash2,
    X,
} from "lucide-react";

function Filehome() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isRotating, setIsRotating] = useState(false);

    const [folderModal, setFolderModal] = useState(false);
    const [newFolderModal, setNewFolderModal] = useState(false);

    const [folderName, setFolderName] = useState("");

    const [inviteOpen, setInviteOpen] = useState(false);
    const [activeFolderId, setActiveFolderId] = useState(null);
    const popupRef = useRef(null);
    const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });

    const names = ["Ahmad Faizal", "Nur Aisyah", "Lee Jun Hao"];

    const handleRefresh = () => {
        setIsRotating(true);
        setTimeout(() => setIsRotating(false), 500);
    };

    // Close invite popup on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                setInviteOpen(false);
            }
        };

        if (inviteOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [inviteOpen]);

    return (
        <>
            <div className="flex w-full h-full  text-white">
                {/* MAIN CONTENT */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {/* SEARCH SECTION */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search"
                                className="bg-white/10 placeholder-white/70 border border-white/10 text-white rounded-full pl-10 pr-3 py-3 w-full text-[16px] focus:outline-none"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
                        </div>

                        <button className="bg-blue-600 hover:bg-blue-700 rounded-full px-6 py-3 text-[16px] transition">
                            Search
                        </button>
                    </div>

                    {/* TOP BUTTONS */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            {/* OPEN DOC */}
                            <div className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-blue-500 transition">
                                <Plus size={20} />
                                <span>Open Document</span>
                            </div>

                            {/* FOLDER BUTTON */}
                            <div
                                onClick={() => setFolderModal(true)}
                                className="bg-white/10 px-4 py-2 rounded-full cursor-pointer flex items-center gap-2 hover:bg-blue-500 transition"
                            >
                                <span>Folder</span>
                            </div>
                        </div>

                        {/* NEW FOLDER (RIGHT SIDE) */}
                        <div
                            onClick={() => setNewFolderModal(true)}
                            className="bg-white/10 px-4 py-2 rounded-full cursor-pointer flex items-center gap-2 hover:bg-blue-500 transition"
                        >
                            <Plus size={20} />
                            <span>New Folder</span>
                        </div>
                    </div>

                    {/* RECENT SECTION */}
                    <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                        <h2 className="text-xl font-light flex items-center gap-3">
                            Recent
                            <RefreshCcw
                                size={20}
                                onClick={handleRefresh}
                                className={`cursor-pointer transition-transform ${isRotating ? "animate-spin" : ""
                                    }`}
                            />
                        </h2>

                        <div className="flex items-center gap-3">
                            <button className="p-2 rounded-full bg-white/10 hover:bg-white/20">
                                <SquareCheckBig className="w-6 h-6" />
                            </button>

                            <button
                                onClick={() => confirm("Are you sure you want to delete?")}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20"
                            >
                                <Trash2 className="w-6 h-6 text-red-500" />
                            </button>

                            <button className="p-2 rounded-full bg-white/10 hover:bg-white/20">
                                <Settings className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* FILES COMPONENT */}
                    <Files sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                </div>

                {/* RIGHT SIDEBAR (GROUP INFO) */}
                {sidebarOpen && (
                    <GroupSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                )}

                {/* =======================
                    FOLDER MODAL
                ======================= */}
                {folderModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999]">
                        <div className="w-[850px] bg-[#111827] rounded-2xl p-8 border border-white/10 shadow-xl">

                            {/* HEADER */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-light tracking-wide">Folders</h2>

                                <button onClick={() => setFolderModal(false)}>
                                    <X size={22} className="text-gray-400 hover:text-white" />
                                </button>
                            </div>

                            {/* SEARCH + NEW FOLDER */}
                            <div className="flex justify-between items-center">
                                <div className="relative w-[380px]">
                                    <input
                                        type="text"
                                        placeholder="Search folder name"
                                        className="bg-white/10 border border-white/10 placeholder-white/60 text-white rounded-full px-10 py-3 w-full focus:outline-none"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
                                </div>

                                <button
                                    onClick={() => setNewFolderModal(true)}
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition"
                                >
                                    <Plus size={20} /> New Folder
                                </button>
                            </div>

                            {/* FOLDER LIST */}
                            <div className="mt-6 space-y-4">
                                {[1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="grid grid-cols-[250px_1fr_auto] items-center bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl px-5 py-4 transition"
                                    >
                                        {/* Left */}
                                        <div className="flex items-center gap-3">
                                            <FolderOpen className="text-blue-400" size={26} />
                                            <p className="font-light">Design Project</p>
                                        </div>

                                        {/* Middle */}
                                        <p className="text-sm text-white/60">
                                            @Ahmad.faizal, @Nur.aisyah
                                        </p>

                                        {/* Invite Button */}
                                        <button
                                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-full text-sm transition"
                                            onClick={(e) => {
                                                const rect = e.target.getBoundingClientRect();
                                                setPopupPos({
                                                    top: rect.bottom + 10,
                                                    left: rect.left - 300,
                                                });
                                                setInviteOpen(true);
                                                setActiveFolderId(i);
                                            }}
                                        >
                                            Invite for Collaboration
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* =======================
                    NEW FOLDER MODAL
                ======================= */}
                {newFolderModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000]">
                        <div className="w-[420px] bg-[#111827] border border-white/10 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-light">Create New Folder</h3>

                                <button onClick={() => setNewFolderModal(false)}>
                                    <X size={20} className="text-white/70 hover:text-white" />
                                </button>
                            </div>

                            <input
                                value={folderName}
                                onChange={(e) => setFolderName(e.target.value)}
                                type="text"
                                placeholder="Folder name"
                                className="w-full bg-white/10 border border-white/10 rounded-full px-4 py-3 text-sm placeholder-white/60 focus:outline-none"
                            />

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setNewFolderModal(false)}
                                    className="px-5 py-2 bg-white/10 hover:bg-white/20 rounded-full"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={() => {
                                        console.log("Created:", folderName);
                                        setNewFolderModal(false);
                                        setFolderName("");
                                    }}
                                    className="px-5 py-2 bg-blue-500 hover:bg-blue-600 rounded-full"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* =======================
                    INVITE POPUP
                ======================= */}
                {inviteOpen && (
                    <div
                        className="fixed z-[9999]"
                        style={{ top: popupPos.top, left: popupPos.left }}
                    >
                        <div
                            ref={popupRef}
                            className="w-[400px] bg-[#1f2937] rounded-2xl p-4 border border-white/10 shadow-2xl"
                        >
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="Search contact"
                                    className="w-[300px] bg-white/10 border border-white/10 rounded-full py-2 pl-10 pr-10 outline-none text-sm placeholder-white/50"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full w-8 h-8 bg-white/10 text-white/40 hover:text-white flex items-center justify-center">
                                    <Funnel size={18} />
                                </button>
                            </div>

                            <div className="max-h-56 overflow-y-auto pr-2 space-y-3">
                                {names.map((name) => (
                                    <div
                                        key={name}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <p>{name}</p>

                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-white/10 rounded-full">Editor</span>
                                            <span className="px-3 py-1 bg-white/10 rounded-full">View Only</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Filehome;
