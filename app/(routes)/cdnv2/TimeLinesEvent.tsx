'use client';

import { useState, useMemo, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  addDoc,
  orderBy
} from 'firebase/firestore';
import { useAuth } from "@/hooks/useAuth";

// Types
interface Participant {
  uid: string;
  photoURL?: string;
  displayName: string;
}

interface ClassItem {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  time: string;
  day: string;
  category: 'Kỹ thuật' | 'Kinh tế' | 'Nghệ thuật' | 'Giải trí' | 'CLB';
  joinedUsers: string[];
  participantInfo?: Participant[];
}

const daysOfWeek = [
  { vn: 'Thứ 2', en: 'Monday' }, { vn: 'Thứ 3', en: 'Tuesday' }, { vn: 'Thứ 4', en: 'Wednesday' },
  { vn: 'Thứ 5', en: 'Thursday' }, { vn: 'Thứ 6', en: 'Friday' }, { vn: 'Thứ 7', en: 'Saturday' },
  { vn: 'CN', en: 'Sunday' },
];

const categoryColors: Record<string, string> = {
  'Kỹ thuật': 'bg-blue-100 text-blue-700',
  'Kinh tế': 'bg-emerald-100 text-emerald-700',
  'Nghệ thuật': 'bg-purple-100 text-purple-700',
  'Giải trí': 'bg-rose-100 text-rose-700',
  'CLB': 'bg-amber-100 text-amber-700',
};

const ParticipantAvatars = ({ users, count }: { users: string[]; count: number }) => {
  if (count === 0) return null;

  // 1. Tạo danh sách 10 ảnh của bạn
  const randomAvatars = [
    'https://images2.thanhnien.vn/528068263637045248/2023/3/17/anh-3-16790138162871188530045.jpg',
    'https://file1.hutech.edu.vn/file/editor/homepage1/V%C5%A9-Th%E1%BB%8B-Ph%C6%B0%C6%A1ng-Chinh-363%281%29.jpg',
    'https://bcp.cdnchinhphu.vn/334894974524682240/2023/9/20/hinh-thuc-ky-luat-sinh-vien-dai-hoc-16951796021201196200177.jpeg',
    'https://file1.hutech.edu.vn/file/editor/homepage1/_MG_8932%281%29.jpg',
    'https://vcdn1-vnexpress.vnecdn.net/2026/01/03/565306324-1138420738401622-399-7048-4069-1767417040.jpg?w=680&h=0&q=100&dpr=2&fit=crop&s=EFg1Sm7WYat0Xf2u2k_oSw',
    'https://vluwebmedia.s3.ap-southeast-1.amazonaws.com/VLU_0296_93a9306bb9.jpg',
    'https://tuyensinh.qui.edu.vn/uploads/news/2023_12/102561785_4000740869999366_2569720796243034112_n.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaiwBKFLfUOO8BBTcU3gzdYVPQnD-b0xLjpQ&s',

  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex -space-x-3">
        {users.slice(0, 10).map((id, index) => {
          // 2. Chọn ảnh: Dùng index để mỗi vị trí là 1 ảnh khác nhau
          // Hoặc dùng Math.floor(Math.random() * 10) nếu bạn muốn thực sự ngẫu nhiên
          const avatarSrc = randomAvatars[index % randomAvatars.length];

          return (
            <div
              key={id}
              className="h-9 w-9 rounded-2xl ring-2 ring-white bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-md overflow-hidden"
              style={{ zIndex: 10 - index }}
            >
              <img
                src={avatarSrc}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            </div>
          );
        })}
      </div>
      <span className="text-sm font-semibold text-zinc-500">
        {count} sv đang tham gia
      </span>
    </div>
  );
};

export default function TimeLinesEvent() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Thứ 2');
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    teacher: '',
    room: '',
    time: '07:00',
    category: 'Kỹ thuật' as const,
  });

  const { user, login } = useAuth();

  // Realtime listener
  useEffect(() => {
    const q = query(collection(db, "classes"), orderBy("time", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ClassItem[];
      setClasses(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleJoin = async (classId: string, isJoined: boolean) => {
    if (!user) return login();

    // Optimistic update
    setClasses(prev => prev.map(c =>
      c.id === classId
        ? {
          ...c, joinedUsers: isJoined
            ? c.joinedUsers.filter(id => id !== user.uid)
            : [...c.joinedUsers, user.uid]
        }
        : c
    ));

    try {
      const classRef = doc(db, "classes", classId);
      await updateDoc(classRef, {
        joinedUsers: isJoined ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      // Có thể rollback optimistic nếu cần
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return login();

    const dayEn = daysOfWeek.find(d => d.vn === selectedDay)?.en || 'Monday';

    try {
      await addDoc(collection(db, "classes"), {
        ...formData,
        day: dayEn,
        joinedUsers: [user.uid],
        createdAt: new Date().toISOString(),
      });
      setIsModalOpen(false);
      setFormData({ subject: '', teacher: '', room: '', time: '07:00', category: 'Kỹ thuật' });
    } catch (err) {
      alert("Có lỗi khi tạo lịch. Vui lòng thử lại!");
    }
  };

  const filteredData = useMemo(() => {
    const dayEn = daysOfWeek.find(d => d.vn === selectedDay)?.en;
    return classes.filter(cls => {
      const matchDay = cls.day === dayEn;
      const matchView = viewMode === 'all' || cls.joinedUsers.includes(user?.uid || '');
      return matchDay && matchView;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [classes, selectedDay, viewMode, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFD] flex items-center justify-center">
        <div className="animate-pulse text-rose-500">Đang tải thời khóa biểu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white text-zinc-900 pb-24">

        {/* Header */}
        <header className=" bg-white sticky top-0 border-b border-zinc-100">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-bold text-rose-500 tracking-[2px] uppercase mb-1">
                {user ? `Xin chào, ${user.displayName || 'bạn'}!` : 'Đăng nhập để tham gia lớp học'}
              </p>
              <h1 className="text-2xl font-black tracking-tighter text-zinc-900">Thời Khóa Biểu SV</h1>
            </div>
            <div className="flex  text-sm font-medium">
              <button
                onClick={() => setViewMode('all')}
                className={`px-5 py-2 rounded-2xl transition-all ${viewMode === 'all' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}
              >
                All
              </button>
              <button
                onClick={() => setViewMode('mine')}
                className={`px-5 py-2 rounded-2xl transition-all ${viewMode === 'mine' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}
              >
                Tôi
              </button>
            </div>
          </div>
        </header>

        {/* Day Selector - Responsive scroll */}
        <nav className="sticky top-0 bg-white/80 backdrop-blur-md z-30 py-4 px-4 overflow-x-auto no-scrollbar flex gap-3 border-b border-zinc-50">
          {daysOfWeek.map((day) => (
            <button
              key={day.vn}
              onClick={() => setSelectedDay(day.vn)}
              className={`flex-shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border-2 
                ${selectedDay === day.vn
                  ? 'bg-rose-500 border-rose-200 text-white scale-105 shadow-lg'
                  : 'bg-zinc-50 border-transparent text-zinc-500'}`}
            >
              <span className="text-[10px] uppercase font-bold">{day.vn === 'CN' ? 'Sun' : 'Thứ'}</span>
              <span className="text-lg font-black leading-none mt-0.5">{day.vn.replace('Thứ ', '')}</span>
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className="p-6">
          {filteredData.length > 0 ? (
            <div className="space-y-10">
              {filteredData.map((cls) => {
                const isJoined = cls.joinedUsers.includes(user?.uid || '');
                return (
                  <div key={cls.id} className="group relative">
                    {/* Time indicator */}
                    <div className="absolute -left-2 -top-6 text-6xl font-black text-rose-400  transition-colors pointer-events-none">
                      {cls.time}
                    </div>

                    <div className="bg-white border border-zinc-100 rounded-3xl p-7 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-start justify-between mb-5">
                        <span className={`px-4 py-1.5 text-xs font-bold rounded-2xl ${categoryColors[cls.category]}`}>
                          {cls.category}
                        </span>

                        <div className="text-right">
                          <span className="block text-xs font-medium text-zinc-400">🔥 {cls.joinedUsers.length} tham gia</span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-black tracking-tight mb-2 leading-none">{cls.subject}</h3>
                      <p className="text-zinc-600">
                        📍 <span className="font-semibold">{cls.room}</span> • GV: <span className="italic">{cls.teacher}</span>
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <ParticipantAvatars users={cls.joinedUsers} count={cls.joinedUsers.length} />

                        <button
                          onClick={() => handleToggleJoin(cls.id, isJoined)}
                          className={`px-8 py-3.5 rounded-2xl font-black text-sm tracking-wider transition-all active:scale-95
                            ${isJoined
                              ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                              : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-200 hover:brightness-105'}`}
                        >
                          {isJoined ? 'HỦY THAM GIA' : 'THAM GIA NGAY'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="mx-auto w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center text-6xl mb-6">
                📅
              </div>
              <p className="text-2xl font-bold text-zinc-700 mb-2">Chưa có lịch nào vào {selectedDay}</p>
              <p className="text-zinc-500 max-w-xs mx-auto">Hãy là người đầu tiên tạo lịch học cho ngày này!</p>
            </div>
          )}
        </main>

        {/* Floating Action Button */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 pointer-events-none">
          <button
            onClick={() => setIsModalOpen(true)}
            className="pointer-events-auto flex items-center gap-2 bg-zinc-900 text-white px-6 py-4 rounded-full shadow-[0_15px_30px_-5px_rgba(244,63,94,0.4)] hover:scale-105 active:scale-95 transition-all group"
          >
            <span className="text-xl font-bold transition-transform group-hover:rotate-90">+</span>
            <span className="text-sm font-black tracking-tight">TẠO LỊCH MỚI</span>
          </button>
        </div>

      {/* Modal Tạo Lịch - Đẹp và responsive hơn */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-t-[40px] md:rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="w-12 h-1.5 bg-zinc-100 rounded-full mx-auto mb-6 md:hidden" />
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black tracking-tighter">Tạo lịch {selectedDay}</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-zinc-50 rounded-full text-zinc-400">✕</button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Tên môn học</label>
                <input required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full bg-zinc-50 border-2 border-transparent focus:border-rose-100 focus:bg-white rounded-2xl p-4 outline-none transition-all text-md font-bold" placeholder="Nhập tên môn học..." />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Giờ học</label>
                  <input type="time" required value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full bg-zinc-50 border-2 border-transparent focus:border-rose-100 focus:bg-white rounded-2xl p-4 outline-none transition-all text-md font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Phòng</label>
                  <input required value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })} className="w-full bg-zinc-50 border-2 border-transparent focus:border-rose-100 focus:bg-white rounded-2xl p-4 outline-none transition-all text-md font-bold" placeholder="Phòng..." />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Giảng viên</label>
                <input required value={formData.teacher} onChange={e => setFormData({ ...formData, teacher: e.target.value })} className="w-full bg-zinc-50 border-2 border-transparent focus:border-rose-100 focus:bg-white rounded-2xl p-4 outline-none transition-all text-md font-bold" placeholder="Tên Thầy/Cô..." />
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar p-2">
                {['Kỹ thuật', 'Giải trí', 'CLB', 'Nghệ thuật'].map(cat => (
                  <button key={cat} type="button" onClick={() => setFormData({ ...formData, category: cat as any })} className={`px-5 py-2.5 rounded-xl text-[10px] font-black whitespace-nowrap transition-all ${formData.category === cat ? 'bg-zinc-900 text-white shadow-lg scale-105' : 'bg-zinc-50 text-zinc-400'}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <button type="submit" className="w-full bg-rose-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-rose-100 active:scale-95 transition-all mt-4 tracking-widest text-xs">
                XÁC NHẬN TẠO LỊCH 🚀
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}