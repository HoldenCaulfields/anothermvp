import { useEffect, useState } from "react";
import { ChatDialog } from "./ChatDialog";
import { subscribeMyThreads } from "./chat.services";
import type { ChatThread } from "./types";
import { useAuth } from "./useAuth";
import { LoginGate } from "./LoginGate";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MessagesDrawer({ open, onClose }: Props) {
  const { user, profile } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [chatWith, setChatWith] = useState<{ uid: string; name: string; avatar: string } | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    const unsub = subscribeMyThreads(user.uid, setThreads);
    return () => unsub();
  }, [open, user]);

  if (!open) return null;
  if (!user || !profile) {
    return <LoginGate open onClose={onClose} title="Đăng nhập để xem tin nhắn" description="Đăng nhập với Google để xem và gửi tin nhắn." />;
  }

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full md:max-w-md h-[85vh] md:h-[600px] flex flex-col rounded-t-3xl md:rounded-3xl border border-white/10 bg-[#111114] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h3 className="font-black text-white">💬 Tin nhắn</h3>
            <button onClick={onClose} className="text-white/40 hover:text-white text-xl cursor-pointer bg-transparent border-0 leading-none">×</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {threads.length === 0 && (
              <p className="text-center text-sm text-white/30 py-12 px-6">Chưa có cuộc trò chuyện. Vào tab Dating để bắt đầu nhắn tin với bạn mới!</p>
            )}
            {threads.map((t) => {
              const otherId = t.participants.find((p) => p !== user.uid)!;
              const name = t.participantNames?.[otherId] ?? "Bạn";
              const avatar = t.participantAvatars?.[otherId] ?? "?";
              return (
                <button
                  key={t.id}
                  onClick={() => setChatWith({ uid: otherId, name, avatar })}
                  className="w-full flex gap-3 items-center px-4 py-3 hover:bg-white/[0.04] cursor-pointer bg-transparent border-0 border-b border-white/[0.04] text-left transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-xs font-black text-white">
                    {avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-white">{name}</p>
                    <p className="text-xs text-white/40 truncate mt-0.5">{t.lastMessage || "Bắt đầu trò chuyện..."}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <ChatDialog open={!!chatWith} onClose={() => setChatWith(null)} other={chatWith} />
    </>
  );
}
