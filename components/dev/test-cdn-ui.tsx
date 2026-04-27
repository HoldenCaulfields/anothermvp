"use client";

import { useState, useCallback } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Tab = "feed" | "events" | "vote" | "dating";
interface Event { id: number; title: string; date: string; daysLeft: number; type: string; icon: string; going: number }
interface Post { id: number; author: string; avatar: string; time: string; content: string; likes: number; comments: number; tag: string }
interface Candidate { id: number; name: string; dept: string; votes: number; avatar: string; badge?: string }
interface MoodItem { emoji: string; label: string; count: number }

// ─── Data ──────────────────────────────────────────────────────────────────────
const MOODS: MoodItem[] = [
  { emoji: "🔥", label: "Hứng khởi", count: 142 },
  { emoji: "😴", label: "Mệt mỏi",   count: 89  },
  { emoji: "😎", label: "Chill",     count: 203 },
  { emoji: "📚", label: "Chăm học",  count: 76  },
  { emoji: "🤩", label: "Phấn khích",count: 118 },
  { emoji: "💔", label: "Buồn bã",   count: 34  },
];

const EVENTS: Event[] = [
  { id: 1, title: "Đêm Văn Nghệ Cuối Năm",      date: "Ngày mai · 19:00", daysLeft: 1,  type: "Văn nghệ", icon: "🎤", going: 387 },
  { id: 2, title: "Giao Lưu Bóng Đá Khoa",       date: "10/05 · 15:00",   daysLeft: 7,  type: "Thể thao", icon: "⚽", going: 124 },
  { id: 3, title: "Cuộc Thi Hoa Khôi 2025",       date: "15/05 · 18:00",   daysLeft: 12, type: "Sự kiện",  icon: "👑", going: 612 },
  { id: 4, title: "Game Night: Valorant",          date: "20/05 · 20:00",   daysLeft: 17, type: "Game",     icon: "🎮", going: 256 },
  { id: 5, title: "Speed Dating Mùa Hè",          date: "25/05 · 17:00",   daysLeft: 22, type: "Dating",   icon: "💘", going: 198 },
];

const POSTS: Post[] = [
  { id: 1, author: "Nguyễn Minh Châu", avatar: "MC", time: "5 phút",  content: "Ai đăng ký văn nghệ chưa? Đội mình đang thiếu 1 bạn guitar 🎸 deadline hôm nay nè!", likes: 47,  comments: 23, tag: "Văn nghệ"  },
  { id: 2, author: "Trần Bảo Khánh",   avatar: "BK", time: "12 phút", content: "Chiều nay thư viện đông quá trời, ai cần chỗ ngồi thì xuống tầng B1 còn nhiều ghế lắm 📖",  likes: 132, comments: 8,  tag: "Thông tin" },
  { id: 3, author: "Lê Thùy Linh",     avatar: "TL", time: "1 giờ",   content: "Vote cho Hoa Khôi khoa mình nào anh chị ơi 🌸 Link bình chọn ở dưới comment!",              likes: 289, comments: 67, tag: "Bình chọn" },
  { id: 4, author: "Phạm Tuấn Anh",    avatar: "TA", time: "2 giờ",   content: "Team 4 người cần thêm 1 người cho môn KTPM cuối kỳ. Ai giỏi Flutter thì nhắn mình nha 🙏", likes: 18,  comments: 31, tag: "Học tập"   },
];

const HOA_KHOI: Candidate[] = [
  { id: 1, name: "Phương Linh", dept: "CNTT K22",     votes: 4821, avatar: "PL", badge: "👑 Dẫn đầu" },
  { id: 2, name: "Bảo Châu",    dept: "QTKD K22",     votes: 3967, avatar: "BC" },
  { id: 3, name: "Minh Tú",     dept: "Marketing K23", votes: 2843, avatar: "MT" },
];
const NAM_SINH: Candidate[] = [
  { id: 1, name: "Hoàng Nam",   dept: "CNTT K21",    votes: 5102, avatar: "HN", badge: "🏆 Dẫn đầu" },
  { id: 2, name: "Tuấn Kiệt",  dept: "Cơ khí K22",  votes: 3714, avatar: "TK" },
  { id: 3, name: "Việt Anh",   dept: "Điện tử K23", votes: 2290, avatar: "VA" },
];

const TABS = [
  { key: "feed"   as Tab, icon: "📰", label: "Cộng đồng" },
  { key: "events" as Tab, icon: "🎉", label: "Sự kiện"   },
  { key: "vote"   as Tab, icon: "🗳️", label: "Bình chọn" },
  { key: "dating" as Tab, icon: "💘", label: "Dating"    },
];

const TAG_CLS: Record<string, string> = {
  "Văn nghệ":  "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "Thông tin": "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "Bình chọn": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Học tập":   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

// ─── Atoms ─────────────────────────────────────────────────────────────────────
const Av = ({ s, glow, sz = "md" }: { s: string; glow?: boolean; sz?: "sm" | "md" | "lg" }) => {
  const dim = sz === "sm" ? "w-8 h-8 text-xs" : sz === "lg" ? "w-14 h-14 text-sm" : "w-10 h-10 text-sm";
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
function Hero() {
  return (
    <div className="relative w-full overflow-hidden min-h-80 md:min-h-110">
      <img
        src="/cdnbg.jpg"
        alt="" aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      <div className="absolute inset-0 flex flex-col justify-end px-8 pb-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
              <span className="text-[11px] font-semibold text-white/50">
                <span className="text-emerald-400 font-bold">234</span> online
              </span>
            </div>
            <p className="text-[10px] font-black tracking-[0.3em] text-rose-400 uppercase mb-2">KHOA ĐCNA · K25</p>
            <h1 className="text-3xl md:text-6xl font-black leading-none tracking-tighter text-white">
              Hội Sinh Viên<br /><span className="text-rose-500">Cao Đẳng Nghề</span>
            </h1>
          </div>
          <div className="hidden sm:flex flex-col gap-2 items-end pb-1">
            {[
              { label: "5 sự kiện sắp tới",       accent: false },
              { label: "Streak 4 ngày 🔥",          accent: false },
              { label: "Đêm văn nghệ ngày mai! ⚡", accent: true  },
            ].map(({ label, accent }) => (
              <div key={label} className={`rounded-full px-3.5 py-1.5 text-xs font-bold backdrop-blur-sm
                ${accent ? "bg-rose-500/20 border border-rose-500/35 text-rose-300" : "bg-black/40 border border-white/10 text-white/65"}`}>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Streak ────────────────────────────────────────────────────────────────────
function StreakWidget() {
  const days = ["T2","T3","T4","T5","T6","T7","CN"];
  const done = [true, true, true, true, false, false, false];
  return (
    <div className="rounded-2xl border border-rose-500/15 bg-rose-500/[0.04] p-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-[9px] font-black tracking-widest text-white/30 uppercase">Streak</p>
          <p className="text-2xl font-black text-white mt-0.5">4 <span className="text-rose-400 text-sm">ngày 🔥</span></p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-white/30">Rank</p>
          <p className="text-lg font-black text-amber-400">#47</p>
        </div>
      </div>
      <div className="flex gap-1.5">
        {days.map((d, i) => (
          <div key={d} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-full aspect-square max-w-8 rounded-lg flex items-center justify-center text-[9px] font-black
              ${done[i] ? "bg-rose-500 text-white shadow-[0_2px_8px_rgba(244,63,94,0.45)]" : "bg-white/5 border border-white/8"}`}>
              {done[i] ? "✓" : ""}
            </div>
            <span className={`text-[9px] font-bold ${done[i] ? "text-rose-400" : "text-white/25"}`}>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Alert ─────────────────────────────────────────────────────────────────────
function AlertWidget() {
  return (
    <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/8 to-transparent p-4">
      <p className="text-[9px] font-black tracking-[0.25em] text-rose-400 uppercase mb-3">⚡ Ngày mai</p>
      <div className="flex gap-3 items-center mb-3">
        <span style={{ fontSize: 26 }}>🎤</span>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm text-white leading-tight">Đêm Văn Nghệ Cuối Năm</p>
          <p className="text-[11px] text-white/40 mt-0.5">19:00 · Hội trường A</p>
          <p className="text-[11px] text-rose-400 font-bold mt-0.5">387 người đăng ký</p>
        </div>
      </div>
      <button className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl py-2.5 text-xs font-black cursor-pointer border-0 transition-colors">
        Xem chi tiết →
      </button>
    </div>
  );
}

// ─── Mood ──────────────────────────────────────────────────────────────────────
function MoodWidget({ selected, onSelect }: { selected: string | null; onSelect: (m: string | null) => void }) {
  return (
    <div>
      <p className="text-[9px] font-black tracking-widest text-white/30 uppercase mb-3">Mood hôm nay?</p>
      <div className="grid grid-cols-3 gap-1.5">
        {MOODS.map(m => {
          const on = selected === m.label;
          return (
            <button key={m.label} onClick={() => onSelect(on ? null : m.label)}
              className={`rounded-xl p-2.5 text-center cursor-pointer border transition-all
                ${on ? "bg-rose-500/12 border-rose-500/35" : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"}`}>
              <div style={{ fontSize: 19 }}>{m.emoji}</div>
              <p className={`text-[10px] font-bold mt-0.5 leading-tight ${on ? "text-rose-400" : "text-white/50"}`}>{m.label}</p>
              <p className="text-[9px] text-white/25 mt-0.5">{m.count}</p>
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="mt-2 rounded-xl border border-rose-500/15 bg-rose-500/[0.05] px-3 py-2 text-xs text-white/50">
          💬 <span className="text-rose-400 font-bold">{MOODS.find(m => m.label === selected)?.count} bạn</span> cũng đang <span className="text-white font-bold">{selected}</span>
        </div>
      )}
    </div>
  );
}

// ─── Upcoming mini ─────────────────────────────────────────────────────────────
function UpcomingMini() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-[9px] font-black tracking-widest text-white/30 uppercase mb-3">Lịch sắp tới</p>
      <div className="space-y-3">
        {EVENTS.slice(1, 4).map(e => (
          <div key={e.id} className="flex items-center gap-2.5 group">
            <span style={{ fontSize: 17 }}>{e.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white/70 truncate group-hover:text-white transition-colors">{e.title}</p>
              <p className="text-[10px] text-white/30">{e.date}</p>
            </div>
            <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">{e.daysLeft}d</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stats ─────────────────────────────────────────────────────────────────────
function StatsWidget() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 grid grid-cols-3 gap-2 text-center">
      {[{ n: "1,024", l: "Sinh viên" }, { n: "234", l: "Online" }, { n: "5", l: "Sự kiện" }].map(s => (
        <div key={s.l}>
          <p className="text-lg font-black text-white">{s.n}</p>
          <p className="text-[10px] text-white/30 mt-0.5">{s.l}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Post ──────────────────────────────────────────────────────────────────────
function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  return (
    <article className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors">
      <div className="flex gap-2.5 items-center mb-3">
        <Av s={post.avatar} sz="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm text-white">{post.author}</p>
          <p className="text-[10px] text-white/30 mt-0.5">{post.time} trước</p>
        </div>
        <Tag label={post.tag} />
      </div>
      <p className="text-sm text-white/60 leading-relaxed mb-3">{post.content}</p>
      <div className="border-t border-white/[0.05] pt-3 flex gap-5">
        <button onClick={() => setLiked(p => !p)}
          className={`flex items-center gap-1.5 text-xs font-bold cursor-pointer bg-transparent border-0 p-0 transition-colors ${liked ? "text-rose-400" : "text-white/30 hover:text-white/60"}`}>
          <span style={{ fontSize: 14 }}>{liked ? "❤️" : "🤍"}</span> {post.likes + (liked ? 1 : 0)}
        </button>
        <button className="flex items-center gap-1.5 text-xs font-bold text-white/30 hover:text-white/60 cursor-pointer bg-transparent border-0 p-0 transition-colors">
          <span style={{ fontSize: 14 }}>💬</span> {post.comments}
        </button>
        <button className="ml-auto text-xs font-bold text-white/30 hover:text-white/60 cursor-pointer bg-transparent border-0 p-0 transition-colors">↗ Chia sẻ</button>
      </div>
    </article>
  );
}

// ─── Event card ────────────────────────────────────────────────────────────────
function EventCard({ event, going, onToggle }: { event: Event; going: boolean; onToggle: () => void }) {
  return (
    <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors overflow-hidden group">
      {event.daysLeft === 1 && (
        <span className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl rounded-tr-2xl tracking-widest">NGAY MAI</span>
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
        <button onClick={onToggle}
          className={`flex-shrink-0 rounded-xl px-3.5 py-2 text-xs font-black transition-all cursor-pointer border-0
            ${going ? "bg-rose-500 text-white shadow-[0_4px_16px_rgba(244,63,94,0.35)]" : "bg-white/5 border border-white/10 text-white/45 hover:bg-white/10 hover:text-white"}`}>
          {going ? "✓ Đã đăng" : "Tham gia"}
        </button>
      </div>
    </div>
  );
}

// ─── Vote bar ──────────────────────────────────────────────────────────────────
function VoteBar({ c, total, voted, onVote }: { c: Candidate; total: number; voted: boolean; onVote: () => void }) {
  const pct = Math.round((c.votes / total) * 100);
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-2.5 mb-2">
        <Av s={c.avatar} sz="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-white">{c.name}</span>
            {c.badge && <span className="text-[10px] text-amber-400 font-bold">{c.badge}</span>}
          </div>
          <p className="text-[10px] text-white/30">{c.dept}</p>
        </div>
        <button onClick={onVote} disabled={voted}
          className={`rounded-lg px-3 py-1.5 text-xs font-black border-0 transition-all
            ${voted ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-default" : "bg-rose-500 hover:bg-rose-600 text-white cursor-pointer"}`}>
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
function FeedPanel() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: "👥", label: "Tìm bạn cùng phòng" },
          { icon: "📚", label: "Nhóm ôn thi"        },
          { icon: "🤝", label: "Xin thông tin"      },
          { icon: "✍️", label: "Tạo bài viết"       },
        ].map(q => (
          <button key={q.label}
            className="bg-white/[0.03] border border-white/[0.06] hover:bg-rose-500/5 hover:border-rose-500/20 rounded-xl p-3 cursor-pointer text-left flex items-center gap-2.5 transition-all">
            <span style={{ fontSize: 17 }}>{q.icon}</span>
            <span className="text-xs font-bold text-white/55 leading-tight">{q.label}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
        <span className="text-xs text-white/35"><span className="text-emerald-400 font-bold">234</span> sinh viên online</span>
      </div>
      <div className="space-y-3">{POSTS.map(p => <PostCard key={p.id} post={p} />)}</div>
    </div>
  );
}

function EventsPanel() {
  const [going, setGoing] = useState<Set<number>>(new Set());
  const toggle = useCallback((id: number) => {
    setGoing(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }, []);
  return (
    <div>
      <p className="text-[9px] font-black tracking-widest text-white/25 uppercase mb-4">Sắp diễn ra · {EVENTS.length} sự kiện</p>
      <div className="space-y-3">
        {EVENTS.map(e => <EventCard key={e.id} event={e} going={going.has(e.id)} onToggle={() => toggle(e.id)} />)}
      </div>
    </div>
  );
}

function VotePanel() {
  const [vHoa, setVHoa] = useState<number | null>(null);
  const [vNam, setVNam] = useState<number | null>(null);
  const tHoa = HOA_KHOI.reduce((s, c) => s + c.votes, 0);
  const tNam = NAM_SINH.reduce((s, c) => s + c.votes, 0);

  const Section = ({ title, icon, list, total, voted, onVote }: {
    title: string; icon: string; list: Candidate[]; total: number; voted: boolean; onVote: (id: number) => void;
  }) => (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-center gap-2.5 mb-5">
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div>
          <p className="font-black text-base text-white">{title}</p>
          <p className="text-[10px] text-white/30">Kết thúc 15/05 · {total.toLocaleString()} phiếu</p>
        </div>
      </div>
      {list.map(c => <VoteBar key={c.id} c={c} total={total} voted={voted} onVote={() => onVote(c.id)} />)}
    </div>
  );

  return (
    <div className="space-y-4">
      <Section title="Bình Chọn Hoa Khôi" icon="🌸" list={HOA_KHOI} total={tHoa} voted={vHoa !== null} onVote={id => { if (!vHoa) setVHoa(id); }} />
      <Section title="Bình Chọn Nam Sinh"  icon="🏆" list={NAM_SINH}  total={tNam} voted={vNam !== null} onVote={id => { if (!vNam) setVNam(id); }} />
    </div>
  );
}

function DatingPanel() {
  const profiles = [
    { name: "Minh Châu", dept: "Marketing K23", av: "MC", mood: "🎵 Yêu âm nhạc",  mutual: 14, bio: "Tìm bạn cùng xem phim Ghibli 🌸" },
    { name: "Quốc Huy",  dept: "CNTT K22",      av: "QH", mood: "☕ Coffee addict", mutual: 8,  bio: "Lập trình ban ngày, gamer ban đêm. Thích đá banh ⚽" },
    { name: "Thanh Mai", dept: "Báo chí K23",   av: "TM", mood: "🎬 Mê phim",       mutual: 21, bio: "Review phim tối cuối tuần, có kèm bắp rang bơ 🍿" },
  ];
  return (
    <div className="space-y-4">
      <div className="text-center py-3">
        <div style={{ fontSize: 42 }} className="mb-2">💘</div>
        <h3 className="text-xl font-black text-white">Kết nối sinh viên</h3>
        <p className="text-sm text-white/35 mt-1">Tìm bạn đồng hành, kết bạn, hoặc hơn thế...</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[{ n: "324", l: "Đang tìm" }, { n: "89", l: "Ghép đôi" }, { n: "12", l: "Sự kiện" }].map(s => (
          <div key={s.l} className="bg-rose-500/[0.06] border border-rose-500/[0.12] rounded-xl p-3 text-center">
            <p className="text-xl font-black text-rose-400">{s.n}</p>
            <p className="text-[10px] text-white/35 mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {profiles.map(p => (
          <div key={p.name} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors">
            <div className="flex gap-3 items-center mb-3">
              <Av s={p.av} sz="lg" glow />
              <div className="flex-1 min-w-0">
                <p className="font-black text-[15px] text-white">{p.name}</p>
                <p className="text-[11px] text-white/30 mb-1.5">{p.dept}</p>
                <span className="text-[10px] bg-rose-500/10 text-rose-400 font-bold px-2.5 py-0.5 rounded-full border border-rose-500/15">{p.mood}</span>
              </div>
              <div className="text-center flex-shrink-0">
                <p className="text-sm font-black text-emerald-400">{p.mutual}</p>
                <p className="text-[10px] text-white/25">bạn chung</p>
              </div>
            </div>
            <p className="text-xs text-white/45 leading-relaxed mb-3">{p.bio}</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-xl py-2.5 text-xs font-black cursor-pointer border-0 transition-colors">💬 Nhắn tin</button>
              <button className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl text-base cursor-pointer hover:bg-white/10 transition-colors">👋</button>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full border border-dashed border-rose-500/25 hover:border-rose-500/45 hover:bg-rose-500/5 rounded-2xl py-4 text-sm font-black text-rose-400 cursor-pointer transition-all">
        + Tạo hồ sơ dating
      </button>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function StudentHub() {
  const [tab, setTab]       = useState<Tab>("feed");
  const [mood, setMood]     = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const navItems = [
    { icon: "🏠", label: "Home",      badge: 0 },
    { icon: "🔔", label: "Thông báo", badge: 3 },
    { icon: "💬", label: "Tin nhắn",  badge: 7 },
    { icon: "👤", label: "Hồ sơ",     badge: 0 },
  ];

  const currentTab = TABS.find(t => t.key === tab)!;

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-rose-600/6 blur-[80px]" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-rose-800/5 blur-[60px]" />
      </div>

      {/* ══ SIDEBAR ══ */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 md:py-20 h-screen w-64 xl:w-72 bg-[#0C0C0F]/98 backdrop-blur-xl border-r border-white/[0.05] z-20 overflow-y-auto">
        <div className="p-5 flex flex-col gap-4 min-h-full">
          <div className="pt-3 pb-1">
            <h1 className="text-3xl font-black leading-none tracking-tighter">THÔNG TIN SV</h1>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-3">
            <Av s="BT" glow />
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm text-white">Bảo Trân</p>
              <p className="text-[10px] text-white/30">SV2291 · CNTT K22</p>
            </div>
            <span className="text-base">🏅</span>
          </div>

          <StreakWidget />

          <nav className="space-y-0.5">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer border-0
                  ${tab === t.key ? "bg-rose-500/10 text-white border border-rose-500/18" : "text-white/35 hover:text-white/65 hover:bg-white/[0.04] bg-transparent"}`}>
                <span style={{ fontSize: 17 }}>{t.icon}</span>
                {t.label}
                {tab === t.key && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-400" />}
              </button>
            ))}
          </nav>

          <AlertWidget />
          <UpcomingMini />

          <div className="mt-auto space-y-0.5 pb-4">
            {navItems.map(n => (
              <button key={n.label}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all cursor-pointer border-0 bg-transparent">
                <span style={{ fontSize: 17 }}>{n.icon}</span>
                {n.label}
                {n.badge > 0 && <span className="ml-auto w-5 h-5 bg-rose-500 rounded-full text-[10px] font-black text-white flex items-center justify-center">{n.badge}</span>}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="relative z-10 lg:ml-64 xl:ml-72">

        {/* Hero — desktop only */}
        <Hero />  
        {/* <div className="hidden lg:block"><Hero /></div> */}

        {/* Mobile header */}
        <header className="lg:hidden z-30 bg-[#09090B]/98 backdrop-blur-xl border-b border-white/[0.05] px-5 pt-4 pb-3 space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/25">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm sinh viên, sự kiện..."
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-md text-white placeholder-white/25 outline-none focus:border-rose-500/35 transition-colors" />
          </div>
        </header>

        {/* Desktop topbar */}
        <div className="hidden lg:flex items-center gap-4 px-8 pt-5 pb-4">
          <h2 className="flex-1 text-lg font-black text-white">{currentTab.icon} {currentTab.label}</h2>
          <div className="relative max-w-xs w-full">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-white/25">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..."
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-rose-500/35 transition-colors" />
          </div>
          <div className="flex gap-2">
            {navItems.filter(n => n.badge > 0).map(n => (
              <button key={n.label} className="relative w-9 h-9 bg-white/[0.04] border border-white/[0.06] rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/8 transition-colors text-base">
                {n.icon}
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">{n.badge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop tab bar */}
        <div className="hidden lg:flex gap-1 mx-8 mb-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-1.5">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-black transition-all cursor-pointer border-0
                ${tab === t.key ? "bg-rose-500 text-white shadow-[0_4px_20px_rgba(244,63,94,0.35)]" : "text-white/35 bg-transparent hover:text-white/65 hover:bg-white/[0.04]"}`}>
              <span style={{ fontSize: 15 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* 2-column content */}
        <div className="lg:flex lg:gap-6 px-5 lg:px-8 lg:pb-10">

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Mobile widgets */}
            <div className="lg:hidden space-y-3 mb-4">
              <StreakWidget />
              <AlertWidget />
              <MoodWidget selected={mood} onSelect={setMood} />
            </div>

            {/* Mobile tabs */}
            <div className="lg:hidden sticky top-20 z-20 mb-4 -mx-5 px-5">
              <div className="flex gap-1 bg-[#0C0C0F]/98 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-1.5">
                {TABS.map(t => (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer border-0
                      ${tab === t.key ? "bg-rose-500 text-white shadow-[0_2px_12px_rgba(244,63,94,0.4)]" : "text-white/30 bg-transparent hover:text-white/55"}`}>
                    <span style={{ fontSize: 15 }}>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pb-28 lg:pb-0">
              {tab === "feed"   && <FeedPanel />}
              {tab === "events" && <EventsPanel />}
              {tab === "vote"   && <VotePanel />}
              {tab === "dating" && <DatingPanel />}
            </div>
          </div>

          {/* Right widgets — desktop */}
          <div className="hidden lg:flex flex-col gap-4 w-72 xl:w-80 flex-shrink-0">
            <MoodWidget selected={mood} onSelect={setMood} />
            <StatsWidget />
            <UpcomingMini />
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0C0C0F]/98 backdrop-blur-xl border-t border-white/[0.05] flex justify-around px-2 pt-3 pb-7">
        {navItems.map(n => (
          <button key={n.label} className="relative flex flex-col items-center gap-1 px-4 cursor-pointer bg-transparent border-0">
            {n.badge > 0 && (
              <span className="absolute -top-0.5 right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">{n.badge}</span>
            )}
            <span style={{ fontSize: 21 }}>{n.icon}</span>
            <span className="text-[10px] font-bold text-white/30">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}