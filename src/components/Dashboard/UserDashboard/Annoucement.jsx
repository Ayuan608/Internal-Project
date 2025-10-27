import { Plus } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { announcements } from "../../../Helpers/Helper";


export default function Announcement() {
  const [selected, setSelected] = useState(null);
  const role = useSelector((state) => state.auth?.role);
  const [createAnnouncement, setCreateAnnouncement] = useState(false)
  return (
    <div className="min-h-screen px-2 mt-4">
      <div className="w-full mx-auto">
        <div className="flex justify-between items-center mb-8 pb-4">
          <div>
            <h1 className="font-semibold text-white text-3xl">Announcements</h1>
            <div className="text-white/70">
              Create and manage company-wide announcements
            </div>
          </div>
          {/* {role && role === "Admin" && role === "Super-Admin" && ( */}
          <button onClick={() => setCreateAnnouncement(true)} className="bg-[#3b82f6] flex text-white px-4 py-2 rounded-lg font-medium">
            <Plus /> Create Announcement
          </button>
          {/* )} */}
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

        <div className="gap-4 grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1">
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
