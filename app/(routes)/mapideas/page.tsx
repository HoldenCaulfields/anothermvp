'use client';
import { useState, useEffect, useMemo } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Sparkles, Users, Package, MapPin,
    X, Navigation, Zap, Target, RefreshCw
} from "lucide-react";
import { ideaService, Idea } from "@/services/idea.services";
import { projectService, ProjectTeam } from "@/services/project.services";
import { useAuth } from "@/hooks/useAuth";
import IdeaDetailsModal from "@/components/IdeaDetailsModal";
import dynamic from 'next/dynamic';
import Loading from "@/components/Loading";
import { useViewStore } from "@/stores/useViewStore";

const MapView = dynamic(
    () => import('@/components/MapView'),
    {
        ssr: false,
        loading: () => (
            <Loading />
        )
    }
);

export default function MapIdeasPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [projects, setProjects] = useState<ProjectTeam[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'ideas' | 'teams' | 'products'>('all');

    // Placement Logic
    const [isPlacing, setIsPlacing] = useState(false);
    const [placingItem, setPlacingItem] = useState<{ id: string, type: 'idea' | 'team', name: string } | null>(null);
    const [showPlacerMenu, setShowPlacerMenu] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const setCreateModal = useViewStore(s => s.setCreateModal);

    const loadData = async () => {
        setLoading(true);
        try {
            const [allIdeas, allProjects] = await Promise.all([
                ideaService.getAllIdeas(),
                projectService.getAllProjects()
            ]);
            setIdeas(allIdeas);
            setProjects(allProjects);
        } catch (error) {
            console.error("Failed to load map data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredItems = useMemo(() => {
        let result: any[] = [];

        if (activeTab === 'all' || activeTab === 'ideas') {
            result = [...result, ...ideas.filter(i => i.location).map(i => ({ ...i, mapType: 'idea' }))];
        }

        if (activeTab === 'all' || activeTab === 'teams') {
            result = [...result, ...projects.filter(p => p.location && p.progress < 100).map(p => ({ ...p, mapType: 'team' }))];
        }

        if (activeTab === 'all' || activeTab === 'products') {
            result = [...result, ...projects.filter(p => p.location && p.progress === 100).map(p => ({ ...p, mapType: 'product' }))];
        }

        return result;
    }, [ideas, projects, activeTab]);

    const userUnplacedItems = useMemo(() => {
        if (!user) return [];
        const userIdeas = ideas.filter(i => i.authorId === user.uid && !i.location);
        const userTeams = projects.filter(p => p.authorId === user.uid && !p.location);

        return [
            ...userIdeas.map(i => ({ id: i.id!, name: i.title, type: 'idea' as const })),
            ...userTeams.map(p => ({ id: p.id!, name: p.name, type: 'team' as const }))
        ];
    }, [user, ideas, projects]);

    const handleMapClick = async (lat: number, lng: number) => {
        if (isPlacing && placingItem) {
            try {
                if (placingItem.type === 'idea') {
                    await ideaService.updateLocation(placingItem.id, { lat, lng });
                    setIdeas(prev => prev.map(i => i.id === placingItem.id ? { ...i, location: { lat, lng } } : i));
                } else {
                    await projectService.updateLocation(placingItem.id, { lat, lng });
                    setProjects(prev => prev.map(p => p.id === placingItem.id ? { ...p, location: { lat, lng } } : p));
                }
                alert(`Đã đặt "${placingItem.name}" lên bản đồ thành công!`);
                setIsPlacing(false);
                setPlacingItem(null);
            } catch (error) {
                console.error("Failed to update location:", error);
                alert("Lỗi khi cập nhật vị trí.");
            }
        }
    };

    const handleViewDetail = (item: any) => {
        if (item.mapType === 'idea') {
            setSelectedIdea(item);
        } else {
            router.push(item.customRoute || (item.mapType === 'product' ? '/products' : '/teams'));
        }
    };

    return (
        <div className="fixed inset-0 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Overlay */}
            <div className="absolute top-24 left-6 z-[1000] flex flex-col gap-4 pointer-events-none">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-white/90 backdrop-blur-xl p-2 rounded-3xl shadow-2xl border border-white/20 flex flex-col gap-2 pointer-events-auto"
                >
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`p-4 rounded-2xl transition-all ${activeTab === 'all' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}
                        title="Tất cả"
                    >
                        <Zap size={24} />
                    </button>
                    <button
                        onClick={() => setActiveTab('ideas')}
                        className={`p-4 rounded-2xl transition-all ${activeTab === 'ideas' ? 'bg-amber-500 text-white shadow-xl' : 'text-slate-400 hover:bg-amber-50'}`}
                        title="Ý tưởng"
                    >
                        <Sparkles size={24} />
                    </button>
                    <button
                        onClick={() => setActiveTab('teams')}
                        className={`p-4 rounded-2xl transition-all ${activeTab === 'teams' ? 'bg-rose-500 text-white shadow-xl' : 'text-slate-400 hover:bg-rose-50'}`}
                        title="Đội nhóm"
                    >
                        <Users size={24} />
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`p-4 rounded-2xl transition-all ${activeTab === 'products' ? 'bg-slate-500 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}
                        title="Sản phẩm"
                    >
                        <Package size={24} />
                    </button>
                    <div className="h-px bg-slate-100 mx-2 my-1" />
                    <button
                        onClick={() => loadData()}
                        className={`p-4 rounded-2xl transition-all text-slate-400 hover:bg-slate-50 ${loading ? 'text-rose-500' : ''}`}
                        title="Tải lại dữ liệu"
                    >
                        <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
                    </button>
                </motion.div>

                {user && (
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="pointer-events-auto bg-white/90 backdrop-blur-xl p-2 rounded-3xl shadow-2xl border border-white/20"
                    >
                        <button
                            onClick={() => setShowPlacerMenu(!showPlacerMenu)}
                            className={`p-4 rounded-2xl transition-all ${showPlacerMenu ? 'bg-rose-500 text-white shadow-xl' : 'text-slate-400 hover:bg-rose-50'}`}
                            title="Quản lý vị trí"
                        >
                            <Target size={24} className={isPlacing ? 'animate-spin' : ''} />
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Placer Management Context Menu */}
            <AnimatePresence>
                {showPlacerMenu && user && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className="absolute top-24 left-8 z-[1001] w-72 bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[70vh]"
                    >
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                            <h3 className="font-black text-xs uppercase tracking-widest">Dự án của bạn</h3>
                            <button onClick={() => setShowPlacerMenu(false)}><X size={16} /></button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Chưa có vị trí trên Layer:</div>
                            {userUnplacedItems.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase italic">Bạn đã đặt tất cả hoặc chưa tạo ý tưởng nào.</p>
                                    <button onClick={setCreateModal}
                                        className="mt-4 w-full py-3 bg-rose-50 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest border border-rose-100">Tạo ý tưởng mới</button>
                                </div>
                            ) : (
                                userUnplacedItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setPlacingItem(item);
                                            setIsPlacing(true);
                                            setShowPlacerMenu(false);
                                        }}
                                        className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-rose-50 rounded-2xl border border-slate-100 transition-all text-left"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{item.type}</span>
                                            <span className="text-xs font-black text-slate-900 truncate max-w-[150px]">{item.name}</span>
                                        </div>
                                        <Navigation size={14} className="text-rose-500" />
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Instruction Overlay when placing */}
            <AnimatePresence>
                {isPlacing && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md pointer-events-none"
                    >
                        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl border border-white/10 flex items-center gap-4 pointer-events-auto">
                            <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center animate-bounce">
                                <MapPin size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xs font-black uppercase tracking-widest text-rose-400">Đang chọn vị trí...</h4>
                                <p className="text-[10px] text-slate-300 font-medium">Click vào bất kỳ đâu trên bản đồ để đặt "<strong>{placingItem?.name}</strong>"</p>
                            </div>
                            <button
                                onClick={() => { setIsPlacing(false); setPlacingItem(null); }}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Map Content */}
            <div className="flex-1 relative">
                <MapView
                    items={filteredItems}
                    onMapClick={handleMapClick}
                    onViewDetail={handleViewDetail}
                />

                {/* Legend Overlay Desktop */}
                <div className="absolute bottom-8 right-8 z-[1000] hidden md:flex flex-col gap-3">
                    <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 shadow-xl flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Ý tưởng Lab</span>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 shadow-xl flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Đang thực thi</span>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 shadow-xl flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-slate-900" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Đã Launched</span>
                    </div>
                </div>
            </div>

            <IdeaDetailsModal
                idea={selectedIdea}
                onClose={() => setSelectedIdea(null)}
                onVoteToggle={() => loadData()}
            />
        </div>
    );
}

// Optimization Note: 
// In a large-scale app, we would use MarkerClusterGroup from react-leaflet-cluster
// and dynamically fetch markers based on map bounds (Bbox).
// For this MVP, we load all markers as the data size is manageable.
