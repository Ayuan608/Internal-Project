import { Bell } from 'lucide-react';
import React, { useState } from 'react'

function NotificationPopup() {
  const [visible, setVisible] = useState(false);
  return (
    <div
      onClick={() => setVisible(!visible)}
      className="relative w-10 h-10 flex items-center justify-center rounded-full bg-[#282e3c61] cursor-pointer hover:bg-[#3a3f4f]"
    >
      <Bell className="text-white" />
      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
      {visible && (
        <div
         
          className="rounded-xl border border-[#2e3135] bg-[#111113]/95 backdrop-blur-sm fixed top-[60px] right-5 w-[420px] max-h-[550px] overflow-hidden shadow-2xl z-50 animate-fade p-4 text-white"
        >
          
        </div>
      )}
    </div>
  )
}

export default NotificationPopup