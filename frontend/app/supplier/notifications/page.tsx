"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([]);
  useEffect(() => { api.get("/supplier/notifications").then(r => setNotifs(r.data)).catch(console.error); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
      {notifs.length === 0 ? <p className="text-slate-500">No notifications yet.</p> : (
        <div className="space-y-3">
          {notifs.map((n, i) => (
            <Card key={i} className={n.read ? "opacity-60" : ""}>
              <CardContent className="pt-4 flex gap-3">
                <Bell size={18} className="text-blue-600 mt-0.5"/>
                <div><p className="text-sm font-medium">{n.message}</p><p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}