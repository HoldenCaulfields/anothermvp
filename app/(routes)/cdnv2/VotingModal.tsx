'use client'
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Heart, Award, TrendingUp, Users, Timer, Info, Medal, MousePointerClick } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useVoteStore } from "@/stores/useVoteStore";
import { useAuth } from "@/hooks/useAuth";
import { toggleVote, subscribeUserVotes } from "@/services/votecdn.services";
import { useCandidates } from "./useVotescdn";
import CreateCandidateModal from "./CreateCandidate";

type TabType = "candidates" | "leaderboard" | "rules";

export default function VotingModal() {
  const [activeTab, setActiveTab] = useState<TabType>("candidates");
  const [timeLeft, setTimeLeft] = useState("12:45:30");
  const [isVoting, setIsVoting] = useState(false);

  const competition = useVoteStore((s) => s.selectedCompetition);
  const setSelectedCompetition = useVoteStore((s) => s.setSelectedCompetition);
  const toggleLocalVote = useVoteStore(s => s.toggleLocalVote);
  const votedIds = useVoteStore(s => s.votedIds);
  const setVotedIds = useVoteStore(s => s.setVotedIds);

  const { user, login } = useAuth();
  const candidates = useCandidates();

  // 1. Đồng bộ hóa Realtime Lượt vote của User theo từng cuộc thi cụ thể
  useEffect(() => {
    if (!user || !competition?.id) return;

    const unsub = subscribeUserVotes(user.uid, competition.id, (ids) => {
      setVotedIds(ids);
    });

    return () => unsub();
  }, [user, competition?.id, setVotedIds]);

  // 2. Logic đếm ngược (Timer)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const [h, m, s] = prev.split(":").map(Number);
        let totalSeconds = h * 3600 + m * 60 + s - 1;
        if (totalSeconds < 0) return "00:00:00";
        const newH = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
        const newM = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
        const newS = (totalSeconds % 60).toString().padStart(2, "0");
        return `${newH}:${newM}:${newS}`;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 4. Tính toán Leaderboard
  const sortedCandidates = useMemo(() =>
    ([...candidates].sort((a, b) => b.votesCount - a.votesCount)),
    [candidates]
  );

  const maxVotes = sortedCandidates[0]?.votesCount || 1;

  if (!competition) return null;

  // 3. Xử lý Vote với Optimistic Update
  const handleVote = async (candidateId: string) => {
    if (!user) { 
      alert("Vui lòng đăng nhập để bình chọn");
      login(); return; }
      
    if (isVoting) return;

    try {
      setIsVoting(true);
      // Cập nhật UI ngay lập tức để tạo cảm giác mượt mà
      toggleLocalVote(candidateId);

      // Gửi data lên Firestore với contestId để phân loại
      await toggleVote(user.uid, candidateId, competition.id);
    } catch (err) {
      // Nếu lỗi, hoàn tác lại trạng thái UI
      toggleLocalVote(candidateId);
      console.error("Vote error:", err);
      alert("Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-3000 flex items-center justify-center">
        {/* Overlay Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedCompetition(null)}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 40 }}
          className="relative w-full max-w-2xl h-full pb-20 bg-slate-50 md:rounded-[40px] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Scroll Container */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* Header Section */}
            <div className="relative h-56 flex-shrink-0">
              <img src={competition.img} alt={competition.title} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedCompetition(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-xl rounded-full text-white hover:rotate-90 transition-transform duration-300 z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-rose-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-rose-600/30">
                    {competition.type}
                  </span>
                  <div className="flex items-center gap-1.5 text-white text-[10px] font-black uppercase tracking-wider bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    <Timer className="w-3.5 h-3.5 text-rose-400" /> {timeLeft}
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white drop-shadow-md">{competition.title}</h2>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="sticky top-0 z-100 bg-white/80 backdrop-blur-md px-4 border-b border-slate-200 flex justify-between md:justify-center md:gap-8 overflow-x-auto no-scrollbar">
              {[
                { id: "candidates", label: "Thí sinh", icon: Users },
                { id: "leaderboard", label: "Xếp hạng", icon: Trophy },
                { id: "rules", label: "Thể lệ", icon: Info },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-all font-bold text-xs uppercase tracking-widest whitespace-nowrap ${activeTab === tab.id ? "border-rose-600 text-rose-600" : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>

            {/* Dynamic Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar bg-slate-50/50">
              <AnimatePresence mode="wait">
                {activeTab === "candidates" && (
                  <motion.div
                    key="candidates"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                  >
                    {candidates.length > 0 ? (
                      candidates.map((candidate) => (
                        <CandidateCard
                          key={candidate.id}
                          candidate={candidate}
                          voted={votedIds.includes(candidate.id)}
                          onVote={handleVote}
                          isVoting={isVoting}
                        />
                      ))
                    ) : (
                      <div className="col-span-full py-20 text-center">
                        <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">Chưa có thí sinh tham gia cuộc thi này.</p>
                        <p className="text-slate-300 text-xs mt-1 uppercase tracking-widest">Hãy là người đầu tiên!</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "leaderboard" && (
                  <motion.div
                    key="leaderboard"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <LeaderboardHeader candidates={candidates} />
                    {sortedCandidates.map((candidate, index) => (
                      <LeaderboardItem key={candidate.id} candidate={candidate} index={index} maxVotes={maxVotes} />
                    ))}
                  </motion.div>
                )}

                {activeTab === "rules" && (
                  <motion.div
                    key="rules"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <RulesSection />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Action Button */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-2 pointer-events-none">
              <div className="max-w-md mx-auto pointer-events-auto">
                <CreateCandidateModal contestId={competition.id} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// --- SUB-COMPONENTS ---

function CandidateCard({ candidate, voted, onVote, isVoting }: any) {
  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
      <div className="relative h-60 overflow-hidden">
        <img src={candidate.img} alt={candidate.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-rose-600 text-[10px] font-black shadow-sm">
          SBD: {candidate.sbd}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-black text-slate-900 text-lg line-clamp-1">{candidate.name}</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{candidate.dept}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-rose-600">
            <Heart className={`w-5 h-5 transition-transform ${voted ? 'fill-rose-600 scale-110' : 'group-hover:scale-110'}`} />
            <span className="font-black text-xl">{candidate.votesCount.toLocaleString()}</span>
          </div>
          <button
            disabled={isVoting}
            onClick={() => onVote(candidate.id)}
            className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${voted
                ? "bg-rose-50 text-rose-600 border border-rose-100"
                : "bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/20 active:scale-95"
              } disabled:opacity-50`}
          >
            {voted ? "Đã vote" : "Bình chọn"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LeaderboardHeader({ candidates }: any) {
  const totalVotes = candidates.reduce((acc: any, c: any) => acc + (c.votesCount || 0), 0);

  return (
    <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-rose-200 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-lg">Tổng lượt bình chọn</h3>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Cập nhật liên tục</p>
          </div>
        </div>
        <div className="text-right">
          <motion.div
            key={totalVotes}
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-black"
          >
            {totalVotes.toLocaleString()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardItem({ candidate, index, maxVotes }: any) {
  const colors = ["text-amber-500", "text-slate-400", "text-orange-500"];
  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-4 group hover:border-rose-200 transition-colors">
      <div className="w-8 flex-shrink-0 flex items-center justify-center">
        {index < 3 ? <Award className={`w-7 h-7 ${colors[index]}`} /> : <span className="font-black text-slate-300">#{index + 1}</span>}
      </div>
      <img src={candidate.img} alt="" className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-black text-slate-900 text-sm truncate pr-2">{candidate.name}</h4>
          <span className="text-sm font-black text-rose-600">{candidate.votesCount.toLocaleString()}</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(candidate.votesCount / maxVotes) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

function RulesSection() {
  const prizes = [
    { title: "Giải Nhất", reward: "200.000đ + Vương miện", icon: Medal, color: "bg-amber-50 text-amber-600 border-amber-200" },
    { title: "Giải Nhì", reward: "100.000đ + Giấy khen", icon: Medal, color: "bg-slate-50 text-slate-600 border-slate-200" },
    { title: "Giải Ba", reward: "50.000đ + Giấy khen", icon: Medal, color: "bg-orange-50 text-orange-600 border-orange-200" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-rose-600" /> Cơ cấu giải thưởng
        </h3>
        <div className="grid gap-3">
          {prizes.map((p, i) => (
            <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${p.color}`}>
              <div className="flex items-center gap-3">
                <p.icon className="w-6 h-6" />
                <span className="font-black text-sm">{p.title}</span>
              </div>
              <span className="font-bold text-xs uppercase">{p.reward}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-rose-600 p-6 rounded-[2rem] text-white shadow-lg shadow-rose-600/20">
        <h3 className="font-black mb-3 flex items-center gap-2 text-sm uppercase tracking-widest">
          <Info className="w-5 h-5" /> Thông tin cuộc thi:
        </h3>
        <ul className="text-xs space-y-3 font-medium opacity-90 list-none pl-1">
          <li className="flex gap-2"><MousePointerClick className="w-3 h-3 flex-shrink-0 mt-0.5" /> Cuộc thi tổ chức nhằm tạo sân chơi cho cộng đồng sinh viên.</li>
          <li className="flex gap-2"><MousePointerClick className="w-3 h-3 flex-shrink-0 mt-0.5" /> Gắn kết các bạn bè sinh viên trong trường chúng ta.</li>
          <li className="flex gap-2"><MousePointerClick className="w-3 h-3 flex-shrink-0 mt-0.5" /> Hãy cho tôi thấy tài năng tiềm ẩn của các bạn.</li>
          <li className="flex gap-2"><MousePointerClick className="w-3 h-3 flex-shrink-0 mt-0.5" /> Cùng nhau xây dựng cộng đồng sinh viên Cao đẳng nghề đầy trẻ trung, năng động nhé!</li>
        </ul>
      </div>
    </div>
  );
}