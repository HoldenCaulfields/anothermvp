import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Globe, Music, User, Briefcase, ExternalLink } from "lucide-react";
import { UserProfile } from "../services/user.services";

interface ProfileModalProps {
    user: UserProfile | null;
    onClose: () => void;
}

export default function ProfileModal({ user, onClose }: ProfileModalProps) {
    if (!user) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto"
                >
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-slate-100 rounded-full hover:bg-rose-500 hover:text-white transition-all z-10"
                    >
                        <X size={18} />
                    </button>

                    <div className="h-24 md:h-32 bg-slate-900 relative">
                        <div className="absolute -bottom-10 md:-bottom-12 left-6 md:left-8 w-20 h-20 md:w-24 md:h-24 rounded-[24px] md:rounded-[32px] bg-rose-500 border-4 border-white shadow-xl flex items-center justify-center text-2xl md:text-3xl font-black text-white overflow-hidden">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || ""} className="w-full h-full object-cover" />
                            ) : (
                                (user.displayName || "E")[0]
                            )}
                        </div>
                    </div>

                    <div className="p-6 md:p-8 pt-12 md:pt-16">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight mb-1">{user.displayName}</h2>
                                <p className="text-rose-500 font-black uppercase text-xs tracking-widest">{user.role}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl text-amber-600 font-black">
                                <Star size={14} fill="currentColor" />
                                <span className="text-sm">{user.rating || 5.0}</span>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <section>
                                <div className="flex items-center gap-2 text-slate-400 mb-3">
                                    <User size={14} />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest">Tiểu sử</h3>
                                </div>
                                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                    {user.bio || "Thành viên tích cực của IdeaForge Hub. Đang tìm kiếm những cơ hội bứt phá."}
                                </p>
                            </section>

                            <section>
                                <div className="flex items-center gap-2 text-slate-400 mb-3">
                                    <Briefcase size={14} />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest">Kỹ năng</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(user.skills || ["Sáng tạo", "Làm việc nhóm"]).map(skill => (
                                        <span key={skill} className="px-4 py-2 bg-slate-50 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </section>

                            {/* Portfolio */}
                            {(user as any).portfolio && (user as any).portfolio.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                                        <Globe size={14} />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest">Portfolio & Dự án</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {(user as any).portfolio.map((p: any, idx: number) => (
                                            <a 
                                                key={idx} 
                                                href={p.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-rose-200 transition-all"
                                            >
                                                <span className="text-xs font-bold text-slate-900">{p.title}</span>
                                                <ExternalLink size={12} className="text-slate-300 group-hover:text-rose-500" />
                                            </a>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Social */}
                            <section className="pt-8 border-t border-slate-50">
                                <div className="flex gap-4">
                                    {(user as any).socialLinks?.github && (
                                        <a href={(user as any).socialLinks.github} target="_blank" className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-rose-500 transition-all shadow-lg">
                                            <Globe size={20} />
                                        </a>
                                    )}
                                    {(user as any).socialLinks?.facebook && (
                                        <a href={(user as any).socialLinks.facebook} target="_blank" className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-rose-500 transition-all shadow-lg">
                                            <Globe size={20} />
                                        </a>
                                    )}
                                    {(user as any).socialLinks?.tiktok && (
                                        <a href={(user as any).socialLinks.tiktok} target="_blank" className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center hover:bg-rose-500 transition-all shadow-lg">
                                            <Music size={20} />
                                        </a>
                                    )}
                                    {(user as any).socialLinks?.youtube && (
                                        <a href={(user as any).socialLinks.youtube} target="_blank" className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center hover:bg-rose-500 transition-all shadow-lg">
                                            <Globe size={20} />
                                        </a>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
