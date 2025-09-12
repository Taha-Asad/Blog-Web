"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, imageUrl: string) {
  try {
    const userId = await getDbUserId();
    const post = await prisma.post.create({
      data: {
        content,
        image: imageUrl,
        authorId: userId,
      },
    });
    revalidatePath("/"); // purging chache for home page i.e when user creates the post refresh the page and show user post at the top (didnt fully understood the term need to learn about it)
    
    return { success: true, post };
  } catch (error) {
    console.log("Error in createPost", error);
    return { success: false, error: "Failed to create the post" };
  }
}
