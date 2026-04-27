import { useAuth } from "./useAuth";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function LoginGate({ open, onClose, title = "Đăng nhập để tiếp tục", description = "Sử dụng tài khoản Google để truy cập tính năng này." }: Props) {
  const { login } = useAuth();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#111114] p-6 shadow-2xl">
        <div className="text-center">
          <div className="text-4xl mb-3">👋</div>
          <h2 className="text-xl font-black text-white">{title}</h2>
          <p className="text-sm text-white/50 mt-2 leading-relaxed">{description}</p>
        </div>
        <button
          onClick={async () => {
            await login();
            onClose();
          }}
          className="mt-6 w-full bg-white hover:bg-white/90 text-black rounded-xl py-3 text-sm font-black flex items-center justify-center gap-2 transition-colors border-0 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          Đăng nhập với Google
        </button>
        <button onClick={onClose} className="mt-3 w-full text-xs font-bold text-white/40 hover:text-white/70 cursor-pointer bg-transparent border-0 py-2 transition-colors">
          Để sau
        </button>
      </div>
    </div>
  );
}
