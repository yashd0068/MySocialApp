import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Password() {
    const [form, setForm] = useState({ password: "", confirmPassword: "" });
    const [user, setUser] = useState({
        profilePic: "",
        authType: "local",
        passwordSet: false
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/users/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to fetch user");
                const data = await res.json();
                setUser(data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load profile");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchUser();
        } else {
            toast.error("Not authenticated");
            navigate("/login");
        }
    }, [token, navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }
        if (form.password !== form.confirmPassword) {
            return toast.error("Passwords do not match");
        }

        try {
            const res = await fetch("http://localhost:5000/api/users/set-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ password: form.password }),
            });

            const data = await res.json();

            if (!res.ok) {
                return toast.error(data.message || "Failed to set password");
            }

            toast.success("Password set successfully!");
            navigate("/profile");
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        toast("Logged out successfully");
        navigate("/login");
    };

    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Determine login method for display
    const getLoginMethod = () => {
        if (user.authType === "google") return "Google";
        if (user.authType === "github") return "GitHub";
        return "email and password";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">
                Loading...
            </div>
        );
    } return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Navbar */}
            <nav className="bg-white shadow-sm fixed top-0 left-0 w-full z-20">
                <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
                    <h1
                        className="text-2xl font-bold text-blue-600 cursor-pointer"
                        onClick={() => navigate("/home")}
                    >
                        Todo<span className="text-gray-700">App</span>
                    </h1>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/home"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                            Home
                        </Link>

                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="w-9 h-9 rounded-full overflow-hidden border"
                            >
                                <img
                                    src={
                                        user.profilePic
                                            ? `http://localhost:5000${user.profilePic}`
                                            : "https://via.placeholder.com/40"
                                    }
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md">
                                    <button
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            navigate("/profile");
                                        }}
                                        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                    >
                                        Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-12">
                <div className="w-full max-w-lg">

                    {/* Card */}
                    <div className="relative bg-white rounded-3xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">

                        {/* Accent Bar */}


                        {user.passwordSet === false ? (
                            <>
                                {/* Header */}
                                <div className="px-10 pt-8 pb-6">
                                    <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                        Set your password
                                    </h2>
                                    <p className="mt-2 text-sm text-gray-500 max-w-sm leading-relaxed">
                                        You signed in using <strong>{getLoginMethod()}</strong>.
                                        Create a password to enable email-based login.
                                    </p>
                                </div>

                                <div className="h-px bg-gray-100" />

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="px-10 py-8 space-y-6">

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New password
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            required
                                            className="
                  w-full rounded-xl bg-gray-50 border border-gray-300
                  px-4 py-3 text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-blue-600/40
                  focus:border-blue-600
                "
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            className="
                  w-full rounded-xl bg-gray-50 border border-gray-300
                  px-4 py-3 text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-blue-600/40
                  focus:border-blue-600
                "
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="
                  w-full bg-blue-600 text-white py-3 rounded-xl
                  font-medium text-sm tracking-wide
                  hover:bg-blue-700 transition
                  focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                "
                                        >
                                            Set password
                                        </button>
                                    </div>

                                    <p className="text-xs text-gray-500 text-center">
                                        Password must be at least 6 characters long.
                                    </p>
                                </form>
                            </>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="px-10 pt-8 pb-6 text-center">
                                    <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                        Password management
                                    </h2>
                                    <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                                        Your account uses <strong>{getLoginMethod()}</strong> authentication.
                                    </p>
                                </div>

                                <div className="h-px bg-gray-100" />

                                {/* Action */}
                                <div className="px-10 py-8">
                                    <button
                                        onClick={() => navigate("/change-password")}
                                        className="
                w-full bg-blue-600 text-white py-3 rounded-xl
                font-medium text-sm tracking-wide
                hover:bg-blue-700 transition
                focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
              "
                                    >
                                        Change password
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Trust Footer */}
                    <p className="mt-6 text-center text-xs text-gray-400">
                        Your password is securely stored and never shared.
                    </p>
                </div>
            </main>

        </div>
    );

}