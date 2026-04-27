import { create } from "zustand";
import { UserProfile } from "@/services/user.services";

type SubView = 'main' | 'sv' | 'posts' | 'events' | 'tkb' | 'jobs' | 'travel' | 'market';

type ViewStore = {
    activeSubView: SubView;
    setSubView: (view: SubView) => void;
    selectedUser: UserProfile | null;
    setSelectedUser: (user: UserProfile | null) => void;

    createModalType: string | null;
    setCreateModalType: (type: string | null) => void;
}

export const useCDNViewStore = create<ViewStore>((set) => ({
    activeSubView: 'main',
    setSubView: (view) => set({ activeSubView: view }),
    selectedUser: null,
    setSelectedUser: (user) => set({ selectedUser: user }),
    
    createModalType: null,
    setCreateModalType: (type) => set({ createModalType: type }),
}))