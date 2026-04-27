'use client'
import { useEffect, useState } from "react";
import { createCandidate } from "@/services/votecdn.services";
import { Plus, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// 1. Định nghĩa Interface cho Props
interface CreateCandidateModalProps {
    contestId: string;
}

export default function CreateCandidateModal({ contestId }: CreateCandidateModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        sbd: "",
        dept: "",
        file: null as File | null
    });
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleSubmit = async () => {
        // Kiểm tra cơ bản
        if (!formData.file || !formData.name || !formData.sbd) {
            return alert("Vui lòng điền đầy đủ thông tin và chọn ảnh chân dung");
        }

        try {
            setLoading(true);

            // 2. Truyền thêm contestId vào service
            await createCandidate({
                name: formData.name,
                sbd: formData.sbd,
                dept: formData.dept,
                file: formData.file,
                contestId: contestId // Quan trọng: Gắn ID cuộc thi vào doc thí sinh
            });

            alert("Đăng ký thành công! Thí sinh của bạn đã xuất hiện trong danh sách.");
            setOpen(false);
            setFormData({ name: "", sbd: "", dept: "", file: null });
            setPreview(null);
        } catch (err) {
            console.error(err);
            alert("Có lỗi xảy ra khi upload. Vui lòng kiểm tra lại kết nối.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Nút bấm mở Modal (Giữ nguyên UI đẹp của bạn) */}
            <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setOpen(true)}
                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20 group relative overflow-hidden"
            >
                <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-1/2 -skew-x-12"
                />
                <div className="bg-rose-500 p-2 rounded-xl group-hover:rotate-12 transition-transform">
                    <Plus className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                    <p className="font-black text-sm uppercase tracking-wider leading-none">Gửi ảnh tham gia</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">Vui là chính, dính là 10!</p>
                </div>
            </motion.button>

            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[4000]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl relative"
                        >
                            <button onClick={() => setOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>

                            <h2 className="text-2xl font-black text-slate-900 mb-2">Đăng ký thí sinh</h2>
                            <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-6">
                                Cuộc thi: {contestId}
                            </p>

                            <div className="space-y-4">
                                {/* Field: Họ và tên */}
                                <div className="space-y-1">
                                    <label className="text-md font-black text-slate-400 uppercase ml-2">Họ và tên</label>
                                    <input
                                        placeholder="Trần Thanh Trúc"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-rose-500 p-4 rounded-2xl outline-none transition-all font-bold"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Field: SBD */}
                                    <div className="space-y-1">
                                        <label className="text-md font-black text-slate-400 uppercase ml-2">Số báo danh</label>
                                        <input
                                            placeholder="001"
                                            value={formData.sbd}
                                            onChange={(e) => setFormData({ ...formData, sbd: e.target.value })}
                                            className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-rose-500 p-4 rounded-2xl outline-none transition-all font-bold"
                                        />
                                    </div>
                                    {/* Field: Khoa */}
                                    <div className="space-y-1">
                                        <label className="text-md font-black text-slate-400 uppercase ml-2">Khoa / Khối</label>
                                        <input
                                            placeholder="Công nghệ"
                                            value={formData.dept}
                                            onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                                            className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-rose-500 p-4 rounded-2xl outline-none transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                {/* Field: Upload Ảnh */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Ảnh dự thi</label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all overflow-hidden relative">

                                        {preview ? (
                                            <>
                                                <img
                                                    src={preview}
                                                    alt="preview"
                                                    className="w-full h-full object-cover"
                                                />

                                                {/* Overlay */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">
                                                    Đổi ảnh
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                                <Upload className="w-6 h-6" />
                                                <span className="text-[10px] font-black uppercase tracking-tighter">
                                                    Click để chọn file
                                                </span>
                                            </div>
                                        )}

                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                const previewUrl = URL.createObjectURL(file);

                                                setFormData({ ...formData, file });
                                                setPreview(previewUrl);
                                            }}
                                        />
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    disabled={loading}
                                    onClick={handleSubmit}
                                    className="w-full bg-rose-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-rose-600/30 hover:bg-rose-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang xử lý...
                                        </span>
                                    ) : "Gửi thông tin tham gia"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}