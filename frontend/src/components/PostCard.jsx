import { useState, useEffect } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    MessageCircle,
    MoreVertical,
    Edit2,
    Trash2,
    Send,
    X,
    Bookmark,
    Share2,
    User,
    Clock,
    Check,
    MoreHorizontal,
    Smile,
    Image as ImageIcon,
    ChevronDown,
    ChevronUp,
    ThumbsUp,
    Reply,
    Flag,
    Loader2
} from "lucide-react";

const PostCard = ({ post, currentUser, onPostUpdated, onPostDeleted }) => {
    const [editing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);

    const [comments, setComments] = useState(post.comments || []);
    const [commentText, setCommentText] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState("");

    const [profile, setProfile] = useState(null);
    const [showComments, setShowComments] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isLiked, setIsLiked] = useState(post.likedByMe);
    const [likeCount, setLikeCount] = useState(post.likesCount);
    const [isBookmarked, setIsBookmarked] = useState(false);

    // Pagination states
    const [loadingComments, setLoadingComments] = useState(false);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [commentPage, setCommentPage] = useState(1);
    const [commentsLoaded, setCommentsLoaded] = useState(false);

    const COMMENTS_PER_LOAD = 10;

    useEffect(() => {
        setComments(post.comments || []);
        setIsLiked(post.likedByMe);
        setLikeCount(post.likesCount);
        // Reset pagination when post changes
        setCommentPage(1);
        setHasMoreComments(post.comments?.length >= COMMENTS_PER_LOAD);
        setCommentsLoaded(false);
    }, [post.comments, post.likedByMe, post.likesCount]);

    const toggleLike = async () => {
        const newLiked = !isLiked;
        setIsLiked(newLiked);
        setLikeCount(prev => newLiked ? prev + 1 : prev - 1);

        try {
            await api.post(`/posts/like/${post.post_id}`);
        } catch {
            setIsLiked(!newLiked);
            setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
        }
    };

    const deletePost = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        await api.delete(`/posts/${post.post_id}`);
        onPostDeleted(post.post_id);
    };

    const submitEdit = async () => {
        const res = await api.put(`/posts/${post.post_id}`, {
            content: editContent,
        });
        onPostUpdated(res.data);
        setEditing(false);
    };

    const submitEditComment = async (id) => {
        const res = await api.put(`/comments/${id}`, {
            content: editCommentText
        });

        setComments(prev =>
            prev.map(c => (c.comment_id === id ? res.data : c))
        );

        setEditingCommentId(null);
    };

    /* ---------------- ENHANCED COMMENTS HANDLING ---------------- */
    const loadInitialComments = async () => {
        if (commentsLoaded || loadingComments) return;

        setLoadingComments(true);
        try {
            const res = await api.get(`/comments/${post.post_id}`, {
                params: { page: 1, limit: COMMENTS_PER_LOAD }
            });

            setComments(res.data);
            setCommentPage(1);
            setHasMoreComments(res.data.length === COMMENTS_PER_LOAD);
            setCommentsLoaded(true);
        } catch (err) {
            console.error("Failed to load comments:", err);
        } finally {
            setLoadingComments(false);
        }
    };

    const loadMoreComments = async () => {
        if (loadingComments || !hasMoreComments) return;

        setLoadingComments(true);
        try {
            const res = await api.get(`/comments/${post.post_id}`, {
                params: { page: commentPage + 1, limit: COMMENTS_PER_LOAD }
            });

            if (res.data.length === 0) {
                setHasMoreComments(false);
                return;
            }

            setComments(prev => [...prev, ...res.data]);
            setCommentPage(prev => prev + 1);
            setHasMoreComments(res.data.length === COMMENTS_PER_LOAD);
        } catch (err) {
            console.error("Failed to load more comments:", err);
        } finally {
            setLoadingComments(false);
        }
    };

    const toggleComments = async () => {
        if (!showComments && !commentsLoaded) {
            await loadInitialComments();
        }
        setShowComments(!showComments);
    };

    const addComment = async () => {
        if (!commentText.trim()) return;

        const res = await api.post(`/comments/${post.post_id}`, {
            content: commentText,
            reply_to: replyingTo
        });

        setComments(prev => [res.data, ...prev]);
        setCommentText("");
        setReplyingTo(null);
    };

    const deleteComment = async (id) => {
        await api.delete(`/comments/${id}`);
        setComments(prev => prev.filter(c => c.comment_id !== id));
    };

    const toggleBookmark = async () => {
        setIsBookmarked(!isBookmarked);
        // Add bookmark API call if needed
    };

    const sharePost = () => {
        navigator.clipboard.writeText(`${window.location.origin}/post/${post.post_id}`);
        alert("Link copied to clipboard!");
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString();
    };

    const emojis = ["❤️", "😂", "😮", "😢", "🔥", "👏"];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
        >
            {/* HEADER */}
            <div className="p-5 pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <Link
                            to={`/profile/${post.User?.user_id}`}
                            className="relative flex-shrink-0"
                        >
                            {post.User?.profilePic ? (
                                <img
                                    src={`http://localhost:5000${post.User.profilePic}`}
                                    alt={post.User.name}
                                    className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <span className="text-white font-semibold text-lg">
                                        {post.User?.name?.[0]?.toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                        </Link>

                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Link
                                    to={`/profile/${post.User?.user_id}`}
                                    className="font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                                >
                                    {post.User?.name}
                                </Link>
                                {post.User?.user_id === currentUser.user_id && (
                                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                        You
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatTime(post.createdAt)}</span>
                                {post.edited && (
                                    <span className="text-xs italic text-gray-400">• edited</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Options Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>

                        <AnimatePresence>
                            {showOptions && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-10 overflow-hidden"
                                >
                                    {post.user_id === currentUser.user_id ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setEditing(true);
                                                    setShowOptions(false);
                                                }}
                                                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Edit Post
                                            </button>
                                            <button
                                                onClick={() => {
                                                    deletePost();
                                                    setShowOptions(false);
                                                }}
                                                className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete Post
                                            </button>
                                        </>
                                    ) : (
                                        <button className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3">
                                            <Flag className="w-4 h-4" />
                                            Report Post
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="px-5 pb-4">
                {editing ? (
                    <div className="space-y-3">
                        <textarea
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            value={editContent}
                            rows={3}
                            onChange={e => setEditContent(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={submitEdit}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-medium hover:shadow-md transition-shadow"
                            >
                                Save Changes
                            </motion.button>
                            <button
                                onClick={() => setEditing(false)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                )}

                {post.image_url && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 rounded-xl overflow-hidden border border-gray-200"
                    >
                        <img
                            src={`http://localhost:5000${post.image_url}`}
                            alt="Post content"
                            className="w-full h-auto max-h-96 object-cover"
                            loading="lazy"
                        />
                    </motion.div>
                )}
            </div>

            {/* ACTION BAR */}
            <div className="px-5 py-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <div className="flex -space-x-2">
                            {emojis.slice(0, 3).map((emoji, idx) => (
                                <span key={idx} className="text-sm">{emoji}</span>
                            ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">{likeCount}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                        {comments.length} comment{comments.length !== 1 ? 's' : ''}
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-1 mt-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleLike}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${isLiked ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                        {isLiked ? 'Liked' : 'Like'}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleComments}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${showComments ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <MessageCircle className="w-5 h-5" />
                        {showComments ? 'Hide' : 'Comment'}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={sharePost}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors"
                    >
                        <Share2 className="w-5 h-5" />
                        Share
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleBookmark}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${isBookmarked ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                        Save
                    </motion.button>
                </div>
            </div>

            {/* COMMENTS SECTION - SHOW ONLY WHEN EXPANDED */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-100"
                    >
                        <div className="p-5 space-y-4">
                            {/* Comments List Header */}
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-gray-900">
                                    Comments ({comments.length})
                                </h4>
                                <button
                                    onClick={() => setShowComments(false)}
                                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Comments List */}
                            {loadingComments && !commentsLoaded ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                                </div>
                            ) : comments.length > 0 ? (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {comments.map(comment => (
                                        <motion.div
                                            key={comment.comment_id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-white rounded-xl p-4 border border-gray-100"
                                        >
                                            <div className="flex items-start gap-3">
                                                <Link
                                                    to={`/profile/${comment.User.user_id}`}
                                                    className="flex-shrink-0"
                                                >
                                                    {comment.User.profilePic ? (
                                                        <img
                                                            src={`http://localhost:5000${comment.User.profilePic}`}
                                                            alt={comment.User.name}
                                                            className="h-8 w-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                                                            <span className="text-white text-xs font-medium">
                                                                {comment.User.name?.[0]?.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </Link>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <Link
                                                                to={`/profile/${comment.User.user_id}`}
                                                                className="text-sm font-semibold text-gray-900 hover:text-purple-600"
                                                            >
                                                                {comment.User.name}
                                                            </Link>
                                                            <span className="text-xs text-gray-400">
                                                                {formatTime(comment.createdAt)}
                                                            </span>
                                                        </div>

                                                        {comment.user_id === currentUser.user_id && (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingCommentId(comment.comment_id);
                                                                        setEditCommentText(comment.content);
                                                                    }}
                                                                    className="text-xs text-gray-500 hover:text-blue-600 p-1"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteComment(comment.comment_id)}
                                                                    className="text-xs text-gray-500 hover:text-red-600 p-1"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {editingCommentId === comment.comment_id ? (
                                                        <div className="space-y-2">
                                                            <textarea
                                                                value={editCommentText}
                                                                onChange={e => setEditCommentText(e.target.value)}
                                                                rows={2}
                                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => submitEditComment(comment.comment_id)}
                                                                    className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs rounded-lg"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingCommentId(null)}
                                                                    className="px-3 py-1 border border-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-50"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                                            {comment.content}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-4 mt-2">
                                                        <button className="text-xs text-gray-500 hover:text-gray-700">
                                                            Like
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setReplyingTo(comment.comment_id);
                                                                setCommentText(`@${comment.User.name} `);
                                                            }}
                                                            className="text-xs text-gray-500 hover:text-purple-600"
                                                        >
                                                            Reply
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Load More Comments Button */}
                                    {hasMoreComments && (
                                        <div className="text-center pt-4">
                                            <button
                                                onClick={loadMoreComments}
                                                disabled={loadingComments}
                                                className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {loadingComments ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Loading more comments...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="w-4 h-4" />
                                                        Load more comments
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                    <p className="text-sm">No comments yet. Be the first to comment!</p>
                                </div>
                            )}

                            {/* Add Comment */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                {replyingTo && (
                                    <div className="flex items-center justify-between mb-3 p-2 bg-purple-50 rounded-lg">
                                        <span className="text-sm text-purple-700">
                                            Replying to {comments.find(c => c.comment_id === replyingTo)?.User.name}
                                        </span>
                                        <button
                                            onClick={() => setReplyingTo(null)}
                                            className="text-purple-600 hover:text-purple-800"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0">
                                        {currentUser.profilePic ? (
                                            <img
                                                src={`http://localhost:5000${currentUser.profilePic}`}
                                                alt={currentUser.name}
                                                className="h-9 w-9 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                <span className="text-white text-sm font-medium">
                                                    {currentUser.name?.[0]?.toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            value={commentText}
                                            onChange={e => setCommentText(e.target.value)}
                                            placeholder="Write a comment..."
                                            rows={2}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                        />
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                    className="p-2 hover:bg-gray-100 rounded-full"
                                                >
                                                    <Smile className="w-4 h-4 text-gray-500" />
                                                </button>
                                                <button className="p-2 hover:bg-gray-100 rounded-full">
                                                    <ImageIcon className="w-4 h-4 text-gray-500" />
                                                </button>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={addComment}
                                                disabled={!commentText.trim()}
                                                className={`px-5 py-2 rounded-lg font-medium ${commentText.trim()
                                                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-md'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                <Send className="w-4 h-4" />
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ADD COMMENT FORM (ALWAYS VISIBLE AT BOTTOM) */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex gap-3">
                    <div className="flex-shrink-0">
                        {currentUser.profilePic ? (
                            <img
                                src={`http://localhost:5000${currentUser.profilePic}`}
                                alt={currentUser.name}
                                className="h-8 w-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                    {currentUser.name?.[0]?.toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="relative">
                            <textarea
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                rows={1}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-[40px] max-h-32"
                                onFocus={(e) => e.target.rows = 2}
                                onBlur={(e) => e.target.rows = 1}
                            />
                            {commentText.trim() && (
                                <motion.button
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={addComment}
                                    className="absolute right-2 bottom-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-medium"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PostCard;