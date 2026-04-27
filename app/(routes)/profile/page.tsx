"use client";

import { useEffect, useState } from "react";

interface Student {
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
  avatar?: string;
}

export default function StudentSocialPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/get-allsvnew")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.data);
        setLoading(false);
      });
  }, []);

  const handleAction = async (mssv: string, type: string) => {
    await fetch("/api/add-interaction", {
      method: "POST",
      body: JSON.stringify({ mssv, type }),
    });

    setStudents((prev) =>
      prev.map((s) => {
        if (s.mssv !== mssv) return s;
        return {
          ...s,
          [type]: (s as any)[type] + 1,
          total: s.total + 1,
        };
      })
    );
  };

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        🎓 Student Social Ranking
      </h1>

      <input
        placeholder="Tìm tên của bạn..."
        className="w-full p-3 border rounded-xl mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid md:grid-cols-3 gap-4">
        {filtered.map((s, index) => (
          <div
            key={s.mssv}
            className="p-4 rounded-2xl shadow bg-white"
          >
            <div className="flex items-center gap-3 mb-3">
              <img
                src={
                  s.avatar ||
                  "https://ui-avatars.com/api/?name=" + s.name
                }
                className="w-14 h-14 rounded-full"
              />
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-sm text-gray-500">
                  {s.lop} - Khoa {s.khoa}
                </div>
              </div>
            </div>

            <div className="text-sm mb-2">🎂 {s.dob}</div>

            <div className="flex justify-between text-sm mb-3">
              <span>🔥 {s.total} điểm</span>
              <span>🏆 Top #{index + 1}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleAction(s.mssv, "likes")}
                className="flex-1 bg-pink-500 text-white rounded-xl p-2"
              >
                ❤️ {s.likes}
              </button>

              <button
                onClick={() => handleAction(s.mssv, "waves")}
                className="flex-1 bg-blue-500 text-white rounded-xl p-2"
              >
                👋 {s.waves}
              </button>

              <button
                onClick={() => handleAction(s.mssv, "xinso")}
                className="flex-1 bg-green-500 text-white rounded-xl p-2"
              >
                📞 {s.xinso}
              </button>
            </div>

            <div className="mt-4">
              <input
                placeholder="💬 Comment..."
                className="w-full p-2 border rounded-lg text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">🔥 Ý tưởng thêm</h2>
        <ul className="list-disc ml-6 text-gray-600">
          <li>Upload avatar bằng Cloudinary</li>
          <li>Bảng xếp hạng hoa khôi / nam vương</li>
          <li>Tạo nhóm lớp / nhóm bạn</li>
          <li>Mini game: Ai giỏi tiếng Anh nhất?</li>
          <li>Check-in: "Đang ở quán cafe này, ghé không?"</li>
          <li>Thách đấu / poll vui</li>
        </ul>
      </div>
    </div>
  );
}
