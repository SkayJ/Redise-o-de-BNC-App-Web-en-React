import { useState, useEffect } from "react";
import { localDB } from "@/api/localDB";
import { X, Bell, ArrowDownToLine, CreditCard, DollarSign, CheckCircle2, Loader2 } from "lucide-react";
import moment from "moment";

// Panel de notificaciones BNC
// Autor: SkayJ
const notifConfig = {
  recepcion: { icon: ArrowDownToLine, color: "bg-[hsl(127_73%_33%)]/10 text-[hsl(127_73%_33%)] dark:text-[hsl(127_73%_45%)]" },
  credito: { icon: CreditCard, color: "bg-[hsl(46_63%_53%)]/10 text-[hsl(46_63%_40%)] dark:text-[hsl(46_63%_55%)]" },
  compra_divisa: { icon: DollarSign, color: "bg-[hsl(127_73%_33%)]/10 text-[hsl(127_73%_33%)] dark:text-[hsl(127_73%_45%)]" },
  pago: { icon: CheckCircle2, color: "bg-[hsl(223_82%_15%)]/10 text-[hsl(223_82%_30%)] dark:text-[hsl(228_55%_65%)]" },
  info: { icon: Bell, color: "bg-muted text-muted-foreground" },
};

export default function NotificationPanel({ open, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) loadNotifications();
  }, [open]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const notifs = await localDB.entities.Notification.list("-created_date", 20);
      setNotifications(notifs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await localDB.entities.Notification.update(id, { read: true });
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    try {
      await localDB.entities.Notification.bulkUpdate(unread.map((n) => ({ id: n.id, read: true })));
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute top-0 right-0 bottom-0 w-80 max-w-[85%] bg-card shadow-2xl flex flex-col">
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, hsl(223 82% 15%), hsl(228 55% 23%))" }}
        >
          <h3 className="text-white font-bold text-base">Notificaciones</h3>
          <div className="flex items-center gap-3">
            <button onClick={markAllAsRead} className="text-white/60 text-xs hover:text-white transition-colors">
              Marcar todo leido
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
              <Bell size={32} className="text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No tienes notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notif) => {
                const config = notifConfig[notif.type] || notifConfig.info;
                const Icon = config.icon;
                return (
                  <button
                    key={notif.id}
                    onClick={() => !notif.read && markAsRead(notif.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${
                      !notif.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{notif.title}</p>
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-[hsl(25_100%_50%)] flex-shrink-0 mt-1.5" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {moment(notif.created_date).fromNow()}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}