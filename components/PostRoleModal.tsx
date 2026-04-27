import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Briefcase, Zap } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ideaService } from "../services/idea.services";
import { projectService } from "../services/project.services";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function PostRoleModal({ isOpen, onClose }: Props) {
    const { user } = useAuth();
    const [userIdeas, setUserIdeas] = useState<any[]>([]);
    const [selectedIdeaId, setSelectedIdeaId] = useState("");
    const [role, setRole] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            // Fetch user's ideas to select from
            ideaService.getAllIdeas().then(ideas => {
                setUserIdeas(ideas.filter(i => i.authorId === user.uid));
            });
        }
    }, [isOpen, user]);

    const handleSubmit = async () => {
        if (!user || !selectedIdeaId || !role) {
            alert("Vui lòng chọn dự án và nhập vị trí cần tuyển!");
            return;
        }

        setLoading(true);
        try {
            const idea = userIdeas.find(i => i.id === selectedIdeaId);
            await projectService.createProject({
                name: idea.title,
                authorId: user.uid,
                authorName: user.displayName || "Anonymous",
                authorAvatar: user.photoURL || "",
                category: idea.category,
                imageUrl: idea.imageUrl || "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800",
                progress: 10,
                lookingFor: [
                    { role, iconName: "Users" }
                ]
            });
            onClose();
        } catch (error) {
            console.error("Failed to post role:", error);
            alert("Đã có lỗi xảy ra. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center py-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-white w-full max-w-xl rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto"
                    >
                        <div className="p-6 md:p-12">
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                                    <Briefcase size={24} />
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <h2 className="text-3xl font-black tracking-tighter mb-2 uppercase italic text-slate-900">Tìm kiếm <span className="text-rose-500">Đồng đội</span></h2>
                            <p className="text-slate-500 mb-8 font-medium">Xây dựng đội nhóm mơ ước để hiện thực hóa ý tưởng của bạn.</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Dự án của bạn</label>
                                    <select 
                                        value={selectedIdeaId}
                                        onChange={(e) => setSelectedIdeaId(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-2xl outline-none transition-all font-bold"
                                    >
                                        <option value="">Chọn một ý tưởng...</option>
                                        {userIdeas.map(idea => (
                                            <option key={idea.id} value={idea.id}>{idea.title}</option>
                                        ))}
                                    </select>
                                    {userIdeas.length === 0 && (
                                        <p className="text-[10px] text-rose-500 mt-2 font-bold uppercase tracking-widest">Bạn cần tạo ý tưởng trước khi tuyển thành viên!</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Vị trí cần tuyển</label>
                                    <input 
                                        type="text" 
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        placeholder="Ví dụ: React Developer, Video Editor..."
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-2xl outline-none transition-all font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Quyền lợi/Mô tả</label>
                                    <textarea 
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Ví dụ: Co-founder, trả lương theo dự án, hoặc Share Profit..."
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-2xl outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="mt-10 flex gap-4">
                                <button onClick={onClose} className="flex-1 py-4 font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Hủy</button>
                                <button 
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-rose-500 transition-colors shadow-lg disabled:opacity-50"
                                >
                                    {loading ? "ĐANG ĐĂNG..." : "ĐĂNG TIN"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
