
import { TopIdolStories } from './TopIdolStories';
import { useEffect, useMemo, useState } from "react";
import { useCDNViewStore } from '@/stores/useCDNViewStore';

type Student = {
  stt: string;
  mssv: string;
  name: string;
  dob: string;
  lop: string;
  year: string;
  he: string;
  sdt: string;
  khoa: string;
  likes: number;
  waves: number;
  xinso: number;
  total: number;
};

export default function Story() {
  const [students, setStudents] = useState<Student[]>([]);
  const [interactions, setInteractions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const setSubView = useCDNViewStore(s => s.setSubView);

  useEffect(() => {
    setLoading(true);
    fetch("/api/get-allsvnew")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const allTimeTopStudents = useMemo(() => {
    return students.map((s) => {
      const local = interactions[s.mssv] || {};
      const likes = s.likes + (local.likes || 0);
      const waves = s.waves + (local.waves || 0);
      const xinso = s.xinso + (local.xinso || 0);
      return { ...s, likes, waves, xinso, total: likes + waves + xinso };
    });
  }, [students, interactions]);

  return (
    <div  onClick={() => setSubView('sv')} 
      className="flex gap-6 overflow-x-auto py-4 no-scrollbar">
      <TopIdolStories students={allTimeTopStudents} />
    </div>
  );
}
