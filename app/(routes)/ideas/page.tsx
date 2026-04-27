'use client';

import { useState, useEffect, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, MessageSquare, Heart, Plus,
  Smartphone, Rocket, Music, Video,
  Trophy, ArrowUp, ChevronRight, Share2, X,
  LucideIcon
} from "lucide-react";
import { ideaService, Idea } from "@/services/idea.services";
import { notificationService } from "@/services/notification.services";
import { useAuth } from "@/hooks/useAuth";
import CreateIdeaModal from "@/components/cards/CreateIdeaModal";
import AuthGuardModal from "@/components/AuthModal";
import FilterBar from "@/components/FilterBar";
import Image from "next/image";
import { useViewStore } from "@/stores/useViewStore";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "SaaS / App": Smartphone,
  "YouTube": Music,
  "TikTok": Music,
  "Cinema": Video,
  "Startup": Rocket,
  "Other": Sparkles
};

const CATEGORIES = ["SaaS / App", "YouTube", "TikTok", "Cinema", "Startup", "Other"];

export default function IdeasPage() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [leaderboard, setLeaderboard] = useState<Idea[]>([]);
  const [view, setView] = useState<'explore' | 'leaderboard'>('explore');
  const [timeframe, setTimeframe] = useState<'month' | 'year'>('month');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const setCreateModal = useViewStore(s => s.setCreateModal);

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.problem.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || idea.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    let unsubscribe: any = null;
    if (selectedIdea) {
      ideaService.subscribeComments(selectedIdea.id!, (data) => {
        setComments(data);
      }).then(unsub => {
        unsubscribe = unsub;
      });
    } else {
      setComments([]);
      setNewComment("");
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedIdea]);

  const handleSendComment = async () => {
    if (!user || !selectedIdea || !newComment.trim()) return;
    try {
      await ideaService.addComment(selectedIdea.id!, {
        text: newComment,
        userId: user.uid,
        userName: user.displayName || "Explorer",
        userAvatar: user.photoURL || ""
      });

      await notificationService.notify(selectedIdea.authorId, {
        senderId: user.uid,
        senderName: user.displayName || "Explorer",
        senderAvatar: user.photoURL || "",
        type: 'comment',
        content: `vừa bình luận vào ý tưởng "${selectedIdea.title}" của bạn.`,
        link: `/ideas?id=${selectedIdea.id}`
      });

      setNewComment("");
    } catch (error) {
      console.error("Failed to send comment:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [allIdeas, topIdeas] = await Promise.all([
        ideaService.getAllIdeas(),
        ideaService.getTopIdeas()
      ]);
      setIdeas(allIdeas);
      setLeaderboard(topIdeas);
    } catch (error) {
      console.error("Failed to load ideas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleVote = async (e: MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) {
      setAuthMessage("Vui lòng đăng nhập để bình chọn (vote) ý tưởng này!");
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await ideaService.toggleVote(id, user.uid);

      // Find the idea to get authorId
      const idea = ideas.find(i => i.id === id) || leaderboard.find(i => i.id === id);
      if (idea) {
        await notificationService.notify(idea.authorId, {
          senderId: user.uid,
          senderName: user.displayName || "Explorer",
          senderAvatar: user.photoURL || "",
          type: 'vote',
          content: `đã bình chọn cho ý tưởng "${idea.title}" của bạn.`,
          link: `/ideas`
        });
      }

      await loadData(); // Refresh data or update local state
    } catch (error) {
      console.error("Failed to toggle vote:", error);
    }
  };

  const getIcon = (category: string) => CATEGORY_ICONS[category] || Sparkles;

  return (
    <div className="w-full pb-20">
      <section className="relative w-full min-h-[380px] md:min-h-[520px] flex items-center overflow-hidden bg-slate-950">
        {/* Background Image */}
        <Image
          src="/ideas.png"
          alt="Idea Lab Workshop"
          fill
          priority
          className="object-cover object-center opacity-60 scale-105" // scale nhẹ để tạo cảm giác cinematic
        />

        {/* Overlays: Xử lý ánh sáng để text luôn rõ */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent z-0" />

        {/* Content Inside: Căn giữa theo hệ thống max-w-7xl */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full pt-12 md:pt-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">

            {/* Left Side: Text Branding */}
            <div className="space-y-4 md:space-y-6 max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Idea Lab</span>
              </motion.div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-8xl font-black text-white tracking-tight leading-[1.05]">
                Xưởng sản xuất <br />
                <span className="text-rose-500 italic drop-shadow-2xl">Ý tưởng</span>
              </h1>

              <p className="text-slate-300 max-w-md text-sm md:text-lg leading-relaxed font-medium drop-shadow-md">
                Nơi mọi dự án bắt đầu. Dự án sẽ chính thức khởi động khi đủ lượt
                <span className="text-rose-400 font-bold ml-1.5 uppercase">"Commit"</span>.
              </p>
            </div>

            {/* Right Side: Navigation Glassmorphism */}
            <div className="flex items-center gap-2 p-1.5 bg-white/5 backdrop-blur-2xl rounded-2xl md:rounded-[2.5rem] border border-white/10 shadow-2xl self-start md:self-end mb-6 md:mb-2">
              <div className="flex gap-1">
                <button
                  onClick={() => setView('explore')}
                  className={`px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all duration-500 ${view === 'explore'
                    ? 'bg-white text-slate-900 shadow-[0_10px_20px_rgba(255,255,255,0.1)] scale-105'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                >
                  Explore
                </button>
                <button
                  onClick={() => setView('leaderboard')}
                  className={`px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all duration-500 ${view === 'leaderboard'
                    ? 'bg-rose-500 text-white shadow-[0_10px_20px_rgba(244,63,94,0.3)] scale-105'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                >
                  Top 100
                </button>
              </div>

              <div className="w-[1px] h-10 bg-white/10 mx-2 hidden sm:block" />

              <button
                onClick={() => {
                  if (!user) {
                    setAuthMessage("Vui lòng đăng nhập để đăng ý tưởng!");
                    setIsAuthModalOpen(true);
                  } else {
                    setCreateModal();
                  }
                }}
                className="bg-rose-500 hover:bg-rose-600 text-white w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-xl md:rounded-[2rem] transition-all active:scale-90 shadow-lg shadow-rose-500/20"
              >
                <Plus size={24} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <CreateIdeaModal loadData={() => {
        loadData();
      }} />

      <AuthGuardModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        message={authMessage}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {view === 'explore' && (
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            placeholder="Khảo sát nhu cầu thị trường..."
          />
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-rose-500 rounded-full animate-spin" />
            </div>
          ) : view === 'explore' ? (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredIdeas.map((idea) => {
                const Icon = getIcon(idea.category);
                const isVoted = user && idea.votes?.includes(user.uid);
                return (
                  <motion.div
                    key={idea.id}
                    layoutId={`idea-${idea.id}`}
                    onClick={() => setSelectedIdea(idea)}
                    className="group cursor-pointer relative h-[480px] md:h-[520px] rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl bg-slate-900 border-4 border-white"
                  >
                    <img src={idea.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    <div className="relative h-full flex flex-col justify-between p-6 md:p-10 text-white">
                      <div className="flex justify-between items-start">
                        <div className="bg-white/10 backdrop-blur-md p-2 md:p-3 rounded-2xl border border-white/20">
                          <Icon size={20} className="md:size-6 text-rose-400" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="bg-rose-500 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg">
                            {idea.demandPercentage}% Demand
                          </div>
                          <div className="bg-white/10 backdrop-blur-md px-2 md:px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-white/60">
                            By {idea.authorName}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 md:space-y-4">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-rose-400">{idea.category}</span>
                        <h3 className="text-2xl md:text-3xl font-black leading-none tracking-tight group-hover:text-rose-200 transition-colors uppercase italic">{idea.title}</h3>
                        <p className="text-white/60 text-xs md:text-sm font-medium line-clamp-2">{idea.problem}</p>

                        <div className="grid grid-cols-2 gap-3 md:gap-4 pt-4 md:pt-6">
                          <button
                            onClick={(e) => toggleVote(e, idea.id!)}
                            className={`flex items-center justify-center gap-2 md:gap-3 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all transform active:scale-90 ${isVoted ? 'bg-rose-500 border-none' : 'bg-white/10 hover:bg-white/20 border border-white/10'}`}
                          >
                            <Heart size={16} fill={isVoted ? "white" : "none"} className={isVoted ? "animate-pulse" : ""} />
                            {idea.votes?.length || 0}
                          </button>
                          <button className="flex items-center justify-center gap-2 md:gap-3 py-4 md:py-5 rounded-2xl md:rounded-3xl bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-rose-500 hover:text-white transition-all">
                            <MessageSquare size={16} />
                            {idea.commentCount || 0}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[48px] border border-slate-100 shadow-2xl overflow-hidden"
            >
              <div className="p-6 md:p-12 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
                <div className="flex items-center gap-4 self-start md:self-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-rose-500 text-white rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl shadow-rose-200">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic">Hall of <span className="text-rose-500">Fame</span></h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] md:text-[10px]">Cập nhật mỗi 24 giờ</p>
                  </div>
                </div>

                <div className="flex w-full md:w-auto bg-white p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm">
                  <button
                    onClick={() => setTimeframe('month')}
                    className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === 'month' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Tháng này
                  </button>
                  <button
                    onClick={() => setTimeframe('year')}
                    className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === 'year' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Năm {new Date().getFullYear()}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                      <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 w-16 md:w-24">Rank</th>
                      <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dự án</th>
                      <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hidden sm:table-cell">Founder</th>
                      <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Votes</th>
                      <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Growth</th>
                      <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 w-12 md:w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group hover:bg-slate-50 transition-colors border-b border-slate-50"
                      >
                        <td className="px-4 md:px-10 py-4 md:py-8">
                          <div className={`w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center font-black text-xs md:text-sm italic ${index < 3 ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-4 md:px-10 py-4 md:py-8">
                          <div className="font-black text-slate-900 uppercase tracking-tight group-hover:text-rose-500 transition-colors italic text-[10px] md:text-base line-clamp-1">{item.title}</div>
                        </td>
                        <td className="px-4 md:px-10 py-4 md:py-8 hidden sm:table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">{item.authorName?.[0] || 'U'}</div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.authorName}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-10 py-4 md:py-8 text-right">
                          <span className="font-black text-rose-500 tabular-nums text-[10px] md:text-base">{item.votes?.length || 0}</span>
                        </td>
                        <td className="px-4 md:px-10 py-4 md:py-8 text-right text-green-500 font-black tabular-nums text-[9px] md:text-base">
                          <div className="flex items-center justify-end gap-0.5 md:gap-1">
                            <ArrowUp size={8} />
                            {Math.floor(Math.random() * 20) + 5}%
                          </div>
                        </td>
                        <td className="px-4 md:px-10 py-4 md:py-8">
                          <button onClick={() => setSelectedIdea(item)} className="text-slate-200 group-hover:text-rose-500 transition-colors">
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-8 md:p-12 text-center bg-slate-50/50">
                <button className="w-full md:w-auto px-12 py-5 bg-white border border-slate-200 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                  Tải thêm dữ liệu (Top 100)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pitch Modal */}
      <AnimatePresence>
        {selectedIdea && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center py-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIdea(null)}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl"
            />
            <motion.div
              layoutId={`idea-${selectedIdea.id}`}
              className="relative bg-white w-full max-w-5xl h-[95vh] md:h-[90vh] rounded-[32px] md:rounded-[64px] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <div className="w-full md:w-1/2 h-1/3 md:h-full relative bg-slate-900 flex-shrink-0">
                <img src={selectedIdea.imageUrl} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <button
                  onClick={() => setSelectedIdea(null)}
                  className="absolute top-6 left-6 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all md:hidden"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12 right-6 md:right-12 text-white">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <div className="p-3 md:p-4 bg-rose-500 rounded-2xl md:rounded-3xl shadow-2xl shadow-rose-500/20">
                      {(() => {
                        const Icon = getIcon(selectedIdea.category);
                        return <Icon size={24} />;
                      })()}
                    </div>
                    <div>
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">{selectedIdea.category}</span>
                      <h2 className="text-xl md:text-4xl font-black italic tracking-tighter uppercase">{selectedIdea.title}</h2>
                    </div>
                  </div>
                  <div className="flex gap-4 md:gap-6">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Thị trường</span>
                      <span className="font-black text-sm md:text-xl italic">{selectedIdea.demandPercentage}% Demand</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Người ủng hộ</span>
                      <span className="font-black text-sm md:text-xl italic">{selectedIdea.votes?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6 md:p-16 overflow-y-auto bg-white flex flex-col">
                <div className="hidden md:flex justify-end mb-12">
                  <button
                    onClick={() => setSelectedIdea(null)}
                    className="p-4 hover:bg-slate-50 rounded-full transition-all text-slate-400 hover:text-slate-900 border border-slate-100"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 space-y-8 md:space-y-12 pb-24 relative">
                  <section>
                    <h4 className="text-[9px] md:text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-3 md:mb-4">Vấn đề</h4>
                    <p className="text-lg md:text-2xl text-slate-800 font-bold leading-tight tracking-tight">{selectedIdea.problem || "Vấn đề chưa được mô tả chi tiết."}</p>
                  </section>

                  <section>
                    <h4 className="text-[9px] md:text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-3 md:mb-4">Giải pháp</h4>
                    <p className="text-base md:text-xl text-slate-600 font-medium leading-relaxed">{selectedIdea.solution || "Giải pháp đang được hoàn thiện."}</p>
                  </section>

                  <div className="pt-8 md:pt-12 border-t border-slate-100">
                    <button
                      onClick={(e) => toggleVote(e, selectedIdea.id!)}
                      className={`w-full py-4 md:py-6 rounded-[24px] md:rounded-[32px] font-black uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 text-[10px] md:text-xs ${user && selectedIdea.votes?.includes(user.uid) ? 'bg-slate-900 text-white' : 'bg-rose-500 text-white shadow-rose-200'}`}
                    >
                      <Heart size={18} fill={user && selectedIdea.votes?.includes(user.uid) ? "white" : "none"} />
                      {user && selectedIdea.votes?.includes(user.uid) ? "Đã vote ủng hộ" : "Vote ủng hộ ngay"}
                    </button>
                  </div>

                  <section className="pt-8 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Thảo luận ({selectedIdea.commentCount})</h4>
                      <button className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Mới nhất</button>
                    </div>

                    <div className="space-y-6 mb-12">
                      {comments.length === 0 ? (
                        <div className="text-slate-400 italic text-sm py-4">Kết nối với pitch này bằng những góp ý đầu tiên...</div>
                      ) : (
                        comments.map(c => (
                          <div key={c.id} className="flex gap-4">
                            <img src={c.userAvatar || `https://ui-avatars.com/api/?name=${c.userName}`} className="w-8 h-8 rounded-xl object-cover flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{c.userName}</span>
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

                    {/* Input Box - Sticky at bottom of modal content area */}
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
                    <div className="flex items-center gap-4">
                      <img src={selectedIdea.authorAvatar || `https://ui-avatars.com/api/?name=${selectedIdea.authorName}`} className="w-10 md:w-12 h-10 md:h-12 rounded-2xl object-cover border border-slate-100" />
                      <div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pitcher</div>
                        <div className="font-black text-slate-900 italic tracking-tight text-sm md:text-base">{selectedIdea.authorName}</div>
                      </div>
                    </div>
                    <button className="p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 text-slate-400 hover:text-rose-500 transition-all">
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
