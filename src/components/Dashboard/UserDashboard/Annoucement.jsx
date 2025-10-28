import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, X, Upload, User, Calendar } from "lucide-react";
import { fetchAllAnnouncements, createAnnouncement, clearError } from '../../../redux/announcementSlice';

export default function Announcement() {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(null);
  const [createAnnouncementModal, setCreateAnnouncementModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    recipients: 'ALL',
    files: []
  });
  const [dragOver, setDragOver] = useState(false);

  // Safe destructuring with default values
  const announcementsState = useSelector((state) => state.announcements);
  const {
    announcements = [],
    loading = false,
    error = null,
    createLoading = false
  } = announcementsState || {};

  console.log(announcements, "hello")



  const user = useSelector((state) => state.auth?.data);
  const role = useSelector((state) => state.auth?.data?.role);

  // Fetch announcements on component mount
  useEffect(() => {
    dispatch(fetchAllAnnouncements());
  }, [dispatch]);

  // Clear errors when modal closes
  useEffect(() => {
    if (!createAnnouncementModal) {
      dispatch(clearError());
    }
  }, [createAnnouncementModal, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.details.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const announcementData = {
      ...formData,
      createdBy: user?.name || 'Super-Admin',
      recipients: formData.recipients === 'ALL' ? ['ALL'] : [formData.recipients]
    };

    try {
      const result = await dispatch(createAnnouncement(announcementData)).unwrap();

      if (result.success) {
        setFormData({
          title: '',
          details: '',
          recipients: 'ALL',
          files: []
        });
        setCreateAnnouncementModal(false);
        // Refresh the announcements list
        dispatch(fetchAllAnnouncements());
      }
    } catch (error) {
      console.error('Failed to create announcement:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Debug: Check what's in the Redux state
  useEffect(() => {
    console.log('Announcements state:', announcementsState);
    console.log('Announcements data:', announcements);
  }, [announcementsState, announcements]);

  if (loading) {
    return (
      <div className="min-h-screen px-2 mt-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white">Loading announcements...</span>
      </div>
    );
  }

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

          {(role === 'Admin' || role === 'Super-Admin') && (
            <button
              onClick={() => setCreateAnnouncementModal(true)}
              className="bg-[#3b82f6] flex items-center gap-2 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              <Plus size={20} /> Create Announcement
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300">Error: {error}</p>
            <button
              onClick={() => dispatch(clearError())}
              className="mt-2 text-red-300 hover:text-red-100 text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Announcements Grid */}
        <div className="gap-4 grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1">
          {!announcements || announcements.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <div className="text-gray-400 text-lg">No announcements found</div>
              <div className="text-gray-500 text-sm mt-2">
                {role === 'Admin' || role === 'Super-Admin'
                  ? 'Create your first announcement to get started'
                  : 'No announcements have been posted yet'
                }
              </div>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement._id || announcement.id}
                className="text-white rounded-lg bg-[#3b83f60e] shadow-[0_0_10px_black] transition-all duration-200 border-l-2 border-gray-500 overflow-hidden hover:border-blue-500"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-white mb-2">
                        {announcement.title || 'No Title'}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User size={16} />
                          Posted by {announcement.createdBy || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={16} />
                          {formatDate(announcement.createdAt || announcement.date)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(announcement)}
                      className="ml-4 px-5 py-2 bg-[#10131f] text-white/60 hover:text-white border border-gray-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                    >
                      View Details
                    </button>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {announcement.details ? announcement.details.split('\n')[0] : 'No details available'}
                  </p>

                  {/* Show image preview if available */}
                  {announcement.imageUrls && announcement.imageUrls.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {announcement.imageUrls.slice(0, 3).map((url, index) => (
                        <div key={index} className="w-12 h-12 bg-gray-700 rounded border border-gray-600 overflow-hidden">
                          <img
                            src={url}
                            alt={`Attachment ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-full h-full hidden items-center justify-center text-xs text-gray-400">
                            Image
                          </div>
                        </div>
                      ))}
                      {announcement.imageUrls.length > 3 && (
                        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-600 flex items-center justify-center text-xs text-gray-400">
                          +{announcement.imageUrls.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Announcement Modal */}
        {createAnnouncementModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={() => setCreateAnnouncementModal(false)}
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
                  onClick={() => setCreateAnnouncementModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="p-8 max-h-[500px] overflow-y-auto space-y-6">
                  <div>
                    <label className="block text-white mb-2 font-medium">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#10131f] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Enter announcement title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-medium">Creator Name</label>
                    <input
                      type="text"
                      value={user?.name || 'Super-Admin'}
                      className="w-full px-4 py-2 bg-[#10131f] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-medium">Details *</label>
                    <textarea
                      name="details"
                      value={formData.details}
                      onChange={handleInputChange}
                      rows="6"
                      className="w-full px-4 py-2 bg-[#10131f] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      placeholder="Enter announcement details"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-medium">Recipients</label>
                    <select
                      name="recipients"
                      value={formData.recipients}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#10131f] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="ALL">All Members</option>
                      <option value="Team Leader">Team Leaders</option>
                      <option value="CSR">CSR Department</option>
                      <option value="IT">IT Department</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-medium">Upload Media/File</label>

                    {/* File List */}
                    {formData.files.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {formData.files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded">
                            <span className="text-gray-300 text-sm truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${dragOver
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 hover:border-blue-500'
                        }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('file-upload').click()}
                    >
                      <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-400">Click to upload or drag and drop</p>
                      <p className="text-gray-500 text-sm mt-1">Supports images and documents</p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="px-8 py-4 flex justify-end gap-3 border-t border-gray-500">
                  <button
                    type="button"
                    onClick={() => setCreateAnnouncementModal(false)}
                    className="px-6 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-6 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {createLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      'Publish Now'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Announcement Detail Modal */}
        {selected && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <div
              className="bg-[#1a1d2e] rounded-2xl w-full max-w-2xl border border-gray-500 shadow-2xl overflow-hidden transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-8 py-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selected.title || 'No Title'}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <User size={16} />
                    {selected.createdBy || 'Unknown'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />
                    {formatDate(selected.createdAt || selected.date)}
                  </span>
                </div>
              </div>

              <div className="p-8 max-h-96 overflow-y-auto border-t border-gray-500">
                <pre className="whitespace-pre-wrap text-white leading-relaxed font-sans">
                  {selected.details || 'No details available'}
                </pre>

                {/* Show images if available */}
                {selected.imageUrls && selected.imageUrls.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-white font-semibold mb-3">Attachments</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {selected.imageUrls.map((url, index) => (
                        <div key={index} className="bg-gray-800 rounded border border-gray-600 overflow-hidden">
                          <img
                            src={url}
                            alt={`Attachment ${index + 1}`}
                            className="w-full h-24 object-cover hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => window.open(url, '_blank')}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-full h-24 hidden items-center justify-center text-gray-400">
                            Failed to load image
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-8 py-4 flex justify-end border-t border-gray-500">
                <button
                  onClick={() => setSelected(null)}
                  className="px-6 py-2 border border-gray-600 text-white rounded-lg hover:bg-white hover:text-black transition-colors duration-200 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}