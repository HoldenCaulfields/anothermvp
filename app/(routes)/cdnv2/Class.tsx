import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Class() {
    const router = useRouter();
    
    return (
        <section onClick={() => router.push('/profile')}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-black flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-rose-500" /> Khoa Đào Tạo
                </h2>
                <button className="text-xs text-rose-600 font-black tracking-widest">Xem tất cả</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { name: "Khoa Điện - Điện Tử", students: 1200, icon: "💻", color: "bg-blue-500" },
                    { name: "Khoa Kinh Tế - Tổng Hợp", students: 850, icon: "📊", color: "bg-amber-500" },
                    { name: "Khoa Cơ Khí - Xây Dựng", students: 700, icon: "⚙️", color: "bg-slate-500" },
                    { name: "Khoa Công Nghệ Ô Tô", students: 950, icon: "🚗", color: "bg-emerald-500" },
                ].map((dept) => (
                    <div
                        key={dept.name}
                        className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-rose-200 flex items-center gap-4 group cursor-pointer transition-all"
                    >
                        <div className={`w-16 h-16 rounded-2xl ${dept.color} flex items-center justify-center text-3xl shadow-md group-hover:rotate-6 transition-transform`}>
                            {dept.icon}
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900">{dept.name}</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">{dept.students} sinh viên</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
