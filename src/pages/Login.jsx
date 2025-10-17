import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, verify2FA } from "../redux/authSlice"; // Don't forget verify2FA here
import toast from "react-hot-toast";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const passwordRef = useRef(null);
  const [requireOtp, setRequireOtp] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const validate = () => {
    const newErrors = {};
    if (!loginData.username) newErrors.username = "Username is required";
    if (!loginData.password) newErrors.password = "Password is required";
    if (requireOtp && !otp) newErrors.otp = "OTP is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (!requireOtp) {
        // Step 1: Username/Password login
        const res = await dispatch(login(loginData));
        const payload = res?.payload;

        if (!payload) {
          toast.error("Unexpected error");
          setIsLoading(false);
          return;
        }

        if (payload?.require2FA) {
          setRequireOtp(true);
          toast.success("OTP required. Please enter it.");
        } else if (payload?.token && !payload?.require2FA) {
          toast.success("Login successful!");
          navigate("/dashboard");
        } else {
        }
      } else {
        // Step 2: OTP verification
        const tempToken = localStorage.getItem("tempAuthToken");
        if (!tempToken) {
          toast.error("Session expired. Please login again.");
          setRequireOtp(false);
          setIsLoading(false);
          return;
        }

        const res = await dispatch(verify2FA({ otp }));
        const payload = res?.payload;

        if (payload?.token) {
          toast.success("Login successful!");
          const role = payload?.user?.role;
          if (role === "Checker") {
            navigate("/checker");
          } else if (role === "Team-Leader") {
            navigate("/dashboard");
          } else {
            navigate("/user")
          }
          // navigate("/user");//with otp 
        } else {
          toast.error("Invalid OTP");
        }
      }
    } catch (error) {
      toast.error("Something went wrong");
    }

    setIsLoading(false);
  };

  return (
    <div style={{ backgroundImage: "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))" }} className="flex items-center justify-center min-h-screen bg-[hsl(220,30%,6%)] p-4 ">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center gap-4 rounded-2xl p-6 text-white w-[450px] bg-[hsl(220,30%,6%)] shadow-[0_5px_15px_0_hsla(220,30%,5%,0.5),_0_15px_35px_-5px_hsla(220,25%,10%,0.08)] transition-all duration-500"
      >
        <h1 className="text-2xl text-center font-bold mb-2">Login Page</h1>

        {/* Username + Password */}
        <div
          className={`flex flex-col gap-4 transition-all duration-500 ${requireOtp ? "opacity-70" : "opacity-100"
            }`}
        >
          {/* Username field always visible */}
          <div className="flex flex-col">
            <input
              type="text"
              name="username"
              placeholder="Username"
              className={`p-2 border-b focus:outline-none bg-transparent ${errors.username ? "border-red-500" : "border-gray-300"
                }`}
              value={loginData.username}
              onChange={handleInputChange}
            />
            {errors.username && (
              <span className="text-red-500 text-sm mt-1">{errors.username}</span>
            )}
          </div>

          {/* Password field - hide when OTP required */}
          {!requireOtp && (
            <div className="flex flex-col transition-all duration-500">
              <input
                type="password"
                name="password"
                placeholder="Password"
                className={`p-2 border-b focus:outline-none bg-transparent ${errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                ref={passwordRef}
                value={loginData.password}
                onChange={handleInputChange}
              />
              {errors.password && (
                <span className="text-red-500 text-sm mt-1">{errors.password}</span>
              )}
            </div>
          )}

          <div
            className={`flex flex-col gap-2 mt-4 overflow-hidden transition-all duration-500 ${requireOtp ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <input
              type="text"
              name="otp"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className={`p-2 border-b focus:outline-none bg-transparent ${errors.otp ? "border-red-500" : "border-gray-300"
                }`}
              value={otp}
              onChange={handleOtpChange}
            />
            {errors.otp && (
              <span className="text-red-500 text-sm mt-1">{errors.otp}</span>
            )}
          </div>

          {/* Button: changes color + text */}
          <button
            type="submit"
            className={`w-full ${requireOtp
              ? "bg-green-700 hover:bg-green-800 focus:ring-green-300"
              : "bg-blue-700 hover:bg-blue-800 focus:ring-blue-300"
              } focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all duration-300`}
            disabled={isLoading}
          >
            {isLoading
              ? "Please wait..."
              : requireOtp
                ? "Verify OTP"
                : "Login"}
          </button>
        </div>

        {/* OTP input appears after Login */}

      </form>

    </div>
  );
};

export default Login;
