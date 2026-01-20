import { Home, Search, PlusSquare, User } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const MobileBottomNav = ({ user, onCreate, isChatOpen = false }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Hide if chat modal is open (on mobile)
    if (isChatOpen && window.innerWidth < 768) {
        return null;
    }

    const isOnHome = location.pathname === "/home";

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-md flex justify-around items-center h-14 lg:hidden">
            <Link to={isOnHome ? `/profile/${user.user_id}` : "/home"}>
                <Home className="w-6 h-6 text-gray-700" />
            </Link>

            <button onClick={() => navigate("/search")}>
                <Search className="w-6 h-6 text-gray-700" />
            </button>

            <button
                onClick={onCreate}
                className="bg-indigo-600 text-white rounded-full p-3 shadow-lg"
            >
                <PlusSquare className="w-6 h-6" />
            </button>

            <Link to={`/profile/${user.user_id}`}>
                <User className="w-6 h-6 text-gray-700" />
            </Link>
        </nav>
    );
};

export default MobileBottomNav;