'use client';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Heart, Phone,
    Trophy, Calendar, TrendingUp, GraduationCap,
    ArrowRight, Star, Bell, Filter, Zap, MapPin,
    MessageCircle, Play, Briefcase, Plane, Image as ImageIcon,
    Smile, Send, Sparkles, Plus, Search,
    Home,
    Flame,
    User
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { campusService, CampusPost, CampusStudent } from "@/services/campus.services";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Story from "./Story";
import Class from "./Class";
import Jobs, { JobLists } from "./Jobs";
import AllSinhVien from "./AllSinhVien";
import Contests from "./Contests";
import TimeLinesEvent from "./TimeLinesEvent";
import { useRouter } from "next/navigation";

type Tab = 'dashboard' | 'students' | 'contests' | 'schedule' | 'jobs' | 'travel';

const moods = [
    { emoji: "🔥", label: "Nóng", color: "bg-orange-100 text-orange-600" },
    { emoji: "😵‍💫", label: "Đuối", color: "bg-blue-100 text-blue-600" },
    { emoji: "😎", label: "Chill", color: "bg-emerald-100 text-emerald-600" },
    { emoji: "🍕", label: "Đói", color: "bg-rose-100 text-rose-600" },
    { emoji: "📚", label: "Siêng học", color: "bg-indigo-100 text-indigo-600" },
    { emoji: "💘", label: "Dating", color: "bg-pink-100 text-pink-600" },
];

export default function CaoDangNghePage() {
    const { user } = useAuth();
    const [students, setStudents] = useState<CampusStudent[]>([]);
    const [posts, setPosts] = useState<CampusPost[]>([]);
    const [newPostContent, setNewPostContent] = useState("");
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const router = useRouter();

    useEffect(() => {
        const unsubscribePosts = campusService.subscribeToPosts((data) => {
            setPosts(data);
        });
        const unsubscribeStudents = campusService.subscribeToStudents((data) => {
            setStudents(data);
        });
        return () => {
            unsubscribePosts();
            unsubscribeStudents();
        };
    }, []);

    const handleCreatePost = async () => {
        if (!user) {
            alert("Đăng nhập để chia sẻ hôm nay của bạn nhé!");
            return;
        }
        if (!newPostContent.trim()) return;

        try {
            await campusService.createPost({
                authorName: user.displayName || "Sinh viên",
                authorAvatar: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'S'}`,
                content: newPostContent,
            });
            setNewPostContent("");
        } catch (error) {
            console.error("Failed to post:", error);
        }
    };

    const tabs: { id: Tab; label: string; icon: any; color: string }[] = [
        { id: 'dashboard', label: 'Bảng tin', icon: TrendingUp, color: 'text-blue-500' },
        { id: 'students', label: 'Sinh viên', icon: Users, color: 'text-amber-500' },
        { id: 'contests', label: 'Cuộc thi', icon: Trophy, color: 'text-rose-500' },
        { id: 'schedule', label: 'Lịch học', icon: Calendar, color: 'text-emerald-500' },
        { id: 'jobs', label: 'Việc làm', icon: Briefcase, color: 'text-purple-500' },
        { id: 'travel', label: 'Du lịch', icon: Plane, color: 'text-cyan-500' },
    ];

    const firstThreePosts = posts.slice(0, 2);
    const remainingPosts = posts.slice(2);

    const PostCard = ({ post }: { post: CampusPost }) => (
        <div className="bg-white rounded-[32px] md:rounded-[56px] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-[0_40px_100px_rgba(0,0,0,0.05)] transition-all duration-500">
            <div className="p-5 md:p-12 pb-6 md:pb-8">
                <div className="flex justify-between items-start mb-6 md:mb-10">
                    <div className="flex gap-3 md:gap-6">
                        <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-[24px] overflow-hidden bg-slate-100 shadow-xl group-hover:scale-110 transition-transform">
                            <img src={post.authorAvatar} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                                <h4 className="text-[13px] md:text-lg font-black text-slate-900 tracking-tighter uppercase italic">{post.authorName}</h4>
                                <span className="bg-rose-500 text-white text-[7px] md:text-[10px] font-black px-1.5 md:px-3 py-0.5 md:py-1 rounded-md md:rounded-lg italic shadow-sm">Maker</span>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3">
                                <span className="text-[8px] md:text-[11px] font-black text-rose-500 uppercase tracking-widest">KHOA CNTT</span>
                                <span className="text-slate-200">•</span>
                                <span className="text-[8px] md:text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                                    {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: vi }) : "Vừa xong"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="px-3 py-1 md:px-4 md:py-2 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl text-[8px] md:text-xs font-black flex items-center gap-1 md:gap-2 shadow-sm italic">
                        <span>😎</span> Chill
                    </div>
                </div>
                <p className="text-sm md:text-2xl leading-tight text-slate-900 mb-6 md:mb-12 font-black italic tracking-tighter">"{post.content}"</p>
                {post.image && (
                    <div className="rounded-[24px] md:rounded-[60px] overflow-hidden mb-6 md:mb-12 border-2 md:border-4 border-slate-50 shadow-2xl">
                        <img src={post.image} className="w-full h-auto" />
                    </div>
                )}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-slate-50 pt-6 md:pt-8 gap-4">
                    <div className="flex justify-around sm:justify-start gap-8 md:gap-12">
                        <button className="flex items-center gap-2 md:gap-3 text-xs md:text-base font-black uppercase text-slate-400 hover:text-rose-500 transition-all group/btn hover:scale-110">
                            <Heart size={20} className="md:w-6 md:h-6 group-hover/btn:fill-rose-500 transition-all" />
                            <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 md:gap-3 text-xs md:text-base font-black uppercase text-slate-400 hover:text-blue-500 transition-all hover:scale-110">
                            <MessageCircle size={20} className="md:w-6 md:h-6" />
                            <span>{post.comments}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header / Banner */}
            <header className="relative h-[240px] md:h-[540px] bg-slate-900 border-b-4 md:border-b-8 border-rose-500">
                <img
                    src="/cdnbg.jpg"
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                    alt="Campus"
                />
                <div className="relative h-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col justify-end pb-4">
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-12 h-12 md:w-24 md:h-24 bg-white rounded-2xl md:rounded-[32px] p-2 md:p-4 shadow-2xl rotate-3 flex items-center justify-center">
                            <GraduationCap className="text-rose-500 w-full h-full" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-black tracking-tighter uppercase italic text-white flex flex-col md:flex-row md:items-center gap-1 md:gap-4 leading-tight">
                                Sinh Viên <span className="text-rose-500 not-italic">Cao Đẳng Nghề</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Navigation Tabs */}
            <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
                <div className="max-w-7xl mx-auto px-4 md:px-6 flex gap-4 md:gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 md:gap-3 py-4 md:py-6 px-1 md:px-2 border-b-4 transition-all whitespace-nowrap group ${activeTab === tab.id ? 'border-rose-500' : 'border-transparent hover:border-slate-200'
                                }`}
                        >
                            <tab.icon size={18} className={`${activeTab === tab.id ? tab.color : 'text-slate-400 group-hover:text-slate-600'}`} />
                            <span className={`text-[10px] md:text-sm font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
                                }`}>
                                {tab.label}
                                {['travel'].includes(tab.id) && (
                                    <span className="ml-1 md:ml-2 text-[7px] md:text-[8px] bg-slate-100 text-slate-400 px-1 py-0.5 rounded italic">Soon</span>
                                )}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <main className="w-full mx-auto px-4 md:px-8 py-6 md:py-10 mb-24 md:mb-0">
                <div className="grid grid-cols-1 gap-6 md:gap-8">

                    {/* Main Content Area */}
                    <div className="space-y-6 md:space-y-8 mx-auto w-full">
                        <AnimatePresence mode="wait">
                            {activeTab === 'dashboard' && (
                                <motion.div
                                    key="feed"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-8 max-w-6xl mx-auto"
                                >
                                    {/* Post Input - Compact & Responsive */}
                                    <div className="bg-white mx-auto p-4 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                        {/* Decor Icon - Hidden on small mobile to save space */}
                                        <Smile size={80} className="absolute -top-4 -right-4 opacity-5 pointer-events-none hidden sm:block" />

                                        <div className="relative space-y-4">
                                            {/* Header */}
                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                <Sparkles size={14} className="text-amber-500 animate-pulse" />
                                                <span>Hôm nay bạn thế nào?</span>
                                            </div>

                                            {/* Mood Selector - Scrollable on mobile if too many items */}
                                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap">
                                                {moods.map((m) => (
                                                    <button
                                                        key={m.label}
                                                        className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all active:scale-95 border-2 border-transparent hover:border-current ${m.color} shadow-sm`}
                                                    >
                                                        <span className="text-base">{m.emoji}</span>
                                                        <span className="uppercase tracking-tighter">{m.label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Input Area */}
                                            <div className="flex gap-3">
                                                {/* Avatar - Smaller & Hidden on tiny screens */}
                                                <div className="hidden xs:block shrink-0">
                                                    <img
                                                        src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'S'}`}
                                                        className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
                                                    />
                                                </div>

                                                <div className="flex-1 space-y-3">
                                                    <textarea
                                                        value={newPostContent}
                                                        onChange={(e) => setNewPostContent(e.target.value)}
                                                        placeholder="Vibe của bạn..."
                                                        className="w-full h-20 p-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-rose-500/10 text-sm font-medium italic placeholder:text-slate-300 outline-none transition-all resize-none"
                                                    />

                                                    <div className="flex items-center justify-between gap-2">
                                                        {/* Quick Actions */}
                                                        <div className="flex gap-1">
                                                            <button className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                                                                <ImageIcon size={18} />
                                                            </button>
                                                            <button className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-colors">
                                                                <Smile size={18} />
                                                            </button>
                                                        </div>

                                                        {/* Submit Button */}
                                                        <button
                                                            onClick={handleCreatePost}
                                                            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center gap-2 shadow-lg active:scale-95"
                                                        >
                                                            Đăng <Send size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Combined Feed Items */}
                                    <div className="space-y-6 md:space-y-12">
                                        {posts.length === 0 ? (
                                            <div className="bg-white rounded-[48px] p-24 text-center border border-slate-100 italic text-slate-400 font-medium">
                                                <Sparkles className="mx-auto mb-8 text-rose-500/20" size={64} />
                                                Chưa có vibe nào được chia sẻ. <br />
                                                Hãy là người đầu tiên khuấy động không khí nhé!
                                            </div>
                                        ) : (
                                            <>
                                                {/* FIRST 3 POSTS */}
                                                {firstThreePosts.map(post => <PostCard key={post.id} post={post} />)}

                                                {/* OVERVIEW SECTION: CONTESTS */}
                                                <div onClick={() => setActiveTab('contests')}
                                                    className="bg-slate-900 rounded-[32px] md:rounded-[56px] p-6 md:p-12 overflow-hidden relative group">
                                                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[100px] -mr-32 -mt-32" />
                                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                                                        <div>
                                                            <h3 className="text-xl md:text-3xl font-black text-rose-600 uppercase italic tracking-tighter">Cuộc Thi Hot</h3>
                                                            <p className="text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-widest mt-2">Đừng để tài năng của bạn bị ngủ quên!</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                                                        {[
                                                            { title: "Nam sinh ưu tú", img: "/nn.jpg", prize: "300.000đ" },
                                                            { title: "Hoa khôi Cao Đẳng Nghề", img: "/hkh.jpg", prize: "300.000đ" },
                                                            { title: "Lớp học vui nhộn", img: "/ktdn.jpg", prize: "200.000đ" },
                                                        ].map((c, i) => (
                                                            <div key={i} className="bg-white/5 backdrop-blur-md rounded-3xl p-4 border border-white/10 group/item hover:bg-white/10 transition-all cursor-pointer">
                                                                <div className="h-40 md:h-50 rounded-2xl overflow-hidden mb-4">
                                                                    <img src={c.img} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                                                                </div>
                                                                <h4 className="text-white font-black text-sm uppercase italic mb-1 truncate">{c.title}</h4>
                                                                <span className="text-rose-500 text-[10px] font-black uppercase">Giải thưởng: {c.prize}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* OVERVIEW SECTION: EVENTS */}
                                                <div className="bg-white rounded-[32px] md:rounded-[56px] border border-slate-100 shadow-sm p-6 md:p-12">
                                                    <div className="flex items-center justify-between mb-10">
                                                        <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Check-in Sự Kiện</h3>
                                                        <div onClick={() => setActiveTab('schedule')} className="flex items-center gap-2 text-rose-500 font-black uppercase text-[10px] cursor-pointer hover:underline">Xem lịch <ArrowRight size={14} /></div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {[
                                                            { title: "Party Chào Tân SV", time: "18:00 - Hôm nay", place: "Sân vận động", color: "bg-rose-500" },
                                                            { title: "Giải Bóng Đá Nam", time: "16:00 - Chủ Nhật", place: "Sân bóng cỏ nhân tạo", color: "bg-emerald-500" }
                                                        ].map((ev, i) => (
                                                            <div key={i} className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer group">
                                                                <div className={`w-2 h-12 rounded-full ${ev.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                                                                <div className="flex-1">
                                                                    <h4 className="text-slate-900 font-black text-base uppercase italic">{ev.title}</h4>
                                                                    <div className="flex gap-4 mt-1">
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Calendar size={12} className="text-rose-500" /> {ev.time}</span>
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><MapPin size={12} className="text-rose-500" /> {ev.place}</span>
                                                                    </div>
                                                                </div>
                                                                <button className="p-3 bg-slate-100 rounded-2xl text-slate-400 group-hover:bg-rose-500 group-hover:text-white transition-all"><Plus size={20} /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <Story />
                                                <Class />
                                                <Jobs />

                                                {/* REMAINING POSTS */}
                                                {remainingPosts.map(post => <PostCard key={post.id} post={post} />)}
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'students' && (
                                <AllSinhVien />
                            )}

                            {activeTab === 'contests' && (
                                <Contests />
                            )}

                            {activeTab === 'schedule' && (
                                <TimeLinesEvent />
                            )}

                            {activeTab === 'jobs' && (
                                <JobLists />
                            )}

                            {['travel'].includes(activeTab) && (
                                <motion.div key="soon" className="py-20 text-center">
                                    <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-slate-300">
                                        {activeTab === 'jobs' ? <Briefcase size={48} /> : <Plane size={48} />}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-4">Sắp xuất hiện tính năng "{activeTab.toUpperCase()}"</h3>
                                    <p className="text-slate-500 font-medium max-w-sm mx-auto">Chúng tôi đang xây dựng mạng lưới tuyển dụng và tour du lịch sinh viên Nha Trang giá rẻ!</p>
                                    <button className="mt-10 px-10 py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-rose-500 transition-all">Thông báo cho tôi khi ra mắt</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed md:hidden bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-6 py-3 flex justify-center items-center z-300">
                <div className="max-w-lg w-full flex justify-between items-center">
                    <NavItem icon={Home} label="Trang chủ" active onClick={() => setActiveTab('dashboard')}/>
                    <NavItem icon={Users} label="Cộng đồng" onClick={() => setActiveTab('students')} />
                    <div className="relative -top-6">
                        <button /* onClick={() => setActiveTab('create')} */
                            className="w-14 h-14 bg-rose-500 rounded-full shadow-lg shadow-rose-200 flex items-center justify-center text-white border-4 border-white hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                    <NavItem icon={Flame} label="Nổi bật" onClick={() => setActiveTab('contests')} />
                    <NavItem icon={User} label="Cá nhân"
                        onClick={() => {
                            router.push('/setting');
                        }} />
                </div>
            </nav>
        </div>
    );
}

const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
        <Icon className={`w-6 h-6 ${active ? 'text-rose-500' : 'text-gray-400'}`} />
        <span className={`text-[10px] font-bold ${active ? 'text-rose-500' : 'text-gray-400'}`}>
            {label}
        </span>
    </button>
);