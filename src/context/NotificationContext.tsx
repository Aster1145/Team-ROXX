"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "task" | "report" | "budget" | "inventory" | "system" | "meeting";
  created_at: string;
  read: boolean;
  link?: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (item: Omit<NotificationItem, "id" | "created_at" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const supabase = createClient();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const addNotification = (item: Omit<NotificationItem, "id" | "created_at" | "read">) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Save dynamic notification to local storage so it persists across pages
    try {
      const saved = localStorage.getItem("team_roxx_custom_notifs");
      const existing = saved ? JSON.parse(saved) : [];
      localStorage.setItem("team_roxx_custom_notifs", JSON.stringify([newNotif, ...existing]));
    } catch (e) {
      // Ignore storage errors
    }
  };

  const fetchLiveNotifications = async () => {
    if (!profile?.id) return;

    try {
      const items: NotificationItem[] = [];

      // 0. Load custom scheduled meeting notifications from local storage if any
      try {
        const savedCustomNotifs = localStorage.getItem("team_roxx_custom_notifs");
        if (savedCustomNotifs) {
          const parsed = JSON.parse(savedCustomNotifs);
          if (Array.isArray(parsed)) {
            items.push(...parsed);
          }
        }
      } catch (e) {
        // Ignore
      }

      // 1. Fetch scheduled meetings
      try {
        const { data: meetings } = await supabase
          .from("scheduled_meetings")
          .select("id, title, meeting_date, start_time, created_at, target_department")
          .order("created_at", { ascending: false })
          .limit(5);

        if (meetings && meetings.length > 0) {
          meetings.forEach((m: any) => {
            items.push({
              id: `meet-${m.id}`,
              title: `📅 Scheduled Meeting: ${m.title}`,
              message: `Google Meet call set for ${m.meeting_date} at ${m.start_time} IST. Click to join call.`,
              type: "meeting",
              created_at: m.created_at || new Date().toISOString(),
              read: false,
              link: "/dashboard/meetings",
            });
          });
        }
      } catch (e) {
        // Check local storage fallback meetings
        try {
          const savedMeetings = localStorage.getItem("team_roxx_meetings");
          if (savedMeetings) {
            const parsed = JSON.parse(savedMeetings);
            parsed.slice(0, 3).forEach((m: any) => {
              items.push({
                id: `meet-fallback-${m.id}`,
                title: `📅 Scheduled Meeting: ${m.title}`,
                message: `Google Meet call set for ${m.meeting_date} at ${m.start_time} IST (${m.target_department || "All Team"}). Click to join call.`,
                type: "meeting",
                created_at: m.created_at || new Date().toISOString(),
                read: false,
                link: "/dashboard/meetings",
              });
            });
          }
        } catch (err) {
          // Ignore
        }
      }

      // 2. Fetch assigned tasks
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, title, status, due_date, created_at")
        .eq("assigned_to", profile.id)
        .neq("status", "done")
        .order("created_at", { ascending: false })
        .limit(5);

      if (tasks && tasks.length > 0) {
        tasks.forEach((t: any) => {
          items.push({
            id: `task-${t.id}`,
            title: "Task Assigned",
            message: `Task "${t.title}" is active and needs your progress update.`,
            type: "task",
            created_at: t.created_at || new Date().toISOString(),
            read: false,
            link: "/dashboard",
          });
        });
      }

      // 3. Sunday Weekly Report Deadline Notification
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 is Sunday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        items.push({
          id: "report-deadline-alert",
          title: "Sunday Report Deadline",
          message: "Weekly work report submission deadline is today! Please submit your progress report.",
          type: "report",
          created_at: new Date().toISOString(),
          read: false,
          link: "/dashboard/reports",
        });
      }

      // 4. Budget & Item Requests Updates
      const { data: itemRequests } = await supabase
        .from("budget_item_requests")
        .select("id, item, status, created_at")
        .eq("requested_by", profile.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (itemRequests && itemRequests.length > 0) {
        itemRequests.forEach((req: any) => {
          if (req.status === "approved" || req.status === "ordered") {
            items.push({
              id: `budget-${req.id}`,
              title: `Item Request ${req.status.toUpperCase()}`,
              message: `Your request for "${req.item}" has been ${req.status}.`,
              type: "budget",
              created_at: req.created_at,
              read: false,
              link: "/dashboard/budget",
            });
          }
        });
      }

      // Deduplicate items by ID
      const uniqueItems = Array.from(new Map(items.map((item) => [item.id, item])).values());
      setNotifications(uniqueItems);
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchLiveNotifications();
    }
  }, [profile?.id]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    try {
      localStorage.removeItem("team_roxx_custom_notifs");
    } catch (e) {
      // Ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        loading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

const defaultNotificationContext: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotification: () => {},
  clearAll: () => {},
  loading: false,
};

export function useNotifications() {
  const context = useContext(NotificationContext);
  return context || defaultNotificationContext;
}
