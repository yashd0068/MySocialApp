import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import GoogleLoginButton from "./GoogleLoginButton";
import { motion } from "framer-motion";
import "remixicon/fonts/remixicon.css";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const navigate = useNavigate();

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.email || !form.password) {
            toast.error("Please fill in all fields!");
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Registration successful!");
                navigate("/login");
            } else {
                toast.error(data.message || "Registration failed!");
            }
        } catch (err) {
            toast.error("Error connecting to server!");
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

    const facebookLogin = () => {
        const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
        const redirectUri = "http://localhost:5173/facebook-callback";

        window.location.href =
            `https://www.facebook.com/v18.0/dialog/oauth` +
            `?client_id=${appId}` +
            `&redirect_uri=${redirectUri}` +
            `&scope=email,public_profile`;
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
            {/* Background effects */}
            <div className="fixed top-1/4 left-10 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-20" />
            <div className="fixed bottom-1/4 right-10 w-96 h-96 bg-pink-200 rounded-full blur-3xl opacity-20" />

            {/* Navbar (UNCHANGED) */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm"
            >
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold">
                            <span>Social</span>
                            <span className="text-purple-600">Sphere</span>
                        </h1>
                    </div>

                    <div className="flex gap-3">
                        <Link to="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-purple-600">
                            Log in
                        </Link>
                        <Link
                            to="/"
                            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </motion.header>

            {/* MAIN — CENTERED FORM */}
            <main className="pt-28 pb-16 px-4 flex justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="w-full max-w-md sm:max-w-lg"
                >
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold mb-3">Create your account</h2>
                            <p className="text-gray-600">
                                Start connecting with your world in seconds
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input
                                name="name"
                                placeholder="Full name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full rounded-xl border px-5 py-3.5 focus:ring-2 focus:ring-purple-500"
                            />

                            <input
                                name="email"
                                type="email"
                                placeholder="Email address"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full rounded-xl border px-5 py-3.5 focus:ring-2 focus:ring-purple-500"
                            />

                            <input
                                name="password"
                                type="password"
                                placeholder="Create password"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full rounded-xl border px-5 py-3.5 focus:ring-2 focus:ring-purple-500"
                            />

                            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 py-4 text-white font-semibold rounded-xl flex justify-center gap-2">
                                Create Account
                                <ArrowRight />
                            </button>
                        </form>

                        <div className="my-8 flex items-center">
                            <div className="flex-1 border-t" />
                            <span className="px-4 text-sm text-gray-500">or</span>
                            <div className="flex-1 border-t" />
                        </div>

                        <div className="grid gap-3">
                            <GoogleLoginButton />
                            <button onClick={githubLogin} className="border rounded-xl py-3">GitHub</button>
                            <button onClick={facebookLogin} className="border rounded-xl py-3">Facebook</button>
                        </div>

                        <p className="mt-8 text-center text-sm">
                            Already have an account?{" "}
                            <span
                                onClick={() => navigate("/login")}
                                className="text-purple-600 font-semibold cursor-pointer"
                            >
                                Sign in
                            </span>
                        </p>
                    </div>
                </motion.div>
            </main>

            {/* Footer (UNCHANGED) */}
            {/* keep your existing footer exactly as-is */}
        </div>
    );
}
