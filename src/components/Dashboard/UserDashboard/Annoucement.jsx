import React, { useState } from "react";

const announcements = [
  {
    id: 1,
    date: "October 15, 2025",
    title: "Q4 Performance Review",
    creator: "Super Admin",
    details: `Dear Team Members,

We will be conducting Q4 performance reviews next week. Please ensure all your task completions are updated in the system. Team Leaders will schedule individual meetings with each team member.

Thank you for your continued dedication.`,
  },
  {
    id: 2,
    date: "October 12, 2025",
    title: "New Quota Guidelines",
    creator: "David Chen (Team Leader)",
    details: `Hello Team,

Effective immediately, the daily quota for CSR department has been updated to 50 tasks for morning shift and 45 tasks for night shift. Please adjust your workflow accordingly.

Let's maintain our excellent performance!`,
  },
  {
    id: 3,
    date: "September 22, 2025",
    title: "Christmas Raffle Draw",
    creator: "Super Admin",
    details: `Celebrate the holiday season with excitement!

Join our IS Department Christmas Raffle Draw and get a chance to win amazing prizes!

PRIZES:
1 Winner – Motorcycle
2 Winners – Gaming Laptop
10 Winners – ₱1,000 Cash
20 Winners – ₱500 Cash

All IS members are automatically eligible to participate.

Winners will be drawn and announced on December 24, 2025.

Good luck, and happy holidays!`,
  },
  {
    id: 4,
    date: "September 19, 2025",
    title: "System Maintenance Notice",
    creator: "IT Admin",
    details: `The system will be under maintenance on September 20, 2025, from 1:00 AM to 3:00 AM.

During this time, all services will be temporarily unavailable. Please plan your work accordingly.

We apologize for any inconvenience this may cause.`,
  },
];

export default function Announcement() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen  p-2">
      <div className="max-w-[90%]  mx-auto">
        <h1 className="text-3xl font-semibold text-white mb-8 pb-4 border-b-2 border-gray-500">
          Announcements
        </h1>

        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border- border-gray-500 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white mb-2">
                      {announcement.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Posted by {announcement.creator}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {announcement.date}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(announcement)}
                    className="ml-4 px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                  >
                    View Details
                  </button>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {announcement.details.split('\n')[0]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {selected.title}
              </h2>
              <div className="flex items-center gap-4 text-blue-50 text-sm">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {selected.creator}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {selected.date}
                </span>
              </div>
            </div>

            <div className="p-8 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans">
                {selected.details}
              </pre>
            </div>

            <div className="bg-gray-50 px-8 py-4 flex justify-end border-t border-gray-200">
              <button
                onClick={() => setSelected(null)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}