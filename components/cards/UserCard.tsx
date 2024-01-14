"use client"

import Image from "next/image";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
    id: string;
    name: string;
    username: string;
    imgUrl: string;
    personType: string;
    type?: string;
}

const UserCard = ({ id, name, username, imgUrl, personType, type }: Props) => {
    const router = useRouter();

    return (
        <>
        {type !== "small" ?
        <article className={type!=="small" ? "user-card" : "user-card mt-3 cursor-pointer"}>
        <div className="user-card_avatar">
            <Image
                src={imgUrl}
                alt="logo"
                width={type !== "small" ? 48 : 38}
                height={type !== "small" ? 48 : 38}
                className="rounded-full"
            />

            <div className="flex-1 text-ellipsis">
                <p className={type !== "small" ? "text-base-semibold text-light-1" : "text-base-semibold text-light-1"}>{name}</p>
                <p className="text-small-medium text-gray-1">@{username}</p>
            </div>
        </div>

        <Button className="user-card_btn" onClick={() => router.push(`/profile/${id}`)}>
            View Profile
        </Button>
        </article> : 
        <Link href={`/profile/${id}`}>
            <article className={type!=="small" ? "user-card" : "user-card mt-3 cursor-pointer"}>
            <div className="user-card_avatar">
                <Image
                    src={imgUrl}
                    alt="logo"
                    width={type !== "small" ? 48 : 38}
                    height={type !== "small" ? 48 : 38}
                    className="rounded-full"
                />

                <div className="flex-1 text-ellipsis">
                    <p className={type !== "small" ? "text-base-semibold text-light-1" : "text-base-semibold text-light-1"}>{name}</p>
                    <p className="text-small-medium text-gray-1">@{username}</p>
                </div>
            </div>
            </article>
        </Link>
        }
        </>
  )
}

export default UserCard