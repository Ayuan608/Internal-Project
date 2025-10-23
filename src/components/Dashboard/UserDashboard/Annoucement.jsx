// import { useState } from "react";

// export const Announcement = () => {
//   const [announcements, setAnnouncements] = useState([
//     {
//       id: 1,
//       title: "Q4 Performance Review",
//       creator: "Super Admin",
//       date: "2025-10-15",
//       recipients: "All Members",
//       status: "Published",
//     },
//     {
//       id: 2,
//       title: "New Quota Guidelines",
//       creator: "Super Admin",
//       date: "2025-10-12",
//       recipients: "Team Leaders",
//       status: "Published",
//     },
//   ]);

//   const [showModal, setShowModal] = useState(false);
//   const [newAnnouncement, setNewAnnouncement] = useState({
//     title: "",
//     creator: "Super Admin",
//     recipients: "All Members",
//     status: "Draft",
//   });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewAnnouncement({
//       ...newAnnouncement,
//       [name]: value,
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const announcement = {
//       id: announcements.length + 1,
//       ...newAnnouncement,
//       date: new Date().toISOString().split("T")[0],
//     };

//     setAnnouncements([...announcements, announcement]);
//     setShowModal(false);
//     setNewAnnouncement({
//       title: "",
//       creator: "Super Admin",
//       recipients: "All Members",
//       status: "Draft",
//     });
//   };

//   const handleSaveDraft = () => {
//     setNewAnnouncement({
//       ...newAnnouncement,
//       status: "Draft",
//     });
//   };

//   const handlePublish = () => {
//     setNewAnnouncement({
//       ...newAnnouncement,
//       status: "Published",
//     });
//   };

//   return (
//     <div className="min-h-screen p-2">
//       <div>
//         {/* Header */}
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold text-white">
//             Recent Announcements
//             <p className="text-base text-white/70">
//               Create and manage company-wide announcements
//             </p>
//           </h1>

//           <button
//             onClick={() => setShowModal(true)}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
//           >
//             <svg
//               className="w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M12 4v16m8-8H4"
//               />
//             </svg>
//             Create Announcement
//           </button>
//         </div>

//         {/* Table */}
//         <div className="rounded-xl shadow-sm overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full border_gray">
//               <thead className="bg-black">
//                 <tr className="border_gray">
//                   <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
//                     Title
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
//                     Creator
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
//                     Date
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
//                     Recipients
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
//                     Status
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {announcements.map((announcement) => (
//                   <tr
//                     key={announcement.id}
//                     className="transition duration-150 border_gray"
//                   >
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
//                       {announcement.title}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
//                       {announcement.creator}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
//                       {announcement.date}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
//                       {announcement.recipients}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                           announcement.status === "Published"
//                             ? "bg-green-100 text-green-800"
//                             : "bg-yellow-100 text-yellow-800"
//                         }`}
//                       >
//                         {announcement.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Modal */}
//         {showModal && (
//           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="border_gray rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//               {/* Modal Header */}
//               <div className="px-6 py-4 border-b border-gray-200">
//                 <h2 className="text-xl font-semibold text-white">
//                   Create Announcement
//                 </h2>
//               </div>

//               {/* Modal Body */}
//               <form onSubmit={handleSubmit} className="p-6 space-y-6">
//                 {/* Title */}
//                 <div>
//                   <label className="block text-sm font-medium text-white mb-2">
//                     Title
//                   </label>
//                   <input
//                     type="text"
//                     name="title"
//                     value={newAnnouncement.title}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                     placeholder="Enter announcement title"
//                     required
//                   />
//                 </div>

//                 {/* Creator */}
//                 <div>
//                   <label className="block text-sm font-medium text-white mb-2">
//                     Creator Name
//                   </label>
//                   <select
//                     name="creator"
//                     value={newAnnouncement.creator}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border bg-black border-gray-300 rounded-lg "
//                   >
//                     <option value="Super Admin">Super Admin</option>
//                     <option value="Admin">Admin</option>
//                     <option value="Manager">Manager</option>
//                   </select>
//                 </div>

//                 {/* Details */}
//                 <div>
//                   <label className="block text-sm font-medium text-white mb-2">
//                     Details
//                   </label>
//                   <textarea
//                     name="details"
//                     rows={4}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                     placeholder="Enter announcement details"
//                   />
//                 </div>

//                 {/* Divider */}
//                 <div className="border-t border-gray-200 pt-4">
//                   <label className="block text-sm font-medium text-white mb-2">
//                     Recipients
//                   </label>
//                   <select
//                     name="recipients"
//                     value={newAnnouncement.recipients}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border bg-black border-gray-300 rounded-lg  mb-4"
//                   >
//                     <option value="All Members">All Members</option>
//                     <option value="Team Leaders">Team Leaders</option>
//                     <option value="Managers">Managers</option>
//                     <option value="Specific Teams">Specific Teams</option>
//                   </select>

//                   {/* File Upload */}
//                   <div className="mt-4">
//                     <label className="block text-sm font-medium text-white mb-2">
//                       Upload Media/File
//                     </label>
//                     <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition duration-200">
//                       <svg
//                         className="mx-auto h-12 w-12 text-gray-400"
//                         stroke="currentColor"
//                         fill="none"
//                         viewBox="0 0 48 48"
//                       >
//                         <path
//                           d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
//                           strokeWidth="2"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                         />
//                       </svg>
//                       <div className="mt-2">
//                         <p className="text-sm text-gray-600">
//                           <span className="text-blue-600 hover:text-blue-500 cursor-pointer">
//                             Click to upload
//                           </span>{" "}
//                           or drag and drop
//                         </p>
//                         <p className="text-xs text-gray-500 mt-1">
//                           PNG, JPG, PDF up to 10MB
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex justify-end gap-3 pt-6 ">
//                   <button
//                     type="button"
//                     onClick={() => setShowModal(false)}
//                     className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="button"
//                     onClick={handleSaveDraft}
//                     className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//                   >
//                     Save Draft
//                   </button>
//                   <button
//                     type="submit"
//                     onClick={handlePublish}
//                     className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//                   >
//                     Publish Now
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };



import React, { useState } from "react";
import { useSelector } from "react-redux";

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
  const role = useSelector((state) => state.auth?.role);
  const [createAnnouncement, setCreateAnnouncement] = useState(false)
  return (
    <div className="min-h-screen px-2 mt-4">
      <div className="max-w-[90%]  mx-auto">
        <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-500">
          <div>
            <h1 className="font-semibold text-white text-3xl">Announcements</h1>
            <div className="text-white/70">
              Create and manage company-wide announcements
            </div>
          </div>
          {role && role === "Admin" && "Super-Admin" && (
            <button onClick={() => setCreateAnnouncement(true)} className="bg-[#3b82f6] text-white px-4 py-2 rounded-lg font-medium">
              Create Announcement
            </button>
          )}
          {/* Create Announcement Modal */}
          {createAnnouncement && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
              onClick={() => setCreateAnnouncement(false)}
            >
              <div
                className="bg-[#1a1d2e] rounded-2xl w-full max-w-2xl border border-gray-500 shadow-2xl overflow-hidden transform transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-8 py-6 border-b border-gray-500 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">
                    Create Announcement
                  </h2>
                  <button
                    onClick={() => setCreateAnnouncement(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-8 max-h-[500px] overflow-y-auto space-y-6">
                  <div>
                    <label className="block text-white mb-2 font-medium">Title</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-[#10131f] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Enter announcement title"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-medium">Creator Name</label>
                    <input
                      type="text"
                      defaultValue="Super Admin"
                      className="w-full px-4 py-2 bg-[#10131f] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-medium">Details</label>
                    <textarea
                      rows="6"
                      className="w-full px-4 py-2 bg-[#10131f] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      placeholder="Enter announcement details"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-medium">Recipients</label>
                    <select className="w-full px-4 py-2 bg-[#10131f] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors">
                      <option>All Members</option>
                      <option>Team Leaders</option>
                      <option>CSR Department</option>
                      <option>IT Department</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-medium">Upload Media/File</label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-400">Click to upload or drag and drop</p>
                    </div>
                  </div>
                </div>

                <div className="px-8 py-4 flex justify-end gap-3 border-t border-gray-500">
                  <button
                    onClick={() => setCreateAnnouncement(false)}
                    className="px-6 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                  >
                    Save Draft
                  </button>
                  <button
                    className="px-6 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
                  >
                    Publish Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="text-white rounded-lg bg-[#3b83f60e] shadow-[0_0_10px_black] transition-all duration-200  border-l-2  border-gray-500  overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white mb-2">
                      {announcement.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Posted by {announcement.creator}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {announcement.date}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(announcement)}
                    className="ml-4 px-5 py-2 bg-[#10131f] text-white/60 hover:text-white border rounded-lg transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                  >
                    View Details
                  </button>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {announcement.details.split("\n")[0]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 shadow-2xs flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className=" rounded-2xl w-full max-w-2xl border border-gray-500 shadow-2xl overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 ">
              <h2 className="text-2xl font-bold text-white mb-2">
                {selected.title}
              </h2>
              <div className="flex items-center gap-4 text-sm ">
                <span className="flex items-center gap-1 text-white">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {selected.creator}
                </span>
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {selected.date}
                </span>
              </div>
            </div>

            <div className="p-8 max-h-96 overflow-y-auto border-t border-gray-500">
              <pre className="whitespace-pre-wrap text-white leading-relaxed font-sans">
                {selected.details}
              </pre>
            </div>

            <div className=" px-8 py-4 flex justify-end border-t border-gray-500">
              <button
                onClick={() => setSelected(null)}
                className="px-6 py-2 border hover:bg-white hover:text-black text-white rounded-lg transition-colors duration-200 font-medium shadow-sm"
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
