import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, verify2FA } from "../redux/authSlice";
import toast from "react-hot-toast";
import { recordLogin } from "../redux/activitylogSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const passwordRef = useRef(null);

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [otp, setOtp] = useState("");
  const [requireOtp, setRequireOtp] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle OTP change
  const handleOtpChange = (e) => setOtp(e.target.value);

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!requireOtp) {
      if (!loginData.username) newErrors.username = "Username is required";
      if (!loginData.password) newErrors.password = "Password is required";
    } else {
      if (!otp) newErrors.otp = "OTP is required";
    }
    return newErrors;
  };

  // Handle submit
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
        // Login step
        const res = await dispatch(login(loginData));
        const payload = res?.payload;

        if (!payload) {
          toast.error("Unexpected error");
          setIsLoading(false);
          return;
        }

        if (payload?.require2FA) {
          setRequireOtp(true);
          toast.success("2FA required. Please enter your Authenticator code.");
        } else if (payload?.token && !payload?.require2FA) {
          toast.success("Login successful!"); try {
            await dispatch(recordLogin());
          } catch (err) {
            console.error("Activity log failed:", err);
          }
          navigate("/dashboard");
        } else {
          toast.error("Invalid response from server");
        }
      } else {
        // 2FA Verification
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
              navigate("/dashboard");
              break;
            case "Checker":
              navigate("/checker");
              break;
            case "User":
              navigate("/user");
              break;
            case "Team-Leader":
              navigate("/team");
              break;
            default:
              navigate("/login");
              toast.error("Invalid role detected");
              break;
          }
          try {
            await dispatch(recordLogin());
          } catch (err) {
            console.error("Activity log failed:", err);
          }
        } else {
          toast.error("Invalid OTP");
        }
      }
    } catch (err) {
      toast.error("Something went wrong");
    }

    setIsLoading(false);
  };

  // Handle back from OTP screen
  const handleBack = () => {
    setRequireOtp(false);
    setOtp("");
  };

  return (
    <div
      style={{
        backgroundImage:
          "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
      }}
      className="flex items-center justify-center min-h-screen bg-[hsl(220,30%,6%)] p-4"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center gap-4 rounded-2xl p-6 text-white max-w-md w-full border border-[var(--box-border)] bg-[#1b1f2786] shadow-[0_5px_15px_0_hsla(220,30%,5%,0.5),_0_15px_35px_-5px_hsla(220,25%,10%,0.08)] transition-all duration-500"
      >
        {/* Conditional heading */}
        <h1 className="text-2xl text-center font-bold mb-2">
          {requireOtp ? "Two-Factor Verification" : "Login Page"}
        </h1>

        {!requireOtp ? (
          // ---------------- LOGIN PAGE ----------------
          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              <label className="mb-2 text-base">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Username"
                className={`p-3 bg-gray-700 focus:outline-none rounded-lg ${errors.username ? "border-red-500" : "border-gray-300"
                  }`}
                value={loginData.username}
                onChange={handleInputChange}
              />
              {errors.username && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.username}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-base">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className={`p-3 bg-gray-700 focus:outline-none rounded-lg ${errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                ref={passwordRef}
                value={loginData.password}
                onChange={handleInputChange}
              />
              {errors.password && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.password}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all duration-300 mt-3"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </div>
        ) : (
          // ---------------- 2FA PAGE ----------------
          <div className="flex flex-col gap-3">
            <p className="text-center text-sm text-gray-300">
              Enter the 6-digit code from Google Authenticator
            </p>

            <label>Authenticator Code</label>
            <input
              type="text"
              name="otp"
              placeholder="Enter 6-digit code"
              maxLength={6}
              className={`p-3 bg-gray-700 focus:outline-none rounded-lg text-center text-lg tracking-widest ${errors.otp ? "border-red-500" : "border-gray-300"
                }`}
              value={otp}
              onChange={handleOtpChange}
            />
            {errors.otp && (
              <span className="text-red-500 text-sm mt-1">{errors.otp}</span>
            )}

            <div className="flex justify-between items-center text-sm mt-2">
              <button
                type="button"
                className="text-blue-400"
                onClick={handleBack}
              >
                Back
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all duration-300 mt-3"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify"}
            </button>

            <p className="text-xs text-gray-400 mt-2 text-center">
              First time here? After you log in the first time, show a QR to
              pair Google Authenticator. (Add server QR endpoint)
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;
