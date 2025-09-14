"use client"
import React, { useState } from 'react'
import { Button } from './ui/button';
import { Loader2Icon } from 'lucide-react';
import toast from 'react-hot-toast';
import { toggleFollow } from '@/actions/user.action';

function FollowButton({ userId }: { userId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const handleFollow = async () => {
        setIsLoading(true);
        try {
            const result = await toggleFollow(userId);
            toast.success("User followed Successfully");
        } catch (error) {
            console.log("Error in following user ", error);
            toast.error("Error following the User");
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <Button
            size={"sm"}
            variant={"secondary"}
            onClick={handleFollow}
            disabled={isLoading}
            className='w-20'
        >
            {isLoading ? <Loader2Icon className='size-4 animate-spin' /> : "Follow"}
        </Button>
    )
}

export default FollowButton