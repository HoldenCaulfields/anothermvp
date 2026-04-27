'use client'
import { useVoteStore } from "@/stores/useVoteStore";
import { Calendar, ChevronRight, Sparkles } from "lucide-react"; // Cần cài lucide-react
import VotingModal from "./VotingModal";

export default function Contests() {
    const selectedCompetition = useVoteStore((s) => s.selectedCompetition);
    const setSelectedCompetition = useVoteStore((s) => s.setSelectedCompetition);

    const competitions = [
        { id: "hoa-khoi-2026", title: "Hoa Khôi Cao Đẳng Nghề 2026", date: "01/06/2026", type: "Beauty", img: "/hkh.jpg", participants: 42 },
        { id: "lop-hoc-2026", title: "Khoảnh Khắc Sinh Viên Sôi Nổi", date: "15/05/2026", type: "Học tập", img: "/ktdn.jpg", participants: 15 },
        { id: "nam-sinh-2026", title: "Nam Sinh Ưu Tú & Tài Năng 2026", date: "01/06/2026", type: "Văn hóa", img: "nn.jpg", participants: 28 },
    ];

    return (
        <section className='mx-auto max-w-7xl px-4 py-4'>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl md:text-4xl font-ư text-white tracking-tight">
                        Cuộc thi <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">Sinh Viên</span>
                    </h2>
                </div>
            </div>

            {/* Grid Layout: Responsive từ Mobile đến Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {competitions.map((event) => {
                    const isActive = selectedCompetition?.id === event.id;
                    
                    return (
                        <div
                            key={event.id}
                            onClick={() => setSelectedCompetition(event)}
                            className={`group relative flex flex-col bg-white rounded-3xl overflow-hidden border transition-all duration-500 cursor-pointer
                                ${isActive 
                                    ? "border-rose-500 shadow-[0_20px_50px_rgba(244,63,94,0.15)] -translate-y-2" 
                                    : "border-slate-100 hover:border-rose-200 hover:shadow-xl hover:-translate-y-1"
                                }`}
                        >
                            {/* Image Container */}
                            <div className="relative h-56 overflow-hidden">
                                <img 
                                    src={event.img} 
                                    className={`w-full h-full object-cover transition-transform duration-1000 ease-out
                                        ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                                    alt={event.title} 
                                />
                                
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                {/* Badge Type */}
                                <div className="absolute top-4 left-4 px-4 pb-1 items-center bg-white/90 backdrop-blur-md rounded-full shadow-sm">
                                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">
                                        {event.type}
                                    </span>
                                </div>

                                {isActive && (
                                    <div className="absolute inset-0 bg-rose-500/20 backdrop-blur-[2px] flex items-center justify-center">
                                        <div className="bg-rose-500 text-white px-6 py-2 rounded-full text-sm font-black shadow-lg animate-bounce">
                                            ĐANG XEM
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-2 text-slate-400 mb-3">
                                    <Calendar size={14} />
                                    <span className="text-xs font-bold uppercase">{event.date}</span>
                                </div>
                                
                                <h3 className={`text-xl font-black leading-tight mb-4 transition-colors duration-300
                                    ${isActive ? 'text-rose-600' : 'text-slate-800 group-hover:text-rose-500'}`}>
                                    {event.title}
                                </h3>

                                <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                                    <div className="flex -space-x-2">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200" />
                                        ))}
                                        <div className="w-7 h-7 rounded-full border-2 border-white bg-rose-50 flex items-center justify-center">
                                            <span className="text-[8px] font-bold text-rose-500">+{event.participants}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tham gia bình chọn</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}