import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Denied() {
    const navigate = useNavigate();
    const { role } = useSelector((state) => state.auth);

    const handleGoBack = () => {
        if (!role) {
            navigate(-1);
            return;
        }

        switch (role) {
            case "Super-Admin":
                navigate('/dashboard', { replace: true });
                break;
            case "Admin":
                navigate('/admin', { replace: true });
                break;
            case "User":
                navigate('/user', { replace: true });
                break;
            case "Checker":
                navigate('/checker', { replace: true });
                break;
            case "Team-Leader":
                navigate('/team', { replace: true });
                break;
            default:
                navigate(-1);
        }
    };

    return (
        <main className="h-screen w-full flex flex-col justify-center items-center bg-[#0B0C10]">
            <h1 className="text-9xl font-extrabold text-white tracking-widest">
                403
            </h1>
            <div className="bg-[#2d2d2e] text-white px-2 text-sm rounded rotate-12 absolute">
                Access Denied
            </div>
            <p className="text-gray-400 mt-8 text-center px-4 max-w-md">
                You don't have permission to access this page.
            </p>
            <button className="mt-8">
                <a className="relative inline-block text-sm font-medium text-[#FF6A3D] group focus:outline-none focus:ring">
                    <span className="absolute inset-0 transition-transform translate-x-0.5 translate-y-0.5 bg-[#FF6A3D] group-hover:translate-y-0 group-hover:translate-x-0" />
                    <span
                        onClick={handleGoBack}
                        className="relative block px-8 py-3 bg-[#2d2d2e] border border-current cursor-pointer"
                    >
                        Go to Dashboard
                    </span>
                </a>
            </button>
        </main>
    );
}

export default Denied;
