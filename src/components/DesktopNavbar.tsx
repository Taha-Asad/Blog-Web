import { BellIcon, HomeIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import ModeToggle from "./ModeToggle";
import { currentUser } from "@clerk/nextjs/server";
import SerachInput from "./SerachInput";
import { getUnreadNotificationCount } from "@/actions/notification.action";
import { NotificationButton } from "./NotificationButton";

async function DesktopNavbar() {
    const user = await currentUser();
    const unreadCount = user ? await getUnreadNotificationCount() : 0;

    return (
        <div className="hidden md:flex items-center space-x-4">
            <SerachInput />
            <ModeToggle />

            <Button variant="ghost" className="flex items-center gap-2" asChild>
                <Link href="/">
                    <HomeIcon className="w-4 h-4" />
                    <span className="hidden lg:inline">Home</span>
                </Link>
            </Button>

            {user ? (
                <>
                    <NotificationButton />
                    <Button variant="ghost" className="flex items-center gap-2" asChild>
                        <Link
                            href={`/profile/${user.username ?? user.emailAddresses[0].emailAddress.split("@")[0]
                                }`}
                        >
                            <UserIcon className="w-4 h-4" />
                            <span className="hidden lg:inline">Profile</span>
                        </Link>
                    </Button>
                    <UserButton />
                </>
            ) : (
                <>
                    <SignedOut>
                        <SignInButton mode="modal" />
                        <SignUpButton>
                            <Button className="cursor-pointer">
                                Sign Up
                            </Button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </>
            )}
        </div>
    );
}
export default DesktopNavbar;