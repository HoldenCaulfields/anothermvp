import { useState } from "react";
import { useAuth } from "./useAuth";
import { createPost } from "./posts.services";
import { avatarFromName } from "./user.services";
import { LoginGate } from "./LoginGate";
import { toast } from "sonner";

const TAGS = ["Văn nghệ", "Thông tin", "Bình chọn", "Học tập"];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreatePostDialog({ open, onClose }: Props) {
  const { user, profile } = useAuth();
  const [content, setContent] = useState("");
  const [tag, setTag] = useState(TAGS[1]);
  const [posting, setPosting] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  if (!open) return null;
  if (!user || !profile) {
    return <LoginGate open onClose={onClose} title="Đăng nhập để đăng bài" description="Đăng nhập với Google để chia sẻ với cộng đồng." />;
  }

  const submit = async () => {
    if (!content.trim()) return;
    setPosting(true);
    try {
      await createPost({
        authorId: user.uid,
        authorName: profile.displayName,
        authorAvatar: avatarFromName(profile.displayName),
        content: content.trim(),
        tag,
      });
      toast.success("Đã đăng bài 🎉");
      setContent("");
      onClose();
    } catch (e) {
      toast.error("Đăng bài thất bại");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-lg rounded-t-3xl md:rounded-3xl border border-white/10 bg-[#111114] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-white">✍️ Tạo bài viết</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl cursor-pointer bg-transparent border-0 leading-none">×</button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Bạn đang nghĩ gì? Chia sẻ với cộng đồng..."
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-rose-500/40 resize-none"
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={`text-xs font-black px-3 py-1.5 rounded-full border cursor-pointer transition-all ${
                tag === t ? "bg-rose-500 text-white border-rose-500" : "bg-white/5 text-white/50 border-white/10 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={submit}
          disabled={posting || !content.trim()}
          className="mt-4 w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white rounded-xl py-3 text-sm font-black cursor-pointer border-0 transition-colors"
        >
          {posting ? "Đang đăng..." : "Đăng bài"}
        </button>
      </div>
    </div>
  );
}
