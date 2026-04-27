'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Filter, Search,
  Code, Megaphone, Video, Briefcase,
  Layers, Zap, SearchIcon, MessageSquare,
  MapPin, Star, Plus,
  LucideIcon
} from "lucide-react";
import ChatOverlay from "@/components/ChatOverlay";
import PostRoleModal from "@/components/PostRoleModal";
import ProjectWorkspace from "@/components/ProjectWorkspace";
import ProfileModal from "@/components/ProfileModal";
import AuthGuardModal from "@/components/AuthModal";
import { projectService, ProjectTeam } from "@/services/project.services";
import { notificationService } from "@/services/notification.services";
import { useAuth } from "@/hooks/useAuth";
import { userService, UserProfile } from "@/services/user.services";
import FilterBar from "@/components/FilterBar";
import Image from "next/image";

const CATEGORIES = ["IT / Code", "Marketing", "Video Editor", "Design", "Content", "Other"];

const ROLE_ICONS: Record<string, LucideIcon> = {
  "Code": Code,
  "Marketing": Megaphone,
  "Video": Video,
  "Design": Layers,
  "Content": Briefcase,
  "Other": Zap
};

export default function TeamsPage() {
  const { user } = useAuth();
  const [view, setView] = useState<'projects' | 'talent'>('projects');
  const [projects, setProjects] = useState<ProjectTeam[]>([]);
  const [makers, setMakers] = useState<UserProfile[]>([]);
  const [isPostRoleOpen, setIsPostRoleOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<any>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<ProjectTeam | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsData, usersData] = await Promise.all([
        projectService.getAllProjects(),
        userService.getAllUsers()
      ]);
      setProjects(projectsData);
      setMakers(usersData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMakers = makers.filter(m => {
    const matchesSearch = (m.displayName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.role || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.skills || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || (m.role || "").includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleJoinTeam = async (projectId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      await projectService.joinProject(projectId, user.uid);

      // Notify project author
      const project = projects.find(p => p.id === projectId);
      if (project) {
        await notificationService.notify(project.authorId, {
          senderId: user.uid,
          senderName: user.displayName || "Explorer",
          senderAvatar: user.photoURL || "",
          type: 'join_request',
          content: `vừa gia nhập nhóm dự án "${project.name}" của bạn.`,
          link: `/teams`
        });
      }

      alert("Đã tham gia nhóm thành công!");
      loadData(); // Refresh
    } catch (error) {
      console.error("Failed to join team:", error);
    }
  };

  const getRoleIcon = (name: string) => ROLE_ICONS[name] || Briefcase;

  return (
    <div className="w-full mb-30">
      <section className="relative w-full h-[400px] md:h-[520px] flex items-center overflow-hidden bg-slate-950">
        <Image
          src="/bgteams.png"
          alt="BackgroundTeams"
          fill
          priority
          className="object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-0" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-rose-400 border border-white/10 mb-6 backdrop-blur-md">
              <Zap className="w-3 h-3 md:w-4 md:h-4 fill-current animate-pulse" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white">
                Project Matchmaking
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter">
              Tìm đồng đội <br />
              <span className="text-rose-500">cùng thực thi.</span>
            </h1>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-24 relative z-30">
        {/* TAB SWITCHER - Fix Responsive here */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-[32px] border border-slate-100 shadow-2xl mb-8">
          <div className="flex flex-1 gap-2">
            <button
              onClick={() => setView('projects')}
              className={`flex-1 px-6 py-4 rounded-[24px] font-black uppercase tracking-widest text-[10px] md:text-xs transition-all ${view === 'projects' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'
                }`}
            >
              Việc tìm người
            </button>
            <button
              onClick={() => setView('talent')}
              className={`flex-1 px-6 py-4 rounded-[24px] font-black uppercase tracking-widest text-[10px] md:text-xs transition-all ${view === 'talent' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'
                }`}
            >
              Người tìm việc
            </button>
          </div>

          <button
            onClick={() => setIsPostRoleOpen(true)}
            className="w-full sm:w-auto bg-rose-500 text-white px-8 py-4 rounded-[24px] font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            {view === 'projects' ? "Đăng dự án" : "Tạo CV Maker"}
          </button>
        </div>

        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          placeholder={view === 'projects' ? "Tìm các đội nhóm đang cần đồng đội..." : "Tìm các cộng sự tài năng IT, Editor, Marketing..."}
        />

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-rose-500 rounded-full animate-spin" />
            </div>
          ) : view === 'projects' ? (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  className="group bg-white rounded-[24px] md:rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col"
                >
                  <div className="h-32 md:h-40 relative overflow-hidden">
                    <img src={project.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
                    <div className="absolute bottom-3 left-4 px-3 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-900 text-white text-[7px] md:text-[9px] font-black uppercase tracking-widest rounded-full">{project.category}</span>
                      <div className="flex -space-x-1.5">
                        {project.members?.slice(0, 3).map((mUid, i) => (
                          <div key={mUid} className="w-4 md:w-5 h-4 md:h-5 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                            <img src={`https://ui-avatars.com/api/?name=${mUid}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="absolute top-3 right-4">
                      <div className="w-10 h-10 rounded-lg bg-white/90 backdrop-blur-md shadow-lg flex flex-col items-center justify-center text-slate-900 font-extrabold leading-tight">
                        <span className="text-xs md:text-sm">{project.progress}%</span>
                        <span className="text-[7px] md:text-[8px] uppercase opacity-40">Build</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 md:p-6 pt-3 flex-1 flex flex-col">
                    <h3 className="text-lg md:text-xl font-black mb-4 group-hover:text-rose-500 transition-colors uppercase italic tracking-tighter line-clamp-1">{project.name}</h3>
                    <div className="mb-6 space-y-3 flex-1">
                      <h4 className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1.5">Mở:</h4>
                      <div className="grid grid-cols-1 gap-1.5">
                        {project.lookingFor?.slice(0, 2).map((item) => {
                          const Icon = getRoleIcon(item.iconName || item.role);
                          return (
                            <div key={item.role} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg hover:bg-rose-50 transition-colors">
                              <div className="p-1 bg-white rounded-md text-rose-500 shadow-sm"><Icon size={10} /></div>
                              <span className="text-[9px] md:text-xs font-black text-slate-700 tracking-tight">{item.role}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setChatTarget({ name: project.authorName, avatar: project.authorAvatar || project.authorName?.[0], role: "Founder" })}
                        className="flex-1 py-3 border-2 border-slate-50 text-slate-900 font-black uppercase tracking-widest text-[8px] md:text-[9px] rounded-lg md:rounded-xl hover:border-slate-900 transition-all flex items-center justify-center gap-2"
                      >
                        <MessageSquare size={14} /> Founder
                      </button>
                      {user && project.members?.includes(user.uid) ? (
                        <button
                          onClick={() => setActiveWorkspace(project)}
                          className="flex-1 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[8px] md:text-[9px] rounded-lg md:rounded-xl hover:bg-rose-500 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Zap size={14} /> Work
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinTeam(project.id!)}
                          className="flex-1 py-3 bg-rose-500 text-white font-black uppercase tracking-widest text-[8px] md:text-[9px] rounded-lg md:rounded-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Plus size={14} /> Join
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="talent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {filteredMakers.map((maker) => (
                <motion.div
                  key={maker.uid}
                  whileHover={{ y: -8 }}
                  className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 md:w-12 h-10 md:h-12 rounded-[12px] md:rounded-[14px] bg-rose-500 text-white flex items-center justify-center text-base md:text-lg font-black shadow-lg shadow-rose-100 overflow-hidden">
                      {maker.photoURL ? (
                        <img src={maker.photoURL} alt={maker.displayName || ""} className="w-full h-full object-cover" />
                      ) : (
                        (maker.displayName || "E")[0]
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-black">
                      <Star size={12} fill="currentColor" />
                      <span className="text-[10px] md:text-xs">{maker.rating || 5.0}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-0.5 line-clamp-1">{maker.displayName}</h3>
                  <div className="text-rose-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-3">{maker.role}</div>

                  <p className="text-slate-500 text-[10px] md:text-xs font-medium mb-5 leading-relaxed line-clamp-2 italic">"{maker.bio || "Hi, I'm a Maker!"}"</p>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {(maker.skills || ["Sáng tạo"]).slice(0, 3).map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-slate-51 text-slate-400 text-[7px] md:text-[8px] font-black uppercase tracking-widest rounded-md border border-slate-50">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 mb-5">
                    <div className={`w-1.5 h-1.5 rounded-full ${(maker.availability || "").includes("Sẵn sàng") ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{maker.availability || "Sẵn sàng"}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedProfile(maker)}
                      className="py-2.5 bg-slate-50 text-slate-900 font-black uppercase tracking-widest text-[8px] md:text-[9px] rounded-lg md:rounded-xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100"
                    >
                      Hồ sơ
                    </button>
                    <button
                      onClick={() => setChatTarget({ name: maker.displayName, avatar: (maker.displayName || "E")[0], role: maker.role })}
                      className="py-2.5 bg-rose-500 text-white font-black uppercase tracking-widest text-[8px] md:text-[9px] rounded-lg md:rounded-xl hover:bg-rose-600 transition-all shadow-md"
                    >
                      Chat
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ProfileModal
        user={selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />

      <ChatOverlay
        isOpen={!!chatTarget}
        onClose={() => setChatTarget(null)}
        targetUser={chatTarget}
      />

      <PostRoleModal
        isOpen={isPostRoleOpen}
        onClose={() => {
          setIsPostRoleOpen(false);
          loadData();
        }}
      />

      <AuthGuardModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        message="Vui lòng đăng nhập để tham gia nhóm dự án này!"
      />

      <AnimatePresence>
        {activeWorkspace && (
          <ProjectWorkspace
            project={activeWorkspace}
            onClose={() => setActiveWorkspace(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
