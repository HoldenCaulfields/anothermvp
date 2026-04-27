

const VerificationBadge = () => (
    <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border border-blue-100">
        <div className="w-2 h-2 bg-blue-600 rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-1.5 h-1.5 text-white fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
        </div>
        Verified
    </div>
);

export default VerificationBadge;