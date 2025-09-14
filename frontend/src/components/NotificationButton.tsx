"use client";

import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUnreadNotificationCount } from "@/actions/notification.action";

export function NotificationButton() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnreadCount();

    // Listen for notifications read event
    const handleNotificationsRead = () => {
      fetchUnreadCount();
    };

    window.addEventListener('notificationsRead', handleNotificationsRead);
    
    return () => {
      window.removeEventListener('notificationsRead', handleNotificationsRead);
    };
  }, []);

  return (
    <Button variant="ghost" className="flex items-center gap-2 relative" asChild>
      <Link href="/notifications">
        <BellIcon className="w-4 h-4" />
        <span className="hidden lg:inline">Notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    </Button>
  );
}