import React, { useState } from "react";
import { LogOut, Pencil } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, updateProfile, getUserData } from "../redux/authSlice";
import toast from "react-hot-toast";

function UserMenu({ openUser, userData }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [previewImage, setImagePreview] = useState("");

  if (!openUser) return null;

  const handleLogout = async (event) => {
    event.preventDefault();
    const res = await dispatch(logout());
    if (res?.payload?.success) navigate("/");
  };

  const getImage = async (event) => {
    event.preventDefault();
    const uploadedImage = event.target.files[0];

    if (uploadedImage) {
      // preview
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadedImage);
      fileReader.addEventListener("load", function () {
        setImagePreview(this.result);
      });

      const formData = new FormData();
      formData.append("avatar", uploadedImage);

      try {
        await dispatch(updateProfile([userData?._id, formData]));
        await dispatch(getUserData());
        toast.success("Profile updated successfully!");
      } catch (err) {
        toast.error("Failed to update profile");
      }
    }
  };

  return (
    <div className="absolute bottom-full -left-16 mt-2 w-56 rounded-xl bg-[#1e1f25]/80 backdrop-blur-md border border-[#2e2f35] shadow-2xl z-[9999] text-gray-300 text-sm font-medium p-4">
      <div className="flex flex-col items-center">
        <div className="relative">
          <img
            src={previewImage || userData?.avatar?.url}
            alt="Avatar"
            className="w-20 h-20 rounded-full border border-gray-600 object-cover"
          />

          {/* Button with hidden input */}
          <label className="absolute bottom-0 right-0 bg-[#1e1f25]/80 text-xs p-1 rounded-md text-white shadow cursor-pointer">
            <Pencil size={16} />
            <input
              onChange={getImage}
              className="hidden"
              type="file"
              id="image_uploads"
              name="image_uploads"
              accept=".jpg, .jpeg, .png"
            />
          </label>
        </div>

        <h2 className="mt-2 text-lg font-semibold capitalize text-white">
          {userData.FullName}
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          CC ID:{" "}
          {userData?._id ? userData._id.replace(/\D/g, "").slice(0, 5) : "8513"}
        </p>
      </div>

      <div className="border-t border-[#2e2f35] my-3"></div>

      <div className="space-y-2 text-white text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Username -</span>
          <span className="font-medium">@{userData?.username}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Department -</span>
          <span className="font-medium">{userData?.department}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Shift -</span>
          <span className="font-medium">{userData?.Shift}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Status -</span>
          <span className="font-medium capitalize">{userData?.status}</span>
        </div>

      </div>

      <div className="border-t border-[#2e2f35] my-3"></div>

      <button
        onClick={handleLogout}
        className="w-full py-2 cursor-pointer text-left hover:bg-[#2a2b31] flex items-center gap-2 text-red-400 rounded-md px-2"
      >
        <LogOut size={16} /> Sign out
      </button>
    </div>
  );
}

export default UserMenu;
