"use client"
import Link from "next/link";
import Image from "next/image";
import { OrganizationSwitcher, SignOutButton, SignedIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Streaks from "../forms/Streaks";
import { useEffect, useState } from "react";
import { fetchCurrentUserId } from "@/lib/actions/user.actions";

function TopBar() {
    const [userId, setUserId] = useState('');
    const [isUserLoggedIn, setUserLoggedIn] = useState(false);

    useEffect(() => {
        const currentUser = async () => {
            try {
                const userId = await fetchCurrentUserId();
                // console.log(userId);
                if(userId) {
                    setUserId(userId);
                    setUserLoggedIn(true);
                    // console.log(userData);
                }
                else {
                    setUserId('');
                    setUserLoggedIn(false);
                }
            } catch(err) {
                console.log("Error fetching current user data");
            }
        }
        currentUser();
    },[])

    return (
        <nav className="topbar">
            <Link href="/" className="flex items-center gap-4">
                <Image src="/assets/logo.svg" alt="logo" width={28} height={28} />
                <p className="text-heading3-bold text-light-1 max-xs:hidden">SnapThreads</p>
            </Link>

            {/* Streak functionality Starts */}
            <div className="flex items-center gap-1">
                <div className="block">
                    {isUserLoggedIn ? 
                        <Streaks currentUserId={userId} />
                        :
                        <Link href="/" className="flex items-center mr-4">
                            <Image src="/assets/fire_empty.png" alt="fire" width={40} height={40} />
                        </Link>
                    }
                </div>
                {/* Streak functionality Ends */}

                {!isUserLoggedIn ?
                <a href='/sign-in' className="text-heading6-bold text-light-1 max-xs:hidden">Login / Signup</a>
                :
                <>
                    <div className="block md:hidden">
                        <SignedIn>
                            <SignOutButton>
                                <div className="flex cursor-pointer">
                                    <Image
                                        src="/assets/logout.svg"
                                        alt="logout"
                                        width={24}
                                        height={24}
                                    />
                                </div>
                            </SignOutButton>
                        </SignedIn>
                        </div>
                        <OrganizationSwitcher 
                            appearance={{
                                baseTheme: dark,
                                elements: {
                                    organizationSwitcherTrigger:
                                    "py-2 px-4"
                                }
                            }}
                        />
                    </>
                }
            </div>
        </nav>
    )
}

export default TopBar;