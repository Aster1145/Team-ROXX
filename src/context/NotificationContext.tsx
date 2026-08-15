"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "task" | "report" | "budget" | "inventory" | "system";
  created_at: string;
  read: boolean;
  link?: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
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

  const fetchLiveNotifications = async () => {
    if (!profile?.id) return;

    try {
      const items: NotificationItem[] = [];

      // 1. Fetch assigned tasks
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

      // 2. Sunday Weekly Report Deadline Notification
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

      // 3. Budget & Item Requests Updates
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

      // 4. Default welcome / system notification if list is sparse
      items.push({
        id: "welcome-system-alert",
        title: "ROXX Platform Workspace Active",
        message: `Welcome back, ${profile.full_name || "Teammate"}! You are signed in as ${profile.role?.toUpperCase() || "MEMBER"}.`,
        type: "system",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        read: true,
        link: "/dashboard",
      });

      setNotifications(items);
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
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
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
