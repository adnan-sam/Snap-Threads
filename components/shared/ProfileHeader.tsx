"use client"
import Image from "next/image";
import fire_img from '@/public/assets/fire_filled.gif';
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchUserUpdatedDetails } from "@/lib/actions/user.actions";
import { useParams } from "next/navigation";

interface Props {
    accountId: string;
    authUserId: string;
    name1: string;
    username1: string;
    imgUrl: string;
    bio1: string;
    streaks?: { current: number, max: number };
    type?: string;
}

const ProfileHeader = ({ accountId, authUserId, name1, username1, imgUrl, bio1, streaks, type,}: Props) => {
    const [details, setDetails] = useState({
        name1: name1,
        username1: username1,
        imgUrl: imgUrl,
        bio1: bio1,
    })
    const params = useParams();

    useEffect(() => {
        if(type === "Community" || params.id !== authUserId)
            return;

        const fetchUserData = async () => {
            const data = await fetchUserUpdatedDetails(authUserId);
            setDetails({
                name1: data.name,
                username1: data.username,
                imgUrl: data.image,
                bio1: data.bio,
            })
        }
        //If the user has updated the details via edit page then we need to fetch data from database for the updated one
        fetchUserData();
    },[])

    return (
        <div className="flex w-full flex-col justify-start">
            <div className="flex item-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative h-20 w-20 object-cover">
                        <Image
                            src={details.imgUrl}
                            alt="Profile Image"
                            fill
                            className="rounded-full object-cover shadow-2xl"
                        />
                    </div>
    
                    <div className="flex-1">
                        <h2 className="text-left text-heading3-bold text-light-1">
                            {details.name1}
                        </h2>
                        <p className="text-base-medium text-gray-1">@{details.username1}</p>
                    </div>
                </div>
                {accountId === authUserId && type!=="Community" && (
                    <Link href='/profile/edit'>
                        <div className='flex cursor-pointer gap-3 h-fit rounded-lg bg-dark-3 px-4 py-2'>
                        <Image
                            src='/assets/edit.svg'
                            alt='logout'
                            width={16}
                            height={16}
                        />
    
                        <p className='text-light-2 max-sm:hidden my-auto'>Edit</p>
                        </div>
                    </Link>
                )}
            </div>
            <p className="mt-6 max-w-lg text-base-regular text-light-2">{details.bio1}</p>
            {streaks ?
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
                </div> : <></>
            }
            <div className="mt-6 h-0.5 w-full bg-dark-3"></div>
        </div>
    )
}

export default ProfileHeader;