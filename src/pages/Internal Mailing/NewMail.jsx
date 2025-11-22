import { MailCheck, X, Paperclip, Clock, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { sendCaseMail } from '../../redux/statSlice';

function NewInternalMessage() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.stat);

  const currentUserRole = useSelector((state) => state.auth?.role);

  const [openModal, setOpenModal] = useState(false);
  const [recipientType, setRecipientType] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    nature: "",
    content: "",
    priority: "normal",
  });

  const [errors, setErrors] = useState({});

  // ROLE-BASED RECIPIENT OPTIONS
  const getRecipientOptions = () => {
    switch (currentUserRole) {
      case "Team-Leader":
        return [
          { value: "Super-Admin", label: "Super Admin" },
          { value: "Admin", label: "Admin" },
        ];

      case "Admin":
        return [
          { value: "Super-Admin", label: "Super Admin" },
        ];

      case "Super-Admin":
        return [
          { value: "All-Team-Leaders", label: "All Team Leaders" },
          { value: "Team-Leaders-Dept", label: "Team Leaders (My Department)" },
          { value: "Admin", label: "Admin" },
          { value: "All-Users", label: "All Users" },
        ];

      default:
        return [];
    }
  };

  const recipientOptions = getRecipientOptions();

  // INPUT CHANGE HANDLER
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // VALIDATE FORM
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.nature.trim()) newErrors.nature = "Nature is required";
    if (!formData.content.trim()) newErrors.content = "Content cannot be empty";
    if (!recipientType) newErrors.recipientType = "Please select a recipient type";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const mailData = {
        title: formData.title,
        nature: formData.nature,
        content: formData.content,
        recipientType,   // 🔥 IMPORTANT → sending group mode
      };

      await dispatch(sendCaseMail(mailData)).unwrap();

      toast.success("Case notice sent successfully");
      resetForm();
      setOpenModal(false);

    } catch (error) {
      console.error("Error sending case:", error);
    }
  };

  // RESET FORM
  const resetForm = () => {
    setFormData({
      title: "",
      nature: "",
      content: "",
      priority: "normal",
    });
    setRecipientType("");
    setErrors({});
  };

  return (
    <div>
      <button
        onClick={() => setOpenModal(true)}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-full shadow-lg bg-white/5 hover:bg-[#3b82f6] text-white"
      >
        <span>New Case</span>
        <MailCheck className="w-5 h-5" />
      </button>

      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
             onClick={() => { if (!loading) setOpenModal(false); }}>
          
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[900px] max-h-[85vh] overflow-y-auto bg-[rgba(59,130,246,0.03)] text-white rounded-2xl shadow-xl border border-white/10"
          >
            {/* HEADER */}
            <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">New Case Notice</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Logged in as: <span className="text-blue-400">{currentUserRole}</span>
                </p>
              </div>
              <button
                onClick={() => setOpenModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BODY */}
            <div className="px-8 py-6">

              {/* RECIPIENT TYPE */}
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-300">Recipient Type *</label>
                <select 
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className={`w-full mt-2 rounded-lg px-4 py-2.5 bg-[rgba(59,130,246,0.03)] border 
                  ${errors.recipientType ? "border-red-500" : "border-white/10"}`}
                >
                  <option className='bg-slate-800' value="">Select recipient type</option>
                  {recipientOptions.map((opt) => (
                    <option  className='bg-slate-800' key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.recipientType && (
                  <p className="text-red-400 text-xs mt-1">{errors.recipientType}</p>
                )}
              </div>

              {/* TITLE */}
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-300">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Policy Violation"
                  className={`w-full mt-2 rounded-lg px-4 py-2.5 bg-[rgba(59,130,246,0.03)] border 
                  ${errors.title ? "border-red-500" : "border-white/10"}`}
                />
                {errors.title && (
                  <p className="text-red-400 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              {/* NATURE */}
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-300">Nature *</label>
                <select
                  name="nature"
                  value={formData.nature}
                  onChange={handleChange}
                  className={`w-full mt-2 rounded-lg px-4 py-2.5 bg-[rgba(59,130,246,0.03)] border 
                  ${errors.nature ? "border-red-500" : "border-white/10"}`}
                >
                  <option className='bg-slate-800' value="">Select nature</option>
                  <option className='bg-slate-800' value="Warning">Warning</option>
                  <option className='bg-slate-800' value="Violation">Violation</option>
                  <option className='bg-slate-800' value="Inquiry">Inquiry</option>
                  <option className='bg-slate-800' value="Notice">Notice</option>
                  <option className='bg-slate-800' value="Disciplinary Action">Disciplinary Action</option>
                  <option className='bg-slate-800' value="Compliance Issue">Compliance Issue</option>
                  <option className='bg-slate-800' value="Performance Review">Performance Review</option>
                  <option className='bg-slate-800' value="Other">Other</option>
                </select>
                {errors.nature && (
                  <p className="text-red-400 text-xs mt-1">{errors.nature}</p>
                )}
              </div>

              {/* CONTENT */}
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-300">Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Provide case details..."
                  className={`w-full h-40 mt-2 rounded-lg p-4 bg-[rgba(59,130,246,0.03)] backdrop-blur-md border 
                  ${errors.content ? "border-red-500" : "border-white/10"}`}
                ></textarea>
                {errors.content && (
                  <p className="text-red-400 text-xs mt-1">{errors.content}</p>
                )}
              </div>

              {/* PRIORITY */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: prev.priority === "normal" ? "urgent" : "normal",
                    }))
                  }
                  className={`px-4 py-2 rounded-lg text-sm flex gap-2 border 
                  ${formData.priority === "urgent"
                    ? "bg-orange-600/20 border-orange-500/50 text-orange-300"
                    : "border-white/10 text-gray-300"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  {formData.priority === "urgent" ? "Urgent Priority" : "Normal Priority"}
                </button>

                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-sm flex gap-2 border border-white/10 text-gray-300"
                >
                  <Paperclip className="w-4 h-4" />
                  Add Attachment
                </button>
              </div>

              {/* SUBMIT */}
              <div className="flex justify-end items-center gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-6 py-2.5 rounded-lg text-sm text-gray-300"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 rounded-lg text-sm font-medium"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Case Notice
                    </span>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewInternalMessage;
