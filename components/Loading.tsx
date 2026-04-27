export default function Loading() {
    return (
        <div className="h-screen w-full bg-[#FFFFFF] flex flex-col items-center justify-center font-sans">
            <div className="relative flex items-center justify-center w-24 h-24">

                <div className="absolute w-20 h-20 bg-rose-100/50 rounded-full blur-2xl animate-pulse"></div>

                <div className="absolute inset-0 border-2 border-black/3 border-t-rose-500 rounded-full animate-spin"></div>

                <div className="relative z-10 w-12 h-12 bg-rose-600 rounded-xl flex items-center justify-center shadow-2xl shadow-rose-200 border border-white/10">
                    <span className="text-white font-black text-lg tracking-tighter">LN</span>
                </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-3">
                <h2 className="text-rose-500 font-semibold tracking-[0.4em] uppercase text-[10px] opacity-80">
                    LovelyNet
                </h2>
                <div className="w-24 h-[1.5px] bg-slate-100 relative overflow-hidden rounded-full">
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-rose-500 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                </div>
            </div>
        </div>
    );
}