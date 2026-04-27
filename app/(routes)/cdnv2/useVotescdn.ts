import { useEffect, useState } from "react";
import { subscribeTop10 } from "@/services/votecdn.services";
import { useVoteStore } from "@/stores/useVoteStore";

export function useCandidates() {
  const [candidates, setCandidates] = useState<any[]>([]);
  // Lấy contestId hiện tại từ Zustand store
  const selectedCompetition = useVoteStore((state) => state.selectedCompetition);

  useEffect(() => {
    // Nếu chưa chọn cuộc thi nào thì không fetch dữ liệu
    if (!selectedCompetition?.id) {
      setCandidates([]);
      return;
    }

    // Truyền id cuộc thi vào service đã cập nhật ở bước trước
    const unsub = subscribeTop10(selectedCompetition.id, (data) => {
      setCandidates(data);
    });

    return () => unsub();
  }, [selectedCompetition?.id]); // Chạy lại khi đổi cuộc thi

  return candidates;
}