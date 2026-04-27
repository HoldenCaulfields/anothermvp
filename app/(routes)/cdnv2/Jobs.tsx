import { usePostStore } from "@/stores/usePostStore";
import { AnimatePresence, motion } from "framer-motion";

import VerificationBadge from '@/components/VerificationBadge';
import { Heart, MessageSquare, Clock, MapPin, DollarSign, Share2, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import CommentSection from "./CommentSection";
import { checkUserLikedPost } from "@/services/postcdn.services";

export default function Jobs() {
    return (
        <div className="mb-16" >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Việc làm nổi bật</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Cơ hội kiếm thêm thu nhập</p>
            </div>
            <button className="text-rose-600 text-xs font-black uppercase tracking-widest hover:underline">Xem tất cả</button>
          </div>
          <div className="space-y-4">
            <JobLists limit={3} />
          </div>
        </div>
    );
}



export function JobLists({ limit }: { limit?: number }) {
    const { posts } = usePostStore();
    const fetchPosts = usePostStore((s) => s.fetchPosts);

    useEffect(() => {
        const unsub = fetchPosts();
        return () => unsub && unsub();
    }, []);

    // 1. Lọc và đảm bảo không lấy trùng ID (nếu DB bị duplicate)
    const seenIds = new Set();
    let filteredPosts = posts.filter(p => {
        if (p.category === 'jobs' && !seenIds.has(p.id)) {
            seenIds.add(p.id);
            return true;
        }
        return false;
    });

    if (limit) {
        filteredPosts = filteredPosts.slice(0, limit);
    }

    return (
        /* 2. Sửa lỗi AnimatePresence: 
           Các phần tử con trực tiếp của AnimatePresence phải có key để Motion nhận diện.
           Chúng ta loại bỏ thẻ div bọc ngoài để motion.div bên trong JobCard hoạt động đúng.
        */
        <AnimatePresence mode="popLayout">
            {filteredPosts.map((job, index) => (
                <JobCard 
                    // 3. Dự phòng nếu ID vẫn trùng: kết hợp index
                    key={`${job.id}-${index}`} 
                    post={job} 
                />
            ))}
            
            {filteredPosts.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key="empty-state"
                    className="py-20 text-center"
                >
                    <div className="text-slate-300 font-black text-lg mb-2">Chưa có bài đăng nào</div>
                    <p className="text-slate-400 text-sm">Hãy là người đầu tiên chia sẻ nhé!</p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}


function JobCard({ post }: any) {
    const { user, login } = useAuth();
    const toggleLike = usePostStore((s) => s.toggleLike);
    const [showComments, setShowComments] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        const checkLike = async () => {
            if (!user) return;
            const liked = await checkUserLikedPost(post.id, user.uid);
            setIsLiked(liked);
        };
        checkLike();
    }, [post.id, user]);

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return login();
        
        const newLikedStatus = !isLiked;
        setIsLiked(newLikedStatus);
        try {
            await toggleLike(post.id, user.uid);
        } catch (error) {
            setIsLiked(!newLikedStatus);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300"
        >
            <div className="flex flex-col sm:flex-row gap-5">
                {/* Thumbnail - Nhỏ hơn và cố định kích thước ở desktop */}
                <div className="relative w-full sm:w-40 h-32 sm:h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-100">
                    <img 
                        src={post.image || "/parttime.png"} 
                        alt={post.title} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer" 
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                </div>

                {/* Main Content - Trải dài sang phải */}
                <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                        <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-slate-900 text-lg leading-snug line-clamp-1 group-hover:text-rose-600 transition-colors">
                                {post.title}
                            </h4>
                            <span className="hidden sm:flex items-center gap-1 text-rose-600 font-black text-sm whitespace-nowrap bg-rose-50 px-3 py-1 rounded-full">
                                <DollarSign className="w-3.5 h-3.5" />
                                {post.salary ? `${post.salary}` : "Thỏa thuận"}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1.5">
                                <div className="h-5 w-5 rounded-full bg-slate-100 overflow-hidden">
                                    {post.authorAvatar ? (
                                        <img src={post.authorAvatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                                            {post.authorName?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className="text-slate-500 text-xs font-medium">{post.authorName}</span>
                                <VerificationBadge />
                            </div>
                            <span className="text-slate-300 text-xs">•</span>
                            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                2 giờ trước
                            </div>
                        </div>
                    </div>

                    {/* Tags & Location */}
                    <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl text-slate-600 text-xs font-bold">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            {post.location}
                        </div>
                        <div className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 rounded-xl text-rose-600 text-xs font-bold">
                            <DollarSign className="w-3.5 h-3.5" />
                            {post.salary || "Thỏa thuận"}
                        </div>
                    </div>
                </div>

                {/* Actions - Cột dọc bên phải (Desktop) */}
                <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-4">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleLike}
                            className={cn(
                                "p-2.5 rounded-full transition-all",
                                isLiked ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                            )}
                        >
                            <Heart size={20} className={cn(isLiked && "fill-current")} />
                        </button>
                        <button 
                            onClick={() => setShowComments(!showComments)}
                            className={cn(
                                "p-2.5 rounded-full transition-all",
                                showComments ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                            )}
                        >
                            <MessageSquare size={20} />
                        </button>
                    </div>
                    <button className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Comment Section */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-2 border-t border-slate-100">
                            <CommentSection postId={post.id} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}