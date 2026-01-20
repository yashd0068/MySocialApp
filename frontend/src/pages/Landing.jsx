import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Sparkles,
    Users,
    Globe,
    Shield,
    Zap,
    Heart,
    MessageSquare,
    BarChart3,
    CheckCircle,
    ArrowRight,
    Camera,
    Video,
    Music,
    TrendingUp,
    Users2,
    Lock,
    Bell,
    Image as ImageIcon,
    Mic,
    Calendar,
    Share2
} from "lucide-react";

export default function Landing() {
    const features = [
        {
            icon: <Camera className="w-7 h-7" />,
            title: "Photo Sharing",
            desc: "Upload high-quality photos with trust",
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-50"
        },
        {
            icon: <Video className="w-7 h-7" />,
            title: "Video Posts(upcoming)",
            desc: "Share videos up to 10 minutes with sound",
            color: "from-red-500 to-orange-500",
            bgColor: "bg-red-50"
        },
        {
            icon: <Users className="w-7 h-7" />,
            title: "Groups",
            desc: "Create or join communities based on interests",
            color: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-50"
        },
        {
            icon: <MessageSquare className="w-7 h-7" />,
            title: "Messaging",
            desc: "Private chats, voice messages, and video calls",
            color: "from-green-500 to-emerald-500",
            bgColor: "bg-green-50"
        },
        // {
        //     icon: <Mic className="w-7 h-7" />,
        //     title: "Voice Posts",
        //     desc: "Share audio updates and podcasts",
        //     color: "from-yellow-500 to-amber-500",
        //     bgColor: "bg-yellow-50"
        // },
        // {
        //     icon: <TrendingUp className="w-7 h-7" />,
        //     title: "Trending",
        //     desc: "Discover viral content and popular topics",
        //     color: "from-pink-500 to-rose-500",
        //     bgColor: "bg-pink-50"
        // },
        {
            icon: <Calendar className="w-7 h-7" />,
            title: "Events",
            desc: "Create and discover local events",
            color: "from-indigo-500 to-purple-500",
            bgColor: "bg-indigo-50"
        },
        {
            icon: <Share2 className="w-7 h-7" />,
            title: "Stories",
            desc: "24-hour disappearing photos and videos",
            color: "from-teal-500 to-cyan-500",
            bgColor: "bg-teal-50"
        }
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
            {/* Background effects */}
            {/* <div className="fixed inset-0 bg-gradient-to-br from-purple-50/50 via-white to-pink-50/30" /> */}

            {/* Decorative elements */}
            <div className="fixed top-1/4 left-10 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-20" />
            <div className="fixed bottom-1/4 right-10 w-96 h-96 bg-pink-200 rounded-full blur-3xl opacity-20" />

            {/* ================= NAVBAR ================= */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-md">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                <span className="text-gray-900">Social</span>
                                <span className="text-purple-600">Sphere</span>
                            </h1>
                        </div>

                        <nav className="hidden md:flex items-center gap-6">
                            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition">
                                Explore
                            </Link>
                            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition">
                                Creators
                            </Link>
                            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition">
                                Communities
                            </Link>
                            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition">
                                Download
                            </Link>
                        </nav>

                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="text-sm font-medium text-gray-600 hover:text-purple-600 transition px-4 py-2 rounded-lg hover:bg-gray-50"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md transition"
                            >
                                Sign Up Free
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* ================= HERO ================= */}
            <main className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center lg:text-left"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-8"
                            >
                                <Zap className="w-4 h-4" />
                                Join users worldwide - Connected through love
                            </motion.div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                                Share your world,
                                <br />
                                <span className="relative">
                                    <span className="relative z-10 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                                        with the ones you love
                                    </span>
                                    <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-purple-100 to-pink-100 blur-lg" />
                                </span>
                            </h1>

                            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                                For the smiles no one else needs to see, and the memories meant just for us.Just a gentle space to stay close to the people who matter, and to hold onto the moments that make life feel full.
                            </p>

                            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-4 text-base font-semibold text-white shadow-lg hover:shadow-xl transition w-full sm:w-auto"
                                >
                                    Create Account
                                    <ArrowRight className="w-5 h-5" />
                                </Link>

                                <Link
                                    to="/explore"
                                    className="rounded-xl border border-gray-300 bg-white px-8 py-4 text-base font-medium text-gray-700 hover:border-purple-300 hover:bg-purple-50 transition w-full sm:w-auto"
                                >
                                    Explore Public Feed
                                </Link>
                            </div>

                            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">100%</div>
                                    <div className="text-sm text-gray-600">Secure</div>
                                </div>
                                {/* <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900"></div>
                                    <div className="text-sm text-gray-600">Communities</div>
                                </div> */}
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">100%</div>
                                    <div className="text-sm text-gray-600">Free</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Visual - Social Feed Mockup */}
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="relative"
                        >
                            <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
                                {/* Feed Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-400" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Your Feed</div>
                                            <div className="text-xs text-gray-500">Trending today</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs text-gray-500">Live</span>
                                    </div>
                                </div>

                                {/* Posts */}
                                <div className="space-y-6">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="p-4 rounded-xl border border-gray-100 hover:border-purple-100 transition">
                                            <div className="flex gap-3">
                                                <div className={`w-10 h-10 rounded-full ${i === 1 ? 'bg-gradient-to-br from-blue-400 to-cyan-400' : 'bg-gradient-to-br from-orange-400 to-red-400'}`} />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-medium text-gray-900">
                                                            {i === 1 ? "Alex Chen" : "Maya Rodriguez"}
                                                        </div>
                                                        <div className="text-xs text-gray-500">2h ago</div>
                                                    </div>
                                                    <p className="mt-2 text-gray-600 text-sm">
                                                        {i === 1
                                                            ? "Just finished my morning hike with these amazing views! 🌄 #NatureLover"
                                                            : "New recipe experiment success! Who wants to try? 🍳"}
                                                    </p>
                                                    <div className="mt-3 flex items-center gap-4">
                                                        <button className="flex items-center gap-1 text-gray-500 hover:text-red-500">
                                                            <Heart className="w-4 h-4" />
                                                            <span className="text-xs">1.2k</span>
                                                        </button>
                                                        <button className="flex items-center gap-1 text-gray-500 hover:text-purple-600">
                                                            <MessageSquare className="w-4 h-4" />
                                                            <span className="text-xs">84</span>
                                                        </button>
                                                        <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600">
                                                            <Share2 className="w-4 h-4" />
                                                            <span className="text-xs">Share</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* ================= FEATURES ================= */}
            <section className="py-20 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                            Everything you need in one place
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            All the features of premium social networks, completely free forever.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="relative group"
                            >
                                <div className="h-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-purple-200">
                                    <div className={`mb-4 p-3 rounded-lg ${feature.bgColor} w-fit`}>
                                        <div className={`bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                                            {feature.icon}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {feature.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= CTA ================= */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-purple-50">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="text-center rounded-3xl bg-gradient-to-r from-purple-600 to-pink-500 p-12 shadow-2xl"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                            Ready to join the community?
                        </h2>
                        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                            Sign up and start sharing life together—staying close to each other, your loved ones, and the communities you care about.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/register"
                                className="rounded-xl bg-white px-10 py-4 text-lg font-semibold text-purple-600 hover:shadow-xl transition"
                            >
                                Create Free Account
                            </Link>
                            <Link
                                to="/login"
                                className="rounded-xl border-2 border-white/30 px-10 py-4 text-lg font-medium text-white hover:bg-white/10 transition"
                            >
                                Log In
                            </Link>
                        </div>

                        <p className="mt-8 text-white/70 text-sm">
                            No credit card required • Always free • Join 10M+ users
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="bg-gray-50 border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="text-xl font-bold text-gray-900">SocialSphere</div>
                                <div className="text-sm text-gray-600">Free social networking for everyone</div>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-8 text-sm">
                            <Link to="/about" className="text-gray-600 hover:text-purple-600">About</Link>
                            <Link to="/blog" className="text-gray-600 hover:text-purple-600">Blog</Link>
                            <Link to="/jobs" className="text-gray-600 hover:text-purple-600">Jobs</Link>
                            <Link to="/help" className="text-gray-600 hover:text-purple-600">Help</Link>
                            <Link to="/privacy" className="text-gray-600 hover:text-purple-600">Privacy</Link>
                            <Link to="/terms" className="text-gray-600 hover:text-purple-600">Terms</Link>
                            <Link to="/cookies" className="text-gray-600 hover:text-purple-600">Cookies</Link>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                        <div>© {new Date().getFullYear()} SocialSphere. All rights reserved.</div>
                        <div className="mt-2">Made with for connecting people worldwide </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}