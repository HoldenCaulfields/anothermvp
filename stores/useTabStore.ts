import { create } from 'zustand';

type TabType = 'map' | 'community' | 'hot' | 'profile' | 'create';

interface TabState {
    activeTab: TabType | string;
    setActiveTab: (tab: string | TabType) => void;
}

export const useTabStore = create<TabState>((set) => ({
    activeTab: 'community',
    setActiveTab: (tab) => set({ activeTab: tab }),
}));
