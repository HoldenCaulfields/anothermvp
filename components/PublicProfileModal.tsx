import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Award, MapPin, Briefcase, Star, MessageSquare, Zap, Music } from "lucide-react";
import { userService, UserProfile } from "../services/user.services";
import { projectService, ProjectTeam } from "../services/project.services";
import { useRouter } from "next/navigation";

interface PublicProfileModalProps {
    userId: string | null;
    onClose: () => void;
    onMessageClick?: (user: any) => void;
}

export default function PublicProfileModal({ userId, onClose, onMessageClick }: PublicProfileModalProps) {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [projects, setProjects] = useState<ProjectTeam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            setLoading(true);
            const loadData = async () => {
                try {
                    // We need a getProfileByUid in userServices if it doesn't exist
                    const snapshot = await userService.getAllUsers(); // Temp fallback if no single fetch
                    const userProfile = snapshot.find(u => u.uid === userId);
                    
                    if (userProfile) {
                        setProfile(userProfile);
                        const userProjs = await projectService.getUserProjects(userId);
                        setProjects(userProjs);
                    }
                } catch (error) {
                    console.error("Error loading profile:", error);
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }
    }, [userId]);

    if (!userId) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl"
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row"
                >
                    {loading ? (
                        <div className="w-full h-96 flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-slate-100 border-t-rose-500 rounded-full animate-spin" />
                        </div>
                    ) : profile ? (
                        <>
                            {/* Left Side - Hero Profile */}
                            <div className="w-full md:w-1/3 bg-slate-900 p-8 md:p-12 text-white flex flex-col h-full overflow-y-auto">
                                <button 
                                    onClick={onClose}
                                    className="absolute top-6 left-6 p-2 bg-white/10 rounded-full md:hidden"
                                >
                                    <X size={20} />
                                </button>

                                <div className="relative mb-8 text-center md:text-left">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[32px] md:rounded-[40px] border-4 border-white/10 mx-auto md:mx-0 overflow-hidden shadow-2xl mb-6">
                                        <img 
                                            src={profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName}`} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400 mb-2 font-black text-sm">
                                        <Star size={14} fill="currentColor" /> {profile.rating || 5.0}
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter leading-none mb-2">{profile.displayName}</h2>
                                    <div className="text-rose-400 text-[10px] font-black uppercase tracking-widest">{profile.role}</div>
                                </div>

                                <div className="space-y-8 flex-1">
                                    <section>
                                        <h3 className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-3">Về bản thân</h3>
                                        <p className="text-sm font-medium leading-relaxed italic text-white/70">"{profile.bio}"</p>
                                    </section>

                                    <section>
                                        <h3 className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Mạng xã hội</h3>
                                        <div className="flex gap-4">
                                            {profile.socialLinks?.github && <a href={profile.socialLinks.github} target="_blank" className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"><Music size={18} /></a>}
                                            {profile.socialLinks?.youtube && <a href={profile.socialLinks.youtube} target="_blank" className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"><Music size={18} /></a>}
                                            {profile.socialLinks?.tiktok && <a href={profile.socialLinks.tiktok} target="_blank" className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"><Music size={18} /></a>}
                                            {profile.socialLinks?.facebook && <a href={profile.socialLinks.facebook} target="_blank" className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"><Music size={18} /></a>}
                                        </div>
                                    </section>
                                </div>

                                <button 
                                    onClick={() => onMessageClick?.({ name: profile.displayName, avatar: profile.photoURL, role: profile.role })}
                                    className="mt-12 w-full py-4 bg-rose-500 hover:bg-white hover:text-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all flex items-center justify-center gap-3"
                                >
                                    <MessageSquare size={16} /> Nhắn tin ngay
                                </button>
                            </div>

                            {/* Right Side - CV & Projects */}
                            <div className="flex-1 p-8 md:p-14 overflow-y-auto bg-white">
                                <div className="hidden md:flex justify-end mb-10">
                                    <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-full border border-slate-100 text-slate-400 hover:text-slate-900 transition-all">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-12">
                                    <section>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-rose-50 rounded-xl text-rose-500"><Award size={20} /></div>
                                            <h3 className="font-black uppercase tracking-widest text-xs">Kỹ năng chuyên môn</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.skills?.map(skill => (
                                                <span key={skill} className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </section>

                                    <section>
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="p-2 bg-slate-900 rounded-xl text-white"><Briefcase size={20} /></div>
                                            <h3 className="font-black uppercase tracking-widest text-xs">Dự án đã tham gia (CV)</h3>
                                        </div>
                                        <div className="space-y-4">
                                            {projects.length === 0 ? (
                                                <div className="p-12 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100">
                                                    <Zap className="mx-auto mb-4 text-slate-200" size={32} />
                                                    <p className="text-[10px] font-black uppercase text-slate-400">Chưa có dự án công khai</p>
                                                </div>
                                            ) : (
                                                projects.map(proj => (
                                                    <div 
                                                        key={proj.id} 
                                                        onClick={() => {
                                                            onClose();
                                                            const path = proj.progress === 100 ? '/products' : '/teams';
                                                            router.push(path);
                                                        }}
                                                        className="p-6 bg-slate-50 rounded-[32px] flex items-center justify-between group hover:bg-slate-900 hover:text-white transition-all cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-xl">
                                                                <img src={proj.imageUrl} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <div className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-1">{proj.category}</div>
                                                                <h4 className="text-lg font-black uppercase italic tracking-tighter leading-none">{proj.name}</h4>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <div className="w-20 h-1 bg-slate-200 group-hover:bg-white/20 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-rose-500" style={{ width: `${proj.progress}%` }} />
                                                                    </div>
                                                                    <span className="text-[8px] font-black opacity-60">
                                                                        {proj.progress === 100 ? 'LAUNCHED' : `${proj.progress}%`}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="p-2 border border-slate-200 group-hover:border-white/20 rounded-xl">
                                                            <Zap size={16} />
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-20 text-center w-full">Không tìm thấy thông tin thành viên.</div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
