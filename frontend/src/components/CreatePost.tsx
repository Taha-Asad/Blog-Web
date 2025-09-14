"use client"
import { useUser } from '@clerk/nextjs'
import React, { useState } from 'react'
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { ImageIcon, Loader2Icon, SendIcon } from 'lucide-react';
import { createPost } from '@/actions/post.action';
import toast from 'react-hot-toast';
import ImageUpload from './ImageUpload';
import { Input } from './ui/input';

function CreatePost() {
    const { user } = useUser();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() && !content.trim() && !imageUrl) return;
        if (!title.trim()) return toast.error("Title is Compulsory")
        setIsPosting(true)
        try {
            const result = await createPost(title, content, imageUrl)
            if (result?.success) {
                setTitle("");
                setContent("");
                setImageUrl("");
                setShowImageUpload(false);
                toast.success("Post Created Successfully!");
            }

        } catch (error) {
            console.log("Error in creating post", error);
            toast.error("Error in creating post");

        } finally {
            setIsPosting(false);
        }
    }
    return (
        <Card className='mb-6'>
            <CardContent className="pt-6">
                <div className="space-y-5">
                    <div className="flex space-x-4">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={user?.imageUrl || "/avatar.png"} />
                        </Avatar>
                        <div className="flex flex-col w-full">
                            <Input placeholder='Post Title'
                                className='w-[100%] border-none mb-5 resize-none focus-visible:ring-0 p-0 text-base'
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isPosting} />
                            <Textarea
                                placeholder="What's on your mind?"
                                className="min-h-[100px] pt-5 resize-none border-none focus-visible:ring-0 p-0 text-base"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                disabled={isPosting}
                            />
                        </div>
                    </div>
                    {(showImageUpload || imageUrl) && (
                        <div className="border rounded-lg p-4">
                            <ImageUpload
                                endpoint="postImage"
                                value={imageUrl}
                                onChange={(url) => {
                                    setImageUrl(url);
                                    if (!url) setShowImageUpload(false);
                                }}
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between border-t pt-4">
                        <div className="flex space-x-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-primary"
                                onClick={() => setShowImageUpload(!showImageUpload)}
                                disabled={isPosting}
                            >
                                <ImageIcon className="size-4 mr-2" />
                                Photo
                            </Button>
                        </div>
                        <Button
                            className="flex items-center"
                            onClick={handleSubmit}
                            disabled={(!content.trim() && !imageUrl) || isPosting}
                        >
                            {isPosting ? (
                                <>
                                    <Loader2Icon className="size-4 mr-2 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <SendIcon className="size-4 mr-2" />
                                    Post
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default CreatePost