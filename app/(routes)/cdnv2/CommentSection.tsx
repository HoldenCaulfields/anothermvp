import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePostStore, Comment } from "@/stores/usePostStore";
import { Send, Loader2 } from "lucide-react";
import { submitComment } from "@/services/postcdn.services";

interface CommentSectionProps {
    postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
    const { user, profile } = useAuth();
    const addComment = usePostStore((s) => s.addComment);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const unsubscribe = submitComment(postId, setComments);
        return unsubscribe;
    }, [postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await addComment(
                postId,
                user.uid,
                user.displayName || "Sinh viên ẩn danh",
                user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
                newComment.trim()
            );
            setNewComment("");
        } catch (error) {
            console.error("Failed to add comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Comment List */}
            <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
                {comments.length === 0 ? (
                    <p className="text-[10px] text-slate-400 text-center py-2">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                            <img
                                src={comment.authorAvatar}
                                alt={comment.authorName}
                                className="w-6 h-6 rounded-full border border-slate-100 flex-shrink-0"
                                referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 bg-slate-50 rounded-xl p-2 px-3">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="text-[10px] font-bold text-slate-800">{comment.authorName}</span>
                                    <span className="text-[8px] text-slate-400">
                                        {comment.createdAt?.toDate().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-tight">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Comment Input */}
            {user ? (
                <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                    <img
                        src={/* profile?.avatar || */ user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                        alt="My avatar"
                        className="w-6 h-6 rounded-full border border-slate-100"
                        referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Viết bình luận..."
                            className="w-full bg-slate-100 border-none rounded-full py-2 px-4 pr-10 text-md focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || isSubmitting}
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-rose-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-rose-700 transition-colors"
                        >
                            {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                        </button>
                    </div>
                </form>
            ) : (
                <p className="text-[10px] text-slate-400 text-center italic">Đăng nhập để bình luận</p>
            )}
        </div>
    );
}
