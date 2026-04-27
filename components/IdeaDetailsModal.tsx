import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, Heart, MessageSquare, ArrowUp, Share2, LucideIcon, Sparkles, Music, Video, Rocket, Smartphone
} from "lucide-react";
import { Idea, ideaService } from "../services/idea.services";
import { notificationService } from "../services/notification.services";
import { useAuth } from "../hooks/useAuth";
import PublicProfileModal from "./PublicProfileModal";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
    "SaaS / App": Smartphone,
    "YouTube": Music,
    "TikTok": Music,
    "Cinema": Video,
    "Startup": Rocket,
    "Other": Sparkles
};

interface IdeaDetailsModalProps {
    idea: Idea | null;
    onClose: () => void;
    onVoteToggle?: () => void;
}

export default function IdeaDetailsModal({ idea, onClose, onVoteToggle }: IdeaDetailsModalProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

    useEffect(() => {
        let unsubscribe: any = null;
        if (idea) {
            ideaService.subscribeComments(idea.id!, (data) => {
                setComments(data);
            }).then(unsub => {
                unsubscribe = unsub;
            });
        }
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [idea]);

    const handleSendComment = async () => {
        if (!user || !idea || !newComment.trim()) return;
        try {
            await ideaService.addComment(idea.id!, {
                text: newComment,
                userId: user.uid,
                userName: user.displayName || "Explorer",
                userAvatar: user.photoURL || ""
            });

            await notificationService.notify(idea.authorId, {
                senderId: user.uid,
                senderName: user.displayName || "Explorer",
                senderAvatar: user.photoURL || "",
                type: 'comment',
                content: `vừa bình luận vào ý tưởng "${idea.title}" của bạn.`,
                link: `/ideas?id=${idea.id}`
            });

            setNewComment("");
        } catch (error) {
            console.error("Failed to send comment:", error);
        }
    };

    const handleVote = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user || !idea) return;
        const isCurrentlyVoted = idea.votes?.includes(user.uid);
        await ideaService.toggleVote(idea.id!, user.uid);
        
        if (!isCurrentlyVoted) {
            await notificationService.notify(idea.authorId, {
                senderId: user.uid,
                senderName: user.displayName || "Explorer",
                senderAvatar: user.photoURL || "",
                type: 'vote',
                content: `vừa ủng hộ ý tưởng "${idea.title}" của bạn.`,
                link: `/ideas?id=${idea.id}`
            });
        }
        
        onVoteToggle?.();
    };

    if (!idea) return null;

    const Icon = CATEGORY_ICONS[idea.category] || Sparkles;
    const isVoted = user && idea.votes?.includes(user.uid);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-3000 flex items-center justify-center py-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl"
                />
                <motion.div 
                    layoutId={`idea-${idea.id}`}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-white w-full max-w-5xl h-[85vh] md:h-[80vh] rounded-[32px] md:rounded-[64px] shadow-2xl overflow-hidden flex flex-col md:flex-row"
                >
                    <div className="w-full md:w-1/2 h-1/3 md:h-full relative bg-slate-900 flex-shrink-0">
                        <img src={idea.imageUrl} className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        <button 
                            onClick={onClose}
                            className="absolute top-6 left-6 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all md:hidden"
                        >
                            <X size={20} />
                        </button>
                        <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12 right-6 md:right-12 text-white">
                            <div className="flex items-center gap-3 mb-4 md:mb-6">
                                <div className="p-3 md:p-4 bg-rose-500 rounded-2xl md:rounded-3xl shadow-2xl shadow-rose-500/20">
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">{idea.category}</span>
                                    <h2 className="text-xl md:text-4xl font-black italic tracking-tighter uppercase">{idea.title}</h2>
                                </div>
                            </div>
                            <div className="flex gap-4 md:gap-6">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Thị trường</span>
                                    <span className="font-black text-sm md:text-xl italic">{idea.demandPercentage}% Demand</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Người ủng hộ</span>
                                    <span className="font-black text-sm md:text-xl italic">{idea.votes?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-6 md:p-16 overflow-y-auto bg-white flex flex-col">
                        <div className="hidden md:flex justify-end mb-12">
                            <button 
                                onClick={onClose}
                                className="p-4 hover:bg-slate-50 rounded-full transition-all text-slate-400 hover:text-slate-900 border border-slate-100"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 space-y-8 md:space-y-12 pb-24 relative">
                            <section>
                                <h4 className="text-[9px] md:text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-3 md:mb-4">Vấn đề</h4>
                                <p className="text-lg md:text-2xl text-slate-800 font-bold leading-tight tracking-tight">{idea.problem || "Vấn đề chưa được mô tả chi tiết."}</p>
                            </section>

                            <section>
                                <h4 className="text-[9px] md:text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-3 md:mb-4">Giải pháp</h4>
                                <p className="text-base md:text-xl text-slate-600 font-medium leading-relaxed">{idea.solution || "Giải pháp đang được hoàn thiện."}</p>
                            </section>

                            <div className="pt-8 md:pt-12 border-t border-slate-100">
                                <button 
                                    onClick={handleVote}
                                    className={`w-full py-4 md:py-6 rounded-[24px] md:rounded-[32px] font-black uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 text-[10px] md:text-xs ${isVoted ? 'bg-slate-900 text-white' : 'bg-rose-500 text-white shadow-rose-200'}`}
                                >
                                    <Heart size={18} fill={isVoted ? "white" : "none"} />
                                    {isVoted ? "Đã vote ủng hộ" : "Vote ủng hộ ngay"}
                                </button>
                            </div>

                            <section className="pt-8 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Thảo luận ({idea.commentCount || 0})</h4>
                                    <button className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Mới nhất</button>
                                </div>

                                <div className="space-y-6 mb-12">
                                    {comments.length === 0 ? (
                                        <div className="text-slate-400 italic text-sm py-4">Kết nối với pitch này bằng những góp ý đầu tiên...</div>
                                    ) : (
                                        comments.map(c => (
                                            <div key={c.id} className="flex gap-4">
                                                <img 
                                                    src={c.userAvatar || `https://ui-avatars.com/api/?name=${c.userName}`} 
                                                    className="w-8 h-8 rounded-xl object-cover flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" 
                                                    onClick={() => setSelectedProfileId(c.userId)}
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span 
                                                            className="text-[10px] font-black text-slate-900 uppercase tracking-tight cursor-pointer hover:text-rose-500 transition-colors"
                                                            onClick={() => setSelectedProfileId(c.userId)}
                                                        >
                                                            {c.userName}
                                                        </span>
                                                        <span className="text-[8px] font-bold text-slate-300">
                                                            {c.createdAt?.toDate().toLocaleDateString('vi-VN')}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">{c.text}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="sticky bottom-0 bg-white pt-4 pb-0">
                                    <div className="relative group">
                                        <input 
                                            type="text" 
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                                            placeholder={user ? "Để lại bình luận hoặc góp ý..." : "Đăng nhập để bình luận"}
                                            disabled={!user}
                                            className="w-full h-14 bg-slate-50 rounded-2xl px-6 pr-14 text-sm font-bold border border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all disabled:opacity-50"
                                        />
                                        <button 
                                            onClick={handleSendComment}
                                            disabled={!user}
                                            className="absolute right-2 top-2 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-rose-500 transition-colors disabled:opacity-50"
                                        >
                                            <ArrowUp size={18} />
                                        </button>
                                    </div>
                                </div>
                            </section>

                            <div className="flex items-center justify-between pt-12 border-t border-slate-50">
                                <div 
                                    className="flex items-center gap-4 cursor-pointer group/author"
                                    onClick={() => setSelectedProfileId(idea.authorId)}
                                >
                                    <img src={idea.authorAvatar || `https://ui-avatars.com/api/?name=${idea.authorName}`} className="w-10 md:w-12 h-10 md:h-12 rounded-2xl object-cover border border-slate-100 group-hover/author:border-rose-500 transition-all" />
                                    <div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pitcher</div>
                                        <div className="font-black text-slate-900 italic tracking-tight text-sm md:text-base group-hover/author:text-rose-500 transition-colors">{idea.authorName}</div>
                                    </div>
                                </div>
                                <button className="p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 text-slate-400 hover:text-rose-500 transition-all">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <PublicProfileModal 
                    userId={selectedProfileId}
                    onClose={() => setSelectedProfileId(null)}
                />
            </div>
        </AnimatePresence>
    );
}
