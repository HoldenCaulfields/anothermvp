"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Heart, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase'; // Đường dẫn tới file config
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "firebase/firestore";

// --- Components nhỏ để tối ưu ---

const MessageItem = ({ m }: { m: any }) => {
  // Lấy ID của máy hiện tại để biết đâu là tin nhắn mình vừa gửi
  const currentAnonymousId = localStorage.getItem('feedback_user_id');
  
  // Điều kiện để căn phải (tin nhắn của chính mình)
  const isMe = m.senderId === currentAnonymousId;
  
  // Điều kiện để hiển thị nhãn Admin (khi bạn nhắn từ Firebase Console)
  const isAdmin = m.role === "admin";

  return (
    <motion.div className={`flex flex-col ${isMe ? "items-end" : "items-start"} mb-4`}>
      <div className="flex items-center gap-2 mb-1 px-1">
        {isAdmin && <span className="text-[10px] font-bold text-rose-600 uppercase">Admin</span>}
        <span className="text-[9px] text-gray-400 font-medium">{m.time}</span>
      </div>
      <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] ${
        isAdmin 
        ? "bg-rose-100 text-rose-800 rounded-tl-none border border-rose-200" // Màu riêng cho Admin
        : isMe 
          ? "bg-black text-white rounded-tr-none" 
          : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
      }`}>
        {m.text}
      </div>
    </motion.div>
  );
};

const getAnonymousId = () => {
    let id = localStorage.getItem('feedback_user_id');
    if (!id) {
        id = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('feedback_user_id', id);
    }
    return id;
};

export default function FeedbackHub() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<any[]>([]);

    // --- 1. LẤY DỮ LIỆU REALTIME ---
    useEffect(() => {
        const q = query(collection(db, "feedbacks"), orderBy("createdAt", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Format lại thời gian từ Firestore Timestamp
                time: doc.data().createdAt?.toDate()
                    ? doc.data().createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "Đang gửi..."
            }));
            setMessages(msgs);
        });

        return () => unsubscribe(); // Clean up khi unmount
    }, []);

    // Cuộn mượt mà hơn
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isOpen]);

    // --- 2. GỬI DỮ LIỆU LÊN FIRESTORE ---
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const textToSend = inputValue;
        setInputValue(""); // Xóa input ngay để trải nghiệm mượt mà

        try {
            await addDoc(collection(db, "feedbacks"), {
                senderId: getAnonymousId(), // ID duy nhất của khách
                user: "SV", // Tên hiển thị mặc định cho khách
                role: "guest",
                text: inputValue,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Lỗi gửi tin nhắn: ", error);
        }
    };

    return (
        <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[1200] font-sans antialiased">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.8, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 40, scale: 0.8, filter: "blur(10px)" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="-mb-24 w-[calc(100vw-32px)] md:w-96 h-[550px] max-h-[80dvh] bg-white/95 backdrop-blur-2xl border border-rose-100 rounded-[2.5rem] shadow-[0_20px_50px_rgba(225,29,72,0.15)] flex flex-col overflow-hidden"
                    >
                        {/* Header hiện đại */}
                        <div className="px-6 py-5 bg-white border-b border-rose-50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-200">
                                        <Heart size={20} fill="white" className="text-white" />
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-base leading-none">Hòm thư góp ý</h3>
                                    <p className="text-[11px] text-rose-500 font-medium mt-1">Chia sẻ trải nghiệm của bạn!</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-rose-50 rounded-full text-gray-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Area - Custom Scrollbar */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-5 space-y-2 scrollbar-hide hover:scrollbar-default"
                            style={{ scrollbarWidth: 'none' }}
                        >
                            <div className="text-center mb-6">
                                <span className="text-[10px] bg-rose-50 text-rose-400 px-3 py-1 rounded-full uppercase tracking-widest font-bold">Hôm nay</span>
                            </div>

                            {messages.map((m) => (
                                <MessageItem key={m.id} m={m} />
                            ))}
                        </div>

                        {/* Input Area - Tinh gọn */}
                        <div className="p-4 bg-white border-t border-rose-50">
                            <form
                                onSubmit={handleSend}
                                className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl px-3 py-2 focus-within:border-rose-300 focus-within:ring-4 focus-within:ring-rose-50 transition-all"
                            >
                                <button type="button" className="text-gray-400 hover:text-rose-500 transition-colors">
                                    <Smile size={20} />
                                </button>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Nhập góp ý của bạn..."
                                    className="flex-1 bg-transparent border-none text-md focus:ring-0 outline-none text-gray-700 placeholder:text-gray-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="p-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all shadow-md active:scale-95 disabled:opacity-30 disabled:grayscale"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                            <p className="text-center text-[9px] text-rose-400 mt-3 uppercase tracking-tighter">Phản hồi của bạn sẽ giúp cộng đồng tốt hơn</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button - Đẹp hơn */}
            <div className="flex justify-end">
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(225, 29, 72, 0.4)" }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center justify-center w-12 h-12 rounded-[1.5rem] shadow-2xl transition-all duration-300 ${isOpen ? "bg-white text-blue-500 rotate-0" : "bg-blue-500 text-white"
                        }`}
                >
                    {isOpen ? <X size={22} /> : <MessageSquare size={20} />}

                    {/* Badge thông báo nhỏ */}
                    {!isOpen && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-600 border-2 border-white text-[10px] items-center justify-center font-bold text-white">1</span>
                        </span>
                    )}
                </motion.button>
            </div>
        </div>
    );
}