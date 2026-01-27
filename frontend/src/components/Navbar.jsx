import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { Bell, MessageCircle, Home, User } from "lucide-react";

const Navbar = ({ unreadCount = 0 }) => {
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch user & notifications
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await api.get("/users/me");
                setUser(userRes.data);

                const notifRes = await api.get("/notifications");
                setNotifications(notifRes.data.notifications || []);
            } catch (err) {
                console.error("Navbar fetch error:", err);
                setUser(null);
            }
        };
        fetchData();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const close = () => setShowDropdown(false);
        if (showDropdown) document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, [showDropdown]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setShowDropdown((prev) => !prev);
    };

    if (!user) return null;

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-gray-800 text-white p-3 flex justify-between items-center shadow-md sticky top-0 z-50">
            <div className="font-bold text-lg">
                <Link to="/home">MyApp</Link>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
                {/* Home Link */}
                <Link
                    to="/home"
                    className={`flex items-center gap-1 hover:text-gray-300 transition ${isActive('/home') ? 'text-indigo-300' : ''}`}
                >
                    <Home className="w-5 h-5" />
                    <span className="hidden sm:inline">Home</span>
                </Link>

                {/* Profile Link */}
                <Link
                    to={`/profile/${user.user_id}`}
                    className={`flex items-center gap-1 hover:text-gray-300 transition ${isActive(`/profile/${user.user_id}`) ? 'text-indigo-300' : ''}`}
                >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">Profile</span>
                </Link>

                {/* Messages Link */}
                <Link
                    to="/chats"
                    className={`flex items-center gap-1 hover:text-gray-300 transition ${isActive('/chats') ? 'text-indigo-300' : ''}`}
                >
                    <MessageCircle className="w-5 h-5" />
                    <span className="hidden sm:inline">Messages</span>
                </Link>

                {/* Notification Bell */}
                <div className="relative">
                    <button
                        onClick={toggleDropdown}
                        className="relative p-3 sm:p-2 hover:bg-gray-700 rounded-full transition"
                        aria-label="Notifications"
                    >
                        <Bell className="w-6 h-6" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-5 flex items-center justify-center px-1.5">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Responsive Dropdown */}
                    {showDropdown && (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="
                                fixed sm:absolute
                                top-[56px] sm:top-auto
                                left-0 sm:left-auto
                                right-0 sm:right-0
                                w-full sm:w-80
                                max-h-[calc(100vh-56px)] sm:max-h-[70vh]
                                bg-white
                                border-t sm:border
                                shadow-xl
                                z-50
                                overflow-y-auto
                            "
                        >
                            <div className="p-3 border-b bg-gray-50">
                                <h3 className="font-semibold text-gray-800">
                                    Notifications
                                </h3>
                            </div>

                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    No notifications yet
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.notification_id}
                                            className={`p-4 cursor-pointer transition active:bg-gray-100 ${!notif.is_read ? "bg-blue-50" : ""
                                                }`}
                                            onClick={() => {
                                                setShowDropdown(false);
                                                // Optional navigation logic
                                            }}
                                        >
                                            <div className="flex items-start gap-3">
                                                {notif.TriggerUser?.profilePic && (
                                                    <img
                                                        src={`http://localhost:5000${notif.TriggerUser.profilePic}`}
                                                        alt={notif.TriggerUser.name}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-900">
                                                        <span className="font-medium">
                                                            {notif.TriggerUser?.name || "Someone"}
                                                        </span>{" "}
                                                        {notif.content}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(notif.createdAt).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="bg-red-600 px-4 py-1.5 rounded hover:bg-red-700 transition text-sm font-medium"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;