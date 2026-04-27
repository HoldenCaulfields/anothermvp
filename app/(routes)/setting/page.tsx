'use client';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, User, Briefcase, FileText, Globe, Plus, Trash2, Award, Zap, ExternalLink, Download, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/user.services";
import { projectService, ProjectTeam } from "@/services/project.services";

export default function SettingsPage() {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const [profile, setProfile] = useState({
        displayName: "",
        role: "",
        bio: "",
        availability: "Sẵn sàng",
        skills: [] as string[],
        portfolio: [] as { title: string; link: string }[],
        socialLinks: {
            github: "",
            facebook: "",
            tiktok: "",
            youtube: ""
        }
    });

    const [newSkill, setNewSkill] = useState("");
    const [portTitle, setPortTitle] = useState("");
    const [portLink, setPortLink] = useState("");
    const [userProjects, setUserProjects] = useState<ProjectTeam[]>([]);

    useEffect(() => {
        if (user) {
            projectService.getUserProjects(user.uid).then(setUserProjects);
            userService.syncUserProfile(user).then(p => {
                if (p) {
                    setProfile({
                        displayName: p.displayName || "",
                        role: p.role || "Young Explorer",
                        bio: p.bio || "",
                        availability: p.availability || "Sẵn sàng",
                        skills: p.skills || [],
                        portfolio: (p as any).portfolio || [],
                        socialLinks: (p as any).socialLinks || { github: "", facebook: "", tiktok: "", youtube: "" }
                    });
                }
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await userService.updateProfile(user.uid, profile);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Failed to save profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
            setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
            setNewSkill("");
        }
    };

    const removeSkill = (skill: string) => {
        setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
    };

    if (!user) return (
        <div className="min-h-[80vh] max-w-4xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-500 mb-8 shadow-inner"
            >
                <User size={48} />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter mb-6 leading-none">
                1 chạm <br className="block md:hidden" /> <span className="text-rose-500 not-italic">duy nhất!</span>
            </h1>
            <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto text-sm md:text-base">
                Đăng nhập để quản lý "thương hiệu cá nhân" và xuất hiện tại Chợ tài năng.
            </p>
            <button
                onClick={() => login()}
                className="w-full max-w-xs flex items-center justify-center gap-4 bg-white border-[3px] border-slate-900 text-slate-900 px-6 py-5 rounded-[28px] font-black uppercase text-xs tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Google Login
            </button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-16">
            <header className="mb-12 md:mb-20 text-center md:text-left">
                <motion.h1
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 uppercase italic leading-[0.85]"
                >
                    Thiết lập <br />
                    <span className="text-rose-500 not-italic">cá nhân</span>
                </motion.h1>
            </header>

            <div className="flex flex-col lg:flex-row gap-8 md:gap-12 pb-32 lg:pb-12">
                {/* Main Content Area */}
                <div className="flex-1 space-y-8 md:space-y-12">

                    {/* Basic Info */}
                    <section className="bg-white p-6 md:p-12 rounded-[40px] md:rounded-[56px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 text-rose-500 mb-8">
                            <div className="p-3 bg-rose-50 rounded-2xl">
                                <User size={24} />
                            </div>
                            <h2 className="font-black uppercase tracking-[0.2em] text-sm md:text-base">Thông tin cốt lõi</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Họ và Tên</label>
                                <input
                                    type="text"
                                    value={profile.displayName}
                                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                                    className="w-full h-16 bg-slate-50 rounded-[24px] px-8 font-bold border-2 border-transparent focus:border-rose-500/20 focus:bg-white transition-all outline-none"
                                />
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Vai trò chính</label>
                                <input
                                    type="text"
                                    value={profile.role}
                                    placeholder="vd: UI Designer, Film Director..."
                                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                                    className="w-full h-16 bg-slate-50 rounded-[24px] px-8 font-bold border-2 border-transparent focus:border-rose-500/20 focus:bg-white transition-all outline-none"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Giới thiệu ngắn (Bio)</label>
                                <textarea
                                    value={profile.bio}
                                    rows={4}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    className="w-full bg-slate-50 rounded-[24px] p-8 font-medium border-2 border-transparent focus:border-rose-500/20 focus:bg-white transition-all outline-none resize-none"
                                    placeholder="Kể về những dự án bạn tự hào nhất..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Skills & Portfolio */}
                    <section className="bg-white p-6 md:p-12 rounded-[40px] md:rounded-[56px] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 text-rose-500 mb-8">
                            <div className="p-3 bg-rose-50 rounded-2xl">
                                <Briefcase size={24} />
                            </div>
                            <h2 className="font-black uppercase tracking-[0.2em] text-sm md:text-base">Năng lực thực chiến</h2>
                        </div>

                        <div className="space-y-10">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Kỹ năng (Skills)</label>
                                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                                        className="flex-1 h-14 bg-slate-50 rounded-2xl px-6 py-3 font-bold border-2 border-transparent focus:border-rose-500/20 focus:bg-white transition-all outline-none text-md"
                                        placeholder="Gõ kỹ năng & nhấn Enter..."
                                    />
                                    <button onClick={addSkill} className="h-14 px-8 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 transition-all active:scale-95">Add Skill</button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <AnimatePresence>
                                        {profile.skills.map(s => (
                                            <motion.span
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.8, opacity: 0 }}
                                                key={s}
                                                className="pl-5 pr-3 py-3 bg-slate-900 rounded-full text-md font-black text-white flex items-center gap-3 border border-slate-800 shadow-lg shadow-slate-200"
                                            >
                                                {s}
                                                <button onClick={() => removeSkill(s)} className="p-1 hover:bg-rose-500 rounded-full transition-colors"><Trash2 size={12} /></button>
                                            </motion.span>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="pt-10 border-t border-slate-50">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Showcase / Portfolio</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                    <input
                                        type="text"
                                        value={portTitle}
                                        placeholder="Tên sản phẩm..."
                                        onChange={(e) => setPortTitle(e.target.value)}
                                        className="h-14 bg-slate-50 rounded-2xl px-6 font-bold border-2 border-transparent focus:border-rose-500/20 outline-none text-md"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={portLink}
                                            placeholder="URL (Behance, GitHub...)"
                                            onChange={(e) => setPortLink(e.target.value)}
                                            className="flex-1 h-14 bg-slate-50 rounded-2xl px-6 font-bold border-2 border-transparent focus:border-rose-500/20 outline-none text-sm"
                                        />
                                        <button
                                            onClick={() => {
                                                if (portTitle && portLink) {
                                                    setProfile({ ...profile, portfolio: [...profile.portfolio, { title: portTitle, link: portLink }] });
                                                    setPortTitle(""); setPortLink("");
                                                }
                                            }}
                                            className="w-14 h-14 flex items-center justify-center bg-rose-500 text-white rounded-2xl hover:bg-slate-900 transition-all active:scale-95 shadow-lg shadow-rose-100"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {profile.portfolio.map((p, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 group hover:border-rose-200 transition-all shadow-sm">
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 shrink-0">
                                                    <Globe size={18} />
                                                </div>
                                                <span className="text-sm font-black text-slate-900 truncate uppercase tracking-tighter italic">{p.title}</span>
                                            </div>
                                            <button onClick={() => setProfile({ ...profile, portfolio: profile.portfolio.filter((_, i) => i !== idx) })} className="p-2 text-slate-300 hover:text-rose-500 transition-colors shrink-0">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Social Connect */}
                    <section className="bg-white p-6 md:p-12 rounded-[40px] md:rounded-[56px] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 text-rose-500 mb-8">
                            <div className="p-3 bg-rose-50 rounded-2xl">
                                <Globe size={24} />
                            </div>
                            <h2 className="font-black uppercase tracking-[0.2em] text-sm md:text-base">Mạng lưới kết nối</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                            {Object.entries(profile.socialLinks).map(([key, value]) => (
                                <div key={key}>
                                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">{key}</label>
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, [key]: e.target.value } })}
                                        className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-bold border-2 border-transparent focus:border-rose-500/20 focus:bg-white transition-all outline-none capitalize"
                                        placeholder={`Link ${key}...`}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar - Sticky on Desktop, Bottom Bar on Mobile */}
                <div className="lg:w-80 space-y-6">
                    <div className="lg:sticky lg:top-8 space-y-6">

                        {/* Status Card */}
                        <section className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-rose-500/40 transition-colors" />
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 relative z-10">Trạng thái hiện tại</label>
                            <div className="relative z-10">
                                <select
                                    value={profile.availability}
                                    onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 font-black text-sm outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all italic tracking-tighter"
                                >
                                    <option className="text-slate-900" value="Sẵn sàng">Sẵn sàng (Available)</option>
                                    <option className="text-slate-900" value="Sẵn sàng (Freelance)">Freelance Only</option>
                                    <option className="text-slate-900" value="Đang bận">Đang bận (Busy)</option>
                                    <option className="text-slate-900" value="Chỉ làm Co-founder">Co-founder Only</option>
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16} />
                            </div>
                        </section>

                        {/* CV Export Card */}
                        <section className="bg-rose-500 p-8 rounded-[40px] text-white shadow-2xl shadow-rose-200 relative overflow-hidden group">
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/10 blur-3xl rounded-full" />
                            <div className="flex justify-between items-start mb-6">
                                <FileText size={48} className="opacity-30 group-hover:rotate-12 transition-transform" />
                                <div className="bg-white/20 px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase">Beta</div>
                            </div>
                            <h3 className="text-3xl font-black italic uppercase leading-[0.85] tracking-tighter mb-4">Idea CV <br />Generator</h3>
                            <p className="text-[10px] font-bold text-rose-100 uppercase leading-relaxed mb-8 opacity-80">Xuất hồ sơ chuyên nghiệp để gửi trực tiếp cho các nhà đầu tư hoặc founder dự án.</p>
                            <button className="w-full py-5 bg-white text-rose-500 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3">
                                <Download size={18} /> Export CV
                            </button>
                        </section>

                        {/* DESKTOP SAVE BUTTON */}
                        <div className="hidden lg:block pt-4">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className={`w-full py-6 rounded-[32px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 ${saved ? 'bg-green-500 text-white' : 'bg-slate-900 text-white hover:bg-rose-500'}`}
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                ) : saved ? (
                                    <>Saved Successfully</>
                                ) : (
                                    <>
                                        <Save size={20} /> Save Profile
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MOBILE FIXED ACTION BAR - ĐÃ FIX CHE KHUẤT */}
            <div className="lg:hidden fixed bottom-24 left-4 right-4 z-[100]">
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/80 backdrop-blur-2xl p-4 rounded-[32px] border border-slate-200/50 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex gap-3"
                >
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`flex-1 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 active:scale-95 ${saved ? 'bg-green-500 text-white' : 'bg-slate-900 text-white shadow-xl shadow-slate-900/20'
                            }`}
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : saved ? (
                            "Đã lưu thành công!"
                        ) : (
                            <>
                                <Save size={18} /> Lưu hồ sơ
                            </>
                        )}
                    </button>

                    {/* Nút phụ nhỏ bên cạnh để cân bằng UI */}
                    <button className="w-14 h-14 bg-rose-50 text-rose-500 rounded-[22px] flex items-center justify-center border border-rose-100 shrink-0">
                        <Download size={20} />
                    </button>
                </motion.div>
            </div>
        </div>
    );
}