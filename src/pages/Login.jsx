import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, verify2FA } from "../redux/authSlice"; 
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
          switch (role) {
            case "Admin":
              navigate("/admin");
              break;
            case "Super-Admin":
            case "Team-Leader":
              navigate("/dashboard");
              break;
            case "Checker":
              navigate("/checker");
              break;
            case "User":
              navigate("/user");
              break;
            default:
              navigate("/login");
              toast.error("Invalid role detected");
              break;
          }

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
        className="flex flex-col justify-center gap-4 rounded-2xl p-6 text-white max-w-md w-full h-[400px] border border-[var(--box-border)] bg-[#1b1f2786] shadow-[0_5px_15px_0_hsla(220,30%,5%,0.5),_0_15px_35px_-5px_hsla(220,25%,10%,0.08)] transition-all duration-500"
      >
        <h1 className="text-2xl text-center font-bold mb-2">Login Page</h1>

        <div
          className={`flex flex-col gap-4 transition-all duration-500 ${requireOtp ? "opacity-70" : "opacity-100"
            }`}
        >
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

          <button
            type="submit"
            className={`w-full ${requireOtp
              ? "bg-green-700 hover:bg-green-800 focus:ring-green-300"
              : "bg-blue-700 hover:bg-blue-800 focus:ring-blue-300"
              } focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all duration-300`}
            disabled={isLoading}
          >
            {isLoading
              ? <svg
                aria-hidden="true"
                role="status"
                className="inline w-4 h-4 mr-3 text-white animate-spin ml-2"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentColor"
                />
              </svg>
              : requireOtp
                ? "Verify OTP"
                : "Login"}
          </button>
        </div>


      </form >

    </div >
  );
};

export default Login;
