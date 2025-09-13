"use client"
import { createComment, deletePost, getPosts, toggleLike } from '@/actions/post.action';
import { SignInButton, useUser } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent } from './ui/card';
import Link from 'next/link';
import { Avatar, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from "date-fns";
import { DeleteAlertDialog } from './DeleteAlertDialag';
import { Button } from './ui/button';
import { HeartIcon, Loader2Icon, LogInIcon, MessageCircleIcon, SendIcon } from 'lucide-react';
import { Textarea } from './ui/textarea';

type Posts = Awaited<ReturnType<typeof getPosts>>
type Post = Posts[number]

function PostCard({ posts, dbUserId }: { posts: Post, dbUserId: string | null }) {
    const { user } = useUser();
    const [comment, setComment] = useState("");
    const [isCommenting, setIsCommenting] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [hasLiked, setHasLiked] = useState(posts.likes.some(like => like.userId === dbUserId));
    const [optimisticLikes, setOptimisticLikes] = useState(posts._count.likes); // Using the concepts of Optimistic Updates i.e When a user like the post it changes the color of icon to red immediatly not waiting for the database to the update which is happening in the backend hence called optimistic meaning the color changes on the promise that database will be updated after this 
    const [showComments, setShowComments] = useState(false);

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    // Functions

    const handleLike = async () => {
        if (isLiking) return;
        try {
            setIsLiking(true);
            setHasLiked(prev => !prev);
            setOptimisticLikes(prev => prev + (hasLiked ? - 1 : 1));
            await toggleLike(posts.id);

        } catch (error) {
            setOptimisticLikes(posts._count.likes);
            setHasLiked(posts.likes.some(like => like.userId === dbUserId));
        } finally {
            setIsLiking(false);
        }
    }
    const handleComment = async () => {
        if (!comment.trim() || isCommenting) return;
        try {
            setIsCommenting(true);
            const result = await createComment(posts.id, comment);
            if (result?.success) {
                toast.success("Comment Posted Successfully");
                setComment("");
            }
        } catch (error) {
            toast.error("Failed to Post Error");
        } finally {
            setIsCommenting(false);
        }
    }
    const handleDeletePost = async () => {
        if (isDeleting) return;
        try {
            setIsDeleting(true);
            const result = await deletePost(posts.id);
            if (result.success)
                toast.success("Post Deleted Successfully");
            else throw new Error(result.error);
        } catch (error) {
            toast.error("Error Deleting Post");
        } finally {
            setIsDeleting(false);
        }
    }
    return (
        <Card className='overflow-hidden'>
            <CardContent className='p-4 sm:p-6'>
                <div className="space-y-5">
                    <div className="flex space-x-3 sm:space-x-4">
                        <Link href={`/profile/${posts.author.username}`}>
                            <Avatar className="size-8 sm:w-10 sm:h-10">
                                <AvatarImage src={posts.author.image ?? "/avatar.png"} />
                            </Avatar>
                        </Link>

                        {/* Post header & text content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                                    <Link
                                        href={`/profile/${posts.author.username}`}
                                        className="font-semibold truncate"
                                    >
                                        {posts.author.name}
                                    </Link>
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <Link href={`/profile/${posts.author.username}`}>@{posts.author.username}</Link>
                                        <span>•</span>
                                        <span>{isMounted ? formatDistanceToNow(new Date(posts.createdAt)) + " ago" : <Loader2Icon className='animate-spin' />}
                                        </span>
                                    </div>
                                </div>
                                {/* Check if current user is the post author */}
                                {dbUserId === posts.author.id && (
                                    <DeleteAlertDialog isDeleting={isDeleting} onDelete={handleDeletePost} />
                                )}
                            </div>
                            <p className="mt-2 text-sm text-foreground break-words">{posts.content}</p>
                        </div>
                    </div>
                    {/* POST IMAGE */}
                    {posts.image && (
                        <div className="rounded-lg overflow-hidden">
                            <img src={posts.image} alt="Post content" className="w-full h-auto object-cover" />
                        </div>
                    )}

                    {/* LIKE & COMMENT BUTTONS */}
                    <div className="flex items-center pt-2 space-x-4">
                        {user ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`text-muted-foreground gap-2 ${hasLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"
                                    }`}
                                onClick={handleLike}
                            >
                                {hasLiked ? (
                                    <HeartIcon className="size-5 fill-current" />
                                ) : (
                                    <HeartIcon className="size-5" />
                                )}
                                <span>{optimisticLikes}</span>
                            </Button>
                        ) : (
                            <SignInButton mode="modal">
                                <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
                                    <HeartIcon className="size-5" />
                                    <span>{optimisticLikes}</span>
                                </Button>
                            </SignInButton>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground gap-2 hover:text-blue-500"
                            onClick={() => setShowComments((prev) => !prev)}
                        >
                            <MessageCircleIcon
                                className={`size-5 ${showComments ? "fill-blue-500 text-blue-500" : ""}`}
                            />
                            <span>{posts.comments.length}</span>
                        </Button>
                    </div>

                    {/* COMMENTS SECTION */}
                    {showComments && (
                        <div className="space-y-4 pt-4 border-t">
                            <div className="space-y-4">
                                {/* DISPLAY COMMENTS */}
                                {posts.comments.map((comment) => (
                                    <div key={comment.id} className="flex space-x-3">
                                        <Avatar className="size-8 flex-shrink-0">
                                            <AvatarImage src={comment.author.image ?? "/avatar.png"} />
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                <span className="font-medium text-sm">{comment.author.name}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    @{comment.author.username}
                                                </span>
                                                <span className="text-sm text-muted-foreground">·</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {formatDistanceToNow(new Date(comment.createdAt))} ago
                                                </span>
                                            </div>
                                            <p className="text-sm break-words">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {user ? (
                                <div className="flex space-x-3">
                                    <Avatar className="size-8 flex-shrink-0">
                                        <AvatarImage src={user?.imageUrl || "/avatar.png"} />
                                    </Avatar>
                                    <div className="flex-1">
                                        <Textarea
                                            placeholder="Write a comment..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            className="min-h-[80px] resize-none"
                                        />
                                        <div className="flex justify-end mt-2">
                                            <Button
                                                size="sm"
                                                onClick={handleComment}
                                                className="flex items-center gap-2"
                                                disabled={!comment.trim() || isCommenting}
                                            >
                                                {isCommenting ? (
                                                    "Posting..."
                                                ) : (
                                                    <>
                                                        <SendIcon className="size-4" />
                                                        Comment
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center p-4 border rounded-lg bg-muted/50">
                                    <SignInButton mode="modal">
                                        <Button variant="outline" className="gap-2">
                                            <LogInIcon className="size-4" />
                                            Sign in to comment
                                        </Button>
                                    </SignInButton>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default PostCard