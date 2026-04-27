import { useEffect, useState } from "react";
import { addComment, subscribeComments } from "./posts.services";
import type { Comment } from "./types";
import { useAuth } from "./useAuth";
import { avatarFromName } from "./user.services";
import { LoginGate } from "./LoginGate";

interface Props {
  postId: string;
  open: boolean;
  onClose: () => void;
}

export function CommentsDialog({ postId, open, onClose }: Props) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    const unsub = subscribeComments(postId, setComments);
    return () => unsub();
  }, [open, postId]);

  if (!open) return null;

  const send = async () => {
    if (!text.trim()) return;
    if (!user || !profile) {
      setShowLogin(true);
      return;
    }
    setSending(true);
    try {
      await addComment(postId, {
        authorId: user.uid,
        authorName: profile.displayName,
        authorAvatar: avatarFromName(profile.displayName),
        content: text.trim(),
      });
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full md:max-w-lg max-h-[80vh] flex flex-col rounded-t-3xl md:rounded-3xl border border-white/10 bg-[#111114] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h3 className="font-black text-white">💬 Bình luận ({comments.length})</h3>
            <button onClick={onClose} className="text-white/40 hover:text-white text-xl cursor-pointer bg-transparent border-0 leading-none">×</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {comments.length === 0 && (
              <p className="text-center text-sm text-white/30 py-8">Chưa có bình luận. Hãy là người đầu tiên!</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex-shrink-0 flex items-center justify-center text-xs font-black text-white">
                  {c.authorAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-white/5 rounded-2xl px-3 py-2">
                    <p className="text-xs font-black text-white">{c.authorName}</p>
                    <p className="text-sm text-white/70 mt-0.5 break-words">{c.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-white/5 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={user ? "Viết bình luận..." : "Đăng nhập để bình luận..."}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-rose-500/40"
            />
            <button onClick={send} disabled={sending || !text.trim()} className="bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white rounded-xl px-4 text-xs font-black cursor-pointer border-0 transition-colors">
              Gửi
            </button>
          </div>
        </div>
      </div>
      <LoginGate open={showLogin} onClose={() => setShowLogin(false)} title="Đăng nhập để bình luận" description="Bạn cần đăng nhập với Google để tham gia thảo luận." />
    </>
  );
}
