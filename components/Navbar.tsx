'use client';
import { Loader2, UserIcon, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import NotificationDropdown from './NotificationDropdown';
import { useViewStore } from '@/stores/useViewStore';

const NAV_LINKS = [
    { id: 'home', label: 'Home', icon: "🏠", path: '/' },
    { id: 'ideas', label: 'Ideas', icon: "💡", path: '/ideas' },
    { id: 'teams', label: 'Teams', icon: "🤝", path: '/teams' },
    { id: 'launched', label: 'Launched', icon: "🚀", path: '/products' },
    { id: 'map', label: 'Map', icon: "🌍", path: '/mapideas' },
    { id: 'create', label: 'Create', icon: "➕" },
];

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const { user, profile, loading, login, logout } = useAuth();
    const setCreateModal = useViewStore(s => s.setCreateModal);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="sticky top-0 z-100 bg-white/80 backdrop-blur-md glass-nav border-b border-zinc-100 px-6 py-1">
            <div className="max-w-7xl mx-auto flex justify-between items-center h-14">

                {/* Logo Section */}
                <div
                    className="pointer-events-auto flex items-center gap-1 shrink-0 cursor-pointer group"
                    onClick={() => router.push('/')}
                >
                    <div className="w-10 h-10 bg-rose-600 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg shadow-rose-600/30 border border-white/20 group-hover:scale-105 transition-transform duration-200">
                        LN
                    </div>
                    <h1 className="font-black text-lg sm:text-2xl tracking-tighter text-zinc-800  px-2 py-0.5 rounded-lg ">
                        Lovely<span className="text-rose-600">Net</span>
                    </h1>
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden lg:flex items-center gap-1 bg-zinc-50 p-1.5 rounded-[2rem] border border-zinc-100">
                    {NAV_LINKS.map((link) => {
                        const isActive =
                            link.path &&
                            (pathname === link.path ||
                                (link.path !== '/' && pathname.startsWith(link.path)));
                        return (
                            <button
                                key={link.id}
                                onClick={() => {
                                    if (link.id === 'create') {
                                        setCreateModal();
                                        return;
                                    }

                                    if (link.path) {
                                        router.push(link.path);
                                    }
                                }}
                                className={cn(
                                    "relative px-6 py-2.5 rounded-full text-xs font-black  tracking-widest transition-all overflow-hidden flex items-center gap-2",
                                    isActive ? "text-white" : "text-zinc-500 hover:text-zinc-900"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="navPill"
                                        className="absolute inset-0 bg-zinc-900 z-0"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{link.icon}</span>
                                <span className="relative z-10">{link.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 sm:gap-6">
                    {/* Actions Area */}
                    <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto shrink-0">
                        <NotificationDropdown />

                        {loading ? (
                            <div className="w-10 h-10 flex items-center justify-center bg-white/50 rounded-full border border-dashed border-slate-300">
                                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                            </div>
                        ) : user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setOpen(!open)}
                                    className={`flex items-center gap-2 p-1 pr-3 bg-white/80 backdrop-blur-md rounded-full border transition-all shadow-sm active:scale-95 ${open ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-white/50 hover:bg-white'}`}
                                >
                                    <img
                                        src={/* profile?.avatar ||  */user?.photoURL || '/default-avatar.png'}
                                        alt="avatar"
                                        referrerPolicy="no-referrer"
                                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                    />
                                    <span className="text-xs font-bold text-slate-700 max-w-[100px] truncate">
                                        {/* profile?.name ||  */user.displayName || 'Người dùng'}
                                    </span>
                                </button>

                                {/* Dropdown Menu */}
                                <div className={`
                                    absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-2xl 
                                    transition-all duration-200 origin-top-right overflow-hidden z-[2001]
                                    ${open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'}
                                `}>
                                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tài khoản</p>
                                        <p className="text-sm font-semibold text-slate-700 truncate">{user.email}</p>
                                    </div>

                                    <div className="p-1.5">
                                        <button onClick={() => {
                                            router.push('/setting');
                                        }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                                            <UserIcon className="w-4 h-4" /> Hồ sơ cá nhân
                                        </button>

                                        <button
                                            onClick={() => {
                                                logout();
                                                setOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-1"
                                        >
                                            <LogOut className="w-4 h-4" /> Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={login}
                                className="h-10 px-6 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-600/20 transition-all active:scale-95"
                            >
                                Đăng Nhập
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
