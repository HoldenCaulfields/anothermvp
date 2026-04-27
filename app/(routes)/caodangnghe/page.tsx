"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./useAuth";
import { subscribePosts, toggleLike } from "./posts.services";
import { subscribeEvents, toggleRsvp } from "./events.services";
import { castVote, subscribeCandidates } from "./votes.services";
import { setMyMood as saveMyMood, subscribeTodayMoods } from "./moods.services";
import { subscribeDatingProfiles, upsertDatingProfile } from "./dating.services";
import { avatarFromName, updateProfile } from "./user.services";
import type { DatingProfile, EventDoc, Post, VoteCandidate } from "./types";
import { LoginGate } from "./LoginGate";
import { CommentsDialog } from "./CommentsDialog";
import { CreatePostDialog } from "./CreatePostDialog";
import { ChatDialog } from "./ChatDialog";
import { MessagesDrawer } from "./MessagesDrawer";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import FeedbackHub from "./FeedbackHub";
import Contests from "./Contests";
import VotingModal from "./VotingModal";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Tab = "feed" | "events" | "vote" | "dating";

interface MoodItem { emoji: string; label: string }

// ─── Static UI data ────────────────────────────────────────────────────────────
const MOODS: MoodItem[] = [
  { emoji: "🔥", label: "Hứng khởi" },
  { emoji: "😴", label: "Mệt mỏi" },
  { emoji: "😎", label: "Chill" },
  { emoji: "📚", label: "Chăm học" },
  { emoji: "🤩", label: "Phấn khích" },
  { emoji: "💔", label: "Buồn bã" },
];

const TABS = [
  { key: "feed" as Tab, icon: "😎", label: "Cộng đồng" },
  { key: "vote" as Tab, icon: "🔥", label: "Bình chọn" },
  { key: "events" as Tab, icon: "🎉", label: "Sự kiện" },
  { key: "dating" as Tab, icon: "💘", label: "Dating" },
];

const TAG_CLS: Record<string, string> = {
  "Văn nghệ": "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "Thông tin": "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "Bình chọn": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Học tập": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(ts: any): string {
  if (!ts?.toDate) return "vừa xong";
  const sec = Math.floor((Date.now() - ts.toDate().getTime()) / 1000);
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)} phút`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} giờ`;
  return `${Math.floor(sec / 86400)} ngày`;
}

function daysUntil(ts: any): number {
  if (!ts?.toDate) return 0;
  const ms = ts.toDate().getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

// ─── Atoms ─────────────────────────────────────────────────────────────────────
const Av = ({ s, glow, sz = "md", img }: { s: string; glow?: boolean; sz?: "sm" | "md" | "lg"; img?: string }) => {
  const dim = sz === "sm" ? "w-8 h-8 text-xs" : sz === "lg" ? "w-14 h-14 text-sm" : "w-10 h-10 text-sm";
  if (img) {
    return <img src={img} alt={s} className={`${dim} rounded-xl object-cover flex-shrink-0 ${glow ? "shadow-[0_0_14px_rgba(244,63,94,0.5)]" : ""}`} />;
  }
  return (
    <div className={`${dim} rounded-xl flex-shrink-0 flex items-center justify-center font-black text-white bg-gradient-to-br from-rose-500 to-rose-700 ${glow ? "shadow-[0_0_14px_rgba(244,63,94,0.5)]" : ""}`}>
      {s}
    </div>
  );
};

const Tag = ({ label }: { label: string }) => (
  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${TAG_CLS[label] ?? "bg-white/5 text-white/40 border-white/10"}`}>{label}</span>
);

// ─── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ onlineCount, nextEvent }: { onlineCount: number; nextEvent: EventDoc | null }) {
  return (
    <div className="relative w-full overflow-hidden min-h-80 md:min-h-110 bg-gradient-to-br from-rose-900/40 via-[#0C0C0F] to-[#09090B]">
      <img
        src="/cdnbg.jpg"
        className="absolute inset-0 w-full h-full object-cover opacity-90"
        alt="Campus"
      />
      <div className="absolute inset-0 flex flex-col justify-end px-8 pb-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
              <span className="text-[11px] font-semibold text-white/50">
                <span className="text-emerald-400 font-bold">{onlineCount}</span> sinh viên online
              </span>
            </div>
            <p className="text-[10px] font-black tracking-[0.3em] text-rose-400 uppercase mb-2">ĐCNA · K25</p>
            <h1 className="text-3xl md:text-6xl font-black leading-none tracking-tighter text-white">
              Hội Sinh Viên<br /><span className="text-rose-500">Cao Đẳng Nghề</span>
            </h1>
          </div>
          <div className="hidden sm:flex flex-col gap-2 items-end pb-1">
            {nextEvent && (
              <div className="rounded-full px-3.5 py-1.5 text-xs font-bold backdrop-blur-sm bg-rose-500/20 border border-rose-500/35 text-rose-300">
                {nextEvent.icon} {nextEvent.title} ⚡
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Streak ────────────────────────────────────────────────────────────────────
function StreakWidget({ streak }: { streak: number }) {
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0
  return (
    <div className="rounded-2xl border border-rose-500/15 bg-rose-500/[0.04] p-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-[9px] font-black tracking-widest text-white/30 uppercase">Streak</p>
          <p className="text-2xl font-black text-white mt-0.5">{streak} <span className="text-rose-400 text-sm">ngày 🔥</span></p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-white/30">Cấp</p>
          <p className="text-lg font-black text-amber-400">{streak >= 30 ? "💎" : streak >= 7 ? "🥇" : "🥉"}</p>
        </div>
      </div>
      <div className="flex gap-1.5">
        {days.map((d, i) => {
          const done = i <= todayIdx && i > todayIdx - Math.min(streak, 7);
          return (
            <div key={d} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full aspect-square max-w-8 rounded-lg flex items-center justify-center text-[9px] font-black ${done ? "bg-rose-500 text-white shadow-[0_2px_8px_rgba(244,63,94,0.45)]" : "bg-white/5 border border-white/8"}`}>
                {done ? "✓" : ""}
              </div>
              <span className={`text-[9px] font-bold ${done ? "text-rose-400" : "text-white/25"}`}>{d}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Alert ─────────────────────────────────────────────────────────────────────
function AlertWidget({ event, onView }: { event: EventDoc | null; onView: () => void }) {
  if (!event) return null;
  const d = daysUntil(event.dateTs);
  return (
    <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/8 to-transparent p-4">
      <p className="text-[9px] font-black tracking-[0.25em] text-rose-400 uppercase mb-3">⚡ {d === 0 ? "Hôm nay" : d === 1 ? "Ngày mai" : `${d} ngày nữa`}</p>
      <div className="flex gap-3 items-center mb-3">
        <span style={{ fontSize: 26 }}>{event.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm text-white leading-tight">{event.title}</p>
          <p className="text-[11px] text-white/40 mt-0.5">{event.date} · {event.location || ""}</p>
          <p className="text-[11px] text-rose-400 font-bold mt-0.5">{event.going} người đăng ký</p>
        </div>
      </div>
      <button onClick={onView} className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl py-2.5 text-xs font-black cursor-pointer border-0 transition-colors">
        Xem chi tiết →
      </button>
    </div>
  );
}

// ─── Mood ──────────────────────────────────────────────────────────────────────
function MoodWidget({ moodCounts, selected, onSelect }: { moodCounts: Record<string, number>; selected: string | null; onSelect: (m: string) => void }) {
  return (
    <div>
      <p className="text-[9px] font-black tracking-widest text-white/30 uppercase mb-3">Mood hôm nay?</p>
      <div className="grid grid-cols-3 gap-1.5">
        {MOODS.map((m) => {
          const on = selected === m.label;
          const count = moodCounts[m.label] || 0;
          return (
            <button
              key={m.label}
              onClick={() => onSelect(m.label)}
              className={`rounded-xl p-2.5 text-center cursor-pointer border transition-all ${on ? "bg-rose-500/12 border-rose-500/35" : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"}`}
            >
              <div style={{ fontSize: 19 }}>{m.emoji}</div>
              <p className={`text-[10px] font-bold mt-0.5 leading-tight ${on ? "text-rose-400" : "text-white/50"}`}>{m.label}</p>
              <p className="text-[9px] text-white/25 mt-0.5">{count}</p>
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="mt-2 rounded-xl border border-rose-500/15 bg-rose-500/[0.05] px-3 py-2 text-xs text-white/50">
          💬 <span className="text-rose-400 font-bold">{moodCounts[selected] || 1} bạn</span> cũng đang <span className="text-white font-bold">{selected}</span>
        </div>
      )}
    </div>
  );
}

// ─── Upcoming mini ─────────────────────────────────────────────────────────────
function UpcomingMini({ events, onGo }: { events: EventDoc[]; onGo: () => void }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-[9px] font-black tracking-widest text-white/30 uppercase mb-3">Lịch sắp tới</p>
      <div className="space-y-3">
        {events.slice(0, 3).map((e) => (
          <button key={e.id} onClick={onGo} className="w-full flex items-center gap-2.5 group bg-transparent border-0 p-0 cursor-pointer text-left">
            <span style={{ fontSize: 17 }}>{e.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white/70 truncate group-hover:text-white transition-colors">{e.title}</p>
              <p className="text-[10px] text-white/30">{e.date}</p>
            </div>
            <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">{daysUntil(e.dateTs)}d</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Stats ─────────────────────────────────────────────────────────────────────
function StatsWidget({ posts, online, events }: { posts: number; online: number; events: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 grid grid-cols-3 gap-2 text-center">
      {[{ n: posts.toLocaleString(), l: "Bài viết" }, { n: online.toString(), l: "Hôm nay" }, { n: events.toString(), l: "Sự kiện" }].map((s) => (
        <div key={s.l}>
          <p className="text-lg font-black text-white">{s.n}</p>
          <p className="text-[10px] text-white/30 mt-0.5">{s.l}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Post ──────────────────────────────────────────────────────────────────────
function PostCard({ post, onComment, onLike }: { post: Post; onComment: () => void; onLike: () => void }) {
  const { user } = useAuth();
  const liked = !!user && post.likedBy?.includes(user.uid);
  return (
    <article className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors">
      <div className="flex gap-2.5 items-center mb-3">
        <Av s={post.authorAvatar} sz="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm text-white">{post.authorName}</p>
          <p className="text-[10px] text-white/30 mt-0.5">{timeAgo(post.createdAt)} trước</p>
        </div>
        <Tag label={post.tag} />
      </div>
      <p className="text-sm text-white/60 leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
      <div className="border-t border-white/[0.05] pt-3 flex gap-5">
        <button onClick={onLike} className={`flex items-center gap-1.5 text-xs font-bold cursor-pointer bg-transparent border-0 p-0 transition-colors ${liked ? "text-rose-400" : "text-white/30 hover:text-white/60"}`}>
          <span style={{ fontSize: 14 }}>{liked ? "❤️" : "🤍"}</span> {post.likes}
        </button>
        <button onClick={onComment} className="flex items-center gap-1.5 text-xs font-bold text-white/30 hover:text-white/60 cursor-pointer bg-transparent border-0 p-0 transition-colors">
          <span style={{ fontSize: 14 }}>💬</span> {post.commentsCount}
        </button>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            toast.success("Đã sao chép link");
          }}
          className="ml-auto text-xs font-bold text-white/30 hover:text-white/60 cursor-pointer bg-transparent border-0 p-0 transition-colors"
        >
          ↗ Chia sẻ
        </button>
      </div>
    </article>
  );
}

// ─── Event card ────────────────────────────────────────────────────────────────
function EventCard({ event, going, onToggle }: { event: EventDoc; going: boolean; onToggle: () => void }) {
  const d = daysUntil(event.dateTs);
  return (
    <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors overflow-hidden group">
      {d <= 1 && (
        <span className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl rounded-tr-2xl tracking-widest">{d === 0 ? "HÔM NAY" : "NGÀY MAI"}</span>
      )}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0 text-2xl group-hover:scale-110 transition-transform">
          {event.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm text-white leading-tight">{event.title}</p>
          <p className="text-[11px] text-white/35 mt-0.5">{event.date}</p>
          <p className="text-[11px] text-white/25 mt-1">👥 {event.going} người</p>
        </div>
        <button
          onClick={onToggle}
          className={`flex-shrink-0 rounded-xl px-3.5 py-2 text-xs font-black transition-all cursor-pointer border-0 ${going ? "bg-rose-500 text-white shadow-[0_4px_16px_rgba(244,63,94,0.35)]" : "bg-white/5 border border-white/10 text-white/45 hover:bg-white/10 hover:text-white"}`}
        >
          {going ? "✓ Đã đăng" : "Tham gia"}
        </button>
      </div>
    </div>
  );
}

// ─── Vote bar ──────────────────────────────────────────────────────────────────
function VoteBar({ c, total, voted, isLeader, onVote }: { c: VoteCandidate; total: number; voted: boolean; isLeader: boolean; onVote: () => void }) {
  const pct = total > 0 ? Math.round((c.votes / total) * 100) : 0;
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-2.5 mb-2">
        <Av s={c.avatar} sz="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-white">{c.name}</span>
            {isLeader && <span className="text-[10px] text-amber-400 font-bold">{c.category === "hoa_khoi" ? "👑 Dẫn đầu" : "🏆 Dẫn đầu"}</span>}
          </div>
          <p className="text-[10px] text-white/30">{c.dept}</p>
        </div>
        <button
          onClick={onVote}
          disabled={voted}
          className={`rounded-lg px-3 py-1.5 text-xs font-black border-0 transition-all ${voted ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-default" : "bg-rose-500 hover:bg-rose-600 text-white cursor-pointer"}`}
        >
          {voted ? "✓ Đã vote" : "Vote"}
        </button>
      </div>
      <div className="bg-white/5 rounded-full h-1 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-white/25 mt-1 text-right">{c.votes.toLocaleString()} phiếu · {pct}%</p>
    </div>
  );
}

// ─── Panels ────────────────────────────────────────────────────────────────────
function FeedPanel({ posts, onCreate, onComment, onLike, setTab }: { posts: Post[]; setTab: (v: Tab) => void; onCreate: () => void; onComment: (id: string) => void; onLike: (p: Post) => void }) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: "✍️", label: "Tạo bài viết", action: onCreate },
          { icon: "📚", label: "Nhóm ôn thi", action: () => toast.info("Sắp ra mắt 🚀") },
          { icon: "👥", label: "Tìm bạn 4 phương", action: () => router.push('/caodangnghe/allsv') },
          { icon: "🤝", label: "Xin thông tin", action: () => toast.info("Sắp ra mắt 🚀") },
        ].map((q) => (
          <button key={q.label} onClick={q.action} className="bg-white/[0.03] border border-white/[0.06] hover:bg-rose-500/5 hover:border-rose-500/20 rounded-xl p-3 cursor-pointer text-left flex items-center gap-2.5 transition-all">
            <span style={{ fontSize: 17 }}>{q.icon}</span>
            <span className="text-xs font-bold text-white/55 leading-tight">{q.label}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
        <span className="text-xs text-white/35">
          <span className="text-emerald-400 font-bold">{posts.length}</span> bài mới nhất
        </span>
      </div>
      <div className="space-y-3">
        {posts.length === 0 && <p className="text-center text-sm text-white/30 py-8">Chưa có bài viết. Hãy là người đầu tiên!</p>}
        {posts.map((p) => (
          <PostCard key={p.id} post={p} onComment={() => onComment(p.id)} onLike={() => onLike(p)} />
        ))}
      </div>

      <div onClick={() => setTab('vote')}
        className="bg-white/[0.02] rounded-[32px] md:rounded-[56px] p-6 md:p-12 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[100px] -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-xl md:text-3xl font-black text-rose-600 uppercase italic tracking-tighter">Cuộc Thi Hot</h3>
            <p className="text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-widest mt-2">Đừng để tài năng của bạn bị ngủ quên!</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
          {[
            { title: "Lớp học vui nhộn", img: "/ktdn.jpg", prize: "200.000đ" },
            { title: "Nam sinh ưu tú", img: "/nn.jpg", prize: "300.000đ" },
            { title: "Hoa khôi Cao Đẳng Nghề", img: "/hkh.jpg", prize: "300.000đ" },
          ].map((c, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-md rounded-3xl p-4 border border-white/10 group/item hover:bg-white/10 transition-all cursor-pointer">
              <div className="h-40 md:h-50 rounded-2xl overflow-hidden mb-4">
                <img src={c.img} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
              </div>
              <h4 className="text-white font-black text-sm uppercase italic mb-1 truncate">{c.title}</h4>
              <span className="text-rose-500 text-[10px] font-black uppercase">Giải thưởng: {c.prize}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EventsPanel({ events, myUid, onToggle }: { events: EventDoc[]; myUid: string | null; onToggle: (e: EventDoc) => void }) {
  return (
    <div>
      <p className="text-[9px] font-black tracking-widest text-white/25 uppercase mb-4">Sắp diễn ra · {events.length} sự kiện</p>
      <div className="space-y-3">
        {events.map((e) => (
          <EventCard key={e.id} event={e} going={!!myUid && e.goingUsers?.includes(myUid)} onToggle={() => onToggle(e)} />
        ))}
      </div>
    </div>
  );
}

function VotePanel({ hoaKhoi, namSinh, myUid, onVote }: { hoaKhoi: VoteCandidate[]; namSinh: VoteCandidate[]; myUid: string | null; onVote: (c: VoteCandidate) => void }) {
  const tHoa = hoaKhoi.reduce((s, c) => s + c.votes, 0);
  const tNam = namSinh.reduce((s, c) => s + c.votes, 0);

  const Section = ({ title, icon, list, total }: { title: string; icon: string; list: VoteCandidate[]; total: number }) => {
    const voted = !!myUid && list.some((c) => c.votedBy?.includes(myUid));
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex items-center gap-2.5 mb-5">
          <span style={{ fontSize: 22 }}>{icon}</span>
          <div>
            <p className="font-black text-base text-white">{title}</p>
            <p className="text-[10px] text-white/30">Bình chọn realtime · {total.toLocaleString()} phiếu</p>
          </div>
        </div>
        {list.map((c, idx) => (
          <VoteBar key={c.id} c={c} total={total} voted={voted} isLeader={idx === 0 && c.votes > 0} onVote={() => onVote(c)} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Contests />
      <Section title="Bình Chọn Hoa Khôi" icon="🌸" list={hoaKhoi} total={tHoa} />
      <Section title="Bình Chọn Nam Sinh" icon="🏆" list={namSinh} total={tNam} />
    </div>
  );
}

function DatingPanel({ profiles, myUid, onChat, onCreateProfile }: { profiles: DatingProfile[]; myUid: string | null; onChat: (p: DatingProfile) => void; onCreateProfile: () => void }) {
  const others = profiles.filter((p) => p.uid !== myUid);
  const myProfile = profiles.find((p) => p.uid === myUid);
  return (
    <div className="space-y-4">
      <div className="text-center py-3">
        <div style={{ fontSize: 42 }} className="mb-2">💘</div>
        <h3 className="text-xl font-black text-white">Kết nối sinh viên</h3>
        <p className="text-sm text-white/35 mt-1">Tìm bạn đồng hành, kết bạn, hoặc hơn thế...</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { n: profiles.length.toString(), l: "Đang tìm" },
          { n: Math.floor(profiles.length / 2).toString(), l: "Ghép đôi" },
          { n: "1", l: "Sự kiện" },
        ].map((s) => (
          <div key={s.l} className="bg-rose-500/[0.06] border border-rose-500/[0.12] rounded-xl p-3 text-center">
            <p className="text-xl font-black text-rose-400">{s.n}</p>
            <p className="text-[10px] text-white/35 mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>
      {others.length === 0 && (
        <p className="text-center text-sm text-white/30 py-8">Chưa có ai bật profile dating. Hãy là người đầu tiên!</p>
      )}
      <div className="space-y-3">
        {others.map((p) => (
          <div key={p.uid} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors">
            <div className="flex gap-3 items-center mb-3">
              <Av s={p.avatar} sz="lg" glow img={p.photoURL} />
              <div className="flex-1 min-w-0">
                <p className="font-black text-[15px] text-white">{p.name}</p>
                <p className="text-[11px] text-white/30 mb-1.5">{p.dept}</p>
                <span className="text-[10px] bg-rose-500/10 text-rose-400 font-bold px-2.5 py-0.5 rounded-full border border-rose-500/15">{p.mood}</span>
              </div>
            </div>
            <p className="text-xs text-white/45 leading-relaxed mb-3">{p.bio}</p>
            <div className="flex gap-2">
              <button onClick={() => onChat(p)} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-xl py-2.5 text-xs font-black cursor-pointer border-0 transition-colors">
                💬 Nhắn tin
              </button>
              <button onClick={() => onChat(p)} className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl text-base cursor-pointer hover:bg-white/10 transition-colors">👋</button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onCreateProfile}
        className="w-full border border-dashed border-rose-500/25 hover:border-rose-500/45 hover:bg-rose-500/5 rounded-2xl py-4 text-sm font-black text-rose-400 cursor-pointer transition-all"
      >
        {myProfile?.enabled ? "✓ Cập nhật hồ sơ ghép đôi" : "+ Tạo hồ sơ ghép đôi"}
      </button>
    </div>
  );
}

// ─── Dating profile dialog ─────────────────────────────────────────────────────
function DatingProfileDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, profile, setProfile }: any = useAuth();
  const [bio, setBio] = useState("");
  const [mood, setMood] = useState("🎵 Yêu âm nhạc");
  const [saving, setSaving] = useState(false);

  if (!open) return null;
  if (!user || !profile) return <LoginGate open onClose={onClose} title="Đăng nhập để tạo hồ sơ dating" />;

  const submit = async () => {
    setSaving(true);
    try {
      await upsertDatingProfile({
        uid: user.uid,
        name: profile.displayName,
        dept: `${profile.dept || "?"} ${profile.course || ""}`.trim(),
        avatar: avatarFromName(profile.displayName),
        photoURL: profile.photoURL || "",
        mood,
        bio: bio.trim() || "Hi! Mình muốn kết bạn 👋",
        enabled: true,
      });
      await updateProfile(user.uid, { datingEnabled: true, bio });
      setProfile({ ...profile, datingEnabled: true, bio });
      toast.success("Đã bật hồ sơ dating ❤️");
      onClose();
    } catch (e) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const moods = ["🎵 Yêu âm nhạc", "☕ Coffee addict", "🎬 Mê phim", "🎮 Gamer", "📚 Mọt sách", "⚽ Thể thao"];

  return (
    <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-lg rounded-t-3xl md:rounded-3xl border border-white/10 bg-[#111114] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-white">💘 Hồ sơ Dating</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl cursor-pointer bg-transparent border-0 leading-none">×</button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-black text-white/40 uppercase mb-2">Mood của bạn</p>
            <div className="flex flex-wrap gap-1.5">
              {moods.map((m) => (
                <button key={m} onClick={() => setMood(m)} className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer transition-all ${mood === m ? "bg-rose-500 text-white border-rose-500" : "bg-white/5 text-white/50 border-white/10 hover:text-white"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-white/40 uppercase mb-2">Bio</p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Giới thiệu bản thân, sở thích, người bạn đang tìm..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-rose-500/40 resize-none"
            />
          </div>
        </div>
        <button onClick={submit} disabled={saving} className="mt-4 w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white rounded-xl py-3 text-sm font-black cursor-pointer border-0 transition-colors">
          {saving ? "Đang lưu..." : "Bật hồ sơ ❤️"}
        </button>
      </div>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function StudentHub() {
  const { user, profile, login, logout, isAuthenticated }: any = useAuth();
  const [tab, setTab] = useState<Tab>("feed");
  const [search, setSearch] = useState("");

  // Data
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [hoaKhoi, setHoaKhoi] = useState<VoteCandidate[]>([]);
  const [namSinh, setNamSinh] = useState<VoteCandidate[]>([]);
  const [datingProfiles, setDatingProfiles] = useState<DatingProfile[]>([]);
  const [moodCounts, setMoodCounts] = useState<Record<string, number>>({});
  const [todayMoodTotal, setTodayMoodTotal] = useState(0);
  const [myMood, setMyMood] = useState<string | null>(null);

  // Dialogs
  const [showLogin, setShowLogin] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [commentsFor, setCommentsFor] = useState<string | null>(null);
  const [chatWith, setChatWith] = useState<{ uid: string; name: string; avatar: string } | null>(null);
  const [showMessages, setShowMessages] = useState(false);
  const [showDatingProfile, setShowDatingProfile] = useState(false);

  // Seed + subscribe
  useEffect(() => {
    const unsubP = subscribePosts(setPosts);
    const unsubE = subscribeEvents(setEvents);
    const unsubH = subscribeCandidates("hoa_khoi", setHoaKhoi);
    const unsubN = subscribeCandidates("nam_sinh", setNamSinh);
    const unsubD = subscribeDatingProfiles(setDatingProfiles);
    const unsubM = subscribeTodayMoods((moods: any[]) => {
      const counts: Record<string, number> = {};
      moods.forEach((m) => {
        counts[m.label] = (counts[m.label] || 0) + 1;
      });
      setMoodCounts(counts);
      setTodayMoodTotal(moods.length);
      if (user) {
        const mine = moods.find((m) => m.uid === user.uid);
        setMyMood(mine?.label || null);
      }
    });
    return () => {
      unsubP(); unsubE(); unsubH(); unsubN(); unsubD(); unsubM();
    };
  }, [user]);

  const requireAuth = useCallback((fn: () => void) => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    fn();
  }, [isAuthenticated]);

  const handleLike = useCallback(async (p: Post) => {
    if (!user) { setShowLogin(true); return; }
    const liked = p.likedBy?.includes(user.uid);
    await toggleLike(p.id, user.uid, !!liked);
  }, [user]);

  const handleRsvp = useCallback(async (e: EventDoc) => {
    if (!user) { setShowLogin(true); return; }
    const going = e.goingUsers?.includes(user.uid);
    await toggleRsvp(e.id, user.uid, !!going);
    toast.success(going ? "Đã hủy đăng ký" : "Đã đăng ký tham gia 🎉");
  }, [user]);

  const handleVote = useCallback(async (c: VoteCandidate) => {
    if (!user) { setShowLogin(true); return; }
    const list = c.category === "hoa_khoi" ? hoaKhoi : namSinh;
    const already = list.some((x) => x.votedBy?.includes(user.uid));
    if (already) {
      toast.error("Bạn đã bình chọn ở hạng mục này");
      return;
    }
    await castVote(c.id, user.uid);
    toast.success(`Đã vote cho ${c.name} 🗳️`);
  }, [user, hoaKhoi, namSinh]);

  const handleMood = useCallback(async (label: string) => {
    if (!user) { setShowLogin(true); return; }
    const mTooltip = MOODS.find((x) => x.label === label);
    if (!mTooltip) return;
    await saveMyMood(user.uid, mTooltip.emoji, label);
    toast.success(`Mood: ${mTooltip.emoji} ${label}`);
  }, [user]);

  const handleChatWith = useCallback((p: DatingProfile) => {
    if (!user) { setShowLogin(true); return; }
    setChatWith({ uid: p.uid, name: p.name, avatar: p.avatar });
  }, [user]);

  const navItems = useMemo(() => [
    { icon: "🏠", label: "Home", badge: 0, action: () => setTab("feed") },
    { icon: "🔔", label: "Thông báo", badge: 0, action: () => toast.info("Sắp ra mắt 🚀") },
    { icon: "💬", label: "Tin nhắn", badge: 0, action: () => requireAuth(() => setShowMessages(true)) },
    { icon: "👤", label: isAuthenticated ? "Hồ sơ" : "Đăng nhập", badge: 0, action: () => isAuthenticated ? logout() : login() },
  ], [isAuthenticated, login, logout, requireAuth]);

  const currentTab = TABS.find((t) => t.key === tab)!;
  const nextEvent = events[0] || null;
  const userAvatar = profile ? avatarFromName(profile.displayName) : "?";

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-rose-600/6 blur-[80px]" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-rose-800/5 blur-[60px]" />
      </div>

      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 xl:w-72 bg-[#0C0C0F]/98 backdrop-blur-xl border-r border-white/[0.05] z-20 overflow-y-auto">
        <div className="p-5 flex flex-col gap-4 min-h-full">
          <div className="pt-3 pb-1">
            <h1 className="text-3xl font-black leading-none tracking-tighter">SINH VIÊN<span className="text-rose-500">.NET</span></h1>
          </div>

          <button
            onClick={() => isAuthenticated ? logout() : login()}
            className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 hover:bg-white/[0.05] cursor-pointer text-left transition-colors"
          >
            <Av s={userAvatar} glow img={profile?.photoURL} />
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm text-white truncate">{profile?.displayName || "Khách"}</p>
              <p className="text-[10px] text-white/30 truncate">
                {profile ? `${profile.studentId} · ${profile.dept} ${profile.course}` : "Đăng nhập với Google"}
              </p>
            </div>
            <span className="text-base">{isAuthenticated ? "->" : "→"}</span>
          </button>

          {profile && <StreakWidget streak={profile.streakDays || 1} />}

          <nav className="space-y-0.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer border-0 ${tab === t.key ? "bg-rose-500/10 text-white border border-rose-500/18" : "text-white/35 hover:text-white/65 hover:bg-white/[0.04] bg-transparent"}`}
              >
                <span style={{ fontSize: 17 }}>{t.icon}</span>
                {t.label}
                {tab === t.key && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-400" />}
              </button>
            ))}
          </nav>

          <AlertWidget event={nextEvent} onView={() => setTab("events")} />
          <UpcomingMini events={events.slice(1, 4)} onGo={() => setTab("events")} />

          <div className="mt-auto space-y-0.5 pb-4">
            {navItems.map((n) => (
              <button
                key={n.label}
                onClick={n.action}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all cursor-pointer border-0 bg-transparent"
              >
                <span style={{ fontSize: 17 }}>{n.icon}</span>
                {n.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="relative z-10 lg:ml-64 xl:ml-72">
        <Hero onlineCount={todayMoodTotal || posts.length} nextEvent={nextEvent} />

        {/* Mobile header */}
        <header className="lg:hidden z-30 bg-[#09090B]/98 backdrop-blur-xl border-b border-white/[0.05] px-5 pt-4 pb-3 space-y-3">
          <div className="flex items-center gap-2">
            <button onClick={() => isAuthenticated ? logout() : login()} className="flex-shrink-0 cursor-pointer bg-transparent border-0 p-0">
              <Av s={userAvatar} sz="sm" img={profile?.photoURL} />
            </button>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/25">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-rose-500/35 transition-colors"
              />
            </div>
            <button onClick={() => requireAuth(() => setShowMessages(true))} className="w-10 h-10 bg-white/[0.04] border border-white/[0.06] rounded-xl flex items-center justify-center cursor-pointer text-base">💬</button>
          </div>
        </header>

        {/* Desktop topbar */}
        <div className="hidden lg:flex items-center gap-4 px-8 pt-5 pb-4">
          <h2 className="flex-1 text-lg font-black text-white">{currentTab.icon} {currentTab.label}</h2>
          <div className="relative max-w-xs w-full">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-white/25">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-rose-500/35 transition-colors"
            />
          </div>
          <button onClick={() => requireAuth(() => setShowMessages(true))} className="w-9 h-9 bg-white/[0.04] border border-white/[0.06] rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/8 transition-colors text-base">💬</button>
        </div>

        {/* Desktop tab bar */}
        <div className="hidden lg:flex gap-1 mx-8 mb-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-black transition-all cursor-pointer border-0 ${tab === t.key ? "bg-rose-500 text-white shadow-[0_4px_20px_rgba(244,63,94,0.35)]" : "text-white/35 bg-transparent hover:text-white/65 hover:bg-white/[0.04]"}`}
            >
              <span style={{ fontSize: 15 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:flex lg:gap-6 px-5 lg:px-8 lg:pb-10">
          <div className="flex-1 min-w-0">
            {/* Mobile widgets */}
            <div className="lg:hidden space-y-3 mb-4 mt-4">
              {profile && <StreakWidget streak={profile.streakDays || 1} />}
              <AlertWidget event={nextEvent} onView={() => setTab("events")} />
              <MoodWidget moodCounts={moodCounts} selected={myMood} onSelect={handleMood} />
            </div>

            {/* Mobile tabs */}
            <div className="lg:hidden sticky top-20 z-20 mb-4 -mx-5 px-5">
              <div className="flex gap-1 bg-[#0C0C0F]/98 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-1.5">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer border-0 ${tab === t.key ? "bg-rose-500 text-white shadow-[0_2px_12px_rgba(244,63,94,0.4)]" : "text-white/30 bg-transparent hover:text-white/55"}`}
                  >
                    <span style={{ fontSize: 15 }}>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pb-28 lg:pb-0">
              {tab === "feed" && (
                <FeedPanel
                  posts={posts}
                  onCreate={() => requireAuth(() => setShowCreatePost(true))}
                  onComment={(id: string) => setCommentsFor(id)}
                  onLike={handleLike}
                  setTab={(v: Tab) => setTab(v)}
                />
              )}
              {tab === "events" && <EventsPanel events={events} myUid={user?.uid || null} onToggle={handleRsvp} />}
              {tab === "vote" && <VotePanel hoaKhoi={hoaKhoi} namSinh={namSinh} myUid={user?.uid || null} onVote={handleVote} />}
              {tab === "dating" && (
                <DatingPanel
                  profiles={datingProfiles}
                  myUid={user?.uid || null}
                  onChat={handleChatWith}
                  onCreateProfile={() => requireAuth(() => setShowDatingProfile(true))}
                />
              )}
            </div>
          </div>

          {/* Right widgets */}
          <div className="hidden lg:flex flex-col gap-4 w-72 xl:w-80 flex-shrink-0">
            <MoodWidget moodCounts={moodCounts} selected={myMood} onSelect={handleMood} />
            <StatsWidget posts={posts.length} online={todayMoodTotal} events={events.length} />
            <UpcomingMini events={events} onGo={() => setTab("events")} />
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0C0C0F]/98 backdrop-blur-xl border-t border-white/[0.05] flex justify-around px-2 pt-3 pb-7">
        {navItems.map((n) => (
          <button key={n.label} onClick={n.action} className="relative flex flex-col items-center gap-1 px-4 cursor-pointer bg-transparent border-0">
            <span style={{ fontSize: 21 }}>{n.icon}</span>
            <span className="text-[10px] font-bold text-white/30">{n.label}</span>
          </button>
        ))}
      </nav>

      <FeedbackHub />

      {/* Dialogs */}
      <LoginGate open={showLogin} onClose={() => setShowLogin(false)} />
      <CreatePostDialog open={showCreatePost} onClose={() => setShowCreatePost(false)} />
      <CommentsDialog open={!!commentsFor} postId={commentsFor || ""} onClose={() => setCommentsFor(null)} />
      <ChatDialog open={!!chatWith} other={chatWith} onClose={() => setChatWith(null)} />
      <MessagesDrawer open={showMessages} onClose={() => setShowMessages(false)} />
      <DatingProfileDialog open={showDatingProfile} onClose={() => setShowDatingProfile(false)} />
      <VotingModal />

      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "#1a1a1f",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#fff",
          },
        }}
      />
    </div>
  );
}
