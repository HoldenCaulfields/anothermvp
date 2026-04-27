import React, { useState, useEffect } from "react";
import { Bell, Circle, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { notificationService, AppNotification } from "../services/notification.services";
import { useAuth } from "../hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user) return;
    const unsubscribe = notificationService.subscribe(user.uid, (data) => {
      setNotifications(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleMarkRead = async (id: string) => {
    await notificationService.markAsRead(id);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute -right-30 mt-4 w-72 md:w-96 bg-white rounded-[32px] shadow-2xl border border-slate-100 z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white">
                <h3 className="font-black text-xs uppercase tracking-widest leading-none">Thông báo ({unreadCount})</h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-[9px] font-black uppercase opacity-60 hover:opacity-100"
                >
                  <X size={20}/>
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Bell className="mx-auto mb-4 opacity-20" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Chưa có thông báo mới</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => n.id && handleMarkRead(n.id)}
                      className={`p-5 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0 ${!n.read ? 'bg-rose-50/50' : ''}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
                        <img src={`https://ui-avatars.com/api/?name=${n.senderName}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-black text-slate-900 leading-tight">
                            <span className="text-rose-500">{n.senderName}</span> {n.content}
                          </p>
                          {!n.read && <Circle className="text-rose-500 fill-rose-500 mt-1" size={8} />}
                        </div>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                          {n.createdAt?.seconds 
                            ? formatDistanceToNow(new Date(n.createdAt.seconds * 1000), { addSuffix: true, locale: vi })
                            : 'Vừa xong'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
