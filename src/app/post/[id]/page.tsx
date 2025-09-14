import Link from 'next/link'
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode } from 'react'
import prisma from '@/lib/prisma'
import { FreshAvatar } from '@/components/FreashAvatar'
import NotFound from './not-found'

interface PostPageProps {
    params: {
        id: string
    }
}

export default async function PostPage({ params }: PostPageProps) {
    const post = await prisma.post.findUnique({
        where: { id: params.id },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    image: true,
                }
            },
            comments: {
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            image: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            },
            likes: true,
        }
    })

    if (!post) {
       return  NotFound()
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <div className="bg-card border rounded-lg p-6">
                {/* Author Info */}
                <Link href={`/profile/${post.author.username}`} className="flex items-center gap-3 mb-4">
                    <FreshAvatar src={post.author.image || "/avatar.png"} size="md" />
                    <div>
                        <p className="font-semibold">{post.author.name}</p>
                        <p className="text-sm text-muted-foreground">@{post.author.username}</p>
                    </div>
                </Link>

                {/* Post Content */}
                <div className="mb-6">
                    <p className="text-lg whitespace-pre-wrap">{post.content}</p>
                    {post.image && (
                        <img
                            src={post.image}
                            alt="Post image"
                            className="mt-4 rounded-lg max-w-full h-auto"
                        />
                    )}
                </div>

                {/* Post Metadata */}
                <div className="text-sm text-muted-foreground border-t pt-4">
                    <p>Posted on {post.createdAt.toLocaleDateString()}</p>
                    <div className="flex gap-4 mt-2">
                        <span>{post.likes.length} likes</span>
                        <span>{post.comments.length} comments</span>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="mt-6">
                    <h3 className="font-semibold mb-4">Comments</h3>
                    {post.comments.length > 0 ? (
                        <div className="space-y-4">
                            {post.comments.map((comment: { id: Key | null | undefined; author: { username: any; image: any; name: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined }; content: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; createdAt: { toLocaleDateString: () => string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined } }) => (
                                <div key={comment.id} className="border-l-2 border-muted-foreground pl-4">
                                    <Link href={`/profile/${comment.author.username}`} className="flex items-center gap-2 mb-2">
                                        <FreshAvatar src={comment.author.image} size="sm" />
                                        <span className="font-medium text-sm">{comment.author.name}</span>
                                    </Link>
                                    <p className="text-sm">{comment.content}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {comment.createdAt.toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No comments yet</p>
                    )}
                </div>
            </div>
        </div>
    )
}