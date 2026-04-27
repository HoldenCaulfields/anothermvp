import { useEffect, useRef, useState } from "react";
import { ensureThread, sendMessage, subscribeMessages, threadIdFor } from "./chat.services";
import type { ChatMessage } from "./types";
import { useAuth } from "./useAuth";
import { avatarFromName } from "./user.services";
import { LoginGate } from "./LoginGate";

interface Props {
  open: boolean;
  onClose: () => void;
  other: { uid: string; name: string; avatar: string } | null;
}

export function ChatDialog({ open, onClose, other }: Props) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !other) return;
    if (!user || !profile) {
      setShowLogin(true);
      return;
    }
    const me = { uid: user.uid, name: profile.displayName, avatar: avatarFromName(profile.displayName) };
    ensureThread(me, other).then((id) => {
      setThreadId(id);
      const unsub = subscribeMessages(id, setMessages);
      return unsub;
    });
  }, [open, other, user, profile]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!open || !other) return null;
  if (!user || !profile) {
    return <LoginGate open={showLogin} onClose={() => { setShowLogin(false); onClose(); }} title="Đăng nhập để nhắn tin" description="Đăng nhập với Google để bắt đầu trò chuyện." />;
  }

  const send = async () => {
    if (!text.trim() || !threadId) return;
    const t = text.trim();
    setText("");
    await sendMessage(threadId, user.uid, other.uid, t);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-lg h-[85vh] md:h-[600px] flex flex-col rounded-t-3xl md:rounded-3xl border border-white/10 bg-[#111114] overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-xs font-black text-white">
            {other.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-white text-sm">{other.name}</p>
            <p className="text-[10px] text-emerald-400">● Đang hoạt động</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl cursor-pointer bg-transparent border-0 leading-none">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 && (
            <p className="text-center text-sm text-white/30 py-8">Chưa có tin nhắn. Gửi lời chào nhé! 👋</p>
          )}
          {messages.map((m) => {
            const mine = m.senderId === user.uid;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm break-words ${mine ? "bg-rose-500 text-white" : "bg-white/5 text-white/85"}`}>
                  {m.text}
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <div className="p-3 border-t border-white/5 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Nhắn tin..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-rose-500/40"
          />
          <button onClick={send} disabled={!text.trim()} className="bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white rounded-xl px-4 text-xs font-black cursor-pointer border-0 transition-colors">
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
