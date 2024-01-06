import Image from "next/image";
import fire_img from '@/public/assets/fire_filled.gif';

interface Props {
    accountId: string;
    authUserId: string;
    name: string;
    username: string;
    imgUrl: string;
    bio: string;
    streaks: { current: number, max: number };
    type?: 'User' | 'Community';
}

const ProfileHeader = ({ accountId, authUserId, name, username, imgUrl, bio, streaks, type}: Props) => {
    return (
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
                            {name}
                        </h2>
                        <p className="text-base-medium text-gray-1">@{username}</p>
                    </div>
                </div>
                </div>
                {/* TODO Community */}
                <p className="mt-6 max-w-lg text-base-regular text-light-2">{bio}</p>

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
    )
}

export default ProfileHeader;