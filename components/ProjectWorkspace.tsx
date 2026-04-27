import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Send, X, Users, Mic, Video, Link, 
    MessageSquare, Hash, Search, ArrowLeft,
    Music
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { chatService, ChatMessage } from "@/services/chat.services";
import { ProjectTeam } from "../services/project.services";
import { userService, UserProfile } from "../services/user.services";

interface Props {
    project: ProjectTeam;
    onClose: () => void;
}

export default function ProjectWorkspace({ project, onClose }: Props) {
    const { user } = useAuth();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
    
    useEffect(() => {
        const fetchMembers = async () => {
            if (project.members && project.members.length > 0) {
                const allUsers = await userService.getAllUsers();
                const members = allUsers.filter(u => project.members.includes(u.uid));
                setTeamMembers(members);
            }
        };
        fetchMembers();
    }, [project.members]);

    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!project.id) return;
        
        const unsubscribe = chatService.subscribeMessages(project.id, (msgs) => {
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [project.id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!message.trim() || !user || !project.id) return;
        
        let type: 'text' | 'youtube' = 'text';
        let metadata = null;

        if (message.includes('youtube.com/') || message.includes('youtu.be/')) {
            type = 'youtube';
            metadata = { url: message };
        }

        const textToSend = message;
        setMessage("");

        try {
            await chatService.sendMessage(project.id, {
                senderId: user.uid,
                senderName: user.displayName || "Anonymous",
                senderAvatar: user.photoURL || "",
                text: textToSend,
                type,
                metadata
            });
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-slate-50 flex flex-col md:flex-row overflow-hidden shadow-2xl"
        >
            {/* Sidebar - Mobile Drawer / Desktop Sidebar */}
            <AnimatePresence>
                {(typeof window !== 'undefined' && window.innerWidth < 768 ? project.members?.length > 0 : true) && (
                    <aside className="hidden md:flex w-80 bg-white border-r border-slate-100 flex-col flex-shrink-0">
                        <div className="p-8 border-b border-slate-50">
                            <button 
                                onClick={onClose}
                                className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-black uppercase text-[10px] tracking-widest mb-6"
                            >
                                <ArrowLeft size={16} /> Quay lại
                            </button>
                            <h2 className="text-2xl font-black italic tracking-tighter text-slate-900 group">
                                {project.name}
                            </h2>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Thành viên tham gia — {teamMembers.length}</h4>
                                <div className="space-y-4">
                                    {teamMembers.map(member => (
                                        <div key={member.uid} className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs overflow-hidden">
                                                    {member.photoURL ? (
                                                        <img src={member.photoURL} alt={member.displayName || ""} className="w-full h-full object-cover" />
                                                    ) : (
                                                        (member.displayName || "E")[0]
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900">{member.displayName}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{member.role}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-900 m-4 rounded-[32px] text-white">
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Workspace Info</div>
                            <div className="text-sm font-bold">Dự án đang trong giai đoạn MVP. Cần tập trung tối ưu Landing Page.</div>
                        </div>
                    </aside>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
                {/* Header */}
                <header className="p-4 md:p-8 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="md:hidden">
                             <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><ArrowLeft size={20} /></button>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 md:gap-2">
                                <Hash size={16} className="text-rose-500" />
                                <h3 className="text-sm md:text-xl font-black italic uppercase tracking-tight">Thảo Luận Chung</h3>
                            </div>
                            <div className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">Trao đổi trực tiếp với team</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                        <button className="p-2 md:p-3 bg-slate-50 text-slate-400 rounded-xl md:rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                            <Mic size={18} />
                        </button>
                        <button className="p-2 md:p-3 bg-slate-50 text-slate-400 rounded-xl md:rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                            <Video size={18} />
                        </button>
                        <button className="p-2.5 md:px-6 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 transition-all shadow-lg">
                            <span className="hidden md:inline">Mời thêm</span>
                            <Users size={16} className="md:hidden" />
                        </button>
                    </div>
                </header>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-8 bg-slate-50/30">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full opacity-30 gap-4">
                            <MessageSquare size={48} />
                            <p className="font-black uppercase tracking-widest text-xs">Chưa có tin nhắn nào</p>
                        </div>
                    )}
                    {messages.map((msg) => {
                        const isMe = user && msg.senderId === user.uid;
                        return (
                            <div key={msg.id} className={`flex gap-3 md:gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                                {!isMe && (
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl overflow-hidden bg-slate-900 text-white flex items-center justify-center font-black flex-shrink-0 shadow-lg text-xs md:text-base">
                                        <img src={msg.senderAvatar || `https://ui-avatars.com/api/?name=${msg.senderName}`} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className={`flex flex-col ${isMe ? 'items-end' : ''} max-w-[85%] md:max-w-[70%]`}>
                                    <div className="flex items-center gap-2 mb-1 md:mb-2 px-2">
                                        <span className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-tight">{msg.senderName}</span>
                                        <span className="text-[8px] md:text-[9px] font-bold text-slate-300 uppercase">
                                            {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                        </span>
                                    </div>
                                    <div className={`p-4 md:p-5 rounded-[20px] md:rounded-[28px] text-xs sm:text-sm md:text-base font-medium shadow-sm transition-all ${isMe ? 'bg-rose-500 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                                        {msg.type === 'youtube' ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-70">
                                                    <Music size={12} className="text-rose-400" /> Youtube Link
                                                </div>
                                                <a href={msg.metadata.url} target="_blank" rel="noreferrer" className="underline break-all block text-[10px] sm:text-xs md:text-sm">{msg.text}</a>
                                                <div className="aspect-video w-full max-w-[200px] sm:max-w-sm bg-slate-900 rounded-lg md:rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
                                                    <Music size={32} className="text-rose-500 opacity-50" />
                                                </div>
                                            </div>
                                        ) : (
                                            msg.text
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-10 bg-white border-t border-slate-50">
                    <div className="max-w-4xl mx-auto flex gap-3 md:gap-4">
                        <div className="flex-1 relative">
                            <input 
                                type="text" 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Gửi tin nhắn..."
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-500 focus:bg-white pl-6 md:px-8 py-3.5 md:py-5 rounded-[20px] md:rounded-[28px] outline-none font-bold text-xs md:text-base text-slate-900 transition-all shadow-inner"
                            />
                            <div className="absolute right-3 inset-y-0 flex items-center gap-1 md:gap-2">
                                <button className="p-1.5 md:p-2 text-slate-300 hover:text-rose-500 transition-colors"><Link size={18} /></button>
                                <button className="p-1.5 md:p-2 text-slate-300 hover:text-rose-500 transition-colors hidden sm:block"><Video size={18} /></button>
                            </div>
                        </div>
                        <button 
                            onClick={handleSend}
                            className="bg-slate-900 text-white w-12 h-12 md:w-16 md:h-16 rounded-[20px] md:rounded-[28px] flex items-center justify-center hover:bg-rose-500 transition-all shadow-2xl hover:scale-105 active:scale-95 flex-shrink-0"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </main>
        </motion.div>
    );
}
