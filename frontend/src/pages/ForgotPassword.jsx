import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [storedEmail, setStoredEmail] = useState("");
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/users/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                setStoredEmail(email);
                setStep(2);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/users/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: storedEmail, otp }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                setStep(3);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to verify OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/users/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: storedEmail,
                    newPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                toast.success("Password reset successful! You can now login.");
                setTimeout(() => navigate("/login"), 1500);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="
          w-full max-w-md rounded-2xl
          border border-gray-200/70
          bg-white
          px-8 py-10
          shadow-[0_8px_30px_rgba(0,0,0,0.04)]
        "
            >
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-[22px] font-semibold tracking-tight text-gray-900">
                        Reset<span className="text-indigo-600"> Password</span>
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        {step === 1 && "Enter your email to receive OTP"}
                        {step === 2 && "Enter the OTP sent to your email"}
                        {step === 3 && "Create a new password"}
                    </p>
                </div>

                {/* Step 1: Email Input */}
                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="
                  w-full rounded-lg
                  border border-gray-300/80
                  px-4 py-3 text-sm text-gray-900
                  placeholder:text-gray-400
                  focus:outline-none
                  focus:border-indigo-500
                  focus:ring-2 focus:ring-indigo-500/10
                "
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="
                w-full rounded-xl
                bg-indigo-600
                py-3 text-sm font-semibold
                text-white
                transition-colors
                hover:bg-indigo-700
                disabled:opacity-50 disabled:cursor-not-allowed
              "
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="text-sm font-medium text-gray-600 hover:text-indigo-600"
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 2: OTP Verification */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enter 6-digit OTP
                            </label>
                            <div className="text-center mb-2 text-sm text-gray-500">
                                Sent to: {storedEmail}
                            </div>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="123456"
                                required
                                maxLength={6}
                                className="
                  w-full rounded-lg text-center text-2xl tracking-widest
                  border border-gray-300/80
                  px-4 py-3 text-gray-900
                  placeholder:text-gray-400
                  focus:outline-none
                  focus:border-indigo-500
                  focus:ring-2 focus:ring-indigo-500/10
                "
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1);
                                    setOtp("");
                                }}
                                className="
                  flex-1 rounded-xl
                  border border-gray-300
                  py-3 text-sm font-medium
                  text-gray-700
                  transition-colors
                  hover:bg-gray-50
                "
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="
                  flex-1 rounded-xl
                  bg-indigo-600
                  py-3 text-sm font-semibold
                  text-white
                  transition-colors
                  hover:bg-indigo-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                            </button>
                        </div>

                        <div className="text-center text-sm text-gray-500">
                            Didn't receive OTP?{" "}
                            <button
                                type="button"
                                onClick={handleSendOTP}
                                className="font-medium text-indigo-600 hover:underline"
                            >
                                Resend
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Minimum 6 characters"
                                required
                                className="
                  w-full rounded-lg
                  border border-gray-300/80
                  px-4 py-3 text-sm text-gray-900
                  placeholder:text-gray-400
                  focus:outline-none
                  focus:border-indigo-500
                  focus:ring-2 focus:ring-indigo-500/10
                "
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter password"
                                required
                                className="
                  w-full rounded-lg
                  border border-gray-300/80
                  px-4 py-3 text-sm text-gray-900
                  placeholder:text-gray-400
                  focus:outline-none
                  focus:border-indigo-500
                  focus:ring-2 focus:ring-indigo-500/10
                "
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setStep(2);
                                    setNewPassword("");
                                    setConfirmPassword("");
                                }}
                                className="
                  flex-1 rounded-xl
                  border border-gray-300
                  py-3 text-sm font-medium
                  text-gray-700
                  transition-colors
                  hover:bg-gray-50
                "
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="
                  flex-1 rounded-xl
                  bg-indigo-600
                  py-3 text-sm font-semibold
                  text-white
                  transition-colors
                  hover:bg-indigo-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                            >
                                {loading ? "Processing..." : "Reset Password"}
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}