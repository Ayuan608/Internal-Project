import { MailCheck, X, Paperclip, Clock, Send, Loader2, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { sendCaseMail } from '../../redux/statSlice';

function NewInternalMessage({ setModalOpen }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.stat);
  const fileInputRef = useRef(null);

  const [openModal, setOpenModal] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [specifyInput, setSpecifyInput] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    nature: "",
    content: "",
    priority: "Normal",
    recipientType: "",
    recipientId: "",
    labels: [],
  });

  const [errors, setErrors] = useState({});

  // CONSTANTS
  const RECIPIENT_OPTIONS = [
    { value: "Team-Leader", label: "Team Leader" },
    { value: "CSR-Department", label: "CSR Department" },
    { value: "Deposit-Department", label: "Deposit Department" },
    { value: "Withdrawal-Department", label: "Withdrawal Department" },
    { value: "Checker", label: "Checker" },
    { value: "Admin", label: "Admin" },
    { value: "Specify", label: "Specify (Individual)" },
  ];

 

  // HANDLERS
  const handleOpenModal = () => {
    setOpenModal(true);
    setModalOpen?.(true);
  };

  const handleCloseModal = () => {
    if (!loading) {
      setOpenModal(false);
      resetForm();
      setModalOpen?.(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleRecipientTypeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      recipientType: value,
      recipientId: "",
    }));
    setSpecifyInput("");
    setErrors(prev => ({ ...prev, recipientType: "", recipientId: "" }));
  };



  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (attachments.length + files.length > 5) {
      toast.error("Maximum 5 attachments allowed");
      return;
    }
    setAttachments(prev => [...prev, ...files]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.recipientType.trim()) {
      newErrors.recipientType = "Recipient type is required";
    }

    if (formData.recipientType === "Specify" && !specifyInput.trim()) {
      newErrors.recipientId = "Please specify recipient email or ID";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content cannot be empty";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const mailData = {
        title: formData.title,
        nature: formData.nature || "General Notice",
        content: formData.content,
        priority: formData.priority,
        labels: formData.labels,
        ...(formData.recipientType === "Specify"
          ? { recipientId: specifyInput }
          : { recipientType: formData.recipientType }),
      };

      await dispatch(sendCaseMail(mailData)).unwrap();
      toast.success("Case notice sent successfully");
      handleCloseModal();

    } catch (error) {
      toast.error(error?.message || "Failed to send case notice");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      nature: "",
      content: "",
      priority: "Normal",
      recipientType: "",
      recipientId: "",
      labels: [],
    });
    setSpecifyInput("");
    setAttachments([]);
    setErrors({});
  };

 

  return (
    <div>
      {/* TRIGGER BUTTON */}
      <button
        onClick={handleOpenModal}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-full shadow-lg bg-white/5 hover:bg-[#3b82f6] text-white"
      >
        <span>New Case</span>
        <MailCheck className="w-5 h-5" />
      </button>


      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-[rgba(59,130,246,0.03)] rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">

            {/* HEADER */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-[rgba(59,130,246,0.03)]">
              <div>
                <h2 className="text-xl font-semibold text-white">New Case Notice</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Send a new case notice to team members
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={loading}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* FORM CONTENT */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">

              {/* RECIPIENT TYPE */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Recipient Type <span className="text-red-400">*</span>
                </label>
                <select
                  name="recipientType"
                  value={formData.recipientType}
                  onChange={handleRecipientTypeChange}
                  className={`w-full px-3 py-2 bg-gray-900/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white ${errors.recipientType ? 'border-red-500' : 'border-gray-600'
                    }`}
                >
                  <option value="" className="bg-gray-900/50">Select recipient type</option>
                  {RECIPIENT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-gray-900/50">
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.recipientType && (
                  <p className="text-red-400 text-xs mt-1">{errors.recipientType}</p>
                )}
              </div>

              {/* SPECIFY RECIPIENT */}
              {formData.recipientType === "Specify" && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Recipient Email or ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={specifyInput}
                    onChange={(e) => {
                      setSpecifyInput(e.target.value);
                      setErrors(prev => ({ ...prev, recipientId: "" }));
                    }}
                    placeholder="user@example.com or user123"
                    className={`w-full px-3 py-2 bg-gray-900/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white ${errors.recipientId ? 'border-red-500' : 'border-gray-600'
                      }`}
                  />
                  {errors.recipientId && (
                    <p className="text-red-400 text-xs mt-1">{errors.recipientId}</p>
                  )}
                </div>
              )}

              {/* TITLE */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter case title..."
                  className={`w-full px-3 py-2 bg-gray-900/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white ${errors.title ? 'border-red-500' : 'border-gray-600'
                    }`}
                />
                {errors.title && (
                  <p className="text-red-400 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              {/* NATURE */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Nature <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="nature"
                  value={formData.nature}
                  onChange={handleChange}
                  placeholder="e.g., Warning, Leave, Attendance..."
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>

              {/* CONTENT */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Content <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Provide detailed case information..."
                  rows={5}
                  className={`w-full px-3 py-2 bg-gray-900/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-none ${errors.content ? 'border-red-500' : 'border-gray-600'
                    }`}
                />
                {errors.content && (
                  <p className="text-red-400 text-xs mt-1">{errors.content}</p>
                )}
              </div>

             
           

              {/* ATTACHMENTS */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Attachments <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 transition-colors text-gray-400 hover:text-blue-400"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    <span>Click to upload files (Max 5)</span>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                      >
                        <span className="text-sm text-gray-300 truncate flex-1">
                          {file.name}
                        </span>
                        <button
                          onClick={() => handleRemoveAttachment(index)}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 p-6  bg-gray-900/50/50">
              <button
                onClick={handleCloseModal}
                disabled={loading}
                className="px-6 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Case
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewInternalMessage;