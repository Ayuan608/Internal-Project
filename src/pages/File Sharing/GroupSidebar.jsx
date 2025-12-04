import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Calendar, FileText, Share2 } from 'lucide-react';
import React from 'react'

function GroupSidebar({ isOpen, onClose }) {
    const sidebarVariants = {
        hidden: { x: '100%' },
        visible: { x: 0 },
        exit: { x: '100%' },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="h-screen  w-full sm:w-[350px] border-l border-[#9E9FA74D] p-4 z-50"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={sidebarVariants}
                    transition={{ type: 'tween', duration: 0.3 }}
                >
                    <div className="flex border-b border-[#9E9FA74D] w-full items-center justify-between mb-6 pb-4">
                        <div>
                            <h2 className="text-white text-base font-semibold">Docs Info</h2>
                            <p className="text-xs text-gray-400">Created 8/7/2025</p>
                        </div>
                        <button 
                            className='bg-[#282e3c96] p-1 rounded-full hover:bg-[#3a4052] transition-colors' 
                            onClick={onClose}
                        >
                            <X className="text-white w-5 h-5 cursor-pointer" />
                        </button>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                            <Users size={16} />
                            Members (3)
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                    A
                                </div>
                                <div>
                                    <p className="text-white text-sm">Admin</p>
                                    <p className="text-gray-400 text-xs">Owner</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                    J  
                                </div>
                                <div>
                                    <p className="text-white text-sm">Ashish Prabhakar </p>
                                    <p className="text-gray-400 text-xs">Member</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                    S
                                </div>
                                <div>
                                    <p className="text-white text-sm">Sarah Wilson</p>
                                    <p className="text-gray-400 text-xs">Member</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                            <FileText size={16} />
                            File Details
                        </h3>
                        <div className="bg-[#1a1d29] rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-3">
                                <img src="/your/path/pdf.png" alt="pdf" className="w-10 h-10" />
                                <div className="flex-1">
                                    <p className="text-white text-sm font-medium">Document.pdf</p>
                                    <p className="text-gray-400 text-xs">1.8 MB • PDF</p>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-[#9E9FA74D]">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Uploaded</span>
                                    <span className="text-white">Today 10:27</span>
                                </div>
                                <div className="flex justify-between text-xs mt-1">
                                    <span className="text-gray-400">Location</span>
                                    <span className="text-white">C:/Users/Admin...</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="mb-6">
                        <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                            <Calendar size={16} />
                            Recent Activity
                        </h3>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-white text-xs">Document.pdf was shared</p>
                                    <p className="text-gray-400 text-xs">Today 10:27</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-white text-xs">Sarah Wilson joined the group</p>
                                    <p className="text-gray-400 text-xs">Yesterday 14:32</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-white text-xs">Group created</p>
                                    <p className="text-gray-400 text-xs">8/7/2025</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                            <Share2 size={16} />
                            Share File
                        </button>
                        <button className="w-full bg-[#282e3c96] hover:bg-[#3a4052] text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                            Add Members
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default GroupSidebar