import { useAuth } from "@/hooks/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut } from "lucide-react";

export default function LoginWithGoogle() {
    const {login} = useAuth();
    
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed inset-0  bg-slate-50/98 backdrop-blur-xl p-6 flex items-center justify-center"
            >
                <div className="max-w-md w-full text-center space-y-8">
                    {/* Icon trang trí phía trên */}
                    <div className="relative mx-auto w-24 h-24">
                        <div className="absolute inset-0 bg-rose-200 blur-2xl opacity-40 rounded-full animate-pulse"></div>
                        <div className="relative w-24 h-24 bg-white shadow-2xl shadow-rose-100 rounded-[2.5rem] flex items-center justify-center border border-rose-50">
                            <LogOut className="w-10 h-10 text-rose-500" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Chào bạn mới!</h2>
                        <p className="text-slate-500 font-medium px-8">
                            Đăng nhập nhanh chóng để khám phá hồ sơ và kết nối cùng bạn bè
                        </p>
                    </div>

                    {/* Nút Đăng nhập Google */}
                    <button
                        onClick={login}
                        className="group relative w-full flex items-center justify-center gap-3 py-4 bg-white text-slate-700 font-bold rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-rose-100 hover:text-rose-600 transition-all duration-300 active:scale-[0.98]"
                    >
                        {/* SVG Google Icon chuẩn */}
                        <svg className="w-6 h-6" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                        </svg>
                        <span>Tiếp tục với Google</span>

                        {/* Hiệu ứng tia sáng khi hover */}
                        <div className="absolute inset-0 rounded-2xl bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <p className="text-xs text-slate-400 font-medium">
                        Bằng cách đăng nhập, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}