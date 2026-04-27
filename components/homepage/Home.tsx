import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Footer from "../homepage/Footer";
import DownLoad from "../homepage/DownLoad";
import HeroSection from "../HeroSection";
import Explain from "../homepage/Explain";
import { ArrowRight, MessageCircle, Package, Search, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ideaService, Idea } from "@/services/idea.services";
import { projectService, ProjectTeam } from "@/services/project.services";
import CreateIdeaModal from "../cards/CreateIdeaModal";

export const Home: React.FC = () => {
  const featuredRef = useRef<HTMLElement>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [trendingIdeas, setTrendingIdeas] = useState<Idea[]>([]);
  const [activeTeams, setActiveTeams] = useState<ProjectTeam[]>([]);

  useEffect(() => {
    Promise.all([
      ideaService.getTopIdeas(3),
      projectService.getProjectsByStatus('building'),
      projectService.getProjectsByStatus('completed')
    ]).then(([ideas, building, completed]) => {
      setTrendingIdeas(ideas);
      setActiveTeams(building.slice(0, 3));
      setLoading(false);
    });
  }, []);

  const features = [
    { id: 1, title: "MỞ Ý TƯỞNG MỚI", subtitle: "Khởi tạo, rà soát vấn đề", imageUrl: "/ideas.png", path: '/ideas', icon: Sparkles },
    { id: 2, title: "NHÓM VẬN HÀNH", subtitle: "Đội ngũ IT, Marketer...", imageUrl: "/teams.png", path: '/teams', icon: Users },
    { id: 3, title: "HOÀN THÀNH DỰ ÁN", subtitle: "Các ý tưởng đã phát triển", imageUrl: "/money.jpg", path: '/products', icon: Package },
    { id: 4, title: "BẢN ĐỒ Ý TƯỞNG", subtitle: "Khám phá ý tưởng theo vùng", imageUrl: "/mapideas.png", path: '/mapideas', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-rose-100 selection:text-rose-600">
      <HeroSection />

      <main ref={featuredRef} className="max-w-7xl mx-auto px-4 md:px-8" >

        {/* Quick Action Features - Tối ưu Responsive */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 relative z-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 -mt-12 md:-mt-24 mb-10">
            {features.map((feature) => (
              <motion.button
                key={feature.id}
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(feature.path)}
                className="group relative h-32 sm:h-40 md:h-64 overflow-hidden rounded-[24px] md:rounded-[32px] border-2 md:border-4 border-white shadow-xl md:shadow-2xl flex flex-col justify-end p-4 md:p-6 bg-white"
              >
                <img
                  src={feature.imageUrl}
                  alt={feature.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                <div className="relative z-10 text-left">
                  <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-3 group-hover:bg-rose-500 transition-colors">
                    <feature.icon className="text-white" size={16} />
                  </div>
                  <h3 className="text-white font-black text-xs md:text-sm tracking-wider uppercase mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 text-[9px] md:text-xs font-medium line-clamp-1">
                    {feature.subtitle}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Section 1: Ý tưởng đang khảo sát */}
        <section className="mb-16 md:mb-32">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-8 md:mb-12 text-center md:text-left">
            <div className="max-w-2xl">
              <div className="flex items-center justify-center md:justify-start gap-2 text-rose-500 font-black uppercase tracking-widest text-[10px] md:text-xs mb-3 md:mb-4">
                <Sparkles size={16} />
                <span>01. Ý TƯỞNG & KHẢO SÁT</span>
              </div>
              <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-slate-900 leading-tight md:leading-none uppercase italic">
                SÀN LỌC <span className="text-rose-500 not-italic"> Ý TƯỞNG</span>
              </h2>
              <p className="mt-4 md:mt-6 text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                Đừng đoán mò. LovelyNet giúp bạn khảo sát xem ý tưởng có thực tế không trước khi bắt tay vào xây dựng đội ngũ.
              </p>
            </div>
            <Link href="/ideas" className="group flex items-center gap-2 font-black uppercase tracking-widest text-[10px] md:text-sm text-slate-900 hover:text-rose-500 transition-colors">
              Khám phá khảo sát <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-[24px] md:rounded-[32px]" />)
            ) : trendingIdeas.map((idea) => (
              <motion.div
                key={idea.id}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => router.push('/ideas')}
                className="relative h-64 md:h-80 rounded-[24px] md:rounded-[40px] overflow-hidden group cursor-pointer shadow-xl"
              >
                <img
                  src={idea.imageUrl || "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=800"}
                  alt={idea.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[9px] font-black uppercase text-white tracking-widest">{idea.category}</span>
                    <div className="flex items-center gap-1 text-green-400 text-[10px] font-black">
                      <TrendingUp size={12} />
                      {idea.demandPercentage || 0}% NHU CẦU
                    </div>
                  </div>
                  <h4 className="text-xl md:text-2xl font-black text-white mb-4 leading-tight tracking-tighter italic uppercase line-clamp-2">{idea.title}</h4>
                  <p className="text-white/60 text-xs font-medium line-clamp-2 mb-6 leading-relaxed italic">"{idea.problem}"</p>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-t border-white/10 pt-4 md:pt-6">
                    <span>{idea.votes?.length || 0} Ý kiến ủng hộ</span>
                    <span className="text-rose-500 group-hover:underline">Chi tiết pitch</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 2: Team đang tuyển / build */}
        <section className="mb-16 md:mb-32">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-8 md:mb-12 text-center md:text-left">
            <div className="max-w-2xl">
              <div className="flex items-center justify-center md:justify-start gap-2 text-rose-500 font-black uppercase tracking-widest text-[10px] md:text-xs mb-3 md:mb-4">
                <Users size={16} />
                <span>02. ĐỘI NGŨ CHIẾN (BUILDS)</span>
              </div>
              <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-slate-900 leading-tight md:leading-none uppercase">
                XÂY DỰNG <span className="text-rose-500 italic">ĐỘI NHÓM</span>
              </h2>
              <p className="mt-4 md:mt-6 text-slate-500 text-base md:text-lg leading-relaxed">
                Idea đã được validate? Giờ là lúc tìm người đồng hành. Hệ sinh thái kết nối việc làm Freelance, IT, Editor và nhiều hơn thế.
              </p>
            </div>
            <Link href="/teams" className="group flex items-center gap-2 font-black uppercase tracking-widest text-[10px] md:text-sm text-slate-900 hover:text-rose-500 transition-colors">
              Tìm việc / Tìm người <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[24px] md:rounded-[32px]" />)
            ) : activeTeams.map((team) => (
              <motion.div
                key={team.id}
                whileHover={{ y: -8 }}
                onClick={() => router.push('/teams')}
                className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden group cursor-pointer"
              >
                <div className="h-40 relative">
                  <img src={team.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-slate-900/10" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase text-slate-900 shadow-lg border border-white/20">
                    {team.progress}% Build
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={14} className="text-rose-500" />
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none">{team.category}</span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-6 uppercase italic tracking-tighter leading-tight line-clamp-1">{team.name}</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <div className="flex -space-x-2">
                        {(team.members || []).slice(0, 3).map((m, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                            <img src={`https://ui-avatars.com/api/?name=U${i}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold uppercase">{team.members?.length || 0} Đang build</span>
                    </div>
                    <div className="flex items-center gap-2 text-rose-500 font-bold text-[10px] uppercase">
                      <MessageCircle size={14} />
                      Đang tuyển vị trí mới
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Network CTA */}
        <section className="mb-16 md:mb-32 bg-slate-900 rounded-[32px] md:rounded-[56px] p-8 md:p-20 text-white overflow-hidden relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center text-center lg:text-left">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter leading-none mb-8 uppercase italic">
                VIỆC TÌM NGƯỜI <br /> <span className="text-rose-500 not-italic">NGƯỜI TÌM VIỆC</span>
              </h2>
              <p className="text-slate-400 text-base md:text-lg mb-10 max-w-lg leading-relaxed">
                Xây dựng mạng lưới quan hệ bền chặt. Freelancer tìm thấy môi trường để phát huy năng lực. Founder kết nối với thợ nghề để tạo ra sản phẩm.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => router.push('/teams')} className="px-8 py-5 bg-rose-500 text-white rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-all">GIA NHẬP ĐỘI NHÓM</button>
                <button onClick={() => router.push('/setting')} className="px-8 py-5 bg-white/10 text-white border border-white/10 rounded-full font-black uppercase tracking-widest text-sm hover:bg-white/20 transition-all">CẬP NHẬT PROFILE</button>
              </div>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-6 rotate-3">
              {[
                { label: "IT / CODER", count: "120+", color: "text-blue-400" },
                { label: "MARKETER", count: "80+", color: "text-green-400" },
                { label: "EDITOR", count: "65+", color: "text-rose-400" },
                { label: "UI/UX/DESIGNER", count: "40+", color: "text-purple-400" },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] text-center">
                  <div className="text-4xl font-black italic mb-1">{item.count}</div>
                  <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${item.color}`}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Đã launch */}
        <section className="mb-16 md:mb-32">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-6xl font-black tracking-tighter uppercase italic leading-none mb-6">DỰ ÁN <span className="text-rose-500 not-italic">ĐÃ HOÀN THÀNH</span></h2>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto uppercase font-bold tracking-widest">Sản phẩm thực tế - Giải pháp thực tế - Thành công thực tế</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? [1, 2, 3].map(i => <div key={i} className="h-96 bg-slate-100 rounded-[48px] animate-pulse" />) :
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="group bg-white rounded-[48px] border border-slate-100 p-8 hover:shadow-2xl transition-all cursor-pointer" onClick={() => router.push('/products')}>
                  <div className="aspect-video bg-slate-100 rounded-[32px] mb-8 overflow-hidden relative">
                    <img src={`https://images.unsplash.com/photo-${1460925895917 + i}-afdab827c52f?auto=format&fit=crop&q=80&w=800`} className="w-full h-full object-cover transition-all duration-700" />
                    <div className="absolute inset-0 bg-rose-500/10 group-hover:bg-transparent transition-all" />
                  </div>
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-2 group-hover:text-rose-500 transition-colors">Sản Phẩm Thành Công #{i + 1}</h4>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Launched • 05/2024</div>
                  <div className="flex items-center gap-3 text-slate-900 font-black uppercase text-[10px] tracking-widest">
                    Khám phá Case Study <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              ))
            }
          </div>
        </section>

        <Explain />
      </main>

      <DownLoad />
      <Footer />
    </div>
  );
};

export default Home;