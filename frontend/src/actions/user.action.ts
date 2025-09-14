"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return;

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) {
      // USER EXISTS - CHECK IF PROFILE NEEDS UPDATE
      if (
        existingUser.image !== user.imageUrl ||
        existingUser.name !==
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        existingUser.username !==
          (user.username ?? user.emailAddresses[0].emailAddress.split("@")[0])
      ) {
        // Update the user with latest data from Clerk
        const updatedUser = await prisma.user.update({
          where: {
            clerkId: userId,
          },
          data: {
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            username:
              user.username ??
              user.emailAddresses[0].emailAddress.split("@")[0],
            email: user.emailAddresses[0].emailAddress,
            image: user.imageUrl, // THIS UPDATES THE IMAGE!
          },
        });
        return updatedUser;
      }
      return existingUser;
    }

    // USER DOESN'T EXIST - CREATE NEW USER
    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });
    return dbUser;
  } catch (error) {
    console.log("Error in syncUser", error);
  }
}

export async function getUserbyClerkId(clerkId: string) {
  try {
    return prisma.user.findUnique({
      where: {
        clerkId,
      },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });
  } catch (error) {
    console.log("Error in getUserbyClerkId", error);
  }
}

export async function getDbUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;
  const user = await getUserbyClerkId(clerkId);
  if (!user) throw new Error("User not found");

  return user.id;
}

export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();
    if (userId === null) return [];
    // get 3 random users excluding ourselves and user we already follow
    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          {
            NOT: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 3,
    });
    return randomUsers;
  } catch (error) {
    console.log("Error fetching random Users ", error);
    return [];
  }
}

export async function toggleFollow(targetedUserId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    if (userId === targetedUserId) throw new Error("Cannot follow Your self");
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetedUserId,
        },
      },
    });
    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetedUserId,
          },
        },
      });
    } else {
      // follow
      // Use of transaction didnt understand and not in the mood to understand but means all or nothing i.e carrying two actions together and making sure if one fails other action also fails always carry both actions together hence all or nothing and if succeed both succed together
      await prisma.$transaction([
        prisma.follow.create({
          data: {
            followerId: userId,
            followingId: targetedUserId,
          },
        }),
        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetedUserId, // User which is being followed
            creatorId: userId, // user following other person
          },
        }),
      ]);
    }
    revalidatePath("/"); // updates the page like reloading or something
    return { success: true };
  } catch (error) {
    console.log("Error in toggleFollow", error);
    return { success: false, error };
  }
}
