import { create } from "zustand";

interface Competition {
    id: string;
    title: string;
    img: string;
    date: string;
    type: string;
}

interface VoteState {
    // Cuộc thi đang được chọn (ví dụ: Hoa khôi hoặc Nam nhân)
    selectedCompetition: Competition | null;
    setSelectedCompetition: (c: Competition | null) => void;

    // Danh sách ID ứng viên đã vote TRONG cuộc thi đang chọn
    votedIds: string[];
    setVotedIds: (ids: string[]) => void;

    // Cập nhật UI nhanh (Optimistic Update)
    toggleLocalVote: (candidateId: string) => void;

    // Reset khi chuyển đổi cuộc thi hoặc logout
    resetVotes: () => void;
}

export const useVoteStore = create<VoteState>((set) => ({
    selectedCompetition: null,
    setSelectedCompetition: (c) => set({
        selectedCompetition: c,
        votedIds: [] // Reset danh sách vote khi đổi cuộc thi để tránh nhầm lẫn dữ liệu cũ
    }),

    votedIds: [],
    setVotedIds: (ids) => set({ votedIds: ids }),

    toggleLocalVote: (candidateId) =>
        set((state) => ({
            votedIds: state.votedIds.includes(candidateId)
                ? state.votedIds.filter((id) => id !== candidateId)
                : [...state.votedIds, candidateId],
        })),

    resetVotes: () => set({ votedIds: [], selectedCompetition: null }),
}));