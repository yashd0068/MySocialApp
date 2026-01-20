import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function ChangePassword() {
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [user, setUser] = useState({
        profilePic: "",
        user_id: "",
        authProvider: "local" // Default to local auth
    });
    const [hasPassword, setHasPassword] = useState(true);
    const [loading, setLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // 🔹 Fetch logged-in user with auth provider info
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const res = await fetch("http://localhost:5000/api/users/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch user");
                }

                const data = await res.json();
                console.log("User data:", data); // Check this in browser console

                setUser(data);

                // Use the backend's response to determine password status
                // The backend should return hasPassword: true/false
                // and authProvider: "local" | "google" | "github"
                if (data.hasPassword !== undefined) {
                    setHasPassword(data.hasPassword);
                } else {
                    // Fallback: if backend doesn't return hasPassword
                    setHasPassword(data.authProvider === "local");
                }

            } catch (err) {
                console.error(err);
                toast.error("Failed to load profile");
                setHasPassword(true); // Default to true for safety
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchUser();
        } else {
            navigate("/login");
        }
    }, [token, navigate]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    // 🔹 Submit handler (SET or CHANGE)
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (form.newPassword !== form.confirmPassword) {
            return toast.error("Passwords do not match");
        }

        // Validate password strength (optional but recommended)
        if (form.newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }

        // If changing password, current password is required
        if (hasPassword && !form.currentPassword) {
            return toast.error("Current password is required");
        }

        try {
            const endpoint = hasPassword
                ? "http://localhost:5000/api/users/change-password"
                : "http://localhost:5000/api/users/set-password";

            const requestBody = hasPassword
                ? {
                    currentPassword: form.currentPassword,
                    newPassword: form.newPassword,
                }
                : {
                    newPassword: form.newPassword,
                };

            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            const data = await res.json();

            if (!res.ok) {
                // Handle specific error cases
                if (res.status === 401 && hasPassword) {
                    return toast.error("Current password is incorrect");
                }
                return toast.error(data.message || "Failed to update password");
            }

            toast.success(
                hasPassword
                    ? "Password changed successfully"
                    : "Password set successfully"
            );

            // Update local state to reflect password is now set
            if (!hasPassword) {
                setHasPassword(true);
            }

            // Reset form
            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            // Navigate to profile
            setTimeout(() => {
                navigate(`/profile/${user.user_id}`);
            }, 1500);

        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        toast.success("Logged out");
        navigate("/login");
    };

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* NAVBAR - same as before */}
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-md"
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
                                            navigate(`/profile/${user.user_id}`);
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

            {/* FORM */}
            <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-12">
                <div className="w-full max-w-lg bg-white rounded-3xl border shadow p-10">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {hasPassword ? "Change Password" : "Set Password"}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        {hasPassword
                            ? "Update your existing password."
                            : "You logged in with a social account. Set a password for future email/password logins."}
                    </p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        {/* CURRENT PASSWORD (only for users who already have password) */}
                        {hasPassword && (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Current password
                                </label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={form.currentPassword}
                                    onChange={handleChange}
                                    placeholder="Enter your current password"
                                    className="w-full rounded-xl border px-4 py-3"
                                    required={hasPassword}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                New password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={form.newPassword}
                                required
                                onChange={handleChange}
                                placeholder="Enter new password (min. 6 characters)"
                                className="w-full rounded-xl border px-4 py-3"
                                minLength="6"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Confirm new password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                required
                                onChange={handleChange}
                                placeholder="Confirm your new password"
                                className="w-full rounded-xl border px-4 py-3"
                                minLength="6"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700"
                        >
                            {hasPassword ? "Update password" : "Set password"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}