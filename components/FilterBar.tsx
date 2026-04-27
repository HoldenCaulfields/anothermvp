import React from "react";
import { Search, ChevronDown } from "lucide-react";

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  placeholder?: string;
  rightElement?: React.ReactNode;
}

export default function FilterBar({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  placeholder = "Tìm kiếm...",
  rightElement,
}: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-12">
      <div className="flex-1 relative group">
        <div className="absolute inset-y-0 left-6 flex items-center text-slate-300 group-focus-within:text-rose-500 transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-16 md:h-20 bg-white rounded-[24px] border-2 border-transparent focus:border-rose-500 pl-16 pr-6 text-base font-bold shadow-sm outline-none transition-all placeholder:text-slate-300"
        />
      </div>
      
      <div className="flex gap-2">
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="appearance-none h-16 md:h-20 bg-white rounded-[24px] border-2 border-transparent focus:border-rose-500 px-8 pr-12 text-xs font-black uppercase tracking-widest text-slate-900 shadow-sm outline-none transition-all cursor-pointer min-w-[160px]"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown size={16} />
          </div>
        </div>

        {rightElement}
      </div>
    </div>
  );
}
