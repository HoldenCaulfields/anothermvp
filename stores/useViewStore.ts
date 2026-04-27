import { create } from 'zustand';

type ViewStore = {
    isMapView: boolean
    setMapView: () => void
    isCreateModal: boolean
    setCreateModal: () => void
}

export const useViewStore = create<ViewStore>((set) => ({
    isMapView: false,
    setMapView: () => set((state) => ({ isMapView: !state.isMapView })),
    isCreateModal: false,
    setCreateModal: () => set((state) => ({ isCreateModal: !state.isCreateModal })),
}))