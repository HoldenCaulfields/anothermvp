import { Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-slate-200 pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-slate-800">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-rose-600/20">
                                LN
                            </div>
                            <span className="text-2xl font-black tracking-tight text-white">LovelyNet</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            Nền tảng dành cho các nhà sáng tạo và hiện thực hóa những ý tưởng điên rồ nhất.
                        </p>
                        <div className="flex gap-3">
                            {[Mail, Mail, Mail].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 flex items-center justify-center bg-slate-900 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-slate-800">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <h4 className="font-bold text-white uppercase text-xs tracking-widest">Platform</h4>
                        <ul className="space-y-4 text-sm text-slate-400 font-medium">
                            <li><a href="#" className="hover:text-rose-500 transition-colors">Explore</a></li>
                            <li><a href="#" className="hover:text-rose-500 transition-colors">Find Members</a></li>
                            <li><a href="#" className="hover:text-rose-500 transition-colors">Pricing</a></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-6 space-y-6">
                        <h4 className="font-bold text-white uppercase text-xs tracking-widest">Stay Updated</h4>
                        <div className="relative group max-w-md">
                            <input
                                type="email"
                                placeholder="Nhập email của bạn..."
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                            />
                            <button className="absolute right-2 top-2 bottom-2 px-6 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all flex items-center gap-2 font-bold text-xs">
                                SUBSCRIBE
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
                    <p>© 2026 LovelyNet. Built for the future.</p>
                    <div className="flex gap-6 uppercase tracking-widest">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
