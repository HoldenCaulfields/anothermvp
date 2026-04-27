import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageCircle, User, CheckCircle2 } from "lucide-react";

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: { name: string; avatar: string; role: string };
}

export default function ChatOverlay({ isOpen, onClose, targetUser }: Props) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([
    { id: 1, sender: "System", text: "Kết nối thành công! Bạn có thể bắt đầu trao đổi về dự án.", time: "10:00", isMe: false }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    const newMessage = {
      id: Date.now(),
      sender: "Me",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setChatHistory([...chatHistory, newMessage]);
    setMessage("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[200] flex items-end justify-center sm:block px-4 pb-24 sm:p-0">
          {/* Mobile Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm sm:hidden"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full sm:w-[400px] rounded-[32px] shadow-[0_32px_64px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden flex flex-col h-[500px] md:h-[600px] max-h-[80vh] sm:max-h-none"
          >
            {/* Header */}
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center font-black text-sm">
                  {targetUser?.avatar || (targetUser?.name?.[0] ?? "U")}
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">{targetUser?.name || "Người dùng"}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-green-400 font-bold uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Online
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-[20px] text-sm font-medium ${msg.isMe ? 'bg-rose-500 text-white rounded-br-none shadow-lg shadow-rose-200' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-sm'}`}>
                    {msg.text}
                    <div className={`text-[9px] mt-1 opacity-60 ${msg.isMe ? 'text-white' : 'text-slate-400'}`}>{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhắn gì đó..."
                className="flex-1 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl px-5 py-3 outline-none font-bold text-sm transition-all"
              />
              <button 
                onClick={handleSend}
                className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-rose-500 transition-colors shadow-lg shadow-slate-200"
              >
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
