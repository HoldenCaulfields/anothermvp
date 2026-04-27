import { motion, AnimatePresence } from "framer-motion";
import { LogIn, X, Sparkles } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

export default function AuthModal({ isOpen, onClose, message }: Props) {
    const { login } = useAuth();

    const handleLogin = async () => {
        try {
            await login();
            onClose();
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl p-8 text-center overflow-hidden"
                    >
                        {/* Decorative background element */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-rose-500" />
                        
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-900 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                            <svg className="w-10 h-10" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight mb-2">1 chạm duy nhất!</h3>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                            {message || "Bạn cần đăng nhập để thực hiện hành động này và cùng cộng đồng bứt phá ý tưởng."}
                        </p>

                        <button 
                            onClick={handleLogin}
                            className="w-full relative flex items-center justify-center gap-3 bg-white border-2 border-slate-900 text-slate-900 px-4 py-4 rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-xl shadow-slate-200 active:scale-95 group"
                        >
                            <svg className="w-4 h-4 group-hover:filter-none transition-all" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            Tiếp tục với Google
                        </button>

                        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            <Sparkles size={12} /> Gia nhập IdeaForge Hub
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
