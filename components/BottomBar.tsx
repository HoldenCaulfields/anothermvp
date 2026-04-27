'use client';
import { Plus } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useViewStore } from '@/stores/useViewStore';

const tabs = [
    { id: 'community', label: 'Groups', icon: "🏠", path: '/' },
    { id: 'ideas', label: 'Ideas', icon: "💡", path: '/ideas' },
    { id: 'create', label: 'Create', icon: '+', isAction: true },
    { id: 'teams', label: 'Teams', icon: "🤝", path: '/teams' },
    { id: 'profile', label: 'Me', icon: "👤", path: '/setting' },
];

export default function BottomBar() {
    const router = useRouter();
    const pathname = usePathname();
    const setCreateModal = useViewStore(s => s.setCreateModal);

    const currentIndex = tabs.findIndex((item) => {
        if (!item.path) return false;

        if (item.path === '/') {
            return pathname === '/';
        }

        return pathname.startsWith(item.path);
    });

    return (
        <nav className="fixed md:hidden bottom-4 left-0 right-0 z-2000  pointer-events-none">
            <div className="max-w-md mx-auto bg-white/90 backdrop-blur-2xl rounded-3xl flex items-center justify-between p-2 pointer-events-auto border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.12)]">

                {currentIndex !== -1 && !tabs[currentIndex].isAction && (
                    <div
                        className={`absolute bg-rose-600 h-[75%] rounded-3xl z-0 transition-all duration-300 ease-out`}
                        style={{
                            width: "18%",
                            left: `${currentIndex * 20 + 1}%`,
                        }}
                    />
                )}

                {tabs.map((tab, idx) => {
                    const isActive = tab.path
                        ? tab.path === '/'
                            ? pathname === '/'
                            : pathname.startsWith(tab.path)
                        : false;

                    if (tab.isAction) {
                        return (
                            <div key={tab.id} className="relative px-2 group">
                                <button
                                    onClick={() => {/* router.push('/ideas'); */ setCreateModal()}}
                                    className={`
                                        relative w-16 h-16 -mt-14 rounded-full flex items-center justify-center 
                                        transition-all duration-300 ease-out
                                        bg-slate-950 text-rose-500
                                        border-4 border-white
                                        shadow-[0_10px_20px_rgba(225,29,72,0.3)]
                                        
                                        /* Hiệu ứng Hover */
                                        hover:scale-110 hover:-translate-y-1 
                                        hover:bg-rose-600 hover:text-white 
                                        hover:shadow-[0_0_25px_rgba(225,29,72,0.6)]
                                        
                                        /* Hiệu ứng Active */
                                        active:scale-95
                                        `}
                                >
                                    <Plus
                                        size={32}
                                        strokeWidth={3}
                                        className="transition-transform duration-500 group-hover:rotate-90"
                                    />

                                    {/* Hiệu ứng vòng sáng ẩn phía sau */}
                                    <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </div>
                        );
                    }

                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                if (tab.path) {
                                    router.push(tab.path);
                                }
                            }}
                            className={`flex-1 flex flex-col items-center gap-1.5 py-3 transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <div className="relative">
                                <span
                                    className="text-xl"
                                >
                                    {tab.icon}
                                </span>
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};