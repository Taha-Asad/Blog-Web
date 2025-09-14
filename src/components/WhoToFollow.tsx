import { getRandomUsers } from '@/actions/user.action'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Link from 'next/link';
import { Avatar, AvatarImage } from './ui/avatar';
import FollowButton from './FollowButton';
import { FreshAvatar } from './FreashAvatar';

async function WhoToFollow() {
    const users = await getRandomUsers();
    if (users.length === 0) return null;
    return (
        <Card className='sticky top-20'>
            <CardHeader>
                <CardTitle>Who to Follow</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {users.map((user) => (
                        <div key={user.id} className="flex gap-2 items-center justify-between ">
                            <div className="flex items-center gap-1">
                                <Link href={`/profile/${user.username}`}>
                                    <FreshAvatar
                                        src={user.image || "/avatar.png"} // Database now has updated image
                                        className="border-2"
                                        size="xl"
                                    />
                                </Link>
                                <div className="text-xs">
                                    <Link href={`/profile/${user.username}`} className="font-medium cursor-pointer">
                                        {user.name}
                                    </Link>
                                    <p className="text-muted-foreground">@{user.username}</p>
                                    <p className="text-muted-foreground">{user._count.followers} followers</p>
                                </div>
                            </div>
                            <FollowButton userId={user.id} />
                            {/* // This is a child of whoToFollow Component but is client side child component with a server side parent */}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default WhoToFollow