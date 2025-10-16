import React, { useState } from "react";

const announcements = [
  {
    id: 1,
    date: "September 22, 2025",
    title: "Christmas Raffle Draw",
    creator: "Super-Admin",
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
    id: 2,
    date: "September 19, 2025",
    title: "Maintenance Notice",
    creator: "Admin",
    details:
      "The system will be under maintenance on Sept 20, 2025, from 1:00 AM to 3:00 AM.",
  },
  {
    id: 3,
    date: "September 2, 2025",
    title: "Team Meeting Reminder",
    creator: "Manager",
    details:
      "Don't forget our monthly meeting on Sept 5 at 9:00 AM in the main conference room.",
  },
  {
    id: 4,
    date: "October, 2024",
    title: "Maintenance Notice",
    creator: "Admin",
    details:
      "The system will be under maintenance on Sept 20, 2025, from 1:00 AM to 3:00 AM.",
  },
];

export default function Annoucement() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl mb-6 border-b border-gray-700 pb-2">
        Announcements
      </h1>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div
            onClick={() => setSelected(a)}
            key={a.id}
            className="flex items-center justify-between border border-gray-700 rounded-lg px-4 py-3 cursor-pointer transition"
          >
            <span className="text-gray-400">{a.date}</span>
            <button className="px-3 py-1 bg-[#10131f] cursor-pointer rounded text-sm">
              Preview
            </button>
          </div>
        ))}
      </div>

      {/* Popup Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => setSelected(null)} // <-- close when clicking outside
        >
          <div
            className="border border-gray-700 rounded-xl w-[90%] max-w-lg p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()} // <-- prevent closing when clicking inside
          >
            <h2 className="text-xl font-bold mb-2">{selected.title}</h2>
            <p className="text-sm text-gray-400 mb-4">
              Creator: {selected.creator}
            </p>
            <pre className="whitespace-pre-wrap text-gray-300 text-sm font-mono leading-relaxed">
              {selected.details}
            </pre>

            <div className="text-right mt-6">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-1.5 bg-[#10131f] rounded cursor-pointer"
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
