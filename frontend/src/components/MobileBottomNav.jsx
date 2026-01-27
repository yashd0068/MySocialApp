import { Home, Search, PlusSquare, User, MessageCircle } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const MobileBottomNav = ({ user, onCreate, onChat, isChatOpen = false }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Hide if chat modal is open (on mobile)
    if (isChatOpen && window.innerWidth < 768) {
        return null;
    }

    const isOnHome = location.pathname === "/home";
    const isOnChats = location.pathname === "/chats";

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-md flex justify-around items-center h-14 lg:hidden">
            {/* Home Button */}
            <Link
                to={isOnHome ? `/profile/${user.user_id}` : "/home"}
                className={`p-3 ${isOnHome ? 'text-indigo-600' : 'text-gray-700'}`}
            >
                <Home className="w-6 h-6" />
            </Link>

            {/* Search Button */}
            <button
                onClick={() => navigate("/search")}
                className="p-3 text-gray-700"
            >
                <Search className="w-6 h-6" />
            </button>

            {/* Create Post Button (Center) */}
            <button
                onClick={onCreate}
                className="bg-indigo-600 text-white rounded-full p-3 shadow-lg -mt-4"
            >
                <PlusSquare className="w-6 h-6" />
            </button>

            {/* Messages/Chat Button */}
            <button
                onClick={onChat}
                className={`p-3 ${isOnChats ? 'text-indigo-600' : 'text-gray-700'}`}
            >
                <div className="relative">
                    <MessageCircle className="w-6 h-6" />
                    {/* Unread count badge */}
                    {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-5 flex items-center justify-center px-1.5">
                        3
                    </span> */}
                </div>
            </button>

            {/* Profile Button */}
            <Link
                to={`/profile/${user.user_id}`}
                className={`p-3 ${location.pathname === `/profile/${user.user_id}` ? 'text-indigo-600' : 'text-gray-700'}`}
            >
                <User className="w-6 h-6" />
            </Link>
        </nav>
    );
};

export default MobileBottomNav;