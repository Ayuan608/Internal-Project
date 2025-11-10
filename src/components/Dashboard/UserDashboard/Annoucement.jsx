import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, X, Upload, User, Calendar, Trash2, Filter, Image as ImageIcon, Edit, Eye } from "lucide-react";
import { fetchAllAnnouncements, createAnnouncement, clearError } from '../../../redux/announcementSlice';

export default function Announcement() {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(null);
  const [createAnnouncementModal, setCreateAnnouncementModal] = useState(false);
  const [imageModal, setImageModal] = useState({ open: false, images: [], currentIndex: 0 });
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    recipients: 'ALL',
    files: []
  });
  const [dragOver, setDragOver] = useState(false);

  const announcementsState = useSelector((state) => state.announcements);
  const {
    announcements = [],
    loading = false,
    error = null,
    createLoading = false
  } = announcementsState || {};

  const user = useSelector((state) => state.auth?.data);
  const role = useSelector((state) => state.auth?.data?.role);

  useEffect(() => {
    dispatch(fetchAllAnnouncements());
  }, [dispatch]);

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
        dispatch(fetchAllAnnouncements());
      }
    } catch (error) {
      console.error('Failed to create announcement:', error);
    }
  };

  const handleDeleteAnnouncement = async (e, announcementId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        // Add your delete API call here
        // await dispatch(deleteAnnouncement(announcementId)).unwrap();
        console.log('Deleting announcement:', announcementId);
        dispatch(fetchAllAnnouncements());
      } catch (error) {
        console.error('Failed to delete announcement:', error);
      }
    }
  };

  const handleEditAnnouncement = (e, announcement) => {
    e.stopPropagation();
    // Add your edit logic here
    console.log('Edit announcement:', announcement);
  };

  const openImageModal = (images, index = 0) => {
    setImageModal({ open: true, images, currentIndex: index });
  };

  const closeImageModal = () => {
    setImageModal({ open: false, images: [], currentIndex: 0 });
  };

  const nextImage = () => {
    setImageModal(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length
    }));
  };

  const prevImage = () => {
    setImageModal(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
    }));
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

  const filterAnnouncementsByDate = (announcements) => {
    if (!announcements) return [];

    const now = new Date();

    return announcements.filter(announcement => {
      const announcementDate = new Date(announcement.createdAt || announcement.date);

      switch (dateFilter) {
        case 'today':
          return announcementDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return announcementDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return announcementDate >= monthAgo;
        case 'custom':
          if (!customDateRange.start || !customDateRange.end) return true;
          const start = new Date(customDateRange.start);
          const end = new Date(customDateRange.end);
          return announcementDate >= start && announcementDate <= end;
        default:
          return true;
      }
    });
  };

  const filteredAnnouncements = filterAnnouncementsByDate(announcements);

  if (loading) {
    return (
      <div className="min-h-screen px-2 mt-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-white">Loading announcements...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-2 mt-4">
      <div className="w-full mx-auto">
        <div className="flex justify-between items-center mb-6 pb-4">

          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              Announcements
            </h1>
            <p className="text-gray-400">
              Create and manage company-wide announcements
            </p>
          </div>

          {(role === 'Admin' || role === 'Super-Admin') && (
            <button
              onClick={() => setCreateAnnouncementModal(true)}
              className="bg-[#3b82f6] flex items-center gap-2 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/50"
            >
              <Plus size={20} /> Create Announcement
            </button>
          )}
        </div>

        {/* Date Filter Section */}
        <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={18} className="text-blue-400" />
            <h3 className="text-white font-medium">Filter by Date</h3>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${dateFilter === 'all'
                ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/30'
                : 'bg-[rgba(59,130,246,0.03)] border border-slate-800 text-gray-300 hover:bg-gray-800/40'
                }`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${dateFilter === 'today'
                ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/30'
                : 'bg-[rgba(59,130,246,0.03)] border border-slate-800 text-gray-300 hover:bg-gray-800/40'
                }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${dateFilter === 'week'
                ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/30'
                : 'bg-[rgba(59,130,246,0.03)] border border-slate-800 text-gray-300 hover:bg-gray-800/40'
                }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${dateFilter === 'month'
                ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/30'
                : 'bg-[rgba(59,130,246,0.03)] border border-slate-800 text-gray-300 hover:bg-gray-800/40'
                }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateFilter('custom')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${dateFilter === 'custom'
                ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/30'
                : 'bg-[rgba(59,130,246,0.03)] border border-slate-800 text-gray-300 hover:bg-gray-800/40'
                }`}
            >
              Custom Range
            </button>
          </div>

          {dateFilter === 'custom' && (
            <div className="flex gap-3 mt-3">
              <div className="flex-1">
                <label className="block text-gray-400 text-sm mb-1">Start Date</label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-400 text-sm mb-1">End Date</label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div className="mt-3 text-sm text-gray-400">
            Showing {filteredAnnouncements.length} of {announcements.length} announcements
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-400">Error: {error}</p>
            <button
              onClick={() => dispatch(clearError())}
              className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Announcements Grid */}
        <div className="gap-4 grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
          {!filteredAnnouncements || filteredAnnouncements.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-lg">No announcements found</div>
              <div className="text-gray-500 text-sm mt-2">
                {dateFilter !== 'all'
                  ? 'Try changing your filter settings'
                  : role === 'Admin' || role === 'Super-Admin'
                    ? 'Create your first announcement to get started'
                    : 'No announcements have been posted yet'
                }
              </div>
            </div>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <div
                key={announcement._id || announcement.id}
                className="relative text-white rounded-xl bg-[rgba(59,130,246,0.03)] shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-800  overflow-hidden group cursor-pointer flex flex-col justify-between h-full"
                onMouseEnter={() => setHoveredCard(announcement._id || announcement.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Action Buttons - Show on Hover (Top Right) */}
                {(role === 'Admin' || role === 'Super-Admin') && hoveredCard === (announcement._id || announcement.id) && (
                  <div className="absolute top-3 right-3 flex gap-2 z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={(e) => handleEditAnnouncement(e, announcement)}
                      className="p-2 bg-blue-600 text-white rounded-lg transition-all shadow-lg hover:shadow-blue-500/50 hover:bg-blue-700"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteAnnouncement(e, announcement._id || announcement.id)}
                      className="p-2 bg-red-600 text-white rounded-lg transition-all shadow-lg hover:shadow-red-500/50 hover:bg-red-700"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}

                {/* --- CARD CONTENT --- */}
                <div className="flex flex-col justify-between h-full p-5">
                  <div>
                    {/* Title */}
                    <h2 className="text-lg font-bold text-white mb-3 line-clamp-2 pr-16">
                      {announcement.title || 'No Title'}
                    </h2>

                    {/* Author and Date */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <User size={14} className="text-blue-400 flex-shrink-0" />
                        <span className="truncate">{announcement.createdBy || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar size={14} className="text-blue-400 flex-shrink-0" />
                        <span className="truncate">{formatDate(announcement.createdAt || announcement.date)}</span>
                      </div>
                    </div>

                    {/* Details Preview */}
                    <p className="text-gray-300 text-sm line-clamp-3 mb-4 leading-relaxed">
                      {announcement.details ? announcement.details : 'No details available'}
                    </p>

                    {/* Image preview */}
                    {announcement.imageUrls && announcement.imageUrls.length > 0 && (
                      <div className="mb-4 grid grid-cols-3 gap-2">
                        {announcement.imageUrls.slice(0, 2).map((url, index) => (
                          <div
                            key={index}
                            className="h-16 bg-gray-700 rounded-lg border-2 border-gray-600 overflow-hidden cursor-pointer hover:border-blue-500 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              openImageModal(announcement.imageUrls, index);
                            }}
                          >
                            <img
                              src={url}
                              alt={`Attachment ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-110 transition-transform"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-full hidden items-center justify-center text-xs text-gray-400">
                              <ImageIcon size={20} />
                            </div>
                          </div>
                        ))}
                        {announcement.imageUrls.length > 2 && (
                          <div
                            className="h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg border-2 border-blue-500 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition-transform shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              openImageModal(announcement.imageUrls, 2);
                            }}
                          >
                            +{announcement.imageUrls.length - 2}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* --- View Details Button --- */}
                  <button
                    onClick={() => setSelected(announcement)}
                    className="mt-auto w-full px-4 py-2.5 bg-[#3b82f6] text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-[#3b82f6]/50 hover:bg-[#3b83f6de] font-medium flex items-center justify-center gap-2"
                  >
                    <Eye size={18} />
                    View Details
                  </button>
                </div>
              </div>

            ))
          )}
        </div>

        {/* Image Modal */}
        {imageModal.open && (
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={closeImageModal}
          >
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors bg-gray-800/80 rounded-full p-3 hover:bg-gray-700 z-10"
            >
              <X size={28} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 text-white hover:text-blue-400 transition-colors bg-gray-800/80 rounded-full p-3 hover:bg-gray-700 text-3xl font-bold"
            >
              ‹
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 text-white hover:text-blue-400 transition-colors bg-gray-800/80 rounded-full p-3 hover:bg-gray-700 text-3xl font-bold"
            >
              ›
            </button>

            <div
              className="max-w-6xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={imageModal.images[imageModal.currentIndex]}
                alt={`Image ${imageModal.currentIndex + 1}`}
                className="w-full h-full object-contain rounded-lg shadow-2xl"
              />
              <div className="text-center text-white mt-4 text-lg font-medium bg-gray-800/50 rounded-lg py-2">
                {imageModal.currentIndex + 1} / {imageModal.images.length}
              </div>

              {/* Thumbnail Grid */}
              <div className="grid grid-cols-6 gap-3 mt-4 max-h-32 overflow-y-auto p-2 bg-gray-900/50 rounded-lg">
                {imageModal.images.map((url, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${index === imageModal.currentIndex
                      ? 'border-blue-500 shadow-lg shadow-blue-500/50 scale-105'
                      : 'border-gray-600 hover:border-blue-400'
                      }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageModal(prev => ({ ...prev, currentIndex: index }));
                    }}
                  >
                    <img
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Announcement Modal */}
        {createAnnouncementModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-md"
            onClick={() => setCreateAnnouncementModal(false)}
          >
            <div
              className="bg-slate-900/50 backdrop-blur-md rounded-2xl w-full max-w-2xl border-2 border-gray-800/30 shadow-2xl overflow-hidden transform transition-all max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4  flex justify-between items-center bg-slate-900/50flex-shrink-0">
                <h2 className="text-2xl font-bold text-white">
                  Create Announcement
                </h2>
                <button
                  onClick={() => setCreateAnnouncementModal(false)}
                  className="text-gray-400 hover:text-white transition-colors hover:bg-gray-700 rounded-full p-1"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-8 overflow-y-auto flex-1 space-y-6">
                  <div>
                    <label className="block text-white mb-2 font-medium">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-[rgba(59,130,246,0.03)] text-white border-2 border-gray-800/30 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
                      placeholder="Enter announcement title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-medium">Details *</label>
                    <textarea
                      name="details"
                      value={formData.details}
                      onChange={handleInputChange}
                      rows="6"
                      className="w-full px-4 py-2.5 bg-[rgba(59,130,246,0.03)] text-white border-2 border-gray-800/30 rounded-lg focus:outline-none focus:border-blue-500 transition-all resize-none"
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
                      className="w-full px-4 py-2.5 bg-[rgba(59,130,246,0.03)] text-white border-2 border-gray-800/50 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
                    >
                      <option className='bg-slate-900 ' value="ALL">All Members</option>
                      <option className='bg-slate-900 ' value="Team Leader">All Team Leader</option>
                      <option className='bg-slate-900 ' value="CSR">CSR Department</option>
                      <option className='bg-slate-900 ' value="Deposit">Deposit Department</option>
                      <option className='bg-slate-900 ' value="Withdrawal">Withdrawal Department</option>
                      <option className='bg-slate-900 ' value="Marketing">Marketing Department</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-medium">Upload Media/File</label>

                    {formData.files.length > 0 && (
                      <div className="mb-3 space-y-2 max-h-32 overflow-y-auto">
                        {formData.files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-700 px-4 py-2.5 rounded-lg border border-gray-600">
                            <span className="text-gray-300 text-sm truncate flex-1">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded p-1 transition-all ml-2"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${dragOver
                        ? 'border-blue-500 bg-[rgba(59,130,246,0.03)] shadow-lg shadow-blue-500/30'
                        : 'border-gray-600 hover:border-blue-400 hover:bg-gray-700/30'
                        }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('file-upload').click()}
                    >
                      <Upload className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                      <p className="text-gray-300 font-medium">Click to upload or drag and drop</p>
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

                <div className="px-8 py-3 flex justify-end gap-3  bg-gray-900/50 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setCreateAnnouncementModal(false)}
                    className="px-6 py-2.5 border-2 border-gray-600 text-white rounded-lg hover:bg-gray-800/30 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-blue-500/50"
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
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-md"
            onClick={() => setSelected(null)}
          >
            <div
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl w-full max-w-3xl border-2 border-blue-500/30 shadow-2xl overflow-hidden transform transition-all max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-8 py-6 bg-gray-800/50 border-b-2 border-gray-700 flex-shrink-0">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selected.title || 'No Title'}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <User size={16} className="text-blue-400" />
                    {selected.createdBy || 'Unknown'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={16} className="text-blue-400" />
                    {formatDate(selected.createdAt || selected.date)}
                  </span>
                </div>
              </div>

              <div className="p-8 overflow-y-auto flex-1">
                <pre className="whitespace-pre-wrap text-white leading-relaxed font-sans">
                  {selected.details || 'No details available'}
                </pre>

                {selected.imageUrls && selected.imageUrls.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <ImageIcon size={20} className="text-blue-400" />
                      Attachments ({selected.imageUrls.length})
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                      {selected.imageUrls.map((url, index) => (
                        <div
                          key={index}
                          className="bg-gray-700 rounded-lg border-2 border-gray-600 overflow-hidden hover:border-blue-500 transition-all cursor-pointer"
                          onClick={() => openImageModal(selected.imageUrls, index)}
                        >
                          <img
                            src={url}
                            alt={`Attachment ${index + 1}`}
                            className="w-full h-24 object-cover hover:scale-110 transition-transform"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-full h-24 hidden items-center justify-center text-gray-400">
                            <ImageIcon size={32} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-8 py-4 flex justify-end border-t-2 border-gray-700 bg-gray-800/50 flex-shrink-0">
                <button
                  onClick={() => setSelected(null)}
                  className="px-6 py-2.5 border-2 border-gray-600 text-white rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-200 font-medium"
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