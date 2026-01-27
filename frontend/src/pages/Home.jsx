import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import Feed from "./Feed";
import InfiniteScroll from "react-infinite-scroll-component";
import MobileBottomNav from "../components/MobileBottomNav";
import { MessageCircle } from "lucide-react";

const Home = () => {
    const feedRef = useRef(null);
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [following, setFollowing] = useState([]);
    const [showComposer, setShowComposer] = useState(false);

    // FEED STATE
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchUser();
        fetchFollowing();
        fetchPosts();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await api.get("/users/me");
            setUser(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFollowing = async () => {
        try {
            const res = await api.get("/follow/following");
            setFollowing(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPosts = async () => {
        try {
            const res = await api.get(`/posts/feed?page=${page}&limit=5`);
            if (res.data.length === 0) {
                setHasMore(false);
                return;
            }
            setPosts(prev => [...prev, ...res.data]);
            setPage(prev => prev + 1);
        } catch (err) {
            console.error("Error fetching feed:", err.response?.data || err.message);
        }
    };

    const handlePost = async () => {
        if (!content.trim()) return;

        const formData = new FormData();
        formData.append("content", content);
        if (image) formData.append("image", image);

        await api.post("/posts", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        setContent("");
        setImage(null);
        // Refresh feed from scratch
        setPosts([]);
        setPage(1);
        setHasMore(true);
        fetchPosts();
    };

    // ---------------- DYNAMIC SEARCH ----------------
    useEffect(() => {
        if (!search.trim()) {
            setResults([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            try {
                const res = await api.get(`/users/search/${search}`);
                setResults(res.data.filter(u => u.user_id !== user.user_id));
            } catch (err) {
                console.error(err);
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [search, user]);

    const follow = async (id) => {
        await api.post(`/follow/${id}`);
        setFollowing([...following, id]);
    };

    const unfollow = async (id) => {
        await api.delete(`/follow/${id}`);
        setFollowing(following.filter(f => f !== id));
    };

    // Start chat with a user
    const startChat = async (userId) => {
        try {
            const res = await api.post("/chat", { user_id: userId });

            // ⚠️ IMPORTANT: match backend response
            const chatId = res.data.chat?.chat_id || res.data.chat_id;

            // Redirect to that user's profile with chat param
            navigate(`/profile/${userId}?chat=${chatId}`);

        } catch (err) {
            console.error("Failed to start chat:", err.response?.data || err.message);
            alert("Failed to start chat. Please try again.");
        }
    };


    if (!user) return <p className="p-8 text-gray-400">Loading...</p>;

    return (
        <>
            <Navbar mobile />

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-8">

                    {/* LEFT - DESKTOP SIDEBAR */}
                    <aside className="col-span-3 hidden lg:block">
                        <div className="sticky top-24 space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Welcome back
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {user.name}
                                </p>
                            </div>

                            <nav className="space-y-3 text-sm">
                                <Link to="/home" className="block font-medium text-indigo-600">
                                    Home
                                </Link>
                                <Link
                                    to={`/profile/${user.user_id}`}
                                    className="block text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded transition"
                                >
                                    Profile
                                </Link>
                                <Link
                                    to="/chats"
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded transition"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Messages
                                </Link>
                            </nav>
                        </div>
                    </aside>

                    {/* CENTER - MAIN FEED */}
                    <main className="col-span-12 lg:col-span-6 space-y-6">

                        {/* Composer (Desktop) */}
                        <div className="hidden lg:block bg-white rounded-xl border shadow-sm p-4">
                            <textarea
                                rows="3"
                                className="w-full resize-none focus:outline-none text-gray-800 text-sm"
                                placeholder="Share something worth reading…"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => setImage(e.target.files[0])}
                                className="mt-3 text-sm"
                            />
                            <div className="flex justify-end mt-3">
                                <button
                                    onClick={handlePost}
                                    className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
                                >
                                    Publish
                                </button>
                            </div>
                        </div>

                        {/* Composer (Mobile Modal) */}
                        {showComposer && (
                            <div className="fixed inset-0 z-50 bg-black/40 flex items-end lg:hidden">
                                <div className="bg-white w-full rounded-t-2xl p-4">
                                    <textarea
                                        rows="3"
                                        className="w-full resize-none focus:outline-none text-gray-800 text-sm"
                                        placeholder="What's on your mind?"
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setImage(e.target.files[0])}
                                        className="mt-3 text-sm"
                                    />
                                    <div className="flex justify-between mt-4">
                                        <button
                                            onClick={() => setShowComposer(false)}
                                            className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                handlePost();
                                                setShowComposer(false);
                                            }}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                                        >
                                            Post
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FEED */}
                        <InfiniteScroll
                            dataLength={posts.length}
                            next={fetchPosts}
                            hasMore={hasMore}
                            loader={<p className="text-center text-gray-500 py-4">Loading...</p>}
                            endMessage={<p className="text-center text-gray-500 py-4">No more posts</p>}
                        >
                            {posts.map(post => (
                                <Feed
                                    key={post.post_id}
                                    post={post}
                                    currentUser={user}
                                    onPostUpdated={(updatedPost) =>
                                        setPosts(prev => prev.map(p => p.post_id === updatedPost.post_id ? updatedPost : p))
                                    }
                                    onPostDeleted={(id) =>
                                        setPosts(prev => prev.filter(p => p.post_id !== id))
                                    }
                                />
                            ))}
                        </InfiniteScroll>

                    </main>

                    {/* RIGHT - DISCOVER PEOPLE */}
                    <aside className="col-span-3 hidden lg:block">
                        <div className="sticky top-24 bg-white rounded-xl border shadow-sm p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">
                                Discover people
                            </h3>

                            <input
                                className="w-full border rounded-md px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Search users"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />

                            <div className="mt-4 space-y-3">
                                {results.length > 0 ? (
                                    results.map(u => (
                                        <div
                                            key={u.user_id}
                                            className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    to={`/profile/${u.user_id}`}
                                                    className="flex items-center gap-3"
                                                >
                                                    {u.profilePic ? (
                                                        <img
                                                            src={`http://localhost:5000${u.profilePic}`}
                                                            alt={u.name}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                            {u.name?.charAt(0) || 'U'}
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-gray-800 hover:underline">
                                                        {u.name}
                                                    </span>
                                                </Link>
                                            </div>

                                            <div className="flex gap-2">
                                                {following.includes(u.user_id) ? (
                                                    <button
                                                        onClick={() => unfollow(u.user_id)}
                                                        className="text-red-500 text-xs hover:text-red-700 px-2 py-1 border border-red-200 rounded hover:bg-red-50 transition"
                                                    >
                                                        Unfollow
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => follow(u.user_id)}
                                                        className="text-indigo-600 text-xs hover:text-indigo-700 px-2 py-1 border border-indigo-200 rounded hover:bg-indigo-50 transition"
                                                    >
                                                        Follow
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => startChat(u.user_id)}
                                                    className="text-gray-600 text-xs hover:text-gray-800 px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 transition"
                                                    title="Message"
                                                >
                                                    <MessageCircle className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : search.trim() ? (
                                    <p className="text-gray-500 text-sm">No users found.</p>
                                ) : null}
                            </div>

                            {/* Chat section */}
                            <div className="mt-6 pt-4 border-t">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-gray-900">Messages</h4>
                                    <Link
                                        to="/chats"
                                        className="text-xs text-indigo-600 hover:text-indigo-800"
                                    >
                                        See all
                                    </Link>
                                </div>

                                {/* You can add recent chats here */}
                                <div className="space-y-2">
                                    <div className="text-center py-4">
                                        <MessageCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No recent messages</p>
                                        <button
                                            onClick={() => navigate("/chats")}
                                            className="text-xs text-indigo-600 hover:text-indigo-800 mt-2"
                                        >
                                            Start a conversation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>

            {/* UPDATED MobileBottomNav with Chat button */}
            <MobileBottomNav
                user={user}
                onCreate={() => setShowComposer(true)}
                onChat={() => navigate("/chats")}
            />
        </>
    );
};

export default Home;