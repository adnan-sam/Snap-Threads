"use client"
import Image from "next/image";
import fire_img from '@/public/assets/fire_filled.gif';
import AccountProfile from "../forms/AccountProfile";
import { fetchUser,  fetchCurrentUserId } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { useState } from "react";

interface Props {
    accountId: string;
    authUserId: string;
    name1: string;
    username1: string;
    imgUrl: string;
    bio1: string;
    streaks: { current: number, max: number };
    type?: 'User' | 'Community';
}

const ProfileHeader = ({ accountId, authUserId, name1, username1, imgUrl, bio1, streaks, type}: Props) => {
    const [editable, setEditable] = useState(false);
    const [userData, setUserData] = useState({
        id: authUserId,
        objectId: authUserId,
        username: username1,
        name: name1,
        bio: bio1,
        image: imgUrl,
    });

    const handleEdit = async () => {
        const userId = await fetchCurrentUserId();
        if (!userId) return null; // to avoid typescript warnings
        // console.log("Current user -> ",userId);
    
        const userInfo = await fetchUser(userId);
        // console.log(userInfo)
    
        const userDataTemp = {
            id: userInfo.id,
            objectId: userInfo?.id,
            username: userInfo?.username,
            name: userInfo?.name,
            bio: userInfo?.bio,
            image: userInfo?.image,
        };
        setUserData(userDataTemp);
        setEditable(true);
    }

    return (
        <>
        {editable &&
            <AccountProfile
                user={userData}
                btnTitle="Save"
            />
        }
        {!editable &&
            <div className="flex w-full flex-col justify-start">
            <div className="flex item-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative h-20 w-20 object-cover">
                        <Image
                            src={imgUrl}
                            alt="Profile Image"
                            fill
                            className="rounded-full object-cover shadow-2xl"
                        />
                    </div>

                    <div className="flex-1">
                        <h2 className="text-left text-heading3-bold text-light-1">
                            {name1}
                        </h2>
                        <p className="text-base-medium text-gray-1">@{username1}</p>
                    </div>
                </div>
                </div>
                {/* TODO Community */}
                <div className="flex">
                    <p className="mt-6 max-w-lg text-base-regular text-light-2">{bio1}</p>
                    {/* Below SVG show only if user is in it's own profile */}
                    {accountId === authUserId && 
                    <svg onClick={handleEdit} className="ml-3 mt-6 w-5 h-6 text-light-3 dark:text-white cursor-pointer hover:text-light-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.75 4H19M7.75 4a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 4h2.25m13.5 6H19m-2.25 0a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 10h11.25m-4.5 6H19M7.75 16a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 16h2.25"/>
                    </svg>
                }
                </div>

                <div className="mt-6 block flex gap-6 mb-0">
                    <p className="text-base-medium text-gray-1">Current Streak: <span className="text-light-2">{streaks.current}</span></p>
                    <div className="flex gap-1">
                        <p className="text-base-medium text-gray-1">Max Streak: <span className="text-light-2">{streaks.max}</span></p>
                        {streaks.max>0 && <Image
                            src={fire_img}
                            alt="fire"
                            width={20}
                            height={20}
                        />}
                    </div>
                </div>
            
                <div className="mt-6 h-0.5 w-full bg-dark-3"></div>
            </div>
        }
        </>
    )
}

export default ProfileHeader;