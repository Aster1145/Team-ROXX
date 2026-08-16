"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useNotifications } from "@/context/NotificationContext";
import {
  Bell,
  Check,
  Trash2,
  CheckCircle2,
  Calendar,
  Wallet,
  CheckSquare,
  Sparkles,
  Info,
  Video,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export function NotificationsPopover() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task":
        return <CheckSquare className="h-4 w-4 text-purple-500" />;
      case "report":
        return <Calendar className="h-4 w-4 text-emerald-500" />;
      case "budget":
        return <Wallet className="h-4 w-4 text-blue-500" />;
      case "meeting":
        return <Video className="h-4 w-4 text-emerald-500" />;
      default:
        return <Info className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Notification Bell Button styled matching the screenshot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all focus:outline-none"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Glassmorphic Popover Dropdown - Viewport safe positioning for mobile */}
      {isOpen && (
        <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-20 sm:top-12 z-50 w-auto sm:w-96 max-w-md rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 p-4 shadow-2xl backdrop-blur-md transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 text-[10px] font-bold">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-medium transition-colors flex items-center gap-1"
                  title="Mark all as read"
                >
                  <Check className="h-3.5 w-3.5" /> Read All
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                  title="Clear all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List of Notifications */}
          <div className="max-h-80 overflow-y-auto space-y-2 mt-3 pr-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-3 rounded-xl border transition-all relative group cursor-pointer ${
                  n.read
                    ? "bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60 opacity-80"
                    : "bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700 shadow-2xs"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug break-words">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-700/50 text-[10px] text-slate-400">
                      <span>{formatDateTime(n.created_at)}</span>
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => setIsOpen(false)}
                          className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View →
                        </Link>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(n.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"
                    title="Dismiss"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500/60" />
                <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                  All caught up!
                </p>
                <p className="text-[11px] mt-0.5">No unread notifications at the moment.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
