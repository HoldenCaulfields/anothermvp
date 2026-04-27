"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, User, Heart, Crown, Flame, Sparkles, ChevronLeft, ChevronRight, Hand, Phone, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TopIdolStories } from "@/app/(routes)/cdnv2/TopIdolStories";

type Student = {
    stt: string;
    mssv: string;
    name: string;
    dob: string;
    lop: string;
    year: string;
    he: string;
    sdt: string;
    khoa: string;
    likes: number;
    waves: number;
    xinso: number;
    total: number;
};

const KHOA_LIST = [
    { id: "ALL", name: "🔥 BXH Tổng" },
    { id: "1", name: "Điện - Điện Tử" },
    { id: "2", name: "Kinh Tế - Tổng Hợp" },
    { id: "3", name: "Cơ Khí - Xây Dựng" },
    { id: "4", name: "Công Nghệ - Ô Tô" },
];

export default function AllSinhVien() {
    const [students, setStudents] = useState<Student[]>([]);
    const [khoa, setKhoa] = useState("ALL");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [interactions, setInteractions] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    const pageSize = 12;

    useEffect(() => {
        setLoading(true);
        fetch("/api/get-allsvnew")
            .then((res) => res.json())
            .then((data) => {
                setStudents(data.data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleAction = async (id: string, type: "likes" | "waves" | "xinso") => {
        const key = `${id}-${type}`;
        if (localStorage.getItem(key)) return;
        localStorage.setItem(key, "1");

        setInteractions((prev) => ({
            ...prev,
            [id]: { ...prev[id], [type]: (prev[id]?.[type] || 0) + 1 },
        }));

        await fetch("/api/add-interaction", {
            method: "POST",
            body: JSON.stringify({ mssv: id, type }),
        });
    };

    const filtered = useMemo(() => {
        let data = students.map((s) => {
            const local = interactions[s.mssv] || {};
            const likes = s.likes + (local.likes || 0);
            const waves = s.waves + (local.waves || 0);
            const xinso = s.xinso + (local.xinso || 0);
            return { ...s, likes, waves, xinso, total: likes + waves + xinso };
        });

        if (khoa !== "ALL") data = data.filter((s) => String(s.khoa) === khoa);
        if (search) {
            data = data.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
        }
        return data.sort((a, b) => b.total - a.total);
    }, [students, khoa, search, interactions]);

    const paginated = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, page]);

    const totalPages = Math.ceil(filtered.length / pageSize);

    // Tính toán dữ liệu toàn bộ (chưa filter khoa/search) để lấy Top 10 toàn trường
    const allTimeTopStudents = useMemo(() => {
        return students.map((s) => {
            const local = interactions[s.mssv] || {};
            const likes = s.likes + (local.likes || 0);
            const waves = s.waves + (local.waves || 0);
            const xinso = s.xinso + (local.xinso || 0);
            return { ...s, likes, waves, xinso, total: likes + waves + xinso };
        });
    }, [students, interactions]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-slate-900">
            {/* Header & Filter Sticky */}
            <nav className="sticky top-18 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 py-2 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                placeholder="Tìm kiếm idol của bạn..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 ring-rose-500 transition-all outline-none text-md"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {KHOA_LIST.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => { setKhoa(f.id); setPage(1); }}
                                className={`px-5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap border ${
                                    khoa === f.id
                                        ? "bg-slate-900 text-white border-slate-900 shadow-lg scale-105"
                                        : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                                }`}
                            >
                                {f.name}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            <TopIdolStories students={allTimeTopStudents} />

            <main className="max-w-7xl mx-auto px-4 mt-8">
                {/* Title Info */}
                <div className="mb-8 flex items-end justify-between px-2">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-rose-600">
                            {khoa === "ALL" ? "Bảng Xếp Hạng Toàn Trường" : "Danh Sách Theo Khoa"}
                        </h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {filtered.length} sinh viên được tìm thấy
                        </p>
                    </div>
                </div>

                {/* Grid List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {paginated.map((student, index) => (
                            <StudentCard 
                                key={student.mssv} 
                                student={student} 
                                index={(page - 1) * pageSize + index} 
                                onAction={handleAction}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Empty State */}
                {!loading && paginated.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                        <Sparkles className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="font-black text-slate-400">Không tìm thấy idol nào rồi!</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center gap-4">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-3 rounded-2xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="px-6 py-3 bg-white rounded-2xl border border-slate-200 font-black text-sm">
                            {page} / {totalPages}
                        </div>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-3 rounded-2xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

function StudentCard({ student, index, onAction }: { student: Student, index: number, onAction: any }) {
    const isTop3 = index < 3;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -8 }}
            className={`group relative bg-white border p-5 rounded-[2.5rem] transition-all duration-300 ${
                isTop3 
                ? 'border-amber-200 shadow-[0_20px_50px_rgba(251,191,36,0.12)] ring-2 ring-amber-50' 
                : 'border-slate-100 hover:shadow-2xl hover:border-rose-200'
            }`}
        >
            {/* Rank Badge */}
            <div className={`absolute -top-3 -left-2 w-10 h-10 rounded-2xl shadow-lg flex items-center justify-center z-10 font-black text-white rotate-[-10deg] ${
                index === 0 ? 'bg-amber-400 scale-110 shadow-amber-200' : 
                index === 1 ? 'bg-rose-500 shadow-rose-200' : 
                index === 2 ? 'bg-orange-400 shadow-orange-200' : 'bg-slate-800 text-[10px]'
            }`}>
                {index === 0 ? <Crown size={20} /> : index + 1}
            </div>

            <div className="flex items-start gap-4 mb-2">
                <div className="relative">
                    <div className="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-white shadow-inner overflow-hidden">
                        <User size={32} />
                    </div>
                    {student.total > 50 && (
                        <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white p-1.5 rounded-xl shadow-md border-2 border-white">
                            <Flame size={14} fill="currentColor" />
                        </div>
                    )}
                </div>
                <div className="min-w-0 pt-1">
                    <h4 className="font-black text-slate-800 truncate text-lg tracking-tight leading-tight">{student.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{student.mssv}</p>
                </div>
            </div>

            {/* Stats Area */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50/80 rounded-[1.8rem] mb-2 p-2 border border-slate-100">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Tương tác</span>
                    <span className="text-lg font-black text-rose-500 tabular-nums">{student.total}</span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Lớp</span>
                    <span className="text-xs font-bold text-slate-700 truncate">{student.lop}</span>
                </div>
            </div>

            {/* Interaction Buttons */}
            <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <button 
                        onClick={() => onAction(student.mssv, "likes")}
                        className="flex-1 flex items-center justify-center gap-2 bg-rose-50 text-rose-600 py-3 rounded-2xl text-[11px] font-black hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                    >
                        <Heart size={16} /> {student.likes}
                    </button>
                    <button 
                        onClick={() => onAction(student.mssv, "waves")}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3 rounded-2xl text-[11px] font-black hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                    >
                        <Hand size={16} /> {student.waves}
                    </button>
                </div>
                <button 
                    onClick={() => onAction(student.mssv, "xinso")}
                    className="w-full bg-slate-900 text-white py-3 rounded-2xl text-[11px] font-black hover:bg-green-600 transition-all active:scale-95 shadow-lg shadow-slate-100 flex items-center justify-center gap-2"
                >
                    <Phone size={14} /> XIN SĐT ({student.xinso})
                </button>
            </div>
        </motion.div>
    );
}
