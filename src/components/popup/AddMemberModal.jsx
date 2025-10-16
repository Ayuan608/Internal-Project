import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

const AddMemberModal = ({ isOpen, onClose, onSave }) => {
  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "CSR",
    department: "Customer Service",
    dateHired: "",
    hours: "8h",
    quota: "1000",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-[#ffffff0d] backdrop-blur-md border border-gray-700 text-white w-full max-w-md rounded-lg p-6 relative shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Add Member</h2>

        <div className="space-y-4">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full bg-transparent border border-gray-600 text-white rounded px-3 py-2 placeholder-gray-400"
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full text-white border border-gray-600 rounded px-3 py-2"
          >
            <option className="bg-[#1f2937] text-white" value="CSR">
              CSR
            </option>
            <option className="bg-[#1f2937] text-white" value="Team Lead">
              Team Lead
            </option>
          </select>

          <input
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="Department"
            className="w-full bg-transparent border border-gray-600 text-white rounded px-3 py-2 placeholder-gray-400"
          />

          <input
            type="date"
            name="dateHired"
            value={formData.dateHired}
            onChange={handleChange}
            className="w-full text-white border border-gray-600 rounded px-3 py-2 placeholder-gray-400 appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg fill='white' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z'/%3E%3Cpath d='M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.75rem center",
              backgroundSize: "1.25rem",
            }}
          />

          <input
            name="hours"
            value={formData.hours}
            onChange={handleChange}
            placeholder="Working Hours"
            className="w-full bg-transparent border border-gray-600 text-white rounded px-3 py-2 placeholder-gray-400"
          />

          <input
            name="quota"
            value={formData.quota}
            onChange={handleChange}
            placeholder="Quota"
            className="w-full bg-transparent border border-gray-600 text-white rounded px-3 py-2 text-center font-mono placeholder-gray-400"
          />

          <button
            onClick={handleSubmit}
            className="bg-white text-black font-semibold px-4 py-2 rounded w-full"
          >
            Save Member
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
