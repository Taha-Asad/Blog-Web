import { getPostLikedByUser, getProfileByUsername, getUserPosts, isFollowing } from '@/actions/profile.action'
import { notFound } from 'next/navigation';
import React from 'react'
import ProfilePageClient from './ProfilePageClient';


export async function generateMetadata({ params }: { params: { username: string } }) {
    const user = await getProfileByUsername(params.username);
    if (!user) return;

    return {
        title: `${user.name ?? user.username}`,
        description: user.bio || `Check out ${user.username}'s profile.`,
    };
}
async function Profile({ params }: { params: { username: string } }) { // This page use next js dynamic route functionality the piece of url you want cto different for different user you create a folder with folder name in square brackets [] and you need to proivde the params which will replace the peice or url as a parameter

    const user = await getProfileByUsername(params.username);
    if (!user) return notFound();

    const [posts, likedPosts, isCurrentlyFollowing] = await Promise.all([
        getUserPosts(user.id),
        getPostLikedByUser(user.id),
        isFollowing(user.id),
    ])
    return (
        <ProfilePageClient
            user={user}
            posts={posts}
            likedPosts={likedPosts}
            isFollowing={isCurrentlyFollowing} />
    )
}

export default Profile