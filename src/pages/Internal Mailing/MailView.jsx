import React from "react";
import { motion } from "framer-motion";

export default function MailView({ mail, onClose }) {
  return (
    <motion.div
      initial={{ x: 380, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 380, opacity: 0 }}
      transition={{ type: "spring", stiffness: 70, damping: 15 }}
      className="
    absolute right-0 top-20 bottom-0 
    h-full w-[380px] 
    p-3 overflow-y-auto
  "
    >


      {/* Content */}
      <div className="w-full rounded-[6px] p-3 shadow-xl space-y-4 bg-white/5 text-white relative">

        {/* Close Button → TOP RIGHT */}
        <button
          onClick={onClose}
          className="
      absolute right-3 top-3
      text-sm px-2 py-1 rounded 
      text-gray-400 hover:text-white
    "
        >
          ✖
        </button>

        {/* Header Row */}
        <div className="flex flex-col gap-1 mt-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <button className="px-2 py-1 rounded-full text-sm flex items-center gap-2 border bg-[#161b2e] border-white/10 hover:bg-[#25304a]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              Normal
            </button>

            <h2 className="font-semibold text-md leading-snug">
              {mail?.subject}
            </h2>
          </div>
        </div>

        {/* Rest of your content */}
        <p className="text-gray-200 text-sm">
          <span className="text-gray-400 font-semibold">From :</span> {mail?.from}
        </p>

        <p className="text-gray-200 text-sm">
          <span className="text-gray-400 font-semibold">To :</span> {mail?.to}
        </p>

        <p className="text-gray-200 text-sm">
          <span className="text-gray-400 font-semibold">Date & Time :</span> {mail?.date}
        </p>

        <div className="w-full p-3 rounded-[8px] text-sm leading-relaxed bg-white/5 text-gray-300">
          {mail?.body}
        </div>

        <div className="grid grid-flow-col auto-cols-max gap-2 text-sm w-full">
          <button className="w-auto whitespace-nowrap rounded-full border transition flex items-center gap-1 px-2 h-[26px] bg-[#161b2e] border-white/10 hover:bg-[#222d55] text-white">
            Reply
          </button>

          <button className="w-auto whitespace-nowrap rounded-full border transition flex items-center gap-1 px-2 h-[26px] bg-[#161b2e] border-white/10 hover:bg-[#222d55] text-white">
            Forward
          </button>

          <button className="w-auto whitespace-nowrap rounded-full border transition flex items-center gap-1 px-2 h-[26px] bg-[#161b2e] border-white/10 hover:bg-[#222d55] text-white">
            @Mention
          </button>
        </div>

        <div className="pt-3">
          <div className="inline-flex gap-2 text-[12px] px-3 py-[3px] rounded-full border bg-[#161b2e] text-gray-300 border-white/10">
            Seen by {mail?.seenBy || "N/A"}
          </div>
        </div>

      </div>

    </motion.div>
  );
}
