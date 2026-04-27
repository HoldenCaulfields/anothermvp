"use client";
import { User, Flame, Crown } from "lucide-react";
import { motion } from "framer-motion";

// Component hiển thị từng vòng tròn Story
const IdolStoryItem = ({ student, rank }: { student: any; rank: number }) => {
  const isTop3 = rank < 3;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
      className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group relative"
    >
      <div className="relative p-[2px] rounded-full transition-all duration-300 group-active:scale-90">
        {/* Ring Gradient xoay nhẹ */}
        <div className={`absolute inset-0 rounded-full animate-spin-slow ${
          rank === 0 ? 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-rose-500' :
          rank === 1 ? 'bg-gradient-to-tr from-slate-300 via-blue-400 to-slate-400' :
          rank === 2 ? 'bg-gradient-to-tr from-orange-400 via-amber-700 to-orange-500' :
          'bg-slate-200'
        }`} />
        
        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full border-[3px] border-white overflow-hidden bg-white shadow-inner flex items-center justify-center">
          <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-rose-400 transition-colors">
            <User size={35} />
          </div>
        </div>

        {/* Rank Badge */}
        <div className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-md text-[10px] font-black text-white ${
          rank === 0 ? 'bg-yellow-500' : rank === 1 ? 'bg-slate-400' : rank === 2 ? 'bg-orange-600' : 'bg-slate-800'
        }`}>
          {rank === 0 ? <Crown size={14} fill="currentColor" /> : rank + 1}
        </div>
      </div>
      
      <div className="flex flex-col items-center max-w-[80px]">
        <span className="text-[11px] font-bold text-slate-700 group-hover:text-rose-600 transition-colors truncate w-full text-center">
          {student.name.split(' ').pop()}
        </span>
        <div className="flex items-center gap-0.5 bg-rose-50 px-1.5 py-0.5 rounded-full">
          <Flame size={10} className="text-rose-500" fill="currentColor" />
          <span className="text-[9px] font-black text-rose-600">
            {student.total.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export function TopIdolStories({ students }: { students: any[] }) {
  const top10 = [...students].sort((a, b) => b.total - a.total).slice(0, 10);

  if (top10.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-b from-white to-transparent py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 rounded-xl">
              <Flame className="text-rose-600" size={20} fill="currentColor" />
            </div>
            <h3 className="text-lg font-black italic tracking-tight text-slate-800">Hot Sinh Viên</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">TOP 10 TUẦN</span>
        </div>
        
        <div className="flex gap-6 overflow-x-auto no-scrollbar py-2 px-2 snap-x">
          {top10.map((student, index) => (
            <IdolStoryItem key={student.mssv} student={student} rank={index} />
          ))}
        </div>
      </div>
    </div>
  );
}