// Profile.jsx - Complete with persistent chat via URL
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import api from "../api/axios";
import FollowersModal from "./FollowersModal";
import ChatWindow from "./ChatWindow";
import MobileBottomNav from "../components/MobileBottomNav";

const Profile = () => {
    const { user_id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [modal, setModal] = useState({ open: false, type: "" });
    const [showComposer, setShowComposer] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);

    const [editingProfile, setEditingProfile] = useState(false);
    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    // Chat state - Get chat_id from URL query parameter
    const [activeChatId, setActiveChatId] = useState(null);
    const [isLoadingChat, setIsLoadingChat] = useState(false);

    useEffect(() => {
        // Get current user
        const fetchCurrentUser = async () => {
            try {
                const res = await api.get("/users/me");
                setCurrentUser(res.data);
            } catch (err) {
                console.error("Failed to fetch current user:", err);
            }
        };

        fetchCurrentUser();
        fetchProfile();
    }, [user_id]);

    // Check URL for chat_id on component mount and URL changes
    useEffect(() => {
        // Check URL for chat parameter
        const searchParams = new URLSearchParams(window.location.search);
        const chatIdParam = searchParams.get('chat');

        if (chatIdParam) {
            setActiveChatId(chatIdParam);
        }
    }, [window.location.search]);

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/profile/${user_id}`);
            setProfile({ ...res.data.user, stats: res.data.stats });
            setPosts(res.data.posts || []);

            setNewName(res.data.user.name);
            setNewEmail(res.data.user.email);

            if (res.data.isFollowing !== undefined) {
                setIsFollowing(res.data.isFollowing);
            }
        } catch (err) {
            console.error("Fetch profile error:", err.response?.data || err.message);
        }
    };

    const follow = async () => {
        try {
            await api.post(`/follow/${profile.user_id}`);
            setIsFollowing(true);
            setProfile(prev => ({
                ...prev,
                stats: {
                    ...prev.stats,
                    followers: prev.stats.followers + 1
                }
            }));
        } catch (err) {
            console.error("Follow error:", err);
        }
    };

    const unfollow = async () => {
        try {
            await api.delete(`/follow/${profile.user_id}`);
            setIsFollowing(false);
            setProfile(prev => ({
                ...prev,
                stats: {
                    ...prev.stats,
                    followers: prev.stats.followers - 1
                }
            }));
        } catch (err) {
            console.error("Unfollow error:", err);
        }
    };

    const handlePostUpdate = updatedPost => {
        setPosts(prev => prev.map(p => (p.post_id === updatedPost.post_id ? updatedPost : p)));
    };

    const handlePostDelete = post_id => {
        setPosts(prev => prev.filter(p => p.post_id !== post_id));
    };

    const uploadProfilePic = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await api.put("/users/profile-pic", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setProfile(prev => ({ ...prev, profilePic: res.data.profilePic }));
            // Also update current user if it's their profile
            if (currentUser.user_id === profile.user_id) {
                setCurrentUser(prev => ({ ...prev, profilePic: res.data.profilePic }));
            }
        } catch (err) {
            console.error("Upload error:", err.response?.data || err.message);
        }
    };

    // Start chat with this user - Updated to use URL parameters
    // Profile.jsx - Update the startChat function
    const startChat = async () => {
        if (!profile || !currentUser) return;

        setIsLoadingChat(true);
        try {
            console.log("🚀 Starting chat with user:", profile.user_id);
            console.log("👤 Current user:", currentUser.user_id);

            const res = await api.post("/chat", { user_id: profile.user_id });
            console.log("✅ Chat creation response:", res.data);

            const newChatId = res.data.chat_id;

            // Update URL
            const url = new URL(window.location);
            url.searchParams.set('chat', newChatId);
            window.history.replaceState({}, '', url);

            setActiveChatId(newChatId);

            // DEBUG: Check if chat already has messages
            setTimeout(async () => {
                try {
                    const messagesRes = await api.get(`/chat/${newChatId}/messages`);
                    console.log("📨 Initial messages check:", {
                        chatId: newChatId,
                        messageCount: messagesRes.data?.length || 0,
                        messages: messagesRes.data
                    });
                } catch (err) {
                    console.error("❌ Failed to check messages:", err);
                }
            }, 1000);

        } catch (err) {
            console.error("❌ Start chat error:", {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message
            });
            alert("Failed to start chat: " + (err.response?.data?.message || err.message));
        } finally {
            setIsLoadingChat(false);
        }
    };

    // Close chat handler
    const handleCloseChat = () => {
        // Remove chat parameter from URL
        navigate(`/profile/${user_id}`, { replace: true });
        setActiveChatId(null);
    };

    const saveProfile = async () => {
        try {
            setSavingProfile(true);

            const res = await api.put("/profile/update", {
                name: newName,
                email: newEmail
            });

            setProfile(prev => ({
                ...prev,
                name: res.data.user.name,
                email: res.data.user.email
            }));

            // Also update current user data
            setCurrentUser(prev => ({
                ...prev,
                name: res.data.user.name,
                email: res.data.user.email
            }));

            setEditingProfile(false);
            alert("Profile updated");

        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        } finally {
            setSavingProfile(false);
        }
    };

    if (!profile || !currentUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Loading profile...</div>
            </div>
        );
    }

    const isMyProfile = profile.user_id === currentUser.user_id;
    const hasPassword = currentUser.hasPassword;

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                    {/* PROFILE HEADER */}
                    <div className="bg-white rounded-xl border shadow-sm p-4 sm:p-6 mb-6">
                        <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-col sm:flex-row">
                            {/* PROFILE IMAGE */}
                            <div className="relative self-center sm:self-auto">
                                {isMyProfile ? (
                                    <label className="cursor-pointer block relative">
                                        <div className="relative">
                                            <img
                                                src={profile.profilePic ? `http://localhost:5000${profile.profilePic}` : "https://via.placeholder.com/150"}
                                                className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover border-2 border-white shadow"
                                                alt={profile.name}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "https://via.placeholder.com/150";
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-medium">Edit</span>
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={uploadProfilePic}
                                        />
                                    </label>
                                ) : (
                                    <img
                                        src={profile.profilePic ? `http://localhost:5000${profile.profilePic}` : "https://via.placeholder.com/150"}
                                        className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover border-2 border-white shadow"
                                        alt={profile.name}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://via.placeholder.com/150";
                                        }}
                                    />
                                )}
                            </div>

                            {/* PROFILE INFO */}
                            <div className="flex-1 text-center sm:text-left">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                                    {editingProfile ? (
                                        <input
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="border rounded px-3 py-2 text-lg font-semibold w-full sm:w-auto"
                                            placeholder="Name"
                                        />
                                    ) : (
                                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{profile.name}</h1>
                                    )}

                                    {!isMyProfile && (
                                        <div className="flex gap-2 justify-center sm:justify-start">
                                            {isFollowing ? (
                                                <button
                                                    onClick={unfollow}
                                                    className="px-4 py-2 rounded-full border text-sm font-medium text-gray-700 hover:bg-gray-100 transition whitespace-nowrap"
                                                >
                                                    Following
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={follow}
                                                    className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition whitespace-nowrap"
                                                >
                                                    Follow
                                                </button>
                                            )}

                                            <button
                                                onClick={startChat}
                                                disabled={isLoadingChat}
                                                className="px-4 py-2 rounded-full border text-sm font-medium hover:bg-gray-100 transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isLoadingChat ? "Starting..." : "Message"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {editingProfile ? (
                                    <input
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="border rounded px-3 py-2 text-sm w-full sm:w-auto mb-3"
                                        placeholder="Email"
                                        type="email"
                                    />
                                ) : (
                                    <p className="text-sm text-gray-600 mb-4">{profile.email}</p>
                                )}

                                <div className="flex justify-center sm:justify-start gap-6 text-sm text-gray-600 mb-4">
                                    <span className="text-center">
                                        <div className="font-bold text-gray-900">{profile.stats.posts}</div>
                                        <div>Posts</div>
                                    </span>

                                    <button
                                        onClick={() => setModal({ open: true, type: "followers" })}
                                        className="text-center hover:text-indigo-600 transition"
                                    >
                                        <div className="font-bold text-gray-900">{profile.stats.followers}</div>
                                        <div>Followers</div>
                                    </button>

                                    <button
                                        onClick={() => setModal({ open: true, type: "following" })}
                                        className="text-center hover:text-indigo-600 transition"
                                    >
                                        <div className="font-bold text-gray-900">{profile.stats.following}</div>
                                        <div>Following</div>
                                    </button>
                                </div>

                                {/* EDIT PROFILE / PASSWORD BUTTONS */}
                                {isMyProfile && (
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        {editingProfile ? (
                                            <>
                                                <button
                                                    onClick={saveProfile}
                                                    disabled={savingProfile}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 transition disabled:opacity-50"
                                                >
                                                    {savingProfile ? "Saving..." : "Save Changes"}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingProfile(false);
                                                        setNewName(profile.name);
                                                        setNewEmail(profile.email);
                                                    }}
                                                    className="px-4 py-2 border rounded-full text-sm hover:bg-gray-50 transition"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setEditingProfile(true)}
                                                    className="px-4 py-2 border rounded-full text-sm hover:bg-gray-50 transition"
                                                >
                                                    Edit Profile
                                                </button>
                                                {hasPassword ? (
                                                    <button
                                                        onClick={() => navigate("/change-password")}
                                                        className="px-4 py-2 border rounded-full text-sm hover:bg-gray-50 transition"
                                                    >
                                                        Change Password
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate("/change-password")}
                                                        className="px-4 py-2 border rounded-full text-sm hover:bg-gray-50 transition"
                                                    >
                                                        Set Password
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* POSTS */}
                    <div className="mb-8">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Posts</h2>

                        {posts.length === 0 ? (
                            <div className="bg-white border rounded-xl p-6 sm:p-8 text-center">
                                <div className="text-gray-400 mb-2">📝</div>
                                <p className="text-gray-500 text-sm">
                                    {isMyProfile
                                        ? "You haven't posted anything yet. Create your first post!"
                                        : "This user hasn't posted anything yet."}
                                </p>
                                {isMyProfile && (
                                    <button
                                        onClick={() => setShowComposer(true)}
                                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 transition"
                                    >
                                        Create First Post
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {posts.map(post => (
                                    <PostCard
                                        key={post.post_id}
                                        post={post}
                                        currentUser={currentUser}
                                        onPostUpdated={handlePostUpdate}
                                        onPostDeleted={handlePostDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* FOLLOWERS/FOLLOWING MODAL */}
                    {modal.open && (
                        <FollowersModal
                            userId={profile.user_id}
                            type={modal.type}
                            onClose={() => setModal({ open: false, type: "" })}
                        />
                    )}

                    {/* CHAT WINDOW */}
                    {activeChatId && currentUser && (
                        <ChatWindow
                            chatId={activeChatId}
                            currentUser={currentUser}
                            onClose={handleCloseChat}
                        />
                    )}
                </div>
            </div>

            {/* MOBILE COMPOSER MODAL */}
            {showComposer && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-end lg:hidden">
                    <div className="bg-white w-full rounded-t-2xl p-4 animate-slide-up">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-900">Create Post</h3>
                            <button
                                onClick={() => setShowComposer(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <textarea
                            rows="4"
                            className="w-full resize-none focus:outline-none text-gray-800 text-sm border rounded-lg p-3 mb-4"
                            placeholder="What's on your mind?"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowComposer(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MOBILE BOTTOM NAV */}
            <MobileBottomNav
                user={currentUser}
                onCreate={() => setShowComposer(true)}
            />
        </>
    );
};

export default Profile;