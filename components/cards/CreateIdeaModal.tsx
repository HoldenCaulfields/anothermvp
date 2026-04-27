'use client';
import { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, Sparkles, Image as ImageIcon, Rocket, 
    Smartphone, Music, Video, 
    Upload
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ideaService } from "@/services/idea.services";
import { uploadToCloudinary } from "@/services/uploadToCloudinary";
import AuthGuardModal from "@/components/AuthModal";
import { useViewStore } from "@/stores/useViewStore";

interface Props {
  loadData?: () => void;
}

const CATEGORIES = [
    { id: 'saas', name: 'SaaS / App', icon: Smartphone },
    { id: 'youtube', name: 'YouTube', icon: Rocket },
    { id: 'tiktok', name: 'TikTok', icon: Music },
    { id: 'cinema', name: 'Cinema', icon: Video },
    { id: 'startup', name: 'Startup', icon: Rocket },
    { id: 'other', name: 'Other', icon: Sparkles },
];

export default function CreateIdeaModal({ loadData }: Props) {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('saas');
  const [title, setTitle] = useState("");
  const [pitch, setPitch] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCreateModal = useViewStore(s => s.isCreateModal);
  const setCreateModal = useViewStore(s => s.setCreateModal);
  const closeModal = () => {
    setCreateModal();
    loadData?.();
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
        setIsAuthModalOpen(true);
        return;
    }
    if (!title || !pitch) {
        alert("Vui lòng điền đủ thông tin!");
        return;
    }

    setIsSubmitting(true);
    try {
        let imageUrl = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800";
        if (imageFile) {
            imageUrl = await uploadToCloudinary(imageFile);
        }

        const categoryName = CATEGORIES.find(c => c.id === selectedCategory)?.name || "Other";

        await ideaService.createIdea({
            title,
            problem: pitch,
            solution: "Đang được hoàn thiện...", // Default for now
            authorId: user.uid,
            authorName: user.displayName || "Anonymous",
            authorAvatar: user.photoURL || "",
            category: categoryName,
            imageUrl
        });

        alert("Đã phóng ý tưởng thành công!");
        closeModal();
        // Reset state
        setTitle("");
        setPitch("");
        setImagePreview(null);
        setImageFile(null);
    } catch (error) {
        console.error("Failed to create idea:", error);
        alert("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isCreateModal && (
        <div className="fixed inset-0 z-3000 flex items-center justify-center py-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-4xl rounded-[32px] md:rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[95vh] overflow-y-auto"
          >
            {/* Left Side: Preview/Image Upload */}
            <div className="w-full md:w-5/12 bg-slate-50 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col items-center justify-center relative">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    className="hidden" 
                    accept="image/*"
                />
                
                {imagePreview ? (
                    <div className="relative w-full h-60 md:h-auto md:aspect-[4/5] rounded-3xl overflow-hidden group">
                        <img src={imagePreview} className="w-full h-full object-cover" />
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        >
                            <div className="bg-white p-3 rounded-full text-slate-900">
                                <Upload size={20} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-60 md:h-auto md:aspect-[4/5] border-4 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 group hover:border-rose-300 hover:bg-rose-50 transition-all cursor-pointer"
                    >
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors">
                            <ImageIcon size={32} />
                        </div>
                        <div className="text-center px-6">
                            <p className="font-black text-xs uppercase tracking-widest text-slate-400 group-hover:text-rose-500">Tải ảnh mô tả</p>
                            <p className="text-[10px] text-slate-300 font-bold mt-1">Làm cho ý tưởng của bạn nổi bật hơn</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2 text-rose-500">
                    <Sparkles size={20} />
                    <span className="font-black text-[10px] uppercase tracking-[0.2em]">New Pitch</span>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <h2 className="text-3xl font-black tracking-tighter mb-2 uppercase italic text-slate-900">Tạo ý tưởng <span className="text-rose-500">triệu đô</span></h2>
              <p className="text-slate-500 mb-8 font-medium italic">"Mọi thành công đều bắt đầu từ một ý tưởng được thực thi."</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tên ý tưởng</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Nền tảng thuê đồ Camping..."
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-2xl outline-none transition-all font-bold placeholder:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Lĩnh vực</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => (
                        <button 
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selectedCategory === cat.id ? 'border-rose-500 bg-rose-50 text-rose-500' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                        >
                            <cat.icon size={20} />
                            <span className="text-[9px] font-black uppercase tracking-tighter">{cat.name}</span>
                        </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pitch ngắn gọn (Vấn đề & Giải pháp)</label>
                  <textarea
                    rows={4}
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    placeholder="Bạn giải quyết vấn đề gì? Tại sao nó quan trọng?"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-2xl outline-none transition-all font-medium placeholder:text-slate-200"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={closeModal} disabled={isSubmitting} className="flex-1 py-4 font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50">Hủy</button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-rose-500 transition-colors shadow-lg disabled:bg-slate-400"
                  >
                    {isSubmitting ? "ĐANG PHÓNG..." : "PHÓNG Ý TƯỞNG"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <AuthGuardModal 
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            message="Vui lòng đăng nhập để phóng ý tưởng bứt phá của bạn!"
          />
        </div>
      )}
    </AnimatePresence>
  );
}
