import { ArrowRight, Eye, EyeOff, Lock, LogOut, Trash2, TriangleAlert, User } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { changePassword, getUserData, logout, updateProfile } from "../redux/authSlice";
import { Link } from "react-router-dom";

function Setting() {
    const dispatch = useDispatch()
    const [twoFA, setTwoFA] = useState(true);
    const [previewImage, setImagePreview] = useState("");
    const [userPassword, setUserPassword] = useState({
        currentPassword: "",
        newPassword: "",
    });
    const [showcurrentPassword, setShowcurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [data, setData] = useState({
        name: "",
        avatar: undefined,
        userID: useSelector((state) => state?.auth?.data?._id),
    });
    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setUserPassword({
            ...userPassword,
            [name]: value,
        });
    };
    const handleLogoutSession = async (event) => {
        event.preventDefault();
        const res = await dispatch(logout());
        if (res?.payload?.success) navigate("/");
    };
    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' };

        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        score = Object.values(checks).filter(Boolean).length;

        if (score <= 2) {
            return { strength: score, label: 'Weak', color: 'bg-red-500' };
        } else if (score <= 3) {
            return { strength: score, label: 'Medium', color: 'bg-yellow-500' };
        } else {
            return { strength: score, label: 'Strong', color: 'bg-green-500' };
        }
    };

    const passwordStrength = getPasswordStrength(userPassword.currentPassword)

    const getImage = (event) => {
        event.preventDefault();
        const uploadedImage = event.target.files[0];

        if (uploadedImage) {
            setData({
                ...data,
                avatar: uploadedImage,
            });
            const fileReader = new FileReader();
            fileReader.readAsDataURL(uploadedImage);
            fileReader.addEventListener("load", function () {
                setImagePreview(this.result);
            });
        }
    };

    const setName = (event) => {
        const { name, value } = event.target;
        const newUserData = { ...data, [name]: value };
        setData(newUserData);
    };

    const handleUpdateProfile = async (event) => {
        event.preventDefault();


        if (!data.name || !data.avatar) {
            toast.error("All fields are mandatory");
            return;
        }
        if (data.name.length < 5) {
            toast.error("Name should have more than 5 characters");
            return;
        }

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("avatar", data.avatar);

        const newUserData = [data.userID, formData];

        await dispatch(updateProfile(newUserData));

        await dispatch(getUserData());

    };
    const handleUpdatePassword = async (event) => {
        event.preventDefault();
        if (!userPassword.currentPassword || !userPassword.newPassword) {
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
        setUserPassword({
            currentPassword: "",
            newPassword: "",
        });
    }

    return (
        <div className="h-screen  text-base-content p-6 flex flex-col gap-6">
            <h2 className="text-[18px] dark:text-white text-black tracking-wide font-semibold">User settings</h2>
            <div className="bg-[#9696a814] border dark:border-gray-700 border-[#9696a831] rounded-lg p-6  flex items-center justify-between">
                <div>
                    <h1 className="dark:text-white text-black text-lg font-medium">Account settings</h1>
                    <p className="text-[#9696a8f0] text-sm">
                        Configure credentials, secrets, and more in account settings.
                    </p>
                </div>

                <button className="bg-[#3B82F6] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-full flex items-center gap-2 transition">
                    Account Settings <ArrowRight size={18} />
                </button>
            </div>
            <div className="bg-[#9696a814] border dark:border-[#9696a814] border-[#9696a831] rounded-lg p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <span className="flex gap-1 text-black dark:text-white"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="icon-md h-8 w-8 text-icon-default translate-z shrink-0" role="img"><g id="passcode-lock-outline-icon"><path id="Icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M22 11V8.2C22 7.0799 22 6.51984 21.782 6.09202C21.5903 5.71569 21.2843 5.40973 20.908 5.21799C20.4802 5 19.9201 5 18.8 5H5.2C4.0799 5 3.51984 5 3.09202 5.21799C2.71569 5.40973 2.40973 5.71569 2.21799 6.09202C2 6.51984 2 7.0799 2 8.2V11.8C2 12.9201 2 13.4802 2.21799 13.908C2.40973 14.2843 2.71569 14.5903 3.09202 14.782C3.51984 15 4.0799 15 5.2 15H11M12 10H12.005M17 10H17.005M7 10H7.005M19.25 17V15.25C19.25 14.2835 18.4665 13.5 17.5 13.5C16.5335 13.5 15.75 14.2835 15.75 15.25V17M12.25 10C12.25 10.1381 12.1381 10.25 12 10.25C11.8619 10.25 11.75 10.1381 11.75 10C11.75 9.86193 11.8619 9.75 12 9.75C12.1381 9.75 12.25 9.86193 12.25 10ZM17.25 10C17.25 10.1381 17.1381 10.25 17 10.25C16.8619 10.25 16.75 10.1381 16.75 10C16.75 9.86193 16.8619 9.75 17 9.75C17.1381 9.75 17.25 9.86193 17.25 10ZM7.25 10C7.25 10.1381 7.13807 10.25 7 10.25C6.86193 10.25 6.75 10.1381 6.75 10C6.75 9.86193 6.86193 9.75 7 9.75C7.13807 9.75 7.25 9.86193 7.25 10ZM15.6 21H19.4C19.9601 21 20.2401 21 20.454 20.891C20.6422 20.7951 20.7951 20.6422 20.891 20.454C21 20.2401 21 19.9601 21 19.4V18.6C21 18.0399 21 17.7599 20.891 17.546C20.7951 17.3578 20.6422 17.2049 20.454 17.109C20.2401 17 19.9601 17 19.4 17H15.6C15.0399 17 14.7599 17 14.546 17.109C14.3578 17.2049 14.2049 17.3578 14.109 17.546C14 17.7599 14 18.0399 14 18.6V19.4C14 19.9601 14 20.2401 14.109 20.454C14.2049 20.6422 14.3578 20.7951 14.546 20.891C14.7599 21 15.0399 21 15.6 21Z"></path></g></svg> Enable two-factor authentication</span>
                    <input
                        type="checkbox"
                        className="toggle toggle-info"
                        checked={twoFA}
                        onChange={() => setTwoFA(!twoFA)}
                    />
                </div>
                <p className="text-black dark:text-white">Two-factor authentication increases the security of your account by requiring a one-time password in addition to your password to log in.</p>
            </div>
            <form noValidate onSubmit={handleUpdateProfile} className="bg-[#9696a814] border border-[#9696a814] rounded-lg p-6 shadow-md ">
                <h2 className="text-black dark:text-white text-lg font-medium mb-4">About you</h2>

                <div className="flex items-center gap-4 mb-6">
                    <label className="cursor-pointer" htmlFor="image_uploads">
                        {previewImage ? (
                            <img
                                className="w-28 h-28 rounded-full m-auto"
                                src={previewImage}
                                alt="preview image"
                            />
                        ) : (
                            <User className="w-28 text-black dark:text-white h-28 rounded-full m-auto" />
                        )}
                    </label>
                    <input
                        onChange={getImage}
                        className="hidden"
                        type="file"
                        id="image_uploads"
                        name="image_uploads"
                        accept=".jpg, .jpeg, .png"
                    />
                    <div>
                        <p className="dark:text-white text-black font-medium text-sm">If you have <Link to={"https://gravatar.com"} className="text-[#3B82F6]">Gravatar</Link>  set for infotech8513@gmail.com it will be displayed in absence of uploaded avatar. You can upload and remove your own avatar to Techlance.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 ">
                    <div>
                        <label className="dark:text-gray-400  text-black font-medium  text-[16px]">First name</label>
                        <input
                            required
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Enter your full name"
                            value={data.name}
                            onChange={setName}

                            className="w-full mt-1 bg-transparent border border-[#9696a862] text-gray-800   placeholder-gray-500 rounded-lg px-4 py-2 dark:text-white dark:border-gray-500 dark:placeholder-gray-400  focus:outline-none focus:ring-blue-500"
                        />


                    </div>
                </div>

                <div className="flex justify-end ">
                    <button type="submit" className="bg-[#3B82F6] disabled:cursor-not-allowed hover:bg-[#1e66d8] text-white px-5 py-2 rounded-full transition">
                        Save
                    </button>
                </div>
                <div>

                </div>
            </form>
            <form onSubmit={handleUpdatePassword} className="bg-[#9696a814] border dark:b   order-[#9696a814] border-[#9696a831]  rounded-lg p-6  flex flex-col  gap-4">
                <div className="flex items-center gap-3">
                    <Lock className="dark:text-gray-400  text-black" size={24} />
                    <h2 className="dark:text-white  text-black text-xl font-medium">Change Password</h2>
                </div>
                <div className="space-y-4">
                    <div className="relative">
                        <input
                            required
                            type={showcurrentPassword ? "text" : "password"}
                            name="currentPassword"
                            id="currentPassword"
                            placeholder="Enter your old password"
                            value={userPassword.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full bg-transparent border border-[#9696a831]  rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowcurrentPassword(!showcurrentPassword)}
                            className="absolute right-3 top-2.5 dark:text-gray-400 text-[#9696a86a]  hover:text-gray-300 transition-colors"
                        >
                            {showcurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>

                    </div>
                    {userPassword && (
                        <div className="space-y-2">
                            <div className="flex gap-0.5 red items-center">
                                <span className="dark:text-gray-300 text-black text-sm">Password Strength</span>
                                <span className={`text-sm font-medium ${passwordStrength.label === 'Weak' ? 'text-red-400' :
                                    passwordStrength.label === 'Medium' ? 'text-yellow-400' :
                                        'text-green-400'
                                    }`}>
                                </span>
                                {[1, 2, 3].map((level) => (
                                    <div
                                        key={level}
                                        className={`h-1.5 w-[20px] flex redus ${level <= passwordStrength.strength
                                            ? passwordStrength.color
                                            : 'bg-gray-600'
                                            } transition-colors duration-300`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="relative">
                        <input
                            required
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            id="newPassword"
                            placeholder="Enter your new password"
                            value={userPassword.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full bg-transparent border border-[#9696a831]   rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-2.5 dark:text-gray-400 text-[#9696a874]  hover:text-gray-300 transition-colors"
                        >
                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>


                <div type='submit' className="flex justify-end">
                    <button disabled={!userPassword.currentPassword || !userPassword.newPassword} className="bg-[#3B82F6] disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-[#1e66d8] text-white px-5 py-2 rounded-full transition">
                        Update Password
                    </button>
                </div>
            </form>
            <div class="p-6 border border-[#9696a857] rounded-md   text-white mb-10">
                <h3 class="text-lg font-medium flex items-center gap-1 text-black dark:text-white">
                    <TriangleAlert size={20} className="text-red-500" />
                    Custom Danger Zone
                </h3>
                <p class="text-sm text-gray-400 mb-4">This is your custom irreversible action section.</p>
                <div className="p-4 mb-3 border border-[#9696a84d] rounded-md ">
                    <div>
                        <h4 className="dark:text-white text-[#9696a8c8]  font-semibold text-base mb-1 flex gap-1 items-center">
                            <LogOut /> Log out of other sessions
                        </h4>
                        <p className="text-sm text-gray-400">
                            Clear all your active user sessions. This will log you out of all other devices and browsers, except this one.
                        </p>
                    </div>

                    <div onClick={handleLogoutSession} className=" border-[#9696a850] mt-4  flex justify-end">
                        <button  className="bg-[#ba111d] cursor-pointer hover:bg-[#ff2300] text-white font-base py-1.5 px-4 rounded-md text-sm">
                            Log Out of Other Sessions
                        </button>
                    </div>
                </div>


                <div class="p-4 border dark:border-[#9696a814] border-[#9696a841]  rounded-md flex items-center justify-between ">
                    <div>
                        <h4 class="text-white font-semibold text-base mb-1 flex gap-1 items-center">
                            <Trash2 size={20} /> Delete your account
                        </h4>
                        <p class="text-sm text-gray-400">Delete your personal account, projects, and activity.</p>
                    </div>
                    <button class="bg-[#3B82F6] hover:bg-[#2b74eb] cursor-pointer gap-1 flex text-white font-semibold py-1.5 px-2 rounded-md text-sm ml-4">
                        Start <ArrowRight size={18} />
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Setting;
