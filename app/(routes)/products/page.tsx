'use client';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Globe, ExternalLink, Trophy, Sparkles, ChevronRight, Rocket } from "lucide-react";
import { projectService, ProjectTeam } from "@/services/project.services";
import FilterBar from "@/components/FilterBar";
import { useRouter } from "next/navigation";

const CATEGORIES = ["SaaS / App", "YouTube", "TikTok", "Cinema", "Startup", "Other"];

export default function SuccessPage() {
  const [products, setProducts] = useState<ProjectTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const router = useRouter();

  useEffect(() => {
    projectService.getProjectsByStatus('completed').then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 mb-20">
      <header className="mb-16">
        <div className="flex items-center gap-2 text-amber-500 mb-4">
          <Trophy size={20} className="animate-pulse" />
          <span className="font-black tracking-[0.2em] uppercase text-xs">Hall of Fame</span>
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.85] uppercase italic">
          Sản phẩm <br />
          <span className="text-rose-500 not-italic">Đã Launch</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mt-8 text-lg font-medium leading-relaxed">
          Nơi vinh danh các dự án đã hoàn thiện bản MVP, Landing Page hoặc Launch kênh chính thức. Đây là bằng chứng sống cho sự nỗ lực của cộng đồng IdeaForge.
        </p>
      </header>

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        placeholder="Tìm các siêu phẩm đã ra mắt..."
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-80 bg-white rounded-[40px] animate-pulse border border-slate-100" />)}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Package size={200} />
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Package size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Đang chờ đợi "Kỳ lân" đầu tiên</h3>
            <p className="text-slate-400">Các sản phẩm đang trong giai đoạn nước rút để ra mắt!</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -12 }}
              className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col group"
            >
              <div className="h-56 relative overflow-hidden">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute bottom-6 left-6 flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{product.category}</span>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase italic tracking-tight">{product.name}</h3>
                <p className="text-slate-500 text-sm font-medium mb-8 flex-1">
                  Dự án của {product.authorName} đã vượt qua các giai đoạn lên ý tưởng và xây dựng để ra mắt phiên bản tốt nhất.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (product.customRoute) {
                        window.location.href = product.customRoute;
                      }
                    }}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all flex items-center justify-center gap-2"
                  >
                    <Globe size={14} /> Trải nghiệm ngay
                  </button>
                  <button
                    onClick={() => {
                      if (product.customRoute) {
                        window.location.href = product.customRoute;
                      }
                    }}
                    className="p-4 border border-slate-100 rounded-2xl text-slate-400 hover:text-rose-500 transition-all"
                  >
                    <ExternalLink size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* --- FOOTER / CTA SECTION --- */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mt-32 relative rounded-[50px] bg-slate-900 p-8 md:p-16 text-center overflow-hidden"
      >
        {/* Decor background cho CTA */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-rose-400 text-xs font-bold uppercase tracking-[0.2em] mb-8">
            <Rocket size={14} /> Khởi đầu ngay hôm nay
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
            Ý TƯỞNG TIẾP THEO <br /> CÓ THỂ LÀ CỦA BẠN
          </h2>
          <p className="text-slate-400 mb-10 text-sm md:text-lg">
            Đừng để ý tưởng của bạn chỉ nằm trên giấy. Gia nhập cộng đồng IdeaSpark ngay để nhận hỗ trợ từ đội ngũ chuyên gia và biến nó thành hiện thực.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => router.push('/ideas')}
              className="w-full sm:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group">
              Bắt đầu dự án mới
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => router.push('/')}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold transition-all">
              Tìm hiểu quy trình
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
