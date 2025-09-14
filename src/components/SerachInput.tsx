"use client"

import React, { useState, useEffect } from 'react'
import { Input } from './ui/input'
import { Search, X, Loader2, MessageSquare, User } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'
import { searchUsersAdvanced } from '@/actions/user.action'
import { FreshAvatar } from './FreashAvatar'

interface UserSearchResult {
    id: string;
    username: string;
    name: string | null;
    bio: string | null;
    image: string | null;
    _count: {
        followers: number;
        following: number;
        posts: number;
    };
    posts: Array<{
        id: string;
        title: string | null;
        createdAt: Date; // Changed to Date
    }>;
}

function SearchInput() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<UserSearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [debouncedQuery, setDebouncedQuery] = useState('')

    // Debounce the search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query)
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    // Perform search when debounced query changes
    useEffect(() => {
        const performSearch = async () => {
            if (debouncedQuery.length < 2) {
                setResults([])
                setIsOpen(false)
                return
            }

            setLoading(true)
            setIsOpen(true)

            try {
                const users = await searchUsersAdvanced(debouncedQuery)
                setResults(users)
            } catch (error) {
                console.error('Search failed:', error)
                setResults([])
            } finally {
                setLoading(false)
            }
        }

        performSearch()
    }, [debouncedQuery])

    const clearSearch = () => {
        setQuery('')
        setResults([])
        setIsOpen(false)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
    }

    const handleResultClick = () => {
        clearSearch()
    }

    const handleInputFocus = () => {
        if (query.length >= 2 && results.length > 0) {
            setIsOpen(true)
        }
    }

    const handleInputBlur = () => {
        setTimeout(() => setIsOpen(false), 200)
    }

    // Format date for post timestamps (now accepts Date object)
    const formatDate = (date: Date) => {
        return date.toLocaleDateString()
    }

    // Safe content display function
    const getSafeContent = (content: string | null, maxLength: number = 100) => {
        if (!content) return 'No content';
        return content.length > maxLength
            ? `${content.slice(0, maxLength)}...`
            : content;
    };

    return (
        <div className="relative">
            <div className="flex items-center justify-end p-2 relative">
                <Input
                    placeholder='Search users, posts, bios...'
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className="pr-10"
                    size={50}
                />
                <Button
                    className='absolute right-3'
                    variant={"ghost"}
                    size={"icon"}
                    onClick={clearSearch}
                >
                    {query ? <X size={16} /> : <Search size={16} />}
                </Button>
            </div>

            {/* Search Results Dropdown */}
            {/* Search Results Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-2 right-2 bg-background border rounded-md shadow-lg mt-1 max-h-96 overflow-y-auto z-50">
                    {loading ? (
                        <div className="p-4 text-center">
                            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                            <p className="text-sm text-muted-foreground mt-2">Searching...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="p-2">
                            <p className="text-xs text-muted-foreground px-2 py-1">
                                Found {results.length} result{results.length !== 1 ? 's' : ''}
                            </p>

                            {results.map((user) => (
                                <div key={user.id} className="mb-3 last:mb-0">
                                    {/* User Profile Section - Links to Profile */}
                                    <Link
                                        href={`/profile/${user.username}`}
                                        className="flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors"
                                        onClick={handleResultClick}
                                    >
                                        <FreshAvatar src={user.image || '/avatar.png'} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-muted-foreground" />
                                                <p className="font-medium text-sm truncate">
                                                    {user.name || 'No name'}
                                                </p>
                                                <span className="text-muted-foreground text-xs">
                                                    @{user.username}
                                                </span>
                                            </div>

                                            {user.bio && (
                                                <p className="text-xs text-muted-foreground truncate mt-1">
                                                    {user.bio}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                <span>{user._count.followers} followers</span>
                                                <span>•</span>
                                                <span>{user._count.posts} posts</span>
                                                {user.posts.length > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <MessageSquare size={12} />
                                                            {user.posts.length} matching post{user.posts.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Matching Posts Section - Links to Actual Posts */}
                                    {user.posts.length > 0 && (
                                        <div className="ml-12 mt-1 space-y-2">
                                            {user.posts.map((post) => (
                                                <Link
                                                    key={post.id}
                                                    href={`/post/${post.id}`} // LINK TO ACTUAL POST
                                                    className="block p-2 text-sm bg-muted/50 rounded-md border-l-2 border-primary hover:bg-muted transition-colors"
                                                    onClick={handleResultClick}
                                                >
                                                    <p className="text-foreground">
                                                        "{getSafeContent(post.title)}"
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                        <MessageSquare size={12} />
                                                        View post →
                                                    </p>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : debouncedQuery.length >= 2 ? (
                        <div className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">No users or posts found</p>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}

export default SearchInput