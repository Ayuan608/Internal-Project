import { useState } from "react";

export const Announcement = () => {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Q4 Performance Review",
      creator: "Super Admin",
      date: "2025-10-15",
      recipients: "All Members",
      status: "Published",
    },
    {
      id: 2,
      title: "New Quota Guidelines",
      creator: "Super Admin",
      date: "2025-10-12",
      recipients: "Team Leaders",
      status: "Published",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    creator: "Super Admin",
    recipients: "All Members",
    status: "Draft",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAnnouncement({
      ...newAnnouncement,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const announcement = {
      id: announcements.length + 1,
      ...newAnnouncement,
      date: new Date().toISOString().split("T")[0],
    };

    setAnnouncements([...announcements, announcement]);
    setShowModal(false);
    setNewAnnouncement({
      title: "",
      creator: "Super Admin",
      recipients: "All Members",
      status: "Draft",
    });
  };

  const handleSaveDraft = () => {
    setNewAnnouncement({
      ...newAnnouncement,
      status: "Draft",
    });
  };

  const handlePublish = () => {
    setNewAnnouncement({
      ...newAnnouncement,
      status: "Published",
    });
  };

  return (
    <div className="min-h-screen p-2">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Recent Announcements
            <p className="text-base text-white/70">
              Create and manage company-wide announcements
            </p>
          </h1>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Announcement
          </button>
        </div>

        {/* Table */}
        <div className="rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full border_gray">
              <thead className="bg-black">
                <tr className="border_gray">
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Creator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((announcement) => (
                  <tr
                    key={announcement.id}
                    className="transition duration-150 border_gray"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {announcement.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {announcement.creator}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {announcement.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {announcement.recipients}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          announcement.status === "Published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {announcement.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="border_gray rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-white">
                  Create Announcement
                </h2>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newAnnouncement.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter announcement title"
                    required
                  />
                </div>

                {/* Creator */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Creator Name
                  </label>
                  <select
                    name="creator"
                    value={newAnnouncement.creator}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border bg-black border-gray-300 rounded-lg "
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                {/* Details */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Details
                  </label>
                  <textarea
                    name="details"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter announcement details"
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-white mb-2">
                    Recipients
                  </label>
                  <select
                    name="recipients"
                    value={newAnnouncement.recipients}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border bg-black border-gray-300 rounded-lg  mb-4"
                  >
                    <option value="All Members">All Members</option>
                    <option value="Team Leaders">Team Leaders</option>
                    <option value="Managers">Managers</option>
                    <option value="Specific Teams">Specific Teams</option>
                  </select>

                  {/* File Upload */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      Upload Media/File
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition duration-200">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <span className="text-blue-600 hover:text-blue-500 cursor-pointer">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, PDF up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 ">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    onClick={handlePublish}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Publish Now
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
