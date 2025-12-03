import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const RequireAuth = ({ allowedRoles }) => {
  const { isLoggedIn, role } = useSelector((state) => state.auth);
  const location = useLocation();

  // 🔥 FIX 1 — If logged in but role still empty, wait!
  if (isLoggedIn && !role) {
    return (
      <div className="text-white text-center p-10">
        Loading...
      </div>
    );
  }

  // 🚫 Not logged in → login page
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🔐 Check Role
  const hasRequiredRole = allowedRoles.includes(role);

  if (!hasRequiredRole) {
    return <Navigate to="/denied" state={{ from: location }} replace />;
  }

  // ✅ Authorized
  return <Outlet />;
};

export default RequireAuth;
