import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { changePassword } from "../../redux/authSlice";

const ChangePassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [userPassword, setUserPassword] = useState({
        oldPassword: "",
        newPassword: "",
    });

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setUserPassword({
            ...userPassword,
            [name]: value,
        });
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        if (!userPassword.oldPassword || !userPassword.newPassword) {
            toast.error("All fields are mandatory");
            return;
        }

        if (
            !userPassword.newPassword.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/)
        ) {
            toast.error(
                "Minimum password length should be 6 with Uppercase, Lowercase, Number and Symbol"
            );
            return;
        }

        const res = await dispatch(changePassword(userPassword));

        // clearing the input fields
        setUserPassword({
            oldPassword: "",
            newPassword: "",
        });

        if (res.payload.success) navigate("/dashboard");
    };

    return (
        <div className="min-h-screen  flex items-center justify-center ">
        <div className="text-white p-8 rounded-2xl shadow-lg bg-[#1f1f1f] w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-white mb-6">Change Password</h2>
  
          <form noValidate onSubmit={handleFormSubmit} className="space-y-5">
            <div>
              <label htmlFor="oldPassword" className="block text-sm font-medium ">
                Old Password
              </label>
              <input
                type="password"
                name="oldPassword"
                id="oldPassword"
                required
                placeholder="Enter your old password"
                value={userPassword.oldPassword}
                onChange={handlePasswordChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
  
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium ">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                required
                placeholder="Enter your new password"
                value={userPassword.newPassword}
                onChange={handlePasswordChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
  
            <div className="flex justify-center text-sm text-blue-600 hover:underline cursor-pointer">
              <Link to="/dashboard" className="flex items-center gap-1">
                <AiOutlineArrowLeft />
                Back to Profile
              </Link>
            </div>
  
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition-all duration-300"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    );
};

export default ChangePassword;