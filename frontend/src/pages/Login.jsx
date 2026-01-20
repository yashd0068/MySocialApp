import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
    Sparkles,
    Lock,
    Mail,
    Eye,
    EyeOff,
    ArrowRight
} from "lucide-react";
import GoogleLoginButton from "./GoogleLoginButton";

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                toast.success("Welcome back! 🚀");
                setTimeout(() => navigate("/home"), 800);
            } else {
                toast.error(data.message || "Invalid email or password");
            }
        } catch (error) {
            console.error(error);
            toast.error("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const githubLogin = () => {
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
        const redirectUri = "http://localhost:5173/github-callback";

        window.location.href =
            `https://github.com/login/oauth/authorize` +
            `?client_id=${clientId}` +
            `&redirect_uri=${redirectUri}` +
            `&scope=read:user user:email`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-4">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold">
                        Welcome back to <span className="text-purple-600">SocialSphere</span>
                    </h1>
                    <p className="text-gray-600 mt-2">Sign in to your account</p>
                </div>

                <div className="glass-card rounded-2xl p-8 shadow-xl">
                    {/* Social Login */}
                    <div className="space-y-4 mb-8">
                        <GoogleLoginButton />

                        <button
                            onClick={githubLogin}
                            className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white py-3.5 text-sm font-medium hover:bg-purple-50"
                        >
                            Continue with GitHub
                        </button>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 border-t"></div>
                        <span className="relative bg-white px-4 text-gray-500 text-sm">Or login with email</span>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                onChange={handleChange}
                                className="w-full rounded-xl border px-4 py-3 mt-1"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    onChange={handleChange}
                                    className="w-full rounded-xl border px-4 py-3 mt-1 pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 py-4 text-white font-semibold"
                        >
                            {isLoading ? "Signing in..." : "Login"}
                        </motion.button>
                    </form>

                    <p className="mt-6 text-center text-gray-600">
                        Don’t have an account?{" "}
                        <Link to="/register" className="text-purple-600 font-semibold">
                            Register
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
