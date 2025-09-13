"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";

export async function getNotifictions() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];
    const notfication = await prisma.notification.findMany({
      where: {
        userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            image: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return notfication;
  } catch (error) {
    console.log("Error in getNotfication", error);
    throw new Error("Error Getting Notifications");
  }
}

export async function markNotificationAsRead(notificationIds: string[]) {
  try {
    await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
      },
      data: {
        read: true,
      },
    });
    return { success: true };
  } catch (error) {
    console.log("Error in MarkNotificationAsRead", error);
    return { success: false };
  }
}
